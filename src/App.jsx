import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Play, Pause } from 'lucide-react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AudioPlayer } from './components/layout/AudioPlayer';
import { ShowGrid } from './components/shows/ShowGrid';
import { ShowPage } from './pages/ShowPage';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { useLocalStorage } from './hooks/useLocalStorage';

function AppContent() {
  const location = useLocation();
  const isShowPage = location.pathname.includes('/show/');

  // Core state management
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [showMobile, setShowMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Audio state
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useLocalStorage('volume', 1);

  // User preferences
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const [recentlyPlayed, setRecentlyPlayed] = useLocalStorage('recentlyPlayed', []);
  const [sortOrder, setSortOrder] = useState('title-asc');
  const [favoriteSortOrder, setFavoriteSortOrder] = useState('title-asc');
  const [completedEpisodes, setCompletedEpisodes] = useLocalStorage('completedEpisodes', []);

  // Auto-collapse sidebar on show pages
  useEffect(() => {
    setIsCollapsed(isShowPage);
  }, [isShowPage]);

  // Close page confirmation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isPlaying) {
        e.preventDefault();
        e.returnValue = 'Audio is currently playing. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isPlaying]);

  // Fetch shows data
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
        setError('Failed to load shows. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, []);

  // Handle play/pause
  const handlePlayPause = (episode = null) => {
    if (episode) {
      setCurrentEpisode(episode);
      setIsPlaying(true);
      
      // Update recently played
      setRecentlyPlayed(prev => {
        const newRecent = [
          { 
            ...episode, 
            playedAt: new Date().toISOString(),
            timestamp: localStorage.getItem(`timestamp-${episode.showId}-${episode.episode}`)
          },
          ...prev.filter(ep => 
            !(ep.episode === episode.episode && ep.showId === episode.showId)
          )
        ].slice(0, 10);
        return newRecent;
      });
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Handle favorites
  const handleToggleFavorite = (show) => {
    setFavorites(prev => {
      const isFavorite = prev.some(fav => fav.id === show.id);
      if (isFavorite) {
        return prev.filter(fav => fav.id !== show.id);
      }
      return [...prev, { ...show, addedAt: new Date().toISOString() }];
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

  // Get sorted favorites
  const getSortedFavorites = () => {
    return [...favorites].sort((a, b) => {
      switch (favoriteSortOrder) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'date-desc':
          return new Date(b.addedAt) - new Date(a.addedAt);
        case 'date-asc':
          return new Date(a.addedAt) - new Date(a.addedAt);
        default:
          return 0;
      }
    });
  };

  // Render main content
  const renderHomeContent = () => {
    switch (currentView) {
      case 'favorites':
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold dark:text-white">Favorites</h1>
              <select
                value={favoriteSortOrder}
                onChange={(e) => setFavoriteSortOrder(e.target.value)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600
                         dark:text-white focus:ring-2 focus:ring-purple-600"
              >
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="date-desc">Recently Added</option>
                <option value="date-asc">Oldest Added</option>
              </select>
            </div>
            {favorites.length > 0 ? (
              <ShowGrid
                shows={getSortedFavorites()}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                completedEpisodes={completedEpisodes}
              />
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-400">
                No favorites yet
              </p>
            )}
          </div>
        );

      case 'recent':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 dark:text-white">Recently Played</h1>
            <div className="space-y-4">
              {recentlyPlayed.map((episode, index) => (
                <div
                  key={`${episode.showId}-${episode.episode}-${episode.playedAt}`}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
                >
                  <img
                    src={episode.showImage}
                    alt={episode.showTitle}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold dark:text-white">{episode.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {episode.showTitle} - Season {episode.seasonNumber}
                      {episode.timestamp && ` - ${formatTime(JSON.parse(episode.timestamp).time)}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handlePlayPause(episode)}
                    className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700"
                  >
                    {currentEpisode?.episode === episode.episode && 
                     currentEpisode?.showId === episode.showId && isPlaying ? 
                      <Pause className="w-5 h-5" /> : 
                      <Play className="w-5 h-5" />
                    }
                  </button>
                </div>
              ))}
              {recentlyPlayed.length === 0 && (
                <p className="text-center text-gray-600 dark:text-gray-400">
                  No recently played episodes
                </p>
              )}
            </div>
          </div>
        );

      default: // 'home' view
        return (
          <ShowGrid
            shows={getFilteredAndSortedShows()}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            completedEpisodes={completedEpisodes}
          />
        );
    }
  };

  // Format time helper
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
        onSearch={setSearchQuery}
        onToggleMobileSidebar={() => setShowMobile(!showMobile)}
      />
      
      <div className="flex">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          showMobile={showMobile}
          onCloseMobile={() => setShowMobile(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          selectedGenre={selectedGenre}
          onGenreSelect={setSelectedGenre}
          setShows={setShows}
          setLoading={setLoading}
        />
        
        <main className={`flex-1 overflow-y-auto ${isCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
          <Routes>
            <Route path="/" element={renderHomeContent()} />
            <Route
              path="/show/:showId"
              element={
                <ShowPage
                  shows={shows}
                  currentEpisode={currentEpisode}
                  isPlaying={isPlaying}
                  favorites={favorites}
                  onPlayEpisode={handlePlayPause}
                  onToggleFavorite={handleToggleFavorite}
                  completedEpisodes={completedEpisodes}
                />
              }
            />
          </Routes>
        </main>
      </div>

      {currentEpisode && (
        <AudioPlayer
          currentEpisode={currentEpisode}
          isPlaying={isPlaying}
          volume={volume}
          onPlayPause={handlePlayPause}
          onVolumeChange={setVolume}
          setCompletedEpisodes={setCompletedEpisodes}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;