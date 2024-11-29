// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AudioPlayer } from './components/layout/AudioPlayer';
import { ShowGrid } from './components/shows/ShowGrid';
import { ShowPage } from './pages/showPage';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { useLocalStorage } from './hooks/useLocalStorage';
import { GENRE_MAP } from './constants/genres';

function HomePage({
  shows,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  sortOrder,
  setSortOrder,
  favorites,
  handleToggleFavorite,
  onShowSelect,
  setLoading
}) {
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
          return new Date(a.updated) - new Date(a.updated);
        default:
          return 0;
      }
    });
  };

  // Render shows grid
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
              onShowSelect={onShowSelect}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      </div>
    );
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
      />

      <div className="flex">
        <Sidebar
          selectedGenre={selectedGenre}
          onGenreSelect={setSelectedGenre}
          setLoading={setLoading}
        />

        <main className="flex-1 overflow-y-auto md:ml-64">
          {renderShowGrid()}
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  
  // Core state management
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [sortOrder, setSortOrder] = useState('title-asc');

  // Audio and preferences state
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useLocalStorage('volume', 1);
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const [recentlyPlayed, setRecentlyPlayed] = useLocalStorage('recentlyPlayed', []);

  // Fetch initial data
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

  // Handle favorites
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

  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={
            <HomePage
              shows={shows}
              loading={loading}
              error={error}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedGenre={selectedGenre}
              setSelectedGenre={setSelectedGenre}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              favorites={favorites}
              handleToggleFavorite={handleToggleFavorite}
              onShowSelect={(show) => navigate(`/show/${show.id}`)}
              setLoading={setLoading}
            />
          }
        />
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
            />
          }
        />
      </Routes>

      {currentEpisode && (
        <AudioPlayer
          currentEpisode={currentEpisode}
          isPlaying={isPlaying}
          volume={volume}
          onPlayPause={handlePlayPause}
          onVolumeChange={setVolume}
        />
      )}
    </>
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