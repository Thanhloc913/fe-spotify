import { Dialog, DialogTitle, TextField, Button, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { ApiRoleType } from "../../types/api";

type Role2 = ApiRoleType;

export interface EditRole2FormProps {
  name: string;
  description: string;
}

interface EditRole2ModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditRole2FormProps, role2: Role2) => void;
  role2: Role2;
}

export const EditRole2Modal: React.FC<EditRole2ModalProps> = ({
  open,
  onClose,
  onSubmit,
  role2,
}) => {
  const { register, handleSubmit } = useForm<EditRole2FormProps>({
    defaultValues: {
      name: "",
      description: "",
    },
    values: {
      name: role2.name,
      description: role2.description,
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editing Role2 {role2.id}</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit((data) => onSubmit(data, role2))}
        p={2}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Edit Role2
          </Button>
        </Box>
        <TextField
          label="ID"
          value={role2.id}
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
