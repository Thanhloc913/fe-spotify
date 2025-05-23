import {
  Button,
  Card,
  CardMedia,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { ApiSongType } from "../../types/api";
import { ControlledFileInput } from "../admin/ControlledFileInput";
import { useMemo } from "react";

export interface EditSongFormProps {
  title: string;
  background: File | null;
  removeBackground: boolean;
  description: string;
}

interface EditSongModalCopyProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditSongFormProps, song: ApiSongType) => void;
  song: ApiSongType;
}

export const EditSongModalCopy: React.FC<EditSongModalCopyProps> = ({
  open,
  onClose,
  onSubmit,
  song,
}) => {
  const { register, handleSubmit, watch, setValue, control } =
    useForm<EditSongFormProps>({
      values: {
        title: song.title,
        description: song.description,
        background: null,
        removeBackground: false,
      },
      defaultValues: {
        title: song.title,
        description: song.description,
        background: null,
        removeBackground: false,
      },
    });

  const selectedBackgroundFile = watch("background");
  const selectedBackground = useMemo(
    () =>
      selectedBackgroundFile != null
        ? URL.createObjectURL(selectedBackgroundFile)
        : null,
    [selectedBackgroundFile]
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Edit Song: <strong>{song.title}</strong>
      </DialogTitle>
      <form onSubmit={handleSubmit((data) => onSubmit(data, song))}>
        <DialogContent dividers>
          {/* Content Section */}
          <TextField
            label="Title"
            {...register("title", { required: "Title is required" })}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Description"
            {...register("description")}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />

          {/* Media Section */}
          <Typography variant="subtitle2" gutterBottom>
            Current Background: {song.backgroundUrl ? "Attached" : "None"}
          </Typography>
          {song.backgroundUrl && (
            <img
              src={song.backgroundUrl}
              alt="Current background"
              style={{
                maxWidth: "100%",
                maxHeight: 200,
                display: "block",
                marginBottom: 16,
              }}
            />
          )}

          {/* Background File Upload and Preview */}
          <ControlledFileInput
            name="background"
            label="Upload New Background"
            // @ts-expect-error control type
            control={control}
            accept="image/*"
            clearIconButtonProps={{
              title: "Remove",
              "aria-label": "Remove file",
            }}
            fullWidth
          />

          {selectedBackgroundFile && (
            <Typography variant="subtitle2" sx={{ mt: 1 }} gutterBottom>
              Selected Background: {selectedBackgroundFile.name}
            </Typography>
          )}

          {selectedBackground && (
            <Card sx={{ mt: 2, mb: 2 }}>
              <CardMedia
                component="img"
                image={selectedBackground}
                alt="New background preview"
                sx={{ maxHeight: 300, objectFit: "contain" }}
              />
            </Card>
          )}

          <FormControlLabel
            control={
              <Checkbox
                {...register("removeBackground")}
                checked={watch("removeBackground")}
                onChange={(e) => setValue("removeBackground", e.target.checked)}
                disabled={!song.backgroundUrl}
              />
            }
            label="Remove current background image"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
