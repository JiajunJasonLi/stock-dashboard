CREATE TABLE IF NOT EXISTS tickers (
    id BIGSERIAL PRIMARY KEY,
    symbol TEXT NOT NULL UNIQUE,
    company_name TEXT,
    exchange TEXT,
    currency TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_stock_prices (
    id BIGSERIAL PRIMARY KEY,
    ticker_id BIGINT NOT NULL REFERENCES tickers (id),
    price_date DATE NOT NULL,
    open NUMERIC NOT NULL,
    high NUMERIC NOT NULL,
    low NUMERIC NOT NULL,
    close NUMERIC NOT NULL,
    volume BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_daily_stock_prices_ticker_date UNIQUE (ticker_id, price_date)
);

CREATE TABLE IF NOT EXISTS watchlist_items (
    id BIGSERIAL PRIMARY KEY,
    ticker_id BIGINT NOT NULL REFERENCES tickers (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_watchlist_items_ticker_id UNIQUE (ticker_id)
);

CREATE TABLE IF NOT EXISTS api_fetch_logs (
    id BIGSERIAL PRIMARY KEY,
    provider TEXT NOT NULL,
    symbol TEXT NOT NULL,
    endpoint TEXT,
    status TEXT NOT NULL,
    http_status_code INTEGER,
    records_requested INTEGER,
    records_inserted INTEGER NOT NULL DEFAULT 0,
    records_updated INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_tickers_symbol ON tickers (symbol);
CREATE INDEX IF NOT EXISTS ix_daily_stock_prices_ticker_id ON daily_stock_prices (ticker_id);
CREATE INDEX IF NOT EXISTS ix_daily_stock_prices_price_date ON daily_stock_prices (price_date);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_tickers_updated_at ON tickers;
CREATE TRIGGER set_tickers_updated_at
BEFORE UPDATE ON tickers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_daily_stock_prices_updated_at ON daily_stock_prices;
CREATE TRIGGER set_daily_stock_prices_updated_at
BEFORE UPDATE ON daily_stock_prices
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
