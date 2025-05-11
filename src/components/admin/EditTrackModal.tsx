import {
  Dialog,
  DialogTitle,
  TextField,
  Button,
  Box,
  InputAdornment,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { Track } from "../../types";
import ModalSection from "./ModalSection";

interface EditTrackFormProps {
  title: string;
  artistId: string;
  artistName: string;
  albumId: string;
  albumName: string;
  coverUrl: string;
  previewUrl: string;
  durationMs: number;
  explicit: boolean;
  popularity: number;
  trackNumber: number;
  isPlayable: boolean;
  videoUrl: string | null;
}

interface EditTrackModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditTrackFormProps, track: Track) => void;
  track: Track;
}

export const EditTrackModal: React.FC<EditTrackModalProps> = ({
  open,
  onClose,
  onSubmit,
  track,
}) => {
  const { register, handleSubmit } = useForm<EditTrackFormProps>({
    defaultValues: {
      title: "",
      artistId: "",
      artistName: "",
      albumId: "",
      albumName: "",
      coverUrl: "",
      previewUrl: "",
      durationMs: 0,
      explicit: false,
      popularity: 0,
      trackNumber: 1,
      isPlayable: true,
      videoUrl: null,
    },
    values: {
      title: track.title,
      artistId: track.artistId,
      artistName: track.artistName,
      albumId: track.albumId,
      albumName: track.albumName,
      coverUrl: track.coverUrl,
      previewUrl: track.previewUrl,
      durationMs: track.durationMs,
      explicit: track.explicit,
      popularity: track.popularity,
      trackNumber: track.trackNumber,
      isPlayable: track.isPlayable,
      videoUrl: track.videoUrl,
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Track: {track.title}</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit((data) => onSubmit(data, track))}
        p={2}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save Changes
          </Button>
        </Box>

        {/* Read-only fields */}
        <TextField
          label="ID"
          value={track.id}
          fullWidth
          margin="normal"
          disabled
        />

        {/* Basic Info Section */}
        <ModalSection title="Basic Information">
          <TextField
            label="Title"
            {...register("title", { required: true })}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Artist ID"
            {...register("artistId")}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Artist Name"
            {...register("artistName")}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Album ID"
            {...register("albumId")}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Album Name"
            {...register("albumName")}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Cover URL"
            {...register("coverUrl")}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Preview URL"
            {...register("previewUrl")}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Video URL"
            {...register("videoUrl")}
            fullWidth
            margin="normal"
          />
        </ModalSection>

        {/* Track Details Section */}
        <ModalSection title="Track Details">
          <TextField
            label="Duration"
            type="number"
            {...register("durationMs", { valueAsNumber: true })}
            fullWidth
            margin="normal"
            slotProps={{
              htmlInput: { min: 0 },
              input: {
                endAdornment: (
                  <InputAdornment position="end">ms</InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Popularity"
            type="number"
            {...register("popularity", { valueAsNumber: true })}
            fullWidth
            margin="normal"
            slotProps={{
              htmlInput: { min: 0 },
            }}
          />

          <TextField
            label="Track Number"
            type="number"
            {...register("trackNumber", { valueAsNumber: true })}
            fullWidth
            margin="normal"
            slotProps={{
              htmlInput: { min: -1 },
            }}
          />

          <FormGroup>
            <FormControlLabel
              control={<Checkbox {...register("explicit")} />}
              label="Explicit"
            />
          </FormGroup>

          <FormGroup>
            <FormControlLabel
              control={<Checkbox {...register("isPlayable")} />}
              label="Is Playable"
            />
          </FormGroup>
        </ModalSection>
      </Box>
    </Dialog>
  );
};
