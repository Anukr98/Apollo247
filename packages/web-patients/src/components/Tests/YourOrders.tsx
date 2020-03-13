import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Popover } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { OrderCard } from 'components/Tests/OrderCard';
import { OrdersMessage } from 'components/Orders/OrdersMessage';
import { TrackOrders } from 'components/Tests/TrackOrders';
import { Header } from 'components/Header';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    yourOrdersWrapper: {
      padding: 20,
      paddingLeft: 0,
      display: 'flex',
      backgroundColor: '#f7f8f5',
      borderRadius: 10,
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        paddingRight: 0,
      },
    },
    leftSection: {
      width: 'calc(100% - 328px)',
      paddingRight: 5,
      [theme.breakpoints.down('xs')]: {
        width: 'auto',
      },
    },
    rightSection: {
      width: 328,
      backgroundColor: theme.palette.common.white,
      borderRadius: 5,
      [theme.breakpoints.down('xs')]: {
        width: 'auto',
      },
    },
    sectionHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 10,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      marginLeft: 20,
      marginRight: 15,
    },
    mobileOverlay: {
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#f7f8f5',
        zIndex: 991,
        height: '100%',
      },
    },
    count: {
      marginLeft: 'auto',
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
  const classes = useStyles({});
  const currentPath = window.location.pathname;
  const mascotRef = useRef(null);
  const [isPopoverOpen] = React.useState<boolean>(false);

  const [orderAutoId, setOrderAutoId] = React.useState<number>(0);

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.yourOrdersWrapper}>
          <div className={classes.leftSection}>
            <div className={classes.sectionHeader}>Your Orders</div>
            <OrderCard orderAutoId={orderAutoId} setOrderAutoId={setOrderAutoId} />
          </div>
          <div className={`${classes.rightSection} ${classes.mobileOverlay}`}>
            <TrackOrders orderAutoId={orderAutoId} />
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
                  <img src={require('images/ic-mascot.png')} alt="" />
                </div>
                <OrdersMessage />
              </div>
            </div>
          </Popover>
        </div>
      </div>
    </div>
  );
};
