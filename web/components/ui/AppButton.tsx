import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Button, Theme } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    signUpBar: {
      display: 'flex',
    },
    mascotCircle: {
      marginLeft: 'auto',
      cursor: 'pointer',
      position: 'fixed',
      bottom: 10,
      right: 15,

      '& img': {
        maxWidth: 72,
        maxHeight: 72,
      },
    },
    signUpPop: {
      width: 368,
      padding: 20,
      borderRadius: 10,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: '#ffffff',
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: '#0087ba',
        marginTop: 20,
      },
      '& form': {
        paddingTop: 30,
      },
    },
    formControl: {
      marginBottom: 20,
      '& label': {
        fontSize: 12,
        fontWeight: 500,
        color: '#02475b',
        transform: 'translate(0, 1.5px) scale(1)',
      },
    },
    inputRoot: {
      '&:before': {
        borderBottom: '2px solid #00b38e',
      },
      '&:after': {
        borderBottom: '2px solid #02475b',
      },
      '& input': {
        fontSize: 16,
        fontWeight: 500,
        color: '#01475b',
        paddingTop: 9,
      },
    },
    inputFocused: {
      '&:before': {
        borderBottom: '2px solid #00b38e',
      },
      '&:after': {
        borderBottom: '2px solid #00b38e',
      },
    },
    actions: {
      display: 'flex',
      paddingTop: 10,
    },
    laterBtn: {
      marginRight: 10,
      width: '50%',
    },
    submitBtn: {
      marginLeft: 10,
      width: '50%',
    },
    btnGroup: {
      paddingTop: 7,
      '& button': {
        width: '100%',
        color: '#00b38e',
        backgroundColor: '#fff',
        fontSize: '16px',
        fontWeight: 500,
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'none',
      boxShadow: 'none',
    },
  });
});

export const AppButton: React.FC<ButtonProps> = (props) => {
  const classes = useStyles();
  return (
    <Button variant="contained" className={classes.laterBtn}>
      {props.children}
    </Button>
  );
};
