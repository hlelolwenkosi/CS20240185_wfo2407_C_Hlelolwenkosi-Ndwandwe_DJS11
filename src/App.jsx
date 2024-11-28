import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AudioPlayer } from './components/layout/AudioPlayer';
import { ShowGrid } from './components/shows/ShowGrid';
import { ShowDetail } from './components/shows/ShowDetail';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { useLocalStorage } from './hooks/useLocalStorage';
import { GENRE_MAP } from './constants/genres';

export default function App() {
  // Core state management for podcast data
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI and navigation state
  const [currentView, setCurrentView] = useState('home');
  const [selectedShow, setSelectedShow] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage('sidebarCollapsed', false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [sortOrder, setSortOrder] = useState('title-asc');
  const [currentPage, setCurrentPage] = useState('main');
  const [favoritesSort, setFavoritesSort] = useState('date-desc');

  // Audio playback and user preferences state
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useLocalStorage('volume', 1);
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const [recentlyPlayed, setRecentlyPlayed] = useLocalStorage('recentlyPlayed', []);

  // Handle show selection
  const handleShowSelect = (show) => {
    setSelectedShow(show);
    setCurrentPage('show');
  };

  // Handle back to main page
  const handleBackToMain = () => {
    setCurrentPage('main');
    setSelectedShow(null);
  };

  // Reset functionality
  const handleReset = () => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset all your progress? This will clear your favorites and listening history.'
    );
    
    if (confirmReset) {
      console.log('Resetting all user data');
      setFavorites([]);
      setRecentlyPlayed([]);
      localStorage.removeItem('favorites');
      localStorage.removeItem('recentlyPlayed');
    }
  };

  // Fetch initial podcast data
  useEffect(() => {
    const fetchShows = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://podcast-api.netlify.app/shows');
        if (!response.ok) throw new Error('Failed to fetch shows');
        const data = await response.json();
        setShows(data);
      } catch (error) {
        console.error('Error fetching shows:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, []);

  // Handle audio playback
  const handlePlayPause = (episode = null) => {
    if (episode) {
      setCurrentEpisode(episode);
      setIsPlaying(true);
      setRecentlyPlayed(prev => {
        const newRecent = [{
          ...episode,
          playedAt: new Date().toISOString()
        }, ...prev.filter(ep => 
          !(ep.episode === episode.episode && ep.showId === episode.showId)
        )].slice(0, 10);
        return newRecent;
      });
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Handle favorites management
  const handleToggleFavorite = (episode, showDetails = null) => {
    setFavorites(prev => {
      const uniqueId = `${showDetails?.id || episode.showId}-${episode.episode}`;
      
      const isFavorite = prev.some(fav => 
        `${fav.showId}-${fav.episode}` === uniqueId
      );

      if (isFavorite) {
        return prev.filter(fav => 
          `${fav.showId}-${fav.episode}` !== uniqueId
        );
      }

      const newFavorite = {
        ...episode,
        showId: showDetails?.id || episode.showId,
        showTitle: showDetails?.title || episode.showTitle,
        showImage: showDetails?.image || episode.showImage,
        addedAt: new Date().toISOString()
      };

      return [...prev, newFavorite];
    });
  };

  // Get sorted favorites
  const getSortedFavorites = () => {
    return [...favorites].sort((a, b) => {
      switch (favoritesSort) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'date-desc':
          return new Date(b.addedAt) - new Date(a.addedAt);
        case 'date-asc':
          return new Date(a.addedAt) - new Date(b.addedAt);
        default:
          return 0;
      }
    });
  };

  // Get filtered and sorted shows
  const getFilteredAndSortedShows = () => {
    let filtered = shows.filter(show => {
      const matchesSearch = show.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre ? show.genres.includes(Number(selectedGenre)) : true;
      return matchesSearch && matchesGenre;
    });

    return filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'date-desc':
          return new Date(b.updated) - new Date(a.updated);
        case 'date-asc':
          return new Date(a.updated) - new Date(b.updated);
        default:
          return 0;
      }
    });
  };

  // Render the shows grid
  const renderShowGrid = () => {
    const filteredAndSortedShows = getFilteredAndSortedShows();

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">
            {selectedGenre 
              ? `${GENRE_MAP[selectedGenre]} Shows` 
              : 'All Shows'
            }
          </h2>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600
                     dark:text-white focus:ring-2 focus:ring-purple-600"
          >
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedShows.map(show => (
            <ShowGrid
              key={`show-${show.id}`}
              show={show}
              onShowSelect={handleShowSelect}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      </div>
    );
  };

  // Main view renderer
  const renderView = () => {
    if (currentPage === 'show' && selectedShow) {
      return (
        <ShowDetail
          show={selectedShow}
          currentEpisode={currentEpisode}
          isPlaying={isPlaying}
          favorites={favorites}
          onBack={handleBackToMain}
          onPlayEpisode={handlePlayPause}
          onToggleFavorite={handleToggleFavorite}
        />
      );
    }

    switch (currentView) {
      case 'home':
        return renderShowGrid();

      case 'favorites':
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
                      src={favorite.showImage} 
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
        );

      case 'recent':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Recently Played</h2>
            {recentlyPlayed.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                No listening history yet. Start playing some episodes!
              </p>
            ) : (
              <div className="space-y-4">
                {recentlyPlayed.map(episode => (
                  <div 
                    key={`recent-${episode.showId}-${episode.episode}`}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md 
                             flex items-center gap-4"
                  >
                    <img 
                      src={episode.showImage} 
                      alt={episode.showTitle}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold dark:text-white">{episode.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {episode.showTitle}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Played: {new Date(episode.playedAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePlayPause(episode)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      {currentEpisode?.id === episode.id && isPlaying ? 'Pause' : 'Play'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg 
                         border border-red-600"
              >
                Reset All Progress
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
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
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        onMenuClick={() => setShowMobileMenu(true)}
        onSearch={setSearchQuery}
      />

      <div className="flex">
        <Sidebar
          currentView={currentView}
          onViewChange={(view) => {
            setCurrentView(view);
            setCurrentPage('main');
            setSelectedShow(null);
            setShowMobileMenu(false);
          }}
          showMobile={showMobileMenu}
          onCloseMobile={() => setShowMobileMenu(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          selectedGenre={selectedGenre}
          onGenreSelect={setSelectedGenre}
          setShows={setShows}
          setLoading={setLoading}
          onReset={handleReset}
        />


        <main className={`flex-1 overflow-y-auto ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
          {renderView()}
        </main>

        {currentEpisode && (
          <AudioPlayer
            currentEpisode={currentEpisode}
            isPlaying={isPlaying}
            volume={volume}
            onPlayPause={handlePlayPause}
            onVolumeChange={setVolume}
          />
        )}
      </div>
    </div>
  );
}