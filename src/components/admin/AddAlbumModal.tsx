import {
  Dialog,
  DialogTitle,
  TextField,
  Button,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useForm } from "react-hook-form";

interface AddAlbumFormProps {
  title: string;
  artistId: string;
  type: "album" | "single" | "EP";
}

interface AddAlbumModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddAlbumFormProps) => void;
}

export const AddAlbumModal: React.FC<AddAlbumModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { register, handleSubmit } = useForm<AddAlbumFormProps>({
    defaultValues: {
      title: "",
      artistId: "",
      type: "album",
    },
  });

  const handleFormSubmit = (data: AddAlbumFormProps) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Album</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} p={2}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Add Album
          </Button>
        </Box>

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

        <FormControl fullWidth margin="normal">
          <InputLabel id="album-type-label">Type *</InputLabel>
          <Select
            labelId="album-type-label"
            label="Type *"
            {...register("type", { required: true })}
            defaultValue="album"
          >
            <MenuItem value="album">Album</MenuItem>
            <MenuItem value="single">Single</MenuItem>
            <MenuItem value="EP">EP</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Dialog>
  );
};
