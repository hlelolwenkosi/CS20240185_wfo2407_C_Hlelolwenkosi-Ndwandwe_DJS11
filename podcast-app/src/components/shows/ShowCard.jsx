// src/components/shows/ShowCard.jsx
import React from 'react';
import { getGenreTitles } from '../../constants/genres';

export function ShowCard({ show, isDark, onClick }) {
  // The ShowCard component represents each individual podcast show in the grid
  return (
    <div 
      onClick={onClick}
      className={`
        cursor-pointer
        ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} 
        rounded-lg shadow-md overflow-hidden
        transition-shadow hover:shadow-lg
      `}
    >
      <img 
        src={show.image} 
        alt={show.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h4 className="font-bold mb-2">{show.title}</h4>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
          {show.seasons} seasons
        </p>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
          Updated: {new Date(show.updated).toLocaleDateString()}
        </p>
        <div className="flex flex-wrap gap-2">
          {getGenreTitles(show.genreIds).map(genre => (
            <span 
              key={genre} 
              className={`text-xs px-2 py-1 rounded 
                ${isDark 
                  ? 'bg-purple-900 text-purple-100' 
                  : 'bg-purple-100 text-purple-800'
                }`}
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}


// src/components/shows/ShowDetail.jsx
import React, { useState } from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { getGenreTitles } from '../../constants/genres';

export function ShowDetail({ 
  show, 
  isDark,
  onPlayEpisode,
  isPlaying,
  currentEpisode,
  onToggleFavorite,
  favorites 
}) {
  const [selectedSeason, setSelectedSeason] = useState(show.seasons[0]);

  // The ShowDetail component displays comprehensive information about a selected show
  return (
    <div className={`
      ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} 
      rounded-lg p-6
    `}>
      {/* Show header with image and basic info */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <img 
          src={show.image}
          alt={show.title}
          className="w-full md:w-48 h-48 rounded-lg object-cover"
        />
        <div>
          <h2 className="text-3xl font-bold mb-4">{show.title}</h2>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            {show.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {getGenreTitles(show.genreIds).map(genre => (
              <span 
                key={genre}
                className={`text-sm px-3 py-1 rounded-full
                  ${isDark 
                    ? 'bg-purple-900 text-purple-100' 
                    : 'bg-purple-100 text-purple-800'
                  }`}
              >
                {genre}
              </span>
            ))}
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Last updated: {new Date(show.updated).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Season selection */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Seasons</h3>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {show.seasons.map((season) => (
            <button
              key={season.id}
              onClick={() => setSelectedSeason(season)}
              className={`
                flex-shrink-0 border rounded-lg p-4
                ${selectedSeason.id === season.id 
                  ? 'border-purple-600' 
                  : isDark ? 'border-gray-700' : 'border-gray-200'
                }
                ${isDark ? 'hover:border-gray-600' : 'hover:border-gray-300'}
                transition-colors
              `}
            >
              <img 
                src={season.image}
                alt={season.title}
                className="w-32 h-32 rounded mb-2"
              />
              <h4 className="font-semibold">{season.title}</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {season.episodes.length} episodes
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Episodes list */}
      <div>
        <h3 className="text-xl font-bold mb-4">Episodes</h3>
        <div className="space-y-4">
          {selectedSeason.episodes.map((episode) => (
            <div
              key={episode.id}
              className={`
                flex items-center gap-4 p-4 rounded-lg
                ${isDark ? 'bg-gray-700' : 'bg-gray-50'}
              `}
            >
              <button
                onClick={() => onPlayEpisode(episode, show, selectedSeason)}
                className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700"
              >
                {currentEpisode?.id === episode.id && isPlaying 
                  ? <Pause className="w-5 h-5" /> 
                  : <Play className="w-5 h-5" />
                }
              </button>
              <div className="flex-1">
                <h4 className="font-semibold">{episode.title}</h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  45:00
                </p>
              </div>
              <button 
                onClick={() => onToggleFavorite(episode, show, selectedSeason)}
                className={`p-2 ${
                  favorites.some(f => f.episode.id === episode.id)
                    ? 'text-red-500'
                    : isDark ? 'text-gray-400' : 'text-gray-500'
                } hover:text-red-500`}
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}