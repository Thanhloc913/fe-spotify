import { useEffect, useState } from 'react';
import { Album } from '../types';
import { albumsApi } from '../api';
import { createAlbum, getUserAlbums } from '../api/user';
import { Link } from 'react-router-dom';

const defaultCover = 'https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647';

const Albums = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    coverUrl: '',
    releaseDate: '',
  });

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await albumsApi.getAlbums();
        const userAlbums = await getUserAlbums();
        setAlbums([...userAlbums, ...response.data]);
      } catch (err) {
        setError('Failed to fetch albums');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbums();
  }, []);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAlbum: Album = {
      id: Date.now().toString(),
      title: form.title,
      artistId: 'user',
      artistName: 'You',
      coverUrl: form.coverUrl || defaultCover,
      releaseDate: form.releaseDate || new Date().toISOString().slice(0, 10),
      tracks: [],
      type: 'album',
      totalTracks: 0,
      durationMs: 0
    };
    await createAlbum(newAlbum);
    setAlbums([newAlbum, ...albums]);
    setShowForm(false);
    setForm({ title: '', coverUrl: '', releaseDate: '' });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Albums</h1>
        <button
          className="bg-spotify-green text-black px-4 py-2 rounded-full font-semibold hover:bg-green-400"
          onClick={() => setShowForm(true)}
        >
          + Tạo album mới
        </button>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form onSubmit={handleCreateAlbum} className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-white">Tạo album mới</h2>
            <div className="mb-4">
              <label className="block text-white mb-1">Tên album</label>
              <input type="text" className="w-full p-2 rounded bg-gray-800 text-white" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-1">Ảnh bìa (URL)</label>
              <input type="text" className="w-full p-2 rounded bg-gray-800 text-white" value={form.coverUrl} onChange={e => setForm(f => ({ ...f, coverUrl: e.target.value }))} />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-1">Ngày phát hành</label>
              <input type="date" className="w-full p-2 rounded bg-gray-800 text-white" value={form.releaseDate} onChange={e => setForm(f => ({ ...f, releaseDate: e.target.value }))} />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" className="px-4 py-2 rounded bg-gray-700 text-white" onClick={() => setShowForm(false)}>Hủy</button>
              <button type="submit" className="px-4 py-2 rounded bg-spotify-green text-black font-semibold">Tạo</button>
            </div>
          </form>
        </div>
      )}
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