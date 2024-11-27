import React from 'react';
import { ShowCard } from './ShowCard';

export function ShowGrid({ shows, favorites, onShowSelect, onToggleFavorite }) {
  // If no shows are available, display a message
  if (!shows?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          No shows available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {shows.map(show => (
        <ShowCard
          key={show.id}
          show={show}
          isFavorite={favorites.some(f => f.id === show.id)}
          onShowSelect={onShowSelect}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}