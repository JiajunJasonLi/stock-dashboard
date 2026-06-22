export type TickerItem = {
  id: number;
  symbol: string;
  company_name: string | null;
};

export type TickerCreateResponse = {
  symbol: string;
  company_name: string | null;
};

export type FetchDailyResponse = {
  symbol: string;
  start_date: string;
  end_date: string | null;
  rows_imported: number;
};

export type TickerPrice = {
  price_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};
