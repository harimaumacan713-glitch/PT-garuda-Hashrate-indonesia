import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const yahooSymbolMap: Record<string, string> = {
  'NVDA': 'NVDA',
  'AAPL': 'AAPL',
  'TSLA': 'TSLA',
  'MSFT': 'MSFT',
  'AMZN': 'AMZN',
  'GOOGL': 'GOOGL',
  'META': 'META',
  'NFLX': 'NFLX',
  'AMD': 'AMD',
  'INTC': 'INTC',
  'COIN': 'COIN',
  'GOLD': 'GC=F',
  'SILVER': 'SI=F',
  'SPX': '^GSPC',
  'NDX': '^NDX',
  'EURUSD': 'EURUSD=X',
};

// Cache to prevent hitting rate limits
let cachedQuotes: Record<string, any> = {};
let lastCacheTime = 0;
const CACHE_TTL = 3000; // 3 seconds cache

async function fetchYahooQuote(symbolKey: string, yahooSymbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=5m&range=1d`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta || meta.regularMarketPrice === undefined) return null;

    const currentPrice = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || meta.previousClose || currentPrice;
    const change = currentPrice - prevClose;
    const pctChange = prevClose !== 0 ? (change / prevClose) * 100 : 0;

    const timestamps = json?.chart?.result?.[0]?.timestamp || [];
    const closes = json?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
    
    const chartData = timestamps.map((t: number, i: number) => {
      const val = closes[i] ?? currentPrice;
      const date = new Date(t * 1000);
      return {
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: val
      };
    }).filter((item: any) => item.value !== null && !isNaN(item.value));

    return {
      symbol: symbolKey,
      price: currentPrice,
      change: change,
      pctChange: pctChange,
      high: meta.regularMarketDayHigh || currentPrice,
      low: meta.regularMarketDayLow || currentPrice,
      volume: meta.regularMarketVolume || 0,
      chart: chartData
    };
  } catch (err) {
    console.error(`Error fetching Yahoo quote for ${symbolKey}:`, err);
    return null;
  }
}

async function fetchBinanceQuotes() {
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    if (!res.ok) return [];
    const tickers = await res.json();
    return tickers;
  } catch (err) {
    console.error('Error fetching Binance tickers:', err);
    return [];
  }
}

async function getLiveGlobalQuotes() {
  const now = Date.now();
  if (now - lastCacheTime < CACHE_TTL && Object.keys(cachedQuotes).length > 0) {
    return cachedQuotes;
  }

  const quotesResult: Record<string, any> = {};

  // Fetch Binance crypto tickers
  const binanceData = await fetchBinanceQuotes();
  if (Array.isArray(binanceData)) {
    for (const item of binanceData) {
      if (item.symbol && item.symbol.endsWith('USDT')) {
        const base = item.symbol.replace('USDT', '');
        const price = parseFloat(item.lastPrice);
        const change = parseFloat(item.priceChange);
        const pctChange = parseFloat(item.priceChangePercent);
        const high = parseFloat(item.highPrice);
        const low = parseFloat(item.lowPrice);
        const volume = parseFloat(item.volume);

        const dataObj = {
          symbol: item.symbol,
          baseSymbol: base,
          price,
          change,
          pctChange,
          high,
          low,
          volume
        };

        quotesResult[item.symbol] = dataObj;
        quotesResult[base] = dataObj;
      }
    }
  }

  // Fetch Stock / Forex / Commodity quotes in parallel
  const yahooKeys = Object.keys(yahooSymbolMap);
  const yahooPromises = yahooKeys.map(key => fetchYahooQuote(key, yahooSymbolMap[key]));
  const yahooResults = await Promise.all(yahooPromises);

  for (const res of yahooResults) {
    if (res) {
      quotesResult[res.symbol] = res;
    }
  }

  cachedQuotes = quotesResult;
  lastCacheTime = now;
  return quotesResult;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoints for real market prices
  app.get('/api/quotes', async (req, res) => {
    try {
      const allQuotes = await getLiveGlobalQuotes();
      res.json({ success: true, quotes: allQuotes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/quote/:symbol', async (req, res) => {
    try {
      const sym = req.params.symbol.toUpperCase();
      const allQuotes = await getLiveGlobalQuotes();
      const quote = allQuotes[sym] || allQuotes[`${sym}USDT`];
      
      if (!quote) {
        // Try fallback direct fetch if not in cache
        const yahooSymbol = yahooSymbolMap[sym];
        if (yahooSymbol) {
          const directQuote = await fetchYahooQuote(sym, yahooSymbol);
          if (directQuote) {
            return res.json({ success: true, quote: directQuote });
          }
        }
        return res.status(404).json({ success: false, message: 'Symbol not found' });
      }

      res.json({ success: true, quote });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
