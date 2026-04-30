// Package main, uygulamanın giriş noktasıdır.
// SADECE bağımlılık bağlama ve sunucu başlatmadan sorumludur.
package main

import (
	"log"
	"net/http"

	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/config"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/handlers"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/middleware"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/repository"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/service"
)

func main() {
	cfg := config.Load()

	db, err := config.Connect(cfg)
	if err != nil {
		log.Fatalf("❌ Veritabanı bağlantısı kurulamadı: %v", err)
	}
	defer db.Close()

	// Dependency Injection: *sql.DB → Repository → Service → Handler
	userRepo := repository.NewUserRepository(db)
	authService := service.NewAuthService(userRepo, cfg.JWTSecret)
	authHandler := handlers.NewAuthHandler(authService)

	mux := http.NewServeMux()

	// Public endpoints
	mux.HandleFunc("GET /health", handlers.HealthCheck(db))
	mux.HandleFunc("POST /api/v1/auth/login", authHandler.Login)

	// Protected endpoint örneği (Phase 3'te kullanılacak):
	// mux.HandleFunc("GET /api/v1/elections", middleware.Auth(authService)(electionHandler.List))
	_ = middleware.Auth

	log.Printf("🚀 Anonim Oylama API sunucusu %s portunda başlatılıyor...", cfg.ServerPort)
	if err := http.ListenAndServe(":"+cfg.ServerPort, mux); err != nil {
		log.Fatalf("❌ Sunucu başlatılamadı: %v", err)
	}
}
