import React from 'react';
import { Star, FileText, Search, MessageSquare, PieChart } from 'lucide-react';
import { cn } from '../lib/utils';

type BottomNavProps = {
  activeTab: string;
  onChange: (tab: string) => void;
};

const tabs = [
  { id: 'watchlist', label: 'Watchlist', icon: Star },
  { id: 'stream', label: 'Stream', icon: FileText },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'portfolio', label: 'Portfolio', icon: PieChart },
];

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="flex h-14 w-full items-center justify-around border-t border-gray-100 bg-white px-2 shrink-0 z-40 select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 w-16 py-1 transition-all active:scale-95",
              isActive ? "text-[#00AA5B]" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Icon 
              className={cn("h-5 w-5 transition-transform", isActive ? "stroke-[#00AA5B]" : "stroke-gray-400")} 
              strokeWidth={isActive ? 2.2 : 1.75} 
            />
            <span className={cn(
              "text-[10px] tracking-tight leading-tight",
              isActive ? "font-bold text-[#00AA5B]" : "font-normal text-gray-500"
            )}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
