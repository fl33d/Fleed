CREATE TABLE IF NOT EXISTS portfolios (
  id TEXT PRIMARY KEY,
  portfolio_json TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
