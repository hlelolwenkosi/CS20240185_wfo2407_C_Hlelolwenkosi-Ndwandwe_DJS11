import React, { useState } from 'react';
import { Search } from 'lucide-react';

export function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  // Handle search with debouncing
  const handleSearch = (value) => {
    setQuery(value);
    // Use a timeout to prevent too many search calls
    const timeoutId = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search podcasts..."
        className="w-full pl-10 pr-4 py-2 rounded-full border 
                   dark:bg-gray-700 dark:border-gray-600 
                   dark:text-white dark:placeholder-gray-400
                   focus:ring-2 focus:ring-purple-600"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 
                        text-gray-400 w-5 h-5" />
    </div>
  );
}