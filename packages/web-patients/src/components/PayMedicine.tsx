import React, { useState, useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, Link, CircularProgress } from '@material-ui/core';
import { Header } from 'components/Header';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import CreditCardIcon from '@material-ui/icons/CreditCard';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Modal from '@material-ui/core/Modal';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import CancelIcon from '@material-ui/icons/Cancel';
import fetchUtil from 'helpers/fetch';
import { useShoppingCart } from 'components/MedicinesCartProvider';
import { useParams } from 'hooks/routerHooks';
import { AphButton } from '@aph/web-ui-components';
import { gtmTracking, _obTracking } from 'gtmTracking';
import { useMutation } from 'react-apollo-hooks';
import { SaveMedicineOrder, SaveMedicineOrderVariables } from 'graphql/types/SaveMedicineOrder';
import { SaveMedicineOrderPaymentMqVariables } from 'graphql/types/SaveMedicineOrderPaymentMq';
import { SAVE_MEDICINE_ORDER, SAVE_MEDICINE_ORDER_PAYMENT } from 'graphql/medicines';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import {
  MEDICINE_DELIVERY_TYPE,
  MEDICINE_ORDER_PAYMENT_TYPE,
  BOOKINGSOURCE,
  CODCity,
} from 'graphql/types/globalTypes';
import moment from 'moment';
import { clientRoutes } from 'helpers/clientRoutes';
import { useLocationDetails } from 'components/LocationProvider';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {},
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    payMedicineContainer: {
      background: '#f7f8f5',
      padding: 20,
      borderRadius: '0 0 10px 10px',
      height: '100%',
    },
    sectionHeader: {
      padding: '0 0 10px',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      margin: '0 0 20px',
      '& h4': {
        fontSize: 13,
        fontFamily: 'IBM Plex Sans',
        fontWeight: '600',
        textTransform: 'uppercase',
        color: '#01475b',
      },
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    paymentContainer: {
      height: '100%',
    },
    paper: {
      borderRadius: 5,
      padding: 20,
      boxShadow: 'none',
      [theme.breakpoints.down('sm')]: {
        background: 'none',
        padding: 0,
      },
    },
    paperHeading: {
      padding: '0 0 10px',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      margin: '0 0 20px',
      '& h3': {
        fontSize: 15,
        fontFamily: 'IBM Plex Sans',
        fontWeight: '600',
        textTransform: 'uppercase',
        color: '#01475b',
      },
    },
    checkbox: {
      '& span': {
        fontSize: 13,
        fontWeight: 700,
      },
    },
    paymentOptions: {
      display: 'grid',
      gridTemplateColumns: 'auto auto',
      gridGap: 20,
      listStyleType: 'none',
      padding: 0,
      '& li': {
        background: '#fff',
        borderRadius: 10,
        color: '#fc9916',
        textTransform: 'uppercase',
        boxShadow: '0px 5px 20px 5px rgba(0,0,0,0.1)',
        fontWeight: 700,
        fontSize: 13,
        padding: 15,
        display: 'flex',
        alignItems: 'center',
        lineHeight: 'normal',
        '& >svg': {
          margin: '0 10px 0 0',
        },
        '&:last-child': {
          padding: '0 10px',
        },
      },
      [theme.breakpoints.down('xs')]: {
        gridTemplateColumns: 'auto',
        '& li:last-child': {
          padding: 10,
        },
      },
    },
    charges: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: 14,
      color: '#01475b',
      padding: '6px 0',
      fontWeight: 600,
      '& p': {
        margin: 0,
      },
    },
    total: {
      padding: '10px 0 0 !important',
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      margin: '10px 0 0',
    },
    discount: {
      color: '#0187ba !important',
    },
    payBtn: {
      padding: '10px 20px',
      borderRadius: '10px',
      fontSize: 13,
      fontFamily: 'IBM Plex Sans',
      fontWeight: 700,
      margin: '50px auto 0',
      boxShadow: 'none',
      color: '#fff',
      textTransform: 'uppercase',
      background: '#fcb716',
      display: 'block',
      border: 'none',
      width: 200,
    },
    chargesContainer: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    chargesMobile: {
      display: 'none',
      [theme.breakpoints.down('sm')]: {
        display: 'flex',
        padding: 10,
        borderRadius: 10,
        background: 'rgba(0, 135, 186, .15)',
        margin: '0 0 20px',
      },
    },
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalContent: {
      width: '600px',
      height: 'auto',
      background: '#fff',
      [theme.breakpoints.down('sm')]: {
        width: 400,
        height: '100vh',
      },
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    modalHeader: {
      padding: 20,
      textAlign: 'center',
      boxShadow: '0px 5px 20px 5px rgba(0,0,0,0.1)',
      position: 'relative',
      '& h5': {
        fontSize: 16,
        color: '#02475b',
        fontWeight: 700,
      },
    },
    closePopup: {
      width: 30,
      height: 30,
      borderRadius: '50%',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      right: '-50px',
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    mobileBack: {
      display: 'none',
      top: '20px',
      left: '20px',
      [theme.breakpoints.down('sm')]: {
        display: 'block',
      },
    },
    modalBody: {
      padding: 20,
      '& button': {
        margin: '0 auto',
      },
      [theme.breakpoints.down('sm')]: {
        height: 'calc(100% - 64px)',
        overflow: 'auto',
      },
    },
    modalSHeader: {
      [theme.breakpoints.down('sm')]: {
        display: 'block !important',
      },
    },
    StatusCard: {
      padding: 20,
      borderRadius: 10,
      textAlign: 'center',
      boxShadow: '0px 5px 20px 5px rgba(0,0,0,0.1)',
      margin: '0 0 20px',
      '& svg': {
        width: 50,
        height: 50,
      },
      '& h5': {
        fontSize: 13,
        fontWeight: 700,
        textTransform: 'uppercase',
        padding: '5px 0',
      },
      '& p': {
        fontSize: 13,
        fontWeight: 700,
        color: '#666666',
        lineHeight: '24px',
      },
    },
    orderDetails: {
      padding: 20,
      display: 'grid',
      gridTemplateColumns: 'auto auto',
      gridColumnGap: '20px',
      boxShadow: '0px 5px 20px 5px rgba(0,0,0,0.1)',
    },
    details: {
      '& h6': {
        fontSize: 13,
        fontWeight: 700,
        color: '#02475b',
      },
      '& p': {
        fontSize: 13,
        fontWeight: 700,
        color: '#666666',
      },
    },
    note: {
      width: '80%',
      textAlign: 'center',
      margin: '20px  auto',
      '& p': {
        fontSize: 13,
        fontWeight: 700,
        color: '#666666',
      },
    },
    pending: {
      background: '#eed9c6',
      '& svg': {
        color: '#e87e38',
      },
      '& h5': {
        color: '#e87e38',
      },
    },
    error: {
      background: '#edc6c2',
      '& svg': {
        color: '#e02020',
      },
      '& h5': {
        color: '#e02020',
      },
    },
    success: {
      background: '#edf7ed',
      '& svg': {
        color: '#4aa54a',
      },
      '& h5': {
        color: '#4aa54a',
      },
    },
    refund: {
      background: '#edc6c2',
      '& svg': {
        color: '#a30808',
      },
      '& h5': {
        color: '#a30808',
      },
    },
  };
});

export const PayMedicine: React.FC = (props) => {
  const classes = useStyles({});
  const [checked, setChecked] = React.useState(false);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    checked && setPaymentMethod('COD');
  };
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [paymentOptions, setPaymentOptions] = React.useState([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [mutationLoading, setMutationLoading] = useState(false);
  const {
    cartTotal,
    deliveryAddressId,
    prescriptions,
    ePrescriptionData,
    cartItems,
  } = useShoppingCart();
  const params = useParams<{
    payType: string;
    prDis: string;
  }>();
  const pharmacyMinDeliveryValue = process.env.PHARMACY_MIN_DELIVERY_VALUE;
  const pharmacyDeliveryCharges = process.env.PHARMACY_DELIVERY_CHARGES;
  const { currentPatient } = useAllCurrentPatients();

  const discountAmount = Number(params.prDis);
  const grossValue = cartTotal - discountAmount;
  const deliveryCharges =
    grossValue >= Number(pharmacyMinDeliveryValue) || grossValue <= 0
      ? 0
      : Number(pharmacyDeliveryCharges);
  const totalAmount = (grossValue + Number(deliveryCharges)).toFixed(2);

  const { city } = useLocationDetails();
  const { authToken } = useAuth();

  useEffect(() => {
    fetchUtil(
      `https://aph.dev.pmt.popcornapps.com/list-of-payment-methods`,
      'GET',
      {},
      '',
      true
    ).then((res: any) => {
      if (res) {
        setPaymentOptions(res);
      }
    });
  }, []);

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
            mou: parseInt(cartItemDetails.mou),
            isMedicine:
              cartItemDetails.type_id === 'Pharma'
                ? '1'
                : cartItemDetails.type_id === 'Fmcg'
                ? '0'
                : null,
          };
        })
      : [];

  const paymentMutation = useMutation<SaveMedicineOrder, SaveMedicineOrderVariables>(
    SAVE_MEDICINE_ORDER,
    {
      variables: {
        medicineCartInput: {
          quoteId: '',
          patientId: currentPatient ? currentPatient.id : '',
          shopId: '',
          patientAddressId: deliveryAddressId,
          medicineDeliveryType: MEDICINE_DELIVERY_TYPE.HOME_DELIVERY,
          bookingSource: BOOKINGSOURCE.WEB,
          estimatedAmount: parseFloat(totalAmount),
          devliveryCharges: deliveryCharges,
          prescriptionImageUrl: [
            ...prescriptions!.map((item) => item.imageUrl),
            ...ePrescriptionData!.map((item) => item.uploadedUrl),
          ].join(','),
          prismPrescriptionFileId: [
            ...ePrescriptionData!.map((item) => item.prismPrescriptionFileId),
          ].join(','),
          orderTat:
            deliveryAddressId && moment('15-May-2020 20:00').isValid() ? '15-May-2020 20:00' : '',
          items: cartItemsForApi,
        },
      },
    }
  );

  const savePayment = useMutation(SAVE_MEDICINE_ORDER_PAYMENT);

  const placeOrder = (
    orderId: string,
    orderAutoId: number,
    isChennaiCOD: boolean,
    userEmail?: string
  ) => {
    let chennaiOrderVariables = {};
    if (isChennaiCOD) {
      chennaiOrderVariables = {
        CODCity: CODCity.CHENNAI,
        email: userEmail,
      };
    }

    const paymentInfo: SaveMedicineOrderPaymentMqVariables = {
      medicinePaymentMqInput: {
        // orderId: orderId,
        orderAutoId: orderAutoId,
        amountPaid: parseFloat(totalAmount),
        paymentType: MEDICINE_ORDER_PAYMENT_TYPE.COD,
        paymentStatus: 'success',
        responseCode: '',
        responseMessage: '',
        ...(chennaiOrderVariables && chennaiOrderVariables),
      },
    };

    savePayment({ variables: paymentInfo })
      .then(({ data }: any) => {
        if (data && data.SaveMedicineOrderPaymentMq) {
          const { errorCode, errorMessage } = data.SaveMedicineOrderPaymentMq;
          if (errorCode || (errorMessage && errorMessage.length > 0)) {
            window.location.href = clientRoutes.medicinesCartInfo(orderAutoId.toString(), 'failed');
            return;
          }
          window.location.href = clientRoutes.medicinesCartInfo(orderAutoId.toString(), 'success');
        }
      })
      .catch((e) => {
        window.location.href = clientRoutes.medicinesCartInfo(orderAutoId.toString(), 'failed');
      })
      .finally(() => {
        setMutationLoading(false);
      });
  };

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.payMedicineContainer}>
          <div className={classes.sectionHeader}>
            <Typography component="h4">Payment</Typography>
          </div>
          <div className={`${classes.charges} ${classes.chargesMobile}`}>
            {' '}
            <p>Amount To Pay</p>
            <p>Rs.{cartTotal}</p>
          </div>
          <Grid container spacing={2} className={classes.paymentContainer}>
            <Grid item xs={12} sm={8}>
              <Paper className={classes.paper}>
                <div className={classes.paperHeading}>
                  <Typography component="h3">Pay Via</Typography>
                </div>
                <ul className={classes.paymentOptions}>
                  {paymentOptions.length > 0 &&
                    paymentOptions.map((payType, index) => {
                      return <li key={index}>{payType.name}</li>;
                    })}
                  {params.payType === 'pharmacy' && (
                    <li>
                      <FormGroup>
                        <FormControlLabel
                          className={classes.checkbox}
                          control={<Checkbox onChange={handleChange} name="checked" />}
                          label="Cash On Delivery"
                        />
                      </FormGroup>
                    </li>
                  )}
                </ul>
                {checked && (
                  <AphButton
                    className={classes.payBtn}
                    onClick={(e) => {
                      /**Gtm code start  */
                      gtmTracking({
                        category: 'Pharmacy',
                        action: 'Order',
                        label: `Payment-${paymentMethod === 'COD' ? 'COD' : 'Prepaid'}`,
                        value: totalAmount,
                      });
                      /**Gtm code End  */
                      setMutationLoading(true);
                      paymentMutation()
                        .then((res) => {
                          /**Gtm code start  */
                          _obTracking({
                            userLocation: city,
                            paymentType: paymentMethod === 'COD' ? 'COD' : 'Prepaid',
                            itemCount: cartItems ? cartItems.length : 0,
                            couponCode: '',
                            couponValue: discountAmount,
                            finalBookingValue: grossValue,
                          });
                          /**Gtm code end  */
                          if (res && res.data && res.data.SaveMedicineOrder) {
                            const { orderId, orderAutoId } = res.data.SaveMedicineOrder;
                            const currentPatiendId = currentPatient ? currentPatient.id : '';
                            if (orderAutoId && orderAutoId > 0 && paymentMethod === 'PAYTM') {
                              const pgUrl = `${process.env.PHARMACY_PG_URL}/paymed?amount=${totalAmount}&oid=${orderAutoId}&token=${authToken}&pid=${currentPatiendId}&source=web`;
                              window.location.href = pgUrl;
                            } else if (orderAutoId && orderAutoId > 0 && paymentMethod === 'COD') {
                              placeOrder(orderId, orderAutoId, false, '');
                            }
                          }
                        })
                        .catch(() => {
                          /**Gtm code start  */
                          gtmTracking({
                            category: 'Pharmacy',
                            action: 'Order',
                            label: 'Failed / Cancelled',
                          });
                          /**Gtm code End  */
                          console.log(e);
                          setMutationLoading(false);
                        });
                    }}
                    color="primary"
                    fullWidth
                  >
                    {mutationLoading ? (
                      <CircularProgress size={22} color="secondary" />
                    ) : (
                      `Pay RS. ${totalAmount} On delivery`
                    )}
                  </AphButton>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4} className={classes.chargesContainer}>
              <div className={classes.paperHeading}>
                <Typography component="h3">Total Charges</Typography>
              </div>
              <Paper className={classes.paper}>
                <div className={classes.charges}>
                  {' '}
                  <p>MRP Total</p> <p>Rs.{cartTotal}</p>
                </div>
                <div className={`${classes.charges} ${classes.discount}`}>
                  <p>Product Discount</p> <p>-Rs.{discountAmount}</p>
                </div>
                <div className={classes.charges}>
                  <p>Delivery Charges</p> <p>+ Rs.{deliveryCharges}</p>
                </div>
                <div className={classes.charges}>
                  <p>Packing Charges</p> <p>+ Rs.0</p>
                </div>
                <div className={`${classes.charges} ${classes.total}`}>
                  <p>To Pay</p> <p>Rs.{totalAmount}</p>
                </div>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </div>

      <Modal
        open={isPopoverOpen}
        onClose={() => setIsPopoverOpen(false)}
        className={classes.modal}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <div className={classes.modalContent}>
          <div className={classes.modalHeader}>
            <Typography component="h5">Payment Status</Typography>
            <Link href="javascript:void(0);" className={classes.closePopup}>
              <img src={require('images/ic_cross_popup.svg')} />
            </Link>
            <Link
              href="javascript:void(0);"
              className={`${classes.closePopup} ${classes.mobileBack}`}
            >
              <img src={require('images/ic_back.svg')} />
            </Link>
          </div>
          <div className={classes.modalBody}>
            <div className={`${classes.StatusCard} ${classes.pending}`}>
              <ErrorOutlineIcon></ErrorOutlineIcon>
              <Typography component="h5">Payment Pending</Typography>
              <Typography component="p">Rs. 499</Typography>
              <Typography component="p">Payment Ref. Number - 123456</Typography>
              <Typography component="p">Order ID : 123456789</Typography>
            </div>
            <div className={`${classes.sectionHeader} ${classes.modalSHeader}`}>
              <Typography component="h4">Order Details</Typography>
            </div>
            <Paper className={classes.orderDetails}>
              <div className={classes.details}>
                <Typography component="h6">Order Date &amp; Time</Typography>
                <Typography component="p">23 May 2019, 10 A.M.</Typography>
              </div>
              <div className={classes.details}>
                <Typography component="h6">Mode of Payment</Typography>
                <Typography component="p">Debit Card</Typography>
              </div>
            </Paper>
            <div className={classes.note}>
              <Typography component="p">
                Note : Your payment is in progress and this may take a couple of minutes to confirm
                your booking. We’ll intimate you once your bank confirms the payment.
              </Typography>
            </div>
            <button className={classes.payBtn}>Try Again</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
