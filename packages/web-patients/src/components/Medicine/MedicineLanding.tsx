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
import { useParams } from 'hooks/routerHooks';
import { NavigationBottom } from 'components/NavigationBottom';
import { UploadPrescription } from 'components/Prescriptions/UploadPrescription';
import { UploadEPrescriptionCard } from 'components/Prescriptions/UploadEPrescriptionCard';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { useShoppingCart } from 'components/MedicinesCartProvider';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
      [theme.breakpoints.up(900)]: {
        marginBottom: 20,
      },
    },
    doctorListingPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        marginTop: 82,
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
        marginTop: 20,
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
      padding: 10,
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
      padding: '10px 15px',
      paddingbottom: 8,
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    textVCenter: {
      alignItems: 'center',
      minHeight: 54,
      paddingBottom: 10,
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
      paddingBottom: 15,
    },
    prescriptionIcon: {
      marginLeft: 'auto',
      paddingLeft: 10,
      '& img': {
        maxWidth: 30,
      },
    },
    groupTitle: {
      fontSize: 16,
      paddingBottom: 7,
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
          paddingBottom: 10,
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
  };
});

export const MedicineLanding: React.FC = (props) => {
  const classes = useStyles({});
  const addToCartRef = useRef(null);
  const { currentPatient } = useAllCurrentPatients();
  const {
    clearCartInfo,
    cartItems,
    setCartItems,
    ePrescriptionData,
    prescriptions,
  } = useShoppingCart();
  const params = useParams<{
    orderAutoId: string;
    orderStatus: string;
  }>();

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

  const apiDetails = {
    url: process.env.PHARMACY_MED_PROD_SEARCH_BY_BRAND,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };

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
        setLoading(false);
      })
      .catch((e: ApolloError) => {
        setError(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    localStorage.removeItem('searchText');
    if (apiDetails.url != null && !data) {
      getMedicinePageProducts();
    }
  }, [data]);

  const list = data && [
    {
      key: 'Shop by Health Areas',
      value: <ShopByAreas data={data.healthareas} />,
    },
    {
      key: 'Deals of the day',
      value: <DayDeals data={data.deals_of_the_day} />,
    },
    { key: 'Hot Sellers', value: <HotSellers data={data.hot_sellers} /> },
    {
      key: 'Shop by Category',
      value: <ShopByCategory data={data.shop_by_category} />,
    },
    { key: 'Shop by Brand', value: <ShopByBrand data={data.shop_by_brand} /> },
  ];

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.doctorListingPage}>
          <div className={classes.pageTopHeader}>
            <div className={classes.userName}>
              hi {currentPatient ? currentPatient.firstName : 'User'} :)
            </div>
            <div className={classes.medicineTopGroup}>
              <div className={classes.searchSection}>
                <MedicineAutoSearch />
                {loading && (
                  <div className={classes.progressLoader}>
                    <CircularProgress size={30} />
                  </div>
                )}
                {data && data.mainbanners_desktop && (
                  <div className={classes.productsBanner}>
                    <img
                      src={`${apiDetails.imageUrl}${data.mainbanners_desktop[0].image}`}
                      alt=""
                    />
                  </div>
                )}
              </div>
              <div className={classes.rightSection}>
                <div className={classes.medicineSection}>
                  <div className={`${classes.sectionGroup}`}>
                    <div className={classes.preServiceType}>
                      <div className={classes.prescriptionGroup}>
                        <div>
                          <div className={classes.groupTitle}>Have a prescription ready?</div>
                          <AphButton
                            color="primary"
                            onClick={() => setIsUploadPreDialogOpen(true)}
                            title={'Upload Prescription'}
                          >
                            Upload Prescription
                          </AphButton>
                        </div>
                        <div className={classes.prescriptionIcon}>
                          <img src={require('images/ic_prescription_pad.svg')} alt="" />
                        </div>
                      </div>
                      <div className={classes.consultLink}>
                        Don’t have a prescription? Don’t worry!
                        <Link to={clientRoutes.doctorsLanding()} title={'Consult a doctor'}>
                          Consult a Doctor
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className={`${classes.sectionGroup} ${classes.marginNone}`}>
                    <Link
                      className={`${classes.serviceType} ${classes.textVCenter}`}
                      to={clientRoutes.yourOrders()}
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
                      {item.key === 'Shop by Brand' ? (
                        <>
                          <span>{item.key}</span>
                          <div className={classes.viewAllLink}>
                            <Link to={clientRoutes.medicineAllBrands()}>View All</Link>
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
                items are in your cart. If we need any clarificaitons, we will call you within 1
                hour.
              </p>
              <div className={classes.bottomActions}>
                <AphButton
                  className={classes.trackBtn}
                  onClick={() => {
                    setShowPrescriptionPopup(false);
                  }}
                >
                  Okay
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
        />
      </AphDialog>
      <AphDialog open={isEPrescriptionOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsEPrescriptionOpen(false)} title={'Close'} />
        <AphDialogTitle className={classes.ePrescriptionTitle}>E Prescription</AphDialogTitle>
        <UploadEPrescriptionCard setIsEPrescriptionOpen={setIsEPrescriptionOpen} />
      </AphDialog>
      <NavigationBottom />
    </div>
  );
};
