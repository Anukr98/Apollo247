import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Popover } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Scrollbars from 'react-custom-scrollbars';
import { clientRoutes } from 'helpers/clientRoutes';
import { OrderCard } from 'components/Orders/OrderCard';
import { OrdersMessage } from 'components/Orders/OrdersMessage';

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
  };
});

export const YourOrders: React.FC = (props) => {
  const classes = useStyles();
  const currentPath = window.location.pathname;
  const mascotRef = useRef(null);
  const [isPopoverOpen] = React.useState<boolean>(true);

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
                }`}
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
        <div className={classes.sectionHeader}>Your Orders</div>
        <OrderCard />
      </div>
      <Popover
        open={isPopoverOpen}
        anchorEl={mascotRef.current}
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
            <OrdersMessage />
          </div>
        </div>
      </Popover>
    </div>
  );
};
