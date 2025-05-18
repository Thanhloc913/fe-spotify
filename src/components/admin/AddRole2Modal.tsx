import { Dialog, DialogTitle, TextField, Button, Box } from "@mui/material";
import { useForm } from "react-hook-form";

export interface AddRole2FormProps {
  name: string;
  description: string;
}

interface AddRole2ModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddRole2FormProps) => void;
}

export const AddRole2Modal: React.FC<AddRole2ModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { register, handleSubmit } = useForm<AddRole2FormProps>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleFormSubmit = (data: AddRole2FormProps) => {
    onSubmit(data); // Reset form after submission
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Role2</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} p={2}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Add Role2
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
