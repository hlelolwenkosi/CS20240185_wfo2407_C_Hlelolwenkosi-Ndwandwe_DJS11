import React, { useState } from 'react';
import { Search } from 'lucide-react';

export function SearchBar({ onSearch }) {
  // State to hold the current search query
  const [query, setQuery] = useState('');

  // Handle search with debouncing to prevent too many search calls
  const handleSearch = (value) => {
    setQuery(value);
    
    // Use a timeout to debounce the search
    const timeoutId = setTimeout(() => {
      onSearch(value); // Call the onSearch prop with the current query
    }, 300); // Adjust the delay (in ms) as needed
    
    // Clean up the timeout on component unmount or query change
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="What do you want to listen to..."
        className="w-full pl-10 pr-4 py-2 rounded-full border 
                   dark:bg-gray-700 dark:border-gray-600
                   dark:text-white dark:placeholder-gray-400  
                   focus:ring-2 focus:ring-purple-600"
      />
      {/* Search icon */}
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2
                         text-gray-400 w-5 h-5" />
    </div>
  );
}