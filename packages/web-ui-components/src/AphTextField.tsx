import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    formControl: {
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
    selectRoot: {
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
      '& svg': {
        color: '#00b38e',
      },
    },
  });
});

export const AphTextField: React.FC<TextFieldProps> = (props) => {
  const classes = useStyles({});
  return (
    <TextField
      fullWidth
      className={classes.formControl}
      InputLabelProps={{
        shrink: true,
        focused: false,
      }}
      InputProps={{
        classes: {
          root: classes.inputRoot,
          focused: classes.inputFocused,
          error: classes.inputError,
        },
      }}
      SelectProps={{ classes: { root: classes.selectRoot } }}
      {...props}
    />
  );
};
