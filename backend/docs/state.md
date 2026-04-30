# Proje Anlık Durumu (State)

## 📍 Mevcut Durum
* **Aktif Faz:** Phase 2 ✅ TAMAMLANDI — Phase 3'e geçiş bekleniyor
* **Son Güncelleme:** 2026-04-30 15:38

## ✅ Tamamlananlar
* [x] Phase 1: Temel kurulum, Docker, migration, /health endpoint
* [x] 2.1. `internal/models/user.go` — User, Role, UserWithRoles
* [x] 2.2. `internal/repository/user_repository.go` — GetByEmail, GetRolesByUserID
* [x] 2.3. `internal/service/auth_service.go` — bcrypt + JWT (HS256, 24h)
* [x] 2.4. `internal/handlers/auth_handler.go` — POST /api/v1/auth/login
* [x] 2.5. `internal/middleware/auth.go` — Bearer token + context injection

## 🧪 Test Sonuçları
| Test | HTTP | Sonuç |
|---|---|---|
| Geçerli giriş | 200 + JWT | ✅ |
| Yanlış şifre | 401 | ✅ |
| Onaysız hesap | 403 | ✅ |
| Eksik alan | 400 | ✅ |

## ⏳ Sırada Bekleyenler
* [ ] 3.1. Elections ve Candidates modelleri
* [ ] 3.2. inviteCode servisi
* [ ] 3.3. SMTP mailer altyapısı

## ⚠️ Notlar
* `migrate` CLI: `$env:USERPROFILE\go\bin\migrate.exe`
* Test seed: `sql/seed_test_users.sql`
