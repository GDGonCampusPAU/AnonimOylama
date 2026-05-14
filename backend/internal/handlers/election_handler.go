package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

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
// @Summary Yeni Oylama Oluştur
// @Description Yeni bir seçim odası oluşturur ve davetiyeleri arka planda e-posta ile gönderir.
// @Tags Elections
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.CreateElectionRequest true "Seçim Bilgileri"
// @Success 201 {object} response.APIResponse{data=models.CreateElectionResponse} "Oylama oluşturuldu"
// @Failure 400 {object} response.APIResponse "Geçersiz istek formatı"
// @Failure 401 {object} response.APIResponse "Yetkisiz"
// @Router /api/v1/elections [post]
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
// @Summary Odaya Katıl
// @Description Davet koduyla odanın bilgilerini ve aday listesini döner. Sadece davetliler (whitelist) katılabilir.
// @Tags Elections
// @Produce json
// @Security BearerAuth
// @Param inviteCode path string true "Davet Kodu"
// @Success 200 {object} response.APIResponse{data=models.JoinElectionResponse} "Oda bilgileri getirildi"
// @Failure 400 {object} response.APIResponse "Eksik parametre"
// @Failure 401 {object} response.APIResponse "Yetkisiz"
// @Failure 403 {object} response.APIResponse "Erişim reddedildi"
// @Failure 404 {object} response.APIResponse "Seçim bulunamadı"
// @Router /api/v1/elections/join/{inviteCode} [get]
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

// GetResults, GET /api/v1/elections/results/{electionId} uç noktasını karşılar.
// @Summary Sonuçları Getir
// @Description Tamamlanmış (status: Completed) bir seçimin sonuçlarını döner.
// @Tags Elections
// @Produce json
// @Security BearerAuth
// @Param electionId path string true "Seçim ID"
// @Success 200 {object} response.APIResponse{data=models.ElectionResultData} "Sonuçlar listelendi"
// @Failure 400 {object} response.APIResponse "Eksik parametre"
// @Failure 401 {object} response.APIResponse "Yetkisiz"
// @Failure 403 {object} response.APIResponse "Oylama devam ediyor"
// @Failure 404 {object} response.APIResponse "Seçim bulunamadı"
// @Router /api/v1/elections/results/{electionId} [get]
func (h *ElectionHandler) GetResults(w http.ResponseWriter, r *http.Request) {
	// Path parametresini al
	electionID := r.PathValue("electionId")
	if electionID == "" {
		response.Error(w, http.StatusBadRequest, "Seçim ID belirtilmedi")
		return
	}

	// Service çağrısı: Seçim sonuçlarını getir
	result, err := h.electionService.GetElectionResults(r.Context(), electionID)
	if err != nil {
		if err.Error() == "seçim bulunamadı" {
			response.Error(w, http.StatusNotFound, err.Error())
			return
		}
		if err.Error() == "oylama henüz devam ediyor, sonuçlar gizli" {
			response.Error(w, http.StatusForbidden, err.Error())
			return
		}
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Başarılıysa standart response ile dön
	response.Success(w, http.StatusOK, result, "Sonuçlar listelendi")
}

// Complete, PUT /api/v1/elections/{electionId}/complete uç noktasını karşılar.
// @Summary Seçimi Sonlandır
// @Description Odayı kuran kişi (creator) tarafından seçimi manuel olarak bitirir. Bu sayede sonuçlar görüntülenebilir hale gelir.
// @Tags Elections
// @Produce json
// @Security BearerAuth
// @Param electionId path string true "Seçim ID"
// @Success 200 {object} response.APIResponse "Seçim sonlandırıldı"
// @Failure 400 {object} response.APIResponse "Eksik parametre"
// @Failure 401 {object} response.APIResponse "Yetkisiz"
// @Failure 403 {object} response.APIResponse "Yetki yok"
// @Failure 404 {object} response.APIResponse "Seçim bulunamadı"
// @Router /api/v1/elections/{electionId}/complete [put]
func (h *ElectionHandler) Complete(w http.ResponseWriter, r *http.Request) {
	electionID := r.PathValue("electionId")
	if electionID == "" {
		response.Error(w, http.StatusBadRequest, "Seçim ID belirtilmedi")
		return
	}

	claims, ok := r.Context().Value(middleware.ClaimsKey).(*service.Claims)
	if !ok || claims == nil {
		response.Error(w, http.StatusUnauthorized, "Yetkilendirme bilgisi okunamadı")
		return
	}

	err := h.electionService.CompleteElection(r.Context(), electionID, claims.UserID)
	if err != nil {
		if err.Error() == "bu seçimi sonlandırma yetkiniz yok" {
			response.Error(w, http.StatusForbidden, err.Error())
			return
		}
		if err.Error() == "seçim bulunamadı" {
			response.Error(w, http.StatusNotFound, err.Error())
			return
		}
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(w, http.StatusOK, nil, "Seçim başarıyla sonlandırıldı. Artık sonuçlar görüntülenebilir.")
}

// GetMyElections godoc
// @Summary Oluşturduğum seçimleri listeler
// @Description Giriş yapan kullanıcının oluşturduğu seçimleri sayfalı listeler.
// @Tags Elections
// @Security BearerAuth
// @Produce json
// @Param page query int false "Sayfa" default(1)
// @Param limit query int false "Limit" default(10)
// @Param status query string false "Durum filtresi: Active veya Completed"
// @Success 200 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Router /api/v1/elections/my [get]
func (h *ElectionHandler) GetMyElections(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.ClaimsKey).(*service.Claims)
	if !ok || claims == nil {
		response.Error(w, http.StatusUnauthorized, "Yetkilendirme bilgisi okunamadı")
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	status := r.URL.Query().Get("status")

	result, err := h.electionService.GetMyElections(claims.UserID, status, page, limit)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, http.StatusOK, result, "Seçimleriniz listelendi")
}

// GetInvitedElections godoc
// @Summary Davet edildiğim seçimleri listeler
// @Description Giriş yapan kullanıcının e-posta adresiyle davet edildiği seçimleri sayfalı listeler.
// @Tags Elections
// @Security BearerAuth
// @Produce json
// @Param page query int false "Sayfa" default(1)
// @Param limit query int false "Limit" default(10)
// @Param status query string false "Durum filtresi: Active veya Completed"
// @Success 200 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Router /api/v1/elections/invited [get]
func (h *ElectionHandler) GetInvitedElections(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.ClaimsKey).(*service.Claims)
	if !ok || claims == nil {
		response.Error(w, http.StatusUnauthorized, "Yetkilendirme bilgisi okunamadı")
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	status := r.URL.Query().Get("status")

	result, err := h.electionService.GetInvitedElections(claims.Email, status, page, limit)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, http.StatusOK, result, "Davet edildiğiniz seçimler listelendi")
}

// Reinvite godoc
// @Summary Davetiyeleri yeniden gönderir
// @Description Seçimin tüm davetlilerine e-postayı yeniden gönderir. Sadece seçimi oluşturan kullanıcı çalıştırabilir.
// @Tags Elections
// @Security BearerAuth
// @Produce json
// @Param electionId path string true "Seçim ID"
// @Success 200 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 403 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Router /api/v1/elections/{electionId}/reinvite [post]
func (h *ElectionHandler) Reinvite(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.ClaimsKey).(*service.Claims)
	if !ok || claims == nil {
		response.Error(w, http.StatusUnauthorized, "Yetkilendirme bilgisi okunamadı")
		return
	}

	electionID := r.PathValue("electionId")
	if electionID == "" {
		response.Error(w, http.StatusBadRequest, "Seçim ID'si belirtilmedi")
		return
	}

	if err := h.electionService.Reinvite(electionID, claims.UserID); err != nil {
		if err.Error() == "seçim bulunamadı" {
			response.Error(w, http.StatusNotFound, err.Error())
			return
		}
		response.Error(w, http.StatusForbidden, err.Error())
		return
	}

	response.Success(w, http.StatusOK, nil, "Davetiyeler yeniden gönderiliyor")
}

