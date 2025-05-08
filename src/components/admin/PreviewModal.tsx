import { Box, Dialog, DialogTitle } from "@mui/material";

export const PreviewModal: React.FC<{
  open: boolean;
  onClose: () => void;
  data: object | null;
}> = ({ open, onClose, data }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Form Submission Preview</DialogTitle>
      <Box p={2}>
        <pre>{JSON.stringify(data, null, 2)}</pre> {/* Pretty-print JSON */}
      </Box>
    </Dialog>
  );
};
