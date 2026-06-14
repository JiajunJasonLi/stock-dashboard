from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db
from app.schemas import WatchlistItem

router = APIRouter(
    prefix="/watchlist",
    tags=["watchlist"]
)

@router.get("/", response_model=list[WatchlistItem])
def get_watchlist(db: Session = Depends(get_db)):
    result = db.execute(
        text("""
            SELECT id, symbol, company_name
            FROM watchlist
            ORDER BY id
        """)
    )

    return result.mappings().all()