// Package config, uygulamanın yapılandırma (configuration) yönetiminden sorumludur.
// .env dosyasını okuyarak tüm ortam değişkenlerini tek bir Config struct'ında toplar.
// Bu sayede uygulama genelinde dağınık os.Getenv() çağrıları yerine
// merkezi ve tip-güvenli bir yapılandırma erişimi sağlanır.
package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config, uygulamanın tüm yapılandırma değerlerini tutan ana struct'tır.
// Her alan, .env dosyasındaki bir ortam değişkenine karşılık gelir.
type Config struct {
	ServerPort string // Sunucunun dinleyeceği port (Örn: "8080")

	DBHost     string // PostgreSQL sunucu adresi (Örn: "localhost")
	DBPort     string // PostgreSQL port numarası (Örn: "5432")
	DBUser     string // Veritabanı kullanıcı adı
	DBPassword string // Veritabanı şifresi
	DBName     string // Veritabanı adı (Örn: "anonim_oylama")
	DBSSLMode  string // SSL modu (Örn: "disable", "require")

	JWTSecret string // JWT token imzalamak için kullanılan gizli anahtar
}

// Load, .env dosyasını okuyarak Config struct'ını oluşturur ve döndürür.
// .env dosyası bulunamazsa uyarı verir ama çökertmez
// (production'da ortam değişkenleri doğrudan sistem tarafından sağlanabilir).
func Load() *Config {
	// .env dosyasını yüklemeye çalış
	// Dosya yoksa hata vermez, sadece uyarı loglar
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  .env dosyası bulunamadı, sistem ortam değişkenleri kullanılacak.")
	}

	cfg := &Config{
		ServerPort: getEnv("SERVER_PORT", "8080"),

		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", "postgres"),
		DBName:     getEnv("DB_NAME", "anonim_oylama"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),

		JWTSecret: getEnv("JWT_SECRET", ""),
	}

	return cfg
}

// DatabaseURL, PostgreSQL bağlantı string'ini (DSN) oluşturur.
// Oluşturulan format: "postgres://user:password@host:port/dbname?sslmode=disable"
// Bu string, database/sql paketinin sql.Open() fonksiyonuna verilir.
func (c *Config) DatabaseURL() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		c.DBUser,
		c.DBPassword,
		c.DBHost,
		c.DBPort,
		c.DBName,
		c.DBSSLMode,
	)
}

// getEnv, ortam değişkenini okur. Boşsa varsayılan değeri döner.
// Bu yardımcı fonksiyon, her os.Getenv çağrısında tekrar eden
// "boşsa varsayılan ata" mantığını ortadan kaldırır.
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
