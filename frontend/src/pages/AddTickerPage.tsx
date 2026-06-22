import { useState, type FormEvent } from 'react';
import { ApiError, createTicker } from '../services/api';
import type { TickerCreateResponse } from '../types/market';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

function AddTickerPage() {
  const [symbol, setSymbol] = useState('');
  const [createdTicker, setCreatedTicker] = useState<TickerCreateResponse | null>(null);
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const normalizedSymbol = symbol.trim().toUpperCase();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!normalizedSymbol) {
      setStatus('error');
      setErrorMessage('Enter a ticker symbol.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    createTicker(normalizedSymbol)
      .then((ticker) => {
        setCreatedTicker(ticker);
        setSymbol('');
        setStatus('success');
      })
      .catch((error) => {
        setCreatedTicker(null);
        setStatus('error');

        if (error instanceof ApiError && error.status === 409) {
          setErrorMessage(`${normalizedSymbol} already exists.`);
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Unable to add ticker.');
      });
  };

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Ticker table</p>
          <h1>Add symbol</h1>
        </div>
        <a className="button button--secondary" href="/">
          Back to tickers
        </a>
      </div>

      <div className="panel form-panel">
        <div className="panel-heading">
          <h2>New ticker</h2>
          <span>POST /api/tickers</span>
        </div>

        <form className="ticker-form" onSubmit={handleSubmit}>
          <label htmlFor="ticker-symbol">Symbol</label>
          <div className="ticker-form__row">
            <input
              id="ticker-symbol"
              name="symbol"
              value={symbol}
              onChange={(event) => setSymbol(event.target.value.toUpperCase())}
              placeholder="NVDA"
              autoComplete="off"
              autoCapitalize="characters"
            />
            <button className="button" type="submit" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Adding...' : 'Add ticker'}
            </button>
          </div>

          {status === 'error' && <p className="form-message form-message--error">{errorMessage}</p>}
          {status === 'success' && createdTicker && (
            <div className="form-message form-message--success">
              <strong>{createdTicker.symbol}</strong>
              <span>{createdTicker.company_name || 'Ticker added.'}</span>
              <a href={`/stocks/${createdTicker.symbol}`}>View chart</a>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

export default AddTickerPage;
