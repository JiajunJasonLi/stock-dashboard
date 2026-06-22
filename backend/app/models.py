from sqlalchemy import BigInteger, Date, DateTime, ForeignKey, Index, Integer, Numeric, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class TimestampMixin:
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class Ticker(TimestampMixin, Base):
    __tablename__ = "tickers"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    symbol: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    company_name: Mapped[str | None] = mapped_column(Text)
    exchange: Mapped[str | None] = mapped_column(Text)
    currency: Mapped[str | None] = mapped_column(Text)

    daily_prices: Mapped[list["DailyStockPrice"]] = relationship(back_populates="ticker")
    # watchlist_item: Mapped["WatchlistItem | None"] = relationship(back_populates="ticker", uselist=False)


class DailyStockPrice(TimestampMixin, Base):
    __tablename__ = "daily_stock_prices"
    __table_args__ = (
        UniqueConstraint("ticker_id", "price_date", name="uq_daily_stock_prices_ticker_date"),
        Index("ix_daily_stock_prices_ticker_id", "ticker_id"),
        Index("ix_daily_stock_prices_price_date", "price_date"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # TODO: Confirm whether deleting a ticker should cascade-delete historical prices.
    ticker_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tickers.id"), nullable=False)
    price_date: Mapped[Date] = mapped_column(Date, nullable=False)
    open: Mapped[Numeric] = mapped_column(Numeric, nullable=False)
    high: Mapped[Numeric] = mapped_column(Numeric, nullable=False)
    low: Mapped[Numeric] = mapped_column(Numeric, nullable=False)
    close: Mapped[Numeric] = mapped_column(Numeric, nullable=False)
    volume: Mapped[int] = mapped_column(BigInteger, nullable=False)

    ticker: Mapped[Ticker] = relationship(back_populates="daily_prices")

class ApiFetchLog(Base):
    __tablename__ = "api_fetch_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    provider: Mapped[str] = mapped_column(Text, nullable=False)
    symbol: Mapped[str] = mapped_column(Text, nullable=False)
    endpoint: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(Text, nullable=False)
    http_status_code: Mapped[int | None] = mapped_column(Integer)
    records_requested: Mapped[int | None] = mapped_column(Integer)
    records_inserted: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    records_updated: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    error_message: Mapped[str | None] = mapped_column(Text)
    started_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False)
    finished_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True))
