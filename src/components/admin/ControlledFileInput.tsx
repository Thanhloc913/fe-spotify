import CloseIcon from "@mui/icons-material/Close";
import { MuiFileInput, MuiFileInputProps } from "mui-file-input";
import React from "react";
import { Control, Controller } from "react-hook-form";
import ModalSection from "./ModalSection";
import AttachFileIcon from "@mui/icons-material/AttachFile";
type ControlledFileInputProps = MuiFileInputProps & {
  name: string;
  title: string;
  accept: string;
  control: Control<any>;
};

export const ControlledFileInput: React.FC<ControlledFileInputProps> = ({
  name,
  title,
  accept,
  control,
  ...muiFileInputProps
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <ModalSection title={title}>
          <MuiFileInput
            {...muiFileInputProps}
            value={value || null}
            onChange={onChange}
            error={!!error}
            clearIconButtonProps={{
              title: "Remove",
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
