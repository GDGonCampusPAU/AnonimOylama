package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/models"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/service"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/pkg/response"
)

// AdminHandler, yönetici işlemlerine ait HTTP handler'larını barındırır.
type AdminHandler struct {
	adminService *service.AdminService
}

func NewAdminHandler(as *service.AdminService) *AdminHandler {
	return &AdminHandler{adminService: as}
}

// CreateUser godoc
// @Summary Admin kullanıcı oluşturur
// @Description Admin yeni kullanıcı oluşturur ve rol atar. Kullanıcı otomatik onaylıdır.
// @Tags Admin
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body models.CreateUserRequest true "Kullanıcı oluşturma isteği"
// @Success 201 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 403 {object} response.APIResponse
// @Router /api/v1/admin/users [post]
func (h *AdminHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req models.CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Geçersiz istek formatı")
		return
	}
	defer r.Body.Close()

	userID, err := h.adminService.CreateUser(req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(w, http.StatusCreated, map[string]string{"userId": userID}, "Kullanıcı oluşturuldu")
}

// ListUsers godoc
// @Summary Kullanıcıları listeler
// @Description Admin kullanıcıları sayfalı olarak listeler. pending=true ile sadece onay bekleyenler döner.
// @Tags Admin
// @Security BearerAuth
// @Produce json
// @Param page query int false "Sayfa" default(1)
// @Param limit query int false "Limit" default(10)
// @Param pending query bool false "Sadece onay bekleyenler"
// @Success 200 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 403 {object} response.APIResponse
// @Router /api/v1/admin/users [get]
func (h *AdminHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	onlyPending := r.URL.Query().Get("pending") == "true"

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	result, err := h.adminService.ListUsers(page, limit, onlyPending)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, http.StatusOK, result, "Kullanıcılar listelendi")
}

// ApproveUser godoc
// @Summary Kullanıcı onaylar
// @Description Admin bir kullanıcının isApproved alanını true yapar.
// @Tags Admin
// @Security BearerAuth
// @Produce json
// @Param userId path string true "Kullanıcı ID"
// @Success 200 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 403 {object} response.APIResponse
// @Router /api/v1/admin/users/{userId}/approve [patch]
func (h *AdminHandler) ApproveUser(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("userId")
	if userID == "" {
		response.Error(w, http.StatusBadRequest, "Kullanıcı ID'si belirtilmedi")
		return
	}

	if err := h.adminService.ApproveUser(userID); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(w, http.StatusOK, nil, "Kullanıcı onaylandı")
}

// GetStats godoc
// @Summary Admin istatistiklerini getirir
// @Description Toplam kullanıcı, bekleyen kullanıcı, seçim ve oy istatistiklerini döner.
// @Tags Admin
// @Security BearerAuth
// @Produce json
// @Success 200 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 403 {object} response.APIResponse
// @Router /api/v1/admin/stats [get]
func (h *AdminHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.adminService.GetStats()
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, http.StatusOK, stats, "İstatistikler getirildi")
}
