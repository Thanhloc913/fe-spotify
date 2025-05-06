import { useState, useEffect } from 'react';
import { FaCheckCircle, FaPlay, FaPause, FaHeart, FaEllipsisH, FaList } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { mockArtists, mockTracks, mockAlbums } from '../mock/data';
import { usePlayerStore } from '../store/playerStore';
import { addFavoriteTrack, removeFavoriteTrack, getUserPlaylists, addTrackToPlaylist, getFavoriteTracks } from '../api/user';
import { Track } from '../types';

const tabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'artist', label: 'Nghệ sĩ' },
  { key: 'song', label: 'Bài hát' },
  { key: 'podcast', label: 'Podcast và chương trình' },
  { key: 'playlist', label: 'Playlist' },
  { key: 'album', label: 'Album' },
  { key: 'profile', label: 'Hồ sơ' },
];

// Hàm loại bỏ dấu tiếng Việt để tìm kiếm dễ hơn
function removeVietnameseTones(str: string) {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function formatDuration(ms: number) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function Search() {
  const { keyword } = useParams();
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const { setCurrentTrack, playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [likedTracks, setLikedTracks] = useState<string[]>([]);

  // Load liked tracks
  useEffect(() => {
    const loadLikedTracks = async () => {
      const tracks = await getFavoriteTracks();
      setLikedTracks(tracks.map((t: Track) => t.id));
    };
    loadLikedTracks();
  }, []);

  // Lấy query từ URL hoặc mặc định là 'MCK'
  const query = keyword ? decodeURIComponent(keyword) : 'MCK';

  // Tìm artist phù hợp (không phân biệt hoa thường, bỏ dấu)
  const artist = mockArtists.find(a => {
    const name = removeVietnameseTones((a.name || '').toLowerCase());
    const q = removeVietnameseTones(query.toLowerCase());
    return name === q;
  });

  // Lấy bài hát và album liên quan nếu có nghệ sĩ
  const tracks = artist ? mockTracks.filter(t => t.artistId === artist.id) : [];
  const albums = artist ? mockAlbums.filter(a => a.artistId === artist.id) : [];

  const handlePlayTrack = (track: any) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      setCurrentTrack(track);
      playTrack();
    }
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      setCurrentTrack(tracks[0]);
      playTrack();
    }
  };

  const handleToggleFavorite = async (track: any) => {
    if (likedTracks.includes(track.id)) {
      await removeFavoriteTrack(track.id);
      setLikedTracks(likedTracks.filter(id => id !== track.id));
    } else {
      await addFavoriteTrack(track);
      setLikedTracks([...likedTracks, track.id]);
    }
    window.dispatchEvent(new Event('liked-changed'));
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (selectedTrack) {
      await addTrackToPlaylist(playlistId, selectedTrack.id);
      setShowPlaylistPopup(false);
      window.dispatchEvent(new Event('playlist-changed'));
    }
  };

  const openPlaylistPopup = async (track: any) => {
    setSelectedTrack(track);
    const pls = await getUserPlaylists();
    setPlaylists(pls);
    setShowPlaylistPopup(true);
  };

  return (
    <div className="p-6 text-white min-h-screen bg-black">
      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-1 rounded-full font-semibold transition-colors ${activeTab === tab.key ? 'bg-white text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Nếu không tìm thấy nghệ sĩ */}
      {!artist && (
        <div className="text-center text-2xl text-gray-400 mt-20">Không tìm thấy kết quả cho "{query}"</div>
      )}

      {/* Top result, Songs, Albums */}
      {artist && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Top result */}
            <div className="md:col-span-1">
              <h2 className="text-2xl font-bold mb-4">Kết quả hàng đầu</h2>
              <div 
                className="bg-gray-800 rounded-lg flex items-center gap-6 p-6 cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => navigate(`/artist/${artist.id}`)}
              >
                <img src={artist.avatarUrl} alt={artist.name} className="w-24 h-24 rounded-full object-cover" />
                <div>
                  <div className="text-2xl font-bold">{artist.name}</div>
                  <div className="text-gray-400 mt-1">Nghệ sĩ</div>
                </div>
              </div>
            </div>
            {/* Songs */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Bài hát</h2>
                {tracks.length > 0 && (
                  <button
                    onClick={handlePlayAll}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors"
                  >
                    Phát tất cả
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {tracks.length === 0 && <div className="text-gray-400">(Chưa có dữ liệu bài hát cho nghệ sĩ này)</div>}
                {tracks.map(song => (
                  <div 
                    key={song.id} 
                    className="group flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3 hover:bg-gray-700 transition-colors"
                  >
                    {/* Play/Pause Button */}
                    <button
                      onClick={() => handlePlayTrack(song)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                      {currentTrack?.id === song.id && isPlaying ? <FaPause /> : <FaPlay />}
                    </button>

                    {/* Ảnh bài hát */}
                    <img 
                      src={song.coverUrl} 
                      alt={song.title} 
                      className="w-12 h-12 rounded mr-4 cursor-pointer"
                      onClick={() => navigate(`/track/${song.id}`)}
                    />

                    {/* Thông tin bài hát */}
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        {song.title}
                        {song.explicit && (
                          <span className="bg-gray-600 text-xs px-1 rounded ml-1">E</span>
                        )}
                      </div>
                      <div 
                        className="text-gray-400 text-sm cursor-pointer hover:underline"
                        onClick={() => navigate(`/artist/${song.artistId}`)}
                      >
                        {song.artistName}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      {/* Thời lượng */}
                      <div className="text-gray-400 text-sm">{formatDuration(song.durationMs)}</div>

                      {/* Favorite Button */}
                      <button
                        onClick={() => handleToggleFavorite(song)}
                        className={`w-8 h-8 flex items-center justify-center transition-colors ${
                          likedTracks.includes(song.id) ? 'text-green-500' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <FaHeart />
                      </button>

                      {/* Add to Playlist Button */}
                      <button
                        onClick={() => openPlaylistPopup(song)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                      >
                        <FaList />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Albums section */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Album</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {albums.length === 0 && <div className="text-gray-400">(Chưa có album nào)</div>}
              {albums.map(album => (
                <div 
                  key={album.id} 
                  className="bg-gray-800 rounded-lg p-4 flex flex-col items-center hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => navigate(`/album/${album.id}`)}
                >
                  <img src={album.coverUrl} alt={album.title} className="w-32 h-32 rounded-lg object-cover mb-3" />
                  <div className="font-semibold text-center mb-1">{album.title}</div>
                  <div className="text-gray-400 text-sm text-center">{album.releaseDate}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Playlist Popup */}
      {showPlaylistPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Thêm vào playlist</h3>
            <div className="max-h-60 overflow-y-auto">
              {playlists.map(playlist => (
                <div
                  key={playlist.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer"
                  onClick={() => handleAddToPlaylist(playlist.id)}
                >
                  <span>{playlist.name}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowPlaylistPopup(false)}
              className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Related sections */}
      {/* Có thể bổ sung phần liên quan nếu muốn */}
    </div>
  );
} 