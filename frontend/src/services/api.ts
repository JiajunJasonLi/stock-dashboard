import type { TickerItem, TickerPrice } from '../types/market';

// TODO: Move this to a Vite env variable once local and container API URLs diverge.
const API_BASE_URL = 'http://localhost:8000/api';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getTickers() {
  return request<TickerItem[]>('/tickers');
}

export function getTickerPrices(symbol: string) {
  return request<TickerPrice[]>(`/tickers/${encodeURIComponent(symbol)}/prices`);
}
