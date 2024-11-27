// src/components/shows/ShowDetail.jsx
import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { getGenreTitles } from '../../constants/genres';
import { formatters } from '../../utils/formatters';
import { Play, Pause, Heart, ArrowLeft } from 'lucide-react';

export function ShowDetail({ 
  show, 
  currentEpisode,
  isPlaying,
  favorites,
  onBack,
  onPlayEpisode,
  onToggleFavorite 
}) {
  // State for detailed show data and loading state
  const [showDetails, setShowDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [error, setError] = useState(null);

  // Fetch detailed show data when component mounts
  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://podcast-api.netlify.app/id/${show.id}`);
        if (!response.ok) throw new Error('Failed to fetch show details');
        const data = await response.json();
        setShowDetails(data);
        // Set the first season as default selected season
        if (data.seasons && data.seasons.length > 0) {
          setSelectedSeason(data.seasons[0]);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShowDetails();
  }, [show.id]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="text-purple-600 hover:text-purple-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!showDetails) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      {/* Back button and show header */}
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 dark:text-gray-300 
                   hover:text-purple-600 dark:hover:text-purple-400 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Shows
      </button>

      {/* Show information */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <img 
          src={showDetails.image}
          alt={showDetails.title}
          className="w-full md:w-48 h-48 rounded-lg object-cover"
        />
        <div>
          <h2 className="text-3xl font-bold mb-4 dark:text-white">
            {showDetails.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {showDetails.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {getGenreTitles(showDetails.genreIds).map(genre => (
              <span 
                key={genre}
                className="text-sm px-3 py-1 rounded-full
                           bg-purple-100 dark:bg-purple-900 
                           text-purple-800 dark:text-purple-200"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Season selector */}
      {showDetails.seasons && showDetails.seasons.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 dark:text-white">Seasons</h3>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {showDetails.seasons.map(season => (
              <button
                key={season.id}
                onClick={() => setSelectedSeason(season)}
                className={`flex-shrink-0 p-4 rounded-lg border transition-colors
                  ${selectedSeason?.id === season.id
                    ? 'border-purple-600 dark:border-purple-400'
                    : 'border-gray-200 dark:border-gray-700'
                  }`}
              >
                <img 
                  src={season.image}
                  alt={`Season ${season.number}`}
                  className="w-32 h-32 rounded-lg mb-2"
                />
                <h4 className="font-semibold dark:text-white">
                  Season {season.number}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {season.episodes.length} episodes
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Episodes list */}
      {selectedSeason && (
        <div>
          <h3 className="text-xl font-bold mb-4 dark:text-white">Episodes</h3>
          <div className="space-y-4">
            {selectedSeason.episodes.map(episode => {
              const isCurrentEpisode = currentEpisode?.id === episode.id;
              const isFavorite = favorites.some(f => f.id === episode.id);

              return (
                <div
                  key={episode.id}
                  className="flex items-center gap-4 p-4 rounded-lg
                             bg-gray-50 dark:bg-gray-700"
                >
                  <button
                    onClick={() => onPlayEpisode(episode)}
                    className="p-2 rounded-full bg-purple-600 text-white
                              hover:bg-purple-700"
                    aria-label={isCurrentEpisode && isPlaying ? 'Pause' : 'Play'}
                  >
                    {isCurrentEpisode && isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1">
                    <h4 className="font-semibold dark:text-white">
                      {episode.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => onToggleFavorite(episode)}
                    className={`p-2 rounded-full
                      ${isFavorite 
                        ? 'text-red-500' 
                        : 'text-gray-400 dark:text-gray-500'
                      }`}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}