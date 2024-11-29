import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GENRE_MAP } from '../../constants/genres';

export function ShowGrid({ shows = [], favorites = [], onToggleFavorite, sortOrder, onSortChange }) {
  const navigate = useNavigate();

  if (!shows || shows.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-gray-500 dark:text-gray-400">No shows found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Sorting controls */}
      {sortOrder !== undefined && onSortChange && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Shows</h2>
          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600
                     dark:text-white focus:ring-2 focus:ring-purple-600"
          >
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
          </select>
        </div>
      )}

      {/* Shows grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shows.map((show) => (
          <div 
            key={`show-${show.id}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden
                     hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/show/${show.id}`)}
          >
            <div className="aspect-w-16 aspect-h-9">
              <img 
                src={show.image} 
                alt={show.title} 
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.src = '/api/placeholder/400/320';
                }}
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold dark:text-white mb-2 line-clamp-2">
                  {show.title}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(show);
                  }}
                  className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
                             ${favorites.some(f => f.id === show.id) ? 'text-red-500' : 'text-gray-400'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
                {show.description}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
           {show.seasons} Seasons
        </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {show.genres?.map(genreId => (
                  <span 
                    key={`${show.id}-genre-${genreId}`}
                    className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 
                             text-purple-800 dark:text-purple-200 rounded-full"
                  >
                    {GENRE_MAP[genreId]}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Updated: {new Date(show.updated).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}