// Package middleware, HTTP ara katman fonksiyonlarını barındırır.
package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/service"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/pkg/response"
)

type contextKey string

// ClaimsKey, JWT Claims'inin context'e ekleneceği anahtar.
const ClaimsKey contextKey = "claims"

// Auth, JWT token doğrulama middleware'idir.
// Kullanım: mux.HandleFunc("GET /path", middleware.Auth(authService)(handler))
func Auth(authService *service.AuthService) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				response.Error(w, http.StatusUnauthorized, "Yetkilendirme başlığı eksik")
				return
			}
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
				response.Error(w, http.StatusUnauthorized, "Geçersiz format. Beklenen: Bearer <token>")
				return
			}
			claims, err := authService.ValidateToken(parts[1])
			if err != nil {
				response.Error(w, http.StatusUnauthorized, "Geçersiz veya süresi dolmuş token")
				return
			}
			ctx := context.WithValue(r.Context(), ClaimsKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		}
	}
}
