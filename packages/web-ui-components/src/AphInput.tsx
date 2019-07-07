import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import Input, { InputProps } from '@material-ui/core/Input';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
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
      '&:hover': {
        '&:before': {
          borderBottom: '2px solid #00b38e !important',
        },
        '&:after': {
          borderBottom: '2px solid #00b38e !important',
        },
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
    inputError: {
      '&:before': {
        borderBottom: '2px solid #e50000 !important',
      },
      '&:after': {
        borderBottom: '2px solid #e50000 !important',
      },
      '&:hover': {
        '&:before': {
          borderBottom: '2px solid #e50000 !important',
        },
        '&:after': {
          borderBottom: '2px solid #e50000 !important',
        },
      },
    },
  });
});

const AphInput: React.FC<InputProps> = (props) => {
  const classes = useStyles({});
  return (
    <Input
      fullWidth
      classes={{
        root: classes.inputRoot,
        focused: classes.inputFocused,
        error: classes.inputError,
      }}
      {...props}
    />
  );
};

export default AphInput;
