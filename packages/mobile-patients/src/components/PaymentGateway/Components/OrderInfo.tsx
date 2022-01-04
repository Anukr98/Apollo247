import React from 'react';
import { StyleSheet, Dimensions, Text, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { getDate } from '@aph/mobile-patients/src/utils/dateUtil';

export interface OrderInfoProps {
  orderDateTime: any;
  paymentMode: string;
}

export const OrderInfo: React.FC<OrderInfoProps> = (props) => {
  const { orderDateTime, paymentMode } = props;

  const renderDateandTime = () => {
    return (
      <View style={{ flexDirection: 'row', paddingTop: 12, paddingHorizontal: 12 }}>
        <View>
          <Text style={styles.dateandTime}>Order Date & Time</Text>
          <Text style={styles.date}>{getDate(orderDateTime)}</Text>
        </View>
        <View style={{ marginLeft: 50 }}>
          <Text style={styles.dateandTime}>Mode of Payment</Text>
          <Text style={styles.date}>{paymentMode}</Text>
        </View>
      </View>
    );
  };
  const renderOrderInfo = () => {
    return (
      <View>
        <Text style={styles.orderDetails}> Order Details</Text>
        {renderDateandTime()}
      </View>
    );
  };
  return <View style={styles.container}>{renderOrderInfo()}</View>;
};
const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#D4D4D4',
    marginHorizontal: 16,
  },
  orderDetails: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 20,
    color: '#02475B',
    paddingBottom: 10,
    borderBottomWidth: 0.8,
    borderBottomColor: '#d8d9d4',
    paddingHorizontal: 12,
  },
  dateandTime: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    color: '#01475B',
  },
  date: {
    marginTop: 9,
    ...theme.fonts.IBMPlexSansMedium(13),
    lineHeight: 17,
    letterSpacing: 0.0026,
    color: '#6D7278',
  },
});
