from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.models import Ticker, DailyStockPrice

class TickerRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Ticker]:
        return (self.db.query(Ticker).order_by(Ticker.id).all())

    def get_ticker_price(self, symbol: str) -> list[DailyStockPrice]:
        return (
            self.db.query(DailyStockPrice)
                .join(DailyStockPrice.ticker)
                .filter(Ticker.symbol == symbol)
                .order_by(DailyStockPrice.price_date)
                .all()
        )

    def add_ticker(self, symbol: str, name: str) -> Ticker:
        new_ticker = Ticker(symbol = symbol, company_name = name)

        self.db.add(new_ticker)
        self.db.flush()

        return new_ticker

    def get_by_symbol(self, symbol: str) -> Ticker | None:
        return (self.db.query(Ticker)
            .filter(Ticker.symbol == symbol)
            .first())

    def upsert_daily_prices(self, id: int, rows: list[DailyStockPrice]) -> int:
        if not rows:
            return 0

        values = [
            {
                "ticker_id": id,
                "price_date": row.price_date,
                "open": row.open,
                "high": row.high,
                "low": row.low,
                "close": row.close,
                "volume": row.volume
            } for row in rows
        ] 

        stmt = insert(DailyStockPrice).values(values)

        stmt = stmt.on_conflict_do_update(
            index_elements=["ticker_id", "price_date"],
            set_={
                "open": stmt.excluded.open,
                "high": stmt.excluded.high,
                "low": stmt.excluded.low,
                "close": stmt.excluded.close,
                "volume": stmt.excluded.volume,
            }
        )

        self.db.execute(stmt)

        return len(rows)
