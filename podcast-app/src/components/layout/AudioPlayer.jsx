// src/components/layout/AudioPlayer.jsx
import React from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

export function AudioPlayer({ 
  currentTrack, 
  isPlaying, 
  setIsPlaying, 
  isDark 
}) {
  return (
    <div className={`
      fixed bottom-0 left-0 right-0 
      ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
      shadow-lg border-t
    `}>
      {/* Audio player content */}
    </div>
  );
}