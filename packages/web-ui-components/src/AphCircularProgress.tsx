import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import CircularProgress, { CircularProgressProps } from '@material-ui/core/CircularProgress';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    colorPrimary: {
      color: '#fc9916',
    },
    colorSecondary: {
      color: '#00b38e',
    },
  });
});

const AphCircularProgress: React.FC<CircularProgressProps> = (props) => {
  const defaultClasses = useStyles({});
  const classes = props.classes || defaultClasses;

  return <CircularProgress {...props} classes={classes} />;
};

export default AphCircularProgress;
