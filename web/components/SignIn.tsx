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
      },
    },
    inputAdornment: {
      color: '#02475b',
      '& p': {
        color: '#02475b',
        fontSize: '16px',
        fontWeight: 600,
<<<<<<< HEAD
      },
=======
        marginBottom: '7px',
      }
>>>>>>> origin/development
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
      },
    },
  };
});

export interface SignInProps {}

export interface SignInProps {
  onSignIn: (signedIn: boolean) => void;
}

export const SignIn: React.FC<SignInProps> = (props) => {
  const classes = useStyles();
  const [showSignInArrow, updateSignInArrowView] = React.useState<boolean>(false);
  const signInArrowImage = <img src={require('images/ic_arrow_forward.svg')} alt="" />;
  const { onSignIn } = props;

  const validateMobileNumber = (event: any) => {
    const number = event.target.value;
    if (/^\d+$/.test(number)) {
      const validationStatus = /^\d{10}$/.test(number) ? true : false;
      updateSignInArrowView(validationStatus);
    } else {
      event.target.value = number.replace(/\D/g, '');
      return false;
    }
  };

  return (
    <div className={classes.loginFormWrap}>
      <Typography variant="h2">hi</Typography>
      <p>Please enter your mobile number to login</p>
      <FormControl fullWidth>
        <Input
          id="adornment-amount"
          defaultValue=""
          inputProps={{ maxLength: 10 }}
          onChange={(e) => validateMobileNumber(e)}
          startAdornment={
            <InputAdornment className={classes.inputAdornment} position="start">
              +91
            </InputAdornment>
          }
        />
        <div className={classes.helpText}>OTP will be sent to this number</div>
      </FormControl>
      <div className={classes.action}>
        {showSignInArrow ? (
          <Fab color="primary" aria-label="Add" onClick={(e) => onSignIn(true)}>
            {signInArrowImage}
          </Fab>
        ) : (
          <Fab color="primary" aria-label="Add" disabled>
            {signInArrowImage}
          </Fab>
        )}
      </div>
    </div>
  );
};
