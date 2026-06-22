import { useEffect, useMemo, useState, type FormEvent } from 'react';
import './App.css';
import Header from './components/Header';
import PriceChart from './components/PriceChart';
import AddTickerPage from './pages/AddTickerPage';
import { ApiError, fetchDailyPrices, getTickerPrices, getTickers } from './services/api';
import type { FetchDailyResponse, TickerItem, TickerPrice } from './types/market';

type LoadState = 'loading' | 'success' | 'error';
type DetailTab = 'chart' | 'data';
type FetchStatus = 'idle' | 'submitting' | 'success' | 'error';

function formatCurrency(value: number | undefined) {
  if (value === undefined) {
    return '--';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function formatVolume(value: number | undefined) {
  if (value === undefined) {
    return '--';
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function getPath() {
  return window.location.pathname || '/';
}

function TickerListPage() {
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [status, setStatus] = useState<LoadState>('loading');

  useEffect(() => {
    getTickers()
      .then((items) => {
        setTickers(items);
        setStatus('success');
      })
      .catch((error) => {
        console.error('Tickers API error:', error);
        setStatus('error');
      });
  }, []);

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Ticker table</p>
          <h1>Market dashboard</h1>
        </div>
        <a className="button" href="/tickers/new">
          Add symbol
        </a>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <h2>Tracked symbols</h2>
          <span>{tickers.length} items</span>
        </div>

        {status === 'loading' && <p className="state-message">Loading tickers...</p>}
        {status === 'error' && <p className="state-message state-message--error">Unable to load tickers.</p>}
        {status === 'success' && tickers.length === 0 && (
          <p className="state-message">No tickers found.</p>
        )}

        {tickers.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Company Name</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {tickers.map((item) => (
                  <tr key={item.id}>
                    <td className="symbol-cell">{item.symbol}</td>
                    <td>{item.company_name || 'Unknown company'}</td>
                    <td>
                      <a href={`/stocks/${item.symbol}`}>View chart</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function StockDetailPage({ symbol }: { symbol: string }) {
  const [prices, setPrices] = useState<TickerPrice[]>([]);
  const [hoveredPrice, setHoveredPrice] = useState<TickerPrice | null>(null);
  const [status, setStatus] = useState<LoadState>('loading');
  const [activeTab, setActiveTab] = useState<DetailTab>('chart');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle');
  const [fetchMessage, setFetchMessage] = useState('');
  const [lastFetch, setLastFetch] = useState<FetchDailyResponse | null>(null);

  const refreshPrices = () => {
    setStatus('loading');

    return getTickerPrices(symbol)
      .then((items) => {
        setPrices(items);
        setHoveredPrice(null);
        setStatus('success');
      })
      .catch((error) => {
        console.error('Price API error:', error);
        setStatus('error');
      });
  };

  useEffect(() => {
    getTickerPrices(symbol)
      .then((items) => {
        setPrices(items);
        setHoveredPrice(null);
        setStatus('success');
      })
      .catch((error) => {
        console.error('Price API error:', error);
        setStatus('error');
      });
  }, [symbol]);

  const handleFetchDailySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!startDate) {
      setFetchStatus('error');
      setFetchMessage('Choose a start date.');
      return;
    }

    setFetchStatus('submitting');
    setFetchMessage('');

    fetchDailyPrices(symbol, startDate, endDate)
      .then((result) => {
        setLastFetch(result);
        setFetchStatus('success');
        setFetchMessage(`Imported ${result.rows_imported} daily rows for ${result.symbol}.`);
        return refreshPrices();
      })
      .catch((error) => {
        setFetchStatus('error');
        setLastFetch(null);

        if (error instanceof ApiError && error.status === 422) {
          setFetchMessage('Check the date range. Start date must be on or before end date, and dates cannot be in the future.');
          return;
        }

        setFetchMessage(error instanceof Error ? error.message : 'Unable to load daily data.');
      });
  };

  const displayedPrice = hoveredPrice ?? prices.at(-1);
  const displayedIndex = displayedPrice
    ? prices.findIndex((price) => price.price_date === displayedPrice.price_date)
    : -1;
  const previous = displayedIndex > 0 ? prices[displayedIndex - 1] : undefined;
  const change = displayedPrice && previous ? displayedPrice.close - previous.close : undefined;
  const changePercent = displayedPrice && previous ? (change! / previous.close) * 100 : undefined;

  const dateRange = useMemo(() => {
    if (prices.length === 0) {
      return 'No price history loaded';
    }

    return `${prices[0].price_date} to ${prices[prices.length - 1].price_date}`;
  }, [prices]);

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Stock detail</p>
          <h1>{symbol}</h1>
        </div>
        <a className="button button--secondary" href="/">
          Back to tickers
        </a>
      </div>

      <div className="metrics-grid" aria-label={`${symbol} selected price summary`}>
        <div className="metric">
          <span>{hoveredPrice ? hoveredPrice.price_date : 'Latest close'}</span>
          <strong>{formatCurrency(displayedPrice?.close)}</strong>
        </div>
        <div className="metric">
          <span>Change from prior close</span>
          <strong className={change && change < 0 ? 'negative' : 'positive'}>
            {change === undefined ? '--' : `${formatCurrency(change)} (${changePercent?.toFixed(2)}%)`}
          </strong>
        </div>
        <div className="metric">
          <span>Volume</span>
          <strong>{formatVolume(displayedPrice?.volume)}</strong>
        </div>
        <div className="metric">
          <span>Open / High / Low</span>
          <strong className="metric-value--compact" title={displayedPrice
            ? `${formatCurrency(displayedPrice.open)} / ${formatCurrency(displayedPrice.high)} / ${formatCurrency(displayedPrice.low)}`
            : '--'}
          >
            {displayedPrice
              ? `${formatCurrency(displayedPrice.open)} / ${formatCurrency(displayedPrice.high)} / ${formatCurrency(displayedPrice.low)}`
              : '--'}
          </strong>
        </div>
      </div>

      <div className="tab-list" role="tablist" aria-label={`${symbol} detail sections`}>
        <button
          className={activeTab === 'chart' ? 'tab-button tab-button--active' : 'tab-button'}
          type="button"
          role="tab"
          aria-selected={activeTab === 'chart'}
          onClick={() => setActiveTab('chart')}
        >
          Chart
        </button>
        <button
          className={activeTab === 'data' ? 'tab-button tab-button--active' : 'tab-button'}
          type="button"
          role="tab"
          aria-selected={activeTab === 'data'}
          onClick={() => setActiveTab('data')}
        >
          Data
        </button>
      </div>

      {activeTab === 'chart' && <div className="panel chart-panel" role="tabpanel">
        <div className="panel-heading">
          <h2>Historical OHLCV</h2>
          <span>{hoveredPrice ? `Selected ${hoveredPrice.price_date}` : dateRange}</span>
        </div>

        {status === 'loading' && <p className="state-message">Loading price history...</p>}
        {status === 'error' && <p className="state-message state-message--error">Unable to load prices for {symbol}.</p>}
        {status === 'success' && prices.length === 0 && (
          <p className="state-message">No price history found for {symbol}.</p>
        )}
        {prices.length > 0 && <PriceChart prices={prices} onHoverPrice={setHoveredPrice} />}
      </div>}

      {activeTab === 'data' && <div className="detail-grid" role="tabpanel">
        <div className="panel">
          <div className="panel-heading">
            <h2>Load daily data</h2>
            <span>POST /api/tickers/{symbol}/fetch-daily</span>
          </div>

          <form className="ticker-form" onSubmit={handleFetchDailySubmit}>
            <div className="date-fields">
              <div className="field-group">
                <label htmlFor="fetch-start-date">Start date</label>
                <input
                  id="fetch-start-date"
                  name="start_date"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>
              <div className="field-group">
                <label htmlFor="fetch-end-date">End date</label>
                <input
                  id="fetch-end-date"
                  name="end_date"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
            </div>

            <button className="button" type="submit" disabled={fetchStatus === 'submitting'}>
              {fetchStatus === 'submitting' ? 'Loading data...' : 'Load daily data'}
            </button>

            {fetchStatus === 'error' && <p className="form-message form-message--error">{fetchMessage}</p>}
            {fetchStatus === 'success' && (
              <div className="form-message form-message--success">
                <strong>{lastFetch?.symbol}</strong>
                <span>{fetchMessage}</span>
              </div>
            )}
          </form>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Metadata</h2>
            <span>{status === 'success' ? `${prices.length} price rows` : 'Price history'}</span>
          </div>

          <dl className="metadata-list">
            <div>
              <dt>Symbol</dt>
              <dd>{symbol}</dd>
            </div>
            <div>
              <dt>Loaded range</dt>
              <dd>{dateRange}</dd>
            </div>
            <div>
              <dt>Latest close</dt>
              <dd>{formatCurrency(prices.at(-1)?.close)}</dd>
            </div>
            <div>
              <dt>Latest volume</dt>
              <dd>{formatVolume(prices.at(-1)?.volume)}</dd>
            </div>
          </dl>
        </div>
      </div>}
    </section>
  );
}

function App() {
  const [currentPath, setCurrentPath] = useState(getPath);

  useEffect(() => {
    const handleNavigation = () => setCurrentPath(getPath());
    const handleDocumentClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a');

      if (!anchor || anchor.target || anchor.origin !== window.location.origin) {
        return;
      }

      event.preventDefault();
      window.history.pushState({}, '', anchor.href);
      handleNavigation();
    };

    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('click', handleDocumentClick);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  const stockMatch = currentPath.match(/^\/stocks\/([^/]+)$/);
  const symbol = stockMatch?.[1]?.toUpperCase();
  const isAddTickerPage = currentPath === '/tickers/new';

  return (
    <>
      <Header currentPath={currentPath} />
      <main>
        {isAddTickerPage && <AddTickerPage />}
        {!isAddTickerPage && symbol && <StockDetailPage key={symbol} symbol={symbol} />}
        {!isAddTickerPage && !symbol && <TickerListPage />}
      </main>
    </>
  );
}

export default App;
