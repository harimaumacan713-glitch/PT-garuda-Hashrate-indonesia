const fs = require('fs');
const { spawn } = require('child_process');

let content = fs.readFileSync('server.ts', 'utf-8');

const replacement = `async function fetchYahooQuotesBulk(symbolKeys: string[]) {
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
      const isIdr = yahooSymbol.endsWith('.JK') || ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'TLKM', 'ASII', 'GOTO', 'BREN', 'AMMN', 'ANTM', 'ICBP', 'ADRO', 'PTBA', 'UNVR', 'KLBF', 'CPIN', 'SMGR', 'PGAS', 'MDKA', 'INCO', 'LABA'].includes(symbolKey);
      
      const currentPrice = Number(quote.regularMarketPrice);
      const prevClose = Number(quote.regularMarketPreviousClose || currentPrice);
      const change = isIdr ? Math.round(currentPrice - prevClose) : Number((currentPrice - prevClose).toFixed(2));
      const pctChange = prevClose !== 0 ? (change / prevClose) * 100 : 0;
      const high = Number(quote.regularMarketDayHigh || currentPrice);
      const low = Number(quote.regularMarketDayLow || currentPrice);
      const volume = Number(quote.regularMarketVolume || 0);

      const step = getTickStep(currentPrice, isIdr);

      const volStr = isIdr 
        ? (volume >= 1000000 ? \`\${(volume / 1000000).toFixed(2)}M\` : \`\${(volume / 1000).toFixed(2)}K\`)
        : \`\${(volume / 1000).toFixed(2)}K\`;
      const valNum = isIdr ? (volume * 100 * currentPrice) : (volume * currentPrice);
      const valStr = isIdr
        ? (valNum >= 1000000000 ? \`\${(valNum / 1000000000).toFixed(2)}B\` : \`\${(valNum / 1000000).toFixed(2)}M\`)
        : \`$\${(valNum / 1000000).toFixed(2)}M\`;

      const freqNum = Math.floor(volume * 0.002) + 1200;
      const freqStr = \`\${(freqNum / 1000).toFixed(2)}K\`;
      const fBuyStr = isIdr ? \`\${((valNum * 0.52) / 1000000000).toFixed(2)}B\` : \`$\${((valNum * 0.52) / 1000000).toFixed(2)}M\`;
      const fSellStr = isIdr ? \`\${((valNum * 0.48) / 1000000000).toFixed(2)}B\` : \`$\${((valNum * 0.48) / 1000000).toFixed(2)}M\`;
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
}`;

const startStr = "async function fetchYahooQuotesBulk(symbolKeys: string[]) {";
const endStr = "async function getLiveGlobalQuotes() {";
const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);
if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + replacement + "\n\n" + content.substring(endIndex);
  fs.writeFileSync('server.ts', content);
  console.log("Replaced bulk func!");
} else {
  console.log("Could not find bulk bounds");
}
