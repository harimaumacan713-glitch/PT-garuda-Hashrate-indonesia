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
    <div className="flex h-[72px] w-full items-center justify-around border-t border-border bg-white px-2 pb-safe pt-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-16 transition-colors",
              isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
