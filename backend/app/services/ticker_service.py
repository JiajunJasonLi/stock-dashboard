from fastapi import HTTPException

from sqlalchemy.orm import Session

from datetime import date

from app.repositories.ticker_repository import TickerRepository
from app.services.market_data_client import MarketDataClient
from app.services.alpha_vantage_client import AlphaVantageClient

class TickerService:
    def __init__(self, db: Session):
        self.db = db

        self.ticker_repository = TickerRepository(db)

        self.market_data_client = MarketDataClient()
        self.alpha_vantage_client = AlphaVantageClient()

    def add_ticker(self, symbol: str):
        # Check if the symbol exists
        result = self.ticker_repository.get_by_symbol(symbol)

        if result:
            raise HTTPException(status_code=409, detail="Ticker already exists")
        
        # If not, fetch the company name from API
        ticker_name = self.alpha_vantage_client.get_company_name(symbol)

        if not ticker_name:
            raise HTTPException(status_code=404, detail="Ticker not found") 

        # Add the result in database
        return self.ticker_repository.add_ticker(symbol, ticker_name)

    def handle_daily_price_data(self, symbol: str, start_date: date, end_date: date):
        # Fetch the data from api
        rows = self.market_data_client.get_daily_prices(symbol, start_date, end_date)

        # Get the ticker based on the symbol
        ticker = self.ticker_repository.get_by_symbol(symbol)
        # Upsert data
        rows_imported = self.ticker_repository.upsert_daily_prices(ticker.id, rows)
        
        return rows_imported
