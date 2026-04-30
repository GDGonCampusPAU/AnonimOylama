-- ====================================
-- Anonim Oylama Sistemi - İlk Migration
-- database-schema.md dokümanına birebir uygun.
-- ====================================
-- Bu migration, sistemin ihtiyaç duyduğu tüm tabloları oluşturur.
-- UUID üretimi için pgcrypto eklentisi kullanılır.

-- UUID üretimi için gerekli PostgreSQL eklentisi
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================
-- 1. Users (Kullanıcılar)
-- ====================================
-- Sisteme kayıt olan ve admin tarafından onaylanan kullanıcıları tutar.
-- Sadece isApproved = true olan kullanıcılar sisteme giriş yapabilir.
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ====================================
-- 2. Roles (Roller)
-- ====================================
-- Sistemdeki yetki seviyelerini tanımlar: Admin, User
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Varsayılan rolleri ekle
INSERT INTO roles (name) VALUES ('Admin'), ('User')
ON CONFLICT (name) DO NOTHING;

-- ====================================
-- 3. UserRoles (Kullanıcı-Rol İlişkisi)
-- ====================================
-- Kullanıcıların sahip olduğu rolleri tutan ara (Join/Bridge) tablodur.
-- Bir kullanıcı birden fazla role sahip olabilir.
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ====================================
-- 4. Elections (Seçimler / Odalar)
-- ====================================
-- Oluşturulan anket ve seçim odalarını temsil eder.
-- status alanı: 'Draft', 'Active', 'Completed' değerlerini alabilir.
CREATE TABLE IF NOT EXISTS elections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    invite_code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'Active'
        CHECK (status IN ('Draft', 'Active', 'Completed'))
);

-- Davet kodu ile hızlı arama için index
CREATE INDEX IF NOT EXISTS idx_elections_invite_code ON elections(invite_code);

-- ====================================
-- 5. Candidates (Adaylar)
-- ====================================
-- Bir seçimdeki adayları ve aldıkları toplam oy sayısını tutar.
-- user_id nullable: Dışarıdan ismen eklenen adaylar için null bırakılır.
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    vote_count INTEGER NOT NULL DEFAULT 0
);

-- Bir seçimdeki adayları hızlıca listelemek için index
CREATE INDEX IF NOT EXISTS idx_candidates_election_id ON candidates(election_id);

-- ====================================
-- 6. ElectionVoters (Oy Kullananlar - Güvenlik Duvarı)
-- ====================================
-- Hangi kullanıcının hangi seçimde oy kullandığını denetler.
-- MÜKERRER OYLAMAYI ENGELLEMEK için kullanılır.
--
-- KRİTİK NOT: Bu tablo SADECE kullanıcının oy kullanıp kullanmadığını tutar.
-- Kullanıcının KİME oy verdiği bilgisi ASLA kaydedilmez!
-- Bu, sistemin anonimlik garantisinin temel taşıdır.
CREATE TABLE IF NOT EXISTS election_voters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    voted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    -- Aynı kullanıcı aynı seçimde ikinci kez oy kullanamaz
    UNIQUE (election_id, user_id)
);
