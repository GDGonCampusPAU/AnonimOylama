# Proje Geliştirme Planı (Project Plan)

Bu doküman, Anonim Oylama Sistemi backend projesinin uçtan uca geliştirme adımlarını içerir. **AI Ajanı İçin Not:** Geliştirme yaparken bu plandaki sıraya kesinlikle uymalısın. Herhangi bir göreve başlamadan önce `state.md` dosyasını kontrol et ve güncel duruma göre hareket et.

## 🟢 Phase 1: Temel Kurulum ve Altyapı
- [x] 1.1. Go projesinin başlatılması (`go mod init`).
- [x] 1.2. `docs/project-structure.md` standartlarına göre klasör ağacının oluşturulması.
- [x] 1.3. `.env` dosyasının ve `internal/config` yapılandırmasının kurulması.
- [x] 1.4. PostgreSQL veritabanı bağlantısının kurulması.

## 🟢 Phase 2: Kullanıcı ve Yetkilendirme (Auth)
- [x] 2.1. `Users` ve `Roles` veri modellerinin (struct) oluşturulması.
- [x] 2.2. Veritabanı katmanında (Repository) kullanıcı sorgularının yazılması.
- [x] 2.3. JWT üretim ve doğrulama servisinin yazılması.
- [x] 2.4. `POST /api/v1/auth/login` HTTP uç noktasının yazılması.
- [x] 2.5. Route koruması için `AuthMiddleware` yazılması.

## � Phase 3: Seçim Odaları ve Davet Sistemi (Elections)
- [x] 3.1. `Elections`, `Candidates` ve `ElectionInvitees` veri modellerinin oluşturulması.
- [x] 3.2. Benzersiz davet kodu (`inviteCode`) üreten servisin yazılması (`crypto/rand`, retry maks 5).
- [x] 3.3. E-posta gönderme (SMTP) altyapısının `internal/mailer` içine kurulması (`go-mail`, retry + goroutine).
- [x] 3.4. `POST /api/v1/elections` uç noktasının yazılması.
- [x] 3.5. `GET /api/v1/elections/join/{inviteCode}` uç noktasının yazılması (whitelist kontrolü dahil).

## 🔴 Phase 4: Güvenli Oylama Mekanizması (Core Logic)
- [x] 4.1. `ElectionVoters` modelinin oluşturulması.
- [x] 4.2. `VoteCheckMiddleware` yazılması.
- [x] 4.3. `POST /api/v1/elections/{electionId}/vote` uç noktasının yazılması.

## 🟣 Phase 5: Sonuçlar ve Finalizasyon
- [x] 5.1. `GET /api/v1/elections/{electionId}/results` uç noktasının yazılması.
- [x] 5.2. CORS ayarlarının yapılması.

## 🟢 Phase 6: Dokümantasyon ve İyileştirmeler
- [x] 6.1. Swagger (OpenAPI) entegrasyonu (`/swagger/`).
- [x] 6.2. `CompleteElection` iş mantığı ve `PUT /api/v1/elections/{electionId}/complete` uç noktası.
