import React, { useState, useEffect, useContext, useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Popover,
  Theme,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  FormControlLabel,
} from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import {
  AphButton,
  AphDialog,
  AphDialogTitle,
  AphDialogClose,
  AphRadio,
} from '@aph/web-ui-components';
import { HomeDelivery } from 'components/Locations/HomeDelivery';
import { StorePickUp } from 'components/Locations/StorePickUp';
import axios from 'axios';
import { UploadPrescription } from 'components/Prescriptions/UploadPrescription';
import {
  useShoppingCart,
  PrescriptionFormat,
  EPrescription,
  MedicineCartItem,
} from 'components/MedicinesCartProvider';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { getDeviceType, getCouponByUserMobileNumber } from 'helpers/commonHelpers';
import { ApplyCoupon } from 'components/Cart/ApplyCoupon';
import _compact from 'lodash/compact';
import _find from 'lodash/find';
import { SAVE_MEDICINE_ORDER_PAYMENT, SAVE_MEDICINE_ORDER_OMS } from 'graphql/medicines';
import {
  saveMedicineOrderOMS,
  saveMedicineOrderOMSVariables,
} from 'graphql/types/saveMedicineOrderOMS';
import { SaveMedicineOrderPaymentMqVariables } from 'graphql/types/SaveMedicineOrderPaymentMq';
import {
  MEDICINE_DELIVERY_TYPE,
  MEDICINE_ORDER_PAYMENT_TYPE,
  UPLOAD_FILE_TYPES,
  BOOKINGSOURCE,
  NonCartOrderOMSCity,
  BOOKING_SOURCE,
  CODCity,
  PRISM_DOCUMENT_CATEGORY,
} from 'graphql/types/globalTypes';
import { useAllCurrentPatients, useCurrentPatient } from 'hooks/authHooks';
import { PrescriptionCard } from 'components/Prescriptions/PrescriptionCard';
import { useMutation } from 'react-apollo-hooks';
import { MedicineListingCard } from 'components/Medicine/MedicineListingCard';
import { LocationContext, useLocationDetails } from 'components/LocationProvider';
import { UploadEPrescriptionCard } from 'components/Prescriptions/UploadEPrescriptionCard';
import { EPrescriptionCard } from '../Prescriptions/EPrescriptionCard';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { NavigationBottom } from 'components/NavigationBottom';
import { UPLOAD_DOCUMENT } from '../../graphql/profiles';
import { savePrescriptionMedicineOrderOMSVariables } from '../../graphql/types/savePrescriptionMedicineOrderOMS';
import { SAVE_PRESCRIPTION_MEDICINE_ORDER_OMS } from 'graphql/medicines';
import moment from 'moment';
import { Alerts } from 'components/Alerts/Alerts';
import {
  uploadPrescriptionTracking,
  pharmacyCartViewTracking,
  pharmacyProceedToPayTracking,
  pharmacySubmitPrescTracking,
  pharmacyUploadPresClickTracking,
} from '../../webEngageTracking';
import { ChennaiCheckout, submitFormType } from 'components/Cart/ChennaiCheckout';
import { OrderPlaced } from 'components/Cart/OrderPlaced';
import { useParams } from 'hooks/routerHooks';
import { gtmTracking, _obTracking } from '../../gtmTracking';
import { validatePharmaCoupon_validatePharmaCoupon } from 'graphql/types/validatePharmaCoupon';
import { Route } from 'react-router-dom';
import { getItemSpecialPrice } from '../PayMedicine';
import { getTypeOfProduct } from 'helpers/commonHelpers';
import _lowerCase from 'lodash/lowerCase';
import fetchUtil from 'helpers/fetch';
import { checkTatAvailability } from 'helpers/MedicineApiCalls';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingRight: 20,
      paddingTop: 20,
      PaddingLeft: 3,
      paddingBottom: 20,
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: 0,
        zIndex: 999,
        background: '#f5f7f8',
      },
    },
    cartContent: {
      display: 'flex',
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        height: 'calc(100% - 150px)',
        overflow: 'auto',
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
        padding: 0,
      },
    },
    bottomActions: {
      paddingTop: 15,
      paddingBottom: 15,
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      '& button': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        fontWeight: 'bold',
        color: '#fc9916',
        padding: 0,
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
    },
    trackBtn: {
      marginLeft: 'auto',
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
      backgroundColor: '#fff',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      padding: '16px 10px 16px 16px',
      paddingbottom: 8,
      width: '100%',
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
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
    serviceIcon: {
      marginRight: 10,
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
        marginBottom: -5,
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
      [theme.breakpoints.down('xs')]: {
        padding: '0 20px',
      },
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
      [theme.breakpoints.down('xs')]: {
        justifyContent: 'space-between',
      },
    },
    windowBody: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
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
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        top: 25,
        right: 20,
      },
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
      minWidth: '100%',
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
      backgroundColor: '#fff',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
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
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    checkoutBtnMobile: {
      display: 'none',
      [theme.breakpoints.down('xs')]: {
        padding: 20,
        position: 'fixed',
        width: '100%',
        left: 0,
        bottom: 0,
        right: 0,
        top: 'auto',
        backgroundColor: '#dcdfce',
        zIndex: 999,
        display: 'block',
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
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        '& >span': {
          padding: '0 0 10px',
          display: 'block',
        },
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
      marginTop: 16,
    },
    totalPriceRow: {
      fontWeight: 'bold',
    },
    totalPriceBorder: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 5,
      marginTop: 5,
    },
    higherDiscountText: {
      marginTop: 10,
      color: '#890000',
      borderRadius: 3,
      border: 'solid 1px #890000',
      padding: '4px 10px',
    },
    radioContainer: {
      padding: '15px 20px 15px 30px',
      background: '#fff',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      '& label': {
        width: '100%',
        '& span': {
          '&:last-child': {
            fontWeight: 600,
          },
        },
      },
    },
    blackArrow: {},
    cartHeader: {
      display: 'none',
      [theme.breakpoints.down('xs')]: {
        background: '#fff',
        padding: 20,
        boxShadow: '0px 5px 20px rgba(128, 128, 128, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        '& h2': {
          fontSize: 13,
          fontWeight: 600,
          textTransform: 'uppercase',
          margin: '0 50px 0 0',
        },
      },
    },
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export interface PharmaCoupon extends validatePharmaCoupon_validatePharmaCoupon {
  coupon: string;
  discount: number;
  valid: boolean;
  reason: String;
  products: CartProduct[];
}
export interface CartProduct {
  sku: string;
  categoryId: any;
  subCategoryId: any;
  mrp: number;
  specialPrice: number;
  quantity: number;
  discountAmt: number;
  onMrp: boolean;
  couponFree: boolean;
}

export const MedicineCart: React.FC = (props) => {
  const classes = useStyles({});
  const {
    storePickupPincode,
    deliveryAddressId,
    storeAddressId,
    prescriptions,
    setPrescriptions,
    cartItems,
    cartTotal,
    ePrescriptionData,
    setEPrescriptionData,
    setUploadedEPrescription,
    cartTat,
    couponCode,
    setCouponCode,
    updateCartItemPrice,
    prescriptionOptionSelected,
    durationDays,
    prescriptionDuration,
    clearCartInfo,
    removeCartItemSku,
    setCartItems,
    removeFreeCartItems,
    addCartItems,
  } = useShoppingCart();

  const addToCartRef = useRef(null);
  const params = useParams<{
    orderAutoId: string;
    orderStatus: string;
  }>();
  const [showOrderPopup, setShowOrderPopup] = useState<boolean>(
    params.orderStatus === 'failed' && params.orderAutoId ? true : false
  );

  const urlParams = new URLSearchParams(window.location.search);
  const nonCartFlow = urlParams.get('prescription') === 'true';
  const [tabValue, setTabValue] = useState<number>(0);
  const [isUploadPreDialogOpen, setIsUploadPreDialogOpen] = React.useState<boolean>(false);
  const [isChennaiCheckoutDialogOpen, setIsChennaiCheckoutDialogOpen] = React.useState<boolean>(
    false
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [priceDifferencePopover, setPriceDifferencePopover] = React.useState<boolean>(false);
  const [isApplyCouponDialogOpen, setIsApplyCouponDialogOpen] = React.useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = React.useState<string>('');
  const [mutationLoading, setMutationLoading] = useState(false);
  const { currentPincode } = useContext(LocationContext);
  const [isEPrescriptionOpen, setIsEPrescriptionOpen] = React.useState<boolean>(false);
  const [uploadingFiles, setUploadingFiles] = React.useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [deliveryTime, setDeliveryTime] = React.useState<string>('');
  const [selectedZip, setSelectedZip] = React.useState<string>('');
  const [validateCouponResult, setValidateCouponResult] = useState<PharmaCoupon | null>(null);
  const [validityStatus, setValidityStatus] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [shopId, setShopId] = useState<string>('');
  const [tatType, setTatType] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [latitude, setLatitude] = React.useState<string>('');
  const [longitude, setLongitude] = React.useState<string>('');

  const apiDetails = {
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    bulk_product_info_url: process.env.PHARMACY_MED_BULK_PRODUCT_INFO_URL,
    priceUpdateToken: process.env.PHARMACY_MED_DELIVERY_AUTH_TOKEN,
    getInventoryUrl: process.env.PHARMACY_GET_STORE_INVENTORY,
  };

  useEffect(() => {
    if (
      validateCouponResult &&
      validateCouponResult.discount &&
      validateCouponResult.discount !== 0 &&
      validateCouponResult.discount > deductProductDiscount(validateCouponResult.products)
    ) {
      productDiscount = getProductDiscount(validateCouponResult.products) || 0;
      const couponDiscount = Number(
        (
          validateCouponResult.discount - deductProductDiscount(validateCouponResult.products)
        ).toFixed(2)
      );
      setCouponDiscount(couponDiscount);
    }
  }, [validateCouponResult]);

  useEffect(() => {
    if (params.orderStatus === 'failed') {
      gtmTracking({
        category: 'Pharmacy',
        action: 'Order',
        label: 'Failed / Cancelled',
      });
    }
  }, [showOrderPopup]);

  const checkForPriceUpdate = (tatRes: any) => {
    setShopId(tatRes.storeCode);
    setTatType(tatRes.storeType);

    // checkForCartChanges(pincode, lat, lng);
    checkCartChangesUtil(tatRes.items);
  };

  const checkCartChangesUtil = (updatedCartItems: any) => {
    cartItems.map((item, index) => {
      const itemToBeMatched = _find(updatedCartItems, { sku: item.sku });
      const storeItemPrice =
        (itemToBeMatched.mrp && Number((itemToBeMatched.mrp * Number(item.mou || 1)).toFixed(2))) ||
        0;

      if (
        itemToBeMatched.mrp !== 0 &&
        Number((itemToBeMatched.mrp * Number(item.mou || 1)).toFixed(2)).toFixed(2) !==
          Number(item.price).toFixed(2) &&
        !isDiffLessOrGreaterThan25Percent(item.price, storeItemPrice)
      ) {
        let newItem = { ...item };
        const isDiff = storeItemPrice
          ? isDiffLessOrGreaterThan25Percent(item.price, storeItemPrice)
          : true;
        const storeItemSP =
          !isDiff && item.special_price
            ? getSpecialPriceFromRelativePrices(
                item.price,
                Number(item.special_price),
                itemToBeMatched.mrp * Number(item.mou || 1)
              )
            : item.special_price;
        newItem['price'] = isDiff ? item.price : storeItemPrice;
        if (item.special_price) {
          // get new special price
          newItem['special_price'] = isDiff ? item.special_price : storeItemSP;
        }

        /* the below commented code are the price difference
          values which could be used in the near future */
        const changedDetailObj = {
          // pDiff: item.price - updatedCartItems[index].price,
          availabilityChange: true,
          // splPDiff: item.special_price
          //   ? Number(item.special_price) - Number(updatedCartItems[index].special_price)
          //   : 0,
        };
        const updatedObj = Object.assign({}, item, changedDetailObj);
        updateCartItemPrice(newItem);
        setPriceDifferencePopover(true);
      }
    });
  };

  const getSpecialPriceFromRelativePrices = (
    price: number,
    specialPrice: number,
    newPrice: number
  ) => Number(((specialPrice / price) * newPrice).toFixed(2));

  const isDiffLessOrGreaterThan25Percent = (num1: number, num2: number) => {
    const diffP = ((num1 - num2) / num1) * 100;
    const result = diffP > 25 || diffP < -25;
    return result;
  };
  const checkForCartChanges = async (pincode: string, lat: string, lng: string) => {
    const items = cartItems.map((item: MedicineCartItem) => {
      return { sku: item.sku, qty: item.quantity, couponFree: item.couponFree };
    });
    return await checkTatAvailability(items, pincode, lat, lng)
      .then((res: any) => {
        const updatedCartItems = res && res.data && res.data.response && res.data.response.items;
        //call the fxn here
        checkCartChangesUtil(updatedCartItems);
        return true;
      })
      .catch((e) => {
        console.error(e);
        return false;
      });
  };

  const removeImagePrescription = (fileName: string) => {
    const finalPrescriptions =
      prescriptions && prescriptions.filter((fileDetails) => fileDetails.name !== fileName);
    localStorage.setItem('prescriptions', JSON.stringify(finalPrescriptions));
    setPrescriptions && prescriptions && setPrescriptions(finalPrescriptions);
  };
  const isSmallScreen = useMediaQuery('(max-width:767px)');

  const removePrescription = (id: string) => {
    ePrescriptionData &&
      setEPrescriptionData &&
      setEPrescriptionData(ePrescriptionData.filter((data) => data.id !== id));
    setUploadedEPrescription && setUploadedEPrescription(true);
  };

  const { currentPatient } = useAllCurrentPatients();
  const pharmacyMinDeliveryValue = process.env.PHARMACY_MIN_DELIVERY_VALUE;
  const pharmacyDeliveryCharges = process.env.PHARMACY_DELIVERY_CHARGES;
  const deliveryMode = tabValue === 0 ? 'HOME' : 'PICKUP';

  // business rule defined if the total is greater than 200 no delivery charges.
  // if the total is less than 200 +20 is added.
  // const discountAmount = couponCode !== '' ? parseFloat(((cartTotal * 10) / 100).toFixed(2)) : 0;
  // const grossValue = cartTotal;
  // const showGross = deliveryCharges && deliveryCharges < 0;
  const getMRPTotal = () => {
    let sum = 0;
    cartItems.forEach((item) => {
      sum += Number(item.price) * item.quantity;
    });
    return sum;
  };
  // const getCouponDiscountTotal = () => {
  //   let sum = 0;
  //   cartItems.forEach((item) => {
  //     if (item.special_price === 0) {
  //       sum += Number(item.price) * item.quantity;
  //     }
  //   });
  //   return sum;
  // };
  const mrpTotal = getMRPTotal();
  // const couponDiscountTotal = getCouponDiscountTotal();
  let productDiscount = mrpTotal - cartTotal;
  // below variable is for calculating delivery charges after applying coupon discount
  const modifiedAmountForCharges =
    validateCouponResult &&
    validateCouponResult.discount &&
    validateCouponResult.discount >= productDiscount
      ? Number(cartTotal) - couponDiscount
      : Number(cartTotal);
  const deliveryCharges =
    modifiedAmountForCharges >= Number(pharmacyMinDeliveryValue) ||
    modifiedAmountForCharges <= 0 ||
    tabValue === 1
      ? 0
      : Number(pharmacyDeliveryCharges);
  const totalAmount = (cartTotal + Number(deliveryCharges)).toFixed(2);
  const totalWithCouponDiscount =
    validateCouponResult &&
    validateCouponResult.discount &&
    Number(validateCouponResult.discount.toFixed(2)) > Number(productDiscount.toFixed(2))
      ? Number(totalAmount) - couponDiscount
      : Number(totalAmount);

  const disableSubmit =
    deliveryMode === 'HOME'
      ? deliveryAddressId === ''
      : deliveryMode === 'PICKUP'
      ? storeAddressId === ''
      : false;

  const uploadPrescriptionRequired = cartItems.findIndex(
    (v) => Number(v.is_prescription_required) === 1
  );

  const deductProductDiscount = (products: CartProduct[]) => {
    let discount = 0;
    products &&
      products.forEach((item) => {
        if (item.mrp != item.specialPrice && item.onMrp) {
          discount = discount + (item.mrp - item.specialPrice) * item.quantity;
        }
      });
    return discount;
  };

  const getProductDiscount = (products: CartProduct[]) => {
    let discount = 0;
    products &&
      products.forEach((item) => {
        if (item.mrp != item.specialPrice) {
          discount = discount + (item.mrp - item.specialPrice) * item.quantity;
        }
      });
    return discount;
  };

  const getDiscountedLineItemPrice = (sku: string) => {
    if (couponCode.length > 0 && validateCouponResult && validateCouponResult.products) {
      const item: any = validateCouponResult.products.find((item: any) => item.sku === sku);
      return item.onMrp
        ? (item.mrp - item.discountAmt).toFixed(2)
        : (item.specialPrice - item.discountAmt).toFixed(2);
    }
  };

  const cartItemsForApi =
    cartItems.length > 0
      ? cartItems.map((cartItemDetails) => {
          return {
            medicineSKU: cartItemDetails.sku,
            medicineName: cartItemDetails.name,
            price:
              couponCode.length > 0 && validateCouponResult // validateCouponResult check is needed because there are some cases we will have code but coupon discount=0  when coupon discount <= product discount
                ? Number(getDiscountedLineItemPrice(cartItemDetails.sku))
                : Number(getItemSpecialPrice(cartItemDetails)),
            quantity: cartItemDetails.quantity,
            itemValue: cartItemDetails.quantity * cartItemDetails.price,
            itemDiscount: Number(
              (
                cartItemDetails.quantity *
                (couponCode && couponCode.length > 0 && validateCouponResult // validateCouponResult check is needed because there are some cases we will have code but coupon discount=0  when coupon discount <= product discount
                  ? cartItemDetails.price - Number(getDiscountedLineItemPrice(cartItemDetails.sku))
                  : cartItemDetails.price - Number(getItemSpecialPrice(cartItemDetails)))
              ).toFixed(2)
            ),
            mrp: cartItemDetails.price,
            couponFree: cartItemDetails.couponFree || false,
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

  // coupon related code

  const validateCoupon = () => {
    if (couponCode.length > 0 && currentPatient && currentPatient.id) {
      const data = {
        mobile: localStorage.getItem('userMobileNo'),
        billAmount: cartTotal.toFixed(2),
        coupon: couponCode,
        pinCode: localStorage.getItem('pharmaPincode'),
        products: cartItems.map((item) => {
          const { sku, quantity, special_price, price, type_id, couponFree } = item;
          return {
            sku,
            mrp: item.price,
            quantity,
            couponFree: couponFree || false,
            categoryId: type_id || '',
            specialPrice: special_price || price,
          };
        }),
      };
      fetchUtil(process.env.VALIDATE_CONSULT_COUPONS, 'POST', data, '', false)
        .then((resp: any) => {
          if (resp.errorCode == 0) {
            if (resp.response.valid) {
              const freeProductsSet = new Set(
                resp.response.products && resp.response.products.length
                  ? resp.response.products.filter((cartItem: any) => cartItem.couponFree)
                  : []
              );
              if (freeProductsSet.size) {
                setValidateCouponResult(resp.response);
                addDiscountedProducts(resp.response);
                setErrorMessage('');
                return;
              }
              if (Number(resp.response.discount.toFixed(2)) <= Number(productDiscount.toFixed(2))) {
                setErrorMessage(
                  'Coupon not applicable on your cart item(s) or item(s) with already higher discounts'
                );
                removeAllFreeProducts();
                localStorage.removeItem('pharmaCoupon');
                setCouponCode && setCouponCode('');
                return;
              }
              setValidateCouponResult(resp.response);
              setErrorMessage('');
              return resp;
            } else {
              setValidateCouponResult(null);
              setErrorMessage(
                'Coupon not applicable on your cart item(s) or item(s) with already higher discounts'
              );
              removeAllFreeProducts();
              localStorage.removeItem('pharmaCoupon');
              setCouponCode && setCouponCode('');
            }
          } else if (resp && resp.errorMsg && resp.errorMsg.length > 0) {
            setValidateCouponResult(null);
            setErrorMessage(resp.errorMsg);
            localStorage.removeItem('pharmaCoupon');
            setCouponCode && setCouponCode('');
          }
        })
        .catch((e: any) => {
          console.log(e);
        });
    }
  };

  const addDiscountedProducts = (response: any) => {
    const skus: Array<string> = [];
    if (response.products && Array.isArray(response.products) && response.products.length) {
      try {
        const cartSkuSet = new Set(
          cartItems && cartItems.length ? cartItems.map((cartItem) => cartItem.sku) : []
        );
        response.products.forEach((data: any) => {
          if (!cartSkuSet.has(data.sku) && data.couponFree) skus.push(data.sku);
        });

        const allData: MedicineCartItem[] = [];
        if (skus && skus.length) {
          axios
            .post(
              apiDetails.bulk_product_info_url || '',
              { params: skus.join(',') },
              {
                headers: {
                  Authorization: apiDetails.authToken,
                },
              }
            )
            .then((resp) => {
              if (resp && resp.data && resp.data.productdp && resp.data.productdp.length) {
                resp &&
                  resp.data &&
                  resp.data.productdp.forEach((e: any) => {
                    const cartItem: MedicineCartItem = {
                      MaxOrderQty: 1,
                      url_key: e.url_key,
                      description: e.description,
                      id: e.id,
                      image: e.image,
                      is_in_stock: e.is_in_stock,
                      is_prescription_required: e.is_prescription_required,
                      name: e.name,
                      price: e.price,
                      sku: e.sku,
                      special_price: 0,
                      couponFree: true,
                      small_image: e.small_image,
                      status: e.status,
                      thumbnail: e.thumbnail,
                      type_id: e.type_id,
                      mou: e.mou,
                      quantity: 1,
                      isShippable: true,
                    };
                    allData.push(cartItem);
                  });
              }
            })
            .then(() => {
              addCartItems(allData);
            });
        }
      } catch (e) {
        console.error(e);
        throw e;
      }
    }
  };

  const getCouponByMobileNumber = () => {
    getCouponByUserMobileNumber()
      .then((resp: any) => {
        if (resp.errorCode == 0 && resp.response && resp.response.length > 0) {
          const couponCode = resp.response[0].coupon;
          setCouponCode(couponCode || '');
        } else {
          setCouponCode && setCouponCode('');
        }
      })
      .catch((e: any) => {
        console.log(e);
        setCouponCode('');
      });
  };

  useEffect(() => {
    if (!nonCartFlow && cartItems.length > 0 && couponCode.length > 0) {
      validateCoupon();
    }
  }, [couponCode, cartItems]);

  useEffect(() => {
    if (!nonCartFlow && cartItems.length > 0 && !couponCode) {
      getCouponByMobileNumber();
    }
  }, []);

  const paymentMutation = useMutation<saveMedicineOrderOMS, saveMedicineOrderOMSVariables>(
    SAVE_MEDICINE_ORDER_OMS,
    {
      variables: {
        medicineCartOMSInput: {
          quoteId: '',
          patientId: currentPatient ? currentPatient.id : '',
          ...(storeAddressId && storeAddressId.length && { shopId: storeAddressId }),
          patientAddressId: deliveryMode === 'HOME' ? deliveryAddressId : '',
          medicineDeliveryType:
            deliveryMode === 'HOME'
              ? MEDICINE_DELIVERY_TYPE.HOME_DELIVERY
              : MEDICINE_DELIVERY_TYPE.STORE_PICKUP,
          bookingSource: BOOKINGSOURCE.WEB,
          estimatedAmount: totalWithCouponDiscount ? Number(totalWithCouponDiscount.toFixed(2)) : 0,
          couponDiscount:
            validateCouponResult &&
            validateCouponResult.discount &&
            validateCouponResult.discount >= productDiscount
              ? Number(validateCouponResult.discount.toFixed(2))
              : 0,
          productDiscount: productDiscount ? Number(productDiscount.toFixed(2)) : 0,
          devliveryCharges: deliveryCharges,
          prescriptionImageUrl: [
            ...prescriptions!.map((item) => item.imageUrl),
            ...ePrescriptionData!.map((item) => item.uploadedUrl),
          ].join(','),
          prismPrescriptionFileId: [
            ...ePrescriptionData!.map((item) => item.prismPrescriptionFileId),
          ].join(','),
          orderTat: deliveryTime,
          items: cartItemsForApi,
          coupon: couponCode,
          deviceType: getDeviceType(),
          shopId,
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
      chennaiOrderVariables = nonCartFlow
        ? {
            NonCartOrderOMSCity: NonCartOrderOMSCity.CHENNAI,
            email: userEmail,
          }
        : {
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
          setIsLoading(false);
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

  const uploadDocumentMutation = useMutation(UPLOAD_DOCUMENT);
  const savePrescriptionMutation = useMutation(SAVE_PRESCRIPTION_MEDICINE_ORDER_OMS);

  const submitPrescriptionMedicineOrder = (
    variables: savePrescriptionMedicineOrderOMSVariables
  ) => {
    savePrescriptionMutation({
      variables,
    })
      .then(({ data }: any) => {
        if (
          data &&
          data.savePrescriptionMedicineOrderOMS &&
          data.savePrescriptionMedicineOrderOMS.orderAutoId
        ) {
          prescriptions &&
            prescriptions.length > 0 &&
            pharmacySubmitPrescTracking({
              orderId: data.savePrescriptionMedicineOrderOMS.orderAutoId,
              deliveryType: deliveryAddressId
                ? MEDICINE_DELIVERY_TYPE.HOME_DELIVERY
                : MEDICINE_DELIVERY_TYPE.STORE_PICKUP,
              storeId: '',
              deliverAdd: deliveryAddressId,
              pincode:
                storePickupPincode && storePickupPincode.length === 6
                  ? storePickupPincode
                  : currentPincode,
            });
          if (prescriptionOptionSelected === 'duration') {
            clearCartInfo();
            setTimeout(() => {
              window.location.href = clientRoutes.medicines();
            }, 3000);
          } else {
            window.location.href = clientRoutes.medicinesCartInfo('prescription', 'success');
          }
        } else {
          setIsAlertOpen(true);
          setAlertMessage('Something went wrong, please try later.');
        }
      })
      .catch((e) => {
        console.log({ e });
        setIsAlertOpen(true);
        setAlertMessage('Something went wrong, please try later.');
      })
      .finally(() => {
        // setLoading!(false);
      });
  };

  const uploadMultipleFiles = (prescriptions: PrescriptionFormat[]) => {
    return Promise.all(
      prescriptions.map((item: PrescriptionFormat) => {
        const baseFormatSplitArry = item.baseFormat.split(`;base64,`);
        return uploadDocumentMutation({
          fetchPolicy: 'no-cache',
          variables: {
            UploadDocumentInput: {
              base64FileInput: baseFormatSplitArry[1],
              category: PRISM_DOCUMENT_CATEGORY.OpSummary,
              fileType:
                item.fileType == 'jpg'
                  ? UPLOAD_FILE_TYPES.JPEG
                  : item.fileType == 'png'
                  ? UPLOAD_FILE_TYPES.PNG
                  : item.fileType == 'pdf'
                  ? UPLOAD_FILE_TYPES.PDF
                  : UPLOAD_FILE_TYPES.JPEG,
              patientId: currentPatient && currentPatient.id,
            },
          },
        });
      })
    );
  };

  const removeAllFreeProducts = () => {
    if (cartItems && Array.isArray(cartItems) && cartItems.length) {
      removeFreeCartItems();
    }
  };

  const onPressSubmit = async (userEmail?: string) => {
    let chennaiOrderVariables = {};
    if (userEmail && userEmail.length) {
      chennaiOrderVariables = {
        NonCartOrderCity: NonCartOrderOMSCity.CHENNAI,
        email: userEmail,
      };
    }
    setUploadingFiles(true);
    const ePresUrls =
      ePrescriptionData && ePrescriptionData.map((item) => item.uploadedUrl).filter((i) => i);
    const ePresPrismIds =
      ePrescriptionData &&
      ePrescriptionData.map((item) => item.prismPrescriptionFileId).filter((i) => i);
    const updatedPrescriptionOptionSelected =
      prescriptionOptionSelected === 'specified'
        ? prescriptionDuration === 'prescription'
          ? 'Need all medicine and for duration as per prescription'
          : `Need all medicine as per prescription for ${durationDays} days`
        : 'Call me for details';
    if (prescriptions && prescriptions.length > 0) {
      uploadMultipleFiles(prescriptions)
        .then((data) => {
          const uploadUrlscheck = data.map(({ data }: any) =>
            data && data.uploadDocument && data.uploadDocument.status ? data.uploadDocument : null
          );
          const filtered = uploadUrlscheck.filter(function(el) {
            return el != null;
          });
          const phyPresUrls = filtered.map((item) => item.filePath).filter((i) => i);
          const phyPresPrismIds = filtered.map((item) => item.fileId).filter((i) => i);
          const prescriptionMedicineOMSInput: savePrescriptionMedicineOrderOMSVariables = {
            prescriptionMedicineOMSInput: {
              ...(storeAddressId && storeAddressId.length && { shopId: storeAddressId }),
              patientId: (currentPatient && currentPatient.id) || '',
              bookingSource: BOOKING_SOURCE.WEB,
              medicineDeliveryType: deliveryAddressId
                ? MEDICINE_DELIVERY_TYPE.HOME_DELIVERY
                : MEDICINE_DELIVERY_TYPE.STORE_PICKUP,
              patinetAddressId: deliveryAddressId || '',
              prescriptionImageUrl: [...phyPresUrls, ...ePresUrls].join(','),
              prismPrescriptionFileId: [...phyPresPrismIds, ...ePresPrismIds].join(','),
              appointmentId: '',
              isEprescription: ePrescriptionData && ePrescriptionData.length ? 1 : 0, // if atleat one prescription is E-Prescription then pass it as one.
              // durationDays: durationDays,
              prescriptionOptionSelected: updatedPrescriptionOptionSelected,
              ...(chennaiOrderVariables && chennaiOrderVariables),
            },
          };
          submitPrescriptionMedicineOrder(prescriptionMedicineOMSInput);
        })
        .catch((e) => {
          console.log(e);
          setUploadingFiles(false);
          setIsAlertOpen(true);
          setAlertMessage('something went wrong');
        });
    } else {
      const prescriptionMedicineOMSInput: savePrescriptionMedicineOrderOMSVariables = {
        prescriptionMedicineOMSInput: {
          ...(storeAddressId && storeAddressId.length && { shopId: storeAddressId }),
          patientId: (currentPatient && currentPatient.id) || '',
          bookingSource: BOOKING_SOURCE.WEB,
          medicineDeliveryType: deliveryAddressId
            ? MEDICINE_DELIVERY_TYPE.HOME_DELIVERY
            : MEDICINE_DELIVERY_TYPE.STORE_PICKUP,
          patinetAddressId: deliveryAddressId || '',
          prescriptionImageUrl: [...ePresUrls].join(','),
          prismPrescriptionFileId: [...ePresPrismIds].join(','),
          appointmentId: '',
          isEprescription: ePrescriptionData && ePrescriptionData.length ? 1 : 0, // if atleat one prescription is E-Prescription then pass it as one.
          ...(chennaiOrderVariables && chennaiOrderVariables),
          prescriptionOptionSelected: updatedPrescriptionOptionSelected,
          // durationDays:
          //   prescriptionOptionSelected === 'specified' && prescriptionDuration === 'user'
          //     ? durationDays
          //     : null,
        },
      };
      submitPrescriptionMedicineOrder(prescriptionMedicineOMSInput);
    }
  };

  const submitChennaiCODOrder = (dataObj: submitFormType) => {
    setIsLoading(true);
    if (!(cartItems && cartItems.length)) {
      onPressSubmit(dataObj.userEmail);
      return;
    }
    paymentMutation().then(({ data }: any) => {
      if (data && data.saveMedicineOrderOMS) {
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
          userLocation: localStorage.getItem('pharmaAddress') || '',
          paymentType: 'COD',
          itemCount: cartItems ? cartItems.length : 0,
          couponCode: couponCode ? couponCode : null,
          couponValue: couponDiscount,
          finalBookingValue: totalWithCouponDiscount,
          ecommObj: {
            ecommerce: {
              items: ecommItems,
            },
          },
        });
        /**Gtm code end  */
        const { orderId, orderAutoId, errorMessage } = data.saveMedicineOrderOMS;
        if (orderAutoId && orderAutoId > 0) {
          placeOrder(orderId, orderAutoId, true, dataObj.userEmail);
        } else if (errorMessage) {
          setIsAlertOpen(true);
          setAlertMessage('Something went wrong, please try later.');
        }
      }
    });
  };

  const isPaymentButtonEnable =
    (!nonCartFlow && uploadPrescriptionRequired === -1 && cartItems && cartItems.length > 0) ||
    (prescriptions && prescriptions.length > 0) ||
    (ePrescriptionData && ePrescriptionData.length > 0) ||
    false;

  const patient = useCurrentPatient();

  const age = patient && patient.dateOfBirth ? moment().diff(patient.dateOfBirth, 'years') : null;

  const handleUploadPrescription = () => {
    uploadPrescriptionTracking({ ...patient, age });
    pharmacyUploadPresClickTracking('Cart');
    setIsUploadPreDialogOpen(true);
  };

  const isChennaiZipCode = (zipCodeInt: Number) => {
    return (
      (zipCodeInt >= 600001 && zipCodeInt <= 600130) ||
      zipCodeInt === 603103 ||
      zipCodeInt === 603202 ||
      zipCodeInt === 603211
    );
  };

  useEffect(() => {
    /**Gtm code start  */
    if (!nonCartFlow) {
      gtmTracking({
        category: 'Pharmacy',
        action: 'Order',
        label: 'View Cart',
        value: totalWithCouponDiscount,
      });
    }
    /**Gtm code  End */
    if (cartItems && cartItems.length > 0 && !nonCartFlow) {
      pharmacyCartViewTracking(cartItems.length);
    }
  }, [cartTotal]);

  return (
    <div className={classes.root}>
      <div className={classes.cartHeader}>
        <Link to={clientRoutes.medicines()}>
          <img
            className={classes.blackArrow}
            src={require('images/ic_back.svg')}
            alt="Back Arrow"
            title="Back Arrow"
          />
        </Link>
        <Typography component="h2">Your Cart</Typography>
        <div></div>
      </div>
      <div className={classes.cartContent}>
        <div className={classes.leftSection}>
          <Scrollbars
            className={classes.cartItemsScroll}
            autoHide={true}
            renderView={(props) =>
              isSmallScreen ? <div {...props} style={{ position: 'static' }} /> : <div {...props} />
            }
          >
            <div className={classes.medicineListGroup}>
              {!nonCartFlow && (
                <div className={classes.sectionHeader}>
                  <span>Medicines In Your Cart</span>
                  <span className={classes.count}>
                    ({cartItems.length > 0 ? String(cartItems.length).padStart(2, '0') : 0})
                  </span>
                  <Link
                    className={classes.addItemBtn}
                    to={clientRoutes.medicines()}
                    title={'Add items to cart'}
                  >
                    {/* <AphButton className={classes.addItemBtn}>Add Items</AphButton> */}
                    Add Items
                  </Link>
                </div>
              )}
              {cartItems.length > 0 ||
              (prescriptions && prescriptions.length > 0) ||
              (ePrescriptionData && ePrescriptionData.length > 0) ? (
                <>
                  {!nonCartFlow && (
                    <MedicineListingCard validateCouponResult={validateCouponResult} />
                  )}
                  {uploadPrescriptionRequired >= 0 ||
                  (prescriptions && prescriptions.length > 0) ||
                  (ePrescriptionData && ePrescriptionData.length > 0) ? (
                    <>
                      <div className={classes.sectionHeader}>Upload Prescription</div>
                      {(prescriptions && prescriptions.length > 0) ||
                      (ePrescriptionData && ePrescriptionData.length > 0) ? (
                        <div className={classes.uploadedPreList}>
                          {prescriptions &&
                            prescriptions.length > 0 &&
                            prescriptions.map((prescriptionDetails) => {
                              const fileName = prescriptionDetails.name;
                              const imageUrl = prescriptionDetails.imageUrl;
                              return (
                                <PrescriptionCard
                                  fileName={fileName || ''}
                                  imageUrl={imageUrl || ''}
                                  removePrescription={(fileName: string) =>
                                    removeImagePrescription(fileName)
                                  }
                                  key={prescriptionDetails.name}
                                  readOnly={nonCartFlow}
                                />
                              );
                            })}
                          {ePrescriptionData &&
                            ePrescriptionData.length > 0 &&
                            ePrescriptionData.map((prescription: EPrescription) => (
                              <EPrescriptionCard
                                key={prescription.id}
                                prescription={prescription}
                                removePrescription={removePrescription}
                                readOnly={nonCartFlow}
                              />
                            ))}
                          {!nonCartFlow && (
                            <div className={classes.uploadMore}>
                              <AphButton
                                disabled={uploadingFiles || mutationLoading}
                                onClick={() => handleUploadPrescription()}
                              >
                                Upload More
                              </AphButton>
                            </div>
                          )}
                        </div>
                      ) : uploadPrescriptionRequired >= 0 ? (
                        <div className={classes.uploadPrescription}>
                          <div className={classes.prescriptionRow}>
                            <span>
                              Items in your cart marked with ‘Rx’ need prescriptions to complete
                              your purchase. Please upload the necessary prescriptions
                            </span>
                            <AphButton
                              onClick={() => handleUploadPrescription()}
                              className={classes.presUploadBtn}
                            >
                              Upload Prescription
                            </AphButton>
                          </div>
                          <div className={classes.consultDoctor}>
                            <span>Don’t have a prescription? Don’t worry!</span>
                            <Link
                              to={clientRoutes.specialityListing()}
                              className={classes.consultDoctoLink}
                            >
                              Consult A Doctor
                            </Link>
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </>
              ) : null}
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
              {currentPatient && currentPatient.id && (
                <>
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
                          title={'Choose home delivery'}
                        />
                        <Tab
                          disabled
                          classes={{
                            root: classes.tabRoot,
                            selected: classes.tabSelected,
                          }}
                          label="Store Pick Up"
                          title={'Choose store pick up'}
                        />
                      </Tabs>
                      {tabValue === 0 && (
                        <TabContainer>
                          <HomeDelivery
                            selectedZipCode={setSelectedZip}
                            setDeliveryTime={setDeliveryTime}
                            deliveryTime={deliveryTime}
                            checkForPriceUpdate={checkForPriceUpdate}
                            setLatitude={setLatitude}
                            setLongitude={setLongitude}
                            latitude={latitude}
                            longitude={longitude}
                          />
                        </TabContainer>
                      )}
                      {tabValue === 1 && (
                        <TabContainer>
                          <StorePickUp
                            pincode={
                              storePickupPincode && storePickupPincode.length === 6
                                ? storePickupPincode
                                : currentPincode
                            }
                          />
                        </TabContainer>
                      )}
                    </div>
                  </div>
                  {nonCartFlow && (
                    <>
                      <div className={`${classes.sectionHeader} ${classes.topHeader}`}>
                        <span>payment option</span>
                      </div>
                      <div className={classes.radioContainer}>
                        <FormControlLabel
                          checked={true}
                          value={'CASH_ON_DELIVERY'}
                          control={<AphRadio color="primary" />}
                          label={'Cash On Delivery'}
                          onChange={() => {}}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
              {cartItems && cartItems.length > 0 && !nonCartFlow && currentPatient && (
                <>
                  <div className={`${classes.sectionHeader} ${classes.uppercase}`}>
                    <span>Total Charges</span>
                  </div>
                  <div className={`${classes.sectionGroup}`}>
                    <div
                      onClick={() => {
                        if (couponCode === '') {
                          setIsApplyCouponDialogOpen(true);
                        } else {
                          /* GTM TRACKING START */
                          gtmTracking({
                            category: 'Pharmacy',
                            action: 'Order',
                            label: `Coupon Removed - ${couponCode}`,
                            value:
                              validateCouponResult &&
                              validateCouponResult.discount &&
                              validateCouponResult.discount &&
                              validateCouponResult.discount >= productDiscount
                                ? Number(validateCouponResult.discount.toFixed(2))
                                : null,
                          });
                          removeAllFreeProducts();
                          setValidateCouponResult(null);
                          setErrorMessage('');
                          setCouponCode && setCouponCode('');
                        }
                      }}
                      className={`${classes.serviceType}`}
                    >
                      <div className={classes.couponTopGroup}>
                        <span className={classes.serviceIcon}>
                          <img src={require('images/ic_coupon.svg')} alt="Coupon Icon" />
                        </span>
                        <div className={classes.couponRight}>
                          {!validateCouponResult ? (
                            <div className={classes.applyCoupon}>
                              <span className={classes.linkText}>Apply Coupon</span>
                              <span className={classes.rightArrow}>
                                <img src={require('images/ic_arrow_right.svg')} alt="" />
                              </span>
                            </div>
                          ) : (
                            <>
                              <div className={classes.appliedCoupon}>
                                {Number(validateCouponResult.discount.toFixed(2)) >
                                  Number(productDiscount.toFixed(2)) ||
                                (validateCouponResult.products &&
                                  validateCouponResult.products.length &&
                                  validateCouponResult.products.filter(({ mrp }) => mrp === 0)
                                    .length) ? (
                                  <span className={classes.linkText}>
                                    <span>{couponCode}</span> applied
                                  </span>
                                ) : null}
                                <span className={classes.rightArrow}>
                                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                                </span>
                              </div>
                              <div className={classes.couponText}>
                                {validateCouponResult ? validateCouponResult.reason : ''}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      {couponCode.length > 0 &&
                        validateCouponResult &&
                        !!validateCouponResult.discount &&
                        validateCouponResult.discount > 0 &&
                        Number(validateCouponResult.discount.toFixed(2)) >
                          Number(productDiscount.toFixed(2)) && (
                          <div className={classes.discountTotal}>
                            {`Savings of Rs.
                          ${couponDiscount}
                           on the bill`}
                          </div>
                        )}
                      {errorMessage.length > 0 && (
                        <div className={classes.higherDiscountText}>{errorMessage}</div>
                      )}
                    </div>
                  </div>
                  <div className={`${classes.sectionGroup}`}>
                    <div className={classes.priceSection}>
                      <div className={classes.topSection}>
                        {/* <div className={classes.priceRow}>
                        <span>Subtotal</span>
                        <span className={classes.priceCol}>Rs. {cartTotal.toFixed(2)}</span>
                      </div>
                      <div className={classes.priceRow}>
                        <span>Delivery Charges</span>
                        <span className={classes.priceCol}>
                          {deliveryCharges > 0 ? `+ Rs. ${deliveryCharges}` : '+ Rs. 0'}
                        </span>
                      </div> */}
                        <div className={classes.priceRow}>
                          <span>MRP Total</span>
                          <span className={classes.priceCol}>Rs. {mrpTotal.toFixed(2)}</span>
                        </div>
                        <div className={classes.priceRow}>
                          <span>Product Discount</span>
                          <span className={classes.priceCol}>
                            - Rs. {productDiscount.toFixed(2)}
                          </span>
                        </div>
                        <div className={classes.priceRow}>
                          <span>Delivery Charges</span>
                          <span className={classes.priceCol}>
                            {deliveryCharges > 0 ? `+ Rs. ${deliveryCharges}` : '+ Rs. 0.00'}
                          </span>
                        </div>
                        {/* <div className={classes.priceRow}>
                        <span>Packaging Charges</span>
                        <span className={classes.priceCol}>{'+ Rs. 0'}</span>
                      </div> */}
                      </div>
                      <div className={classes.bottomSection}>
                        {validateCouponResult && (
                          <>
                            <div className={classes.priceRow}>
                              <span>Total</span>
                              <span className={classes.priceCol}>Rs. {totalAmount}</span>
                            </div>
                            {Number(validateCouponResult.discount.toFixed(2)) >
                              Number(productDiscount.toFixed(2)) && (
                              <div className={classes.priceRow}>
                                <span>Discount({couponCode})</span>
                                <span className={classes.priceCol}>-Rs. {couponDiscount}</span>
                              </div>
                            )}
                          </>
                        )}
                        <div
                          className={`${classes.priceRow} ${classes.totalPriceRow} ${
                            validateCouponResult ? classes.totalPriceBorder : ''
                          }`}
                        >
                          <span>TO PAY</span>
                          <span className={classes.totalPrice}>
                            {/* {showGross ? `(${cartTotal.toFixed(2)})` : ''} Rs. {totalAmount} */}
                            Rs. {totalWithCouponDiscount.toFixed(2)}
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
            {currentPatient && currentPatient.id ? (
              <Route
                render={({ history }) => (
                  <AphButton
                    onClick={() => {
                      const zipCodeInt = parseInt(selectedZip);

                      if (cartItems && cartItems.length > 0 && !nonCartFlow) {
                        if (prescriptions && prescriptions.length > 0) {
                          uploadMultipleFiles(prescriptions);
                        }
                        if (
                          checkForCartChanges(selectedZip, latitude, longitude).then((res) => {
                            if (res) {
                              if (isChennaiZipCode(zipCodeInt)) {
                                // redirect to chennai orders form
                                setIsChennaiCheckoutDialogOpen(true);
                                return;
                              }
                              sessionStorage.setItem(
                                'cartValues',
                                JSON.stringify({
                                  couponCode: couponCode == '' ? null : couponCode,
                                  couponValue: couponDiscount,
                                  totalWithCouponDiscount:
                                    validateCouponResult && validateCouponResult.discount
                                      ? totalWithCouponDiscount
                                      : Number(totalAmount),
                                  deliveryTime: deliveryTime,
                                  validateCouponResult: validateCouponResult,
                                  shopId: shopId,
                                  deliveryAddressId,
                                  tatType,
                                })
                              );
                              history.push(clientRoutes.payMedicine('pharmacy'));
                            }
                          })
                        ) {
                        }
                      } else if (
                        nonCartFlow &&
                        ((prescriptions && prescriptions.length > 0) ||
                          (ePrescriptionData && ePrescriptionData.length > 0))
                      ) {
                        if (isChennaiZipCode(zipCodeInt)) {
                          // redirect to chennai orders form
                          setIsChennaiCheckoutDialogOpen(true);
                          return;
                        }
                        onPressSubmit();
                      }
                      pharmacyProceedToPayTracking({
                        totalItems: cartItems.length,
                        serviceArea: 'Pharmacy',
                        subTotal: mrpTotal,
                        deliveryCharge: deliveryCharges,
                        netAfterDiscount: totalWithCouponDiscount,
                        isPrescription:
                          ePrescriptionData && ePrescriptionData.length > 0 ? true : false,
                        cartId: '',
                        deliveryMode,
                        deliveryDateTime: deliveryTime,
                        pincode: currentPincode,
                      });
                    }}
                    color="primary"
                    fullWidth
                    disabled={
                      (!nonCartFlow
                        ? (!cartTat && deliveryTime === '') || (cartItems && cartItems.length === 0)
                        : !deliveryAddressId ||
                          (deliveryAddressId && deliveryAddressId.length === 0)) ||
                      !isPaymentButtonEnable ||
                      disableSubmit
                    }
                    className={
                      (!nonCartFlow
                        ? (!cartTat && deliveryTime === '') || (cartItems && cartItems.length === 0)
                        : !deliveryAddressId ||
                          (deliveryAddressId && deliveryAddressId.length === 0)) ||
                      !isPaymentButtonEnable ||
                      disableSubmit
                        ? classes.buttonDisable
                        : ''
                    }
                    title={'Proceed to pay bill'}
                  >
                    {cartItems && cartItems.length > 0 && !nonCartFlow ? (
                      `Proceed to pay — RS. ${totalWithCouponDiscount.toFixed(2)}`
                    ) : uploadingFiles ? (
                      <CircularProgress size={22} color="secondary" />
                    ) : (
                      'Place order'
                    )}
                  </AphButton>
                )}
              />
            ) : (
              <AphButton
                color="primary"
                fullWidth
                title={'Login to continue'}
                onClick={() => {
                  const signInPopup = document.getElementById('loginPopup');
                  signInPopup && document.getElementById('loginPopup')!.click();
                }}
              >
                Login to continue
              </AphButton>
            )}
          </div>
        </div>
      </div>
      {/* This needs to be removed before the next release */}
      <div className={classes.checkoutBtnMobile}>
        {currentPatient && currentPatient.id ? (
          <Route
            render={({ history }) => (
              <AphButton
                onClick={() => {
                  const zipCodeInt = parseInt(selectedZip);

                  if (cartItems && cartItems.length > 0 && !nonCartFlow) {
                    if (prescriptions && prescriptions.length > 0) {
                      uploadMultipleFiles(prescriptions);
                    }
                    if (
                      checkForCartChanges(selectedZip, latitude, longitude).then((res) => {
                        if (res) {
                          if (isChennaiZipCode(zipCodeInt)) {
                            // redirect to chennai orders form
                            setIsChennaiCheckoutDialogOpen(true);
                            return;
                          }
                          sessionStorage.setItem(
                            'cartValues',
                            JSON.stringify({
                              couponCode: couponCode == '' ? null : couponCode,
                              couponValue: couponDiscount,
                              totalWithCouponDiscount:
                                validateCouponResult && validateCouponResult.discount
                                  ? totalWithCouponDiscount
                                  : Number(totalAmount),
                              deliveryTime: deliveryTime,
                              validateCouponResult: validateCouponResult,
                              shopId: shopId,
                              deliveryAddressId,
                              tatType,
                            })
                          );
                          history.push(clientRoutes.payMedicine('pharmacy'));
                        }
                      })
                    ) {
                    }
                  } else if (
                    nonCartFlow &&
                    ((prescriptions && prescriptions.length > 0) ||
                      (ePrescriptionData && ePrescriptionData.length > 0))
                  ) {
                    if (isChennaiZipCode(zipCodeInt)) {
                      // redirect to chennai orders form
                      setIsChennaiCheckoutDialogOpen(true);
                      return;
                    }
                    onPressSubmit();
                  }
                  pharmacyProceedToPayTracking({
                    totalItems: cartItems.length,
                    serviceArea: 'Pharmacy',
                    subTotal: mrpTotal,
                    deliveryCharge: deliveryCharges,
                    netAfterDiscount: totalWithCouponDiscount,
                    isPrescription:
                      ePrescriptionData && ePrescriptionData.length > 0 ? true : false,
                    cartId: '',
                    deliveryMode,
                    deliveryDateTime: deliveryTime,
                    pincode: currentPincode,
                  });
                }}
                color="primary"
                fullWidth
                disabled={
                  (!nonCartFlow
                    ? (!cartTat && deliveryTime === '') || (cartItems && cartItems.length === 0)
                    : !deliveryAddressId ||
                      (deliveryAddressId && deliveryAddressId.length === 0)) ||
                  !isPaymentButtonEnable ||
                  disableSubmit
                }
                className={
                  (!nonCartFlow
                    ? (!cartTat && deliveryTime === '') || (cartItems && cartItems.length === 0)
                    : !deliveryAddressId ||
                      (deliveryAddressId && deliveryAddressId.length === 0)) ||
                  !isPaymentButtonEnable ||
                  disableSubmit
                    ? classes.buttonDisable
                    : ''
                }
                title={'Proceed to pay bill'}
              >
                {cartItems && cartItems.length > 0 && !nonCartFlow ? (
                  `Proceed to pay — RS. ${totalWithCouponDiscount.toFixed(2)}`
                ) : uploadingFiles ? (
                  <CircularProgress size={22} color="secondary" />
                ) : (
                  'Place order'
                )}
              </AphButton>
            )}
          />
        ) : (
          <AphButton
            color="primary"
            fullWidth
            title={'Login to continue'}
            onClick={() => {
              const signInPopup = document.getElementById('loginPopup');
              signInPopup && document.getElementById('loginPopup')!.click();
            }}
          >
            Login to continue
          </AphButton>
        )}
      </div>

      <Popover
        open={showOrderPopup}
        anchorEl={addToCartRef.current}
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
              <img src={require('images/ic-mascot.png')} alt="" />
            </div>
            <OrderPlaced setShowOrderPopup={setShowOrderPopup} />
          </div>
        </div>
      </Popover>

      <Popover
        open={priceDifferencePopover}
        anchorEl={addToCartRef.current}
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
              <img src={require('images/ic-mascot.png')} alt="" />
            </div>
            <div className={classes.windowBody}>
              <Typography variant="h2">Hi!</Typography>
              <p>
                <span>Important message for items in your Cart:</span> <br />
                <br />
                <div>
                  We have updated your cart with the latest prices. Please check before you place
                  the order.
                </div>
              </p>
              <div className={classes.bottomActions}>
                <AphButton
                  className={classes.trackBtn}
                  onClick={() => {
                    setPriceDifferencePopover(false);
                  }}
                >
                  Okay, Got it
                </AphButton>
              </div>
            </div>
          </div>
        </div>
      </Popover>

      <AphDialog open={isUploadPreDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsUploadPreDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Upload Prescription(s)</AphDialogTitle>
        <UploadPrescription
          closeDialog={() => {
            setIsUploadPreDialogOpen(false);
          }}
          setIsEPrescriptionOpen={setIsEPrescriptionOpen}
          isNonCartFlow={false}
        />
      </AphDialog>

      {/* Chennai Checkout Dialog */}
      <AphDialog open={isChennaiCheckoutDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsChennaiCheckoutDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Checkout</AphDialogTitle>
        <ChennaiCheckout isLoading={isLoading} submitForm={submitChennaiCODOrder} />
      </AphDialog>

      <AphDialog open={isApplyCouponDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsApplyCouponDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Apply Coupon</AphDialogTitle>
        <ApplyCoupon
          couponCode={couponCode}
          setValidateCouponResult={setValidateCouponResult}
          close={(isApplyCouponDialogOpen: boolean) => {
            setIsApplyCouponDialogOpen(isApplyCouponDialogOpen);
          }}
          cartValue={cartTotal}
          validityStatus={validityStatus}
          setValidityStatus={setValidityStatus}
        />
      </AphDialog>

      <AphDialog open={isEPrescriptionOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsEPrescriptionOpen(false)} title={'Close'} />
        <AphDialogTitle className={classes.ePrescriptionTitle}>E Prescription</AphDialogTitle>
        <UploadEPrescriptionCard
          setIsEPrescriptionOpen={setIsEPrescriptionOpen}
          isNonCartFlow={false}
        />
      </AphDialog>
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
      <NavigationBottom />
    </div>
  );
};
