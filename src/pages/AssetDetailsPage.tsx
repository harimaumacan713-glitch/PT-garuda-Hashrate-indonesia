import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, SquarePen, Clock, Share, Star, LineChart as LineChartIcon, ChevronDown, Moon, ArrowUpRight, ArrowDownRight, Maximize, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, ReferenceLine } from 'recharts';

interface AssetDetailsPageProps {
  symbol: string;
  onBack: () => void;
}

const cryptoLogos: Record<string, string> = {
  'BTCUSDT': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  'ETHUSDT': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  'BNBUSDT': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  'SOLUSDT': 'https://cryptologos.cc/logos/solana-sol-logo.png',
  'XRPUSDT': 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
  'ADAUSDT': 'https://cryptologos.cc/logos/cardano-ada-logo.png',
  'DOGEUSDT': 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
};

const cryptoNames: Record<string, string> = {
  'BTCUSDT': 'Bitcoin',
  'ETHUSDT': 'Ethereum',
  'BNBUSDT': 'BNB',
  'SOLUSDT': 'Solana',
  'XRPUSDT': 'XRP',
  'ADAUSDT': 'Cardano',
  'DOGEUSDT': 'Dogecoin',
};

export function AssetDetailsPage({ symbol, onBack }: AssetDetailsPageProps) {
  const [activeTab, setActiveTab] = useState('ANALISIS');
  const [subTab, setSubTab] = useState('Net Income');
  
  const [chartData, setChartData] = useState<{time: string, value: number}[]>([]);
  const [assetData, setAssetData] = useState({
    price: '0.00',
    change: '0.00',
    pct: '0.00%',
    up: true,
    high: '0.00',
    low: '0.00',
  });
  const [orderBook, setOrderBook] = useState<{
    bids: { price: string, qty: string }[],
    asks: { price: string, qty: string }[]
  }>({ bids: [], asks: [] });
  
  const [minMax, setMinMax] = useState({ min: 0, max: 0 });

  useEffect(() => {
    // Fetch historical data for chart
    fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=100`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((d: any) => ({ 
          time: new Date(d[0]).toLocaleTimeString(),
          value: parseFloat(d[4]) 
        }));
        setChartData(formatted);
        
        const values = formatted.map((d: any) => d.value);
        setMinMax({
          min: Math.min(...values),
          max: Math.max(...values)
        });
      })
      .catch(console.error);

    // WebSocket for real-time price
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const currentPrice = parseFloat(data.c);
      const change = parseFloat(data.p);
      const isUp = change >= 0;
      
      const formatPrice = (val: number) => {
        if (val < 1) return val.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      };

      setAssetData({
        price: formatPrice(currentPrice),
        change: isUp ? `+${formatPrice(change)}` : formatPrice(change),
        pct: `${isUp ? '+' : ''}${parseFloat(data.P).toFixed(2)}%`,
        up: isUp,
        high: formatPrice(parseFloat(data.h)),
        low: formatPrice(parseFloat(data.l))
      });

      setChartData(prev => {
        if (prev.length === 0) return prev;
        const newData = [...prev];
        newData[newData.length - 1] = { time: new Date().toLocaleTimeString(), value: currentPrice };
        return newData;
      });
    };
    
    // WebSocket for orderbook
    const wsDepth = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth10@100ms`);
    wsDepth.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.bids && data.asks) {
        setOrderBook({
          bids: data.bids.map((b: any) => ({ price: parseFloat(b[0]).toFixed(2), qty: parseFloat(b[1]).toFixed(4) })),
          asks: data.asks.map((a: any) => ({ price: parseFloat(a[0]).toFixed(2), qty: parseFloat(a[1]).toFixed(4) }))
        });
      }
    };

    return () => {
      ws.close();
      wsDepth.close();
    };
  }, [symbol]);

  const displaySymbol = symbol.replace('USDT', '');
  const logo = cryptoLogos[symbol];
  const name = cryptoNames[symbol];

  return (
    <div className="flex h-full flex-col bg-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 bg-white sticky top-0 z-20">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors">
          <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-4 text-gray-500">
          <SquarePen className="w-5 h-5 cursor-pointer hover:text-gray-900" strokeWidth={1.5} />
          <Clock className="w-5 h-5 cursor-pointer hover:text-gray-900" strokeWidth={1.5} />
          <Share className="w-5 h-5 cursor-pointer hover:text-gray-900" strokeWidth={1.5} />
          <Star className="w-5 h-5 cursor-pointer text-[#FFD700] fill-[#FFD700]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Asset Header Info */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <h1 className="text-[17px] font-bold text-gray-900">{displaySymbol}</h1>
              <ChevronDown className="w-4 h-4 text-gray-500" strokeWidth={2} />
              <div className="flex items-center justify-center w-[18px] h-[18px] bg-purple-50 text-[#a855f7] rounded-[3px] text-[10px] font-bold border border-purple-200 ml-1">
                C
              </div>
              <div className="flex items-center justify-center px-1 h-[18px] bg-[#f0fdf4] text-[#00B26A] rounded-[3px] text-[10px] font-bold border border-[#00B26A]">
                TL
              </div>
              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-200 ml-1">
                <Moon className="w-3.5 h-3.5 text-[#00B26A]" strokeWidth={2.5} />
              </div>
            </div>
            <p className="text-[13px] text-gray-500 mb-4">{name}</p>
            
            <div className="flex flex-col gap-0 w-full mb-3">
              <h2 className="text-[40px] font-bold text-gray-900 leading-none tracking-tight">{assetData.price}</h2>
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 mt-1">
                <span className="text-[13px] font-medium shrink-0 text-gray-500">
                  {assetData.change} ({assetData.pct}) Hari Ini
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="px-2 py-0.5 rounded border border-[#00B26A] text-[#00B26A] text-[11px] font-medium bg-white whitespace-nowrap">Barang Perindustrian</span>
              <span className="px-2 py-0.5 rounded border border-[#00B26A] text-[#00B26A] text-[11px] font-medium bg-white whitespace-nowrap">DBX</span>
            </div>
          </div>
          <div className="w-[50px] h-[50px] rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center p-2 mt-2">
             <img src={logo} alt={name} className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 mt-6 h-64 relative w-full">
         <ResponsiveContainer width="100%" height="100%">
           <LineChart data={chartData} margin={{ top: 20, right: 40, left: 0, bottom: 0 }}>
             <YAxis 
               domain={['dataMin', 'dataMax']} 
               orientation="right" 
               axisLine={false} 
               tickLine={false}
               tick={{ fontSize: 10, fill: '#9ca3af' }}
               dx={2}
               tickFormatter={(val) => val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
             />
             <ReferenceLine y={chartData.length > 0 ? chartData[0].value : 0} stroke="#e5e7eb" strokeDasharray="3 3" />
             <Line 
               type="stepAfter" 
               dataKey="value" 
               stroke={assetData.up ? "#00B26A" : "#e11d48"} 
               strokeWidth={2} 
               dot={false}
               isAnimationActive={false}
             />
           </LineChart>
         </ResponsiveContainer>
         {/* High Low labels overlaid */}
         <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-[#00B26A] bg-white px-1">
            {assetData.high}
         </div>
         <div className="absolute bottom-6 left-1/4 text-[10px] font-bold text-[#00B26A] bg-white px-1">
            {assetData.low}
         </div>
         <div className="absolute bottom-0 right-4 p-1.5 bg-gray-50 rounded-md border border-gray-100 cursor-pointer text-gray-500 hover:text-gray-900 flex items-center justify-center">
           <Maximize className="w-3.5 h-3.5" />
         </div>
      </div>

      {/* Timeframes */}
      <div className="px-4 mt-4 w-full overflow-hidden">
        <div className="flex items-center justify-between gap-4 text-[11px] font-bold border-b border-gray-100 pb-2 overflow-x-auto no-scrollbar">
          <span className="text-[#00B26A] border-b-2 border-[#00B26A] pb-2 -mb-[9px] shrink-0">1D</span>
          <span className="text-gray-400 shrink-0 cursor-pointer">1W</span>
          <span className="text-gray-400 shrink-0 cursor-pointer">1M</span>
          <span className="text-gray-400 shrink-0 cursor-pointer">3M</span>
          <span className="text-gray-400 shrink-0 cursor-pointer">YTD</span>
          <span className="text-gray-400 shrink-0 cursor-pointer">1Y</span>
          <span className="text-gray-400 shrink-0 cursor-pointer">3Y</span>
          <span className="text-gray-400 shrink-0 cursor-pointer">5Y</span>
          <div className="flex items-center gap-1.5 text-gray-400 shrink-0 ml-2">
             <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 4V20M8 8L12 4L16 8M8 16L12 20L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
             <LineChartIcon className="w-4 h-4 text-[#00B26A]" />
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 mb-2 flex flex-col gap-3">
        <button className="w-full bg-[#00B26A] text-white font-bold py-3.5 rounded-lg text-sm hover:bg-[#00995c] transition-colors shadow-sm">
          Beli
        </button>
        
        <div className="flex items-center justify-between p-3 border border-purple-200 bg-white rounded-[6px] cursor-pointer mt-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-5 h-5 bg-purple-50 text-[#a855f7] rounded-[3px] text-[10px] font-bold border border-purple-200">
              C
            </div>
            <span className="text-[11px] text-gray-600 font-medium tracking-tight">Perusahaan memiliki Corporate Action</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-purple-300" />
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full overflow-hidden">
        <div className="flex items-center text-[11px] font-bold border-b border-gray-100 overflow-x-auto no-scrollbar pt-2 px-2">
          {['KEYSTATS', 'ORDERBOOK', 'ANALISIS', 'FINANSIAL', 'SEASONALITY'].map(tab => (
            <div 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 pb-3 cursor-pointer whitespace-nowrap -mb-[1px] shrink-0",
                activeTab === tab ? "text-[#00B26A] border-b-2 border-[#00B26A]" : "text-gray-400 border-b-2 border-transparent"
              )}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* Sub tabs */}
      {activeTab === 'KEYSTATS' && (
        <div className="pb-24">
          <div className="px-4 py-3">
             <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded p-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00B26A] shrink-0"></div>
                <span className="text-[11px] text-gray-600 font-medium">Data yang ditandai dengan bulatan hijau telah diupdate (Q2, 30 Jun 2026)</span>
             </div>
          </div>

          <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-50 overflow-x-auto no-scrollbar gap-4">
             <div className="flex gap-2 shrink-0">
               {['Net Income', 'EPS', 'Revenue'].map(tab => (
                 <div 
                   key={tab}
                   onClick={() => setSubTab(tab)}
                   className={cn(
                     "px-4 py-1.5 rounded-full text-[12px] font-bold cursor-pointer border transition-colors whitespace-nowrap",
                     subTab === tab ? "border-[#00B26A] text-[#00B26A] bg-white" : "border-gray-200 text-gray-500 bg-white"
                   )}
                 >
                   {tab}
                 </div>
               ))}
             </div>
             <div className="flex gap-3 text-gray-400 shrink-0 ml-auto">
               <ChevronLeft className="w-4 h-4" />
               <ChevronRight className="w-4 h-4" />
             </div>
          </div>

          {/* Table Data */}
          <div className="overflow-x-auto no-scrollbar pb-6 w-full">
            <table className="w-full text-right text-[12px] whitespace-nowrap min-w-[450px]">
              <thead>
                <tr className="text-gray-900 border-b border-gray-100">
                  <th className="py-4 px-4 font-bold text-left min-w-[120px]">Period</th>
                  <th className="py-4 px-6 font-bold">2026</th>
                  <th className="py-4 px-6 font-bold">2025</th>
                  <th className="py-4 px-6 font-bold">2024</th>
                  <th className="py-4 px-6 font-bold">2023</th>
                  <th className="py-4 px-6 font-bold">2022</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr>
                  <td className="py-4 px-4 text-left font-bold text-gray-900">Q1</td>
                  <td className="py-4 px-6">6 B</td>
                  <td className="py-4 px-6">2 B</td>
                  <td className="py-4 px-6">(1 B)</td>
                  <td className="py-4 px-6">(2 B)</td>
                  <td className="py-4 px-6">(1 B)</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-left font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00B26A]"></div> Q2
                    </div>
                  </td>
                  <td className="py-4 px-6">(18 B)</td>
                  <td className="py-4 px-6">900 M</td>
                  <td className="py-4 px-6">(1 B)</td>
                  <td className="py-4 px-6">(2 B)</td>
                  <td className="py-4 px-6">(2 B)</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-left font-bold text-gray-900">Q3</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">4 B</td>
                  <td className="py-4 px-6">(3 B)</td>
                  <td className="py-4 px-6">117 M</td>
                  <td className="py-4 px-6">(19 M)</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-left font-bold text-gray-900">Q4</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">13 B</td>
                  <td className="py-4 px-6">(3 B)</td>
                  <td className="py-4 px-6">(37 M)</td>
                  <td className="py-4 px-6">(1 B)</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-left font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00B26A]"></div> Annualised
                    </div>
                  </td>
                  <td className="py-4 px-6">(25 B)</td>
                  <td className="py-4 px-6">19 B</td>
                  <td className="py-4 px-6">(9 B)</td>
                  <td className="py-4 px-6">(4 B)</td>
                  <td className="py-4 px-6">(5 B)</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-left font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00B26A]"></div> TTM (Q2)
                    </div>
                  </td>
                  <td className="py-4 px-6">4 B</td>
                  <td className="py-4 px-6">19 B</td>
                  <td className="py-4 px-6">(9 B)</td>
                  <td className="py-4 px-6">(4 B)</td>
                  <td className="py-4 px-6">(5 B)</td>
                </tr>
                
                {/* Empty spacer row */}
                <tr><td colSpan={6} className="h-6"></td></tr>

                {/* Dividend rows */}
                <tr>
                  <td className="py-4 px-4 text-left font-bold text-gray-900">Dividend (TTM)</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">-</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-left font-bold text-gray-900">Payout Ratio</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">-</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-left font-bold text-gray-900">Dividend Yield</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">-</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="h-2 bg-gray-50 w-full"></div>

          {/* Market Cap stats */}
          <div className="px-4 py-4 text-[12px] flex flex-col gap-4">
             <div className="flex justify-between items-start gap-4">
                <span className="text-gray-600">Market Cap</span>
                <span className="font-bold text-gray-900 text-[13px] text-right whitespace-nowrap">27,650 B</span>
             </div>
             <div className="flex justify-between items-start gap-4">
                <span className="text-gray-600">Current Share Outstanding</span>
                <span className="font-bold text-gray-900 text-[13px] text-right whitespace-nowrap">263.34 B</span>
             </div>
             <div className="flex justify-between items-start gap-4">
                <span className="text-gray-600">Free Float</span>
                <span className="font-bold text-gray-900 text-[13px] text-right whitespace-nowrap">22.00%</span>
             </div>
          </div>
          
          <div className="h-2 bg-gray-50 w-full"></div>

          {/* Expandable Sections */}
          {[
            { title: 'Valuation', items: [
                { label: 'Current PE Ratio (Annualised)', value: '551.20' },
                { label: 'Current PE Ratio (TTM)', value: '61.61' },
                { label: 'Forward PE Ratio', value: '-' },
                { label: 'Current Price to Sales (TTM)', value: '7.05' },
                { label: 'Current Price to Book Value', value: '7.15' },
                { label: 'Current Price To Cashflow (TTM)', value: '-63.89' },
                { label: 'Current Price To Free Cashflow (TTM)', value: '-63.89' },
                { label: 'EV to EBITDA (TTM)', value: '86.79' }
              ]
            },
            { title: 'Per Share', items: [
                { label: 'Current EPS (TTM)', value: '1.70' },
                { label: 'Current EPS (Annualised)', value: '0.19' },
                { label: 'Revenue Per Share (TTM)', value: '14.90' },
                { label: 'Cash Per Share (Quarter)', value: '0.79' },
                { label: 'Current Book Value Per Share', value: '14.69' },
                { label: 'Free Cashflow Per Share (TTM)', value: '-1.64' }
              ]
            },
            { title: 'Solvency', items: [
                { label: 'Current Ratio (Quarter)', value: '1.31' },
                { label: 'Quick Ratio (Quarter)', value: '1.12' },
                { label: 'Debt to Equity Ratio (Quarter)', value: '4.38' }
              ]
            },
            { title: 'Profitability', items: [
                { label: 'Return on Assets (TTM)', value: '1.85%' },
                { label: 'Return on Equity (TTM)', value: '11.60%' },
                { label: 'Gross Profit Margin (Quarter)', value: '33.01%' },
                { label: 'Operating Profit Margin (Quarter)', value: '18.67%' },
                { label: 'Net Profit Margin (Quarter)', value: '1.10%' }
              ]
            },
            { title: 'Management Effectiveness', items: [
                { label: 'Return on Assets (TTM)', value: '1.85%' },
                { label: 'Return on Equity (TTM)', value: '11.60%' },
                { label: 'Return On Capital Employed (TTM)', value: '1.32%' },
                { label: 'Return On Invested Capital (TTM)', value: '1.18%' },
                { label: 'Days Sales Outstanding (Quarter)', value: '68.81' },
                { label: 'Days Inventory (Quarter)', value: '82.69' },
                { label: 'Days Payables Outstanding (Quarter)', value: '110.85' }
              ]
            }
          ].map((section) => (
             <div key={section.title}>
               <div className="flex items-center justify-between px-4 py-4 bg-gray-50/50 cursor-pointer text-[13px] font-bold text-gray-900">
                  <span>{section.title}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
               </div>
               <div className="px-4 py-2 flex flex-col gap-4 bg-white text-[12px] mb-2">
                 {section.items.map((item, i) => (
                   <div key={i} className="flex justify-between items-start gap-4">
                     <span className="text-gray-600">{item.label}</span>
                     <span className="font-bold text-gray-900 text-right whitespace-nowrap">{item.value}</span>
                   </div>
                 ))}
               </div>
               <div className="h-1 bg-gray-50 w-full"></div>
             </div>
          ))}

        </div>
      )}

      {activeTab === 'ORDERBOOK' && (
        <div className="pb-24 bg-white">
          {/* Orderbook Summary */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-5 text-[12px] border-b border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500">Open</span>
              <span className="font-medium text-[#00B26A]">97</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Lot</span>
              <span className="font-medium text-gray-900">64.89K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">High</span>
              <span className="font-medium text-[#00B26A]">98</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Val</span>
              <span className="font-medium text-gray-900">628.23M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Low</span>
              <span className="font-medium text-[#e11d48]">95</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Avg</span>
              <span className="font-medium text-gray-900">97</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">ARA</span>
              <span className="font-medium text-gray-900 flex items-center gap-1">129 <ChevronDown className="w-3.5 h-3.5 text-gray-400" /></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">ARB</span>
              <span className="font-medium text-gray-900 flex items-center gap-1">82 <ChevronDown className="w-3.5 h-3.5 text-gray-400" /></span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">F Buy</span>
              <span className="font-medium text-[#00B26A]">77.60K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">F Sell</span>
              <span className="font-medium text-[#e11d48]">2.02M</span>
            </div>
          </div>

          {/* Orderbook Table */}
          <div className="w-full pb-6">
            <div className="grid grid-cols-[1fr_2fr_1.5fr_1.5fr_2fr_1fr] gap-1 px-1 py-3 text-[11px] font-bold text-gray-900 border-b border-gray-100 text-center">
              <div className="text-left pl-3">Freq</div>
              <div className="text-right pr-2">Lot</div>
              <div>Bid</div>
              <div>Ask</div>
              <div className="text-left pl-2">Lot</div>
              <div className="text-right pr-3">Freq</div>
            </div>
            
            {Array.from({ length: 10 }).map((_, i) => {
               const bid = orderBook.bids[i] || { price: '-', qty: '-' };
               const ask = orderBook.asks[i] || { price: '-', qty: '-' };
               
               // Mock realistic lot rendering for UI matching
               const bidQtyRaw = bid.qty !== '-' ? parseFloat(bid.qty) : 0;
               const askQtyRaw = ask.qty !== '-' ? parseFloat(ask.qty) : 0;
               const maxLot = 5; // Normalize for visual
               const bidWidth = bid.qty !== '-' ? Math.min(100, (bidQtyRaw / maxLot) * 100) : 0;
               const askWidth = ask.qty !== '-' ? Math.min(100, (askQtyRaw / maxLot) * 100) : 0;
               
               const formatLot = (val: string) => {
                 if (val === '-') return '-';
                 const v = parseFloat(val);
                 return (v * 1000).toLocaleString('en-US', { maximumFractionDigits: 0 }); // Just for display
               };

               return (
                 <div key={i} className="grid grid-cols-[1fr_2fr_1.5fr_1.5fr_2fr_1fr] gap-1 px-1 py-2 text-[11px] border-b border-gray-50 text-center items-center">
                   <div className="text-left pl-3 text-[#a855f7] font-medium">{bid.qty !== '-' ? Math.floor(Math.random() * 80) + 10 : '-'}</div>
                   <div className="text-right pr-2 relative h-5 flex items-center justify-end">
                     <div className="absolute right-0 top-0 bottom-0 bg-[#ffe4e6] rounded-sm transition-all duration-300" style={{ width: `${bidWidth}%` }}></div>
                     <span className="relative z-10 text-gray-800 font-medium">{formatLot(bid.qty)}</span>
                   </div>
                   <div className={cn("font-medium", bid.price === '-' ? "text-gray-400" : "text-[#e11d48]")}>{bid.price}</div>
                   
                   <div className={cn("font-medium", ask.price === '-' ? "text-gray-400" : "text-[#00B26A]")}>{ask.price}</div>
                   <div className="text-left pl-2 relative h-5 flex items-center justify-start">
                     <div className="absolute left-0 top-0 bottom-0 bg-[#dcfce7] rounded-sm transition-all duration-300" style={{ width: `${askWidth}%` }}></div>
                     <span className="relative z-10 text-gray-800 font-medium">{formatLot(ask.qty)}</span>
                   </div>
                   <div className="text-right pr-3 text-[#a855f7] font-medium">{ask.qty !== '-' ? Math.floor(Math.random() * 80) + 10 : '-'}</div>
                 </div>
               )
            })}
          </div>
        </div>
      )}

      {activeTab === 'ANALISIS' && (
         <div className="pb-24 bg-white">
            <div className="px-4 py-5">
               <div className="flex items-center gap-2 mb-5">
                  <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 cursor-pointer w-40 hover:bg-gray-50">
                     <span className="text-[13px] font-bold text-gray-900 mr-2">PE Band (TTM)</span>
                     <ChevronDown className="w-4 h-4 text-gray-500" />
                  </div>
                  <Info className="w-5 h-5 text-gray-400" strokeWidth={2} />
               </div>
               
               <div className="flex items-center gap-3 mb-8">
                  <button className="px-4 py-1.5 rounded-full border border-[#00B26A] text-[#00B26A] text-[12px] font-bold bg-[#f0fdf4]">3 Tahun</button>
                  <button className="px-4 py-1.5 rounded-full border border-gray-200 text-gray-500 text-[12px] font-medium hover:bg-gray-50">5 Tahun</button>
                  <button className="px-4 py-1.5 rounded-full border border-gray-200 text-gray-500 text-[12px] font-medium hover:bg-gray-50">10 Tahun</button>
               </div>
               
               {/* Chart Mock */}
               <div className="h-[220px] w-full relative mb-8 pr-12">
                  <div className="absolute inset-0 pb-6 pr-12">
                     {/* Horizontal grid lines */}
                     <div className="absolute w-full flex items-center top-[10%]">
                       <div className="w-full h-[1px] bg-[#f472b6]"></div>
                       <span className="absolute -right-[36px] text-[10px] text-[#f472b6] font-bold">192.4</span>
                     </div>
                     <div className="absolute w-full flex items-center top-[25%]">
                       <div className="w-full h-[1px] bg-[#fb923c]"></div>
                       <span className="absolute -right-[36px] text-[10px] text-[#fb923c] font-bold">115.53</span>
                     </div>
                     <div className="absolute w-full flex items-center top-[40%]">
                       <div className="w-full h-[1px] bg-[#22c55e]"></div>
                       <span className="absolute -right-[36px] text-[10px] text-gray-900 font-bold bg-white z-10 px-0.5">38.66</span>
                     </div>
                     <div className="absolute w-full flex items-center top-[55%]">
                       <div className="w-full h-[1px] bg-[#ef4444]"></div>
                       <span className="absolute -right-[36px] text-[10px] text-[#ef4444] font-bold">-38.21</span>
                     </div>
                     <div className="absolute w-full flex items-center top-[70%]">
                       <div className="w-full h-[1px] bg-[#3b82f6]"></div>
                       <span className="absolute -right-[36px] text-[10px] text-[#3b82f6] font-bold bg-gray-900 px-1 rounded-sm text-white z-10">-115.07</span>
                     </div>
                     
                     <div className="absolute w-full h-[1px] bg-gray-200 top-[85%] border-t border-dashed"></div>

                     {/* Vertical crosshair */}
                     <div className="absolute w-[1px] h-full bg-gray-800 left-[45%]"></div>
                     <div className="absolute w-3 h-3 rounded-full border-2 border-gray-900 bg-white left-[45%] top-[55%] transform -translate-x-[5px] -translate-y-1.5 z-20"></div>

                     {/* Data line */}
                     <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <polyline points="0,55 50,55 80,60 90,85 100,75 110,95 130,55 150,58 180,56 195,55 200,10 205,58 240,55 300,58" fill="none" stroke="#2563eb" strokeWidth="1.5" />
                     </svg>
                     <div className="absolute left-[45%] bottom-[-8px] transform -translate-x-1/2 bg-gray-900 text-white text-[11px] font-medium px-3 py-1 rounded">03 Jan 25</div>
                     
                     <div className="absolute right-[-24px] top-[55%] transform -translate-y-1.5 z-20 bg-gray-900 px-1 rounded-sm text-white text-[10px] font-bold">5.33</div>
                     <div className="absolute w-2.5 h-2.5 rounded-full bg-gray-900 right-[-5px] top-[55%] transform -translate-y-[5px] z-30"></div>
                  </div>
                  
                  {/* Y Axis upper labels */}
                  <div className="absolute right-0 top-0 bottom-6 flex flex-col justify-between text-[9px] text-gray-300 items-end">
                    <span>750</span>
                    <span>500</span>
                    <span>250</span>
                    <span>0</span>
                    <span>-250</span>
                    <span>-500</span>
                  </div>
                  
                  {/* X Axis labels */}
                  <div className="absolute bottom-0 w-full pr-8 flex justify-between text-[11px] text-gray-400 px-8">
                     <span>2024</span>
                     <span>2026</span>
                  </div>
               </div>
               
               {/* Legend Table */}
               <div className="text-[10px] mt-2 mb-4 px-2">
                  <div className="flex justify-between py-0.5">
                     <div className="flex items-center gap-2 w-[160px]"><div className="w-2 h-2 bg-[#3b82f6]"></div><span className="text-gray-500">Current PE Ratio (TTM)</span></div>
                     <span className="text-gray-500 w-[100px] text-center">03 Jan 2025</span>
                     <span className="text-gray-900 text-right w-[60px]">-54.75</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                     <div className="flex items-center gap-2 w-[160px]"><div className="w-2 h-2 bg-[#f472b6]"></div><span className="text-gray-500">+2 PE Standard Deviation</span></div>
                     <span className="text-gray-500 w-[100px] text-center">10 Aug 2026</span>
                     <span className="text-gray-900 text-right w-[60px]">192.4</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                     <div className="flex items-center gap-2 w-[160px]"><div className="w-2 h-2 bg-[#fb923c]"></div><span className="text-gray-500">+1 PE Standard Deviation</span></div>
                     <span className="text-gray-500 w-[100px] text-center">10 Aug 2026</span>
                     <span className="text-gray-900 text-right w-[60px]">115.53</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                     <div className="flex items-center gap-2 w-[160px]"><div className="w-2 h-2 bg-[#22c55e]"></div><span className="text-gray-500">Mean PE Standard Deviation</span></div>
                     <span className="text-gray-500 w-[100px] text-center">10 Aug 2026</span>
                     <span className="text-gray-900 text-right w-[60px]">38.66</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                     <div className="flex items-center gap-2 w-[160px]"><div className="w-2 h-2 bg-[#ef4444]"></div><span className="text-gray-500">-1 PE Standard Deviation</span></div>
                     <span className="text-gray-500 w-[100px] text-center">10 Aug 2026</span>
                     <span className="text-gray-900 text-right w-[60px]">-38.21</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                     <div className="flex items-center gap-2 w-[160px]"><div className="w-2 h-2 bg-[#3b82f6]"></div><span className="text-gray-500">-2 PE Standard Deviation</span></div>
                     <span className="text-gray-500 w-[100px] text-center">10 Aug 2026</span>
                     <span className="text-gray-900 text-right w-[60px]">-115.07</span>
                  </div>
               </div>

               {/* PBV Band Section */}
               <div className="mt-8 pt-8 border-t border-gray-50">
                  <div className="flex items-center gap-2 mb-5">
                     <span className="text-[14px] font-bold text-gray-900">PBV Band</span>
                     <Info className="w-4 h-4 text-gray-400" strokeWidth={2} />
                  </div>
                  
                  <div className="flex items-center gap-3 mb-8">
                     <button className="px-4 py-1.5 rounded-full border border-[#00B26A] text-[#00B26A] text-[12px] font-bold bg-[#f0fdf4]">3 Tahun</button>
                     <button className="px-4 py-1.5 rounded-full border border-gray-200 text-gray-500 text-[12px] font-medium hover:bg-gray-50">5 Tahun</button>
                     <button className="px-4 py-1.5 rounded-full border border-gray-200 text-gray-500 text-[12px] font-medium hover:bg-gray-50">10 Tahun</button>
                  </div>
                  
                  {/* PBV Chart Mock */}
                  <div className="h-[220px] w-full relative mb-8 pr-12">
                     <div className="absolute inset-0 pb-6 pr-12">
                        {/* Horizontal grid lines */}
                        <div className="absolute w-full flex items-center top-[10%]">
                          <div className="w-full h-[1px] bg-[#f472b6]"></div>
                          <span className="absolute -right-[32px] text-[10px] text-[#f472b6] font-bold">8.49</span>
                        </div>
                        <div className="absolute w-full flex items-center top-[30%]">
                          <div className="w-full h-[1px] bg-[#fb923c]"></div>
                          <span className="absolute -right-[32px] text-[10px] text-[#fb923c] font-bold">5.87</span>
                        </div>
                        <div className="absolute w-full flex items-center top-[50%]">
                          <div className="w-full h-[1px] bg-[#22c55e]"></div>
                          <span className="absolute -right-[32px] text-[10px] text-[#22c55e] font-bold">3.24</span>
                        </div>
                        <div className="absolute w-full flex items-center top-[70%]">
                          <div className="w-full h-[1px] bg-[#ef4444]"></div>
                          <span className="absolute -right-[32px] text-[10px] text-[#ef4444] font-bold">1.53</span>
                        </div>
                        <div className="absolute w-full flex items-center top-[90%]">
                          <div className="w-full h-[1px] bg-[#3b82f6]"></div>
                          <span className="absolute -right-[32px] text-[10px] text-[#3b82f6] font-bold">-2.01</span>
                        </div>
                        
                        {/* Data line */}
                        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                           <polyline points="0,85 40,85 50,75 55,70 60,80 65,65 70,10 75,30 80,15 85,25 90,40 100,50 110,45 120,60 130,55 140,80 150,75 160,80 170,75 180,75 190,55 220,55 230,80 240,85 260,85 280,88 290,85 300,88" fill="none" stroke="#2563eb" strokeWidth="1.5" />
                        </svg>
                     </div>
                     
                     {/* Y Axis upper labels */}
                     <div className="absolute right-0 top-0 bottom-6 flex flex-col justify-between text-[9px] text-gray-300 items-end">
                       <span>15</span>
                       <span>10</span>
                       <span>5</span>
                       <span>0</span>
                       <span>-5</span>
                     </div>
                     
                     {/* X Axis labels */}
                     <div className="absolute bottom-0 w-full pr-8 flex justify-between text-[11px] text-gray-400 px-8">
                        <span>2024</span>
                        <span>2025</span>
                        <span>2026</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
