import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, DialogTitle } from '@material-ui/core';
import { DialogTitleProps } from '@material-ui/core/DialogTitle';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      padding: 20,
      backgroundColor: theme.palette.common.white,
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
      textAlign: 'center',
      borderRadius: '10px 10px 0 0',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      '& h6': {
        margin: 0,
        fontSize: 16,
        fontWeight: 500,
        color: '#02475b',
        textAlign: 'center',
        lineHeight: 'normal',
        position: 'relative',
      },
    },
  });
});

const AphDialog: React.FC<DialogTitleProps> = (props) => {
  const defaultClasses = useStyles({});
  const classes = props.classes || defaultClasses;

  return (
    <DialogTitle {...props} classes={classes}>
      {props.children}
    </DialogTitle>
  );
};

export default AphDialog;
