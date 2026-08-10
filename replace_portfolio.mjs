import fs from 'fs';

let content = fs.readFileSync('src/pages/PortfolioPage.tsx', 'utf8');

// Replace strings
content = content.replace(
  '<span className="text-[14px] font-bold text-secondary">0</span>\\n              <span className="text-[11px] text-gray-500 mt-0.5">Virtual Balance</span>',
  '<span className="text-[14px] font-bold text-secondary">{balance > 0 ? `Rp${balance.toLocaleString(\'en-US\')}` : \'0\'}</span>\\n              <span className="text-[11px] text-gray-500 mt-0.5">Virtual Balance</span>'
);

content = content.replace(
  /<span className="text-\[14px\] font-bold text-secondary">\s*0\s*<\/span>\s*<span className="text-\[11px\] text-gray-500 mt-0\.5">Virtual Balance<\/span>/g,
  '<span className="text-[14px] font-bold text-secondary">{balance > 0 ? `Rp${balance.toLocaleString(\'en-US\')}` : \'0\'}</span>\n              <span className="text-[11px] text-gray-500 mt-0.5">Virtual Balance</span>'
);

content = content.replace(
  /<span className="text-\[14px\] font-bold text-secondary">\s*0\s*<\/span>\s*<span className="text-\[11px\] text-gray-500 mt-0\.5">Virtual Equity<\/span>/g,
  '<span className="text-[14px] font-bold text-secondary">{balance > 0 ? `Rp${balance.toLocaleString(\'en-US\')}` : \'0\'}</span>\n              <span className="text-[11px] text-gray-500 mt-0.5">Virtual Equity</span>'
);

fs.writeFileSync('src/pages/PortfolioPage.tsx', content);
