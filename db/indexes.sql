-- =====================================================================
-- IMF AutoML Database Indexes
-- =====================================================================
-- COMMENTED OUT examples. Add indexes AFTER testing queries.
-- Naming: idx_{table}_{columns}
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- APIs: auth/login.py
-- Query: SELECT * FROM users WHERE email = ?
-- CREATE INDEX idx_users_email ON users (email);

-- APIs: datasets/read_datasets.py
-- Query: SELECT * FROM datasets WHERE user_id = ? ORDER BY created_at DESC
-- CREATE INDEX idx_datasets_user_created ON datasets (user_id, created_at DESC);

-- APIs: experiments/read_experiments.py
-- Query: SELECT * FROM experiments WHERE dataset_id = ? AND status = ?
-- CREATE INDEX idx_experiments_dataset_status ON experiments (dataset_id, status);
