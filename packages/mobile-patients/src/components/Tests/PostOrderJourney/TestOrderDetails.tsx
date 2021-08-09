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
  OrderTrackerSmallIcon,
  ClockIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import _ from 'lodash';
import {
  DIAGNOSTIC_JUSPAY_INVALID_REFUND_STATUS,
  DIAGNOSTIC_ORDER_FAILED_STATUS,
  DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY,
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
  getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrderDetails';
import {
  downloadDiagnosticReport,
  downloadDocument,
  g,
  getPatientNameById,
  getTestOrderStatusText,
  handleGraphQlError,
  nameFormater,
  navigateToScreenWithEmptyStack,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, BackHandler } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender, isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  DIAGNOSTIC_ORDER_STATUS,
  FEEDBACKTYPE,
  MedicalRecordType,
  REFUND_STATUSES,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';

import { getPatientPrismMedicalRecordsApi } from '@aph/mobile-patients/src/helpers/clientCalls';

import { RefundCard } from '@aph/mobile-patients/src/components/Tests/components/RefundCard';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import {
  DiagnosticFeedbackSubmitted,
  DiagnosticTrackOrderViewed,
  DiagnosticViewReportClicked,
} from '@aph/mobile-patients/src/components/Tests/Events';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import {
  getHCOrderFormattedTrackingHistory,
  getHCOrderFormattedTrackingHistoryVariables,
} from '@aph/mobile-patients/src/graphql/types/getHCOrderFormattedTrackingHistory';
import { StatusCard } from '@aph/mobile-patients/src/components/Tests/components/StatusCard';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';

import { TestViewReportOverlay } from '@aph/mobile-patients/src/components/Tests/components/TestViewReportOverlay';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrdersStatus } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';

import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import {
  getDiagnosticOrderDetailsByDisplayID,
  getDiagnosticOrderDetailsByDisplayIDVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrderDetailsByDisplayID';
const DROP_DOWN_ARRAY_STATUS = [
  DIAGNOSTIC_ORDER_STATUS.PARTIAL_ORDER_COMPLETED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_SUBMITTED,
];

type orderStatus = getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrdersStatus;
export interface TestOrderDetailsProps extends NavigationScreenProps {
  orderId: string;
  showOrderSummaryTab: boolean;
  goToHomeOnBack: boolean;
  selectedTest?: any;
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
  const selectedTest = props.navigation.getParam('selectedTest');
  const selectedOrder = props.navigation.getParam('selectedOrder');
  const refundStatusArr = props.navigation.getParam('refundStatusArr');
  const source = props.navigation.getParam('comingFrom');
  const refundTransactionId = props.navigation.getParam('refundTransactionId');

  const client = useApolloClient();
  const [selectedTab, setSelectedTab] = useState<string>(
    showOrderSummaryTab ? string.orders.viewBill : string.orders.trackOrder
  );
  const [showRateDiagnosticBtn, setShowRateDiagnosticBtn] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const { showAphAlert, setLoading: globalLoading } = useUIElements();
  const { getPatientApiCall } = useAuth();
  const [scrollYValue, setScrollYValue] = useState(0);
  const [loading1, setLoading] = useState<boolean>(true);
  const [orderLevelStatus, setOrderLevelStatus] = useState([] as any);
  const [viewReportOrderId, setViewReportOrderId] = useState<number>(0);
  const [showInclusionStatus, setShowInclusionStatus] = useState<boolean>(false);
  const [showError, setError] = useState<boolean>(false);
 
  const scrollViewRef = React.useRef<ScrollView | null>(null);

  const [orderDetails, setOrderDetails] = useState([] as any);
  const scrollToSlots = (yValue?: number) => {
    const setY = yValue == undefined ? scrollYValue : yValue;
    scrollViewRef.current && scrollViewRef.current.scrollTo({ x: 0, y: setY, animated: true });
  };

  //for showing the order level status.
  const fetchOrderLevelStatus = (orderId: string) =>
    client.query<getHCOrderFormattedTrackingHistory, getHCOrderFormattedTrackingHistoryVariables>({
      query: GET_ORDER_LEVEL_DIAGNOSTIC_STATUS,
      variables: { diagnosticOrderID: orderId },
      fetchPolicy: 'no-cache',
    });

  const fetchOrderDetails = (orderId: string) =>
    client.query<getDiagnosticOrderDetails, getDiagnosticOrderDetailsVariables>({
      query: GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
      variables: { diagnosticOrderId: orderId },
      fetchPolicy: 'no-cache',
    });

  const getOrderDetails = async (displayId: string) => {
    const res = await client.query<
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
    }
  }, []);

  const fetchDiagnosticOrderDetails = async (displayId: string) => {
    setLoading?.(true);
    try {
      const res = await getOrderDetails(displayId);
      const { data } = res;
      const getData = g(data, 'getDiagnosticOrderDetailsByDisplayID', 'ordersList');
      const getOrderId = getData?.id;
      if (!!getOrderId) {
        callOrderLevelStatusApi(getOrderId);
        callOrderDetailsApi(getOrderId);
      } else {
        setLoading?.(false);
        setError(true);
      }
    } catch (error) {
      CommonBugFender('RecordDetails_fetchDiagnosticOrderDetails_try', error);
      setLoading?.(false);
      setError(true);
    }
  };

  async function callOrderLevelStatusApi(orderId: string) {
    try {
      let response = await fetchOrderLevelStatus(orderId);
      if (!!response && response?.data && !response?.errors) {
        let getOrderLevelStatus = g(response, 'data', 'getHCOrderFormattedTrackingHistory');
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
        setOrderDetails(getOrderDetails);
        setError(false);
      } else {
        setOrderDetails([]);
        setError(true);
      }
      setLoading?.(false);
    } catch (error) {
      setLoading?.(false);
      setOrderDetails([]);
      setError(true);
      CommonBugFender('getDiagnosticOrderDetails_TestOrderDetails', error);
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
      DiagnosticTrackOrderViewed(currentPatient, latestStatus, orderId, 'Track Order');
    }
  }, [selectedTab]);

  var orderStatusList: any[] = [];
  var refundArr: any[] = [];
  var newList: any[] = [];

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
        const labResultsData = g(
          data,
          'getPatientPrismMedicalRecords_V2',
          'labResults',
          'response'
        );
        let resultForVisitNo = labResultsData?.find((item: any) => item?.identifier == getVisitId);
        !!resultForVisitNo
          ? props.navigation.navigate(AppRoutes.HealthRecordDetails, {
              data: resultForVisitNo,
              labResults: true,
            })
          : renderReportError(string.diagnostics.responseUnavailableForReport);
      })
      .catch((error) => {
        CommonBugFender('OrderedTestStatus_fetchTestReportsData', error);
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
    if (goToHomeOnBack && source === AppRoutes.TestsCart) {
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
        const feedback = g(response, 'data', 'getPatientFeedback', 'feedback', 'length');
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

  const renderRefund = () => {
    const isOrderModified = orderDetails?.diagnosticOrderLineItems?.find(
      (item) => !!item?.editOrderID && item?.editOrderID
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
    return moment(time).format('hh:mm a');
  };

  const renderGraphicalStatus = (order: any, index: number, isStatusDone: boolean, array: any) => {
    return (
      <View style={styles.graphicalStatusViewStyle}>
        {isStatusDone ? (
          <OrderPlacedIcon style={styles.statusIconStyle} />
        ) : (
          <OrderTrackerSmallIcon style={[styles.statusIconSmallStyle]} />
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
                  : 'rgba(0,135,186,0.3)',
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
            ? getFormattedTime(data?.statusDate)
            : getFormattedTime(orderDetails?.createdDate)}
        </Text>
        <Text style={styles.timeStyle}>
          {!!data?.statusDate
            ? getFormattedDate(data?.statusDate)
            : getFormattedDate(orderDetails?.createdDate)}
        </Text>
      </View>
    );
  };

  const renderOrderTracking = () => {
    newList = newList =
      refundStatusArr?.length > 0 ? orderStatusList : orderLevelStatus?.statusHistory;
    scrollToSlots();
    return (
      <View>
        <View style={{ margin: 20 }}>
          {newList?.map((order: any, index: number, array: any) => {
            const isStatusDone = true;
            return (
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
                  <View style={[isStatusDone ? styles.statusDoneView : { padding: 10 }]}>
                    <View style={styles.flexRow}>
                      <View style={{ width: '75%' }}>
                        <Text
                          style={[
                            styles.statusTextStyle,
                            {
                              color:
                                DIAGNOSTIC_ORDER_FAILED_STATUS.includes(order?.orderStatus) ||
                                order?.orderStatus == DIAGNOSTIC_ORDER_STATUS.SAMPLE_REJECTED_IN_LAB
                                  ? theme.colors.INPUT_FAILURE_TEXT
                                  : theme.colors.SHERPA_BLUE,
                            },
                          ]}
                        >
                          {nameFormater(getTestOrderStatusText(order?.orderStatus), 'default')}
                        </Text>
                      </View>
                      {isStatusDone ? renderCustomDescriptionOrDateAndTime(order) : null}
                    </View>

                    {REFUND_STATUSES.SUCCESS === order?.orderStatus
                      ? renderTransactionDetails()
                      : null}
                    {DROP_DOWN_ARRAY_STATUS.includes(order?.orderStatus) &&
                    index == array?.length - 1
                      ? renderInclusionLevelDropDown(order)
                      : null}
                    {order?.orderStatus === DIAGNOSTIC_ORDER_STATUS.ORDER_COMPLETED &&
                    !!showRateDiagnosticBtn
                      ? renderFeedbackOption()
                      : null}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        {renderRefund()}
        <View style={{ height: 60 }} />
      </View>
    );
  };

  const renderTransactionDetails = () => {
    return (
      <>
        <Spearator style={styles.horizontalSeparator} />
        <Text style={styles.refundTxnId}>Txn id: {refundTransactionId}</Text>
      </>
    );
  };

  const renderInclusionLevelDropDown = (order: any) => {
    /**add condition for sample submitted if inclusion level same */
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
        ? `Report pending for ${pendingReportInclusions?.length} of ${totalInclusions}`
        : !!sampleRejectedInclusions && sampleRejectedInclusions?.length > 0
        ? `${sampleRejectedInclusions?.length} test in order rejected `
        : !!sampleSubmittedInclusions &&
          sampleSubmittedInclusions?.length == orderLevelStatus?.statusInclusions?.length
        ? 'All samples are submitted'
        : !!sampleSubmittedInclusions && sampleSubmittedInclusions?.length > 0
        ? `${sampleSubmittedInclusions?.length} ${
            sampleSubmittedInclusions?.length == 1 ? 'test' : 'tests'
          } in order are sample submitted `
        : '';

    return (
      <>
        {!hasDiffStatusLevelInclusion ? null : (
          <View>
            <View style={styles.lineSeparator} />
            <View style={styles.inclusionContainer}>
              <TouchableOpacity
                onPress={() => setShowInclusionStatus(!showInclusionStatus)}
                activeOpacity={1}
                style={styles.viewRowStyle}
              >
                <Text style={styles.itemNameText}>{!!reportText ? reportText : ''}</Text>
                <ArrowRight
                  style={{
                    transform: [{ rotate: showInclusionStatus ? '270deg' : '90deg' }],
                    tintColor: 'black',
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
                          <View style={{ width: '59%' }}>
                            <Text style={styles.itemNameText}>
                              {nameFormater(item?.itemName, 'default')}
                            </Text>
                          </View>
                          <StatusCard titleText={item?.orderStatus} />
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
          onPress={() => setShowFeedbackPopup(true)}
          activeOpacity={1}
          style={styles.feedbackTouch}
        >
          <Text style={styles.rateYourExpText}>{string.diagnostics.rateYourExperience}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderBottomSection = (order: any) => {
    return <View>{isReportGenerated ? renderButtons() : null}</View>;
  };

  const renderButtons = () => {
    let buttonTitle = 'VIEW REPORT';

    return (
      <StickyBottomComponent>
        <Button
          style={styles.buttonStyle}
          onPress={() => _onPressViewReportAction()}
          titleTextStyle={{
            ...theme.viewStyles.text('B', isIphone5s() ? 11 : 13, theme.colors.BUTTON_TEXT, 1, 24),
          }}
          title={buttonTitle}
          disabled={buttonTitle == 'VIEW REPORT' && !isReportGenerated}
        />
      </StickyBottomComponent>
    );
  };

  function _onPressViewReportAction() {
    if (!!selectedOrder?.labReportURL && selectedOrder?.labReportURL != '') {
      onPressViewReport();
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
    downloadLabTest(orderDetails?.invoiceURL!, appointmentDate, patientName);
  };

  const onPressViewReport = () => {
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
      orderDetails?.id
    );
    downloadLabTest(orderDetails?.labReportURL!, appointmentDate, patientName);
  };

  async function downloadLabTest(pdfUrl: string, appointmentDate: string, patientName: string) {
    setLoading?.(true);
    try {
      await downloadDiagnosticReport(globalLoading, pdfUrl, appointmentDate, patientName, true);
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
    DiagnosticFeedbackSubmitted(currentPatient, rating, reason);
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

  const renderOrderSummary = () => {
    return (
      !!g(orderDetails, 'totalPrice') && (
        <TestOrderSummaryView
          orderDetails={orderDetails}
          onPressViewReport={_onPressViewReportAction}
          onPressDownloadInvoice={onPressInvoice}
          refundDetails={refundStatusArr}
          refundTransactionId={refundTransactionId}
        />
      )
    );
  };

  const renderError = () => {
    if (
      refundStatusArr?.length > 0 && showError
        ? orderStatusList?.length == 0
        : showError && _.isEmpty(orderLevelStatus)
    ) {
      return (
        <Card
          cardContainer={[styles.noDataCard]}
          heading={string.common.uhOh}
          description={string.diagnostics.unableToFetchStatus}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        />
      );
    }
  };

  const renderMoreMenu = () => {
    return (
      <MaterialMenu
        options={['Help'].map((item) => ({
          key: item,
          value: item,
        }))}
        menuContainerStyle={{
          alignItems: 'center',
          marginTop: 30,
        }}
        lastContainerStyle={{ borderBottomWidth: 0 }}
        bottomPadding={{ paddingBottom: 0 }}
        itemTextStyle={{ ...theme.viewStyles.text('M', 14, '#01475b') }}
        onPress={({ value }) => {
          if (value === 'Help') {
            props.navigation.navigate(AppRoutes.MobileHelp);
          }
        }}
      >
        <More />
      </MaterialMenu>
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
            rightComponent={renderMoreMenu()}
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
        <ScrollView bounces={false} style={{ flex: 1 }} ref={scrollViewRef}>
          {selectedTab == string.orders.trackOrder ? renderOrderTracking() : renderOrderSummary()}

          {renderError()}
        </ScrollView>
        {selectedTab == string.orders.trackOrder ? renderBottomSection(orderDetails) : null}
      </SafeAreaView>

      {renderFeedbackPopup()}
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
  verticalProgressLine: { flex: 1, width: 6, alignSelf: 'center' },
  statusIconStyle: {
    height: 28,
    width: 28,
  },
  statusIconSmallStyle: {
    height: 15,
    width: 15,
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
  lineSeparator: {
    height: 1,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.1,
    marginTop: 7,
    marginBottom: 8,
  },
  buttonStyle: {
    alignSelf: 'center',
    marginTop: -10,
    width: '95%',
    marginLeft: 10,
    marginRight: 10,
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
    ...theme.viewStyles.text('M', 11, colors.SHERPA_BLUE, 1, 14),
  },
  flexRow: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  horizontalSeparator: { marginTop: 8, marginBottom: 8 },
});
