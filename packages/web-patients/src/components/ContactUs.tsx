import React from 'react';
import { Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: '#fff',
      marginTop: -88,
      fontSize: 18,
      [theme.breakpoints.down(900)]: {
        marginBottom: -80,
      },
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
      '& footer': {
        padding: '25px 0',
        textAlign: 'center',
        color: 'rgba(255,255,255,.3)',
        backgroundColor: '#222',
        fontSize: 12,
        '& p': {
          marginBottom: 10,
        },
        '& ul': {
          padding: 0,
          margin: 0,
          '& li': {
            listStyleType: 'none',
            display: 'inline-block',
            margin: '0 5px',
            '& a': {
              fontSize: 12,
              color: 'rgba(255,255,255,.3)',
            },
          },
        },
      },
    },
    container: {
      maxWidth: 1140,
      paddingLeft: 15,
      paddingRight: 15,
      margin: 'auto',
    },
  };
});

export const ContactUs: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <section>
        <div className={classes.container}>
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
      </section>
      <footer>
        <div className={classes.container}>
          <p>&copy; Apollo247 2020. All Rights Reserved.</p>
          <ul>
            <li>
              <Link
                to={clientRoutes.welcome()}
                onClick={(e) => {
                  window.location.href = clientRoutes.welcome();
                }}
              >
                Home
              </Link>
            </li>
            <li>
              <Link to={clientRoutes.privacy()}>Privacy</Link>
            </li>
            <li>
              <Link to={clientRoutes.termsConditions()}>Terms</Link>
            </li>
            <li>
              <Link to={clientRoutes.FAQ()}>FAQ</Link>
            </li>
            <li>
              <Link to={clientRoutes.contactUs()}>Contact Us</Link>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};
