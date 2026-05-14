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

	_ "github.com/GDGonCampusPAU/AnonimOylama/backend/docs" // swagger docs
	httpSwagger "github.com/swaggo/http-swagger"
)

// @title Anonim Oylama API
// @version 1.0
// @description Kapalı uçlu ve tam anonim oylama sistemi backend'i.
// @termsOfService http://swagger.io/terms/

// @contact.name API Destek
// @contact.email iletisim@example.com

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8081
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
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

	// Admin DI zinciri
	adminService := service.NewAdminService(userRepo)
	adminHandler := handlers.NewAdminHandler(adminService)

	// Phase 3 & 4: Repositories
	electionRepo := repository.NewElectionRepository(db)
	voteRepo := repository.NewVoteRepository(db)

	mailClient := mailer.New(cfg)

	// Services
	electionService := service.NewElectionService(electionRepo, voteRepo, mailClient)
	voteService := service.NewVoteService(voteRepo, electionRepo)

	// Handlers
	electionHandler := handlers.NewElectionHandler(electionService)
	voteHandler := handlers.NewVoteHandler(voteService)

	mux := http.NewServeMux()

	// Swagger
	mux.HandleFunc("GET /swagger/", httpSwagger.WrapHandler)

	// Public endpoints
	mux.HandleFunc("GET /health", handlers.HealthCheck(db))
	mux.HandleFunc("POST /api/v1/auth/login", authHandler.Login)

	// Phase 3: Protected endpoints (Auth middleware arkasında)
	mux.HandleFunc("POST /api/v1/elections",
		middleware.Auth(authService)(electionHandler.Create))
	mux.HandleFunc("GET /api/v1/elections/join/{inviteCode}",
		middleware.Auth(authService)(electionHandler.JoinByInviteCode))

	// Phase 5: Seçimi sonlandırma (Complete)
	mux.HandleFunc("PUT /api/v1/elections/{electionId}/complete",
		middleware.Auth(authService)(electionHandler.Complete))

	// Phase 4: Protected oylama endpoint'i (Auth + VoteCheck middleware)
	mux.HandleFunc("POST /api/v1/elections/{electionId}/vote",
		middleware.Auth(authService)(
			middleware.VoteCheck(voteRepo)(voteHandler.CastVote),
		),
	)

	// Phase 5: Sonuçlar endpoint'i (Auth middleware arkasında)
	mux.HandleFunc("GET /api/v1/elections/results/{electionId}",
		middleware.Auth(authService)(electionHandler.GetResults))

	// Seçim listeleme endpoint'leri
	mux.HandleFunc("GET /api/v1/elections/my",
		middleware.Auth(authService)(electionHandler.GetMyElections))
	mux.HandleFunc("GET /api/v1/elections/invited",
		middleware.Auth(authService)(electionHandler.GetInvitedElections))

	// Reinvite endpoint'i
	mux.HandleFunc("POST /api/v1/elections/{electionId}/reinvite",
		middleware.Auth(authService)(electionHandler.Reinvite))

	// Admin endpoint'leri (Auth + AdminOnly middleware zinciri)
	mux.HandleFunc("POST /api/v1/admin/users",
		middleware.Auth(authService)(middleware.AdminOnly(adminHandler.CreateUser)))
	mux.HandleFunc("GET /api/v1/admin/users",
		middleware.Auth(authService)(middleware.AdminOnly(adminHandler.ListUsers)))
	mux.HandleFunc("PATCH /api/v1/admin/users/{userId}/approve",
		middleware.Auth(authService)(middleware.AdminOnly(adminHandler.ApproveUser)))
	mux.HandleFunc("GET /api/v1/admin/stats",
		middleware.Auth(authService)(middleware.AdminOnly(adminHandler.GetStats)))

	// CORS middleware'i ekle
	handlerWithCORS := middleware.CORS(mux)

	log.Printf("🚀 Anonim Oylama API sunucusu %s portunda başlatılıyor...", cfg.ServerPort)
	if err := http.ListenAndServe(":"+cfg.ServerPort, handlerWithCORS); err != nil {
		log.Fatalf("❌ Sunucu başlatılamadı: %v", err)
	}
}
