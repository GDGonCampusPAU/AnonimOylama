// Package main, uygulamanın giriş noktasıdır.
// SADECE bağımlılık bağlama ve sunucu başlatmadan sorumludur.
package main

import (
	"log"
	"net/http"

	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/config"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/handlers"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/mailer"
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

	// Phase 3: Election DI zinciri
	electionRepo := repository.NewElectionRepository(db)
	mailClient := mailer.New(cfg)
	electionService := service.NewElectionService(electionRepo, mailClient)
	electionHandler := handlers.NewElectionHandler(electionService)

	mux := http.NewServeMux()

	// Public endpoints
	mux.HandleFunc("GET /health", handlers.HealthCheck(db))
	mux.HandleFunc("POST /api/v1/auth/login", authHandler.Login)

	// Phase 3: Protected endpoints (Auth middleware arkasında)
	mux.HandleFunc("POST /api/v1/elections",
		middleware.Auth(authService)(electionHandler.Create))
	mux.HandleFunc("GET /api/v1/elections/join/{inviteCode}",
		middleware.Auth(authService)(electionHandler.JoinByInviteCode))

	log.Printf("🚀 Anonim Oylama API sunucusu %s portunda başlatılıyor...", cfg.ServerPort)
	if err := http.ListenAndServe(":"+cfg.ServerPort, mux); err != nil {
		log.Fatalf("❌ Sunucu başlatılamadı: %v", err)
	}
}
