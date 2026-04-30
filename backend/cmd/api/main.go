// Package main, Anonim Oylama Sistemi backend uygulamasının giriş noktasıdır.
//
// Bu dosya SADECE aşağıdaki görevlerden sorumludur:
//  1. Yapılandırmayı (Config) yüklemek
//  2. Veritabanı bağlantısını kurmak
//  3. HTTP Router'ı oluşturup handler'ları kaydetmek
//  4. Sunucuyu başlatmak
//
// ÖNEMLİ: Bu dosyaya iş mantığı, veritabanı sorguları veya
// karmaşık işlemler kesinlikle yazılmamalıdır.
package main

import (
	"log"
	"net/http"

	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/config"
	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/handlers"
)

func main() {
	// ====================================
	// 1. Yapılandırmayı Yükle
	// ====================================
	// .env dosyasından ortam değişkenlerini oku ve Config struct'ına dönüştür.
	cfg := config.Load()

	// ====================================
	// 2. Veritabanı Bağlantısını Kur
	// ====================================
	// PostgreSQL'e bağlan. Bağlantı kurulamazsa uygulama başlamaz.
	db, err := config.Connect(cfg)
	if err != nil {
		log.Fatalf("❌ Veritabanı bağlantısı kurulamadı: %v", err)
	}
	// main() fonksiyonu bittiğinde (uygulama kapandığında) bağlantıyı kapat.
	// defer anahtar kelimesi, fonksiyon sonunda bu satırın çalışmasını garanti eder.
	defer db.Close()

	// ====================================
	// 3. Router Oluştur ve Handler'ları Kaydet
	// ====================================
	// Go 1.22+ ile gelen gelişmiş ServeMux, HTTP metodu eşleştirmesini destekler.
	// "GET /health" yazımı sayesinde sadece GET istekleri bu handler'a yönlendirilir.
	mux := http.NewServeMux()

	// Health Check — Sunucu ve veritabanı sağlık kontrolü
	mux.HandleFunc("GET /health", handlers.HealthCheck(db))

	// ====================================
	// 4. Sunucuyu Başlat
	// ====================================
	addr := ":" + cfg.ServerPort
	log.Printf("🚀 Anonim Oylama API sunucusu %s portunda başlatılıyor...", cfg.ServerPort)

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("❌ Sunucu başlatılamadı: %v", err)
	}
}
