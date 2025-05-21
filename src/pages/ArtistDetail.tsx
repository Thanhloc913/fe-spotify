import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Artist, Track, Album } from '../types';
import { artistsApi } from '../api';
import { Link } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { FaPlay, FaPause } from 'react-icons/fa';

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Define the extended artist interface that includes API response data
interface ExtendedArtist extends Omit<Artist, 'albums' | 'singles' | 'topTracks' | 'related'> {
  albums: Album[];
  singles: Album[];
  topTracks: Track[];
  relatedArtists: Artist[];
}

// Mở rộng Album interface để thêm backgroundUrl
interface ExtendedAlbum extends Omit<Album, 'backgroundUrl'> {
  backgroundUrl?: string;
}

const ArtistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<ExtendedArtist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentTrack, playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        if (!id) return;

        // Fetch artist details with all related data
        const artistResponse = await artistsApi.getArtistById(id);
        if (artistResponse.status === 200 && artistResponse.data) {
          const { artist, albums, singles, topTracks, relatedArtists } = artistResponse.data;
          
          // Log thông tin của track đầu tiên để xem cấu trúc dữ liệu
          if (topTracks && topTracks.length > 0) {
            console.log('Track đầu tiên:', topTracks[0]);
            console.log('backgroundUrl:', topTracks[0].backgroundUrl);
            console.log('songUrl:', topTracks[0].songUrl);
          }
          
          // Log thông tin album
          if (albums && albums.length > 0) {
            console.log('Album đầu tiên:', albums[0]);
            console.log('backgroundUrl của album:', (albums[0] as any).backgroundUrl);
          }
          
          setArtist({
            ...artist,
            albums,
            singles,
            topTracks,
            relatedArtists
          });
        } else {
          setError('Artist not found');
        }
      } catch (err) {
        setError('Failed to fetch artist data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [id]);

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      // Nếu là bài hát hiện tại đang phát, toggle play/pause
      togglePlay();
    } else {
      // Nếu là bài hát mới, phát bài hát đó
      
      // Xác định songType dựa trên URL hoặc thông tin từ API
      let songType = track.songType || "SONG";
      
      // Nếu URL chứa từ khóa video, hoặc có đuôi .mp4, .webm, v.v. thì đây là video
      const songUrl = track.songUrl || track.previewUrl || "";
      if (songUrl && (
        songUrl.includes("/videos/") || 
        songUrl.includes("video") || 
        songUrl.match(/\.(mp4|webm|ogg|mov)($|\?)/i)
      )) {
        songType = "MUSIC_VIDEO";
      }
      
      console.log("Loại bài hát xác định:", songType);
      
      // Sử dụng trực tiếp backgroundUrl và songUrl từ API
      const enhancedTrack = {
        ...track,
        // Đảm bảo đủ các trường cần thiết cho Track type
        coverUrl: track.backgroundUrl || track.coverUrl || '',
        previewUrl: track.songUrl || track.previewUrl || '',
        albumId: track.albumId || '',
        albumName: track.albumName || '',
        explicit: track.explicit || false,
        popularity: track.popularity || 0,
        songUrl: track.songUrl || track.previewUrl || '',
        backgroundUrl: track.backgroundUrl || track.coverUrl || '',
        songType: songType,
        durationMs: track.durationMs || 0
      };
      
      console.log('Đang phát bài hát với thông tin:', enhancedTrack);
      setCurrentTrack(enhancedTrack);
      playTrack();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error || !artist) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Error: Artist not found</h1>
      <p className="text-gray-400 mb-6">Không tìm thấy nghệ sĩ với ID: {id}</p>
      <Link 
        to="/search"
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full transition-colors"
      >
        Quay lại tìm kiếm
      </Link>
    </div>
  );

  return (
    <div className="p-12 pb-32">
      {/* Artist Header */}
      <div className="flex items-end gap-6 mb-8">
        <img
          src={artist?.avatarUrl}
          alt={artist?.name}
          className="w-48 h-48 rounded-full object-cover"
        />
        <div>
          <h1 className="text-5xl font-bold mb-4">{artist?.name}</h1>
          <p className="text-gray-400 mb-2">
            {artist?.genres?.length ? artist.genres.join(', ') : 'No genres available'}
          </p>
          <p className="text-gray-500">
            {artist?.monthlyListeners?.toLocaleString() || 0} monthly listeners
          </p>
        </div>
      </div>

      {/* Artist Bio */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">About</h2>
        <p className="text-gray-400">{artist.bio}</p>
      </div>

      {/* Top Tracks */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Popular Tracks</h2>
        <div className="bg-gray-800 rounded-lg">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700">
            <div className="col-span-1 text-gray-400">#</div>
            <div className="col-span-5 text-gray-400">Title</div>
            <div className="col-span-4 text-gray-400">Album</div>
            <div className="col-span-2 text-gray-400">Duration</div>
          </div>
          {artist.topTracks.map((track, index) => {
            const isCurrentTrack = currentTrack?.id === track.id;
            const isCurrentlyPlaying = isCurrentTrack && isPlaying;
            
            return (
              <div
                key={track.id}
                className={`grid grid-cols-12 gap-4 p-4 hover:bg-gray-700 transition-colors cursor-pointer group ${isCurrentTrack ? 'bg-gray-700' : ''}`}
                onClick={() => handlePlayTrack(track)}
              >
                <div className="col-span-1 flex items-center justify-center">
                  {isCurrentTrack && isCurrentlyPlaying ? (
                    <FaPause className="text-green-500" />
                  ) : isCurrentTrack ? (
                    <FaPlay className="text-green-500" />
                  ) : (
                    <>
                      <span className="text-gray-400 group-hover:hidden">
                        {index + 1}
                      </span>
                      <span className="text-gray-400 hidden group-hover:inline-block">
                        <FaPlay className="hover:text-green-500" />
                      </span>
                    </>
                  )}
                </div>
                <div className="col-span-5 flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={track.backgroundUrl || track.coverUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjZmZmIj5NdXNpYzwvdGV4dD48L3N2Zz4='}
                      alt={track.title}
                      className="w-10 h-10 rounded"
                    />
                  </div>
                  <div>
                    <Link
                      to={`/track/${track.id}`}
                      className={`hover:underline ${isCurrentTrack ? 'text-green-500' : 'text-white'}`}
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
                <div className="col-span-4">
                  <Link
                    to={`/album/${track.albumId}`}
                    className="text-gray-400 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {track.albumName}
                  </Link>
                </div>
                <div className="col-span-2 text-gray-400">
                  {formatDuration(track.durationMs)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Albums */}
      {Array.isArray(artist.albums) && artist.albums.length > 0 ? (
        <div className="mt-8 mb-20">
          <h2 className="text-2xl font-bold mb-4">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artist.albums.map(album => {
              // Lấy backgroundUrl từ album, ép kiểu để TypeScript chấp nhận
              const albumExt = album as ExtendedAlbum;
              const albumImgUrl = album.coverUrl || albumExt.backgroundUrl;
              
              return (
                <Link
                  key={album.id}
                  to={`/album/${album.id}`}
                  className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <img
                    src={albumImgUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjZmZmIj5NdXNpYzwvdGV4dD48L3N2Zz4='}
                    alt={album.title}
                    className="w-full aspect-square object-cover rounded-lg mb-2"
                    onError={(e) => {
                      const currentSrc = e.currentTarget.src;
                      if (!currentSrc.startsWith('data:image/')) {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjZmZmIj5NdXNpYzwvdGV4dD48L3N2Zz4=';
                      }
                    }}
                  />
                  <h3 className="font-medium">{album.title}</h3>
                  <p className="text-sm text-gray-400">{album.releaseDate.split('-')[0]}</p>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-8 text-gray-400">No albums found.</div>
      )}
    </div>
  );
};

export default ArtistDetail; 