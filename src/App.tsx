import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import PrivateRoute from "./components/PrivateRoute";
import Artists from "./pages/Artists";
import Albums from "./pages/Albums";
import Tracks from "./pages/Tracks";
import ArtistDetail from "./pages/ArtistDetail";
import AlbumDetail from "./pages/AlbumDetail";
import Profile from "./pages/Profile";
import PlaylistDetail from "./pages/PlaylistDetail";
import LikedSongs from "./pages/LikedSongs";
import { UserProvider } from "./contexts/UserContext";
import Search from "./pages/Search";
import AdminLayout from "./components/AdminLayout";
import ManageUsers from "./pages/admin/ManageUsers";
import GlobalProvider from "./GlobalProvider";

document.body.classList.add("dark");

function App() {
  return (
    <GlobalProvider>
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="search" element={<Search />} />
              <Route path="search/:keyword" element={<Search />} />
              <Route
                path="library"
                element={<div>Library (Coming Soon)</div>}
              />
              <Route path="playlist/:id" element={<PlaylistDetail />} />
              <Route path="album/:id" element={<AlbumDetail />} />
              <Route path="artist/:id" element={<ArtistDetail />} />
              <Route
                path="category/:id"
                element={<div>Category Detail (Coming Soon)</div>}
              />

              {/* Routes for "Show All" links */}
              <Route path="trending" element={<Tracks />} />
              <Route path="artists" element={<Artists />} />
              <Route path="albums" element={<Albums />} />
              <Route
                path="playlists"
                element={<div>All Playlists (Coming Soon)</div>}
              />
              <Route
                path="categories"
                element={<div>All Categories (Coming Soon)</div>}
              />
              <Route path="profile" element={<Profile />} />
              <Route path="liked-songs" element={<LikedSongs />} />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/users" replace />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="artists" element={<div>(Coming Soon)</div>} />
              <Route path="albums" element={<div>(Coming Soon)</div>} />
              <Route path="tracks" element={<div>(Coming Soon)</div>} />
              <Route path="playlists" element={<div>(Coming Soon)</div>} />
              <Route path="categories" element={<div>(Coming Soon)</div>} />
            </Route>
          </Routes>
        </Router>
      </UserProvider>
    </GlobalProvider>
  );
}

export default App;
