import {
  MEDICINE_ORDER_PAYMENT_TYPE,
  MEDICINE_ORDER_STATUS,
  MEDICINE_DELIVERY_TYPE,
  MEDICINE_ORDER_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails,
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderLineItems,
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,
} from '@aph/mobile-patients/src/graphql/types/getMedicineOrderOMSDetails';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { DiscountIcon } from '@aph/mobile-patients/src/components/ui/Icons';

const styles = StyleSheet.create({
  horizontalline: {
    borderBottomColor: '#02475b',
    opacity: 0.3,
    borderBottomWidth: 0.5,
    height: 1,
  },
  medicineText: {
    ...theme.fonts.IBMPlexSansMedium(11),
    color: '#01475b',
    letterSpacing: 0.28,
  },
  medicineText1: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#01475b',
    letterSpacing: 0,
    // lineHeight: 20,
  },
  orderStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    color: colors.SHERPA_BLUE,
    letterSpacing: 0.5,
  },
  totalTextStyle: {
    ...theme.fonts.IBMPlexSansRegular(13),
    color: colors.SHERPA_BLUE,
    lineHeight: 20,
  },
  totalPriceStyle: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    color: colors.SHERPA_BLUE,
    lineHeight: 20,
  },
  orderDate: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: colors.SHERPA_BLUE,
    lineHeight: 20,
  },
  shippingText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: colors.SHERPA_BLUE,
    letterSpacing: 0.46,
    marginBottom: 9,
  },
  shippingDetails: {
    ...theme.fonts.IBMPlexSansMedium(13),
    color: colors.SHERPA_BLUE,
  },
  addressDetailscard: {
    shadowColor: 'rgba(128, 128, 128, 0.3)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 13,
    marginBottom: 8,
  },
  nameStyle: {
    ...theme.fonts.IBMPlexSansRegular(13),
    color: colors.SHERPA_BLUE,
  },
  paymentCard: {
    shadowColor: 'rgba(128, 128, 128, 0.3)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 8,
  },
  paymentDetailText: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    color: colors.SHERPA_BLUE,
  },
  paymentLeftText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: colors.SHERPA_BLUE,
    lineHeight: 24,
  },
  boldTotal: { ...theme.fonts.IBMPlexSansBold(14), lineHeight: 24, color: colors.SHERPA_BLUE },
  paymentMethodText: {
    ...theme.fonts.IBMPlexSansRegular(12),
    color: colors.SHERPA_BLUE,
    lineHeight: 24,
  },
  DisclaimerDescr: {
    ...theme.fonts.IBMPlexSansMedium(11),
    color: colors.SHERPA_BLUE,
    lineHeight: 14,
    letterSpacing: 0.03,
    opacity: 0.6,
  },
  DisclaimerTitle: {
    ...theme.fonts.IBMPlexSansSemiBold(10),
    color: colors.SHERPA_BLUE,
    lineHeight: 14,
    letterSpacing: 0.03,
  },
});

export interface OrderSummaryViewProps {
  orderDetails: getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails;
  isTest?: boolean;
  addressData?: string;
  onBillChangesClick?: () => void;
}

export const OrderSummary: React.FC<OrderSummaryViewProps> = ({
  orderDetails,
  isTest,
  addressData,
  onBillChangesClick,
}) => {
  const medicineOrderLineItems = orderDetails.medicineOrderLineItems || [];
  const medicineOrderStatus = orderDetails.medicineOrdersStatus || [];
  const deliveredOrder = medicineOrderStatus.find(
    (item) => item!.orderStatus == MEDICINE_ORDER_STATUS.DELIVERED
  );
  const item_details = g(
    orderDetails,
    'medicineOrderShipments',
    '0' as any,
    'medicineOrderInvoice',
    '0' as any,
    'itemDetails'
  );
  const itemDetails = item_details ? JSON.parse(item_details) : null;
  // console.log('itemDetails', itemDetails, JSON.stringify(itemDetails));
  const billDetails = g(
    orderDetails,
    'medicineOrderShipments',
    '0' as any,
    'medicineOrderInvoice',
    '0' as any,
    'billDetails'
  );
  const billingDetails = billDetails ? JSON.parse(billDetails) : null;
  // console.log('biilingDetails', billingDetails, JSON.stringify(billingDetails));
  const orderBilledAndPacked = medicineOrderStatus.find(
    (item) =>
      item!.orderStatus == MEDICINE_ORDER_STATUS.READY_AT_STORE ||
      item!.orderStatus == MEDICINE_ORDER_STATUS.ORDER_BILLED ||
      item!.orderStatus == MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY ||
      item!.orderStatus == MEDICINE_ORDER_STATUS.DELIVERED
  );
  let item_quantity: string;
  if (!orderBilledAndPacked && medicineOrderLineItems.length == 1) {
    item_quantity = medicineOrderLineItems.length + ' item ';
  } else if (orderBilledAndPacked && itemDetails && itemDetails.length == 1) {
    item_quantity = itemDetails.length + ' item ';
  } else {
    item_quantity =
      orderBilledAndPacked && itemDetails
        ? orderBilledAndPacked && itemDetails.length + ' item(s) '
        : medicineOrderLineItems.length + ' item(s) ';
  }
  const mrpTotal = medicineOrderLineItems.reduce(
    (acc, currentVal) => acc + currentVal!.mrp! * currentVal!.quantity!,
    0
  );
  const billedMrpTotal =
    orderBilledAndPacked &&
    itemDetails &&
    itemDetails.reduce((acc, currentVal) => acc + currentVal!.mrp! * currentVal!.issuedQty!, 0);

  const product_discount = orderDetails.productDiscount || 0;
  const coupon_discount = orderDetails.couponDiscount || 0;
  const packaging_charges = orderDetails.packagingCharges;
  const paymentMethod = g(orderDetails, 'medicineOrderPayments', '0' as any, 'paymentType');
  const paymentMethodToDisplay =
    paymentMethod == MEDICINE_ORDER_PAYMENT_TYPE.COD
      ? 'COD'
      : paymentMethod == MEDICINE_ORDER_PAYMENT_TYPE.CASHLESS
      ? 'Prepaid'
      : 'COD';

  const isPrepaid = paymentMethod == MEDICINE_ORDER_PAYMENT_TYPE.CASHLESS;

  const prepaidBilledValue = isPrepaid
    ? orderBilledAndPacked &&
      billingDetails &&
      billingDetails.invoiceValue > orderDetails.estimatedAmount!
      ? billingDetails.invoiceValue - orderDetails.estimatedAmount!
      : billDetails && orderDetails.estimatedAmount! - billingDetails.invoiceValue
    : 0;
  // console.log(
  //   'prepaidBilledValue',
  //   prepaidBilledValue,
  //   Math.round(billingDetails && billingDetails.discountValue),
  //   billingDetails && billingDetails.invoiceValue > billingDetails.prepaidValue
  // );

  const noAdditionalDiscount =
    orderBilledAndPacked &&
    billingDetails &&
    Math.round(billingDetails.invoiceValue) == Math.round(orderDetails.estimatedAmount!);
  const additionalDisount =
    orderBilledAndPacked &&
    noAdditionalDiscount &&
    Math.round(product_discount + coupon_discount) <
      Math.round(billingDetails && billingDetails.discountValue);
  const billingDiscount =
    (additionalDisount &&
      billingDetails &&
      billingDetails.discountValue - product_discount + coupon_discount) ||
    0;

  const prescriptionUpload =
    g(orderDetails, 'orderType') == MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION;

  const newOrders =
    orderDetails.medicineOrderShipments &&
    billingDetails &&
    billingDetails.discountValue != undefined;
  // console.log('prescriptionUpload', prescriptionUpload, billingDiscount);
  // console.log('newOrders', newOrders);
  const getOrderDifferenceAmounts = (
    paymentMethod: MEDICINE_ORDER_PAYMENT_TYPE,
    orderInfo: getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails
  ) => {
    const isCOD = paymentMethod == MEDICINE_ORDER_PAYMENT_TYPE.COD;
    const orderedValue = orderInfo.estimatedAmount;
    const orderedDiscount = (orderInfo.productDiscount || 0) + (orderInfo.couponDiscount || 0);
    const billDetails = g(
      orderInfo,
      'medicineOrderShipments',
      '0' as any,
      'medicineOrderInvoice',
      '0' as any,
      'billDetails'
    );
    const billingDetails = billDetails ? JSON.parse(billDetails) : null;
    // console.log('biilingDetails', billingDetails, JSON.stringify(billingDetails));
    const billedDiscount = billingDetails.discountValue || 0;
    const billedValue = billingDetails.invoiceValue || 0;

    const refundOrExtraAmountToPay =
      orderedValue && billedValue
        ? orderedValue > billedValue
          ? isCOD
            ? billedValue
            : orderedValue - billedValue
          : billedValue > orderedValue
          ? billedValue - orderedValue
          : 0
        : 0;

    const refundOrExtraAmountText =
      orderedValue && billedValue
        ? orderedValue > billedValue
          ? isCOD
            ? 'COD amount to Pay'
            : 'Refund amount'
          : billedValue > orderedValue
          ? 'Amount to be paid on delivery'
          : ''
        : '';

    const extraDiscount = billedDiscount > orderedDiscount ? billedDiscount - orderedDiscount : 0;

    return {
      noChange: !refundOrExtraAmountToPay && !extraDiscount,
      orderedValue,
      billedValue,
      refundOrExtraAmountText,
      refundOrExtraAmountToPay,
      extraDiscount,
    };
  };

  const renderMedicineRow = (
    item: getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderLineItems
  ) => {
    const isTablet = (item.medicineName || '').includes('TABLET');
    const medicineName = `${item.medicineName}${
      item.mou! > 1 ? ` (${item.mou}${isTablet ? ' tabs' : ''})` : ''
    }`;
    return (
      <View
        key={item.medicineSKU!}
        style={{ flexDirection: 'row', paddingLeft: 11, paddingRight: 16, marginBottom: 8 }}
      >
        <View
          style={{
            flex: 0.4,
            alignItems: 'flex-start',
            borderRightColor: 'rgba(2, 71, 91, 0.3)',
          }}
        >
          <Text numberOfLines={2} style={styles.medicineText1}>
            {medicineName}
          </Text>
        </View>
        <View
          style={{
            flex: 0.3,
            alignItems: 'center',
            borderRightColor: 'rgba(2, 71, 91, 0.3)',
          }}
        >
          <Text style={styles.medicineText1}>
            {offlineOrderNumber ? item.price! / item.mrp! / item.quantity! : item.quantity}
          </Text>
        </View>
        <View
          style={{
            flex: 0.3,
            alignItems: 'flex-end',
          }}
        >
          <Text style={styles.medicineText1}>
            Rs. {(item.mrp! * item.quantity! || 0).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const renderOrderBilledMedicineRow = (item: any) => {
    const isTablet = (item.itemName || '').includes('TABLET');
    const medicineName = `${item.itemName}${
      item.mou! > 1 ? ` (${item.mou}${isTablet ? ' tabs' : ''})` : ''
    }`;
    return (
      <View
        key={item.itemId!}
        style={{ flexDirection: 'row', paddingLeft: 11, paddingRight: 16, marginBottom: 8 }}
      >
        <View
          style={{
            flex: 0.4,
            alignItems: 'flex-start',
            borderRightColor: 'rgba(2, 71, 91, 0.3)',
          }}
        >
          <Text numberOfLines={2} style={styles.medicineText1}>
            {medicineName}
          </Text>
        </View>
        <View
          style={{
            flex: 0.3,
            alignItems: 'center',
            borderRightColor: 'rgba(2, 71, 91, 0.3)',
          }}
        >
          <Text style={styles.medicineText1}>{Math.ceil(item.issuedQty)}</Text>
        </View>
        <View
          style={{
            flex: 0.3,
            alignItems: 'flex-end',
          }}
        >
          <Text style={styles.medicineText1}>
            Rs. {(item.mrp! * item.issuedQty! || 0).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const getDeliveredDate = (
    medicineOrderStatus: getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus
  ) => {
    const statusDate = g(medicineOrderStatus, 'statusDate');
    return moment(statusDate).format('ddd, D MMMM');
  };

  const getFormattedDateTime = (
    orderDetails: getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails
  ) => {
    const medicineOrdersStatus = g(orderDetails, 'medicineOrdersStatus') || [];
    const statusDate = g(medicineOrdersStatus[0], 'statusDate');
    return moment(statusDate).format('ddd, D MMMM, hh:mm A');
  };

  const isStorePickup = orderDetails.deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP;
  const userName = `${g(orderDetails, 'patient', 'firstName')} ${g(
    orderDetails,
    'patient',
    'lastName'
  )}`;
  const shopAddress = g(orderDetails, 'shopAddress');
  const shopName = (JSON.parse(shopAddress || '{}') || {}).storename;
  const offlineOrderNumber = g(orderDetails, 'billNumber');
  const offlineOrdeDiscount = (offlineOrderNumber && g(orderDetails, 'productDiscount')) || 0;
  const offlineOrdeRedeemedAmount = (offlineOrderNumber && g(orderDetails, 'redeemedAmount')) || 0;

  return (
    <View>
      <View style={{ marginHorizontal: 20, marginVertical: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.orderStyles}>
              {offlineOrderNumber ? string.OrderSummery.bill : string.OrderSummery.order} #{' '}
            </Text>
            <Text style={styles.orderStyles}>{offlineOrderNumber || orderDetails.orderAutoId}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.totalTextStyle}> {string.OrderSummery.total} </Text>
            <Text style={styles.totalPriceStyle}>
              {' '}
              Rs.{' '}
              {orderBilledAndPacked && newOrders && billingDetails
                ? (billingDetails.invoiceValue || 0).toFixed(2)
                : (orderDetails.estimatedAmount || 0).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.horizontalline]} />
      <View style={{ marginHorizontal: 20, marginTop: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.totalTextStyle}>{string.OrderSummery.orderPlaced}</Text>
            <Text style={styles.orderDate}>{getFormattedDateTime(orderDetails)}</Text>
          </View>
          {!offlineOrderNumber && (
            <View>
              <Text style={styles.totalTextStyle}>{string.OrderSummery.paymentMethod}</Text>
              <Text style={[styles.orderDate, { textAlign: 'right' }]}>
                {' '}
                {paymentMethodToDisplay}
              </Text>
            </View>
          )}
        </View>
        <View style={{ marginTop: 25 }}>
          <Text style={styles.shippingText}>
            {isStorePickup
              ? string.OrderSummery.store_address_heading
              : string.OrderSummery.shipping_address_heading}
          </Text>

          <View style={styles.addressDetailscard}>
            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
              <Text style={styles.shippingDetails}>{string.OrderSummery.name}</Text>
              <Text style={styles.nameStyle}>{(isStorePickup && shopName) || userName}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.shippingDetails}>
                {isStorePickup ? string.OrderSummery.store_address : string.OrderSummery.address}
              </Text>
              <Text style={[styles.nameStyle, { flex: 1 }]}>{addressData}</Text>
            </View>
          </View>
        </View>

        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 10,
            shadowColor: 'rgba(128, 128, 128, 0.3)',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.4,
            shadowRadius: 5,
            elevation: 5,
            marginBottom: 8,
            paddingTop: 13,
            paddingBottom: 29,
          }}
        >
          <View
            style={{
              paddingLeft: 11,
              paddingRight: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 9,
            }}
          >
            <Text
              style={{
                ...theme.viewStyles.text('SB', 13, '#01475b'),
              }}
            >
              {'ITEM DETAILS'}
            </Text>
            {!!deliveredOrder && (
              <Text style={theme.viewStyles.text('M', 13, '#01475b')}>
                {'Delivered ' + getDeliveredDate(deliveredOrder)}
              </Text>
            )}
          </View>
          <View style={styles.horizontalline} />
          <View
            style={{
              paddingLeft: 11,
              paddingRight: 16,
              flexDirection: 'row',
              marginTop: 12,
              marginBottom: 23,
            }}
          >
            <Text style={{ ...theme.viewStyles.text('M', 13, '#01475b') }}>{item_quantity}</Text>
            <Text style={{ ...theme.viewStyles.text('R', 13, '#01475b') }}>
              {'in this shipment'}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              paddingLeft: 11,
              paddingRight: 16,
              marginBottom: 23,
            }}
          >
            <View
              style={{
                flex: 0.4,
                borderWidth: 0,
                borderRightWidth: 0.5,
                borderRightColor: 'rgba(2, 71, 91, 0.3)',
                paddingVertical: 3,
              }}
            >
              <Text style={styles.medicineText}>{'ITEM NAME'}</Text>
            </View>
            <View
              style={{
                flex: 0.3,
                alignItems: 'center',
                borderWidth: 0,
                borderRightColor: 'rgba(2, 71, 91, 0.3)',
                borderRightWidth: 0.5,
                paddingVertical: 3,
              }}
            >
              <Text style={styles.medicineText}>{'QTY'}</Text>
            </View>
            <View
              style={{
                flex: 0.3,
                paddingVertical: 3,
                alignItems: 'flex-end',
              }}
            >
              <Text style={styles.medicineText}>{'MRP VALUE'}</Text>
            </View>
          </View>
          {orderBilledAndPacked && newOrders && itemDetails
            ? itemDetails.map((item) => renderOrderBilledMedicineRow(item!))
            : medicineOrderLineItems.map((item) => renderMedicineRow(item!))}
        </View>

        <View style={styles.paymentCard}>
          <View style={{ paddingHorizontal: 10, paddingTop: 17, paddingBottom: 9 }}>
            <Text style={styles.paymentDetailText}>{string.OrderSummery.paymentDetails}</Text>
          </View>
          <View style={[styles.horizontalline]} />
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 7,
              paddingBottom: 20,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.paymentLeftText}>{string.OrderSummery.mrp_total}</Text>
              <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                {orderBilledAndPacked && newOrders && itemDetails
                  ? billedMrpTotal.toFixed(2)
                  : mrpTotal.toFixed(2)}
              </Text>
            </View>
            {!newOrders && product_discount > 0 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.paymentLeftText}>{string.OrderSummery.product_discount}</Text>
                <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                  - Rs. {product_discount.toFixed(2)}
                </Text>
              </View>
            ) : null}
            {orderBilledAndPacked &&
            newOrders &&
            billingDetails &&
            billingDetails.discountValue > 0 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.paymentLeftText}>{string.OrderSummaryText.discount_total}</Text>
                <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                  - Rs. {billingDetails.discountValue.toFixed(2)}
                </Text>
              </View>
            ) : null}
            {coupon_discount > 0 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.paymentLeftText}>{string.OrderSummery.coupon_discount}</Text>
                <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                  - Rs. {coupon_discount.toFixed(2)}
                </Text>
              </View>
            ) : null}
            {!newOrders && !offlineOrderNumber ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.paymentLeftText}>{string.OrderSummery.delivery_charges}</Text>
                <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                  + Rs. {(orderDetails.devliveryCharges || 0).toFixed(2)}
                </Text>
              </View>
            ) : null}
            {orderBilledAndPacked && newOrders && billingDetails ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.paymentLeftText}>{string.OrderSummery.delivery_charges}</Text>
                <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                  + Rs. {(billingDetails.deliveryCharges || 0).toFixed(2)}
                </Text>
              </View>
            ) : null}
            {!offlineOrderNumber && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.paymentLeftText}>{string.OrderSummery.packaging_charges}</Text>
                <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                  + Rs. {(packaging_charges || 0).toFixed(2)}
                </Text>
              </View>
            )}
            {!!offlineOrderNumber && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.paymentLeftText}>{string.OrderSummaryText.discount_total}</Text>
                <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                  - Rs. {(offlineOrdeDiscount || 0).toFixed(2)}
                </Text>
              </View>
            )}
            {!!offlineOrderNumber && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.paymentLeftText}>{string.OrderSummery.redeemed_amount}</Text>
                <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                  - Rs. {(offlineOrdeRedeemedAmount || 0).toFixed(2)}
                </Text>
              </View>
            )}
            <View style={[styles.horizontalline, { marginTop: 4, marginBottom: 7 }]} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[styles.boldTotal]}>{string.OrderSummery.total.toUpperCase()}</Text>
              <Text style={[styles.boldTotal, { textAlign: 'right' }]}>
                Rs.{' '}
                {orderBilledAndPacked && newOrders && billingDetails
                  ? (billingDetails.invoiceValue || 0).toFixed(2)
                  : (orderDetails.estimatedAmount || 0).toFixed(2)}
              </Text>
            </View>
            {!offlineOrderNumber && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.paymentMethodText}>{string.OrderSummery.paymentMethod}</Text>
                <Text style={[styles.paymentMethodText, { textAlign: 'right' }]}>
                  {paymentMethodToDisplay}
                </Text>
              </View>
            )}
            {orderBilledAndPacked &&
            newOrders &&
            !prescriptionUpload &&
            !noAdditionalDiscount &&
            billingDetails ? (
              <>
                <View style={[styles.horizontalline, { marginTop: 7, marginBottom: 11 }]} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ ...theme.viewStyles.text('SB', 14, '#01475b', 0.7, 24, 0) }}>
                    {string.OrderSummaryText.total_order_billed}
                  </Text>
                  <Text
                    style={[
                      {
                        ...theme.viewStyles.text('SB', 14, '#01475b', 0.7, 24, 0),
                        textAlign: 'right',
                      },
                    ]}
                  >
                    Rs. {(orderDetails.estimatedAmount || 0).toFixed(2)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 4,
                  }}
                >
                  <Text style={{ ...theme.viewStyles.text('SB', 14, '#01475b', 0.7, 24, 0) }}>
                    {string.OrderSummaryText.total_billed_value}
                  </Text>
                  <Text
                    style={[
                      {
                        ...theme.viewStyles.text('SB', 14, '#01475b', 0.7, 24, 0),
                        textAlign: 'right',
                      },
                    ]}
                  >
                    Rs. {billingDetails && (billingDetails.invoiceValue || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.horizontalline, { marginTop: 9, marginBottom: 9 }]} />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 4,
                  }}
                >
                  <Text
                    style={
                      billingDetails && billingDetails.invoiceValue > orderDetails.estimatedAmount!
                        ? { ...theme.viewStyles.text('SB', 14, '#01475b', 1, 24, 0) }
                        : { ...theme.viewStyles.text('M', 14, '#01475b', 1, 24, 0) }
                    }
                  >
                    {billingDetails && billingDetails.invoiceValue > orderDetails.estimatedAmount!
                      ? string.OrderSummaryText.amount_to_be_paid_on_delivery
                      : paymentMethod == MEDICINE_ORDER_PAYMENT_TYPE.COD
                      ? string.OrderSummaryText.cod_amount_to_pay
                      : string.OrderSummaryText.refund_amount}
                  </Text>
                  <Text
                    style={[
                      billingDetails && billingDetails.invoiceValue > orderDetails.estimatedAmount!
                        ? {
                            ...theme.viewStyles.text('SB', 14, '#01475b', 1, 24, 0),
                            textAlign: 'right',
                          }
                        : {
                            ...theme.viewStyles.text('M', 14, '#01475b', 1, 24, 0),
                            textAlign: 'right',
                          },
                    ]}
                  >
                    Rs.{' '}
                    {orderBilledAndPacked && billingDetails && isPrepaid
                      ? (prepaidBilledValue || 0).toFixed(2)
                      : ((billingDetails && billingDetails.invoiceValue) || 0).toFixed(2)}
                  </Text>
                </View>
              </>
            ) : null}
          </View>
        </View>
        {additionalDisount && newOrders && !prescriptionUpload ? (
          <View
            style={[
              styles.paymentCard,
              {
                marginTop: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderWidth: 1.5,
                borderColor: '#00b38e',
                flexDirection: 'row',
              },
            ]}
          >
            <DiscountIcon style={{ width: 55, height: 51 }} />
            <View
              style={{
                marginLeft: 14,
                alignSelf: 'center',
                flex: 1,
              }}
            >
              <Text style={{ ...theme.viewStyles.text('B', 18, '#00b38e', 1, undefined, 0) }}>
                {'YAY!'}
              </Text>
              <Text style={{ ...theme.viewStyles.text('M', 12, '#00b38e', 1, undefined, 0) }}>
                {`You got an additional discount of Rs. ${billingDiscount.toFixed(2)}`}
              </Text>
            </View>
          </View>
        ) : null}
        {!orderBilledAndPacked && !offlineOrderNumber ? (
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 16 }}>
            <Text style={[styles.DisclaimerTitle]}>Disclaimer: </Text>
            <Text style={styles.DisclaimerDescr}>
              Price may vary when the actual bill is generated.{' '}
            </Text>
          </View>
        ) : null}
        {orderBilledAndPacked &&
        newOrders &&
        !prescriptionUpload &&
        !noAdditionalDiscount &&
        billingDetails ? (
          <TouchableOpacity
            activeOpacity={1}
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              paddingHorizontal: 16,
              marginTop: 16,
            }}
            onPress={onBillChangesClick}
          >
            <Text style={{ ...theme.viewStyles.text('SB', 13, '#fcb716', 1, 15, 0.04) }}>
              {'Click here '}
            </Text>
            <Text style={{ ...theme.viewStyles.text('R', 13, '#02475b', 1, 15, 0.04) }}>
              {'to see the changes in your bill.'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};
