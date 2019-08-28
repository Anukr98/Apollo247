import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Scrollbars from 'react-custom-scrollbars';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphButton } from '@aph/web-ui-components';
import { OrderStatusCard } from 'components/Orders/OrderStatusCard';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      PaddingRight: 3,
      display: 'flex',
    },
    leftSection: {
      width: 328,
      backgroundColor: theme.palette.common.white,
      padding: '20px 5px',
      borderRadius: 5,
    },
    rightSection: {
      width: 'calc(100% - 328px)',
      paddingRight: 5,
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
      paddingBottom: 8,
      display: 'flex',
      width: '100%',
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
    },
    activeMenuTab: {
      backgroundColor: 'rgba(0,179,142,0.15)',
    },
    textVCenter: {
      alignItems: 'center',
      minHeight: 54,
      paddingBottom: 10,
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
      marginBottom: 'none',
    },
    bottomImgGroup: {
      marginTop: 40,
      '& img': {
        maxWidth: '100%',
        verticalAlign: 'middle',
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
      marginLeft: 20,
      marginRight: 15,
    },
    count: {
      marginLeft: 'auto',
    },
    orderListing: {
      paddingTop: 10,
    },
    headerActions: {
      marginLeft: 'auto',
      marginBottom: -9,
      '& button': {
        boxShadow: 'none',
        backgroundColor: 'transparent',
        padding: '5px 0',
        fontSize: 12,
        fontWeight: 500,
        color: '#658f9b',
        textTransform: 'none',
        borderBottom: '5px solid #f7f8f5',
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 0,
        minWidth: 'auto',
      },
    },
    btnActive: {
      borderBottom: '5px solid #00b38e !important',
      color: '#02475b !important',
    },
    moreBtn: {
      marginRight: '0px !important',
      borderBottom: '0px !important',
      marginLeft: '30px !important',
    },
    orderId: {
      display: 'flex',
      alignItems: 'center',
    },
    backArrow: {
      marginRight: 10,
      cursor: 'pointer',
      '& img': {
        verticalAlign: 'middle',
        maxWidth: 17,
      },
    },
    orderTrackCrads: {
      paddingLeft: 10,
    },
    customScroll: {
      paddingLeft: 10,
      paddingRight: 15,
      paddingBottom: 20,
      paddingTop: 10,
    },
  };
});

export const TrackOrders: React.FC = (props) => {
  const classes = useStyles();
  const currentPath = window.location.pathname;

  return (
    <div className={classes.root}>
      <div className={classes.leftSection}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 237px)'}>
          <div className={classes.medicineSection}>
            <div className={classes.sectionGroup}>
              <Link className={classes.serviceType} to="/tests-medicines">
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_medicines.png')} alt="" />
                </span>
                <span className={classes.linkText}>Need to find a medicine/ alternative?</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div>
            <div className={classes.sectionGroup}>
              <Link className={classes.serviceType} to="/prescriptions">
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_medicines.png')} alt="" />
                </span>
                <span className={classes.linkText}>Do you have a prescription ready?</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div>
            <div className={classes.sectionGroup}>
              <div className={classes.serviceinfoText}>
                Get all your medicines, certified using our 5-point system, within 2 hours.
              </div>
            </div>
            <div className={classes.sectionGroup}>
              <Link
                className={`${classes.serviceType} ${classes.textVCenter}`}
                to="/search-medicines"
              >
                <span className={classes.serviceIcon}>
                  <img src={require('images/ic_schedule.svg')} alt="" />
                </span>
                <span className={classes.linkText}>Your Med Subscripitons</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div>
            <div className={`${classes.sectionGroup} ${classes.marginNone}`}>
              <Link
                className={`${classes.serviceType} ${classes.textVCenter} ${
                  currentPath === clientRoutes.yourOrders() ? classes.activeMenuTab : ''
                } ${currentPath === clientRoutes.trackOrders() ? classes.activeMenuTab : ''}`}
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
            <div className={classes.bottomImgGroup}>
              <img src={require('images/ic_adbanner_web.png')} alt="" />
            </div>
          </div>
        </Scrollbars>
      </div>
      <div className={classes.rightSection}>
        <div className={classes.sectionHeader}>
          <div className={classes.orderId}>
            <div className={classes.backArrow}>
              <Link to={clientRoutes.yourOrders()}>
                <img src={require('images/ic_back.svg')} alt="" />
              </Link>
            </div>
            <span>ORDER #A2472707936</span>
          </div>
          <div className={classes.headerActions}>
            <AphButton className={classes.btnActive}>Track Order</AphButton>
            <AphButton>View Bills</AphButton>
            <AphButton className={classes.moreBtn}>
              <img src={require('images/ic_more.svg')} alt="" />
            </AphButton>
          </div>
        </div>
        <div className={classes.orderTrackCrads}>
          <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 265px)'}>
            <div className={classes.customScroll}>
              <OrderStatusCard />
            </div>
          </Scrollbars>
        </div>
      </div>
    </div>
  );
};
