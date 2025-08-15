import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { EditSongModal, EditSongFormProps } from "./admin/EditSongModal";
import type { ApiSongType, ApiSongUpdateRequest } from "../types/api/song";
import { createStorageData, uploadFile } from "../api/storageApi";
import { updateSong } from "../api/musicApi";
import { getArtist } from "../api/artistApi";
import { deleteSong } from "../api/songApi";

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

interface Artist {
  id: string;
  name: string;
  songs: ApiSongType[];
}

export const ArtistDetail = () => {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingSong, setEditingSong] = useState<ApiSongType | null>(null);

  useEffect(() => {
    fetchArtistData();
  }, []);

  const fetchArtistData = async () => {
    try {
      const profileId = localStorage.getItem("profile_id");
      if (!profileId) return;

      const response = await getArtist(profileId);
      if (response) {
        setArtist(response);
        setIsOwner(response.id === profileId);
      }
    } catch (error) {
      console.error("Error fetching artist data:", error);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    try {
      const response = await deleteSong(songId);
      if (response.success) {
        // Refresh artist data after successful deletion
        fetchArtistData();
      } else {
        console.error("Error deleting song:", response.message);
      }
    } catch (error) {
      console.error("Error deleting song:", error);
    }
  };

  const handleEditSong = (song: ApiSongType) => {
    setEditingSong(song);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditingSong(null);
  };

  const handleEditSubmit = async (
    data: EditSongFormProps,
    song: ApiSongType
  ) => {
    try {
      const actorId = localStorage.getItem("profile_id");
      if (!actorId) {
        throw new Error("Artist or User ID not found!");
      }

      // Prepare update payload
      const updatePayload: ApiSongUpdateRequest = {
        id: song.id,
        title: data.title || song.title,
        duration: data.duration || song.duration,
        storageImageId: "",
        description: data.description || song.description,
        songType: song.songType,
        removeImage: data.removeBackground,
      };

      // Handle background image update if provided
      if (data.background) {
        const uploadResult = await uploadFile(data.background);
        if (!uploadResult.success || !uploadResult.data) {
          throw new Error(uploadResult.message || "Background upload failed");
        }

        const storageResult = await createStorageData({
          fileName: uploadResult.data.fileName,
          fileType: uploadResult.data.fileType,
          userId: actorId,
          fileUrl: uploadResult.data.fileUrl,
          fileSize: uploadResult.data.fileSize,
          description: `Background image for ${data.title}`,
        });

        if (!storageResult.success || !storageResult.data) {
          throw new Error("Failed to create storage entry for background");
        }

        updatePayload.storageImageId = storageResult.data.id;
      } else if (data.removeBackground) {
        updatePayload.storageImageId = "";
      }

      // Execute the update
      const updatedSong = await updateSong(updatePayload);
      if (!updatedSong) {
        throw new Error("Song update failed");
      }

      // Refresh the artist data
      fetchArtistData();
      handleCloseEditModal();
    } catch (error) {
      console.error("Error updating song:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {artist?.songs?.map((song: ApiSongType, index: number) => (
              <TableRow key={song.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{song.title}</TableCell>
                <TableCell>{formatDuration(song.duration)}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEditSong(song)}
                    disabled={!isOwner}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteSong(song.id)}
                    disabled={!isOwner}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {editingSong && (
        <EditSongModal
          open={openEditModal}
          onClose={handleCloseEditModal}
          onSubmit={handleEditSubmit}
          song={editingSong}
        />
      )}
    </div>
  );
};
