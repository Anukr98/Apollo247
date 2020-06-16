import React from 'react';
import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { Header } from 'components/Header';
import { BottomLinks } from 'components/BottomLinks';
import { AphButton } from '@aph/web-ui-components';
import { Filters } from 'components/Doctors/Filters';
import { InfoCard } from 'components/Doctors/InfoCard';
import { BookBest } from 'components/Doctors/BookBest';
import { FrequentlyQuestions } from 'components/Doctors/FrequentlyQuestions';
import { WhyApollo } from 'components/Doctors/WhyApollo';
import { HowItWorks } from 'components/Doctors/HowItWorks';
import { AddedFilters } from 'components/Doctors/AddedFilters';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 10,
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    doctorListingPage: {
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        position: 'absolute',
        top: 0,
        zIndex: 99,
        width: '100%',
      },
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 17,
      paddingBottom: 11,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 20,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        top: 0,
        width: 48,
        height: 48,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    breadcrumbLinks: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 13,
      color: '#007c93',
      fontWeight: 600,
      '& a': {
        paddingLeft: 5,
        paddingRight: 5,
        color: '#fca317',
      },
      '& span': {
        paddingLeft: 5,
        paddingRight: 5,
      },
    },
    pageContent: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: 20,
      },
    },
    leftGroup: {
      padding: 20,
      [theme.breakpoints.up('sm')]: {
        width: 'calc(100% - 328px)',
        padding: 0,
        paddingRight: 20,
      },
    },
    rightBar: {
      [theme.breakpoints.up('sm')]: {
        width: 328,
      },
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      '& h3': {
        margin: 0,
        color: '#01667c',
        fontSize: 20,
        fontWeight: 600,
        lineHeight: '25px',
      },
      '& button': {
        marginLeft: 'auto',
        boxShadow: 'none',
        padding: 0,
        minWidth: 'auto',
      },
    },
    tabsFilter: {
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
      marginTop: 10,
      '& h4': {
        fontSize: 16,
        fontWeight: 600,
        margin: 0,
        color: '#00a7b9',
      },
    },
    filterButtons: {
      marginLeft: 'auto',
      '& button': {
        boxShadow: 'none',
        fontSize: 12,
        fontWeight: 500,
        color: '#658f9b',
        backgroundColor: 'transparent',
        textTransform: 'none',
        borderBottom: '5px solid transparent',
        borderRadius: 0,
        padding: 10,
      }, 
    },
    buttonActive: {
      borderBottom: '5px solid #00b38e !important',
      color: '#02475b !important',
    },
    stickyBlock: {
      position: 'sticky',
    },
  };
});


export const SpecialtyDetails: React.FC = (props) => {
  const classes = useStyles({});
  const [isFilterOpen, setisFilterOpen] = React.useState(false);

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.doctorListingPage}>
          <div className={classes.breadcrumbs}>
              <Link to={clientRoutes.doctorsLanding()}>
                <div className={classes.backArrow} title={'Back to home page'}>
                  <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                  <img
                    className={classes.whiteArrow}
                    src={require('images/ic_back_white.svg')}
                  />
                </div>
              </Link>
              <div className={classes.breadcrumbLinks}>
                <Link to={clientRoutes.welcome()}>Home</Link>
                <img src={require('images/triangle.svg')} alt="" />
                <Link to={clientRoutes.doctorsLanding()}>Specialty</Link>
                <img src={require('images/triangle.svg')} alt="" />
                <span>Family Physician</span>
              </div>
          </div>
          <div className={classes.pageContent}>
            <div className={classes.leftGroup}>
              <div className={classes.sectionHeader}>
                <h3>Book Best Doctors - Family Physicians</h3>
                <AphButton><img src={require('images/ic-share-green.svg')} alt="" /></AphButton>
              </div>
              <div className={classes.tabsFilter}>
                <h4>27 Doctors found near Madhapur</h4>
                <div className={classes.filterButtons}>
                  <AphButton className={classes.buttonActive}>Apollo Doctors (14)</AphButton>
                  <AphButton>Doctor Partners (13)</AphButton>
                </div>
              </div>
              <Filters />
              <AddedFilters />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={6}>
                  <InfoCard />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={6}>
                  <InfoCard />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={6}>
                  <InfoCard />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={6}>
                  <InfoCard />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={6}>
                  <InfoCard />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={6}>
                  <InfoCard />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={6}>
                  <InfoCard />
                </Grid>
              </Grid>
              <BookBest />
              <FrequentlyQuestions />
            </div>
            <div className={classes.rightBar}>
              <div className={classes.stickyBlock}>
                <WhyApollo />
                <HowItWorks />
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomLinks />
    </div>
  );
};
