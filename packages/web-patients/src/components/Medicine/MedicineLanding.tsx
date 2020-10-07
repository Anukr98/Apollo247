import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { makeStyles } from '@material-ui/styles';
import { Theme, Popover, CircularProgress, Typography } from '@material-ui/core';
import { Header } from 'components/Header';
import { Helmet } from 'react-helmet';
import { AphButton, AphDialog, AphDialogTitle, AphDialogClose } from '@aph/web-ui-components';
import { ShopByBrand } from 'components/Medicine/Cards/ShopByBrand';
import { ShopByCategory } from 'components/Medicine/Cards/ShopByCategory';
import { RecommendedProducts } from 'components/Medicine/Cards/RecommendedProducts';
import { DayDeals } from 'components/Medicine/Cards/DayDeals';
import { HotSellers } from 'components/Medicine/Cards/HotSellers';
import { MedicineAutoSearch } from 'components/Medicine/MedicineAutoSearch';
import { GET_LATEST_MEDICINE_ORDER } from 'graphql/profiles';
import { ReOrder } from 'components/Orders/ReOrder';
import { getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails as medicineOrderDetailsType } from 'graphql/types/getLatestMedicineOrder';
import { useMutation } from 'react-apollo-hooks';
import { ApolloError } from 'apollo-client';
import { MedicinePageAPiResponse } from './../../helpers/MedicineApiCalls';
import axios from 'axios';
import { PaymentStatusModal } from 'components/Cart/PaymentStatusModal';
import { useParams } from 'hooks/routerHooks';
import { NavigationBottom } from 'components/NavigationBottom';
import { UploadPrescription } from 'components/Prescriptions/UploadPrescription';
import { UploadEPrescriptionCard } from 'components/Prescriptions/UploadEPrescriptionCard';
import { useAllCurrentPatients, useCurrentPatient } from 'hooks/authHooks';
import {
  uploadPrescriptionTracking,
  pharmacyUploadPresClickTracking,
  uploadPhotoTracking,
} from '../../webEngageTracking';
import moment from 'moment';
import { useShoppingCart } from 'components/MedicinesCartProvider';
import { ManageProfile } from 'components/ManageProfile';
import { Relation } from 'graphql/types/globalTypes';
import { CarouselBanner } from 'components/Medicine/CarouselBanner';
import { gtmTracking } from '../../gtmTracking';
import { MetaTagsComp } from 'MetaTagsComp';
import { BottomLinks } from 'components/BottomLinks';
import { Route } from 'react-router-dom';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import { useAuth } from 'hooks/authHooks';
import { deepLinkUtil } from 'helpers/commonHelpers';
import { isAlternateVersion } from 'helpers/commonHelpers';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    doctorListingPage: {
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        marginTop: 70,
      },
    },
    pageTopHeader: {
      backgroundColor: theme.palette.common.white,
      padding: '30px 40px',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      borderRadius: 5,
      [theme.breakpoints.down('xs')]: {
        padding: 0,
        boxShadow: 'none',
      },
    },
    medicineTopGroup: {
      display: 'flex',
      // paddingTop: 25,
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        paddingTop: 0,
      },
    },
    searchSection: {
      width: 'calc(100% - 284px)',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    progressLoader: {
      textAlign: 'center',
      padding: 20,
    },
    rightSection: {
      marginLeft: 'auto',
      width: 284,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        padding: '20px 20px 0 20px',
        backgroundColor: '#f7f8f5',
      },
    },
    userName: {
      fontSize: 50,
      fontWeight: 600,
      color: '#02475b',
      lineHeight: '50px',
      [theme.breakpoints.down(768)]: {
        padding: 20,
        position: 'fixed',
        width: '100%',
        background: '#fff',
        zIndex: 999,
        top: 74,
        display: 'none',
      },
    },
    searchMedicineForm: {
      backgroundColor: '#f7f8f5',
      padding: '8px 12px 10px 12px',
      display: 'flex',
      alignItems: 'center',
      borderRadius: 5,
    },
    searchInput: {
      '& >div': {
        '&:after': {
          display: 'none',
        },
        '&:before': {
          display: 'none',
        },
      },
    },
    searchBtn: {
      marginLeft: 'auto',
      padding: 0,
      boxShadow: 'none',
      backgroundColor: 'transparent !important',
      minWidth: 'auto',
    },
    productsBanner: {
      marginTop: 15,
      backgroundColor: '#d5d5d5',
      '& img': {
        verticalAlign: 'middle',
        maxWidth: '100%',
      },
      [theme.breakpoints.down('xs')]: {
        textAlign: 'center',
      },
    },
    medicineSection: {
      paddingLeft: 15,
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 0,
      },
    },
    sectionGroup: {
      marginBottom: 15,
    },
    ePrescriptionTitle: {
      zIndex: 9999,
    },
    serviceType: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      paddingbottom: 8,
      display: 'flex',
      width: '100%',
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        // boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    preServiceType: {
      backgroundColor: '#f7f8f5',
      borderRadius: 10,
      padding: 16,
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
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
    reOrder: {
      width: 54,
      marginLeft: 'auto',
    },
    linkText: {
      letterSpacing: 'normal',
      paddingRight: 10,
    },
    consultLink: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 5,
      '& a': {
        textTransform: 'uppercase',
        color: '#fc9916',
        fontSize: 13,
        paddingLeft: 5,
        fontWeight: 'bold',
      },
    },
    prescriptionGroup: {
      display: 'flex',
      width: '100%',
      '& button': {
        backgroundColor: '#fcb716',
        color: '#fff',
        border: '1px solid #fcb716',
        minWidth: 105,
        '&:hover': {
          backgroundColor: '#fff',
          color: '#fcb716',
        },
      },
    },
    prescriptionIcon: {
      marginLeft: 'auto',
      paddingLeft: 10,
      '& img': {
        maxWidth: 42,
      },
    },
    groupTitle: {
      fontSize: 16,
      paddingBottom: 16,
      margin: 0,
      fontWeight: 500,
    },
    marginNone: {
      marginBottom: 0,
    },
    allProductsList: {
      padding: '30px 40px',
      paddingBottom: 10,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 25,
        paddingRight: 0,
        paddingLeft: 0,
      },
    },
    sliderSection: {
      padding: '0 0 20px',
      [theme.breakpoints.down('xs')]: {
        padding: '0 20px 20px',
        overflowX: 'hidden',
      },
    },
    sectionTitle: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      borderBottom: 'solid 0.5px rgba(2, 71, 91, 0.3)',
      paddingBottom: 8,
      marginBottom: 10,
      display: 'flex',
    },
    viewAllLink: {
      marginLeft: 'auto',
      [theme.breakpoints.down('xs')]: {
        marginRight: 20,
      },
      '& a': {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#fc9916',
      },
    },
    sectionHeading: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 'bold',
      margin: 0,
      padding: 0,
      textTransform: 'uppercase',
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
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
    windowWrapNew: {
      width: 368,
      borderRadius: 10,
      padding: 20,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
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
    thankyouPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
      '& h3': {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#02475b',
        margin: '0 0 10px',
      },
      '& h4': {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#0087ba',
      },
    },
    pUploadSuccess: {
      '& h2': {
        fontSize: 36,
        lineHeight: '44px',
        fontWeight: 'bold',
      },
      '& p': {
        fontSize: 17,
        color: '#0087ba',
        lineHeight: '24px',
        margin: '20px 0',
        fontWeight: '600',
      },
      '& a': {
        fontSize: 13,
        fontWeight: '600',
        display: 'block',
        textAlign: 'right',
        textTransform: 'uppercase',
        color: '#fc9916',
      },
    },
    trackBtn: {
      marginLeft: 'auto',
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 72,
      },
    },
    medicineReview: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      marginTop: 16,
      fontSize: 13,
      '& a': {
        color: '#fc9916',
        [theme.breakpoints.down('xs')]: {
          display: 'block',
          margin: '5px 0 0',
        },
      },
      '& p': {
        marginBottom: 0,
      },
    },
    medicineReviewReorder: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      marginTop: 5,
      paddingTop: 15,
      fontSize: 13,
      '& a': {
        color: '#fc9916',
      },
      '& p': {
        marginBottom: 0,
      },
    },
    serviceArea: {
      fontSize: 11,
      lineHeight: '15px',
      color: '#02475b',
      fontWeight: 'normal',
      margin: '4px 0 0 30px',
      '& span': {
        display: 'inline-block',
        width: '100%',
      },
    },
    webCarousel: {
      [theme.breakpoints.down(500)]: {
        display: 'none',
      },
    },
    mobileCarousel: {
      display: ' none',
      [theme.breakpoints.down(500)]: {
        display: 'block',
      },
    },
    medicineHeader: {
      [theme.breakpoints.down('xs')]: {
        '& header': {
          boxShadow: 'none',
        },
      },
    },
    mBannerContainer: {
      padding: '20px 0',
      position: 'relative',
    },
    mBannerContent: {
      padding: 20,
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('sm')]: {
        padding: 10,
      },
      '& img': {
        margin: '0 10px',
        [theme.breakpoints.down('sm')]: {
          width: 40,
          display: 'none',
        },
      },
    },
    medicineImg: {
      margin: '0 !important',
      position: 'relative',
      right: -30,
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    mBannerDetail: {
      '& h1': {
        fontSize: 24,
        fontWeight: 600,
        color: '#579BCC',
        borderBottom: '1px solid #579BCC',
        textTransform: 'uppercase',
        [theme.breakpoints.down('sm')]: {
          fontSize: 12,
        },
      },
      '& h2': {
        fontSize: 18,
        fontWeight: 400,
        [theme.breakpoints.down('sm')]: {
          fontSize: 10,
        },
      },
    },
    mcContainer: {
      background: '#fff',
      padding: 20,
    },
    mcContent: {
      padding: '0 0 10px',
      '& h1': {
        fontSize: 16,
        lineHeight: '20px',
        fontWeight: 500,
        textTransform: 'uppercase',
        margin: '0 0 10px',
      },
      '& p': {
        fontSize: 14,
        lineHeight: '20px',
      },
    },
    mcList: {
      margin: '10px 0',
      listStyle: 'none',
      padding: '0 0 0 10px',
      '& li': {
        fontSize: 14,
        lineHeight: '18px',
        padding: '2px 0',
      },
    },
    mcDetail: {
      padding: '10px 0',
      '& h2': {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 600,
        margin: '0 0 10px',
      },
      '& p': {
        fontSize: 14,
        lineHeight: '20px',
        '& span': {
          fontWeight: 700,
          display: 'block',
        },
      },
    },
    mfaqContainer: {
      margin: '20px 0',
      background: '#fff',
      padding: 20,
      '& >p': {
        fontSize: 16,
        fontWeight: 500,
        margin: '0 0 10px',
        textTransform: 'uppercase',
      },
    },
    mfaqDetail: {
      padding: '10px 0',
      '& h2': {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 600,
        margin: '0 0 10px',
      },
      '& p': {
        fontSize: 14,
        lineHeight: '20px',
      },
    },
  };
});

const MedicineLanding: React.FC = (props: any) => {
  const classes = useStyles({});
  const { isSignedIn } = useAuth();
  const addToCartRef = useRef(null);
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const {
    clearCartInfo,
    cartItems,
    setCartItems,
    ePrescriptionData,
    prescriptions,
    cartTotal,
  } = useShoppingCart();
  const params = useParams<{
    orderAutoId: string;
    orderStatus: string;
  }>();

  // const { city } = useLocationDetails()

  if (params.orderStatus === 'success') {
    if (cartItems.length > 0 && params.orderAutoId !== 'prescription') {
      // the length condition check is mandatory else it will execute it infinity times
      localStorage.removeItem(`${currentPatient && currentPatient.id}`);
      localStorage.removeItem('dp');
      setCartItems && setCartItems([]);
      clearCartInfo && clearCartInfo();
    }
    if (
      params.orderAutoId === 'prescription' &&
      ((ePrescriptionData && ePrescriptionData.length > 0) ||
        (prescriptions && prescriptions.length > 0)) // the length condition check is mandatory else it will execute it infinity times
    ) {
      clearCartInfo && clearCartInfo();
    }
    if (localStorage.getItem('pharmaCoupon')) {
      localStorage.removeItem('pharmaCoupon');
    }
    sessionStorage.removeItem('cartValues');
    sessionStorage.removeItem('utm_source');
  }

  const [data, setData] = useState<MedicinePageAPiResponse | null>(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApolloError | null>(null);
  const [showPrescriptionPopup, setShowPrescriptionPopup] = useState<boolean>(
    params.orderAutoId && params.orderAutoId === 'prescription' ? true : false
  );
  const [showOrderPopup, setShowOrderPopup] = useState<boolean>(
    params.orderStatus && params.orderAutoId !== 'prescription' ? true : false
  );
  const [isUploadPreDialogOpen, setIsUploadPreDialogOpen] = React.useState<boolean>(false);
  const [isEPrescriptionOpen, setIsEPrescriptionOpen] = React.useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const mascotRef = useRef(null);
  const [latestMedicineOrder, setLatestMedicineOrder] = useState<medicineOrderDetailsType | null>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const latestOrdereDetails = useMutation(GET_LATEST_MEDICINE_ORDER);
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const apiDetails = {
    // url: process.env.PHARMACY_MED_PROD_SEARCH_BY_BRAND,
    url: 'https://magento.apollo247.com/apollo_24x7_api.php?version=v2',
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };
  useEffect(() => {
    deepLinkUtil(`Medicine`);
  }, []);

  useEffect(() => {
    sessionStorage.removeItem('categoryClicked');
  }, []);

  useEffect(() => {
    if (
      (props &&
        props.location &&
        props.location.search.substring(1) === 'prescriptionSubmit=success') ||
      window.location.href.includes('prescriptionSubmit=success')
    ) {
      setIsPopoverOpen(true);
    }
  }, [props]);

  useEffect(() => {
    if (currentPatient && currentPatient.uhid) {
      setIsLoading(true);
      latestOrdereDetails({
        variables: {
          patientUhid: currentPatient.uhid,
        },
      })
        .then((res: any) => {
          if (
            res &&
            res.data &&
            res.data.getLatestMedicineOrder &&
            res.data.getLatestMedicineOrder.medicineOrderDetails
          ) {
            setLatestMedicineOrder(res.data.getLatestMedicineOrder.medicineOrderDetails);
          } else {
            setLatestMedicineOrder(null);
          }
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [currentPatient]);

  /* Gtm code Start */
  useEffect(() => {
    if (params.orderStatus === 'success' && cartTotal > 0) {
      gtmTracking({
        category: 'Pharmacy',
        action: 'Order',
        label: 'Order Success',
        value: cartTotal,
      });
    }
  }, [showOrderPopup, cartTotal]);
  /* Gtm code End */

  const getMedicinePageProducts = async () => {
    await axios
      .post(
        apiDetails.url!,
        {},
        {
          headers: {
            Authorization: apiDetails.authToken,
            Accept: '*/*',
          },
        }
      )
      .then((res: any) => {
        setData(res.data);
        if (res.data && res.data.metadata && res.data.metadata.length > 0) {
          const removableData = ['banners', 'orders', 'upload_prescription'];
          let position = 0;
          let updatedMetadata: any[] = [];
          res.data.metadata.forEach((section: any) => {
            const sectionData = res.data[`${section.section_key}`];
            if (!removableData.includes(section.section_key) && section.visible) {
              position += 1;
              const renderValue = () => {
                if (sectionData) {
                  return sectionData.products ? (
                    <HotSellers data={sectionData} section={section.section_name} />
                  ) : sectionData.length > 0 && sectionData[0].title ? (
                    section.section_key === 'shop_by_brand' ? (
                      <ShopByBrand data={sectionData} sectionName={section.section_key} />
                    ) : (
                      <ShopByCategory data={sectionData} sectionName={section.section_key} />
                    )
                  ) : (
                    <div>
                      <DayDeals data={sectionData} sectionName={section.section_key} />
                      <div className={classes.mBannerContainer}>
                        <div className={classes.mBannerContent}>
                          <div className={classes.mBannerDetail}>
                            <Typography component="h1">Order Medicine Online</Typography>
                            <Typography component="h2">Genuine medicines and essentials</Typography>
                          </div>
                          <img src={require('images/24-7.svg')} alt="" />
                          <div className={classes.mBannerDetail}>
                            <Typography component="h1">From Apollo Pharmacy</Typography>
                            <Typography component="h2">delivered in a jiffy!</Typography>
                          </div>
                          <img
                            src={require('images/online-medicine.svg')}
                            className={classes.medicineImg}
                            alt="Order Medicine Online"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
              };
              updatedMetadata.push({
                section_key: section.section_key,
                section_name: section.section_name,
                section_position: position,
                visible: sectionData ? section.visible : false,
                value: renderValue(),
                viewAll: sectionData && sectionData.products && sectionData.url_key ? true : false,
                viewAllUrlKey: sectionData && sectionData.url_key ? sectionData.url_key : '',
              });
            }
          });
          setMetadata(updatedMetadata);
        }
        /**Gtm code start  */
        gtmTracking({ category: 'Pharmacy', action: 'Landing Page', label: 'Listing Page Viewed' });
        /**Gtm code End  */
        setLoading(false);
      })
      .catch((e: ApolloError) => {
        setError(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (apiDetails.url != null && !data) {
      getMedicinePageProducts();
    }
  }, [data]);

  const productsRecommended = latestMedicineOrder && latestMedicineOrder.medicineOrderLineItems;
  const isOfflineOrder =
    latestMedicineOrder && latestMedicineOrder.currentStatus === 'PURCHASED_IN_STORE';
  const orderDelivered =
    isOfflineOrder || (latestMedicineOrder && latestMedicineOrder.currentStatus === 'DELIVERED');

  const onePrimaryUser =
    allCurrentPatients && allCurrentPatients.filter((x) => x.relation === Relation.ME).length === 1;
  const patient = useCurrentPatient();
  const age = patient && patient.dateOfBirth ? moment().diff(patient.dateOfBirth, 'years') : null;

  const handleUploadPrescription = () => {
    uploadPrescriptionTracking({ ...patient, age });
    pharmacyUploadPresClickTracking('Home');
    setIsUploadPreDialogOpen(true);
  };
  const metaTagProps = {
    title: 'Apollo 247- Online Pharmacy, Online Medicine Order, Fastest Delivery',
    description:
      "Apollo 247 Online Pharmacy - Online Medicine Order - Buy medicines online from Apollo Online Pharmacy Store (India's largest pharmacy chain) and experience the fastest home delivery. All kinds of medicines, health products & equipments are available at our online medicine store.",
    canonicalLink:
      window && window.location && window.location.origin && `${window.location.origin}/medicines`,
    deepLink: window.location.href,
  };

  const getOrderSubtitle = (order: medicineOrderDetailsType) => {
    if (order) {
      const isOfflineOrder = order.billNumber;
      const shopAddress = (isOfflineOrder && order.shopAddress) || '';
      const parsedShopAddress = !shopAddress.length ? JSON.parse(shopAddress || '{}') : '';
      const address = !parsedShopAddress.length
        ? [parsedShopAddress.storeName, parsedShopAddress.city, parsedShopAddress.zipcode]
            .filter((a) => a)
            .join(', ')
        : '';
      const date = order.createdDate ? moment(order.createdDate).format('MMMM DD, YYYY') : '';
      return isOfflineOrder ? `Ordered at ${address} on ${date}` : `Ordered online on ${date}`;
    }
  };

  const getOrderTitle = (order: medicineOrderDetailsType) => {
    // use billedItems for delivered orders

    const billedItems =
      order.medicineOrderShipments &&
      order.medicineOrderShipments[0] &&
      order.medicineOrderShipments[0].medicineOrderInvoice &&
      order.medicineOrderShipments[0].medicineOrderInvoice[0] &&
      order.medicineOrderShipments[0].medicineOrderInvoice[0].itemDetails
        ? order.medicineOrderShipments[0].medicineOrderInvoice[0].itemDetails
        : null;
    const billedLineItems = billedItems
      ? (JSON.parse(billedItems) as { itemName: string }[])
      : null;
    const lineItems = (billedLineItems || order.medicineOrderLineItems || []) as {
      itemName?: string;
      medicineName?: string;
    }[];
    let title = 'Medicines';
    if (lineItems.length) {
      const firstItem = billedLineItems ? lineItems[0].itemName : lineItems[0].medicineName;
      const lineItemsLength = lineItems.length;
      title =
        lineItemsLength > 1
          ? `${firstItem} + ${lineItemsLength - 1} item${lineItemsLength > 2 ? 's ' : ' '}`
          : firstItem;
    }
    return title;
  };

  const orderTitle = latestMedicineOrder ? getOrderTitle(latestMedicineOrder) : '';

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div className={classes.root}>
      <Helmet>
        <link
          rel="alternate"
          href="android-app://com.apollopatient/https/www.apollo247.com/medicines"
        />
      </Helmet>
      <MetaTagsComp {...metaTagProps} />
      <div className={classes.medicineHeader}>
        <Header />
      </div>
      <div className={classes.container}>
        <div className={classes.doctorListingPage}>
          <div className={classes.pageTopHeader}>
            {/* <div className={classes.userName}>
              hi {currentPatient ? currentPatient.firstName : 'User'} :)
            </div> */}
            <div className={classes.medicineTopGroup}>
              <div className={classes.searchSection}>
                <MedicineAutoSearch />
                {loading && (
                  <div className={classes.progressLoader}>
                    <CircularProgress size={30} />
                  </div>
                )}
                <div className={classes.webCarousel}>
                  {data && data.mainbanners_desktop && data.mainbanners_desktop.length > 0 && (
                    <CarouselBanner bannerData={data.mainbanners_desktop} history={props.history} />
                  )}
                </div>
                <div className={classes.mobileCarousel}>
                  {data && data.mainbanners && data.mainbanners.length > 0 && (
                    <CarouselBanner bannerData={data.mainbanners} history={props.history} />
                  )}
                </div>
              </div>

              <div className={classes.rightSection}>
                <div className={classes.medicineSection}>
                  <div className={`${classes.sectionGroup}`}>
                    <div className={classes.preServiceType}>
                      <div className={classes.prescriptionGroup}>
                        <div>
                          {!isAlternateVersion() && (
                            <h3 className={classes.groupTitle}>
                              Now place your order via prescription
                            </h3>
                          )}
                          <AphButton
                            onClick={() => handleUploadPrescription()}
                            title={'Upload Prescription'}
                          >
                            Upload
                          </AphButton>
                        </div>
                        {!isAlternateVersion() && (
                          <div className={classes.prescriptionIcon}>
                            <img src={require('images/ic_prescription_pad.svg')} alt="" />
                          </div>
                        )}
                      </div>
                      <div className={classes.medicineReview}>
                        <p>
                          Want to check medicine interactions?{' '}
                          <Link to={clientRoutes.prescriptionReview()}>
                            CONSULT A PHARMACOLOGIST
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                  <ProtectedWithLoginPopup>
                    {({ protectWithLoginPopup }) => (
                      <div
                        className={`${classes.sectionGroup} ${classes.marginNone}`}
                        onClick={() => {
                          if (!isSignedIn) {
                            protectWithLoginPopup();
                            const redirectURL = encodeURIComponent(
                              `${window.location.origin}${clientRoutes.yourOrders()}`
                            );
                            redirectURL &&
                              history.replaceState(null, '', `?continue=${redirectURL}`);
                          }
                        }}
                      >
                        <div className={classes.preServiceType}>
                          <div className={classes.prescriptionGroup}>
                            <Link
                              className={classes.serviceType}
                              to={isSignedIn && clientRoutes.yourOrders()}
                              title={'Open your orders'}
                            >
                              <span className={classes.serviceIcon}>
                                <img src={require('images/ic_tablets.svg')} alt="" />
                              </span>
                              <span className={classes.linkText}>Your Orders</span>
                              <span className={classes.rightArrow}>
                                <img src={require('images/ic_arrow_right.svg')} alt="" />
                              </span>
                            </Link>
                          </div>
                          {isSignedIn && latestMedicineOrder && orderDelivered && orderTitle ? (
                            <div className={classes.medicineReviewReorder}>
                              <div className={classes.serviceType}>
                                <span className={classes.serviceIcon}>
                                  <img src={require('images/ic_basket.svg')} alt="" />
                                </span>
                                <span className={classes.linkText}>{orderTitle}</span>
                                <span className={classes.reOrder}>
                                  <ReOrder
                                    orderDetailsData={latestMedicineOrder}
                                    type="Latest Order"
                                    patientName={
                                      currentPatient && currentPatient.firstName
                                        ? currentPatient.firstName
                                        : ''
                                    }
                                  />
                                </span>
                              </div>
                              <div className={classes.serviceArea}>
                                <span>{getOrderSubtitle(latestMedicineOrder) || ''}</span>
                              </div>
                            </div>
                          ) : isLoading ? (
                            <CircularProgress size={22} color="secondary" />
                          ) : null}
                        </div>
                      </div>
                    )}
                  </ProtectedWithLoginPopup>
                </div>
              </div>
            </div>
          </div>
          {!loading && (
            <div className={classes.allProductsList}>
              {isSignedIn && (
                <div className={classes.sliderSection}>
                  <RecommendedProducts section="Recommended Products" />
                </div>
              )}
              {metadata &&
                metadata.map(
                  (item: any, index: number) =>
                    item.visible && (
                      <div key={index} className={classes.sliderSection}>
                        <div className={classes.sectionTitle}>
                          {item.section_key === 'shop_by_brand' || item.viewAll ? (
                            <>
                              <h3 className={classes.sectionHeading}>{item.section_name}</h3>
                              <div className={classes.viewAllLink}>
                                <Link
                                  to={
                                    item.section_key === 'shop_by_brand'
                                      ? clientRoutes.medicineAllBrands()
                                      : clientRoutes.searchByMedicine(
                                          'shop-by-category',
                                          item.viewAllUrlKey
                                        )
                                  }
                                >
                                  View All
                                </Link>
                              </div>
                            </>
                          ) : (
                            <h3 className={classes.sectionHeading}>{item.section_name}</h3>
                          )}
                        </div>
                        {item.value}
                      </div>
                    )
                )}
              <div className={classes.mcContainer}>
                <div className={classes.mcContent}>
                  <Typography component="h1">
                    Effortless Online Medicine Orders at Apollo 24/7
                  </Typography>
                  <Typography>
                    Because ordering medicines online need not be complicated but rather a cakewalk.
                    And at Apollo 24/7 we ensure that. All you need to do is:
                  </Typography>
                  <ul className={classes.mcList}>
                    <li>Browse through our wide variety of products</li>
                    <li>Add products to your cart and complete the payment. Voila!</li>
                    <li>Your order will be on its way to you.</li>
                  </ul>
                  <Typography>
                    Apollo 24/7 is your go-to online pharmacy store for all your medicine needs – be
                    it your regular medications, or over-the-counter (OTC) medicines. We also have a
                    range of products in the personalcare, baby care, health and nutrition,
                    wellness, and lifestyle categories. Come explore ‘everything under the sun’
                    related to healthcare at Apollo 24/7.
                  </Typography>
                </div>
                <div className={classes.mcDetail}>
                  <Typography component="h2">Reasons To Buy Medicine From Apollo 247</Typography>
                  <Typography component="p">
                    For over 32 years, Apollo Pharmacy has been providing you with genuine medicines
                    round-the-clock, through 24-hour pharmacies. And now through Apollo 24/7, we
                    intend to make your lives easier – by getting your medicines delivered to you.
                    Yes, no more stepping out to get your medicines, no more standing in long
                    queues, no more worrying about the genuineness of medicines, no more sweat! Here
                    are more reasons why you should buy your medicines from Apollo 24/7:
                  </Typography>
                  <ul className={classes.mcList}>
                    <li>
                      Super-fast deliveries. In select cities, deliveries are done in as less as 1
                      day
                    </li>
                    <li>Largest pharmacy chain in India with over 3,500 stores</li>
                    <li>Attractive deals on medicines and other FMCG products</li>
                    <li>Get Health Credits on purchases (not applicable on discounted products)</li>
                    <li>Prescriptions can be uploaded directly to place an order</li>
                    <li>Option to consult with a pharmacologist to check medicine interactions</li>
                    <li>Wide range of healthcare products to choose from</li>
                    <li>Only genuine and top-quality products delivered.</li>
                  </ul>
                </div>
                <div className={classes.mcDetail}>
                  <Typography component="h2">
                    Apollo 247 - Largest Online Pharmacy In India
                  </Typography>
                  <Typography component="p">
                    With more than 3,500 stores in India, Apollo 24/7 is not just the largest online
                    pharmacy store in India but in Asia as well. Our pharmacy chain has been
                    operational and been providing genuine quality healthcare products for more than
                    32 years. Our wide range of products ensures that everything you need related to
                    healthcare, you will find it on our platform.
                  </Typography>
                </div>
                <div className={classes.mcDetail}>
                  <Typography component="h2">Most Trusted Online Medical Store Of India</Typography>
                  <Typography component="p">
                    As pioneers in the healthcare segment, we understand the importance of trust.
                    And that is why, over the years, we worked on building that trust. We ensure
                    that every product sold through our offline/online stores are checked for their
                    authenticity, quality, and compliance with the Central Drugs Standard Control
                    Organization, the national regulatory body for Indian pharmaceuticals and
                    medical devices.
                  </Typography>
                </div>
                <div className={classes.mcDetail}>
                  <Typography component="h2">100% Genuine Medicine From Apollo Pharmacy</Typography>
                  <Typography component="p">
                    All medicines/healthcare products sold on Apollo 24/7 are procured from our
                    sister company - Apollo Pharmacy, with a reputation of selling only 100% genuine
                    products. The products sold through Apollo Pharmacy are inspected thoroughly to
                    ensure only genuine products make the cut. We believe that when it comes to
                    medicines, quality and authenticity should never be compromised.
                  </Typography>
                </div>
                <div className={classes.mcDetail}>
                  <Typography component="h2">Over 3,500 Pharmacy Stores In India</Typography>
                  <Typography component="p">
                    Our strong network lets us deliver medicines to every nook and corner of the
                    country. We have more than 3,500 pharmacy stores in India catering to all your
                    medicine needs. Our network is so vast that you may find an Apollo Pharmacy
                    store at every 1 km. We are leveraging this vast network to now become an online
                    medical store – by getting these medicines delivered to you.
                  </Typography>
                </div>
                <div className={classes.mcDetail}>
                  <Typography component="h2">Fastest Home Delivery Of Your Order</Typography>
                  <Typography component="p">
                    When it comes to medicines, most of us do not want to take a chance. Which is
                    why most of us prefer going to a store physically to get medicines. But you know
                    what happens at the stores. First, you need to go there physically which means
                    you have to drive/walk/ride for at least 10-15 minutes. Second, you need to wait
                    for your turn which may come after 10-15 minutes. Third, you can only buy the
                    products you are sure about, e.g. prescribed medicines. What if you want to buy
                    an FMCG product but are not sure which one? You cannot expect the pharmacist to
                    give you too many options.
                  </Typography>
                  <Typography component="p">
                    Apollo 24/7 is the solution to all these. We deliver the medicines to you
                    without you having to step out or wait in the queue to buy medicines. And we
                    give you the option to browse through a variety of non-pharma products to choose
                    from.
                  </Typography>
                  <Typography component="p">
                    Are we missing something here? Yes, the time we take to deliver your order. We
                    understand that you may sometimes require medicines in urgency and that is why
                    we assure you the fastest home delivery of your medicines. Also, depending on
                    the city you reside in, medicines can be delivered in as less as 1 hour.
                  </Typography>
                </div>
                <div className={classes.mcDetail}>
                  <Typography component="h2">
                    Best Pharmacologist Available To Check Medicine Interactions
                  </Typography>
                  <Typography component="p">
                    Sometimes, the medicines prescribed by your doctor may react with your existing
                    medications, food, beverage, or supplements. This is known as medicine
                    interaction and may prevent your medicine to perform as expected. Hence, on
                    Apollo 24/7, we offer you an option to consult with a pharmacologist, an expert
                    in medicine interactions, before you make any purchase.
                  </Typography>
                </div>
                <div className={classes.mcDetail}>
                  <Typography component="h2">Extra Benefits Of Online Medicine Orders</Typography>
                  <Typography component="p">
                    When you order medicines at Apollo 24/7, not only do you get your medicines
                    delivered on time and at your doorstep, but you also get additional benefits.
                    You can earn Apollo Health Credits whenever you order medicine online and also
                    when you purchase other non-pharma products (not applicable on discounted
                    products including the ones where coupon codes have been applied). You can use
                    these Health Credits to make more purchases on our platform. And not to forget
                    the discounts and exclusive offers we bring out from time to time.
                  </Typography>
                </div>
                <div className={classes.mcDetail}>
                  <Typography component="h2">Additional Services I Will Receive</Typography>
                  <Typography component="p">
                    Besides purchasing medicines, the additional services you can avail on our
                    platform are doctor consultations, symptom checker, ordering diagnostic tests,
                    and digitization of your health records. These services let you consult with
                    doctors from over 70 specialities, check and understand your symptoms, book
                    diagnostics tests, and converts your physical health records into digital
                    records.
                    <span>
                      With so many services under our umbrella, you wouldn’t need to go anywhere
                      else.
                    </span>
                  </Typography>
                </div>
              </div>
              <div className={classes.mfaqContainer}>
                <Typography>Frequently Asked Questions</Typography>
                <div className={classes.mfaqDetail}>
                  <Typography component="h2">Additional Services I Will Receive</Typography>
                  <Typography>
                    Besides purchasing medicines, the additional services you can avail on our
                    platform are doctor consultations, symptom checker, ordering diagnostic tests,
                    and digitization of your health records. These services let you consult with
                    doctors from over 70 specialities, check and understand your symptoms, book
                    diagnostics tests, and converts your physical health records into digital
                    records. With so many services under our umbrella, you wouldn’t need to go
                    anywhere else.
                  </Typography>
                </div>
                <div className={classes.mfaqDetail}>
                  <Typography component="h2">Extra Benefits Of Online Medicine Orders</Typography>
                  <Typography>
                    When you order medicines at Apollo 24/7, not only do you get your medicines
                    delivered on time and at your doorstep, but you also get additional benefits.
                    You can earn Apollo Health Credits whenever you order medicine online and also
                    when you purchase other non-pharma products (not applicable on discounted
                    products including the ones where coupon codes have been applied). You can use
                    these Health Credits to make more purchases on our platform. And not to forget
                    the discounts and exclusive offers we bring out from time to time.
                  </Typography>
                </div>
                <div className={classes.mfaqDetail}>
                  <Typography component="h2">Extra Benefits Of Online Medicine Orders</Typography>
                  <Typography>
                    When you order medicines at Apollo 24/7, not only do you get your medicines
                    delivered on time and at your doorstep, but you also get additional benefits.
                    You can earn Apollo Health Credits whenever you order medicine online and also
                    when you purchase other non-pharma products (not applicable on discounted
                    products including the ones where coupon codes have been applied). You can use
                    these Health Credits to make more purchases on our platform. And not to forget
                    the discounts and exclusive offers we bring out from time to time.
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showOrderPopup && (
        <Route
          render={({ history }) => {
            return <PaymentStatusModal history={history} addToCartRef={addToCartRef} />;
          }}
        />
      )}
      <Popover
        open={showPrescriptionPopup}
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
              <Typography variant="h2">yay!</Typography>
              <p>
                Your prescriptions have been submitted successfully. We will notify you when the
                items are in your cart. If we need any clarifications, we will call you within 1
                hour.
              </p>
              <div className={classes.bottomActions}>
                <AphButton
                  className={classes.trackBtn}
                  onClick={() => {
                    setShowPrescriptionPopup(false);
                    window.location.href = clientRoutes.medicines();
                  }}
                >
                  Okay
                </AphButton>
              </div>
            </div>
          </div>
        </div>
      </Popover>
      <Popover
        open={isPopoverOpen}
        anchorEl={mascotRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <div className={classes.thankyouPopoverWindow}>
          <div className={classes.windowWrapNew}>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic-mascot.png')} alt="" />
            </div>
            <div className={classes.pUploadSuccess}>
              <Typography component="h2">Thankyou :)</Typography>
              <Typography>Your prescriptions have been submitted successfully.</Typography>
              <Typography>Our pharmacologist will reply to your email within 24 hours.</Typography>
              <Link
                to={clientRoutes.medicines()}
                onClick={() => {
                  setIsPopoverOpen(false);
                }}
              >
                Ok, Got It
              </Link>
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
          isNonCartFlow={true}
        />
      </AphDialog>
      <AphDialog open={isEPrescriptionOpen} maxWidth="sm">
        <AphDialogClose
          onClick={() => {
            setIsEPrescriptionOpen(false);
            uploadPhotoTracking('E-Rx');
          }}
          title={'Close'}
        />
        <AphDialogTitle className={classes.ePrescriptionTitle}>E Prescription</AphDialogTitle>
        <UploadEPrescriptionCard
          setIsEPrescriptionOpen={setIsEPrescriptionOpen}
          isNonCartFlow={true}
        />
      </AphDialog>
      {!onePrimaryUser && <ManageProfile />}
      <BottomLinks />
      <NavigationBottom />
    </div>
  );
};

export default MedicineLanding;
