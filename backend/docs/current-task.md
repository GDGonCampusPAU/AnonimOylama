# Aktif Sprint ve Görev Odak Dosyası (Current Task)

**Yapay Zeka Ajanları İçin Not:** Bu dosya senin anlık odak noktanı belirler. Sadece durumu `[AKTİF]` olan görevler üzerinde çalışmalısın. `[BEKLEMEDE]` olan görevler için şimdiden kod yazmaya kalkışma. Mevcut görevi tamamladığında mutlaka bana bildir.

---

## 🎯 Sprint 1: Kurulum ve Kimlik Doğrulama (Auth)

### Görev 1: Proje İskeleti ve Veritabanı Bağlantısı [AKTİF]
**Açıklama:** Projenin temel Go altyapısının kurulması ve PostgreSQL bağlantısının sağlanması.
**Adımlar:**
1. `go mod init anonim-oylama` komutu ile projeyi başlat.
2. `docs/project-structure.md` dosyasına bakarak temel klasörleri (cmd, internal vs.) oluştur.
3. `.env` dosyasını okumak için `joho/godotenv` paketini kur.
4. `internal/config/db.go` içinde PostgreSQL veritabanı bağlantı fonksiyonunu yaz (`database/sql` ve `lib/pq` sürücüsü kullanarak).
5. `cmd/api/main.go` dosyasında veritabanına bağlanıp "Sunucu çalışıyor" logunu basan temel yapıyı kur.

### Görev 2: JWT ve Auth Katmanı [BEKLEMEDE]
**Açıklama:** Kullanıcıların giriş yapıp token alacağı uç noktanın yazılması.
**Referans:** `api-specs.md` -> `POST /api/v1/auth/login`
**Adımlar:**
1. `internal/models/user.go` içine User struct'ını ekle.
2. `internal/repository/user_repo.go` içine e-posta ile kullanıcı getiren SQL sorgusunu yaz.
3. `internal/handlers/auth.go` içine login işlemlerini ve JWT üretimini yaz.

### Görev 3: Oda (Election) Oluşturma API'si [BEKLEMEDE]
**Açıklama:** Admin onaylı kullanıcıların yeni bir oylama odası oluşturması.
**Referans:** `api-specs.md` -> `POST /api/v1/elections`
**Adımlar:**
1. Gerekli struct'ları ve repository katmanını oluştur.
2. Odaya özel benzersiz bir `inviteCode` üreten servisi yaz.
3. API endpoint'ini oluştur ve route'a bağla.

---
**Geliştiriciye (Sana) Not:** Bir görev bittiğinde `[AKTİF]` etiketini `[TAMAMLANDI]` yapıp, sıradaki görevi `[AKTİF]` olarak işaretle.