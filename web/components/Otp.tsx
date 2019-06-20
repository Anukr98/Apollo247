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
    loginFormWrap: {
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
        textAlign: 'center',
      },
    },
    inputAdornment: {
      color: '#02475b',
      '& p': {
        color: '#02475b',
        fontSize: '16px',
        fontWeight: 600,
      },
    },
    helpText: {
      fontSize: '12px',
      fontWeight: 500,
      color: '#02475b',
      margin: '10px 0',
    },
    action: {
      paddingTop: '10px',
      display: 'flex',

      '& button': {
        marginLeft: 'auto',
        marginRight: '-40px',
        backgroundColor: '#FED984',
        fontSize: '16px',
        fontWeight: 500,
        color: '#fff',
      },
    },
    resendBtn: {
      padding: 0,
      color: '#fc9916',
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'uppercase',
      marginTop: '10px',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  };
});

export const Otp: React.FC = (props) => {
  const classes = useStyles();
  const validateNumber = (e: any) => {
    const number = e.target.value;
    if (number >= 0 && number <= 9) {
      return true;
    } else {
      e.target.value = '';
      return false;
    }
  };

  return (
    <div className={classes.loginFormWrap}>
      <Typography variant="h2">hi</Typography>
      <p>Type in the OTP sent to you, to authenticate</p>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <FormControl fullWidth>
            <Input
              id="adornment-amount"
              defaultValue=""
              inputProps={{ maxLength: 1 }}
              onChange={(e) => validateNumber(e)}
            />
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={3}>
          <FormControl fullWidth>
            <Input id="adornment-amount" defaultValue="" inputProps={{ maxLength: 1 }} />
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={3}>
          <FormControl fullWidth>
            <Input id="adornment-amount" defaultValue="" inputProps={{ maxLength: 1 }} />
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={3}>
          <FormControl fullWidth>
            <Input id="adornment-amount" defaultValue="" inputProps={{ maxLength: 1 }} />
          </FormControl>
        </Grid>
      </Grid>
      <Button className={classes.resendBtn}>Resend OTP</Button>
      <div className={classes.action}>
        <Fab color="primary" aria-label="Add">
          OK
        </Fab>
      </div>
    </div>
  );
};
