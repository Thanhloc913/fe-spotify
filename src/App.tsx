import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ArtistDetailPage from "./pages/ArtistDetailPage"

document.body.classList.add('dark');

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="search/:keyword" element={<div>Search Page (Coming Soon)</div>} />
          <Route path="library" element={<div>Library (Coming Soon)</div>} />
          <Route path="playlist/:id" element={<div>Playlist Detail (Coming Soon)</div>} />
          <Route path="album/:id" element={<div>Album Detail (Coming Soon)</div>} />
          <Route path="artist/:id" element={<ArtistDetailPage />} />
          <Route path="category/:id" element={<div>Category Detail (Coming Soon)</div>} />

          {/* Routes for "Show All" links */}
          <Route path="trending" element={<div>All Trending Songs (Coming Soon)</div>} />
          <Route path="artists" element={<div>All Artists (Coming Soon)</div>} />
          <Route path="albums" element={<div>All Albums (Coming Soon)</div>} />
          <Route path="playlists" element={<div>All Playlists (Coming Soon)</div>} />
          <Route path="categories" element={<div>All Categories (Coming Soon)</div>} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
