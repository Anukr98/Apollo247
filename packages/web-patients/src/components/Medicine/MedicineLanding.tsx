import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem, Popover, CircularProgress } from '@material-ui/core';
import { Header } from 'components/Header';
import { AphButton } from '@aph/web-ui-components';
import { ShopByAreas } from 'components/Medicine/Cards/ShopByAreas';
import { ShopByBrand } from 'components/Medicine/Cards/ShopByBrand';
import { ShopByCategory } from 'components/Medicine/Cards/ShopByCategory';
import { DayDeals } from 'components/Medicine/Cards/DayDeals';
import { HotSellers } from 'components/Medicine/Cards/HotSellers';
import { MedicineAutoSearch } from 'components/Medicine/MedicineAutoSearch';
import { AddToCartPopover } from 'components/Medicine/AddToCartPopover';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import { ApolloError } from 'apollo-client';
import { MedicinePageAPiResponse } from './../../helpers/MedicineApiCalls';
import axios from 'axios';
import { OrderPlaced } from 'components/Cart/OrderPlaced';
import { useParams } from 'hooks/routerHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
      [theme.breakpoints.up(990)]: {
        marginBottom: 20,
      },
    },
    doctorListingPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
    },
    pageTopHeader: {
      backgroundColor: theme.palette.common.white,
      padding: '30px 40px',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      borderRadius: 5,
      [theme.breakpoints.down('xs')]: {
        padding: 0,
      },
    },
    medicineTopGroup: {
      display: 'flex',
      paddingTop: 25,
      [theme.breakpoints.down(768)]: {
        display: 'block',
      },
    },
    searchSection: {
      width: 'calc(100% - 284px)',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        marginBottom: 15,
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
        padding: '0 20px 30px 20px',
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
        margin: '51px auto 0 auto',
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
    },
    preServiceType: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: '10px 15px',
      paddingbottom: 8,
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
    },
    textVCenter: {
      alignItems: 'center',
      minHeight: 54,
      paddingbottom: 10,
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
    },
    sliderSection: {
      paddingBottom: 22,
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
        maxWidth: 72,
      },
    },
  };
});

export const MedicineLanding: React.FC = (props) => {
  const classes = useStyles({});
  const mascotRef = useRef(null);
  const addToCartRef = useRef(null);

  const params = useParams<{ orderAutoId: string; orderStatus: string }>();
  if (params.orderStatus === 'success') {
    localStorage.removeItem('cartItems');
    localStorage.removeItem('dp');
  }

  const [data, setData] = useState<MedicinePageAPiResponse | null>(null);
  const { currentPatient } = useAllCurrentPatients();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApolloError | null>(null);
  const [showPopup, setShowPopup] = React.useState<boolean>(
    window.location.pathname === '/medicines/added-to-cart'
  );
  const [showOrderPopup, setShowOrderPopup] = useState<boolean>(
    params.orderStatus && params.orderStatus.length > 0 ? true : false
  );
  const apiDetails = {
    url: `${
      process.env.NODE_ENV === 'production'
        ? process.env.PHARMACY_MED_PROD_URL
        : process.env.PHARMACY_MED_UAT_URL
    }/apollo_24x7_api.php`,
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
            <div className={classes.userName}>hi surj :)</div>
            <div className={classes.medicineTopGroup}>
              <div className={classes.searchSection}>
                <MedicineAutoSearch />
                {loading && (
                  <div className={classes.progressLoader}>
                    <CircularProgress size={30} />
                  </div>
                )}
                {data && data.mainbanners && (
                  <div className={classes.productsBanner}>
                    <img src={`${apiDetails.imageUrl}${data.mainbanners[0].image}`} alt="" />
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
                          <AphButton color="primary">Upload Prescription</AphButton>
                        </div>
                        <div className={classes.prescriptionIcon}>
                          <img src={require('images/ic_prescription_pad.svg')} alt="" />
                        </div>
                      </div>
                      <div className={classes.consultLink}>
                        Don’t have a prescription? Don’t worry!
                        <Link to={clientRoutes.doctorsLanding()}>Consult a Doctor</Link>
                      </div>
                    </div>
                  </div>
                  <div className={`${classes.sectionGroup} ${classes.marginNone}`}>
                    <Link
                      className={`${classes.serviceType} ${classes.textVCenter}`}
                      to={clientRoutes.yourOrders()}
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
        open={showPopup}
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
              <img src={require('images/ic_mascot.png')} alt="" />
            </div>
            <AddToCartPopover setShowPopup={setShowPopup} showPopup={showPopup} />
          </div>
        </div>
      </Popover>
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
              <img src={require('images/ic_mascot.png')} alt="" />
            </div>
            <OrderPlaced
              orderAutoId={params.orderAutoId}
              orderStatus={params.orderStatus}
              setShowOrderPopup={setShowOrderPopup}
            />
          </div>
        </div>
      </Popover>
    </div>
  );
};
