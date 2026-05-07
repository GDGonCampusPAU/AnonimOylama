package repository

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/models"
)

// ElectionRepository, seçim (election) ile ilgili tüm veritabanı işlemlerini kapsar.
// İş mantığı bu katmana KARIŞTIRILAMAZ; sadece CRUD işlemleri burada yapılır.
type ElectionRepository struct {
	db *sql.DB
}

func NewElectionRepository(db *sql.DB) *ElectionRepository {
	return &ElectionRepository{db: db}
}

// BeginTx, yeni bir veritabanı transaction'ı başlatır.
// Service katmanı birden fazla INSERT işlemini atomik yapmak için bunu kullanır.
func (r *ElectionRepository) BeginTx() (*sql.Tx, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("transaction başlatılamadı: %w", err)
	}
	return tx, nil
}

// CreateElection, elections tablosuna yeni bir seçim kaydı ekler.
// Bir transaction (tx) içinde çalışır; bu sayede candidates ve invitees ile atomik olur.
func (r *ElectionRepository) CreateElection(tx *sql.Tx, e *models.Election) error {
	query := `
		INSERT INTO elections (id, creator_id, title, description, invite_code, expires_at, status)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
		RETURNING id, created_at
	`
	return tx.QueryRow(query,
		e.CreatorID,
		e.Title,
		e.Description,
		e.InviteCode,
		e.ExpiresAt,
		e.Status,
	).Scan(&e.ID, &e.CreatedAt)
}

// CreateCandidates, candidates tablosuna seçime ait adayları toplu olarak ekler.
// Her aday için ayrı bir INSERT yapılır; hepsi aynı transaction içinde çalışır.
func (r *ElectionRepository) CreateCandidates(tx *sql.Tx, electionID string, names []string) error {
	query := `
		INSERT INTO candidates (id, election_id, name, vote_count)
		VALUES (gen_random_uuid(), $1, $2, 0)
	`
	for _, name := range names {
		if _, err := tx.Exec(query, electionID, name); err != nil {
			return fmt.Errorf("aday eklenirken hata ('%s'): %w", name, err)
		}
	}
	return nil
}

// CreateInvitees, election_invitees tablosuna davet edilen e-postaları toplu ekler.
// Bu kayıtlar, join endpoint'inde erişim kontrolü (whitelist) için kullanılır.
func (r *ElectionRepository) CreateInvitees(tx *sql.Tx, electionID string, emails []string) error {
	query := `
		INSERT INTO election_invitees (id, election_id, email)
		VALUES (gen_random_uuid(), $1, $2)
		ON CONFLICT (election_id, email) DO NOTHING
	`
	for _, email := range emails {
		if _, err := tx.Exec(query, electionID, email); err != nil {
			return fmt.Errorf("davetli eklenirken hata ('%s'): %w", email, err)
		}
	}
	return nil
}

// GetByInviteCode, davet kodu ile seçim kaydını getirir.
// join endpoint'inin ilk adımında çağrılır.
func (r *ElectionRepository) GetByInviteCode(inviteCode string) (*models.Election, error) {
	query := `
		SELECT id, creator_id, title, description, invite_code, created_at, expires_at, status
		FROM elections
		WHERE invite_code = $1
	`
	e := &models.Election{}
	err := r.db.QueryRow(query, inviteCode).Scan(
		&e.ID, &e.CreatorID, &e.Title, &e.Description,
		&e.InviteCode, &e.CreatedAt, &e.ExpiresAt, &e.Status,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("geçersiz davet kodu")
		}
		return nil, fmt.Errorf("seçim sorgulanırken hata: %w", err)
	}
	return e, nil
}

// GetCandidatesByElectionID, bir seçime ait tüm adayları getirir.
func (r *ElectionRepository) GetCandidatesByElectionID(electionID string) ([]models.Candidate, error) {
	query := `
		SELECT id, election_id, user_id, name, vote_count
		FROM candidates
		WHERE election_id = $1
		ORDER BY name ASC
	`
	rows, err := r.db.Query(query, electionID)
	if err != nil {
		return nil, fmt.Errorf("adaylar sorgulanırken hata: %w", err)
	}
	defer rows.Close()

	var candidates []models.Candidate
	for rows.Next() {
		var c models.Candidate
		if err := rows.Scan(&c.ID, &c.ElectionID, &c.UserID, &c.Name, &c.VoteCount); err != nil {
			return nil, fmt.Errorf("aday okunurken hata: %w", err)
		}
		candidates = append(candidates, c)
	}
	return candidates, rows.Err()
}

// IsInvited, verilen e-posta adresinin belirtilen seçime davet edilip edilmediğini kontrol eder.
// Whitelist kontrolü: false dönerse kullanıcı odaya giremez.
func (r *ElectionRepository) IsInvited(electionID, email string) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM election_invitees
			WHERE election_id = $1 AND email = $2
		)
	`
	var exists bool
	if err := r.db.QueryRow(query, electionID, email).Scan(&exists); err != nil {
		return false, fmt.Errorf("davet kontrolü yapılırken hata: %w", err)
	}
	return exists, nil
}
