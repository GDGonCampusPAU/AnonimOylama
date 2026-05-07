package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/middleware"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/models"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/service"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/pkg/response"
)

// ElectionHandler, seçim odaları ile ilgili HTTP handler'larını barındırır.
type ElectionHandler struct {
	electionService *service.ElectionService
}

func NewElectionHandler(es *service.ElectionService) *ElectionHandler {
	return &ElectionHandler{electionService: es}
}

// Create, POST /api/v1/elections uç noktasını karşılar.
// Yeni bir seçim odası oluşturur; davetiyeler arka planda e-posta ile gönderilir.
func (h *ElectionHandler) Create(w http.ResponseWriter, r *http.Request) {
	// Context'ten JWT Claims'ini al (AuthMiddleware tarafından enjekte edilmiştir)
	claims, ok := r.Context().Value(middleware.ClaimsKey).(*service.Claims)
	if !ok || claims == nil {
		response.Error(w, http.StatusUnauthorized, "Yetkilendirme bilgisi okunamadı")
		return
	}

	// Request body'i parse et
	var req models.CreateElectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Geçersiz istek formatı")
		return
	}
	defer r.Body.Close()

	// Service katmanını çağır (iş mantığı tamamen orada)
	result, err := h.electionService.CreateElection(claims.UserID, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	// api-specs.md: 201 Created
	response.Success(w, http.StatusCreated, result, "Oylama oluşturuldu ve davetiyeler gönderiliyor.")
}

// JoinByInviteCode, GET /api/v1/elections/join/{inviteCode} uç noktasını karşılar.
// Davet koduyla odanın bilgilerini ve aday listesini döner.
// Sadece election_invitees tablosunda kaydı bulunan kullanıcılar erişebilir.
func (h *ElectionHandler) JoinByInviteCode(w http.ResponseWriter, r *http.Request) {
	// Context'ten JWT Claims'ini al
	claims, ok := r.Context().Value(middleware.ClaimsKey).(*service.Claims)
	if !ok || claims == nil {
		response.Error(w, http.StatusUnauthorized, "Yetkilendirme bilgisi okunamadı")
		return
	}

	// Go 1.22+ net/http router'ında path parametresi bu şekilde okunur
	inviteCode := r.PathValue("inviteCode")
	if inviteCode == "" {
		response.Error(w, http.StatusBadRequest, "Davet kodu belirtilmedi")
		return
	}

	// Service çağrısı: whitelist + status + süre kontrolü orada yapılır
	result, err := h.electionService.JoinByInviteCode(inviteCode, claims.Email)
	if err != nil {
		// "geçersiz davet kodu" → 404; diğer tüm hata senaryoları → 403
		if err.Error() == "geçersiz davet kodu" {
			response.Error(w, http.StatusNotFound, err.Error())
			return
		}
		response.Error(w, http.StatusForbidden, err.Error())
		return
	}

	response.Success(w, http.StatusOK, result, "Oda bilgileri getirildi")
}
