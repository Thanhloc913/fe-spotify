import { Dialog, DialogTitle, Typography, Button, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import TextFieldArray from "./TextFieldArray";

// Define the form data interface
export interface AddAlbumSongFormProps {
  songIds: string[];
}

// Define the modal props
interface AddAlbumSongModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddAlbumSongFormProps) => void;
}

export const AddAlbumSongModal: React.FC<AddAlbumSongModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { control, register, handleSubmit } = useForm<AddAlbumSongFormProps>({
    defaultValues: {
      songIds: [],
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Songs for Album</DialogTitle>
      <Box p={2}>
        <Typography variant="subtitle1">Enter Songs to add</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={onClose} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Add to Album
            </Button>
          </Box>
          <TextFieldArray
            control={control}
            name="songIds"
            label="Songs"
            register={register}
          />
        </form>
      </Box>
    </Dialog>
  );
};

export default AddAlbumSongModal;
