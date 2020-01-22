import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList } from '../graphql/types/getDiagnosticOrderDetails';
import moment from 'moment';
import { g } from '../helpers/helperFunctions';

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  horizontalline: {
    borderBottomColor: '#02475b',
    borderBottomWidth: 2,
    marginVertical: 10,
  },
  horizontalline1: {
    borderBottomColor: '#02475b',
    borderBottomWidth: 2,
    marginVertical: 10,
    marginTop: height * 0.22,
  },
  hideText: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#02475b',
    textAlign: 'right',
    marginLeft: 20,
  },
  orderName: {
    opacity: 0.6,
    paddingRight: 10,
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#02475b',
  },
  subView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  commonText: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#01475b',
    marginBottom: 5,
    marginTop: 5,
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  commonTax: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 18,
  },
  headeingView: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 16,
  },
  deliveryText: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: '#0087ba',
  },
  testsummeryHeading: {
    ...theme.fonts.IBMPlexSansMedium(10),
    letterSpacing: 0.25,
    color: '#02475b',
    marginTop: 6,
  },
  payment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f7f8f5',
    lineHeight: 20,
    marginHorizontal: -16,
    padding: 16,
    marginTop: 5,
    marginBottom: 12,
  },
  paymentText1: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  paymentText: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansBold(14),
  },
});

export interface TestOrderSummaryViewProps {
  orderDetails: getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList;
}

export const TestOrderSummaryView: React.FC<TestOrderSummaryViewProps> = ({ orderDetails }) => {
  const getFormattedDateTime = (time: string) => {
    return moment(time).format('D MMM YYYY | hh:mm A');
  };

  const formatSlot = (slot: string /*07:00-07:30 */) => {
    return slot
      .split('-')
      .map((item) => moment(item.trim(), 'hh:mm').format('hh:mm A'))
      .join(' - ');
  };

  const orderLineItems = orderDetails!.diagnosticOrderLineItems || [];
  return (
    <View
      style={{
        ...theme.viewStyles.cardContainer,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        margin: 20,
        padding: 16,
      }}
    >
      <View style={{ marginHorizontal: 0 }}>
        <View style={styles.subView}>
          <Text style={styles.orderName}>Order ID</Text>
          <Text style={styles.hideText}>#{orderDetails.displayId}</Text>
        </View>
        <View style={styles.subView}>
          <Text style={styles.orderName}>Date/Time</Text>
          <Text style={styles.hideText}>{getFormattedDateTime(orderDetails.createdDate)}</Text>
        </View>
        {!!orderDetails.slotTimings && (
          <View style={styles.subView}>
            <Text style={styles.orderName}>Pickup Date</Text>
            <Text style={styles.hideText}>
              {`${moment(orderDetails.diagnosticDate).format(`D MMM YYYY`)}`}
            </Text>
          </View>
        )}
        {!!orderDetails.slotTimings && (
          <View style={styles.subView}>
            <Text style={styles.orderName}>Pickup Time</Text>
            <Text style={styles.hideText}>{`${formatSlot(orderDetails.slotTimings)}`}</Text>
          </View>
        )}
      </View>

      <View style={styles.horizontalline} />

      <View style={styles.headeingView}>
        <View style={{ flex: 1 }}>
          <Text style={styles.testsummeryHeading}>CONSULT DETAIL</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={styles.testsummeryHeading}>QTY</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.testsummeryHeading}>CHARGES</Text>
        </View>
      </View>

      {orderLineItems.map((item) => (
        <View style={styles.commonTax}>
          <View style={{ flex: 1 }}>
            <Text style={styles.commonText}>{g(item, 'diagnostics', 'itemName')}</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.commonText}>{g(item, 'quantity')}</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.commonText}>Rs.{g(item, 'price')}</Text>
          </View>
        </View>
      ))}

      <View style={styles.horizontalline1} />

      <View style={styles.payment}>
        <Text style={styles.paymentText1}> Total </Text>
        <Text style={styles.paymentText}> Rs. {orderDetails.totalPrice} </Text>
      </View>
      {false && (
        <Text style={[styles.deliveryText, { color: '#01475b', opacity: 0.6 }]}>
          Disclaimer:{' '}
          <Text style={{ fontStyle: 'italic' }}>
            {/* Need to replace this with Disclaimer text */}
            Nam libero tempore, m soluta nobis est eligendi optio cumque nihil impedit quo minus
            quod.
          </Text>
        </Text>
      )}
    </View>
  );
};
