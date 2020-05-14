/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */
import React, { FC, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NavigationScreenProps } from 'react-navigation';
import { colors } from '../../../theme/colors';
import { getDate } from '@aph/mobile-patients/src/utils/dateUtil';
import CardFooterButton from './CardFooterButton';

interface PaymentCardFooterProps {
  item: any;
  paymentFor: string;
}
const PaymentCardFooter: FC<PaymentCardFooterProps> = (props) => {
  useEffect(() => {}, []);
  const statusItemValues = () => {
    const { paymentFor, item } = props;
    let leftHeaderText = '';
    let dateAndTime = '';
    let type = '';
    let status = 'PENDING';
    if (paymentFor === 'consult') {
      const { appointmentDateTime, appointmentPayments, doctor, appointmentType } = item;
      leftHeaderText = doctor.name;
      type = appointmentType === 'ONLINE' ? 'Online' : 'Clinic Visit';
      if (!appointmentPayments.length) {
        status = 'PENDING';
      } else {
        status = appointmentPayments[0].paymentStatus;
      }
      return {
        leftHeaderText: leftHeaderText,
        dateAndTime: appointmentDateTime,
        type: type,
        status: status,
      };
    } else {
      const { medicineOrderPayments, orderAutoId } = item;
      if (!medicineOrderPayments.length) {
        type = '';
        status = 'PENDING';
      } else {
        type = medicineOrderPayments[0].paymentType;
        dateAndTime = medicineOrderPayments[0].paymentDateTime;
        status = medicineOrderPayments[0].paymentStatus;
      }
      return {
        leftHeaderText: 'Order No. - ' + orderAutoId,
        dateAndTime: dateAndTime,
        type: type,
        status: status,
      };
    }
  };
  const upperSection = () => {
    const { leftHeaderText, status } = statusItemValues();
    const showStatus = status === 'TXN_REFUND' ? 'Cancelled' : null;
    return (
      <View style={styles.contentViewStyles}>
        <View>
          <Text style={{ ...theme.viewStyles.text('M', 16, colors.CARD_HEADER, 1, 20, 0) }}>
            {leftHeaderText}
          </Text>
        </View>
        <View>
          <Text style={{ ...theme.viewStyles.text('M', 12, colors.FAILURE_TEXT, 1, 20, 0.04) }}>
            {showStatus}
          </Text>
        </View>
      </View>
    );
  };
  const lowerSection = () => {
    const { dateAndTime, type } = statusItemValues();
    return (
      <View style={styles.lowerView}>
        <View>
          <Text style={{ ...theme.viewStyles.text('M', 12, colors.CARD_HEADER, 0.6, 20, 0.04) }}>
            {dateAndTime}
          </Text>
        </View>
        <View>
          <Text style={{ ...theme.viewStyles.text('M', 12, colors.CARD_HEADER, 0.6, 20, 0.04) }}>
            {type}
          </Text>
        </View>
      </View>
    );
  };
  //TODO:CTA Pending waiting for APIs
  return (
    <View style={styles.mainContainer}>
      {upperSection()}
      {lowerSection()}
      <CardFooterButton
        buttonTitle="Helloooooooooooooooooooooooooo"
        onPressAction={() => {
          Alert.alert('click');
        }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  contentViewStyles: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lowerView: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },
});

export default PaymentCardFooter;
