import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Artist, Track, Album } from '../types';
import { artistsApi } from '../api';
import { Link } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { getImageUrl } from '../api/storageApi';

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

const ArtistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<ExtendedArtist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentTrack, playTrack } = usePlayerStore();
  // Thêm state để lưu ảnh của từng bài hát
  const [trackImages, setTrackImages] = useState<Record<string, string>>({});
  // Thêm state để lưu ảnh của từng album
  const [albumImages, setAlbumImages] = useState<Record<string, string>>({});

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
            console.log('Track có thuộc tính backgroundUrl không:', 'backgroundUrl' in topTracks[0]);
            console.log('Track có thuộc tính songUrl không:', 'songUrl' in topTracks[0]);
            console.log('Tất cả các thuộc tính của track:', Object.keys(topTracks[0]));
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

  // Thêm useEffect để lấy ảnh cho các bài hát
  useEffect(() => {
    if (!artist || !artist.topTracks) return;
    
    // Lấy danh sách các bài hát cần lấy ảnh
    const tracksNeedImage = artist.topTracks.filter(
      track => !track.backgroundUrl && !track.coverUrl && (track.storageImageId || track.storageId)
    );
    
    // Nếu không có bài hát nào cần lấy ảnh, dừng
    if (tracksNeedImage.length === 0) return;
    
    // Lấy ảnh cho từng bài hát
    tracksNeedImage.forEach(async (track) => {
      try {
        // Ưu tiên lấy từ storageImageId trước
        const imageUrl = track.coverUrl
        
        if (imageUrl) {
          console.log(`Đã lấy được URL ảnh cho bài hát "${track.title}": ${imageUrl}`);
          setTrackImages(prev => ({
            ...prev,
            [track.id]: imageUrl
          }));
        }
      } catch (error) {
        console.error(`Lỗi khi lấy ảnh cho bài hát "${track.title}":`, error);
      }
    });
  }, [artist]);

  // Thêm useEffect để lấy ảnh cho các album
  useEffect(() => {
    if (!artist || !artist.albums) return;
    
    // Lấy danh sách các album cần lấy ảnh
    const albumsNeedImage = artist.albums.filter(
      album => !album.coverUrl && ((album as any)._storageImageId || (album as any).storageImageId)
    );
    
    // Nếu không có album nào cần lấy ảnh, dừng
    if (albumsNeedImage.length === 0) return;
    
    // Lấy ảnh cho từng album
    albumsNeedImage.forEach(async (album) => {
      try {
        // Lấy storageImageId
        const imageId = (album as any)._storageImageId || (album as any).storageImageId;
        
        if (imageId) {
          console.log(`Đang lấy ảnh cho album "${album.title}" từ storageImageId: ${imageId}`);
          const imageUrl = await getImageUrl(imageId);
          
          if (imageUrl) {
            console.log(`Đã lấy được URL ảnh cho album "${album.title}": ${imageUrl}`);
            setAlbumImages(prev => ({
              ...prev,
              [album.id]: imageUrl
            }));
          }
        }
      } catch (error) {
        console.error(`Lỗi khi lấy ảnh cho album "${album.title}":`, error);
      }
    });
  }, [artist]);

  const handlePlayTrack = (track: Track) => {
    // Tạo phiên bản track có đầy đủ thông tin hơn (với ảnh và URL)
    const enhancedTrack = {
      ...track,
      // Thêm thông tin để player có thể hiển thị đúng
      backgroundUrl: track.backgroundUrl || track.coverUrl || trackImages[track.id],
      coverUrl: track.backgroundUrl || track.coverUrl || trackImages[track.id],
      songUrl: track.songUrl // Sử dụng trực tiếp songUrl nếu có
    };
    
    console.log('Đang phát bài hát với thông tin:', JSON.stringify(enhancedTrack, null, 2));
    console.log('Song URL:', enhancedTrack.songUrl);
    setCurrentTrack(enhancedTrack);
    playTrack();
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
            // Log thông tin về backgroundUrl của bài hát - dùng phương pháp khác
            if (process.env.NODE_ENV !== 'production') {
              // Chỉ log trong môi trường development
              console.log(`Bài hát ${index}: backgroundUrl = ${track.backgroundUrl}`);
              console.log(`Bài hát ${index} - Tất cả thuộc tính:`, Object.keys(track));
            }
            
            return (
              <div
                key={track.id}
                className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handlePlayTrack(track)}
              >
                <div className="col-span-1 text-gray-400">{index + 1}</div>
                <div className="col-span-5 flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={track.backgroundUrl || track.coverUrl || trackImages[track.id] || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjZmZmIj5NdXNpYzwvdGV4dD48L3N2Zz4='}
                      alt={track.title}
                      className="w-10 h-10 rounded"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        console.log('Track info:', track);
                        console.log('backgroundUrl:', track.backgroundUrl);
                        console.log('coverUrl:', track.coverUrl);
                        console.log('Tất cả thuộc tính:', Object.keys(track));
                        alert(`backgroundUrl: ${track.backgroundUrl || 'không có'}`);
                      }}
                    />
                  </div>
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
            {artist.albums.map(album => (
              <Link
                key={album.id}
                to={`/album/${album.id}`}
                className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <img
                  src={album.coverUrl || albumImages[album.id] || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjZmZmIj5NdXNpYzwvdGV4dD48L3N2Zz4='}
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
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 text-gray-400">No albums found.</div>
      )}
    </div>
  );
};

export default ArtistDetail; 