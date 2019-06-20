import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import Popper from '@material-ui/core/Popper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';

const useStyles = makeStyles((theme: Theme) => {
  return {
    loginFormWrap: {
      '& p': {
        fontSize: '17px',
        fontWeight: 500,
        lineHeight: 1.41,
        color: '#0087ba',
        marginTop: '5px',
        marginBottom: '30px',
      },
      '& input': {
        fontSize: '16px',
        fontWeight: 600,
        color: '#02475b',
      }
    },
    inputAdornment: {
      color: '#02475b',
      '& p': {
        color: '#02475b',
        fontSize: '16px',
        fontWeight: 600,
        marginBottom: '7px',
      }
    },
    helpText: {
      fontSize: '12px',
      fontWeight: 500,
      color: '#02475b',
      marginTop: '10px',
      lineHeight: 2,
    },
    action: {
      paddingTop: 0,
      display: 'flex',

      '& button': {
        marginLeft: 'auto',
        marginRight: '-40px',
        backgroundColor: '#FED984',
      }
    }
  };
});

export interface SignInProps {
 onSignIn: (signedIn:boolean) => void; 
}

const isMobileNumberValid = (number:string) => {
  return (/^\d{10}$/.test(number)) ? true : false;
}

export const SignIn: React.FC<SignInProps> = (props) => {
  const classes = useStyles();
  const { onSignIn } = props;
  return (
    <div className={classes.loginFormWrap}>
      <Typography variant="h2">hi</Typography>
      <p>Please enter your mobile number to login</p>
      <FormControl fullWidth>
        <Input
          id="adornment-amount"
          defaultValue=""
          type="number"
          inputProps={{ maxLength: 10 }}
          onChange={(e) => onSignIn(isMobileNumberValid(e.currentTarget.value))}
          startAdornment={<InputAdornment className={classes.inputAdornment} position="start">+91</InputAdornment>}
        />
        <div className={classes.helpText}>
          OTP will be sent to this number
        </div>
      </FormControl>
      <div className={classes.action}>
        <Fab color="primary" aria-label="Add">
          <img src={require('images/ic_arrow_forward.svg')} alt="" />
        </Fab>
      </div>
    </div>
  );
};
