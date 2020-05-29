import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Switch } from '@material-ui/core';
import { SwitchProps } from '@material-ui/core/Switch';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      padding: 0,
      height: 20,
      width: 40,
      right: '20px !important',
    },
    track: {
      backgroundColor: '#ccc !important',
      opacity: 0.6,
      height: 20,
      marginRight: 4,
      borderRadius: 15,
    },
    thumb: {
      height: 20,
      width: 20,
      border: 'solid 1px #ccc',
      boxShadow: 'none',
      backgroundColor: '#f7f7f7',
      '&:hover': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
      },
    },
    switchBase: {
      padding: '0 3px',
    },
    colorPrimary: {
      '&$checked': {
        color: '#f7f7f7',
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
      '&$checked + $track': {
        opacity: 1,
        backgroundColor: '#00b38e !important',
      },
      '&$checked + $thumb': {
        border: 'solid 1px #00b38e',
      },
    },
    checked: {
      color: '#f7f7f7',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  });
});

export const AphToggleSwitch: React.FC<SwitchProps> = (props) => {
  const defaultClasses = useStyles({});
  const classes = props.classes || defaultClasses;

  return (
    <Switch classes={classes} {...props} inputProps={{ 'aria-label': 'secondary checkbox' }} />
  );
};
