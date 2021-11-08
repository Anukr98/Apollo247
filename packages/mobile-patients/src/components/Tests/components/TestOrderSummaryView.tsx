import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrderDetails';
import moment from 'moment';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  formatAddressForApi,
  nameFormater,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { DIAGNOSTIC_GROUP_PLAN } from '@aph/mobile-patients/src/helpers/apiCalls';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import {
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
  DIAGNOSTIC_ORDER_STATUS,
  REFUND_STATUSES,
  Gender,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { StatusCard } from '@aph/mobile-patients/src/components/Tests/components/StatusCard';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  DIAGNOSTIC_REPORT_GENERATED_STATUS_ARRAY,
  DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY,
  DIAGNOSTIC_STATUS_BEFORE_SUBMITTED,
  DIAGNOSTIC_PAYMENT_MODE_STATUS_ARRAY,
} from '@aph/mobile-patients/src/strings/AppConfig';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { DiagnosticOrderSummaryViewed } from '@aph/mobile-patients/src/components/Tests/Events';
import { Down, Up, DownloadOrange } from '@aph/mobile-patients/src/components/ui/Icons';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import { PassportPaitentOverlay } from '@aph/mobile-patients/src/components/Tests/components/PassportPaitentOverlay';

export interface LineItemPricing {
  packageMrp: number;
  pricingObj: any;
}

const { height, width } = Dimensions.get('window');
const isSmallDevice = width < 370;

export interface TestOrderSummaryViewProps {
  orderDetails: getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList;
  onPressViewReport?: () => void;
  onPressDownloadInvoice?: any;
  refundDetails?: any;
  refundTransactionId?: string;
  slotDuration?: any;
}

export const TestOrderSummaryView: React.FC<TestOrderSummaryViewProps> = (props) => {
  const { orderDetails, refundDetails, refundTransactionId, slotDuration } = props;
  const filterOrderLineItem =
    !!orderDetails &&
    orderDetails?.diagnosticOrderLineItems?.filter((item: any) => !item?.isRemoved);

  const isPrepaid = orderDetails?.paymentType == DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT;
  const salutation = !!orderDetails?.patientObj?.gender
    ? orderDetails?.patientObj?.gender === Gender.MALE
      ? 'Mr. '
      : 'Ms. '
    : '';
  const { isDiagnosticCircleSubscription } = useDiagnosticsCart();
  const { currentPatient } = useAllCurrentPatients();
  const [showPreviousCard, setShowPreviousCard] = useState<boolean>(true);
  const [showPassportModal, setShowPassportModal] = useState<boolean>(false);
  const [showCurrCard, setShowCurrCard] = useState<boolean>(true);

  useEffect(() => {
    DiagnosticOrderSummaryViewed(
      grossCharges,
      orderDetails?.displayId,
      orderDetails?.orderStatus,
      currentPatient,
      isDiagnosticCircleSubscription
    );
  }, []);

  const getCircleObject =
    (!!filterOrderLineItem &&
      filterOrderLineItem?.filter((items) => items?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE)) ||
    [];

  const getAllObject =
    (!!filterOrderLineItem &&
      filterOrderLineItem?.filter((items) => items?.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL)) ||
    [];

  const getAllObjectForNull =
    (!!filterOrderLineItem && filterOrderLineItem?.filter((items) => items?.groupPlan == null)) ||
    [];

  const getDiscountObject =
    (!!filterOrderLineItem &&
      filterOrderLineItem?.filter(
        (items) => items?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
      )) ||
    [];

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
    orderDetails?.attributesObj?.homeCollectionCharges != null
      ? orderDetails?.attributesObj?.homeCollectionCharges
      : orderDetails?.collectionCharges != null
      ? orderDetails?.collectionCharges
      : 0.0;

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

  const getModifiedLineItems = filterOrderLineItem?.filter((item) => item?.editOrderID != null);
  const getPreviousLineItems = filterOrderLineItem?.filter((item) => item?.editOrderID == null);

  const previousTotal = getPreviousLineItems
    ?.map((item: any) => Number(item?.price))
    ?.reduce((preVal: number, curVal: number) => preVal + curVal, 0);

  const modifyTotal = getModifiedLineItems
    ?.map((item: any) => Number(item?.price))
    ?.reduce((preVal: number, curVal: number) => preVal + curVal, 0);

  const paidSlotCharges = orderDetails?.attributesObj?.distanceCharges;

  const renderOrderId = () => {
    const bookedOn = moment(orderDetails?.createdDate)?.format('Do MMM') || null;
    return (
      <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <View style={{ flex: 0.9 }}>
          <Text style={styles.orderId}>Order ID #{orderDetails?.displayId}</Text>
          <Text style={styles.bookedOn}>Booked on {bookedOn}</Text>
          {refundDetails?.[0]?.status === REFUND_STATUSES.SUCCESS && !!refundTransactionId ? (
            <Text style={styles.bookedOn}>Refund id: {refundTransactionId}</Text>
          ) : null}
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
        ? moment(getUTCDateTime).format('hh:mm A')
        : getSlotStartTime(orderDetails?.slotTimings);
    const rangeAddedTime =
      getUTCDateTime != null
        ? moment(getUTCDateTime)
            .add(slotDuration, 'minutes')
            .format('hh:mm A')
        : getSlotStartTime(orderDetails?.slotTimings);
    return (
      <View style={[styles.testSlotContainer]}>
        {(!!bookedForTime || !!bookedForDate) && (
          <View>
            <Text style={styles.headingText}>Test Slot</Text>
            {!!bookedForTime ? (
              <Text style={styles.slotText}>
                {bookedForTime} - {rangeAddedTime}
              </Text>
            ) : null}
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
              {Number(orderDetails?.totalPrice).toFixed(2)}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  const renderAddress = () => {
    const addressText = formatAddressForApi(orderDetails?.patientAddressObj! || '');
    return (
      <>
        {!!addressText && addressText != '' ? (
          <View>
            {renderHeading(nameFormater(string.diagnostics.homeVisitText, 'title'))}
            <View style={styles.orderSummaryView}>
              <Text style={styles.addressTextStyle}>{addressText}</Text>
            </View>
          </View>
        ) : null}
      </>
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
        {filterOrderLineItem?.map((item) => {
          return (
            <View style={styles.commonTax}>
              <View style={{ width: '65%' }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.commonText}>
                    {!!item?.itemName ? item?.itemName : item?.diagnostics?.itemName}
                  </Text>
                  {!!item?.editOrderID ? (
                    <View style={{ marginLeft: 10 }}>{renderNewTag()}</View>
                  ) : null}
                </View>
                {!!item?.itemObj?.inclusions && (
                  <Text style={styles.inclusionsText}>
                    Inclusions : {item?.itemObj?.inclusions?.length}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.commonText}>
                  {string.common.Rs}
                  {Number(item?.price)?.toFixed(2) || null}
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

  const renderOrderBreakdownCard = (data: any, title: string) => {
    const remainingItems = data?.length - 1;
    const firstItem = data?.[0]?.itemName;
    const openPreviousView = title === string.diagnostics.previousCharges && showPreviousCard;
    const openCurrentView = title === string.diagnostics.currentCharges && showCurrCard;
    const collectionChargesToUse = !!orderDetails?.attributesObj?.homeCollectionCharges
      ? orderDetails?.attributesObj?.homeCollectionCharges
      : !!orderDetails?.collectionCharges
      ? orderDetails?.collectionCharges
      : 0.0;
    return (
      <View>
        {renderHeading(title)}
        <View
          style={[
            styles.orderSummaryView,
            { paddingBottom: openPreviousView || openCurrentView ? 16 : 0 },
          ]}
        >
          <TouchableOpacity
            style={[styles.previousItemInnerContainer]}
            onPress={() =>
              title === string.diagnostics.previousCharges
                ? setShowPreviousCard(!showPreviousCard)
                : setShowCurrCard(!showCurrCard)
            }
          >
            <Text style={styles.previousItemHeading}>
              {nameFormater(firstItem?.slice(0, isSmallDevice ? 27 : 30), 'title')}{' '}
              {remainingItems > 0 && `+ ${remainingItems} more`}
            </Text>
            {(title === string.diagnostics.previousCharges && !showPreviousCard) ||
            (title === string.diagnostics.currentCharges && !showCurrCard) ? (
              <Text style={styles.closedViewTotal}>
                {string.common.Rs}
                {title === string.diagnostics.previousCharges
                  ? Number(previousTotal! + collectionChargesToUse!).toFixed(2)
                  : Number(modifyTotal! + 0.0).toFixed(2)}
              </Text>
            ) : null}
            <View>
              {title === string.diagnostics.previousCharges ? (
                showPreviousCard ? (
                  <Up style={styles.arrowIconStyle} />
                ) : (
                  <Down style={styles.arrowIconStyle} />
                )
              ) : showCurrCard ? (
                <Up style={styles.arrowIconStyle} />
              ) : (
                <Down style={styles.arrowIconStyle} />
              )}
            </View>
          </TouchableOpacity>

          {openPreviousView || openCurrentView ? (
            <>
              <View style={[styles.rowSpaceBetweenStyle, { marginBottom: 0 }]}>
                <Text style={styles.itemHeading}> ITEM NAME</Text>
                <Text style={styles.itemHeading}> PRICE</Text>
              </View>
              {data?.map(
                (
                  item: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems
                ) => {
                  return (
                    <View style={styles.commonTax}>
                      <View style={{ width: '65%' }}>
                        <Text style={styles.commonText}>
                          {nameFormater(
                            !!item?.itemName ? item?.itemName! : item?.diagnostics?.itemName!,
                            'title'
                          )}
                        </Text>
                        {!!item?.itemObj?.inclusions && (
                          <Text style={styles.inclusionsText}>
                            Inclusions : {item?.itemObj?.inclusions?.length}
                          </Text>
                        )}
                      </View>
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={[styles.commonText, { lineHeight: 20 }]}>
                          {string.common.Rs}
                          {Number(item?.price)?.toFixed(2) || null}
                        </Text>
                      </View>
                    </View>
                  );
                }
              )}
              <Spearator style={{ marginTop: 12, marginBottom: 12 }} />
              {renderPrices(
                'Subtotal',
                title === string.diagnostics.previousCharges ? previousTotal! : modifyTotal!,
                false
              )}
              {renderPrices(
                string.diagnosticsCartPage.homeCollectionText,
                title === string.diagnostics.previousCharges ? collectionChargesToUse : 0.0,
                false
              )}
              {renderPrices(
                string.diagnosticsCartPage.paidSlotText,
                title === string.diagnosticsCartPage.paidSlotText
                  ? !!orderDetails?.attributesObj?.distanceCharges
                    ? orderDetails?.attributesObj?.distanceCharges
                    : 0.0
                  : 0.0,
                false
              )}
              {renderPrices(
                'Total',
                title === string.diagnostics.previousCharges
                  ? Number(previousTotal! + collectionChargesToUse)
                  : Number(modifyTotal! + 0.0),
                false,
                true
              )}
            </>
          ) : null}
        </View>
      </View>
    );
  };

  const renderPrices = (
    title: string,
    price: string | number,
    isDiscount: boolean,
    customStyle?: boolean
  ) => {
    return (
      <View style={styles.pricesContainer}>
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
            {Number(price).toFixed(2)}
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
          {renderPrices(
            string.diagnosticsCartPage.homeCollectionText,
            HomeCollectionCharges,
            false
          )}
          {!!paidSlotCharges &&
            renderPrices(string.diagnosticsCartPage.paidSlotText, paidSlotCharges, false)}
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

    const isOrderModified = orderDetails?.diagnosticOrderLineItems?.find(
      (item) => !!item?.editOrderID && item?.editOrderID
    );
    const refundAmountToShow = !!isOrderModified
      ? orderDetails?.totalPrice
      : refundDetails?.[0]?.amount;

    return (
      <View>
        {renderHeading('Payment Mode')}
        <View style={styles.orderSummaryView}>
          {renderPrices(txtToShow, orderDetails?.totalPrice, false)}
          {!!refundText && renderPrices(refundText, refundAmountToShow, false)}
        </View>
      </View>
    );
  };
  const renderAddPassportView = () => {
    return (
      <View
        style={styles.passportView}
      >
        <Text style={styles.textupper}>
          {string.diagnostics.addOrEditPassportText}
        </Text>
        <TouchableOpacity onPress={()=>{
          setShowPassportModal(true)
        }}>
          <Text style={styles.textlower}>
            ADD
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPassportPaitentView = () => {
    return (
      <PassportPaitentOverlay
        patientArray={[orderDetails]}
        onPressClose={() => {
          setShowPassportModal(false);
        }}
        onPressDone={() => {
          setShowPassportModal(false);
        }}
      />
    );
  };

  const renderNewTag = () => {
    return (
      <View style={styles.newItemView}>
        <Text style={styles.newText}>NEW</Text>
      </View>
    );
  };
  const renderInvoiceDownload = () => {
    return (
      <TouchableOpacity
        style={styles.downloadInvoice}
        onPress={() => props.onPressDownloadInvoice()}
      >
        <Text style={styles.yellowText}>DOWNLOAD INVOICE</Text>
        <DownloadOrange style={styles.downloadOrange} />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ margin: 16 }}>
        {(DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY.includes(orderDetails?.orderStatus) ||
          DIAGNOSTIC_REPORT_GENERATED_STATUS_ARRAY.includes(orderDetails?.orderStatus)) &&
        orderDetails?.invoiceURL
          ? renderInvoiceDownload()
          : null}
        {renderOrderId()}
        {renderSlotView()}
        {renderAddPassportView()}
        {renderAddress()}
        {renderHeading(
          `Tests for ${salutation != '' && salutation}${orderDetails?.patientObj?.firstName! ||
            currentPatient?.firstName}`
        )}
        {renderItemsCard()}
        {!!getModifiedLineItems &&
        getModifiedLineItems?.length > 0 &&
        !!getPreviousLineItems &&
        getPreviousLineItems?.length > 0
          ? renderOrderBreakdownCard(getPreviousLineItems, string.diagnostics.previousCharges)
          : null}
        {!!getModifiedLineItems && getModifiedLineItems?.length > 0
          ? renderOrderBreakdownCard(getModifiedLineItems, string.diagnostics.currentCharges)
          : null}
        {renderPricesCard()}
        {(orderDetails?.orderStatus === DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED && !isPrepaid) ||
        DIAGNOSTIC_PAYMENT_MODE_STATUS_ARRAY.includes(orderDetails?.orderStatus)
          ? null
          : renderPaymentCard()}
          {showPassportModal && renderPassportPaitentView()}
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
  downloadOrange: { width: 14, height: 14, marginHorizontal: 10 },
  hideText: {
    ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 13.5 : 16),
    color: '#02475b',
    textAlign: 'right',
    marginLeft: isSmallDevice ? 16 : 20,
  },
  downloadInvoice: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
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
  passportView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    backgroundColor: 'white',
    padding: 10,
    marginVertical: 10,
  },
  textupper: { ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1) },
  textlower: { ...theme.viewStyles.text('SB', 14, theme.colors.APP_YELLOW_COLOR) },
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
  testSlotContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 15,
  },
  newItemView: {
    backgroundColor: '#4CAF50',
    height: 18,
    width: 40,
    borderRadius: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
  },
  newText: {
    ...theme.viewStyles.text('SB', 10, 'white'),
    textAlign: 'center',
  },
  yellowText: {
    ...theme.viewStyles.text('SB', 14, colors.APP_YELLOW),
    textAlign: 'center',
  },
  previousItemInnerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    // height: 30,
    alignItems: 'center',
  },
  previousItemHeading: {
    ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 13 : 14),
    color: colors.SHERPA_BLUE,
    lineHeight: 22,
    width: '74%',
    marginRight: 5,
  },
  arrowIconStyle: { height: 30, width: 30, resizeMode: 'contain' },
  rowSpaceBetweenStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  pricesContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  closedViewTotal: {
    ...theme.fonts.IBMPlexSansBold(isSmallDevice ? 13 : 14),
    color: colors.SHERPA_BLUE,
    lineHeight: 22,
  },
  addressTextStyle: { ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 1, 18) },
});
