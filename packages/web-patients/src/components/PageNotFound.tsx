import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Header } from './Header';
import { Theme, Typography, Grid } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { NavigationBottom } from 'components/NavigationBottom';
import { BottomLinks } from 'components/BottomLinks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    pnfContainer: {},
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pnfContent: {
      background: '#f9f9f9',
      padding: 30,
    },
    pnfTopContent: {
      display: 'flex',
      alignItems: 'center',
      padding: '30px 0',
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
      },
      '& >img': {
        flex: '1 0 auto',
        textAlign: 'center',
        [theme.breakpoints.down('sm')]: {
          width: 200,
        },
      },
    },
    pnfDetails: {
      flex: '1 0 auto',
      [theme.breakpoints.down('sm')]: {
        textAlign: 'center',
      },
      '& >img': {
        margin: '0 0 10px',
        [theme.breakpoints.down('sm')]: {
          width: 250,
        },
      },
      '& h2': {
        fontSize: 24,
        lineHeight: '40px',
        fontWeight: 700,
      },
      '& p': {
        fontSize: 16,
        lineHeight: '28px',
        fontWeight: 400,
        letterSpacing: 4,
        color: '#c4c4c4',
      },
      '& a': {
        fontSize: 20,
        lineHeight: '28px',
        fontWeight: 700,
        color: '#FC9916',
        textTransform: 'uppercase',
        letterSpacing: 3,
        margin: '20px 0 0',
        display: 'block',
        '& img': {
          margin: '0 0 0 10px',
          display: 'inline-block',
        },
      },
    },
    usefulLinks: {
      padding: '30px 30px 0',
      [theme.breakpoints.down('sm')]: {
        padding: '30px 0 0',
      },
      '& h3': {
        width: '70%',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative',
        [theme.breakpoints.down('sm')]: {
          width: '100%',
        },
        '&:before': {
          content: "''",
          position: 'absolute',
          top: 12,
          left: 0,
          right: 0,
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          zIndex: 0,
        },
        '& span': {
          fontSize: 18,
          fontWeight: 500,
          lineHeight: '26px',
          color: '#979797',
          padding: '0 20px',
          background: '#fff',
          textTransform: 'uppercase',
          position: 'relative',
          zIndex: 2,
        },
      },
    },
    usefulLinksList: {
      margin: '0 0 20px',
      padding: 0,
      listStyle: 'none',
      '& li': {
        '& a': {
          padding: '10px 0',
          fontSize: 16,
          fontWeight: 500,
          lineHeight: '26px',
        },
      },
    },
    gridContainer: {
      padding: '30px 0 0',
      '& h4': {
        fontSize: 20,
        fontWeight: 700,
        lineHeight: '26px',
        margin: '0 0 20px',
        textTransform: 'uppercase',
      },
    },
    footerLinks: {
      [theme.breakpoints.down(900)]: {
        display: 'none',
      },
    },
  };
});

const PageNotFound: React.FC = (props) => {
  const classes = useStyles({});
  return (
    <div className={classes.pnfContainer}>
      <Header />
      <div className={classes.container}>
        <div className={classes.pnfContent}>
          <div className={classes.pnfTopContent}>
            <img src={require('images/bulb.svg')} alt="Page Not Found" />
            <div className={classes.pnfDetails}>
              <img src={require('images/fouro4.svg')} alt="Page Not Found" />
              <Typography component="h2">Looks like you are lost !</Typography>
              <Typography>The Requested Page Does Not Exist.</Typography>
              <Link to={clientRoutes.welcome()}>
                Go To Apollo 24|7 Homepage <img src={require('images/arrow-orange.svg')} alt="" />
              </Link>
            </div>
          </div>
          <div className={classes.usefulLinks}>
            <Typography component="h3">
              <span>Useful Links</span>
            </Typography>
            <Grid container spacing={2} className={classes.gridContainer}>
              <Grid item xs={12} md={4}>
                <Typography component="h4">Doctors</Typography>
                <ul className={classes.usefulLinksList}>
                  <li>
                    <Link to="#">Consult Online</Link>
                  </li>
                  <li>
                    <Link to="#">Speciality 1</Link>
                  </li>
                  <li>
                    <Link to="#">Speciality 2</Link>
                  </li>
                  <li>
                    <Link to="#">Speciality 3</Link>
                  </li>
                </ul>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography component="h4">Pharmacy</Typography>
                <ul className={classes.usefulLinksList}>
                  <li>
                    <Link to="#">Order Medicines</Link>
                  </li>
                  <li>
                    <Link to="#">Healthcare Products</Link>
                  </li>
                  <li>
                    <Link to="#">Ayurvedic Products</Link>
                  </li>
                  <li>
                    <Link to="#">Surgicals</Link>
                  </li>
                  <li>
                    <Link to="#">Diabetes care</Link>
                  </li>
                  <li>
                    <Link to="#">Pain Releif</Link>
                  </li>
                  <li>
                    <Link to="#">Cold &amp; Immunity</Link>
                  </li>
                  <li>
                    <Link to="#">Cardiac</Link>
                  </li>
                  <li>
                    <Link to="#">Stomach care</Link>
                  </li>
                  <li>
                    <Link to="#">Respiratory</Link>
                  </li>
                  <li>
                    <Link to="#">Sexual Health</Link>
                  </li>
                  <li>
                    <Link to="#">Eye &amp; Ear care</Link>
                  </li>
                  <li>
                    <Link to="#">Adult care</Link>
                  </li>
                </ul>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography component="h4">Covid 19</Typography>
                <ul className={classes.usefulLinksList}>
                  <li>
                    <Link to="#">Latest Updates</Link>
                  </li>
                  <li>
                    <Link to="#">Check your Risk Level</Link>
                  </li>
                  <li>
                    <Link to="#">Call our Experts</Link>
                  </li>
                  <li>
                    <Link to="#">About Us</Link>
                  </li>
                  <li>
                    <Link to="#">Frequently Asked Questions</Link>
                  </li>
                  <li>
                    <Link to="#">Terms &amp; Conditions</Link>
                  </li>
                </ul>
              </Grid>
            </Grid>
          </div>
        </div>
        <div className={classes.footerLinks}>
          <BottomLinks />
        </div>
        <NavigationBottom />
      </div>
    </div>
  );
};

export default PageNotFound;
