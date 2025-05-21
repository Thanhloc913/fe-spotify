import CloseIcon from "@mui/icons-material/Close";
import { MuiFileInput, MuiFileInputProps } from "mui-file-input";
import {
  Control,
  Controller,
  FieldValues,
  Path, // Import Path
} from "react-hook-form";
import ModalSection from "./ModalSection";
import AttachFileIcon from "@mui/icons-material/AttachFile";

// Make the component generic
type ControlledFileInputProps<TFieldValues extends FieldValues> =
  MuiFileInputProps & {
    name: Path<TFieldValues>; // <--- Change keyof TFieldValues to Path<TFieldValues>
    title: string;
    accept: string;
    control: Control<TFieldValues>; // Control uses the generic type
  };

// Use the generic type in the component
export const ControlledFileInput = <TFieldValues extends FieldValues>({
  name,
  title,
  accept,
  control,
  ...muiFileInputProps
}: ControlledFileInputProps<TFieldValues>) => {
  return (
    <Controller
      name={name} // This will now correctly match the expected Path<TFieldValues>
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <ModalSection title={title}>
          <MuiFileInput
            {...muiFileInputProps}
            value={value}
            onChange={onChange}
            error={!!error}
            clearIconButtonProps={{
              title: "Remove",
              "aria-label": "Remove file",
              children: <CloseIcon fontSize="small" />,
            }}
            InputProps={{
              inputProps: {
                accept,
              },
              startAdornment: <AttachFileIcon />,
            }}
          />
        </ModalSection>
      )}
    />
  );
};
