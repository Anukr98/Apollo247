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
      paddingTop: 145,
      paddingBottom: 40,
      paddingLeft: 20,
      paddingRight: 20,
    },
    serviceItem: {
      padding: '20px 60px 20px 20px',
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.common.white,
      position: 'relative',
      '& p': {
        fontSize: 12,
        fontWeight: 'normal',
        lineHeight: 1.5,
        letterSpacing: 'normal',
        color: 'rgba(0,0,0,0.5)',
        marginTop: 5,
        marginBottom: 5,
      }
    },
    action: {
      fontSize: 13,
      fontWeight: 'bold',
      color: theme.palette.action.selected,
      lineHeight: 1.85,
      textTransform: 'uppercase',
    },
    serviceImg: {
      width: 70,
      height: 70,
      borderRadius: '50%',
      position: 'absolute',
      top: -10,
      right: -10,
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
