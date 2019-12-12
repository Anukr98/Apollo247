import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Popover } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { OrderCard } from 'components/Orders/OrderCard';
import { OrdersMessage } from 'components/Orders/OrdersMessage';
import { TrackOrders } from 'components/Orders/TrackOrders';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 20,
      paddingLeft: 0,
      display: 'flex',
    },
    leftSection: {
      width: 'calc(100% - 328px)',
      paddingRight: 5,
    },
    rightSection: {
      width: 328,
      backgroundColor: theme.palette.common.white,
      borderRadius: 5,
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
  const classes = useStyles();
  const currentPath = window.location.pathname;
  const mascotRef = useRef(null);
  const [isPopoverOpen] = React.useState<boolean>(false);

  return (
    <div className={classes.root}>
      <div className={classes.leftSection}>
        <div className={classes.sectionHeader}>Your Orders</div>
        <OrderCard />
      </div>
      <div className={classes.rightSection}>
        <TrackOrders />
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
