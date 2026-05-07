-- ====================================
-- Anonim Oylama Sistemi - Migration 002
-- election_invitees: Seçim davet listesi (whitelist)
-- ====================================
-- Bu tablo, bir seçime hangi e-postaların davet edildiğini tutar.
-- GET /api/v1/elections/join/{inviteCode} endpoint'inde erişim kontrolü için kullanılır.
-- Sadece bu tabloda kaydı bulunan e-posta adresleri odaya girebilir.

CREATE TABLE IF NOT EXISTS election_invitees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    -- Aynı e-posta adresi aynı seçime birden fazla kez eklenemez
    UNIQUE (election_id, email)
);

-- election_id + email üzerinde bileşik index (whitelist sorgusu için performans)
CREATE INDEX IF NOT EXISTS idx_election_invitees_election_email
    ON election_invitees(election_id, email);
