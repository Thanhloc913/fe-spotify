import { Bell, Home, Library } from "lucide-react";
import { useEffect, useState } from "react";
import { FaSearch, FaSpotify } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { removeToken } from "../../utils/auth";
import { getIsPremium, getProfilesByIds } from "../../api/profileApi";

interface User {
  id: string;
  name: string;
  email: string;
  profileImageUrl: string;
}

export default function Navbar() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { artist } = useUser();

  useEffect(() => {
    console.log("artist in Navbar:", artist);
  }, [artist]);

  const [isPremium, setIsPremium] = useState<boolean>(false);
  useEffect(() => {
    const checkIsPremium = async () => {
      const isPremium = await getIsPremium();
      setIsPremium(isPremium ?? false);
    };
    checkIsPremium();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search/${encodeURIComponent(searchValue)}`);
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#000000] relative">
      <div className="flex items-center">
        <NavLink to="/" className="flex items-center">
          <FaSpotify className="text-spotify-green text-3xl mr-2" />
          <span className="text-xl font-bold">Spotify</span>
        </NavLink>
      </div>

      <div className="flex items-center gap-4 flex-1 justify-center">
        <button onClick={() => navigate("/home")} className="text-white">
          <Home className="h-6 w-6" />
        </button>
        <div className="relative">
          <form onSubmit={handleSearch} className="ml-4 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="What do you want to listen to?"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="bg-white bg-opacity-10 text-spotify-text-primary rounded-full py-2 pl-10 pr-4 w-80 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
              <FaSearch className="absolute left-3 top-3 text-spotify-text-secondary" />
            </div>
          </form>
        </div>
        <button
          className="ml-2 text-gray-400 hover:text-white"
          onClick={() => navigate("/search")}
        >
          <Library className="h-5 w-5" />
        </button>
        {!isPremium ? (
          <button
            className="ml-2 px-4 py-1 rounded-full bg-spotify-green text-black font-semibold hover:bg-green-600 transition"
            onClick={() => navigate("/premium")}
          >
            Buy Premium
          </button>
        ) : (
          <span className="ml-2 flex items-center text-spotify-green font-semibold">
            Premium
            <svg
              className="ml-1 w-5 h-5 text-spotify-green"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </span>
        )}
        {/* <button
          className="ml-2 text-gray-400 hover:text-white"
          onClick={() => navigate("/admin")}
        >
          Admin
        </button> */}
      </div>

      <div className="flex items-center gap-4">
        <button className="bg-[#121212] p-2 rounded-full">
          <Bell className="h-5 w-5 text-white" />
        </button>
        <div className="relative">
          <button
            className="bg-[#121212] p-1 rounded-full"
            onClick={() => setShowMenu(!showMenu)}
          >
            <img
              src={
                artist?.avatarUrl ||
                "https://i.scdn.co/image/ab6775700000ee8518fe447fac315f236ce0bb52"
              }
              alt={artist?.fullName || "User avatar"}
              className="h-8 w-8 rounded-full"
            />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#121212] rounded-lg shadow-lg py-2 z-10 space-y-1">
              <button className="block w-full text-left px-4 py-2 text-white hover:bg-[#242424] rounded-md">
                Tài khoản
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-white hover:bg-[#242424] rounded-md"
                onClick={() => {
                  setShowMenu(false);
                  navigate("/profile");
                }}
              >
                Hồ sơ
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-white hover:bg-[#242424] rounded-md"
                onClick={() => {
                  setShowMenu(false);
                  navigate("/artist/" + localStorage.getItem("profile_id"));
                }}
              >
                Trang cá nhân
              </button>
              <button className="block w-full text-left px-4 py-2 text-white hover:bg-[#242424] rounded-md">
                Hỗ trợ
              </button>
              <button className="block w-full text-left px-4 py-2 text-white hover:bg-[#242424] rounded-md">
                Tải xuống
              </button>
              <button className="block w-full text-left px-4 py-2 text-white hover:bg-[#242424] rounded-md">
                Cài đặt
              </button>
              <div className="border-t border-[#2a2a2a] my-1"></div>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-red-500 hover:bg-[#242424] hover:text-white rounded-md"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
