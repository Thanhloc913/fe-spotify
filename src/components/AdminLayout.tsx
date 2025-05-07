import { Outlet, Link } from "react-router-dom";
import { Tabs, Tab, Box, Stack } from "@mui/material";
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
  ...Array.from({ length: 20 }, (_, index) => ({
    path: `test-${index + 1}`,
    label: `Test Overflow ${index + 1}`,
    icon: <MdCategory />,
  })), // Add 20 test links dynamically
];

const AdminLayout = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Stack direction="row" className="w-full h-full">
      <Box
        sx={{
          borderRight: 1,
          borderColor: "divider",
          // no grow no shrink
          flex: "0 0 auto",
          height: "100%",
          // Enable vertical scrolling
          overflowY: "auto",
        }}
      >
        <Tabs
          orientation="vertical"
          value={selectedTab}
          onChange={handleTabChange}
          aria-label="Admin Navigation Tabs"
        >
          {links.map(({ path, label, icon }, index) => (
            <Tab
              key={index}
              label={
                <Stack direction={"row"} gap={1}>
                  {icon}
                  {label}
                </Stack>
              }
              component={Link}
              to={`/admin/${path}`}
            />
          ))}
        </Tabs>
      </Box>
      {/* can grow and shrink */}
      <div
        style={{ padding: "20px", flex: "1 1" }}
        className="h-full overflow-x-auto"
      >
        <Outlet />
      </div>
    </Stack>
  );
};

export default AdminLayout;
