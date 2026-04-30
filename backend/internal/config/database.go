package config

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	// PostgreSQL driver'ı database/sql paketi tarafından kullanılması için
	// "blank import" yapılır. Bu, driver'ın init() fonksiyonunun çalışmasını
	// ve kendisini database/sql'e kaydetmesini sağlar.
	_ "github.com/lib/pq"
)

// Connect, PostgreSQL veritabanına bağlantı kurar ve *sql.DB nesnesini döndürür.
//
// Bağlantı havuzu (Connection Pool) ayarları:
//   - MaxOpenConns(25): Aynı anda açılabilecek maksimum bağlantı sayısı.
//   - MaxIdleConns(10): Boşta bekleyen bağlantı sayısı (yeniden kullanım için).
//   - ConnMaxLifetime(5dk): Bir bağlantının maksimum yaşam süresi.
//
// Bu fonksiyon sadece main.go'dan çağrılmalıdır.
func Connect(cfg *Config) (*sql.DB, error) {
	// PostgreSQL bağlantı string'i ile veritabanı bağlantısını aç.
	// sql.Open() aslında bağlantı kurmaz, sadece yapılandırmayı hazırlar.
	db, err := sql.Open("postgres", cfg.DatabaseURL())
	if err != nil {
		return nil, fmt.Errorf("veritabanı bağlantısı açılamadı: %w", err)
	}

	// Bağlantı havuzu (Connection Pool) ayarları.
	// Bu değerler, uygulamanın performansını ve kaynak kullanımını etkiler.
	db.SetMaxOpenConns(25)              // Eşzamanlı açık bağlantı limiti
	db.SetMaxIdleConns(10)              // Boşta bekleyen bağlantı sayısı
	db.SetConnMaxLifetime(5 * time.Minute) // Bağlantı yenileme süresi

	// Ping() ile gerçek bağlantıyı test et.
	// sql.Open() bağlantı kurmaz, Ping() ilk gerçek bağlantıyı oluşturur.
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("veritabanına ping atılamadı: %w", err)
	}

	log.Println("✅ PostgreSQL bağlantısı başarıyla kuruldu.")
	return db, nil
}
