import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles((theme: Theme) => {
  return {
    serviceList: {
      paddingTop: '145px',
      paddingBottom: '40px',
    },
    serviceItem: {
      padding: '20px 65px 20px 20px',
      borderRadius: '10px',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f8f5',
      position: 'relative',
      '& p': {
        height: '36px',
        opacity: 0.5,
        fontSize: '12px',
        fontWeight: 'normal',
        lineHeight: 1.5,
        letterSpacing: 'normal',
        color: '#000000',
      }
    },
    action: {
      fontSize: '13px',
      fontWeight: 'bold',
      color: '#fc9916',
      textTransform: 'uppercase',
    },
    serviceImg: {
      width: '70px',
      height: '70px',
      borderRadius: '50%',
      position: 'absolute',
      top: '-15px',
      right: '-15px',
      backgroundColor: '#afc3c9',
    },
  };
});

export const ServiceList: React.FC = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.serviceList}>
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <Paper className={classes.serviceItem}>
            <div className={classes.serviceImg}>
            </div>
            <Typography variant="h5">You know which doctor you are looking for?</Typography>
            <p>Let’s get you connected with them.</p>
            <Link className={classes.action} to="/">
              Find specialist
            </Link>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper className={classes.serviceItem}>
            <div className={classes.serviceImg}>
            </div>
            <Typography variant="h5">Just want to buy medicines? It’s easy!</Typography>
            <p>You can search by name or prescription.</p>
            <Link className={classes.action} to="/">
              Search Medicine
            </Link>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper className={classes.serviceItem}>
            <div className={classes.serviceImg}>
            </div>
            <Typography variant="h5">Do you want to get some tests done?</Typography>
            <p>Get your tests/diagnostics booked here.</p>
            <Link className={classes.action} to="/">
              Book a test
            </Link>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper className={classes.serviceItem}>
            <div className={classes.serviceImg}>
            </div>
            <Typography variant="h5">Want to know how we have the best?</Typography>
            <p>Learn about our Star Doctors Program.</p>
            <Link className={classes.action} to="/">
              Who are star doctors
            </Link>
          </Paper>
        </Grid>                        
      </Grid>
    </div>
  );
};
