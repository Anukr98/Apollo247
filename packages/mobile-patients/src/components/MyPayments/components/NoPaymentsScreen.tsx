/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */
import React, { FC } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { LocalStrings } from '@aph/mobile-patients/src/strings/LocalStrings';

const NoPaymentsScreen: FC = () => {
  return (
    <View style={styles.mainContainer}>
      <Image
        source={require('@aph/mobile-patients/src/images/mypayments/ic_no_transaction_history.webp')}
        style={styles.imageStyle}
        resizeMode="cover"
      />
      <Text>{LocalStrings.noPayments}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 54,
  },
  imageStyle: {
    width: 34,
    height: 32,
    marginBottom: 17,
  },
});

export default NoPaymentsScreen;
