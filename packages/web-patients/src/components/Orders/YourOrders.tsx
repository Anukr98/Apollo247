import React, { useRef, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Popover, CircularProgress } from '@material-ui/core';
import { OrderCard } from 'components/Orders/OrderCard';
import { OrdersMessage } from 'components/Orders/OrdersMessage';
import { TrackOrders } from 'components/Orders/TrackOrders';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {
  getMedicineOrdersOMSList,
  getMedicineOrdersOMSListVariables,
  getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList as OrdersList,
  getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList_medicineOrdersStatus as StatusDetails,
} from 'graphql/types/getMedicineOrdersOMSList';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_MEDICINE_ORDERS_OMS_LIST } from 'graphql/medicines';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { MEDICINE_ORDER_STATUS, MEDICINE_DELIVERY_TYPE } from 'graphql/types/globalTypes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 20,
      paddingLeft: 0,
      display: 'flex',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        paddingRight: 0,
      },
    },
    loader: {
      margin: '20px auto',
      textAlign: 'center',
      display: 'block',
    },
    orderListing: {
      paddingLeft: 10,
    },
    customScroll: {
      paddingLeft: 10,
      paddingRight: 15,
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
        display: 'none',
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
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#f7f8f5',
        zIndex: 999,
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
    overlayOpen: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    noOrdersWrapper: {
      backgroundColor: '#F7F7F5',
      borderRadius: 10,
      padding: 20,
      margin: '20px auto',
      maxWidth: 320,
      fontSize: 16,
      fontWeight: 600,
    },
    noOrdersText: {
      color: '#0087ba',
      marginTop: 15,
      marginBottom: 20,
    },
    orderNowButton: {
      padding: '9px 13px',
      width: '100%',
      borderRadius: 10,
      backgroundColor: '#fcb716',
      color: '#fff',
      textTransform: 'uppercase',
      display: 'block',
      textAlign: 'center',
      fontSize: 13,
      fontWeight: 'bold',
      boxShadow: '0 2px 4px 0 rgba(0,0,0, 0.2)',
    },
  };
});

export const YourOrders: React.FC = (props) => {
  const classes = useStyles({});
  const mascotRef = useRef(null);
  const [isPopoverOpen] = React.useState<boolean>(false);
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const [showMobileDetails, setShowMobileDetails] = React.useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const apolloClient = useApolloClient();
  const [orderListData, setOrderListData] = useState<OrdersList[] | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [orderAutoId, setOrderAutoId] = React.useState<number | null>(null);
  const [billNumber, setBillNumber] = React.useState<string | null>(null);

  useEffect(() => {
    if (currentPatient && currentPatient.id && !orderListData) {
      setLoading(true);
      apolloClient
        .query<getMedicineOrdersOMSList, getMedicineOrdersOMSListVariables>({
          query: GET_MEDICINE_ORDERS_OMS_LIST,
          variables: {
            patientId: (currentPatient && currentPatient.id) || '',
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }: any) => {
          if (
            data &&
            data.getMedicineOrdersOMSList &&
            data.getMedicineOrdersOMSList.medicineOrdersList &&
            data.getMedicineOrdersOMSList.medicineOrdersList.length > 0
          ) {
            setOrderListData(data.getMedicineOrdersOMSList.medicineOrdersList || []);
            if (!isSmallScreen) {
              const deliveryType = data.getMedicineOrdersOMSList.medicineOrdersList[0].deliveryType;
              if (deliveryType === MEDICINE_DELIVERY_TYPE.STORE_PICKUP) {
                setBillNumber(data.getMedicineOrdersOMSList.medicineOrdersList[0].billNumber);
              } else {
                setOrderAutoId(data.getMedicineOrdersOMSList.medicineOrdersList[0].orderAutoId);
              }
            }
          } else {
            setOrderListData([]);
          }
          setError(false);
        })
        .catch((e) => {
          console.log(e);
          setError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currentPatient, orderListData]);

  if (error) return <div>Error :(</div>;

  // const getSortedStatusList = (statusList: (StatusDetails | null)[]) => {
  //   const filteredStatusList = statusList.filter((status) => status && status.hideStatus);
  //   if (filteredStatusList && filteredStatusList.length > 0) {
  //     return (
  //       filteredStatusList.sort(
  //         (a, b) =>
  //           moment(b && b.statusDate)
  //             .toDate()
  //             .getTime() -
  //           moment(a && a.statusDate)
  //             .toDate()
  //             .getTime()
  //       ) || []
  //     );
  //   }
  //   return null;
  // };

  // const getOrderStatus = (statusList: (StatusDetails | null)[]) => {
  //   const sortedList = getSortedStatusList(statusList);
  //   if (sortedList && sortedList.length > 0) {
  //     const firstSortedData = sortedList[0];
  //     if (firstSortedData && firstSortedData.orderStatus) {
  //       return getStatus(firstSortedData.orderStatus);
  //     }
  //   }
  // };

  return (
    <div className={classes.root}>
      <div
        className={`${classes.leftSection} ${
          isSmallScreen && !showMobileDetails ? '' : classes.overlayOpen
        }`}
      >
        <div className={classes.sectionHeader}>Your Orders</div>
        {(isSmallScreen || orderAutoId || billNumber) &&
        orderListData &&
        orderListData.length > 0 ? (
          orderListData.map((orderInfo) => {
            if (
              orderInfo &&
              orderInfo.medicineOrdersStatus &&
              orderInfo.currentStatus !== MEDICINE_ORDER_STATUS.QUOTE
            ) {
              return (
                <div key={orderInfo.orderAutoId} className={classes.orderListing}>
                  <div className={classes.customScroll}>
                    <OrderCard
                      orderAutoId={orderAutoId}
                      setOrderAutoId={setOrderAutoId}
                      setBillNumber={setBillNumber}
                      orderInfo={orderInfo}
                      setShowMobileDetails={setShowMobileDetails}
                      billNumber={billNumber}
                    />
                  </div>
                </div>
              );
            } else {
              <div className={classes.noOrdersWrapper}>
                <div>Uh oh! :)</div>
                <div className={classes.noOrdersText}>No Orders Found!</div>
                <Link to={clientRoutes.medicines()} className={classes.orderNowButton}>
                  Order Now
                </Link>
              </div>;
            }
          })
        ) : loading ? (
          <div className={classes.loader}>
            <CircularProgress />
          </div>
        ) : (
          orderListData &&
          orderListData.length === 0 && (
            <div className={classes.noOrdersWrapper}>
              <div>Uh oh! :)</div>
              <div className={classes.noOrdersText}>No Orders Found!</div>
              <Link to={clientRoutes.medicines()} className={classes.orderNowButton}>
                Order Now
              </Link>
            </div>
          )
        )}
      </div>
      <div
        className={`${classes.rightSection} ${
          isSmallScreen && !showMobileDetails ? '' : classes.mobileOverlay
        }`}
      >
        {(orderAutoId || billNumber) && (
          <TrackOrders
            orderAutoId={orderAutoId}
            billNumber={billNumber}
            setShowMobileDetails={setShowMobileDetails}
          />
        )}
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
  );
};
