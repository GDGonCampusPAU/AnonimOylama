// Package mailer, SMTP üzerinden e-posta gönderme işlemlerini yönetir.
// Paket olarak github.com/wneessen/go-mail kullanılmaktadır.
package mailer

import (
	"fmt"
	"log"
	"time"

	"github.com/GDGonCampusPAU/AnonimOylama/backend/internal/config"
	"github.com/wneessen/go-mail"
)

// Mailer, SMTP bağlantı bilgilerini ve e-posta gönderme yeteneğini kapsüller.
type Mailer struct {
	host     string
	port     int
	username string
	password string
	from     string
}

// New, config'den SMTP ayarlarını okuyarak yeni bir Mailer oluşturur.
func New(cfg *config.Config) *Mailer {
	port := 587
	if cfg.SMTPPort == "465" {
		port = 465
	} else if cfg.SMTPPort == "25" {
		port = 25
	}

	return &Mailer{
		host:     cfg.SMTPHost,
		port:     port,
		username: cfg.SMTPUser,
		password: cfg.SMTPPassword,
		from:     cfg.SMTPFrom,
	}
}

// SendInvitation, tek bir alıcıya davet e-postası gönderir.
// Retry mekanizması: maksimum 3 deneme, exponential backoff (1s → 2s → 4s).
// Tüm denemeler başarısız olursa hata döner; caller bu hatayı loglayabilir.
func (m *Mailer) SendInvitation(to, electionTitle, inviteCode, description string) error {
	// go-mail ile Message (e-posta nesnesi) oluştur
	msg := mail.NewMsg()
	if err := msg.From(m.from); err != nil {
		return fmt.Errorf("gönderici adresi ayarlanamadı: %w", err)
	}
	if err := msg.To(to); err != nil {
		return fmt.Errorf("alıcı adresi ayarlanamadı: %w", err)
	}

	msg.Subject(fmt.Sprintf("[Anonim Oylama] %s — Davetiyeniz", electionTitle))

	body := fmt.Sprintf(
		"Merhaba,\n\n"+
			"\"%s\" seçimine davet edildiniz.\n\n"+
			"Açıklama: %s\n\n"+
			"Odaya katılmak için aşağıdaki davet kodunu kullanın:\n"+
			"Davet Kodu: %s\n\n"+
			"İyi oylamalar!\n"+
			"— Anonim Oylama Sistemi",
		electionTitle, description, inviteCode,
	)
	msg.SetBodyString(mail.TypeTextPlain, body)

	// go-mail Client oluştur.
	// TLSPolicy: TLSOpportunistic → sunucu STARTTLS destekliyorsa TLS kullanır.
	client, err := mail.NewClient(
		m.host,
		mail.WithPort(m.port),
		mail.WithSMTPAuth(mail.SMTPAuthPlain),
		mail.WithUsername(m.username),
		mail.WithPassword(m.password),
		mail.WithTLSPolicy(mail.TLSOpportunistic),
	)
	if err != nil {
		return fmt.Errorf("SMTP client oluşturulamadı: %w", err)
	}

	// Exponential backoff ile retry: 3 deneme, 1s → 2s → 4s bekleme
	const maxAttempts = 3
	backoff := time.Second
	var lastErr error

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		if lastErr = client.DialAndSend(msg); lastErr == nil {
			return nil // Başarılı
		}
		log.Printf("⚠️  E-posta gönderimi başarısız (deneme %d/%d) → %s: %v",
			attempt, maxAttempts, to, lastErr)
		if attempt < maxAttempts {
			time.Sleep(backoff)
			backoff *= 2 // Exponential backoff: 1s, 2s, 4s
		}
	}

	return fmt.Errorf("e-posta %d denemeden sonra gönderilemedi → %s: %w", maxAttempts, to, lastErr)
}

// SendBulkInvitations, birden fazla alıcıya davet e-postasını arka planda gönderir.
// Her alıcı için ayrı bir Goroutine başlatılır.
// Bu fonksiyon çağrıyı BLOKLAMAZ; ana akış hemen devam eder.
// Gönderim hataları log'a yazılır, kullanıcıya yansıtılmaz.
func (m *Mailer) SendBulkInvitations(emails []string, electionTitle, inviteCode, description string) {
	// Her e-posta için bağımsız bir goroutine başlat.
	// Goroutine: Go'da hafif bir eşzamanlı (concurrent) iş parçacığıdır.
	// 'go' anahtar kelimesi ile çağrılan fonksiyon arka planda çalışır.
	for _, email := range emails {
		// Goroutine'e doğru e-posta değerini geçirmek için yerel kopya oluşturulur.
		// Döngü değişkeni 'email' goroutine tamamlanmadan değişebileceğinden
		// bu kopya kritik önem taşır.
		recipientEmail := email
		go func() {
			if err := m.SendInvitation(recipientEmail, electionTitle, inviteCode, description); err != nil {
				log.Printf("❌ Davet e-postası gönderilemedi → %s: %v", recipientEmail, err)
			} else {
				log.Printf("✅ Davet e-postası gönderildi → %s", recipientEmail)
			}
		}()
	}
}
