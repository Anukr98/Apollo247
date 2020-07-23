import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { Header } from 'components/Header';
import { MedicineAutoSearch } from 'components/Medicine/MedicineAutoSearch';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
      backgroundColor: '#f7f8f5',
      minHeight: '90vh',
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 14,
      fontWeight: 'bold',
      color: '#02475b',
      textTransform: 'uppercase',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 16,
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 99,
      },
    },
    doctorListingPage: {
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        marginTop: 96,
      },
    },
    pageTopHeader: {
      backgroundColor: theme.palette.common.white,
      padding: '30px 40px',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      borderRadius: 5,
      minHeight: 378,
      [theme.breakpoints.down('xs')]: {
        padding: 0,
        boxShadow: 'none',
      },
    },
    medicineTopGroup: {
      display: 'flex',
      paddingTop: 25,
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        paddingTop: 0,
      },
    },
    searchSection: {
      width: 'calc(100% - 284px)',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
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
  };
});

export const MedicineSearch: React.FC = (props: any) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.breadcrumbs}>
          <Link to={clientRoutes.medicinePrescription()}>
            <div className={classes.backArrow} title={'Back to home page'}>
              <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
              <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
            </div>
          </Link>
        </div>
        <div className={classes.doctorListingPage}>
          <div className={classes.pageTopHeader}>
            <div className={classes.medicineTopGroup}>
              <div className={classes.searchSection}>
                <MedicineAutoSearch />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
