# Proje Geliştirme Planı (Project Plan)

Bu doküman, Anonim Oylama Sistemi backend projesinin uçtan uca geliştirme adımlarını içerir. **AI Ajanı İçin Not:** Geliştirme yaparken bu plandaki sıraya kesinlikle uymalısın. Herhangi bir göreve başlamadan önce `state.md` dosyasını kontrol et ve güncel duruma göre hareket et.

## 🟢 Phase 1: Temel Kurulum ve Altyapı
- [x] 1.1. Go projesinin başlatılması (`go mod init`).
- [x] 1.2. `docs/project-structure.md` standartlarına göre klasör ağacının oluşturulması.
- [x] 1.3. `.env` dosyasının ve `internal/config` yapılandırmasının kurulması.
- [x] 1.4. PostgreSQL veritabanı bağlantısının (`database/sql` veya `sqlc`) kurulması.

## 🟡 Phase 2: Kullanıcı ve Yetkilendirme (Auth)
- [ ] 2.1. `Users` ve `Roles` veri modellerinin (struct) oluşturulması.
- [ ] 2.2. Veritabanı katmanında (Repository) kullanıcı sorgularının yazılması.
- [ ] 2.3. JWT üretim ve doğrulama servisinin (`internal/service`) yazılması.
- [ ] 2.4. `POST /api/v1/auth/login` HTTP uç noktasının (Handler) yazılması.
- [ ] 2.5. Route koruması için `AuthMiddleware` yazılması.

## 🟠 Phase 3: Seçim Odaları ve Davet Sistemi (Elections)
- [ ] 3.1. `Elections` ve `Candidates` veri modellerinin oluşturulması.
- [ ] 3.2. Benzersiz davet kodu (`inviteCode`) üreten servisin yazılması.
- [ ] 3.3. E-posta gönderme (SMTP) altyapısının `internal/mailer` içine kurulması.
- [ ] 3.4. `POST /api/v1/elections` (Oda oluşturma ve mail tetikleme) uç noktasının yazılması.
- [ ] 3.5. `GET /api/v1/elections/join/{inviteCode}` (Odaya katılım) uç noktasının yazılması.

## 🔴 Phase 4: Güvenli Oylama Mekanizması (Core Logic)
- [ ] 4.1. `ElectionVoters` modelinin oluşturulması (Güvenlik Duvarı).
- [ ] 4.2. Kullanıcının o odada oy kullanıp kullanmadığını denetleyen `VoteCheckMiddleware` yazılması.
- [ ] 4.3. `POST /api/v1/elections/{electionId}/vote` uç noktasının yazılması (Anonimlik kuralına %100 uyularak).

## 🟣 Phase 5: Sonuçlar ve Finalizasyon
- [ ] 5.1. `GET /api/v1/elections/{electionId}/results` uç noktasının yazılması (Sadece status: Completed ise çalışacak).
- [ ] 5.2. CORS ayarlarının yapılması ve API'nin Frontend ekibi için hazır hale getirilmesi.
