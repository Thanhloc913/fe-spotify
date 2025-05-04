import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';
import { FaSpotify, FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-b from-[#181818] via-[#232526] to-[#181818] overflow-y-auto">
      <div className="w-full max-w-lg bg-[#181818]/90 rounded-3xl shadow-2xl p-10 flex flex-col items-center backdrop-blur-md border border-[#232323] my-8 max-h-[90vh] overflow-y-auto">
      <FaSpotify className="text-spotify-green text-5xl mb-6" />
        <h1 className="text-4xl font-extrabold text-white mb-8 text-center">Đăng nhập vào Spotify</h1>
        <div className="w-full flex flex-col gap-4 mb-8">
          <button className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-gray-700 text-white hover:bg-gray-800 transition font-semibold text-lg">
            <FaGoogle className="text-xl" /> Tiếp tục bằng Google
          </button>
          <button className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-gray-700 text-white hover:bg-gray-800 transition font-semibold text-lg">
            <FaFacebook className="text-xl text-blue-500" /> Tiếp tục bằng Facebook
          </button>
          <button className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-gray-700 text-white hover:bg-gray-800 transition font-semibold text-lg">
            <FaApple className="text-xl" /> Tiếp tục bằng Apple
          </button>
          <button className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-gray-700 text-white hover:bg-gray-800 transition font-semibold text-lg">
            <span className="font-bold text-xl">#</span> Tiếp tục bằng số điện thoại
          </button>
        </div>
        <div className="flex items-center w-full mb-8">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="mx-4 text-gray-400 text-base font-semibold">hoặc</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-6">
          {error && <div className="text-red-500 text-center font-semibold">{error}</div>}
          <div>
            <label className="block text-gray-300 text-base font-bold mb-2">Email hoặc tên người dùng</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-2xl bg-[#222222] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-spotify-green text-lg"
              placeholder="Email hoặc tên người dùng"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-base font-bold mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-2xl bg-[#222222] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-spotify-green text-lg"
              placeholder="Mật khẩu"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-spotify-green text-black py-4 rounded-full font-extrabold text-xl hover:scale-105 transition shadow-lg mt-2"
          >
            Đăng nhập
          </button>
        </form>
        <div className="mt-10 text-gray-400 text-base">
          Bạn chưa có tài khoản?{' '}
          <span
            className="text-spotify-green hover:underline cursor-pointer font-semibold"
            onClick={() => navigate('/register')}
          >
            Đăng ký Spotify
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
