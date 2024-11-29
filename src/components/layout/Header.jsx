import React from 'react';
import { Menu } from 'lucide-react';
import { SearchBar } from '../common/SearchBar';
import { ThemeToggle } from '../common/ThemeToggle';

export function Header({ onMenuClick, onSearch }) {
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 text-gray-600 dark:text-gray-300"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Search bar - centered on desktop */}
          <div className="flex-1 max-w-xl mx-auto">
            <SearchBar onSearch={onSearch} />
          </div>
          
          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}