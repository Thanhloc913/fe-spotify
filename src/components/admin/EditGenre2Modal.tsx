import {
  Dialog,
  DialogTitle,
  TextField,
  Button,
  Box,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { ApiGenreType } from "../../types/api";

type Genre2 = ApiGenreType;

export interface EditGenre2FormProps {
  name: string;
  description: string;
}

interface EditGenre2ModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditGenre2FormProps, genre2: Genre2) => void;
  genre2: Genre2;
}

export const EditGenre2Modal: React.FC<EditGenre2ModalProps> = ({
  open,
  onClose,
  onSubmit,
  genre2,
}) => {
  const { register, handleSubmit } = useForm<EditGenre2FormProps>({
    defaultValues: {
      name: "",
      description: "",
    },
    values: {
      name: genre2.name,
      description: genre2.description,
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editing Genre2 {genre2.id}</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit((data) => onSubmit(data, genre2))}
        p={2}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Edit Genre2
          </Button>
        </Box>
        <TextField
          label="ID"
          value={genre2.id}
          fullWidth
          margin="normal"
          disabled
        />
        <DateTimePicker
          label="Created At"
          value={dayjs(genre2.createdAt)}
          disabled
          slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
        />
        <DateTimePicker
          label="Updated At"
          value={dayjs(genre2.updatedAt)}
          disabled
          slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
        />
        <DateTimePicker
          label="Deleted At"
          value={genre2.deletedAt ? dayjs(genre2.deletedAt) : null}
          disabled
          slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
        />
        <FormGroup sx={{ mt: 2 }}>
          <FormControlLabel
            label="Is Active"
            control={<Checkbox checked={genre2.isActive} disabled />}
          />
        </FormGroup>
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
