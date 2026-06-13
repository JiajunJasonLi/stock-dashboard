import os
import requests
from dotenv import load_dotenv

from sqlalchemy import select, text

from app.database import SessionLocal
from app.models import Ticker, DailyStockPrice

from datetime import datetime

load_dotenv()

token = os.getenv("MARKETDATA_TOKEN")

if not token:
    raise RuntimeError("MARKETDATA_TOKEN is missing from .env")

# Retrieve the item in watchlist (has to get id to insert)
def get_all_tickers():
    db = SessionLocal()
    try:
        result = db.execute(select(Ticker))
        return result.scalars().all()
    finally:
        db.close()

def insert_stock_data(db, ticker_id, t, o, h, l, c, v):

    sql = text("""
        INSERT INTO daily_stock_prices (
            ticker_id, price_date, open, high, low, close, volume
        ) VALUES (
            :ticker_id, :price_date, :open, :high, :low, :close, :volume
        ) ON CONFLICT (ticker_id, price_date)
        DO UPDATE SET
            open = EXCLUDED.open,
            high = EXCLUDED.high,
            low = EXCLUDED.low,
            close = EXCLUDED.close,
            volume = EXCLUDED.volume
    """)

    db.execute(sql, {
        "ticker_id": ticker_id,
        "price_date": datetime.fromtimestamp(t).date(),
        "open": o,
        "high": h,
        "low": l,
        "close": c,
        "volume": v
    })



tickers = get_all_tickers()

headers = {
    "Accept": "application/json",
    "Authorization": f"Bearer {token}",
}

for ticker in tickers:
    ticker_id = ticker.id
    symbol = ticker.symbol

    start_date = '2026-01-01'

    # Retrieve the data from API and insert into database
    url = f"https://api.marketdata.app/v1/stocks/candles/D/{symbol}/?from={start_date}"

    response = requests.get(url, headers = headers, timeout = 10)

    if response.status_code not in [200, 203]:
        raise RuntimeError("MarketData API request failed")
    
    result = response.json()

    db = SessionLocal()


    # How to handle the actual date and upsert if date exists?
    try:
        for t, o, h, l, c, v in zip(
            result['t'],
            result['o'],
            result['h'],
            result['l'],
            result['c'],
            result['v'],
        ):
            insert_stock_data(db, ticker_id, t, o, h, l, c, v)

        db.commit()

    except Exception as e:
        db.rollback()
        raise 

    finally:
        db.close()
    print(f"data inserted successfully for {symbol}")


# url = f"https://api.marketdata.app/v1/stocks/candles/D/AAPL/?from=2026-01-01"

# response = requests.get(url, headers=headers, timeout = 10)

# print("Status code:", response.status_code)
# print(response.json())


