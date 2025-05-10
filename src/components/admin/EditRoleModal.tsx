import { Dialog, DialogTitle, TextField, Button, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { Role } from "../../types";

interface EditRoleFormProps {
  name: string;
  description: string;
}

interface EditRoleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditRoleFormProps, role: Role) => void;
  role: Role;
}

export const EditRoleModal: React.FC<EditRoleModalProps> = ({
  open,
  onClose,
  onSubmit,
  role,
}) => {
  const { register, handleSubmit } = useForm<EditRoleFormProps>({
    defaultValues: {
      name: role.name,
      description: role.description,
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editing Role {role.id}</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit((data) => onSubmit(data, role))}
        p={2}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Edit Role
          </Button>
        </Box>
        <TextField
          label="ID"
          value={role.id}
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
