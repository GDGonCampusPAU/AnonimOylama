package models

import "time"

// ElectionVoter struct'ı bir kullanıcının belirli bir seçimde oy kullanıp kullanmadığını tutar.
// Anonimlik kuralı gereği, kullanıcının kime oy verdiğine dair hiçbir bilgi İÇERMEZ.
type ElectionVoter struct {
	ID         string    `json:"id"`
	ElectionID string    `json:"electionId"`
	UserID     string    `json:"userId"`
	VotedAt    time.Time `json:"votedAt"`
}

// VoteRequest, oy kullanma işlemi için API'den beklenen JSON gövdesini (body) temsil eder.
type VoteRequest struct {
	CandidateID string `json:"candidateId"` // Oy verilecek adayın ID'si
}
