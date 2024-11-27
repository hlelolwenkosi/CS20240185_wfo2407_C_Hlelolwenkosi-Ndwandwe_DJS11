
import React from 'react';
import { Home, Heart, Clock, Sun, Moon } from 'lucide-react';
import { GENRE_MAP } from '../../constants/genres';

export function Sidebar({ 
  currentView, 
  setCurrentView, 
  isDark, 
  setIsDark, 
  showMobileMenu 
}) {
  return (
    <aside className={`
      ${showMobileMenu ? 'block' : 'hidden'} 
      md:block fixed md:relative z-50 md:z-0 w-64 h-full 
      ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} 
      shadow-lg
    `}>
      {/* Sidebar content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <img src="/api/placeholder/32/32" alt="Cranbery logo" className="w-8 h-8 rounded-full bg-purple-100" />
            <h1 className="text-2xl font-bold text-purple-600">Cranbery</h1>
          </div>
          
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-lg ${
              isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-4">
          {/* Navigation buttons */}
        </nav>

        {/* Genre Filter */}
        <div className="mt-8">
          <h2 className={`text-sm font-semibold mb-4 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            GENRES
          </h2>
          <div className="space-y-2">
            {Object.entries(GENRE_MAP).map(([id, title]) => (
              <button
                key={id}
                className={`text-sm w-full text-left px-2 py-1 rounded 
                  ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}



