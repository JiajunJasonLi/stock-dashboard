from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db
from app.schemas import TickerPrice
from app.models import Ticker, DailyStockPrice

router = APIRouter(
    prefix="/tickers",
    tags=["ticker"]
)

@router.get("/{symbol}/prices", response_model=list[TickerPrice])
def get_ticker_price(symbol: str, db: Session = Depends(get_db)):
    prices = (
        db.query(DailyStockPrice)
            .join(DailyStockPrice.ticker)
            .filter(Ticker.symbol == symbol)
            .order_by(DailyStockPrice.price_date)
            .all()
    )

    if not prices:
        raise HTTPException(status_code=404, detail=f"No data found for {symbol}")

    return prices