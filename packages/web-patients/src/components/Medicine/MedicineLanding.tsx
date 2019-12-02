import React, { useRef } from 'react';
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
                <div className={classes.productsBanner}>
                  <img src="https://via.placeholder.com/702x150" alt="" />
                </div>
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
          <div className={classes.allProductsList}>
            <div className={classes.sliderSection}>
              <div className={classes.sectionTitle}>
                Shop by Health Areas
              </div>
              <ShopByAreas />
            </div>
            <div className={classes.sliderSection}>
              <div className={classes.sectionTitle}>
                Deals of the day
              </div>
              <DayDeals />
            </div>
            <div className={classes.sliderSection}>
              <div className={classes.sectionTitle}>
                Hot Sellers
              </div>
              <HotSellers />
            </div>
            <div className={classes.sliderSection}>
              <div className={classes.sectionTitle}>
                Shop by Category
              </div>
              <ShopByCategory />
            </div>
            <div className={classes.sliderSection}>
              <div className={classes.sectionTitle}>
                <span>Shop by Brand</span>
                <div className={classes.viewAllLink}>
                  <Link to={clientRoutes.medicineAllBrands()}>
                    View All
                  </Link>
                </div>
              </div>
              <ShopByBrand />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
