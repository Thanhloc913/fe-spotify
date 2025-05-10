import { Dialog, DialogTitle, TextField, Button, Box } from "@mui/material";
import { useForm } from "react-hook-form";

interface AddRoleFormProps {
  name: string;
  description: string;
}

interface AddRoleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddRoleFormProps) => void;
}

export const AddRoleModal: React.FC<AddRoleModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { register, handleSubmit, reset } = useForm<AddRoleFormProps>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleFormSubmit = (data: AddRoleFormProps) => {
    onSubmit(data);
    reset(); // Reset form after submission
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Role</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} p={2}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Add Role
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
