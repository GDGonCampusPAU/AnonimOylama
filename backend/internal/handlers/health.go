// Package handlers, HTTP API uç noktalarını (controller) barındırır.
// Her handler, gelen HTTP isteğini işler, gerekli servisi çağırır
// ve api-specs.md formatında JSON yanıt döner.
package handlers

import (
	"database/sql"
	"net/http"

	"github.com/GDGonCampusPAU/AnonimOylama/backend/pkg/response"
)

// HealthCheck, sunucunun ve veritabanı bağlantısının sağlığını kontrol eden
// HTTP handler fonksiyonudur.
//
// Route: GET /health
//
// Bu handler, "Closure" (kapatma) deseni kullanır:
// Dışarıdan *sql.DB alır ve içeride kullanan bir http.HandlerFunc döner.
// Bu sayede handler, veritabanı bağımlılığını main.go'dan alır
// ama kendi içinde bağımsız çalışır.
func HealthCheck(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Veritabanı bağlantısını kontrol et
		dbStatus := "connected"
		if err := db.Ping(); err != nil {
			dbStatus = "disconnected"
			// Veritabanı bağlantısı yoksa bile sunucu yanıt dönebilir
			// Bu durumda partial healthy sayılır
			response.Success(w, http.StatusOK, map[string]string{
				"status":   "degraded",
				"database": dbStatus,
			}, "Sunucu çalışıyor ancak veritabanı bağlantısı kesilmiş")
			return
		}

		// Her şey yolunda
		response.Success(w, http.StatusOK, map[string]string{
			"status":   "healthy",
			"database": dbStatus,
		}, "Sistem sağlıklı çalışıyor")
	}
}
