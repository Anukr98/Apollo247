import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Button, Theme } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      fontSize: 13,
      fontWeight: 'bold',
      padding: '9px 13px 9px 13px',
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0,0,0, 0.2)',
    },
    textPrimary: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
      },
    },
    textSecondary: {
      backgroundColor: theme.palette.common.white,
      color: '#00b38e',
    },
    sizeSmall: {
      fontSize: 12,
      fontWeight: 500,
      padding: '5px 10px',
      textTransform: 'none',
    },
  });
});

const AphButton: React.FC<ButtonProps> = (props) => {
  const defaultClasses = useStyles({});
  const classes = props.classes || defaultClasses;

  return (
    <Button {...props} classes={classes}>
      {props.children}
    </Button>
  );
};

export default AphButton;
