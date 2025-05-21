import { useEffect, useState } from 'react';
import { Artist } from '../types';
import { updateProfile, getProfile } from '../api/profileApi';
import { useUser } from '../contexts/UserContext';
import { getAccountById, verifyCurrentPassword, updatePassword } from '../api/authApi';
import { uploadFile, createStorageData, createAlbum } from '../api/storageApi';
import { createSong, createSongV2 } from '../api/musicApi';

const formatDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const Profile = () => {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State cho form chỉnh sửa
  const [editData, setEditData] = useState({
    fullName: '',
    bio: '',
    dateOfBirth: '',
    phoneNumber: '',
    avatarUrl: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const { fetchProfile } = useUser();

  // State cho form đổi mật khẩu
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // State for album creation
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
  const [userAlbums, setUserAlbums] = useState<any[]>([]);
  const [isCreatingMusic, setIsCreatingMusic] = useState(false);
  const [musicCreationError, setMusicCreationError] = useState('');
  const [musicCreationMessage, setMusicCreationMessage] = useState('');
  const [isMusicUploading, setIsMusicUploading] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const data = await getProfile();
        if (data.success) {
          setArtist(data.data);
          setEditData({
            fullName: data.data.fullName || '',
            bio: data.data.bio || '',
            dateOfBirth: data.data.dateOfBirth || '',
            phoneNumber: data.data.phoneNumber || '',
            avatarUrl: data.data.avatarUrl || '',
          });
        } else throw new Error(data.message);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
  }, []);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const updated = await updateProfile(editData);
      setArtist(updated);
      await fetchProfile();
      setEditMode(false);
      setSuccessMsg('Cập nhật thành công!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setIsChangingPassword(true);

    try {
      // Kiểm tra mật khẩu mới và xác nhận có khớp không
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Mật khẩu mới không khớp!');
      }

      // Lấy account ID từ localStorage
      const accountId = localStorage.getItem('account_id');
      if (!accountId) {
        throw new Error('Không tìm thấy thông tin tài khoản!');
      }

      // Lấy thông tin tài khoản để có email
      const accountInfo = await getAccountById(accountId);
      if (!accountInfo.success || !accountInfo.data.email) {
        throw new Error('Không thể lấy thông tin tài khoản!');
      }

      // Kiểm tra mật khẩu hiện tại
      await verifyCurrentPassword(accountInfo.data.email, passwordData.currentPassword);

      // Nếu mật khẩu hiện tại đúng, tiến hành đổi mật khẩu
      await updatePassword(passwordData.newPassword);

      setPasswordSuccess('Đổi mật khẩu thành công!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Album creation function
  const handleAlbumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAlbum(true);
    setAlbumCreationMessage('');
    setAlbumCreationError('');
    setIsUploading(true);

    try {
      // Get the artist ID from localStorage
      const userId = localStorage.getItem('profile_id');
      const artistId = localStorage.getItem('profile_id');
      if (!artistId) {
        throw new Error('Không tìm thấy ID nghệ sĩ!');
      }
      
      if (!albumData.coverImage) {
        throw new Error('Vui lòng chọn ảnh bìa cho album!');
      }

      // 1. Upload the cover image
      const uploadResult = await uploadFile(albumData.coverImage);
      
      if (uploadResult && uploadResult.success) {
        // 2. Get the uploaded file information
        const { fileName, fileType, fileUrl, fileSize } = uploadResult.data;
        
        // 3. Create storage data with the uploaded file info
        const storageResult = await createStorageData({
          fileName,
          fileType,
          userId,
          fileUrl,
          fileSize,
          description: 'Album cover image'
        });
        
        setIsUploading(false);
        
        if (storageResult && storageResult.success) {
          // Get the storage ID from the storage result
          const storageId = storageResult.data.id;
          console.log('Storage ID for album:', storageId);
          
          // 4. Create the album with the storage image ID
          const albumResult = await createAlbum({
            name: albumData.name,
            description: albumData.description,
            storageImageId: storageId,
            artistId
          });

          if (albumResult.status === 200 || albumResult.status === 201) {
            setAlbumCreationMessage('Tạo album thành công!');
            setAlbumData({
              name: '',
              description: '',
              coverImage: undefined
            });
            // Close modal after a delay
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

  // Cập nhật hàm xử lý tạo bài hát mới theo cấu trúc của ManageSongs.tsx
  const handleMusicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingMusic(true);
    setMusicCreationMessage('');
    setMusicCreationError('');
    setIsMusicUploading(true);

    const logs: Record<string, unknown> = {};
    let finalCreateSongResult = null;

    try {
      if (musicData.albumIds.length <= 0) {
        throw new Error("Phải chọn ít nhất một album cho bài hát");
      }
      
      const actorId = localStorage.getItem("profile_id");
      if (!actorId) {
        throw new Error("Không tìm thấy ID nghệ sĩ!");
      }
      logs["actorId"] = actorId;

      if (!musicData.file) {
        throw new Error("Vui lòng chọn file nhạc!");
      }

      // 1. Tải file nhạc lên
      const songUploadResult = await uploadFile(musicData.file);
      logs["songUploadResult"] = {
        success: songUploadResult.success,
        message: songUploadResult.message,
        error: songUploadResult.error,
        status: songUploadResult.status,
        fileName: songUploadResult.data?.fileName,
      };

      if (!songUploadResult.success || !songUploadResult.data) {
        throw new Error(
          songUploadResult?.message || "Không thể tải file nhạc lên."
        );
      }
      const songFileInfo = songUploadResult.data;

      // 2. Tạo storage entry cho file nhạc
      const songStorageResult = await createStorageData({
        fileName: songFileInfo.fileName,
        fileType: songFileInfo.fileType,
        userId: actorId,
        fileUrl: songFileInfo.fileUrl,
        fileSize: songFileInfo.fileSize,
        description: `File am nhac ${songFileInfo.fileName}`,
      });
      logs["songStorageResult"] = {
        success: songStorageResult.success,
        message: songStorageResult.message,
        error: songStorageResult.error,
        status: songStorageResult.status,
        storageId: songStorageResult.data?.id,
      };

      if (!songStorageResult.success || !songStorageResult.data) {
        throw new Error(
          songStorageResult.error?.message ||
            "Không thể tạo storage entry cho file nhạc."
        );
      }
      const songStorageId = songStorageResult.data.id;
      let storageImageId: string | null = null;
      logs["songStorageId"] = songStorageId;

      // 3. Tải ảnh nền lên (nếu có)
      if (musicData.coverImage) {
        const backgroundUploadResult = await uploadFile(musicData.coverImage);
        logs["backgroundUploadResult"] = backgroundUploadResult;

        if (!backgroundUploadResult.success) {
          throw new Error(
            backgroundUploadResult?.message ||
              "Không thể tải ảnh nền lên."
          );
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
          logs["backgroundStorageResult"] = backgroundStorageResult;

          if (
            !backgroundStorageResult.success ||
            !backgroundStorageResult.data
          ) {
            throw new Error(
              backgroundStorageResult.message ||
                "Không thể tạo storage entry cho ảnh nền."
            );
          } else {
            storageImageId = backgroundStorageResult.data.id;
            logs["storageImageId"] = storageImageId;
          }
        }
      } else {
        logs["backgroundSkipped"] = "Không có ảnh nền được chọn.";
      }

      // 4. Xác định loại nhạc
      const songType: "SONG" | "MUSIC_VIDEO" = songFileInfo.fileType.includes(
        "audio"
      )
        ? "SONG"
        : "MUSIC_VIDEO";
      logs["songType"] = songType;

      setIsMusicUploading(false);

      // 5. Tạo bài hát với API giống như trong ManageSongs.tsx
      const createSongRequest = {
        title: musicData.title,
        artistId: actorId,
        genreId: musicData.albumIds, // Sử dụng albumIds làm genreId
        storageId: songStorageId,
        storageImageId: storageImageId,
        duration: musicData.duration || Math.floor(Math.random() * 180 + 120), // Nếu không có duration thì tạo random từ 120-300s
        description: musicData.description,
        albumId: musicData.albumIds,
        songType,
      };
      logs["createSongRequest"] = createSongRequest;

      finalCreateSongResult = await createSongV2(createSongRequest);
      logs["createSongResult"] = finalCreateSongResult;

      if (!finalCreateSongResult.success) {
        throw new Error(
          finalCreateSongResult?.message ||
            `Không thể tạo bài hát: ${finalCreateSongResult.message}`
        );
      }
      
      setSubmittedData({ songData: finalCreateSongResult.data, logs });
      setMusicCreationMessage('Tạo bài hát thành công!');
      
      // Reset form data
      setMusicData({
        title: '',
        description: '',
        file: undefined,
        coverImage: undefined,
        albumIds: [],
        duration: 0,
        songType: 'SONG'
      });
      
      // Close modal after a delay
      setTimeout(() => {
        setShowCreateMusicModal(false);
        setMusicCreationMessage('');
      }, 2000);
    } catch (err) {
      console.error("Lỗi khi tạo bài hát:", err);
      setMusicCreationError((err as Error).message || "Có lỗi xảy ra khi tạo bài hát");
      setSubmittedData({ error: (err as Error).message, logs });
    } finally {
      setIsCreatingMusic(false);
      setIsMusicUploading(false);
    }
  };

  // Thêm hàm để tải danh sách album của người dùng
  useEffect(() => {
    const loadUserAlbums = async () => {
      if (showCreateMusicModal) {
        try {
          // Thay bằng API call thực tế để lấy album của người dùng hiện tại
          const profileId = localStorage.getItem('profile_id');
          if (profileId) {
            // Ví dụ: const albums = await getAlbumsByArtistId(profileId);
            // setUserAlbums(albums);
            
            // Tạm thời để mảng rỗng hoặc mẫu để testing
            setUserAlbums([
              { id: 'album1', name: 'Album 1' },
              { id: 'album2', name: 'Album 2' }
            ]);
          }
        } catch (error) {
          console.error("Lỗi khi tải album:", error);
        }
      }
    };
    
    loadUserAlbums();
  }, [showCreateMusicModal]);

  const handleAlbumSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setMusicData({...musicData, albumIds: selectedOptions});
  };
  
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMusicData({...musicData, file});
      
      // Thêm code để đọc thời lượng của file audio nếu có thể
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

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  if (!artist) return <div className="flex justify-center items-center h-screen">Artist not found</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-end gap-6 mb-8">
        <img
          src={artist.avatarUrl || ''}
          alt={artist.fullName || 'Artist'}
          className="w-48 h-48 rounded-full object-cover"
        />
        <div>
          <h1 className="text-5xl font-bold mb-4">{artist.fullName || 'Unnamed Artist'}</h1>
          <p className="text-gray-400">{artist.bio || 'No bio available'}</p>
          <p className="text-gray-500 mt-2">
            Member since {formatDate(artist?.createdAt || undefined)}
          </p>
        </div>
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
      </div>

      {/* Form chỉnh sửa thông tin cá nhân */}
      <div className="mb-8 bg-gray-800 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Thông tin cá nhân</h2>
          {!editMode && (
            <button className="bg-green-500 text-white px-4 py-1 rounded-full" onClick={() => setEditMode(true)}>
              Chỉnh sửa
            </button>
          )}
        </div>
        {editMode ? (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-1">Họ tên</label>
              <input
                type="text"
                name="fullName"
                value={editData.fullName}
                onChange={handleEditChange}
                className="w-full p-2 rounded bg-gray-900 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Bio</label>
              <textarea
                name="bio"
                value={editData.bio}
                onChange={handleEditChange}
                className="w-full p-2 rounded bg-gray-900 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Ngày sinh</label>
              <input
                type="date"
                name="dateOfBirth"
                value={editData.dateOfBirth}
                onChange={handleEditChange}
                className="w-full p-2 rounded bg-gray-900 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Số điện thoại</label>
              <input
                type="text"
                name="phoneNumber"
                value={editData.phoneNumber}
                onChange={handleEditChange}
                className="w-full p-2 rounded bg-gray-900 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Avatar (URL)</label>
              <input
                type="text"
                name="avatarUrl"
                value={editData.avatarUrl}
                onChange={handleEditChange}
                className="w-full p-2 rounded bg-gray-900 text-white"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button type="button" className="bg-gray-500 text-white px-6 py-2 rounded-full" onClick={() => setEditMode(false)}>
                Huỷ
              </button>
            </div>
            {successMsg && <div className="text-green-400 mt-2">{successMsg}</div>}
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">Ngày sinh</p>
              <p className="text-white">{formatDate(artist?.dateOfBirth)}</p>
            </div>
            <div>
              <p className="text-gray-400">Số điện thoại</p>
              <p className="text-white">{artist.phoneNumber || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-gray-400">Trạng thái</p>
              <p className="text-white">{artist.isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <div>
              <p className="text-gray-400">Cập nhật lần cuối</p>
              <p className="text-white">{formatDate(artist?.updatedAt)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Form đổi mật khẩu */}
      <div className="mb-8 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Đổi mật khẩu</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="w-full p-2 rounded bg-gray-900 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="w-full p-2 rounded bg-gray-900 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full p-2 rounded bg-gray-900 text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors"
            disabled={isChangingPassword}
          >
            {isChangingPassword ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </button>
          {passwordError && <div className="text-red-400 mt-2">{passwordError}</div>}
          {passwordSuccess && <div className="text-green-400 mt-2">{passwordSuccess}</div>}
        </form>
      </div>

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
    </div>
  );
};

export default Profile; 