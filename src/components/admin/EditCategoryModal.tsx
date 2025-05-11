import { Dialog, DialogTitle, TextField, Button, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { Category } from "../../types";
import ModalSection from "./ModalSection";

interface EditCategoryFormProps {
  name: string;
  imageUrl: string;
  description: string;
}

interface EditCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditCategoryFormProps, category: Category) => void;
  category: Category;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  open,
  onClose,
  onSubmit,
  category,
}) => {
  const { register, handleSubmit } = useForm<EditCategoryFormProps>({
    defaultValues: {
      name: "",
      imageUrl: "",
      description: "",
    },
    values: {
      name: category.name,
      imageUrl: category.imageUrl,
      description: category.description,
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Category: {category.name}</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit((data) => onSubmit(data, category))}
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

        {/* Read-only field */}
        <TextField
          label="ID"
          value={category.id}
          fullWidth
          margin="normal"
          disabled
        />

        {/* Basic Info Section */}
        <ModalSection title="Category Information">
          <TextField
            label="Name"
            {...register("name", { required: true })}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Image URL"
            {...register("imageUrl")}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Description"
            {...register("description")}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
        </ModalSection>
      </Box>
    </Dialog>
  );
};
