// 1. BITCOIN & CRYPTOCURRENCY ENGINE
// Dedicated 24/7 Decoupled Engine for Cryptocurrency Assets (BTC, ETH, SOL, DOGE, PEPE, SHIB, TON, LTC, UNI, etc.)

import { 
  IAssetEngine, 
  AssetType, 
  MarketType, 
  CurrencyType, 
  MarketStatusInfo, 
  OrderCalculationParams, 
  OrderCalculationResult, 
  OrderValidationParams, 
  OrderValidationResult, 
  PortfolioRecord 
} from './types';

export const DEFAULT_USD_TO_IDR = 16250;

export class CryptoEngine implements IAssetEngine {
  readonly assetType: AssetType = 'crypto';
  readonly market: MarketType = 'CRYPTO';
  readonly currency: CurrencyType = 'USD';
  readonly lotSize: number | null = null; // Crypto has NO concept of lot
  readonly is24Hours: boolean = true; // Crypto market runs 24/7/365
  readonly allowsFractional: boolean = true; // Fractional & decimal tokens supported
  readonly minOrderAmount: number = 10000; // Minimum IDR equivalent ~Rp 10.000 or ~$1

  getMarketStatus(): MarketStatusInfo {
    return {
      session: 'open',
      label: '24/7 Real-Time',
      isOpen: true,
      canTrade: true,
      description: 'Pasar Cryptocurrency aktif 24 jam nonstop tanpa jam bursa.'
    };
  }

  formatPrice(price: number): string {
    if (!price || isNaN(price)) return '$0.00';
    if (price < 0.00001) {
      return `$${price.toFixed(8)}`;
    } else if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else if (price < 100) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    } else {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }

  formatQuantity(quantity: number, _lot?: number | null): string {
    if (!quantity || isNaN(quantity)) return '0';
    if (quantity < 0.001) {
      return quantity.toFixed(6);
    } else if (quantity < 1) {
      return quantity.toFixed(4);
    } else if (Number.isInteger(quantity)) {
      return quantity.toLocaleString('en-US');
    } else {
      return quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
    }
  }

  formatCurrencyValue(amount: number, curr: CurrencyType = 'USD'): string {
    if (curr === 'USD') {
      return this.formatPrice(amount);
    }
    return `Rp ${Math.round(amount).toLocaleString('id-ID')}`;
  }

  calculateOrder(params: OrderCalculationParams): OrderCalculationResult {
    const { price, inputMode, inputValue, usdToIdrRate = DEFAULT_USD_TO_IDR } = params;
    let quantity = 0;
    let grossAmountUsd = 0;
    let grossAmountIdr = 0;

    if (inputMode === 'amount_idr') {
      // User typed e.g. Rp 100.000
      grossAmountIdr = Math.max(0, inputValue);
      grossAmountUsd = grossAmountIdr / usdToIdrRate;
      quantity = price > 0 ? grossAmountUsd / price : 0;
    } else if (inputMode === 'amount_usd') {
      // User typed e.g. $50
      grossAmountUsd = Math.max(0, inputValue);
      grossAmountIdr = grossAmountUsd * usdToIdrRate;
      quantity = price > 0 ? grossAmountUsd / price : 0;
    } else {
      // User typed exact token quantity (e.g. 0.005 BTC or 1,000,000 PEPE)
      quantity = Math.max(0, inputValue);
      grossAmountUsd = quantity * price;
      grossAmountIdr = grossAmountUsd * usdToIdrRate;
    }

    // Crypto standard taker/network fee ~0.1%
    const feePct = 0.001;
    const feeAmountUsd = grossAmountUsd * feePct;
    const feeAmountIdr = grossAmountIdr * feePct;

    const netTotalUsd = grossAmountUsd + feeAmountUsd;
    const netTotalIdr = grossAmountIdr + feeAmountIdr;

    return {
      price,
      lot: null, // Strictly null for crypto
      quantity,
      grossAmountIdr,
      grossAmountUsd,
      feeAmountIdr,
      feeAmountUsd,
      netTotalIdr,
      netTotalUsd,
      currency: 'USD',
      formattedPrice: this.formatPrice(price),
      formattedQuantity: this.formatQuantity(quantity),
      formattedTotal: `Rp ${Math.round(netTotalIdr).toLocaleString('id-ID')} (~${this.formatPrice(netTotalUsd)})`
    };
  }

  calculateFee(grossAmount: number, _orderType: 'BUY' | 'SELL'): number {
    return grossAmount * 0.001; // 0.1% crypto network/broker fee
  }

  validateOrder(params: OrderValidationParams): OrderValidationResult {
    const { price, quantity, userBalanceIdr, orderType, userOwnedQuantity = 0, usdToIdrRate = DEFAULT_USD_TO_IDR } = params;

    if (price <= 0) {
      return { isValid: false, errorCode: 'INVALID_PRICE', errorMessage: 'Harga crypto tidak valid.' };
    }

    if (quantity <= 0) {
      return { isValid: false, errorCode: 'INVALID_QUANTITY', errorMessage: 'Jumlah aset crypto harus lebih dari 0.' };
    }

    const orderValueUsd = quantity * price;
    const orderValueIdr = orderValueUsd * usdToIdrRate;

    if (orderType === 'BUY') {
      if (orderValueIdr < this.minOrderAmount) {
        return {
          isValid: false,
          errorCode: 'MIN_ORDER_AMOUNT',
          errorMessage: `Minimal order crypto adalah Rp ${this.minOrderAmount.toLocaleString('id-ID')} (~$${(this.minOrderAmount / usdToIdrRate).toFixed(2)})`
        };
      }

      if (userBalanceIdr < orderValueIdr) {
        return {
          isValid: false,
          errorCode: 'INSUFFICIENT_BALANCE',
          errorMessage: `Saldo RDN tidak mencukupi (Dibutuhkan: Rp ${Math.round(orderValueIdr).toLocaleString('id-ID')}, Saldo: Rp ${Math.round(userBalanceIdr).toLocaleString('id-ID')})`
        };
      }
    } else if (orderType === 'SELL') {
      if (userOwnedQuantity < quantity) {
        return {
          isValid: false,
          errorCode: 'INSUFFICIENT_QUANTITY',
          errorMessage: `Jumlah crypto yang dimiliki tidak mencukupi (${this.formatQuantity(userOwnedQuantity)} tersedia).`
        };
      }
    }

    return { isValid: true };
  }

  calculatePortfolio(item: {
    symbol: string;
    quantity: number;
    lot?: number | null;
    averagePrice: number;
    currentPrice: number;
    stockName?: string;
    updatedAt?: number;
  }): PortfolioRecord {
    const { symbol, quantity, averagePrice, currentPrice, stockName, updatedAt = Date.now() } = item;
    const investedValue = quantity * averagePrice;
    const currentValue = quantity * currentPrice;
    const profitLoss = currentValue - investedValue;
    const profitLossPercent = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0;

    return {
      symbol,
      assetType: 'crypto',
      market: 'CRYPTO',
      quantity,
      lot: null, // Strictly null
      averagePrice,
      currentPrice,
      currency: 'USD',
      investedValue,
      currentValue,
      profitLoss,
      profitLossPercent,
      updatedAt,
      stockName: stockName || `${symbol} Crypto Token`
    };
  }
}

export const cryptoEngine = new CryptoEngine();
