import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme: Theme) => {
  return {
    ProfileContainer: {
      '& h2': {
        fontSize: 16,
        color: theme.palette.secondary.dark,
        marginBottom: '15px',
      },
    },
  };
});

export const FeesTab: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.ProfileContainer}>
      <Typography variant="h2">Fees Details</Typography>
    </div>
  );
};
