// Package response, API uç noktaları için standart JSON yanıt yapısını sağlar.
// api-specs.md dokümanındaki format:
//
//	{"success": true/false, "data": ..., "message": "..."}
//
// Bu paket tüm handler'lar tarafından kullanılarak API yanıtlarının
// tutarlılığını garanti eder.
package response

import (
	"encoding/json"
	"net/http"
)

// APIResponse, tüm API uç noktalarının döneceği standart JSON yapısıdır.
// api-specs.md dokümanında tanımlanan formata birebir uyar.
type APIResponse struct {
	Success bool        `json:"success"`          // İşlem başarılı mı?
	Data    interface{} `json:"data"`             // Yanıt verisi (başarılıysa dolu, hatalıysa null)
	Message string      `json:"message"`          // Kullanıcıya gösterilecek mesaj
}

// Success, başarılı bir API yanıtı döner.
// statusCode: HTTP durum kodu (200, 201 vb.)
// data: Yanıtta döndürülecek veri
// message: Başarı mesajı
func Success(w http.ResponseWriter, statusCode int, data interface{}, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	resp := APIResponse{
		Success: true,
		Data:    data,
		Message: message,
	}

	// JSON encode hatası olursa logla (production'da bu çok nadir olur)
	json.NewEncoder(w).Encode(resp)
}

// Error, hatalı bir API yanıtı döner.
// statusCode: HTTP hata kodu (400, 401, 403, 500 vb.)
// message: Hata açıklaması
func Error(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	resp := APIResponse{
		Success: false,
		Data:    nil,
		Message: message,
	}

	json.NewEncoder(w).Encode(resp)
}
