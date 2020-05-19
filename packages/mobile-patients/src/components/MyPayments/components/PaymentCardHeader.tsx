/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */
import React, { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { colors } from '../../../theme/colors';
import { LocalStrings } from '@aph/mobile-patients/src/strings/LocalStrings';
import PaymentStatusConstants from '../constants';

interface PaymentCardHeaderProps {
  status: string;
}
const PaymentCardHeader: FC<PaymentCardHeaderProps> = (props) => {
  const getPaymentStatusText = (type: string) => {
    const { refundInitiated } = LocalStrings;
    const { REFUND } = PaymentStatusConstants;
    switch (type) {
      case REFUND:
        return (
          <View style={styles.mainContainer}>
            <Text
              style={{
                ...theme.viewStyles.text('SB', 13, colors.ASTRONAUT_BLUE, 1, 20),
              }}
            >
              {refundInitiated}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };
  const { status } = props;
  return getPaymentStatusText(status);
};

const styles = StyleSheet.create({
  mainContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 19,
  },
});

export default PaymentCardHeader;
