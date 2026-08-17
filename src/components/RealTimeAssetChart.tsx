import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  YAxis, 
  XAxis, 
  ReferenceLine, 
  Tooltip, 
  BarChart, 
  Bar, 
  Line,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Maximize2, 
  Minimize2, 
  Activity, 
  BarChart2, 
  LineChart as LineChartIcon,
  Layers,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface CandlePoint {
  timestamp: number;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  value: number;
  volume: number;
  isUp: boolean;
  ma5?: number | null;
  ma20?: number | null;
  ma60?: number | null;
}

interface RealTimeAssetChartProps {
  symbol: string;
  displaySymbol?: string;
  name?: string;
  isIdr?: boolean;
  livePrice?: number;
  previousClose?: number;
  className?: string;
  onPriceChange?: (price: number, change: number, pctChange: number) => void;
}

export const RealTimeAssetChart: React.FC<RealTimeAssetChartProps> = ({
  symbol,
  displaySymbol,
  name,
  isIdr = true,
  livePrice,
  previousClose,
  className,
  onPriceChange
}) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y' | '3Y' | '5Y'>('1D');
  const [chartType, setChartType] = useState<'area' | 'candles'>('area');
  const [showMA, setShowMA] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [chartData, setChartData] = useState<CandlePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<CandlePoint | null>(null);

  const symKey = (displaySymbol || symbol).toUpperCase();
  const cryptoList = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'LINK', 'DOT', 'NEAR', 'SUI', 'PEPE', 'SHIB', 'ATOM', 'TON', 'LTC', 'UNI'];
  const isCrypto = symKey.endsWith('USDT') || cryptoList.includes(symKey);
  const normalizedCrypto = symKey.endsWith('USDT') ? symKey : `${symKey}USDT`;

  // Fetch initial & multi-timeframe chart data
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const loadChart = async () => {
      try {
        const res = await fetch(`/api/chart/${symKey}?timeframe=${timeframe}`);
        if (!res.ok) throw new Error('Fetch failed');
        const json = await res.json();
        if (!isCancelled && json && Array.isArray(json.candles) && json.candles.length > 0) {
          setChartData(json.candles);
          setLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn('Fallback loading chart:', err);
          setLoading(false);
        }
      }
    };

    loadChart();
    const refreshTimer = setInterval(loadChart, timeframe === '1D' ? 6000 : 30000);

    return () => {
      isCancelled = true;
      clearInterval(refreshTimer);
    };
  }, [symKey, timeframe]);

  // Crypto Live WebSocket feed for instant real-time tick charting
  useEffect(() => {
    if (!isCrypto) return;

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${normalizedCrypto.toLowerCase()}@ticker`);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data || !data.c) return;

          const currentP = parseFloat(data.c);
          setChartData((prev) => {
            if (!prev || prev.length === 0) return prev;
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            const last = { ...updated[lastIdx] };

            last.close = currentP;
            last.value = currentP;
            if (currentP > last.high) last.high = currentP;
            if (currentP < last.low) last.low = currentP;
            last.isUp = last.close >= last.open;
            updated[lastIdx] = last;
            return updated;
          });
        } catch (e) {}
      };
    } catch (err) {}

    return () => {
      if (ws) ws.close();
    };
  }, [isCrypto, normalizedCrypto]);

  // Handle incoming livePrice prop updates in real-time
  useEffect(() => {
    if (livePrice && livePrice > 0) {
      setChartData((prev) => {
        if (!prev || prev.length === 0) return prev;
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        const last = { ...updated[lastIdx] };

        last.close = livePrice;
        last.value = livePrice;
        if (livePrice > last.high) last.high = livePrice;
        if (livePrice < last.low) last.low = livePrice;
        last.isUp = last.close >= last.open;
        updated[lastIdx] = last;
        return updated;
      });
    }
  }, [livePrice]);

  // Current active pricing calculations
  const activePoint = hoveredPoint || (chartData.length > 0 ? chartData[chartData.length - 1] : null);
  const currentVal = activePoint ? activePoint.close : (livePrice || previousClose || 0);
  const prevCloseVal = previousClose || (chartData.length > 0 ? chartData[0].open : currentVal);
  const changeVal = currentVal - prevCloseVal;
  const pctChangeVal = prevCloseVal !== 0 ? (changeVal / prevCloseVal) * 100 : 0;
  const isUp = changeVal >= 0;

  const formatPrice = (val: number) => {
    if (isIdr) return Math.round(val).toLocaleString('id-ID');
    if (val >= 1000) return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (val < 0.01) return val.toFixed(6);
    if (val < 10) return val.toFixed(4);
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatVolume = (vol: number) => {
    if (isIdr) {
      if (vol >= 1000000) return `${(vol / 1000000).toFixed(2)}M Lot`;
      if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K Lot`;
      return `${vol} Lot`;
    }
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(2)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
    return `${vol.toFixed(0)}`;
  };

  // Min & Max calculations for dynamic domain
  const { minVal, maxVal, lowestPoint, highestPoint } = useMemo(() => {
    if (!chartData || chartData.length === 0) return { minVal: 0, maxVal: 100, lowestPoint: null, highestPoint: null };
    let min = Infinity;
    let max = -Infinity;
    let lowPt: CandlePoint | null = null;
    let highPt: CandlePoint | null = null;

    chartData.forEach((p) => {
      const lowCheck = chartType === 'candles' ? p.low : p.value;
      const highCheck = chartType === 'candles' ? p.high : p.value;

      if (lowCheck < min) {
        min = lowCheck;
        lowPt = p;
      }
      if (highCheck > max) {
        max = highCheck;
        highPt = p;
      }
    });

    const padding = (max - min) * 0.08 || min * 0.02;
    return {
      minVal: Math.max(0, min - padding),
      maxVal: max + padding,
      lowestPoint: lowPt,
      highestPoint: highPt
    };
  }, [chartData, chartType]);

  // Color palette
  const mainColor = isUp ? '#00B26A' : '#e11d48';
  const fillGradientId = `realtime-chart-grad-${symKey}-${timeframe}`;

  return (
    <div className={cn("w-full select-none", className)}>
      {/* HEADER STATS & LIVE TICKER */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-bold text-gray-900">
            {isIdr ? `Rp ${formatPrice(currentVal)}` : `$${formatPrice(currentVal)}`}
          </span>
          <span className={cn(
            "text-[11px] font-bold flex items-center gap-0.5",
            isUp ? "text-[#00B26A]" : "text-[#e11d48]"
          )}>
            {isUp ? '+' : ''}{formatPrice(changeVal)} ({isUp ? '+' : ''}{pctChangeVal.toFixed(2)}%)
          </span>
        </div>

        {/* Live indicator dot */}
        <div className="flex items-center gap-1.5 bg-emerald-50 text-[#00B26A] px-2 py-0.5 rounded-full border border-emerald-200/60 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00B26A] animate-ping inline-block" />
          <span className="text-[10px] font-bold tracking-tight">LIVE REAL-TIME</span>
        </div>
      </div>

      {/* HOVERED DETAILS BAR (OHLCV) */}
      {hoveredPoint && (
        <div className="flex items-center justify-between text-[10px] bg-gray-50 border border-gray-200/80 rounded-md px-2.5 py-1 mb-2 text-gray-600 font-medium overflow-x-auto no-scrollbar">
          <span className="text-gray-900 font-bold">{hoveredPoint.time}</span>
          <span>O: <strong className="text-gray-900">{formatPrice(hoveredPoint.open)}</strong></span>
          <span>H: <strong className="text-emerald-600">{formatPrice(hoveredPoint.high)}</strong></span>
          <span>L: <strong className="text-rose-600">{formatPrice(hoveredPoint.low)}</strong></span>
          <span>C: <strong className="text-gray-900">{formatPrice(hoveredPoint.close)}</strong></span>
          <span>Vol: <strong className="text-gray-900">{formatVolume(hoveredPoint.volume)}</strong></span>
        </div>
      )}

      {/* MAIN CHART CANVAS */}
      <div className={cn(
        "relative w-full rounded-xl bg-white border border-gray-100/90 shadow-2xs overflow-hidden transition-all",
        isExpanded ? "h-96" : "h-60"
      )}>
        {/* Previous Close Line Label at top left */}
        <div className="absolute top-2 left-3 z-10 flex items-center gap-1.5 text-[10px] font-semibold text-gray-400">
          <span>Prev: {formatPrice(prevCloseVal)}</span>
        </div>

        {/* Chart View */}
        <div className="w-full h-full pt-4 pb-1 pr-1">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 38, left: -20, bottom: 0 }}
                onMouseMove={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    setHoveredPoint(e.activePayload[0].payload as CandlePoint);
                  }
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <defs>
                  <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={mainColor} stopOpacity={0.22} />
                    <stop offset="60%" stopColor={mainColor} stopOpacity={0.06} />
                    <stop offset="95%" stopColor={mainColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <YAxis
                  domain={[minVal, maxVal]}
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9.5, fill: '#9ca3af', fontWeight: 600 }}
                  dx={4}
                  tickFormatter={(val) => isIdr ? Math.round(val).toLocaleString('id-ID') : (val >= 1000 ? val.toLocaleString('en-US', { maximumFractionDigits: 0 }) : val.toString())}
                />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#9ca3af' }}
                  interval="preserveStartEnd"
                  minTickGap={35}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as CandlePoint;
                      const ptChange = data.close - prevCloseVal;
                      const ptPct = prevCloseVal !== 0 ? (ptChange / prevCloseVal) * 100 : 0;
                      const ptUp = ptChange >= 0;

                      return (
                        <div className="bg-gray-950/95 backdrop-blur-md text-white text-[11px] p-2.5 rounded-lg shadow-xl border border-gray-800 z-50 min-w-[130px]">
                          <div className="text-gray-400 text-[10px] pb-1 border-b border-gray-800 font-medium">
                            {data.time}
                          </div>
                          <div className="text-sm font-extrabold pt-1">
                            {isIdr ? `Rp ${formatPrice(data.close)}` : `$${formatPrice(data.close)}`}
                          </div>
                          <div className={cn("text-[10px] font-bold", ptUp ? "text-emerald-400" : "text-rose-400")}>
                            {ptUp ? '+' : ''}{formatPrice(ptChange)} ({ptUp ? '+' : ''}{ptPct.toFixed(2)}%)
                          </div>
                          <div className="text-gray-400 text-[9.5px] mt-1 pt-1 border-t border-gray-800/60 flex justify-between">
                            <span>Vol:</span>
                            <span className="text-white font-semibold">{formatVolume(data.volume)}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine 
                  y={prevCloseVal} 
                  stroke="#cbd5e1" 
                  strokeDasharray="3 3" 
                  strokeWidth={1}
                />
                {/* Live Current Price Reference Line */}
                <ReferenceLine 
                  y={currentVal} 
                  stroke={mainColor} 
                  strokeDasharray="2 2" 
                  strokeWidth={1.2}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={mainColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#${fillGradientId})`}
                  isAnimationActive={false}
                />
                {showMA && (
                  <>
                    <Line type="monotone" dataKey="ma5" stroke="#f59e0b" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="ma20" stroke="#0ea5e9" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                  </>
                )}
              </AreaChart>
            ) : (
              /* CANDLESTICK / COMPOSED CHART */
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 38, left: -20, bottom: 0 }}
                onMouseMove={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    setHoveredPoint(e.activePayload[0].payload as CandlePoint);
                  }
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <YAxis
                  domain={[minVal, maxVal]}
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9.5, fill: '#9ca3af', fontWeight: 600 }}
                  dx={4}
                  tickFormatter={(val) => isIdr ? Math.round(val).toLocaleString('id-ID') : (val >= 1000 ? val.toLocaleString('en-US', { maximumFractionDigits: 0 }) : val.toString())}
                />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#9ca3af' }}
                  interval="preserveStartEnd"
                  minTickGap={35}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as CandlePoint;
                      return (
                        <div className="bg-gray-950/95 backdrop-blur-md text-white text-[11px] p-2.5 rounded-lg shadow-xl border border-gray-800 z-50">
                          <div className="text-gray-400 text-[10px] pb-1 border-b border-gray-800">{data.time}</div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 pt-1 text-[10px]">
                            <span className="text-gray-400">Open:</span> <span className="font-semibold text-right">{formatPrice(data.open)}</span>
                            <span className="text-gray-400">High:</span> <span className="font-semibold text-emerald-400 text-right">{formatPrice(data.high)}</span>
                            <span className="text-gray-400">Low:</span> <span className="font-semibold text-rose-400 text-right">{formatPrice(data.low)}</span>
                            <span className="text-gray-400">Close:</span> <span className="font-semibold text-right">{formatPrice(data.close)}</span>
                            <span className="text-gray-400">Vol:</span> <span className="font-semibold text-right">{formatVolume(data.volume)}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={prevCloseVal} stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth={1} />
                <ReferenceLine y={currentVal} stroke={mainColor} strokeDasharray="2 2" strokeWidth={1.2} />
                <Bar 
                  dataKey="close" 
                  fill={mainColor} 
                  isAnimationActive={false}
                  shape={(props: any) => {
                    const { x, y, width, height, payload } = props;
                    const isBull = payload.close >= payload.open;
                    const candleColor = isBull ? '#00B26A' : '#e11d48';
                    const candleWidth = Math.max(3, Math.min(width * 0.75, 10));
                    const centerX = x + width / 2;

                    // Proportional coordinates for High/Low wicks
                    const range = maxVal - minVal || 1;
                    const chartHeight = 200;
                    const openY = chartHeight - ((payload.open - minVal) / range) * chartHeight;
                    const closeY = chartHeight - ((payload.close - minVal) / range) * chartHeight;
                    const highY = chartHeight - ((payload.high - minVal) / range) * chartHeight;
                    const lowY = chartHeight - ((payload.low - minVal) / range) * chartHeight;

                    const bodyTop = Math.min(openY, closeY);
                    const bodyHeight = Math.max(2, Math.abs(closeY - openY));

                    return (
                      <g>
                        {/* Upper/Lower Wick */}
                        <line 
                          x1={centerX} 
                          y1={highY} 
                          x2={centerX} 
                          y2={lowY} 
                          stroke={candleColor} 
                          strokeWidth={1.2} 
                        />
                        {/* Candle Body */}
                        <rect
                          x={centerX - candleWidth / 2}
                          y={bodyTop}
                          width={candleWidth}
                          height={bodyHeight}
                          fill={candleColor}
                          rx={1}
                        />
                      </g>
                    );
                  }}
                />
                {showMA && (
                  <>
                    <Line type="monotone" dataKey="ma5" stroke="#f59e0b" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="ma20" stroke="#0ea5e9" strokeWidth={1.2} dot={false} isAnimationActive={false} />
                  </>
                )}
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Lowest Dip / Peak Indicator Markers */}
        {lowestPoint && (
          <div className="absolute bottom-2 left-1/3 -translate-x-1/2 bg-rose-50 border border-rose-200 text-rose-700 text-[9.5px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
            L: {formatPrice(lowestPoint.low)}
          </div>
        )}
        {highestPoint && (
          <div className="absolute top-2 right-12 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9.5px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
            H: {formatPrice(highestPoint.high)}
          </div>
        )}

        {/* Expand / Minimize Fullscreen Button */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="absolute bottom-2 right-2 p-1.5 bg-white/90 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-md border border-gray-200 shadow-2xs transition-all cursor-pointer z-10"
          title={isExpanded ? "Perkecil Grafik" : "Perbesar Grafik"}
        >
          {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* VOLUME HISTOGRAM (TOGGLABLE) */}
      {showVolume && chartData.length > 0 && (
        <div className="h-12 w-full mt-1.5 bg-white border border-gray-100 rounded-lg p-1 relative overflow-hidden">
          <div className="absolute top-1 left-2 text-[9px] font-bold text-gray-400 z-10">
            VOL: {formatVolume(currentVal ? (activePoint?.volume || 0) : 0)}
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 38, left: -20, bottom: 0 }}>
              <Bar 
                dataKey="volume" 
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  const barColor = payload.isUp ? '#00B26A' : '#e11d48';
                  return (
                    <rect 
                      x={x} 
                      y={y} 
                      width={Math.max(2, width * 0.8)} 
                      height={height} 
                      fill={barColor} 
                      opacity={0.65} 
                      rx={0.5} 
                    />
                  );
                }} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* TIMEFRAME SELECTOR & TECHNICAL CONTROLS ROW */}
      <div className="flex items-center justify-between text-xs font-bold pt-2.5 pb-1 border-b border-gray-100">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          {(['1D', '1W', '1M', '3M', 'YTD', '1Y', '3Y', '5Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                "pb-1 relative whitespace-nowrap transition-colors cursor-pointer text-[11.5px]",
                timeframe === tf ? "text-[#00B26A] font-extrabold" : "text-gray-400 hover:text-gray-700"
              )}
            >
              {tf}
              {timeframe === tf && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00B26A] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* CHART CONTROLS & OVERLAYS */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          {/* Toggle Area vs Candle */}
          <button
            onClick={() => setChartType(chartType === 'area' ? 'candles' : 'area')}
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1",
              chartType === 'candles' 
                ? "bg-[#00B26A]/10 border-[#00B26A] text-[#00B26A]" 
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            )}
            title="Ganti Tipe Grafik: Area / Lilin (Candlestick)"
          >
            {chartType === 'area' ? <LineChartIcon className="w-3 h-3" /> : <BarChart2 className="w-3 h-3" />}
            <span>{chartType === 'area' ? 'Line' : 'Candle'}</span>
          </button>

          {/* Toggle MA */}
          <button
            onClick={() => setShowMA(!showMA)}
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer",
              showMA 
                ? "bg-amber-50 border-amber-300 text-amber-700" 
                : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100"
            )}
            title="Tampilkan Moving Averages (MA5, MA20)"
          >
            MA
          </button>

          {/* Toggle Volume */}
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer",
              showVolume 
                ? "bg-emerald-50 border-emerald-300 text-emerald-700" 
                : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100"
            )}
            title="Tampilkan Indikator Volume"
          >
            VOL
          </button>
        </div>
      </div>
    </div>
  );
};
