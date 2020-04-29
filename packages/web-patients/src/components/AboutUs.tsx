import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Theme } from '@material-ui/core';
import { Header } from 'components/Header';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
    },
    aboutUs: {
      padding: '24px 40px',
      borderRadius: '5px',
      backgroundColor: '#ffffff',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      [theme.breakpoints.down('sm')]: {
        padding: '24px 16px',
      },
    },
    bodyMain: {
      padding: '24px 40px',
      [theme.breakpoints.down('sm')]: {
        padding: '15px 16px',
      },
    },
    content: {
      fontSize: '16px',
      lineHeight: '26px',
      [theme.breakpoints.down('sm')]: {
        fontSize: '14px',
        lineHeight: '24px',
      },
    },
    image: {
      '& img': {
        maxWidth: '100%',
      },
    },
    headerText: {
      fontSize: '50px',
      fontWeight: 600,
      [theme.breakpoints.down('sm')]: {
        fontSize: '28px',
      },
    },
    headerSubText: {
      fontSize: '16px',
      [theme.breakpoints.down('sm')]: {
        fontSize: '14px',
      },
    },
    bodyPart: {
      backgroundColor: '#ffffff',
      borderRadius: '10px',
    },
    bodyText: {
      padding: '0 20px 24px 20px',
      [theme.breakpoints.down('sm')]: {
        padding: '15px 16px',
      },
    },
    desktopBanner: {
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'inline-block',
      },
    },
    mobileBanner: {
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
  };
});

export const AboutUs: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.aboutUs}>
          <div className={classes.headerText}>about us</div>
          <div className={classes.headerSubText}>
            know more about us, we are more than a hospital…
          </div>
        </div>
        <div className={classes.bodyMain}>
          <div className={classes.bodyPart}>
            <div className={classes.image}>
              <img className={classes.desktopBanner} src={require('images/img_aboutus.png')} />
              <img className={classes.mobileBanner} src={require('images/img_aboutus1.png')} />
            </div>
            <div className={classes.bodyText}>
              <p className={classes.content}>
                Apollo Hospitals was established in 1983 by Dr. Prathap C Reddy, renowned as the
                architect of modern healthcare in India. As the nation’s first corporate hospital,
                Apollo Hospitals is acclaimed for pioneering the private healthcare revolution in
                the country.
              </p>
              <p className={classes.content}>
                Apollo Hospitals has emerged as Asia’s foremost integrated healthcare services
                provider and has a robust presence across the healthcare ecosystem, including
                Hospitals, Pharmacies, Primary Care & Diagnostic Clinics and several retail health
                models. The Group also has Telemedicine facilities across several countries, Health
                Insurance Services, Global Projects Consultancy, Medical Colleges, Medvarsity for
                E-Learning, Colleges of Nursing and Hospital Management and a Research Foundation.
                In addition, ‘ASK Apollo’ - an online consultation portal and Apollo Home Health
                provide the care continuum.
              </p>
              <p className={classes.content}>
                The cornerstones of Apollo’s legacy are its unstinting focus on clinical excellence,
                affordable costs, modern technology and forward-looking research & academics. Apollo
                Hospitals was among the first few hospitals in the world to leverage technology to
                facilitate seamless healthcare delivery. The organization embraced the rapid
                advancement in medical equipments across the world, and pioneered the introduction
                of several cutting edge innovations in India. Recently, South East Asia’s first
                Proton Therapy Centre commenced operations at the Apollo Centre in Chennai.
              </p>
              <p className={classes.content}>
                Since its inception, Apollo Hospitals has been honoured by the trust of over 150
                million individuals who came from 140 countries. At the core of Apollo’s
                patient-centric culture is TLC (Tender Loving Care), the magic that inspires hope
                amongst its patients.
              </p>
              <p className={classes.content}>
                As a responsible corporate citizen, Apollo Hospitals takes the spirit of leadership
                well beyond business and has embraced the responsibility of keeping India healthy.
                Recognizing that Non Communicable Diseases (NCDs) are the greatest threat to the
                nation, Apollo Hospitals is continuously educating people about preventive
                healthcare as the key to wellness. Likewise, envisioned by Dr. Prathap C Reddy, the
                “Billion Hearts Beating Foundation” endeavours to keep Indians heart-healthy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
