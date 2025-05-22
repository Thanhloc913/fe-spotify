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
  Checkbox,
  FormControlLabel,
  FormHelperText,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getRoles } from "../../api/authApi";
import { ApiAccountType } from "../../types/api";
import dayjs from "dayjs";
import { DateTimePicker } from "@mui/x-date-pickers";
import { RoleOption } from "./AddAccount2Modal";

export type EditAccount2FormProps = {
  roleId?: string;
  username?: string;
  email?: string;
  password?: string;
};

interface EditAccount2ModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditAccount2FormProps, account: ApiAccountType) => void;
  account2: ApiAccountType & { roleName?: string | null };
}

export const EditAccount2Modal: FC<EditAccount2ModalProps> = ({
  open,
  onClose,
  onSubmit,
  account2,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditAccount2FormProps>();

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
      // Reset form with current account values when opening
      reset({
        roleId: account2.roleId,
        username: account2.username,
        email: account2.email,
      });
    }
  }, [open, account2, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Account {account2.username}</DialogTitle>
      <form onSubmit={handleSubmit((data) => onSubmit(data, account2))}>
        <DialogContent>
          <TextField
            label="ID"
            value={account2.id}
            fullWidth
            margin="normal"
            variant="outlined"
            disabled
          />

          <DateTimePicker
            label="Created At"
            value={dayjs(account2.createdAt)}
            disabled
            slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
          />

          <DateTimePicker
            label="Updated At"
            value={dayjs(account2.updatedAt)}
            disabled
            slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
          />

          <DateTimePicker
            label="Deleted At"
            value={account2.deletedAt ? dayjs(account2.deletedAt) : null}
            disabled
            slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
          />

          <FormControlLabel
            control={<Checkbox checked={account2.isActive} disabled />}
            label="Is Active"
            sx={{ mt: 1, mb: 1 }}
          />

          <FormControl fullWidth margin="normal" error={!!errors.roleId}>
            <InputLabel id="edit-role-select-label">Role *</InputLabel>
            <Select
              labelId="edit-role-select-label"
              label="Role *"
              {...register("roleId", { required: "Role is required" })}
              defaultValue={account2.roleId}
              fullWidth
            >
              {loadingRoles ? (
                <MenuItem disabled>Loading roles...</MenuItem>
              ) : (
                roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))
              )}
            </Select>
            {errors.roleId && (
              <FormHelperText>{errors.roleId.message}</FormHelperText>
            )}
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
            label="Password (leave blank to keep unchanged)"
            fullWidth
            variant="outlined"
            type="password"
            {...register("password", {
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
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
