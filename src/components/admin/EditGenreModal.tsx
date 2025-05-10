import { Dialog, DialogTitle, TextField, Button, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { Genre } from "../../types";

interface EditGenreFormProps {
  name: string;
  description: string;
}

interface EditGenreModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditGenreFormProps, genre: Genre) => void;
  genre: Genre;
}

export const EditGenreModal: React.FC<EditGenreModalProps> = ({
  open,
  onClose,
  onSubmit,
  genre,
}) => {
  const { register, handleSubmit } = useForm<EditGenreFormProps>({
    defaultValues: {
      name: genre.name,
      description: genre.description,
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editing Genre {genre.id}</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit((data) => onSubmit(data, genre))}
        p={2}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Edit Genre
          </Button>
        </Box>
        <TextField
          label="ID"
          value={genre.id}
          fullWidth
          margin="normal"
          disabled
        />
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
          rows={4}
        />
      </Box>
    </Dialog>
  );
};
