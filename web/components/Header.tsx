import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import { SignIn } from 'components/SignIn';
import { useAuthenticating } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    header: {
      display: 'flex',
      boxShadow: '0 -5px 5px 0 rgba(128, 128, 128, 0.2)',
      backgroundColor: '#ffffff',
      padding: '20px 20px 4px 20px',
      borderBottom: 'solid 1px #f0f1ec',
    },
    logo: {
      '& a': {
        display: 'block',
      },
      '& img': {
        maxWidth: 77,
      },
    },
    userAccount: {
      marginLeft: 'auto',
      '& img': {
        marginTop: 10,
      },
    },
    userCircle: {
      display: 'block',
      width: 48,
      height: 48,
      backgroundColor: '#afc3c9',
      borderRadius: '50%',
      textAlign: 'center',
      cursor: 'pointer',
    },
    loginForm: {
      width: 280,
      padding: 20,
      borderRadius: 10,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: '#ffffff',
    },
    topPopover: {
      overflow: 'initial',
      backgroundColor: 'none',
      boxShadow: 'none',
    },
  };
});

export interface SignInProps { }

export const Header: React.FC = (props) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const authenticating = useAuthenticating();

  return (
    <header className={classes.header}>
      <div className={classes.logo}>
        <Link to="/">
          <img src={require('images/ic_logo.png')} />
        </Link>
      </div>
      <div className={classes.userAccount}>
        <div
          className={classes.userCircle}
          onClick={(e) => setAnchorEl(anchorEl ? null : e.currentTarget)}
        >
          {authenticating ? <CircularProgress /> : <img src={require('images/ic_account.svg')} />}
        </div>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          classes={{ paper: classes.topPopover }}
        >
          <Paper className={classes.loginForm}>
            <SignIn />
          </Paper>
        </Popover>
      </div>
    </header>
  );
};
