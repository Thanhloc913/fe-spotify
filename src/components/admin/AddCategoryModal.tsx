import { Dialog, DialogTitle, TextField, Button, Box } from "@mui/material";
import { useForm } from "react-hook-form";

interface AddCategoryFormProps {
  name: string;
  imageUrl: string;
  description: string;
}

interface AddCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddCategoryFormProps) => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { register, handleSubmit } = useForm<AddCategoryFormProps>({
    defaultValues: {
      name: "",
      imageUrl: "",
      description: "",
    },
  });

  const handleFormSubmit = (data: AddCategoryFormProps) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Category</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} p={2}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Add Category
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
          label="Image URL"
          {...register("imageUrl")}
          fullWidth
          margin="normal"
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
