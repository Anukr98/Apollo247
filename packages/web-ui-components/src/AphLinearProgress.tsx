import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import LinearProgress, { LinearProgressProps } from '@material-ui/core/LinearProgress';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      padding: 0,
      width: '100%',
    },
    colorPrimary: {
      backgroundColor: 'rgba(252,183,22,0.6)',
    },
    colorSecondary: {
      backgroundColor: 'rgba(0,179,142,0.6)',
    },
    barColorPrimary: {
      backgroundColor: '#fcb716',
    },
    barColorSecondary: {
      backgroundColor: '#00b38e',
    },
  });
});

const AphLinearProgress: React.FC<LinearProgressProps> = (props) => {
  const defaultClasses = useStyles({});
  const classes = props.classes || defaultClasses;

  return <LinearProgress {...props} classes={classes} />;
};

export default AphLinearProgress;
