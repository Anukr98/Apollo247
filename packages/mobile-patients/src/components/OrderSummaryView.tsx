import {
  MEDICINE_ORDER_PAYMENT_TYPE,
  MEDICINE_ORDER_STATUS,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails,
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderLineItems,
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,
} from '@aph/mobile-patients/src/graphql/types/getMedicineOrderOMSDetails';
import { colors } from '@aph/mobile-patients/src/theme/colors';

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
}

export const OrderSummary: React.FC<OrderSummaryViewProps> = ({
  orderDetails,
  isTest,
  addressData,
}) => {
  const medicineOrderLineItems = orderDetails.medicineOrderLineItems || [];
  const medicineOrderStatus = orderDetails.medicineOrdersStatus || [];
  const deliveredOrder = medicineOrderStatus.find(
    (item) => item!.orderStatus == MEDICINE_ORDER_STATUS.DELIVERED
  );
  let item_quantity: string;
  if (medicineOrderLineItems.length == 1) {
    item_quantity = medicineOrderLineItems.length + ' item ';
  } else {
    item_quantity = medicineOrderLineItems.length + ' item(s) ';
  }
  const mrpTotal = medicineOrderLineItems.reduce(
    (acc, currentVal) => acc + currentVal!.mrp! * currentVal!.quantity!,
    0
  );
  const product_discount = orderDetails.productDiscount || 0;
  const coupon_discount = orderDetails.couponDiscount || 0;
  const paymentMethod = g(orderDetails, 'medicineOrderPayments', '0' as any, 'paymentType');
  const paymentMethodToDisplay =
    paymentMethod == MEDICINE_ORDER_PAYMENT_TYPE.COD
      ? 'COD'
      : paymentMethod == MEDICINE_ORDER_PAYMENT_TYPE.CASHLESS
      ? 'Prepaid'
      : 'No Payment';

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
          <Text style={styles.medicineText1}>{item.quantity}</Text>
        </View>
        <View
          style={{
            flex: 0.3,
            alignItems: 'flex-end',
          }}
        >
          <Text style={styles.medicineText1}>
            Rs.{(item.mrp! * item.quantity! || 0).toFixed(2)}
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
  return (
    <View>
      <View style={{ marginHorizontal: 20, marginVertical: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.orderStyles}>{string.OrderSummery.order} # </Text>
            <Text style={styles.orderStyles}>{orderDetails.orderAutoId}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.totalTextStyle}> {string.OrderSummery.total} </Text>
            <Text style={styles.totalPriceStyle}>
              {' '}
              Rs. {(orderDetails.estimatedAmount || 0).toFixed(2)}
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
          <View>
            <Text style={styles.totalTextStyle}>{string.OrderSummery.paymentMethod}</Text>
            <Text style={[styles.orderDate, { textAlign: 'right' }]}>
              {' '}
              {paymentMethodToDisplay}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 25 }}>
          <Text style={styles.shippingText}>{string.OrderSummery.shipping_address}</Text>

          <View style={styles.addressDetailscard}>
            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
              <Text style={styles.shippingDetails}>{string.OrderSummery.name}</Text>
              <Text style={styles.nameStyle}>
                {orderDetails.patient?.firstName} {orderDetails.patient?.lastName}
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.shippingDetails}>{string.OrderSummery.address} </Text>
              <Text style={[styles.nameStyle, { paddingRight: 31, flex: 1 }]}>{addressData}</Text>
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
            style={{ flexDirection: 'row', paddingLeft: 11, paddingRight: 16, marginBottom: 23 }}
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
          {medicineOrderLineItems.map((item) => renderMedicineRow(item!))}
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
                {mrpTotal.toFixed(2)}
              </Text>
            </View>
            {product_discount > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.paymentLeftText}>{string.OrderSummery.product_discount}</Text>
                <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                  - Rs.{product_discount.toFixed(2)}
                </Text>
              </View>
            )}
            {coupon_discount > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.paymentLeftText}>{string.OrderSummery.coupon_discount}</Text>
                <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                  - Rs.{coupon_discount.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.paymentLeftText}>{string.OrderSummery.delivery_charges}</Text>
              <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>
                + Rs.{(orderDetails.devliveryCharges || 0).toFixed(2)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.paymentLeftText}>{string.OrderSummery.packaging_charges}</Text>
              <Text style={[styles.paymentLeftText, { textAlign: 'right' }]}>+ Rs.0.00</Text>
            </View>
            <View style={[styles.horizontalline, { marginTop: 4, marginBottom: 7 }]} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[styles.boldTotal]}>{string.OrderSummery.total.toUpperCase()}</Text>
              <Text style={[styles.boldTotal, { textAlign: 'right' }]}>
                Rs. {(orderDetails.estimatedAmount || 0).toFixed(2)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.paymentMethodText}>{string.OrderSummery.paymentMethod}</Text>
              <Text style={[styles.paymentMethodText, { textAlign: 'right' }]}>
                {paymentMethodToDisplay}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 16 }}>
          <Text style={[styles.DisclaimerTitle]}>Disclaimer: </Text>
          <Text style={styles.DisclaimerDescr}>
            Price may vary when the actual bill is generated.{' '}
          </Text>
        </View>
      </View>
    </View>
  );
};
