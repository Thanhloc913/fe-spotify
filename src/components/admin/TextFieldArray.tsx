import { Button, Grid, Paper, TextField, Typography } from "@mui/material";
import { FC } from "react";
import { Control, useFieldArray, UseFormRegister } from "react-hook-form";

interface TextFieldArrayProps {
  name: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
}

const TextFieldArray: FC<TextFieldArrayProps> = ({
  name,
  label,
  register,
  control,
}) => {
  const { fields, append, remove } = useFieldArray({ name, control });

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        {label}
      </Typography>
      <Grid container spacing={2}>
        {fields.map((field, index) => (
          <Grid
            container
            size={12}
            spacing={1}
            key={field.id}
            alignItems="center"
          >
            <Grid size="grow">
              <TextField
                {...register(`${name}.${index}`)}
                label={`${label} ${index + 1}`}
                fullWidth
              />
            </Grid>
            <Grid>
              <Button
                variant="outlined"
                color="error"
                onClick={() => remove(index)}
              >
                Delete
              </Button>
            </Grid>
          </Grid>
        ))}
        <Grid size="grow">
          <Button variant="outlined" onClick={() => append("")} fullWidth>
            + Add More
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TextFieldArray;
