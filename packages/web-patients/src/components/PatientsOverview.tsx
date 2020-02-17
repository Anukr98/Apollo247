import React from 'react';
import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 40,
      [theme.breakpoints.down('xs')]: {
        padding: 20,
      },
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 12,
      fontSize: 17,
      fontWeight: 500,
      color: '#01475b',
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
    },
    totalConsults: {
      width: 40,
      height: 40,
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      color: '#0087ba',
      fontSize: 18,
      lineHeight: '40px',
      marginRight: 8,
      textAlign: 'center',
    },
    rightArrow: {
      marginLeft: 'auto',
      '& img': {
        verticalAlign: 'middle',
      },
    },
  };
});

export const PatientsOverview: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid spacing={2} container>
        <Grid item xs={12} sm={6}>
          <div className={classes.card}>
            <div className={classes.totalConsults}>3</div>
            <span>Upcoming Appointments</span>
            <span className={classes.rightArrow}>
              <img src={require('images/ic_arrow_right.svg')} />
            </span>
          </div>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div className={classes.card}>
            <div className={classes.totalConsults}>6</div>
            <span>Active Orders</span>
            <span className={classes.rightArrow}>
              <img src={require('images/ic_arrow_right.svg')} />
            </span>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};
