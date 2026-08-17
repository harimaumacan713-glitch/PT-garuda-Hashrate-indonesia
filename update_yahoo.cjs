const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf-8');

const replacement = `async function fetchYahooQuote(symbolKey: string, yahooSymbol: string) {
  const isIdr = yahooSymbol.endsWith('.JK') || ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'TLKM', 'ASII', 'GOTO', 'BREN', 'AMMN', 'ANTM', 'ICBP', 'ADRO', 'PTBA', 'UNVR', 'KLBF', 'CPIN', 'SMGR', 'PGAS', 'MDKA', 'INCO', 'LABA'].includes(symbolKey);

  try {
    const quote = await yahooFinance.quote(yahooSymbol);
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
    ? (state.volumeLot >= 1000000 ? \`\${(state.volumeLot / 1000000).toFixed(2)}M Lot\` : \`\${(state.volumeLot / 1000).toFixed(2)}K Lot\`)
    : \`\${(state.volumeLot / 1000).toFixed(2)}K\`;
  
  const valNum = state.valueRupiah;
  const valStr = isIdr
    ? (valNum >= 1000000000 ? \`\${(valNum / 1000000000).toFixed(2)}B\` : \`\${(valNum / 1000000).toFixed(2)}M\`)
    : \`\${(valNum / 1000000).toFixed(2)}M\`;

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
    freqDisplay: \`\${(state.freq / 1000).toFixed(2)}K\`,
    fBuyDisplay: isIdr ? \`\${(state.fBuy / 1000000000).toFixed(2)}B\` : \`\${(state.fBuy / 1000000).toFixed(2)}M\`,
    fSellDisplay: isIdr ? \`\${(state.fSell / 1000000000).toFixed(2)}B\` : \`\${(state.fSell / 1000000).toFixed(2)}M\`,
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
}`;

// regex to replace the function
const startStr = "async function fetchYahooQuote";
const endStr = "async function fetchBinanceQuotes";
const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);
if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + replacement + "\n\n" + content.substring(endIndex);
  fs.writeFileSync('server.ts', content);
  console.log("Replaced successfully!");
} else {
  console.log("Could not find bounds");
}
