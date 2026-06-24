import unittest

from sqlalchemy import BigInteger, Date, DateTime, ForeignKey, Integer, Numeric, Text

from app.database import Base
from app.models import ApiFetchLog, DailyStockPrice, Ticker, WatchlistItem


class SchemaModelTest(unittest.TestCase):
    def test_phase_1_tables_are_registered(self):
        self.assertEqual(
            {"tickers", "daily_stock_prices", "watchlist_items", "api_fetch_logs"},
            set(Base.metadata.tables),
        )

    def test_tickers_schema_matches_design(self):
        table = Ticker.__table__

        self.assertIsInstance(table.c.id.type, BigInteger)
        self.assertTrue(table.c.id.primary_key)
        self.assertIsInstance(table.c.symbol.type, Text)
        self.assertFalse(table.c.symbol.nullable)
        self.assertTrue(table.c.symbol.unique)
        self.assertIsInstance(table.c.company_name.type, Text)
        self.assertTrue(table.c.company_name.nullable)
        self.assertIsInstance(table.c.exchange.type, Text)
        self.assertIsInstance(table.c.currency.type, Text)
        self.assertIsInstance(table.c.created_at.type, DateTime)
        self.assertIsInstance(table.c.updated_at.type, DateTime)

    def test_daily_stock_prices_schema_matches_design(self):
        table = DailyStockPrice.__table__
        unique_columns = {
            tuple(column.name for column in constraint.columns)
            for constraint in table.constraints
            if constraint.name == "uq_daily_stock_prices_ticker_date"
        }
        index_columns = {
            index.name: tuple(column.name for column in index.columns)
            for index in table.indexes
        }

        self.assertIsInstance(table.c.ticker_id.type, BigInteger)
        self.assertIsInstance(next(iter(table.c.ticker_id.foreign_keys)), ForeignKey)
        self.assertIsInstance(table.c.price_date.type, Date)
        self.assertIsInstance(table.c.open.type, Numeric)
        self.assertIsInstance(table.c.high.type, Numeric)
        self.assertIsInstance(table.c.low.type, Numeric)
        self.assertIsInstance(table.c.close.type, Numeric)
        self.assertIsInstance(table.c.volume.type, BigInteger)
        self.assertIn(("ticker_id", "price_date"), unique_columns)
        self.assertEqual(("ticker_id",), index_columns["ix_daily_stock_prices_ticker_id"])
        self.assertEqual(("price_date",), index_columns["ix_daily_stock_prices_price_date"])

    def test_watchlist_items_schema_matches_design(self):
        table = WatchlistItem.__table__
        unique_columns = {
            tuple(column.name for column in constraint.columns)
            for constraint in table.constraints
            if constraint.name == "uq_watchlist_items_ticker_id"
        }

        self.assertIsInstance(table.c.ticker_id.type, BigInteger)
        self.assertIsInstance(next(iter(table.c.ticker_id.foreign_keys)), ForeignKey)
        self.assertIsInstance(table.c.created_at.type, DateTime)
        self.assertIn(("ticker_id",), unique_columns)

    def test_api_fetch_logs_schema_matches_design(self):
        table = ApiFetchLog.__table__

        self.assertIsInstance(table.c.provider.type, Text)
        self.assertFalse(table.c.provider.nullable)
        self.assertIsInstance(table.c.symbol.type, Text)
        self.assertFalse(table.c.symbol.nullable)
        self.assertIsInstance(table.c.endpoint.type, Text)
        self.assertTrue(table.c.endpoint.nullable)
        self.assertIsInstance(table.c.status.type, Text)
        self.assertFalse(table.c.status.nullable)
        self.assertIsInstance(table.c.http_status_code.type, Integer)
        self.assertTrue(table.c.http_status_code.nullable)
        self.assertIsInstance(table.c.records_requested.type, Integer)
        self.assertTrue(table.c.records_requested.nullable)
        self.assertIsInstance(table.c.records_inserted.type, Integer)
        self.assertFalse(table.c.records_inserted.nullable)
        self.assertEqual("0", str(table.c.records_inserted.server_default.arg))
        self.assertIsInstance(table.c.records_updated.type, Integer)
        self.assertFalse(table.c.records_updated.nullable)
        self.assertEqual("0", str(table.c.records_updated.server_default.arg))
        self.assertIsInstance(table.c.error_message.type, Text)
        self.assertTrue(table.c.error_message.nullable)
        self.assertIsInstance(table.c.started_at.type, DateTime)
        self.assertFalse(table.c.started_at.nullable)
        self.assertIsInstance(table.c.finished_at.type, DateTime)
        self.assertTrue(table.c.finished_at.nullable)


if __name__ == "__main__":
    unittest.main()
