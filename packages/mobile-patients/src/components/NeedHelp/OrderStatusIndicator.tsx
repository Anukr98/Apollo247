import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export interface Props {
  orderStatus: string;
}

export const OrderStatusIndicator: React.FC<Props> = ({ orderStatus }) => {
  return orderStatus.toUpperCase() == 'CLOSED' ? (
    <View style={styles.orderStatusStateContainerClosed}>
      <Text style={styles.orderStatusStateTextClosed}>{orderStatus.toUpperCase()}</Text>
    </View>
  ) : (
    <View style={styles.orderStatusStateContainerActive}>
      <Text style={styles.orderStatusStateTextActive}>{orderStatus.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  orderStatusStateContainerClosed: {
    borderColor: '#4CAF50',
    borderRadius: 2,
    marginHorizontal: 12,
    borderWidth: 1,
    marginTop: 4,
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  orderStatusStateTextClosed: {
    color: '#4CAF50',
    ...theme.fonts.IBMPlexSansSemiBold(10),
  },
  orderStatusStateContainerActive: {
    borderColor: '#FCB716',
    borderRadius: 2,
    marginHorizontal: 12,
    borderWidth: 1,
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginTop: 4,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  orderStatusStateTextActive: {
    color: '#FCB716',
    ...theme.fonts.IBMPlexSansSemiBold(10),
  },
});
