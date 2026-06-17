export type TickerItem = {
  id: number;
  symbol: string;
  company_name: string | null;
};

export type TickerPrice = {
  price_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};
