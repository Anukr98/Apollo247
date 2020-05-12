import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Button } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    dialogBoxClose: {
      position: 'absolute',
      right: -48,
      top: 0,
      width: 28,
      height: 28,
      borderRadius: '50%',
      backgroundColor: theme.palette.common.white,
      cursor: 'pointer',
      minWidth: 'auto',
      boxShadow: 'none',
      padding: 0,
      outline: 'none',
      border: 'none',
      '&:hover': {
        backgroundColor: theme.palette.common.white,
        outline: 'none',
        border: 'none',
      },
      '&:focus': {
        backgroundColor: theme.palette.common.white,
        outline: 'none',
        border: 'none',
      },
      [theme.breakpoints.down('xs')]: {
        right: 0,
        top: -48,
      },
    },
  });
});

const AphDialogClose: React.FC<ButtonProps> = (props) => {
  const classes = useStyles({});
  return (
    <Button {...props} className={classes.dialogBoxClose}>
      <img src={require('images/ic_cross_popup.svg')} alt="" />
    </Button>
  );
};

export default AphDialogClose;
