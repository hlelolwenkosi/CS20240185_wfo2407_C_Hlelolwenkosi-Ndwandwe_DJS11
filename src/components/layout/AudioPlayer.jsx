// src/components/layout/AudioPlayer.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export function AudioPlayer({ 
  currentEpisode, 
  isPlaying, 
  volume, 
  onPlayPause, 
  onVolumeChange 
}) {
  const audioRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Handle audio element setup and cleanup
  useEffect(() => {
    const audioElement = audioRef.current;
    
    // Set up audio event listeners
    const handleCanPlay = () => {
      setIsLoading(false);
      if (isPlaying) {
        // Only attempt to play when audio is actually ready
        audioElement.play().catch(error => {
          console.error('Playback failed:', error);
          onPlayPause(false);
        });
      }
    };

    const handleTimeUpdate = () => {
      setProgress((audioElement.currentTime / audioElement.duration) * 100);
    };

    const handleEnded = () => {
      onPlayPause(false);
      setProgress(0);
    };

    // Add event listeners
    audioElement.addEventListener('canplay', handleCanPlay);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('ended', handleEnded);

    // Cleanup function
    return () => {
      audioElement.removeEventListener('canplay', handleCanPlay);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [isPlaying, onPlayPause]);

  // Handle changes to current episode
  useEffect(() => {
    if (currentEpisode) {
      setIsLoading(true);
      // Use a placeholder audio file since the API oesn't provide real audio
      audioRef.current.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    }
  }, [currentEpisode]);

  // Handle play/pause state changes
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isPlaying) {
      if (audioElement.readyState >= 2) { // HAVE_CURRENT_DATA or better
        audioElement.play().catch(error => {
          console.error('Playback failed:', error);
          onPlayPause(false);
        });
      }
    } else {
      audioElement.pause();
    }
  }, [isPlaying, onPlayPause]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Episode info */}
        <div className="flex-1">
          <h4 className="font-semibold dark:text-white">
            {currentEpisode?.title || 'Select an episode'}
          </h4>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onPlayPause(!isPlaying)}
            disabled={isLoading}
            className={`p-2 rounded-full bg-purple-600 text-white 
                       hover:bg-purple-700 disabled:opacity-50`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          {/* Volume control */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}
              className="text-gray-600 dark:text-gray-400"
            >
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
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

        {/* Progress bar */}
        <div className="flex-1 max-w-xl">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className="h-full bg-purple-600 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="auto" />
    </div>
  );
}