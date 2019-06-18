import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      color: 'blue',
    },
    booksLink: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
  };
});

export interface WelcomeProps {}

export const Welcome: React.FC<WelcomeProps> = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.welcome}>
      Welcome <img src={require('images/apollo.jpg')} />
      <div className={classes.booksLink}>
        <Link to={clientRoutes.doctors()}>Check out the doctors!</Link>
      </div>
    </div>
  );
};
