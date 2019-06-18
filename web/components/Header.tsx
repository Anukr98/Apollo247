import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    header: {
      display: 'flex',
      boxShadow: '0 0 5px 0 rgba(128, 128, 128, 0.2)',
      backgroundColor: '#ffffff',
      padding: '20px 20px 3px 20px',
    },
    logo: {
      '& a': {
        display: 'block',
      },
      '& img': {
        maxWidth: '80px',
      },
    },
    userAccount: {
      marginLeft: 'auto',
      '& a': {
        display: 'block',
        width: '48px',
        height: '48px',
        backgroundColor: '#afc3c9',
        borderRadius: '50%',
        textAlign: 'center',
      },
      '& img': {
        marginTop: '10px',
      },
    },
  };
});

export const Header: React.FC = (props) => {
  const classes = useStyles();
  return (
    <header className={classes.header}>
      <div className={classes.logo}>
        <Link to="/">
          <img src={require('images/ic_logo.svg')} />
        </Link>
      </div>
      <div className={classes.userAccount}>
        <Link to="/">
          <img src={require('images/ic_account.svg')} />
        </Link>
      </div>
    </header>
  );
};
