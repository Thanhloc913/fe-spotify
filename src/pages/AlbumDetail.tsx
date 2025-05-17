import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Album, Track } from '../types';
import { getAlbumById } from '../api/albums';
import { getTracksByAlbum } from '../api/tracks';
import { Link } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { FaPlayCircle, FaCheckCircle, FaEllipsisH } from 'react-icons/fa';

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Hàm định dạng ngày phát hành đẹp hơn
const formatReleaseDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    // Nếu ngày không hợp lệ
    if (isNaN(date.getTime())) return dateString;
    
    // Format: DD tháng MM, YYYY
    return `${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  } catch (e) {
    return dateString;
  }
};

// Hàm định dạng ngày thêm ngắn gọn
const formatAddedDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    // Nếu ngày không hợp lệ
    if (isNaN(date.getTime())) return '';
    
    // Format: DD/MM/YYYY
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  } catch (e) {
    return '';
  }
};

const AlbumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playTrack, setCurrentTrack } = usePlayerStore();

  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        if (!id) return;
        const albumResponse = await getAlbumById(id);
        if (albumResponse.data) {
          const { album, tracks } = albumResponse.data;
          setAlbum(album);
          setTracks(tracks);
        } else {
          setAlbum(null);
          setTracks([]);
        }
      } catch (err) {
        setError('Failed to fetch album data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbumData();
  }, [id]);

  const handlePlayAlbum = () => {
    if (tracks.length > 0) {
      const firstTrack = {
        ...tracks[0],
        // Đảm bảo player có đủ thông tin cần thiết
        backgroundUrl: tracks[0].backgroundUrl || tracks[0].coverUrl || album?.coverUrl,
        coverUrl: tracks[0].backgroundUrl || tracks[0].coverUrl || album?.coverUrl
      };
      setCurrentTrack(firstTrack);
      playTrack();
    }
  };

  const handlePlayTrack = (track: Track) => {
    const enhancedTrack = {
      ...track,
      // Thêm thông tin để player có thể hiển thị đúng
      backgroundUrl: track.backgroundUrl || track.coverUrl || album?.coverUrl,
      coverUrl: track.backgroundUrl || track.coverUrl || album?.coverUrl
    };
    
    console.log('Đang phát bài hát với thông tin:', JSON.stringify(enhancedTrack, null, 2));
    setCurrentTrack(enhancedTrack);
    playTrack();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spotify-green"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }
  if (!album) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white">Album not found</div>
      </div>
    );
  }

  // Tính tổng thời lượng album
  const totalDurationMs = tracks.reduce((sum, t) => sum + (t.durationMs || 0), 0);
  const totalDuration = formatDuration(totalDurationMs);

  return (
    <div className="bg-gradient-to-b from-green-400/80 to-[#181818] min-h-screen pb-32">
      {/* Header album */}
      <div className="flex items-end gap-8 px-8 pt-8 pb-6">
        <img
          src={album.coverUrl}
          alt={album.title}
          className="w-56 h-56 object-cover shadow-2xl rounded-lg border border-black/10"
        />
        <div className="flex flex-col gap-2">
          <span className="uppercase text-xs font-bold text-white/80">Album</span>
          <h1 className="text-6xl font-extrabold text-white leading-tight drop-shadow-lg">{album.title}</h1>
          <div className="flex items-center gap-2 mt-2">
<span className="text-white/70 text-sm">• {formatReleaseDate(album.releaseDate)} • {album.totalTracks} bài hát, khoảng {totalDuration}</span>
          </div>
        </div>
      </div>
      {/* Action buttons */}
      <div className="flex items-center gap-4 px-8 mt-4 mb-2">
        <button onClick={handlePlayAlbum} className="bg-spotify-green hover:bg-green-400 text-black rounded-full p-0.5 shadow-lg transition-transform scale-110">
          <FaPlayCircle className="w-16 h-16" />
        </button>
        <button className="bg-white/10 hover:bg-white/20 text-spotify-green rounded-full p-3">
          <FaCheckCircle className="w-7 h-7" />
        </button>
        <button className="bg-white/10 hover:bg-white/20 text-white rounded-full p-3">
          <FaEllipsisH className="w-7 h-7" />
        </button>
      </div>
      {/* Song list table */}
      <div className="bg-black/30 rounded-lg mx-8 mt-6 p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="text-white/70 text-sm border-b border-white/10">
              <th className="py-2 px-2 font-normal">#</th>
              <th className="py-2 px-2 font-normal">Tiêu đề</th>
              <th className="py-2 px-2 font-normal">Album</th>
              <th className="py-2 px-2 font-normal">Ngày thêm</th>
              <th className="py-2 px-2 font-normal text-right"><span className="inline-block w-5"><svg viewBox="0 0 16 16" width="16" height="16"><path fill="currentColor" d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 10.5A4.5 4.5 0 118 3.5a4.5 4.5 0 010 9z"/></svg></span></th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, idx) => (
              <tr key={track.id} className="hover:bg-white/5 group transition cursor-pointer" onClick={() => { handlePlayTrack(track); }}>
                <td className="py-2 px-2 text-white/70 w-8">{idx + 1}</td>
                <td className="py-2 px-2 flex items-center gap-3">
                  <img 
                    src={track.backgroundUrl || track.coverUrl || album.coverUrl} 
                    alt={track.title} 
                    className="w-10 h-10 rounded shadow" 
                  />
                  <div>
                    <div className="text-white font-medium cursor-default">{track.title}</div>
                    <div className="text-white/60 text-xs">
                      <Link to={`/artist/${track.artistId || album.artistId}`} className="hover:underline text-white/80">
                        {track.artistName || album.artistName}
                      </Link>
                    </div>
                  </div>
                </td>
                <td className="py-2 px-2 text-white/60">{album.title}</td>
                <td className="py-2 px-2 text-white/60">{formatAddedDate(album.releaseDate)}</td>
                <td className="py-2 px-2 text-white/60 text-right">{formatDuration(track.durationMs || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlbumDetail; 