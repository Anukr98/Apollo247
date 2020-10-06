import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Dialog } from '@material-ui/core';
import { DialogProps } from '@material-ui/core/Dialog';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      padding: 0,
    },
    container: {
      display: 'block',
    },
    paper: {
      position: 'relative',
      backgroundColor: theme.palette.common.white,
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.3)',
      overflowY: 'visible',
      margin: '88px auto 0 auto',
    },
    paperWidthSm: {
      maxWidth: 328,
    },
    paperWidthMd: {
      maxWidth: 676,
    },
    paperWidthLg: {
      maxWidth: '90%',
    },
    dialogBoxClose: {
      position: 'absolute',
      right: -48,
      top: 0,
      width: 28,
      height: 28,
      borderRadius: '50%',
      backgroundColor: theme.palette.common.white,
      cursor: 'pointer',
      [theme.breakpoints.down('xs')]: {
        right: 0,
        top: -48,
      },
    },
  });
});

const AphDialog: React.FC<DialogProps> = (props) => {
  const classes = useStyles({});

  return (
    <Dialog {...props} classes={classes}>
      {props.children}
    </Dialog>
  );
};

export default AphDialog;
