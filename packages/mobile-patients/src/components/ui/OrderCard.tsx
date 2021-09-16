import { MedicineIcon, OrderPlacedIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { MEDICINE_ORDER_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.cardViewStyle,
    padding: 16,
    paddingLeft: 8,
    paddingBottom: 12,
    flexDirection: 'row',
  },
  viewRowStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  detailsViewStyle: {
    flex: 1,
    marginLeft: 16,
  },
  titleStyle: {
    ...theme.fonts.IBMPlexSansMedium(15),
    lineHeight: 24,
    color: theme.colors.SHERPA_BLUE,
  },
  descriptionStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    letterSpacing: 0.04,
    color: theme.colors.LIGHT_BLUE,
    opacity: 0.6,
    flex: 1.5,
  },
  idStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SHERPA_BLUE,
    opacity: 0.6,
    flex: 1,
    textAlign: 'right',
  },
  statusStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    letterSpacing: 0.04,
    color: theme.colors.LIGHT_BLUE,
    flex: 1,
  },
  dateTimeStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    letterSpacing: 0.04,
    color: theme.colors.LIGHT_BLUE,
    flex: 1,
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.2,
    marginTop: 15,
    marginBottom: 8,
  },
  statusIconStyle: {
    height: 28,
    width: 28,
  },
  progressLineContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  progressLineDone: {
    flex: 1,
    height: 4,
    backgroundColor: '#00b38e',
    marginTop: 20,
    marginBottom: 16,
  },
  progressLineBefore: {
    flex: 1,
    height: 4,
    backgroundColor: '#0087ba',
  },
  progressLineAfter: {
    flex: 1,
    height: 4,
    backgroundColor: '#00b38e',
    opacity: 0.2,
  },
  onHoldStatusIconStyle: {
    height: 28,
    width: 28,
    tintColor: theme.colors.INPUT_FAILURE_TEXT,
  },
  badgeOuterView: {
    alignSelf: 'center',
  },
  badgeText: {
    textAlign: 'center',
    padding: 1,
    paddingLeft: 3,
    paddingRight: 3,
  },
});

type OrderStatusType = MEDICINE_ORDER_STATUS;

export interface OrderCardProps {
  orderId: string;
  title: string;
  description: string;
  dateTime: string;
  status?: OrderStatusType;
  statusDesc: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  isOnHold?: boolean;
  isItemsUpdated?: boolean;
  isChanged?: boolean;
  reOrder?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = (props) => {
  const { reOrder } = props;
  const isOrderWithProgressIcons =
    props.status == MEDICINE_ORDER_STATUS.ORDER_PLACED ||
    props.status == MEDICINE_ORDER_STATUS.ORDER_VERIFIED ||
    props.status == MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY ||
    props.status == MEDICINE_ORDER_STATUS.ON_HOLD ||
    props.status == MEDICINE_ORDER_STATUS.ORDER_BILLED;

  const getProgressWidth = (
    status: OrderCardProps['status'],
    progresDirection: 'left' | 'right'
  ) => {
    if (progresDirection == 'left') {
      if (
        status == MEDICINE_ORDER_STATUS.ORDER_PLACED ||
        status == MEDICINE_ORDER_STATUS.ORDER_VERIFIED ||
        props.isOnHold!
      ) {
        return 1;
      }
      return 3;
    } else {
      if (status == MEDICINE_ORDER_STATUS.ORDER_PLACED || props.isOnHold!) {
        return 3;
      }
      return 1;
    }
  };

  const renderGraphicalStatus = () => {
    if (
      props.status == MEDICINE_ORDER_STATUS.DELIVERED ||
      props.status == MEDICINE_ORDER_STATUS.PURCHASED_IN_STORE
    ) {
      return <View style={styles.progressLineDone} />;
    }
    if (isOrderWithProgressIcons) {
      return (
        <View style={styles.progressLineContainer}>
          <View
            style={[styles.progressLineBefore, { flex: getProgressWidth(props.status, 'left') }]}
          />
          <OrderPlacedIcon
            style={props.isOnHold! ? styles.onHoldStatusIconStyle : styles.statusIconStyle}
          />
          <View
            style={[styles.progressLineAfter, { flex: getProgressWidth(props.status, 'right') }]}
          />
        </View>
      );
    }
    return <View style={styles.separator} />;
  };

  const renderStatusAndTime = () => {
    return (
      <View style={styles.viewRowStyle}>
        <Text
          numberOfLines={1}
          style={[
            styles.statusStyle,
            props.status == MEDICINE_ORDER_STATUS.ORDER_PLACED
              ? { ...theme.fonts.IBMPlexSansSemiBold(12) }
              : {},
            props.status == MEDICINE_ORDER_STATUS.CANCELLED
              ? { color: theme.colors.INPUT_FAILURE_TEXT }
              : {},
          ]}
        >
          {props.statusDesc}
        </Text>
        <Text numberOfLines={1} style={styles.dateTimeStyle}>
          {props.dateTime}
        </Text>
      </View>
    );
  };

  const renderDescriptionAndId = () => {
    return (
      <View style={styles.viewRowStyle}>
        <Text numberOfLines={2} style={styles.descriptionStyle}>
          {props.description}
        </Text>
        <Text numberOfLines={1} style={styles.idStyle}>
          {props.orderId}
        </Text>
      </View>
    );
  };

  const renderReOrder = () => {
    return (
      <Button
        style={{ width: undefined, height: undefined }}
        onPress={reOrder}
        title={'RE ORDER'}
        titleTextStyle={{ marginHorizontal: 25, fontSize: 12, marginVertical: 7 }}
      />
    );
  };

  const renderDetails = () => {
    return (
      <View style={styles.detailsViewStyle}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            style={[
              styles.titleStyle,
              {
                width: !props.isOnHold ? (props.isItemsUpdated ? '57%' : '50%') : '78%',
              },
            ]}
          >
            {props.title || 'Medicines'}
          </Text>
          {renderBadge()}
        </View>
        {renderDescriptionAndId()}
        {renderGraphicalStatus()}
        {renderStatusAndTime()}
      </View>
    );
  };

  const renderBadge = () => {
    const showReorder =
      props.status == MEDICINE_ORDER_STATUS.RETURN_INITIATED ||
      props.status == MEDICINE_ORDER_STATUS.DELIVERED ||
      props.status == MEDICINE_ORDER_STATUS.CANCELLED ||
      props.status == MEDICINE_ORDER_STATUS.PURCHASED_IN_STORE;
    const title = props.isOnHold!
      ? 'ON-HOLD'
      : props.isChanged!
      ? 'DELIVERY DATE CHANGED'
      : 'DELIVERY UPDATED';
    const bckColor = props.isOnHold!
      ? theme.colors.INPUT_FAILURE_TEXT
      : props.isChanged!
      ? 'rgb(230,130,49)'
      : 'rgba(79, 176, 144,1)';
    return showReorder ? (
      renderReOrder()
    ) : props.isOnHold! || props.isItemsUpdated! || props.isChanged! ? (
      <View style={[styles.badgeOuterView, { backgroundColor: bckColor }]}>
        <Text
          style={[
            styles.badgeText,
            { ...theme.viewStyles.text('M', props.isOnHold ? 11 : 10, colors.WHITE, 1, 24) },
          ]}
        >
          {title}
        </Text>
      </View>
    ) : null;
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => {
        props.onPress();
      }}
      style={[
        styles.containerStyle,
        props.style,
        props.status == MEDICINE_ORDER_STATUS.RETURN_ACCEPTED
          ? { backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }
          : {},
      ]}
    >
      {renderDetails()}
    </TouchableOpacity>
  );
};
