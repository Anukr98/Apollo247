import { isOrderCancelNotAllowed } from '@aph/mobile-patients/src/components/OrderDetailsScene';
import { MedicineIcon, OrderPlacedIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  getFormattedTime,
  getOrderTitle,
  MedOrder,
} from '@aph/mobile-patients/src/components/YourOrdersScene';
import { MEDICINE_ORDER_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { getOrderStatusText } from '@aph/mobile-patients/src/helpers/helperFunctions';
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
  const status = orderDetail?.currentStatus;
  const isFailedOrCancelled =
    status === MEDICINE_ORDER_STATUS.CANCELLED ||
    status === MEDICINE_ORDER_STATUS.ORDER_FAILED ||
    status === MEDICINE_ORDER_STATUS.PAYMENT_ABORTED ||
    status === MEDICINE_ORDER_STATUS.PAYMENT_FAILED;

  const renderTitle = () => {
    const title = getOrderTitle(orderDetail);
    const orderAutoId = `#${orderDetail?.billNumber || orderDetail?.orderAutoId}`;
    const orderedOn = `Ordered on: ${getFormattedTime(orderDetail?.createdDate)}`;

    return (
      <View>
        <Text style={styles.orderAutoId}>{orderAutoId}</Text>
        <Text onPress={onPress} style={styles.orderTitle} numberOfLines={1} ellipsizeMode="middle">
          {title}
        </Text>
        <Text style={styles.orderedOn}>{orderedOn}</Text>
        {renderStatusBar()}
      </View>
    );
  };

  const renderStatusBar = () => {
    const isDelivered =
      status === MEDICINE_ORDER_STATUS.DELIVERED ||
      status === MEDICINE_ORDER_STATUS.PURCHASED_IN_STORE ||
      status === MEDICINE_ORDER_STATUS.PICKEDUP;
    const progress =
      status === MEDICINE_ORDER_STATUS.ORDER_PLACED ||
      status === MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED
        ? 1
        : status === MEDICINE_ORDER_STATUS.ORDER_VERIFIED
        ? 2
        : status === MEDICINE_ORDER_STATUS.ORDER_BILLED ||
          status === MEDICINE_ORDER_STATUS.READY_AT_STORE ||
          status === MEDICINE_ORDER_STATUS.SHIPPED ||
          status === MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY
        ? 3
        : 0;

    return isDelivered || isFailedOrCancelled ? (
      <View
        style={isFailedOrCancelled ? styles.progressLineCompleteGray : styles.progressLineComplete}
      />
    ) : (
      <View style={styles.progressLineContainer}>
        <View style={[styles.progressLineBefore, { flex: progress }]} />
        <OrderPlacedIcon style={styles.orderPlacedIcon} />
        <View style={[styles.progressLineAfter, { flex: 4 - progress }]} />
      </View>
    );
  };

  const renderStatusAndLinks = () => {
    return (
      <View>
        <View style={styles.statusContainer}>
          <Text style={styles.status}>{'Order status:'}</Text>
          <Text style={isFailedOrCancelled ? styles.statusValueRed : styles.statusValue}>
            {getOrderStatusText(status!)}
          </Text>
        </View>
        {renderLinks()}
      </View>
    );
  };
  const renderLinks = () => {
    const disableCancel = isOrderCancelNotAllowed(orderDetail);
    return (
      <View style={styles.linkContainer}>
        <Text onPress={onPressHelp} style={styles.link}>
          {string.help.toUpperCase()}
        </Text>
        <Divider style={styles.divider} />
        <Text
          onPress={disableCancel ? () => {} : onPressCancel}
          style={[disableCancel ? styles.disabledLink : styles.link]}
        >
          {string.cancel.toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <ListItem
      title={renderTitle()}
      onPress={onPressHelp}
      subtitle={renderStatusAndLinks()}
      pad={16}
      containerStyle={styles.listItemContainer}
      Component={TouchableOpacity}
      leftIcon={<MedicineIcon />}
    />
  );
};

const { card, text } = theme.viewStyles;
const {
  LIGHT_BLUE,
  APP_YELLOW,
  APP_GREEN,
  INPUT_FAILURE_TEXT,
  LIGHT_GRAY,
  SKY_BLUE,
} = theme.colors;
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
  statusContainer: {
    marginLeft: -40,
    marginBottom: -18,
  },
  status: {
    ...text('L', 12, LIGHT_BLUE),
  },
  statusValue: {
    ...text('M', 12, LIGHT_BLUE),
  },
  statusValueRed: {
    ...text('M', 12, INPUT_FAILURE_TEXT),
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
  progressLineContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: -40,
  },
  progressLineComplete: {
    flex: 1,
    height: 4,
    backgroundColor: APP_GREEN,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: -40,
  },
  progressLineCompleteGray: {
    flex: 1,
    height: 4,
    backgroundColor: LIGHT_GRAY,
    opacity: 0.3,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: -40,
  },
  progressLineBefore: {
    flex: 1,
    height: 4,
    backgroundColor: SKY_BLUE,
  },
  progressLineAfter: {
    flex: 1,
    height: 4,
    backgroundColor: APP_GREEN,
    opacity: 0.2,
  },
  orderPlacedIcon: {
    height: 28,
    width: 28,
  },
});
