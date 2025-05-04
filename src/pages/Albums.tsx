import { useEffect, useState } from 'react';
import { Album } from '../types';
import { albumsApi } from '../api';
import { Link } from 'react-router-dom';

const Albums = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await albumsApi.getAlbums();
        setAlbums(response.data);
      } catch (err) {
        setError('Failed to fetch albums');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Albums</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {albums.map((album) => (
          <Link
            key={album.id}
            to={`/album/${album.id}`}
            className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <img
              src={album.coverUrl}
              alt={album.title}
              className="w-full aspect-square object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-semibold">{album.title}</h2>
            <p className="text-gray-400">{album.artistName}</p>
            <p className="text-sm text-gray-500">
              {new Date(album.releaseDate).getFullYear()} • {album.totalTracks} tracks
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Albums; 