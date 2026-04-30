# Anonim Oylama Sistemi - Veritabanı Şeması ve Varlık (Entity) Yapısı

Bu doküman, sistemin veritabanı varlıklarını, aralarındaki ilişkileri ve uygulamanın temel iş mantığını (Business Logic) tanımlar. **Yapay Zeka Ajanları İçin Not:** Bu projede "Kapalı Uçlu Anonim Sistem" modeli kullanılmaktadır. Kullanıcıların kimlikleri doğrulanır ancak oyların kime verildiği veritabanı seviyesinde anonim tutulur.

## Varlıklar (Entities)

### 1. Users (Kullanıcılar)
Sisteme kayıt olan ve admin tarafından onaylanan kullanıcıları tutar. Sadece onaylı kullanıcılar oy kullanabilir.
* `Id` (PK, UUID): Benzersiz kullanıcı kimliği.
* `email` (String, Unique): Kullanıcının e-posta adresi.
* `password` (String): Hashlenmiş şifre.
* `name` (String): Kullanıcı adı.
* `surname` (String): Kullanıcı soyadı.
* `isApproved` (Boolean): Admin onay durumu. Varsayılan: `false`.

### 2. Roles (Roller)
Sistemdeki yetki seviyelerini tanımlar.
* `Id` (PK, UUID / Int): Benzersiz rol kimliği.
* `name` (String): Rol adı (Örn: `Admin`, `User`).

### 3. UserRoles (Kullanıcı-Rol İlişkisi)
Kullanıcıların sahip olduğu rolleri tutan ara (Join) tablodur.
* `userId` (FK, UUID): `Users` tablosuna referans.
* `roleId` (FK, UUID / Int): `Roles` tablosuna referans.

### 4. Elections (Seçimler / Odalar)
Oluşturulan anket ve seçim odalarını temsil eder.
* `Id` (PK, UUID): Benzersiz seçim kimliği.
* `creatorId` (FK, UUID): Odayı oluşturan kullanıcının (`Users`) kimliği.
* `title` (String): Oylamanın başlığı (Örn: "2026 Yönetim Kurulu Seçimi").
* `description` (Text): Oylamanın kuralları veya detaylı açıklaması.
* `inviteCode` (String, Unique): E-posta ile gönderilecek, odaya katılım için kullanılacak benzersiz kod/link parametresi.
* `createdAt` (DateTime): Oluşturulma zamanı.
* `expiresAt` (DateTime, Nullable): Oylamanın otomatik kapanacağı zaman.
* `status` (String / Enum): Seçimin anlık durumu (`Active`, `Completed`, `Draft`).

### 5. Candidates (Adaylar)
Bir seçimdeki (odadaki) adayları ve aldıkları toplam oy sayısını tutar.
* `Id` (PK, UUID): Benzersiz aday kimliği.
* `electionId` (FK, UUID): `Elections` tablosuna referans.
* `userId` (FK, UUID, Nullable): Eğer aday sistemde kayıtlı bir kullanıcıysa kimliği tutulur. Dışarıdan ismen aday eklendiyse `null` bırakılır.
* `name` (String): Adayın ekranda görünecek adı.
* `voteCount` (Int): Adayın aldığı toplam oy sayısı. Varsayılan: `0`.

### 6. ElectionVoters (Oy Kullananlar - Güvenlik Duvarı)
Hangi kullanıcının hangi seçimde oy kullandığını denetler. **Mükerrer oylamayı engellemek için kullanılır.**
* `Id` (PK, UUID): Benzersiz kayıt kimliği.
* `electionId` (FK, UUID): `Elections` tablosuna referans.
* `userId` (FK, UUID): Oy kullanan kullanıcının (`Users`) kimliği.
* `votedAt` (DateTime): Oy kullanma zamanı.

---

## 🔒 Kritik İş Mantığı (Business Logic) - AI Ajanları İçin Talimatlar

1. **Anonimlik Kuralı (Strict Anonymity):** Bir kullanıcı oy kullandığında, `ElectionVoters` tablosuna kullanıcının o seçimde oy kullandığına dair bir kayıt atılır. **Ancak**, kullanıcının kime oy verdiği ASLA kaydedilmez. Oy verme işlemi sadece ilgili adayın `Candidates` tablosundaki `voteCount` değerini `+1` artırır. Oyların şahıslarla eşleştirilebileceği hiçbir log veya tablo ilişkisi kurulmamalıdır.
2. **Davet ve Katılım Akışı:** `Elections` oluşturulduğunda, odayı kuran kişi belirli kullanıcıları seçer. Sistem arka planda (Asynchronous / Goroutine ile) bu kişilere `inviteCode` ve `description` bilgilerini içeren bir SMTP e-postası gönderir.
3. **Mükerrer Oy Kontrolü:** Oylama API uç noktası (Endpoint) çalıştırılmadan önce, isteği atan `userId`'nin ilgili `electionId` için `ElectionVoters` tablosunda kaydı olup olmadığı kontrol edilmelidir. Kayıt varsa işlem reddedilmelidir (Örn: HTTP 403 Forbidden).