const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const replacement = `
// Make sure on startup we populate everything
setTimeout(async () => {
  const allSymbols = Object.keys(yahooSymbolMap);
  const chunkSize = 15;
  for (let i = 0; i < allSymbols.length; i += chunkSize) {
    const chunk = allSymbols.slice(i, i + chunkSize);
    await fetchYahooQuotesBulk(chunk);
  }
}, 3000);
`;

content = content.replace("startServer();", replacement + "\nstartServer();");
fs.writeFileSync('server.ts', content);
console.log("Replaced startServer");
