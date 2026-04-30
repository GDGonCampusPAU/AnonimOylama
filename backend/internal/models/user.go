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
