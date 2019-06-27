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
    },
    inputFocused: {
      '&:before': {
        borderBottom: '2px solid #00b38e',
      },
      '&:after': {
        borderBottom: '2px solid #00b38e',
      },
    },
  });
});

export const AppInputField: React.FC<InputProps> = (props) => {
  const classes = useStyles();
  return (
    <Input
      fullWidth
      classes={{ root: classes.inputRoot, focused: classes.inputFocused }}
      {...props}
    />
  );
};
