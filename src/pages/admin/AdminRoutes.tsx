import { Navigate, Route } from "react-router-dom";
import ManageAccounts from "./ManageAccounts";
import ManageAlbums from "./ManageAlbums";
import ManageAlbums2 from "./ManageAlbums2";
import ManageArtists from "./ManageArtists";
import ManageCategories from "./ManageCategories";
import ManageGenres from "./ManageGenres";
import ManageGenres2 from "./ManageGenres2";
import ManagePlaylists from "./ManagePlaylists";
import ManageRoles from "./ManageRoles";
import ManageRoles2 from "./ManageRoles2";
import ManageSongs from "./ManageSongs";
import ManageTracks from "./ManageTracks";
import ManageUsers from "./ManageUsers";

export const AdminRoutes = (
  <>
    <Route index element={<Navigate to="accounts2" replace />} />
    <Route path="accounts2" element={<ManageAccounts />} />
    <Route path="songs2" element={<ManageSongs />} />
    <Route path="roles2" element={<ManageRoles2 />} />
    <Route path="genres2" element={<ManageGenres2 />} />
    <Route path="albums2" element={<ManageAlbums2 />} />
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
