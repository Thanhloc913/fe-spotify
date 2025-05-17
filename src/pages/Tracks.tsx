import { useEffect, useState } from 'react';
import { Track } from '../types';
import { tracksApi } from '../api';
import { Link } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const Tracks = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentTrack, playTrack } = usePlayerStore();

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await tracksApi.getTracks();
        setTracks(response.data);
      } catch (err) {
        setError('Failed to fetch tracks');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  const handlePlayTrack = (track: Track) => {
    console.log('Playing track in Tracks.tsx:', track);
    console.log('Track song type:', track.songType);
    
    // Ensure songType is set before passing to player
    if (!track.songType) {
      if (track.songUrl && track.songUrl.includes('videos')) {
        track.songType = 'MUSIC_VIDEO';
        console.log('Set track type to MUSIC_VIDEO based on URL');
      } else {
        track.songType = 'SONG';
        console.log('Set default track type to SONG');
      }
    }
    
    setCurrentTrack(track);
    playTrack();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Tracks</h1>
      <div className="bg-gray-800 rounded-lg">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700">
          <div className="col-span-1 text-gray-400">#</div>
          <div className="col-span-5 text-gray-400">Title</div>
          <div className="col-span-3 text-gray-400">Artist</div>
          <div className="col-span-2 text-gray-400">Album</div>
          <div className="col-span-1 text-gray-400">Duration</div>
        </div>
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => handlePlayTrack(track)}
          >
            <div className="col-span-1 text-gray-400">{index + 1}</div>
            <div className="col-span-5 flex items-center gap-4">
              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-10 h-10 rounded"
              />
              <div>
                <Link
                  to={`/track/${track.id}`}
                  className="text-white hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {track.title}
                </Link>
                {track.explicit && (
                  <span className="ml-2 text-xs bg-gray-600 px-1 rounded">
                    E
                  </span>
                )}
              </div>
            </div>
            <div className="col-span-3">
              <Link
                to={`/artist/${track.artistId}`}
                className="text-gray-400 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {track.artistName}
              </Link>
            </div>
            <div className="col-span-2">
              <Link
                to={`/album/${track.albumId}`}
                className="text-gray-400 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {track.albumName}
              </Link>
            </div>
            <div className="col-span-1 text-gray-400">
              {formatDuration(track.durationMs)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tracks; 