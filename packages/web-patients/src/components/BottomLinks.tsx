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
          [theme.breakpoints.down('xs')]: {
            borderBottom: '1px solid rgba(35, 43, 46, 0.86)',
            paddingBottom: 20,
            '&:last-child': {
              borderBottom: 'none',
            },
          },
          '& a': {
            color: '#fff',
            fontSize: 14,
            lineHeight: '24px',
            display: 'inline-block',
            width: '100%',
            textAlign: 'left',
            [theme.breakpoints.down('xs')]: {
              color: '#FCB716',
            },
            '&:hover': {
              textDecoration: 'none',
            },
            '&:first-child': {
              color: '#FCB716',
              marginBottom: 15,
              [theme.breakpoints.down('xs')]: {
                color: '#fff',
                textTransform: 'uppercase',
                marginTop: 15,
              },
            },
          },
        },
      },
    },
    logo: {
      paddingBottom: 11,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 12,
        paddingBottom: 9,
      },
      '& a': {
        display: 'block',
      },
      '& img': {
        maxWidth: 105,
        verticalAlign: 'middle',
      },
    },
    LogoMd: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    LogoXs: {
      display: 'none',
      borderBottom: 'none',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        '& a': {
          textAlign: 'center !important',
        },
      },
    },
  };
});

export const BottomLinks: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <div className={classes.bottomLinks}>
          <ul>
            <li className={classes.LogoMd}>
              <Link to="/" className={classes.logo}>
                <img
                  src={require('images/ic_logo.png')}
                  title={'Online Doctor Consultation & Medicines'}
                  alt={'Online Doctor Consultation & Medicines'}
                />
              </Link>
            </li>
            <li>
              <Link to="#">About Apollo 247</Link>
              <Link to={clientRoutes.aboutUs()}>About Us</Link>
              <Link to={clientRoutes.contactUs()}>Contact Us</Link>
              <Link to={clientRoutes.FAQ()}>FAQs</Link>
              <Link to={clientRoutes.termsConditions()}>Terms and Conditions</Link>
              <Link to={clientRoutes.privacy()}>Privacy Policy</Link>
              <Link to="#">Sitemap</Link>
            </li>
            <li>
              <Link to="#">Services</Link>
              <Link to="#">Online Doctor Consultation</Link>
              <Link to="#">Buy Medicines Online</Link>
              <Link to="#">Project Kavach</Link>
              <Link to="#">Consult A Pharmacognosist</Link>
              <Link to="#">Covid-19 Scanner</Link>
              <Link to="#">Cough Scanner</Link>
            </li>
            <li>
              <Link to="#">Top Specialties</Link>
              <Link to="#">Apollo Physicians</Link>
              <Link to="#">Apollo Dermatologists</Link>
              <Link to="#">Apollo Pediatricians</Link>
              <Link to="#">Apollo Gynaecologists</Link>
              <Link to="#">Apollo Gastroenterologists</Link>
              <Link to="#">Apollo Cardiologists</Link>
              <Link to="#">Apollo Dietitians</Link>
              <Link to="#">Apollo ENT Specialists</Link>
              <Link to="#">Apollo Geriatricians</Link>
              <Link to="#">Apollo Diabetologists</Link>
            </li>
            <li>
              <Link to="#">Product Categories</Link>
              <Link to="#">View All Brands</Link>
              <Link to="#">Health Care</Link>
              <Link to="#">Personal Care</Link>
              <Link to="#">Baby Care</Link>
              <Link to="#">Nutrition</Link>
              <Link to="#">Healthcare Devices</Link>
              <Link to="#">Beauty Skin Care</Link>
              <Link to="#">Cold Immunity</Link>
              <Link to="#">Coronavirus Prevention</Link>
              <Link to="#">Diabetic</Link>
            </li>
            <li className={classes.LogoXs}>
              <Link to="/" className={classes.logo}>
                <img
                  src={require('images/ic_logo.png')}
                  title={'Online Doctor Consultation & Medicines'}
                  alt={'Online Doctor Consultation & Medicines'}
                />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
