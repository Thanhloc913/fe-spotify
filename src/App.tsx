import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import Artists from './pages/Artists';
import Albums from './pages/Albums';
import Tracks from './pages/Tracks';
import ArtistDetail from './pages/ArtistDetail';
import AlbumDetail from './pages/AlbumDetail';
import Profile from './pages/Profile';

document.body.classList.add('dark');

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="search/:keyword" element={<div>Search Page (Coming Soon)</div>} />
          <Route path="library" element={<div>Library (Coming Soon)</div>} />
          <Route path="playlist/:id" element={<div>Playlist Detail (Coming Soon)</div>} />
          <Route path="album/:id" element={<AlbumDetail />} />
          <Route path="artist/:id" element={<ArtistDetail />} />
          <Route path="category/:id" element={<div>Category Detail (Coming Soon)</div>} />

          {/* Routes for "Show All" links */}
          <Route path="trending" element={<Tracks />} />
          <Route path="artists" element={<Artists />} />
          <Route path="albums" element={<Albums />} />
          <Route path="playlists" element={<div>All Playlists (Coming Soon)</div>} />
          <Route path="categories" element={<div>All Categories (Coming Soon)</div>} />
          <Route path="profile" element={<Profile />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
