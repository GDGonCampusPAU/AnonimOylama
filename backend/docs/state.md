# Proje Anlık Durumu (State)

## 📍 Mevcut Durum
* **Aktif Faz:** Phase 3 ✅ TAMAMLANDI — Phase 4'e geçiş bekleniyor
* **Son Güncelleme:** 2026-05-07

## ✅ Tamamlananlar
* [x] Phase 1: Temel kurulum, Docker, migration, /health endpoint
* [x] 2.1. `internal/models/user.go` — User, Role, UserWithRoles
* [x] 2.2. `internal/repository/user_repository.go` — GetByEmail, GetRolesByUserID
* [x] 2.3. `internal/service/auth_service.go` — bcrypt + JWT (HS256, 24h)
* [x] 2.4. `internal/handlers/auth_handler.go` — POST /api/v1/auth/login
* [x] 2.5. `internal/middleware/auth.go` — Bearer token + context injection
* [x] 3.1. `internal/models/election.go` — Election, Candidate, ElectionInvitee + DTO'lar
* [x] 3.2. `internal/service/election_service.go` — inviteCode (crypto/rand, retry×5), CreateElection, JoinByInviteCode
* [x] 3.3. `internal/mailer/mailer.go` — go-mail v0.7.2, STARTTLS, retry×3 backoff, goroutine bulk
* [x] 3.4. `internal/handlers/election_handler.go` — POST /api/v1/elections (201)
* [x] 3.5. `internal/handlers/election_handler.go` — GET /api/v1/elections/join/{inviteCode} (whitelist)
* [x] `internal/repository/election_repository.go` — CreateElection, CreateCandidates, CreateInvitees (tx), GetByInviteCode, GetCandidates, IsInvited
* [x] `sql/migrations/002_election_invitees.up.sql` — election_invitees tablosu (whitelist)
* [x] `internal/config/config.go` — SMTP alanları (SMTPHost/Port/User/Password/From)
* [x] `go.mod` / `go.sum` — github.com/wneessen/go-mail v0.7.2 eklendi

## 🏗️ Mimari Kararlar (Phase 3)
* **inviteCode:** `crypto/rand` + `XXXX-XXXX` format, UNIQUE DB constraint retry (maks 5)
* **Whitelist:** `election_invitees` tablosu; join endpoint'inde e-posta kontrolü
* **E-posta:** `go-mail` v0.7.2 — exponential backoff retry (1s→2s→4s), goroutine per recipient
* **Atomik yazım:** Election + Candidates + Invitees tek SQL transaction'ında
* **Güvenlik:** `CandidateInfo` DTO'sunda `voteCount` kasıtlı olarak çıkarıldı

## ⚠️ Bekleyen Aksiyon
* **⚡ Migration uygulanmadı** — DB başlatıldığında aşağıdaki komutu çalıştır:
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
migrate -path sql/migrations -database "postgres://postgres:postgres@localhost:5432/anonim_oylama?sslmode=disable" up
```
* **.env dosyası eksik** — `.env.example`'ı kopyala ve SMTP + DB bilgilerini doldur

## ⏳ Sırada Bekleyenler (Phase 4)
* [ ] 4.1. `ElectionVoters` modeli (zaten DB'de mevcut, Go struct gerekli)
* [ ] 4.2. `VoteCheckMiddleware` — electionId + userId çift kontrol
* [ ] 4.3. `POST /api/v1/elections/{electionId}/vote` — anonimlik korunarak oy kaydı

## 🧪 Test Sonuçları (Phase 2)
| Test | HTTP | Sonuç |
|---|---|---|
| Geçerli giriş | 200 + JWT | ✅ |
| Yanlış şifre | 401 | ✅ |
| Onaysız hesap | 403 | ✅ |
| Eksik alan | 400 | ✅ |

## 📌 Notlar
* `migrate` CLI: `go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest`
* Test seed: `sql/seed_test_users.sql`
* Go sürümü: 1.26.2 (windows/amd64)
