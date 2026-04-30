// Package repository, veritabanı işlemlerini barındırır.
package repository

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/models"
)

// UserRepository, kullanıcı DB işlemlerini kapsar.
type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// GetByEmail, e-posta ile kullanıcıyı getirir. Parametrik sorgu ile SQL Injection engellenir.
func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	query := `
		SELECT id, email, password, name, surname, is_approved, created_at
		FROM users WHERE email = $1
	`
	user := &models.User{}
	err := r.db.QueryRow(query, email).Scan(
		&user.ID, &user.Email, &user.Password,
		&user.Name, &user.Surname, &user.IsApproved, &user.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("kullanıcı bulunamadı: %s", email)
		}
		return nil, fmt.Errorf("kullanıcı sorgulanırken hata: %w", err)
	}
	return user, nil
}

// GetRolesByUserID, kullanıcının rollerini döndürür.
func (r *UserRepository) GetRolesByUserID(userID string) ([]string, error) {
	query := `
		SELECT r.name FROM roles r
		INNER JOIN user_roles ur ON r.id = ur.role_id
		WHERE ur.user_id = $1
	`
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("roller sorgulanırken hata: %w", err)
	}
	defer rows.Close()

	var roles []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, fmt.Errorf("rol okunurken hata: %w", err)
		}
		roles = append(roles, name)
	}
	return roles, rows.Err()
}
