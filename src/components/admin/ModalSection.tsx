import { Paper, PaperProps, Typography } from "@mui/material";

interface ModalSectionProps extends PaperProps {
  title: string; // Required section title
  children: React.ReactNode; // Content inside the section
}

const ModalSection: React.FC<ModalSectionProps> = ({
  title,
  children,
  ...paperProps
}) => {
  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }} {...paperProps}>
      <Typography variant="subtitle1">{title}</Typography>
      {children}
    </Paper>
  );
};

export default ModalSection;
