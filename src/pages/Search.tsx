import { useState, useEffect } from 'react';
import { FaCheckCircle, FaPlay, FaPause, FaHeart, FaEllipsisH, FaList } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { mockArtists, mockTracks, mockAlbums } from '../mock/data';
import { usePlayerStore } from '../store/playerStore';
import { addFavoriteTrack, removeFavoriteTrack, getUserPlaylists, addTrackToPlaylist, getFavoriteTracks } from '../api/user';
import { Track } from '../types';
import { musicApi } from '../api/musicApi';
import { getProfileByAccountID } from '../api/profileApi';

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

  // State cho search API
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [artistNames, setArtistNames] = useState<Record<string, string>>({});

  // Load liked tracks
  useEffect(() => {
    const loadLikedTracks = async () => {
      const tracks = await getFavoriteTracks();
      setLikedTracks(tracks.map((t: Track) => t.id));
    };
    loadLikedTracks();
  }, []);

  // Lấy query từ URL hoặc mặc định là ''
  const query = keyword ? decodeURIComponent(keyword) : '';

  // Gọi API search khi query thay đổi
  useEffect(() => {
    if (!query) {
      setSearchResult(null);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    musicApi.searchSongsByTitle(query, 1, 10)
      .then(res => {
        setSearchResult(res.data || res); // tuỳ API trả về
      })
      .catch(err => {
        setSearchError('Có lỗi xảy ra khi tìm kiếm');
        setSearchResult(null);
      })
      .finally(() => setSearchLoading(false));
  }, [query]);

  useEffect(() => {
    if (!searchResult || !searchResult.result) return;
    const artistIds = Array.from(new Set(searchResult.result.map((song: any) => String(song.artistId)).filter(Boolean))) as string[];
    const missingIds: string[] = artistIds.filter((id: string) => !artistNames[id]);
    if (missingIds.length === 0) return;

    missingIds.forEach(async (id: string) => {
      try {
        const profile = await getProfileByAccountID(id);
        setArtistNames(prev => ({ ...prev, [id]: profile.fullName }));
      } catch {
        setArtistNames(prev => ({ ...prev, [id]: "Unknown Artist" }));
      }
    });
    // eslint-disable-next-line
  }, [searchResult]);

  const handlePlayTrack = (track: any) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      setCurrentTrack(track);
      playTrack();
    }
  };

  const handlePlayAll = () => {
    if (searchResult && searchResult.result && searchResult.result.length > 0) {
      setCurrentTrack(searchResult.result[0]);
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

      {/* Loading */}
      {searchLoading && <div className="text-center text-2xl text-gray-400 mt-20">Đang tìm kiếm...</div>}
      {/* Lỗi */}
      {searchError && <div className="text-center text-2xl text-red-400 mt-20">{searchError}</div>}
      {/* Không có kết quả */}
      {!searchLoading && !searchError && searchResult && (!searchResult.result || searchResult.result.length === 0) && (
        <div className="text-center text-2xl text-gray-400 mt-20">Không tìm thấy kết quả</div>
      )}

      {/* Kết quả bài hát */}
      {!searchLoading && !searchError && searchResult && searchResult.result && searchResult.result.length > 0 && (
        <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Bài hát</h2>
                  <button
                    onClick={handlePlayAll}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors"
                  >
                    Phát tất cả
                  </button>
              </div>
              <div className="flex flex-col gap-2">
            {searchResult.result.map((song: any) => (
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
                {song.coverUrl && (
                    <img 
                      src={song.coverUrl} 
                      alt={song.title} 
                      className="w-12 h-12 rounded mr-4 cursor-pointer"
                      onClick={() => navigate(`/track/${song.id}`)}
                    />
                )}

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
                    onClick={() => song.artistId && navigate(`/artist/${song.artistId}`)}
                      >
                    {song.artistName || artistNames[String(song.artistId)] || song.artistId}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      {/* Thời lượng */}
                  <div className="text-gray-400 text-sm">{song.durationMs ? formatDuration(song.durationMs) : song.duration ? formatDuration(song.duration * 1000) : ''}</div>

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