import { Dialog, DialogTitle, TextField, Button, Box } from "@mui/material";
import { useForm } from "react-hook-form";

export interface AddGenre2FormProps {
  name: string;
  description: string;
}

interface AddGenre2ModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddGenre2FormProps) => void;
}

export const AddGenre2Modal: React.FC<AddGenre2ModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { register, handleSubmit } = useForm<AddGenre2FormProps>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleFormSubmit = (data: AddGenre2FormProps) => {
    onSubmit(data); // Reset form after submission
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Genre2</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} p={2}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Add Genre2
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
