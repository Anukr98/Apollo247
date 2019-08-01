import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      margin: 0,
      padding: 0,
    },
    colorPrimary: {
      color: '#00b38e',
      '&$checked': {
        color: '#00b38e',
      },
    },
    checked: {
      color: '#00b38e',
    },
  };
});

export const AphCheckbox: React.FC<CheckboxProps> = (props) => {
  const defaultClasses = useStyles({});
  const classes = props.classes || defaultClasses;

  return <Checkbox classes={classes} {...props} />;
};
