import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Header } from './Header';
import { Theme, Typography, Grid } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { NavigationBottom } from 'components/NavigationBottom';
import { BottomLinks } from 'components/BottomLinks';
import { readableParam } from 'helpers/commonHelpers';

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
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
      },
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
    ulContent: {
      width: '30%',
      padding: '0 30px',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        padding: '0 0 10px',
      },
    },
  };
});

interface TopSpecialtyType {
  specialtyName: string;
  slugName: string;
}
interface TopPharmacyLinkType {
  title: string;
  url_key: string;
}
const PageNotFound: React.FC = () => {
  const shopBy = 'shop-by-healthareas';
  const classes = useStyles({});
  const topSpecialtyListing = [
    {
      specialtyName: 'Paediatrics',
      slugName: 'Paediatrics',
    },
    {
      specialtyName: 'General Physician',
      slugName: 'General Physician/ Internal Medicine',
    },
    {
      specialtyName: 'Dermatology',
      slugName: 'Dermatology',
    },
    {
      specialtyName: 'Gynaecology',
      slugName: 'Obstetrics & Gynaecology',
    },
  ];
  const pharmacyLinkListing = [
    {
      title: 'Corona-virus Care',
      url_key: 'coronavirus-prevention',
    },
    {
      title: 'Cold & Immunity',
      url_key: 'cold-immunity',
    },
    {
      title: 'Diabetes Care',
      url_key: 'diabetic',
    },
    {
      title: 'Pain Relief',
      url_key: 'pain-relief',
    },
    {
      title: 'Skin Care',
      url_key: 'beauty-skin-car',
    },
    {
      title: 'Cardiac',
      url_key: 'cardiac',
    },
    {
      title: 'Stomach Care',
      url_key: 'stomach-care',
    },
    {
      title: 'Respiratory',
      url_key: 'respiratory',
    },
    {
      title: 'Sexual Health',
      url_key: 'sexual-health',
    },
    {
      title: 'Eye and Ear Care',
      url_key: 'eye-ear-care',
    },
    {
      title: 'Adult Care',
      url_key: 'adult-care',
    },
  ];
  const covid19LinkListing = [
    {
      title: 'Latest Updates',
      url_key: 'covid19',
    },
    {
      title: 'Check your Risk Level',
      url_key: 'covid19/cough-scan',
    },
    {
      title: 'About Us',
      url_key: 'aboutUs',
    },
    {
      title: 'Frequently Asked Questions',
      url_key: 'faq',
    },
    {
      title: 'Terms & Conditions',
      url_key: 'terms',
    },
  ];
  const searchText = shopBy.replace(/_/g, '-');
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
            <div className={classes.gridContainer}>
              <div className={classes.ulContent}>
                <Typography component="h4">Doctors</Typography>
                <ul className={classes.usefulLinksList}>
                  {topSpecialtyListing &&
                    topSpecialtyListing.length > 0 &&
                    topSpecialtyListing.map((specialityDetails: TopSpecialtyType, index) => {
                      return (
                        <li key={index}>
                          <Link
                            to={clientRoutes.specialties(readableParam(specialityDetails.slugName))}
                          >
                            {specialityDetails.specialtyName}
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              </div>
              <div className={classes.ulContent}>
                <Typography component="h4">Pharmacy</Typography>
                <ul className={classes.usefulLinksList}>
                  {pharmacyLinkListing &&
                    pharmacyLinkListing.length > 0 &&
                    pharmacyLinkListing.map((phamacyLink: TopPharmacyLinkType, index) => {
                      return (
                        <li key={index}>
                          <Link to={clientRoutes.searchByMedicine(searchText, phamacyLink.url_key)}>
                            {phamacyLink.title}
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              </div>
              <div className={classes.ulContent}>
                <Typography component="h4">Covid 19</Typography>
                <ul className={classes.usefulLinksList}>
                  {covid19LinkListing &&
                    covid19LinkListing.length > 0 &&
                    covid19LinkListing.map((covid19: TopPharmacyLinkType, index) => (
                      <li key={index}>
                        <Link to={covid19.url_key}>{covid19.title}</Link>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
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
