import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import { MuiTelInput } from "mui-tel-input";
import { Controller, useForm } from "react-hook-form";
import { Artist } from "../../types";
import ModalSection from "./ModalSection";
import TextFieldArray from "./TextFieldArray";

interface EditArtistFormProps {
  name: string;
  avatarUrl: string;
  bio: string;
  genres: string[];
  monthlyListeners: number;
  albums: string[];
  singles: string[];
  topTracks: string[];
  related: string[];
  fullName: string | null;
  dateOfBirth: string | null;
  phoneNumber: string | null;
  isActive: boolean;
}

interface EditArtistModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditArtistFormProps, artist: Artist) => void;
  artist: Artist;
}

export const EditArtistModal: React.FC<EditArtistModalProps> = ({
  open,
  onClose,
  onSubmit,
  artist,
}) => {
  const { register, handleSubmit, control, watch, setValue } =
    useForm<EditArtistFormProps>({
      defaultValues: {
        name: "",
        avatarUrl: "",
        bio: "",
        genres: [],
        monthlyListeners: 0,
        albums: [],
        singles: [],
        topTracks: [],
        related: [],
        fullName: "",
        dateOfBirth: "",
        phoneNumber: "",
        isActive: false,
      },
      values: {
        name: artist.name,
        avatarUrl: artist.avatarUrl,
        bio: artist.bio,
        genres: artist.genres,
        monthlyListeners: artist.monthlyListeners,
        albums: artist.albums || [],
        singles: artist.singles || [],
        topTracks: artist.topTracks || [],
        related: artist.related || [],
        fullName: artist.fullName,
        dateOfBirth: artist.dateOfBirth,
        phoneNumber: artist.phoneNumber,
        isActive: artist.isActive ?? false,
      },
    });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Artist {artist.name}</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit((data) => onSubmit(data, artist))}
        p={2}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save Changes
          </Button>
        </Box>

        {/* Read-only fields */}
        <TextField
          label="ID"
          value={artist.id}
          fullWidth
          margin="normal"
          disabled
        />
        <TextField
          label="Account ID"
          value={artist.accountID}
          fullWidth
          margin="normal"
        />
        <DateTimePicker
          label="Created At"
          value={dayjs(artist.createdAt)}
          disabled
          sx={{ mt: 2, width: "100%" }}
        />
        <DateTimePicker
          label="Updated At"
          value={dayjs(artist.updatedAt)}
          disabled
          sx={{ mt: 2, width: "100%" }}
        />
        <DateTimePicker
          label="Deleted At"
          value={dayjs(artist.deletedAt)}
          disabled
          sx={{ mt: 2, width: "100%" }}
        />

        {/* Basic Info Section */}
        <ModalSection title="Basic Information">
          <TextField
            label="Name"
            {...register("name", { required: true })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Avatar URL"
            {...register("avatarUrl")}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Bio"
            {...register("bio")}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
        </ModalSection>

        {/* Personal Details Section */}
        <ModalSection title="Personal Details">
          <TextField
            label="Full Name"
            {...register("fullName")}
            fullWidth
            margin="normal"
          />
          <DatePicker
            label="Date of Birth"
            value={artist.dateOfBirth ? dayjs(artist.dateOfBirth) : null}
            onChange={(date) =>
              setValue("dateOfBirth", date?.toISOString() ?? "")
            }
            sx={{ mt: 2, width: "100%" }}
          />
          <MuiTelInput
            label="Phone Number"
            value={watch("phoneNumber") || ""}
            onChange={(value) => setValue("phoneNumber", value)}
            defaultCountry="VN"
            fullWidth
            margin="normal"
          />
        </ModalSection>

        {/* Songs Section */}
        <ModalSection title="Songs">
          <TextFieldArray
            name="genres"
            label="Genre"
            control={control}
            register={register}
          />
          <TextFieldArray
            name="albums"
            label="Albums"
            control={control}
            register={register}
          />
          <TextFieldArray
            name="singles"
            label="Singles"
            control={control}
            register={register}
          />
          <TextFieldArray
            name="topTracks"
            label="Top tracks"
            control={control}
            register={register}
          />
          <TextFieldArray
            name="related"
            label="Related Artists"
            control={control}
            register={register}
          />
        </ModalSection>

        {/* Status Section */}
        <ModalSection title="Status">
          <FormGroup>
            <FormControlLabel
              label="Is active"
              control={
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              }
            />
          </FormGroup>
        </ModalSection>
      </Box>
    </Dialog>
  );
};
