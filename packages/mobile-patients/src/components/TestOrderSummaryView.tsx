import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList } from '../graphql/types/getDiagnosticOrderDetails';
import moment from 'moment';
import { g, postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { ScrollView } from 'react-native-gesture-handler';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';
import { DIAGNOSTIC_ORDER_PAYMENT_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
export interface LineItemPricing {
  packageMrp: number;
  pricingObj: any;
}

const { height, width } = Dimensions.get('window');
const isSmallDevice = width < 370;

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
  const getFormattedDateTime = (time: string) => {
    return moment(time).format('D MMM YYYY | hh:mm A');
  };
  const isPrepaid = orderDetails?.paymentType == DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT;

  useEffect(() => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ORDER_SUMMARY_VIEWED] = {
      'Order id:': orderDetails?.id,
      'Order amount': grossCharges!,
      'Sample Collection Date': orderDetails?.diagnosticDate,
      'Order status': orderDetails?.orderStatus,
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ORDER_SUMMARY_VIEWED, eventAttributes);
  }, []);

  const getAllObjectForNull = orderDetails?.diagnosticOrderLineItems?.filter(
    (items) => items?.groupPlan == null
  );

  let newCircleArray: LineItemPricing[] = [];
  let newAllArray: LineItemPricing[] = [];
  let newSpecialArray: LineItemPricing[] = [];

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

  let newArr: any[] = [];
  newCircleArray?.map((item) =>
    newArr.push(
      item?.packageMrp! > item?.pricingObj?.[0]?.mrp
        ? item?.packageMrp
        : item?.pricingObj?.[0].mrp! || 0
    )
  );

  newAllArray?.map((item) =>
    newArr.push(
      item?.packageMrp! > item?.pricingObj?.[0]?.mrp
        ? item?.packageMrp!
        : item?.pricingObj?.[0].mrp! || 0
    )
  );

  newSpecialArray?.map((item) =>
    newArr.push(
      item?.packageMrp! > item?.pricingObj?.[0]?.mrp
        ? item?.packageMrp!
        : item?.pricingObj?.[0].mrp! || 0
    )
  );

  const totalIndividualDiagonsticsCharges =
    !!getAllObjectForNull && getAllObjectForNull?.length > 0
      ? orderDetails?.totalPrice
      : newArr?.reduce((prevVal, currVal) => prevVal + currVal, 0);

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

  const orderLineItems = orderDetails!.diagnosticOrderLineItems || [];

  const renderOptions = () => {
    return (
      <View style={styles.viewOrderDetailsContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onPressViewDetails}
          style={styles.viewOrderDetailsTouch}
        >
          <Text style={{ ...theme.viewStyles.yellowTextStyle, textAlign: 'center' }}>
            VIEW ORDER DETAILS
          </Text>
        </TouchableOpacity>
      </View>
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
            <View style={styles.subView}>
              <Text style={styles.orderName}>Order Type</Text>
              <Text style={styles.hideText}>{isPrepaid ? 'Prepaid' : 'COD'}</Text>
            </View>
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
                  {convertNumberToDecimal(g(item, 'price') || null)}
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
                {convertNumberToDecimal(grossCharges)}
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
                  {convertNumberToDecimal(HomeCollectionCharges)}
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
                  {convertNumberToDecimal(totalCircleSaving)}
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
                  {convertNumberToDecimal(totalCartSaving)}
                </Text>
              </View>
            </View>
          )}

          {!!totalDiscountSaving && (
            <View style={styles.commonTax}>
              <View style={{ flex: 1 }}>
                <Text style={styles.commonText}></Text>
              </View>
              <View style={{ width: '51%' }}>
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
                  {string.diagnostics.specialDiscountText}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.commonText, { color: colors.APP_GREEN }]}>
                  - {string.common.Rs}
                  {convertNumberToDecimal(totalDiscountSaving)}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.horizontalline1} />
          <View style={styles.payment}>
            <Text style={styles.paymentText1}> Total </Text>
            <Text style={[styles.paymentText, { marginHorizontal: 20 }]}>
              {' '}
              {string.common.Rs} {convertNumberToDecimal(orderDetails?.totalPrice)}{' '}
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
    ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 13.5 : 16),
    color: '#02475b',
    textAlign: 'right',
    marginLeft: isSmallDevice ? 16 : 20,
  },
  orderName: {
    opacity: 0.6,
    paddingRight: 10,
    ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 13 : 14),
    color: '#02475b',
  },
  subView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  commonText: {
    ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 13 : 14),
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
    ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 9.5 : 10),
    color: '#0087ba',
  },
  testsummeryHeading: {
    ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 9.5 : 10),
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
    ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 13 : 14),
  },
  paymentText: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansBold(isSmallDevice ? 13 : 14),
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
    ...theme.fonts.IBMPlexSansSemiBold(isSmallDevice ? 15 : 16),
    color: '#02475b',
    textAlign: 'left',
    marginTop: 15,
    marginLeft: 20,
  },
  viewOrderDetailsContainer: {
    zIndex: 1000,
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  viewOrderDetailsTouch: {
    height: '100%',
    width: '100%',
  },
});
