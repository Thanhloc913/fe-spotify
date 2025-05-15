import { Dialog, DialogTitle, TextField, Button, Box } from "@mui/material";
import { useForm } from "react-hook-form";

interface AddArtistFormProps {
  name: string;
  accountID: string;
}

interface AddArtistModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddArtistFormProps) => void;
}

export const AddArtistModal: React.FC<AddArtistModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { register, handleSubmit } = useForm<AddArtistFormProps>({
    defaultValues: {
      name: "",
      accountID: "",
    },
  });

  const handleFormSubmit = (data: AddArtistFormProps) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Artist</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} p={2}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Add Artist
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
          label="Account ID"
          {...register("accountID", { required: true })}
          fullWidth
          margin="normal"
          required
        />
      </Box>
    </Dialog>
  );
};
