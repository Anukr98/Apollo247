import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Switch } from '@material-ui/core';
import { SwitchProps } from '@material-ui/core/Switch';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      padding: 5,
      height: 20,
      width: 46,
    },
    track: {
      backgroundColor: '#00b38e !important',
      opacity: 0.3,
    },
    thumb: {
      height: 20,
      width: 20,
      border: 'solid 2px #00b38e',
      boxShadow: 'none',
    },
    switchBase: {
      padding: '0 5px',
    },
    colorPrimary: {
      '&$checked': {
        color: '#00b38e',
      },
    },
    checked: {
      color: '#00b38e',
    },
  });
});

const AphSwitch: React.FC<SwitchProps> = (props) => {
  const defaultClasses = useStyles({});
  const classes = props.classes || defaultClasses;

  return (
    <Switch classes={classes} {...props} inputProps={{ 'aria-label': 'secondary checkbox' }} />
  );
};

export default AphSwitch;
