// Helper functions to format various data types in our app
export const formatters = {
    // Format a date string to a readable format
    date: (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
  
    // Format duration from seconds to MM:SS
    duration: (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
  
    // Format episode title with season information
    episodeTitle: (episode, seasonNumber) => {
      return `S${seasonNumber} E${episode.number}: ${episode.title}`;
    },
  
    // Truncate text with ellipsis
    truncate: (text, length = 150) => {
      if (text.length <= length) return text;
      return text.slice(0, length) + '...';
    }
  };