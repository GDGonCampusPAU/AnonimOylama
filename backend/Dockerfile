FROM golang:alpine AS builder

WORKDIR /app

# Go mod dosyalarını kopyala ve bağımlılıkları indir
COPY go.mod go.sum ./
RUN go mod download

# Kaynak kodları kopyala
COPY . .

# Uygulamayı derle (CGO_ENABLED=0 statik binary için)
RUN CGO_ENABLED=0 GOOS=linux go build -o /anonim-oylama-api ./cmd/api

# Çalıştırma aşaması (Çok daha hafif olan alpine imajını kullanıyoruz)
FROM alpine:latest

WORKDIR /app

# Derlenen binary'yi kopyala
COPY --from=builder /anonim-oylama-api /app/api

EXPOSE 8080

# Uygulamayı başlat
CMD ["/app/api"]
