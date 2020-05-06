import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { BottomLinks } from 'components/BottomLinks';
import { Header } from 'components/Header';
import { NavigationBottom } from 'components/NavigationBottom';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      fontSize: 18,
      '& section': {
        paddingTop: 100,
        paddingBottom: 100,
        minHeight: '87vh',
        [theme.breakpoints.down(900)]: {
          paddingTop: 50,
          paddingBottom: 50,
        },
      },
      '& p': {
        marginBottom: 20,
        lineHeight: 1.5,
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      padding: 20,
      [theme.breakpoints.up('sm')]: {
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f7f8f5',
        padding: 40,
      },
    },
  };
});

export const ContactUs: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <h1>Contact Us</h1>
          <p>
            <b>Apollo Hospitals</b>
            <br />
            Rd Number 72,
            <br />
            opp. Bharatiya Vidya Bhavan School,
            <br />
            Jubilee Hills,
            <br />
            Hyderabad,
            <br />
            Telangana 500033
          </p>
        </div>
      </div>
      <BottomLinks />
      <NavigationBottom />
    </div>
  );
};
