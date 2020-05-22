import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import {
  AphTrackSlider,
  AphOnHoldSlider,
  AphDelayedSlider,
  AphDeliveredSlider,
} from '@aph/web-ui-components';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {
  getMedicineOrdersOMSList,
  getMedicineOrdersOMSListVariables,
  getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList as OrdersList,
  getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList_medicineOrdersStatus as StatusDetails,
} from 'graphql/types/getMedicineOrdersOMSList';

import moment from 'moment';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { GET_MEDICINE_ORDERS_OMS_LIST } from 'graphql/medicines';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { MEDICINE_ORDER_STATUS } from 'graphql/types/globalTypes';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { getStatus } from 'components/Orders/OrderStatusCard';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: 10,
      display: 'flex',
      alignItems: 'center',
      marginBottom: 10,
      cursor: 'pointer',
      border: 'solid 1px transparent',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        padding: 16,
      },
    },
    cardSelected: {
      border: 'solid 1px #00b38e',
      '&:before, &:after': {
        left: '100%',
        top: '50%',
        border: 'solid transparent',
        content: '""',
        height: 0,
        width: 0,
        position: 'absolute',
      },
      '&:after': {
        borderColor: 'rgba(255, 255, 255, 0)',
        borderLeftColor: '#fff',
        borderWidth: 7,
        marginTop: -7,
      },
      '&:before': {
        borderColor: 'rgba(0, 179, 142, 0)',
        borderLeftColor: '#00b38e',
        borderWidth: 8,
        marginTop: -8,
      },
    },
    orderListing: {
      paddingLeft: 10,
    },
    orderedItem: {
      display: 'flex',
      alignItems: 'center',
      width: '40%',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    itemImg: {
      paddingRight: 20,
      [theme.breakpoints.down('xs')]: {
        paddingRight: 16,
      },
      '& img': {
        verticalAlign: 'middle',
      },
    },
    itemSection: {
      paddingRight: 20,
    },
    itemName: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    orderID: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    deliveryType: {
      fontSize: 10,
      fontWeight: 500,
      color: '#658f9b',
      marginLeft: -1,
      marginRight: -1,
      '& span': {
        paddingRight: 10,
        paddingLeft: 10,
        borderLeft: '0.5px solid rgba(2,71,91,0.3)',
      },
      '& span:first-child': {
        paddingLeft: 1,
        borderLeft: 0,
      },
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        right: 6,
        top: 22,
        marginRight: 0,
      },
    },
    customScroll: {
      paddingLeft: 10,
      paddingRight: 15,
    },
    orderStatusGroup: {
      marginLeft: 'auto',
      paddingLeft: 20,
      width: '25%',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        display: 'flex',
        paddingLeft: 40,
        paddingRight: 0,
      },
    },
    orderStatus: {
      fontSize: 12,
      fontWeight: 600,
      color: '#02475b',
      lineHeight: '20px',
    },
    orderStatusRejected: {
      fontSize: 12,
      fontWeight: 600,
      color: '#890000',
      lineHeight: '20px',
    },
    statusInfo: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      lineHeight: '20px',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 'auto',
      },
    },
    orderTrackSlider: {
      paddingLeft: 20,
      paddingRight: 20,
      width: '40%',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        paddingLeft: 40,
        paddingRight: 0,
        margin: '8px 0',
      },
    },
    orderError: {
      color: '#890000',
    },
    returnAccepted: {
      backgroundColor: '#f0f1ec',
    },
    loader: {
      margin: '20px auto',
      textAlign: 'center',
      display: 'block',
    },
    noData: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      paddingLeft: 20,
      paddingRight: 20,
      textAlign: 'center',
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

interface OrderCardProps {
  setOrderAutoId: (orderAutoId: number) => void;
  setShowMobileDetails: (showMobileDetails: boolean) => void;
  orderAutoId: number;
}

export const OrderCard: React.FC<OrderCardProps> = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const isSmallScreen = useMediaQuery('(max-width:767px)');

  const { data, error, loading } = useQueryWithSkip<
    getMedicineOrdersOMSList,
    getMedicineOrdersOMSListVariables
  >(GET_MEDICINE_ORDERS_OMS_LIST, {
    variables: {
      patientId: currentPatient && currentPatient.id,
    },
  });
  if (loading)
    return (
      <div className={classes.loader}>
        <CircularProgress />
      </div>
    );
  if (error) return <div>Error :(</div>;

  const getSortedStatusList = (statusList: (StatusDetails | null)[]) => {
    const filteredStatusList = statusList.filter((status) => status && status.hideStatus);
    if (filteredStatusList && filteredStatusList.length > 0) {
      return (
        filteredStatusList.sort(
          (a, b) =>
            moment(b && b.statusDate)
              .toDate()
              .getTime() -
            moment(a && a.statusDate)
              .toDate()
              .getTime()
        ) || []
      );
    }
    return null;
  };

  const getOrderStatus = (statusList: (StatusDetails | null)[]) => {
    const sortedList = getSortedStatusList(statusList);
    if (sortedList && sortedList.length > 0) {
      const firstSortedData = sortedList[0];
      if (firstSortedData && firstSortedData.orderStatus) {
        return getStatus(firstSortedData.orderStatus);
      }
    }
  };

  const getOrderDeliveryDate = (status: (StatusDetails | null)[]) => {
    const sortedList = getSortedStatusList(status);
    if (sortedList && sortedList.length > 0) {
      const firstSortedData = sortedList[0];
      return (
        firstSortedData &&
        moment(new Date(firstSortedData.statusDate)).format('DD MMM YYYY ,hh:mm a')
      );
    }
  };

  const getDefaultValue = (status: string) => {
    switch (status) {
      case 'Order Placed':
        return 80;
      case 'Order Verified':
        return 100;
      case 'Order Initiated':
        return 60;
      case 'Order Billed and Packed':
        return 120;
      case 'Order Delivered':
        return 360;
    }
  };

  const isSliderDisabled = (sliderStatus: string) => {
    return sliderStatus === 'Return Accepted' || sliderStatus === 'Order Cancelled';
  };

  const getSlider = (status: (StatusDetails | null)[]) => {
    const sliderStatus = getOrderStatus(status);
    switch (sliderStatus) {
      case 'Order Delivered':
      case 'Order Placed':
      case 'Order Verified':
      case 'Order Initiated':
      case 'Return Accepted':
      case 'Order Cancelled':
        return (
          <AphTrackSlider
            color="primary"
            defaultValue={getDefaultValue(sliderStatus)}
            getAriaValueText={(value: number) => value.toString()}
            disabled={isSliderDisabled(sliderStatus)}
            min={0}
            max={360}
            valueLabelDisplay="off"
            step={null}
          />
        );

      default:
        return null;
    }
  };

  if (
    data &&
    data.getMedicineOrdersOMSList &&
    data.getMedicineOrdersOMSList.medicineOrdersList &&
    data.getMedicineOrdersOMSList.medicineOrdersList.length > 0
  ) {
    const orderListData = data.getMedicineOrdersOMSList.medicineOrdersList;

    const firstOrderInfo = orderListData[0];
    if (!props.orderAutoId && firstOrderInfo && firstOrderInfo.orderAutoId) {
      props.setOrderAutoId(firstOrderInfo.orderAutoId);
    }

    return (
      <div className={classes.orderListing}>
        <div className={classes.customScroll}>
          {orderListData && orderListData.length > 0 ? (
            orderListData.map(
              (orderInfo) =>
                orderInfo &&
                orderInfo.medicineOrdersStatus &&
                getOrderStatus(orderInfo.medicineOrdersStatus) && (
                  <div
                    key={orderInfo.id}
                    className={`${classes.root} ${
                      orderInfo.orderAutoId === props.orderAutoId ? classes.cardSelected : ''
                    }`}
                    onClick={() => {
                      if (isSmallScreen) {
                        props.setShowMobileDetails(true);
                      }
                      props.setOrderAutoId(orderInfo.orderAutoId || 0);
                    }}
                  >
                    <div className={classes.orderedItem}>
                      <div className={classes.itemImg}>
                        <img src={require('images/ic_tablets.svg')} alt="" />
                      </div>
                      <div className={classes.itemSection}>
                        <div className={classes.itemName}>Medicines</div>
                        <div className={classes.orderID}>#{orderInfo.orderAutoId}</div>
                        <div className={classes.deliveryType}>
                          <span>{orderInfo.deliveryType}</span>
                        </div>
                      </div>
                    </div>
                    <div className={classes.orderTrackSlider}>
                      {getSlider(orderInfo.medicineOrdersStatus)}
                    </div>
                    <div className={classes.orderStatusGroup}>
                      {orderInfo.medicineOrdersStatus && (
                        <div
                          className={
                            getOrderStatus(orderInfo.medicineOrdersStatus) === 'Order Cancelled'
                              ? `${classes.orderStatusRejected}`
                              : `${classes.orderStatus}`
                          }
                        >
                          {getOrderStatus(orderInfo.medicineOrdersStatus)}
                        </div>
                      )}
                      <div className={classes.statusInfo}>
                        {orderInfo.medicineOrdersStatus &&
                          getOrderDeliveryDate(orderInfo.medicineOrdersStatus)}
                      </div>
                    </div>
                  </div>
                )
            )
          ) : (
            <div className={classes.noOrdersWrapper}>
              <div>Uh oh! :)</div>
              <div className={classes.noOrdersText}>No Orders Found!</div>
              <Link to={clientRoutes.medicines()} className={classes.orderNowButton}>
                Order Now
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};
