import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, Tabs, Tab } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Scrollbars from 'react-custom-scrollbars';
import { MedicineCard } from 'components/MedicineCard';
import { MedicineStripCard } from 'components/MedicineStripCard';
import { AphButton } from '@aph/web-ui-components';
import { HomeDelivery } from 'components/HomeDelivery';
import { StorePickUp } from 'components/StorePickUp';

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
      marginBottom: 5,
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
    addItemBtn: {
      padding: 0,
      color: '#fc9916',
      boxShadow: 'none',
      fontWeight: 'bold',
      paddingLeft: 20,
      marginLeft: 20,
      position: 'relative',
      '&:before': {
        position: 'absolute',
        content: '""',
        left: 0,
        right: 0,
        width: 0.5,
        height: 41,
        backgroundColor: 'rgba(2,71,91,0.1)',
      },
    },
    deliveryAddress: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
    },
    tabsRoot: {
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
    },
    tabRoot: {
      fontSize: 14,
      fontWeight: 500,
      textAlign: 'center',
      padding: '11px 10px',
      color: '#01475b',
      opacity: 0.6,
      minWidth: '50%',
      textTransform: 'none',
    },
    tabSelected: {
      color: theme.palette.secondary.dark,
      opacity: 1,
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 5,
    },
    rootTabContainer: {
      padding: 0,
    },
    priceSection: {
      backgroundColor: '#f7f8f5',
      borderRadius: 10,
      padding: 10,
      paddingbottom: 8,
      color: '#01475b',
      fontSize: 14,
      fontWeight: 500,
    },
    topSection: {
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 5,
    },
    priceRow: {
      display: 'flex',
      alignItems: 'center',
      paddingBottom: 5,
    },
    bottomSection: {
      paddingTop: 5,
    },
    priceCol: {
      marginLeft: 'auto',
    },
    totalPrice: {
      marginLeft: 'auto',
      fontWeight: 'bold',
    },
    checkoutBtn: {
      padding: 15,
      paddingTop: 10,
      paddingBottom: 0,
    },
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export const Cart: React.FC = (props) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState<number>(0);

  return (
    <div className={classes.root}>
      <div className={classes.leftSection}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 148px)'}>
          <div className={classes.medicineListGroup}>
            <div className={classes.sectionHeader}>
              <span>Items In Your Cart</span>
              <span className={classes.count}>03</span>
              <AphButton className={classes.addItemBtn}>Add Items</AphButton>
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
        <Scrollbars autoHide={true} style={{ height: 'calc(100vh - 239px)' }}>
          <div className={classes.medicineSection}>
            <div className={`${classes.sectionHeader} ${classes.topHeader}`}>
              <span>Where Should We Deliver?</span>
            </div>
            <div className={classes.sectionGroup}>
              <div className={classes.deliveryAddress}>
                <Tabs
                  value={tabValue}
                  classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
                  onChange={(e, newValue) => {
                    setTabValue(newValue);
                  }}
                >
                  <Tab
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label="Home Delivery"
                  />
                  <Tab
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label="Store Pick Up"
                  />
                </Tabs>
                {tabValue === 0 && (
                  <TabContainer>
                    <HomeDelivery />
                  </TabContainer>
                )}
                {tabValue === 1 && (
                  <TabContainer>
                    <StorePickUp />
                  </TabContainer>
                )}
              </div>
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
            <div className={`${classes.sectionGroup}`}>
              <div className={classes.priceSection}>
                <div className={classes.topSection}>
                  <div className={classes.priceRow}>
                    <span>Subtotal</span>
                    <span className={classes.priceCol}>Rs. 450</span>
                  </div>
                  <div className={classes.priceRow}>
                    <span>Delivery Charges</span>
                    <span className={classes.priceCol}>+ Rs. 30</span>
                  </div>
                </div>
                <div className={classes.bottomSection}>
                  <div className={classes.priceRow}>
                    <span>To Pay</span>
                    <span className={classes.totalPrice}>Rs. 480 </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Scrollbars>
        <div className={classes.checkoutBtn}>
          <AphButton color="primary" fullWidth>
            Proceed to pay — RS. 480
          </AphButton>
        </div>
      </div>
    </div>
  );
};
