import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View, ScrollView } from 'react-native';
import { getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrderDetails';
import moment from 'moment';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { DIAGNOSTIC_GROUP_PLAN } from '@aph/mobile-patients/src/helpers/apiCalls';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';
import {
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
  DIAGNOSTIC_ORDER_STATUS,
  REFUND_STATUSES,
  Gender,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { StatusCard } from '@aph/mobile-patients/src/components/Tests/components/StatusCard';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  DIAGNOSTIC_REPORT_GENERATED_STATUS_ARRAY,
  DIAGNOSTIC_STATUS_BEFORE_SUBMITTED,
} from '@aph/mobile-patients/src/strings/AppConfig';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { DiagnosticOrderSummaryViewed } from '@aph/mobile-patients/src/components/Tests/Events';

export interface LineItemPricing {
  packageMrp: number;
  pricingObj: any;
}

const { height, width } = Dimensions.get('window');
const isSmallDevice = width < 370;

export interface TestOrderSummaryViewProps {
  orderDetails: getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList;
  onPressViewReport?: () => void;
  refundDetails?: any;
}

export const TestOrderSummaryView: React.FC<TestOrderSummaryViewProps> = (props) => {
  const { orderDetails, refundDetails } = props;
  const isPrepaid = orderDetails?.paymentType == DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT;
  const salutation = !!orderDetails?.patientObj?.gender
    ? orderDetails?.patientObj?.gender === Gender.MALE
      ? 'Mr. '
      : 'Ms. '
    : '';
  const { currentPatient } = useAllCurrentPatients();

  useEffect(() => {
    DiagnosticOrderSummaryViewed(grossCharges, orderDetails?.id, orderDetails?.orderStatus);
  }, []);

  const getCircleObject = orderDetails?.diagnosticOrderLineItems?.filter(
    (items) => items?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
  );

  const getAllObject = orderDetails?.diagnosticOrderLineItems?.filter(
    (items) => items?.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL
  );

  const getAllObjectForNull = orderDetails?.diagnosticOrderLineItems?.filter(
    (items) => items?.groupPlan == null
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

  const totalSavings =
    grossCharges + HomeCollectionCharges - orderDetails?.totalPrice != 0
      ? totalCartSaving + totalDiscountSaving
      : 0;

  const orderLineItems = orderDetails!.diagnosticOrderLineItems || [];

  const renderOrderId = () => {
    const bookedOn = moment(orderDetails?.createdDate)?.format('Do MMM') || null;
    return (
      <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <View style={{ flex: 0.8 }}>
          <Text style={styles.orderId}>Order ID #{orderDetails?.displayId}</Text>
          <Text style={styles.bookedOn}>Booked on {bookedOn}</Text>
        </View>
        <View>
          <StatusCard titleText={orderDetails?.orderStatus} />
        </View>
      </View>
    );
  };

  const getSlotStartTime = (slot: string /*07:00-07:30 */) => {
    return moment((slot?.split('-')[0] || '').trim(), 'hh:mm').format('hh:mm A');
  };

  const renderSlotView = () => {
    const getUTCDateTime = orderDetails?.slotDateTimeInUTC;

    const bookedForDate =
      moment(getUTCDateTime != null ? getUTCDateTime : orderDetails?.diagnosticDate!)?.format(
        'ddd, DD MMM YYYY'
      ) || null;
    const bookedForTime =
      getUTCDateTime != null
        ? moment(getUTCDateTime).format('hh:mm a')
        : getSlotStartTime(orderDetails?.slotTimings);

    return (
      <View style={styles.testSlotContainer}>
        {(!!bookedForTime || !!bookedForDate) && (
          <View>
            <Text style={styles.headingText}>Appointment Time</Text>
            {!!bookedForTime ? <Text style={styles.slotText}>{bookedForTime}</Text> : null}
            {!!bookedForDate ? <Text style={styles.slotText}>{bookedForDate}</Text> : null}
          </View>
        )}
        <View>
          <Text style={styles.headingText}>Payment</Text>
          <Text style={[styles.slotText, { textAlign: 'right' }]}>
            {isPrepaid ? 'ONLINE' : 'COD'}
          </Text>
          {!!orderDetails?.totalPrice ? (
            <Text style={[styles.slotText, { textAlign: 'right' }]}>
              {string.common.Rs}
              {convertNumberToDecimal(orderDetails?.totalPrice)}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  const renderHeading = (title: string) => {
    return (
      <View style={{ marginVertical: 30, marginBottom: 6 }}>
        <Text style={styles.headingText}>{title}</Text>
      </View>
    );
  };

  const renderItemsCard = () => {
    return (
      <View style={styles.orderSummaryView}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.itemHeading}> ITEM NAME</Text>
          <Text style={styles.itemHeading}> PRICE</Text>
        </View>
        {orderLineItems?.map((item) => {
          return (
            <View style={styles.commonTax}>
              <View style={{ width: '65%' }}>
                <Text style={styles.commonText}>
                  {!!item?.itemName ? item?.itemName : item?.diagnostics?.itemName}
                </Text>
                {!!item?.itemObj?.inclusions && (
                  <Text style={styles.inclusionsText}>
                    Inclusions : {item?.itemObj?.inclusions?.length}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.commonText}>
                  {string.common.Rs}
                  {convertNumberToDecimal(g(item, 'price') || null)}
                </Text>
              </View>
            </View>
          );
        })}
        {DIAGNOSTIC_REPORT_GENERATED_STATUS_ARRAY.includes(orderDetails?.orderStatus)
          ? renderViewReport()
          : null}
      </View>
    );
  };

  const renderViewReport = () => {
    return (
      <Button
        title={'VIEW REPORT'}
        style={styles.viewReport}
        titleTextStyle={{
          ...theme.viewStyles.text('SB', isIphone5s() ? 12 : 14, theme.colors.BUTTON_TEXT),
        }}
        onPress={props.onPressViewReport}
      />
    );
  };

  const renderPrices = (
    title: string,
    price: string | number,
    isDiscount: boolean,
    customStyle?: boolean
  ) => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <View style={{ width: '65%' }}>
          <Text
            style={[
              styles.commonText,
              {
                ...theme.viewStyles.text(
                  customStyle ? 'B' : 'M',
                  customStyle ? 14 : 12,
                  colors.SHERPA_BLUE,
                  1,
                  customStyle ? 20 : 15
                ),
              },
            ]}
          >
            {title}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text
            style={[
              styles.commonText,
              {
                ...theme.viewStyles.text(
                  customStyle ? 'B' : 'M',
                  customStyle ? 14 : 12,
                  colors.SHERPA_BLUE,
                  1,
                  customStyle ? 20 : 15
                ),
              },
            ]}
          >
            {isDiscount && price > 0 ? '- ' : null}
            {string.common.Rs}
            {convertNumberToDecimal(price)}
          </Text>
        </View>
      </View>
    );
  };

  const renderPricesCard = () => {
    return (
      <View>
        {renderHeading('Total Charges')}
        <View style={styles.orderSummaryView}>
          {renderPrices('Total MRP', grossCharges, false)}
          {renderPrices('Circle Discount', totalCircleSaving, true)}
          {renderPrices('Cart Savings', totalCartSaving, true)}
          {renderPrices('Coupon Discount', totalDiscountSaving, true)}
          {renderPrices('Home collection Charges', HomeCollectionCharges, false)}
          <Spearator style={{ marginTop: 6, marginBottom: 6 }} />
          {renderPrices('Total', orderDetails?.totalPrice, false, true)}
        </View>
      </View>
    );
  };

  const renderPaymentCard = () => {
    const txtToShow = isPrepaid
      ? 'Amount Paid Online'
      : DIAGNOSTIC_STATUS_BEFORE_SUBMITTED.includes(orderDetails?.orderStatus)
      ? 'Amount to be collected in Cash'
      : 'Amount collected in Cash';
    const refundText =
      isPrepaid &&
      refundDetails?.length > 0 &&
      refundDetails?.[0]?.status === REFUND_STATUSES.SUCCESS &&
      'Amount Refunded';

    return (
      <View>
        {renderHeading('Payment Mode')}
        <View style={styles.orderSummaryView}>
          {renderPrices(txtToShow, orderDetails?.totalPrice, false)}
          {!!refundText && renderPrices(refundText, refundDetails?.[0]?.amount, false)}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ margin: 16 }}>
        {renderOrderId()}
        {renderSlotView()}
        {renderHeading(
          `Tests for ${salutation != '' && salutation}${orderDetails?.patientObj?.firstName! ||
            currentPatient?.firstName}`
        )}
        {renderItemsCard()}
        {renderPricesCard()}
        {orderDetails?.orderStatus === DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED && !isPrepaid
          ? null
          : renderPaymentCard()}
      </View>
    </ScrollView>
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
    ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 11 : 12),
    color: colors.SHERPA_BLUE,
    marginBottom: 5,
    marginTop: 5,
    lineHeight: 15,
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
    padding: 16,
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
  headingText: {
    ...theme.viewStyles.text('SB', 12, colors.SHERPA_BLUE, 1, 18),
    letterSpacing: 0.3,
    marginBottom: '2%',
  },
  slotText: {
    ...theme.viewStyles.text('R', 12, colors.SHERPA_BLUE, 1, 18),
    letterSpacing: 0.01,
    marginVertical: '1%',
  },
  itemHeading: {
    ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 1, 15),
    letterSpacing: 0.28,
  },
  inclusionsText: {
    ...theme.viewStyles.text('R', 11, colors.SHERPA_BLUE, 1, 15),
  },
  viewReport: { width: '40%', marginBottom: 5, alignSelf: 'flex-start', marginTop: 10 },
  orderId: { ...theme.viewStyles.text('M', 13, colors.SHERPA_BLUE, 1, 18) },
  bookedOn: { ...theme.viewStyles.text('R', 10, colors.SHERPA_BLUE, 0.5, 14) },
  testSlotContainer: { justifyContent: 'space-between', flexDirection: 'row', marginTop: '6%' },
});
