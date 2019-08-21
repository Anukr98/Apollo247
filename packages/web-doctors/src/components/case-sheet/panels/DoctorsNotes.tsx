import React from 'react';
import { Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  container: {
    borderRadius: '5px',
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    color: '#01475b !important',
    padding: '10px',
  },
}));

export const DoctorsNotes: React.FC = () => {
  const classes = useStyles();

  return (
    <Typography component="div" className={classes.container}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
      voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
      non proident Dunt in culpa qui officia deserunt mollit anim id est laborum. Teur sint occaecat
      cupidatat non proident
    </Typography>
  );
};
