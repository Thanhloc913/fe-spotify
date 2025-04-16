import { Search, Library, Bell, Home } from "lucide-react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaSearch, FaSpotify } from 'react-icons/fa';

export default function Navbar() {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const location = useLocation();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchValue.trim()) {
            navigate(`/search/${encodeURIComponent(searchValue)}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
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
            </div>

            <div className="flex items-center gap-4">
                <button className="bg-white text-black font-bold py-2 px-4 rounded-full text-sm">
                    Khám phá Premium
                </button>
                <button className="bg-[#121212] p-2 rounded-full">
                    <Bell className="h-5 w-5 text-white" />
                </button>
                <div className="relative">
                    <button
                        className="bg-[#121212] p-1 rounded-full"
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <img
                            src="https://scontent.fsgn8-3.fna.fbcdn.net/v/t39.30808-1/483762311_2076467482820691_180815856527567_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=100&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeF7CAeXKG9qMw5Ttujldti7CrF_DF8J50IKsX8MXwnnQuOaKEvXP9WowpXwpfTdYB6eJuvLyfW5j1Ok2SQvX__k&_nc_ohc=vqPLL9QUdBwQ7kNvgF1eeH2&_nc_oc=AdgROX4TrE2lfxe1ZY80fHd0nDg8gO5UhJVVg2Q7XiFjqJGGYLSiiyg_NTSR_WZXQ5YnHyzIilBxJQUeOKukmYe7&_nc_zt=24&_nc_ht=scontent.fsgn8-3.fna&_nc_gid=NBoh7q3KXV2jaRRFyux96A&oh=00_AYF41TQXSMevGkJKr3GaX6yWlBoZBCs0r2l6jql9Ja7ofQ&oe=67DC5DDF"
                            alt="User avatar"
                            className="h-8 w-8 rounded-full"
                        />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-[#121212] rounded-lg shadow-lg py-2 z-10">
                            <button className="block w-full text-left px-4 py-2 text-white hover:bg-[#242424]">
                                Tài khoản
                            </button>
                            <button className="block w-full text-left px-4 py-2 text-white hover:bg-[#242424]">
                                Hồ sơ
                            </button>
                            <button className="block w-full text-left px-4 py-2 text-white hover:bg-[#242424]">
                                Hỗ trợ
                            </button>
                            <button className="block w-full text-left px-4 py-2 text-white hover:bg-[#242424]">
                                Tải xuống
                            </button>
                            <button className="block w-full text-left px-4 py-2 text-white hover:bg-[#242424]">
                                Cài đặt
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}