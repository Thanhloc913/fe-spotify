import { Outlet, Link } from "react-router-dom";
import { Tabs, Tab, Box } from "@mui/material";
import {
  MdPerson,
  MdLibraryMusic,
  MdAlbum,
  MdQueueMusic,
  MdPlaylistPlay,
  MdCategory,
} from "react-icons/md";
import { useState } from "react";

const links = [
  { path: "users", label: "Users", icon: <MdPerson /> },
  { path: "artists", label: "Artists", icon: <MdLibraryMusic /> },
  { path: "albums", label: "Albums", icon: <MdAlbum /> },
  { path: "tracks", label: "Tracks", icon: <MdQueueMusic /> },
  { path: "playlists", label: "Playlists", icon: <MdPlaylistPlay /> },
  { path: "categories", label: "Categories", icon: <MdCategory /> },
];

const AdminLayout = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <div style={{ display: "flex" }}>
      <Box sx={{ borderRight: 1, borderColor: "divider", width: "200px" }}>
        <Tabs
          orientation="vertical"
          value={selectedTab}
          onChange={handleTabChange}
          aria-label="Admin Navigation Tabs"
        >
          {links.map(({ path, label, icon }) => (
            <Tab
              key={path}
              label={
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {icon}
                  {label}
                </div>
              }
              component={Link}
              to={`/admin/${path}`}
            />
          ))}
        </Tabs>
      </Box>
      <div style={{ padding: "20px", flexGrow: 1 }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
