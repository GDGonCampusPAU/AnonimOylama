# Test Rehberi

Bu doküman, geliştirme ortamında API'yi Swagger üzerinden hızlı test etmek için kullanılacak hesapları ve yardımcı komutları içerir.

## Swagger

Docker Compose ile backend çalışırken Swagger arayüzü:

```text
http://localhost:8081/swagger/index.html
```

## Swagger Dokümanını Yenileme

Yeni endpoint veya Swagger annotation eklendiğinde aşağıdaki komutları çalıştır:

```powershell
swag init -g cmd/api/main.go
docker compose up -d --build backend
```

> Not: Sadece `swag init` çalıştırmak yeterli değildir; projenin entrypoint'i `cmd/api/main.go` olduğu için `-g cmd/api/main.go` verilmelidir.

## Seed Kullanıcılar

Geliştirme veritabanına test kullanıcılarını eklemek için:

```powershell
Get-Content sql/seed_test_users.sql | docker exec -i anonim_oylama_db psql -U postgres -d anonim_oylama
```

## Test Hesapları

### Admin Kullanıcı

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

Admin kullanıcı şu endpoint'leri test edebilir:

- `POST /api/v1/admin/users`
- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/{userId}/approve`
- `GET /api/v1/admin/stats`

### Normal Kullanıcı

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Normal kullanıcı şu endpoint'leri test edebilir:

- `POST /api/v1/elections`
- `GET /api/v1/elections/join/{inviteCode}`
- `POST /api/v1/elections/{electionId}/vote`
- `GET /api/v1/elections/my`
- `GET /api/v1/elections/invited`
- `POST /api/v1/elections/{electionId}/reinvite` *(sadece seçimi oluşturan kullanıcı)*

### Onaysız Kullanıcı

```json
{
  "email": "pending@example.com",
  "password": "password123"
}
```

Beklenen davranış:

- `POST /api/v1/auth/login` çağrısında `403 Forbidden` dönmelidir.

## JWT ile Swagger'da Yetkilendirme

1. `POST /api/v1/auth/login` ile giriş yap.
2. Dönen `token` değerini kopyala.
3. Swagger sağ üstteki **Authorize** butonuna tıkla.
4. Şu formatta gir:

```text
Bearer <token>
```

## SMTP Test Notu

`.env` veya `docker-compose.yml` içinde gerçek Gmail App Password yoksa:

- Seçim oluşturma çalışır.
- Davetli whitelist kayıtları DB'ye yazılır.
- E-posta gönderimi başarısız olabilir ve log'a düşer.
- Core iş mantığı engellenmez.

Gerçek Gmail SMTP için:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-google-app-password
SMTP_FROM=your-email@gmail.com
```

## Faydalı Docker Komutları

```powershell
docker compose up -d --build
```

```powershell
docker compose logs -f backend
```

```powershell
docker compose ps
```

## Migration Durumu Kontrol

```powershell
docker run --rm --network backend_default -v ${PWD}/sql/migrations:/migrations migrate/migrate -path=/migrations -database=postgres://postgres:postgres@postgres:5432/anonim_oylama?sslmode=disable version
```
