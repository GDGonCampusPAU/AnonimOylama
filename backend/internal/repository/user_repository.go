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

// CreateUser, yeni bir kullanıcıyı DB'ye ekler ve oluşturulan kullanıcının ID'sini döner.
// Parola bu çağrıdan önce bcrypt ile hashlenmiş olmalıdır.
func (r *UserRepository) CreateUser(email, hashedPassword, name, surname string) (string, error) {
	query := `
		INSERT INTO users (id, email, password, name, surname, is_approved, created_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW())
		RETURNING id
	`
	var id string
	err := r.db.QueryRow(query, email, hashedPassword, name, surname).Scan(&id)
	if err != nil {
		return "", fmt.Errorf("kullanıcı oluşturulurken hata: %w", err)
	}
	return id, nil
}

// AssignRoleByName, kullanıcıya ismiyle belirtilen rolü atar.
// Rol bulunamazsa hata döner.
func (r *UserRepository) AssignRoleByName(userID, roleName string) error {
	query := `
		INSERT INTO user_roles (user_id, role_id)
		SELECT $1, id FROM roles WHERE name = $2
		ON CONFLICT DO NOTHING
	`
	res, err := r.db.Exec(query, userID, roleName)
	if err != nil {
		return fmt.Errorf("rol atanırken hata: %w", err)
	}
	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("'%s' adında bir rol bulunamadı", roleName)
	}
	return nil
}

// ApproveUser, kullanıcının is_approved alanını true olarak günceller.
func (r *UserRepository) ApproveUser(userID string) error {
	query := `UPDATE users SET is_approved = true WHERE id = $1`
	res, err := r.db.Exec(query, userID)
	if err != nil {
		return fmt.Errorf("kullanıcı onaylanırken hata: %w", err)
	}
	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("kullanıcı bulunamadı")
	}
	return nil
}

// ListUsers, sayfalama ve onay durumu filtresiyle kullanıcı listesi döner.
// onlyPending=true ise sadece is_approved=false olan kullanıcılar listelenir.
func (r *UserRepository) ListUsers(page, limit int, onlyPending bool) ([]models.UserListItem, int, error) {
	offset := (page - 1) * limit

	whereClause := ""
	if onlyPending {
		whereClause = "WHERE u.is_approved = false"
	}

	countQuery := `SELECT COUNT(*) FROM users u ` + whereClause
	var total int
	if err := r.db.QueryRow(countQuery).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("kullanıcı sayısı sorgulanırken hata: %w", err)
	}

	query := `
		SELECT u.id, u.email, u.name, u.surname, u.is_approved, u.created_at
		FROM users u
		` + whereClause + `
		ORDER BY u.created_at DESC
		LIMIT $1 OFFSET $2
	`
	rows, err := r.db.Query(query, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("kullanıcılar sorgulanırken hata: %w", err)
	}
	defer rows.Close()

	var users []models.UserListItem
	for rows.Next() {
		var u models.UserListItem
		if err := rows.Scan(&u.ID, &u.Email, &u.Name, &u.Surname, &u.IsApproved, &u.CreatedAt); err != nil {
			return nil, 0, fmt.Errorf("kullanıcı okunurken hata: %w", err)
		}
		// Her kullanıcı için rolleri ayrıca çek
		roles, _ := r.GetRolesByUserID(u.ID)
		u.Roles = roles
		users = append(users, u)
	}
	return users, total, rows.Err()
}

// GetStats, admin dashboard istatistiklerini tek sorguda döner.
func (r *UserRepository) GetStats() (*models.AdminStats, error) {
	query := `
		SELECT
			(SELECT COUNT(*) FROM users)                          AS total_users,
			(SELECT COUNT(*) FROM users WHERE is_approved = false) AS pending_users,
			(SELECT COUNT(*) FROM elections)                       AS total_elections,
			(SELECT COUNT(*) FROM elections WHERE status = 'Active') AS active_elections,
			(SELECT COUNT(*) FROM election_voters)                 AS total_votes
	`
	stats := &models.AdminStats{}
	err := r.db.QueryRow(query).Scan(
		&stats.TotalUsers,
		&stats.PendingUsers,
		&stats.TotalElections,
		&stats.ActiveElections,
		&stats.TotalVotesCast,
	)
	if err != nil {
		return nil, fmt.Errorf("istatistikler sorgulanırken hata: %w", err)
	}
	return stats, nil
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
