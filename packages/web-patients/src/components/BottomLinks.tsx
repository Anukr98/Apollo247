import React from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    bottomLinks: {
      backgroundColor: '#020d11',
      padding: 20,
      [theme.breakpoints.up('sm')]: {
        paddingTop: 30,
        paddingBottom: 30,
      },
      '& ul': {
        padding: 0,
        margin: 0,
        [theme.breakpoints.up('sm')]: {
          display: 'flex',
          alignItems: 'center',
        },        
        '& li': {
          listStyleType: 'none',
          paddingTop: 6,
          paddingBottom: 6,
          [theme.breakpoints.up('sm')]: {
            padding: '0 8px',
            width: '20%',
            textAlign: 'center',
          },
          '& a': {
            color: '#fff',
            fontSize: 14,
            '&:hover': {
              textDecoration: 'none',
            },
          },
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
          <ul>
            <li>
              <Link to={clientRoutes.aboutUs()}>About Us</Link>
            </li>
            <li>
              <Link to={clientRoutes.FAQ()}>Frequently Asked Questions</Link>
            </li>
            <li>
              <Link to={clientRoutes.termsConditions()}>
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link to={clientRoutes.privacy()}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to={clientRoutes.contactUs()}>
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
