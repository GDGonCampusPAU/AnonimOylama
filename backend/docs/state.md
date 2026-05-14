# Proje Anlık Durumu (State)

## 📍 Mevcut Durum
* **Aktif Faz:** Phase 7 ✅ TAMAMLANDI — Admin yönetimi, seçim listeleme ve reinvite eklendi.
* **Son Güncelleme:** 2026-05-14

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
* [x] 4.1. `internal/models/vote.go` — ElectionVoter, VoteRequest
* [x] 4.2. `internal/middleware/vote_check.go` — VoteCheckMiddleware
* [x] 4.3. `internal/handlers/vote_handler.go` — POST /api/v1/elections/{electionId}/vote
* [x] `internal/repository/vote_repository.go` — HasUserVoted, RecordVote (tx), GetTotalVoters
* [x] `internal/service/vote_service.go` — CastVote (election status and expiration checks)
* [x] `internal/repository/election_repository.go` — GetByID eklendi
* [x] `internal/service/election_service.go` — GetElectionResults (Phase 5)
* [x] `internal/middleware/cors.go` — CORS middleware (Phase 5)
* [x] `go get github.com/swaggo/swag`, `go get github.com/swaggo/http-swagger` eklendi.
* [x] `cmd/api/main.go` — `@title`, `@version` ve `/swagger/` route eklendi.
* [x] Uç noktalara declarative swagger (godoc) tag'leri yazıldı (Login, Create, Join, CastVote, GetResults, Complete).
* [x] `PUT /api/v1/elections/{electionId}/complete` — Seçim sonlandırma endpoint'i yazıldı.
* [x] `docs/` dizininde Swagger `swagger.json` üretildi.
* [x] 7.1. `internal/middleware/admin.go` — AdminOnly role check middleware
* [x] 7.2. `internal/models/user.go` — CreateUserRequest, UserListItem, PaginatedUsers, AdminStats DTOs
* [x] 7.3. `internal/models/election.go` — ElectionListItem, PaginatedElections DTOs
* [x] 7.4. `internal/repository/user_repository.go` — CreateUser, AssignRoleByName, ApproveUser, ListUsers, GetStats
* [x] 7.5. `internal/repository/election_repository.go` — GetByCreatorID, GetByInviteeEmail, GetInviteeEmails
* [x] 7.6. `internal/service/admin_service.go` — CreateUser, ListUsers, ApproveUser, GetStats
* [x] 7.7. `internal/service/election_service.go` — GetMyElections, GetInvitedElections, Reinvite
* [x] 7.8. `internal/handlers/admin_handler.go` — POST /admin/users, GET /admin/users, PATCH .../approve, GET /admin/stats
* [x] 7.9. `internal/handlers/election_handler.go` — GET /elections/my, GET /elections/invited, POST .../reinvite
* [x] `cmd/api/main.go` — 7 yeni route kaydı + Admin DI zinciri

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

## ⏳ Sırada Bekleyenler (Phase 5)
* [x] 5.1. `GET /api/v1/elections/{electionId}/results` uç noktasının yazılması.
* [x] 5.2. CORS ayarlarının yapılması.

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
