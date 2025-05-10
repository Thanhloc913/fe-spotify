import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker, DateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { MuiTelInput } from "mui-tel-input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Profile, User } from "./../../types";
import TextFieldArray from "./TextFieldArray";
import ModalSection from "./ModalSection";

// editable form props
interface EditUserFormProps {
  name?: string;
  email?: string;
  playlists: string[];
  following: {
    artists: string[];
    users: string[];
  };
}

// editable form props
interface EditProfileFormProps {
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
}

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitUser: (data: EditUserFormProps, user: User) => void;
  onSubmitProfile: (data: EditProfileFormProps, profile: Profile) => void;
  user: User;
  profile: Profile | null;
}

// type SubmitFormData = Partial<
//   User | UserFormProps | Profile | ProfileFormProps | null
// >;

const EditUserModal: React.FC<EditUserModalProps> = ({
  open,
  onClose,
  onSubmitUser,
  onSubmitProfile,
  user,
  profile,
}) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleUserSubmit = (data: EditUserFormProps) => {
    onSubmitUser(data, user);
  };

  const handleProfileSubmit = (data: EditProfileFormProps) => {
    profile && onSubmitProfile(data, profile);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Editing User {user.id}</DialogTitle>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button onClick={onClose} sx={{ mr: 1 }}>
          Cancel
        </Button>
      </Box>
      <Tabs value={tabIndex} onChange={(_, newIndex) => setTabIndex(newIndex)}>
        <Tab label="User" />
        <Tab label="Profile" />
      </Tabs>
      <Box p={2}>
        {tabIndex === 0 && <UserForm user={user} onSubmit={handleUserSubmit} />}
        {tabIndex === 1 && (
          <ProfileForm profile={profile} onSubmit={handleProfileSubmit} />
        )}
      </Box>
    </Dialog>
  );
};

const UserForm: React.FC<{
  user: User;
  onSubmit: (data: EditUserFormProps) => void;
}> = ({ user, onSubmit }) => {
  const { register, control, handleSubmit } = useForm<EditUserFormProps>({
    defaultValues: {
      name: user.name,
      email: user.email,
      playlists: user.playlists,
      following: user.following,
    },
  });

  return (
    <>
      <Typography variant="subtitle1">User Info</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button type="submit" variant="contained" color="primary">
            Save User
          </Button>
        </Box>
        <TextField
          label="ID"
          value={user.id}
          fullWidth
          disabled
          margin="dense"
        />
        <DateTimePicker
          label="Created At"
          value={dayjs(user.createdAt)}
          disabled
        />
        <TextField
          label="Email"
          {...register("email")}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Name"
          {...register("name")}
          fullWidth
          margin="dense"
        />
        {/* Playlists Section */}
        <ModalSection title="Playlists">
          <TextFieldArray
            name="playlists"
            register={register}
            control={control}
            label="Playlist"
          />
        </ModalSection>
        {/* Following Section - Editable */}
        <ModalSection title="Following">
          <TextFieldArray
            name="following.artists"
            register={register}
            control={control}
            label="Artists Followed"
          />
          <TextFieldArray
            name="following.users"
            register={register}
            control={control}
            label="Users Followed"
          />
        </ModalSection>
      </form>
    </>
  );
};

const ProfileForm: React.FC<{
  profile: Profile | null;
  onSubmit: (data: EditProfileFormProps) => void;
}> = ({ profile, onSubmit }) => {
  const { register, handleSubmit, watch, setValue } =
    useForm<EditProfileFormProps>({
      defaultValues: {
        fullName: profile?.fullName,
        avatarUrl: profile?.avatarUrl,
        bio: profile?.bio,
        dateOfBirth: profile?.dateOfBirth,
        phoneNumber: profile?.phoneNumber,
      },
    });

  return (
    <>
      <Typography variant="subtitle1">Profile Info</Typography>
      {profile ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button type="submit" variant="contained" color="primary">
              Save Profile
            </Button>
          </Box>
          <TextField
            label="Account ID"
            value={profile?.accountID}
            fullWidth
            disabled
            margin="dense"
          />
          <TextField
            label="Full Name"
            {...register("fullName")}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Avatar URL"
            {...register("avatarUrl")}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Bio"
            {...register("bio")}
            fullWidth
            margin="dense"
          />
          <DatePicker
            label="Date of Birth"
            value={dayjs(profile?.dateOfBirth)}
          />
          <MuiTelInput
            label="Phone Number"
            value={watch("phoneNumber") || ""}
            onChange={(value) => setValue("phoneNumber", value)}
            defaultCountry="VN"
            fullWidth
            margin="dense"
          />
        </form>
      ) : (
        <Typography variant="caption">
          No profile info associated with Account
        </Typography>
      )}
    </>
  );
};

export default EditUserModal;
