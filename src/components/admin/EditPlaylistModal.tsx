import {
  Dialog,
  DialogTitle,
  TextField,
  Button,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Playlist } from "../../types";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import ModalSection from "./ModalSection";
import TextFieldArray from "./TextFieldArray";

interface EditPlaylistFormProps {
  name: string;
  description: string;
  coverUrl: string;
  isPublic: boolean;
  isCollaborative: boolean;
  tracks: string[];
  followers: number;
}

interface EditPlaylistModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditPlaylistFormProps, playlist: Playlist) => void;
  playlist: Playlist;
}

export const EditPlaylistModal: React.FC<EditPlaylistModalProps> = ({
  open,
  onClose,
  onSubmit,
  playlist,
}) => {
  const { register, handleSubmit, control, watch } =
    useForm<EditPlaylistFormProps>({
      defaultValues: {
        name: "",
        description: "",
        coverUrl: "",
        isPublic: false,
        isCollaborative: false,
        tracks: [],
        followers: 0,
      },
      values: {
        name: playlist.name,
        description: playlist.description,
        coverUrl: playlist.coverUrl,
        isPublic: playlist.isPublic,
        isCollaborative: playlist.isCollaborative,
        tracks: playlist.tracks,
        followers: playlist.followers,
      },
    });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Playlist: {playlist.name}</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit((data) => onSubmit(data, playlist))}
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
          value={playlist.id}
          fullWidth
          margin="normal"
          disabled
        />

        <TextField
          label="Owner ID"
          value={playlist.ownerId}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Owner Name"
          value={playlist.ownerName}
          fullWidth
          margin="normal"
        />

        {playlist.createdAt && (
          <DateTimePicker
            label="Created At"
            value={dayjs(playlist.createdAt)}
            disabled
            sx={{ mt: 2, width: "100%" }}
          />
        )}

        {/* Basic Info Section */}
        <ModalSection title="Basic Information">
          <TextField
            label="Name"
            {...register("name", { required: true })}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Description"
            {...register("description")}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />

          <TextField
            label="Cover URL"
            {...register("coverUrl")}
            fullWidth
            margin="normal"
          />
        </ModalSection>

        {/* Settings Section */}
        <ModalSection title="Settings">
          <FormGroup>
            <FormControlLabel
              label="Is Public Playlist"
              control={
                <Controller
                  name="isPublic"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              }
            />
          </FormGroup>
          <FormGroup>
            <FormControlLabel
              label="Collaborative"
              control={
                <Controller
                  name="isCollaborative"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              }
            />
          </FormGroup>
        </ModalSection>

        {/* Statistics Section */}
        <ModalSection title="Statistics">
          <TextField
            label="Followers"
            type="number"
            {...register("followers", { valueAsNumber: true })}
            fullWidth
            margin="normal"
            slotProps={{
              htmlInput: { min: 0 },
            }}
          />

          <TextField
            label="Total Tracks"
            value={watch("tracks").length}
            fullWidth
            margin="normal"
            disabled
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
