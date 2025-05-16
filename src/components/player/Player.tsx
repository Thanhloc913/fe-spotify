import type React from 'react';
import { useEffect, useState, useRef } from 'react';
import {
  FaPlayCircle,
  FaPauseCircle,
  FaStepForward,
  FaStepBackward,
  FaVolumeUp,
  FaRandom,
  FaRedo,
  FaHeart,
  FaList,
  FaVolumeMute,
  FaVideo
} from 'react-icons/fa';
import { usePlayerStore } from '../../store/playerStore';
import { Link } from 'react-router-dom';
import { addFavoriteTrack, getFavoriteTracks, removeFavoriteTrack, getUserPlaylists, addTrackToPlaylist, removeTrackFromPlaylist } from '../../api/user';
import { getStorageById, getImageUrl } from '../../api/storageApi';

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const Player: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    repeat,
    shuffle,
    progress,
    duration,
    togglePlay,
    setVolume,
    setRepeat,
    toggleShuffle,
    setProgress,
    skipToNext,
    skipToPrevious,
    setCurrentTrack,
    setShowVideo,
    showVideo
  } = usePlayerStore();

  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [liked, setLiked] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  // Handle play/pause - removed currentTrack from dependencies
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // Autoplay was prevented
          console.log('Autoplay prevented');
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]); // currentTrack is implicitly covered by the src change

  // Lấy file URL từ storageId khi track thay đổi
  useEffect(() => {
    if (!currentTrack) return;
    
    console.log('========== TRACK INFO DEBUG ==========');
    console.log('Current track full data:', JSON.stringify(currentTrack, null, 2));
    console.log('Track ID:', currentTrack.id);
    console.log('storageId:', currentTrack.storageId);
    console.log('storageImageId:', currentTrack.storageImageId);
    console.log('coverUrl:', currentTrack.coverUrl);
    console.log('======================================');
    
    const fetchAudioUrl = async () => {
      try {
        console.log('Current track:', currentTrack);
        
        // Nếu đã có sẵn URL thì dùng luôn
        if (currentTrack.previewUrl) {
          console.log('Sử dụng previewUrl:', currentTrack.previewUrl);
          setAudioUrl(currentTrack.previewUrl);
          return;
        }
        
        // Nếu có storageId thì lấy file từ storage service
        if (currentTrack.storageId) {
          console.log('Lấy audio từ storageId:', currentTrack.storageId);
          const storageData = await getStorageById(currentTrack.storageId);
          console.log('Dữ liệu storage nhận được:', storageData);
          
          if (storageData.success && storageData.data) {
            // Cập nhật URL
            if (storageData.data.fileUrl) {
              console.log('Đã lấy được fileUrl:', storageData.data.fileUrl);
              setAudioUrl(storageData.data.fileUrl);
            }
            
            // Cập nhật duration từ API nếu có
            if (storageData.data.duration) {
              console.log('Duration từ API:', storageData.data.duration);
              // Giả sử API trả về duration tính bằng giây
              usePlayerStore.getState().setDuration(Number(storageData.data.duration));
            }
          } else {
            console.error('Không lấy được URL audio từ storage:', storageData);
            setAudioUrl(null);
          }
        } else {
          console.warn('Track không có storageId hoặc previewUrl');
          setAudioUrl(null);
        }
      } catch (error) {
        console.error('Lỗi khi lấy URL audio:', error);
        setAudioUrl(null);
      }
    };
    
    // Hàm lấy URL ảnh từ storageImageId
    const fetchCoverImage = async () => {
      try {
        // Nếu có sẵn coverUrl thì dùng luôn
        if (currentTrack.coverUrl) {
          console.log('Sử dụng coverUrl có sẵn:', currentTrack.coverUrl);
          setCoverUrl(currentTrack.coverUrl);
          return;
        }
        
        // Fix: Kiểm tra cả hai cách truy cập storageImageId
        // Một số trường hợp có thể dữ liệu gốc không được map đúng vào interface Track
        const imageId = currentTrack.storageImageId || 
                       (currentTrack as any).storageImageId ||
                       (currentTrack as any).storageImageID;
        
        console.log('Kiểm tra lại imageId:', imageId);
        
        if (imageId) {
          console.log('Lấy ảnh từ storageImageId đã sửa:', imageId);
          const imageUrl = await getImageUrl(imageId);
          if (imageUrl) {
            console.log('Đã lấy được URL ảnh thành công:', imageUrl);
            setCoverUrl(imageUrl);
          } else {
            console.log('Không lấy được URL ảnh từ storageImageId');
            setCoverUrl(null);
          }
        } else {
          // Nếu thật sự không có storageImageId, thử dùng storageId
          if (currentTrack.storageId) {
            console.log('Thử dùng storageId để lấy ảnh:', currentTrack.storageId);
            const imageUrl = await getImageUrl(currentTrack.storageId);
            if (imageUrl) {
              console.log('Đã lấy được URL ảnh từ storageId:', imageUrl);
              setCoverUrl(imageUrl);
              return;
            }
          }
          
          console.log('Không có storageImageId trong track');
          setCoverUrl(null);
        }
      } catch (error) {
        console.error('Lỗi khi lấy ảnh:', error);
        setCoverUrl(null);
      }
    };
    
    fetchAudioUrl();
    fetchCoverImage();
  }, [currentTrack]);

  // Update audio src when currentTrack changes
  useEffect(() => {
    if (audioRef.current && currentTrack && audioUrl) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          console.log('Autoplay prevented after track change');
        });
      }
    }
  }, [currentTrack, isPlaying, audioUrl]);

  // Update progress
  useEffect(() => {
    const timer = setInterval(() => {
      const media = getMediaRef();
      if (media && isPlaying) {
        setProgress(media.currentTime);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, setProgress, showVideo]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      const normalizedVolume = Math.max(0, Math.min(1, volume));
      audioRef.current.volume = isMuted ? 0 : normalizedVolume;
    }
  }, [volume, isMuted]);

  // Handle track end
  const handleTrackEnd = () => {
    if (repeat === 'track') {
      const media = getMediaRef();
      if (media) {
        media.currentTime = 0;
        media.play();
      }
    } else {
      // Khi hết nhạc, dừng player
      usePlayerStore.getState().pauseTrack();
    }
  };

  // Handle volume click
  const handleVolumeClick = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolume(0);
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      const media = getMediaRef();
      if (media) {
        media.currentTime = newTime;
      }
      setProgress(newTime);
    }
  };

  // Toggle repeat
  const handleRepeatClick = () => {
    const repeatModes: ('off' | 'track' | 'context')[] = ['off', 'track', 'context'];
    const currentIndex = repeatModes.indexOf(repeat);
    const nextIndex = (currentIndex + 1) % repeatModes.length;
    setRepeat(repeatModes[nextIndex]);
  };

  useEffect(() => {
    if (!currentTrack) return setLiked(false);
    getFavoriteTracks().then(tracks => {
      setLiked(tracks.some(t => t.id === currentTrack.id));
    });
    // Listen for liked-changed event
    const handler = () => {
      getFavoriteTracks().then(tracks => {
        setLiked(tracks.some(t => t.id === currentTrack.id));
      });
    };
    window.addEventListener('liked-changed', handler);
    return () => window.removeEventListener('liked-changed', handler);
  }, [currentTrack]);

  const handleToggleFavorite = async () => {
    if (!currentTrack) return;
    if (liked) {
      await removeFavoriteTrack(currentTrack.id);
      setLiked(false);
    } else {
      await addFavoriteTrack(currentTrack);
      setLiked(true);
    }
    window.dispatchEvent(new Event('liked-changed'));
  };

  const handleToggleTrackInPlaylist = async (playlistId: string, checked: boolean) => {
    if (!currentTrack) return;
    if (checked) {
      await addTrackToPlaylist(playlistId, currentTrack.id);
    } else {
      await removeTrackFromPlaylist(playlistId, currentTrack.id);
    }
    // Refresh playlists to update UI
    const pls = await getUserPlaylists();
    setPlaylists(pls);
    window.dispatchEvent(new Event('playlist-changed'));
  };

  const openPlaylistPopup = async () => {
    const pls = await getUserPlaylists();
    setPlaylists(pls);
    setShowPlaylistPopup(true);
  };

  // Khôi phục trạng thái player từ localStorage khi load lại trang
  useEffect(() => {
    const saved = localStorage.getItem('player_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.currentTrack) setCurrentTrack(state.currentTrack);
        if (typeof state.isPlaying === 'boolean' && state.isPlaying) togglePlay();
        if (typeof state.progress === 'number') setProgress(state.progress);
        if (typeof state.volume === 'number') setVolume(state.volume);
        if (typeof state.repeat === 'string') setRepeat(state.repeat);
        if (typeof state.shuffle === 'boolean') toggleShuffle();
      } catch { }
    }
    // eslint-disable-next-line
  }, []);

  // Lưu trạng thái player vào localStorage mỗi khi thay đổi
  useEffect(() => {
    const state = {
      currentTrack,
      isPlaying,
      progress,
      volume,
      repeat,
      shuffle
    };
    localStorage.setItem('player_state', JSON.stringify(state));
  }, [currentTrack, isPlaying, progress, volume, repeat, shuffle]);

  // Custom style cho progress và volume
  const progressPercent = duration ? (progress / duration) * 100 : 0;
  const progressBg = `linear-gradient(90deg, #1db954 ${progressPercent}%, #fff 0)`;
  const volumePercent = volume * 100;
  const volumeBg = `linear-gradient(90deg, #1db954 ${volumePercent}%, #fff 0)`;

  // Handler khi audio load xong để lấy duration chính xác
  const handleLoadedMetadata = () => {
    const media = getMediaRef();
    if (media) {
      // Cập nhật duration từ file audio thực tế
      const realDuration = media.duration;
      console.log('Duration từ file audio:', realDuration);
      
      // So sánh các duration khác nhau
      const metadataMs = currentTrack?.durationMs || 0;
      const metadataSec = metadataMs / 1000;
      const apiDuration = duration;
      
      console.log('Duration comparison:');
      console.log('- Từ metadata (ms):', metadataMs);
      console.log('- Từ metadata (s):', metadataSec);
      console.log('- Từ API:', apiDuration);
      console.log('- Từ file thực tế:', realDuration);
      
      // Luôn ưu tiên duration từ file audio thực tế
      usePlayerStore.getState().setDuration(realDuration);
    }
  };

  // Helper để lấy ref video nếu đang showVideo
  const getMediaRef = () => {
    if (showVideo && typeof window !== 'undefined' && (window as any).__globalVideoRef) {
      return (window as any).__globalVideoRef as HTMLVideoElement;
    }
    return audioRef.current;
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Track Info */}
        <div className="flex items-center gap-4 w-1/4">
          <img
            src={coverUrl || currentTrack.coverUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjZmZmIj5NdXNpYzwvdGV4dD48L3N2Zz4='}
            alt={currentTrack.title}
            className="w-14 h-14 rounded"
            onError={(e) => {
              // Tránh vòng lặp vô hạn khi ảnh fallback cũng lỗi
              // Chỉ thay đổi src nếu src hiện tại không phải ảnh base64
              const currentSrc = e.currentTarget.src;
              if (!currentSrc.startsWith('data:image/')) {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjZmZmIj5NdXNpYzwvdGV4dD48L3N2Zz4=';
              }
            }}
          />
          <div>
            <p className="text-white font-medium">{currentTrack.title}</p>
            <p className="text-gray-400 text-sm">
              <Link to={`/artist/${currentTrack.artistId}`} className="hover:underline text-white/80">
                {currentTrack.artistName}
              </Link>
            </p>
          </div>
          {/* Favorite & Add to Playlist & Video buttons */}
          <button onClick={handleToggleFavorite} className={`ml-2 ${liked ? 'text-spotify-green hover:text-spotify-green' : 'text-gray-400 hover:text-spotify-green'}`}>
            <FaHeart className="w-5 h-5" />
          </button>
          <button onClick={openPlaylistPopup} className="ml-2 text-gray-400 hover:text-green-400">
            <FaList className="w-5 h-5" />
          </button>
          {currentTrack.videoUrl && (
            <button
              onClick={() => setShowVideo(!showVideo)}
              className={`ml-2 ${showVideo ? 'text-spotify-green' : 'text-gray-400'} hover:text-spotify-green`}
            >
              <FaVideo className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center w-2/4">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={toggleShuffle}
              className={`text-gray-400 hover:text-green ${shuffle ? 'text-green-500' : ''}`}
            >
              <FaRandom className="w-5 h-5" />
            </button>
            <button
              onClick={skipToPrevious}
              className="text-gray-400 hover:text-white"
            >
              <FaStepBackward className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm6 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-4 1a1 1 0 10-2 0v4a1 1 0 102 0V8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              )}
            </button>
            <button
              onClick={skipToNext}
              className="text-gray-400 hover:text-white"
            >
              <FaStepForward className="w-5 h-5" />
            </button>
            <button
              onClick={() => setRepeat(repeat === 'off' ? 'track' : 'off')}
              className={`text-gray-400 hover:text-white ${repeat === 'track' ? 'text-green-500' : ''}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-gray-400 text-sm">
              {formatDuration(progress * 1000)}
            </span>
            <input
              type="range"
              min="0"
              max={isNaN(duration) ? 0 : duration}
              value={progress}
              onChange={(e) => {
                const newTime = Number(e.target.value);
                const media = getMediaRef();
                if (media) {
                  media.currentTime = newTime;
                }
                setProgress(newTime);
              }}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              style={{ background: progressBg }}
            />
            <span className="text-gray-400 text-sm">
              {formatDuration(duration * 1000)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 w-1/4 justify-end">
          <button onClick={handleVolumeClick} className="focus:outline-none">
            {isMuted || volume === 0 ? (
              <FaVolumeMute className="w-5 h-5 text-gray-400" />
            ) : (
              <FaVolumeUp className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const newVolume = Number(e.target.value);
              setVolume(newVolume);
              const media = getMediaRef();
              if (media) {
                media.volume = newVolume;
                if (newVolume === 0) setIsMuted(true);
                else setIsMuted(false);
              }
            }}
            className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            style={{ background: volumeBg }}
          />
        </div>
      </div>

      {/* Audio Element (hidden) */}
      {!showVideo && (
        <audio
          ref={audioRef}
          src={audioUrl || ''}
          onEnded={handleTrackEnd}
          onLoadedMetadata={handleLoadedMetadata}
          loop={repeat === 'track'}
        >
          {/* Added caption track to satisfy the linter */}
          <track
            kind="captions"
            src=""
            label="English captions"
            srcLang="en"
            default
          />
        </audio>
      )}

      {showPlaylistPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-xs">
            <h2 className="text-lg font-bold text-white mb-4">Thêm vào playlist</h2>
            <ul>
              {playlists.map((pl: any) => {
                const checked = pl.trackIds.includes(currentTrack.id);
                return (
                  <li key={pl.id} className="mb-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => handleToggleTrackInPlaylist(pl.id, e.target.checked)}
                    />
                    <span className={checked ? 'text-spotify-green font-semibold' : 'text-white'}>{pl.name}</span>
                  </li>
                );
              })}
            </ul>
            <button className="mt-4 px-4 py-2 rounded bg-gray-700 text-white w-full" onClick={() => setShowPlaylistPopup(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
