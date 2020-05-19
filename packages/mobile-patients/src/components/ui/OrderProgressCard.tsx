import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import {
  OrderPlacedIcon,
  OrderTrackerSmallIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MEDICINE_ORDER_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.cardViewStyle,
    padding: 16,
    marginBottom: 8,
    flex: 1,
  },
  containerStyle1: {
    // ...theme.viewStyles.cardViewStyle,
    // padding: 16,
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

interface OrderDescription {
  heading?: string;
  description?: string;
}

export interface OrderProgressCardProps {
  status: string;
  isStatusDone: boolean;
  showCurrentStatusDesc?: boolean | null;
  getOrderDescription?: OrderDescription | null;
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
                props.nextItemStatus == 'NOT_EXIST'
                  ? 'transparent'
                  : !props.isStatusDone
                  ? 'rgba(0,135,186,0.3)'
                  : theme.colors.SKY_BLUE,
            },
          ]}
        />
      </View>
    );
  };

  const renderCustomDescriptionOrDateAndTime = () => {
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
      <View style={[styles.containerStyle1]}>
        <View
          style={[
            styles.containerStyle,
            props.style,
            !props.isStatusDone ? { backgroundColor: '#f7f8f5' } : {},
          ]}
        >
          {!props.isStatusDone ? (
            <>
              <Text style={[styles.statusStyle, { color: 'rgba(1,71,91,0.35)' }]}>
                {props.status}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.statusStyle}>{props.status}</Text>
              {(props.date && props.time) || props.description ? (
                <>
                  <View style={styles.separator} />
                  {renderCustomDescriptionOrDateAndTime()}
                </>
              ) : null}
            </>
          )}
        </View>
        {props.showCurrentStatusDesc &&
          props.getOrderDescription &&
          props.getOrderDescription.heading != '' &&
          props.getOrderDescription &&
          props.getOrderDescription.description != '' && (
            <View style={{ paddingHorizontal: 16, flexDirection: 'row' }}>
              <Text style={{ ...theme.viewStyles.text('SB', 10, '#00b38e', 1, 13, 0.03) }}>
                {props.getOrderDescription && props.getOrderDescription.heading}
                <Text style={{ ...theme.viewStyles.text('R', 10, '#02475b', 1, 13, 0.03) }}>
                  {props.getOrderDescription && props.getOrderDescription.description!}
                </Text>
              </Text>
            </View>
          )}
      </View>
    </View>
  );
};
