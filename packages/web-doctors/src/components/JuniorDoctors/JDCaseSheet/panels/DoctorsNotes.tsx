import React from 'react';
import { Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  container: {
    borderRadius: '5px',
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    color: '#01475b !important',
    padding: '10px 10px 10px 20px',
    fontSize: 14,
    lineHeight: 1.43,
    fontWeight: 'normal',
    width: '100%',
  },
}));

export const DoctorsNotes: React.FC = (props) => {
  const classes = useStyles();

  return (
    <Typography component="div" className={classes.container}>
      {'No notes'}
    </Typography>
  );
};
