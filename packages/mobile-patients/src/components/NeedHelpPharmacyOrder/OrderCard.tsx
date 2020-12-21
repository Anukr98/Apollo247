import { isOrderCancelAllowed } from '@aph/mobile-patients/src/components/OrderDetailsScene';
import { MedicineIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  getFormattedTime,
  getOrderTitle,
  MedOrder,
} from '@aph/mobile-patients/src/components/YourOrdersScene';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Divider, ListItem } from 'react-native-elements';

export interface Props {
  orderDetail: MedOrder;
  onPress: () => void;
  onPressHelp: () => void;
  onPressCancel: () => void;
}

export const OrderCard: React.FC<Props> = ({
  orderDetail,
  onPress,
  onPressHelp,
  onPressCancel,
}) => {
  const renderTitle = () => {
    const title = getOrderTitle(orderDetail);
    const orderAutoId = `#${orderDetail?.billNumber || orderDetail?.orderAutoId}`;
    // const patient = `for ${orderDetail?.patient?.firstName}`;
    const orderedOn = `Ordered on: ${getFormattedTime(orderDetail?.createdDate)}`;

    return (
      <View>
        <Text style={styles.orderAutoId}>{orderAutoId}</Text>
        <Text style={styles.orderTitle} numberOfLines={1} ellipsizeMode="middle" onPress={onPress}>
          {title}
        </Text>
        {/* <Text style={styles.listItemTitle}>{patient}</Text> */}
        <Text style={styles.orderedOn}>{orderedOn}</Text>
      </View>
    );
  };

  const renderLinks = () => {
    const disableCancel = isOrderCancelAllowed(orderDetail?.medicineOrdersStatus);
    return (
      <View style={styles.linkContainer}>
        <Text onPress={onPressHelp} style={styles.link}>
          {string.help.toUpperCase()}
        </Text>
        <Divider style={styles.divider} />
        <Text onPress={onPressCancel} style={[disableCancel ? styles.link : styles.disabledLink]}>
          {string.cancel.toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <ListItem
      title={renderTitle()}
      subtitle={renderLinks()}
      pad={16}
      containerStyle={styles.listItemContainer}
      Component={TouchableOpacity}
      leftIcon={<MedicineIcon />}
    />
  );
};

const { card, text } = theme.viewStyles;
const { LIGHT_BLUE, APP_YELLOW } = theme.colors;
const styles = StyleSheet.create({
  listItemContainer: {
    ...card(),
    marginTop: 0,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  orderAutoId: {
    ...text('M', 12, LIGHT_BLUE),
    marginBottom: 5,
  },
  orderTitle: {
    ...text('M', 16, LIGHT_BLUE),
    marginBottom: 5,
  },
  orderedOn: {
    ...text('M', 12, LIGHT_BLUE, 0.5),
    marginBottom: 5,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  link: {
    ...text('M', 13, APP_YELLOW),
  },
  disabledLink: {
    ...text('M', 13, APP_YELLOW, 0.5),
  },
  divider: {
    height: '100%',
    width: 1,
    marginHorizontal: 12,
  },
});
