import { makeStyles } from '@material-ui/styles';
import { Theme, Tabs, Tab, Typography, Popover } from '@material-ui/core';
import React, { useState, useRef } from 'react';
import { Header } from 'components/Header';
import { SearchMedicines } from 'components/Medicine/SearchMedicines';
import { OrderFailed } from 'components/Cart/OrderFailed';
import { OrderPlaced } from 'components/Cart/OrderPlaced';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 88,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 101,
      },
    },
    booksLink: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    doctorListingPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 20,
      },
    },
    tabsRoot: {
      marginLeft: 20,
      marginRight: 20,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
    },
    tabRoot: {
      fontSize: 13,
      fontWeight: 600,
      textAlign: 'center',
      padding: '11px 10px',
      color: '#02475b',
      opacity: 1,
    },
    tabSelected: {
      color: theme.palette.secondary.dark,
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 5,
    },
    rootTabContainer: {
      padding: 0,
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

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export const MedicineLanding: React.FC = (props) => {
  const classes = useStyles();
  const queryParams = new URLSearchParams(location.search);
  const mascotRef = useRef(null);

  const orderId = queryParams.get('orderAutoId') || '';
  const orderStatus = queryParams.get('status') || '';

  const [tabValue, setTabValue] = useState<number>(0);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(orderId !== '');

  if (parseInt(orderId, 10) > 0 && orderStatus === 'success') {
    localStorage.removeItem('cartItems');
    localStorage.removeItem('dp');
  }

  // console.log(orderId, status);

  return (
    <div className={classes.welcome}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container}>
        <div className={classes.doctorListingPage}>
          <Tabs
            value={tabValue}
            classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
            onChange={(e, newValue) => {
              setTabValue(newValue);
            }}
          >
            <Tab
              classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
              label="Medicines"
            />
            <Tab
              disabled
              classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
              label="Tests"
            />
          </Tabs>
          {tabValue === 0 && (
            <TabContainer>
              <SearchMedicines />
            </TabContainer>
          )}
          {tabValue === 1 && <TabContainer>Test</TabContainer>}
        </div>
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
        onClose={() => {
          setIsPopoverOpen(false);
          window.location.href = clientRoutes.yourOrders();
        }}
      >
        <div className={classes.successPopoverWindow}>
          <div className={classes.windowWrap}>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic_mascot.png')} alt="" />
            </div>
            {orderStatus === 'failed' && <OrderFailed close={() => setIsPopoverOpen(false)} />}
            {orderStatus === 'success' && <OrderPlaced orderId={orderId} />}
          </div>
        </div>
      </Popover>
    </div>
  );
};
