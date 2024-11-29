import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { GENRE_MAP } from '../../constants/genres';

export function ShowDetail({ 
  show, 
  currentEpisode, 
  favorites, 
  onBack, 
  onPlayEpisode, 
  onToggleFavorite 
}) {
  // State to store seasons, selected season, loading state, and error
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch seasons when the show changes
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        console.log('Fetching seasons for show:', show.id);
        setLoading(true);
        const response = await fetch(`https://podcast-api.netlify.app/id/${show.id}`);
        if (!response.ok) throw new Error('Failed to fetch seasons');
        const data = await response.json();
        console.log('Received show data:', data);
        
        if (!data.seasons) {
          console.error('No seasons found in data');
          throw new Error('No seasons data available');
        }

        setSeasons(data.seasons);
        setSelectedSeason(data.seasons[0]); // Select first season by default
      } catch (error) {
        console.error('Error fetching seasons:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSeasons();
  }, [show.id]);

  // Log whenever selected season changes
  useEffect(() => {
    console.log('Selected season changed:', selectedSeason);
  }, [selectedSeason]);

  // Check if an episode is in favorites
  const isEpisodeFavorite = (episode) => {
    return favorites.some(fav => 
      fav.showId === show.id && 
      fav.episode === episode.episode && 
      fav.seasonNumber === selectedSeason?.season
    );
  };

  // Handle season change
  const handleSeasonChange = (season) => {
    console.log('Changing to season:', season);
    setSelectedSeason(season);
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-full">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-4 flex items-center text-purple-600 hover:text-purple-700"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Shows
      </button>

      {/* Show details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <img
            src={show.image}
            alt={show.title}
            className="w-full md:w-64 h-48 md:h-64 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4 dark:text-white">
              {show.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm md:text-base">
              {show.description}
            </p>
            {/* Genre tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {show.genres?.map(genreId => (
                <span
                  key={`genre-${genreId}`}
                  className="px-2 py-1 text-xs md:text-sm bg-purple-100 text-purple-800 rounded-full"
                >
                  {GENRE_MAP[genreId]}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {seasons.length} {seasons.length === 1 ? 'Season' : 'Seasons'} Available
            </p>
          </div>
        </div>
      </div>

      {/* Season Selection */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {seasons.map(season => (
            <button
              key={season.season}
              onClick={() => handleSeasonChange(season)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedSeason?.season === season.season
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Season {season.season}
              <span className="ml-2 text-sm opacity-75">
                ({season.episodes.length} episodes)
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        // Error state
        <div className="text-red-600 p-4">{error}</div>
      ) : selectedSeason ? (
        // Episodes list
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold dark:text-white">
              Season {selectedSeason.season} Episodes
            </h2>
            {selectedSeason.image && (
              <img 
                src={selectedSeason.image} 
                alt={`Season ${selectedSeason.season}`}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
          </div>

          {selectedSeason.episodes.map((episode) => (
            <div
              key={`${selectedSeason.season}-${episode.episode}`}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold dark:text-white text-base md:text-lg mb-1">
                    Episode {episode.episode}: {episode.title}
                  </h3>
                  {episode.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {episode.description}
                    </p>
                  )}
                </div>
                {/* Episode actions */}
                <div className="flex gap-2 md:flex-shrink-0">
                  {/* Play/Pause button */}
                  <button
                    onClick={() => {
                      const episodeWithDetails = {
                        ...episode,
                        seasonNumber: selectedSeason.season,
                        showId: show.id,
                        showTitle: show.title,
                        showImage: selectedSeason.image || show.image
                      };
                      console.log('Playing episode:', episodeWithDetails);
                      onPlayEpisode(episodeWithDetails);
                    }}
                    className="flex-1 md:flex-initial px-4 py-2 bg-purple-600 text-white rounded-lg 
                             hover:bg-purple-700 text-sm md:text-base whitespace-nowrap"
                  >
                    {currentEpisode?.episode === episode.episode && 
                     currentEpisode?.seasonNumber === selectedSeason.season ? 'Pause' : 'Play'}
                  </button>
                  {/* Favorite/Unfavorite button */}
                  <button
                    onClick={() => {
                      const episodeWithDetails = {
                        ...episode,
                        seasonNumber: selectedSeason.season,
                        showId: show.id,
                        showTitle: show.title,
                        showImage: selectedSeason.image || show.image
                      };
                      console.log('Toggling favorite:', episodeWithDetails);
                      onToggleFavorite(episodeWithDetails, show);
                    }}
                    className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-sm md:text-base whitespace-nowrap
                              ${isEpisodeFavorite(episode)
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-gray-600 hover:bg-gray-50'
                              }`}
                  >
                    {isEpisodeFavorite(episode) ? 'Remove' : 'Favorite'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}