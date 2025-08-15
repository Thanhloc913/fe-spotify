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
import type { ApiAlbumType } from "../../types/api/album";
import { ControlledFileInput } from "../admin/ControlledFileInput";

export interface EditAlbum2FormProps {
  name: string;
  description: string;
  coverImage: File | null;
  removeCoverImage: boolean;
}

interface EditAlbum2ModalCopyProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditAlbum2FormProps, album2: ApiAlbumType) => void;
  album2: ApiAlbumType;
}

export const EditAlbum2ModalCopy: React.FC<EditAlbum2ModalCopyProps> = ({
  open,
  onClose,
  onSubmit,
  album2,
}) => {
  const { register, handleSubmit, watch, control } =
    useForm<EditAlbum2FormProps>({
      values: {
        name: album2.name,
        description: album2.description,
        coverImage: null,
        removeCoverImage: false,
      },
      defaultValues: {
        name: album2.name || "",
        description: album2.description || "",
        coverImage: null,
        removeCoverImage: false,
      },
    });

  const selectedCoverFile = watch("coverImage");
  const coverPreviewUrl = useMemo(
    () =>
      selectedCoverFile != null ? URL.createObjectURL(selectedCoverFile) : null,
    [selectedCoverFile]
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Album: {album2.name}</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit((data) => onSubmit(data, album2))}
        p={3}
      >
        {/* Editable fields only */}
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

        {/* Cover image section */}
        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Album Cover
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Current Cover: {album2.backgroundUrl ? "Attached" : "None"}
          </Typography>

          {album2.backgroundUrl && (
            <Card sx={{ mb: 2 }}>
              <CardMedia
                component="img"
                image={album2.backgroundUrl}
                alt="Current album cover"
                sx={{ maxHeight: 300, objectFit: "contain" }}
              />
            </Card>
          )}

          {/* Background File Upload and Preview */}
          <ControlledFileInput
            name="coverImage"
            label="Upload New Background"
            // @ts-expect-error control type
            control={control}
            accept="image/*"
            fullWidth
          />

          {selectedCoverFile && (
            <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
              New Cover Selected: {selectedCoverFile.name}
            </Typography>
          )}

          {coverPreviewUrl && (
            <Card sx={{ mt: 2 }}>
              <CardMedia
                component="img"
                image={coverPreviewUrl}
                alt="New cover preview"
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
            Save Changes
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
