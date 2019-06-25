import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles((theme: Theme) => {
  return {
    serviceList: {
      paddingTop: '145px',
      paddingBottom: '40px',

      '& .MuiGrid-container': {
        paddingLeft: '20px',
        paddingRight: '20px',
      },
    },
    serviceItem: {
      padding: '20px 60px 20px 20px',
      borderRadius: '10px',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f8f5',
      position: 'relative',
      '& p': {
        fontSize: '12px',
        fontWeight: 'normal',
        lineHeight: 1.5,
        letterSpacing: 'normal',
        color: 'rgba(0,0,0,0.5)',
        marginTop: '5px',
        marginBottom: '5px',
      },
    },
    action: {
      fontSize: '13px',
      fontWeight: 'bold',
      color: '#fc9916',
      lineHeight: 1.85,
      textTransform: 'uppercase',
    },
    serviceImg: {
      width: '70px',
      height: '70px',
      borderRadius: '50%',
      position: 'absolute',
      top: '-10px',
      right: '-10px',
      backgroundColor: '#afc3c9',

      '& img': {
        maxWidth: '100%',
      },
    },
  };
});

export const ServiceList: React.FC = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.serviceList}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Paper className={classes.serviceItem}>
            <div className={classes.serviceImg}>
              <img src={require('images/ic_placeholder.png')} />
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
              <img src={require('images/ic_placeholder.png')} />
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
              <img src={require('images/ic_placeholder.png')} />
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
              <img src={require('images/ic_placeholder.png')} />
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
