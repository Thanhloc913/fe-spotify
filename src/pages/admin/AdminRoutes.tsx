import { Route, Navigate } from "react-router-dom";
import ManageGenres from "./ManageGenres";
import ManageRoles from "./ManageRoles";
import ManageUsers from "./ManageUsers";

export const AdminRoutes = (
  <>
    <Route index element={<Navigate to="users" replace />} />
    <Route path="users" element={<ManageUsers />} />
    <Route path="artists" element={<div>(Coming Soon)</div>} />
    <Route path="albums" element={<div>(Coming Soon)</div>} />
    <Route path="tracks" element={<div>(Coming Soon)</div>} />
    <Route path="playlists" element={<div>(Coming Soon)</div>} />
    <Route path="categories" element={<div>(Coming Soon)</div>} />
    <Route path="genres" element={<ManageGenres />} />
    <Route path="roles" element={<ManageRoles />} />
  </>
);
