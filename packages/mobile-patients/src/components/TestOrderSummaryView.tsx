import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { Props } from 'react-native-image-zoom-viewer/built/image-viewer.type';
import { ScrollView } from 'react-native-gesture-handler';

export interface LineItemPricing {
  packageMrp: number;
  pricingObj: any;
}

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
  orderSummaryView: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    margin: 20,
    // padding: 16,
  },
  headerOuterView: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: '#ffffff',
    height: 50,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  orderSummaryText: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    color: '#02475b',
    textAlign: 'left',
    marginTop: 15,
    marginLeft: 20,
  },
});

export interface TestOrderSummaryViewProps {
  orderDetails: getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList;
  showViewOrderDetails?: boolean;
  onPressViewDetails?: () => void;
}

export const TestOrderSummaryView: React.FC<TestOrderSummaryViewProps> = ({
  orderDetails,
  showViewOrderDetails,
  onPressViewDetails,
}) => {
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

  const getCircleObject = orderDetails?.diagnosticOrderLineItems?.filter(
    (items) => items?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
  );

  const getAllObject = orderDetails?.diagnosticOrderLineItems?.filter(
    (items) => items?.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL
  );

  const getDiscountObject = orderDetails?.diagnosticOrderLineItems?.filter(
    (items) => items?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
  );

  let newCircleArray: LineItemPricing[] = [];
  let newAllArray: LineItemPricing[] = [];
  let newSpecialArray: LineItemPricing[] = [];

  const allCirclePlanObjects =
    getCircleObject?.map((item) =>
      newCircleArray?.push({
        packageMrp: item?.itemObj?.packageCalculatedMrp!,
        pricingObj:
          item?.pricingObj?.filter((obj) => obj?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE) || [],
      })
    ) || [];

  const allNormalPlanObjects =
    getAllObject?.map((item) =>
      newAllArray?.push({
        packageMrp: item?.itemObj?.packageCalculatedMrp!,
        pricingObj:
          item?.pricingObj?.filter((obj) => obj?.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL) || [],
      })
    ) || [];

  const allSpecialPlanObjects =
    getDiscountObject?.map((item) =>
      newSpecialArray?.push({
        packageMrp: item?.itemObj?.packageCalculatedMrp!,
        pricingObj:
          item?.pricingObj?.filter(
            (obj) => obj?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
          ) || [],
      })
    ) || [];

  const discountCirclePrice =
    newCircleArray?.map((item) =>
      item?.packageMrp! > item?.pricingObj?.[0]?.mrp
        ? item?.packageMrp! - item?.pricingObj?.[0].price!
        : item?.pricingObj?.[0].mrp! - item?.pricingObj?.[0].price!
    ) || [];

  const discountNormalPrice =
    newAllArray?.map((item) =>
      item?.packageMrp! > item?.pricingObj?.[0]?.mrp
        ? item?.packageMrp! - item?.pricingObj?.[0].price!
        : item?.pricingObj?.[0].mrp! - item?.pricingObj?.[0].price!
    ) || [];

  const discountSpecialPrice =
    newSpecialArray?.map((item) =>
      item?.packageMrp! > item?.pricingObj?.[0]?.mrp
        ? item?.packageMrp! - item?.pricingObj?.[0].price!
        : item?.pricingObj?.[0].mrp! - item?.pricingObj?.[0].price!
    ) || [];

  //gross charges considering packageMrp (how to check for previous orders)
  const individualDiagnosticsArray = orderDetails?.diagnosticOrderLineItems!.map((item) =>
    item?.itemObj?.packageCalculatedMrp! && item?.itemObj?.packageCalculatedMrp > item?.price!
      ? item?.itemObj?.packageCalculatedMrp! * item?.quantity!
      : item?.price! * item?.quantity!
  );

  const totalIndividualDiagonsticsCharges = individualDiagnosticsArray?.reduce(
    (prevVal, currVal) => prevVal + currVal
  );

  const HomeCollectionCharges =
    orderDetails?.collectionCharges != null
      ? orderDetails?.collectionCharges
      : totalIndividualDiagonsticsCharges! > orderDetails?.totalPrice
      ? totalIndividualDiagonsticsCharges! - orderDetails?.totalPrice!
      : orderDetails?.totalPrice! - totalIndividualDiagonsticsCharges;

  //removed the savings (cart,circle,discounts)
  const grossCharges = totalIndividualDiagonsticsCharges!;

  const totalCircleSaving =
    grossCharges + HomeCollectionCharges - orderDetails?.totalPrice != 0
      ? discountCirclePrice?.reduce((prevVal, currVal) => prevVal + currVal, 0)
      : 0;
  const totalCartSaving = discountNormalPrice?.reduce((prevVal, currVal) => prevVal + currVal, 0);
  const totalDiscountSaving = discountSpecialPrice?.reduce(
    (prevVal, currVal) => prevVal + currVal,
    0
  );

  const totalSavings =
    grossCharges + HomeCollectionCharges - orderDetails?.totalPrice != 0
      ? totalCartSaving + totalDiscountSaving
      : 0;

  const orderLineItems = orderDetails!.diagnosticOrderLineItems || [];

  const renderOptions = () => {
    return (
      <TouchableOpacity onPress={onPressViewDetails}>
        <View style={{ justifyContent: 'center', alignItems: 'center', margin: 16 }}>
          <Text
            style={{
              ...theme.viewStyles.yellowTextStyle,
            }}
          >
            VIEW ORDER DETAILS
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSummaryDetails = () => {
    return (
      <>
        {showViewOrderDetails ? (
          <View style={styles.headerOuterView}>
            <Text style={styles.orderSummaryText}>Order Summary</Text>
          </View>
        ) : null}
        <View style={{ padding: 16 }}>
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
          {!!totalSavings && (
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
                  {totalSavings}
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
          {showViewOrderDetails ? renderOptions() : null}
        </View>
      </>
    );
  };

  return (
    <View style={[styles.orderSummaryView]}>
      {showViewOrderDetails ? (
        <ScrollView showsVerticalScrollIndicator={false} style={{ height: height - 170 }}>
          {renderSummaryDetails()}
        </ScrollView>
      ) : (
        <>{renderSummaryDetails()}</>
      )}
    </View>
  );
};
