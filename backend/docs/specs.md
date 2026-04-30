# Ürün Spesifikasyonu ve İş Mantığı (Product Specification - spec.md)

## 📌 1. Projenin Amacı ve Niyeti (Project Intent)
Bu proje, kurumsal veya topluluk içi oylamaların (Örn: Yönetim kurulu seçimleri, üniversite kulüp oylamaları) tamamen **güvenli, manipülasyondan uzak ve anonim** bir şekilde yapılmasını sağlayan bir "Kapalı Uçlu (Closed-Loop) Seçim Sistemi" backend'idir.

Sistem, internetteki rastgele kişilere açık, basit bir anket aracı **DEĞİLDİR**. Yüksek güvenlikli ve kuralları katı bir oylama altyapısıdır.

## 👤 2. Kullanıcı Rolleri (User Roles)
*   **Admin:** Sistemi yönetir, dışarıdan kayıt olmak isteyen kullanıcıların üyeliklerini onaylar (`isApproved: true`). Sadece onaylı kullanıcılar sisteme girebilir.
*   **User (Kayıtlı Kullanıcı):** Sisteme giriş yapabilen, kendi seçim odalarını (Elections) oluşturabilen ve davet edildiği odalara girip oy kullanabilen kişidir.

## ⚙️ 3. Temel Özellikler (Core Features)

### A. Oda Oluşturma ve Davet Sistemi
*   Bir kullanıcı oylama odası (Election) oluşturduğunda, bu odaya sadece kimlerin katılabileceğini e-posta listesi (Whitelist) olarak belirler.
*   Sistem, seçilen kişilere arka planda (Asynchronous) odaya katılım için benzersiz bir davet linki/kodu (`inviteCode`) barındıran bir e-posta gönderir.

### B. Güvenli Oylama (Mükerrer Oy Koruması)
*   Odaya sadece odayı kuran kişinin davet ettiği (`inviteCode`'a sahip olan) ve sisteme giriş yapmış (Token'ı olan) kullanıcılar girebilir.
*   Her kullanıcının **sadece bir (1)** oy hakkı vardır. Sistem bunu `ElectionVoters` tablosuna kayıt atarak denetler.

### C. Mutlak Anonimlik (Strict Anonymity)
*   Sistemin en kritik kuralı: **Sistem kimin oy kullandığını bilir, ancak KİME oy verdiğini ASLA bilmez.**
*   Oy verme işlemi sadece adayın (`Candidates`) toplam oy sayısını (`voteCount`) +1 artırır. Oyların şahıslara bağlanabileceği hiçbir ilişki veya log tutulmaz.

### D. Sonuçların Gizliliği
*   Oylama devam ederken (`status: Active`) sonuçlar hiç kimse (Odayı kuran dahil) tarafından görülemez. API, oylama bitene kadar sonuçları gizler.
*   Oylama süresi dolduğunda veya manuel kapatıldığında (`status: Completed`), API sonuçları erişime açar.

## 🤖 AI Ajanı İçin Not
Bu dosya, projenin "Neden" inşa edildiğini açıklar. API uç noktalarını (`api-specs.md`) ve veritabanını (`database-schema.md`) kodlarken her zaman bu dosyadaki güvenlik ve gizlilik niyetlerini gözeterek kod üretmelisin. Güvenlikten asla taviz verme.