import { MedicineIcon, OrderPlacedIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { MEDICINE_ORDER_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.cardViewStyle,
    padding: 16,
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
    ...theme.fonts.IBMPlexSansMedium(16),
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
    // textTransform: 'capitalize',
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
}

export const OrderCard: React.FC<OrderCardProps> = (props) => {
  const isOrderWithProgressIcons =
    props.status == MEDICINE_ORDER_STATUS.ORDER_PLACED ||
    props.status == MEDICINE_ORDER_STATUS.ORDER_VERIFIED ||
    props.status == MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY;

  const getProgressWidth = (
    status: OrderCardProps['status'],
    progresDirection: 'left' | 'right'
  ) => {
    if (progresDirection == 'left') {
      if (
        status == MEDICINE_ORDER_STATUS.ORDER_PLACED ||
        status == MEDICINE_ORDER_STATUS.ORDER_VERIFIED
      ) {
        return 1;
      }
      return 3;
    } else {
      if (status == MEDICINE_ORDER_STATUS.ORDER_PLACED) {
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
          <OrderPlacedIcon style={styles.statusIconStyle} />
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

  const renderDetails = () => {
    return (
      <View style={styles.detailsViewStyle}>
        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.titleStyle}>
          {props.title || 'Medicines'}
        </Text>
        {renderDescriptionAndId()}
        {renderGraphicalStatus()}
        {renderStatusAndTime()}
      </View>
    );
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
      <MedicineIcon />
      {renderDetails()}
    </TouchableOpacity>
  );
};
