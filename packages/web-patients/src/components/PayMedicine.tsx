import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, CircularProgress } from '@material-ui/core';
import { Header } from 'components/Header';
import Paper from '@material-ui/core/Paper';
import { AphButton, AphDialog, AphDialogTitle, AphDialogClose } from '@aph/web-ui-components';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import fetchUtil from 'helpers/fetch';
import { Link } from 'react-router-dom';
import { useShoppingCart, MedicineCartItem } from 'components/MedicinesCartProvider';
import { useParams } from 'hooks/routerHooks';
import { gtmTracking, _obTracking, _cbTracking } from 'gtmTracking';
import {
  paymentInstrumentClickTracking,
  consultPayInitiateTracking,
  pharmacyPaymentInitiateTracking,
} from 'webEngageTracking';
import { useMutation } from 'react-apollo-hooks';
import { getDeviceType, getCouponByUserMobileNumber } from 'helpers/commonHelpers';
import { CouponCodeConsult } from 'components/Coupon/CouponCodeConsult';
import _lowerCase from 'lodash/lowerCase';

import {
  saveMedicineOrderOMS,
  saveMedicineOrderOMSVariables,
} from 'graphql/types/saveMedicineOrderOMS';
import { SaveMedicineOrderPaymentMqVariables } from 'graphql/types/SaveMedicineOrderPaymentMq';
import { SAVE_MEDICINE_ORDER_OMS, SAVE_MEDICINE_ORDER_PAYMENT } from 'graphql/medicines';
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
import { validatePharmaCoupon_validatePharmaCoupon_pharmaLineItemsWithDiscountedPrice as pharmaCouponItem } from 'graphql/types/validatePharmaCoupon';
import { Redirect } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {},
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      [theme.breakpoints.up('sm')]: {
        marginTop: 0,
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f7f8f5',
      },
    },
    payMedicineContainer: {
      background: '#f7f8f5',
      padding: 20,
      borderRadius: '0 0 10px 10px',
      height: '100%',
    },
    pageContent: {
      padding: 20,
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
      },
    },
    pageHeader: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 17,
      paddingBottom: 11,
      fontWeight: 600,
      color: theme.palette.secondary.dark,
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        padding: '16px 20px',
        position: 'fixed',
        top: 0,
        width: '100%',
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 20,
      zIndex: 2,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        width: 48,
        height: 48,
        top: 0,
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
        '&:first-child': {
          color: '#00b38e',
        },
        '&:last-child': {
          color: '#084c60',
        },
      },
      '&$checked': {
        color: '#084c60',
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
      width: 'auto',
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
    serviceTypeCoupon: {
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      borderRadius: 10,
      padding: '16px 10px 16px 16px',
      width: '100%',
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
      marginBottom: 16,
    },
    couponTopGroup: {
      display: 'flex',
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
    rightArrow: {
      width: 24,
      marginLeft: 'auto',
    },
    couponRight: {
      width: 'calc(100% - 34px)',
    },
    applyCoupon: {
      display: 'flex',
      alignItems: 'center',
    },
    appliedCoupon: {
      display: 'flex',
      alignItems: 'center',
      fontWeight: 600,
      '& $linkText': {
        '& span': {
          color: '#00b38e',
          textTransform: 'uppercase',
        },
      },
    },
    couponText: {
      color: '#01475b',
      fontSize: 12,
      lineHeight: '18px',
    },
    discountTotal: {
      color: '#0087ba',
      borderRadius: 3,
      border: 'solid 1px #0087ba',
      backgroundColor: 'rgba(0, 135, 186, 0.07)',
      padding: '4px 10px',
      fontSize: 16,
      marginTop: 10,
    },
    linkText: {
      letterSpacing: 'normal',
      paddingRight: 10,
    },
    discountRow: {
      color: '#0187ba',
    },
    couponIcon: {
      width: 25,
      marginRight: 10,
      textAlign: 'center',
      '& img': {
        verticalAlign: 'middle',
        marginTop: 3,
      },
    },
    hideButton: {
      display: 'none !important',
    },
    offerMessage: {
      color: '#00b38e',
      fontSize: 12,
      fontWeight: 300,
      textTransform: 'none',
    },
  };
});

export const getItemSpecialPrice = (cartItemDetails: MedicineCartItem) => {
  return cartItemDetails.special_price || cartItemDetails.price;
};

export const PayMedicine: React.FC = (props) => {
  const classes = useStyles({});
  const [checked, setChecked] = React.useState(false);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const [paymentOptions, setPaymentOptions] = React.useState([]);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [isApplyCouponDialogOpen, setIsApplyCouponDialogOpen] = React.useState<boolean>(false);
  const [showZeroPaymentButton, setShowZeroPaymentButton] = React.useState<boolean>(true);

  const [validateConsultCouponResult, setValidateConsultCouponResult] = useState<any>({});
  const [consultCouponCode, setConsultCouponCode] = React.useState<string>('');
  const [revisedAmount, setRevisedAmount] = React.useState<number>(0);
  const [consult, setConsult] = useState<boolean>(false);
  const [validityStatus, setValidityStatus] = useState<boolean>(false);
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
  // const deliveryCharges =
  //   cartTotal >= parseFloat(pharmacyMinDeliveryValue) || cartTotal <= 0
  //     ? 0
  //     : parseFloat(pharmacyDeliveryCharges);

  // const totalAmount = (cartTotal + Number(deliveryCharges)).toFixed(2);
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
  const {
    couponCode,
    couponValue,
    deliveryTime,
    totalWithCouponDiscount,
    validateCouponResult,
    shopId,
  } = cartValues;
  const deliveryCharges =
    cartTotal - Number(couponValue) >= Number(pharmacyMinDeliveryValue) ||
    totalWithCouponDiscount <= 0
      ? 0
      : Number(pharmacyDeliveryCharges);

  const consultBookDetails = localStorage.getItem('consultBookDetails')
    ? JSON.parse(localStorage.getItem('consultBookDetails'))
    : {};
  const {
    amount,
    appointmentDateTime,
    appointmentType,
    consultCouponCodeInitial,
    consultCouponValue = 0,
    doctorId,
    doctorName,
    hospitalId,
    speciality,
  } = consultBookDetails;

  const { city, currentPincode } = useLocationDetails();
  const { authToken } = useAuth();
  const onlineConsultationFees = amount;
  useEffect(() => {
    fetchUtil(`${process.env.PHARMACY_PG_URL}/list-of-payment-methods`, 'GET', {}, '', true).then(
      (res: any) => {
        if (res) {
          setPaymentOptions(res);
        }
      }
    );
    if (
      params.payType === 'pharmacy' &&
      (!sessionStorage.getItem('cartValues') || sessionStorage.getItem('cartValues') === '')
    ) {
      <Redirect to={clientRoutes.welcome()} />;
    }
  }, []);

  useEffect(() => {
    if (params.payType === 'consults') {
      const amountPayble: number = Number(amount) - Number(consultCouponValue);
      setRevisedAmount(amountPayble);
      if (!consultCouponCode && consultCouponCodeInitial && consultCouponCodeInitial.length) {
        setConsultCouponCode(consultCouponCodeInitial || '');
        setValidityStatus(true);
      }
    }
  });

  const getCouponByMobileNumber = () => {
    getCouponByUserMobileNumber()
      .then((resp: any) => {
        if (resp.errorCode == 0 && resp.response && resp.response.length > 0) {
          const couponCode = resp.response[0].coupon;
          setConsultCouponCode(couponCode || '');
        } else {
          setConsultCouponCode('');
        }
      })
      .catch((e: any) => {
        console.log(e);
        setConsultCouponCode('');
      });
  };

  useEffect(() => {
    if (params.payType === 'consults' && !consultCouponCode) {
      getCouponByMobileNumber();
    }
  }, []);

  useEffect(() => {
    if (validateConsultCouponResult && validateConsultCouponResult.valid) {
      setRevisedAmount(
        validateConsultCouponResult.billAmount - validateConsultCouponResult.discount
      );
      localStorage.setItem(
        'consultBookDetails',
        JSON.stringify({
          ...consultBookDetails,
          consultCouponValue: validateConsultCouponResult.discount,
          consultCouponCodeInitial: consultCouponCode,
        })
      );
    }
  }, [validateConsultCouponResult]);

  const getDiscountedLineItemPrice = (sku: string) => {
    if (couponCode.length > 0 && validateCouponResult && validateCouponResult.products) {
      const item: any = validateCouponResult.products.find((item: any) => item.sku === sku);
      return item.specialPrice.toFixed(2);
    }
  };

  const cartItemsForApi =
    cartItems.length > 0
      ? cartItems.map((cartItemDetails) => {
          return {
            medicineSKU: cartItemDetails.sku,
            medicineName: cartItemDetails.name,
            price:
              couponCode && couponCode.length > 0 && validateCouponResult // validateCouponResult check is needed because there are some cases we will have code but coupon discount=0  when coupon discount <= product discount
                ? Number(getDiscountedLineItemPrice(cartItemDetails.sku))
                : Number(getItemSpecialPrice(cartItemDetails)),
            quantity: cartItemDetails.quantity,
            itemValue: Number((cartItemDetails.quantity * cartItemDetails.price).toFixed(2)),
            itemDiscount: Number(
              (
                cartItemDetails.quantity *
                (couponCode && couponCode.length > 0 && validateCouponResult // validateCouponResult check is needed because there are some cases we will have code but coupon discount=0  when coupon discount <= product discount
                  ? cartItemDetails.price - Number(getDiscountedLineItemPrice(cartItemDetails.sku))
                  : cartItemDetails.price - Number(getItemSpecialPrice(cartItemDetails)))
              ).toFixed(2)
            ),
            mrp: cartItemDetails.price,
            isPrescriptionNeeded: cartItemDetails.is_prescription_required ? 1 : 0,
            mou: parseInt(cartItemDetails.mou),
            isMedicine:
              _lowerCase(cartItemDetails.type_id) === 'pharma'
                ? '1'
                : _lowerCase(cartItemDetails.type_id) === 'pl'
                ? '2'
                : '0',
            specialPrice: Number(getItemSpecialPrice(cartItemDetails)),
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
          patientAddressId: deliveryAddressId,
          medicineDeliveryType: MEDICINE_DELIVERY_TYPE.HOME_DELIVERY,
          bookingSource: BOOKINGSOURCE.WEB,
          estimatedAmount: totalWithCouponDiscount ? Number(totalWithCouponDiscount.toFixed(2)) : 0,
          couponDiscount: couponValue ? Number(couponValue) : 0,
          productDiscount: productDiscount ? Number(productDiscount.toFixed(2)) : 0,
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
          deviceType: getDeviceType(),
          shopId: shopId,
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

  const onClickPay = (value: string, displayName?: string) => {
    localStorage.setItem('selectedPaymentMode', displayName);
    setIsLoading(true);
    /**Gtm code start  */
    gtmTracking({
      category: 'Pharmacy',
      action: 'Order',
      label: `Payment-${value === 'COD' ? 'COD' : 'Prepaid'}`,
      value: totalWithCouponDiscount,
    });
    /**Gtm code End  */
    pharmacyPaymentInitiateTracking({
      amount: totalWithCouponDiscount,
      serviceArea: 'pharmacy',
      payMode: value,
    });
    sessionStorage.setItem(
      'pharmacyCheckoutValues',
      JSON.stringify({
        grandTotal: mrpTotal,
        discountAmount:
          (productDiscount && productDiscount.toFixed(2)) ||
          (couponValue && parseFloat(couponValue).toFixed(2)),
      })
    );
    setMutationLoading(true);
    paymentMutation()
      .then((res) => {
        /**Gtm code start  */
        let ecommItems: any[] = [];
        cartItems.map((items, key) => {
          ecommItems.push({
            item_name: items.name,
            item_id: items.sku,
            price: items.price,
            item_category: 'Pharmacy',
            item_category_2: items.type_id
              ? items.type_id.toLowerCase() === 'pharma'
                ? 'Drugs'
                : 'FMCG'
              : null,
            // 'item_category_4': '', // for future
            item_variant: 'Default',
            index: key + 1,
            quantity: items.quantity,
          });
        });
        _obTracking({
          userLocation: city,
          paymentType: value === 'COD' ? 'COD' : 'Prepaid',
          itemCount: cartItems ? cartItems.length : 0,
          couponCode: couponCode ? couponCode : null,
          couponValue: couponValue ? couponValue : null,
          finalBookingValue: totalWithCouponDiscount,
          ecommObj: {
            ecommerce: {
              items: ecommItems,
            },
          },
        });
        /**Gtm code end  */

        if (res && res.data && res.data.saveMedicineOrderOMS) {
          const { orderId, orderAutoId, errorMessage } = res.data.saveMedicineOrderOMS;
          const currentPatiendId = currentPatient ? currentPatient.id : '';
          /* Webengage Code Start */
          paymentInstrumentClickTracking({
            paymentMode: value,
            orderId,
            orderAutoId,
            type: 'Pharmacy',
          });
          /* Webengage Code End */
          if (orderAutoId && orderAutoId > 0 && value !== 'COD') {
            const pgUrl = `${
              process.env.PHARMACY_PG_URL
            }/paymed?amount=${totalWithCouponDiscount.toFixed(
              2
            )}&oid=${orderAutoId}&token=${authToken}&pid=${currentPatiendId}&source=web&paymentTypeID=${value}&paymentModeOnly=YES${
              sessionStorage.getItem('utm_source') === 'sbi' ? '&partner=SBIYONO' : ''
            }`;
            window.location.href = pgUrl;
          } else if (orderAutoId && orderAutoId > 0 && value === 'COD') {
            placeOrder(orderId, orderAutoId, false, '');
          } else if (errorMessage.length > 0) {
            setMutationLoading(false);
            setIsAlertOpen(true);
            setAlertMessage('Something went wrong, please try later.');
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
        localStorage.removeItem(`${currentPatient && currentPatient.id}`);
        sessionStorage.setItem('cartValues', '');
        setIsAlertOpen(true);
        setAlertMessage('Something went wrong, please try later.');
      });
  };

  const paymentMutationConsult = useMutation(BOOK_APPOINTMENT);
  const makePaymentMutation = useMutation<makeAppointmentPayment, makeAppointmentPaymentVariables>(
    MAKE_APPOINTMENT_PAYMENT
  );

  const onClickConsultPay = (value: string) => {
    setShowZeroPaymentButton(false);
    setIsLoading(true);
    const eventData = {
      actualPrice: Number(amount),
      consultDateTime: appointmentDateTime,
      consultType: appointmentType,
      discountAmount:
        validateConsultCouponResult && validateConsultCouponResult.valid
          ? Number(validateConsultCouponResult.amount - validateConsultCouponResult.discount)
          : Number(revisedAmount),
      discountCoupon: consultCouponCode,
      doctorCity: '',
      doctorName,
      specialty: speciality,
      netAmount: Number(amount),
      patientGender: currentPatient && currentPatient.gender,
    };
    consultPayInitiateTracking(eventData);
    paymentMutationConsult({
      variables: {
        bookAppointment: {
          patientId: currentPatient ? currentPatient.id : '',
          doctorId: doctorId,
          appointmentDateTime: moment(appointmentDateTime).utc(),
          bookingSource: BOOKINGSOURCE.WEB,
          appointmentType: appointmentType,
          hospitalId: hospitalId,
          couponCode: consultCouponCode,
          deviceType: getDeviceType(),
          actualAmount: Number(amount),
          discountedAmount:
            validateConsultCouponResult && validateConsultCouponResult.valid
              ? Number(validateConsultCouponResult.amount - validateConsultCouponResult.discount)
              : Number(revisedAmount),
          pinCode: currentPincode || '',
          // couponDiscount: couponValue,
        },
      },
    })
      .then((res: any) => {
        /* Gtm code start */
        _cbTracking({
          specialty: speciality,
          bookingType: appointmentType,
          scheduledDate: `${appointmentDateTime}`,
          couponCode: consultCouponCode ? consultCouponCode : null,
          couponValue:
            validateConsultCouponResult && validateConsultCouponResult.valid
              ? validateConsultCouponResult.discount
              : consultCouponValue || null,
          finalBookingValue: revisedAmount,
          ecommObj: {
            ecommerce: {
              items: [
                {
                  item_name: doctorName,
                  item_id: doctorId,
                  price: revisedAmount,
                  item_brand: 'Apollo',
                  item_category: 'Consultations',
                  item_category_2: speciality,
                  item_category_3: city || '',
                  // 'item_category_4': '', // for future
                  item_variant: appointmentType.toLowerCase() === 'online' ? 'Virtual' : 'Physical',
                  index: 1,
                  quantity: 1,
                },
              ],
            },
          },
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
                  responseCode: couponCode ? couponCode : '',
                  responseMessage: 'Coupon applied',
                  bankTxnId: '',
                  orderId: res.data.bookAppointment.appointment.id,
                },
              },
              fetchPolicy: 'no-cache',
            })
              .then((res) => {
                if (
                  res &&
                  res.data &&
                  res.data.makeAppointmentPayment &&
                  res.data.makeAppointmentPayment.appointment
                ) {
                  const bookingId = res.data.makeAppointmentPayment.appointment.orderId;
                  window.location.href = `${clientRoutes.appointments()}/?apptid=${bookingId}&status=success`;
                  localStorage.setItem('consultBookDetails', '');
                }
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
            }&price=${revisedAmount}&source=WEB&paymentTypeID=${value}&paymentModeOnly=YES${
              sessionStorage.getItem('utm_source') === 'sbi' ? '&partner=SBIYONO' : ''
            }`;
            window.location.href = pgUrl;
          }
          // setMutationLoading(false);
          // setIsDialogOpen(true);
        }
        setIsLoading(false);
      })
      .catch((errorResponse) => {
        setConsult(true);
        setIsAlertOpen(true);
        setAlertMessage('Selected time slot is no longer availble.');
        setMutationLoading(false);
        setIsLoading(false);
      });
  };

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <div className={classes.pageHeader}>
            <Link
              to={
                params.payType === 'pharmacy'
                  ? clientRoutes.medicinesCart()
                  : appointmentType.toLowerCase() === 'online'
                  ? clientRoutes.payOnlineConsult()
                  : clientRoutes.payOnlineClinicConsult()
              }
            >
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </Link>
            Payment
          </div>
          <div className={classes.pageContent}>
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
                      {sessionStorage.getItem('utm_source') === 'sbi' && (
                        <li
                          key={'sbiCashCard'}
                          onClick={() =>
                            params.payType === 'pharmacy'
                              ? onClickPay(
                                  process.env.SBI_CASHCARD_PAY_TYPE,
                                  'SBI YONO CASHLESS CARD'
                                )
                              : onClickConsultPay(process.env.SBI_CASHCARD_PAY_TYPE)
                          }
                          style={{ cursor: 'pointer' }}
                        >
                          <img
                            src={
                              'https://prodaphstorage.blob.core.windows.net/paymentlogos/sbi.png'
                            }
                            alt=""
                            style={{ height: 30, width: 30 }}
                          />
                          <div style={{ paddingLeft: 10 }}>
                            SBI YONO CASHLESS CARD
                            <div className={classes.offerMessage}>
                              You are eligible for {process.env.SBI_CASHCARD_DISCOUNT}% cashback
                            </div>
                          </div>
                        </li>
                      )}
                      {paymentOptions.length > 0 &&
                        paymentOptions.map((payType, index) => {
                          return (
                            <li
                              key={index}
                              onClick={() =>
                                params.payType === 'pharmacy'
                                  ? onClickPay(payType.paymentMode, payType.name)
                                  : onClickConsultPay(payType.paymentMode)
                              }
                              style={{ cursor: 'pointer' }}
                            >
                              <img
                                src={payType.imageUrl}
                                alt=""
                                style={{ height: 30, width: 30 }}
                              />
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
                        `Pay Rs.${
                          totalWithCouponDiscount && totalWithCouponDiscount.toFixed(2)
                        } on delivery`
                      )}
                    </AphButton>
                  )}
                  {params.payType === 'consults' && revisedAmount === 0 && (
                    <div className={!showZeroPaymentButton ? classes.hideButton : ''}>
                      <AphButton
                        className={classes.payBtn}
                        onClick={() => onClickConsultPay('PREPAID')}
                        color="primary"
                        fullWidth
                      >
                        Confirm Booking
                      </AphButton>
                    </div>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4} className={classes.chargesContainer}>
                {params.payType === 'consults' && (
                  <div
                    onClick={() => setIsApplyCouponDialogOpen(true)}
                    className={`${classes.serviceTypeCoupon}`}
                  >
                    <div className={classes.couponTopGroup}>
                      <span className={classes.couponIcon}>
                        <img src={require('images/ic_coupon.svg')} alt="Coupon Icon" />
                      </span>
                      <div className={classes.couponRight}>
                        {consultCouponCode === '' ? (
                          <div className={classes.applyCoupon}>
                            <span className={classes.linkText}>Apply Coupon</span>
                            <span className={classes.rightArrow}>
                              <img src={require('images/ic_arrow_right.svg')} alt="" />
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className={classes.appliedCoupon}>
                              <span className={classes.linkText}>
                                <span>{consultCouponCode}</span> applied
                              </span>
                              <span className={classes.rightArrow}>
                                <img src={require('images/ic_arrow_right.svg')} alt="" />
                              </span>
                            </div>
                            <div className={classes.couponText}>
                              {validateConsultCouponResult ? 'Coupon succefully applied' : ''}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    {consultCouponCode.length > 0 && (
                      <div className={classes.discountTotal}>
                        Savings of Rs.{' '}
                        {validateConsultCouponResult && validateConsultCouponResult.valid
                          ? validateConsultCouponResult.discount.toFixed()
                          : consultCouponValue.toFixed(2)}{' '}
                        on the bill
                      </div>
                    )}
                  </div>
                )}
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
                      <p>Product Discount</p> <p>- Rs.{productDiscount.toFixed(2)}</p>
                    </div>
                    {couponCode != '' && couponValue ? (
                      <div className={`${classes.charges} ${classes.discount}`}>
                        <p>Coupon Discount</p> <p>- Rs.{couponValue}</p>
                      </div>
                    ) : null}
                    <div className={classes.charges}>
                      <p>Delivery Charges</p> <p>+ Rs.{deliveryCharges.toFixed(2)}</p>
                    </div>
                    <div className={classes.charges}>
                      <p>Packing Charges</p> <p>+ Rs. 0.00</p>
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
                      <p>Coupon Applied</p>{' '}
                      <p>
                        - Rs.
                        {validateConsultCouponResult && validateConsultCouponResult.valid
                          ? validateConsultCouponResult.discount.toFixed(2)
                          : consultCouponValue.toFixed(2)}
                      </p>
                    </div>
                    <div className={`${classes.charges} ${classes.total}`}>
                      <p>To Pay</p>{' '}
                      <p>
                        Rs.
                        {validateConsultCouponResult && validateConsultCouponResult.valid
                          ? (
                              validateConsultCouponResult.billAmount -
                              validateConsultCouponResult.discount
                            ).toFixed(2)
                          : revisedAmount.toFixed(2)}
                      </p>
                    </div>
                  </Paper>
                )}
              </Grid>
            </Grid>
          </div>
          <AphDialog open={isApplyCouponDialogOpen} maxWidth="sm">
            <AphDialogClose onClick={() => setIsApplyCouponDialogOpen(false)} title={'Close'} />
            <AphDialogTitle>Apply Coupon</AphDialogTitle>
            <CouponCodeConsult
              appointmentDateTime={appointmentDateTime}
              doctorId={doctorId}
              consultType={appointmentType}
              setCouponCode={setConsultCouponCode}
              couponCode={consultCouponCode}
              setValidateCouponResult={setValidateConsultCouponResult}
              close={(isApplyCouponDialogOpen: boolean) => {
                setIsApplyCouponDialogOpen(isApplyCouponDialogOpen);
                // setRevisedAmount(parseFloat(validateConsultCouponResult.revisedAmount));
              }}
              cartValue={onlineConsultationFees}
              validityStatus={validityStatus}
              setValidityStatus={setValidityStatus}
              speciality={speciality}
            />
          </AphDialog>
        </div>
      </div>

      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
        consult={consult}
      />
    </div>
  );
};
