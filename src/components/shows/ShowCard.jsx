import React from 'react';
import { Heart } from 'lucide-react';
import { getGenreTitles } from '../../constants/genres';
import { formatters } from '../../utils/formatters';

export function ShowCard({ show, onShowSelect, isFavorite, onToggleFavorite }) {
  // Render an individual show card with image, title, and basic information
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden
                 transition-shadow hover:shadow-lg cursor-pointer"
      onClick={() => onShowSelect(show)}
    >
      <div className="p-4">
        {/* Show title and metadata */}
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg mb-2 dark:text-white">{show.title}</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(show);
            }}
            className={`p-2 rounded-full ${
              isFavorite 
                ? 'text-red-500' 
                : 'text-gray-400 dark:text-gray-500'
            }`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Show metadata */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {show.seasons} {show.seasons === 1 ? 'season' : 'seasons'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Updated: {formatters.date(show.updated)}
        </p>

        {/* Genre tags */}
        <div className="flex flex-wrap gap-2">
          {getGenreTitles(show.genreIds).map(genre => (
            <span 
              key={genre}
              className="text-xs px-2 py-1 rounded-full
                         bg-purple-100 dark:bg-purple-900 
                         text-purple-800 dark:text-purple-200"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
