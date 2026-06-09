from pydantic import BaseModel

class WatchlistItem(BaseModel):
    id: int
    symbol: str
    company_name: str