package middleware

import "net/http"

// CORS, frontend uygulamalarının (örneğin React, Vue) farklı bir porttan (örneğin 3000)
// API'ye güvenli bir şekilde erişmesini sağlayan middleware'dir.
func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Basit bir CORS konfigürasyonu, her yerden isteğe izin verir.
		// İsterseniz .env'den okuyup sınırlandırabilirsiniz.
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Preflight isteği gelirse hemen 200 OK dön ve asıl handler'a geçme
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
