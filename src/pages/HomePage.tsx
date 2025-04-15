import type React from 'react';
import { useEffect, useState } from 'react';
import api from '../api/api';
import type { Artist, Album, Track, Playlist, Category } from '../types';
import TrackCard from '../components/cards/TrackCard';
import AlbumCard from '../components/cards/AlbumCard';
import ArtistCard from '../components/cards/ArtistCard';
import PlaylistCard from '../components/cards/PlaylistCard';
import CategoryCard from '../components/cards/CategoryCard';
import { Link } from 'react-router-dom';

interface HomeData {
  categories: Category[];
  popularArtists: Artist[];
  popularAlbums: Album[];
  trendingSongs: Track[];
  popularPlaylists: Playlist[];
}

const HomePage: React.FC = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const response = await api.getHomeData();
        if (response.status === 200 && response.data) {
          setData(response.data);
        } else {
          setError('Failed to fetch home data');
        }
      } catch (err) {
        setError('An error occurred while fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-spotify-green">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6">Good evening</h1>

      {/* Trending Songs */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Trending now</h2>
          <Link to="/trending" className="text-sm text-spotify-text-secondary hover:underline">
            Show all
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data?.trendingSongs.slice(0, 5).map(track => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
      </section>

      {/* Popular Artists */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Popular artists</h2>
          <Link to="/artists" className="text-sm text-spotify-text-secondary hover:underline">
            Show all
          </Link>
        </div>
        {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data?.popularArtists.slice(0, 5).map(artist => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div> */}
      </section>

      {/* Popular Albums */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Popular albums</h2>
          <Link to="/albums" className="text-sm text-spotify-text-secondary hover:underline">
            Show all
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data?.popularAlbums.slice(0, 5).map(album => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </section>

      {/* Popular Playlists */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Popular playlists</h2>
          <Link to="/playlists" className="text-sm text-spotify-text-secondary hover:underline">
            Show all
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data?.popularPlaylists.slice(0, 5).map(playlist => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Browse categories</h2>
          <Link to="/categories" className="text-sm text-spotify-text-secondary hover:underline">
            Show all
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data?.categories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
