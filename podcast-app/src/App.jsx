// src/App.jsx

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

  // Audio playback and user preferences state
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useLocalStorage('volume', 1);
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const [recentlyPlayed, setRecentlyPlayed] = useLocalStorage('recentlyPlayed', []);

  // Fetch initial podcast data
  useEffect(() => {
    const fetchShows = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://podcast-api.netlify.app');
        if (!response.ok) throw new Error('Failed to fetch shows');
        const data = await response.json();
        setShows(data);
      } catch (error) {
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
        const newRecent = [episode, ...prev.filter(ep => ep.id !== episode.id)].slice(0, 10);
        return newRecent;
      });
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Handle favorites management
  const handleToggleFavorite = (episode) => {
    setFavorites(prev => {
      const isFavorite = prev.some(fav => fav.id === episode.id);
      if (isFavorite) {
        return prev.filter(fav => fav.id !== episode.id);
      }
      return [...prev, { ...episode, addedAt: new Date().toISOString() }];
    });
  };

  // Handle genre selection
  const handleGenreSelect = (genreId) => {
    setSelectedGenre(currentGenre => currentGenre === genreId ? null : genreId);
  };

  // Get filtered and sorted shows
  const getFilteredAndSortedShows = () => {
    // First apply filters
    let filtered = shows.filter(show => {
      const matchesSearch = show.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre ? show.genreIds.includes(parseInt(selectedGenre)) : true;
      return matchesSearch && matchesGenre;
    });

    // Then apply sorting
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

  // Render the shows grid with sorting options
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
              key={show.id}
              show={show}
              onShowSelect={setSelectedShow}
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
    switch (currentView) {
      case 'home':
        return selectedShow ? (
          <ShowDetail
            show={selectedShow}
            currentEpisode={currentEpisode}
            isPlaying={isPlaying}
            favorites={favorites}
            onBack={() => setSelectedShow(null)}
            onPlayEpisode={handlePlayPause}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          renderShowGrid()
        );

      case 'favorites':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Your Favorites</h2>
            {favorites.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                No favorites yet. Start by adding some episodes you love!
              </p>
            ) : (
              <div className="space-y-4">
                {favorites.map(episode => (
                  <div 
                    key={episode.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md 
                             flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold dark:text-white">{episode.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Added: {new Date(episode.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePlayPause(episode)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg 
                                 hover:bg-purple-700"
                      >
                        {currentEpisode?.id === episode.id && isPlaying ? 'Pause' : 'Play'}
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(episode)}
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
                    key={episode.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md 
                             flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold dark:text-white">{episode.title}</h3>
                    </div>
                    <button
                      onClick={() => handlePlayPause(episode)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg 
                               hover:bg-purple-700"
                    >
                      {currentEpisode?.id === episode.id && isPlaying ? 'Pause' : 'Play'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Loading and error states
  if (loading) return <LoadingSpinner />;
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

  // Main application layout
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
            setSelectedShow(null);
            setShowMobileMenu(false);
          }}
          showMobile={showMobileMenu}
          onCloseMobile={() => setShowMobileMenu(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          selectedGenre={selectedGenre}
          onGenreSelect={handleGenreSelect}
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