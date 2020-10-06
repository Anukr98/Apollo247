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
    inputDisabled: {
      '&:before': {
        borderBottom: '2px solid rgba(2,71,91,0.3) !important',
      },
      '&:after': {
        borderBottom: '2px solid rgba(2,71,91,0.3) !important',
      },
      '&:hover': {
        '&:before': {
          borderBottom: '2px solid rgba(2,71,91,0.3) !important',
        },
        '&:after': {
          borderBottom: '2px solid rgba(2,71,91,0.3) !important',
        },
      },
    },
    textAreaRoot: {
      padding: 0,
      '&:before': {
        display: 'none',
      },
      '&:after': {
        display: 'none',
      },
      '& textarea': {
        fontSize: 16,
        fontWeight: 500,
        color: '#01475b',
        border: '1px solid #00b38e',
        padding: 16,
        borderRadius: 10,
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

const AphTextField: React.FC<TextFieldProps> = (props) => {
  const classes = useStyles({});
  return (
    <TextField
      fullWidth
      className={`${classes.formControl} ${props.className}`}
      InputLabelProps={{
        shrink: true,
        focused: false,
      }}
      InputProps={{
        classes: {
          root: classes.inputRoot,
          focused: classes.inputFocused,
          error: classes.inputError,
          disabled: classes.inputDisabled,
          multiline: classes.textAreaRoot,
        },
      }}
      SelectProps={{ classes: { root: classes.selectRoot } }}
      {...props}
    />
  );
};

export default AphTextField;
