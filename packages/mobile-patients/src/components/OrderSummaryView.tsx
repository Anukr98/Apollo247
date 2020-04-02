import { Delivery, Pharamacy } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails,
  GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails_medicineOrderLineItems,
} from '@aph/mobile-patients/src/graphql/types/GetMedicineOrderDetails';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';

const styles = StyleSheet.create({
  horizontalline: {
    borderBottomColor: '#f9b014',
    borderBottomWidth: 1,
    marginHorizontal: 25,
    marginBottom: 10,
  },
  orderName: { ...theme.fonts.IBMPlexSansMedium(12), color: '#01475b' },
  hideText: { opacity: 0.6, paddingLeft: 10 },
  subView: { flexDirection: 'row', marginBottom: 8 },
  medicineText: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: '#01475b',
    marginBottom: 5,
    marginTop: 5,
  },
  medicineView: {
    backgroundColor: '#f0f1ec',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 25,
    marginBottom: 14,
  },
  medicineOrders: {
    //backgroundColor: '#f0f1ec',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 25,
    marginBottom: 14,
    flex: 0.5,
  },
  medicineSubView: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    flex: 0.5,
    alignSelf: 'flex-end',
  },
  commonText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#01475b',
    marginBottom: 5,
    marginTop: 5,
    paddingRight: 60,
  },
  commonTax: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    //flex: 0.5,
    alignSelf: 'flex-end',
    marginHorizontal: 25,
  },
  paid: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#01475b',
    marginRight: 5,
    marginBottom: 5,
    marginTop: 5,
  },
  deliveryText: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: '#0087ba',
    marginHorizontal: 25,
    marginBottom: 14.5,
  },
});

export interface OrderSummaryViewProps {
  orderDetails: GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails;
  isTest?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryViewProps> = ({ orderDetails, isTest }) => {
  const medicineOrderLineItems = orderDetails!.medicineOrderLineItems || [];
  const subtotal = medicineOrderLineItems.reduce(
    (acc, currentVal) => acc + currentVal!.mrp! * currentVal!.quantity!,
    0
  );
  const discount = orderDetails!.devliveryCharges! + subtotal - orderDetails.estimatedAmount!;

  const renderMedicineRow = (
    item: GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails_medicineOrderLineItems
  ) => {
    const isTablet = (item.medicineName || '').includes('TABLET');
    const medicineName = `${item.medicineName}${
      item.mou! > 1 ? ` (${item.mou}${isTablet ? ' tabs' : ''})` : ''
    }`;
    return (
      <View key={item.medicineSKU!} style={styles.medicineOrders}>
        <Text style={[styles.medicineText, { marginLeft: 5, width: 100 }]} numberOfLines={2}>
          {medicineName}
        </Text>
        <View style={styles.medicineSubView}>
          <Text style={styles.medicineText}>{item.quantity}</Text>
          <Text style={[styles.medicineText, { marginRight: 5 }]}>
            Rs.{(item.mrp! * item.quantity! || 0).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const getFormattedDateTime = (
    orderDetails: GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails
  ) => {
    const medicineOrdersStatus = g(orderDetails, 'medicineOrdersStatus') || [];
    const statusDate = g(medicineOrdersStatus[0], 'statusDate');
    return moment(statusDate).format('D MMM YYYY | hh:mm A');
  };

  return (
    <View
      style={{
        ...theme.viewStyles.cardContainer,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        margin: 20,
      }}
    >
      <View style={{ marginLeft: 25, marginBottom: 8, marginTop: 17 }}>
        <Pharamacy />
      </View>
      <View style={styles.horizontalline} />
      <View style={{ marginHorizontal: 25 }}>
        <View style={styles.subView}>
          <Text style={styles.orderName}>Order ID</Text>
          <Text style={[styles.orderName, styles.hideText]}>{orderDetails.orderAutoId}</Text>
        </View>
        <View style={styles.subView}>
          <Text style={styles.orderName}>Date</Text>
          <Text style={[styles.orderName, styles.hideText]}>
            {getFormattedDateTime(orderDetails)}
          </Text>
        </View>
      </View>
      <View style={[styles.horizontalline, { borderBottomColor: '#f0f1ec', marginBottom: 4.5 }]} />

      <View style={styles.medicineView}>
        <Text style={[styles.medicineText, { marginLeft: 5 }]}>{isTest ? 'Test' : 'Medicine'}</Text>
        <View style={styles.medicineSubView}>
          <Text style={styles.medicineText}>Quantity</Text>
          <Text style={[styles.medicineText, { marginRight: 5 }]}>Charges</Text>
        </View>
      </View>

      {medicineOrderLineItems.map((item) => renderMedicineRow(item!))}

      <View style={[styles.horizontalline, { borderBottomColor: '#f0f1ec', marginBottom: 20 }]} />

      <View style={styles.commonTax}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.commonText}>Subtotal</Text>
          <Text style={styles.paid}>Rs.{subtotal.toFixed(2)}</Text>
        </View>
      </View>
      {discount > 0 && (
        <View style={styles.commonTax}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.commonText}>Discount</Text>
            <Text style={styles.paid}>- Rs.{discount.toFixed(2)}</Text>
          </View>
        </View>
      )}
      <View style={styles.commonTax}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.commonText}>Delivery Charges</Text>
          <Text style={styles.paid}>+ Rs.{(orderDetails.devliveryCharges || 0).toFixed(2)}</Text>
        </View>
      </View>

      {/* <View style={styles.commonTax}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.commonText}>Taxes</Text>
          <Text style={styles.paid}>+ Rs.20</Text>
        </View>
      </View> */}
      <View style={[styles.commonTax, { marginBottom: 16 }]}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.commonText}>Total</Text>
          <Text style={[styles.paid, { ...theme.fonts.IBMPlexSansBold(12) }]}>
            Rs. {(orderDetails.estimatedAmount || 0).toFixed(2)}
          </Text>
        </View>
      </View>
      {/* {isTest ? null : (
        <View>
          <View style={{ marginLeft: 25, marginBottom: 8, marginTop: 17 }}>
            <Delivery />
          </View>
          <Text style={styles.deliveryText}>2 Hour Delivery Promise!</Text>
        </View>
      )} */}
      {/* <View style={[styles.horizontalline, { borderBottomColor: '#f0f1ec', marginBottom: 20 }]} /> */}
      <Text
        style={[
          styles.deliveryText,
          { color: '#01475b', opacity: 0.6, marginHorizontal: 25, marginBottom: 25 },
        ]}
      >
        Disclaimer:{' '}
        <Text style={{ fontStyle: 'italic' }}>
          Price may vary when the actual bill is generated.
        </Text>
      </Text>
    </View>
  );
};
