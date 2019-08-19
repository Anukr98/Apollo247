import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { MedicineIcon, OrderPlacedIcon } from './Icons';

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
    flex: 1,
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
  progressLineBefore: {
    flex: 1,
    height: 4,
    backgroundColor: '#0087ba',
  },
  progressLineAfter: {
    flex: 3,
    height: 4,
    backgroundColor: '#00b38e',
    opacity: 0.2,
  },
});

export interface OrderCardProps {
  orderId: string;
  title: string;
  description: string;
  dateTime: string;
  status:
    | 'Order Placed'
    | 'Order Verified'
    | 'On Hold'
    | 'Order Delayed'
    | 'Out For Delivery'
    | 'Order Ready At Store'
    | 'Order Delivered'
    | 'Return Requested'
    | 'Items Returned'
    | 'Return Rejected'
    | 'Return Accepted'
    | 'Cancelation Requested'
    | 'Order Cancelled';
  onPress: (orderId: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const OrderCard: React.FC<OrderCardProps> = (props) => {
  const renderGraphicalStatus = () => {
    if (
      props.status == 'Order Placed' ||
      props.status == 'Order Verified' ||
      props.status == 'On Hold' ||
      props.status == 'Order Delayed' ||
      props.status == 'Out For Delivery' ||
      props.status == 'Order Ready At Store' ||
      props.status == 'Order Delivered'
    )
      return (
        <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', marginTop: 8 }}>
          <View style={styles.progressLineBefore} />
          <OrderPlacedIcon style={styles.statusIconStyle} />
          <View style={styles.progressLineAfter} />
        </View>
      );
    return <View style={styles.separator} />;
  };

  const renderStatusAndTime = () => {
    return (
      <View style={styles.viewRowStyle}>
        <Text
          numberOfLines={1}
          style={[
            styles.statusStyle,
            props.status == 'Order Placed' ? { ...theme.fonts.IBMPlexSansSemiBold(12) } : {},
            props.status == 'Return Rejected' || props.status == 'Order Cancelled'
              ? { color: theme.colors.INPUT_FAILURE_TEXT }
              : {},
          ]}
        >
          {props.status}
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
        <Text numberOfLines={1} style={styles.descriptionStyle}>
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
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={styles.titleStyle}>{props.title || 'Medicines'}</Text>
        {renderDescriptionAndId()}
        {renderGraphicalStatus()}
        {renderStatusAndTime()}
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={() => props.onPress}
      style={[
        styles.containerStyle,
        props.style,
        props.status == 'Return Accepted'
          ? { backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }
          : {},
      ]}
    >
      <MedicineIcon />
      {renderDetails()}
    </TouchableOpacity>
  );
};
