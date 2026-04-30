
# API Spesifikasyonları (API Specs) - v1

Bu doküman, Frontend ve Backend ekipleri arasındaki sözleşmedir. Yapay Zeka Ajanları uç noktaları (endpoint) geliştirirken **kesinlikle** buradaki İstek (Request) ve Yanıt (Response) JSON yapılarına uymalıdır.

## 📌 Standart Yanıt Formatı (Standard Response)
Tüm API uç noktaları aşağıdaki standart JSON sarmalayıcısını (wrapper) dönmelidir:

**Başarılı Yanıt:**
```json
{
  "success": true,
  "data": { ... },
  "message": "İşlem başarılı"
}
```

**Hatalı Yanıt:**
```json
{
  "success": false,
  "data": null,
  "message": "Hata açıklaması (Örn: Zaten oy kullandınız)"
}
```

---

## 🔑 1. Kimlik Doğrulama (Auth)

### `POST /api/v1/auth/login`
Kullanıcının sisteme giriş yapıp JWT token almasını sağlar.

* **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secretpassword"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "user": {
      "id": "uuid-string",
      "name": "Ahmet",
      "surname": "Yılmaz"
    }
  },
  "message": "Giriş başarılı"
}
```
* **Error Responses:**
  * `400 Bad Request`: Eksik bilgi.
  * `401 Unauthorized`: Hatalı şifre veya e-posta.
  * `403 Forbidden`: Hesap henüz Admin tarafından onaylanmamış (`isApproved: false`).

---

## 🗳️ 2. Seçimler / Odalar (Elections)

### `POST /api/v1/elections`
Yeni bir seçim odası oluşturur. Katılımcılara otomatik mail atma işlemini (Goroutine ile arka planda) tetikler.

* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
```json
{
  "title": "2026 Yönetim Kurulu Seçimi",
  "description": "Lütfen tek bir adaya oy verin.",
  "expiresAt": "2026-05-10T15:00:00Z",
  "candidates": ["Aday 1", "Aday 2", "Aday 3"],
  "invitedEmails": ["uye1@example.com", "uye2@example.com"]
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "electionId": "uuid-string",
    "inviteCode": "A7B9-X21K"
  },
  "message": "Oylama oluşturuldu ve davetiyeler gönderiliyor."
}
```

### `GET /api/v1/elections/join/{inviteCode}`
Frontend kullanıcısı maildeki linke tıkladığında, odanın bilgilerini ve adayları getiren uç nokta.

* **Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "election": {
      "id": "uuid-string",
      "title": "2026 Yönetim Kurulu Seçimi",
      "description": "Lütfen tek bir adaya oy verin.",
      "status": "Active"
    },
    "candidates": [
      { "id": "candidate-uuid-1", "name": "Aday 1" },
      { "id": "candidate-uuid-2", "name": "Aday 2" }
    ]
  },
  "message": "Oda bilgileri getirildi"
}
```
* **Error Responses:**
  * `404 Not Found`: Geçersiz davet kodu.
  * `403 Forbidden`: Oylama süresi dolmuş veya kapatılmış.

---

## ✅ 3. Oylama (Voting)

### `POST /api/v1/elections/{electionId}/vote`
Kullanıcının oy kullanma işlemini gerçekleştirir. **AI Ajanı İçin Not:** Bu uç nokta çalışmadan önce `VoteCheckMiddleware` üzerinden geçmeli ve mükerrer oy engellenmelidir. Kimin hangi adaya oy verdiği asla kaydedilmemelidir.

* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
```json
{
  "candidateId": "candidate-uuid-1"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": null,
  "message": "Oyunuz başarıyla kaydedildi."
}
```
* **Error Responses:**
  * `403 Forbidden`: Zaten oy kullandınız. (En kritik hata durumu)
  * `400 Bad Request`: Geçersiz aday ID'si.

---

## 📊 4. Sonuçlar (Results)

### `GET /api/v1/elections/{electionId}/results`
Sadece `status: Completed` olan (bitmiş) seçimlerin sonuçlarını getirir.

* **Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalParticipants": 120,
    "results": [
      { "candidateId": "candidate-uuid-1", "name": "Aday 1", "voteCount": 80 },
      { "candidateId": "candidate-uuid-2", "name": "Aday 2", "voteCount": 40 }
    ]
  },
  "message": "Sonuçlar listelendi"
}
```
* **Error Responses:**
  * `403 Forbidden`: Oylama henüz devam ediyor, sonuçlar gizli.
