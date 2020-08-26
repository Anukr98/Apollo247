import React from 'react';
import { Snackbar, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/styles';

interface WarningModelProps {
  error: any;
  onClose: () => void;
}

const useStyles = makeStyles(() => {
  return {
    rootClass: {
      position: 'absolute',
      '& div': {
        backgroundColor: '#00b38e',
        fontSize: '14px',
        fontWeight: 500,
        fontStretch: 'normal',
        fontStyle: 'normal',
        lineHeight: 1.43,
        letterSpacing: 'normal',
      },
    },
  };
});

const WarningModel = (props: WarningModelProps) => {
  const classes = useStyles({});
  return (
    <Snackbar
      classes={{
        root: classes.rootClass,
      }}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      style={{ zIndex: 999999, position: 'absolute' }}
      open={Boolean(props.error)}
      autoHideDuration={10000}
      onClose={props.onClose}
      message={Boolean(props.error) ? props.error.message : null}
      action={
        <React.Fragment>
          <img
            src={require('images/ic_cancel_green.svg')}
            alt=""
            style={{
              height: 18,
              width: 18,
              position: 'relative',
              marginLeft: 12,
              marginRight: 10,
              cursor: 'pointer',
            }}
            onClick={() => {
              props.onClose();
            }}
          />
        </React.Fragment>
      }
    />
  );
};

export default WarningModel;
