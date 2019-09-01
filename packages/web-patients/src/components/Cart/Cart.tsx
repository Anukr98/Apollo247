import React, { useState, useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, Tabs, Tab, Popover } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton, AphDialog, AphDialogTitle, AphDialogClose } from '@aph/web-ui-components';
import { MedicineStripCard } from 'components/Medicine/MedicineStripCard';
import { HomeDelivery } from 'components/Locations/HomeDelivery';
import { StorePickUp } from 'components/Locations/StorePickUp';
import { Checkout } from 'components/Cart/Checkout';
import { OrderSuccess } from 'components/Cart/OrderSuccess';
import { OrderPlaced } from 'components/Cart/OrderPlaced';
import { UploadPrescription } from 'components/Prescriptions/UploadPrescription';
import { useShoppingCart } from 'components/MedicinesCartProvider';
import { clientRoutes } from 'helpers/clientRoutes';
import { ApplyCoupon } from 'components/Cart/ApplyCoupon';

// import { MedicineCard } from 'components/Medicine/MedicineCard';
// import { EPrescriptionCard } from 'components/Prescriptions/EPrescriptionCard';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 20,
      paddingBottom: 20,
      paddingRight: 20,
      PaddingLeft: 3,
      display: 'flex',
    },
    buttonDisable: {
      backgroundColor: '#fed984',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2) !important',
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
      cursor: 'pointer',
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
    dialogContent: {
      paddingTop: 6,
    },
    dialogActions: {
      padding: 20,
      paddingTop: 10,
      boxShadow: '0 -5px 20px 0 #ffffff',
      position: 'relative',
      '& button': {
        borderRadius: 10,
      },
    },
    customScrollBar: {
      paddingRight: 20,
      paddingLeft: 20,
      paddingBottom: 20,
    },
    shadowHide: {
      overflow: 'hidden',
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    successPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
    },
    windowWrap: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 80,
      },
    },
    uploadPrescription: {
      paddingBottom: 10,
      marginTop: -5,
    },
    noPrescriptionUpload: {
      fontSize: 14,
      fontWeight: 500,
      color: '#0087ba',
      paddingBottom: 10,
    },
    presUploadBtn: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      marginLeft: 'auto',
      fontWeight: 'bold',
      color: '#fc9916',
      marginTop: 10,
      padding: 0,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export const Cart: React.FC = (props) => {
  const classes = useStyles();
  const mascotRef = useRef(null);

  const [tabValue, setTabValue] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [isUploadPreDialogOpen, setIsUploadPreDialogOpen] = React.useState<boolean>(false);
  const [deliveryAddressId, setDeliveryAddressId] = React.useState<string>('');
  const [isApplyCouponDialogOpen, setIsApplyCouponDialogOpen] = React.useState<boolean>(false);
  const [couponCode, setCouponCode] = React.useState<string>('');

  const { cartTotal, cartItems } = useShoppingCart();

  const deliveryMode = tabValue === 0 ? 'HOME' : 'PICKUP';

  // business rule defined if the total is greater than 200 no delivery charges.
  // if the total is less than 200 +20 is added.
  const discountAmount = couponCode !== '' ? parseFloat(((cartTotal * 10) / 100).toFixed(2)) : 0;
  const grossValue = cartTotal - discountAmount;
  const deliveryCharges = grossValue > 200 ? -20 : 20;
  const totalAmount = (grossValue + deliveryCharges).toFixed(2);
  const showGross = deliveryCharges < 0 || discountAmount > 0;

  // const cartItems = localStorage.getItem('cartItems')
  //   ? JSON.parse(localStorage.getItem('cartItems') || '')
  //   : [];
  // console.log(cartItems);

  const disableSubmit = deliveryAddressId === '';
  const uploadPrescriptionRequired = cartItems.findIndex((v) => v.is_prescription_required === '1');

  // console.log(
  //   deliveryMode,
  //   deliveryAddressId,
  //   cartTotal,
  //   cartItems,
  //   uploadPrescriptionRequired,
  //   couponCode
  // );

  return (
    <div className={classes.root}>
      <div className={classes.leftSection}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 148px)'}>
          <div className={classes.medicineListGroup}>
            <div className={classes.sectionHeader}>
              <span>Items In Your Cart</span>
              <span className={classes.count}>
                {cartItems.length > 0 ? String(cartItems.length).padStart(2, '0') : 0}
              </span>
              <AphButton
                className={classes.addItemBtn}
                onClick={() => {
                  window.location.href = clientRoutes.testsAndMedicine();
                }}
              >
                Add Items
              </AphButton>
            </div>
            {cartItems.length > 0 ? (
              <>
                <MedicineStripCard medicines={cartItems} />
                {uploadPrescriptionRequired >= 0 ? (
                  <>
                    <div className={classes.sectionHeader}>
                      <span>Upload Prescription</span>
                      <span className={classes.count}>
                        <AphButton
                          onClick={() => setIsUploadPreDialogOpen(true)}
                          className={classes.presUploadBtn}
                        >
                          Upload
                        </AphButton>
                      </span>
                    </div>
                    <div className={classes.uploadPrescription}>
                      <div className={classes.noPrescriptionUpload}>
                        Some of your medicines require prescription to make a purchase. Please
                        upload the necessary prescriptions.
                      </div>
                      {/* <EPrescriptionCard /> */}
                    </div>
                  </>
                ) : null}
              </>
            ) : null}

            {/* <div className={classes.sectionHeader}>
              <span>You Should Also Add</span>
              <span className={classes.count}>04</span>
            </div>
            <div className={classes.pastSearches}>
              <MedicineCard />
            </div> */}
          </div>
        </Scrollbars>
      </div>
      {cartItems.length > 0 ? (
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
                      <HomeDelivery
                        updateDeliveryAddress={(deliveryAddressId) =>
                          setDeliveryAddressId(deliveryAddressId)
                        }
                      />
                    </TabContainer>
                  )}
                  {tabValue === 1 && (
                    <TabContainer>
                      <StorePickUp
                        updateDeliveryAddress={(deliveryAddressId) =>
                          setDeliveryAddressId(deliveryAddressId)
                        }
                        pincode=""
                      />
                    </TabContainer>
                  )}
                </div>
              </div>
              <div className={classes.sectionHeader}>
                <span>Total Charges</span>
              </div>
              <div className={`${classes.sectionGroup} ${classes.marginNone}`}>
                {couponCode === '' ? (
                  <div
                    onClick={() => setIsApplyCouponDialogOpen(true)}
                    className={`${classes.serviceType} ${classes.textVCenter}`}
                  >
                    <span className={classes.serviceIcon}>
                      <img src={require('images/ic_coupon.svg')} alt="Coupon Icon" />
                    </span>
                    <span className={classes.linkText}>Apply Coupon</span>
                    <span className={classes.rightArrow}>
                      <img src={require('images/ic_arrow_right.svg')} alt="" />
                    </span>
                  </div>
                ) : (
                  <div className={`${classes.serviceType} ${classes.textVCenter}`}>
                    <span className={classes.serviceIcon}>
                      <img src={require('images/ic_coupon.svg')} alt="Coupon Icon" />
                    </span>
                    <span className={classes.linkText}>Coupon Applied</span>
                  </div>
                )}
              </div>
              <div className={`${classes.sectionGroup}`}>
                <div className={classes.priceSection}>
                  <div className={classes.topSection}>
                    <div className={classes.priceRow}>
                      <span>Subtotal</span>
                      <span className={classes.priceCol}>Rs. {cartTotal.toFixed(2)}</span>
                    </div>
                    <div className={classes.priceRow}>
                      <span>Delivery Charges</span>
                      <span className={classes.priceCol}>
                        {deliveryCharges > 0 ? `+ Rs. ${deliveryCharges}` : '(+ Rs. 20) FREE'}
                      </span>
                    </div>
                  </div>
                  <div className={classes.bottomSection}>
                    <div className={classes.priceRow}>
                      <span>To Pay</span>
                      <span className={classes.totalPrice}>
                        {showGross ? `(${cartTotal.toFixed(2)})` : ''} Rs. {totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Scrollbars>
          <div className={classes.checkoutBtn}>
            <AphButton
              onClick={() => setIsDialogOpen(true)}
              color="primary"
              fullWidth
              disabled={disableSubmit}
              className={disableSubmit ? classes.buttonDisable : ''}
            >
              Proceed to pay — RS. {totalAmount}
            </AphButton>
          </div>
        </div>
      ) : null}
      <AphDialog open={isDialogOpen} maxWidth="sm">
        <AphDialogTitle>Checkout</AphDialogTitle>
        <div className={classes.shadowHide}>
          <div className={classes.dialogContent}>
            <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
              <div className={classes.customScrollBar}>
                <Checkout />
              </div>
            </Scrollbars>
          </div>
          <div className={classes.dialogActions}>
            <AphButton
              onClick={() => setIsPopoverOpen(true)}
              color="primary"
              fullWidth
              disabled={disableSubmit}
            >
              Pay - RS. {totalAmount}
            </AphButton>
          </div>
        </div>
      </AphDialog>
      <Popover
        open={isPopoverOpen}
        anchorEl={mascotRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <div className={classes.successPopoverWindow}>
          <div className={classes.windowWrap}>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic_mascot.png')} alt="" />
            </div>
            <OrderSuccess />
            <OrderPlaced />
          </div>
        </div>
      </Popover>

      <AphDialog open={isUploadPreDialogOpen} maxWidth="sm">
        <AphDialogTitle>Upload Prescription(s)</AphDialogTitle>
        <UploadPrescription />
      </AphDialog>

      <AphDialog open={isApplyCouponDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsApplyCouponDialogOpen(false)} />
        <AphDialogTitle>Apply Coupon</AphDialogTitle>
        <ApplyCoupon
          setCouponCode={(couponCode: string) => setCouponCode(couponCode)}
          close={(isApplyCouponDialogOpen: boolean) => {
            setIsApplyCouponDialogOpen(isApplyCouponDialogOpen);
          }}
          cartValue={cartTotal}
        />
      </AphDialog>
    </div>
  );
};
