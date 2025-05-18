import { Box, Dialog, DialogTitle } from "@mui/material";

export const PreviewModal: React.FC<{
  open: boolean;
  onClose: () => void;
  data: unknown;
}> = ({ open, onClose, data }) => {
  const isError = data instanceof Error;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Form Submission Preview</DialogTitle>
      <Box p={2}>
        {isError ? (
          <pre>
            {data.name}: {data.message}
            {"\n"}
            {data.stack}
          </pre>
        ) : (
          <pre>{JSON.stringify(data, null, 2)}</pre>
        )}
      </Box>
    </Dialog>
  );
};
