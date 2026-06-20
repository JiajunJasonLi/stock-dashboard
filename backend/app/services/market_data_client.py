import os
import requests
from dotenv import load_dotenv

from app.core.config import settings

from datetime import datetime, date
from app.models import DailyStockPrice

class MarketDataClient:
    def __init__(self):
        self.base_url = settings.MARKETDATA_BASE_URL
        self.headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {settings.MARKETDATA_TOKEN}",
        }

    def get_daily_prices(self, symbol: str, start_date: date, end_date: date | None = None) -> list[DailyStockPrice]:
        if end_date:
            url = f"{self.base_url}/v1/stocks/candles/D/{symbol}/?from={start_date}&to={end_date}"
        else:
            url = f"{self.base_url}/v1/stocks/candles/D/{symbol}/?from={start_date}"

        response = requests.get(url, headers = headers, timeout = 10)

        if response.status_code not in [200, 203]:
            raise RuntimeError("MarketData API request failed")

        result = response.json()

        rows = []

        for t, o, h, l, c, v in zip(
            result['t'],
            result['o'],
            result['h'],
            result['l'],
            result['c'],
            result['v'],
        ):
            rows.append(DailyStockPrice(
                price_date=datetime.fromtimestamp(t).date(),
                open=o,
                high=h,
                low=l,
                close=c,
                volume=v
            ))
        return rows