import { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  TextField,
  Button,
  Box,
  Card,
  CardMedia,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { ApiAlbumType } from "../../types/api";
import { ControlledFileInput } from "./ControlledFileInput";

export interface EditAlbum2FormProps {
  name: string;
  description: string;
  artistId: string;
  coverImage: File | null;
  removeCoverImage: boolean;
}

interface EditAlbum2ModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditAlbum2FormProps, album2: ApiAlbumType) => void;
  album2: ApiAlbumType;
}

export const EditAlbum2Modal: React.FC<EditAlbum2ModalProps> = ({
  open,
  onClose,
  onSubmit,
  album2,
}) => {
  const { register, handleSubmit, setValue, watch, control } =
    useForm<EditAlbum2FormProps>({
      values: {
        name: album2.name,
        description: album2.description,
        artistId: album2.artistId,
        coverImage: null,
        removeCoverImage: false,
      },
      defaultValues: {
        name: album2.name || "",
        description: album2.description || "",
        artistId: album2.artistId || "",
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
      <DialogTitle>Edit Album2: {album2.name}</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit((data) => onSubmit(data, album2))}
        p={3}
      >
        {/* Read-only fields */}
        <TextField
          label="ID"
          value={album2.id}
          fullWidth
          margin="normal"
          disabled
        />

        <DateTimePicker
          label="Created At"
          value={dayjs(album2.createdAt)}
          disabled
          slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
        />

        <DateTimePicker
          label="Updated At"
          value={dayjs(album2.updatedAt)}
          disabled
          slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
        />

        <DateTimePicker
          label="Deleted At"
          value={album2.deletedAt ? dayjs(album2.deletedAt) : null}
          disabled
          slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
        />

        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={album2.isActive} disabled />}
            label="Is Active"
          />
        </FormGroup>

        {/* Editable fields */}
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

        {/* Cover image section */}
        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Album2 Cover
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Current Cover: {album2.backgroundUrl ? "Attached" : "None"}
          </Typography>

          {album2.backgroundUrl && (
            <Card sx={{ mb: 2 }}>
              <CardMedia
                component="img"
                image={album2.backgroundUrl}
                alt="Current album2 cover"
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

          {selectedCoverFile && ( // Use selectedCoverFile (watched value)
            <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
              New Cover Selected: {selectedCoverFile.name}
            </Typography>
          )}

          {coverPreviewUrl && ( // Use previewUrl (memoized URL)
            <Card sx={{ mt: 2 }}>
              <CardMedia
                component="img"
                image={coverPreviewUrl}
                alt="New cover preview"
                sx={{ maxHeight: 300, objectFit: "contain" }}
              />
            </Card>
          )}

          <FormControlLabel
            control={
              <Checkbox
                checked={watch("removeCoverImage")}
                onChange={(e) => setValue("removeCoverImage", e.target.checked)}
                disabled={!album2.backgroundUrl} // Disable if no current image
              />
            }
            label="Remove current cover image"
            sx={{ mt: 1 }}
          />
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
