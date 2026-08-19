// Unified Conditional Engine Dispatcher
// Dispatches strictly based on assetType: 'crypto' -> CryptoEngine, 'stock_us' -> USStockEngine, 'stock_id' -> IDXStockEngine

import { AssetType, MarketType, CurrencyType, IAssetEngine, PortfolioRecord } from './types';
import { cryptoEngine, CryptoEngine } from './CryptoEngine';
import { usStockEngine, USStockEngine } from './USStockEngine';
import { idxStockEngine, IDXStockEngine } from './IDXStockEngine';
import { isIDXStock } from '../lib/assetsData';

export * from './types';
export * from './CryptoEngine';
export * from './USStockEngine';
export * from './IDXStockEngine';

// Hardcoded explicit mappings for prominent assets
const CRYPTO_SYMBOLS = new Set([
  'BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'PEPE', 'SHIB', 'TON', 'LTC', 'UNI', 
  'BNB', 'ADA', 'AVAX', 'MATIC', 'LINK', 'DOT', 'NEAR', 'SUI', 'ATOM', 'ARB', 
  'OP', 'RENDER', 'FET', 'INJ', 'TRX', 'APT', 'TIA', 'KAS', 'FIL', 'STX', 
  'ICP', 'BONK', 'WIF', 'FLOKI', 'JUP', 'PYTH', 'ORDI', 'RUNE', 'AAVE', 'MKR',
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'PEPEUSDT', 'SHIBUSDT'
]);

const US_STOCK_SYMBOLS = new Set([
  'NVDA', 'AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'GOOG', 'META', 'NFLX', 
  'AMD', 'INTC', 'COIN', 'JPM', 'V', 'MA', 'WMT', 'DIS', 'PYPL', 'CRM', 
  'ORCL', 'CSCO', 'ADBE', 'NKE', 'MCD', 'BABA', 'PLTR', 'UBER', 'ABNB', 'QCOM', 'TXN'
]);

/**
 * Detects the AssetType, Market, and Currency for any given ticker/symbol.
 */
export function detectAssetType(symbol: string): {
  assetType: AssetType;
  market: MarketType;
  currency: CurrencyType;
  lotSize: number | null;
} {
  const cleanSym = symbol.replace('USDT', '').toUpperCase();

  if (CRYPTO_SYMBOLS.has(symbol.toUpperCase()) || CRYPTO_SYMBOLS.has(cleanSym)) {
    return {
      assetType: 'crypto',
      market: 'CRYPTO',
      currency: 'USD',
      lotSize: null
    };
  }

  if (US_STOCK_SYMBOLS.has(cleanSym)) {
    return {
      assetType: 'stock_us',
      market: 'US',
      currency: 'USD',
      lotSize: null
    };
  }

  // Indonesian IDX Stocks
  if (isIDXStock(cleanSym) || isIDXStock(symbol)) {
    return {
      assetType: 'stock_id',
      market: 'IDX',
      currency: 'IDR',
      lotSize: 100
    };
  }

  // Default fallback based on naming convention
  if (symbol.endsWith('USDT')) {
    return {
      assetType: 'crypto',
      market: 'CRYPTO',
      currency: 'USD',
      lotSize: null
    };
  }

  return {
    assetType: 'stock_id',
    market: 'IDX',
    currency: 'IDR',
    lotSize: 100
  };
}

/**
 * Returns the exact decoupled engine instance for an assetType.
 * CONDITIONAL ENGINE: Never mix transactions or pricing rules!
 */
export function getAssetEngine(assetType: AssetType): IAssetEngine {
  if (assetType === 'crypto') {
    return cryptoEngine;
  }
  if (assetType === 'stock_us') {
    return usStockEngine;
  }
  if (assetType === 'stock_id') {
    return idxStockEngine;
  }
  return idxStockEngine;
}

/**
 * Returns the exact engine instance for any symbol directly.
 */
export function getEngineForSymbol(symbol: string): IAssetEngine {
  const { assetType } = detectAssetType(symbol);
  return getAssetEngine(assetType);
}

/**
 * Helper to format price according to engine specifications:
 * - Crypto: $64,250.00 or $0.0000034
 * - US Stock: $225.26
 * - IDX Stock: Rp3.080
 */
export function formatAssetPrice(symbol: string, price: number): string {
  const engine = getEngineForSymbol(symbol);
  return engine.formatPrice(price);
}

/**
 * Helper to format quantity according to engine specifications:
 * - Crypto: 0.00235 BTC / 1,000,000 PEPE
 * - US Stock: 2.5 shares / 10 shares
 * - IDX Stock: 5 Lot (500 Saham)
 */
export function formatAssetQuantity(symbol: string, quantity: number, lot?: number | null): string {
  const engine = getEngineForSymbol(symbol);
  return engine.formatQuantity(quantity, lot);
}

/**
 * Helper to process any portfolio item using its corresponding engine.
 */
export function processPortfolioItem(item: {
  symbol: string;
  quantity?: number;
  lot?: number | null;
  avgPrice?: number;
  averagePrice?: number;
  price?: number;
  currentPrice?: number;
  stockName?: string;
  updatedAt?: number;
}): PortfolioRecord {
  const symbol = item.symbol;
  const engine = getEngineForSymbol(symbol);
  const avg = item.avgPrice || item.averagePrice || item.price || 0;
  const current = item.currentPrice || item.price || avg;
  
  let quantity = item.quantity || 0;
  let lot = item.lot !== undefined ? item.lot : null;

  if (engine.assetType === 'stock_id') {
    if (lot !== null && lot !== undefined) {
      quantity = lot * 100;
    } else if (quantity > 0) {
      lot = Math.floor(quantity / 100);
      quantity = lot * 100;
    }
  }

  return engine.calculatePortfolio({
    symbol,
    quantity,
    lot,
    averagePrice: avg,
    currentPrice: current,
    stockName: item.stockName,
    updatedAt: item.updatedAt
  });
}
