import React, { useState, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, Tabs, Tab, CircularProgress } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton, AphDialog, AphDialogTitle, AphDialogClose } from '@aph/web-ui-components';
import { HomeDelivery } from 'components/Locations/HomeDelivery';
import { StorePickUp } from 'components/Locations/StorePickUp';
import { Checkout } from 'components/Cart/Checkout';
import { UploadPrescription } from 'components/Prescriptions/UploadPrescription';
import {
  useShoppingCart,
  PrescriptionFormat,
  EPrescription,
} from 'components/MedicinesCartProvider';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { ApplyCoupon } from 'components/Cart/ApplyCoupon';
import { SAVE_MEDICINE_ORDER, SAVE_MEDICINE_ORDER_PAYMENT } from 'graphql/medicines';
import { SaveMedicineOrder, SaveMedicineOrderVariables } from 'graphql/types/SaveMedicineOrder';
import { SaveMedicineOrderPaymentMqVariables } from 'graphql/types/SaveMedicineOrderPaymentMq';
import {
  MEDICINE_DELIVERY_TYPE,
  MEDICINE_ORDER_PAYMENT_TYPE,
  UPLOAD_FILE_TYPES,
} from 'graphql/types/globalTypes';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import { PrescriptionCard } from 'components/Prescriptions/PrescriptionCard';
import { useMutation } from 'react-apollo-hooks';
import { MedicineListingCard } from 'components/Medicine/MedicineListingCard';
import { LocationContext } from 'components/LocationProvider';
import { UploadEPrescriptionCard } from 'components/Prescriptions/UploadEPrescriptionCard';
import { EPrescriptionCard } from '../Prescriptions/EPrescriptionCard';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { NavigationBottom } from 'components/NavigationBottom';
import { UPLOAD_DOCUMENT, SAVE_PRESCRIPTION_MEDICINE_ORDER } from '../../graphql/profiles';
import { SavePrescriptionMedicineOrderVariables } from '../../graphql/types/SavePrescriptionMedicineOrder';
import moment from 'moment';
import { Alerts } from 'components/Alerts/Alerts';

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

export const MedicineCart: React.FC = (props) => {
  const classes = useStyles({});
  const {
    storePickupPincode,
    deliveryAddressId,
    storeAddressId,
    clearCartInfo,
    prescriptions,
    setPrescriptions,
    cartItems,
    cartTotal,
    ePrescriptionData,
    setEPrescriptionData,
  } = useShoppingCart();

  const urlParams = new URLSearchParams(window.location.search);
  const nonCartFlow = urlParams.get('prescription') ? urlParams.get('prescription') : false;

  const [tabValue, setTabValue] = useState<number>(0);
  const [isUploadPreDialogOpen, setIsUploadPreDialogOpen] = React.useState<boolean>(false);

  const [isApplyCouponDialogOpen, setIsApplyCouponDialogOpen] = React.useState<boolean>(false);
  const [couponCode, setCouponCode] = React.useState<string>('');
  const [checkoutDialogOpen, setCheckoutDialogOpen] = React.useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = React.useState<string>('');
  const [mutationLoading, setMutationLoading] = useState(false);

  const { currentPincode } = useContext(LocationContext);
  const [isEPrescriptionOpen, setIsEPrescriptionOpen] = React.useState<boolean>(false);
  const [uploadingFiles, setUploadingFiles] = React.useState<boolean>(false);

  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const [deliveryTime, setDeliveryTime] = React.useState<string>('');

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
  };

  const { currentPatient } = useAllCurrentPatients();
  const { authToken } = useAuth();
  const pharmacyMinDeliveryValue = process.env.PHARMACY_MIN_DELIVERY_VALUE;
  const pharmacyDeliveryCharges = process.env.PHARMACY_DELIVERY_CHARGES;
  const deliveryMode = tabValue === 0 ? 'HOME' : 'PICKUP';
  const disablePayButton = paymentMethod === '';

  // business rule defined if the total is greater than 200 no delivery charges.
  // if the total is less than 200 +20 is added.
  const discountAmount = couponCode !== '' ? parseFloat(((cartTotal * 10) / 100).toFixed(2)) : 0;
  const grossValue = cartTotal - discountAmount;
  const deliveryCharges =
    grossValue >= Number(pharmacyMinDeliveryValue) || grossValue <= 0 || tabValue === 1
      ? 0
      : Number(pharmacyDeliveryCharges);
  const totalAmount = (grossValue + Number(deliveryCharges)).toFixed(2);
  const showGross = (deliveryCharges && deliveryCharges < 0) || discountAmount > 0;

  const disableSubmit =
    deliveryMode === 'HOME'
      ? deliveryAddressId === ''
      : deliveryMode === 'PICKUP'
      ? storeAddressId === ''
      : false;
  const uploadPrescriptionRequired = cartItems.findIndex(
    (v) => Number(v.is_prescription_required) === 1
  );

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
            isMedicine: null,
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
          shopId: deliveryMode === 'HOME' ? '' : storeAddressId,
          patientAddressId: deliveryMode === 'HOME' ? deliveryAddressId : '',
          medicineDeliveryType:
            deliveryMode === 'HOME'
              ? MEDICINE_DELIVERY_TYPE.HOME_DELIVERY
              : MEDICINE_DELIVERY_TYPE.STORE_PICKUP,
          estimatedAmount: parseFloat(totalAmount),
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
        },
      },
    }
  );

  const savePayment = useMutation(SAVE_MEDICINE_ORDER_PAYMENT);

  const placeOrder = (orderId: string, orderAutoId: number) => {
    const paymentInfo: SaveMedicineOrderPaymentMqVariables = {
      medicinePaymentMqInput: {
        orderId: orderId,
        orderAutoId: orderAutoId,
        amountPaid: parseFloat(totalAmount),
        paymentType: MEDICINE_ORDER_PAYMENT_TYPE.COD,
        paymentStatus: 'success',
        responseCode: '',
        responseMessage: '',
      },
    };

    savePayment({ variables: paymentInfo })
      .then(({ data }: any) => {
        if (data && data.SaveMedicineOrderPaymentMq) {
          const { errorCode, errorMessage } = data.SaveMedicineOrderPaymentMq;
          if (errorCode || (errorMessage && errorMessage.length > 0)) {
            localStorage.setItem('orderStatus', 'failed');
            window.location.href = clientRoutes.medicinesCartInfo(orderAutoId.toString());
            return;
          }
          setCheckoutDialogOpen(false);
          clearCartInfo && clearCartInfo();
          localStorage.setItem('orderStatus', 'success');
          window.location.href = clientRoutes.medicinesCartInfo(orderAutoId.toString());
        }
      })
      .catch((e) => {
        localStorage.setItem('orderStatus', 'failed');
        window.location.href = clientRoutes.medicinesCartInfo(orderAutoId.toString());
      })
      .finally(() => {
        setMutationLoading(false);
      });
  };

  const uploadDocumentMutation = useMutation(UPLOAD_DOCUMENT);
  const savePrescriptionMutation = useMutation(SAVE_PRESCRIPTION_MEDICINE_ORDER);

  const submitPrescriptionMedicineOrder = (variables: SavePrescriptionMedicineOrderVariables) => {
    savePrescriptionMutation({
      variables,
    })
      .then(({ data }) => {
        console.log(data);
        clearCartInfo && clearCartInfo();
        setTimeout(() => {
          localStorage.setItem('orderStatus', 'success');
          window.location.href = clientRoutes.medicinesCartInfo('prescription');
        }, 3000);
      })
      .catch((e) => {
        console.log({ e });
        setIsAlertOpen(true);
        setAlertMessage(`Something went wrong, please try later.`);
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
              category: 'HealthChecks',
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

  const onPressSubmit = async () => {
    setUploadingFiles(true);
    const ePresUrls =
      ePrescriptionData && ePrescriptionData.map((item) => item.uploadedUrl).filter((i) => i);
    const ePresPrismIds =
      ePrescriptionData &&
      ePrescriptionData.map((item) => item.prismPrescriptionFileId).filter((i) => i);
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
          const prescriptionMedicineInput: SavePrescriptionMedicineOrderVariables = {
            prescriptionMedicineInput: {
              patientId: (currentPatient && currentPatient.id) || '',
              medicineDeliveryType: deliveryAddressId
                ? MEDICINE_DELIVERY_TYPE.HOME_DELIVERY
                : MEDICINE_DELIVERY_TYPE.STORE_PICKUP,
              shopId: storeAddressId || '0',
              appointmentId: '',
              patinetAddressId: deliveryAddressId || '',
              prescriptionImageUrl: [...phyPresUrls, ...ePresUrls].join(','),
              prismPrescriptionFileId: [...phyPresPrismIds, ...ePresPrismIds].join(','),
              isEprescription: ePrescriptionData && ePrescriptionData.length ? 1 : 0, // if atleat one prescription is E-Prescription then pass it as one.
            },
          };
          submitPrescriptionMedicineOrder(prescriptionMedicineInput);
        })
        .catch((e) => {
          console.log(e);
          setUploadingFiles(false);
          setIsAlertOpen(true);
          setAlertMessage('something went wrong');
        });
    } else {
      const prescriptionMedicineInput: SavePrescriptionMedicineOrderVariables = {
        prescriptionMedicineInput: {
          patientId: (currentPatient && currentPatient.id) || '',
          medicineDeliveryType: deliveryAddressId
            ? MEDICINE_DELIVERY_TYPE.HOME_DELIVERY
            : MEDICINE_DELIVERY_TYPE.STORE_PICKUP,
          shopId: storeAddressId || '0',
          appointmentId: '',
          patinetAddressId: deliveryAddressId || '',
          prescriptionImageUrl: [...ePresUrls].join(','),
          prismPrescriptionFileId: [...ePresPrismIds].join(','),
          isEprescription: ePrescriptionData && ePrescriptionData.length ? 1 : 0, // if atleat one prescription is E-Prescription then pass it as one.
        },
      };
      submitPrescriptionMedicineOrder(prescriptionMedicineInput);
    }
  };

  const isPaymentButtonEnable =
    (cartItems && cartItems.length > 0) ||
    (prescriptions && prescriptions.length > 0) ||
    (ePrescriptionData && ePrescriptionData.length > 0) ||
    false;
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
            {!nonCartFlow && (
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
                  title={'Add items to cart'}
                >
                  Add Items
                </AphButton>
              </div>
            )}
            {cartItems.length > 0 ||
            (prescriptions && prescriptions.length > 0) ||
            (ePrescriptionData && ePrescriptionData.length > 0) ? (
              <>
                {!nonCartFlow && <MedicineListingCard />}
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
                          prescriptions.map((prescriptionDetails, index) => {
                            const fileName = prescriptionDetails.name;
                            const imageUrl = prescriptionDetails.imageUrl;
                            return (
                              <PrescriptionCard
                                fileName={fileName || ''}
                                imageUrl={imageUrl || ''}
                                removePrescription={(fileName: string) =>
                                  removeImagePrescription(fileName)
                                }
                                key={index}
                              />
                            );
                          })}
                        {ePrescriptionData &&
                          ePrescriptionData.length > 0 &&
                          ePrescriptionData.map((prescription: EPrescription) => (
                            <EPrescriptionCard
                              prescription={prescription}
                              removePrescription={removePrescription}
                            />
                          ))}
                        <div className={classes.uploadMore}>
                          <AphButton
                            disabled={uploadingFiles || mutationLoading}
                            onClick={() => setIsUploadPreDialogOpen(true)}
                          >
                            Upload More
                          </AphButton>
                        </div>
                      </div>
                    ) : uploadPrescriptionRequired >= 0 ? (
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
                    <HomeDelivery setDeliveryTime={setDeliveryTime} deliveryTime={deliveryTime} />
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
            {cartItems && cartItems.length > 0 && (
              <>
                <div className={`${classes.sectionHeader} ${classes.uppercase}`}>
                  <span>Total Charges</span>
                </div>
                {/* {isPaymentButtonEnable && (
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
                        <span className={classes.rightArrow}>
                          <img src={require('images/ic_tickmark.svg')} alt="" />
                        </span>
                      </div>
                    )}
                  </div>
                )} */}
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
              if (cartItems && cartItems.length > 0 && !nonCartFlow) {
                setCheckoutDialogOpen(true);
              } else if (
                nonCartFlow &&
                ((prescriptions && prescriptions.length > 0) ||
                  (ePrescriptionData && ePrescriptionData.length > 0))
              ) {
                onPressSubmit();
              }
            }}
            color="primary"
            fullWidth
            disabled={disableSubmit || !isPaymentButtonEnable || uploadingFiles}
            className={
              disableSubmit || !isPaymentButtonEnable || mutationLoading
                ? classes.buttonDisable
                : ''
            }
            title={'Proceed to pay bill'}
          >
            {cartItems && cartItems.length > 0 && !nonCartFlow ? (
              `Proceed to pay — RS. ${totalAmount}`
            ) : uploadingFiles ? (
              <CircularProgress size={22} color="secondary" />
            ) : (
              'Submit Prescription'
            )}
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
                paymentMutation()
                  .then((res) => {
                    if (res && res.data && res.data.SaveMedicineOrder) {
                      const { orderId, orderAutoId } = res.data.SaveMedicineOrder;
                      const currentPatiendId = currentPatient ? currentPatient.id : '';
                      if (orderAutoId && orderAutoId > 0 && paymentMethod === 'PAYTM') {
                        clearCartInfo && clearCartInfo();
                        const pgUrl = `${process.env.PHARMACY_PG_URL}/paymed?amount=${totalAmount}&oid=${orderAutoId}&token=${authToken}&pid=${currentPatiendId}&source=web`;
                        window.location.href = pgUrl;
                      } else if (orderAutoId && orderAutoId > 0 && paymentMethod === 'COD') {
                        placeOrder(orderId, orderAutoId);
                      }
                    }
                  })
                  .catch((e) => {
                    setIsAlertOpen(true);
                    setAlertMessage('something went wrong');
                    console.log(e);
                    setMutationLoading(false);
                  });
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

      <AphDialog open={isUploadPreDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsUploadPreDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Upload Prescription(s)</AphDialogTitle>
        <UploadPrescription
          closeDialog={() => {
            setIsUploadPreDialogOpen(false);
          }}
          setIsEPrescriptionOpen={setIsEPrescriptionOpen}
        />
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

      <AphDialog open={isEPrescriptionOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsEPrescriptionOpen(false)} title={'Close'} />
        <AphDialogTitle className={classes.ePrescriptionTitle}>E Prescription</AphDialogTitle>
        <UploadEPrescriptionCard setIsEPrescriptionOpen={setIsEPrescriptionOpen} />
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
