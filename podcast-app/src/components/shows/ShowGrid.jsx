import React from 'react';
import { ShowCard } from './ShowCard';

export function ShowGrid({ shows, isDark, onShowSelect }) {
  // The ShowGrid component organizes all podcast shows in a responsive grid layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {shows.map((show) => (
        <ShowCard
          key={show.id}
          show={show}
          isDark={isDark}
          onClick={() => onShowSelect(show)}
        />
      ))}
    </div>
  );
}
