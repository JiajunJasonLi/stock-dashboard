from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from datetime import date

from app.database import get_db
from app.schemas import TickerItem, TickerPrice, TickerCreateRequest, TickerCreateResponse, FetchDailyRequest, FetchDailyResponse
from app.models import Ticker, DailyStockPrice

from app.repositories.ticker_repository import TickerRepository
from app.services.ticker_service import TickerService
from app.services.market_data_client import MarketDataClient

router = APIRouter(
    prefix="/tickers",
    tags=["ticker"]
)

@router.get("/", response_model=list[TickerItem])
def get_tickers(db: Session = Depends(get_db)):
    repo = TickerRepository(db)

    return repo.get_all()

@router.post("/", response_model=TickerCreateResponse)
def add_ticker(
    request: TickerCreateRequest,
    db: Session = Depends(get_db)
):
    symbol = request.symbol
    service = TickerService(db)

    try:
        ticker = service.add_ticker(symbol)
        db.commit()
        db.refresh(ticker)
        return ticker
    except Exception:
        db.rollback()
        raise
    

@router.post("/{symbol}/fetch-daily", response_model=FetchDailyResponse)
def add_ticker_daily_data(
    symbol: str,
    request: FetchDailyRequest,
    db: Session = Depends(get_db)
):
    service = TickerService(db)

    try:
        rows_imported = service.handle_daily_price_data(
            symbol=symbol,
            start_date=request.start_date,
            end_date=request.end_date,
        )

        db.commit()

        return FetchDailyResponse(
            symbol=symbol,
            start_date=request.start_date,
            end_date=request.end_date,
            rows_imported=rows_imported,
        )

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise

@router.get("/{symbol}/prices", response_model=list[TickerPrice])
def get_ticker_price(symbol: str, db: Session = Depends(get_db)):
    repo = TickerRepository(db)

    prices = repo.get_ticker_price(symbol)

    if not prices:
        raise HTTPException(status_code=404, detail=f"No data found for {symbol}")

    return prices