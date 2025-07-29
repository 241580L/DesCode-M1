import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export default function ConfirmModal({ show, onClose, onConfirm, message, isLoading }) {
  return (
    <Dialog open={show} onClose={onClose}>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={isLoading}>Cancel</Button>
        <Button onClick={onConfirm} color="error" disabled={isLoading} variant="contained">
          {isLoading ? 'Processing...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
