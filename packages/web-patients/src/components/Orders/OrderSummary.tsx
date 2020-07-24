import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import moment from 'moment';
import {
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails as OrderDetails,
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderPayments as Payments,
} from 'graphql/types/getMedicineOrderOMSDetails';
import { CircularProgress } from '@material-ui/core';
import { AphButton, AphDialog, AphDialogClose, AphDialogTitle } from '@aph/web-ui-components';
import {
  MEDICINE_ORDER_PAYMENT_TYPE,
  MEDICINE_ORDER_STATUS,
  MEDICINE_ORDER_TYPE,
} from 'graphql/types/globalTypes';
import { useApolloClient } from 'react-apollo-hooks';
import { useShoppingCart } from 'components/MedicinesCartProvider';
import {
  GetPatientAddressList,
  GetPatientAddressListVariables,
  GetPatientAddressList_getPatientAddressList_addressList as AddressDetails,
} from 'graphql/types/GetPatientAddressList';
import { GET_PATIENT_ADDRESSES_LIST } from 'graphql/address';
import { deliveredOrderDetails } from './OrderStatusCard';
import { ORDER_BILLING_STATUS_STRINGS } from 'helpers/commonHelpers';
import { pharmacyOrderSummaryTracking } from 'webEngageTracking';

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
      marginBottom: 8,
      marginLeft: 10,
      '& button': {
        width: '100%',
      }
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
        }
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
      }
    },
    reorderTitle: {
      padding: '15px 20px',
      '& h2': {
        fontSize: 16,
      },
    },
  };
});

interface OrdersSummaryProps {
  orderDetailsData: OrderDetails | null;
  isShipmentListHasBilledState: () => boolean;
  isLoading: boolean;
}

interface ItemObject {
  itemId: string;
  itemName: string;
  batchId: string;
  issuedQty: number;
  mou: number;
  mrp: number;
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
  const shipmentInvoiceDetails =
    orderDetailsData &&
      orderDetailsData.medicineOrderShipments &&
      orderDetailsData.medicineOrderShipments.length > 0
      ? orderDetailsData.medicineOrderShipments[0].medicineOrderInvoice
      : [];

  const mrpTotal =
    orderItems &&
    orderItems.reduce((acc, currentVal) => acc + currentVal!.mrp! * currentVal!.quantity!, 0);
  const deliveryCharges =
    orderDetailsData && orderDetailsData.devliveryCharges ? orderDetailsData.devliveryCharges : 0;
  const discount =
    orderDetailsData && orderDetailsData.estimatedAmount
      ? deliveryCharges + mrpTotal - orderDetailsData.estimatedAmount
      : 0;

  const getShipmentDetails = (itemDetails: string) => {
    return JSON.parse(itemDetails);
  };

  const getFormattedDateTime = (field?: string) => {
    const orderPlacedExist =
      orderStatusList &&
      orderStatusList.find(
        (statusObject) => statusObject.orderStatus === MEDICINE_ORDER_STATUS.ORDER_PLACED
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
        ? `${selectedAddress.addressLine1 ? `${selectedAddress.addressLine1}, ` : ''}${
        selectedAddress.addressLine2 ? `${selectedAddress.addressLine2}, ` : ''
        }${selectedAddress.city ? `${selectedAddress.city}, ` : ''}${
        selectedAddress.state ? `${selectedAddress.state}, ` : ''
        }${selectedAddress.zipcode || ''}`
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

  const billedPaymentDetails =
    shipmentInvoiceDetails && shipmentInvoiceDetails[0] && shipmentInvoiceDetails[0].billDetails
      ? getShipmentDetails(shipmentInvoiceDetails[0].billDetails)
      : null;
  const billedItemDetails =
    shipmentInvoiceDetails && shipmentInvoiceDetails[0] && shipmentInvoiceDetails[0].itemDetails
      ? getShipmentDetails(shipmentInvoiceDetails[0].itemDetails)
      : [];

  const billedMRPValue = billedItemDetails
    ? billedItemDetails.reduce(
      (sum: number, itemDetails: ItemObject) => sum + itemDetails.mrp * itemDetails.issuedQty,
      0
    )
    : 0;

  // check for supporting old orders
  const isOrderBilled =
    props.isShipmentListHasBilledState() &&
    shipmentInvoiceDetails &&
    shipmentInvoiceDetails.length > 0 &&
    billedPaymentDetails &&
    (billedPaymentDetails.discountValue ||
      billedPaymentDetails.deliveryCharges ||
      billedPaymentDetails.cashValue ||
      billedPaymentDetails.prepaidValue);

  let item_quantity: string;

  if (!isOrderBilled && orderItems.length == 1) {
    item_quantity = orderItems.length + ' item ';
  } else if (isOrderBilled && billedItemDetails && billedItemDetails.length == 1) {
    item_quantity = billedItemDetails.length + ' item ';
  } else {
    item_quantity =
      isOrderBilled && billedItemDetails
        ? billedItemDetails.length + ' item(s) '
        : orderItems.length + ' item(s) ';
  }

  const getItemName = (itemObj: ItemObject, index: number) => {
    const isRepeatedItem = billedItemDetails.find(
      (item: ItemObject, idx: number) => index !== idx && item.itemId === itemObj.itemId
    );
    return isRepeatedItem ? `${itemObj.itemName}-batch:<${itemObj.batchId}>` : itemObj.itemName;
  };

  const isPrescriptionUploadOrder =
    orderDetailsData && orderDetailsData.orderType === MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION;

  const noDiscountFound =
    orderDetailsData &&
    billedPaymentDetails &&
    Math.round(billedPaymentDetails.invoiceValue) === Math.round(orderDetailsData.estimatedAmount);

  const additionalDisount =
    isOrderBilled &&
    noDiscountFound &&
    orderDetailsData &&
    Math.round(orderDetailsData.productDiscount + orderDetailsData.couponDiscount) <
    Math.round(billedPaymentDetails && billedPaymentDetails.discountValue);

  useEffect(() => {
    if (orderDetailsData) {
      const {
        id,
        orderTat,
        orderType,
        currentStatus,
        patient: { id: customerId, mobileNumber },
      } = orderDetailsData;
      const data = {
        orderId: id,
        orderDate: getFormattedDateTime('webengage'),
        orderType,
        customerId,
        deliveryDate: moment(orderTat).format('DD-MM-YYYY'),
        mobileNumber,
        orderStatus: currentStatus,
      };
      pharmacyOrderSummaryTracking(data);
    }
  }, []);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
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
            {!isPrescriptionUploadOrder && (
              <div className={classes.rightGroup}>
                Total <b>Rs.{(orderDetailsData.estimatedAmount || 0).toFixed(2)}</b>
              </div>
            )}
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
            <>
              <div className={`${classes.tableRow} ${classes.rowHead}`}>
                <div>ITEM NAME</div>
                <div>QTY</div>
                <div>Charges</div>
              </div>
              {isOrderBilled
                ? billedItemDetails.map(
                  (item: ItemObject, idx: number) =>
                    item && (
                      <div key={item.itemId} className={classes.tableRow}>
                        <div className={classes.medicineName}>{getItemName(item, idx)}</div>
                        <div>{Math.ceil(item.issuedQty).toFixed(1)}</div>
                        <div>Rs.{item.mrp * item.issuedQty}</div>
                      </div>
                    )
                )
                : orderItems &&
                orderItems.length > 0 &&
                orderItems.map(
                  (item) =>
                    item && (
                      <div key={item.medicineSKU} className={classes.tableRow}>
                        <div className={classes.medicineName}>
                          {getMedicineName(item.medicineName, item.mou)}
                        </div>
                        <div>{item.quantity.toFixed(2)}</div>
                        <div>Rs.{item.price}</div>
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
          {isOrderBilled ? (
            <>
              <div className={classes.priceRow}>
                <span>MRP Total</span>
                <span>Rs. {Number(billedMRPValue).toFixed(2)}</span>
              </div>
              <div className={classes.priceRow}>
                <span>Product Discount</span>
                <span>
                  - Rs.{' '}
                  {billedPaymentDetails.discountValue
                    ? billedPaymentDetails.discountValue.toFixed(2)
                    : '0.00'}
                </span>
              </div>
              <div className={classes.priceRow}>
                <span>Delivery Charges</span>
                <span>
                  + Rs.{' '}
                  {billedPaymentDetails.deliveryCharges
                    ? billedPaymentDetails.deliveryCharges.toFixed(2)
                    : '0.00'}
                </span>
              </div>
              <div className={classes.priceRow}>
                <span>Packaging Charges</span>
                <span>+ Rs. 0.00</span>
              </div>
              <div className={`${classes.priceRow} ${classes.totalPaid}`}>
                <span>Total</span>
                <span>
                  Rs.
                  {billedPaymentDetails.invoiceValue
                    ? billedPaymentDetails.invoiceValue.toFixed(2)
                    : '0.00'}
                </span>
              </div>
            </>
          ) : (
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
              </>
            )}

          {orderPayment && (
            <div className={`${classes.priceRow} ${classes.lastRow}`}>
              <span>Payment method</span>
              <span>{paymentMethodToDisplay}</span>
            </div>
          )}
          {!isPrescriptionUploadOrder && isOrderBilled && !noDiscountFound && (
            <>
              <div className={classes.orderValue}>
                <div className={`${classes.priceRow}`}>
                  <span>{ORDER_BILLING_STATUS_STRINGS.TOTAL_ORDER_BILLED}</span>
                  <span>Rs. {(orderDetailsData.estimatedAmount || 0).toFixed(2)}</span>
                </div>
                <div className={`${classes.priceRow}`}>
                  <span>{ORDER_BILLING_STATUS_STRINGS.TOTAL_BILLED_VALUE}</span>
                  <span>Rs. {(billedPaymentDetails.invoiceValue || 0).toFixed(2)} </span>
                </div>
              </div>
              <div className={classes.refundValue}>
                <div className={`${classes.priceRow}`}>
                  <span>
                    {billedPaymentDetails.invoiceValue > orderDetailsData.estimatedAmount
                      ? ORDER_BILLING_STATUS_STRINGS.AMOUNT_TO_BE_PAID_ON_DELIVERY
                      : paymentMethodToDisplay === 'COD'
                        ? ORDER_BILLING_STATUS_STRINGS.COD_AMOUNT_TO_PAY
                        : ORDER_BILLING_STATUS_STRINGS.REFUND_TO_BE_INITIATED}
                  </span>
                  <span>
                    Rs.
                    {paymentMethodToDisplay === 'COD'
                      ? billedPaymentDetails.invoiceValue.toFixed(2)
                      : billedPaymentDetails.invoiceValue > orderDetailsData.estimatedAmount
                        ? (
                          billedPaymentDetails.invoiceValue - orderDetailsData.estimatedAmount
                        ).toFixed(2)
                        : (
                          orderDetailsData.estimatedAmount - billedPaymentDetails.invoiceValue
                        ).toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {!isPrescriptionUploadOrder && additionalDisount && (
        <div className={classes.additionalDiscount}>
          <span>
            <img src={require('images/discount.svg')} alt="" />
          </span>
          <div className={classes.disContent}>
            <h3>YAY!</h3>
            <span>{`You got an additional discount of Rs. ${(
              billedPaymentDetails.discountValue -
              (orderDetailsData.productDiscount + orderDetailsData.couponDiscount)
            ).toFixed(2)}`}</span>
          </div>
        </div>
      )}
      {!props.isShipmentListHasBilledState() && (
        <div className={classes.disclaimerText}>
          <b>Disclaimer:</b> <span>Price may vary when the actual bill is generated.</span>
        </div>
      )}
      <div className={classes.reorderBtn}>
        <AphButton color="primary" onClick={() => setIsDialogOpen(true)}>
          Re-order
          </AphButton>
      </div>
      {/* <div className={classes.bottomActions}>
        <AphButton>Download</AphButton>
        <AphButton>Share</AphButton>
      </div> */}
      <AphDialog open={isDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsDialogOpen(false)} title={'Close'} />
        <AphDialogTitle className={classes.reorderTitle}>Added to Cart</AphDialogTitle>
        <div className={classes.cartBody}>
          <div className={classes.cartItem}>8 out of 10 items have been added to cart.</div>
          <div className={`${classes.cartItem} ${classes.cartItemSubheading}`}>We couldn't add below items:</div>
          <ul>
            <li>Crocin Advance Tab</li>
            <li>3M Particulate Respirator 8210</li>
          </ul>
          <div className={classes.cartItem}>Please continue for purchase.</div>
          <div className={classes.continueBtn}>
            <AphButton color="primary" >
              Continue
              </AphButton>
          </div>
        </div>
      </AphDialog>
    </>
  ) : null;
};
