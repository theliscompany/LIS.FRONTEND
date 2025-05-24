import { enqueueSnackbar } from "notistack";

export const showSnackbar = (message: string, variant: 'success' | 'warning') => {
    enqueueSnackbar(message, {
      variant,
      anchorOrigin: { horizontal: 'left', vertical: 'bottom' }
    });
  };