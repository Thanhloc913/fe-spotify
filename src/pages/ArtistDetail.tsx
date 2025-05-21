import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Artist, Track, Album } from '../types';
import { artistsApi } from '../api';
import { Link } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { FaPlay, FaPause, FaEllipsisV } from 'react-icons/fa';
import { uploadFile, createStorageData, createAlbum } from '../api/storageApi';
import { createSongV2, updateSong, editAlbum } from '../api/musicApi';
import { deleteSong } from '../api/songApi';
import { EditSongModal, EditSongFormProps } from '../components/admin/EditSongModal';
import { ApiSongType, ApiSongUpdateRequest, ApiAlbumType, ApiEditAlbumRequest } from '../types/api';
import { EditAlbum2Modal, EditAlbum2FormProps } from '../components/admin/EditAlbum2Modal';

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

// Định nghĩa các interface cần thiết cho album và song
interface UserAlbum {
  id: string;
  name: string;
}
interface SongSubmittedData {
  songData?: Record<string, unknown>;
  logs?: Record<string, unknown>;
  error?: string;
}

const ArtistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<ExtendedArtist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentTrack, playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();

  // State cho popup tạo album/nhạc
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [showCreateMusicModal, setShowCreateMusicModal] = useState(false);
  const [albumData, setAlbumData] = useState({
    name: '',
    description: '',
    coverImage: undefined as File | undefined,
  });
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [albumCreationMessage, setAlbumCreationMessage] = useState('');
  const [albumCreationError, setAlbumCreationError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [musicData, setMusicData] = useState({
    title: '',
    description: '',
    file: undefined as File | undefined,
    coverImage: undefined as File | undefined,
    albumIds: [] as string[],
    duration: 0,
    songType: 'SONG' as 'SONG' | 'MUSIC_VIDEO'
  });
  const [userAlbums, setUserAlbums] = useState<UserAlbum[]>([]);
  const [isCreatingMusic, setIsCreatingMusic] = useState(false);
  const [musicCreationError, setMusicCreationError] = useState('');
  const [musicCreationMessage, setMusicCreationMessage] = useState('');
  const [isMusicUploading, setIsMusicUploading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_submittedData, setSubmittedData] = useState<SongSubmittedData | null>(null);

  // State cho action menu từng track
  const [actionTrackId, setActionTrackId] = useState<string | null>(null);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingSong, setEditingSong] = useState<ApiSongType | null>(null);

  const [openEditAlbumModal, setOpenEditAlbumModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<ApiAlbumType | null>(null);

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
            console.log('backgroundUrl của album:', (albums[0] as ExtendedAlbum).backgroundUrl);
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
      
      setCurrentTrack(enhancedTrack);
      playTrack();
    }
  };

  // Hàm tạo album
  const handleAlbumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAlbum(true);
    setAlbumCreationMessage('');
    setAlbumCreationError('');
    setIsUploading(true);
    try {
      const userId = localStorage.getItem('profile_id');
      const artistId = localStorage.getItem('profile_id');
      if (!artistId) throw new Error('Không tìm thấy ID nghệ sĩ!');
      if (!albumData.coverImage) throw new Error('Vui lòng chọn ảnh bìa cho album!');
      const uploadResult = await uploadFile(albumData.coverImage);
      if (uploadResult && uploadResult.success) {
        const { fileName, fileType, fileUrl, fileSize } = uploadResult.data;
        const storageResult = await createStorageData({
          fileName, fileType, userId, fileUrl, fileSize, description: 'Album cover image'
        });
        setIsUploading(false);
        if (storageResult && storageResult.success) {
          const storageId = storageResult.data.id;
          const albumResult = await createAlbum({
            name: albumData.name,
            description: albumData.description,
            storageImageId: storageId,
            artistId
          });
          if (albumResult.status === 200 || albumResult.status === 201) {
            setAlbumCreationMessage('Tạo album thành công!');
            setAlbumData({ name: '', description: '', coverImage: undefined });
            setTimeout(() => {
              setShowCreateAlbumModal(false);
              setAlbumCreationMessage('');
            }, 2000);
          } else {
            throw new Error(albumResult.data.error || 'Lỗi khi tạo album');
          }
        } else {
          throw new Error('Lỗi khi tạo dữ liệu lưu trữ cho ảnh bìa');
        }
      } else {
        throw new Error('Lỗi khi tải ảnh lên');
      }
    } catch (err) {
      setAlbumCreationError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo album');
    } finally {
      setIsCreatingAlbum(false);
      setIsUploading(false);
    }
  };
  const handleAlbumChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAlbumData({ ...albumData, [e.target.name]: e.target.value });
  };
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAlbumData({ ...albumData, coverImage: e.target.files[0] });
    }
  };

  // Hàm tạo nhạc
  const handleMusicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingMusic(true);
    setMusicCreationMessage('');
    setMusicCreationError('');
    setIsMusicUploading(true);
    const logs: Record<string, unknown> = {};
    let finalCreateSongResult = null;
    try {
      if (musicData.albumIds.length <= 0) throw new Error('Phải chọn ít nhất một album cho bài hát');
      const actorId = localStorage.getItem('profile_id');
      if (!actorId) throw new Error('Không tìm thấy ID nghệ sĩ!');
      logs['actorId'] = actorId;
      if (!musicData.file) throw new Error('Vui lòng chọn file nhạc!');
      const songUploadResult = await uploadFile(musicData.file);
      logs['songUploadResult'] = {
        success: songUploadResult.success,
        message: songUploadResult.message,
        error: songUploadResult.error,
        status: songUploadResult.status,
        fileName: songUploadResult.data?.fileName,
      };
      if (!songUploadResult.success || !songUploadResult.data) {
        throw new Error(songUploadResult?.message || 'Không thể tải file nhạc lên.');
      }
      const songFileInfo = songUploadResult.data;
      const songStorageResult = await createStorageData({
        fileName: songFileInfo.fileName,
        fileType: songFileInfo.fileType,
        userId: actorId,
        fileUrl: songFileInfo.fileUrl,
        fileSize: songFileInfo.fileSize,
        description: `File am nhac ${songFileInfo.fileName}`,
      });
      logs['songStorageResult'] = {
        success: songStorageResult.success,
        message: songStorageResult.message,
        error: songStorageResult.error,
        status: songStorageResult.status,
        storageId: songStorageResult.data?.id,
      };
      if (!songStorageResult.success || !songStorageResult.data) {
        throw new Error(songStorageResult.error?.message || 'Không thể tạo storage entry cho file nhạc.');
      }
      const songStorageId = songStorageResult.data.id;
      let storageImageId: string | null = null;
      logs['songStorageId'] = songStorageId;
      if (musicData.coverImage) {
        const backgroundUploadResult = await uploadFile(musicData.coverImage);
        logs['backgroundUploadResult'] = backgroundUploadResult;
        if (!backgroundUploadResult.success) {
          throw new Error(backgroundUploadResult?.message || 'Không thể tải ảnh nền lên.');
        } else if (backgroundUploadResult.data) {
          const backgroundImageInfo = backgroundUploadResult.data;
          const backgroundStorageResult = await createStorageData({
            fileName: backgroundImageInfo.fileName,
            fileType: backgroundImageInfo.fileType,
            userId: actorId,
            fileUrl: backgroundImageInfo.fileUrl,
            fileSize: backgroundImageInfo.fileSize,
            description: `File hinh anh ${backgroundImageInfo.fileName} cho ${songFileInfo.fileName}`,
          });
          logs['backgroundStorageResult'] = backgroundStorageResult;
          if (!backgroundStorageResult.success || !backgroundStorageResult.data) {
            throw new Error(backgroundStorageResult.message || 'Không thể tạo storage entry cho ảnh nền.');
          } else {
            storageImageId = backgroundStorageResult.data.id;
            logs['storageImageId'] = storageImageId;
          }
        }
      } else {
        logs['backgroundSkipped'] = 'Không có ảnh nền được chọn.';
      }
      const songType: 'SONG' | 'MUSIC_VIDEO' = songFileInfo.fileType.includes('audio') ? 'SONG' : 'MUSIC_VIDEO';
      logs['songType'] = songType;
      setIsMusicUploading(false);
      const createSongRequest = {
        title: musicData.title,
        artistId: actorId,
        genreId: musicData.albumIds,
        storageId: songStorageId,
        storageImageId: storageImageId,
        duration: musicData.duration || Math.floor(Math.random() * 180 + 120),
        description: musicData.description,
        albumId: musicData.albumIds,
        songType,
      };
      logs['createSongRequest'] = createSongRequest;
      finalCreateSongResult = await createSongV2(createSongRequest);
      logs['createSongResult'] = finalCreateSongResult;
      if (!finalCreateSongResult.success) {
        throw new Error(finalCreateSongResult?.message || `Không thể tạo bài hát: ${finalCreateSongResult.message}`);
      }
      setSubmittedData({ songData: finalCreateSongResult.data, logs });
      setMusicCreationMessage('Tạo bài hát thành công!');
      setMusicData({
        title: '',
        description: '',
        file: undefined,
        coverImage: undefined,
        albumIds: [],
        duration: 0,
        songType: 'SONG'
      });
      setTimeout(() => {
        setShowCreateMusicModal(false);
        setMusicCreationMessage('');
      }, 2000);
    } catch (err) {
      setMusicCreationError((err as Error).message || 'Có lỗi xảy ra khi tạo bài hát');
      setSubmittedData({ error: (err as Error).message, logs });
    } finally {
      setIsCreatingMusic(false);
      setIsMusicUploading(false);
    }
  };
  // Load danh sách album của user khi mở modal tạo nhạc
  useEffect(() => {
    const loadUserAlbums = async () => {
      if (showCreateMusicModal) {
        try {
          const profileId = localStorage.getItem('profile_id');
          if (profileId) {
            setUserAlbums([
              { id: 'album1', name: 'Album 1' },
              { id: 'album2', name: 'Album 2' }
            ]);
          }
        } catch (error) {
          console.error('Lỗi khi tải album:', error);
        }
      }
    };
    loadUserAlbums();
  }, [showCreateMusicModal]);
  const handleAlbumSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setMusicData({ ...musicData, albumIds: selectedOptions });
  };
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMusicData({ ...musicData, file });
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        setMusicData(prevData => ({
          ...prevData,
          duration: Math.floor(audio.duration)
        }));
      };
    }
  };

  // Kiểm tra quyền hiển thị nút
  const isOwner = typeof window !== 'undefined' && localStorage.getItem('profile_id') === id;

  // Xử lý xóa bài hát (giả lập, bạn có thể thay bằng API thực tế)
  const handleDeleteTrack = async (trackId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài hát này?')) return;
    try {
      const response = await deleteSong(trackId);
      if (response.success) {
        // Xóa thành công, cập nhật lại danh sách topTracks
        setArtist((prev) => prev
          ? { ...prev, topTracks: prev.topTracks.filter(track => track.id !== trackId) }
          : prev
        );
      } else {
        alert('Xóa thất bại: ' + (response.message || 'Không rõ nguyên nhân'));
      }
    } catch (err) {
      alert('Lỗi khi xóa bài hát: ' + (err as Error).message);
    }
    setActionTrackId(null);
  };

  const handleEditSong = (song: Track) => {
    // Convert Track to ApiSongType (mapping các trường cần thiết)
    const s = song as unknown as { createdAt?: string | null; updatedAt?: string | null; deletedAt?: string | null; description?: string };
    const apiSong: ApiSongType = {
      id: song.id,
      title: song.title,
      artistId: song.artistId || artist?.id || '',
      songType: song.songType || 'SONG',
      duration: song.durationMs || 0,
      description: s.description || '',
      backgroundUrl: song.backgroundUrl || song.coverUrl || '',
      songUrl: song.songUrl || song.previewUrl || '',
      createdAt: s.createdAt || '',
      updatedAt: s.updatedAt || '',
      deletedAt: s.deletedAt || '',
      isActive: true,
      // Các trường khác nếu cần
    };
    setEditingSong(apiSong);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditingSong(null);
  };

  const handleEditSubmit = async (data: EditSongFormProps, song: ApiSongType) => {
    try {
      const actorId = localStorage.getItem('profile_id');
      if (!actorId) throw new Error('Không tìm thấy ID nghệ sĩ!');
      const updatePayload: ApiSongUpdateRequest = {
        id: song.id,
        title: data.title || song.title,
        duration: data.duration || song.duration,
        description: data.description || song.description,
        songType: song.songType,
        removeImage: data.removeBackground,
        storageImageId: '',
      };
      if (data.background) {
        const uploadResult = await uploadFile(data.background as File);
        if (!uploadResult.success || !uploadResult.data) throw new Error(uploadResult.message || 'Upload ảnh thất bại');
        const storageResult = await createStorageData({
          fileName: uploadResult.data.fileName,
          fileType: uploadResult.data.fileType,
          userId: actorId,
          fileUrl: uploadResult.data.fileUrl,
          fileSize: uploadResult.data.fileSize,
          description: `Background image for ${data.title}`,
        });
        if (!storageResult.success || !storageResult.data) throw new Error('Tạo storage entry thất bại');
        updatePayload.storageImageId = storageResult.data.id || '';
      } else if (data.removeBackground) {
        updatePayload.storageImageId = '';
      }
      
      // Gọi API updateSong và không kiểm tra result.success nữa
      await updateSong(updatePayload);
      
      // Cập nhật UI
      setArtist((prev) => prev
        ? {
            ...prev,
            topTracks: prev.topTracks.map((t) =>
              t.id === song.id
                ? {
                    ...t,
                    title: updatePayload.title,
                    durationMs: updatePayload.duration,
                    description: updatePayload.description,
                    songType: updatePayload.songType,
                    backgroundUrl: updatePayload.storageImageId ? (data.background ? '' : t.backgroundUrl) : t.backgroundUrl,
                  }
                : t
            ),
          }
        : prev
      );
      
      // Hiển thị thông báo thành công
      alert('Cập nhật bài hát thành công!');
      
      // Đóng modal
      handleCloseEditModal();
    } catch (err) {
      alert('Lỗi khi cập nhật bài hát: ' + (err as Error).message);
    }
  };

  const handleEditAlbum = (album: Album) => {
    // Convert Album to ApiAlbumType
    const apiAlbum: ApiAlbumType = {
      ...album,
      name: String(album.title || ''),
      description: String((album as { description?: string }).description || ''),
      storageImageId: String((album as { storageImageId?: string }).storageImageId || ''),
      createdAt: String((album as { createdAt?: string }).createdAt || ''),
      updatedAt: String((album as { updatedAt?: string }).updatedAt || ''),
      deletedAt: String((album as { deletedAt?: string }).deletedAt || ''),
      isActive: true,
      backgroundUrl: String((album as { backgroundUrl?: string }).backgroundUrl || album.coverUrl || ''),
    };
    setEditingAlbum(apiAlbum);
    setOpenEditAlbumModal(true);
  };

  const handleCloseEditAlbumModal = () => {
    setOpenEditAlbumModal(false);
    setEditingAlbum(null);
  };

  const handleEditAlbumSubmit = async (data: EditAlbum2FormProps, album: ApiAlbumType) => {
    try {
      const actorId = localStorage.getItem('profile_id');
      if (!actorId) throw new Error('Không tìm thấy ID nghệ sĩ!');
      // Chuẩn bị payload update
      const updatePayload: ApiEditAlbumRequest = {
        id: album.id,
        name: data.name,
        description: data.description,
        artistId: data.artistId,
        storageImageId: '',
        removeImage: !!data.removeCoverImage,
      };
      if (data.coverImage) {
        const uploadResult = await uploadFile(data.coverImage as File);
        if (!uploadResult.success || !uploadResult.data) throw new Error(uploadResult.message || 'Upload ảnh thất bại');
        const storageResult = await createStorageData({
          fileName: uploadResult.data.fileName,
          fileType: uploadResult.data.fileType,
          userId: actorId,
          fileUrl: uploadResult.data.fileUrl,
          fileSize: uploadResult.data.fileSize,
          description: `Album cover image for ${data.name}`,
        });
        if (!storageResult.success || !storageResult.data) throw new Error('Tạo storage entry thất bại');
        updatePayload.storageImageId = storageResult.data.id || '';
      } else if (data.removeCoverImage) {
        updatePayload.storageImageId = '';
      }
      await editAlbum(updatePayload);
      // Cập nhật UI (có thể reload lại artist data hoặc cập nhật trực tiếp)
      setArtist((prev) => prev
        ? {
            ...prev,
            albums: prev.albums.map((a) =>
              a.id === album.id
                ? {
                    ...a,
                    name: data.name,
                    description: data.description,
                    artistId: data.artistId,
                    coverUrl: updatePayload.storageImageId ? (data.coverImage ? '' : a.coverUrl) : a.coverUrl,
                  }
                : a
            ),
          }
        : prev
      );
      alert('Cập nhật album thành công!');
      handleCloseEditAlbumModal();
    } catch (err) {
      alert('Lỗi khi cập nhật album: ' + (err as Error).message);
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
        {isOwner && (
          <div className="ml-auto flex gap-2">
            <button 
              onClick={() => setShowCreateAlbumModal(true)} 
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition-colors"
            >
              Tạo Album
            </button>
            <button 
              onClick={() => setShowCreateMusicModal(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors"
            >
              Tạo nhạc
            </button>
          </div>
        )}
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
          <div className="grid grid-cols-10 gap-4 p-4 border-b border-gray-700">
            <div className="col-span-1 text-gray-400">#</div>
            <div className="col-span-5 text-gray-400">Title</div>
            <div className="col-span-2 text-gray-400">Duration</div>
            <div className="col-span-2 text-gray-400">Action</div>
          </div>
          {artist.topTracks.map((track, index) => {
            const isCurrentTrack = currentTrack?.id === track.id;
            const isCurrentlyPlaying = isCurrentTrack && isPlaying;
            return (
              <div
                key={track.id}
                className={`grid grid-cols-10 gap-4 p-4 hover:bg-gray-700 transition-colors cursor-pointer group ${isCurrentTrack ? 'bg-gray-700' : ''}`}
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
                <div className="col-span-2 text-gray-400">
                  {formatDuration(track.durationMs)}
                </div>
                <div className="col-span-2 flex items-center justify-end relative" onClick={e => e.stopPropagation()}>
                  <button
                    className="p-2 hover:bg-gray-600 rounded-full"
                    onClick={() => setActionTrackId(actionTrackId === track.id ? null : track.id)}
                  >
                    <FaEllipsisV />
                  </button>
                  {actionTrackId === track.id && (
                    <div className="absolute right-0 top-10 bg-gray-900 border border-gray-700 rounded shadow-lg z-50 min-w-[160px]">
                      {isOwner && (
                        <>
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                            onClick={() => { handleEditSong(track); setActionTrackId(null); }}
                          >
                            Chỉnh sửa bài hát
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400"
                            onClick={() => handleDeleteTrack(track.id)}
                          >
                            Xóa bài hát
                          </button>
                        </>
                      )}
                    </div>
                  )}
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
              const albumExt = album as ExtendedAlbum;
              const albumImgUrl = album.coverUrl || albumExt.backgroundUrl;
              
              return (
                <div key={album.id} className="relative group">
                  <Link
                    to={`/album/${album.id}`}
                    className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors block"
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
                  {isOwner && (
                    <button
                      className="absolute top-2 right-2 p-2 bg-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleEditAlbum(album)}
                    >
                      <FaEllipsisV />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-8 text-gray-400">No albums found.</div>
      )}

      {/* Create Album Modal */}
      {showCreateAlbumModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Tạo Album Mới</h3>
            <form onSubmit={handleAlbumSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-1">Tên album</label>
                <input
                  type="text"
                  name="name"
                  value={albumData.name}
                  onChange={handleAlbumChange}
                  className="w-full p-2 rounded bg-gray-900 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Mô tả</label>
                <textarea
                  name="description"
                  value={albumData.description}
                  onChange={handleAlbumChange}
                  className="w-full p-2 rounded bg-gray-900 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Ảnh bìa</label>
                <input
                  type="file"
                  name="coverImage"
                  accept="image/png,image/jpeg"
                  onChange={handleCoverImageChange}
                  className="w-full p-2 rounded bg-gray-900 text-white"
                  required
                />
                {albumData.coverImage && (
                  <p className="mt-1 text-sm text-gray-400">
                    Đã chọn: {albumData.coverImage.name} ({Math.round(albumData.coverImage.size / 1024)} KB)
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors"
                  disabled={isCreatingAlbum}
                >
                  {isUploading ? 'Đang tải ảnh...' : isCreatingAlbum ? 'Đang tạo...' : 'Tạo Album'}
                </button>
                <button 
                  type="button" 
                  className="bg-gray-500 text-white px-6 py-2 rounded-full"
                  onClick={() => setShowCreateAlbumModal(false)}
                >
                  Huỷ
                </button>
              </div>
              {albumCreationError && <div className="text-red-400 mt-2">{albumCreationError}</div>}
              {albumCreationMessage && <div className="text-green-400 mt-2">{albumCreationMessage}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Create Music Modal */}
      {showCreateMusicModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Tạo Bài Hát Mới</h3>
            <form onSubmit={handleMusicSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-1">Tên bài hát</label>
                <input
                  type="text"
                  value={musicData.title}
                  onChange={(e) => setMusicData({...musicData, title: e.target.value})}
                  className="w-full p-2 rounded bg-gray-900 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Mô tả</label>
                <textarea
                  value={musicData.description}
                  onChange={(e) => setMusicData({...musicData, description: e.target.value})}
                  className="w-full p-2 rounded bg-gray-900 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Album</label>
                <select
                  multiple
                  value={musicData.albumIds}
                  onChange={handleAlbumSelectionChange}
                  className="w-full p-2 rounded bg-gray-900 text-white"
                  required
                >
                  {userAlbums.map(album => (
                    <option key={album.id} value={album.id}>{album.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Giữ phím Ctrl để chọn nhiều album</p>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">File nhạc</label>
                <input
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleAudioFileChange}
                  className="w-full p-2 rounded bg-gray-900 text-white"
                  required
                />
                {musicData.file && (
                  <p className="mt-1 text-sm text-gray-400">
                    Đã chọn: {musicData.file.name} ({Math.round(musicData.file.size / 1024)} KB)
                    {musicData.duration > 0 && ` - Thời lượng: ${Math.floor(musicData.duration / 60)}:${(musicData.duration % 60).toString().padStart(2, '0')}`}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Ảnh bìa</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMusicData({...musicData, coverImage: e.target.files ? e.target.files[0] : undefined})}
                  className="w-full p-2 rounded bg-gray-900 text-white"
                />
                {musicData.coverImage && (
                  <p className="mt-1 text-sm text-gray-400">
                    Đã chọn: {musicData.coverImage.name} ({Math.round(musicData.coverImage.size / 1024)} KB)
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors"
                  disabled={isCreatingMusic}
                >
                  {isMusicUploading ? 'Đang tải file...' : isCreatingMusic ? 'Đang tạo...' : 'Tạo bài hát'}
                </button>
                <button 
                  type="button" 
                  className="bg-gray-500 text-white px-6 py-2 rounded-full"
                  onClick={() => setShowCreateMusicModal(false)}
                >
                  Huỷ
                </button>
              </div>
              {musicCreationError && <div className="text-red-400 mt-2">{musicCreationError}</div>}
              {musicCreationMessage && <div className="text-green-400 mt-2">{musicCreationMessage}</div>}
            </form>
          </div>
        </div>
      )}

      {editingSong && (
        <EditSongModal
          open={openEditModal}
          onClose={handleCloseEditModal}
          onSubmit={handleEditSubmit}
          song={editingSong}
        />
      )}

      {editingAlbum && (
        <EditAlbum2Modal
          open={openEditAlbumModal}
          onClose={handleCloseEditAlbumModal}
          onSubmit={handleEditAlbumSubmit}
          album2={editingAlbum}
        />
      )}
    </div>
  );
};

export default ArtistDetail; 