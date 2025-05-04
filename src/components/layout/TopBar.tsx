import React from 'react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaSearch, FaUser } from 'react-icons/fa';

interface TopBarProps {
  onLogout: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onLogout }) => {
  const [searchValue, setSearchValue] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const isSearchPage = location.pathname.startsWith('/search');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search/${encodeURIComponent(searchValue)}`);
    }
  };

  return (
    <div className="flex justify-between items-center mb-4 sticky top-0 z-10 bg-spotify-black bg-opacity-95 py-4">
      {/* Navigation buttons */}
      <div className="flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="bg-black rounded-full p-2 mr-2"
        >
          <FaChevronLeft className="text-spotify-text-primary" />
        </button>
        <button
          onClick={() => navigate(1)}
          className="bg-black rounded-full p-2"
        >
          <FaChevronRight className="text-spotify-text-primary" />
        </button>

        {/* Search input - only show in search page */}
        {isSearchPage && (
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
        )}
      </div>

      {/* User profile */}
      <div className="flex items-center">
        <div className="bg-black rounded-full p-1 cursor-pointer">
          <div className="bg-spotify-text-secondary rounded-full p-1">
            <FaUser className="text-black" />
          </div>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ml-2"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default TopBar;
