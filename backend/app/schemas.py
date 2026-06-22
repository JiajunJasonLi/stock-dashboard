from datetime import date
from pydantic import BaseModel, model_validator

class TickerCreateRequest(BaseModel):
    symbol: str

class TickerCreateResponse(BaseModel):
    symbol: str
    company_name: str

class TickerItem(BaseModel):
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

class FetchDailyRequest(BaseModel):
    start_date: date | None = None
    end_date: date | None = None

    @model_validator(mode="after")
    def validate_date_range(self):
        # If both dates exist, ensure start <= end
        if self.start_date and self.end_date:
            if self.start_date > self.end_date:
                raise ValueError(
                    "start_date must be before or equal to end_date"
                )

        # Prevent future dates
        today = date.today()

        if self.start_date and self.start_date > today:
            raise ValueError(
                "start_date cannot be after today"
            )

        if self.end_date and self.end_date > today:
            raise ValueError(
                "end_date cannot be after today"
            )

        return self

class FetchDailyResponse(BaseModel):
    symbol: str
    start_date: date
    end_date: date | None
    rows_imported: int