// 3. SAHAM BURSA EFEK INDONESIA (IDX STOCK) ENGINE
// Dedicated Decoupled Engine for Indonesian Equities (ANTM, AMMN, INCO, TPIA, INKP, TKIM, MDKA, SMGR, CNMA, MAPI, ACES, ERAA, AUTO, BBCA, BBRI, BUMI, etc.)

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

export class IDXStockEngine implements IAssetEngine {
  readonly assetType: AssetType = 'stock_id';
  readonly market: MarketType = 'IDX';
  readonly currency: CurrencyType = 'IDR';
  readonly lotSize: number = 100; // MANDATORY: 1 LOT = 100 SHARES
  readonly is24Hours: boolean = false;
  readonly allowsFractional: boolean = false; // STRICT: NO FRACTIONAL SHARES ON IDX
  readonly minOrderAmount: number = 1; // Minimum 1 Lot

  getMarketStatus(): MarketStatusInfo {
    const now = new Date();
    // Convert to Jakarta Time (WIB = UTC+7)
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const utcDay = now.getUTCDay();

    const wibTotalMinutes = (utcHours * 60 + utcMinutes + 420) % 1440;
    const wibHours = Math.floor(wibTotalMinutes / 60);
    const wibMinutes = wibTotalMinutes % 60;
    const isNextDayWib = (utcHours * 60 + utcMinutes + 420) >= 1440;
    const wibDay = isNextDayWib ? (utcDay + 1) % 7 : utcDay;

    const isWeekend = wibDay === 0 || wibDay === 6;
    const isFriday = wibDay === 5;

    if (isWeekend) {
      return {
        session: 'closed',
        label: 'Tutup (Weekend)',
        isOpen: false,
        canTrade: false,
        description: 'Bursa Efek Indonesia (BEI) libur akhir pekan. Buka kembali Senin 08:45 WIB (Pre-Opening).',
        nextSessionTime: 'Senin 08:45 WIB'
      };
    }

    const currentWibMinutes = wibHours * 60 + wibMinutes;

    // Pre-Opening: 08:45 - 08:59 (525 - 539)
    if (currentWibMinutes >= 525 && currentWibMinutes < 540) {
      return {
        session: 'pre_open',
        label: 'Pre-Opening (08:45 - 08:59 WIB)',
        isOpen: true,
        canTrade: true,
        description: 'Sesi Pra-Pembukaan BEI. Order pembentukan harga acuan dibuka.'
      };
    }

    // Sesi 1:
    // Mon-Thu: 09:00 - 12:00 (540 - 720)
    // Friday: 09:00 - 11:30 (540 - 690)
    const session1End = isFriday ? 690 : 720;
    const session2Start = isFriday ? 840 : 810; // 14:00 vs 13:30

    if (currentWibMinutes >= 540 && currentWibMinutes < session1End) {
      return {
        session: 'open',
        label: 'Sesi I (09:00 - ' + (isFriday ? '11:30' : '12:00') + ' WIB)',
        isOpen: true,
        canTrade: true,
        description: 'Sesi Perdagangan Reguler I BEI sedang aktif.'
      };
    }

    // Istirahat Sesi:
    if (currentWibMinutes >= session1End && currentWibMinutes < session2Start) {
      return {
        session: 'break',
        label: 'Istirahat Sesi (' + (isFriday ? '11:30 - 14:00' : '12:00 - 13:30') + ' WIB)',
        isOpen: false,
        canTrade: true,
        description: 'Istirahat sesi bursa. Order antrian tetap dapat dipasang dan dieksekusi di Sesi II.',
        nextSessionTime: isFriday ? '14:00 WIB' : '13:30 WIB'
      };
    }

    // Sesi 2:
    // Mon-Thu: 13:30 - 15:49 (810 - 949)
    // Friday: 14:00 - 15:49 (840 - 949)
    if (currentWibMinutes >= session2Start && currentWibMinutes < 950) {
      return {
        session: 'open',
        label: 'Sesi II (' + (isFriday ? '14:00' : '13:30') + ' - 15:49 WIB)',
        isOpen: true,
        canTrade: true,
        description: 'Sesi Perdagangan Reguler II BEI sedang aktif.'
      };
    }

    // Pre-Closing & Post-Trading: 15:50 - 16:15 (950 - 975)
    if (currentWibMinutes >= 950 && currentWibMinutes < 975) {
      return {
        session: 'pre_close',
        label: 'Pre-Closing (15:50 - 16:00 WIB)',
        isOpen: true,
        canTrade: true,
        description: 'Sesi Pra-Penutupan dan Post Trading BEI.'
      };
    }

    return {
      session: 'closed',
      label: 'Pasar Tutup (Closed)',
      isOpen: false,
      canTrade: false,
      description: 'Bursa Efek Indonesia sedang tutup. Order akan masuk antrian Auto-Order untuk hari bursa berikutnya.',
      nextSessionTime: 'Besok 08:45 WIB'
    };
  }

  formatPrice(price: number): string {
    if (!price || isNaN(price)) return 'Rp0';
    return `Rp${Math.round(price).toLocaleString('id-ID')}`;
  }

  formatQuantity(quantity: number, lot?: number | null): string {
    const calculatedLot = (lot !== undefined && lot !== null) ? lot : Math.floor(quantity / 100);
    const shares = quantity || calculatedLot * 100;
    return `${calculatedLot.toLocaleString('id-ID')} Lot (${shares.toLocaleString('id-ID')} Saham)`;
  }

  formatCurrencyValue(amount: number, curr: CurrencyType = 'IDR'): string {
    if (curr === 'USD') {
      return `$${(amount / DEFAULT_USD_TO_IDR).toFixed(2)}`;
    }
    return `Rp ${Math.round(amount).toLocaleString('id-ID')}`;
  }

  calculateOrder(params: OrderCalculationParams): OrderCalculationResult {
    const { price, inputMode, inputValue, leverageMultiplier = 1, usdToIdrRate = DEFAULT_USD_TO_IDR } = params;
    let lot = 0;

    if (inputMode === 'lot') {
      lot = Math.max(0, Math.floor(inputValue));
    } else if (inputMode === 'amount_idr') {
      const singleLotPrice = price * this.lotSize;
      lot = singleLotPrice > 0 ? Math.floor(inputValue / singleLotPrice) : 0;
    } else {
      lot = Math.max(0, Math.floor(inputValue));
    }

    // STRICT: 1 LOT = 100 SHARES
    const quantity = lot * this.lotSize;
    const grossAmountIdr = quantity * price;
    const grossAmountUsd = grossAmountIdr / usdToIdrRate;

    // Indonesian Broker standard fee: 0.15% (Buy) / 0.25% (Sell)
    const feePct = 0.0015;
    const feeAmountIdr = Math.round(grossAmountIdr * feePct);
    const feeAmountUsd = feeAmountIdr / usdToIdrRate;

    const netTotalIdr = (grossAmountIdr + feeAmountIdr) / (leverageMultiplier > 1 ? leverageMultiplier : 1);
    const netTotalUsd = netTotalIdr / usdToIdrRate;

    return {
      price,
      lot,
      quantity,
      grossAmountIdr,
      grossAmountUsd,
      feeAmountIdr,
      feeAmountUsd,
      netTotalIdr,
      netTotalUsd,
      currency: 'IDR',
      formattedPrice: this.formatPrice(price),
      formattedQuantity: this.formatQuantity(quantity, lot),
      formattedTotal: `Rp ${Math.round(netTotalIdr).toLocaleString('id-ID')}`
    };
  }

  calculateFee(grossAmount: number, orderType: 'BUY' | 'SELL'): number {
    const rate = orderType === 'BUY' ? 0.0015 : 0.0025; // 0.15% buy, 0.25% sell (incl. PPh)
    return Math.round(grossAmount * rate);
  }

  validateOrder(params: OrderValidationParams): OrderValidationResult {
    const { price, lot = 0, userBalanceIdr, orderType, userOwnedQuantity = 0 } = params;

    if (price <= 0) {
      return { isValid: false, errorCode: 'INVALID_PRICE', errorMessage: 'Harga saham IDX tidak valid.' };
    }

    if (!lot || lot < 1 || !Number.isInteger(lot)) {
      return { 
        isValid: false, 
        errorCode: 'INVALID_LOT', 
        errorMessage: 'Minimum pembelian saham IDX adalah 1 lot (100 saham) dalam bilangan bulat.' 
      };
    }

    const totalShares = lot * this.lotSize;
    const grossAmount = totalShares * price;
    const fee = this.calculateFee(grossAmount, orderType);
    const requiredTotal = grossAmount + fee;

    if (orderType === 'BUY') {
      if (userBalanceIdr < requiredTotal) {
        return {
          isValid: false,
          errorCode: 'INSUFFICIENT_BALANCE',
          errorMessage: `Saldo RDN tidak mencukupi (Dibutuhkan: Rp ${Math.round(requiredTotal).toLocaleString('id-ID')}, Saldo: Rp ${Math.round(userBalanceIdr).toLocaleString('id-ID')})`
        };
      }
    } else if (orderType === 'SELL') {
      const ownedLot = Math.floor(userOwnedQuantity / this.lotSize);
      if (ownedLot < lot) {
        return {
          isValid: false,
          errorCode: 'INSUFFICIENT_LOT',
          errorMessage: `Jumlah lot yang dimiliki tidak mencukupi (${ownedLot} lot tersedia).`
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
    const { symbol, averagePrice, currentPrice, stockName, updatedAt = Date.now() } = item;
    const lot = item.lot !== undefined && item.lot !== null ? item.lot : Math.floor(item.quantity / this.lotSize);
    const quantity = lot * this.lotSize; // strictly lot * 100

    const investedValue = quantity * averagePrice;
    const currentValue = quantity * currentPrice;
    const profitLoss = currentValue - investedValue;
    const profitLossPercent = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0;

    return {
      symbol,
      assetType: 'stock_id',
      market: 'IDX',
      quantity,
      lot,
      averagePrice,
      currentPrice,
      currency: 'IDR',
      investedValue,
      currentValue,
      profitLoss,
      profitLossPercent,
      updatedAt,
      stockName: stockName || `PT ${symbol} Tbk`
    };
  }
}

export const idxStockEngine = new IDXStockEngine();
