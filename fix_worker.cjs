const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const replacement = `// Background auto-refresh worker every 1.5 seconds for real-time live data
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
        ? (state.volumeLot >= 1000000 ? \`\${(state.volumeLot / 1000000).toFixed(2)}M Lot\` : \`\${(state.volumeLot / 1000).toFixed(2)}K Lot\`)
        : \`\${(state.volumeLot / 1000).toFixed(2)}K\`;
      
      const valNum = state.valueRupiah;
      const valStr = isIdr
        ? (valNum >= 1000000000 ? \`\${(valNum / 1000000000).toFixed(2)}B\` : \`\${(valNum / 1000000).toFixed(2)}M\`)
        : \`\${(valNum / 1000000).toFixed(2)}M\`;

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
        freqDisplay: \`\${(state.freq / 1000).toFixed(2)}K\`,
        fBuyDisplay: isIdr ? \`\${(state.fBuy / 1000000000).toFixed(2)}B\` : \`\${(state.fBuy / 1000000).toFixed(2)}M\`,
        fSellDisplay: isIdr ? \`\${(state.fSell / 1000000000).toFixed(2)}B\` : \`\${(state.fSell / 1000000).toFixed(2)}M\`,
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
  const prioritySymbols = [
    'BBCA', 'BBRI', 'BMRI', 'BBNI', 'TLKM', 'ASII', 'GOTO', 'BREN', 'AMMN', 'ANTM', 'ICBP', 'ADRO', 'PTBA', 'UNVR', 'KLBF',
    'NVDA', 'AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'GOLD'
  ];
  await fetchYahooQuotesBulk(prioritySymbols);
}, 60000);`;

const startStr = "// Background auto-refresh worker every 1.5 seconds for real-time live data";
const endStr = "// In-memory cache for live news and research";
const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);
if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + replacement + "\n\n" + content.substring(endIndex);
  fs.writeFileSync('server.ts', content);
  console.log("Replaced worker!");
} else {
  console.log("Could not find worker bounds");
}
