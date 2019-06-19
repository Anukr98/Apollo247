import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import Popper from '@material-ui/core/Popper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme: Theme) => {
  return {
    signUpBar: {
      display: 'flex',
    },
    mascotCircle: {
      marginLeft: 'auto',
      cursor: 'pointer',
      paddingRight: '15px',
      paddingBottom: '10px',
      display: 'none',

      '& img': {
        maxWidth: '72px',
        maxHeight: '72px',
      },
    },
    signUpPop: {
      width: '368px',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: '#ffffff',
      marginLeft: 'auto',
      marginRight: '20px',
      marginBottom: '20px',
      '& p': {
        fontSize: '17px',
        fontWeight: 500,
        lineHeight: 1.41,
        color: '#0087ba',
      },
      '& input': {
        fontSize: '16px',
        fontWeight: 600,
        color: '#02475b',
      },
    },
    formControl: {
      marginBottom: '20px',

      '& label': {
        fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
        fontSize: '14px',
        fontWeight: 500,
        color: '#02475b',
      },

      '& input': {
        fontSize: '14px',
        fontWeight: 500,
        color: '#01475b',
      },
    },
    actions: {
      display: 'flex',
    },
    laterBtn: {
      marginRight: '10px',
      width: '50%',
      padding: '9px 13px',
      color: '#fc9916',
      fontSize: '13px',
      fontWeight: 'bold',
      backgroundColor: '#fff',
    },
    submitBtn: {
      marginLeft: '10px',
      width: '50%',
      color: '#fff',
      padding: '9px 13px',
      fontSize: '13px',
      fontWeight: 'bold',
    },
    btnGroup: {
      marginTop: '5px',
      '& button': {
        width: '100%',
        color: '#00b38e',
      }
    },
  };
});

export const SignUp: React.FC = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.signUpBar}>
      <div className={classes.mascotCircle}>
        <img src={require('images/ic_mascot.png')} alt="" />
      </div>
      <div className={classes.signUpPop}>
        <Typography variant="h2">welcome<br/> to apollo 24/7</Typography>
        <p>Let us quickly get to know you so that we can get you the best help :)</p>
        <form>
          <TextField
            className={classes.formControl}
            label="First Name"
            placeholder="Example, Jonathan"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            className={classes.formControl}
            label="Last Name"
            placeholder="Example, Donut"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            className={classes.formControl}
            label="Date Of Birth"
            placeholder="mm/dd/yyyy"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
          <div className={classes.formControl}>
            <label>Gender</label>
            <Grid container spacing={3} className={classes.btnGroup}>
              <Grid item xs={6} sm={4}>
                <Button variant="contained" className={classes.laterBtn}>
                  Male
                </Button>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Button variant="contained" className={classes.laterBtn}>
                  Female
                </Button>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Button variant="contained" className={classes.laterBtn}>
                  Other
                </Button>
              </Grid>
            </Grid>
          </div>
          <TextField
            className={classes.formControl}
            label="Email Address (Optional)"
            placeholder="name@email.com"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
          <div className={classes.actions}>
            <Button variant="contained" className={classes.laterBtn}>
              Fill Later
            </Button>
            <Button variant="contained" color="primary" className={classes.submitBtn}>
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
