import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import moment from 'moment';
import {
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails as OrderDetails,
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderPayments as Payments,
} from 'graphql/types/getMedicineOrderOMSDetails';
import { CircularProgress } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { MEDICINE_ORDER_PAYMENT_TYPE, MEDICINE_ORDER_STATUS } from 'graphql/types/globalTypes';
import { useApolloClient } from 'react-apollo-hooks';
import { useShoppingCart } from 'components/MedicinesCartProvider';
import {
  GetPatientAddressList,
  GetPatientAddressListVariables,
  GetPatientAddressList_getPatientAddressList_addressList as AddressDetails,
} from 'graphql/types/GetPatientAddressList';
import { GET_PATIENT_ADDRESSES_LIST } from 'graphql/address';
import { deliveredOrderDetails } from './OrderStatusCard';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginLeft: 10,
    },
    summaryHeader: {
      padding: '10px 16px',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
    },
    headRow: {
      display: 'flex',
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      '& label': {
        opacity: 0.6,
        display: 'block',
      },
    },
    leftGroup: {
      fontWeight: 600,
    },
    rightGroup: {
      marginLeft: 'auto',
      textAlign: 'right',
    },
    deliveryPromise: {
      fontSize: 10,
      fontWeight: 500,
      color: '#0087ba',
      borderBottom: 'solid 2px #02475b',
      paddingBottom: 5,
    },
    totalPaid: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#01475b',
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 5,
      marginTop: 5,
    },
    totalPrice: {
      marginLeft: 'auto',
      fontWeight: 'bold',
      textAlign: 'right',
    },
    disclaimerText: {
      fontSize: 10,
      fontWeight: 500,
      color: '#02475b',
      padding: 16,
      display: 'flex',
      '& span': {
        opacity: 0.6,
        paddingLeft: 5,
      },
    },
    summaryDetails: {
      color: '#02475b',
      fontSize: 12,
      fontWeight: 600,
      padding: 16,
    },
    detailsTable: {
      paddingBottom: 0,
    },
    tableRow: {
      display: 'flex',
      alignItems: 'center',
      padding: '4px 0',
      '& >div:nth-child(2)': {
        marginLeft: 'auto',
        minWidth: 40,
        textAlign: 'center',
      },
      '& >div:nth-child(3)': {
        minWidth: 60,
      },
    },
    medicineName: {
      wordBreak: 'break-word',
    },
    rowHead: {
      fontSize: 10,
      fontWeight: 500,
      textTransform: 'uppercase',
      paddingBottom: 10,
    },
    loader: {
      margin: '20px auto',
      textAlign: 'center',
      display: 'block',
    },
    borderNone: {
      borderBottom: 'none',
    },
    caps: {
      textTransform: 'uppercase',
    },
    addressHead: {
      fontSize: 10,
      textTransform: 'uppercase',
      fontWeight: 500,
      padding: '10px 16px',
      color: '#01475b',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
    },
    addressDetails: {
      padding: '10px 16px',
      fontSize: 11,
      lineHeight: '16px',
    },
    addressRow: {
      display: 'flex',
      paddingBottom: 10,
      '& label': {
        fontWeight: 500,
        minWidth: 55,
      },
    },
    itemsHeader: {
      fontSize: 10,
      fontWeight: 500,
      display: 'flex',
      padding: '0 16px 10px 16px',
      color: '#01475b',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      '& span:last-child': {
        marginLeft: 'auto',
      },
    },
    totalItems: {
      paddingBottom: 10,
      fontSize: 10,
      fontWeight: 'normal',
    },
    totalDetails: {
      padding: '10px 16px',
      fontSize: 12,
      fontWeight: 500,
      color: '#01475b',
    },
    priceRow: {
      display: 'flex',
      alignItems: 'center',
      paddingBottom: 5,
      '& span:last-child': {
        marginLeft: 'auto',
        textAlign: 'center',
      },
    },
    lastRow: {
      fontWeight: 'normal',
    },
    bottomActions: {
      textAlign: 'center',
      '& button': {
        minWidth: 154,
        backgroundColor: '#fff',
        borderRadius: 10,
        color: '#fc9916',
        marginTop: 8,
        '&:hover': {
          backgroundColor: '#fff',
          color: '#fc9916',
        },
      },
    },
  };
});

interface OrdersSummaryProps {
  orderDetailsData: OrderDetails | null;
  isLoading: boolean;
}

export const OrdersSummary: React.FC<OrdersSummaryProps> = (props) => {
  const classes = useStyles({});
  const { orderDetailsData, isLoading } = props;
  const { deliveryAddresses, setDeliveryAddresses } = useShoppingCart();
  const client = useApolloClient();
  const orderStatusList =
    orderDetailsData &&
    orderDetailsData.medicineOrdersStatus &&
    orderDetailsData.medicineOrdersStatus.length > 0
      ? orderDetailsData.medicineOrdersStatus
      : [];
  const orderItems = (orderDetailsData && orderDetailsData.medicineOrderLineItems) || [];
  const orderPayment =
    orderDetailsData &&
    orderDetailsData.medicineOrderPayments &&
    orderDetailsData.medicineOrderPayments.length > 0 &&
    orderDetailsData.medicineOrderPayments[0];
  const mrpTotal =
    orderItems &&
    orderItems.reduce((acc, currentVal) => acc + currentVal!.mrp! * currentVal!.quantity!, 0);
  const discount =
    orderDetailsData && orderDetailsData.devliveryCharges && orderDetailsData.estimatedAmount
      ? orderDetailsData.devliveryCharges + mrpTotal - orderDetailsData.estimatedAmount
      : 0;

  let item_quantity: string;
  if (orderItems.length == 1) {
    item_quantity = orderItems.length + ' item ';
  } else {
    item_quantity = orderItems.length + ' item(s) ';
  }

  const getFormattedDateTime = () => {
    const orderPlacedExist =
      orderStatusList &&
      orderStatusList.find(
        (statusObject) => statusObject.orderStatus === MEDICINE_ORDER_STATUS.ORDER_PLACED
      );
    if (orderPlacedExist) {
      const statusDate = orderPlacedExist.statusDate;
      return moment(statusDate).format('ddd, D MMMM, hh:mm A');
    }
    return null;
  };

  const getFormattedDate = () => {
    const deliveredDateDetails = deliveredOrderDetails(orderStatusList);
    if (deliveredDateDetails) {
      const statusDate = deliveredDateDetails.statusDate;
      return moment(statusDate).format('ddd, D MMMM');
    }
  };

  const paymentMethodToDisplay =
    orderPayment &&
    (orderPayment.paymentType == MEDICINE_ORDER_PAYMENT_TYPE.COD
      ? 'COD'
      : orderPayment.paymentType == MEDICINE_ORDER_PAYMENT_TYPE.CASHLESS
      ? 'Prepaid'
      : 'No Payment');

  const getAddressDetails = (deliveryAddressId: string, id: string) => {
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
    if (deliveryAddresses.length > 0 && orderDetailsData && orderDetailsData.patientAddressId) {
      const selectedAddress = deliveryAddresses.find(
        (address: AddressDetails) => address.id == orderDetailsData.patientAddressId
      );
      const addressData = selectedAddress
        ? `${selectedAddress.addressLine1 || ''} ${selectedAddress.addressLine2 || ''}, ${
            selectedAddress.city || ''
          }, ${selectedAddress.state || ''}, ${selectedAddress.zipcode || ''}`
        : '';
      return addressData;
    } else {
      getAddressDetails(orderDetailsData.patientAddressId, orderDetailsData.patient.id);
    }
  };

  const getMedicineName = (medicineName: string, mou: number) => {
    const isTablet = (medicineName || '').includes('TABLET');
    return `${medicineName}${mou! > 1 ? ` (${mou}${isTablet ? ' tabs' : ''})` : ''}`;
  };

  return isLoading ? (
    <div className={classes.loader}>
      <CircularProgress />
    </div>
  ) : orderDetailsData && orderDetailsData.orderAutoId ? (
    <>
      <div className={classes.root}>
        <div className={classes.summaryHeader}>
          <div className={classes.headRow}>
            <div className={classes.leftGroup}>
              <span className={classes.caps}>Order</span> # <br />
              {orderDetailsData.orderAutoId}
            </div>
            <div className={classes.rightGroup}>
              Total <b>Rs.{(orderDetailsData.estimatedAmount || 0).toFixed(2)}</b>
            </div>
          </div>
        </div>
        {(getFormattedDateTime() || orderPayment) && (
          <div className={`${classes.summaryHeader} ${classes.borderNone}`}>
            <div className={classes.headRow}>
              {getFormattedDateTime() && (
                <div className={classes.leftGroup}>
                  <label>Order Placed</label>
                  <span>{getFormattedDateTime() || ''}</span>
                </div>
              )}
              {orderPayment && (
                <div className={getFormattedDateTime() ? classes.rightGroup : classes.leftGroup}>
                  <label>Payment Method</label>
                  <span>{paymentMethodToDisplay}</span>
                </div>
              )}
            </div>
          </div>
        )}
        <div className={classes.addressHead}>
          <span>Shipping Address</span>
        </div>
        <div className={classes.addressDetails}>
          {orderDetailsData.patient && (
            <div className={classes.addressRow}>
              <label>Name -</label>
              <span>{`${orderDetailsData.patient.firstName} ${orderDetailsData.patient.lastName}`}</span>
            </div>
          )}
          <div className={classes.addressRow}>
            <label>Address -</label>
            <span>{getPatientAddress(deliveryAddresses)}</span>
          </div>
        </div>

        <div className={classes.itemsHeader}>
          <span className={classes.caps}>Item Details</span>
          <span>
            {orderDetailsData &&
              orderDetailsData.currentStatus === MEDICINE_ORDER_STATUS.DELIVERED &&
              `Delivered ${getFormattedDate()}`}
          </span>
        </div>
        <div className={classes.summaryDetails}>
          <div className={classes.detailsTable}>
            <div className={classes.totalItems}>
              <b>{item_quantity}</b> in this shipment
            </div>
            {orderItems && orderItems.length > 0 && (
              <>
                <div className={`${classes.tableRow} ${classes.rowHead}`}>
                  <div>ITEM NAME</div>
                  <div>QTY</div>
                  <div>Charges</div>
                </div>
                {orderItems &&
                  orderItems.length > 0 &&
                  orderItems.map(
                    (item, index) =>
                      item && (
                        <div key={index} className={classes.tableRow}>
                          <div className={classes.medicineName}>
                            {getMedicineName(item.medicineName, item.mou)}
                          </div>
                          <div>{item.quantity}</div>
                          <div>Rs.{item.price}</div>
                        </div>
                      )
                  )}
              </>
            )}
          </div>
        </div>
        <div className={classes.addressHead}>
          <span>Payment Details</span>
        </div>
        <div className={classes.totalDetails}>
          <div className={classes.priceRow}>
            <span>MRP Total</span>
            <span>Rs. {mrpTotal.toFixed(2)}</span>
          </div>
          <div className={classes.priceRow}>
            <span>Product Discount</span>
            <span>- Rs. {discount.toFixed(2)}</span>
          </div>
          <div className={classes.priceRow}>
            <span>Delivery Charges</span>
            <span>+ Rs. {(orderDetailsData.devliveryCharges || 0).toFixed(2)}</span>
          </div>
          <div className={classes.priceRow}>
            <span>Packaging Charges</span>
            <span>+ Rs. 0.00</span>
          </div>
          <div className={`${classes.priceRow} ${classes.totalPaid}`}>
            <span>Total</span>
            <span>Rs.{(orderDetailsData.estimatedAmount || 0).toFixed(2)}</span>
          </div>
          {orderPayment && (
            <div className={`${classes.priceRow} ${classes.lastRow}`}>
              <span>Payment method</span>
              <span>{paymentMethodToDisplay}</span>
            </div>
          )}
        </div>
      </div>
      <div className={classes.disclaimerText}>
        <b>Disclaimer:</b> <span>Price may vary when the actual bill is generated.</span>
      </div>
      {/* <div className={classes.bottomActions}>
        <AphButton>Download</AphButton>
        <AphButton>Share</AphButton>
      </div> */}
    </>
  ) : null;
};
