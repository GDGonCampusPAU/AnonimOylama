package models

import "time"

// User, `users` tablosunun Go struct karşılığıdır.
type User struct {
	ID         string    `json:"id"`
	Email      string    `json:"email"`
	Password   string    `json:"-"` // JSON'da asla dönme
	Name       string    `json:"name"`
	Surname    string    `json:"surname"`
	IsApproved bool      `json:"isApproved"`
	CreatedAt  time.Time `json:"createdAt"`
}

// Role, `roles` tablosunun Go struct karşılığıdır.
type Role struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// UserWithRoles, kullanıcı ve rollerini birlikte taşır.
type UserWithRoles struct {
	User  User
	Roles []string
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin DTO'ları
// ─────────────────────────────────────────────────────────────────────────────

// CreateUserRequest, POST /api/v1/admin/users isteğinin JSON gövdesidir.
type CreateUserRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Surname  string `json:"surname"`
	Role     string `json:"role"` // "user" | "admin" — boş bırakılırsa "user" atanır
}

// UserListItem, kullanıcı listesinde her bir kullanıcıyı temsil eder.
// Password alanı kasıtlı olarak çıkarılmıştır.
type UserListItem struct {
	ID         string    `json:"id"`
	Email      string    `json:"email"`
	Name       string    `json:"name"`
	Surname    string    `json:"surname"`
	IsApproved bool      `json:"isApproved"`
	Roles      []string  `json:"roles"`
	CreatedAt  time.Time `json:"createdAt"`
}

// PaginatedUsers, kullanıcı listesi yanıtında sayfalama bilgisini taşır.
type PaginatedUsers struct {
	Users      []UserListItem `json:"users"`
	Total      int            `json:"total"`
	Page       int            `json:"page"`
	Limit      int            `json:"limit"`
	TotalPages int            `json:"totalPages"`
}

// AdminStats, GET /api/v1/admin/stats yanıtıdır.
type AdminStats struct {
	TotalUsers       int `json:"totalUsers"`
	PendingUsers     int `json:"pendingUsers"`
	TotalElections   int `json:"totalElections"`
	ActiveElections  int `json:"activeElections"`
	TotalVotesCast   int `json:"totalVotesCast"`
}
