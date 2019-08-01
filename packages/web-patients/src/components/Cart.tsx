import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Scrollbars from 'react-custom-scrollbars';
import { MedicineCard } from 'components/MedicineCard';
import { MedicineStripCard } from 'components/MedicineStripCard';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 20,
      paddingBottom: 20,
      paddingRight: 20,
      PaddingLeft: 3,
      display: 'flex',
    },
    leftSection: {
      width: 'calc(100% - 328px)',
      paddingRight: 5,
    },
    rightSection: {
      width: 328,
      backgroundColor: theme.palette.common.white,
      padding: '20px 5px',
      borderRadius: 5,
    },
    medicineSection: {
      paddingLeft: 15,
      paddingRight: 15,
    },
    sectionGroup: {
      marginBottom: 10,
    },
    serviceType: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: 10,
      paddingbottom: 8,
      display: 'flex',
      width: '100%',
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
    },
    textVCenter: {
      alignItems: 'center',
      minHeight: 54,
      paddingbottom: 10,
    },
    serviceImg: {
      marginRight: 20,
      '& img': {
        maxWidth: 49,
        verticalAlign: 'middle',
      },
    },
    serviceIcon: {
      marginRight: 10,
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
      },
    },
    rightArrow: {
      width: 24,
      marginLeft: 'auto',
    },
    linkText: {
      letterSpacing: 'normal',
      paddingRight: 10,
    },
    serviceinfoText: {
      marginTop: 10,
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: 0.04,
      opacity: 0.6,
      lineHeight: 1.67,
      color: '#02475b',
      borderTop: '0.5px solid rgba(2,71,91,0.2)',
      paddingTop: 10,
      paddingBottom: 10,
      display: 'inline-block',
      width: '100%',
    },
    marginNone: {
      marginBottom: 'none',
    },
    bottomImgGroup: {
      marginTop: 40,
      '& img': {
        maxWidth: '100%',
        verticalAlign: 'middle',
      },
    },
    medicineListGroup: {
      paddingRight: 15,
      paddingLeft: 20,
    },
    sectionHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 10,
      paddingTop: 10,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
    },
    count: {
      marginLeft: 'auto',
    },
    pastSearches: {
      paddingBottom: 10,
    },
    topHeader: {
      paddingTop: 0,
    },
  };
});

export const Cart: React.FC = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.leftSection}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 214px)'}>
          <div className={classes.medicineListGroup}>
            <div className={classes.sectionHeader}>
              <span>Items In Your Cart</span>
              <span className={classes.count}>03</span>
            </div>
            <MedicineStripCard />
            <div className={classes.sectionHeader}>
              <span>You Should Also Add</span>
              <span className={classes.count}>04</span>
            </div>
            <div className={classes.pastSearches}>
              <MedicineCard />
            </div>
          </div>
        </Scrollbars>
      </div>
      <div className={classes.rightSection}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 189px)'}>
          <div className={classes.medicineSection}>
            <div className={`${classes.sectionHeader} ${classes.topHeader}`}>
              <span>Where Should We Deliver?</span>
            </div>
            <div className={classes.sectionGroup}>
              <Link className={classes.serviceType} to="/search-medicines">
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_medicines.png')} alt="" />
                </span>
                <span className={classes.linkText}>Need to find a medicine/ alternative?</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div>
            <div className={classes.sectionHeader}>
              <span>Total Charges</span>
            </div>
            <div className={`${classes.sectionGroup} ${classes.marginNone}`}>
              <Link
                className={`${classes.serviceType} ${classes.textVCenter}`}
                to="/search-medicines"
              >
                <span className={classes.serviceIcon}>
                  <img src={require('images/ic_coupon.svg')} alt="" />
                </span>
                <span className={classes.linkText}>Apply Coupon</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div>
          </div>
        </Scrollbars>
      </div>
    </div>
  );
};
