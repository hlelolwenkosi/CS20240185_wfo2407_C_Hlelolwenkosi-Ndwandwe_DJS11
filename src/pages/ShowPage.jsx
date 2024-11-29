import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { GENRE_MAP } from '../constants/genres';
import { Play, Pause, Heart, ArrowLeft } from 'lucide-react';

export function ShowPage({
  shows,
  currentEpisode,
  isPlaying,
  favorites,
  onPlayEpisode,
  onToggleFavorite
}) {
  const { showId } = useParams();
  const navigate = useNavigate();
  
  const [showDetails, setShowDetails] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Find show in the shows array
  const show = shows.find(s => s.id === showId || s.id === parseInt(showId));

  // Fetch show details
  useEffect(() => {
    const fetchShowDetails = async () => {
      if (!showId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`https://podcast-api.netlify.app/id/${showId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch show details');
        }
        
        const data = await response.json();
        
        if (!data || !Array.isArray(data.seasons)) {
          throw new Error('Invalid show data received');
        }
        
        setShowDetails(data);
        if (data.seasons.length > 0) {
          setSelectedSeason(data.seasons[0]);
        }
      } catch (err) {
        console.error('Error fetching show details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShowDetails();
  }, [showId]);

  // Check if an episode is a favorite
  const isEpisodeFavorite = (episode, seasonNumber) => {
    return favorites.some(fav => 
      fav.episode === episode.episode && 
      fav.showId === show.id &&
      fav.seasonNumber === seasonNumber
    );
  };

  // Handle episode play/pause
  const handlePlayEpisode = (episode, seasonNumber) => {
    const episodeWithDetails = {
      ...episode,
      showId: show.id,
      showTitle: show.title,
      seasonNumber: seasonNumber,
      showImage: show.image,
      audio: episode.file // Make sure the audio file is included
    };
    onPlayEpisode(episodeWithDetails);
  };

  // Handle favorite toggle
  const handleToggleFavorite = (episode, seasonNumber) => {
    const episodeWithDetails = {
      ...episode,
      showId: show.id,
      showTitle: show.title,
      seasonNumber: seasonNumber,
      showImage: show.image
    };
    onToggleFavorite(episodeWithDetails, show);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        <div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!show || !showDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        <div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Show not found</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="mb-6 flex items-center text-purple-600 hover:text-purple-700"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Shows
      </button>

      {/* Show info */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <img 
          src={show.image}
          alt={show.title}
          className="w-full md:w-48 h-48 rounded-lg object-cover"
        />
        <div>
          <h1 className="text-3xl font-bold mb-4 dark:text-white">{show.title}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{show.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {show.genres?.map(genreId => (
              <span 
                key={genreId}
                className="text-sm px-3 py-1 rounded-full
                         bg-purple-100 dark:bg-purple-900 
                         text-purple-800 dark:text-purple-200"
              >
                {GENRE_MAP[genreId]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Seasons */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Seasons</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {showDetails.seasons.map(season => (
            <button
              key={season.season}
              onClick={() => setSelectedSeason(season)}
              className={`
                flex-shrink-0 p-4 rounded-lg border transition-colors
                ${selectedSeason?.season === season.season
                  ? 'border-purple-600 dark:border-purple-400'
                  : 'border-gray-200 dark:border-gray-700'
                }
              `}
            >
              <img 
                src={season.image}
                alt={`Season ${season.season}`}
                className="w-32 h-32 rounded-lg mb-2"
              />
              <h3 className="font-semibold dark:text-white">Season {season.season}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {season.episodes.length} episodes
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Episodes */}
      {selectedSeason && (
        <div>
          <h2 className="text-xl font-bold mb-4 dark:text-white">Episodes</h2>
          <div className="space-y-4">
            {selectedSeason.episodes.map(episode => {
              const isCurrentlyPlaying = currentEpisode?.episode === episode.episode && 
                                      currentEpisode?.showId === show.id &&
                                      currentEpisode?.seasonNumber === selectedSeason.season;
              
              const isFavorite = isEpisodeFavorite(episode, selectedSeason.season);

              return (
                <div
                  key={episode.episode}
                  className="flex items-center gap-4 p-4 rounded-lg
                           bg-gray-50 dark:bg-gray-700"
                >
                  <button
                    onClick={() => handlePlayEpisode(episode, selectedSeason.season)}
                    className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700"
                  >
                    {isCurrentlyPlaying && isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1">
                    <h3 className="font-semibold dark:text-white">
                      Episode {episode.episode}: {episode.title}
                    </h3>
                    {episode.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {episode.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleFavorite(episode, selectedSeason.season)}
                    className={`p-2 rounded-full
                      ${isFavorite 
                        ? 'text-red-500' 
                        : 'text-gray-400 dark:text-gray-500'
                      }
                      hover:text-red-600`}
                  >
                    <Heart 
                      className="w-5 h-5" 
                      fill={isFavorite ? 'currentColor' : 'none'} 
                    />
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