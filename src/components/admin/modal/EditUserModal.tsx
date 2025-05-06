import { useState } from "react";
import { Dialog, DialogTitle, Tabs, Tab, Box, Button } from "@mui/material";
import { useForm } from "react-hook-form";
import TextFieldArray from "../TextFieldArray";
import { Profile, User } from "../../../types";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
  profile: Profile | null;
}

interface UserForm {
  name: string;
  email: string;
  playlists: string[];
}

interface ProfileForm {
  fullName: string;
  bio: string | null;
  phoneNumber: string | null;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  open,
  onClose,
  user,
  profile,
}) => {
  const [tabIndex, setTabIndex] = useState(0);

  // Form for User
  const {
    register: registerUser,
    control: controlUser,
    handleSubmit: handleSubmitUser,
  } = useForm<UserForm>({
    defaultValues: {
      name: user.name,
      email: user.email,
      playlists: user.playlists,
    },
  });

  // Form for Profile
  const {
    register: registerProfile,
    control: controlProfile,
    handleSubmit: handleSubmitProfile,
  } = useForm<ProfileForm>({
    defaultValues: {
      fullName: profile?.fullName,
      bio: profile?.bio,
      phoneNumber: profile?.phoneNumber,
    },
  });

  const handleUserSubmit = (data: UserForm) => {
    console.log("User Updated:", data);
  };

  const handleProfileSubmit = (data: ProfileForm) => {
    console.log("Profile Updated:", data);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit User</DialogTitle>
      <Tabs value={tabIndex} onChange={(_, newIndex) => setTabIndex(newIndex)}>
        <Tab label="User" />
        <Tab label="Profile" />
      </Tabs>
      <Box p={2}>
        {tabIndex === 0 && (
          <form onSubmit={handleSubmitUser(handleUserSubmit)}>
            <TextFieldArray
              name="playlists"
              register={registerUser}
              control={controlUser}
              label="Playlists"
            />
            <Button type="submit" variant="contained" color="primary">
              Save User
            </Button>
          </form>
        )}
        {tabIndex === 1 && (
          <form onSubmit={handleSubmitProfile(handleProfileSubmit)}>
            <TextFieldArray
              name="bio"
              register={registerProfile}
              control={controlProfile}
              label="Bio"
            />
            <Button type="submit" variant="contained" color="primary">
              Save Profile
            </Button>
          </form>
        )}
      </Box>
    </Dialog>
  );
};

export default EditUserModal;
