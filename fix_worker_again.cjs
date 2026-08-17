const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const replacement = `// Slower worker to actually fetch from Yahoo to update the base prices
setInterval(async () => {
  const allSymbols = Object.keys(yahooSymbolMap);
  const chunkSize = 15;
  for (let i = 0; i < allSymbols.length; i += chunkSize) {
    const chunk = allSymbols.slice(i, i + chunkSize);
    await fetchYahooQuotesBulk(chunk);
  }
}, 60000);`;

const startStr = "// Slower worker to actually fetch from Yahoo to update the base prices";
const endStr = "// In-memory cache for live news and research";
const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);
if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + replacement + "\n\n" + content.substring(endIndex);
  fs.writeFileSync('server.ts', content);
  console.log("Replaced worker func!");
} else {
  console.log("Could not find worker bounds");
}
