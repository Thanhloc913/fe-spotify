import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";

// chi can nhap thong tin toi thieu, add xong mo modal edit cung dc
interface AddUserFormProps {
  name: string;
  email: string;
}

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddUserFormProps) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { register, handleSubmit } = useForm<AddUserFormProps>({
    defaultValues: {
      name: "",
      email: "",
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New User</DialogTitle>
      <Box p={2}>
        <Typography variant="subtitle1">Enter User Details</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={onClose} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Add User
            </Button>
          </Box>
          <TextField
            label="Name"
            {...register("name")}
            fullWidth
            margin="dense"
            required
          />
          <TextField
            label="Email"
            {...register("email")}
            fullWidth
            margin="dense"
            required
          />
        </form>
      </Box>
    </Dialog>
  );
};

export default AddUserModal;
