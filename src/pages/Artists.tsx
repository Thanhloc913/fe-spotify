import { useEffect, useState } from 'react';
import { Artist } from '../types';
import { getArtists } from '../api/artists';
import { Link } from 'react-router-dom';

const Artists = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await getArtists();
        setArtists(response.data);
      } catch (err) {
        setError('Failed to fetch artists');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Artists</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artists.map((artist) => (
          <Link
            key={artist.id}
            to={`/artist/${artist.id}`}
            className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <img
              src={artist.imageUrl}
              alt={artist.name}
              className="w-full aspect-square object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-semibold">{artist.name}</h2>
            <p className="text-gray-400">{artist.genres.join(', ')}</p>
            <p className="text-sm text-gray-500">
              {artist.monthlyListeners.toLocaleString()} monthly listeners
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Artists; 