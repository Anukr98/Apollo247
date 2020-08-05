import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NavigationScreenProps } from 'react-navigation';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

export interface RefundDetailsProps {
  orderAutoId: any;
  orderDate: any;
  refunds: any;
  navigaitonProps: any;
}

export const RefundDetails: React.FC<RefundDetailsProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();

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
            <Text numberOfLines={3} style={styles.refundMsg}>
              Refund of Amount Rs {item} has been processed for your order {props.orderAutoId} on{' '}
              {props.orderDate} and you will receive in your account in 10-14 working days. Track
              Refund status by clicking here.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => {
                  //   props.navigaitonProps.navigate(AppRoutes.PaymentStatusScreen, {
                  //     item: item,
                  //     paymentFor: 'pharmacy',
                  //     status: 'TXN_REFUND',
                  //     patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
                  //   });
                }}
              >
                <Text style={styles.refundStatus}>REFUND STATUS</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
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
});
