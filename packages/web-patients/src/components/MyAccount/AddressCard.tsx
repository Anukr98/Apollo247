import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: theme.palette.common.white,
      padding: 10,
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.43,
      color: '#02475b',
      cursor: 'pointer',
    },
  };
});

export const AddressCard: React.FC = (props) => {
  const classes = useStyles();

  return (
    <Grid container spacing={2}>
      <Grid item sm={6}>
        <div className={classes.root}>
          27/A, Kalpataru Enclave
          <br /> Jubilee Hills
          <br /> Hyderabad, Telangana — 500033
        </div>
      </Grid>
      <Grid item sm={6}>
        <div className={classes.root}>
          27/A, Kalpataru Enclave
          <br /> Jubilee Hills
          <br /> Hyderabad, Telangana — 500033
        </div>
      </Grid>
      <Grid item sm={6}>
        <div className={classes.root}>
          27/A, Kalpataru Enclave
          <br /> Jubilee Hills
          <br /> Hyderabad, Telangana — 500033
        </div>
      </Grid>
    </Grid>
  );
};
