import { useEffect, useMemo, useState } from 'react';
import './App.css';
import Header from './components/Header';
import PriceChart from './components/PriceChart';
import { getTickerPrices, getTickers } from './services/api';
import type { TickerItem, TickerPrice } from './types/market';

type LoadState = 'loading' | 'success' | 'error';

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
        <a className="button" href="/stocks/NVDA">
          Open sample detail
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

      <div className="panel chart-panel">
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
      </div>
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

  return (
    <>
      <Header currentPath={currentPath} />
      <main>{symbol ? <StockDetailPage key={symbol} symbol={symbol} /> : <TickerListPage />}</main>
    </>
  );
}

export default App;
