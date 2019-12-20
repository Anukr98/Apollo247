import React, { useState, useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, Tabs, Tab, CircularProgress } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton, AphDialog, AphDialogTitle, AphDialogClose } from '@aph/web-ui-components';
import { MedicineStripCard } from 'components/Medicine/MedicineStripCard';
import { HomeDelivery } from 'components/Locations/HomeDelivery';
import { StorePickUp } from 'components/Locations/StorePickUp';
import { Checkout } from 'components/Cart/Checkout';
import { UploadPrescription } from 'components/Prescriptions/UploadPrescription';
import { useShoppingCart, MedicinesCartProvider } from 'components/MedicinesCartProvider';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { ApplyCoupon } from 'components/Cart/ApplyCoupon';
import { SAVE_MEDICINE_ORDER, SAVE_MEDICINE_ORDER_PAYMENT_RESULT } from 'graphql/medicines';
import { SaveMedicineOrder, SaveMedicineOrderVariables } from 'graphql/types/SaveMedicineOrder';
import {
  SaveMedicineOrderPayment,
  SaveMedicineOrderPaymentVariables,
} from 'graphql/types/SaveMedicineOrderPayment';
import { Mutation } from 'react-apollo';
import { MEDICINE_DELIVERY_TYPE } from 'graphql/types/globalTypes';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import { PrescriptionCard } from 'components/Prescriptions/PrescriptionCard';
import { useMutation } from 'react-apollo-hooks';
import { MedicineListingCard } from 'components/Medicine/MedicineListingCard';
import { LocationContext } from 'components/LocationProvider';

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
    deliveryTimeGroup: {
      margin: 10,
      marginTop: 0,
      borderTop: '0.5px solid rgba(2,71,91,0.2)',
      paddingTop: 10,
    },
    deliveryTimeGroupWrap: {
      display: 'flex',
      backgroundColor: theme.palette.common.white,
      padding: 10,
      borderRadius: 5,
    },
    deliveryTime: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
    },
    deliveryDate: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#01475b',
      marginLeft: 'auto',
    },
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export interface PrescriptionFormat {
  name: string | null;
  imageUrl: string | null;
}

export const MedicineCart: React.FC = (props) => {
  const classes = useStyles({});

  const defPresObject = {
    name: '',
    imageUrl: '',
  };

  const [tabValue, setTabValue] = useState<number>(0);
  const [isUploadPreDialogOpen, setIsUploadPreDialogOpen] = React.useState<boolean>(false);
  const [deliveryAddressId, setDeliveryAddressId] = React.useState<string>('');
  const [isApplyCouponDialogOpen, setIsApplyCouponDialogOpen] = React.useState<boolean>(false);
  const [couponCode, setCouponCode] = React.useState<string>('');
  const [checkoutDialogOpen, setCheckoutDialogOpen] = React.useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = React.useState<string>('');
  const [mutationLoading, setMutationLoading] = useState(false);
  const [prescriptionUploaded, setPrescriptionUploaded] = React.useState<PrescriptionFormat>(
    defPresObject
  );
  const [prescriptions, setPrescriptions] = React.useState<PrescriptionFormat[]>([]);
  const [orderAutoId, setOrderAutoId] = React.useState<number>(0);
  const [amountPaid, setAmountPaid] = React.useState<number>(0);
  const { currentPincode } = useContext(LocationContext);
  const { deliveryPincode } = useShoppingCart();
  const removePrescription = (fileName: string) => {
    setPrescriptions(prescriptions.filter((fileDetails) => fileDetails.name !== fileName));
  };

  useEffect(() => {
    if (prescriptionUploaded.name !== '') {
      setPrescriptions((prevValues) => [...prevValues, prescriptionUploaded]);
    }
  }, [prescriptionUploaded]);

  const { cartItems, cartTotal } = useShoppingCart();
  const { currentPatient } = useAllCurrentPatients();
  const { authToken } = useAuth();

  const deliveryMode = tabValue === 0 ? 'HOME' : 'PICKUP';
  const disablePayButton = paymentMethod === '';

  // business rule defined if the total is greater than 200 no delivery charges.
  // if the total is less than 200 +20 is added.
  const discountAmount = couponCode !== '' ? parseFloat(((cartTotal * 10) / 100).toFixed(2)) : 0;
  const grossValue = cartTotal - discountAmount;
  const deliveryCharges = grossValue > 200 ? -20 : 20;
  const totalAmount = (grossValue + deliveryCharges).toFixed(2);
  const showGross = deliveryCharges < 0 || discountAmount > 0;

  const disableSubmit = deliveryAddressId === '';
  const uploadPrescriptionRequired = cartItems.findIndex((v) => v.is_prescription_required === '1');

  const cartItemsForApi =
    cartItems.length > 0
      ? cartItems.map((cartItemDetails) => {
          return {
            medicineSKU: cartItemDetails.sku,
            medicineName: cartItemDetails.name,
            price: cartItemDetails.price,
            quantity: cartItemDetails.quantity,
            mrp: cartItemDetails.price,
            isPrescriptionNeeded: cartItemDetails.is_prescription_required ? 1 : 0,
            prescriptionImageUrl: '',
            mou: parseInt(cartItemDetails.mou, 10),
            isMedicine: cartItemDetails.is_prescription_required ? '1' : '0',
          };
        })
      : [];

  return (
    <div className={classes.root}>
      <div className={classes.leftSection}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 148px)'}>
          <div className={classes.medicineListGroup}>
            <div className={classes.sectionHeader}>
              <span>Medicines In Your Cart</span>
              <span className={classes.count}>
                ({cartItems.length > 0 ? String(cartItems.length).padStart(2, '0') : 0})
              </span>
              <AphButton
                className={classes.addItemBtn}
                onClick={() => {
                  window.location.href = clientRoutes.medicines();
                }}
              >
                Add Items
              </AphButton>
            </div>
            {cartItems.length > 0 ? (
              <>
                <MedicineListingCard />
                {uploadPrescriptionRequired >= 0 ? (
                  <>
                    <div className={classes.sectionHeader}>Upload Prescription</div>
                    {prescriptions.length > 0 ? (
                      <div className={classes.uploadedPreList}>
                        {prescriptions.map((prescriptionDetails, index) => {
                          const fileName = prescriptionDetails.name;
                          const imageUrl = prescriptionDetails.imageUrl;
                          return (
                            <PrescriptionCard
                              fileName={fileName || ''}
                              imageUrl={imageUrl || ''}
                              removePrescription={(fileName: string) =>
                                removePrescription(fileName)
                              }
                              key={index}
                            />
                          );
                        })}
                        <div className={classes.uploadMore}>
                          <AphButton onClick={() => setIsUploadPreDialogOpen(true)}>
                            Upload More
                          </AphButton>
                        </div>
                      </div>
                    ) : (
                      <div className={classes.uploadPrescription}>
                        <div className={classes.prescriptionRow}>
                          <span>
                            Items in your cart marked with ‘Rx’ need prescriptions to complete your
                            purchase. Please upload the necessary prescriptions
                          </span>
                          <AphButton
                            onClick={() => setIsUploadPreDialogOpen(true)}
                            className={classes.presUploadBtn}
                          >
                            Upload Prescription
                          </AphButton>
                        </div>
                        <div className={classes.consultDoctor}>
                          <span>Don’t have a prescription? Don’t worry!</span>
                          <Link
                            to={clientRoutes.doctorsLanding()}
                            className={classes.consultDoctoLink}
                          >
                            Consult A Doctor
                          </Link>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </>
            ) : null}
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
                    label="Home Delivery"
                  />
                  <Tab
                    classes={{
                      root: classes.tabRoot,
                      selected: classes.tabSelected,
                    }}
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
                    <div className={classes.deliveryTimeGroup}>
                      <div className={classes.deliveryTimeGroupWrap}>
                        <span className={classes.deliveryTime}>Delivery Time</span>
                        <span className={classes.deliveryDate}>24 Oct 2019</span>
                      </div>
                    </div>
                  </TabContainer>
                )}
                {tabValue === 1 && (
                  <TabContainer>
                    <StorePickUp
                      updateDeliveryAddress={(deliveryAddressId) =>
                        setDeliveryAddressId(deliveryAddressId)
                      }
                      pincode={
                        deliveryPincode && deliveryPincode.length === 6
                          ? deliveryPincode
                          : currentPincode
                      }
                    />
                  </TabContainer>
                )}
              </div>
            </div>
            <div className={`${classes.sectionHeader} ${classes.uppercase}`}>
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
                    <img src={require('images/ic_tickmark.svg')} alt="" />
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
            onClick={() => setCheckoutDialogOpen(true)}
            color="primary"
            fullWidth
            disabled={disableSubmit}
            className={disableSubmit || mutationLoading ? classes.buttonDisable : ''}
          >
            Proceed to pay — RS. {totalAmount}
          </AphButton>
        </div>
      </div>

      <AphDialog open={checkoutDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setCheckoutDialogOpen(false)} />
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
            <Mutation<SaveMedicineOrder, SaveMedicineOrderVariables>
              mutation={SAVE_MEDICINE_ORDER}
              variables={{
                medicineCartInput: {
                  quoteId: '',
                  shopId: deliveryMode === 'HOME' ? '' : deliveryAddressId,
                  estimatedAmount: parseFloat(totalAmount),
                  patientAddressId: deliveryMode === 'HOME' ? deliveryAddressId : '',
                  devliveryCharges: 0,
                  prescriptionImageUrl: Array.prototype.map
                    .call(prescriptions, (presDetails) => presDetails.imageUrl)
                    .toString(),
                  medicineDeliveryType:
                    deliveryMode === 'HOME'
                      ? MEDICINE_DELIVERY_TYPE.HOME_DELIVERY
                      : MEDICINE_DELIVERY_TYPE.STORE_PICKUP,
                  patientId: currentPatient ? currentPatient.id : '',
                  items: cartItemsForApi,
                },
              }}
              onCompleted={(apiResponse) => {
                const orderAutoId = apiResponse.SaveMedicineOrder.orderAutoId;
                const currentPatiendId = currentPatient ? currentPatient.id : '';
                // redirect to payment Gateway
                if (orderAutoId && orderAutoId > 0 && paymentMethod === 'PAYTM') {
                  const pgUrl = `${process.env.PHARMACY_PG_URL}/paymed?amount=${totalAmount}&oid=${orderAutoId}&token=${authToken}&pid=${currentPatiendId}&source=web`;
                  window.location.href = pgUrl;
                } else if (orderAutoId && orderAutoId > 0 && paymentMethod === 'COD') {
                  setOrderAutoId(orderAutoId);
                  setAmountPaid(amountPaid);
                }
              }}
              onError={(errorResponse) => {
                alert(errorResponse);
                setMutationLoading(false);
              }}
            >
              {(mutate) => (
                <AphButton
                  onClick={(e) => {
                    setMutationLoading(true);
                    mutate();
                  }}
                  color="primary"
                  fullWidth
                  disabled={disablePayButton}
                  className={paymentMethod === '' || mutationLoading ? classes.buttonDisable : ''}
                >
                  {mutationLoading ? <CircularProgress /> : `Pay - RS. ${totalAmount}`}
                </AphButton>
              )}
            </Mutation>
          </div>
        </div>
      </AphDialog>

      <AphDialog open={isUploadPreDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsUploadPreDialogOpen(false)} />
        <AphDialogTitle>Upload Prescription(s)</AphDialogTitle>
        <UploadPrescription
          setPrescriptionUrls={(prescription) => {
            setPrescriptionUploaded(prescription);
          }}
          closeDialog={() => {
            setIsUploadPreDialogOpen(false);
          }}
        />
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
