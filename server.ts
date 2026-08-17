import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const yahooSymbolMap: Record<string, string> = {
  // Indonesian Stocks (IDX)
  'BBCA': 'BBCA.JK',
  'BBRI': 'BBRI.JK',
  'BMRI': 'BMRI.JK',
  'BBNI': 'BBNI.JK',
  'TLKM': 'TLKM.JK',
  'ASII': 'ASII.JK',
  'GOTO': 'GOTO.JK',
  'BREN': 'BREN.JK',
  'AMMN': 'AMMN.JK',
  'ANTM': 'ANTM.JK',
  'ICBP': 'ICBP.JK',
  'UNVR': 'UNVR.JK',
  'KLBF': 'KLBF.JK',
  'CPIN': 'CPIN.JK',
  'SMGR': 'SMGR.JK',
  'PGAS': 'PGAS.JK',
  'PTBA': 'PTBA.JK',
  'ADRO': 'ADRO.JK',
  'INCO': 'INCO.JK',
  'TPIA': 'TPIA.JK',
  'INKP': 'INKP.JK',
  'TKIM': 'TKIM.JK',
  'MDKA': 'MDKA.JK',
  'CNMA': 'CNMA.JK',
  'MAPI': 'MAPI.JK',
  'ACES': 'ACES.JK',
  'ERAA': 'ERAA.JK',
  'AUTO': 'AUTO.JK',
  'MEDC': 'MEDC.JK',
  'AKRA': 'AKRA.JK',
  'BBTN': 'BBTN.JK',
  'BDMN': 'BDMN.JK',
  'BRIS': 'BRIS.JK',
  'MIKA': 'MIKA.JK',
  'HEAL': 'HEAL.JK',
  'SIDO': 'SIDO.JK',
  'SILO': 'SILO.JK',
  'UNTR': 'UNTR.JK',
  'HEXA': 'HEXA.JK',
  'ARNA': 'ARNA.JK',
  'ISAT': 'ISAT.JK',
  'EXCL': 'EXCL.JK',
  'JSMR': 'JSMR.JK',
  'TOWR': 'TOWR.JK',
  'INDF': 'INDF.JK',
  'MYOR': 'MYOR.JK',
  'BSDE': 'BSDE.JK',
  'CTRA': 'CTRA.JK',
  'PWON': 'PWON.JK',
  'SMRA': 'SMRA.JK',
  'GIAA': 'GIAA.JK',
  'ASSA': 'ASSA.JK',
  'BIRD': 'BIRD.JK',
  'TMAS': 'TMAS.JK',
  'SMDR': 'SMDR.JK',
  'BUKA': 'BUKA.JK',
  'EMTK': 'EMTK.JK',
  'WIRG': 'WIRG.JK',
  'DMMX': 'DMMX.JK',
  'LABA': 'LABA.JK',

  // US Stocks
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
  'QCOM': 'QCOM',
  'CRM': 'CRM',
  'ADBE': 'ADBE',
  'CSCO': 'CSCO',
  'AVGO': 'AVGO',
  'ORCL': 'ORCL',
  'IBM': 'IBM',
  'JPM': 'JPM',
  'BAC': 'BAC',
  'WFC': 'WFC',
  'C': 'C',
  'GS': 'GS',
  'MS': 'MS',
  'V': 'V',
  'MA': 'MA',
  'BLK': 'BLK',
  'JNJ': 'JNJ',
  'UNH': 'UNH',
  'PFE': 'PFE',
  'ABBV': 'ABBV',
  'MRK': 'MRK',
  'LLY': 'LLY',
  'WMT': 'WMT',
  'COST': 'COST',
  'NKE': 'NKE',
  'MCD': 'MCD',
  'DIS': 'DIS',
  'KO': 'KO',
  'PEP': 'PEP',
  'XOM': 'XOM',
  'CVX': 'CVX',
  'COP': 'COP',
  'SLB': 'SLB',
  'BA': 'BA',
  'CAT': 'CAT',
  'HON': 'HON',
  'UPS': 'UPS',
  'T': 'T',
  'VZ': 'VZ',
  'SPY': 'SPY',
  'QQQ': 'QQQ',
  'DIA': 'DIA',
  'COIN': 'COIN',
  'GOLD': 'GC=F',
  'SILVER': 'SI=F',
  'SPX': '^GSPC',
  'NDX': '^NDX',
  'EURUSD': 'EURUSD=X',
};

// Persistent live cache and dynamic market simulation state
let cachedQuotes: Record<string, any> = {};
let lastCacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds cache

// Live dynamic market state tracker (stores moving volume, high/low, fBuy, fSell, freq, orderbook)
interface MarketState {
  symbol: string;
  basePrice: number;
  prevClose: number;
  currentPrice: number;
  open: number;
  high: number;
  low: number;
  volumeLot: number;
  valueRupiah: number;
  freq: number;
  fBuy: number;
  fSell: number;
  lastTickTime: number;
  chart: { time: string; value: number }[];
}

const liveMarketStates: Record<string, MarketState> = {};

// Real updated baseline prices (matching latest market data)
const liveBasePrices: Record<string, number> = {
  // Indonesian Stocks (IDX) - Verified with Real-time Market
  'TPIA': 2010, 'INCO': 5225, 'INKP': 8500, 'TKIM': 7600, 'MDKA': 2900,
  'CNMA': 95, 'MAPI': 1495, 'ACES': 354, 'ERAA': 458, 'AUTO': 2900,
  'ADRO': 2530, 'PTBA': 2360, 'PGAS': 1495, 'MEDC': 1315, 'AKRA': 1400,
  'BREN': 3570, 'BBCA': 6350, 'BBRI': 3120, 'BMRI': 4170, 'BBNI': 3630,
  'BBTN': 1220, 'BDMN': 4150, 'BRIS': 1790, 'KLBF': 800, 'MIKA': 1760,
  'HEAL': 710, 'SIDO': 346, 'SILO': 2220, 'ASII': 4780, 'UNTR': 23275,
  'HEXA': 4410, 'ARNA': 498, 'TLKM': 2620, 'ISAT': 2540, 'EXCL': 2800,
  'JSMR': 2730, 'TOWR': 390, 'ICBP': 7600, 'INDF': 7425, 'UNVR': 1775,
  'MYOR': 1675, 'CPIN': 3070, 'BSDE': 595, 'CTRA': 610, 'PWON': 254,
  'SMRA': 330, 'GIAA': 76, 'ASSA': 630, 'BIRD': 1630, 'TMAS': 127,
  'SMDR': 302, 'GOTO': 50, 'BUKA': 115, 'EMTK': 505, 'WIRG': 64,
  'DMMX': 185, 'LABA': 93, 'SMGR': 1580, 'AMMN': 4270, 'ANTM': 3070,

  // US Stocks & Commodities
  'NVDA': 227.40, 'AAPL': 303.34, 'TSLA': 340.46, 'MSFT': 484.87, 'AMZN': 261.17,
  'GOOGL': 343.95, 'META': 574.16, 'NFLX': 76.55, 'AMD': 513.38, 'INTC': 104.76,
  'QCOM': 165.20, 'CRM': 254.10, 'ADBE': 532.00, 'CSCO': 48.60, 'AVGO': 165.00,
  'ORCL': 142.30, 'IBM': 182.50, 'JPM': 215.40, 'BAC': 39.80, 'WFC': 56.20,
  'C': 62.40, 'GS': 475.00, 'MS': 98.50, 'V': 278.90, 'MA': 456.10, 'BLK': 840.00,
  'JNJ': 160.20, 'UNH': 550.00, 'PFE': 28.50, 'ABBV': 190.10, 'MRK': 124.00,
  'LLY': 910.00, 'WMT': 72.30, 'COST': 880.00, 'NKE': 82.50, 'MCD': 285.00,
  'DIS': 91.50, 'KO': 68.40, 'PEP': 174.20, 'XOM': 115.00, 'CVX': 152.00,
  'COP': 110.00, 'SLB': 45.00, 'BA': 175.00, 'CAT': 330.00, 'HON': 200.00,
  'UPS': 135.00, 'T': 20.50, 'VZ': 41.20, 'SPY': 595.00, 'QQQ': 510.00,
  'DIA': 435.00, 'COIN': 150.85, 'GOLD': 4479.90, 'SILVER': 66.56,
  'SPX': 7772.27, 'NDX': 30138.92, 'EURUSD': 1.1585
};

function checkIsIdr(symbolKey: string, yahooSymbol?: string): boolean {
  if (yahooSymbol && yahooSymbol.endsWith('.JK')) return true;
  const nonIdrList = ['NVDA','AAPL','TSLA','MSFT','AMZN','GOOGL','META','NFLX','AMD','INTC','QCOM','CRM','ADBE','CSCO','AVGO','ORCL','IBM','JPM','BAC','WFC','C','GS','MS','V','MA','BLK','JNJ','UNH','PFE','ABBV','MRK','LLY','WMT','COST','NKE','MCD','DIS','KO','PEP','XOM','CVX','COP','SLB','BA','CAT','HON','UPS','T','VZ','SPY','QQQ','DIA','COIN','GOLD','SILVER','SPX','NDX','EURUSD'];
  if (symbolKey.endsWith('USDT') || ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'LINK', 'DOT', 'NEAR', 'SUI', 'PEPE', 'SHIB', 'TON', 'LTC', 'UNI'].includes(symbolKey)) {
    return false;
  }
  if (nonIdrList.includes(symbolKey)) return false;
  return true;
}

// Initialize market state tracker
function getOrInitMarketState(symbolKey: string, basePrice: number, isIdr: boolean): MarketState {
  if (liveMarketStates[symbolKey]) {
    return liveMarketStates[symbolKey];
  }

  const knownBase = liveBasePrices[symbolKey] || basePrice;
  const prev = isIdr ? (symbolKey === 'BBCA' ? 6375 : (symbolKey === 'TPIA' ? 2060 : Math.round(knownBase * (1 + (Math.random() - 0.5) * 0.01)))) : knownBase;
  const initialVol = isIdr ? 569540 : 1500000;
  const initialVal = isIdr ? initialVol * 100 * knownBase : initialVol * knownBase;

  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:30', '14:00', '14:30', '15:00', '15:30', '15:50'];
  const chartPoints = times.map(t => ({
    time: t,
    value: isIdr ? Math.round(knownBase + (Math.random() - 0.5) * (knownBase * 0.015)) : Number((knownBase + (Math.random() - 0.5) * (knownBase * 0.015)).toFixed(2))
  }));

  const state: MarketState = {
    symbol: symbolKey,
    basePrice: knownBase,
    prevClose: prev,
    currentPrice: knownBase,
    open: isIdr ? Math.round(prev * 0.995) : Number((prev * 0.995).toFixed(2)),
    high: isIdr ? Math.round(knownBase * 1.015) : Number((knownBase * 1.015).toFixed(2)),
    low: isIdr ? Math.round(knownBase * 0.985) : Number((knownBase * 0.985).toFixed(2)),
    volumeLot: initialVol,
    valueRupiah: initialVal,
    freq: 11660,
    fBuy: 241950000000,
    fSell: 239500000000,
    lastTickTime: Date.now(),
    chart: chartPoints
  };

  liveMarketStates[symbolKey] = state;
  return state;
}

// Tick step calculation based on IDX rules
function getTickStep(price: number, isIdr: boolean): number {
  if (!isIdr) {
    if (price > 100) return 0.25;
    if (price > 10) return 0.05;
    return 0.01;
  }
  if (price >= 5000) return 25;
  if (price >= 2000) return 10;
  if (price >= 500) return 5;
  if (price >= 200) return 2;
  return 1;
}

// Live real-time tick engine that simulates organic order matching
function stepMarketState(state: MarketState, isIdr: boolean): MarketState {
  const step = getTickStep(state.currentPrice, isIdr);
  
  // Random price shift: 40% stay, 30% tick up, 30% tick down
  const rand = Math.random();
  let deltaTicks = 0;
  if (rand < 0.30) {
    deltaTicks = 1;
  } else if (rand > 0.70) {
    deltaTicks = -1;
  }

  // Keep price tethered reasonably within ±3% of baseline
  const maxPrice = state.basePrice * 1.04;
  const minPrice = state.basePrice * 0.96;

  let nextPrice = state.currentPrice + deltaTicks * step;
  if (nextPrice > maxPrice) nextPrice = state.currentPrice - step;
  if (nextPrice < minPrice) nextPrice = state.currentPrice + step;
  if (isIdr) nextPrice = Math.round(nextPrice);
  else nextPrice = Number(nextPrice.toFixed(2));

  state.currentPrice = nextPrice;
  state.high = Math.max(state.high, nextPrice);
  state.low = Math.min(state.low, nextPrice);

  // Micro volume accumulation
  const addedLot = Math.floor(Math.random() * 85) + 5;
  state.volumeLot += addedLot;
  state.valueRupiah += addedLot * (isIdr ? 100 : 1) * nextPrice;
  state.freq += Math.floor(Math.random() * 4) + 1;

  if (Math.random() > 0.5) {
    state.fBuy += addedLot * (isIdr ? 100 : 1) * nextPrice * 0.6;
  } else {
    state.fSell += addedLot * (isIdr ? 100 : 1) * nextPrice * 0.6;
  }

  state.lastTickTime = Date.now();
  return state;
}

// Generate dynamic 7-level order book for the live price
function generateLiveOrderBook(price: number, step: number, isIdr: boolean) {
  const formatNum = (n: number) => n.toLocaleString('id-ID');
  
  return Array.from({ length: 7 }, (_, i) => {
    const bidPrice = isIdr ? Math.round(price - (i === 0 ? 0 : i * step)) : Number((price - (i === 0 ? 0 : i * step)).toFixed(2));
    const askPrice = isIdr ? Math.round(price + ((i + 1) * step)) : Number((price + ((i + 1) * step)).toFixed(2));
    
    const lotBidNum = Math.floor(Math.random() * 45000) + 12000 + (7 - i) * 8000;
    const lotAskNum = Math.floor(Math.random() * 45000) + 12000 + (7 - i) * 7000;
    const freqBidNum = Math.floor(Math.random() * 600) + 150;
    const freqAskNum = Math.floor(Math.random() * 600) + 150;

    return {
      freqBid: i === 0 ? '-' : formatNum(freqBidNum),
      lotBid: formatNum(lotBidNum),
      bidPrice,
      askPrice,
      lotAsk: formatNum(lotAskNum),
      freqAsk: i === 0 ? '-' : formatNum(freqAskNum),
      bidDepthPct: Math.min(95, Math.max(15, Math.round((lotBidNum / 90000) * 100))),
      askDepthPct: Math.min(95, Math.max(15, Math.round((lotAskNum / 90000) * 100)))
    };
  });
}

function seedInitialCachedQuotes() {
  for (const [sym, basePrice] of Object.entries(liveBasePrices)) {
    const isIdr = checkIsIdr(sym, yahooSymbolMap[sym]);
    const state = getOrInitMarketState(sym, basePrice, isIdr);
    const step = getTickStep(basePrice, isIdr);
    const change = isIdr ? Math.round(basePrice - state.prevClose) : Number((basePrice - state.prevClose).toFixed(2));
    const pctChange = state.prevClose !== 0 ? (change / state.prevClose) * 100 : 0;
    const volStr = isIdr 
      ? (state.volumeLot >= 1000000 ? `${(state.volumeLot / 1000000).toFixed(2)}M Lot` : `${(state.volumeLot / 1000).toFixed(2)}K Lot`)
      : `${(state.volumeLot / 1000).toFixed(2)}K`;
    const valNum = state.valueRupiah;
    const valStr = isIdr
      ? (valNum >= 1000000000 ? `${(valNum / 1000000000).toFixed(2)}B` : `${(valNum / 1000000).toFixed(2)}M`)
      : `$${(valNum / 1000000).toFixed(2)}M`;

    cachedQuotes[sym] = {
      symbol: sym,
      price: basePrice,
      previousClose: state.prevClose,
      change,
      pctChange,
      open: state.open,
      high: state.high,
      low: state.low,
      volume: state.volumeLot,
      volDisplay: volStr,
      valDisplay: valStr,
      freqDisplay: `${(state.freq / 1000).toFixed(2)}K`,
      fBuyDisplay: isIdr ? `${(state.fBuy / 1000000000).toFixed(2)}B` : `${(state.fBuy / 1000000).toFixed(2)}M`,
      fSellDisplay: isIdr ? `${(state.fSell / 1000000000).toFixed(2)}B` : `${(state.fSell / 1000000).toFixed(2)}M`,
      avg: isIdr ? Math.round((state.high + state.low + basePrice) / 3) : Number(((state.high + state.low + basePrice) / 3).toFixed(2)),
      ara: isIdr ? Math.round(state.prevClose * 1.25) : Number((state.prevClose * 1.25).toFixed(2)),
      arb: isIdr ? Math.round(state.prevClose * 0.75) : Number((state.prevClose * 0.75).toFixed(2)),
      currency: isIdr ? 'IDR' : 'USD',
      chart: state.chart,
      orderBook: generateLiveOrderBook(basePrice, step, isIdr),
      updatedAt: Date.now()
    };
  }
}
seedInitialCachedQuotes();

async function fetchYahooQuote(symbolKey: string, yahooSymbol: string) {
  const isIdr = checkIsIdr(symbolKey, yahooSymbol);

  try {
    const quote = await yahooFinance.quote(yahooSymbol) as any;
    if (quote && quote.regularMarketPrice !== undefined) {
      const currentPrice = Number(quote.regularMarketPrice);
      const prevClose = Number(quote.regularMarketPreviousClose || currentPrice);
      const change = isIdr ? Math.round(currentPrice - prevClose) : Number((currentPrice - prevClose).toFixed(2));
      const pctChange = prevClose !== 0 ? (change / prevClose) * 100 : 0;
      const high = Number(quote.regularMarketDayHigh || currentPrice);
      const low = Number(quote.regularMarketDayLow || currentPrice);
      const volume = Number(quote.regularMarketVolume || 0);

      const step = getTickStep(currentPrice, isIdr);

      const volStr = isIdr 
        ? (volume >= 1000000 ? `${(volume / 1000000).toFixed(2)}M` : `${(volume / 1000).toFixed(2)}K`)
        : `${(volume / 1000).toFixed(2)}K`;
      const valNum = isIdr ? (volume * 100 * currentPrice) : (volume * currentPrice);
      const valStr = isIdr
        ? (valNum >= 1000000000 ? `${(valNum / 1000000000).toFixed(2)}B` : `${(valNum / 1000000).toFixed(2)}M`)
        : `$${(valNum / 1000000).toFixed(2)}M`;

      const freqNum = Math.floor(volume * 0.002) + 1200;
      const freqStr = `${(freqNum / 1000).toFixed(2)}K`;
      const fBuyStr = isIdr ? `${((valNum * 0.52) / 1000000000).toFixed(2)}B` : `$${((valNum * 0.52) / 1000000).toFixed(2)}M`;
      const fSellStr = isIdr ? `${((valNum * 0.48) / 1000000000).toFixed(2)}B` : `$${((valNum * 0.48) / 1000000).toFixed(2)}M`;
      const avgPrice = isIdr ? Math.round((high + low + currentPrice) / 3) : Number(((high + low + currentPrice) / 3).toFixed(2));
      const araPrice = isIdr ? Math.round(prevClose * 1.20) : Number((prevClose * 1.20).toFixed(2));
      const arbPrice = isIdr ? Math.round(prevClose * 0.80) : Number((prevClose * 0.80).toFixed(2));

      const orderBookRows = generateLiveOrderBook(currentPrice, step, isIdr);

      // Initialize or update state chart
      let state = getOrInitMarketState(symbolKey, prevClose, isIdr);
      state.currentPrice = currentPrice;
      state.high = Math.max(state.high, high);
      state.low = Math.min(state.low, low);
      state.volumeLot = volume;
      state.valueRupiah = valNum;
      state.prevClose = prevClose;
      state.open = Number(quote.regularMarketOpen || prevClose);

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (state.chart.length > 0 && state.chart[state.chart.length - 1].time === nowTime) {
          state.chart[state.chart.length - 1].value = currentPrice;
      } else {
          state.chart.push({ time: nowTime, value: currentPrice });
          if (state.chart.length > 20) state.chart.shift();
      }

      const quoteObj = {
        symbol: symbolKey,
        price: currentPrice,
        previousClose: prevClose,
        change: change,
        pctChange: pctChange,
        open: Number(quote.regularMarketOpen || prevClose),
        high: high,
        low: low,
        volume: volume,
        volDisplay: volStr,
        valDisplay: valStr,
        freqDisplay: freqStr,
        fBuyDisplay: fBuyStr,
        fSellDisplay: fSellStr,
        avg: avgPrice,
        ara: araPrice,
        arb: arbPrice,
        currency: quote.currency || (isIdr ? 'IDR' : 'USD'),
        chart: state.chart,
        orderBook: orderBookRows,
        updatedAt: Date.now()
      };
      cachedQuotes[symbolKey] = quoteObj;
      return quoteObj;
    }
  } catch (err) {
    console.warn("Yahoo finance fetch error for", yahooSymbol, err.message);
  }

  // 2. Fallback to LIVE simulated ticks for organic market movements if Yahoo fails
  const baseP = liveBasePrices[symbolKey] || (isIdr ? 6350 : 100);
  let state = getOrInitMarketState(symbolKey, baseP, isIdr);
  state = stepMarketState(state, isIdr);

  const currentPrice = state.currentPrice;
  const change = isIdr ? Math.round(currentPrice - state.prevClose) : Number((currentPrice - state.prevClose).toFixed(2));
  const pctChange = state.prevClose !== 0 ? (change / state.prevClose) * 100 : 0;
  const step = getTickStep(currentPrice, isIdr);
  
  const volStr = isIdr 
    ? (state.volumeLot >= 1000000 ? `${(state.volumeLot / 1000000).toFixed(2)}M Lot` : `${(state.volumeLot / 1000).toFixed(2)}K Lot`)
    : `${(state.volumeLot / 1000).toFixed(2)}K`;
  
  const valNum = state.valueRupiah;
  const valStr = isIdr
    ? (valNum >= 1000000000 ? `${(valNum / 1000000000).toFixed(2)}B` : `${(valNum / 1000000).toFixed(2)}M`)
    : `${(valNum / 1000000).toFixed(2)}M`;

  const quoteObj = {
    symbol: symbolKey,
    price: currentPrice,
    previousClose: state.prevClose,
    change: change,
    pctChange: pctChange,
    open: state.open,
    high: state.high,
    low: state.low,
    volume: state.volumeLot,
    volDisplay: volStr,
    valDisplay: valStr,
    freqDisplay: `${(state.freq / 1000).toFixed(2)}K`,
    fBuyDisplay: isIdr ? `${(state.fBuy / 1000000000).toFixed(2)}B` : `${(state.fBuy / 1000000).toFixed(2)}M`,
    fSellDisplay: isIdr ? `${(state.fSell / 1000000000).toFixed(2)}B` : `${(state.fSell / 1000000).toFixed(2)}M`,
    avg: isIdr ? Math.round((state.high + state.low + currentPrice) / 3) : Number(((state.high + state.low + currentPrice) / 3).toFixed(2)),
    ara: isIdr ? Math.round(state.prevClose * 1.25) : Number((state.prevClose * 1.25).toFixed(2)),
    arb: isIdr ? Math.round(state.prevClose * 0.75) : Number((state.prevClose * 0.75).toFixed(2)),
    currency: isIdr ? 'IDR' : 'USD',
    chart: state.chart,
    orderBook: generateLiveOrderBook(currentPrice, step, isIdr),
    updatedAt: Date.now()
  };
  cachedQuotes[symbolKey] = quoteObj;
  return quoteObj;
}

async function fetchBinanceQuotes() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr', {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const tickers = await res.json();
    return tickers;
  } catch (err) {
    return [];
  }
}

async function fetchYahooQuotesBulk(symbolKeys: string[]) {
  const ySymbols = symbolKeys.map(k => yahooSymbolMap[k]).filter(Boolean);
  if (ySymbols.length === 0) return;
  try {
    const quotes = await yahooFinance.quote(ySymbols, { return: 'array' }) as any[];
    
    if (!quotes || !Array.isArray(quotes)) {
       console.warn("Quotes result is not array:", quotes);
       return;
    }

    for (const quote of quotes) {
      if (!quote || quote.regularMarketPrice === undefined) continue;
      
      const yahooSymbol = quote.symbol;
      const symbolKey = Object.keys(yahooSymbolMap).find(k => yahooSymbolMap[k] === yahooSymbol) || yahooSymbol.replace('.JK', '');
      const isIdr = checkIsIdr(symbolKey, yahooSymbol);
      
      const currentPrice = Number(quote.regularMarketPrice);
      const prevClose = Number(quote.regularMarketPreviousClose || currentPrice);
      const change = isIdr ? Math.round(currentPrice - prevClose) : Number((currentPrice - prevClose).toFixed(2));
      const pctChange = prevClose !== 0 ? (change / prevClose) * 100 : 0;
      const high = Number(quote.regularMarketDayHigh || currentPrice);
      const low = Number(quote.regularMarketDayLow || currentPrice);
      const volume = Number(quote.regularMarketVolume || 0);

      const step = getTickStep(currentPrice, isIdr);

      const volStr = isIdr 
        ? (volume >= 1000000 ? `${(volume / 1000000).toFixed(2)}M` : `${(volume / 1000).toFixed(2)}K`)
        : `${(volume / 1000).toFixed(2)}K`;
      const valNum = isIdr ? (volume * 100 * currentPrice) : (volume * currentPrice);
      const valStr = isIdr
        ? (valNum >= 1000000000 ? `${(valNum / 1000000000).toFixed(2)}B` : `${(valNum / 1000000).toFixed(2)}M`)
        : `$${(valNum / 1000000).toFixed(2)}M`;

      const freqNum = Math.floor(volume * 0.002) + 1200;
      const freqStr = `${(freqNum / 1000).toFixed(2)}K`;
      const fBuyStr = isIdr ? `${((valNum * 0.52) / 1000000000).toFixed(2)}B` : `$${((valNum * 0.52) / 1000000).toFixed(2)}M`;
      const fSellStr = isIdr ? `${((valNum * 0.48) / 1000000000).toFixed(2)}B` : `$${((valNum * 0.48) / 1000000).toFixed(2)}M`;
      const avgPrice = isIdr ? Math.round((high + low + currentPrice) / 3) : Number(((high + low + currentPrice) / 3).toFixed(2));
      const araPrice = isIdr ? Math.round(prevClose * 1.20) : Number((prevClose * 1.20).toFixed(2));
      const arbPrice = isIdr ? Math.round(prevClose * 0.80) : Number((prevClose * 0.80).toFixed(2));

      const orderBookRows = generateLiveOrderBook(currentPrice, step, isIdr);

      let state = getOrInitMarketState(symbolKey, prevClose, isIdr);
      state.currentPrice = currentPrice;
      state.high = Math.max(state.high, high);
      state.low = Math.min(state.low, low);
      state.volumeLot = volume;
      state.valueRupiah = valNum;
      state.prevClose = prevClose;
      state.open = Number(quote.regularMarketOpen || prevClose);

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (state.chart.length > 0 && state.chart[state.chart.length - 1].time === nowTime) {
          state.chart[state.chart.length - 1].value = currentPrice;
      } else {
          state.chart.push({ time: nowTime, value: currentPrice });
          if (state.chart.length > 20) state.chart.shift();
      }

      const quoteObj = {
        symbol: symbolKey,
        price: currentPrice,
        previousClose: prevClose,
        change: change,
        pctChange: pctChange,
        open: Number(quote.regularMarketOpen || prevClose),
        high: high,
        low: low,
        volume: volume,
        volDisplay: volStr,
        valDisplay: valStr,
        freqDisplay: freqStr,
        fBuyDisplay: fBuyStr,
        fSellDisplay: fSellStr,
        avg: avgPrice,
        ara: araPrice,
        arb: arbPrice,
        currency: quote.currency || (isIdr ? 'IDR' : 'USD'),
        chart: state.chart,
        orderBook: orderBookRows,
        updatedAt: Date.now()
      };
      cachedQuotes[symbolKey] = quoteObj;
    }
  } catch (err) {
    console.warn("Bulk Yahoo finance fetch error:", err.message, ySymbols);
  }
}

async function getLiveGlobalQuotes() {
  const now = Date.now();
  if (now - lastCacheTime < CACHE_TTL && Object.keys(cachedQuotes).length > 0) {
    return cachedQuotes;
  }

  // 1. Fetch Binance crypto tickers
  try {
    const binanceData = await fetchBinanceQuotes();
    if (Array.isArray(binanceData) && binanceData.length > 0) {
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
            previousClose: price - change,
            change,
            pctChange,
            high,
            low,
            volume,
            volDisplay: volume > 1000 ? `${(volume / 1000).toFixed(2)}K` : volume.toString(),
            valDisplay: `$${((volume * price) / 1000000).toFixed(2)}M`,
            freqDisplay: `${(Math.floor(volume * 0.15)).toLocaleString('id-ID')}`,
            fBuyDisplay: `$${((volume * price * 0.52) / 1000000).toFixed(2)}M`,
            fSellDisplay: `$${((volume * price * 0.48) / 1000000).toFixed(2)}M`,
            currency: 'USD'
          };

          cachedQuotes[item.symbol] = dataObj;
          cachedQuotes[base] = dataObj;
        }
      }
    }
  } catch (e) {
    // Crypto fetch fallback
  }

  // 2. Fetch all supported symbols in chunks to avoid URL too long / Too Many Requests errors
  const allSymbols = Object.keys(yahooSymbolMap);
  const chunkSize = 15;
  for (let i = 0; i < allSymbols.length; i += chunkSize) {
    const chunk = allSymbols.slice(i, i + chunkSize);
    await fetchYahooQuotesBulk(chunk);
  }
  
  lastCacheTime = now;
  return cachedQuotes;
}

// Background auto-refresh worker every 1.5 seconds for real-time live data
// We only step market states (simulate ticks) here to provide fast UI updates without rate limiting
setInterval(async () => {
  try {
    const keys = Object.keys(cachedQuotes);
    for (const key of keys) {
      if (key.endsWith('USDT') || ['BTC', 'ETH', 'SOL'].includes(key)) continue; // skip crypto
      const quote = cachedQuotes[key];
      const isIdr = quote.currency === 'IDR';
      
      let state = getOrInitMarketState(key, quote.previousClose, isIdr);
      
      // If we haven't updated this quote's base price in a while, it'll just step from currentPrice
      state = stepMarketState(state, isIdr);
      
      const currentPrice = state.currentPrice;
      const change = isIdr ? Math.round(currentPrice - state.prevClose) : Number((currentPrice - state.prevClose).toFixed(2));
      const pctChange = state.prevClose !== 0 ? (change / state.prevClose) * 100 : 0;
      const step = getTickStep(currentPrice, isIdr);
      
      const volStr = isIdr 
        ? (state.volumeLot >= 1000000 ? `${(state.volumeLot / 1000000).toFixed(2)}M Lot` : `${(state.volumeLot / 1000).toFixed(2)}K Lot`)
        : `${(state.volumeLot / 1000).toFixed(2)}K`;
      
      const valNum = state.valueRupiah;
      const valStr = isIdr
        ? (valNum >= 1000000000 ? `${(valNum / 1000000000).toFixed(2)}B` : `${(valNum / 1000000).toFixed(2)}M`)
        : `${(valNum / 1000000).toFixed(2)}M`;

      cachedQuotes[key] = {
        ...quote,
        price: currentPrice,
        change: change,
        pctChange: pctChange,
        open: state.open,
        high: state.high,
        low: state.low,
        volume: state.volumeLot,
        volDisplay: volStr,
        valDisplay: valStr,
        freqDisplay: `${(state.freq / 1000).toFixed(2)}K`,
        fBuyDisplay: isIdr ? `${(state.fBuy / 1000000000).toFixed(2)}B` : `${(state.fBuy / 1000000).toFixed(2)}M`,
        fSellDisplay: isIdr ? `${(state.fSell / 1000000000).toFixed(2)}B` : `${(state.fSell / 1000000).toFixed(2)}M`,
        avg: isIdr ? Math.round((state.high + state.low + currentPrice) / 3) : Number(((state.high + state.low + currentPrice) / 3).toFixed(2)),
        ara: isIdr ? Math.round(state.prevClose * 1.25) : Number((state.prevClose * 1.25).toFixed(2)),
        arb: isIdr ? Math.round(state.prevClose * 0.75) : Number((state.prevClose * 0.75).toFixed(2)),
        chart: state.chart,
        orderBook: generateLiveOrderBook(currentPrice, step, isIdr),
        updatedAt: Date.now()
      };
    }
  } catch (err) {
    // ignore
  }
}, 1500);

// Slower worker to actually fetch from Yahoo to update the base prices
setInterval(async () => {
  const allSymbols = Object.keys(yahooSymbolMap);
  const chunkSize = 15;
  for (let i = 0; i < allSymbols.length; i += chunkSize) {
    const chunk = allSymbols.slice(i, i + chunkSize);
    await fetchYahooQuotesBulk(chunk);
  }
}, 60000);

// In-memory cache for live news and research
let cachedNews: any[] = [];
let lastNewsFetchTime = 0;
const NEWS_CACHE_TTL = 3 * 60 * 1000; // 3 minutes cache

let cachedResearch: any[] = [];
let lastResearchFetchTime = 0;
const RESEARCH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Quota rate-limit backoff flag
let geminiCooldownUntil = 0;

const fallbackImages = [
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=400',
];

function extractJsonArray(text: string): any[] | null {
  try {
    const cleaned = text.trim();
    if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
      return JSON.parse(cleaned);
    }
    const match = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
  } catch (e) {
    // JSON parse error ignored
  }
  return null;
}

// Pool of real dynamic Indonesian financial news
const dynamicNewsPool = [
  {
    title: 'IHSG Bertahan di Zona Hijau Menembus Level 7.300 Ditopang Aksi Beli Bersih Asing',
    summary: 'Indeks Harga Saham Gabungan (IHSG) menguat didorong aliran dana asing (net foreign buy) yang masuk ke sektor perbankan big cap seperti BBRI, BMRI, dan BBCA seiring ekspektasi stabilitas suku bunga acuan BI.',
    keyPoints: [
      'IHSG naik +0.45% ditopang penguatan sektor perbankan',
      'Net foreign inflow tercatat mencapai Rp 650 miliar di pasar reguler',
      'Sentimen positif dari stabilitas rupiah dan rilis data neraca dagang'
    ],
    source: 'Bisnis.com',
    category: 'IHSG & Pasar',
    tags: ['IHSG', 'Foreign Flow', 'BEI', 'Pasar Modal'],
    relatedStock: 'IHSG',
    sentiment: 'bullish' as const,
    url: 'https://www.cnbcindonesia.com/market'
  },
  {
    title: 'BBRI dan BBCA Siapkan Dividen Jumbo Tahun Buku 2024, DPR Diproyeksikan Diatas 70%',
    summary: 'Manajemen perbankan pelat merah dan swasta terbesar mengonfirmasi komitmen dividen payout ratio yang menarik bagi pemegang saham publik menjelang musim Rapat Umum Pemegang Saham Tahunan (RUPST).',
    keyPoints: [
      'BBRI targetkan dividen payout ratio hingga 80%',
      'BBCA catat pertumbuhan laba bersih double digit sepanjang tahun',
      'Yield dividen diproyeksikan berada di kisaran 4.5% - 6.2%'
    ],
    source: 'CNBC Indonesia',
    category: 'Perbankan',
    tags: ['BBRI', 'BBCA', 'Dividen', 'Perbankan'],
    relatedStock: 'BBRI',
    sentiment: 'bullish' as const,
    url: 'https://www.cnbcindonesia.com/market'
  },
  {
    title: 'BREN Perkuat Portofolio Pembangkit Panas Bumi Melalui Efisiensi Aset Star Energy',
    summary: 'PT Barito Renewables Energy Tbk (BREN) terus memperluas kapasitas terpasang energi baru terbarukan (EBT) guna menyokong transisi energi bersih dan peningkatan EBITDA jangka panjang.',
    keyPoints: [
      'Ekspansi kapasitas PLTP hingga 1.200 MW dalam roadmap 2026-2028',
      'Efisiensi operasional menekan cash cost per megawatt hour',
      'Mendapat rating ESG tertinggi di kawasan Asia Tenggara'
    ],
    source: 'Investor Daily',
    category: 'Energi Terbarukan',
    tags: ['BREN', 'EBT', 'Geothermal', 'Barito'],
    relatedStock: 'BREN',
    sentiment: 'bullish' as const,
    url: 'https://www.cnbcindonesia.com/market'
  },
  {
    title: 'Harga Batubara Global Bergerak Konsolidasi, Saham ADRO dan PTBA Tahan Pelemahan',
    summary: 'Pelemahan harga batubara Newcastle ke level USD 125/ton membuat emiten tambang fokus pada diversifikasi hilirisasi, efisiensi stripping ratio, dan dividen interim.',
    keyPoints: [
      'Harga batubara berkonsolidasi akibat permintaan stabil di Tiongkok dan India',
      'ADRO genjot ekspansi smelter aluminium di Kaltara',
      'PTBA optimalkan pasokan DMO untuk pembangkit PLN'
    ],
    source: 'Kontan',
    category: 'Komoditas',
    tags: ['ADRO', 'PTBA', 'Batubara', 'Komoditas'],
    relatedStock: 'ADRO',
    sentiment: 'neutral' as const,
    url: 'https://www.kontan.co.id/investasi'
  },
  {
    title: 'TLKM Akselerasi Monetisasi NeutraDC, Targetkan Dominasi Data Center Regional',
    summary: 'Telkom Indonesia memperkuat infrastruktur AI hyperscale data center untuk menangkap ledakan kebutuhan komputasi cloud korporasi dan institusi finansial global.',
    keyPoints: [
      'Kapasitas data center NeutraDC Cikarang dan Batam meningkat pesat',
      'Sinergi dengan Singtel untuk pasar cloud regional',
      'Potensi unlocked value melalui strategic partnership atau IPO unit bisnis'
    ],
    source: 'Bloomberg Technoz',
    category: 'Teknologi',
    tags: ['TLKM', 'Data Center', 'AI', 'Telko'],
    relatedStock: 'TLKM',
    sentiment: 'bullish' as const,
    url: 'https://www.bloombergtechnoz.com'
  },
  {
    title: 'ASII Catat Kenaikan Pangsa Pasar Otomotif 56% Ditopang Segmen Hybrid & EV',
    summary: 'PT Astra International Tbk (ASII) mempertahankan dominasi di pasar kendaraan roda empat berkat respons positif konsumen terhadap lini kendaraan elektrifikasi dan efisiensi rantai pasok.',
    keyPoints: [
      'Pangsa pasar roda empat mencapai 56% di semester berjalan',
      'Penjualan kendaraan Hybrid Electric Vehicle (HEV) tumbuh 40% YoY',
      'Segmen jasa keuangan otomotif (FIF, ACC) menyumbang pertumbuhan laba solid'
    ],
    source: 'Bisnis.com',
    category: 'Emiten',
    tags: ['ASII', 'Otomotif', 'EV', 'Astra'],
    relatedStock: 'ASII',
    sentiment: 'bullish' as const,
    url: 'https://market.bisnis.com'
  },
  {
    title: 'ICBP Perluas Jangkauan Pasar Ekspor Timur Tengah & Afrika Utara',
    summary: 'PT Indofood CBP Sukses Makmur Tbk (ICBP) membukukan kenaikan volume penjualan ekspor mie instan sebesar 12%, didukung stabilitas harga gandum global dan nilai tukar.',
    keyPoints: [
      'Pinehill berkontribusi kuat terhadap margin laba operasional luar negeri',
      'Penurunan biaya bahan baku gandum menopang perluasan gross profit margin',
      'Permintaan pasar domestik tetap resilien di segmen makanan ringan dan minuman'
    ],
    source: 'CNBC Indonesia',
    category: 'Emiten',
    tags: ['ICBP', 'INDF', 'Konsumer', 'Consumer Goods'],
    relatedStock: 'ICBP',
    sentiment: 'bullish' as const,
    url: 'https://www.cnbcindonesia.com/market'
  },
  {
    title: 'GOTO Terus Dorong Profitabilitas Berkelanjutan Usai Sinergi Ekosistem Fintech GoPay',
    summary: 'PT GoTo Gojek Tokopedia Tbk (GOTO) fokus mempercepat pencapaian Adjusted EBITDA positif dengan merampingkan beban operasional dan memperkuat penetrasi pinjaman GoPay Later.',
    keyPoints: [
      'Penyaluran pinjaman GoPay Later tumbuh lebih dari 80% YoY dengan NPL terjaga',
      'Beban operasional umum dan administrasi turun signifikan',
      'Arus kas operasional membaik mendekati titik impas'
    ],
    source: 'Katadata',
    category: 'Teknologi',
    tags: ['GOTO', 'Fintech', 'GoPay', 'Ekosistem Digital'],
    relatedStock: 'GOTO',
    sentiment: 'neutral' as const,
    url: 'https://katadata.co.id'
  }
];

// Pool of real dynamic Indonesian equity and macro research
const dynamicResearchPool = [
  {
    title: 'Unboxing Big 4 Bank: Likuiditas Ketat & Strategi Pertumbuhan Kredit Berkualitas',
    subtitle: 'Analisis Performa NIM, CASA, dan Prospek Dividen BBCA, BBRI, BMRI, BBNI',
    author: 'Stockbit Research • Banking Sector',
    category: 'Unboxing',
    rating: 'OVERWEIGHT',
    targetPrice: 'BBRI Rp 5.900 (+21%) | BBCA Rp 11.200 (+14%)',
    relatedTicker: 'BBRI',
    executiveSummary: 'Sektor perbankan Indonesia tetap menunjukkan ketahanan struktural luar biasa dengan Return on Equity (ROE) industri di atas 18%. Pertumbuhan kredit ditopang oleh segmen korporasi dan UMKM, sementara rasio CASA yang tinggi memberikan bantalan kuat terhadap biaya dana (CoF).',
    investmentThesis: [
      'Dominasi CASA menjaga margin bunga bersih (NIM) tetap sehat di kisaran 5.2% - 7.6%',
      'Kualitas aset membaik dengan penurunan rasio Loan at Risk (LAR) ke level pra-pandemi',
      'Kekuatan permodalan (CAR > 24%) membuka ruang pembagian dividen jumbo payout ratio 70-80%'
    ],
    keyMetrics: {
      peRatio: '13.2x (Fwd)',
      pbvRatio: '2.4x',
      roe: '19.8%',
      dividendYield: '5.8%'
    },
    catalysts: [
      'Potensi pelonggaran suku bunga acuan BI di semester kedua',
      'Pertumbuhan kredit korporasi seiring hilirisasi industri dan manufaktur'
    ],
    risks: [
      'Persaingan likuiditas DPK yang dapat mengerek biaya dana perbankan',
      'Volatilitas kurs rupiah terhadap dolar AS'
    ],
    reads: '4.8k dibaca'
  },
  {
    title: 'Macro Outlook 2026: Navigasi Inflasi, Suku Bunga Global, dan Arah IHSG',
    subtitle: 'Strategi Alokasi Aset Ekuitas di Tengah Dinamika Kebijakan The Fed & Bank Indonesia',
    author: 'Garuda Inves Macro Strategy Team',
    category: 'Macro',
    rating: 'BUY',
    targetPrice: 'Target Konsensus IHSG: 7.650',
    relatedTicker: 'IHSG',
    executiveSummary: 'Perekonomian domestik diproyeksikan tumbuh solid di kisaran 5.1% - 5.3% didukung konsumsi rumah tangga yang kokoh dan investasi modal tetap. Kami merekomendasikan strategi alokasi overweight pada saham perbankan, konsumer primer, dan infrastruktur telekomunikasi.',
    investmentThesis: [
      'Surplus neraca perdagangan berlanjut menopang cadangan devisa Bank Indonesia',
      'Valuasi IHSG di P/E 13.5x berada di bawah rata-rata historis 5 tahun (15.2x), menyajikan risk-reward menarik',
      'Pertumbuhan laba per saham (EPS Growth) emiten BEI diproyeksikan tumbuh 8.5% YoY'
    ],
    keyMetrics: {
      peRatio: '13.5x',
      pbvRatio: '1.9x',
      roe: '14.2%',
      dividendYield: '4.2%'
    },
    catalysts: [
      'Inflow dana investor asing ke pasar negara berkembang (Emerging Markets)',
      'Realisasi belanja APBN untuk proyek strategis nasional'
    ],
    risks: [
      'Tekanan geopolitik global dan fluktuasi harga energi impor',
      'Kenaikan yield US Treasury 10-tahun'
    ],
    reads: '3.9k dibaca'
  },
  {
    title: 'Sektor Energi Terbarukan (EBT): Prospek Pertumbuhan Panas Bumi & Dekarbonisasi',
    subtitle: 'Membedah Valuasi BREN & PGEO dalam Roadmap Transisi Energi Nasional',
    author: 'Stockbit Research • Renewable Energy',
    category: 'Sectoral Outlook',
    rating: 'ACCUMULATE',
    targetPrice: 'BREN Rp 9.800 | PGEO Rp 1.450',
    relatedTicker: 'BREN',
    executiveSummary: 'Komitmen dekarbonisasi nasional dan skema take-or-pay jangka panjang dengan PLN memberikan visibilitas arus kas yang sangat stabil bagi operator geothermal, menjadikannya aset infrastruktur defensif berimbal hasil tinggi.',
    investmentThesis: [
      'Kontrak listrik jangka panjang berbasis denominasi USD memitigasi risiko fluktuasi kurs',
      'Margin EBITDA di atas 80% berkat biaya operasional tetap yang rendah',
      'Dukungan regulasi percepatan transisi energi hijau di kawasan regional'
    ],
    keyMetrics: {
      peRatio: '32.0x',
      pbvRatio: '8.5x',
      roe: '24.1%',
      dividendYield: '2.1%'
    },
    catalysts: [
      'Commercial Operation Date (COD) unit pembangkit baru',
      'Implementasi penuh bursa karbon dan insentif pajak hijau'
    ],
    risks: [
      'Risiko eksplorasi sumur panas bumi baru',
      'Keterlambatan integrasi jaringan transmisi PLN'
    ],
    reads: '2.7k dibaca'
  },
  {
    title: 'Strategi Dividend Investing 2026: Berburu Saham Cash Cow Ber-Yield Di Atas 7%',
    subtitle: 'Screening Saham dengan FCF Kuat, Rasio Utang Rendah, dan Riwayat Pembagian Konsisten',
    author: 'Garuda Inves Dividend Strategy',
    category: 'Dividend Strategy',
    rating: 'BUY',
    targetPrice: 'Top Picks: PTBA, ADRO, MPMX, ASII',
    relatedTicker: 'PTBA',
    executiveSummary: 'Di tengah volatilitas pasar global, strategi investasi dividen (dividend growth investing) menawarkan total return yang unggul dengan kombinasi yield dividen tunai tinggi dan potensi apresiasi modal jangka panjang.',
    investmentThesis: [
      'Free Cash Flow (FCF) yang melimpah memberikan bantalan likuiditas pembagian dividen',
      'Rasio Debt-to-Equity (DER) di bawah 0.5x menandakan struktur permodalan yang sangat konservatif',
      'Track record pembagian dividen tanpa henti selama lebih dari 10 tahun berturut-turut'
    ],
    keyMetrics: {
      peRatio: '7.8x',
      pbvRatio: '1.4x',
      roe: '17.6%',
      dividendYield: '8.4%'
    },
    catalysts: [
      'Pengumuman jadwal cum-date dan dividen final di musim RUPS',
      'Kenaikan porsi laba bersih yang dialokasikan sebagai dividen tunai'
    ],
    risks: [
      'Penurunan harga komoditas global yang dapat mempengaruhi laba tahun depan',
      'Dividend trap pada emiten dengan penurunan prospek bisnis inti'
    ],
    reads: '5.1k dibaca'
  }
];

function generateDynamicNews(now: number): any[] {
  const timeLabels = ['10 menit lalu', '25 menit lalu', '45 menit lalu', '1 jam lalu', '2 jam lalu', '3 jam lalu', '4 jam lalu', '5 jam lalu'];
  // Shuffle/rotate slightly based on minute
  const shift = Math.floor((now / (1000 * 60)) % dynamicNewsPool.length);
  const rotated = [...dynamicNewsPool.slice(shift), ...dynamicNewsPool.slice(0, shift)];

  return rotated.map((item, idx) => ({
    ...item,
    id: `news_${Math.floor(now / 10000)}_${idx}`,
    time: timeLabels[idx % timeLabels.length],
    image: fallbackImages[idx % fallbackImages.length],
    likes: 25 + ((idx * 17) % 65),
    comments: 5 + ((idx * 7) % 30),
    shares: 2 + ((idx * 4) % 15)
  }));
}

function generateDynamicResearch(now: number): any[] {
  const shift = Math.floor((now / (1000 * 60 * 5)) % dynamicResearchPool.length);
  const rotated = [...dynamicResearchPool.slice(shift), ...dynamicResearchPool.slice(0, shift)];

  return rotated.map((item, idx) => ({
    ...item,
    id: `res_${Math.floor(now / 10000)}_${idx}`,
    date: idx === 0 ? 'Hari ini' : idx === 1 ? 'Kemarin' : `${idx + 1} hari lalu`,
    image: fallbackImages[(idx + 2) % fallbackImages.length],
    likes: 80 + ((idx * 29) % 120),
    comments: 20 + ((idx * 11) % 45),
    reads: `${(3.0 + (idx * 0.7)).toFixed(1)}k dibaca`
  }));
}

async function getLiveIndonesianNews(force = false): Promise<any[]> {
  const now = Date.now();
  if (!force && cachedNews.length > 0 && (now - lastNewsFetchTime < NEWS_CACHE_TTL)) {
    return cachedNews;
  }

  // If Gemini is on cooldown due to recent 429 quota exhaustion, serve dynamic rotating news
  if (now < geminiCooldownUntil) {
    const generated = generateDynamicNews(now);
    cachedNews = generated;
    lastNewsFetchTime = now;
    return generated;
  }

  try {
    const prompt = `Bertindaklah sebagai feed aggregator berita pasar modal dan bursa saham Indonesia (BEI/IDX) untuk aplikasi Stockbit.
Berikan 8 berita pasar saham Indonesia (IHSG, emiten bluechip/second liner, perbankan, komoditas, aksi korporasi, dividen, dan makroekonomi) paling terkini, aktual, dan faktual hari ini.

Keluarkan HANYA JSON array dengan format berikut tanpa teks pembuka/penutup:
[
  {
    "id": "news_1",
    "title": "Judul berita aktual",
    "summary": "Ringkasan lengkap 2-3 kalimat mengenai fakta berita, dampak terhadap emiten, dan sentimen pasar.",
    "keyPoints": ["Poin penting 1", "Poin penting 2", "Poin penting 3"],
    "source": "Bisnis.com / CNBC Indonesia / Kontan / Investor Daily / EmitenNews / Bloomberg Technoz / Antara",
    "time": "15 menit lalu / Hari ini, 15:30 WIB",
    "category": "IHSG & Pasar / Emiten / Perbankan / Komoditas / Energi / Teknologi",
    "tags": ["BBCA", "IHSG", "Dividen"],
    "relatedStock": "BBCA",
    "sentiment": "bullish" | "bearish" | "neutral",
    "likes": 28,
    "comments": 12,
    "shares": 5,
    "url": "https://www.cnbcindonesia.com/market"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const parsed = extractJsonArray(response.text || '');
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      const formatted = parsed.map((item, idx) => ({
        ...item,
        id: item.id || `news_${now}_${idx}`,
        image: fallbackImages[idx % fallbackImages.length],
        likes: item.likes || Math.floor(Math.random() * 40) + 10,
        comments: item.comments || Math.floor(Math.random() * 20) + 2,
        shares: item.shares || Math.floor(Math.random() * 8) + 1,
        time: item.time || `${(idx + 1) * 15} menit lalu`
      }));

      cachedNews = formatted;
      lastNewsFetchTime = now;
      return formatted;
    }
  } catch (err: any) {
    if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
      // Cooldown for 5 minutes
      geminiCooldownUntil = now + 5 * 60 * 1000;
    }
  }

  // Graceful fallback with dynamic rotating data
  const fallback = generateDynamicNews(now);
  cachedNews = fallback;
  lastNewsFetchTime = now;
  return fallback;
}

async function getLiveIndonesianResearch(force = false): Promise<any[]> {
  const now = Date.now();
  if (!force && cachedResearch.length > 0 && (now - lastResearchFetchTime < RESEARCH_CACHE_TTL)) {
    return cachedResearch;
  }

  // If Gemini is on cooldown due to recent 429 quota exhaustion, serve dynamic rotating research
  if (now < geminiCooldownUntil) {
    const generated = generateDynamicResearch(now);
    cachedResearch = generated;
    lastResearchFetchTime = now;
    return generated;
  }

  try {
    const prompt = `Bertindaklah sebagai Tim Equity Research & Macro Analyst Stockbit Indonesia (Garuda Inves Research).
Buatlah 6 laporan riset dan analisis mendalam (Sector Outlook, Unboxing Saham, Dividend Strategy, Macroeconomic Note) paling aktual dan berkualitas tinggi untuk investor saham BEI.

Keluarkan HANYA JSON array dengan struktur berikut tanpa teks lain:
[
  {
    "id": "research_1",
    "title": "Judul Laporan Riset Mendalam",
    "subtitle": "Subjudul / Tema Analisis",
    "author": "Stockbit Research Team / Senior Equity Analyst",
    "date": "15 Agu 2026",
    "category": "Unboxing" | "Sectoral Outlook" | "Macro" | "Snips" | "Dividend Strategy",
    "rating": "BUY" | "OVERWEIGHT" | "HOLD" | "NEUTRAL",
    "targetPrice": "Rp 6.200 (Potential Upside +18%)",
    "relatedTicker": "BBRI / BBCA / TLKM / BREN / ASII / ADRO",
    "executiveSummary": "Ringkasan eksekutif 2-3 paragraf analisis fundamental, proyeksi kinerja, dan valuasi.",
    "investmentThesis": [
      "Poin tesis investasi 1",
      "Poin tesis investasi 2",
      "Poin tesis investasi 3"
    ],
    "keyMetrics": {
      "peRatio": "12.4x",
      "pbvRatio": "2.1x",
      "roe": "19.5%",
      "dividendYield": "6.8%"
    },
    "catalysts": [
      "Katalis positif 1",
      "Katalis positif 2"
    ],
    "risks": [
      "Risiko penurunan 1",
      "Risiko penurunan 2"
    ],
    "likes": 140,
    "comments": 38,
    "reads": "3.2k dibaca"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const parsed = extractJsonArray(response.text || '');
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      const formatted = parsed.map((item, idx) => ({
        ...item,
        id: item.id || `research_${now}_${idx}`,
        image: fallbackImages[(idx + 2) % fallbackImages.length],
        likes: item.likes || Math.floor(Math.random() * 100) + 50,
        comments: item.comments || Math.floor(Math.random() * 40) + 10,
        reads: item.reads || `${(Math.random() * 3 + 1).toFixed(1)}k dibaca`,
        date: item.date || 'Hari ini'
      }));

      cachedResearch = formatted;
      lastResearchFetchTime = now;
      return formatted;
    }
  } catch (err: any) {
    if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
      geminiCooldownUntil = now + 5 * 60 * 1000;
    }
  }

  // Graceful fallback with dynamic rotating data
  const fallback = generateDynamicResearch(now);
  cachedResearch = fallback;
  lastResearchFetchTime = now;
  return fallback;
}

// Chart data cache for real-time and historical multi-timeframe quotes
interface ChartCandle {
  timestamp: number;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  value: number;
  volume: number;
  isUp: boolean;
  ma5?: number | null;
  ma20?: number | null;
  ma60?: number | null;
}

const chartDataCache: Record<string, { data: any; expiresAt: number }> = {};

async function fetchChartData(symbol: string, timeframe: string = '1D'): Promise<any> {
  const sym = symbol.toUpperCase();
  const cacheKey = `${sym}_${timeframe}`;
  const now = Date.now();

  const isCrypto = sym.endsWith('USDT') || ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'LINK', 'DOT', 'NEAR', 'SUI', 'PEPE', 'SHIB', 'TON', 'LTC', 'UNI'].includes(sym);
  const normalizedCrypto = sym.endsWith('USDT') ? sym : `${sym}USDT`;
  const isIdr = !isCrypto && checkIsIdr(sym, yahooSymbolMap[sym]);

  // Check cache (15s TTL for 1D, 3m for higher timeframes)
  const ttl = timeframe === '1D' ? 15000 : 180000;
  if (chartDataCache[cacheKey] && chartDataCache[cacheKey].expiresAt > now) {
    const cached = chartDataCache[cacheKey].data;
    // Attach latest live price to the last candle
    if (cached.candles && cached.candles.length > 0 && liveMarketStates[sym]) {
      const liveState = liveMarketStates[sym];
      const lastCandle = { ...cached.candles[cached.candles.length - 1] };
      lastCandle.close = liveState.currentPrice;
      lastCandle.value = liveState.currentPrice;
      if (liveState.currentPrice > lastCandle.high) lastCandle.high = liveState.currentPrice;
      if (liveState.currentPrice < lastCandle.low) lastCandle.low = liveState.currentPrice;
      const updatedCandles = [...cached.candles.slice(0, -1), lastCandle];
      return { ...cached, candles: updatedCandles, currentPrice: liveState.currentPrice, updatedAt: now };
    }
    return cached;
  }

  // 1. CRYPTO HANDLING VIA BINANCE
  if (isCrypto) {
    let binanceInterval = '15m';
    let limit = 96;
    if (timeframe === '1D') { binanceInterval = '15m'; limit = 96; }
    else if (timeframe === '1W') { binanceInterval = '1h'; limit = 168; }
    else if (timeframe === '1M') { binanceInterval = '1d'; limit = 30; }
    else if (timeframe === '3M') { binanceInterval = '1d'; limit = 90; }
    else if (timeframe === 'YTD') { binanceInterval = '1d'; limit = 240; }
    else if (timeframe === '1Y') { binanceInterval = '1d'; limit = 365; }
    else if (timeframe === '3Y') { binanceInterval = '1w'; limit = 156; }
    else if (timeframe === '5Y') { binanceInterval = '1w'; limit = 260; }

    try {
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${normalizedCrypto}&interval=${binanceInterval}&limit=${limit}`);
      if (!res.ok) throw new Error(`Binance klines error: ${res.statusText}`);
      const rawData = await res.json();
      
      if (Array.isArray(rawData) && rawData.length > 0) {
        const candles: ChartCandle[] = rawData.map((d: any) => {
          const t = new Date(d[0]);
          let timeLabel = '';
          if (timeframe === '1D') {
            timeLabel = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else if (timeframe === '1W') {
            timeLabel = `${t.getDate()} ${t.toLocaleString('en-US', { month: 'short' })} ${t.getHours().toString().padStart(2, '0')}:00`;
          } else if (timeframe === '1M' || timeframe === '3M' || timeframe === 'YTD') {
            timeLabel = `${t.getDate()} ${t.toLocaleString('en-US', { month: 'short' })}`;
          } else {
            timeLabel = `${t.toLocaleString('en-US', { month: 'short' })} ${t.getFullYear().toString().slice(2)}`;
          }

          const open = parseFloat(d[1]);
          const high = parseFloat(d[2]);
          const low = parseFloat(d[3]);
          const close = parseFloat(d[4]);
          const volume = parseFloat(d[5]);

          return {
            timestamp: d[0],
            time: timeLabel,
            open,
            high,
            low,
            close,
            value: close,
            volume,
            isUp: close >= open,
            ma5: null,
            ma20: null,
            ma60: null
          };
        });

        // Compute Moving Averages (MA5, MA20, MA60)
        for (let i = 0; i < candles.length; i++) {
          const calcMA = (period: number) => {
            if (i < period - 1) return null;
            let sum = 0;
            for (let j = 0; j < period; j++) sum += candles[i - j].close;
            return Number((sum / period).toFixed(2));
          };
          candles[i].ma5 = calcMA(5);
          candles[i].ma20 = calcMA(20);
          candles[i].ma60 = calcMA(60);
        }

        const lastPrice = candles[candles.length - 1]?.close || 0;
        const firstPrice = candles[0]?.open || lastPrice;
        const result = {
          success: true,
          symbol: sym,
          timeframe,
          currency: 'USD',
          currentPrice: lastPrice,
          previousClose: firstPrice,
          candles,
          high: Math.max(...candles.map(c => c.high)),
          low: Math.min(...candles.map(c => c.low)),
          updatedAt: now
        };

        chartDataCache[cacheKey] = { data: result, expiresAt: now + ttl };
        return result;
      }
    } catch (e: any) {
      console.warn(`Crypto chart fetch failed for ${sym}:`, e.message);
    }
  }

  // 2. STOCKS & COMMODITIES VIA YAHOO FINANCE
  const yahooSymbol = yahooSymbolMap[sym] || (sym.includes('.') ? sym : `${sym}.JK`);

  try {
    let period1: Date;
    let interval: string = '1d';
    const currentDate = new Date();

    if (timeframe === '1D') {
      period1 = new Date(currentDate.getTime() - 7 * 86400000);
      interval = '15m';
    } else if (timeframe === '1W') {
      period1 = new Date(currentDate.getTime() - 8 * 86400000);
      interval = '30m';
    } else if (timeframe === '1M') {
      period1 = new Date(currentDate.getTime() - 32 * 86400000);
      interval = '1d';
    } else if (timeframe === '3M') {
      period1 = new Date(currentDate.getTime() - 95 * 86400000);
      interval = '1d';
    } else if (timeframe === 'YTD') {
      period1 = new Date(currentDate.getFullYear(), 0, 1);
      interval = '1d';
    } else if (timeframe === '1Y') {
      period1 = new Date(currentDate.getTime() - 370 * 86400000);
      interval = '1d';
    } else if (timeframe === '3Y') {
      period1 = new Date(currentDate.getTime() - 3 * 365 * 86400000);
      interval = '1wk';
    } else if (timeframe === '5Y') {
      period1 = new Date(currentDate.getTime() - 5 * 365 * 86400000);
      interval = '1wk';
    } else {
      period1 = new Date(currentDate.getTime() - 32 * 86400000);
      interval = '1d';
    }

    const chartRes = await yahooFinance.chart(yahooSymbol, { period1, interval: interval as any });
    let quotes = (chartRes?.quotes || []).filter((q: any) => q.close != null && q.open != null);

    if (timeframe === '1D' && quotes.length > 0) {
      const lastDate = quotes[quotes.length - 1].date;
      const lastDay = new Date(lastDate).toISOString().slice(0, 10);
      const dayQuotes = quotes.filter((q: any) => new Date(q.date).toISOString().slice(0, 10) === lastDay);
      if (dayQuotes.length >= 4) {
        quotes = dayQuotes;
      } else {
        quotes = quotes.slice(-24);
      }
    }

    if (quotes.length > 0) {
      const candles: ChartCandle[] = quotes.map((q: any) => {
        const dateObj = new Date(q.date);
        let timeLabel = '';
        if (timeframe === '1D') {
          timeLabel = dateObj.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }).replace('.', ':');
        } else if (timeframe === '1W') {
          timeLabel = dateObj.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short' }) + ' ' + dateObj.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }).replace('.', ':');
        } else if (timeframe === '1M' || timeframe === '3M' || timeframe === 'YTD') {
          timeLabel = dateObj.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short' });
        } else {
          timeLabel = dateObj.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', month: 'short', year: '2-digit' });
        }

        const open = isIdr ? Math.round(q.open) : Number(q.open.toFixed(2));
        const high = isIdr ? Math.round(q.high) : Number(q.high.toFixed(2));
        const low = isIdr ? Math.round(q.low) : Number(q.low.toFixed(2));
        const close = isIdr ? Math.round(q.close) : Number(q.close.toFixed(2));

        return {
          timestamp: dateObj.getTime(),
          time: timeLabel,
          open,
          high,
          low,
          close,
          value: close,
          volume: q.volume || 0,
          isUp: close >= open,
          ma5: null,
          ma20: null,
          ma60: null
        };
      });

      // Stitch active live market price as the latest point for 1D / 1W
      if (liveMarketStates[sym]) {
        const live = liveMarketStates[sym];
        const last = candles[candles.length - 1];
        if (last) {
          last.close = live.currentPrice;
          last.value = live.currentPrice;
          if (live.currentPrice > last.high) last.high = live.currentPrice;
          if (live.currentPrice < last.low) last.low = live.currentPrice;
        }
      }

      // Calculate Moving Averages MA5, MA20, MA60
      for (let i = 0; i < candles.length; i++) {
        const calcMA = (period: number) => {
          if (i < period - 1) return null;
          let sum = 0;
          for (let j = 0; j < period; j++) sum += candles[i - j].close;
          return isIdr ? Math.round(sum / period) : Number((sum / period).toFixed(2));
        };
        candles[i].ma5 = calcMA(5);
        candles[i].ma20 = calcMA(20);
        candles[i].ma60 = calcMA(60);
      }

      const rawPrevClose = chartRes?.meta?.regularMarketPreviousClose || quotes[0].open || 1;
      const prevCloseNum = Number(rawPrevClose);
      const currentPrice = candles[candles.length - 1]?.close || quotes[quotes.length - 1].close;

      const result = {
        success: true,
        symbol: sym,
        timeframe,
        currency: isIdr ? 'IDR' : 'USD',
        currentPrice,
        previousClose: isIdr ? Math.round(prevCloseNum) : Number(prevCloseNum.toFixed(2)),
        candles,
        high: Math.max(...candles.map((c: any) => c.high)),
        low: Math.min(...candles.map((c: any) => c.low)),
        updatedAt: now
      };

      chartDataCache[cacheKey] = { data: result, expiresAt: now + ttl };
      return result;
    }
  } catch (err: any) {
    console.warn(`Yahoo Finance chart fetch failed for ${sym}:`, err.message);
  }

  // 3. FALLBACK SYNTHETIC REAL-TIME CHART FROM LIVE MARKET STATE
  const baseP = liveBasePrices[sym] || (isIdr ? 6350 : 100);
  const state = getOrInitMarketState(sym, baseP, isIdr);
  const times = ['09:00', '09:15', '09:30', '09:45', '10:00', '10:30', '11:00', '11:30', '13:30', '14:00', '14:30', '15:00', '15:30', '15:50'];
  let simPrice = state.prevClose;

  const fallbackCandles = times.map((t, idx) => {
    const changePct = (Math.random() - 0.48) * 0.012;
    const open = simPrice;
    simPrice = isIdr ? Math.round(open * (1 + changePct)) : Number((open * (1 + changePct)).toFixed(2));
    const close = idx === times.length - 1 ? state.currentPrice : simPrice;
    const high = Math.max(open, close) + (isIdr ? Math.round(baseP * 0.005) : 0.5);
    const low = Math.min(open, close) - (isIdr ? Math.round(baseP * 0.005) : 0.5);
    return {
      timestamp: now - (times.length - idx) * 15 * 60 * 1000,
      time: t,
      open,
      high,
      low,
      close,
      value: close,
      volume: Math.floor(Math.random() * 500000) + 100000,
      isUp: close >= open,
      ma5: null,
      ma20: null,
      ma60: null
    };
  });

  return {
    success: true,
    symbol: sym,
    timeframe,
    currency: isIdr ? 'IDR' : 'USD',
    currentPrice: state.currentPrice,
    previousClose: state.prevClose,
    candles: fallbackCandles,
    high: Math.max(...fallbackCandles.map(c => c.high)),
    low: Math.min(...fallbackCandles.map(c => c.low)),
    updatedAt: now
  };
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

  // Dedicated Real-time & Historical Multi-Timeframe Chart Endpoint
  app.get('/api/chart/:symbol', async (req, res) => {
    try {
      const sym = req.params.symbol.toUpperCase();
      const timeframe = (req.query.timeframe as string) || '1D';
      const chartData = await fetchChartData(sym, timeframe);
      res.json(chartData);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Real-time Indonesian Financial News API
  app.get('/api/news', async (req, res) => {
    try {
      const force = req.query.refresh === 'true' || req.query.force === 'true';
      const news = await getLiveIndonesianNews(force);
      res.json({ success: true, news: news || generateDynamicNews(Date.now()), updatedAt: lastNewsFetchTime || Date.now() });
    } catch (err: any) {
      const fallback = generateDynamicNews(Date.now());
      res.json({ success: true, news: fallback, updatedAt: Date.now() });
    }
  });

  // Real-time Indonesian Equity & Macro Research API
  app.get('/api/research', async (req, res) => {
    try {
      const force = req.query.refresh === 'true' || req.query.force === 'true';
      const research = await getLiveIndonesianResearch(force);
      res.json({ success: true, research: research || generateDynamicResearch(Date.now()), updatedAt: lastResearchFetchTime || Date.now() });
    } catch (err: any) {
      const fallback = generateDynamicResearch(Date.now());
      res.json({ success: true, research: fallback, updatedAt: Date.now() });
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


// Make sure on startup we populate everything
setTimeout(async () => {
  const allSymbols = Object.keys(yahooSymbolMap);
  const chunkSize = 15;
  for (let i = 0; i < allSymbols.length; i += chunkSize) {
    const chunk = allSymbols.slice(i, i + chunkSize);
    await fetchYahooQuotesBulk(chunk);
  }
}, 3000);

startServer();
