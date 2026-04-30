# Proje Klasör Yapısı ve Mimari Rehber (Project Structure)

Bu doküman, Go (Golang) ile geliştirilen Backend projemizin klasör mimarisini tanımlar. **Yapay Zeka Ajanları İçin Not:** Yeni bir kod ürettiğinde, bu kodu proje kök dizinine veya rastgele bir klasöre KOYMA. Aşağıdaki standart Go proje mimarisine (Standard Go Project Layout) kesinlikle uymalısın.

## 📂 Klasör Hiyerarşisi
```text
anonim-oylama-backend/
├── cmd/
│   └── api/
│       └── main.go           # Uygulamanın giriş noktası (Entrypoint). Sadece bağımlılıkları bağlar ve sunucuyu başlatır.
├── internal/                 # Projeye özel, dışarıya kapalı kodların (Business Logic) bulunduğu klasör.
│   ├── config/               # Ortam değişkenleri (.env) ve veritabanı bağlantı ayarları.
│   ├── models/               # Go struct'ları (database-schema.md dosyasındaki varlıkların Go karşılıkları).
│   ├── repository/           # Sadece veritabanı işlemleri (sqlc sorguları veya database/sql CRUD işlemleri).
│   ├── service/              # İş mantığı (Business logic). Örn: Şifre hashleme, mail atma tetikleyicisi.
│   ├── handlers/             # HTTP API uç noktaları (Controllers). Gelen istekleri (JSON) işler ve yanıt döner.
│   ├── middleware/           # Araya giren katmanlar. Örn: JWT doğrulama (auth.go), Mükerrer oy kontrolü (vote_check.go).
│   └── mailer/               # SMTP ve e-posta gönderme servisleri.
├── pkg/                      # (Opsiyonel) Proje dışındaki başka Go projelerinde de kullanılabilecek genel araçlar (Utils, Logger vb.).
├── docs/                     # Proje dokümantasyonları (Şu an okuduğun klasör).
├── sql/                      # Veritabanı şemaları, migration dosyaları ve sqlc için query'ler.
├── go.mod                    # Go modül bağımlılıkları.
└── .env                      # Gizli ortam değişkenleri (API anahtarları, DB şifreleri).
```

---

## 🏗️ AI Ajanı İçin Kodlama ve Yerleştirme Kuralları (Routing Rules)

Yeni bir özellik geliştirmen istendiğinde (Örn: "Oda oluşturma API'sini yaz"), kodu aşağıdaki akışa göre parçalara bölmelisin:

1. **`internal/models`**: Eğer yeni bir veri yapısı gerekiyorsa struct'ı buraya ekle.
2. **`internal/repository`**: Veritabanına veri ekleyecek/çekecek SQL/Go kodunu buraya yaz. (İş mantığını buraya KARIŞTIRMA).
3. **`internal/service`**: Veriyi repository'den alıp işleyecek (Örn: davet kodu üretecek) mantığı buraya yaz.
4. **`internal/handlers`**: Sadece HTTP Request (JSON) alıp, Service katmanını çağırıp, API Specs'e uygun JSON dönen kodu buraya yaz.
5. **`cmd/api/main.go`**: Yazdığın handler'ı Router'a (HTTP yönlendiricisine) kaydetmek için sadece bu dosyada `mux.HandleFunc` veya ilgili framework'ün route tanımını güncelle.

**ÖNEMLİ:** `main.go` dosyasının içini veritabanı sorguları veya iş mantığı ile kirletmek kesinlikle YASAKTIR.
```
