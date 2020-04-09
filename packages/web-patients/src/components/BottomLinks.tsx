import React from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
      [theme.breakpoints.down(900)]: {
        display: 'none',
      },
      [theme.breakpoints.up(901)]: {
        paddingBottom: 20,
        paddingTop: 20,
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    bottomLinks: {
      textAlign: 'center',
      '& a': {
        marginLeft: 8,
        marginRight: 8,
        color: '#01475b',
        fontSize: 13,
        textDecoration: 'underline',
        '&:hover': {
          textDecoration: 'none',
        },
      },
    },
  };
});

export const BottomLinks: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <div className={classes.bottomLinks}>
          <Link to={clientRoutes.termsConditions()} target="_blank">Terms & Conditions</Link>
          <Link to={clientRoutes.privacy()} target="_blank">Privacy Policy</Link>
          <Link to={clientRoutes.contactUs()} target="_blank">Contact Us</Link>
        </div>
      </div>
    </div>
  );
};
