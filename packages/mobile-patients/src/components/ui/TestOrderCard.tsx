import { OrderPlacedIcon, TestsIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { DIAGNOSTIC_ORDER_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
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
    textTransform: 'capitalize',
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

type OrderStatusType = DIAGNOSTIC_ORDER_STATUS;

export interface TestOrderCardProps {
  orderId: string;
  title: string;
  description: string;
  dateTime: string;
  status?: OrderStatusType;
  statusDesc: string;
  onPress: () => void;
  isReschedule?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const TestOrderCard: React.FC<TestOrderCardProps> = (props) => {
  const isOrderWithProgressIcons =
    props.status == DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED ||
    props.status == DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED;

  const getProgressWidth = (
    status: TestOrderCardProps['status'],
    progresDirection: 'left' | 'right'
  ) => {
    if (progresDirection == 'left') {
      if (status == DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED) {
        return 0;
      } else if (status == DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED) {
        return 1;
      }
    } else {
      if (status == DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED) {
        return 1;
      } else if (status == DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED) {
        return 5;
      }
    }
  };

  const renderGraphicalStatus = () => {
    if (props.status == ('Reports Generated' as any)) {
      //Change once we get all the status list from API
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
            props.status == DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED
              ? { ...theme.fonts.IBMPlexSansSemiBold(12) }
              : {},
            props.status == DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED
              ? { color: theme.colors.INPUT_FAILURE_TEXT }
              : {},
          ]}
        >
          {props.statusDesc.replace('_', ' ')}
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

  const renderReschedule = () => {
    return (
      <View>
        <View style={[styles.separator, { marginTop: 16, marginBottom: 7 }]} />
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={{ alignItems: 'flex-end' }}>
            <Text
              style={{
                ...theme.viewStyles.yellowTextStyle,
              }}
            >
              RESCHEDULE
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDetails = () => {
    return (
      <View style={styles.detailsViewStyle}>
        <Text style={styles.titleStyle}>{props.title || 'Medicines'}</Text>
        {renderDescriptionAndId()}
        {renderGraphicalStatus()}
        {renderStatusAndTime()}
        {props.isReschedule && renderReschedule()}
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
        props.status == DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED
          ? { backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }
          : {},
      ]}
    >
      <TestsIcon style={{ height: 24, width: 24 }} />
      {renderDetails()}
    </TouchableOpacity>
  );
};
