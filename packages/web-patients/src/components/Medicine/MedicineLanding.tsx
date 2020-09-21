import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { makeStyles } from '@material-ui/styles';
import { Theme, Popover, CircularProgress, Typography } from '@material-ui/core';
import { Header } from 'components/Header';
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

  const apiDetails = {
    url: process.env.PHARMACY_MED_PROD_SEARCH_BY_BRAND,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };

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
                    <DayDeals data={sectionData} sectionName={section.section_key} />
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
    title: 'Online Medicine Order & Delivery, Buy Medicines from Apollo Pharmacy',
    description:
      "Online Medicine Order - Buy medicines online from Apollo Pharmacy Stores (India's largest pharmacy chain) and get the home delivery. All kinds on medicines, health products & equipments are available at our online medicine store.",
    canonicalLink:
      window && window.location && window.location.origin && `${window.location.origin}/medicines`,
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

  return (
    <div className={classes.root}>
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
                          <h3 className={classes.groupTitle}>
                            Now place your order via prescription
                          </h3>
                          <AphButton
                            onClick={() => handleUploadPrescription()}
                            title={'Upload Prescription'}
                          >
                            Upload
                          </AphButton>
                        </div>
                        <div className={classes.prescriptionIcon}>
                          <img src={require('images/ic_prescription_pad.svg')} alt="" />
                        </div>
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
