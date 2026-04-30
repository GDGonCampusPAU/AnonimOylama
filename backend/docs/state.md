# Proje Anlık Durumu (State)

**AI Ajanı İçin Not:** Herhangi bir kod yazmadan önce ve bir görevi tamamladıktan sonra BU DOSYAYI GÜNCELLE. Bu dosya, projede nerede olduğumuzu, nelerin bittiğini ve nelerde sorun yaşadığımızı gösterir.

## 📍 Mevcut Durum (Current Status)
* **Aktif Faz:** Phase 1 ✅ TAMAMLANDI — Phase 2'ye geçiş bekleniyor
* **Aktif Görev:** Phase 1 tamamlandı. Sıradaki: 2.1. Users ve Roles veri modellerinin oluşturulması
* **Son Güncelleme:** 2026-04-30 15:05

## ✅ Tamamlananlar (Completed)
* [x] 1.1. Go projesinin başlatılması (`go mod init github.com/GDGonCampusPAU/AnonimOylama/backend`)
* [x] 1.2. Klasör mimarisinin `project-structure.md` standartlarına göre kurulması
* [x] 1.3. `.env` dosyası, `.env.example`, `internal/config/config.go` yapılandırması
* [x] 1.4. PostgreSQL bağlantısı (`database/sql` + `lib/pq`), Docker Compose, `golang-migrate` ile migration

## 🏗️ Kurulan Altyapı Detayları
* **Docker:** `docker-compose.yml` ile PostgreSQL 16 Alpine (container: `anonim_oylama_db`)
* **Migration:** `golang-migrate` CLI, `sql/migrations/001_init.up.sql` ile 6 tablo oluşturuldu
* **Tablolar:** `users`, `roles`, `user_roles`, `elections`, `candidates`, `election_voters`
* **Varsayılan Roller:** `Admin`, `User` (seed data olarak migration'da eklendi)
* **Standart Response:** `pkg/response/response.go` — `{success, data, message}` formatı
* **Health Check:** `GET /health` endpoint'i aktif ve test edildi
* **Go Bağımlılıkları:** `godotenv v1.5.1`, `lib/pq v1.12.3`

## 🚧 Üzerinde Çalışılanlar (In Progress)
*(Şu an aktif çalışma yok — Phase 2 onayı bekleniyor)*

## ⏳ Sırada Bekleyenler (Next Up)
* [ ] 2.1. `Users` ve `Roles` veri modellerinin (struct) oluşturulması
* [ ] 2.2. Veritabanı katmanında (Repository) kullanıcı sorgularının yazılması

## ⚠️ Karşılaşılan Sorunlar / Notlar (Blockers & Notes)
* `golang-migrate` CLI, `go install` ile kuruldu ancak PowerShell PATH'inde değil. Tam yol kullanılması gerekiyor: `$env:USERPROFILE\go\bin\migrate.exe`
* Türkçe karakterler `Invoke-RestMethod` çıktısında bozuk görünüyor (encoding sorunu, API kendisi doğru çalışıyor)
