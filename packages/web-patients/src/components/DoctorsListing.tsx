import { BottomNavigation, Theme, Typography, Grid } from '@material-ui/core';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { ManageProfile } from 'components/ManageProfile';
import React from 'react';
import { DoctorsFilter } from 'components/DoctorsFilter';
import { DoctorCard } from './doctorCard';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 85,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 78,
      },
    },
    booksLink: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    bottomMenuRoot: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      bottom: 0,
      height: 'auto',
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
      '& button': {
        padding: '10px 0',
      },
    },
    labelRoot: {
      width: '100%',
    },
    iconLabel: {
      fontSize: 12,
      color: '#67919d',
      paddingTop: 10,
      textTransform: 'uppercase',
    },
    iconSelected: {
      fontSize: '12px !important',
      color: theme.palette.primary.main,
    },
    doctorListingPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 15,
      paddingBottom: 10,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      borderBottom: '1px solid rgba(1,71,91,0.3)',
    },
    doctorListingSection: {
      display: 'flex',
      padding: 20,
    },
    searchSection: {
      width: 'calc(100% - 328px)',
      paddingLeft: 20,
    },
    pageHeader: {
      fontSize: 17,
      fontWeight: 500,
      color: '#0087ba',
      borderBottom: '1px solid rgba(1,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
      marginBottom: 20,
    },
    filterSection: {
      marginLeft: 'auto',
      '& button:last-child': {
        marginRight: 0,
      },
    },
    filterButton: {
      boxShadow: 'none',
      fontSize: 12,
      fontWeight: 500,
      color: '#658f9b',
      backgroundColor: 'transparent',
      textTransform: 'none',
      borderBottom: '5px solid #f7f8f5',
      borderRadius: 0,
      paddingLeft: 0,
      paddingRight: 0,
      marginLeft: 10,
      marginRight: 10,
    },
    buttonActive: {
      borderBottom: '5px solid #00b38e',
      color: '#02475b',
    },
  };
});

export const DoctorsListing: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.welcome}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container}>
        <div className={classes.doctorListingPage}>
          <div className={classes.breadcrumbs}>Doctors / Specialities</div>
          <div className={classes.doctorListingSection}>
            {/* <DoctorsFilter /> */}
            <div className={classes.searchSection}>
              <Typography variant="h2">Okay!</Typography>
              <div className={classes.pageHeader}>
                <div>Here are our best General Physicians</div>
                <div className={classes.filterSection}>
                  <AphButton className={`${classes.filterButton} ${classes.buttonActive}`}>
                    All Consults
                  </AphButton>
                  <AphButton className={classes.filterButton}>Online Consult</AphButton>
                  <AphButton className={classes.filterButton}>Clinic Visit</AphButton>
                </div>
              </div>
              {/* <Grid container spacing={2}>
                <Grid item sm={12} md={6}>
                  <DoctorCard />
                </Grid>
                <Grid item sm={12} md={6}>
                  <DoctorCard />
                </Grid>
                <Grid item sm={12} md={6}>
                  <DoctorCard />
                </Grid>
                <Grid item sm={12} md={6}>
                  <DoctorCard />
                </Grid>
                <Grid item sm={12} md={6}>
                  <DoctorCard />
                </Grid>
                <Grid item sm={12} md={6}>
                  <DoctorCard />
                </Grid>
                <Grid item sm={12} md={6}>
                  <DoctorCard />
                </Grid>
                <Grid item sm={12} md={6}>
                  <DoctorCard />
                </Grid>
              </Grid> */}
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation showLabels className={classes.bottomMenuRoot}>
        <BottomNavigationAction
          label="Consult Room"
          icon={<img src={require('images/ic_consultroom.svg')} />}
          classes={{
            root: classes.labelRoot,
            label: classes.iconLabel,
            selected: classes.iconSelected,
          }}
        />
        <BottomNavigationAction
          label="Health Records"
          icon={<img src={require('images/ic_myhealth.svg')} />}
          classes={{
            root: classes.labelRoot,
            label: classes.iconLabel,
            selected: classes.iconSelected,
          }}
        />
        <BottomNavigationAction
          label="Tests & Medicines"
          icon={<img src={require('images/ic_orders.svg')} />}
          classes={{
            root: classes.labelRoot,
            label: classes.iconLabel,
            selected: classes.iconSelected,
          }}
        />
        <BottomNavigationAction
          label="My Account"
          icon={<img src={require('images/ic_account_dark.svg')} />}
          classes={{
            root: classes.labelRoot,
            label: classes.iconLabel,
            selected: classes.iconSelected,
          }}
        />
      </BottomNavigation>
      <ManageProfile />
    </div>
  );
};
