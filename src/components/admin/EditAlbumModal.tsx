import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { Album } from "../../types";
import ModalSection from "./ModalSection";
import TextFieldArray from "./TextFieldArray";

interface EditAlbumFormProps {
  title: string;
  artistId: string;
  artistName: string;
  coverUrl: string;
  releaseDate: string;
  tracks: string[];
  type: "album" | "single" | "EP";
  totalTracks: number;
  durationMs: number;
}

interface EditAlbumModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditAlbumFormProps, album: Album) => void;
  album: Album;
}

export const EditAlbumModal: React.FC<EditAlbumModalProps> = ({
  open,
  onClose,
  onSubmit,
  album,
}) => {
  const { register, handleSubmit, control, setValue, watch } =
    useForm<EditAlbumFormProps>({
      defaultValues: {
        title: "",
        artistId: "",
        artistName: "",
        coverUrl: "",
        releaseDate: "",
        tracks: [],
        type: "album",
        totalTracks: 0,
        durationMs: 0,
      },
      values: {
        title: album.title,
        artistId: album.artistId,
        artistName: album.artistName,
        coverUrl: album.coverUrl,
        releaseDate: album.releaseDate,
        tracks: album.tracks,
        type: album.type,
        totalTracks: album.totalTracks,
        durationMs: album.durationMs,
      },
    });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Album: {album.title}</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit((data) => onSubmit(data, album))}
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
          value={album.id}
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
            {...register("artistId", { required: true })}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Artist Name"
            {...register("artistName")}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Cover URL"
            {...register("coverUrl")}
            fullWidth
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="album-type-label">Type *</InputLabel>
            <Select
              labelId="album-type-label"
              label="Type *"
              {...register("type", { required: true })}
              defaultValue={album.type}
            >
              <MenuItem value="album">Album</MenuItem>
              <MenuItem value="single">Single</MenuItem>
              <MenuItem value="EP">EP</MenuItem>
            </Select>
          </FormControl>
        </ModalSection>

        {/* Release Details Section */}
        <ModalSection title="Release Details">
          <DatePicker
            label="Release Date"
            value={watch("releaseDate") ? dayjs(watch("releaseDate")) : null}
            onChange={(date) =>
              setValue("releaseDate", date?.toISOString() ?? "")
            }
            sx={{ mt: 2, width: "100%" }}
          />

          <TextField
            label="Total Tracks"
            type="number"
            {...register("totalTracks", { valueAsNumber: true })}
            fullWidth
            margin="normal"
            slotProps={{ htmlInput: { min: 0 } }}
          />

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
        </ModalSection>

        {/* Tracks Section */}
        <ModalSection title="Tracks">
          <TextFieldArray
            name="tracks"
            label="Track"
            control={control}
            register={register}
          />
        </ModalSection>
      </Box>
    </Dialog>
  );
};
