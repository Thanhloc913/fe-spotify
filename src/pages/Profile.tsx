import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { User, Track } from '../types';
import { Link } from 'react-router-dom';
import { mockData } from '../mock/data';

const mockUser: User = mockData.users[0] || {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  profileImageUrl: 'https://i.scdn.co/image/ab6775700000ee8518fe447fac315f236ce0bb52',
  following: {
    artists: ['1', '2'],
    users: ['2', '3']
  },
  playlists: ['1', '2', '3'],
  createdAt: '2024-01-01'
};

// Mock danh sách nhạc cá nhân đã upload
const initialUploadedTracks: Track[] = [
  {
    id: 'u1',
    title: 'My First Song',
    artistId: mockUser.id,
    artistName: mockUser.name,
    albumId: '',
    albumName: '',
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b2739abdf14e6058bd3903686148',
    previewUrl: '',
    durationMs: 180000,
    explicit: false,
    popularity: 0,
    trackNumber: 1,
    isPlayable: true
  }
];

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // State cho form cập nhật hồ sơ
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  // State cho upload nhạc
  const [trackTitle, setTrackTitle] = useState('');
  const [trackFile, setTrackFile] = useState<File | null>(null);
  const [trackCover, setTrackCover] = useState('');
  const [uploadedTracks, setUploadedTracks] = useState<Track[]>(initialUploadedTracks);

  useEffect(() => {
    // In a real app, we would fetch user data from an API
    // For now, we'll use mock data
    setUser(mockUser);
    setEditName(mockUser.name);
    setEditEmail(mockUser.email);
    setEditAvatar(mockUser.profileImageUrl);
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  // Xử lý cập nhật hồ sơ
  const handleProfileUpdate = (e: FormEvent) => {
    e.preventDefault();
    setUser({ ...user, name: editName, email: editEmail, profileImageUrl: editAvatar });
    alert('Cập nhật hồ sơ thành công (mock)!');
  };

  // Xử lý upload nhạc
  const handleTrackUpload = (e: FormEvent) => {
    e.preventDefault();
    if (!trackTitle || !trackFile) {
      alert('Vui lòng nhập tên bài hát và chọn file nhạc!');
      return;
    }
    const newTrack: Track = {
      id: `u${uploadedTracks.length + 1}`,
      title: trackTitle,
      artistId: user.id,
      artistName: user.name,
      albumId: '',
      albumName: '',
      coverUrl: trackCover || 'https://i.scdn.co/image/ab67616d0000b2739abdf14e6058bd3903686148',
      previewUrl: '',
      durationMs: 180000,
      explicit: false,
      popularity: 0,
      trackNumber: uploadedTracks.length + 1,
      isPlayable: true
    };
    setUploadedTracks([newTrack, ...uploadedTracks]);
    setTrackTitle('');
    setTrackFile(null);
    setTrackCover('');
    alert('Upload nhạc thành công (mock)!');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-end gap-6 mb-8">
        <img
          src={user.profileImageUrl}
          alt={user.name}
          className="w-48 h-48 rounded-full object-cover"
        />
        <div>
          <h1 className="text-5xl font-bold mb-4">{user.name}</h1>
          <p className="text-gray-400">{user.email}</p>
          <p className="text-gray-500 mt-2">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Form cập nhật hồ sơ */}
      <div className="mb-8 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Cập nhật hồ sơ</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Tên</label>
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full p-2 rounded bg-gray-900 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={editEmail}
              onChange={e => setEditEmail(e.target.value)}
              className="w-full p-2 rounded bg-gray-900 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Ảnh đại diện (URL)</label>
            <input
              type="text"
              value={editAvatar}
              onChange={e => setEditAvatar(e.target.value)}
              className="w-full p-2 rounded bg-gray-900 text-white"
            />
          </div>
          <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors">
            Lưu thay đổi
          </button>
        </form>
      </div>

      {/* Form upload nhạc */}
      <div className="mb-8 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Upload nhạc cá nhân</h2>
        <form onSubmit={handleTrackUpload} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Tên bài hát</label>
            <input
              type="text"
              value={trackTitle}
              onChange={e => setTrackTitle(e.target.value)}
              className="w-full p-2 rounded bg-gray-900 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">File nhạc (mock, chỉ lưu tên file)</label>
            <input
              type="file"
              accept="audio/*"
              onChange={e => setTrackFile(e.target.files ? e.target.files[0] : null)}
              className="w-full p-2 rounded bg-gray-900 text-white"
            />
            {trackFile && <span className="text-gray-400 text-sm">{trackFile.name}</span>}
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Ảnh bìa (URL, tuỳ chọn)</label>
            <input
              type="text"
              value={trackCover}
              onChange={e => setTrackCover(e.target.value)}
              className="w-full p-2 rounded bg-gray-900 text-white"
            />
          </div>
          <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors">
            Upload nhạc
          </button>
        </form>
      </div>

      {/* Danh sách nhạc cá nhân đã upload */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Nhạc cá nhân đã upload</h2>
        {uploadedTracks.length === 0 ? (
          <p className="text-gray-400">Bạn chưa upload bài hát nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedTracks.map(track => (
              <div key={track.id} className="bg-gray-800 p-4 rounded-lg flex flex-col items-center">
                <img src={track.coverUrl} alt={track.title} className="w-24 h-24 object-cover rounded mb-2" />
                <div className="font-semibold text-white mb-1">{track.title}</div>
                <div className="text-gray-400 text-sm mb-1">{track.artistName}</div>
                <div className="text-gray-500 text-xs">{Math.floor(track.durationMs / 60000)}:{((track.durationMs % 60000) / 1000).toFixed(0).padStart(2, '0')}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Following Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Following</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Artists</h3>
            <p className="text-gray-400">{user.following.artists.length} artists</p>
            <Link
              to="/artists"
              className="text-green-500 hover:underline mt-2 inline-block"
            >
              View all
            </Link>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Users</h3>
            <p className="text-gray-400">{user.following.users.length} users</p>
            <Link
              to="/users"
              className="text-green-500 hover:underline mt-2 inline-block"
            >
              View all
            </Link>
          </div>
        </div>
      </div>

      {/* Playlists Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Playlists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {user.playlists.map((playlistId) => (
            <Link
              key={playlistId}
              to={`/playlist/${playlistId}`}
              className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="aspect-square bg-gray-700 rounded-lg mb-4"></div>
              <h3 className="text-lg font-semibold">Playlist {playlistId}</h3>
              <p className="text-gray-400">By {user.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile; 