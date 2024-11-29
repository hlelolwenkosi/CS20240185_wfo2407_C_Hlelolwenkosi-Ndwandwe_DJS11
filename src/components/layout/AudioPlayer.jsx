import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export function AudioPlayer({ 
  currentEpisode, 
  isPlaying, 
  volume, 
  onPlayPause, 
  onVolumeChange,
  setCompletedEpisodes 
}) {
  const audioRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Handle progress bar click
  const handleProgressClick = (event) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * duration;
    audioElement.currentTime = newTime;
  };

  // Handle time updates and save progress
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      
      setCurrentTime(current);

      // Save timestamp
      const timestamp = {
        showId: currentEpisode.showId,
        episodeId: currentEpisode.episode,
        time: current,
        duration: duration,
        lastPlayed: new Date().toISOString()
      };
      
      localStorage.setItem(
        `timestamp-${currentEpisode.showId}-${currentEpisode.episode}`,
        JSON.stringify(timestamp)
      );

      // Check if episode is completed (>90% played)
      if (current / duration > 0.9) {
        setCompletedEpisodes(prev => {
          const episodeKey = `${currentEpisode.showId}-${currentEpisode.episode}`;
          if (!prev.includes(episodeKey)) {
            return [...prev, episodeKey];
          }
          return prev;
        });
      }
    }
  };

  // Handle audio ended
  const handleEnded = () => {
    onPlayPause(false);
    setCompletedEpisodes(prev => {
      const episodeKey = `${currentEpisode.showId}-${currentEpisode.episode}`;
      if (!prev.includes(episodeKey)) {
        return [...prev, episodeKey];
      }
      return prev;
    });
  };

  // Load saved timestamp and set audio source
  useEffect(() => {
    if (currentEpisode?.audio) {
      setIsLoading(true);
      setCurrentTime(0);
      audioRef.current.src = currentEpisode.audio;
      
      const savedTimestamp = localStorage.getItem(
        `timestamp-${currentEpisode.showId}-${currentEpisode.episode}`
      );
      
      if (savedTimestamp) {
        try {
          const { time } = JSON.parse(savedTimestamp);
          audioRef.current.currentTime = time;
        } catch (error) {
          console.error('Error parsing saved timestamp:', error);
        }
      }
    }
  }, [currentEpisode]);

  // Handle play/pause state
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    audioElement.volume = volume;
    if (isPlaying) {
      if (audioElement.readyState >= 2) {
        audioElement.play().catch(error => {
          console.error('Playback failed:', error);
          onPlayPause(false);
        });
      }
    } else {
      audioElement.pause();
    }
  }, [isPlaying, volume, onPlayPause]);

  // Handle page unload warning
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isPlaying && audioRef.current && !audioRef.current.ended) {
        event.preventDefault();
        event.returnValue = '';
        return 'Audio is currently playing. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload, { capture: true });
    window.addEventListener('unload', handleBeforeUnload, { capture: true });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload, { capture: true });
      window.removeEventListener('unload', handleBeforeUnload, { capture: true });
    };
  }, [isPlaying]);

  // Format time helper
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!currentEpisode) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t 
                    border-gray-200 dark:border-gray-700 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Episode Info */}
        <div className="flex items-center gap-4 flex-1">
          {currentEpisode.showImage && (
            <img 
              src={currentEpisode.showImage} 
              alt={currentEpisode.showTitle}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div>
            <h3 className="font-semibold dark:text-white">{currentEpisode.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentEpisode.showTitle}
              {currentEpisode.seasonNumber && ` - Season ${currentEpisode.seasonNumber}`}
            </p>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-4 flex-1">
          {/* Play/Pause Button */}
          <button
            onClick={() => onPlayPause(!isPlaying)}
            disabled={isLoading}
            className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent 
                            rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>

          {/* Time Display */}
          <div className="text-sm text-gray-600 dark:text-gray-400 w-20">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Progress Bar */}
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
               onClick={handleProgressClick}>
            <div 
              className="h-full bg-purple-600 rounded-full transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            />
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            {volume === 0 ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-24"
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          setDuration(audioRef.current.duration);
          setIsLoading(false);
        }}
        onEnded={handleEnded}
      />
    </div>
  );
}