import React, { useState, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, Tabs, Tab, CircularProgress } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton, AphDialog, AphDialogTitle, AphDialogClose } from '@aph/web-ui-components';
import { Checkout } from 'components/Cart/Checkout';
import { useDiagnosticsCart } from 'components/Tests/DiagnosticsCartProvider';
import { clientRoutes } from 'helpers/clientRoutes';
import { ApplyCoupon } from 'components/Cart/ApplyCoupon';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { LocationContext } from 'components/LocationProvider';
import { NavigationBottom } from 'components/NavigationBottom';
import { TestsListingCard } from 'components/Tests/Cart/TestsListingCard';
import { TestsFor } from 'components/Tests/Cart/TestsFor';
import { AppointmentsSlot } from 'components/Tests/Cart/AppointmentsSlot';
import { ClinicHours } from 'components/Tests/Cart/ClinicHours';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 10,
      [theme.breakpoints.up('sm')]: {
        paddingRight: 20,
        paddingTop: 20,
        PaddingLeft: 3,
        display: 'flex',
        paddingBottom: 20,
      },
    },
    buttonDisable: {
      backgroundColor: '#fed984',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2) !important',
    },
    leftSection: {
      width: 'calc(100% - 328px)',
      paddingRight: 5,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    rightSection: {
      width: 328,
      backgroundColor: theme.palette.common.white,
      padding: '20px 5px',
      borderRadius: 5,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        backgroundColor: 'transparent',
        borderRadius: 0,
        paddingBottom: 10,
      },
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
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
      },
    },
    textVCenter: {
      alignItems: 'center',
      minHeight: 44,
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
      paddingLeft: 10,
    },
    pastSearches: {
      paddingBottom: 10,
    },
    topHeader: {
      paddingTop: 0,
      textTransform: 'uppercase',
    },
    addItemBtn: {
      padding: 0,
      color: '#fc9916',
      boxShadow: 'none',
      fontWeight: 'bold',
      paddingLeft: 20,
      marginLeft: 'auto',
    },
    deliveryAddress: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      display: 'inline-block',
      width: '100%',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
      },
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
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
      },
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
      fontWeight: 'bold',
    },
    totalPrice: {
      marginLeft: 'auto',
      fontWeight: 'bold',
    },
    checkoutBtn: {
      padding: 15,
      paddingTop: 10,
      paddingBottom: 0,
      [theme.breakpoints.down('xs')]: {
        padding: 20,
        position: 'fixed',
        width: '100%',
        left: 0,
        bottom: 0,
        backgroundColor: '#dcdfce',
        zIndex: 991,
      },
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
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: theme.palette.common.white,
      padding: '10px 15px',
      marginBottom: 20,
    },
    prescriptionRow: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 14,
      fontWeight: 500,
      color: '#0087ba',
      '& >span': {
        paddingRight: 20,
      },
      '& button': {
        marginLeft: 'auto',
      },
    },
    consultDoctor: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 10,
      marginTop: 10,
      '& >span': {
        paddingRight: 20,
      },
    },
    consultDoctoLink: {
      marginLeft: 'auto',
      fontSize: 13,
      fontWeight: 'bold',
      color: '#fc9916',
      textTransform: 'uppercase',
    },
    uploadedPreList: {
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: theme.palette.common.white,
      padding: 10,
      marginBottom: 20,
    },
    uploadMore: {
      textAlign: 'right',
      '& button': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        fontWeight: 'bold',
        color: '#fc9916',
        padding: 0,
      },
    },
    presUploadBtn: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      marginLeft: 'auto',
      fontWeight: 'bold',
      color: '#fc9916',
      minWidth: 155,
      padding: 0,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    uppercase: {
      textTransform: 'uppercase',
    },
    followUpWrapper: {
      backgroundColor: '#fff',
      margin: '0 0 0 8px',
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      width: '100%',
      padding: 10,
    },
    fileInfo: {
      display: 'flex',
      margin: '10px 0 0 0',
    },
    doctorName: {
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
    },
    patientHistory: {
      opacity: 0.6,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.67,
      color: '#02475b',
      '& span': {
        margin: '0 5px 0 0',
      },
    },
    ePrescriptionTitle: {
      zIndex: 9999,
    },
    cartItemsScroll: {
      [theme.breakpoints.up(768)]: {
        maxHeight: 'calc(100vh - 208px)',
      },
      [theme.breakpoints.up(900)]: {
        maxHeight: 'calc(100vh - 148px)',
      },
      [theme.breakpoints.down('xs')]: {
        maxHeight: '100%',
        '& >div:nth-child(2)': {
          display: 'none',
        },
        '& >div:nth-child(3)': {
          display: 'none',
        },
      },
    },
    paymentsScroll: {
      [theme.breakpoints.up(768)]: {
        height: 'calc(100vh - 299px) !important',
      },
      [theme.breakpoints.up(900)]: {
        height: 'calc(100vh - 239px) !important',
      },
      [theme.breakpoints.down('xs')]: {
        height: '100% !important',
        '& >div:nth-child(2)': {
          display: 'none',
        },
        '& >div:nth-child(3)': {
          display: 'none',
        },
      },
    },
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export const TestsCart: React.FC = (props) => {
  const classes = useStyles({});
  const { cartTotal, diagnosticsCartItems } = useDiagnosticsCart();

  const [tabValue, setTabValue] = useState<number>(0);

  const [isApplyCouponDialogOpen, setIsApplyCouponDialogOpen] = React.useState<boolean>(false);
  const [couponCode, setCouponCode] = React.useState<string>('');
  const [checkoutDialogOpen, setCheckoutDialogOpen] = React.useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = React.useState<string>('');
  const [mutationLoading, setMutationLoading] = useState(false);

  const { currentPincode } = useContext(LocationContext);

  const [deliveryTime, setDeliveryTime] = React.useState<string>('');

  const isSmallScreen = useMediaQuery('(max-width:767px)');

  const { currentPatient } = useAllCurrentPatients();

  const deliveryMode = tabValue === 0 ? 'HOME' : 'Clinic';
  const disablePayButton = paymentMethod === '';

  // business rule defined if the total is greater than 200 no delivery charges.
  // if the total is less than 200 +20 is added.
  const discountAmount = couponCode !== '' ? parseFloat(((cartTotal * 10) / 100).toFixed(2)) : 0;
  const grossValue = cartTotal - discountAmount;
  const deliveryCharges = grossValue > 200 || grossValue <= 0 || tabValue === 1 ? 0 : 20;
  const totalAmount = (grossValue + deliveryCharges).toFixed(2);
  const showGross = deliveryCharges < 0 || discountAmount > 0;

  const isPaymentButtonEnable = diagnosticsCartItems && diagnosticsCartItems.length > 0;

  return (
    <div className={classes.root}>
      <div className={classes.leftSection}>
        <Scrollbars
          className={classes.cartItemsScroll}
          autoHide={true}
          renderView={(props) =>
            isSmallScreen ? <div {...props} style={{ position: 'static' }} /> : <div {...props} />
          }
        >
          <div className={classes.medicineListGroup}>
            <div className={classes.sectionHeader}>
              <span>Tests In Your Cart</span>
              <span className={classes.count}>
                (
                {diagnosticsCartItems.length > 0
                  ? String(diagnosticsCartItems.length).padStart(2, '0')
                  : 0}
                )
              </span>
              <AphButton
                className={classes.addItemBtn}
                onClick={() => {
                  window.location.href = clientRoutes.medicines();
                }}
                title={'Add items to cart'}
              >
                Add Items
              </AphButton>
            </div>
            <TestsListingCard />
            <TestsFor />
          </div>
        </Scrollbars>
      </div>
      <div className={classes.rightSection}>
        <Scrollbars
          autoHide={true}
          className={classes.paymentsScroll}
          renderView={(props) =>
            isSmallScreen ? <div {...props} style={{ position: 'static' }} /> : <div {...props} />
          }
        >
          <div className={classes.medicineSection}>
            <div className={`${classes.sectionHeader} ${classes.topHeader}`}>
              <span>Where Should We Deliver?</span>
            </div>
            <div className={classes.sectionGroup}>
              <div className={classes.deliveryAddress}>
                <Tabs
                  value={tabValue}
                  classes={{
                    root: classes.tabsRoot,
                    indicator: classes.tabsIndicator,
                  }}
                  onChange={(e, newValue) => {
                    setTabValue(newValue);
                  }}
                >
                  <Tab
                    classes={{
                      root: classes.tabRoot,
                      selected: classes.tabSelected,
                    }}
                    label="Home Visit"
                    title={'Choose home visit'}
                  />
                  <Tab
                    classes={{
                      root: classes.tabRoot,
                      selected: classes.tabSelected,
                    }}
                    label="Clinic Visit"
                    title={'Choose store pick up'}
                  />
                </Tabs>
                {tabValue === 0 && (
                  <TabContainer>
                    {/* <HomeVisit setDeliveryTime={setDeliveryTime} deliveryTime={deliveryTime} /> */}
                  </TabContainer>
                )}
                {tabValue === 1 && (
                  <TabContainer>
                    {/* <ClinicVisit
                      pincode={
                        storePickupPincode && storePickupPincode.length === 6
                          ? storePickupPincode
                          : currentPincode
                      }
                    /> */}
                  </TabContainer>
                )}
              </div>
            </div>
            <AppointmentsSlot />
            <ClinicHours />
            {diagnosticsCartItems && diagnosticsCartItems.length > 0 && (
              <>
                <div className={`${classes.sectionHeader} ${classes.uppercase}`}>
                  <span>Total Charges</span>
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
                          {deliveryCharges > 0 ? `+ Rs. ${deliveryCharges}` : '+ Rs. 0'}
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
              </>
            )}
          </div>
        </Scrollbars>
        <div className={classes.checkoutBtn}>
          <AphButton
            onClick={() => {
              if (diagnosticsCartItems && diagnosticsCartItems.length > 0) {
                setCheckoutDialogOpen(true);
              }
            }}
            color="primary"
            fullWidth
            disabled={!isPaymentButtonEnable}
            className={mutationLoading ? classes.buttonDisable : ''}
            title={'Proceed to pay bill'}
          >
            {`Proceed to pay — RS. ${totalAmount}`}
          </AphButton>
        </div>
      </div>

      <AphDialog open={checkoutDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setCheckoutDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Checkout</AphDialogTitle>
        <div className={classes.shadowHide}>
          <div className={classes.dialogContent}>
            <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
              <div className={classes.customScrollBar}>
                <Checkout
                  setPaymentMethod={(paymentMethod: string) => {
                    setPaymentMethod(paymentMethod);
                  }}
                />
              </div>
            </Scrollbars>
          </div>
          <div className={classes.dialogActions}>
            <AphButton
              onClick={(e) => {
                setMutationLoading(true);
              }}
              color="primary"
              fullWidth
              disabled={disablePayButton}
              className={paymentMethod === '' || mutationLoading ? classes.buttonDisable : ''}
            >
              {mutationLoading ? (
                <CircularProgress size={22} color="secondary" />
              ) : (
                `Pay - RS. ${totalAmount}`
              )}
            </AphButton>
          </div>
        </div>
      </AphDialog>

      <AphDialog open={isApplyCouponDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsApplyCouponDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Apply Coupon</AphDialogTitle>
        <ApplyCoupon
          setCouponCode={setCouponCode}
          couponCode={couponCode}
          close={(isApplyCouponDialogOpen: boolean) => {
            setIsApplyCouponDialogOpen(isApplyCouponDialogOpen);
          }}
          cartValue={cartTotal}
        />
      </AphDialog>
      <NavigationBottom />
    </div>
  );
};
