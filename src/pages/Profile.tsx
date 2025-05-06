import { useEffect, useState } from 'react';
import { Artist } from '../types';
import { updateProfile, getProfile } from '../api/profileApi';
import { useUser } from '../contexts/UserContext';
import { getAccountById, verifyCurrentPassword, updatePassword } from '../api/authApi';

const formatDate = (dateStr: string | undefined) => {
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
      await fetchProfile(); // Cập nhật context để Navbar update avatar
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

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  if (!artist) return <div className="flex justify-center items-center h-screen">Artist not found</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-end gap-6 mb-8">
        <img
          src={artist.avatarUrl}
          alt={artist.fullName}
          className="w-48 h-48 rounded-full object-cover"
        />
        <div>
          <h1 className="text-5xl font-bold mb-4">{artist.fullName}</h1>
          <p className="text-gray-400">{artist.bio || 'No bio available'}</p>
          <p className="text-gray-500 mt-2">
            Member since {formatDate(artist?.createdAt)}
          </p>
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

      {/* TODO: Thêm form upload nhạc và tạo album mới ở đây */}
    </div>
  );
};

export default Profile; 