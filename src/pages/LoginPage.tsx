import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/authApi";
import { FaSpotify, FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import { useUser } from "../contexts/UserContext";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { fetchProfile } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      await fetchProfile();
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-[#121212] p-6 rounded-lg w-full max-w-sm shadow-lg">
        <div className="text-center mb-8">
          <FaSpotify className="text-spotify-green text-5xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">
            Đăng nhập vào Spotify
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-500 text-white p-3 rounded text-center">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email hoặc tên người dùng
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-[#3e3e3e] text-white rounded focus:outline-none focus:ring-2 focus:ring-spotify-green"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#3e3e3e] text-white rounded focus:outline-none focus:ring-2 focus:ring-spotify-green"
              required
            />
          </div>

          <Link
            to="/forgot-password"
            className="block text-sm text-spotify-green hover:underline text-center"
          >
            Quên mật khẩu của bạn?
          </Link>

          <button
            type="submit"
            className="w-full bg-spotify-green text-black font-bold py-3 rounded-full hover:bg-[#1ed760] transition-colors"
          >
            ĐĂNG NHẬP
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#121212] text-gray-400">HOẶC</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <button className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3 rounded-full hover:bg-gray-100 transition-colors">
              <FaGoogle /> TIẾP TỤC VỚI GOOGLE
            </button>
            <button className="w-full flex items-center justify-center gap-2 bg-[#1877f2] text-white font-bold py-3 rounded-full hover:bg-[#166fe5] transition-colors">
              <FaFacebook /> TIẾP TỤC VỚI FACEBOOK
            </button>
            <button className="w-full flex items-center justify-center gap-2 bg-black text-white font-bold py-3 rounded-full border border-gray-600 hover:bg-gray-900 transition-colors">
              <FaApple /> TIẾP TỤC VỚI APPLE
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Bạn chưa có tài khoản?{" "}
            <Link to="/register" className="text-spotify-green hover:underline">
              Đăng ký Spotify
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
