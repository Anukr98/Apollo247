import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  BackHandler,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
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
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import moment from 'moment';
import {
  formatTestSlotWithBuffer,
  postWebEngageEvent,
  apiCallEnums,
  navigateToHome,
  nameFormater,
  postCleverTapEvent,
  isSmallDevice,
  extractPatientDetails,
  g,
  getCleverTapCircleMemberValues,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { WebEngageEventName } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { firePurchaseEvent } from '@aph/mobile-patients/src/components/Tests/Events';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import InAppReview from 'react-native-in-app-review';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { getDiagnosticRefundOrders } from '@aph/mobile-patients/src/helpers/clientCalls';
import { useApolloClient } from 'react-apollo-hooks';
import {
  getDiagnosticOrderDetails,
  getDiagnosticOrderDetailsVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrderDetails';
import { GET_DIAGNOSTIC_ORDER_LIST_DETAILS } from '@aph/mobile-patients/src/graphql/profiles';

const width = Dimensions.get('window').width;
import DeviceInfo from 'react-native-device-info';

export interface OrderStatusProps extends NavigationScreenProps {}

export const OrderStatus: React.FC<OrderStatusProps> = (props) => {
  const { apisToCall } = useAppCommonData();
  const {
    isDiagnosticCircleSubscription,
    clearDiagnoticCartInfo,
    cartItems,
  } = useDiagnosticsCart();
  const { circleSubscriptionId } = useShoppingCart();
  const client = useApolloClient();
  const { setLoading } = useUIElements();
  const { currentPatient } = useAllCurrentPatients();

  const modifiedOrderDetails = props.navigation.getParam('isModify');
  const orderDetails = props.navigation.getParam('orderDetails');
  const eventAttributes = props.navigation.getParam('eventAttributes');
  const isCOD = props.navigation.getParam('isCOD');
  const paymentId = props.navigation.getParam('paymentId');
  const paymentStatus = props.navigation.getParam('paymentStatus');
  const orderCartSaving = orderDetails?.cartSaving!;
  const orderCircleSaving = orderDetails?.circleSaving!;
  const displayId = !!modifiedOrderDetails
    ? modifiedOrderDetails?.displayId
    : orderDetails?.displayId;
  const showCartSaving = orderCartSaving > 0 && orderDetails?.cartHasAll;
  const savings = isDiagnosticCircleSubscription
    ? Number(orderCartSaving) + Number(orderCircleSaving)
    : orderCartSaving;
  const couldBeSaved =
    !isDiagnosticCircleSubscription && orderCircleSaving > 0 && orderCircleSaving > orderCartSaving;

  const fetchOrderDetails = (orderId: string) =>
    client.query<getDiagnosticOrderDetails, getDiagnosticOrderDetailsVariables>({
      query: GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
      variables: { diagnosticOrderId: orderId },
      fetchPolicy: 'no-cache',
    });

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

  const [apiOrderDetails, setApiOrderDetails] = useState([] as any);
  const [timeDate, setTimeDate] = useState<string>('');
  const [isSingleUhid, setIsSingleUhid] = useState<boolean>(false);
  const [showMoreArray, setShowMoreArray] = useState([] as any);
  const [apiPrimaryOrderDetails, setApiPrimaryOrderDetails] = useState([] as any);
  const [primaryOrderId, setPrimaryOrderId] = useState<string>('');
  const [slotDuration, setSlotDuration] = useState<number>(0);

  const moveToMyOrders = () => {
    props.navigation.popToTop({ immediate: true }); //if not added, stack was getting cleared.
    props.navigation.push(AppRoutes.YourOrdersTest, {
      source: AppRoutes.OrderStatus,
    });
  };
  const { pharmacyUserTypeAttribute } = useAppCommonData();
  const { pharmacyCircleAttributes } = useShoppingCart();

  async function getOrderDetails(primaryId: string) {
    setLoading?.(true);
    try {
      let response = await fetchOrderDetails(primaryId);
      if (!!response && response?.data && !response?.errors) {
        let getOrderDetailsResponse = response?.data?.getDiagnosticOrderDetails?.ordersList || [];
        const getSlotDuration =
          response?.data?.getDiagnosticOrderDetails?.ordersList?.attributesObj
            ?.slotDurationInMinutes || AppConfig.Configuration.DEFAULT_PHELBO_ETA;
        setApiPrimaryOrderDetails([getOrderDetailsResponse]!);
        setSlotDuration(getSlotDuration);
      } else {
        setApiPrimaryOrderDetails([]);
      }
      setLoading?.(false);
    } catch (error) {
      setLoading?.(false);
      setApiPrimaryOrderDetails([]);
      CommonBugFender('getDiagnosticOrderDetails_TestOrderDetails', error);
    }
  }

  async function fetchOrderDetailsFromPayments() {
    setLoading?.(true);
    try {
      let response: any = await getDiagnosticRefundOrders(client, paymentId);
      if (response?.data?.data?.getOrderInternal) {
        const getResponse = response?.data?.data?.getOrderInternal?.DiagnosticsPaymentDetails;
        const getSlotDateTime = getResponse?.ordersList?.[0]?.slotDateTimeInUTC;
        const primaryOrderID = getResponse?.ordersList?.[0]?.primaryOrderID;
        const slotDuration =
          getResponse?.ordersList?.[0]?.attributesObj?.slotDurationInMinutes || 0;
        setApiOrderDetails([getResponse]);
        setTimeDate(getSlotDateTime);
        setSlotDuration(slotDuration);
        setIsSingleUhid(getResponse?.ordersList?.[0]?.length == 1);
        if (primaryOrderID) {
          setPrimaryOrderId(primaryOrderID);
          getOrderDetails(primaryOrderID);
        }
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
    if (modifiedOrderDetails == null) {
      postwebEngageCheckoutCompletedEvent();
    }
    firePurchaseEvent(orderDetails?.orderId, orderDetails?.amount, cartItems);
    clearDiagnoticCartInfo?.();
    submitReviewOnLabBook();
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const submitReviewOnLabBook = async () => {
    try {
      const { diagnosticDate } = orderDetails;
      let currentDate = new Date();
      let givenDate = new Date(diagnosticDate);
      var diff = (givenDate.getTime() - givenDate.getTime()) / 1000;
      diff /= 60 * 60;
      console.log(orderDetails, 'orderDetails');

      if (diff <= 48) {
        if (InAppReview.isAvailable()) {
          await InAppReview.RequestInAppReview()
            .then((hasFlowFinishedSuccessfully) => {
              if (hasFlowFinishedSuccessfully) {
                postCleverTapEventForTrackingAppReview();
              }
            })
            .catch((error) => {
              CommonBugFender('inAppReviewForDignostic', error);
            });
        }
      }
    } catch (error) {
      CommonBugFender('inAppRevireAfterPaymentForDignostic', error);
    }
  };

  const postCleverTapEventForTrackingAppReview = async () => {
    const uniqueId = await DeviceInfo.getUniqueId();
    const eventAttributes: CleverTapEvents[CleverTapEventName.PLAYSTORE_APP_REVIEW_AND_RATING] = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'User Type': pharmacyUserTypeAttribute?.User_Type || '',
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      'CT Source': Platform.OS,
      'Device ID': uniqueId,
      'Circle Member':
        getCleverTapCircleMemberValues(pharmacyCircleAttributes?.['Circle Membership Added']!) ||
        '',
      'Page Name': 'Dignostic Order Completed',
      'NAV Source': 'Dignostic',
    };
    postCleverTapEvent(
      Platform.OS == 'android'
        ? CleverTapEventName.APP_REVIEW_AND_RATING_TO_PLAYSTORE
        : CleverTapEventName.APP_REVIEW_AND_RATING_TO_APPSTORE,
      eventAttributes
    );
  };

  const postwebEngageCheckoutCompletedEvent = () => {
    let attributes = {
      ...eventAttributes,
      'Payment mode': isCOD ? 'Cash' : 'Prepaid',
      'Circle discount': circleSubscriptionId && orderCircleSaving ? orderCircleSaving : 0,
      'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_CHECKOUT_COMPLETED, attributes);
    postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_CHECKOUT_COMPLETED, attributes);
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
    return <View style={[styles.header]}></View>;
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
    const date = !!modifiedOrderDetails
      ? moment(modifiedOrderDetails?.slotDateTimeInUTC)?.format('DD MMM')
      : timeDate != '' && moment(timeDate)?.format('DD MMM');
    const year = !!modifiedOrderDetails
      ? moment(modifiedOrderDetails?.slotDateTimeInUTC)?.format('YYYY')
      : timeDate != '' && moment(timeDate)?.format('YYYY');
    const time = !!modifiedOrderDetails
      ? moment(modifiedOrderDetails?.slotDateTimeInUTC)?.format('hh:mm A')
      : timeDate != '' && moment(timeDate)?.format('hh:mm A');
    const rangeAddedTime = !!modifiedOrderDetails
      ? moment(modifiedOrderDetails?.slotDateTimeInUTC)
          ?.add(slotDuration, 'minutes')
          ?.format('hh:mm A')
      : timeDate != '' &&
        moment(timeDate)
          ?.add(slotDuration, 'minutes')
          ?.format('hh:mm A');
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
              {!!time && (
                <Text style={styles.pickupDate}>
                  | {time} - {rangeAddedTime}
                </Text>
              )}
            </Text>
          </View>
        ) : null}
      </>
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
    const arrayToUse = apiOrderDetails;
    return (
      <View>
        {!!arrayToUse && arrayToUse?.length > 0
          ? arrayToUse?.map((item: any) => {
              const orders = item?.ordersList;
              return orders?.map((order: any) => {
                return renderPatientTestView(order, item);
              });
            })
          : null}
      </View>
    );
  };
  const renderTestsModify = () => {
    //define type
    const arrayToUse = apiPrimaryOrderDetails;
    return (
      <View>
        {!!arrayToUse && arrayToUse?.length > 0
          ? arrayToUse?.map((item: any) => {
              const orders = item;
              return renderPatientTestView(orders, item);
            })
          : null}
      </View>
    );
  };

  const renderPatientTestView = (order: any, item: any) => {
    const displayId = order?.displayId;
    const lineItemsLength = order?.diagnosticOrderLineItems?.length;
    const lineItems = order?.diagnosticOrderLineItems;
    const remainingItems = !!lineItemsLength && lineItemsLength - 1;
    const { patientName, patientSalutation } = extractPatientDetails(order?.patientObj);
    return (
      <>
        <View style={styles.outerView}>
          <View style={styles.patientsView}>
            <Text style={styles.patientName}>
              {nameFormater(`${patientSalutation} ${patientName}`, 'title')}
            </Text>

            {!!displayId && <Text style={styles.pickupDate}>#{displayId}</Text>}
          </View>
          {!!lineItemsLength &&
            lineItemsLength > 0 &&
            (showMoreArray?.includes(displayId) ? null : (
              <View style={[styles.itemsView, { flexDirection: 'row' }]}>
                <Text style={styles.bulletStyle}>{'\u2B24'}</Text>
                <Text
                  style={[
                    styles.testName,
                    {
                      maxWidth: !!lineItems?.[0]?.editOrderID ? '72%' : '75%',
                    },
                  ]}
                >
                  {nameFormater(lineItems?.[0]?.itemName, 'title')}
                </Text>
                {!!lineItems?.[0]?.editOrderID ? renderNewTag() : null}
                {remainingItems > 0 && (
                  <TouchableOpacity onPress={() => _onPressMore(order)} style={{ marginLeft: 2 }}>
                    <Text style={styles.moreText}>+ {remainingItems} MORE</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          {showMoreArray?.includes(displayId) && renderMore(order, lineItems)}
        </View>
        <Spearator style={styles.separator} />
      </>
    );
  };

  const renderNewTag = () => {
    return (
      <View style={styles.newItemView}>
        <Text style={styles.newText}>NEW</Text>
      </View>
    );
  };

  function _onPressMore(item: any) {
    const displayId = item?.displayId;
    const array = showMoreArray?.concat(displayId);
    setShowMoreArray(array);
  }

  function _onPressLess(item: any) {
    const displayId = item?.displayId;
    const removeItem = showMoreArray?.filter((id: number) => id !== displayId);
    setShowMoreArray(removeItem);
  }

  const renderMore = (item: any, lineItems: any) => {
    return (
      <View style={styles.itemsView}>
        {lineItems?.map((items: any, index: number) => {
          return (
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.bulletStyle}>{'\u2B24'}</Text>
              <Text
                style={[
                  styles.testName,
                  {
                    maxWidth: !!items.editOrderID ? '72%' : '75%',
                  },
                ]}
              >
                {nameFormater(items?.itemName, 'default')}
              </Text>
              {!!items.editOrderID ? renderNewTag() : null}
              {lineItems?.length - 1 == index && (
                <TouchableOpacity onPress={() => _onPressLess(item)} style={{ marginLeft: 2 }}>
                  <Text style={styles.moreText}> LESS</Text>
                </TouchableOpacity>
              )}
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
            {renderNoticeText()}
            {/* {enable_cancelellation_policy ? renderCancelationPolicy() : null} */}
            {!!primaryOrderId && primaryOrderId != '' ? renderTestsModify() : renderTests()}
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
    paddingRight: width > 350 ? 16 : 35,
  },
  timeIconStyle: { height: 20, width: 20, resizeMode: 'contain', marginRight: 6 },
  patientsView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 6,
    marginRight: 6,
  },
  outerView: {
    backgroundColor: colors.WHITE,
    padding: 10,
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
});
