package service

import (
	"crypto/rand"
	"fmt"
	"strings"
	"time"

	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/mailer"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/models"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/repository"
	"github.com/lib/pq"
)

// ElectionService, seçim odaları ile ilgili tüm iş mantığını kapsar.
type ElectionService struct {
	repo   *repository.ElectionRepository
	mailer *mailer.Mailer
}

func NewElectionService(repo *repository.ElectionRepository, m *mailer.Mailer) *ElectionService {
	return &ElectionService{repo: repo, mailer: m}
}

// generateInviteCode, kriptografik olarak güvenli 8 karakterlik benzersiz bir davet kodu üretir.
// Format: "XXXX-XXXX" (büyük harf ve rakamlardan oluşur).
// Karakter setinden 'I', 'O', '0', '1' çıkarılmıştır; bunlar görsel olarak karıştırılabilir.
// Efektif karakter seti: 32 karakter → 32^8 ≈ 1 trilyon kombinasyon.
func generateInviteCode() (string, error) {
	// Görsel karışıklığa neden olan karakterler (I/1, O/0) çıkarıldı
	const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	const codeLen = 8

	// crypto/rand ile kriptografik güvenli rastgele baytlar üret
	// math/rand kullanmak güvenlik açığına yol açar; daima crypto/rand tercih edilmeli.
	buf := make([]byte, codeLen)
	if _, err := rand.Read(buf); err != nil {
		return "", fmt.Errorf("güvenli rastgele sayı üretilemedi: %w", err)
	}

	// Her baytı charset uzunluğuna (32) modulo alarak karakter dizinine dönüştür
	code := make([]byte, codeLen)
	for i, b := range buf {
		code[i] = charset[int(b)%len(charset)]
	}

	// "XXXX-XXXX" formatında birleştir
	return string(code[:4]) + "-" + string(code[4:]), nil
}

// CreateElection, yeni bir seçim odası oluşturur.
// Akış: validasyon → inviteCode üret → tek transaction'da DB kayıtları → goroutine ile e-posta
func (s *ElectionService) CreateElection(creatorID string, req models.CreateElectionRequest) (*models.CreateElectionResponse, error) {
	// 1. Giriş doğrulaması
	if strings.TrimSpace(req.Title) == "" {
		return nil, fmt.Errorf("başlık boş olamaz")
	}
	if len(req.Candidates) == 0 {
		return nil, fmt.Errorf("en az bir aday girilmelidir")
	}
	if len(req.InvitedEmails) == 0 {
		return nil, fmt.Errorf("en az bir davetli e-posta girilmelidir")
	}

	// 2. expiresAt string → *time.Time parse (RFC3339 formatı beklenir)
	var expiresAt *time.Time
	if strings.TrimSpace(req.ExpiresAt) != "" {
		t, err := time.Parse(time.RFC3339, req.ExpiresAt)
		if err != nil {
			return nil, fmt.Errorf("geçersiz tarih formatı; RFC3339 bekleniyor (Örn: 2026-05-10T15:00:00Z)")
		}
		expiresAt = &t
	}

	// 3. inviteCode üret ve DB'ye kaydet; UNIQUE çakışması durumunda tekrar dene (maks 5)
	// Postgres UNIQUE constraint ihlali hata kodu: "23505"
	const maxCodeAttempts = 5
	var electionID string

	// 4. Transaction başlat: election + candidates + invitees tek atomik işlemde kaydedilir
	tx, err := s.repo.BeginTx()
	if err != nil {
		return nil, err
	}
	// defer ile: herhangi bir hata olursa transaction otomatik geri alınır
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	var inviteCode string
	for attempt := 1; attempt <= maxCodeAttempts; attempt++ {
		inviteCode, err = generateInviteCode()
		if err != nil {
			return nil, fmt.Errorf("davet kodu üretilemedi: %w", err)
		}

		election := &models.Election{
			CreatorID:   creatorID,
			Title:       req.Title,
			Description: req.Description,
			InviteCode:  inviteCode,
			ExpiresAt:   expiresAt,
			Status:      "Active",
		}

		if err = s.repo.CreateElection(tx, election); err != nil {
			// Postgres UNIQUE constraint ihlali: pq hata kodu "23505"
			// Bu durumda yeni bir kod üret ve tekrar dene
			if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
				if attempt < maxCodeAttempts {
					continue // Yeni kod ile tekrar dene
				}
				return nil, fmt.Errorf("benzersiz davet kodu üretilemedi, lütfen tekrar deneyin")
			}
			return nil, fmt.Errorf("seçim oluşturulamadı: %w", err)
		}

		electionID = election.ID
		break // Başarılı; döngüden çık
	}

	// 5. Adayları toplu ekle
	if err = s.repo.CreateCandidates(tx, electionID, req.Candidates); err != nil {
		return nil, fmt.Errorf("adaylar kaydedilemedi: %w", err)
	}

	// 6. Davetli e-posta listesini (whitelist) toplu ekle
	if err = s.repo.CreateInvitees(tx, electionID, req.InvitedEmails); err != nil {
		return nil, fmt.Errorf("davetliler kaydedilemedi: %w", err)
	}

	// 7. Transaction commit
	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("transaction commit edilemedi: %w", err)
	}

	// 8. E-postaları arka planda gönder (Goroutine).
	// Commit'ten SONRA çağrılır; böylece DB kayıtları kesinleşmiş olur.
	// Bu çağrı ana akışı bloklamaz; kullanıcıya 201 hemen döner.
	s.mailer.SendBulkInvitations(req.InvitedEmails, req.Title, inviteCode, req.Description)

	return &models.CreateElectionResponse{
		ElectionID: electionID,
		InviteCode: inviteCode,
	}, nil
}

// JoinByInviteCode, davet koduyla odaya katılım işlemini gerçekleştirir.
// Akış: kod kontrolü → status/süre doğrulama → whitelist kontrolü → aday listesi
func (s *ElectionService) JoinByInviteCode(inviteCode, userEmail string) (*models.JoinElectionResponse, error) {
	// 1. Davet koduyla seçimi getir
	election, err := s.repo.GetByInviteCode(inviteCode)
	if err != nil {
		return nil, fmt.Errorf("geçersiz davet kodu")
	}

	// 2. Seçimin durumu (status) kontrolü
	if election.Status != "Active" {
		return nil, fmt.Errorf("bu oylama artık aktif değil")
	}

	// 3. Süre (expiresAt) kontrolü: seçim süresi dolmuşsa erişim engellenir
	if election.ExpiresAt != nil && time.Now().After(*election.ExpiresAt) {
		return nil, fmt.Errorf("bu oylamanın süresi dolmuştur")
	}

	// 4. Whitelist kontrolü: kullanıcının e-postası election_invitees tablosunda olmalı
	invited, err := s.repo.IsInvited(election.ID, userEmail)
	if err != nil {
		return nil, fmt.Errorf("erişim kontrolü yapılırken hata oluştu")
	}
	if !invited {
		return nil, fmt.Errorf("bu odaya davet edilmediniz")
	}

	// 5. Adayları getir
	candidates, err := s.repo.GetCandidatesByElectionID(election.ID)
	if err != nil {
		return nil, fmt.Errorf("adaylar getirilirken hata oluştu")
	}

	// 6. Response DTO'ya dönüştür.
	// CandidateInfo'da voteCount BULUNMUYOR (anonimlik prensibi gereği).
	candidateInfos := make([]models.CandidateInfo, len(candidates))
	for i, c := range candidates {
		candidateInfos[i] = models.CandidateInfo{
			ID:   c.ID,
			Name: c.Name,
		}
	}

	return &models.JoinElectionResponse{
		Election: models.ElectionInfo{
			ID:          election.ID,
			Title:       election.Title,
			Description: election.Description,
			Status:      election.Status,
		},
		Candidates: candidateInfos,
	}, nil
}
