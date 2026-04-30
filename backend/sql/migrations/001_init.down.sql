-- ====================================
-- Anonim Oylama Sistemi - İlk Migration (Geri Alma / Rollback)
-- ====================================
-- Bu dosya, 001_init.up.sql ile oluşturulan tabloları siler.
-- Silme sırası, foreign key bağımlılıklarına göre belirlenir:
-- Önce bağımlı tablolar, en son bağımsız tablolar silinir.

DROP TABLE IF EXISTS election_voters;
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS elections;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

DROP EXTENSION IF EXISTS "pgcrypto";
