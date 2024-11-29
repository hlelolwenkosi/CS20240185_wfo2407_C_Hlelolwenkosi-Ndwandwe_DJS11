import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { GENRE_MAP } from '../constants/genres';
import { Play, Pause, Heart, ArrowLeft } from 'lucide-react';

export function FavouritePage(){
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold dark:text-white">Your Favorites</h2>
              <select
                value={favoritesSort}
                onChange={(e) => setFavoritesSort(e.target.value)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600
                         dark:text-white focus:ring-2 focus:ring-purple-600"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
              </select>
            </div>

            {favorites.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                No favorites yet. Start by adding some episodes you love!
              </p>
            ) : (
              <div className="space-y-4">
                {getSortedFavorites().map(favorite => (
                  <div 
                    key={`${favorite.showId}-${favorite.episode}`}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md 
                             flex items-center gap-4"
                  >
                    <img 
                      src={favorite.image} 
                      alt={favorite.showTitle}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold dark:text-white">{favorite.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {favorite.showTitle}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Added: {new Date(favorite.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePlayPause(favorite)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        {currentEpisode?.id === favorite.id && isPlaying ? 'Pause' : 'Play'}
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(favorite)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )};