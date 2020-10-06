import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginBottom: 12,
      padding: 40,
      textAlign: 'center',
      [theme.breakpoints.down('xs')]: {
        padding: 20,
      },
      '& img': {
        maxWidth: '100%',
        verticalAlign: 'middle',
      },
    },
  };
});

export const PrescriptionPreview: React.FC = (props) => {
  const classes = useStyles({});
  return (
    <div className={classes.root}>
      <img src="https://via.placeholder.com/564x592" alt="" />
    </div>
  );
};
