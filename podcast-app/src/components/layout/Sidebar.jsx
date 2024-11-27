// src/components/layout/Sidebar.jsx
import React from 'react';
import { Home, Heart, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { GENRE_MAP } from '../../constants/genres';

export function Sidebar({ 
  currentView, 
  onViewChange, 
  showMobile, 
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  selectedGenre,
  onGenreSelect 
}) {
  // Define navigation items with their icons and labels
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'favorites', icon: Heart, label: 'Favorites' },
    { id: 'recent', icon: Clock, label: 'Recently Played' }
  ];

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-lg
        transform transition-all duration-300 ease-in-out
        ${showMobile ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-16' : 'w-64'}
        md:relative md:translate-x-0
      `}
    >
      {/* Sidebar content container */}
      <div className={`${isCollapsed ? 'p-2' : 'p-6'}`}>
        {/* Header section with app title and collapse toggle */}
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && (
            <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              Podcast
            </h1>
          )}
          {/* Desktop-only collapse button */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:block p-2 rounded-full hover:bg-gray-100 
                     dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation section */}
        <nav className="space-y-2">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`
                w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} 
                space-x-3 px-3 py-2 rounded-lg transition-colors duration-200
                ${currentView === id 
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
              `}
              title={isCollapsed ? label : undefined}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>

        {/* Genre filters section - only shown when sidebar is expanded */}
        {!isCollapsed && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
              GENRES
            </h2>
            <div className="space-y-2">
              {Object.entries(GENRE_MAP).map(([id, title]) => (
                <button
                  key={id}
                  onClick={() => onGenreSelect(id)}
                  className={`
                    w-full text-left px-3 py-2 text-sm rounded-lg
                    transition-colors duration-200 flex justify-between items-center
                    ${selectedGenre === id 
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                  `}
                >
                  <span>{title}</span>
                  {/* Show 'Clear' text only when this genre is selected */}
                  {selectedGenre === id && (
                    <span className="text-xs opacity-70">(Clear)</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}