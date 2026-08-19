// 2. SAHAM AMERIKA SERIKAT (US STOCK) ENGINE
// Dedicated Decoupled Engine for US Equities (NVDA, AAPL, TSLA, MSFT, AMZN, GOOGL, META, NFLX, etc.)

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
import { DEFAULT_USD_TO_IDR } from './CryptoEngine';

export class USStockEngine implements IAssetEngine {
  readonly assetType: AssetType = 'stock_us';
  readonly market: MarketType = 'US';
  readonly currency: CurrencyType = 'USD';
  readonly lotSize: number | null = null; // US Stocks do NOT use 100-share lots
  readonly is24Hours: boolean = false;
  readonly allowsFractional: boolean = true; // Fractional shares supported (e.g. 0.5 AAPL)
  readonly minOrderAmount: number = 16000; // ~$1 minimum order

  getMarketStatus(): MarketStatusInfo {
    const now = new Date();
    // Convert to US Eastern Time (UTC-5 or UTC-4 during DST)
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const utcDay = now.getUTCDay(); // 0 = Sunday, 6 = Saturday

    // Check if weekend (US Saturday/Sunday)
    // Eastern Time is UTC-4 (EDT) or UTC-5 (EST). Let's use UTC-4 (EDT):
    const edtTotalMinutes = (utcHours * 60 + utcMinutes - 240 + 1440) % 1440;
    const edtHours = Math.floor(edtTotalMinutes / 60);
    const edtMinutes = edtTotalMinutes % 60;
    const dayOfWeek = (utcHours * 60 + utcMinutes < 240) ? (utcDay === 0 ? 6 : utcDay - 1) : utcDay;

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      return {
        session: 'closed',
        label: 'Tutup (Weekend)',
        isOpen: false,
        canTrade: false,
        description: 'Pasar Saham AS tutup di akhir pekan. Buka kembali Senin 20:30 WIB.',
        nextSessionTime: 'Senin 20:30 WIB'
      };
    }

    const currentMinuteOfDay = edtHours * 60 + edtMinutes;
    // 04:00 ET = 240 mins (Pre-Market Start)
    // 09:30 ET = 570 mins (Regular Market Open)
    // 16:00 ET = 960 mins (Regular Market Close / After-Hours Start)
    // 20:00 ET = 1200 mins (After-Hours Close)

    if (currentMinuteOfDay >= 570 && currentMinuteOfDay < 960) {
      return {
        session: 'open',
        label: 'Sesi Reguler (Buka)',
        isOpen: true,
        canTrade: true,
        description: 'Sesi perdagangan reguler bursa New York (NYSE / NASDAQ) sedang berlangsung (20:30 - 03:00 WIB).'
      };
    } else if (currentMinuteOfDay >= 240 && currentMinuteOfDay < 570) {
      return {
        session: 'pre_market',
        label: 'Pre-Market',
        isOpen: false,
        canTrade: true,
        description: 'Sesi Pre-Market AS aktif. Order akan diproses saat bursa buka reguler.',
        nextSessionTime: '20:30 WIB'
      };
    } else if (currentMinuteOfDay >= 960 && currentMinuteOfDay < 1200) {
      return {
        session: 'after_hours',
        label: 'After-Hours',
        isOpen: false,
        canTrade: true,
        description: 'Sesi After-Hours bursa AS.',
        nextSessionTime: 'Besok 20:30 WIB'
      };
    } else {
      return {
        session: 'closed',
        label: 'Pasar Tutup',
        isOpen: false,
        canTrade: false,
        description: 'Bursa AS sedang tutup. Buka kembali pada sesi Pre-Market / Reguler (20:30 WIB).',
        nextSessionTime: '20:30 WIB'
      };
    }
  }

  formatPrice(price: number): string {
    if (!price || isNaN(price)) return '$0.00';
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatQuantity(quantity: number, _lot?: number | null): string {
    if (!quantity || isNaN(quantity)) return '0 shares';
    if (Number.isInteger(quantity)) {
      return `${quantity.toLocaleString('en-US')} shares`;
    }
    return `${quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} shares`;
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

    if (inputMode === 'shares') {
      quantity = Math.max(0, inputValue);
      grossAmountUsd = quantity * price;
      grossAmountIdr = grossAmountUsd * usdToIdrRate;
    } else if (inputMode === 'amount_usd') {
      grossAmountUsd = Math.max(0, inputValue);
      grossAmountIdr = grossAmountUsd * usdToIdrRate;
      quantity = price > 0 ? grossAmountUsd / price : 0;
    } else {
      // Amount in IDR
      grossAmountIdr = Math.max(0, inputValue);
      grossAmountUsd = grossAmountIdr / usdToIdrRate;
      quantity = price > 0 ? grossAmountUsd / price : 0;
    }

    // US broker standard fee: 0.15% (min $0.10)
    const feeAmountUsd = Math.max(0.10, grossAmountUsd * 0.0015);
    const feeAmountIdr = feeAmountUsd * usdToIdrRate;

    const netTotalUsd = grossAmountUsd + feeAmountUsd;
    const netTotalIdr = grossAmountIdr + feeAmountIdr;

    return {
      price,
      lot: null, // Strictly null for US Stocks
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
    return Math.max(0.10, grossAmount * 0.0015);
  }

  validateOrder(params: OrderValidationParams): OrderValidationResult {
    const { price, quantity, userBalanceIdr, orderType, userOwnedQuantity = 0, usdToIdrRate = DEFAULT_USD_TO_IDR } = params;

    if (price <= 0) {
      return { isValid: false, errorCode: 'INVALID_PRICE', errorMessage: 'Harga saham AS tidak valid.' };
    }

    if (quantity <= 0) {
      return { isValid: false, errorCode: 'INVALID_QUANTITY', errorMessage: 'Jumlah lembar saham AS harus lebih dari 0.' };
    }

    const orderValueUsd = quantity * price;
    const orderValueIdr = orderValueUsd * usdToIdrRate;

    if (orderType === 'BUY') {
      if (orderValueIdr < this.minOrderAmount) {
        return {
          isValid: false,
          errorCode: 'MIN_ORDER_AMOUNT',
          errorMessage: `Minimal pembelian saham AS adalah Rp ${this.minOrderAmount.toLocaleString('id-ID')} (~$1.00)`
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
          errorMessage: `Jumlah saham AS yang dimiliki tidak mencukupi (${this.formatQuantity(userOwnedQuantity)} tersedia).`
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
      assetType: 'stock_us',
      market: 'US',
      quantity,
      lot: null, // Strictly null for US Stocks
      averagePrice,
      currentPrice,
      currency: 'USD',
      investedValue,
      currentValue,
      profitLoss,
      profitLossPercent,
      updatedAt,
      stockName: stockName || `${symbol} (US Stock)`
    };
  }
}

export const usStockEngine = new USStockEngine();
