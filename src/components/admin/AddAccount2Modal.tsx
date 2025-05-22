import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getRoles } from "../../api/authApi";

export type AddAccount2FormProps = {
  roleId: string;
  username: string;
  email: string;
  password: string;
};

export type RoleOption = {
  id: string;
  name: string;
};

interface AddAccount2ModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddAccount2FormProps) => void;
}

export const AddAccount2Modal: FC<AddAccount2ModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddAccount2FormProps>();
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getRoles();
        setRoles(rolesData.result);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      } finally {
        setLoadingRoles(false);
      }
    };

    if (open) {
      fetchRoles();
    }
  }, [open]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Account</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <FormControl fullWidth margin="normal" error={!!errors.roleId}>
            <InputLabel id="role-select-label">Role *</InputLabel>
            <Select
              labelId="role-select-label"
              label="Role *"
              {...register("roleId", { required: "Role is required" })}
              defaultValue=""
              fullWidth
            >
              {loadingRoles ? (
                <MenuItem disabled>Loading roles...</MenuItem>
              ) : (
                roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {`${role.name} (${role.id})`}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Username *"
            fullWidth
            variant="outlined"
            {...register("username", { required: "Username is required" })}
            error={!!errors.username}
            helperText={errors.username?.message}
          />

          <TextField
            margin="dense"
            label="Email *"
            fullWidth
            variant="outlined"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email format",
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            margin="dense"
            label="Password *"
            fullWidth
            variant="outlined"
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Add Account
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
