import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList } from '../graphql/types/getDiagnosticOrderDetails';
import moment from 'moment';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  g,
  formatTestSlotWithBuffer,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { DIAGNOSTIC_GROUP_PLAN } from '../helpers/apiCalls';
import { colors } from '@aph/mobile-patients/src/theme/colors';

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
    marginTop: height * 0.04, //0.22
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
  lineSeparator: {
    borderBottomColor: '#02475b',
    borderBottomWidth: 2,
    marginVertical: 10,
    marginTop: height * 0.1,
  },
  grossTotalView: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 18,
  },
});

export interface TestOrderSummaryViewProps {
  orderDetails: getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList;
}

export const TestOrderSummaryView: React.FC<TestOrderSummaryViewProps> = ({ orderDetails }) => {
  const { currentPatient } = useAllCurrentPatients();
  const getFormattedDateTime = (time: string) => {
    return moment(time).format('D MMM YYYY | hh:mm A');
  };

  useEffect(() => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ORDER_SUMMARY_VIEWED] = {
      'Order id:': orderDetails?.id,
      'Order Amount': grossCharges!,
      'Sample Collection Date': orderDetails?.diagnosticDate,
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ORDER_SUMMARY_VIEWED, eventAttributes);
  }, []);

  const formatSlot = (slot: string /*07:00-07:30 */) => {
    /**
     * for showing 30 mins buffer time.
     */
    const startTime = slot.split('-')[0];
    const endTime = moment(startTime, 'HH:mm')
      .add(30, 'minutes')
      .format('HH:mm');

    const newSlot = [startTime, endTime];
    return newSlot.map((item) => moment(item.trim(), 'hh:mm').format('hh:mm A')).join(' - ');
  };

  const getCircleObject = orderDetails?.diagnosticOrderLineItems?.filter(
    (items) => items?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
  );

  const getAllObject = orderDetails?.diagnosticOrderLineItems?.filter(
    (items) => items?.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL
  );

  const allCirclePlanObjects =
    getCircleObject?.map((item) =>
      item?.pricingObj?.filter((obj) => obj?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE)
    ) || [];
  const allNormalPlanObjects =
    getAllObject?.map((item) =>
      item?.pricingObj?.filter((obj) => obj?.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL)
    ) || [];
  const discountCirclePrice =
    allCirclePlanObjects?.map((item) => item?.[0]?.mrp! - item?.[0]?.price!) || [];
  console.log({ discountCirclePrice });

  const discountNormalPrice =
    allNormalPlanObjects?.map((item) => item?.[0]?.mrp! - item?.[0]?.price!) || [];
  console.log({ discountNormalPrice });

  const totalCircleSaving = discountCirclePrice?.reduce((prevVal, currVal) => prevVal + currVal, 0);
  const totalCartSaving = discountNormalPrice?.reduce((prevVal, currVal) => prevVal + currVal, 0);

  /**
   * to handle the quantity
   */
  const individualDiagnosticsArray = orderDetails?.diagnosticOrderLineItems!.map(
    (item) => item?.price! * item?.quantity!
  );

  const totalIndividualDiagonsticsCharges = individualDiagnosticsArray?.reduce(
    (prevVal, currVal) => prevVal + currVal
  );

  const HomeCollectionCharges = orderDetails?.totalPrice! - totalIndividualDiagonsticsCharges!;

  const grossCharges = totalIndividualDiagonsticsCharges! + totalCartSaving! + totalCircleSaving!;

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
        {/* {!!orderDetails.slotTimings && (
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
            <Text style={styles.hideText}>{`${formatTestSlotWithBuffer(
              orderDetails.slotTimings
            )}`}</Text>
          </View>
        )} */}
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
            <Text style={styles.commonText}>
              {string.common.Rs}
              {g(item, 'price')}
            </Text>
          </View>
        </View>
      ))}
      {/**
       * HOME COLLECTION CHARGES
       */}
      <View style={styles.lineSeparator} />
      <View style={styles.commonTax}>
        <View style={{ flex: 1 }}>
          <Text style={styles.commonText}></Text>
        </View>
        <View style={{ width: '46%' }}>
          <Text
            style={[
              styles.commonText,
              { ...theme.fonts.IBMPlexSansMedium(10), textAlign: 'right' },
            ]}
          >
            GROSS CHARGES
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.commonText}>
            {string.common.Rs}
            {/* {totalIndividalDiagonsticsCharges} */}
            {grossCharges}
          </Text>
        </View>
      </View>
      {!!HomeCollectionCharges && (
        <View style={styles.commonTax}>
          <View style={{ flex: 1 }}>
            <Text style={styles.commonText}></Text>
          </View>
          <View style={{ width: '46%' }}>
            <Text
              style={[
                styles.commonText,
                { ...theme.fonts.IBMPlexSansMedium(10), textAlign: 'right' },
              ]}
            >
              HOME COLLECTION CHARGES
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.commonText}>
              + {string.common.Rs}
              {HomeCollectionCharges}
            </Text>
          </View>
        </View>
      )}
      {/**
       * check with home collection
       */}
      {!!totalCircleSaving && (
        <View style={styles.commonTax}>
          <View style={{ flex: 1 }}>
            <Text style={styles.commonText}></Text>
          </View>
          <View style={{ width: '46%' }}>
            <Text
              style={[
                styles.commonText,
                {
                  ...theme.fonts.IBMPlexSansMedium(10),
                  textAlign: 'right',
                  color: colors.APP_GREEN,
                },
              ]}
            >
              CIRCLE SAVING
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.commonText, { color: colors.APP_GREEN }]}>
              - {string.common.Rs}
              {totalCircleSaving}
            </Text>
          </View>
        </View>
      )}
      {!!totalCartSaving && (
        <View style={styles.commonTax}>
          <View style={{ flex: 1 }}>
            <Text style={styles.commonText}></Text>
          </View>
          <View style={{ width: '46%' }}>
            <Text
              style={[
                styles.commonText,
                {
                  ...theme.fonts.IBMPlexSansMedium(10),
                  textAlign: 'right',
                  color: colors.APP_GREEN,
                },
              ]}
            >
              CART SAVING
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.commonText, { color: colors.APP_GREEN }]}>
              - {string.common.Rs}
              {totalCartSaving}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.horizontalline1} />
      <View style={styles.payment}>
        <Text style={styles.paymentText1}> Total </Text>
        <Text style={[styles.paymentText, { marginHorizontal: 20 }]}>
          {' '}
          {string.common.Rs} {orderDetails.totalPrice}{' '}
        </Text>
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
