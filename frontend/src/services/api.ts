import type { FetchDailyResponse, TickerCreateResponse, TickerItem, TickerPrice } from '../types/market';

// TODO: Move this to a Vite env variable once local and container API URLs diverge.
const API_BASE_URL = 'http://localhost:8000/api';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string } | null;
    throw new ApiError(response.status, body?.detail || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getTickers() {
  return request<TickerItem[]>('/tickers');
}

export function createTicker(symbol: string) {
  return request<TickerCreateResponse>('/tickers', {
    method: 'POST',
    body: JSON.stringify({ symbol }),
  });
}

export function getTickerPrices(symbol: string) {
  return request<TickerPrice[]>(`/tickers/${encodeURIComponent(symbol)}/prices`);
}

export function fetchDailyPrices(symbol: string, startDate: string, endDate?: string) {
  return request<FetchDailyResponse>(`/tickers/${encodeURIComponent(symbol)}/fetch-daily`, {
    method: 'POST',
    body: JSON.stringify({
      start_date: startDate,
      end_date: endDate || null,
    }),
  });
}
