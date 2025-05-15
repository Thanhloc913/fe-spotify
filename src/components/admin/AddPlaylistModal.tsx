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

interface AddPlaylistFormProps {
  name: string;
  isPublic: boolean;
}

interface AddPlaylistModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddPlaylistFormProps) => void;
}

export const AddPlaylistModal: React.FC<AddPlaylistModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { register, handleSubmit, reset, control } =
    useForm<AddPlaylistFormProps>({
      defaultValues: {
        name: "",
        isPublic: true,
      },
    });

  const handleFormSubmit = (data: AddPlaylistFormProps) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Playlist</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} p={2}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Add Playlist
          </Button>
        </Box>

        <TextField
          label="Name"
          {...register("name", { required: true })}
          fullWidth
          margin="normal"
          required
        />

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
      </Box>
    </Dialog>
  );
};
