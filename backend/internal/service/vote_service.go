package service

import (
	"context"
	"errors"
	"time"

	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/repository"
)

type VoteService struct {
	voteRepo     *repository.VoteRepository
	electionRepo *repository.ElectionRepository
}

func NewVoteService(voteRepo *repository.VoteRepository, electionRepo *repository.ElectionRepository) *VoteService {
	return &VoteService{
		voteRepo:     voteRepo,
		electionRepo: electionRepo,
	}
}

// CastVote, bir kullanıcının oy verme işlemini koordine eder.
// İş kurallarını (seçim durumu vb.) kontrol ettikten sonra işlemi repository'ye devreder.
func (s *VoteService) CastVote(ctx context.Context, electionID, userID, candidateID string) error {
	// 1. Seçimin var olup olmadığını kontrol et.
	election, err := s.electionRepo.GetByID(electionID)
	if err != nil {
		return err
	}

	// 2. Seçimin aktif olup olmadığını kontrol et.
	if election.Status != "Active" {
		return errors.New("bu seçim şu anda aktif değil")
	}

	// 3. Seçimin süresinin dolup dolmadığını kontrol et (eğer ExpiresAt varsa)
	if election.ExpiresAt != nil && election.ExpiresAt.Before(time.Now()) {
		return errors.New("bu seçimin süresi dolmuş")
	}

	// 4. Atomik olarak oyu kaydet (Eğer daha önce oy kullandıysa Middleware'de engellenmiş olacak,
	// ancak ekstra güvenlik için veritabanında UNIQUE veya Middleware kontrolü şarttır)
	err = s.voteRepo.RecordVote(ctx, electionID, userID, candidateID)
	if err != nil {
		return err
	}

	return nil
}
