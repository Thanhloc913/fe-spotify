import {
  Dialog,
  DialogTitle,
  Typography,
  TextField,
  Button,
  Box,
  InputAdornment,
} from "@mui/material";
import { useForm } from "react-hook-form";
import TextFieldArray from "./TextFieldArray";
import { ControlledFileInput } from "./ControlledFileInput";

// Define the form data interface
export interface AddSongFormProps {
  title: string;
  description: string;
  artistId: string;
  albumIds: string[];
  duration: number;
  song: File | null;
  background: File | null;
}

// Define the modal props
interface AddSongModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddSongFormProps) => void;
}

export const AddSongModal: React.FC<AddSongModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { control, register, handleSubmit } = useForm<AddSongFormProps>({
    defaultValues: {
      title: "",
      description: "",
      artistId: "",
      albumIds: [],
      duration: 0,
      song: null,
      background: null,
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Song</DialogTitle>
      <Box p={2}>
        <Typography variant="subtitle1">Enter Song Details</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={onClose} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Add Song
            </Button>
          </Box>
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
            label="Duration"
            type="number"
            {...register("duration", { valueAsNumber: true })}
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
          <ControlledFileInput
            title="Music or Video song file"
            name="song"
            accept="audio/*, video/*"
            required
            control={control}
          />
          <ControlledFileInput
            title="Background image file"
            name="background"
            accept="image/*"
            required
            control={control}
          />
          <TextFieldArray
            control={control}
            name="albumIds"
            label="Albums"
            register={register}
          />
        </form>
      </Box>
    </Dialog>
  );
};

export default AddSongModal;
