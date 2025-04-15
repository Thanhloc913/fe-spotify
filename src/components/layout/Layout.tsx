import type React from 'react';
import Sidebar from './Sidebar';
import Player from '../player/Player';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="h-screen bg-spotify-black text-spotify-text-primary flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">


        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 relative">
          {/* <TopBar /> */}
          <div className="py-4">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Player - Fixed at bottom */}
      <Player />
    </div>
  );
};

export default Layout;
