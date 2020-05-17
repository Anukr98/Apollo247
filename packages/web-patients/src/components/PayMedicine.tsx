import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, CircularProgress } from '@material-ui/core';
import { Header } from 'components/Header';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import fetchUtil from 'helpers/fetch';
import { useShoppingCart } from 'components/MedicinesCartProvider';
import { useParams } from 'hooks/routerHooks';
import { AphButton } from '@aph/web-ui-components';
import { gtmTracking, _obTracking, _cbTracking } from 'gtmTracking';
import { useMutation } from 'react-apollo-hooks';
import { saveMedicineOrderOMS, saveMedicineOrderOMSVariables } from 'graphql/types/saveMedicineOrderOMS';
// import { SaveMedicineOrder, SaveMedicineOrderVariables } from 'graphql/types/SaveMedicineOrder';
import { SaveMedicineOrderPaymentMqVariables } from 'graphql/types/SaveMedicineOrderPaymentMq';
import {  SAVE_MEDICINE_ORDER_OMS,  SAVE_MEDICINE_ORDER_PAYMENT } from 'graphql/medicines';
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
import { BOOK_APPOINTMENT } from 'graphql/doctors';
import {
  makeAppointmentPayment,
  makeAppointmentPaymentVariables,
} from 'graphql/types/makeAppointmentPayment';
import { MAKE_APPOINTMENT_PAYMENT } from 'graphql/consult';
import { Alerts } from 'components/Alerts/Alerts';

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
        // '&:last-child': {
        //   padding: '0 10px',
        // },
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

    paperHeight: {
      minHeight: 326,
      position: 'relative',
    },
    circlularProgress: {
      position: 'absolute',
      left: '50%',
      top: '50%',
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
  };
});

export const PayMedicine: React.FC = (props) => {
  const classes = useStyles({});
  const [checked, setChecked] = React.useState(false);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const [paymentOptions, setPaymentOptions] = React.useState([]);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
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

  const deliveryCharges =
    cartTotal >= parseFloat(pharmacyMinDeliveryValue) || cartTotal <= 0
      ? 0
      : parseFloat(pharmacyDeliveryCharges);
  const totalAmount = (cartTotal + Number(deliveryCharges)).toFixed(2);
  const getMRPTotal = () => {
    let sum = 0;
    cartItems.forEach((item) => {
      sum += Number(item.price) * item.quantity;
    });
    return sum;
  };
  const mrpTotal = getMRPTotal();
  const productDiscount = mrpTotal - cartTotal;

  const cartValues = sessionStorage.getItem('cartValues')
    ? JSON.parse(sessionStorage.getItem('cartValues'))
    : {};
  const { couponCode, couponValue, deliveryTime, totalWithCouponDiscount } = cartValues;

  const consultBookDetails = localStorage.getItem('consultBookDetails')
    ? JSON.parse(localStorage.getItem('consultBookDetails'))
    : {};
  const {
    amount,
    appointmentDateTime,
    appointmentType,
    consultCouponCode,
    consultCouponValue,
    doctorId,
    hospitalId,
    patientId,
    specialty,
  } = consultBookDetails;
  const revisedAmount = Number(amount) - Number(consultCouponValue);

  const { city } = useLocationDetails();
  const { authToken } = useAuth();

  useEffect(() => {
    fetchUtil(`${process.env.PHARMACY_PG_URL}/list-of-payment-methods`, 'GET', {}, '', true).then(
      (res: any) => {
        if (res) {
          setPaymentOptions(res);
        }
      }
    );
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
            // prescriptionImageUrl: '',
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

  const paymentMutation = useMutation<saveMedicineOrderOMS, saveMedicineOrderOMSVariables>(
    SAVE_MEDICINE_ORDER_OMS,
    {
      variables: {
        medicineCartOMSInput: {
          quoteId: '',
          patientId: currentPatient ? currentPatient.id : '',
          shopId: '',
          patientAddressId: deliveryAddressId,
          medicineDeliveryType: MEDICINE_DELIVERY_TYPE.HOME_DELIVERY,
          bookingSource: BOOKINGSOURCE.WEB,
          estimatedAmount: totalWithCouponDiscount,
          devliveryCharges: deliveryCharges,
          prescriptionImageUrl: [
            ...prescriptions!.map((item) => item.imageUrl),
            ...ePrescriptionData!.map((item) => item.uploadedUrl),
          ].join(','),
          prismPrescriptionFileId: [
            ...ePrescriptionData!.map((item) => item.prismPrescriptionFileId),
          ].join(','),
          orderTat: deliveryAddressId && moment(deliveryTime).isValid() ? deliveryTime : '',
          items: cartItemsForApi,
          coupon: couponCode ? couponCode : null,
          couponDiscount: 12,
          productDiscount
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
        amountPaid: totalWithCouponDiscount,
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

  const onClickPay = (value: string) => {
    setIsLoading(true);
    /**Gtm code start  */
    gtmTracking({
      category: 'Pharmacy',
      action: 'Order',
      label: `Payment-${value === 'COD' ? 'COD' : 'Prepaid'}`,
      value: totalWithCouponDiscount,
    });
    /**Gtm code End  */
    setMutationLoading(true);
    paymentMutation()
      .then((res) => {
        /**Gtm code start  */
        _obTracking({
          userLocation: city,
          paymentType: value === 'COD' ? 'COD' : 'Prepaid',
          itemCount: cartItems ? cartItems.length : 0,
          couponCode: couponCode ? couponCode : null,
          couponValue: couponValue ? couponValue : null,
          finalBookingValue: totalWithCouponDiscount,
        });
        /**Gtm code end  */
        if (res && res.data && res.data.saveMedicineOrderOMS) {
          const { orderId, orderAutoId } = res.data.saveMedicineOrderOMS;
          const currentPatiendId = currentPatient ? currentPatient.id : '';
          if (orderAutoId && orderAutoId > 0 && value !== 'COD') {
            const pgUrl = `${process.env.PHARMACY_PG_URL}/paymed?amount=${totalWithCouponDiscount}&oid=${orderAutoId}&token=${authToken}&pid=${currentPatiendId}&source=web&paymentTypeID=${value}&paymentModeOnly=YES`;
            window.location.href = pgUrl;
          } else if (orderAutoId && orderAutoId > 0 && value === 'COD') {
            placeOrder(orderId, orderAutoId, false, '');
          }
          setIsLoading(false);
        }
      })
      .catch((e) => {
        /**Gtm code start  */
        gtmTracking({
          category: 'Pharmacy',
          action: 'Order',
          label: 'Failed / Cancelled',
        });
        /**Gtm code End  */
        console.log(e);
        setMutationLoading(false);
        setIsLoading(false);
      });
  };

  const paymentMutationConsult = useMutation(BOOK_APPOINTMENT);
  const makePaymentMutation = useMutation<makeAppointmentPayment, makeAppointmentPaymentVariables>(
    MAKE_APPOINTMENT_PAYMENT
  );

  const onClickConsultPay = (value: string) => {
    setIsLoading(true);
    paymentMutationConsult({
      variables: {
        bookAppointment: {
          patientId: patientId,
          doctorId: doctorId,
          appointmentDateTime: moment(appointmentDateTime).utc(),
          bookingSource: BOOKINGSOURCE.WEB,
          appointmentType: appointmentType,
          hospitalId: hospitalId,
          couponCode: consultCouponCode,
        },
      },
    })
      .then((res: any) => {
        /* Gtm code start */
        _cbTracking({
          specialty: specialty,
          bookingType: appointmentType,
          scheduledDate: `${appointmentDateTime}`,
          couponCode: couponCode ? couponCode : null,
          couponValue: couponValue ? couponValue : null,
          finalBookingValue: revisedAmount,
        });
        /* Gtm code END */
        if (res && res.data && res.data.bookAppointment && res.data.bookAppointment.appointment) {
          if (revisedAmount == 0) {
            makePaymentMutation({
              variables: {
                paymentInput: {
                  amountPaid: 0,
                  paymentRefId: '',
                  paymentStatus: 'TXN_SUCCESS',
                  paymentDateTime: res.data.bookAppointment.appointment.appointmentDateTime,
                  responseCode: couponCode ? couponCode : null,
                  responseMessage: 'Coupon applied',
                  bankTxnId: '',
                  orderId: res.data.bookAppointment.appointment.id,
                },
              },
              fetchPolicy: 'no-cache',
            })
              .then((res) => {
                window.location.href = clientRoutes.appointments();
              })
              .catch((error) => {
                setIsAlertOpen(true);
                setAlertMessage(error);
              });
          } else {
            const pgUrl = `${process.env.CONSULT_PG_BASE_URL}/consultpayment?appointmentId=${
              res.data.bookAppointment.appointment.id
            }&patientId=${
              currentPatient ? currentPatient.id : ''
            }&price=${revisedAmount}&source=WEB&paymentTypeID=${value}&paymentModeOnly=YES`;
            window.location.href = pgUrl;
          }
          // setMutationLoading(false);
          // setIsDialogOpen(true);
        }
        setIsLoading(false);
      })
      .catch((errorResponse) => {
        console.log('enterrr');
        setIsAlertOpen(true);
        setAlertMessage(errorResponse);
        setMutationLoading(false);
        setIsLoading(false);
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
            <p>
              {params.payType === 'pharmacy'
                ? `Rs.${totalWithCouponDiscount && totalWithCouponDiscount.toFixed(2)}`
                : `Rs.${revisedAmount && revisedAmount.toFixed(2)}`}
            </p>
          </div>
          <Grid container spacing={2} className={classes.paymentContainer}>
            <Grid item xs={12} sm={8}>
              <Paper className={`${classes.paper} ${classes.paperHeight}`}>
                <div className={classes.paperHeading}>
                  <Typography component="h3">Pay Via</Typography>
                </div>
                {isLoading ? (
                  <CircularProgress
                    className={classes.circlularProgress}
                    size={34}
                    color="secondary"
                  />
                ) : (
                  <ul className={classes.paymentOptions}>
                    {paymentOptions.length > 0 &&
                      paymentOptions.map((payType, index) => {
                        return (
                          <li
                            key={index}
                            onClick={() =>
                              params.payType === 'pharmacy'
                                ? onClickPay(payType.paymentMode)
                                : onClickConsultPay(payType.paymentMode)
                            }
                            style={{ cursor: 'pointer' }}
                          >
                            <img src={payType.imageUrl} alt="" style={{ height: 30, width: 30 }} />
                            <span style={{ paddingLeft: 10 }}>{payType.name}</span>
                          </li>
                        );
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
                )}
                {checked && (
                  <AphButton
                    className={classes.payBtn}
                    onClick={() => onClickPay('COD')}
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
              {params.payType === 'pharmacy' ? (
                <Paper className={classes.paper}>
                  <div className={classes.charges}>
                    {' '}
                    <p>MRP Total</p> <p>Rs.{mrpTotal && mrpTotal.toFixed(2)}</p>
                  </div>
                  <div className={`${classes.charges} ${classes.discount}`}>
                    <p>Product Discount</p> <p>- Rs.{productDiscount}</p>
                  </div>
                  <div className={classes.charges}>
                    <p>Delivery Charges</p> <p>+ Rs.{deliveryCharges}</p>
                  </div>
                  <div className={classes.charges}>
                    <p>Packing Charges</p> <p>+ Rs.0</p>
                  </div>
                  <div className={`${classes.charges} ${classes.total}`}>
                    <p>To Pay</p>{' '}
                    <p>Rs.{totalWithCouponDiscount && totalWithCouponDiscount.toFixed(2)}</p>
                  </div>
                </Paper>
              ) : (
                <Paper className={classes.paper}>
                  <div className={classes.charges}>
                    {' '}
                    <p>Subtotal</p> <p>Rs.{amount && parseFloat(amount).toFixed(2)}</p>
                  </div>
                  <div className={`${classes.charges} ${classes.discount}`}>
                    <p>Coupon Applied</p> <p>- Rs.{consultCouponValue || 0}</p>
                  </div>
                  <div className={`${classes.charges} ${classes.total}`}>
                    <p>To Pay</p> <p>Rs.{revisedAmount && revisedAmount.toFixed(2)}</p>
                  </div>
                </Paper>
              )}
            </Grid>
          </Grid>
        </div>
      </div>

      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
    </div>
  );
};
