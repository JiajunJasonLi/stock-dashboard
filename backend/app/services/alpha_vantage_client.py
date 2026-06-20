import os
import requests

from app.core.config import settings

class AlphaVantageClient:
    def __init__(self):
        self.base_url = settings.ALPHAVANTAGE_BASE_URL
        self.token = settings.ALPHAVANTAGE_TOKEN

    def get_company_name(symbol: str) -> str:
        url = f"{self.base_url}/query?function=OVERVIEW&symbol={symbol}&apikey={self.token}"
    
        r = requests.get(url)
        
        return r.json()['Name']

