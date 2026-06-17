import { useEffect, useMemo, useRef } from 'react';
import {
  CandlestickSeries,
  HistogramSeries,
  createChart,
  type CandlestickData,
  type HistogramData,
  type MouseEventParams,
  type Time,
} from 'lightweight-charts';
import type { TickerPrice } from '../types/market';

type PriceChartProps = {
  prices: TickerPrice[];
  onHoverPrice?: (price: TickerPrice | null) => void;
};

function PriceChart({ prices, onHoverPrice }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pricesByDate = useMemo(
    () => new Map(prices.map((price) => [price.price_date, price])),
    [prices],
  );

  const candleData = useMemo<CandlestickData[]>(
    () =>
      prices.map((price) => ({
        time: price.price_date,
        open: price.open,
        high: price.high,
        low: price.low,
        close: price.close,
      })),
    [prices],
  );

  const volumeData = useMemo<HistogramData[]>(
    () =>
      prices.map((price) => ({
        time: price.price_date,
        value: price.volume,
        color: price.close >= price.open ? 'rgba(20, 184, 166, 0.35)' : 'rgba(239, 68, 68, 0.32)',
      })),
    [prices],
  );

  useEffect(() => {
    const container = containerRef.current;

    if (!container || candleData.length === 0) {
      return;
    }

    const chart = createChart(container, {
      height: 420,
      width: container.clientWidth,
      autoSize: true,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#475569',
        attributionLogo: true,
      },
      grid: {
        vertLines: { color: '#eef2f7' },
        horzLines: { color: '#eef2f7' },
      },
      rightPriceScale: {
        borderColor: '#d9e2ec',
      },
      timeScale: {
        borderColor: '#d9e2ec',
        timeVisible: false,
      },
      crosshair: {
        mode: 1,
      },
    });

    const candlesticks = chart.addSeries(CandlestickSeries, {
      upColor: '#14b8a6',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#0f766e',
      wickDownColor: '#b91c1c',
    });

    candlesticks.setData(candleData);

    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    volume.setData(volumeData);
    volume.priceScale().applyOptions({
      scaleMargins: {
        top: 0.78,
        bottom: 0,
      },
    });

    chart.timeScale().fitContent();

    const handleCrosshairMove = (param: MouseEventParams<Time>) => {
      const hoveredDate = typeof param.time === 'string' ? param.time : null;
      onHoverPrice?.(hoveredDate ? pricesByDate.get(hoveredDate) ?? null : null);
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.remove();
    };
  }, [candleData, onHoverPrice, pricesByDate, volumeData]);

  return <div className="price-chart" ref={containerRef} aria-label="Historical price chart" />;
}

export default PriceChart;
