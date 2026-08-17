import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  BarChart2, 
  FileSpreadsheet, 
  DollarSign, 
  Percent,
  Download,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { cn } from '../lib/utils';
import { getFinancialsForSymbol, FinancialMetricRow } from '../data/financialsData';

interface FinancialStatementsViewProps {
  symbol: string;
  displaySymbol?: string;
  isIdr?: boolean;
}

export const FinancialStatementsView: React.FC<FinancialStatementsViewProps> = ({
  symbol,
  displaySymbol,
  isIdr = true
}) => {
  const sym = (displaySymbol || symbol).replace('USDT', '').toUpperCase();
  const finData = getFinancialsForSymbol(sym);

  const [statementType, setStatementType] = useState<'laba_rugi' | 'neraca' | 'arus_kas'>('laba_rugi');
  const [periodType, setPeriodType] = useState<'Annual' | 'Quarterly'>('Annual');
  const [viewMode, setViewMode] = useState<'nominal' | 'percent'>('nominal');
  const [showChart, setShowChart] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({
    'opex': false,
    'other_income': false,
    'net_income_parent': true
  });

  const toggleExpand = (rowId: string) => {
    setExpandedRows(prev => ({ ...prev, [rowId]: !prev[rowId] }));
  };

  const activePeriods = periodType === 'Annual' ? finData.periods : finData.quarterlyPeriods;

  const currentRows: FinancialMetricRow[] = 
    statementType === 'laba_rugi' 
      ? finData.incomeStatement 
      : statementType === 'neraca' 
        ? finData.balanceSheet 
        : finData.cashFlow;

  // Filter rows based on collapsed parents
  const visibleRows = currentRows.filter(row => {
    if (!row.parentId) return true;
    return expandedRows[row.parentId] === true;
  });

  // Calculate percentage of revenue for Laba Rugi if in percent mode
  const revenueRow = finData.incomeStatement.find(r => r.id === 'revenue');

  const formatCell = (val: number | undefined, period: string) => {
    if (val === undefined || val === null) return '-';

    if (viewMode === 'percent' && statementType === 'laba_rugi' && revenueRow) {
      const baseRev = revenueRow.values[period] || 1;
      const pct = (val / baseRev) * 100;
      if (pct < 0) {
        return `(${Math.abs(pct).toFixed(1)}%)`;
      }
      return `${pct.toFixed(1)}%`;
    }

    const isNegative = val < 0;
    const absVal = Math.abs(val).toLocaleString('en-US');
    const unit = finData.unit;

    if (isNegative) {
      return `(${absVal} ${unit})`;
    }
    return `${absVal} ${unit}`;
  };

  // Chart data preparation
  const chartData = activePeriods.slice().reverse().map(period => {
    const rev = finData.incomeStatement.find(r => r.id === 'revenue')?.values[period] || 0;
    const gross = finData.incomeStatement.find(r => r.id === 'gross_profit')?.values[period] || 0;
    const op = finData.incomeStatement.find(r => r.id === 'operating_profit')?.values[period] || 0;
    const net = finData.incomeStatement.find(r => r.id === 'final_net_income')?.values[period] || 0;
    return {
      period,
      Pendapatan: rev,
      'Laba Kotor': gross,
      'Laba Usaha': op,
      'Laba Bersih': net
    };
  });

  return (
    <div className="w-full bg-white pb-24 text-gray-900 select-none">
      {/* 1. FINANCIAL SUB-TABS (MATCHING SCREENSHOT) */}
      <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setStatementType('laba_rugi')}
          className={cn(
            "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
            statementType === 'laba_rugi'
              ? "border border-[#00B26A] text-[#00B26A] bg-emerald-50/20 font-bold"
              : "border border-gray-200 text-gray-500 hover:text-gray-800"
          )}
        >
          Laba Rugi
        </button>
        <button
          onClick={() => setStatementType('neraca')}
          className={cn(
            "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
            statementType === 'neraca'
              ? "border border-[#00B26A] text-[#00B26A] bg-emerald-50/20 font-bold"
              : "border border-gray-200 text-gray-500 hover:text-gray-800"
          )}
        >
          Neraca
        </button>
        <button
          onClick={() => setStatementType('arus_kas')}
          className={cn(
            "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
            statementType === 'arus_kas'
              ? "border border-[#00B26A] text-[#00B26A] bg-emerald-50/20 font-bold"
              : "border border-gray-200 text-gray-500 hover:text-gray-800"
          )}
        >
          Arus Kas
        </button>
      </div>

      {/* 2. PERIOD & CONTROLS ROW (MATCHING SCREENSHOT) */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        {/* Dropdown Selector (Annual / Quarterly) */}
        <div className="relative inline-block">
          <select
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value as any)}
            className="appearance-none bg-white border border-gray-200 text-gray-800 text-xs font-bold py-1.5 pl-3 pr-8 rounded-lg shadow-2xs cursor-pointer outline-none focus:border-[#00B26A]"
          >
            <option value="Annual">Annual</option>
            <option value="Quarterly">Quarterly</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Right Controls: $ / % toggle & Chart Toggle */}
        <div className="flex items-center gap-2">
          {/* Currency / Percentage Toggle */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('nominal')}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-0.5",
                viewMode === 'nominal'
                  ? "bg-white text-[#00B26A] shadow-xs border border-emerald-300 font-extrabold"
                  : "text-gray-500 hover:text-gray-800"
              )}
              title="Tampilkan Nilai Nominal (Rp / $)"
            >
              $
            </button>
            <button
              onClick={() => setViewMode('percent')}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-0.5",
                viewMode === 'percent'
                  ? "bg-white text-[#00B26A] shadow-xs border border-emerald-300 font-extrabold"
                  : "text-gray-500 hover:text-gray-800"
              )}
              title="Tampilkan Persentase Margin (%)"
            >
              %
            </button>
          </div>

          {/* Bar Chart View Toggle */}
          <button
            onClick={() => setShowChart(!showChart)}
            className={cn(
              "p-1.5 rounded-lg border transition-all cursor-pointer shadow-2xs",
              showChart
                ? "border-[#00B26A] bg-emerald-50 text-[#00B26A]"
                : "border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            )}
            title="Bagan Visual Finansial"
          >
            <BarChart2 className="w-4 h-4 text-[#00B26A]" />
          </button>
        </div>
      </div>

      {/* 3. VISUAL BAR CHART VIEW (IF ACTIVE) */}
      {showChart && (
        <div className="p-4 bg-gray-50/60 border-b border-gray-100 mb-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-gray-900">Perbandingan Kinerja Keuangan ({finData.unit} {finData.currency})</h4>
            <span className="text-[10px] text-gray-400 font-medium">{periodType}</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                <Bar dataKey="Pendapatan" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Laba Kotor" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Laba Usaha" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Laba Bersih" fill="#00B26A" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. FINANCIAL STATEMENTS TABLE (MATCHING STOCKBIT SCREENSHOT EXACTLY) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[620px]">
          {/* HEADER ROW */}
          <thead>
            <tr className="border-b border-gray-100">
              <th className="sticky left-0 bg-white py-3.5 pl-4 pr-3 text-xs font-bold text-gray-400 w-52 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.03)]">
                {/* Empty corner header matching screenshot */}
              </th>
              {activePeriods.map((period) => (
                <th 
                  key={period} 
                  className="py-3.5 px-3 text-right text-xs font-bold text-gray-900 whitespace-nowrap min-w-[95px]"
                >
                  {period}
                </th>
              ))}
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody className="divide-y divide-gray-50 text-[12px]">
            {visibleRows.map((row) => {
              const isParent = row.isExpandable;
              const isExpanded = isParent && expandedRows[row.id];
              const isSub = row.isSubItem;

              return (
                <tr 
                  key={row.id}
                  className={cn(
                    "hover:bg-gray-50/70 transition-colors",
                    row.isBold ? "font-bold text-gray-900" : "font-normal text-gray-700",
                    isSub ? "bg-gray-50/30 text-gray-600 text-[11.5px]" : ""
                  )}
                >
                  {/* METRIC LABEL COLUMN (STICKY) */}
                  <td 
                    className={cn(
                      "sticky left-0 bg-white py-3 pl-4 pr-2 text-left z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.03)]",
                      isSub ? "pl-7 text-gray-500" : "",
                      isParent ? "cursor-pointer select-none" : ""
                    )}
                    onClick={() => isParent && toggleExpand(row.id)}
                  >
                    <div className="flex items-center gap-1.5">
                      {isParent && (
                        <span className="text-gray-400 text-xs">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 inline" /> : <ChevronDown className="w-3.5 h-3.5 inline" />}
                        </span>
                      )}
                      <span className={cn(row.isBold ? "font-bold text-gray-900" : "")}>
                        {row.name}
                      </span>
                    </div>
                  </td>

                  {/* VALUE COLUMNS ACROSS PERIODS */}
                  {activePeriods.map((period) => (
                    <td 
                      key={period} 
                      className={cn(
                        "py-3 px-3 text-right whitespace-nowrap",
                        row.isBold ? "font-bold text-gray-900" : "text-gray-700"
                      )}
                    >
                      {formatCell(row.values[period], period)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER NOTE */}
      <div className="px-4 py-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
        <span>Satuan: {finData.unit === 'B' ? 'Miliar Rupiah (IDR)' : 'Juta USD ($)'} • Sumber: Laporan Keuangan Resmi BEI</span>
        <span className="font-semibold text-emerald-600">Terverifikasi</span>
      </div>
    </div>
  );
};
