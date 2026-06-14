from datetime import date
from pydantic import BaseModel

class WatchlistItem(BaseModel):
    id: int
    symbol: str
    company_name: str

class TickerPrice(BaseModel):
    price_date: date
    open: float
    high: float
    low: float
    close: float
    volume: int