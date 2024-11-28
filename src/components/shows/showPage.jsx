export function ShowPage({
    show,
    onBack,
    currentEpisode,
    isPlaying,
    favorites,
    onPlayEpisode,
    onToggleFavorite
  }) {
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchEpisodes = async () => {
        try {
          setLoading(true);
          const response = await fetch(`https://podcast-api.netlify.app/id/${show.id}`);
          if (!response.ok) throw new Error('Failed to fetch episodes');
          const data = await response.json();
          setEpisodes(data.episodes || []);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchEpisodes();
    }, [show.id]);
  
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-purple-600 hover:text-purple-700"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Shows
        </button>
  
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={show.image}
              alt={show.title}
              className="w-full md:w-64 h-64 object-cover rounded-lg"
            />
            <div>
              <h1 className="text-3xl font-bold mb-4 dark:text-white">{show.title}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{show.description}</p>
              <div className="flex flex-wrap gap-2">
                {show.genres.map(genreId => (
                  <span
                    key={genreId}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {GENRE_MAP[genreId]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
  
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-red-600 p-4">{error}</div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold dark:text-white mb-4">Episodes</h2>
            {episodes.map(episode => (
              <div
                key={episode.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md 
                         flex items-center justify-between"
              >
                <div className="flex-1 mr-4">
                  <h3 className="font-semibold dark:text-white">{episode.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(episode.published).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onPlayEpisode(episode)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    {currentEpisode?.id === episode.id && isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button
                    onClick={() => onToggleFavorite(episode)}
                    className={`px-4 py-2 rounded-lg ${
                      favorites.some(fav => fav.id === episode.id)
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {favorites.some(fav => fav.id === episode.id) ? 'Remove' : 'Favorite'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }