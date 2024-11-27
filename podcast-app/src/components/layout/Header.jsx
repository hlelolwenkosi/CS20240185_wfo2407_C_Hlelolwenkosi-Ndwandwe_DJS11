
import React from 'react';
import { Search, Menu } from 'lucide-react';

export function Header({ 
  showMobileMenu, 
  setShowMobileMenu, 
  isDark 
}) {
  return (
    <header className={`
      sticky top-0 z-40 p-4
      ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} 
      shadow-sm
    `}>
      {/* Header content */}
    </header>
  );
}