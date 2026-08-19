// Clean Decoupled Asset Engine Types for AI Studio / Stockbit Engine Architecture

export type AssetType = 'crypto' | 'stock_us' | 'stock_id';
export type MarketType = 'CRYPTO' | 'US' | 'IDX';
export type CurrencyType = 'USD' | 'IDR';

export type TradingSessionStatus = 
  | 'open' 
  | 'closed' 
  | 'pre_market' 
  | 'after_hours' 
  | 'pre_open' 
  | 'break' 
  | 'pre_close';

export interface MarketStatusInfo {
  session: TradingSessionStatus;
  label: string;
  isOpen: boolean;
  canTrade: boolean;
  description: string;
  nextSessionTime?: string;
}

export interface OrderCalculationParams {
  price: number;
  inputMode: 'lot' | 'shares' | 'amount_idr' | 'amount_usd';
  inputValue: number;
  leverageMultiplier?: number;
  usdToIdrRate?: number;
}

export interface OrderCalculationResult {
  price: number;
  lot: number | null; // number for IDX, null for crypto & stock_us
  quantity: number; // total shares or token amount (lot * 100 for IDX, float for crypto/US)
  grossAmountIdr: number;
  grossAmountUsd: number;
  feeAmountIdr: number;
  feeAmountUsd: number;
  netTotalIdr: number;
  netTotalUsd: number;
  currency: CurrencyType;
  formattedPrice: string;
  formattedQuantity: string;
  formattedTotal: string;
}

export interface OrderValidationParams {
  price: number;
  lot?: number | null;
  quantity: number;
  userBalanceIdr: number;
  userBalanceUsd: number;
  orderType: 'BUY' | 'SELL';
  userOwnedQuantity?: number;
  usdToIdrRate?: number;
}

export interface OrderValidationResult {
  isValid: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export interface PortfolioRecord {
  symbol: string;
  assetType: AssetType;
  market: MarketType;
  quantity: number;
  lot: number | null; // lot for IDX, null for crypto and US
  averagePrice: number;
  currentPrice: number;
  currency: CurrencyType;
  investedValue: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  updatedAt: number;
  stockName?: string;
}

export interface IAssetEngine {
  readonly assetType: AssetType;
  readonly market: MarketType;
  readonly currency: CurrencyType;
  readonly lotSize: number | null;
  readonly is24Hours: boolean;
  readonly allowsFractional: boolean;
  readonly minOrderAmount: number;

  getMarketStatus(): MarketStatusInfo;
  formatPrice(price: number): string;
  formatQuantity(quantity: number, lot?: number | null): string;
  formatCurrencyValue(amount: number, currency?: CurrencyType): string;
  calculateOrder(params: OrderCalculationParams): OrderCalculationResult;
  validateOrder(params: OrderValidationParams): OrderValidationResult;
  calculateFee(grossAmount: number, orderType: 'BUY' | 'SELL'): number;
  calculatePortfolio(item: {
    symbol: string;
    quantity: number;
    lot?: number | null;
    averagePrice: number;
    currentPrice: number;
    stockName?: string;
    updatedAt?: number;
  }): PortfolioRecord;
}
