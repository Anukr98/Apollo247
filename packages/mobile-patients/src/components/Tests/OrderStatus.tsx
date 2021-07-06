import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, BackHandler, View, ScrollView, TouchableOpacity } from 'react-native';
import { NavigationScreenProps, SafeAreaView } from 'react-navigation';
import {
  CircleLogo,
  OrderPlacedCheckedIcon,
  OrderProcessingIcon,
  InfoIconRed,
  TimeIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import moment from 'moment';
import {
  formatTestSlotWithBuffer,
  postWebEngageEvent,
  apiCallEnums,
  navigateToHome,
  nameFormater,
  isSmallDevice,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { WebEngageEventName } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { firePurchaseEvent } from '@aph/mobile-patients/src/components/Tests/Events';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { getDiagnosticRefundOrders } from '@aph/mobile-patients/src/helpers/clientCalls';
import { useApolloClient } from 'react-apollo-hooks';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { Gender } from '@aph/mobile-patients/src/graphql/types/globalTypes';

export interface OrderStatusProps extends NavigationScreenProps {}

export const OrderStatus: React.FC<OrderStatusProps> = (props) => {
  const modifiedOrderDetails = props.navigation.getParam('isModify');
  const orderDetails = props.navigation.getParam('orderDetails');
  const eventAttributes = props.navigation.getParam('eventAttributes');
  const isCOD = props.navigation.getParam('isCOD');
  const paymentId = props.navigation.getParam('paymentId');
  const { currentPatient } = useAllCurrentPatients();
  //check for modify
  const pickupDate = !!modifiedOrderDetails
    ? moment(modifiedOrderDetails?.slotDateTimeInUTC)?.format('DD MMM')
    : moment(orderDetails?.diagnosticDate!).format('DD MMM');
  const pickupYear = !!modifiedOrderDetails
    ? moment(modifiedOrderDetails?.slotDateTimeInUTC)?.format('YYYY')
    : moment(orderDetails?.diagnosticDate!).format('YYYY');
  const paymentStatus = props.navigation.getParam('paymentStatus');
  const pickupTime = !!modifiedOrderDetails
    ? formatTestSlotWithBuffer(moment(modifiedOrderDetails?.slotDateTimeInUTC)?.format('hh:mm'))
    : orderDetails && formatTestSlotWithBuffer(orderDetails?.slotTime!);
  const orderCartSaving = orderDetails?.cartSaving!;
  const orderCircleSaving = orderDetails?.circleSaving!;
  const displayId = !!modifiedOrderDetails
    ? modifiedOrderDetails?.displayId
    : orderDetails?.displayId;
  const showCartSaving = orderCartSaving > 0 && orderDetails?.cartHasAll;
  const { apisToCall } = useAppCommonData();
  const {
    isDiagnosticCircleSubscription,
    clearDiagnoticCartInfo,
    cartItems,
  } = useDiagnosticsCart();
  const { circleSubscriptionId } = useShoppingCart();

  const client = useApolloClient();
  const { setLoading } = useUIElements();
  const savings = isDiagnosticCircleSubscription
    ? Number(orderCartSaving) + Number(orderCircleSaving)
    : orderCartSaving;
  const couldBeSaved =
    !isDiagnosticCircleSubscription && orderCircleSaving > 0 && orderCircleSaving > orderCartSaving;
  const moveToHome = () => {
    // use apiCallsEnum values here in order to make that api call in home screen
    apisToCall.current = [
      apiCallEnums.circleSavings,
      apiCallEnums.getAllBanners,
      apiCallEnums.plansCashback,
      apiCallEnums.getUserSubscriptions,
    ];
    navigateToHome(props.navigation);
  };
  const [apiOrderDetails, setApiOrderDetails] = useState([]);
  const [timeDate, setTimeDate] = useState<string>('');
  const [showMore, setShowMore] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState('');
  const [isSingleUhid, setIsSingleUhid] = useState<boolean>(false);

  const moveToMyOrders = () => {
    props.navigation.popToTop({ immediate: true }); //if not added, stack was getting cleared.
    props.navigation.push(AppRoutes.YourOrdersTest, {
      source: AppRoutes.OrderStatus,
    });
  };

  async function fetchOrderDetailsFromPayments() {
    setLoading?.(true);
    try {
      let response: any = await getDiagnosticRefundOrders(client, paymentId);
      console.log({ response });
      if (response?.data?.data?.getOrderInternal) {
        const getResponse = response?.data?.data?.getOrderInternal?.internal_orders;
        const getSlotDateTime =
          getResponse?.[0]?.orderDetailsPayment?.ordersList?.[0]?.slotDateTimeInUTC;
        setApiOrderDetails(getResponse);
        setTimeDate(getSlotDateTime);
        setIsSingleUhid(getResponse?.length == 1);
      } else {
        setApiOrderDetails([]);
      }
      setLoading?.(false);
    } catch (error) {
      CommonBugFender('OrderStatus_fetchOrderDetailsFromPayments', error);
      setApiOrderDetails([]);
      setLoading?.(false);
    }
  }

  useEffect(() => {
    fetchOrderDetailsFromPayments();
    postwebEngageCheckoutCompletedEvent();
    firePurchaseEvent(orderDetails?.orderId, orderDetails?.amount, cartItems);
    clearDiagnoticCartInfo?.();
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const postwebEngageCheckoutCompletedEvent = () => {
    let attributes = {
      ...eventAttributes,
      'Payment mode': isCOD ? 'Cash' : 'Prepaid',
      'Circle discount': circleSubscriptionId && orderCircleSaving ? orderCircleSaving : 0,
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_CHECKOUT_COMPLETED, attributes);
  };

  const handleBack = () => {
    moveToMyOrders();
    return true;
  };

  const navigateToOrderDetails = (showOrderSummaryTab: boolean, orderId: string) => {
    setLoading?.(false);
    apisToCall.current = [apiCallEnums.circleSavings];
    props.navigation.popToTop({ immediate: true });
    props.navigation.push(AppRoutes.TestOrderDetails, {
      orderId: !!modifiedOrderDetails ? modifiedOrderDetails?.id : orderId,
      setOrders: null,
      selectedOrder: null,
      refundStatusArr: [],
      goToHomeOnBack: true,
      comingFrom: AppRoutes.TestsCart,
      showOrderSummaryTab: true,
      disableTrackOrder: true,
      amount: orderDetails?.amount,
    });
  };

  const renderHeader = () => {
    return (
      <View style={[styles.header]}>
        {/* <TouchableOpacity onPress={() => navigateToOrderDetails(true, orderDetails?.orderId!)}>
          <Text style={styles.orderSummary}>VIEW ORDER SUMMARY</Text>
        </TouchableOpacity> */}
      </View>
    );
  };

  //if payment status is not success, then check
  const renderOrderPlacedMsg = () => {
    return paymentStatus == 'success' ? (
      <View style={[styles.orderPlaced, { justifyContent: 'center' }]}>
        <OrderPlacedCheckedIcon
          style={[styles.placedIcon, { height: 60, width: 60, resizeMode: 'contain' }]}
        />
        <View>
          <Text style={[styles.orderPlacedText, { alignSelf: 'flex-start' }]}>
            Order Placed Successfully
          </Text>
          <Text style={styles.bookedText}>
            Booked on {moment().format('DD MMM')}, {moment().format('YYYY')} |{' '}
            {moment().format('hh:mm A')}{' '}
          </Text>
        </View>
      </View>
    ) : (
      <View style={styles.orderPlaced}>
        <OrderProcessingIcon style={styles.placedIcon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.orderPlacedText}>{string.diagnostics.processingOrder}</Text>
        </View>
      </View>
    );
  };

  const renderPickUpTime = () => {
    const date = timeDate != '' && moment(timeDate)?.format('DD MMM');
    const year = timeDate != '' && moment(timeDate)?.format('YYYY');
    const time = timeDate != '' && formatTestSlotWithBuffer(moment(timeDate)?.format('hh:mm A'));
    return (
      <>
        {!!date && !!time && !!year ? (
          <View style={styles.pickupView}>
            <TimeIcon style={styles.timeIconStyle} />
            <Text style={styles.pickupText}>
              Pickup Time :{' '}
              {!!date && !!year && (
                <Text style={styles.pickupDate}>
                  {date}, {year}
                </Text>
              )}
              {!!time && <Text style={styles.pickupDate}> | {time}</Text>}
            </Text>
          </View>
        ) : null}
      </>
    );
  };

  const renderBookingInfo = () => {
    return (
      <View style={styles.bookingInfo}>
        <Text style={styles.bookingIdText}>
          Your Booking ID is
          <Text style={styles.bookingNumberText}> #{displayId!}</Text>
        </Text>
        <Spearator style={styles.horizontalSeparator} />
        <View style={styles.pickUpInfo}>
          {!!pickupDate && !!pickupYear && (
            <View>
              <Text style={styles.placeholderText}>PICKUP DATE</Text>
              <Text style={styles.date}>
                {pickupDate}, {pickupYear}
              </Text>
            </View>
          )}
          {!!pickupTime && (
            <View>
              <Text style={styles.placeholderText}>PICKUP TIME</Text>
              <Text style={styles.date}>{pickupTime}</Text>
            </View>
          )}
        </View>
        <View style={{ marginHorizontal: 20 }}>
          <Text style={styles.placeholderText}>BOOKING DATE/TIME</Text>
          <Text style={styles.date}>
            {moment().format('DD MMM')}, {moment().format('YYYY')} | {moment().format('hh:mm A')}
          </Text>
        </View>
      </View>
    );
  };

  const renderAmount = () => {
    return (
      <Text style={styles.savedTxt}>
        {isCOD ? 'Amount to be paid via cash' : 'Total amount paid'} :{' '}
        <Text style={styles.amount}>₹ {orderDetails?.amount}</Text>
      </Text>
    );
  };

  const renderCartSavings = () => {
    return (
      <View style={styles.totalSavingOuterView}>
        {renderAmount()}
        {!!savings && (
          <Text style={{ ...styles.savedTxt, marginTop: 8 }}>
            You {''}
            <Text style={styles.savedAmt}>
              saved {string.common.Rs} {savings}
            </Text>
            {''} on your purchase.
          </Text>
        )}
        {((isDiagnosticCircleSubscription && orderCircleSaving > 0) ||
          !!showCartSaving ||
          couldBeSaved) && <Spearator style={{ marginVertical: 10 }} />}
        {isDiagnosticCircleSubscription && orderCircleSaving > 0 && (
          <>
            <View style={styles.circleSaving}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CircleLogo style={styles.circleLogo} />
                <View>
                  <Text style={styles.cartSavings}>Membership Discount</Text>
                </View>
              </View>
              <Text style={styles.cartSavings}>₹ {orderCircleSaving}</Text>
            </View>
          </>
        )}
        {!!showCartSaving! && (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={styles.cartSavings}>Cart Saving</Text>
              <Text style={styles.cartSavings}>₹ {orderCartSaving}</Text>
            </View>
          </>
        )}
        {couldBeSavings()}
      </View>
    );
  };

  const couldBeSavings = () => {
    return (
      couldBeSaved && (
        <View style={styles.couldBeSavings}>
          <Text style={styles.savedTxt}>
            You could have{' '}
            <Text style={styles.savedAmt}>
              saved extra {string.common.Rs}
              {orderCircleSaving}
            </Text>{' '}
            with
          </Text>
          <CircleLogo style={{ ...styles.circleLogo, marginLeft: 4 }} />
        </View>
      )
    );
  };

  const backToHome = () => {
    return (
      <StickyBottomComponent>
        <Button title={'GO TO MY ORDERS'} onPress={() => moveToMyOrders()} />
      </StickyBottomComponent>
    );
  };

  const renderNoticeText = () => {
    return (
      <View style={{ marginVertical: 10 }}>
        <Text style={styles.phleboText}>{string.diagnostics.orderSuccessPhaleboText}</Text>
      </View>
    );
  };
  const enable_cancelellation_policy =
    AppConfig.Configuration.Enable_Diagnostics_Cancellation_Policy;
  const cancelellation_policy_text = AppConfig.Configuration.Diagnostics_Cancel_Policy_Text_Msg;
  const renderCancelationPolicy = () => {
    return (
      <View style={styles.cancel_container}>
        <InfoIconRed />
        <Text style={styles.cancel_text}>{cancelellation_policy_text}</Text>
      </View>
    );
  };
  const renderInvoiceTimeline = () => {
    return (
      <View style={styles.cancel_container}>
        <InfoIconRed />
        <Text style={styles.cancel_text}>{string.diagnostics.invoiceTimelineText}</Text>
      </View>
    );
  };

  const renderTests = () => {
    //define type
    return (
      <View>
        {!!apiOrderDetails && apiOrderDetails?.length > 0
          ? apiOrderDetails?.map((item) => {
              const orders = item?.orderDetailsPayment?.ordersList?.[0];
              const displayId = orders?.displayId;
              const lineItemsLength = orders?.diagnosticOrderLineItems?.length;
              const lineItems = orders?.diagnosticOrderLineItems;
              const remainingItems = !!lineItemsLength && lineItemsLength - 1;
              const patientName = `${orders?.patientObj?.firstName} ${orders?.patientObj?.lastName}`;
              const salutation = !!orders?.patientObj?.gender
                ? orders?.patientObj?.gender == Gender.MALE
                  ? 'Mr.'
                  : orders?.patientobj?.gender == Gender.FEMALE
                  ? 'Ms.'
                  : ''
                : '';

              return (
                <>
                  <View
                    style={{
                      backgroundColor: colors.WHITE,
                      padding: 10,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.patientName}>
                        {nameFormater(`${salutation} ${patientName}`, 'title')}
                      </Text>

                      {!!displayId && <Text style={styles.pickupDate}>#{displayId}</Text>}
                    </View>
                    {!!lineItemsLength &&
                      lineItemsLength > 0 &&
                      (selectedItem == displayId ? null : (
                        <View style={[styles.itemsView, { flexDirection: 'row' }]}>
                          <Text style={styles.bulletStyle}>{'\u2B24'}</Text>
                          <Text style={styles.testName}>
                            {nameFormater(lineItems?.[0]?.itemName, 'title')}
                          </Text>
                          {remainingItems > 0 && (
                            <TouchableOpacity
                              onPress={() => _onPressMore(item, lineItems)}
                              style={{}}
                            >
                              <Text style={styles.moreText}>+ {remainingItems} More</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    {selectedItem == displayId && renderMore(item, lineItems)}
                  </View>
                  <Spearator style={styles.separator} />
                </>
              );
            })
          : null}
      </View>
    );
  };

  //add order summary

  //define type
  function _onPressMore(item: any, lineItems: any) {
    const displayId = item?.orderDetailsPayment?.ordersList?.[0]?.displayId;
    setShowMore(true);
    setSelectedItem(displayId);
  }

  const renderMore = (item: any, lineItems: any) => {
    return (
      <View style={styles.itemsView}>
        {lineItems?.map((items: any) => {
          return (
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.bulletStyle}>{'\u2B24'}</Text>
              <Text style={styles.testName}>{nameFormater(items?.itemName, 'title')}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderOrderSummary = () => {
    return (
      <View style={styles.orderSummaryView}>
        <TouchableOpacity
          style={styles.orderSummaryTouch}
          onPress={() => navigateToOrderDetails(true, orderDetails?.orderId!)}
        >
          <Text style={styles.orderSummary}>VIEW ORDER SUMMARY</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.DEFAULT_BACKGROUND_COLOR }}>
      <SafeAreaView style={styles.container}>
        <ScrollView bounces={false} style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
          <View style={{ marginHorizontal: 20, marginBottom: 100 }}>
            {renderHeader()}
            {renderOrderPlacedMsg()}
            {renderCartSavings()}
            {renderPickUpTime()}
            {/* {renderBookingInfo()} */}

            {renderNoticeText()}
            {/* {enable_cancelellation_policy ? renderCancelationPolicy() : null} */}
            {renderTests()}
            {isSingleUhid && renderOrderSummary()}
            {renderInvoiceTimeline()}
          </View>
        </ScrollView>
      </SafeAreaView>
      {backToHome()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    // marginHorizontal: 20,
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  name: {
    ...theme.fonts.IBMPlexSansSemiBold(22),
    lineHeight: 31,
    color: '#02475B',
  },
  orderSummary: {
    ...theme.fonts.IBMPlexSansBold(14),
    lineHeight: 19,
    color: '#FC9916',
  },
  cancel_container: {
    width: '98%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderRadius: 10,
    backgroundColor: theme.colors.TEST_CARD_BUTTOM_BG,
    padding: 10,
    alignSelf: 'center',
    marginVertical: 10,
    elevation: 2,
  },
  cancel_text: {
    ...theme.viewStyles.text('M', 12, '#01475b', 0.6, 18),
    width: '90%',
    marginHorizontal: 10,
  },
  orderPlaced: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },
  scrollViewOuterView: {
    flexDirection: 'row',
    marginTop: '10%',
    width: '70%',
    height: 90,
  },
  orderPlacedText: {
    flexWrap: 'wrap',
    textAlign: 'left',
    alignSelf: 'center',
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 22,
    color: '#0087BA',
  },
  placedIcon: {
    marginRight: 15,
    height: 40,
    width: 40,
  },
  bookingInfo: {
    marginVertical: 20,
    backgroundColor: '#F7F8F5',
    borderRadius: 5,
    paddingVertical: 16,
  },
  bookingIdText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 22,
    paddingBottom: 16,
    paddingHorizontal: 15,
  },
  bookingNumberText: {
    color: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 22,
    marginHorizontal: 4,
  },
  horizontalSeparator: {
    borderWidth: 1,
    color: '#000000',
    opacity: 0.1,
    width: '100%',
  },
  date: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 22,
    color: '#01475B',
    marginTop: 4,
  },
  pickUpInfo: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  placeholderText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansRegular(11),
    lineHeight: 16,
    letterSpacing: 1,
  },
  contentText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 22,
  },
  totalSavingOuterView: {
    marginVertical: 30,
    borderColor: theme.colors.APP_GREEN,
    borderWidth: 2,
    borderRadius: 5,
    padding: 16,
    paddingVertical: 10,
    borderStyle: 'dashed',
    backgroundColor: colors.WHITE,
  },
  savedTxt: {
    color: '#02475B',
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 16,
  },
  savedAmt: {
    color: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansSemiBold(12),
  },
  amount: {
    ...theme.fonts.IBMPlexSansBold(12),
    color: '#02475B',
  },
  cartSavings: {
    color: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansMedium(11),
    lineHeight: 16,
    alignSelf: 'flex-end',
  },
  circleLogo: {
    height: 20,
    width: 34,
    resizeMode: 'contain',
    marginRight: 4,
  },
  circleSaving: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  couldBeSavings: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  separator: {
    borderColor: 'rgba(2,71,91,0.4)',
    borderBottomWidth: 1,
    height: 1,
  },
  homeScreen: {
    ...theme.viewStyles.text('B', 16, '#FC9916'),
    marginVertical: 20,
  },
  phleboText: { ...theme.fonts.IBMPlexSansRegular(12), lineHeight: 18, color: '#FF748E' },
  bookedText: {
    flexWrap: 'wrap',
    textAlign: 'left',
    alignSelf: 'flex-start',
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 20,
    color: '#0087BA',
  },
  pickupText: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    lineHeight: 20,
    color: colors.SHERPA_BLUE,
  },
  pickupDate: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 18,
    color: colors.SHERPA_BLUE,
  },
  bulletStyle: {
    color: '#007C9D',
    fontSize: 5,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  testName: {
    ...theme.viewStyles.text('M', isSmallDevice ? 11.5 : 12, '#007C9D', 1, 17),
    letterSpacing: 0,
    marginBottom: '1.5%',
    marginHorizontal: '3%',
    maxWidth: '80%',
  },
  patientName: {
    width: '60%',
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 20,
    color: colors.SHERPA_BLUE,
  },
  orderSummaryView: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    marginTop: 16,
  },
  orderSummaryTouch: {
    height: '100%',
    width: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsView: {
    backgroundColor: '#F9F9F9',
    margin: 8,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F9F9F9',
  },
  moreText: {
    ...theme.viewStyles.text('SB', 13, theme.colors.APP_YELLOW, 1, 18),
  },
  pickupView: {
    flexDirection: 'row',
    backgroundColor: '#F3FFFF',
    marginHorizontal: -20,
    padding: 16,
    paddingLeft: 20,
  },
  timeIconStyle: { height: 20, width: 20, resizeMode: 'contain', marginRight: 6 },
});
