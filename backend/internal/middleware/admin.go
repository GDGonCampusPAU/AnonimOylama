package middleware

import (
	"net/http"
	"strings"

	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/service"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/pkg/response"
)

// AdminOnly, JWT Claims içinde "admin" rolü olup olmadığını kontrol eden middleware'dir.
// Auth middleware'inden SONRA zincire eklenmeli; Claims context'te mevcut olmalıdır.
// Kullanım: middleware.Auth(authService)(middleware.AdminOnly(handler))
func AdminOnly(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims, ok := r.Context().Value(ClaimsKey).(*service.Claims)
		if !ok || claims == nil {
			response.Error(w, http.StatusUnauthorized, "Yetkilendirme bilgisi okunamadı")
			return
		}

		for _, role := range claims.Roles {
			if strings.EqualFold(role, "admin") {
				next.ServeHTTP(w, r)
				return
			}
		}

		response.Error(w, http.StatusForbidden, "Bu işlem için yönetici yetkisi gereklidir")
	}
}
