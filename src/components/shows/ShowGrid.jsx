import React from 'react';

export const ShowGrid = ({ show, onShowSelect, favorites, onToggleFavorite }) => {
  const isFavorite = favorites.some(fav => fav.id === show.id);
  
  // Prevent show selection when clicking favorite button
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(show);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden 
                 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => onShowSelect(show)}
    >
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={show.image}
          alt={show.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/api/placeholder/400/320'; // Fallback image
          }}
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg mb-2 dark:text-white line-clamp-2">
            {show.title}
          </h3>
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
                      ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
          >
            <svg
              className="w-5 h-5"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
          {show.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {show.genres?.map((genre, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 
                       text-purple-800 dark:text-purple-100 rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Updated: {new Date(show.updated).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};