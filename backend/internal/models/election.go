package models

import "time"

// Election, `elections` tablosunun Go struct karşılığıdır.
type Election struct {
	ID          string     `json:"id"`
	CreatorID   string     `json:"creatorId"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	InviteCode  string     `json:"inviteCode"`
	CreatedAt   time.Time  `json:"createdAt"`
	ExpiresAt   *time.Time `json:"expiresAt"` // Nullable: otomatik kapanma süresi yoksa null
	Status      string     `json:"status"`    // Draft | Active | Completed
}

// Candidate, `candidates` tablosunun Go struct karşılığıdır.
type Candidate struct {
	ID         string  `json:"id"`
	ElectionID string  `json:"electionId"`
	UserID     *string `json:"userId,omitempty"` // Nullable: sisteme kayıtlı değilse null
	Name       string  `json:"name"`
	VoteCount  int     `json:"voteCount"`
}

// ElectionInvitee, `election_invitees` tablosunun Go struct karşılığıdır.
// Hangi e-postaların hangi seçime davet edildiğini (whitelist) tutar.
type ElectionInvitee struct {
	ID         string    `json:"id"`
	ElectionID string    `json:"electionId"`
	Email      string    `json:"email"`
	InvitedAt  time.Time `json:"invitedAt"`
}

// ─────────────────────────────────────────────────────────────────────────────
// Request / Response DTO'ları
// ─────────────────────────────────────────────────────────────────────────────

// CreateElectionRequest, POST /api/v1/elections isteğinin JSON gövdesidir.
// api-specs.md dokümanındaki request formatına birebir uyar.
type CreateElectionRequest struct {
	Title         string   `json:"title"`
	Description   string   `json:"description"`
	ExpiresAt     string   `json:"expiresAt"`     // RFC3339 formatında zaman damgası
	Candidates    []string `json:"candidates"`    // Aday isimleri listesi
	InvitedEmails []string `json:"invitedEmails"` // Odaya davet edilecek e-posta adresleri (whitelist)
}

// CreateElectionResponse, başarılı seçim oluşturma yanıtının data alanıdır.
type CreateElectionResponse struct {
	ElectionID string `json:"electionId"`
	InviteCode string `json:"inviteCode"`
}

// ElectionInfo, join yanıtında seçim bilgisini taşır.
// VoteCount ve diğer hassas alanlar kasıtlı olarak ÇIKARILMIŞTIR.
type ElectionInfo struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
}

// CandidateInfo, join yanıtında aday bilgisini taşır.
// VoteCount kasıtlı olarak ÇIKARILMIŞTIR (anonimlik prensibi gereği).
type CandidateInfo struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// JoinElectionResponse, GET /api/v1/elections/join/{inviteCode} yanıtının data alanıdır.
type JoinElectionResponse struct {
	Election   ElectionInfo    `json:"election"`
	Candidates []CandidateInfo `json:"candidates"`
}

// ElectionListItem, seçim listelerinde her bir seçimi özetler.
type ElectionListItem struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Status      string     `json:"status"`
	InviteCode  string     `json:"inviteCode"`
	CreatedAt   time.Time  `json:"createdAt"`
	ExpiresAt   *time.Time `json:"expiresAt"`
}

// PaginatedElections, seçim listesi yanıtında sayfalama bilgisini taşır.
type PaginatedElections struct {
	Elections  []ElectionListItem `json:"elections"`
	Total      int                `json:"total"`
	Page       int                `json:"page"`
	Limit      int                `json:"limit"`
	TotalPages int                `json:"totalPages"`
}

// CandidateResult, GET /api/v1/elections/{electionId}/results yanıtında adayların oy sayılarını tutar.
type CandidateResult struct {
	CandidateID string `json:"candidateId"`
	Name        string `json:"name"`
	VoteCount   int    `json:"voteCount"`
}

// ElectionResultData, GET /api/v1/elections/{electionId}/results endpoint'inin data modelidir.
type ElectionResultData struct {
	TotalParticipants int               `json:"totalParticipants"`
	Results           []CandidateResult `json:"results"`
}
