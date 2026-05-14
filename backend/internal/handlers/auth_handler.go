package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/service"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/pkg/response"
)

// AuthHandler, kimlik doğrulama HTTP handler'larını barındırır.
type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Login: POST /api/v1/auth/login
// @Summary Kullanıcı Girişi
// @Description Email ve şifre ile sisteme giriş yapıp JWT token alır.
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body loginRequest true "Giriş Bilgileri"
// @Success 200 {object} response.APIResponse "Giriş başarılı"
// @Failure 400 {object} response.APIResponse "Geçersiz istek"
// @Failure 401 {object} response.APIResponse "Hatalı şifre veya e-posta"
// @Failure 403 {object} response.APIResponse "Hesap onaylanmamış"
// @Router /api/v1/auth/login [post]
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Geçersiz istek formatı")
		return
	}
	defer r.Body.Close()

	if req.Email == "" || req.Password == "" {
		response.Error(w, http.StatusBadRequest, "E-posta ve şifre zorunludur")
		return
	}

	result, err := h.authService.Login(req.Email, req.Password)
	if err != nil {
		if err.Error() == "hesabınız henüz admin tarafından onaylanmamış" {
			response.Error(w, http.StatusForbidden, err.Error())
			return
		}
		response.Error(w, http.StatusUnauthorized, err.Error())
		return
	}

	response.Success(w, http.StatusOK, map[string]interface{}{
		"token": result.Token,
		"user": map[string]string{
			"id":      result.User.ID,
			"name":    result.User.Name,
			"surname": result.User.Surname,
		},
	}, "Giriş başarılı")
}
