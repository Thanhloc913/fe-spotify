import {
  Button,
  Card,
  CardMedia,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import type { ApiSongType } from "../../types/api/song";
import { ControlledFileInput } from "./ControlledFileInput";
import ModalSection from "./ModalSection";
import { useMemo } from "react";

// Form fields for editing a song
export interface EditSongFormProps {
  title: string;
  background: File | null;
  removeBackground: boolean;
  duration: number;
  description: string;
}

interface EditSongModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditSongFormProps, song: ApiSongType) => void;
  song: ApiSongType;
}

export const EditSongModal: React.FC<EditSongModalProps> = ({
  open,
  onClose,
  onSubmit,
  song,
}) => {
  const { register, handleSubmit, watch, setValue, control } =
    useForm<EditSongFormProps>({
      values: {
        title: song.title,
        duration: song.duration,
        description: song.description,
        background: null,
        removeBackground: false,
      },
      defaultValues: {
        title: song.title,
        duration: song.duration,
        description: song.description,
        background: null,
        removeBackground: false,
      },
    });

  const selectedBackgroundFile = watch("background");
  const selectedBackground = useMemo(
    () =>
      selectedBackgroundFile != null
        ? URL.createObjectURL(selectedBackgroundFile)
        : null,
    [selectedBackgroundFile]
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Edit Song: <strong>{song.title}</strong>
      </DialogTitle>

      <form onSubmit={handleSubmit((data) => onSubmit(data, song))}>
        <DialogContent dividers>
          {/* Metadata Section */}
          <ModalSection title="Song Metadata">
            <TextField
              label="Song ID"
              value={song.id}
              fullWidth
              margin="normal"
              disabled
            />

            <TextField
              label="Artist ID"
              value={song.artistId}
              fullWidth
              margin="normal"
              disabled
            />

            <FormGroup row>
              <FormControl fullWidth sx={{ mr: 2, flex: 1 }}>
                <InputLabel>Song Type</InputLabel>
                <Select value={song.songType} label="Song Type" disabled>
                  <MenuItem value="SONG">Song (Audio) [SONG]</MenuItem>
                  <MenuItem value="MUSIC_VIDEO">
                    Music Video [MUSIC_VIDEO]
                  </MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Duration"
                type="number"
                {...register("duration", {
                  valueAsNumber: true,
                  required: "Duration is required",
                  min: { value: 1, message: "Duration must be at least 1ms" },
                })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">ms</InputAdornment>
                  ),
                }}
                sx={{ flex: 1 }}
              />
            </FormGroup>
          </ModalSection>

          {/* Content Section */}
          <ModalSection title="Song Content">
            <TextField
              label="Title"
              {...register("title", { required: "Title is required" })}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Description"
              {...register("description")}
              fullWidth
              margin="normal"
              multiline
              rows={3}
            />
          </ModalSection>

          {/* Media Section */}
          <ModalSection title="Media Files">
            {/* Song File Preview */}
            <Typography variant="subtitle2" gutterBottom>
              Current {song.songType === "SONG" ? "Audio" : "Video"}:
              {song.songUrl ? "Attached" : "None"}
            </Typography>

            {song.songUrl && (
              <Card sx={{ mb: 2 }}>
                <CardMedia
                  component={song.songType === "SONG" ? "audio" : "video"}
                  controls
                  src={song.songUrl}
                  sx={{
                    width: "100%",
                  }}
                />
              </Card>
            )}

            <Typography variant="subtitle2" gutterBottom>
              Current Background: {song.backgroundUrl ? "Attached" : "None"}
            </Typography>
            {song.backgroundUrl && (
              <img
                src={song.backgroundUrl}
                alt="Current background"
                style={{
                  maxWidth: "100%",
                  maxHeight: 200,
                  display: "block",
                  marginBottom: 16,
                }}
              />
            )}

            {/* Background File Upload and Preview */}
            <ControlledFileInput
              name="background"
              label="Upload New Background"
              // @ts-expect-error control type
              control={control}
              accept="image/*"
              clearIconButtonProps={{
                title: "Remove",
                "aria-label": "Remove file",
              }}
              fullWidth
            />

            {selectedBackgroundFile && (
              <Typography variant="subtitle2" sx={{ mt: 1 }} gutterBottom>
                Selected Background: {selectedBackgroundFile.name}
              </Typography>
            )}

            {selectedBackground && (
              <Card sx={{ mt: 2, mb: 2 }}>
                <CardMedia
                  component="img"
                  image={selectedBackground}
                  alt="New background preview"
                  sx={{ maxHeight: 300, objectFit: "contain" }}
                />
              </Card>
            )}

            <FormControlLabel
              control={
                <Checkbox
                  {...register("removeBackground")}
                  checked={watch("removeBackground")}
                  onChange={(e) =>
                    setValue("removeBackground", e.target.checked)
                  }
                  disabled={!song.backgroundUrl}
                />
              }
              label="Remove current background image"
              sx={{ mt: 1 }}
            />
          </ModalSection>

          {/* System Information Section */}
          <ModalSection title="System Information">
            <FormGroup row>
              <DateTimePicker
                label="Created At"
                value={dayjs(song.createdAt)}
                disabled
                sx={{ mr: 2, flex: 1 }}
              />
              <DateTimePicker
                label="Updated At"
                value={dayjs(song.updatedAt)}
                disabled
                sx={{ flex: 1 }}
              />
            </FormGroup>

            <DateTimePicker
              label="Deleted At"
              value={song.deletedAt ? dayjs(song.deletedAt) : null}
              disabled
            />

            <FormControlLabel
              control={<Checkbox checked={song.isActive} disabled />}
              label="Is Active"
              sx={{ mt: 1 }}
            />
          </ModalSection>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
