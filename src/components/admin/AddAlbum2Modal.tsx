import { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  TextField,
  Button,
  Box,
  Card,
  CardMedia,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { ControlledFileInput } from "./ControlledFileInput";

export interface AddAlbum2FormProps {
  name: string;
  description: string;
  artistId: string;
  coverImage: File | null;
}

interface AddAlbum2ModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddAlbum2FormProps) => void;
}

export const AddAlbum2Modal: React.FC<AddAlbum2ModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { register, handleSubmit, watch, control } =
    useForm<AddAlbum2FormProps>({
      defaultValues: {
        name: "",
        description: "",
        artistId: "",
        coverImage: null,
      },
    });

  const selectedCoverFile = watch("coverImage");
  const coverPreview = useMemo(
    () =>
      selectedCoverFile != null ? URL.createObjectURL(selectedCoverFile) : null,
    [selectedCoverFile]
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Add New Album2</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} p={3}>
        <TextField
          label="Name"
          {...register("name", { required: true })}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Artist ID"
          {...register("artistId", { required: true })}
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

        <Box mt={2}>
          <ControlledFileInput
            name="coverImage"
            accept="image/*"
            title="Album2 Cover Image"
            control={control}
            fullWidth
          />

          {selectedCoverFile && (
            <Typography variant="subtitle2" sx={{ mt: 1 }} gutterBottom>
              Selected Cover: {selectedCoverFile.name}
            </Typography>
          )}
          {coverPreview && (
            <Card sx={{ mt: 2 }}>
              <CardMedia
                component="img"
                image={coverPreview}
                alt="Album2 cover preview"
                sx={{ maxHeight: 300, objectFit: "contain" }}
              />
            </Card>
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button onClick={onClose} sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Add Album2
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
