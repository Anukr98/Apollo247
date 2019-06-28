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
  });
});

export const AppButton: React.FC<ButtonProps> = (props) => {
  const classes = useStyles();
  return (
    <Button className={classes.root} {...props}>
      {props.children}
    </Button>
  );
};
