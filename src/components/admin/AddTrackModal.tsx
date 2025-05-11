import { Dialog, DialogTitle, TextField, Button, Box } from "@mui/material";
import { useForm } from "react-hook-form";

interface AddTrackFormProps {
  title: string;
}

interface AddTrackModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddTrackFormProps) => void;
}

export const AddTrackModal: React.FC<AddTrackModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { register, handleSubmit, reset } = useForm<AddTrackFormProps>({
    defaultValues: {
      title: "",
    },
  });

  const handleFormSubmit = (data: AddTrackFormProps) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Track</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} p={2}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Add Track
          </Button>
        </Box>

        <TextField
          label="Title"
          {...register("title", { required: true })}
          fullWidth
          margin="normal"
          required
        />
      </Box>
    </Dialog>
  );
};
