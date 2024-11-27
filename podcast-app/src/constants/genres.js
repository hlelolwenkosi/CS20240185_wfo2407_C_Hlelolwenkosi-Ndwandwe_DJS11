// Map of genre IDs to their titles
export const GENRE_MAP = {
    1: 'Personal Growth',
    2: 'Investigative Journalism',
    3: 'History',
    4: 'Comedy',
    5: 'Entertainment',
    6: 'Business',
    7: 'Fiction',
    8: 'News',
    9: 'Kids and Family'
  };
  
  // Helper functions for working with genres
  export const getGenreTitle = (id) => GENRE_MAP[id] || 'Unknown Genre';
  export const getGenreTitles = (ids) => ids?.map(id => GENRE_MAP[id]).filter(Boolean) || [];