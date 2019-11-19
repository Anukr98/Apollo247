import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { OrderPlacedIcon, OrderTrackerSmallIcon } from './Icons';

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.cardViewStyle,
    padding: 16,
    marginBottom: 8,
    flex: 1,
  },
  viewRowStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    letterSpacing: 0.0,
    color: theme.colors.SHERPA_BLUE,
    flex: 1,
    textTransform: 'capitalize',
  },
  dateTimeStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    letterSpacing: 0.04,
    color: theme.colors.LIGHT_BLUE,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.1,
    marginTop: 7,
    marginBottom: 8,
  },
  statusIconStyle: {
    height: 28,
    width: 28,
  },
  statusIconSmallStyle: {
    height: 8,
    width: 8,
  },
  graphicalStatusViewStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    marginRight: 18,
  },
  verticalProgressLine: { flex: 1, width: 4, alignSelf: 'center' },
});

export interface OrderProgressCardProps {
  status: string;
  isStatusDone: boolean;
  nextItemStatus: 'DONE' | 'NOT_DONE' | 'NOT_EXIST';
  date?: string;
  time?: string;
  description?: string; // if falsy value it renders date & time
  style?: StyleProp<ViewStyle>;
}

export const OrderProgressCard: React.FC<OrderProgressCardProps> = (props) => {
  const renderGraphicalStatus = () => {
    return (
      <View style={styles.graphicalStatusViewStyle}>
        {props.isStatusDone ? (
          <OrderPlacedIcon style={styles.statusIconStyle} />
        ) : (
          <OrderTrackerSmallIcon style={styles.statusIconSmallStyle} />
        )}
        <View
          style={[
            styles.verticalProgressLine,
            {
              backgroundColor:
                props.nextItemStatus == 'DONE'
                  ? theme.colors.SKY_BLUE
                  : props.nextItemStatus == 'NOT_DONE'
                  ? 'rgba(0, 179, 142, 0.2)'
                  : 'transparent',
            },
          ]}
        />
      </View>
    );
  };

  const renderCustomDescriptionOrDateAndTime = () => {
    if (props.description)
      return (
        <View style={styles.viewRowStyle}>
          <Text style={[styles.dateTimeStyle, { opacity: 0.6 }]}>{props.description}</Text>
        </View>
      );
    return (
      <View style={styles.viewRowStyle}>
        <Text style={styles.dateTimeStyle}>{props.date}</Text>
        <Text style={styles.dateTimeStyle}>{props.time}</Text>
      </View>
    );
  };

  return (
    <View style={{ flexDirection: 'row' }}>
      {renderGraphicalStatus()}
      <View
        style={[
          styles.containerStyle,
          props.style,
          !props.isStatusDone ? { backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR } : {},
        ]}
      >
        <Text style={styles.statusStyle}>{props.status}</Text>
        {(props.date && props.time) || props.description ? (
          <>
            <View style={styles.separator} />
            {renderCustomDescriptionOrDateAndTime()}
          </>
        ) : null}
      </View>
    </View>
  );
};
