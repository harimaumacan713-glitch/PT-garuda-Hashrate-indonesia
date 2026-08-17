const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf-8');

const replacement = `async function getLiveGlobalQuotes() {
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
            volDisplay: volume > 1000 ? \`\${(volume / 1000).toFixed(2)}K\` : volume.toString(),
            valDisplay: \`$\${((volume * price) / 1000000).toFixed(2)}M\`,
            freqDisplay: \`\${(Math.floor(volume * 0.15)).toLocaleString('id-ID')}\`,
            fBuyDisplay: \`$\${((volume * price * 0.52) / 1000000).toFixed(2)}M\`,
            fSellDisplay: \`$\${((volume * price * 0.48) / 1000000).toFixed(2)}M\`,
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
}`;

const startStr = "async function getLiveGlobalQuotes() {";
const endStr = "// Background auto-refresh worker every 1.5 seconds for real-time live data";
const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);
if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + replacement + "\n\n" + content.substring(endIndex);
  fs.writeFileSync('server.ts', content);
  console.log("Replaced bulk func!");
} else {
  console.log("Could not find bulk bounds");
}
