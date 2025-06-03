import  { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Cancel, DeleteForever } from "@mui/icons-material";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  onClose: (confirmed: boolean) => void;
};

const ConfirmDialog = ({ open, title, message, onClose }: ConfirmDialogProps) => {
  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <WarningAmberIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
          <Typography>{message}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} color="inherit" size="small" 
            startIcon={<Cancel />}>
          No
        </Button>
        <Button onClick={() => onClose(true)} color="error" variant="outlined" autoFocus size="small" 
            startIcon={<DeleteForever />}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    resolve?: (value: boolean) => void;
  }>({
    open: false,
    title: "",
    message: "",
  });

  const confirm = (title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ open: true, title, message, resolve });
    });
  };

  const handleClose = (confirmed: boolean) => {
    if (state.resolve) state.resolve(confirmed);
    setState((s) => ({ ...s, open: false, resolve: undefined }));
  };

  const ConfirmDialogComponent = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      message={state.message}
      onClose={handleClose}
    />
  );

  return { confirm, ConfirmDialogComponent };
}
