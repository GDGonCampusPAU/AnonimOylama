package middleware

import (
	"net/http"

	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/repository"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/service"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/pkg/response"
)

// VoteCheck, kullanıcının belirli bir seçimde daha önce oy kullanıp kullanmadığını kontrol eder.
// Mükerrer oylamayı engellemek için HTTP handler'dan önce çalışır.
// URL path'inde electionId parametresinin (PathValue) kullanılmasını bekler.
func VoteCheck(voteRepo *repository.VoteRepository) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			// Context'ten (Auth middleware'in eklediği) kullanıcı bilgilerini al
			claims, ok := r.Context().Value(ClaimsKey).(*service.Claims)
			if !ok || claims == nil {
				response.Error(w, http.StatusUnauthorized, "Kullanıcı kimliği doğrulanamadı")
				return
			}

			// URL parametrelerinden electionId'yi al (Go 1.22+ mux path value özelliği)
			electionID := r.PathValue("electionId")
			if electionID == "" {
				response.Error(w, http.StatusBadRequest, "Seçim ID (electionId) eksik")
				return
			}

			// Veritabanından kullanıcının bu seçimde oy kullanıp kullanmadığını sorgula
			hasVoted, err := voteRepo.HasUserVoted(r.Context(), electionID, claims.UserID)
			if err != nil {
				response.Error(w, http.StatusInternalServerError, "Oylama durumu kontrol edilemedi")
				return
			}

			if hasVoted {
				response.Error(w, http.StatusForbidden, "Bu seçimde zaten oy kullandınız")
				return
			}

			// Kontrol başarılı, asıl handler'a geçiş yap
			next.ServeHTTP(w, r)
		}
	}
}
