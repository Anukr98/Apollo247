/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */

import React, { FC } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { getDate } from '@aph/mobile-patients/src/utils/dateUtil';
import { textComponent } from './GenericText';

interface DetailsCardProps {
  item: any;
  paymentFor: string;
}

const windowWidth = Dimensions.get('window').width;

const DetailsCard: FC<DetailsCardProps> = (props) => {
  const PaymentModes: any = {
    DEBIT_CARD: 'Debit Card',
    CREDIT_CARD: 'Credit Card',
    NET_BANKING: 'Net Banking',
    PAYTM_WALLET: 'Paytm Wallet',
    EMI: 'EMI',
    UPI: 'UPI',
    PAYTM_POSTPAID: 'Paytm Postpaid',
    COD: 'COD',
  };
  const { paymentFor, item } = props;
  const getLowerHeadersText = () => {
    let status = 'TXN_PENDING';
    let leftHeaderText = 'Doctor Name';
    let rightHeaderText = 'Mode of Consult';
    let doctorNameOrTime = '';
    let modeOfConsultOrPmt = '';
    if (paymentFor === 'pharmacy') {
      const { orderDateTime, medicineOrderPayments, currentStatus } = item;
      const {
        paymentType,
        paymentMode,
        paymentStatus,
        medicineOrderRefunds,
      } = medicineOrderPayments[0];
      if (!medicineOrderPayments.length) {
        status = 'PENDING';
      } else {
        status =
          currentStatus === 'CANCELLED' && medicineOrderRefunds.length
            ? 'TXN_REFUND'
            : paymentStatus;
        modeOfConsultOrPmt = !paymentMode ? paymentType : PaymentModes[paymentMode];
      }
      doctorNameOrTime = getDate(orderDateTime);
      rightHeaderText = 'Mode of Payment';
      if (status === 'TXN_REFUND') {
        doctorNameOrTime = getDate(medicineOrderRefunds[0].createdDate);
        leftHeaderText = 'Date of Refund';
      } else {
        leftHeaderText = 'Order Date & Time';
      }
    }
    if (item.doctor) {
      const { doctor, appointmentType } = item;
      const { name } = doctor;
      const type = appointmentType === 'ONLINE' ? 'Online' : 'Clinic Visit';
      doctorNameOrTime = name;
      modeOfConsultOrPmt = type;
    }
    return {
      leftHeaderText: leftHeaderText,
      rightHeaderText: rightHeaderText,
      doctorNameOrTime: doctorNameOrTime,
      modeOfConsultOrPmt: modeOfConsultOrPmt,
    };
  };

  const getUpperHeaderText = () => {
    if (paymentFor === 'consult') {
      let statusType = 'PENDING';
      const { appointmentDateTime, appointmentPayments, appointmentRefunds, PaymentOrders } = item;
      const { refund } = PaymentOrders;
      const refundInfo = refund?.length ? refund : appointmentRefunds;
      const paymentInfo = Object.keys(PaymentOrders).length
        ? PaymentOrders
        : appointmentPayments[0];
      if (!paymentInfo) {
        statusType = 'PENDING';
      } else {
        statusType = paymentInfo?.paymentStatus;
      }
      if (refundInfo.length) {
        return (
          <View style={styles.upperContainerRefundStyle}>
            <View>
              <View style={styles.headerTextStyle}>
                {textComponent(
                  'Date & Time of Appointment',
                  undefined,
                  theme.colors.ASTRONAUT_BLUE,
                  false
                )}
              </View>
              <View style={styles.subTextStyle}>
                {textComponent(
                  getDate(appointmentDateTime),
                  undefined,
                  theme.colors.SHADE_CYAN_BLUE,
                  false
                )}
              </View>
            </View>
            <View>
              <View style={styles.cancelledTextStyle}>
                <Text
                  style={{ ...theme.viewStyles.text('M', 12, colors.FAILURE_TEXT, 1, 20, 0.04) }}
                >
                  Cancelled
                </Text>
              </View>
              <View style={styles.subTextStyle}></View>
            </View>
          </View>
        );
      } else {
        return (
          <View style={styles.upperContainerStyle}>
            <View style={styles.headerTextStyle}>
              {textComponent(
                'Date & Time of Appointment',
                undefined,
                theme.colors.ASTRONAUT_BLUE,
                false
              )}
            </View>
            <View style={styles.subTextStyle}>
              {textComponent(
                getDate(appointmentDateTime),
                undefined,
                theme.colors.SHADE_CYAN_BLUE,
                false
              )}
            </View>
          </View>
        );
      }
    }
    if (paymentFor === 'pharmacy') {
      let statusType = '';
      const { medicineOrderPayments, currentStatus } = item;
      const { medicineOrderRefunds } = medicineOrderPayments[0];
      if (!medicineOrderPayments.length) {
        statusType = 'PENDING';
      } else if (currentStatus === 'CANCELLED' && medicineOrderRefunds.length) {
        statusType = 'TXN_REFUND';
      } else {
        statusType = medicineOrderPayments[0].paymentStatus;
      }
      if (statusType === 'TXN_REFUND') {
        return (
          <View style={styles.upperContainerStyle}>
            <View style={styles.cancelledTextStyle}>
              <Text style={{ ...theme.viewStyles.text('M', 12, colors.FAILURE_TEXT, 1, 20, 0.04) }}>
                Cancelled
              </Text>
            </View>
          </View>
        );
      }
    }
  };

  const lowerView = () => {
    const {
      leftHeaderText,
      rightHeaderText,
      doctorNameOrTime,
      modeOfConsultOrPmt,
    } = getLowerHeadersText();
    return (
      <View style={styles.lowerContainerStyle}>
        <View>
          <View style={styles.headerTextStyle}>
            {textComponent(leftHeaderText, undefined, theme.colors.ASTRONAUT_BLUE, false)}
          </View>
          <View style={styles.subTextStyle}>
            {textComponent(doctorNameOrTime, undefined, theme.colors.SHADE_CYAN_BLUE, false)}
          </View>
        </View>
        <View>
          <View style={styles.headerTextStyle}>
            {textComponent(rightHeaderText, undefined, theme.colors.ASTRONAUT_BLUE, false)}
          </View>
          <View style={styles.subTextStyle}>
            {textComponent(modeOfConsultOrPmt, undefined, theme.colors.SHADE_CYAN_BLUE, false)}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.appointmentCardStyle}>
      {getUpperHeaderText()}
      {lowerView()}
    </View>
  );
};

const styles = StyleSheet.create({
  lowerContainerStyle: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  upperContainerStyle: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
    marginBottom: 20,
  },
  upperContainerRefundStyle: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 20,
  },
  statusIconStyles: {
    width: 45,
    height: 45,
  },
  appointmentCardStyle: {
    paddingVertical: 22,
    paddingHorizontal: 28,
    marginVertical: 0.03 * windowWidth,
    marginHorizontal: 0.06 * windowWidth,
    backgroundColor: '#fff',
    display: 'flex',
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTextStyle: {
    flex: 0.4,
    justifyContent: 'center',
  },
  subTextStyle: {
    flex: 0.6,
    justifyContent: 'flex-start',
    marginTop: 5,
  },
  cancelledTextStyle: {
    justifyContent: 'center',
  },
});

export default DetailsCard;
