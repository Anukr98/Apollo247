import React from 'react';
import { Snackbar, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

interface AlertProps {
  error: any;
  onClose: () => void;
}

const Alert = (props: AlertProps) => {
  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      style={{zIndex: 999999}}
      open={Boolean(props.error)}
      autoHideDuration={6000}
      onClose={props.onClose}
      message={Boolean(props.error) ? props.error.message : null}
      action={
        <React.Fragment>
          <IconButton size="small" aria-label="close" color="inherit" onClick={props.onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </React.Fragment>
      }
    />
  );
};

export default Alert;
