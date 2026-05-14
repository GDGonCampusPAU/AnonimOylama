package service

import (
	"fmt"
	"math"
	"strings"

	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/models"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

// AdminService, yönetici işlemlerine ait tüm iş mantığını kapsar.
type AdminService struct {
	userRepo *repository.UserRepository
}

func NewAdminService(userRepo *repository.UserRepository) *AdminService {
	return &AdminService{userRepo: userRepo}
}

// CreateUser, yeni bir kullanıcı oluşturur ve belirtilen rolü atar.
// is_approved otomatik olarak true; admin tarafından eklendiği için onaya gerek yoktur.
func (s *AdminService) CreateUser(req models.CreateUserRequest) (string, error) {
	// Giriş doğrulama
	if strings.TrimSpace(req.Email) == "" {
		return "", fmt.Errorf("e-posta adresi boş olamaz")
	}
	if len(req.Password) < 8 {
		return "", fmt.Errorf("şifre en az 8 karakter olmalıdır")
	}
	if strings.TrimSpace(req.Name) == "" || strings.TrimSpace(req.Surname) == "" {
		return "", fmt.Errorf("ad ve soyad boş olamaz")
	}

	// Şifre hashle (bcrypt, cost 12)
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		return "", fmt.Errorf("şifre hashlenirken hata: %w", err)
	}

	// Kullanıcıyı DB'ye ekle
	userID, err := s.userRepo.CreateUser(req.Email, string(hashed), req.Name, req.Surname)
	if err != nil {
		return "", fmt.Errorf("kullanıcı oluşturulamadı: %w", err)
	}

	// Rolü belirle: belirtilmemişse varsayılan "user"
	roleName := strings.ToLower(strings.TrimSpace(req.Role))
	if roleName == "" {
		roleName = "user"
	}
	if roleName != "user" && roleName != "admin" {
		return "", fmt.Errorf("geçersiz rol: '%s'. Beklenen: 'user' veya 'admin'", roleName)
	}

	dbRoleName := "User"
	if roleName == "admin" {
		dbRoleName = "Admin"
	}

	if err := s.userRepo.AssignRoleByName(userID, dbRoleName); err != nil {
		return "", fmt.Errorf("rol ataması başarısız: %w", err)
	}

	return userID, nil
}

// ListUsers, sayfalanmış kullanıcı listesi döner.
// onlyPending: true ise sadece onay bekleyen kullanıcılar
func (s *AdminService) ListUsers(page, limit int, onlyPending bool) (*models.PaginatedUsers, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}

	users, total, err := s.userRepo.ListUsers(page, limit, onlyPending)
	if err != nil {
		return nil, fmt.Errorf("kullanıcılar listelenemedi: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	if totalPages < 1 {
		totalPages = 1
	}

	return &models.PaginatedUsers{
		Users:      users,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// ApproveUser, belirtilen kullanıcıyı onaylar.
func (s *AdminService) ApproveUser(userID string) error {
	if err := s.userRepo.ApproveUser(userID); err != nil {
		return fmt.Errorf("kullanıcı onaylanamadı: %w", err)
	}
	return nil
}

// GetStats, sistem genelindeki özet istatistikleri döner.
func (s *AdminService) GetStats() (*models.AdminStats, error) {
	stats, err := s.userRepo.GetStats()
	if err != nil {
		return nil, fmt.Errorf("istatistikler alınamadı: %w", err)
	}
	return stats, nil
}
