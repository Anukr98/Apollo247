import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { Header } from 'components/Header';
import { AphButton } from '@aph/web-ui-components';
import { ShopByAreas } from 'components/Medicine/Cards/ShopByAreas';
import { ShopByBrand } from 'components/Medicine/Cards/ShopByBrand';
import { ShopByCategory } from 'components/Medicine/Cards/ShopByCategory';
import { DayDeals } from 'components/Medicine/Cards/DayDeals';
import { HotSellers } from 'components/Medicine/Cards/HotSellers';
import { MedicineAutoSearch } from 'components/Medicine/MedicineAutoSearch';
import {
  GetMedicineOrdersList,
  GetMedicineOrdersListVariables,
  GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList,
} from 'graphql/types/GetMedicineOrdersList';
import { useMutation } from 'react-apollo-hooks';
import { GET_MEDICINE_ORDERS_LIST } from 'graphql/profiles';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import { ApolloError } from 'apollo-client';
import { MedicinePageAPiResponse } from './../../helpers/MedicineApiCalls';
import axios from 'axios';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 88,
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
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
    },
    medicineTopGroup: {
      display: 'flex',
      paddingTop: 25,
    },
    searchSection: {
      width: 'calc(100% - 284px)',
    },
    rightSection: {
      marginLeft: 'auto',
      width: 284,
    },
    userName: {
      fontSize: 50,
      fontWeight: 600,
      color: '#02475b',
      lineHeight: '50px',
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
    },
    medicineSection: {
      paddingLeft: 15,
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
  };
});

export const MedicineLanding: React.FC = (props) => {
  const classes = useStyles();
  const queryParams = new URLSearchParams(location.search);
  const mascotRef = useRef(null);

  const orderId = queryParams.get('orderAutoId') || '';
  const orderStatus = queryParams.get('status') || '';

  if (parseInt(orderId, 10) > 0 && orderStatus === 'success') {
    localStorage.removeItem('cartItems');
    localStorage.removeItem('dp');
  }

  const [data, setData] = useState<MedicinePageAPiResponse | null>(null);
  const { currentPatient } = useAllCurrentPatients();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApolloError | null>(null);

  const apiDetails = {
    url: `${process.env.PHARMACY_MED_UAT_URL}/apollo_24x7_api.php`,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    imageUrl: `${process.env.PHARMACY_MED_PROD_URL}/pub/media`,
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
    if (apiDetails.url != null) {
      getMedicinePageProducts();
    }
  }, []);

  //   const medicineData = useMutation<
  //   GetMedicineOrdersList,
  //   GetMedicineOrdersListVariables
  // >(GET_MEDICINE_ORDERS_LIST, {
  //   variables: { patientId: currentPatient && currentPatient.id },
  //   fetchPolicy: 'no-cache',
  // });

  // useEffect(() => {
  //   medicineData().then((res) => {
  //     console.log(res);
  //     if(res && res.data && res.data.getMedicineOrdersList){
  //       setData(res.data.getMedicineOrdersList.MedicineOrdersList);
  //     }

  //   }).catch((e: ApolloError) => {
  //     alert(e);
  //   })
  // });

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
    <div className={classes.welcome}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container}>
        <div className={classes.doctorListingPage}>
          <div className={classes.pageTopHeader}>
            <div className={classes.userName}>hi surj :)</div>
            <div className={classes.medicineTopGroup}>
              <div className={classes.searchSection}>
                <MedicineAutoSearch />
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
                list.map((item) => (
                  <div className={classes.sliderSection}>
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
    </div>
  );
};
