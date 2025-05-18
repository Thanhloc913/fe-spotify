import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import React from "react";
import { useForm } from "react-hook-form";
import { ApiSongType } from "../../types/api";
import { DateTimePicker } from "@mui/x-date-pickers";
import ModalSection from "./ModalSection";
import { MuiFileInput } from "mui-file-input";

type Song = ApiSongType;

// Form fields for editing a song
export interface UpdateSongFormProps {
  title: string;
  background: File | null;
  duration: number;
  description: string;
}
interface EditSongModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateSongFormProps, song: Song) => void;
  song: Song;
}

export const EditSongModal: React.FC<EditSongModalProps> = ({
  open,
  onClose,
  onSubmit,
  song,
}) => {
  const { register, handleSubmit, watch, setValue } =
    useForm<UpdateSongFormProps>({
      values: {
        title: song.title,
        duration: song.duration,
        description: song.description,
        background: null,
      },
      defaultValues: {
        title: "",
        duration: 0,
        description: "",
        background: null,
      },
    });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Song: {song.title}</DialogTitle>
      <form onSubmit={handleSubmit((data) => onSubmit(data, song))}>
        <DialogContent dividers>
          {/* Read-only fields */}
          <TextField
            label="ID"
            value={song.id}
            fullWidth
            margin="normal"
            disabled
          />
          <TextField
            label="Song Type"
            value={song.songType}
            fullWidth
            margin="normal"
            disabled
          />
          <DateTimePicker
            label="Created At"
            value={dayjs(song.createdAt)}
            disabled
            slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
          />
          <DateTimePicker
            label="Updated At"
            value={dayjs(song.updatedAt)}
            disabled
            slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
          />
          <DateTimePicker
            label="Deleted At"
            value={song.deletedAt ? dayjs(song.deletedAt) : null}
            disabled
            slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
          />
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={song.isActive} disabled />}
              label="Is Active"
            />
          </FormGroup>

          {/* Editable fields */}
          <TextField
            label="Title"
            {...register("title", { required: "Title is required" })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Duration"
            type="number"
            {...register("duration", {
              valueAsNumber: true,
              required: "Duration is required",
              min: { value: 1, message: "Duration must be at least 1 second" },
            })}
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
            label="Description"
            {...register("description")}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
          <ModalSection title="Music or Video song file">
            <MuiFileInput
              value={watch("background")}
              onChange={(f) => setValue("background", f)}
            />
          </ModalSection>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Update Song
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
