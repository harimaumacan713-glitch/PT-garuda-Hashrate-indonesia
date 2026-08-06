/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNav } from './components/BottomNav';
import { WatchlistPage } from './pages/WatchlistPage';
import { StreamPage } from './pages/StreamPage';
import { SearchPage } from './pages/SearchPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  const [activeTab, setActiveTab] = useState('stream');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const renderPage = () => {
    switch (activeTab) {
      case 'watchlist': return <WatchlistPage onOpenProfile={() => setIsProfileOpen(true)} />;
      case 'stream': return <StreamPage onOpenProfile={() => setIsProfileOpen(true)} />;
      case 'search': return <SearchPage onOpenProfile={() => setIsProfileOpen(true)} />;
      case 'chat': return <div className="flex h-full items-center justify-center text-gray-400 font-medium">Chat Coming Soon</div>;
      case 'portfolio': return <PortfolioPage onOpenProfile={() => setIsProfileOpen(true)} />;
      default: return <StreamPage onOpenProfile={() => setIsProfileOpen(true)} />;
    }
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      <main className="relative flex-1 overflow-x-hidden bg-background no-scrollbar">
        <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
        <BottomNav activeTab={activeTab} onChange={setActiveTab} />
        
        {/* Profile Overlay */}
        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-50 bg-white"
            >
              <ProfilePage onClose={() => setIsProfileOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
