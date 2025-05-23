import { Dialog, DialogTitle, TextField, Button, Box } from "@mui/material";
import { useForm } from "react-hook-form";

interface AddGenreFormProps {
  name: string;
  description: string;
}

interface AddGenreModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddGenreFormProps) => void;
}

export const AddGenreModal: React.FC<AddGenreModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { register, handleSubmit } = useForm<AddGenreFormProps>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleFormSubmit = (data: AddGenreFormProps) => {
    onSubmit(data); // Reset form after submission
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Genre</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} p={2}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Add Genre
          </Button>
        </Box>
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
      </Box>
    </Dialog>
  );
};
