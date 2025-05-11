import { Route, Navigate } from "react-router-dom";
import ManageGenres from "./ManageGenres";
import ManageRoles from "./ManageRoles";
import ManageUsers from "./ManageUsers";
import ManageArtists from "./ManageArtists";
import ManageAlbums from "./ManageAlbums";
import ManageTracks from "./ManageTracks";
import ManagePlaylists from "./ManagePlaylists";
import ManageCategories from "./ManageCategories";

export const AdminRoutes = (
  <>
    <Route index element={<Navigate to="users" replace />} />
    <Route path="users" element={<ManageUsers />} />
    <Route path="artists" element={<ManageArtists />} />
    <Route path="albums" element={<ManageAlbums />} />
    <Route path="tracks" element={<ManageTracks />} />
    <Route path="playlists" element={<ManagePlaylists />} />
    <Route path="categories" element={<ManageCategories />} />
    <Route path="genres" element={<ManageGenres />} />
    <Route path="roles" element={<ManageRoles />} />
  </>
);
