import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import { SignIn } from 'components/SignIn';
import { Otp } from 'components/Otp';

const useStyles = makeStyles((theme: Theme) => {
  return {
    header: {
      display: 'flex',
      boxShadow: '0 0 5px 0 rgba(128, 128, 128, 0.2)',
      backgroundColor: '#ffffff',
      padding: '20px 20px 4px 20px',
    },
    logo: {
      '& a': {
        display: 'block',
      },
      '& img': {
        maxWidth: '77px',
      },
    },
    userAccount: {
      marginLeft: 'auto',
      '& img': {
        marginTop: '10px',
      },
    },
    userCircle: {
      display: 'block',
      width: '48px',
      height: '48px',
      backgroundColor: '#afc3c9',
      borderRadius: '50%',
      textAlign: 'center',
      cursor: 'pointer',
    },
    loginForm: {
      width: '280px',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: '#ffffff',
      '& label.Mui-focused': {
        color: '#02475b',
      },
      '& .MuiInputBase-root': {
        fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
      },
      '& .MuiInputBase-root:before': {
        borderBottomColor: '#00b38e',
        borderWidth: '2px',
      },
      '& .MuiInputBase-root:hover:before': {
        borderBottomColor: 'rgba(0, 0, 0, 0.5)',
      },
      '& .MuiInput-underline:after': {
        borderBottomColor: '#00b38e',
      },      
    },
    topPopover: {
      overflow: 'initial',
      '& .MuiPopover-paper': {
        overflow: 'initial',
        backgroundColor: 'none',
        boxShadow: 'none',
      },
    },
  };
});

export interface SignInProps {}

export const Header: React.FC = (props) => {
  const classes = useStyles();
  const [signedIn, setSignedIn] = React.useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <header className={classes.header}>
      <div className={classes.logo}>
        <Link to="/">
          <img src={require('images/ic_logo.png')} />
        </Link>
      </div>
      <div className={classes.userAccount}>
        <div className={classes.userCircle} aria-describedby={id} onClick={(e) => setAnchorEl(anchorEl ? null : e.currentTarget)}>
          <img src={require('images/ic_account.svg')} />
        </div>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          className={classes.topPopover}
        >
          <Paper className={classes.loginForm}>
            {
              signedIn ? 
              <Otp />
              :
              <SignIn onSignIn={(val) => setSignedIn(val)} />
            }
          </Paper>
        </Popover>
      </div>
    </header>
  );
};
