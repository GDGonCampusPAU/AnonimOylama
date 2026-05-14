package repository

import (
	"context"
	"database/sql"
	"errors"
)

// VoteRepository, oylama ve güvenlikle alakalı veritabanı işlemlerini yönetir.
// Oylama işlemi, veri bütünlüğü ve anonimliği sağlamak için tek bir SQL Transaction'ı (atomik) içerisinde yürütülür.
type VoteRepository struct {
	db *sql.DB
}

func NewVoteRepository(db *sql.DB) *VoteRepository {
	return &VoteRepository{db: db}
}

// HasUserVoted, bir kullanıcının belirli bir seçimde daha önce oy kullanıp kullanmadığını kontrol eder.
func (r *VoteRepository) HasUserVoted(ctx context.Context, electionID, userID string) (bool, error) {
	var count int
	query := `SELECT COUNT(1) FROM election_voters WHERE election_id = $1 AND user_id = $2`
	err := r.db.QueryRowContext(ctx, query, electionID, userID).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// GetTotalVoters, belirli bir seçimde oy kullanan toplam kişi sayısını döndürür.
func (r *VoteRepository) GetTotalVoters(ctx context.Context, electionID string) (int, error) {
	var count int
	query := `SELECT COUNT(1) FROM election_voters WHERE election_id = $1`
	err := r.db.QueryRowContext(ctx, query, electionID).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

// RecordVote, bir oylama işlemini atomik bir veritabanı transaction'ı içerisinde gerçekleştirir.
// 1. Kullanıcının oy kullandığını kaydeder (kime oy verdiği kaydedilmez!).
// 2. İlgili adayın (Candidate) oy sayısını (vote_count) 1 artırır.
func (r *VoteRepository) RecordVote(ctx context.Context, electionID, userID, candidateID string) error {
	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		return err
	}
	defer tx.Rollback() // Hata durumunda işlemi geri al, başarılıysa Commit() ederken silinir.

	// 1. Adım: Kullanıcının oy kullandığını logla (election_voters tablosuna kayıt at).
	// Burada 'kime' oy verdiği (candidateID) KESİNLİKLE yazılmaz!
	// ID sütunu PostgreSQL tarafında gen_random_uuid() ile otomatik doldurulur.
	queryLogVote := `INSERT INTO election_voters (election_id, user_id, voted_at) VALUES ($1, $2, NOW())`
	_, err = tx.ExecContext(ctx, queryLogVote, electionID, userID)
	if err != nil {
		return err
	}

	// 2. Adım: Adayın oy sayısını güvenli bir şekilde artır.
	// Burada kullanıcının kimliği (userID) KESİNLİKLE kullanılmaz!
	queryUpdateCount := `UPDATE candidates SET vote_count = vote_count + 1 WHERE id = $1 AND election_id = $2`
	res, err := tx.ExecContext(ctx, queryUpdateCount, candidateID, electionID)
	if err != nil {
		return err
	}

	// Etkilenen satır yoksa aday bulunamamıştır.
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return errors.New("aday bulunamadı veya bu seçime ait değil")
	}

	// İşlem başarılıysa transaction'ı commit et.
	return tx.Commit()
}
