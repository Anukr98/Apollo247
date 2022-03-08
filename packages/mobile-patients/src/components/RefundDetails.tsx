import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderRefunds,
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderPayments,
} from '@aph/mobile-patients/src/graphql/types/getMedicineOrderOMSDetails';

export interface RefundDetailsProps {
  refunds: getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderRefunds[];
  paymentDetails: getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrderPayments[];
  navigaitonProps: any;
}

export const RefundDetails: React.FC<RefundDetailsProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const paymentMode =
    props.paymentDetails && props.paymentDetails.length ? props.paymentDetails[0].paymentMode : '';

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Refund Details</Text>
      {props.refunds.map((item, index) => {
        return (
          <View
            style={{
              ...styles.cardStyle,
              marginBottom: index == props.refunds.length - 1 ? 28 : 8,
            }}
          >
            <Text numberOfLines={4} style={styles.refundMsg}>
              Refund of Amount Rs {item.refundAmount} has been processed for your order on{' '}
              {new Date(item.createdDate).toDateString()} and you will receive in your account in
              10-14 working days. Track Refund status by clicking here.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {
                  props.navigaitonProps.navigate(AppRoutes.RefundStatus, {
                    orderAutoId: item.orderId,
                    refundAmount: item.refundAmount,
                    refundId: item.refundId,
                    initiationDate: item.createdDate,
                    paymentMode: paymentMode,
                  });
                }}
              >
                <Text style={styles.refundStatus}>REFUND STATUS</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.oneApolloTxt}
        onPress={() => props.navigaitonProps.navigate(AppRoutes.OneApolloMembership)}
      >
        <Text style={{ ...theme.viewStyles.text('SB', 12, '#fcb716', 1, 15, 0.04) }}>
          {'Click here '}
        </Text>
        <Text
          numberOfLines={2}
          style={{ ...theme.viewStyles.text('R', 12, '#02475b', 1, 15, 0.04), marginRight: 30 }}
        >
          {'to check your updated OneApollo Health Credits Balance'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(2, 71, 91,0.3)',
  },
  heading: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    color: theme.colors.SHERPA_BLUE,
    marginLeft: 25,
    marginTop: 19,
  },
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 28,
  },
  refundMsg: {
    ...theme.fonts.IBMPlexSansMedium(12),
    marginHorizontal: 11,
    marginTop: 13,
    lineHeight: 17,
    letterSpacing: 0.03,
    color: theme.colors.LIGHT_BLUE,
  },
  refundStatus: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.APP_YELLOW,
    lineHeight: 24,
    marginHorizontal: 11,
    textAlign: 'right',
    marginBottom: 5,
  },
  oneApolloTxt: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
  },
});
