# app/core/config.py

import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MARKETDATA_TOKEN: str = os.getenv("MARKETDATA_TOKEN", "")
    MARKETDATA_BASE_URL: str = "https://api.marketdata.app"

    ALPHAVANTAGE_TOKEN: str = os.getenv("ALPHA_VANTAGE_TOKEN", "")
    ALPHAVANTAGE_BASE_URL: str = "https://www.alphavantage.co"


settings = Settings()

if not settings.MARKETDATA_TOKEN:
    raise RuntimeError("MARKETDATA_TOKEN is missing")

if not settings.ALPHAVANTAGE_TOKEN:
    raise RuntimeError("ALPHA_VANTAGE_TOKEN is missing")