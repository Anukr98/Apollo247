import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { TestOrderSummaryView } from '@aph/mobile-patients/src/components/Tests/components/TestOrderSummaryView';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { FeedbackPopup } from '@aph/mobile-patients/src/components/FeedbackPopup';

import {
  ArrowRight,
  More,
  OrderPlacedIcon,
  ClockIcon,
  OvalUpcoming,
} from '@aph/mobile-patients/src/components/ui/Icons';
import _ from 'lodash';
import {
  AppConfig,
  DIAGNOSTIC_JUSPAY_INVALID_REFUND_STATUS,
  DIAGNOSTIC_ORDER_FAILED_STATUS,
  DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY,
  DIAGNOSTIC_SAMPLE_COLLECTED_STATUS,
  DIAGNOSTIC_SUB_STATUS_TO_SHOW,
  DIAGNOSTIC_FAILURE_STATUS_ARRAY,
  DIAGNOSTIC_ORDER_CANCELLED_STATUS,
  DIAGNOSTIC_PHELBO_TRACKING_STATUS,
} from '@aph/mobile-patients/src/strings/AppConfig';
import {
  GetPatientFeedback,
  GetPatientFeedbackVariables,
} from '@aph/mobile-patients/src/graphql/types/GetPatientFeedback';
import {
  GET_DIAGNOSTICS_ORDER_BY_DISPLAY_ID,
  GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
  GET_ORDER_LEVEL_DIAGNOSTIC_STATUS,
  GET_PATIENT_FEEDBACK,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getDiagnosticOrderDetails,
  getDiagnosticOrderDetailsVariables,
  getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_diagnosticOrderLineItems,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrderDetails';
import {
  downloadDiagnosticReport,
  g,
  getPatientNameById,
  getTestOrderStatusText,
  handleGraphQlError,
  isEmptyObject,
  nameFormater,
  navigateToScreenWithEmptyStack,
  removeWhiteSpaces,
  showDiagnosticCTA,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  Dimensions,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender, isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  CALL_TO_ORDER_CTA_PAGE_ID,
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
  DIAGNOSTIC_ORDER_STATUS,
  FEEDBACKTYPE,
  MedicalRecordType,
  REFUND_STATUSES,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';

import {
  diagnosticExotelCall,
  getDiagnosticPhelboDetails,
  getDiagnosticRefundOrders,
  getPatientPrismMedicalRecordsApi,
} from '@aph/mobile-patients/src/helpers/clientCalls';

import { RefundCard } from '@aph/mobile-patients/src/components/Tests/components/RefundCard';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import {
  DiagnosticFeedbackSubmitted,
  DiagnosticPhleboCallingClicked,
  DiagnosticTrackOrderViewed,
  DiagnosticViewReportClicked,
} from '@aph/mobile-patients/src/components/Tests/utils/Events';
import {
  getHCOrderFormattedTrackingHistory,
  getHCOrderFormattedTrackingHistoryVariables,
  getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_groupedPendingReportInclusions,
  getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_groupedPendingReportInclusions_inclusions,
  getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusHistory,
  getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusHistory_attributes_refund,
} from '@aph/mobile-patients/src/graphql/types/getHCOrderFormattedTrackingHistory';
import { StatusCard } from '@aph/mobile-patients/src/components/Tests/components/StatusCard';

import { colors } from '@aph/mobile-patients/src/theme/colors';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrdersStatus } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import { TestPdfRender } from '@aph/mobile-patients/src/components/Tests/components/TestPdfRender';

import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import {
  getDiagnosticOrderDetailsByDisplayID,
  getDiagnosticOrderDetailsByDisplayIDVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrderDetailsByDisplayID';

import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { CallToOrderView } from '@aph/mobile-patients/src/components/Tests/components/CallToOrderView';
import { Helpers as NeedHelpHelpers } from '@aph/mobile-patients/src/components/NeedHelp';
import { AgentDetailsCard } from '@aph/mobile-patients/src/components/Tests/components/AgentDetailsCard';
import { renderItemPriceShimmer } from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import { PhleboCallPopup } from '@aph/mobile-patients/src/components/Tests/components/PhleboCallPopup';
const DROP_DOWN_ARRAY_STATUS = [
  DIAGNOSTIC_ORDER_STATUS.PARTIAL_ORDER_COMPLETED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_SUBMITTED,
];

type orderStatus = getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrdersStatus;
type orderLineItems = getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList_diagnosticOrderLineItems;
type orderStatusTracking = getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusHistory;
type groupedInclusions = getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_groupedPendingReportInclusions_inclusions;
type groupedItems = getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_groupedPendingReportInclusions;
const screenWidth = Dimensions.get('window').width;
export interface TestOrderDetailsProps extends NavigationScreenProps {
  orderId: string;
  showOrderSummaryTab: boolean;
  goToHomeOnBack: boolean;
  selectedOrder: object;
  refundStatusArr?: any;
  refundTransactionId?: string;
  disableTrackOrder?: boolean;
  comingFrom?: string;
}
{
}

export const TestOrderDetails: React.FC<TestOrderDetailsProps> = (props) => {
  const orderId = props.navigation.getParam('orderId');
  const goToHomeOnBack = props.navigation.getParam('goToHomeOnBack');
  const showOrderSummaryTab = props.navigation.getParam('showOrderSummaryTab');
  const disableTrackOrderTab = props.navigation.getParam('disableTrackOrder');
  const selectedOrder = props.navigation.getParam('selectedOrder');
  const refundStatusArr = props.navigation.getParam('refundStatusArr');
  const source = props.navigation.getParam('comingFrom');
  const refundTransactionId = props.navigation.getParam('refundTransactionId');
  const { buildApolloClient, authToken, getPatientApiCall } = useAuth();
  const apolloClientWithAuth = buildApolloClient(authToken);
  const client = useApolloClient();
  const { getHelpSectionQueries } = NeedHelpHelpers;
  const [selectedTab, setSelectedTab] = useState<string>(
    showOrderSummaryTab ? string.orders.viewBill : string.orders.trackOrder
  );
  const [showRateDiagnosticBtn, setShowRateDiagnosticBtn] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const { showAphAlert, setLoading: globalLoading } = useUIElements();
  const [scrollYValue, setScrollYValue] = useState(0);
  const [slotDuration, setSlotDuration] = useState(0);
  const [loading1, setLoading] = useState<boolean>(true);
  const [slideCallToOrder, setSlideCallToOrder] = useState<boolean>(false);
  const [orderLevelStatus, setOrderLevelStatus] = useState([] as any);
  const [showInclusionStatus, setShowInclusionStatus] = useState<boolean>(false);
  const [showError, setError] = useState<boolean>(false);
  const [showOrderDetailsError, setShowErrorDetailsError] = useState<boolean>(false);
  const [dropDownItemListIndex, setDropDownItemListIndex] = useState([] as any);
  const [showViewReportModal, setShowViewReportModal] = useState<boolean>(false);
  const scrollViewRef = React.useRef<ScrollView | null>(null);
  const [orderDetails, setOrderDetails] = useState([] as any);
  const [orderSubscriptionDetails, setOrderSubscriptionDetails] = useState(null);
  const [queries, setQueries] = useState<NeedHelpHelpers.HelpSectionQuery[]>([]);
  const [phleboDetailsShimmer, setPhleboDetailsShimmer] = useState<boolean>(false);
  const [phleboDetails, setPhleboDetails] = useState({} as any);
  const [showPhleboCallPopUp, setShowPhleboCallPopUp] = useState<boolean>(false);
  const [callPhleboObj, setCallPhleboObj] = useState<any>('');
  const [showPhleboDetails, setShowPhleboDetails] = useState<boolean>(false);

  const scrollToSlots = (yValue?: number) => {
    const setY = yValue == undefined ? scrollYValue : yValue;
    scrollViewRef.current && scrollViewRef.current.scrollTo({ x: 0, y: setY, animated: true });
  };
  const { isDiagnosticCircleSubscription } = useDiagnosticsCart();
  const { diagnosticServiceabilityData } = useAppCommonData();
  const isPrepaid = selectedOrder?.paymentType === DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT;
  const getCTADetails = showDiagnosticCTA(
    CALL_TO_ORDER_CTA_PAGE_ID.TESTORDERSUMMARY,
    diagnosticServiceabilityData?.cityId!
  );
  var orderStatusList: any[] = [];
  var refundArr: any[] = [];
  var newList: any[] = [];

  //for showing the order level status.
  const fetchOrderLevelStatus = (orderId: string) =>
    client.query<getHCOrderFormattedTrackingHistory, getHCOrderFormattedTrackingHistoryVariables>({
      query: GET_ORDER_LEVEL_DIAGNOSTIC_STATUS,
      variables: { diagnosticOrderID: orderId },
      fetchPolicy: 'no-cache',
    });

  const fetchOrderDetails = (orderId: string) =>
    apolloClientWithAuth.query<getDiagnosticOrderDetails, getDiagnosticOrderDetailsVariables>({
      query: GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
      variables: { diagnosticOrderId: orderId },
      fetchPolicy: 'no-cache',
    });

  const getOrderDetails = async (displayId: string) => {
    const res = await apolloClientWithAuth.query<
      getDiagnosticOrderDetailsByDisplayID,
      getDiagnosticOrderDetailsByDisplayIDVariables
    >({
      query: GET_DIAGNOSTICS_ORDER_BY_DISPLAY_ID,
      variables: {
        displayId: Number(displayId),
      },
      fetchPolicy: 'no-cache',
    });
    return res;
  };

  useEffect(() => {
    if (source === 'deeplink') {
      fetchDiagnosticOrderDetails(orderId); //displayId
    } else {
      callOrderLevelStatusApi(orderId);
      callOrderDetailsApi(orderId);
      callOrderPhleboDetails(orderId);
      !!selectedOrder?.paymentOrderId &&
        isPrepaid &&
        callGetOrderInternal(selectedOrder?.paymentOrderId); //for getting the circle membership in case of prepaid
    }
  }, []);

  const fetchDiagnosticOrderDetails = async (displayId: string) => {
    setLoading?.(true);
    try {
      const res = await getOrderDetails(displayId);
      const { data } = res;
      const getData = data?.getDiagnosticOrderDetailsByDisplayID?.ordersList;
      const getOrderId = getData?.id;
      if (!!getOrderId) {
        callOrderLevelStatusApi(getOrderId);
        callOrderDetailsApi(getOrderId);
        callOrderPhleboDetails(getOrderId);
      } else {
        setLoading?.(false);
        setError(true);
      }
    } catch (error) {
      CommonBugFender('TestOrderDetails_fetchDiagnosticOrderDetails_try', error);
      setLoading?.(false);
      setError(true);
    }
  };

  async function callOrderLevelStatusApi(orderId: string) {
    try {
      let response = await fetchOrderLevelStatus(orderId);
      if (!!response && response?.data && !response?.errors) {
        let getOrderLevelStatus = response?.data?.getHCOrderFormattedTrackingHistory;
        setOrderLevelStatus(getOrderLevelStatus);
        getOrderLevelStatus?.statusHistory?.length == 0 && setError(true);
        setError(false);
      } else {
        setOrderLevelStatus([]);
        setError(true);
      }
    } catch (error) {
      setOrderLevelStatus([]);
      setError(true);
      CommonBugFender('getHCOrderFormattedTrackingHistory_TestOrderDetails', error);
    }
  }
  async function callOrderDetailsApi(orderId: string) {
    try {
      setLoading?.(true);
      let response = await fetchOrderDetails(orderId);
      if (!!response && response?.data && !response?.errors) {
        let getOrderDetails = response?.data?.getDiagnosticOrderDetails?.ordersList;
        setSlotDuration(
          getOrderDetails?.attributesObj?.slotDurationInMinutes ||
            AppConfig.Configuration.DEFAULT_PHELBO_ETA
        );
        setOrderDetails(getOrderDetails);
        setShowErrorDetailsError(false);
      } else {
        setOrderDetails([]);
        setShowErrorDetailsError(true);
      }
      setLoading?.(false);
    } catch (error) {
      setLoading?.(false);
      setOrderDetails([]);
      setShowErrorDetailsError(true);
      CommonBugFender('getDiagnosticOrderDetails_TestOrderDetails', error);
    }
  }

  async function callGetOrderInternal(paymentId: string) {
    setLoading?.(true);
    try {
      let response: any = await getDiagnosticRefundOrders(client, String(paymentId));
      const getSubscriptionDetails =
        response?.data?.data?.getOrderInternal?.SubscriptionOrderDetails;
      setOrderSubscriptionDetails?.(getSubscriptionDetails);
    } catch (error) {
      setOrderSubscriptionDetails(null);
      CommonBugFender('getOrderInternal_TestOrderDetails', error);
    } finally {
      setLoading?.(false);
    }
  }

  async function callOrderPhleboDetails(orderId: string) {
    setPhleboDetailsShimmer(true);
    try {
      const response: any = await getDiagnosticPhelboDetails(client, orderId);
      const orderPhleboDetailsBulk =
        response?.data?.data?.getOrderPhleboDetailsBulk?.orderPhleboDetailsBulk;
      if (!!orderPhleboDetailsBulk && orderPhleboDetailsBulk?.length > 0) {
        //would always be 1.
        setPhleboDetails(createPhleboDetailsObject(orderPhleboDetailsBulk?.[0]));
      } else {
        setPhleboDetails({});
      }
    } catch (error) {
      setPhleboDetails({});
      CommonBugFender('callOrderPhleboDetails_TestOrderDetails', error);
    } finally {
      setPhleboDetailsShimmer(false);
    }
  }

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    if (currentPatient) {
      updateRateDeliveryBtnVisibility();
    }
  }, []);

  useEffect(() => {
    if (selectedTab === string.orders.viewBill) {
      scrollToSlots(0);
    }
    if (selectedTab == string.orders.trackOrder && newList?.length > 0) {
      let latestStatus = newList?.[newList?.length - 1]?.orderStatus;
      DiagnosticTrackOrderViewed(
        currentPatient,
        latestStatus,
        orderId,
        'My Order',
        isDiagnosticCircleSubscription
      );
    }
  }, [selectedTab]);

  function createPhleboDetailsObject(detailsObject: any) {
    const phleboObject = {
      phleboRating: detailsObject?.orderPhleboDetails?.phleboEta,
      phleboOTP: detailsObject?.orderPhleboDetails?.phleboOTP,
      checkinDateTime: detailsObject?.phleboEta,
      phleboTrackLink: detailsObject?.orderPhleboDetails?.phleboTrackLink,
      allowCalling: detailsObject?.allowCalling,
      showPhleboDetails: detailsObject?.showPhleboDetails,
      phleboDetailsETAText: detailsObject?.phleboDetailsETAText,
      allowCallingETAText: detailsObject?.allowCallingETAText,
      isPhleboChanged: detailsObject?.orderPhleboDetails?.isPhleboChanged,
      diagnosticPhlebotomists: {
        name: detailsObject?.orderPhleboDetails?.diagnosticPhlebotomists?.name,
        mobile: detailsObject?.orderPhleboDetails?.diagnosticPhlebotomists?.mobile,
        vaccinationStatus:
          detailsObject?.orderPhleboDetails?.diagnosticPhlebotomists?.vaccinationStatus,
      },
    };
    return phleboObject;
  }

  const createRefundObject = () => {
    refundArr = [];
    var refundObj = {};
    if (refundStatusArr?.[0]?.status == REFUND_STATUSES?.SUCCESS) {
      refundObj = {
        orderStatus: REFUND_STATUSES.PENDING,
        statusDate: refundStatusArr?.[0]?.created_at,
      };
      refundArr.push(refundObj, {
        orderStatus: refundStatusArr?.[0]?.status,
        statusDate: refundStatusArr?.[0]?.updated_at,
      });
    } else {
      refundArr.push({
        orderStatus: DIAGNOSTIC_JUSPAY_INVALID_REFUND_STATUS.includes(refundStatusArr?.[0]?.status)
          ? REFUND_STATUSES.PENDING
          : refundStatusArr?.[0]?.status,
        statusDate: refundStatusArr?.[0]?.created_at,
      });
    }

    return refundArr;
  };

  const fetchTestReportResult = useCallback(() => {
    setLoading?.(true);
    const getVisitId = selectedOrder?.visitNo;
    getPatientPrismMedicalRecordsApi(
      client,
      !!selectedOrder?.patientId ? selectedOrder?.patientId : currentPatient?.id,
      [MedicalRecordType.TEST_REPORT],
      'Diagnostics'
    )
      .then((data: any) => {
        const labResultsData = data?.getPatientPrismMedicalRecords_V3?.labResults?.response;
        let resultForVisitNo = labResultsData?.find((item: any) => item?.identifier == getVisitId);
        !!resultForVisitNo
          ? props.navigation.navigate(AppRoutes.HealthRecordDetails, {
              data: resultForVisitNo,
              labResults: true,
            })
          : renderReportError(string.diagnostics.responseUnavailableForReport);
      })
      .catch((error) => {
        CommonBugFender('TestOrderDetails_fetchTestReportsData', error);
        currentPatient && handleGraphQlError(error);
      })
      .finally(() => setLoading?.(false));
  }, []);

  if (!!orderLevelStatus && !_.isEmpty(orderLevelStatus) && refundStatusArr?.length > 0) {
    const getObject = createRefundObject();
    orderStatusList =
      orderLevelStatus?.statusHistory?.length > 0 ? [...orderLevelStatus?.statusHistory] : [];

    const isAlreadyPresent = orderStatusList?.find(
      (item: any) => item?.orderStatus == getObject?.[0]?.orderStatus
    );
    //avoid pushing duplicates to list
    if (isAlreadyPresent != undefined) {
    } else {
      getObject?.map((item) => orderStatusList?.push(item));
    }
  }

  const isReportGenerated = orderLevelStatus?.statusInclusions?.find(
    (item: any) => item?.orderStatus == DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED
  );

  const handleBack = () => {
    if (goToHomeOnBack && source === AppRoutes.CartPage) {
      navigateToScreenWithEmptyStack(props.navigation, AppRoutes.YourOrdersTest, {
        source: AppRoutes.OrderStatus,
      });
    } else {
      props.navigation.goBack();
    }
    return true;
  };

  useEffect(() => {
    const _didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    });
    const _willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });
    return () => {
      _didFocusSubscription && _didFocusSubscription.remove();
      _willBlurSubscription && _willBlurSubscription.remove();
    };
  }, []);

  const updateRateDeliveryBtnVisibility = async () => {
    setLoading?.(true);
    try {
      if (!showRateDiagnosticBtn) {
        const response = await client.query<GetPatientFeedback, GetPatientFeedbackVariables>({
          query: GET_PATIENT_FEEDBACK,
          variables: {
            patientId: !!selectedOrder?.patientId
              ? selectedOrder?.patientId
              : currentPatient?.id || '',
            transactionId: `${selectedOrder?.id}`,
          },
          fetchPolicy: 'no-cache',
        });
        const feedback = response?.data?.getPatientFeedback?.feedback?.length;
        if (!feedback) {
          setShowRateDiagnosticBtn(true);
        }
      }
      setLoading?.(false);
    } catch (error) {
      setLoading?.(false);
      CommonBugFender(`${AppRoutes.TestOrderDetails}_updateRateDeliveryBtnVisibility`, error);
    }
  };

  const renderOrderReportTat = (reportTat: any) => {
    const isTatBreach = moment().isSameOrAfter(
      orderDetails?.attributesObj?.expectedReportGenerationTime
    );
    return (
      <View style={styles.reportTatBottomview}>
        <ClockIcon style={styles.clockIconStyle} />
        <Text style={styles.reportOrderTextStyle}>
          {isTatBreach ? AppConfig.Configuration.DIAGNOSTICS_REPORT_TAT_BREACH_TEXT : reportTat}
        </Text>
      </View>
    );
  };

  const renderRefund = () => {
    const isOrderModified = orderDetails?.diagnosticOrderLineItems?.find(
      (item: orderLineItems) => !!item?.editOrderID && item?.editOrderID
    );
    if (!!orderLevelStatus && !_.isEmpty(orderLevelStatus) && refundStatusArr?.length > 0) {
      return (
        <RefundCard
          refundArray={refundStatusArr}
          isModified={!!isOrderModified ? true : false}
          totalPrice={orderDetails?.totalPrice}
        />
      );
    }
  };

  const getFormattedDate = (time: string) => {
    return moment(time).format('D MMM YYYY');
  };

  const getFormattedTime = (time: string) => {
    return moment(time).format('hh:mm A');
  };

  const renderGraphicalStatus = (order: any, index: number, isStatusDone: boolean, array: any) => {
    return (
      <View style={styles.graphicalStatusViewStyle}>
        {isStatusDone ? (
          <OrderPlacedIcon style={styles.statusIconStyle} />
        ) : (
          <OvalUpcoming style={[styles.statusIconSmallStyle]} />
        )}

        <View
          style={[
            styles.verticalProgressLine,
            {
              backgroundColor:
                index == array?.length - 1
                  ? 'transparent'
                  : isStatusDone
                  ? theme.colors.SKY_BLUE
                  : 'rgba(0,179,142,0.3)',
              minHeight: isStatusDone ? 0 : 60,
            },
          ]}
        />
      </View>
    );
  };

  const renderCustomDescriptionOrDateAndTime = (data: orderStatus) => {
    return (
      <View style={{ marginLeft: 5 }}>
        <Text style={styles.dateTimeStyle}>
          {!!data?.statusDate
            ? getFormattedDate(data?.statusDate)
            : getFormattedDate(orderDetails?.createdDate)}
        </Text>
        <Text style={styles.timeStyle}>
          {!!data?.statusDate
            ? getFormattedTime(data?.statusDate)
            : getFormattedTime(orderDetails?.createdDate)}
        </Text>
      </View>
    );
  };

  const renderOrderTracking = () => {
    newList =
      refundStatusArr?.length > 0
        ? orderStatusList
        : orderLevelStatus?.upcomingStatuses?.length > 0
        ? orderLevelStatus?.statusHistory.concat(orderLevelStatus?.upcomingStatuses)
        : orderLevelStatus?.statusHistory;
    scrollToSlots();
    return (
      <View>
        <View style={{ margin: 20 }}>
          {newList?.map((order: any, index: number, array: any) => {
            const showInclusions = orderLevelStatus?.statusHistory?.find(
              (item: any) => item?.orderStatus === order?.orderStatus
            );

            //don't show if order is completed
            const isOrderCompleted = orderLevelStatus?.statusHistory?.find(
              (item: any) => item?.orderStatus === DIAGNOSTIC_ORDER_STATUS.ORDER_COMPLETED
            );

            const isPOC =
              isOrderCompleted == undefined &&
              orderLevelStatus?.statusHistory?.find(
                (item: any) => item?.orderStatus === DIAGNOSTIC_ORDER_STATUS.PARTIAL_ORDER_COMPLETED
              );

            const isSampleSubmitted =
              isOrderCompleted == undefined &&
              isPOC === undefined &&
              orderLevelStatus?.statusHistory?.find(
                (item: any) => item?.orderStatus === DIAGNOSTIC_ORDER_STATUS.SAMPLE_SUBMITTED
              );

            //status which we want to show on ui
            const showStatus = getTestOrderStatusText(order?.orderStatus) != '';
            let isStatusDone = true;
            if (order?.__typename == 'upcomingStatus') {
              isStatusDone = false;
            }
            const changeModifiedText =
              order?.orderStatus === DIAGNOSTIC_ORDER_STATUS.ORDER_MODIFIED &&
              DIAGNOSTIC_SUB_STATUS_TO_SHOW?.includes(order?.subStatus!);

            return (
              <>
                {!!showStatus && showStatus ? (
                  <View
                    style={styles.rowStyle}
                    onLayout={(event) => {
                      const layout = event.nativeEvent.layout;
                      if (isStatusDone && selectedTab === string.orders.trackOrder) {
                        setScrollYValue(layout.y);
                      }
                    }}
                  >
                    {renderGraphicalStatus(order, index, isStatusDone, array)}
                    <View style={{ marginBottom: 8, flex: 1 }}>
                      <View
                        style={[isStatusDone ? styles.statusDoneView : styles.statusUpcomingView]}
                      >
                        <View style={styles.flexRow}>
                          <View style={{ width: '75%' }}>
                            <Text
                              style={[
                                styles.statusTextStyle,
                                {
                                  color:
                                    DIAGNOSTIC_ORDER_FAILED_STATUS.includes(order?.orderStatus) ||
                                    order?.orderStatus ==
                                      DIAGNOSTIC_ORDER_STATUS.SAMPLE_REJECTED_IN_LAB
                                      ? theme.colors.INPUT_FAILURE_TEXT
                                      : theme.colors.SHERPA_BLUE,
                                },
                              ]}
                            >
                              {nameFormater(
                                getTestOrderStatusText(order?.orderStatus, changeModifiedText),
                                'title'
                              )}
                            </Text>
                          </View>
                          {isStatusDone ? (
                            renderCustomDescriptionOrDateAndTime(order)
                          ) : (
                            <View style={{ width: '25%' }} />
                          )}
                        </View>
                        {renderSubStatus(order, index)}
                        {showContentBasedOnStatus(order, isStatusDone, index)}
                        {/** since this can with any combination */}
                        {!!isOrderCompleted
                          ? null
                          : !!showInclusions &&
                            DROP_DOWN_ARRAY_STATUS.includes(showInclusions?.orderStatus)
                          ? !!isPOC &&
                            order?.orderStatus === DIAGNOSTIC_ORDER_STATUS.PARTIAL_ORDER_COMPLETED
                            ? renderInclusionLevelDropDown(order)
                            : !!isSampleSubmitted &&
                              order?.orderStatus === DIAGNOSTIC_ORDER_STATUS.SAMPLE_SUBMITTED
                            ? renderInclusionLevelDropDown(order)
                            : null
                          : null}
                      </View>
                    </View>
                  </View>
                ) : null}
              </>
            );
          })}
        </View>
        {renderRefund()}
        <View style={{ height: 60 }} />
      </View>
    );
  };

  function showContentBasedOnStatus(order: any, isStatusDone: boolean, index: number) {
    const orderStatus = order?.orderStatus;
    const slotDate = moment(selectedOrder?.slotDateTimeInUTC)?.format('Do MMM');
    const slotTime1 = moment(selectedOrder?.slotDateTimeInUTC)?.format('hh:mm A');
    const slotTime2 = moment(selectedOrder?.slotDateTimeInUTC)
      ?.add(slotDuration, 'minutes')
      ?.format('hh:mm A');

    if (orderStatus === DIAGNOSTIC_ORDER_STATUS.PHLEBO_CHECK_IN) {
      if (!isStatusDone) {
        return (
          <>
            <Text style={styles.statusSubTextStyle}>
              {`Apollo agent will arrive on ${slotDate}, ${slotTime1} - ${slotTime2}`}
            </Text>
            {renderPhleboDetailsSection(isStatusDone)}
          </>
        );
      } else {
        if (DIAGNOSTIC_PHELBO_TRACKING_STATUS.includes(orderDetails?.orderStatus)) {
          return renderPhleboDetailsSection(isStatusDone);
        }
      }
    }
    if (DIAGNOSTIC_SAMPLE_COLLECTED_STATUS?.includes(orderStatus)) {
      if (!isStatusDone) {
        return <Text style={styles.statusSubTextStyle}>{`Invoice to be Generated`}</Text>;
      } else {
        if (orderDetails?.invoiceURL) {
          return renderInvoiceGenerated();
        }
      }
    }
    if (orderStatus === DIAGNOSTIC_ORDER_STATUS.ORDER_COMPLETED) {
      if (isStatusDone && !!showRateDiagnosticBtn) {
        return renderFeedbackOption();
      }
    }
    if (orderStatus === DIAGNOSTIC_ORDER_STATUS.ORDER_COMPLETED && !isStatusDone) {
      if (DIAGNOSTIC_ORDER_STATUS.PARTIAL_ORDER_COMPLETED != selectedOrder?.orderStatus) {
        return renderOrderCompletedHint();
      }
    }
    if (orderStatus === DIAGNOSTIC_ORDER_STATUS.ORDER_RESCHEDULED) {
      return renderReschuleTime();
    }
    if (
      orderStatus === DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED ||
      orderStatus === DIAGNOSTIC_ORDER_STATUS.PAYMENT_FAILED
    ) {
      const refundData = order?.attributes?.refund;
      return renderOrderRefund(refundData);
    }
    //for partial orders
    if (orderStatus === DIAGNOSTIC_ORDER_STATUS.REFUND_INITIATED) {
      return renderPartialOrder(order, index);
    }
    if (DIAGNOSTIC_ORDER_CANCELLED_STATUS.includes(orderStatus)) {
      return renderOrderCancelledView(order, index);
    }
  }

  const renderPhleboDetailsSection = (isStatusDone: boolean) => {
    return phleboDetailsShimmer
      ? renderItemPriceShimmer()
      : !!phleboDetails && !isEmptyObject(phleboDetails)
      ? renderPhleboDetails(isStatusDone)
      : null;
  };

  function _onPressPhleboCall(phleboName: string, orderId: string) {
    //if allowCalling is true.
    const id = orderId?.toString();
    DiagnosticPhleboCallingClicked(currentPatient, id, phleboName, isDiagnosticCircleSubscription);
    setShowPhleboCallPopUp(false);
    _callDiagnosticExotelApi(orderId);
  }

  async function _callDiagnosticExotelApi(orderId: string) {
    try {
      setLoading?.(true);
      const exotelResponse = await diagnosticExotelCall(client, orderId);
      if (exotelResponse?.data?.diagnosticExotelCalling) {
        const callingResponse = exotelResponse?.data?.diagnosticExotelCalling;
        if (callingResponse?.success) {
        } else {
          renderReportError(
            !!callingResponse?.errorMessage && callingResponse?.errorMessage != ''
              ? callingResponse?.errorMessage
              : string.diagnostics.phleboCallingError
          );
        }
      } else {
        renderReportError(string.diagnostics.phleboCallingError);
      }
      setLoading?.(false);
    } catch (error) {
      setLoading?.(false);
      renderReportError(string.diagnostics.phleboCallingError);
      CommonBugFender('_callDiagnosticExotelApi_TestOrderDetails', error);
    }
  }

  const renderPhleboCallPopup = () => {
    return (
      <PhleboCallPopup
        onPressBack={() => {
          setShowPhleboCallPopUp(false);
        }}
        onPressProceed={() => {
          _onPressPhleboCall(callPhleboObj?.name, callPhleboObj?.orderId);
        }}
      />
    );
  };

  const renderPhleboDetails = (isStatusDone: boolean) => {
    const showDetails =
      !!phleboDetails && !isEmptyObject(phleboDetails) && phleboDetails?.showPhleboDetails;
    return (
      showDetails && (
        <View style={{ marginTop: 8 }}>
          {isStatusDone && <Spearator />}
          <AgentDetailsCard
            orderId={orderDetails?.displayId}
            phleboDetailsObject={phleboDetails}
            orderLevelStatus={orderDetails?.orderStatus}
            currentPatient={currentPatient}
            isDiagnosticCircleSubscription={isDiagnosticCircleSubscription}
            onPressCallOption={(name, number) => {
              setShowPhleboCallPopUp(true);
              const callObj = {
                name: name,
                number: number,
                orderId: orderDetails?.id,
              };
              setCallPhleboObj(callObj);
            }}
            source={AppRoutes.TestOrderDetails}
            showCardView={!isStatusDone}
          />
        </View>
      )
    );
  };

  const renderOrderCancelledView = (order: orderStatusTracking, index: number) => {
    const refundDetails = order?.attributes?.refund;
    return (
      <>
        {!!refundDetails && refundDetails?.length > 0 && (
          <View>
            <Spearator style={styles.horizontalSeparator} />

            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => _onPressDropDown(index)}
              style={styles.itemsTouch}
            >
              <Text style={styles.itemsAddedText}>{refundDetails?.length} refunds processed</Text>
              <ArrowRight
                style={{
                  transform: [
                    { rotate: dropDownItemListIndex?.includes(index) ? '270deg' : '90deg' },
                  ],
                  tintColor: colors.LIGHT_BLUE,
                }}
              />
            </TouchableOpacity>
            {dropDownItemListIndex?.includes(index) &&
              refundDetails?.map((item) => {
                const itemsCount = item?.items?.length;
                return (
                  <View>
                    {!!itemsCount && itemsCount > 0 ? (
                      <View style={styles.cancelItemClosedView}>
                        <Text style={styles.itemsNameAddedText}>
                          Refund for {itemsCount} {itemsCount == 1 ? 'item' : 'items'}
                        </Text>
                        <Text style={styles.itemsNameAddedText}>
                          {string.common.Rs}
                          {item?.amount}
                        </Text>
                      </View>
                    ) : null}
                    {!!item?.txnID && (
                      <Text style={styles.cancelledRefundDetails}>Txn id : {item?.txnID}</Text>
                    )}
                  </View>
                );
              })}
          </View>
        )}
      </>
    );
  };

  const renderPartialOrder = (order: orderStatusTracking, index: number) => {
    const refundDetails = order?.attributes?.refund;
    return (
      <>
        {!!refundDetails && refundDetails?.length > 0
          ? refundDetails?.map((item) => {
              const itemsForRefund = item?.items;
              return (
                <View>
                  {!!item?.amount && item?.amount > 0 && (
                    <Text style={styles.refundAmountStyle}>
                      Refund Amount: {string.common.Rs}
                      {item?.amount}
                    </Text>
                  )}
                  {!!item?.txnID && <Text style={styles.refundTxnId}>Txn id: {item?.txnID} </Text>}
                  {!!item?.amount && item?.amount > 0 && (
                    <Text style={styles.amountRefundDaysText}>
                      *Amount will be refunded within 5 to 7 working days
                    </Text>
                  )}
                  {!!item?.reason && item?.reason != '' && (
                    <View style={styles.refundReasonView}>
                      <Text style={styles.refundAmountStyle}>
                        Refund Reason : <Text>{item?.reason}</Text>
                      </Text>
                    </View>
                  )}
                  {/**show items */}
                  {!!itemsForRefund && itemsForRefund?.length > 0 ? (
                    <View style={{ marginTop: '2%' }}>
                      <Spearator style={styles.horizontalSeparator} />
                      <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={() => _onPressDropDown(index)}
                        style={styles.itemsTouch}
                      >
                        <Text style={styles.itemsAddedText}>
                          Refund for {itemsForRefund?.length}
                          {itemsForRefund?.length == 1 ? ' item' : ' items'}
                        </Text>
                        <ArrowRight
                          style={{
                            transform: [
                              {
                                rotate: dropDownItemListIndex?.includes(index) ? '270deg' : '90deg',
                              },
                            ],
                            tintColor: colors.LIGHT_BLUE,
                          }}
                        />
                      </TouchableOpacity>
                      {dropDownItemListIndex?.includes(index) &&
                        itemsForRefund?.map((refundItems) => {
                          return (
                            <View style={styles.cancelItemClosedView}>
                              <Text style={styles.itemsNameAddedText}>
                                {nameFormater(refundItems?.itemName!, 'default')}
                              </Text>
                              <Text style={styles.itemsNameAddedText}>
                                {string.common.Rs}
                                {refundItems?.price}
                              </Text>
                            </View>
                          );
                        })}
                    </View>
                  ) : null}
                </View>
              );
            })
          : null}
      </>
    );
  };

  const renderOrderRefund = (
    refundDetails:
      | getHCOrderFormattedTrackingHistory_getHCOrderFormattedTrackingHistory_statusHistory_attributes_refund[]
      | any
  ) => {
    return (
      <View>
        {!!refundDetails &&
          refundDetails?.length > 0 &&
          refundDetails?.map((refData: any) => {
            const textToUse =
              refData?.status === REFUND_STATUSES.SUCCESS
                ? 'Amount Refunded: '
                : 'Refund Initiated for Amount: ';
            return (
              <View>
                <Text style={styles.refundAmountStyle}>
                  {textToUse} {string.common.Rs}
                  {refData?.amount}
                </Text>
                <Text style={styles.refundTxnId}>Txn id: {refData?.txnID}</Text>
              </View>
            );
          })}
      </View>
    );
  };

  const renderInvoiceGenerated = () => {
    return (
      <View style={styles.viewInvoiceView}>
        <Text style={styles.invoiceGeneratedText}>Invoice is generated</Text>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={onPressInvoice}
          style={{ justifyContent: 'center' }}
        >
          <Text style={styles.yellowText}>VIEW INVOICE</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderReschuleTime = () => {
    const rescheduleDate =
      !!orderDetails && moment(orderDetails?.slotDateTimeInUTC)?.format('DD MMM, hh:mm A');
    return (
      <>
        {!!rescheduleDate ? (
          <View style={{ marginVertical: '2%' }}>
            <Spearator style={[styles.horizontalSeparator]} />
            <Text style={styles.itemsAddedText}>Rescheduled for {rescheduleDate}</Text>
          </View>
        ) : null}
      </>
    );
  };

  /**
   * show this only for modification + prepaid negative cases
   */
  const renderSubStatus = (order: orderStatusTracking, index: number) => {
    return (
      <>
        {!!order &&
        order?.orderStatus === DIAGNOSTIC_ORDER_STATUS.ORDER_MODIFIED &&
        DIAGNOSTIC_SUB_STATUS_TO_SHOW?.includes(order?.subStatus!) ? (
          <View>
            <View style={styles.subStatusView}>
              <StatusCard
                titleText={order?.subStatus!}
                titleStyle={{
                  ...theme.fonts.IBMPlexSansMedium(11),
                }}
                containerStyle={styles.statusCardContainer}
              />
            </View>
            {!!order?.attributes?.refund && order?.attributes?.refund?.length > 0
              ? renderOrderRefund(order?.attributes?.refund!)
              : null}
          </View>
        ) : (
          renderItemsView(order, index)
        )}
      </>
    );
  };

  function _onPressDropDown(index: number) {
    const isPresent = dropDownItemListIndex?.find((id: number) => id === index);
    if (!!isPresent) {
      const newArray = dropDownItemListIndex?.filter((id: number) => id !== index);
      setDropDownItemListIndex(newArray);
    } else {
      const array = dropDownItemListIndex?.concat(index);
      setDropDownItemListIndex(array);
    }
  }

  const renderItemsView = (order: orderStatusTracking, index: number) => {
    const itemsLength = order?.attributes?.itemsModified;
    const addedItems =
      (!!itemsLength &&
        itemsLength?.length > 0 &&
        itemsLength?.filter((item: any) => !item?.isRemoved)) ||
      [];
    const removedItems =
      (!!itemsLength &&
        itemsLength?.length > 0 &&
        itemsLength?.filter((item: any) => item?.isRemoved)) ||
      [];
    const isAdded = !!addedItems && addedItems?.length > 0;
    const isRemoved = !!removedItems && removedItems?.length > 0;
    const addedItemPrices = !!addedItems && addedItems?.map((item: any) => item?.price);

    const removedItemsPrices = !!removedItems && removedItems?.map((item: any) => item?.price);
    const totalAddItemsPrice =
      !!addedItemPrices && addedItemPrices?.reduce((curr: number, prev: number) => curr + prev, 0);
    const totalRemovedItemsPrice =
      !!removedItemsPrices &&
      removedItemsPrices?.reduce((curr: number, prev: number) => curr + prev, 0);

    const totalPrice =
      totalAddItemsPrice > 0 && totalRemovedItemsPrice > 0
        ? totalAddItemsPrice - totalRemovedItemsPrice
        : totalAddItemsPrice > 0
        ? totalAddItemsPrice
        : totalRemovedItemsPrice;
    return (
      <>
        {!!itemsLength && itemsLength?.length > 0 ? (
          <View style={{ marginVertical: '2%' }}>
            <Spearator style={styles.horizontalSeparator} />
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => _onPressDropDown(index)}
              style={styles.itemsTouch}
            >
              <>
                {(isAdded && isRemoved) || (isRemoved && !isAdded) ? (
                  <>
                    <Text style={styles.itemsAddedText}>
                      {itemsLength?.length} items modified in order
                    </Text>
                    <ArrowRight
                      style={{
                        transform: [
                          { rotate: dropDownItemListIndex?.includes(index) ? '270deg' : '90deg' },
                        ],
                        tintColor: colors.LIGHT_BLUE,
                      }}
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.itemsAddedText}>
                      {isAdded ? addedItems?.length : removedItems?.length} items{' '}
                      {isAdded ? 'added' : 'removed'} in cart
                    </Text>
                    <View style={styles.flexRow}>
                      <Text style={[styles.itemsAddedText, { marginRight: 6 }]}>
                        {string.common.Rs}
                        {totalPrice}
                      </Text>
                      <ArrowRight
                        style={{
                          transform: [
                            { rotate: dropDownItemListIndex?.includes(index) ? '270deg' : '90deg' },
                          ],
                          tintColor: colors.LIGHT_BLUE,
                        }}
                      />
                    </View>
                  </>
                )}
              </>
            </TouchableOpacity>
            {dropDownItemListIndex?.includes(index) &&
              (isAdded && isRemoved ? itemsLength : isAdded ? addedItems : removedItems)?.map(
                (items: any) => {
                  return (
                    <View
                      style={[styles.flexRow, { justifyContent: 'space-between', marginTop: '4%' }]}
                    >
                      <View style={styles.modificationItemView}>
                        <Text style={[styles.itemsNameAddedText, { width: '87%' }]}>
                          {nameFormater(items?.itemName, 'default')}
                        </Text>
                        {!!items?.isRemoved && items.isRemoved ? renderRemoveTag() : null}
                      </View>
                      <Text style={styles.itemsNameAddedText}>
                        {string.common.Rs}
                        {items?.price}
                      </Text>
                    </View>
                  );
                }
              )}
          </View>
        ) : null}
      </>
    );
  };

  const renderRemoveTag = () => {
    return (
      <View style={styles.removedItemView}>
        <Text style={styles.removedText}>REMOVED</Text>
      </View>
    );
  };

  const renderInclusionLevelDropDown = (order: any) => {
    //replaced groupedPendingReportInclusions => statusInclusions
    const isGroupedInclusions =
      !!orderLevelStatus?.groupedPendingReportInclusions &&
      orderLevelStatus?.groupedPendingReportInclusions?.length > 0;

    //done for old orders
    if (isGroupedInclusions) {
      return renderGroupedInclusions();
    } else {
      return renderStatusInclusions();
    }
  };

  function findTestInclusionStatusDetails() {
    const totalInclusions = orderLevelStatus?.statusInclusions?.length;
    const hasDiffStatusLevelInclusion = !!orderLevelStatus?.statusInclusions && totalInclusions > 0;

    const isReportText = orderLevelStatus?.statusHistory?.find(
      (item: any) => item?.orderStatus == DIAGNOSTIC_ORDER_STATUS.PARTIAL_ORDER_COMPLETED
    );
    const pendingReportInclusions = orderLevelStatus?.statusInclusions?.filter(
      (item: any) => item?.orderStatus !== DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED
    );

    const sampleRejectedInclusions = orderLevelStatus?.statusInclusions?.filter(
      (item: any) => item?.orderStatus === DIAGNOSTIC_ORDER_STATUS.SAMPLE_REJECTED_IN_LAB
    );

    const sampleSubmittedInclusions = orderLevelStatus?.statusInclusions?.filter((item: any) =>
      DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY.includes(item?.orderStatus)
    );

    const reportText =
      !!pendingReportInclusions && pendingReportInclusions?.length > 0 && isReportText
        ? `Report pending for ${pendingReportInclusions?.length} of ${totalInclusions} tests`
        : !!sampleRejectedInclusions && sampleRejectedInclusions?.length > 0
        ? `${sampleRejectedInclusions?.length} test in order rejected `
        : !!sampleSubmittedInclusions &&
          sampleSubmittedInclusions?.length == orderLevelStatus?.statusInclusions?.length
        ? 'All samples are submitted'
        : !!sampleSubmittedInclusions && sampleSubmittedInclusions?.length > 0
        ? `${sampleSubmittedInclusions?.length} ${
            sampleSubmittedInclusions?.length == 1 ? 'test' : 'tests'
          } in order are sample submitted `
        : 'Sample collected';

    return {
      hasDiffStatusLevelInclusion,
      reportText,
    };
  }

  const renderGroupedInclusions = () => {
    const hasDiffStatusLevelInclusion = findTestInclusionStatusDetails()
      ?.hasDiffStatusLevelInclusion;
    const reportText = findTestInclusionStatusDetails()?.reportText;
    const groupedStatus = orderLevelStatus?.groupedPendingReportInclusions;
    return (
      <>
        {!hasDiffStatusLevelInclusion ? null : (
          <View>
            <View style={styles.lineSeparator} />
            <View style={styles.inclusionContainer}>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => setShowInclusionStatus(!showInclusionStatus)}
                style={styles.viewRowStyle}
              >
                <Text style={styles.itemNameText}>{!!reportText ? reportText : ''}</Text>
                <ArrowRight
                  style={{
                    transform: [{ rotate: showInclusionStatus ? '270deg' : '90deg' }],
                    tintColor: colors.LIGHT_BLUE,
                  }}
                />
              </TouchableOpacity>
            </View>

            {showInclusionStatus &&
              groupedStatus?.map((item: any, index: number) => {
                let selectedItem = item?.inclusions;
                const hasReportTat = !!item?.reportTATMessage && item?.reportTATMessage != '';
                return (
                  <View
                    style={[
                      hasReportTat ? styles.groupedOuterView : styles.groupedOuterViewWithout,
                    ]}
                  >
                    {selectedItem?.map((inclusionItem: groupedInclusions, itemIndex: number) => {
                      return (
                        <>
                          {!!inclusionItem?.itemName ? (
                            <View style={{}}>
                              <View style={[styles.itemNameContainer, { marginBottom: 8 }]}>
                                <View style={{ width: '40%' }}>
                                  <Text style={styles.itemNameText}>
                                    {nameFormater(inclusionItem?.itemName, 'default')}
                                  </Text>
                                </View>
                                <StatusCard
                                  titleText={inclusionItem?.orderStatus!}
                                  customText={
                                    inclusionItem?.itemId == 8 &&
                                    inclusionItem?.orderStatus ===
                                      DIAGNOSTIC_ORDER_STATUS.SAMPLE_NOT_COLLECTED_IN_LAB
                                  }
                                />
                              </View>
                            </View>
                          ) : null}
                          {itemIndex === selectedItem?.length - 1 ? null : (
                            <View style={styles.fullInclusionLevelSeparator} />
                          )}
                        </>
                      );
                    })}
                    {renderGroupedReportTat(item)}
                  </View>
                );
              })}
          </View>
        )}
      </>
    );
  };

  const renderGroupedReportTat = (groupedItem: groupedItems) => {
    return (
      <>
        {!!groupedItem?.reportTATMessage && groupedItem?.reportTATMessage != '' ? (
          <View style={styles.reportTatGroupedView}>
            <Text style={styles.reportTatGroupedTatText}>{groupedItem?.reportTATMessage}</Text>
          </View>
        ) : null}
      </>
    );
  };

  const renderStatusInclusions = () => {
    const hasDiffStatusLevelInclusion = findTestInclusionStatusDetails()
      ?.hasDiffStatusLevelInclusion;

    const reportText = findTestInclusionStatusDetails()?.reportText;

    return (
      <>
        {!hasDiffStatusLevelInclusion ? null : (
          <View>
            <View style={styles.lineSeparator} />
            <View style={styles.inclusionContainer}>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => setShowInclusionStatus(!showInclusionStatus)}
                style={styles.viewRowStyle}
              >
                <Text style={styles.itemNameText}>{!!reportText ? reportText : ''}</Text>
                <ArrowRight
                  style={{
                    transform: [{ rotate: showInclusionStatus ? '270deg' : '90deg' }],
                    tintColor: colors.LIGHT_BLUE,
                  }}
                />
              </TouchableOpacity>
            </View>

            {showInclusionStatus &&
              orderLevelStatus?.statusInclusions?.map((item: any, index: number) => {
                let selectedItem = selectedOrder?.diagnosticOrderLineItems;
                return (
                  <>
                    {!!item?.itemName ? (
                      <View>
                        <View
                          style={[
                            styles.itemNameContainer,
                            {
                              marginBottom: selectedItem?.[index]?.itemObj?.reportGenerationTime
                                ? 5
                                : 16,
                            },
                          ]}
                        >
                          <View style={{ width: '40%' }}>
                            <Text style={styles.itemNameText}>
                              {nameFormater(item?.itemName, 'default')}
                            </Text>
                          </View>
                          <StatusCard
                            titleText={item?.orderStatus}
                            customText={
                              item?.itemId == 8 &&
                              item?.orderStatus ===
                                DIAGNOSTIC_ORDER_STATUS.SAMPLE_NOT_COLLECTED_IN_LAB
                            }
                          />
                        </View>
                      </View>
                    ) : null}
                  </>
                );
              })}
          </View>
        )}
      </>
    );
  };

  const renderFeedbackOption = () => {
    return (
      <View>
        <View style={styles.lineSeparator} />
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => setShowFeedbackPopup(true)}
          style={styles.feedbackTouch}
        >
          <Text style={styles.rateYourExpText}>{string.diagnostics.rateYourExperience}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderOrderCompletedHint = () => {
    return (
      <View>
        <Text style={styles.orderCompText}>
          {'Reports will be shared over whatsapp & SMS as well'}
        </Text>
      </View>
    );
  };

  const renderBottomSection = (order: any) => {
    return <View>{isReportGenerated ? renderButtons() : null}</View>;
  };

  const renderButtons = () => {
    let buttonTitle = 'VIEW REPORT';

    return (
      <View style={{ flexDirection: 'column' }}>
        <Button
          style={styles.buttonStyle}
          onPress={() => _onPressViewReportAction()}
          titleTextStyle={{
            ...theme.viewStyles.text('B', isIphone5s() ? 11 : 13, theme.colors.BUTTON_TEXT, 1, 24),
          }}
          title={buttonTitle}
          disabled={buttonTitle == 'VIEW REPORT' && !isReportGenerated}
        />
      </View>
    );
  };
  const renderViewReportModal = () => {
    return (
      <View>
        <TestPdfRender
          uri={selectedOrder?.labReportURL ? selectedOrder?.labReportURL : ''}
          order={selectedOrder}
          isReport={true}
          onPressClose={() => {
            setShowViewReportModal(false);
          }}
        />
      </View>
    );
  };

  function _onPressViewReportAction() {
    if (!!selectedOrder?.labReportURL && selectedOrder?.labReportURL != '') {
      setShowViewReportModal(true);
    } else if (!!selectedOrder?.visitNo && selectedOrder?.visitNo != '') {
      //directly open the phr section
      fetchTestReportResult();
    } else {
      props.navigation.navigate(AppRoutes.HealthRecordsHome);
    }
  }
  const onPressInvoice = () => {
    const appointmentDetails = !!orderDetails?.slotDateTimeInUTC
      ? orderDetails?.slotDateTimeInUTC
      : orderDetails?.diagnosticDate;
    const appointmentDate = moment(appointmentDetails)?.format('DD MMM YYYY');
    const patientName = getPatientNameById(allCurrentPatients, orderDetails?.patientId!)?.replace(
      / /g,
      '_'
    );
    downloadLabTest(orderDetails?.invoiceURL!, appointmentDate, patientName, false);
  };

  const onPressViewReport = (isReport: boolean) => {
    const appointmentDetails = !!orderDetails?.slotDateTimeInUTC
      ? orderDetails?.slotDateTimeInUTC
      : orderDetails?.diagnosticDate;
    const appointmentDate = moment(appointmentDetails)?.format('DD MMM YYYY');
    const patientName = getPatientNameById(allCurrentPatients, orderDetails?.patientId!)?.replace(
      / /g,
      '_'
    );
    //need to remove the event once added
    DiagnosticViewReportClicked(
      'Track Order',
      !!orderDetails?.labReportURL ? 'Yes' : 'No',
      'Download Report PDF',
      orderDetails?.displayId,
      currentPatient
    );
    downloadLabTest(
      removeWhiteSpaces(orderDetails?.labReportURL)!,
      appointmentDate,
      patientName,
      isReport
    );
  };

  async function downloadLabTest(
    pdfUrl: string,
    appointmentDate: string,
    patientName: string,
    isReport?: boolean
  ) {
    setLoading?.(true);
    try {
      await downloadDiagnosticReport(
        globalLoading,
        pdfUrl,
        appointmentDate,
        patientName,
        true,
        undefined,
        orderDetails?.orderStatus,
        (orderDetails?.displayId).toString(),
        isReport
      );
    } catch (error) {
      setLoading?.(false);
      CommonBugFender('YourOrderTests_downloadLabTest', error);
    } finally {
      setLoading?.(false);
    }
  }

  const renderReportError = (message: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
    });
  };

  function postRatingGivenWebEngageEvent(rating: string, reason: string) {
    DiagnosticFeedbackSubmitted(currentPatient, rating, reason, isDiagnosticCircleSubscription);
  }

  const renderFeedbackPopup = () => {
    return (
      <>
        <FeedbackPopup
          containerStyle={{ paddingTop: 120 }}
          title={string.diagnostics.valueFeedbackTxt}
          description={string.diagnostics.howWasExpTxt}
          info={{
            title: '',
            description: '',
            imageComponent: '',
          }}
          transactionId={orderId}
          patientId={!!selectedOrder?.patientId ? selectedOrder?.patientId : currentPatient?.id}
          type={FEEDBACKTYPE.DIAGNOSTICS}
          isVisible={showFeedbackPopup}
          onComplete={(ratingStatus, ratingOption) => {
            postRatingGivenWebEngageEvent(ratingStatus!, ratingOption);
            setShowFeedbackPopup(false);
            showAphAlert!({
              title: 'Thanks :)',
              description: string.diagnostics.feedbackSubTxt,
            });
            setShowRateDiagnosticBtn(false);
          }}
        />
      </>
    );
  };

  function _onPressViewAll() {
    props.navigation.navigate(AppRoutes.MembershipDetails, {
      membershipType: 'CIRCLE PLAN',
      isActive: true,
      circleEventSource: 'Cart(Diagnostic)',
    });
  }

  const renderOrderSummary = () => {
    return (
      <TestOrderSummaryView
        orderDetails={orderDetails}
        slotDuration={slotDuration}
        onPressViewReport={_onPressViewReportAction}
        onPressDownloadInvoice={onPressInvoice}
        refundDetails={refundStatusArr}
        refundTransactionId={refundTransactionId}
        subscriptionDetails={orderSubscriptionDetails}
        onPressViewAll={_onPressViewAll}
      />
    );
  };

  const renderErrorCard = () => {
    return (
      <Card
        cardContainer={[styles.noDataCard]}
        heading={string.common.uhOh}
        description={string.diagnostics.unableToFetchStatus}
        descriptionTextStyle={{ fontSize: 14 }}
        headingTextStyle={{ fontSize: 14 }}
      />
    );
  };

  const renderError = () => {
    if (selectedTab === string.orders.trackOrder) {
      if (
        refundStatusArr?.length > 0 && showError
          ? orderStatusList?.length == 0
          : showError && _.isEmpty(orderLevelStatus)
      ) {
        return renderErrorCard();
      }
    } else {
      return showOrderDetailsError && renderErrorCard();
    }
  };

  const renderCallToOrder = () => {
    return getCTADetails?.length ? (
      <CallToOrderView
        cityId={Number(diagnosticServiceabilityData?.cityId)}
        customMargin={80}
        slideCallToOrder={slideCallToOrder}
        onPressSmallView={() => {
          setSlideCallToOrder(false);
        }}
        onPressCross={() => {
          setSlideCallToOrder(true);
        }}
        pageId={CALL_TO_ORDER_CTA_PAGE_ID.TESTORDERSUMMARY}
      />
    ) : null;
  };

  function _navigateToHelpSection(queries: any) {
    const helpSectionQueryId = AppConfig.Configuration.HELP_SECTION_CUSTOM_QUERIES;
    const currentStatusDate = orderDetails?.diagnosticOrdersStatus?.find(
      (i: any) => i?.orderStatus === orderDetails?.orderStatus
    )?.statusDate;

    props.navigation.navigate(AppRoutes.NeedHelpQueryDetails, {
      isOrderRelatedIssue: true,
      medicineOrderStatus: orderDetails?.orderStatus,
      medicineOrderStatusDate: currentStatusDate,
      orderId: orderDetails?.displayId,
      queryIdLevel1: helpSectionQueryId.diagnostic,
      queries: queries,
      email: null,
      sourcePage: 'My Orders',
    });
  }

  const fetchQueries = async () => {
    try {
      setLoading?.(true);
      const queries = await getHelpSectionQueries(client);
      setQueries(queries);
      _navigateToHelpSection(queries);
      setLoading?.(false);
    } catch (error) {
      setLoading?.(false);
      showAphAlert?.({
        title: string.common.uhOh,
        description: string.genericError,
      });
    }
  };

  const onPressHelp = () => {
    if (queries?.length > 0) {
      _navigateToHelpSection(queries);
    } else {
      fetchQueries();
    }
  };

  const renderHeaderRightComponent = () => {
    return (
      <TouchableOpacity activeOpacity={0.5} style={{ paddingLeft: 10 }} onPress={onPressHelp}>
        <Text style={styles.helpTextStyle}>{string.help.toUpperCase()}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <View style={styles.headerShadowContainer}>
          <Header
            leftIcon="backArrow"
            title={`ORDER DETAILS`}
            titleStyle={{ marginHorizontal: 10 }}
            container={{ borderBottomWidth: 0 }}
            onPressLeftIcon={() => {
              handleBack();
            }}
            rightComponent={renderHeaderRightComponent()}
          />
        </View>
        <TabsComponent
          style={styles.tabsContainer}
          onChange={(title) => {
            !!disableTrackOrderTab ? setSelectedTab(string.orders.viewBill) : setSelectedTab(title);
          }}
          data={[{ title: string.orders.trackOrder }, { title: string.orders.viewBill }]}
          selectedTab={selectedTab}
        />
        <ScrollView
          bounces={false}
          style={{ flex: 1 }}
          ref={scrollViewRef}
          onScroll={() => {
            setSlideCallToOrder(true);
          }}
          scrollEventThrottle={16}
        >
          {selectedTab == string.orders.trackOrder ? renderOrderTracking() : renderOrderSummary()}

          {renderError()}
        </ScrollView>
        {renderCallToOrder()}
        {selectedTab == string.orders.trackOrder &&
        orderDetails?.attributesObj?.reportTATMessage &&
        !DIAGNOSTIC_FAILURE_STATUS_ARRAY?.includes(selectedOrder?.orderStatus) &&
        selectedOrder?.orderStatus !== DIAGNOSTIC_ORDER_STATUS.ORDER_COMPLETED
          ? renderOrderReportTat(orderDetails?.attributesObj?.reportTATMessage)
          : null}
        {selectedTab == string.orders.trackOrder ? renderBottomSection(orderDetails) : null}
      </SafeAreaView>

      {renderFeedbackPopup()}
      {showViewReportModal ? renderViewReportModal() : null}
      {showPhleboCallPopUp ? renderPhleboCallPopup() : null}
      {loading1 && <Spinner style={{ zIndex: 200 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  headerShadowContainer: {
    backgroundColor: theme.colors.WHITE,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
    zIndex: 1,
  },
  reportTatBottomview: {
    backgroundColor: colors.TEST_CARD_BUTTOM_BG,
    padding: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yellowText: {
    ...theme.viewStyles.text('SB', 14, colors.APP_YELLOW),
    textAlign: 'center',
  },
  moreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabsContainer: {
    ...theme.viewStyles.cardViewStyle,
    elevation: 4,
    borderRadius: 0,
    backgroundColor: theme.colors.CARD_BG,
    borderBottomColor: 'rgba(2, 71, 91, 0.3)',
  },
  graphicalStatusViewStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    marginRight: 18,
  },
  itemTextStyle: {
    marginHorizontal: 10,
    ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE),
  },
  verticalProgressLine: { flex: 1, width: 4, alignSelf: 'center' },
  statusIconStyle: {
    height: 28,
    width: 28,
  },
  statusIconSmallStyle: {
    height: 12,
    width: 12,
  },
  viewRowStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1000,
    height: 30,
  },
  dateTimeStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    letterSpacing: 0.04,
    color: theme.colors.LIGHT_BLUE,
    textAlign: 'right',
  },
  feedbackPop: { flex: 1, width: '95%', marginBottom: 20, alignSelf: 'center' },
  statusDoneView: {
    ...theme.viewStyles.cardViewStyle,
    padding: 16,
    marginBottom: 8,
    flex: 1,
  },
  statusTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(15),
    letterSpacing: 0.0,
    flex: 1,
  },
  reportOrderTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: colors.SHERPA_BLUE,
    marginHorizontal: 6,
    lineHeight: 16,
    letterSpacing: 0.04,
  },
  statusSubTextStyle: {
    ...theme.fonts.IBMPlexSansRegular(10),
    letterSpacing: 0.0,
    color: theme.colors.SHERPA_BLUE,
  },
  lineSeparator: {
    height: 1,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.1,
    marginTop: 7,
    marginBottom: 8,
  },
  buttonStyle: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: '85%',
    marginLeft: screenWidth / 16,
  },
  noDataCard: {
    height: 'auto',
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
  itemNameText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 18,
    letterSpacing: 0.04,
    color: theme.colors.LIGHT_BLUE,
  },
  itemNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inclusionContainer: {
    marginBottom: 15,
    marginTop: 10,
  },
  rowStyle: { flexDirection: 'row' },
  timeStyle: {
    ...theme.fonts.IBMPlexSansRegular(10),
    lineHeight: 20,
    letterSpacing: 0.04,
    color: theme.colors.LIGHT_BLUE,
    textAlign: 'right',
  },
  rateYourExpText: { ...theme.viewStyles.text('B', 14, theme.colors.APP_YELLOW) },
  orderCompText: { ...theme.viewStyles.text('R', 10, theme.colors.SHERPA_BLUE) },
  feedbackTouch: { marginBottom: 2, width: '100%' },
  ratingContainer: {
    backgroundColor: theme.colors.TEST_CARD_BUTTOM_BG,
    borderRadius: 10,
    marginBottom: 5,
    padding: 5,
    elevation: 1,
  },
  reportTextStyle: {
    marginHorizontal: 10,
    ...theme.viewStyles.text('R', 10, colors.SHERPA_BLUE, 1, 16),
  },
  reporttatContainer: {
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  refundTxnId: {
    ...theme.viewStyles.text('R', 12, colors.SHERPA_BLUE, 1, 16),
    marginTop: '1.5%',
  },
  flexRow: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  horizontalSeparator: { marginTop: 8, marginBottom: 8 },
  clockIconStyle: { height: 20, width: 20, resizeMode: 'contain' },
  invoiceGeneratedText: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 16,
    alignSelf: 'center',
  },
  viewInvoiceView: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginVertical: 12,
    height: 30,
  },
  itemsAddedText: {
    ...theme.viewStyles.text('M', 13, colors.SHERPA_BLUE, 1, 18),
  },
  itemsNameAddedText: {
    ...theme.viewStyles.text('M', 12, colors.TURQUOISE_LIGHT_BLUE, 1, 18),
  },
  cancelledRefundDetails: {
    ...theme.viewStyles.text('R', 12, colors.TURQUOISE_LIGHT_BLUE, 1, 16),
  },
  itemsTouch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusUpcomingView: {
    padding: 10,
    flex: 1,
  },
  refundAmountStyle: {
    ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 1, 16),
  },
  subStatusView: { width: '60%', marginVertical: -4, marginBottom: '2.5%' },
  statusCardContainer: {
    padding: 3,
    width: '70%',
  },
  amountRefundDaysText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.APP_GREEN,
    lineHeight: 16,
    fontStyle: 'italic',
    marginTop: '2%',
    marginBottom: '2%',
  },
  refundReasonView: {
    backgroundColor: colors.DEFAULT_BACKGROUND_COLOR,
    flex: 1,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  removedItemView: {
    backgroundColor: colors.FAILURE_TEXT,
    height: 20,
    width: 55,
    borderRadius: 2,
    borderColor: colors.FAILURE_TEXT,
    justifyContent: 'center',
  },
  removedText: {
    ...theme.viewStyles.text('SB', 10, 'white'),
    textAlign: 'center',
  },
  cancelItemClosedView: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: '4%',
  },
  modificationItemView: { width: '72%', flexDirection: 'row' },
  groupedOuterView: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D1D1',
    padding: 8,
    marginBottom: 12,
  },
  groupedOuterViewWithout: {
    padding: 8,
    paddingBottom: 4,
    marginBottom: 8,
  },
  reportTatGroupedView: {
    margin: -8,
    marginTop: 8,
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.TEST_CARD_BUTTOM_BG,
  },
  reportTatGroupedTatText: {
    ...theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE, 1, 16),
    textAlign: 'center',
  },
  fullInclusionLevelSeparator: {
    backgroundColor: '#D1D1D1',
    height: 1,
    width: screenWidth - 120,
    marginLeft: -8,
    marginTop: 8,
    marginBottom: 8,
  },
  helpTextStyle: { ...theme.viewStyles.text('B', 13, colors.APP_YELLOW, 1, 24) },
});
