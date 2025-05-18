import {
  Dialog,
  DialogTitle,
  Typography,
  TextField,
  Button,
  Backdrop,
  CircularProgress,
  Box,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";

// Define the form data interface
interface AddSongFormProps {
  title: string;
  description: string;
  artistId: string;
  duration: number;
  songType: string;
  songUrl: string;
  backgroundUrl: string;
}

// Define the modal props
interface AddSongModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddSongFormProps) => void;
}

// Helper function to get CSRF token from cookies
function getCSRFToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Helper function to get authorization token from localStorage
function getAuthToken() {
    return localStorage.getItem('access_token');
}
const BASE_URL = "http://localhost:8083";

// File upload function
async function testUploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const headers = {
    "X-CSRFToken": getCSRFToken(),
    Authorization: `Bearer ${getAuthToken()}`,
  };

  try {
    const response = await fetch(`${BASE_URL}/storage/upload`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

const AddSongModal: React.FC<AddSongModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<AddSongFormProps>({
    defaultValues: {
      title: "",
      description: "",
      artistId: "",
      duration: 0,
      songType: "",
      songUrl: "",
      backgroundUrl: "",
    },
  });

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "songUrl" | "backgroundUrl"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const result = await testUploadFile(file, file.type, file.name);
    setUploading(false);

    if (result?.fileUrl) {
      setValue(field, result.fileUrl);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Song</DialogTitle>
        <Box p={2}>
          <Typography variant="subtitle1">Enter Song Details</Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Title"
              {...register("title")}
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Description"
              {...register("description")}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Artist ID"
              {...register("artistId")}
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Duration (seconds)"
              type="number"
              {...register("duration", { valueAsNumber: true })}
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Song Type"
              {...register("songType")}
              fullWidth
              margin="dense"
              required
            />
            <Box mt={2}>
              <input
                accept="audio/*"
                style={{ display: "none" }}
                id="upload-song"
                type="file"
                onChange={(e) => handleFileUpload(e, "songUrl")}
              />
              <label htmlFor="upload-song">
                <Button variant="contained" component="span">
                  Upload Song
                </Button>
              </label>
            </Box>
            <Box mt={2}>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="upload-background"
                type="file"
                onChange={(e) => handleFileUpload(e, "backgroundUrl")}
              />
              <label htmlFor="upload-background">
                <Button variant="contained" component="span">
                  Upload Background
                </Button>
              </label>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button onClick={onClose} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Add Song
              </Button>
            </Box>
          </form>
        </Box>
      </Dialog>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
        open={uploading}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Uploading...
        </Typography>
      </Backdrop>
    </>
  );
};

export default AddSongModal;
