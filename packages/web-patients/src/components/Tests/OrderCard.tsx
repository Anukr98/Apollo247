import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress, MenuItem } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import {
  AphTrackSlider,
  AphOnHoldSlider,
  AphDelayedSlider,
  AphDeliveredSlider,
} from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import {
  GetMedicineOrdersList,
  GetMedicineOrdersListVariables,
  GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList as ordersList,
  GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList_medicineOrdersStatus as statusDetails,
} from 'graphql/types/GetMedicineOrdersList';

import moment from 'moment';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { GET_MEDICINE_ORDERS_LIST } from 'graphql/profiles';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { MEDICINE_ORDER_STATUS } from 'graphql/types/globalTypes';
import {
  AphButton,
  AphDialog,
  AphDialogTitle,
  AphDialogClose,
  AphSelect,
  AphTextField,
} from '@aph/web-ui-components';
import { AphCalendar } from 'components/AphCalendar';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: 10,
      display: 'flex',
      marginBottom: 10,
      cursor: 'pointer',
      border: 'solid 1px transparent',
      position: 'relative',
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
      width: '40%',
    },
    itemImg: {
      paddingRight: 20,
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
    },
    customScroll: {
      paddingLeft: 10,
      paddingRight: 15,
    },
    orderStatusGroup: {
      marginLeft: 'auto',
      paddingLeft: 20,
      width: '25%',
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
    },
    orderTrackSlider: {
      paddingLeft: 20,
      paddingRight: 20,
      width: '40%',
    },
    loader: {
      margin: '20px auto',
      textAlign: 'center',
      display: 'block',
    },
    rescheduleButton: {
      paddingTop: 8,
      display: 'flex',
      '& button': {
        color: '#fc9916',
        boxShadow: 'none',
        backgroundColor: 'transparent',
        padding: 0,
        minWidth: 'auto',
        '&:hover': {
          backgroundColor: 'transparent',
          color: '#fc9916',
        },
      },
    },
    wrapperCards: {
      backgroundColor: '#f7f8f5',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      padding: 16,
      marginTop: 16,
      marginBottom: 16,
      '& p': {
        fontSize: 14,
        fontWeight: 500,
        color: '#02475b',
        margin: 0,
      },
    },
    doneButton: {
      padding: 16,
      marginBOttom: 16,
      '& button': {
        width: '100%',
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
  };
});

function valuetext(value: number) {
  return `${value}`;
}

type OrderCardProps = {
  setOrderAutoId: (orderAutoId: number) => void;
  orderAutoId: number;
};

export const OrderCard: React.FC<OrderCardProps> = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const [isUploadPreDialogOpen, setIsUploadPreDialogOpen] = React.useState<boolean>(false);

  const { data, error, loading } = useQueryWithSkip<
    GetMedicineOrdersList,
    GetMedicineOrdersListVariables
  >(GET_MEDICINE_ORDERS_LIST, {
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

  const getSortedstatusList = (statusList: (statusDetails | null)[]) => {
    if (statusList && statusList.length > 0) {
      const filteredStatusList = statusList.filter((status) => status && status.hideStatus);
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

  const getStatus = (status: MEDICINE_ORDER_STATUS) => {
    switch (status) {
      case MEDICINE_ORDER_STATUS.ORDER_INITIATED:
        return 'Order Initiated';
      case MEDICINE_ORDER_STATUS.ORDER_PLACED:
        return 'Order Placed';
      case MEDICINE_ORDER_STATUS.ORDER_VERIFIED:
        return 'Order Verified';
      case MEDICINE_ORDER_STATUS.ORDER_FAILED:
        return 'Order Failed';
      case MEDICINE_ORDER_STATUS.ORDER_CONFIRMED:
        return 'Order Confirmed';
      case MEDICINE_ORDER_STATUS.CANCELLED:
        return 'Order Cancelled';
      case MEDICINE_ORDER_STATUS.CANCEL_REQUEST:
        return 'Order Cancel Requested';
      case MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY:
        return 'Order Out for Delivery';
      case MEDICINE_ORDER_STATUS.DELIVERED:
        return 'Order Delivered';
      case MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS:
        return 'Order Payment Success';
      case MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED:
        return 'Prescription Uploaded';
      case MEDICINE_ORDER_STATUS.PICKEDUP:
        return 'Order Picked up';
      case MEDICINE_ORDER_STATUS.PRESCRIPTION_CART_READY:
        return 'Prescription Cart Ready';
      case MEDICINE_ORDER_STATUS.RETURN_INITIATED:
        return 'Return Initiated';
      case MEDICINE_ORDER_STATUS.RETURN_ACCEPTED:
        return 'Return Accepted';
      default:
        return 'Order Initiated';
    }
  };

  const getOrderStatus = (status: (statusDetails | null)[]) => {
    const sortedList = getSortedstatusList(status);
    if (sortedList && sortedList.length > 0) {
      const firstSortedData = sortedList[0];
      if (firstSortedData && firstSortedData.orderStatus) {
        return getStatus(firstSortedData.orderStatus);
      }
    }
  };

  const getOrderDeliveryDate = (status: (statusDetails | null)[]) => {
    const sortedList = getSortedstatusList(status);
    if (sortedList && sortedList.length > 0) {
      const firstSortedData = sortedList[0];
      return (
        firstSortedData &&
        moment(new Date(firstSortedData.statusDate)).format('DD MMM YYYY ,hh:mm a')
      );
    }
  };

  const getSlider = (status: (statusDetails | null)[]) => {
    const sliderStatus = getOrderStatus(status);
    switch (sliderStatus) {
      case 'Order Placed':
        return (
          <AphTrackSlider
            color="primary"
            defaultValue={80}
            getAriaValueText={valuetext}
            min={0}
            max={360}
            valueLabelDisplay="off"
          />
        );
      case 'Order Delivered':
        return (
          <AphDeliveredSlider
            color="primary"
            defaultValue={360}
            getAriaValueText={valuetext}
            min={0}
            max={360}
            valueLabelDisplay="off"
          />
        );
      case 'Return Accepted' || 'Order Cancelled':
        return (
          <AphTrackSlider
            color="primary"
            getAriaValueText={valuetext}
            disabled
            min={0}
            max={360}
            valueLabelDisplay="off"
          />
        );

      case 'Order Verified':
        return (
          <AphTrackSlider
            color="primary"
            defaultValue={100}
            getAriaValueText={valuetext}
            min={0}
            max={360}
            valueLabelDisplay="off"
          />
        );
      case 'Order Initiated':
        return (
          <AphTrackSlider
            color="primary"
            defaultValue={60}
            getAriaValueText={valuetext}
            min={0}
            max={360}
            valueLabelDisplay="off"
          />
        );
      default:
        return null;
    }
  };

  if (
    data &&
    data.getMedicineOrdersList &&
    data.getMedicineOrdersList.MedicineOrdersList &&
    data.getMedicineOrdersList.MedicineOrdersList.length > 0
  ) {
    const orderListData = data.getMedicineOrdersList.MedicineOrdersList;

    const firstOrderInfo = orderListData[0];
    if (!props.orderAutoId && firstOrderInfo && firstOrderInfo.orderAutoId) {
      props.setOrderAutoId(firstOrderInfo.orderAutoId);
    }

    return (
      <div className={classes.orderListing}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 200px)'}>
          <div className={classes.customScroll}>
            {orderListData && orderListData.length > 0
              ? orderListData.map(
                  (orderInfo) =>
                    orderInfo &&
                    orderInfo.medicineOrdersStatus &&
                    getOrderStatus(orderInfo.medicineOrdersStatus) && (
                      <div
                        key={orderInfo.id}
                        className={`${classes.root} ${
                          orderInfo.orderAutoId === props.orderAutoId ? classes.cardSelected : ''
                        }`}
                        onClick={() => props.setOrderAutoId(orderInfo.orderAutoId || 0)}
                      >
                        <div className={classes.orderedItem}>
                          <div className={classes.itemImg}>
                            <img src={require('images/ic_tests_icon.svg')} alt="" />
                          </div>
                          <div className={classes.itemSection}>
                            <div className={classes.itemName}>Blood Glucose Test</div>
                            <div className={classes.deliveryType}>
                              <span>Home Visit</span>
                              <span>#{orderInfo.orderAutoId}</span>
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
                          <div className={classes.rescheduleButton}>
                            <AphButton
                              color="primary"
                              onClick={() => setIsUploadPreDialogOpen(true)}
                              title={'Schedule Appointment'}
                            >
                              Reschedule
                            </AphButton>
                            {/* <AphButton>Consult a Doctor</AphButton>
                          <AphButton>Download Report</AphButton> */}
                          </div>
                        </div>
                      </div>
                    )
                )
              : 'No Orders Found'}
          </div>
          <AphDialog open={isUploadPreDialogOpen} maxWidth="sm">
            <AphDialogClose onClick={() => setIsUploadPreDialogOpen(false)} title={'Close'} />
            <AphDialogTitle>Schedule Appointment</AphDialogTitle>
            <Scrollbars autoHide={true} autoHeight autoHeightMax={'65vh'}>
              <div className={classes.wrapperCards}>Calender</div>
              <div className={classes.wrapperCards}>
                <p>Slot</p>
                <AphSelect>
                  <MenuItem value={1} classes={{ selected: classes.menuSelected }}>
                    6:00 am - 6:40 am
                  </MenuItem>
                  <MenuItem value={2}>6:00 am - 6:40 am</MenuItem>
                  <MenuItem value={3}>6:00 am - 6:40 am</MenuItem>
                </AphSelect>
              </div>
              <div className={classes.wrapperCards}>
                <p>Why are you rescheduling this order?</p>
                <AphSelect>
                  <MenuItem value={1} classes={{ selected: classes.menuSelected }}>
                    Select reason for rescheduling{' '}
                  </MenuItem>
                </AphSelect>
              </div>
              <div className={classes.wrapperCards}>
                <p>Add Comments (Optional)</p>
                <AphTextField
                  // classes={{ root: classes.searchInput }}
                  placeholder="Enter your comments here…"
                />
              </div>
              <div className={classes.doneButton}>
                <AphButton color="primary">Done</AphButton>
              </div>
            </Scrollbars>
          </AphDialog>
        </Scrollbars>
      </div>
    );
  }
  return <p>No Orders Found</p>;
};
