import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import moment from 'moment';
import {
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails as OrderDetails,
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus as StatusDetails,
} from 'graphql/types/getMedicineOrderOMSDetails';
import { CircularProgress } from '@material-ui/core';
import { MEDICINE_ORDER_STATUS } from 'graphql/types/globalTypes';
import { getStoreName } from 'helpers/commonHelpers';
import { pharmacyOrderSummaryTracking } from 'webEngageTracking';
import { ReOrder } from './ReOrder';

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
      wordBreak: 'break-word',
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
    },
    itemDelivered: {
      marginLeft: 'auto',
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
    orderValue: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 10,
      fontSize: 14,
      fontWeight: 600,
      opacity: 0.7,
    },
    refundValue: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 10,
      fontSize: 14,
      fontWeight: 600,
    },
    appDownloadBtn: {
      marginTop: 7,
      paddingLeft: 16,
      paddingRight: 16,
      textAlign: 'center',
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 10,
        paddingRight: 10,
      },
      [theme.breakpoints.down(460)]: {
        paddingLeft: 0,
        paddingRight: 0,
      },
      [theme.breakpoints.down(360)]: {
        display: 'none',
      },
      '& a': {
        backgroundColor: '#fcb716',
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        borderRadius: 10,
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        padding: '11px 15px',
        display: 'block',
        textTransform: 'uppercase',
        [theme.breakpoints.down(460)]: {
          padding: '10px 10px',
        },
      },
    },
    additionalDiscount: {
      backgroundColor: '#fff',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      border: 'solid 1.5px #00b38e',
      padding: '5px 16px 5px 10px',
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      marginTop: 16,
      marginLeft: 10,
    },
    disContent: {
      fontSize: 12,
      color: '#00b38e',
      fontWeight: 500,
      paddingLeft: 10,
      '& h3': {
        fontSize: 18,
        fontWeight: 600,
        margin: 0,
      },
    },
    reorderBtn: {
      margin: '17px 0 8px 10px',
      '& button': {
        width: '100%',
      },
    },
    cartBody: {
      padding: 16,
      '& ul': {
        color: '#68919d',
        marginBottom: 20,
        '& li': {
          paddingBottom: 10,
          fontSize: 12,
          fontWeight: 500,
        },
      },
    },
    cartItem: {
      fontSize: 12,
      color: '#02475b',
      fontWeight: 500,
    },
    cartItemSubheading: {
      marginTop: 10,
    },
    continueBtn: {
      marginTop: 35,
      textAlign: 'center',
      '& button': {
        minWidth: 144,
        borderRadius: 10,
      },
    },
    reorderTitle: {
      padding: '15px 20px',
      '& h2': {
        fontSize: 16,
      },
    },
    orderPlaced: {
      fontSize: 10,
      fontWeight: 'normal',
      color: '#01475b',
    },
    priceCol: {
      textAlign: 'right',
    },
  };
});

interface OrdersStorePickupSummaryProps {
  orderDetailsData: OrderDetails | null;
  isLoading: boolean;
}

export const OrdersStorePickupSummary: React.FC<OrdersStorePickupSummaryProps> = (props) => {
  const classes = useStyles({});
  const { orderDetailsData, isLoading } = props;
  const orderStatusList =
    orderDetailsData &&
    orderDetailsData.medicineOrdersStatus &&
    orderDetailsData.medicineOrdersStatus.length > 0
      ? orderDetailsData.medicineOrdersStatus
      : [];
  const orderItems = (orderDetailsData && orderDetailsData.medicineOrderLineItems) || [];

  const mrpTotal =
    orderItems &&
    orderItems.reduce((acc, currentVal) => acc + currentVal!.mrp! * currentVal!.quantity!, 0);
  const deliveryCharges =
    orderDetailsData && orderDetailsData.devliveryCharges ? orderDetailsData.devliveryCharges : 0;
  const discount =
    orderDetailsData && orderDetailsData.estimatedAmount
      ? deliveryCharges + mrpTotal - orderDetailsData.estimatedAmount
      : 0;

  const getFormattedDateTime = (field?: string) => {
    const orderPlacedExist =
      orderStatusList &&
      orderStatusList.find(
        (statusObject) => statusObject.orderStatus === MEDICINE_ORDER_STATUS.PURCHASED_IN_STORE
      );
    if (orderPlacedExist) {
      const statusDate = orderPlacedExist.statusDate;
      return field
        ? moment(statusDate).format('DD-MM-YYYY')
        : moment(statusDate).format('ddd, D MMMM, hh:mm A');
    }
    return null;
  };

  const getFormattedDate = () => {
    const deliveredDateDetails = orderStatusList.find(
      (statusDetails: StatusDetails) =>
        statusDetails.orderStatus === MEDICINE_ORDER_STATUS.PURCHASED_IN_STORE
    );
    if (deliveredDateDetails) {
      const statusDate = deliveredDateDetails.statusDate;
      return moment(statusDate).format('ddd, D MMMM');
    }
  };

  const getStoreAddress = (storeAddress: string) => {
    const store = JSON.parse(storeAddress);
    return store ? store.address : '';
  };

  const getMedicineName = (medicineName: string, mou: number) => {
    const isTablet = (medicineName || '').includes('TABLET');
    return `${medicineName}${mou! > 1 ? ` (${mou}${isTablet ? ' tabs' : ''})` : ''}`;
  };

  useEffect(() => {
    if (orderDetailsData) {
      const { id, orderType, currentStatus, patient } = orderDetailsData;
      const data = {
        orderId: id,
        orderDate: getFormattedDateTime('webengage'),
        orderType,
        customerId: patient ? patient.id : '',
        mobileNumber: patient ? patient.mobileNumber : null,
        orderStatus: currentStatus,
      };
      pharmacyOrderSummaryTracking(data);
    }
  }, []);

  return isLoading ? (
    <div className={classes.loader}>
      <CircularProgress />
    </div>
  ) : orderDetailsData ? (
    <>
      <div className={classes.root}>
        <div className={classes.summaryHeader}>
          <div className={classes.headRow}>
            <div className={classes.leftGroup}>
              <span className={classes.caps}>BILL</span> # <br />
              {orderDetailsData.billNumber}
            </div>
            <div className={classes.rightGroup}>
              Total <b>Rs.{(orderDetailsData.estimatedAmount || 0).toFixed(2)}</b>
            </div>
          </div>
        </div>
        {getFormattedDateTime() && (
          <div className={`${classes.summaryHeader} ${classes.borderNone}`}>
            <div className={classes.headRow}>
              <div className={classes.leftGroup}>
                <label className={classes.orderPlaced}>Order Placed</label>
                <span>{getFormattedDateTime() || ''}</span>
              </div>
            </div>
          </div>
        )}
        <div className={classes.addressHead}>
          <span>Store Address</span>
        </div>
        <div className={classes.addressDetails}>
          <div className={classes.addressRow}>
            <label>Name -</label>
            <span>{getStoreName(orderDetailsData.shopAddress)}</span>
          </div>
          <div className={classes.addressRow}>
            <label>Address -</label>
            <span>{getStoreAddress(orderDetailsData.shopAddress)}</span>
          </div>
        </div>
        <div className={classes.itemsHeader}>
          <span className={classes.caps}>Item Details</span>
          <span className={classes.itemDelivered}>
            {orderDetailsData &&
              orderDetailsData.currentStatus === MEDICINE_ORDER_STATUS.PURCHASED_IN_STORE &&
              `Delivered ${getFormattedDate()}`}
          </span>
        </div>
        <div className={classes.summaryDetails}>
          <div className={classes.detailsTable}>
            <>
              <div className={`${classes.tableRow} ${classes.rowHead}`}>
                <div>ITEM NAME</div>
                <div>QTY</div>
                <div>Charges</div>
              </div>
              {orderItems &&
                orderItems.length > 0 &&
                orderItems.map(
                  (item) =>
                    item && (
                      <div key={item.medicineSKU} className={classes.tableRow}>
                        <div className={classes.medicineName}>
                          {getMedicineName(item.medicineName, item.mou)}
                        </div>
                        <div>{item.quantity.toFixed(2)}</div>
                        <div className={classes.priceCol}>Rs.{item.price}</div>
                      </div>
                    )
                )}
            </>
          </div>
        </div>
        <div className={classes.addressHead}>
          <span>Payment Details</span>
        </div>
        <div className={classes.totalDetails}>
          <>
            <div className={classes.priceRow}>
              <span>MRP Total</span>
              <span>Rs. {mrpTotal.toFixed(2)}</span>
            </div>
            <div className={classes.priceRow}>
              <span>Product Discount</span>
              <span>- Rs. {discount.toFixed(2)}</span>
            </div>
            <div className={classes.priceRow}>
              <span>Redeemed Amount</span>
              <span>- Rs. {(orderDetailsData.redeemedAmount || 0).toFixed(2)}</span>
            </div>
            <div className={`${classes.priceRow} ${classes.totalPaid}`}>
              <span>Total</span>
              <span>Rs.{(orderDetailsData.estimatedAmount || 0).toFixed(2)}</span>
            </div>
          </>
        </div>
      </div>

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
      {/* <div className={classes.bottomActions}>
          <AphButton>Download</AphButton>
          <AphButton>Share</AphButton>
        </div> */}
    </>
  ) : null;
};
