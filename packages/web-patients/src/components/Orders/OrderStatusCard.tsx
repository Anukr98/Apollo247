import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { useApolloClient } from 'react-apollo-hooks';
import {
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails as OrderDetails,
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus as StatusDetails,
} from 'graphql/types/getMedicineOrderOMSDetails';
import moment from 'moment';
import { OrderFeedback } from './OrderFeedback';
import { MEDICINE_ORDER_STATUS } from 'graphql/types/globalTypes';
import { AphButton } from '@aph/web-ui-components';
import Popover from '@material-ui/core/Popover';
import { useShoppingCart, MedicineCartItem } from 'components/MedicinesCartProvider';
import {
  GetPatientAddressList,
  GetPatientAddressListVariables,
  GetPatientAddressList_getPatientAddressList_addressList as AddressDetails,
} from 'graphql/types/GetPatientAddressList';
import { GET_PATIENT_ADDRESSES_LIST } from 'graphql/address';
import { getStatus, isRejectedStatus } from 'helpers/commonHelpers';
import { ReOrder } from './ReOrder';

const useStyles = makeStyles((theme: Theme) => {
  return {
    orderStatusGroup: {
      padding: 0,
    },
    cardRoot: {
      padding: 20,
    },
    cardGroup: {
      paddingLeft: 34,
      paddingBottom: 8,
      position: 'relative',
      '&:before': {
        position: 'absolute',
        content: '""',
        width: 4,
        top: 0,
        left: 0,
        height: '100%',
        backgroundColor: '#00b38e',
        opacity: 0.2,
        borderRadius: 2,
      },
      '&:last-child': {
        '&:before': {
          display: 'none',
        },
      },
      '&:after': {
        position: 'absolute',
        content: '""',
        width: 8,
        height: 8,
        top: 0,
        left: -2,
        borderRadius: '50%',
        backgroundColor: '#01475b',
      },
    },
    statusCard: {
      backgroundColor: '#eff0eb',
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
      padding: 16,
    },
    statusInfo: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      letterSpacing: 0.04,
      paddingTop: 8,
      marginTop: 5,
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      '& span': {
        opacity: 0.6,
      },
      '& span:last-child': {
        marginLeft: 'auto',
      },
    },
    orderStatusActive: {
      backgroundColor: theme.palette.common.white,
      '& span': {
        opacity: 1,
      },
      '&:before': {
        position: 'absolute',
        content: '""',
        width: 28,
        height: 28,
        top: -4,
        left: -12,
        backgroundImage: 'url(' + require('images/ic_tracker_done.svg') + ')',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'transparent',
        borderRadius: 2,
        zIndex: 2,
      },
    },
    orderStatusCompleted: {
      '&:after': {
        position: 'absolute',
        content: '""',
        width: 4,
        top: 0,
        left: 0,
        height: '100%',
        backgroundColor: '#0087ba',
        zIndex: 1,
      },
    },
    loader: {
      margin: '20px auto',
      textAlign: 'center',
      display: 'block',
    },
    orderDetails: {
      padding: '10px 16px',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      fontSize: 12,
    },
    orderDetailsRow: {
      display: 'flex',
      alignItems: 'center',
      paddingBottom: 5,
    },
    detailsRow: {
      display: 'flex',
      paddingTop: 5,
    },
    orderId: {
      fontWeight: 600,
      textTransform: 'uppercase',
    },
    orderTitle: {
      fontWeight: 600,
      minWidth: 55,
    },
    discription: {
      fontWeight: 500,
      paddingLeft: 5,
    },
    orderStatus: {
      marginLeft: 'auto',
      fontSize: 11,
      fontWeight: 500,
      padding: '4px 15px',
      borderRadius: 10,
      cursor: 'pointer',
      backgroundColor: '#c5eae1',
      lineHeight: '12px',
    },
    orderStatusFailed: {
      marginLeft: 'auto',
      fontSize: 11,
      fontWeight: 500,
      padding: '4px 15px',
      borderRadius: 10,
      cursor: 'pointer',
      backgroundColor: '#890000',
      color: '#fff',
      lineHeight: '12px',
    },
    expectedDelivery: {
      padding: '14px 20px',
      boxShadow: '0 1px 3px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f8f5',
      fontSize: 12,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      '& span': {
        '& img': {
          marginRight: 16,
          verticalAlign: 'middle',
        },
        '& span': {
          textTransform: 'uppercase',
        },
      },
    },
    infoText: {
      fontSize: 10,
      color: '#02475b',
      fontWeight: 600,
      paddingTop: 5,
      paddingLeft: 5,
      lineHeight: '13px',
    },
    labelStatus: {
      color: '#00b38e',
    },
    bottomNotification: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      textAlign: 'center',
      padding: 16,
      fontSize: 12,
      lineHeight: '19px',
      color: '#01475b',
      fontWeight: 500,
      '& p': {
        margin: 0,
      },
      '& h3': {
        margin: 0,
        fontSize: 13,
        fontWeight: 'bold',
      },
      '& button': {
        borderRadius: 10,
        width: '100%',
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      bottom: '0 !important',
      top: 'auto !important',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    feedbackPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
      '& h3': {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#02475b',
        margin: '0 0 10px',
      },
      '& h4': {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#0087ba',
      },
    },
    windowWrap: {
      width: 368,
      borderRadius: 10,
      padding: 20,
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
    reorderBtn: {
      marginBottom: 15,
    },
  };
});

interface OrderStatusCardProps {
  orderDetailsData: OrderDetails | null;
  isLoading: boolean;
}

export const deliveredOrderDetails = (orderStatusList: StatusDetails[]) => {
  return (
    orderStatusList &&
    orderStatusList.find(
      (statusDetails: StatusDetails) =>
        statusDetails.orderStatus === MEDICINE_ORDER_STATUS.DELIVERED
    )
  );
};

export const getDeliveredDateTime = (orderStatusList: StatusDetails[]) => {
  const deliveredData = deliveredOrderDetails(orderStatusList);
  if (deliveredData) {
    const time = deliveredData.statusDate;
    const finalDateTime =
      moment(time).format('D MMMM YYYY') + ' at ' + moment(time).format('hh:mm A');
    return finalDateTime;
  }
};

export const OrderStatusCard: React.FC<OrderStatusCardProps> = (props) => {
  const classes = useStyles({});
  const { orderDetailsData, isLoading } = props;
  const { deliveryAddresses, setDeliveryAddresses } = useShoppingCart();
  const client = useApolloClient();

  const getSortedStatusList = (statusList: (StatusDetails | null)[]) => {
    if (statusList && statusList.length > 0) {
      const filteredStatusList: StatusDetails[] = [];
      statusList.forEach((statusObject: StatusDetails) => {
        if (statusObject.hideStatus) {
          const isDuplicateStatusIndex = filteredStatusList.findIndex(
            (statusObj: StatusDetails) => statusObj.orderStatus === statusObject.orderStatus
          );
          // code for ignoring the status object if it is duplicate
          if (isDuplicateStatusIndex === -1) {
            filteredStatusList.push(statusObject);
          }
        }
      });
      return (
        filteredStatusList.sort(
          (a, b) =>
            moment(a && a.statusDate)
              .toDate()
              .getTime() -
            moment(b && b.statusDate)
              .toDate()
              .getTime()
        ) || []
      );
    }
    return [];
  };

  const orderStatusList =
    orderDetailsData && getSortedStatusList(orderDetailsData.medicineOrdersStatus || []);

  const getFormattedDate = (time: string) => {
    return moment(time).format('D MMMM, YYYY');
  };

  const statusArray = [
    'CANCELLED',
    'CANCEL_REQUEST',
    'DELIVERED',
    'ITEMS_RETURNED',
    'ORDER_CONFIRMED',
    'ORDER_FAILED',
    'ORDER_INITIATED',
    'ORDER_PLACED',
    'ORDER_BILLED',
    'ORDER_VERIFIED',
    'OUT_FOR_DELIVERY',
    'PAYMENT_FAILED',
    'PAYMENT_PENDING',
    'PAYMENT_SUCCESS',
    'PICKEDUP',
    'PRESCRIPTION_CART_READY',
    'PRESCRIPTION_UPLOADED',
    'RETURN_ACCEPTED',
    'RETURN_INITIATED',
    'READY_AT_STORE',
  ];

  const mascotRef = useRef(null);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);

  const getAddressDetails = (id: string) => {
    client
      .query<GetPatientAddressList, GetPatientAddressListVariables>({
        query: GET_PATIENT_ADDRESSES_LIST,
        variables: {
          patientId: id || '',
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        if (
          _data.data &&
          _data.data.getPatientAddressList &&
          _data.data.getPatientAddressList.addressList
        ) {
          const addresses = _data.data.getPatientAddressList.addressList.reverse();
          if (addresses && addresses.length > 0) {
            setDeliveryAddresses && setDeliveryAddresses(addresses);
            getPatientAddress(addresses);
          } else {
            setDeliveryAddresses && setDeliveryAddresses([]);
          }
        }
      })
      .catch((e) => {
        console.log('Error occured while fetching Doctor', e);
      });
  };

  const getPatientAddress = (deliveryAddresses: AddressDetails[]) => {
    if (deliveryAddresses.length > 0) {
      if (orderDetailsData && orderDetailsData.patientAddressId) {
        const selectedAddress = deliveryAddresses.find(
          (address: AddressDetails) => address.id == orderDetailsData.patientAddressId
        );
        const address1 = selectedAddress.addressLine1 ? `${selectedAddress.addressLine1}, ` : '';
        const address2 = selectedAddress.addressLine2 ? `${selectedAddress.addressLine2}, ` : '';
        const city = selectedAddress.city ? `${selectedAddress.city}, ` : '';
        const state = selectedAddress.state ? `${selectedAddress.state}, ` : '';
        const addressData = selectedAddress
          ? `${address1}${address2}${city}${state}${selectedAddress.zipcode || ''}`
          : '';
        return addressData;
      } else {
        return '';
      }
    } else {
      getAddressDetails(orderDetailsData.patient.id);
    }
  };

  const prescriptionRequired = () => {
    const item =
      orderDetailsData &&
      orderDetailsData.medicineOrderLineItems &&
      orderDetailsData.medicineOrderLineItems.find((item) => item.isPrescriptionNeeded);
    return item && item.isPrescriptionNeeded;
  };

  const getOrderDescription = (status: MEDICINE_ORDER_STATUS, statusMessage: string) => {
    switch (status) {
      case MEDICINE_ORDER_STATUS.ORDER_PLACED:
        return !prescriptionRequired() ? (
          ''
        ) : (
          <>
            <span className={classes.labelStatus}>Verification Pending: </span>
            Your order is being verified by our pharmacists. Our pharmacists might be required to
            call you for order verification.
          </>
        );
      case MEDICINE_ORDER_STATUS.ORDER_VERIFIED:
        return (
          <>
            <span className={classes.labelStatus}>Store Assigned: </span> Your order has been
            assigned to our pharmacy.
          </>
        );
      case MEDICINE_ORDER_STATUS.ORDER_BILLED:
        return `Your order #${orderDetailsData.orderAutoId} has been packed. Soon would be dispatched from our pharmacy.`;
      case MEDICINE_ORDER_STATUS.CANCELLED:
        return statusMessage === ''
          ? `Your order #${orderDetailsData.orderAutoId} has been cancelled as per your request.`
          : statusMessage;
      case MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY:
        return (
          <>
            <span className={classes.labelStatus}>Out for delivery: </span> Your Order has been
            picked up from our store!
          </>
        );
      case MEDICINE_ORDER_STATUS.PAYMENT_FAILED:
        return `Order Not Placed! Please try to place the order again with an alternative payment method or Cash on Delivery (COD).`;
      default:
        return '';
    }
  };
  const addRestStatusToShow = () => {
    if (orderDetailsData) {
      switch (orderDetailsData.currentStatus) {
        case MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY:
          return [MEDICINE_ORDER_STATUS.DELIVERED];
        case MEDICINE_ORDER_STATUS.ORDER_BILLED:
          return [MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY, MEDICINE_ORDER_STATUS.DELIVERED];
        case MEDICINE_ORDER_STATUS.ORDER_VERIFIED:
          return [
            MEDICINE_ORDER_STATUS.ORDER_BILLED,
            MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY,
            MEDICINE_ORDER_STATUS.DELIVERED,
          ];
        case MEDICINE_ORDER_STATUS.ORDER_PLACED:
          return [
            MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
            MEDICINE_ORDER_STATUS.ORDER_BILLED,
            MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY,
            MEDICINE_ORDER_STATUS.DELIVERED,
          ];
        case MEDICINE_ORDER_STATUS.ORDER_INITIATED:
        case MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED:
        case MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS:
          return [
            MEDICINE_ORDER_STATUS.ORDER_PLACED,
            MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
            MEDICINE_ORDER_STATUS.ORDER_BILLED,
            MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY,
            MEDICINE_ORDER_STATUS.DELIVERED,
          ];
      }
    }
  };
  const restStatusToShow = addRestStatusToShow();

  const getOrderState = (status: MEDICINE_ORDER_STATUS) => {
    switch (status) {
      case MEDICINE_ORDER_STATUS.CANCELLED:
        return <div className={classes.orderStatusFailed}>Cancelled</div>;
      case MEDICINE_ORDER_STATUS.PAYMENT_FAILED:
        return <div className={classes.orderStatusFailed}>Payment Failed</div>;
      default:
        return <div className={classes.orderStatus}>Successful</div>;
    }
  };
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  return (
    <div className={classes.orderStatusGroup}>
      {!isLoading && orderDetailsData && (
        <>
          <div className={classes.orderDetails}>
            {orderDetailsData.orderAutoId && (
              <div className={classes.orderDetailsRow}>
                <div className={classes.orderId}>ORDER #{orderDetailsData.orderAutoId}</div>
                {getOrderState(orderDetailsData.currentStatus)}
              </div>
            )}
            {orderDetailsData.patient && (
              <div className={classes.detailsRow}>
                <div className={classes.orderTitle}>Name -</div>
                <div className={classes.discription}>
                  {`${orderDetailsData.patient.firstName} ${orderDetailsData.patient.lastName}`}
                </div>
              </div>
            )}
            <div className={classes.detailsRow}>
              <div className={classes.orderTitle}>Address -</div>
              <div className={classes.discription}>{getPatientAddress(deliveryAddresses)}</div>
            </div>
          </div>
          {!isRejectedStatus(orderDetailsData.currentStatus) && orderDetailsData.orderTat && (
            <div className={classes.expectedDelivery}>
              <span>
                <img src={require('images/notify-symbol.svg')} alt="" />
              </span>
              <span>
                <span>Expected Delivery</span> - {getFormattedDate(orderDetailsData.orderTat)}
              </span>
            </div>
          )}
        </>
      )}
      <div className={classes.cardRoot}>
        {isLoading ? (
          <div className={classes.loader}>
            <CircularProgress />
          </div>
        ) : (
          orderStatusList &&
          orderStatusList.map(
            (statusInfo) =>
              statusInfo && (
                <div id={statusInfo.id} className={classes.cardGroup}>
                  <div
                    className={`${classes.statusCard} ${
                      statusInfo.orderStatus && statusArray.includes(statusInfo.orderStatus)
                        ? classes.orderStatusActive
                        : `${classes.orderStatusActive}${classes.orderStatusCompleted}`
                    }`}
                  >
                    {statusInfo.orderStatus && getStatus(statusInfo.orderStatus)}
                    <div className={classes.statusInfo}>
                      <span>{moment(new Date(statusInfo.statusDate)).format('DD MMM YYYY')}</span>
                      <span>{moment(new Date(statusInfo.statusDate)).format('hh:mm a')}</span>
                    </div>
                  </div>
                  {orderDetailsData && statusInfo.orderStatus === orderDetailsData.currentStatus && (
                    <div className={classes.infoText}>
                      <span>
                        {getOrderDescription(
                          orderDetailsData.currentStatus,
                          statusInfo.statusMessage
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )
          )
        )}
        {!isLoading &&
          restStatusToShow &&
          restStatusToShow.map((status, idx) => (
            <div id={idx.toString()} className={classes.cardGroup}>
              <div
                className={`${classes.statusCard} ${classes.orderStatusActive}${classes.orderStatusCompleted}`}
              >
                {getStatus(status)}
              </div>
            </div>
          ))}
      </div>
      {orderDetailsData && orderDetailsData.currentStatus === MEDICINE_ORDER_STATUS.DELIVERED && (
        <div className={classes.bottomNotification}>
          <div className={classes.reorderBtn}>
            <ReOrder
              orderDetailsData={orderDetailsData}
              type="Order Details"
              patientName={
                orderDetailsData.patient && orderDetailsData.patient.firstName
                  ? orderDetailsData.patient.firstName
                  : ''
              }
            />
          </div>
          <p>
            Your order no.#{orderDetailsData && orderDetailsData.orderAutoId} is successfully
            delivered on {getDeliveredDateTime(orderStatusList)}.
          </p>
          <h4>Thank You for choosing Apollo 24|7</h4>
          <AphButton color="primary" onClick={() => setIsPopoverOpen(true)}>
            Rate your delivery experience
          </AphButton>
        </div>
      )}
      <Popover
        open={isPopoverOpen}
        anchorEl={mascotRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <div className={classes.feedbackPopoverWindow}>
          <div className={classes.windowWrap}>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic-mascot.png')} alt="" />
            </div>
            <OrderFeedback
              setIsPopoverOpen={setIsPopoverOpen}
              orderDetailsData={orderDetailsData}
            />
          </div>
        </div>
      </Popover>
    </div>
  );
};
