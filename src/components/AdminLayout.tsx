import {
  Backdrop,
  Box,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  MdAlbum,
  MdCategory,
  MdLibraryMusic,
  MdMusicNote,
  MdPerson,
  MdPlaylistPlay,
  MdQueueMusic,
  MdSecurity,
} from "react-icons/md";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdminLoadingState } from "../store/paginationStore";

const links = [
  // { path: "accounts2", label: "Accounts2", icon: <MdPerson /> },
  { path: "songs2", label: "Songs2", icon: <MdQueueMusic /> },
  { path: "roles2", label: "Roles2", icon: <MdSecurity /> },
  { path: "genres2", label: "Genres2", icon: <MdMusicNote /> },
  { path: "albums2", label: "Albums2", icon: <MdPlaylistPlay /> },
  // { path: "users", label: "Users", icon: <MdPerson /> },
  // { path: "artists", label: "Artists", icon: <MdLibraryMusic /> },
  // { path: "albums", label: "Albums", icon: <MdAlbum /> },
  // { path: "tracks", label: "Tracks", icon: <MdQueueMusic /> },
  // { path: "playlists", label: "Playlists", icon: <MdPlaylistPlay /> },
  // { path: "genres", label: "Genres", icon: <MdMusicNote /> },
  // { path: "categories", label: "Categories", icon: <MdCategory /> },
  // { path: "roles", label: "Roles", icon: <MdSecurity /> },
  // ...Array.from({ length: 20 }, (_, index) => ({
  //   path: `playlists`,
  //   label: `Test Overflow ${index + 1}`,
  //   icon: <MdCategory />,
  // })), // Add 20 test links dynamically
];

const AdminLayout = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Determine the active tab index based on the current pathname
    const activeIndex = links.findIndex(
      (link) => link.path === location.pathname.split("/")[2]
    );
    setSelectedTab(activeIndex !== -1 ? activeIndex : 0);
  }, [location]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    navigate(`/admin/${links[newValue].path}`);
  };

  const { count } = useAdminLoadingState();
  const isLoading = count > 0;

  return (
    <>
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
            {links.map(({ label, icon }, index) => (
              <Tab key={index} label={label} icon={icon} iconPosition="start" />
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
      {/** Show loading backdrop when count > 0 */}
      {isLoading && (
        <Backdrop
          sx={{ zIndex: (theme) => theme.zIndex.modal + 1, color: "#fff" }}
          open
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <CircularProgress size="10rem" sx={{ height: "80%" }} />
            <Typography variant="h4">{`${count} job${
              count > 1 ? "s" : ""
            } remaining...`}</Typography>
          </Box>
        </Backdrop>
      )}
    </>
  );
};

export default AdminLayout;
