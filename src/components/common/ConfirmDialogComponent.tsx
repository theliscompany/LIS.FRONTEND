import { Cancel, Delete } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

type ConfirmDialogComponentProps = {
    title: string;
    message: string;
    open: boolean;
    onDelete: (deleted: boolean) => void;
}

const ConfirmDialogComponent = (props:ConfirmDialogComponentProps) => {
    return (
        <Dialog
        open={props.open}
        onClose={()=>props.onDelete(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {props.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {props.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button size="small" variant="contained" color="error" 
                onClick={()=>props.onDelete(true)} startIcon={<Delete />}>
                    Delete
            </Button>
            <Button size="small" variant="outlined"  startIcon={<Cancel />}
                onClick={()=>props.onDelete(false)} autoFocus>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
}

export default ConfirmDialogComponent;