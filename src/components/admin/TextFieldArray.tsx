import { Button, TextField } from "@mui/material";
import { Control, useFieldArray, UseFormRegister } from "react-hook-form";

interface TextFieldArrayProps {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  control: Control<any>; // Fix: Accept control from useForm
}

const TextFieldArray: React.FC<TextFieldArrayProps> = ({
  name,
  label,
  register,
  control,
}) => {
  const { fields, append, remove } = useFieldArray({ name, control });

  return (
    <div>
      {fields.map((field, index) => (
        <div key={field.id} className="flex space-x-2">
          <TextField
            {...register(`${name}.${index}`)}
            label={label}
            fullWidth
          />
          <Button onClick={() => remove(index)}>Delete</Button>
        </div>
      ))}
      <Button onClick={() => append("")}>+ Add More</Button>
    </div>
  );
};

export default TextFieldArray;
