package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/middleware"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/models"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/service"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/pkg/response"
)

// VoteHandler, oylama işlemlerini karşılayan HTTP controller'dır.
type VoteHandler struct {
	voteService *service.VoteService
}

func NewVoteHandler(vs *service.VoteService) *VoteHandler {
	return &VoteHandler{voteService: vs}
}

// CastVote, /api/v1/elections/{electionId}/vote endpoint'ini işler.
// @Summary Oy Kullan
// @Description Kullanıcının anonim olarak oy kullanmasını sağlar. Kullanıcının kime oy verdiği ASLA kaydedilmez.
// @Tags Voting
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param electionId path string true "Seçim ID"
// @Param request body models.VoteRequest true "Aday ID"
// @Success 200 {object} response.APIResponse "Oy kaydedildi"
// @Failure 400 {object} response.APIResponse "Geçersiz istek"
// @Failure 401 {object} response.APIResponse "Yetkisiz"
// @Failure 403 {object} response.APIResponse "Zaten oy kullanıldı"
// @Router /api/v1/elections/{electionId}/vote [post]
func (h *VoteHandler) CastVote(w http.ResponseWriter, r *http.Request) {
	electionID := r.PathValue("electionId")
	if electionID == "" {
		response.Error(w, http.StatusBadRequest, "Seçim ID (electionId) parametresi eksik")
		return
	}

	// Context'ten kullanıcı kimliğini al
	claims, ok := r.Context().Value(middleware.ClaimsKey).(*service.Claims)
	if !ok || claims == nil {
		response.Error(w, http.StatusUnauthorized, "Kullanıcı yetkisi doğrulanamadı")
		return
	}

	// İsteğin body kısmını (VoteRequest) parse et
	var req models.VoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Geçersiz JSON formatı")
		return
	}

	if req.CandidateID == "" {
		response.Error(w, http.StatusBadRequest, "candidateId alanı zorunludur")
		return
	}

	// Servis katmanına (iş mantığına) devret
	err := h.voteService.CastVote(r.Context(), electionID, claims.UserID, req.CandidateID)
	if err != nil {
		// Hata mesajını doğrudan dönüyoruz (özel hatalara göre statü kodu ayrıştırılabilir, şimdilik 400 Bad Request)
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	// Anonimlik kurallarına uygun standart başarılı JSON dön
	response.Success(w, http.StatusOK, nil, "Oyunuz başarıyla kaydedildi")
}
