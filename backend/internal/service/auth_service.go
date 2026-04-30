// Package service, iş mantığını barındırır.
package service

import (
	"fmt"
	"time"

	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/models"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo  *repository.UserRepository
	jwtSecret []byte
}

func NewAuthService(userRepo *repository.UserRepository, jwtSecret string) *AuthService {
	return &AuthService{userRepo: userRepo, jwtSecret: []byte(jwtSecret)}
}

// Claims, JWT token içinde taşınacak özel alanları tanımlar.
type Claims struct {
	UserID string   `json:"userId"`
	Email  string   `json:"email"`
	Roles  []string `json:"roles"`
	jwt.RegisteredClaims
}

type LoginResult struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

// Login: kullanıcı bul → onay kontrolü → bcrypt doğrula → JWT üret.
func (s *AuthService) Login(email, password string) (*LoginResult, error) {
	user, err := s.userRepo.GetByEmail(email)
	if err != nil {
		return nil, fmt.Errorf("geçersiz e-posta veya şifre")
	}
	if !user.IsApproved {
		return nil, fmt.Errorf("hesabınız henüz admin tarafından onaylanmamış")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, fmt.Errorf("geçersiz e-posta veya şifre")
	}
	roles, err := s.userRepo.GetRolesByUserID(user.ID)
	if err != nil {
		roles = []string{}
	}
	token, err := s.generateToken(user, roles)
	if err != nil {
		return nil, fmt.Errorf("token üretilirken hata: %w", err)
	}
	return &LoginResult{Token: token, User: *user}, nil
}

func (s *AuthService) generateToken(user *models.User, roles []string) (string, error) {
	claims := &Claims{
		UserID: user.ID,
		Email:  user.Email,
		Roles:  roles,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   user.ID,
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

// ValidateToken, token'ı doğrular ve Claims döndürür. AuthMiddleware tarafından kullanılır.
func (s *AuthService) ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("beklenmeyen algoritma: %v", token.Header["alg"])
		}
		return s.jwtSecret, nil
	})
	if err != nil || !token.Valid {
		return nil, fmt.Errorf("geçersiz token")
	}
	return claims, nil
}
