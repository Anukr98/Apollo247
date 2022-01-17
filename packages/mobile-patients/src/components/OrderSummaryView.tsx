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
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails,
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderLineItems,
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,
} from '@aph/mobile-patients/src/graphql/types/getMedicineOrderOMSDetails';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { CircleLogo, DiscountIcon, OneApollo } from '@aph/mobile-patients/src/components/ui/Icons';
import { PaymentModes } from '@aph/mobile-patients/src/strings/strings.json';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';
import { getMedicineDetailsApi } from '@aph/mobile-patients/src/helpers/apiCalls';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

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
    ...theme.fonts.IBMPlexSansMedium(12),
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
  redeemText: {
    ...theme.fonts.IBMPlexSansRegular(10),
    color: theme.colors.SKY_BLUE,
    lineHeight: 15,
    marginLeft: 3,
  },
  cashBackView: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 10,
    borderRadius: 5,
    marginBottom: 16,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderColor: '#00B38E',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  cashBackInnerView: { flexDirection: 'row', alignItems: 'center' },
  circleIcon: { height: 25, width: 40, resizeMode: 'center' },
  cashBackText: {
    ...theme.viewStyles.text('R', 13, '#01475b'),
    marginHorizontal: 5,
  },
  highlightedCashBackText: {
    ...theme.viewStyles.text('SB', 13, '#00B38E'),
    marginHorizontal: 5,
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
  addressData,
  onBillChangesClick,
}) => {
  const medicineOrderLineItems = orderDetails.medicineOrderLineItems || [];
  const medicineOrderShipments = orderDetails.medicineOrderShipments || [];
  const medicineOrderStatus = orderDetails.medicineOrdersStatus || [];
  const deliveredOrder = medicineOrderStatus.find(
    (item) => item!.orderStatus == MEDICINE_ORDER_STATUS.DELIVERED
  );
  const statusToShowNewItems = [
    MEDICINE_ORDER_STATUS.ORDER_PLACED,
    MEDICINE_ORDER_STATUS.VERIFICATION_DONE,
    MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
  ];
  const [shipmentItems, setShipmentItems] = useState([]);

  const orderInvoice = g(
    orderDetails,
    'medicineOrderShipments',
    '0' as any,
    'medicineOrderInvoice'
  );
  const itemsFromMedicineShipment = orderInvoice?.length
    ? g(orderDetails, 'medicineOrderShipments', '0' as any, 'itemDetails')
    : '';

  const item_details_from_shipments = itemsFromMedicineShipment!
    ? JSON.parse(itemsFromMedicineShipment!)
    : null;

  const isCartItemsUpdated =
    statusToShowNewItems.includes(orderDetails?.currentStatus!) &&
    orderDetails.orderType == MEDICINE_ORDER_TYPE.CART_ORDER &&
    orderDetails.orderTat! &&
    item_details_from_shipments!
      ? true
      : false;
  const item_details = g(
    orderDetails,
    'medicineOrderShipments',
    '0' as any,
    'medicineOrderInvoice',
    '0' as any,
    'itemDetails'
  );
  const [itemDetails, setItemDetails] = useState(item_details ? JSON.parse(item_details) : []);

  useEffect(() => {
    if (itemDetails?.length) {
      Promise.all(itemDetails?.map((item) => getMedicineDetailsApi(item?.itemId)))
        .then((result) => {
          const shipmentDetails = result?.map(({ data: { productdp } }, index) => {
            const medicineDetails = (productdp && productdp[0]) || {};
            const mou = medicineDetails?.mou || itemDetails?.[index]?.mou;
            const qty = (itemDetails?.[index]?.issuedQty * itemDetails?.[index]?.mou) / mou;
            return {
              itemId: medicineDetails?.sku || itemDetails?.[index]?.itemId,
              medicineName: medicineDetails?.name || itemDetails?.[index]?.itemName,
              quantity: Math.round(qty),
              mrp: (itemDetails?.[index]?.mrp * mou) / itemDetails?.[index]?.mou,
              total: itemDetails?.[index]?.mrp * itemDetails?.[index]?.issuedQty || 0,
            };
          });
          setShipmentItems(shipmentDetails);
        })
        .catch((e) => {
          CommonBugFender('OrderSummaryView_getMedicineDetailsApi', e);
        });
    }
  }, [itemDetails]);

  const billDetails = g(
    orderDetails,
    'medicineOrderShipments',
    '0' as any,
    'medicineOrderInvoice',
    '0' as any,
    'billDetails'
  );
  const billingDetails = billDetails ? JSON.parse(billDetails) : null;
  const orderBilledAndPacked = medicineOrderStatus.find(
    (item) =>
      item!.orderStatus == MEDICINE_ORDER_STATUS.READY_AT_STORE ||
      item!.orderStatus == MEDICINE_ORDER_STATUS.ORDER_BILLED ||
      item!.orderStatus == MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY ||
      item!.orderStatus == MEDICINE_ORDER_STATUS.DELIVERED
  );

  let item_quantity: string;
  if (isCartItemsUpdated && !orderBilledAndPacked && medicineOrderShipments.length > 0) {
    item_quantity =
      item_details_from_shipments?.length +
      (item_details_from_shipments?.length > 1 ? ' item(s) ' : ' items ');
  } else if (!orderBilledAndPacked && medicineOrderLineItems?.length == 1) {
    item_quantity = medicineOrderLineItems?.length + ' item ';
  } else if (orderBilledAndPacked && itemDetails && itemDetails?.length == 1) {
    item_quantity = itemDetails?.length + ' item ';
  } else {
    item_quantity =
      orderBilledAndPacked && itemDetails
        ? orderBilledAndPacked && itemDetails?.length + ' item(s) '
        : medicineOrderLineItems?.length + ' item(s) ';
  }
  const mrpTotal = medicineOrderLineItems?.reduce(
    (acc, currentVal) => acc + currentVal!.mrp! * currentVal!.quantity!,
    0
  );

  const updatedItemMrpTotal = item_details_from_shipments?.reduce(
    (acc, currentVal) => acc + currentVal!.mrp! * currentVal!.quantity!,
    0
  );

  const billedMrpTotal =
    orderBilledAndPacked &&
    itemDetails &&
    itemDetails?.reduce((acc, currentVal) => acc + currentVal?.mrp * currentVal?.issuedQty, 0);

  const product_discount = orderDetails.productDiscount || 0;
  const coupon_discount = orderDetails.couponDiscount || 0;
  const packaging_charges = orderDetails.packagingCharges;
  const cartItemsUpdatedTotal =
    (packaging_charges || 0) +
    (orderDetails.devliveryCharges || 0) +
    updatedItemMrpTotal -
    coupon_discount -
    product_discount;
  const paymentMethod = g(orderDetails, 'medicineOrderPayments', '0' as any, 'paymentType');
  const paymentMode =
    g(orderDetails, 'medicineOrderPayments', '0' as any, 'paymentMode') || paymentMethod;
  const amountPaid = g(orderDetails, 'medicineOrderPayments', '0' as any, 'amountPaid');
  const healthCreditsRedeemed =
    g(
      orderDetails,
      'medicineOrderPayments',
      '0' as any,
      'healthCreditsRedemptionRequest',
      'RedeemedPoints'
    ) || 0;
  const paymentMethodToDisplay = g(
    orderDetails,
    'medicineOrderPayments',
    '0' as any,
    'paymentMethod'
  );

  const isPrepaid = paymentMethod == MEDICINE_ORDER_PAYMENT_TYPE.CASHLESS;
  const prepaidBilledValue = isPrepaid
    ? orderBilledAndPacked &&
      billingDetails &&
      billingDetails.invoiceValue > orderDetails.estimatedAmount!
      ? billingDetails.invoiceValue - orderDetails.estimatedAmount!
      : billDetails && orderDetails.estimatedAmount! - billingDetails.invoiceValue
    : 0;

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
    const selectedAttribute = isCartItemsUpdated ? item.articleName! : item.medicineName;
    const isTablet = (selectedAttribute || '').includes('TABLET');
    const medicineName = `${selectedAttribute}${
      (isCartItemsUpdated ? item.packSize! : item.mou!) > 1
        ? ` (${isCartItemsUpdated ? item.packSize! : item.mou!}${isTablet ? ' tabs' : ''})`
        : ''
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
            {string.common.Rs} {(item.mrp! * item.quantity! || 0).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const renderOrderBilledMedicineRow = (item: any) => {
    const isTablet = (item?.itemName || '').includes('TABLET');
    const medicineName = `${item?.itemName}${
      item?.mou > 1 ? ` (${item?.mou}${isTablet ? ' tabs' : ''})` : ''
    }`;
    const quantity = Math.ceil(item?.issuedQty);
    const mrp = (item?.mrp * item?.issuedQty || 0).toFixed(2);
    const billedTotal = (mrp * quantity).toFixed(2);
    return (
      <View
        key={item?.itemId!}
        style={{ flexDirection: 'row', paddingLeft: 11, paddingRight: 16, marginBottom: 8 }}
      >
        <View
          style={{
            flex: 0.4,
            alignItems: 'flex-start',
            borderRightColor: 'rgba(2, 71, 91, 0.3)',
          }}
        >
          <Text style={styles.medicineText1}>{item?.medicineName || medicineName}</Text>
          <Text style={styles.medicineText1}>
            (MRP. {string.common.Rs} {item?.mrp?.toFixed(2) || mrp})
          </Text>
        </View>
        <View
          style={{
            flex: 0.3,
            alignItems: 'center',
            borderRightColor: 'rgba(2, 71, 91, 0.3)',
          }}
        >
          <Text style={styles.medicineText1}>{item?.quantity || quantity}</Text>
        </View>
        <View
          style={{
            flex: 0.3,
            alignItems: 'flex-end',
          }}
        >
          <Text style={styles.medicineText1}>
            {string.common.Rs} {item?.total?.toFixed(2) || billedTotal}
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

  const renderCircleSaving = () => {
    return (
      <View style={styles.cashBackView}>
        <View style={styles.cashBackInnerView}>
          <CircleLogo style={styles.circleIcon} />
          <Text style={styles.cashBackText}>
            cashback of{' '}
            <Text style={styles.highlightedCashBackText}>
              {string.common.Rs}
              {convertNumberToDecimal(orderDetails?.totalCashBack!)} earned{' '}
            </Text>
            on your order
          </Text>
        </View>
      </View>
    );
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
  const isNewItemsAdded =
    statusToShowNewItems.includes(orderDetails.currentStatus!) &&
    orderDetails.medicineOrderLineItems!.length > 0 &&
    orderDetails.orderType == MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION;
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
              {string.common.Rs}{' '}
              {orderBilledAndPacked && newOrders && billingDetails
                ? (billingDetails.invoiceValue || 0).toFixed(2)
                : isCartItemsUpdated
                ? (cartItemsUpdatedTotal || 0).toFixed(2)
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
            borderColor:
              isNewItemsAdded || isCartItemsUpdated ? 'rgba(79, 176, 144,0.8)' : 'transparent',
            borderWidth: isNewItemsAdded || isCartItemsUpdated ? 2 : 0,
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
            <View style={{ flexDirection: 'row' }}>
              <Text
                style={{
                  ...theme.viewStyles.text('SB', 13, '#01475b'),
                }}
              >
                {'ITEM DETAILS'}
              </Text>

              {isNewItemsAdded && (
                <Text
                  style={{
                    ...theme.viewStyles.text('SB', 10, 'white'),
                    padding: 2,
                    marginHorizontal: 5,
                    backgroundColor: 'rgba(79, 176, 144,1)',
                  }}
                >
                  NEW
                </Text>
              )}
            </View>
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
              <Text style={styles.medicineText}>{'MRP TOTAL'}</Text>
            </View>
          </View>
          {orderBilledAndPacked && newOrders && itemDetails
            ? shipmentItems?.map((item) => renderOrderBilledMedicineRow(item!))
            : isCartItemsUpdated
            ? item_details_from_shipments?.map((item) => renderMedicineRow(item!))
            : medicineOrderLineItems?.map((item) => renderMedicineRow(item!))}
        </View>

        {orderDetails?.totalCashBack! > 0 && renderCircleSaving()}
        {orderDetails.orderType == MEDICINE_ORDER_TYPE.CART_ORDER ||
        (orderDetails.orderType == MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION &&
          orderBilledAndPacked) ? (
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
                    : isCartItemsUpdated
                    ? updatedItemMrpTotal.toFixed(2)
                    : mrpTotal.toFixed(2)}
                </Text>
              </View>
              {!orderBilledAndPacked && !newOrders && product_discount > 0 ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.paymentLeftText}>{string.OrderSummery.product_discount}</Text>
                  <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                    - {string.common.Rs} {product_discount.toFixed(2)}
                  </Text>
                </View>
              ) : null}
              {orderBilledAndPacked &&
              newOrders &&
              billingDetails &&
              billingDetails.discountValue > 0 ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.paymentLeftText}>
                    {string.OrderSummaryText.discount_total}
                  </Text>
                  <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                    - {string.common.Rs} {billingDetails.discountValue.toFixed(2)}
                  </Text>
                </View>
              ) : null}
              {!orderBilledAndPacked && coupon_discount > 0 ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.paymentLeftText}>{string.OrderSummery.coupon_discount}</Text>
                  <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                    - {string.common.Rs} {coupon_discount.toFixed(2)}
                  </Text>
                </View>
              ) : null}
              {!newOrders && !offlineOrderNumber ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.paymentLeftText}>{string.OrderSummery.delivery_charges}</Text>
                  <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                    + {string.common.Rs} {(orderDetails.devliveryCharges || 0).toFixed(2)}
                  </Text>
                </View>
              ) : null}
              {orderBilledAndPacked && newOrders && billingDetails ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.paymentLeftText}>{string.OrderSummery.delivery_charges}</Text>
                  <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                    + {string.common.Rs} {(billingDetails.deliveryCharges || 0).toFixed(2)}
                  </Text>
                </View>
              ) : null}
              {!offlineOrderNumber && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.paymentLeftText}>
                    {string.OrderSummery.packaging_charges}
                  </Text>
                  <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                    + {string.common.Rs} {(packaging_charges || 0).toFixed(2)}
                  </Text>
                </View>
              )}
              {!!offlineOrderNumber && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.paymentLeftText}>
                    {string.OrderSummaryText.discount_total}
                  </Text>
                  <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                    - {string.common.Rs} {(offlineOrdeDiscount || 0).toFixed(2)}
                  </Text>
                </View>
              )}
              {!!offlineOrderNumber && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.paymentLeftText}>{string.OrderSummery.redeemed_amount}</Text>
                  <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                    - {string.common.Rs} {(offlineOrdeRedeemedAmount || 0).toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={[styles.horizontalline, { marginTop: 4, marginBottom: 7 }]} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.boldTotal]}>{string.OrderSummery.total.toUpperCase()}</Text>
                <Text style={[styles.boldTotal, { textAlign: 'right' }]}>
                  {string.common.Rs}{' '}
                  {orderBilledAndPacked && newOrders && billingDetails
                    ? (billingDetails.invoiceValue || 0).toFixed(2)
                    : isCartItemsUpdated
                    ? (cartItemsUpdatedTotal || 0).toFixed(2)
                    : (orderDetails.estimatedAmount || 0).toFixed(2)}
                </Text>
              </View>
              {!offlineOrderNumber && !billingDetails && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.paymentMethodText}>{string.OrderSummery.paymentMethod}</Text>
                  <Text style={[styles.paymentMethodText, { textAlign: 'right' }]}></Text>
                </View>
              )}
              {!offlineOrderNumber && healthCreditsRedeemed != 0 && !billingDetails && (
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <OneApollo style={{ height: 17, width: 22, marginRight: 4 }} />
                      <Text style={styles.paymentLeftText}>Health Credits</Text>
                    </View>

                    <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                      {string.common.Rs} {(healthCreditsRedeemed || 0).toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.redeemText}>(Will be Redeemed after delivery)</Text>
                </View>
              )}
              {!offlineOrderNumber && amountPaid != 0 && !billingDetails && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.paymentLeftText}>{paymentMethodToDisplay}</Text>
                  <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                    {string.common.Rs}{' '}
                    {isCartItemsUpdated
                      ? (cartItemsUpdatedTotal || 0).toFixed(2)
                      : (amountPaid - healthCreditsRedeemed || 0).toFixed(2)}
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
                      {string.common.Rs} {(orderDetails.estimatedAmount || 0).toFixed(2)}
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
                      {string.common.Rs}{' '}
                      {billingDetails && (billingDetails.invoiceValue || 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.horizontalline, { marginTop: 9, marginBottom: 9 }]} />
                  {billingDetails.invoiceValue > orderDetails.estimatedAmount! ||
                  paymentMethod == MEDICINE_ORDER_PAYMENT_TYPE.COD ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 4,
                      }}
                    >
                      <Text
                        style={
                          billingDetails.invoiceValue > orderDetails.estimatedAmount!
                            ? { ...theme.viewStyles.text('SB', 14, '#01475b', 1, 24, 0) }
                            : { ...theme.viewStyles.text('M', 14, '#01475b', 1, 24, 0) }
                        }
                      >
                        {billingDetails.invoiceValue > orderDetails.estimatedAmount!
                          ? string.OrderSummaryText.amount_to_be_paid_on_delivery
                          : paymentMethod == MEDICINE_ORDER_PAYMENT_TYPE.COD
                          ? string.OrderSummaryText.cod_amount_to_pay
                          : string.OrderSummaryText.refund_amount}
                      </Text>
                      <Text
                        style={[
                          billingDetails.invoiceValue > orderDetails.estimatedAmount!
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
                        {string.common.Rs}{' '}
                        {isPrepaid
                          ? (prepaidBilledValue || 0).toFixed(2)
                          : (billingDetails.invoiceValue || 0).toFixed(2)}
                      </Text>
                    </View>
                  ) : null}
                </>
              ) : null}
            </View>
          </View>
        ) : null}
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
                {`You got an additional discount of ${string.common.Rs} ${billingDiscount.toFixed(
                  2
                )}`}
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
