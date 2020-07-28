import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { makeStyles } from '@material-ui/styles';
import { Theme, Popover, CircularProgress, Typography } from '@material-ui/core';
import { Header } from 'components/Header';
import { AphButton, AphDialog, AphDialogTitle, AphDialogClose } from '@aph/web-ui-components';
import { ShopByAreas } from 'components/Medicine/Cards/ShopByAreas';
import { ShopByBrand } from 'components/Medicine/Cards/ShopByBrand';
import { ShopByCategory } from 'components/Medicine/Cards/ShopByCategory';
import { DayDeals } from 'components/Medicine/Cards/DayDeals';
import { HotSellers } from 'components/Medicine/Cards/HotSellers';
import { MedicineAutoSearch } from 'components/Medicine/MedicineAutoSearch';
import { ApolloError } from 'apollo-client';
import { MedicinePageAPiResponse } from './../../helpers/MedicineApiCalls';
import axios from 'axios';
import { OrderPlaced } from 'components/Cart/OrderPlaced';
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
import { useLocationDetails } from 'components/LocationProvider';
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
        marginTop: 96,
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
      paddingTop: 25,
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
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    preServiceType: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
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
        backgroundColor: '#fff',
        color: '#fcb716',
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
      paddingBottom: 22,
      [theme.breakpoints.down('xs')]: {
        '&:last-child': {
          paddingBottom: 70,
        },
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
      [theme.breakpoints.down('xs')]: {
        marginLeft: 20,
      },
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
  };
});

export const MedicineLanding: React.FC = (props: any) => {
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
  }

  const [data, setData] = useState<MedicinePageAPiResponse | null>(null);
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

  const apiDetails = {
    url: process.env.PHARMACY_MED_PROD_SEARCH_BY_BRAND,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };

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

  const list = data && [
    { key: 'Recommanded for you', value: <HotSellers data={data.hot_sellers} section="Recommanded" /> },
    {
      key: 'Shop by Health Areas',
      value: <ShopByAreas data={data.healthareas} />,
    },
    {
      key: 'Deals of the day',
      value: <DayDeals data={data.deals_of_the_day} />,
    },
    { key: 'Hot Sellers', value: <HotSellers data={data.hot_sellers} section="Hotsellers" /> },
    {
      key: 'Shop by Category',
      value: <ShopByCategory data={data.shop_by_category} />,
    },
    {
      key: 'Monsoon Essentials',
      value: <HotSellers data={data.monsoon_essentials} section="Monsoon Essentials" />,
    },
    { key: 'Shop by Brand', value: <ShopByBrand data={data.shop_by_brand} /> },
  ];

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
    title: 'Buy/Order Medicines And Health Products - Online Pharmacy Store - Apollo 247',
    description:
      'Order medicines and health products online at Apollo 247 - a leading online pharmacy store. Buy all medicines you need from home in just a few clicks. Apollo 247 is a one-stop solution for all your medical needs.',
    canonicalLink:
      window && window.location && window.location.origin && `${window.location.origin}/medicines`,
  };

  return (
    <div className={classes.root}>
      <MetaTagsComp {...metaTagProps} />
      <Header />
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
                {data && data.mainbanners_desktop && data.mainbanners_desktop.length > 0 && (
                  <CarouselBanner bannerData={data.mainbanners_desktop} history={props.history} />
                )}
              </div>

              <div className={classes.rightSection}>
                <div className={classes.medicineSection}>
                  <div className={`${classes.sectionGroup}`}>
                    <div className={classes.preServiceType}>
                      <div className={classes.prescriptionGroup}>
                        <div>
                          <div className={classes.groupTitle}>
                            Now place your order via prescription
                          </div>
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
                        onClick={() => !isSignedIn && protectWithLoginPopup()}
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
                          <div className={classes.medicineReviewReorder}>
                            <div
                              className={classes.serviceType}
                            >
                              <span className={classes.serviceIcon}>
                                <img src={require('images/ic_basket.svg')} alt="" />
                              </span>
                              <span className={classes.linkText}>
                                Huggies + 2 items
                              </span>
                              <span className={classes.reOrder}>
                                <Link
                                  to={isSignedIn && clientRoutes.yourOrders()}
                                >
                                  Reorder
                              </Link>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
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
              {list &&
                list.map((item, index) => (
                  <div key={index} className={classes.sliderSection}>
                    <div className={classes.sectionTitle}>
                      {item.key === 'Recommanded for you' || item.key === 'Shop by Brand' || item.key === 'Monsoon Essentials' ? (
                        <>
                          <span>{item.key}</span>
                          <div className={classes.viewAllLink}>
                            <Link
                              to={
                                item.key === 'Shop by Brand'
                                  ? clientRoutes.medicineAllBrands()
                                  : clientRoutes.searchByMedicine(
                                    'shop-by-category',
                                    'monsoon-essentials'
                                  )
                              }
                            >
                              View All
                            </Link>
                          </div>
                        </>
                      ) : (
                          item.key
                        )}
                    </div>
                    {item.value}
                  </div>
                ))}
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
