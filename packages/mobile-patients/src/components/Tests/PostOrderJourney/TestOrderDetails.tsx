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
  CopyBlue,
  DownloadNew,
  ShareBlue,
  ViewIcon,
  Cross
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
  GET_DIAGNOSTIC_ORDER_LIST,
  GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
  GET_ORDER_LEVEL_DIAGNOSTIC_STATUS,
  GET_PATIENT_FEEDBACK,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getDiagnosticOrderDetails,
  getDiagnosticOrderDetailsVariables,
  getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrderDetails';
import { getDiagnosticOrdersListVariables } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersList';
import {
  downloadDiagnosticReport,
  g,
  getPatientNameById,
  getTestOrderStatusText,
  handleGraphQlError,
  nameFormater,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, Modal, Linking, Clipboard } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender, isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  DIAGNOSTIC_ORDER_STATUS,
  FEEDBACKTYPE,
  MedicalRecordType,
  REFUND_STATUSES,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { getDiagnosticsOrderStatus_getDiagnosticsOrderStatus_ordersList } from '@aph/mobile-patients/src/graphql/types/getDiagnosticsOrderStatus';

import { getPatientPrismMedicalRecordsApi } from '@aph/mobile-patients/src/helpers/clientCalls';
import { getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults_response } from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords_V2';

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
const DROP_DOWN_ARRAY_STATUS = [
  DIAGNOSTIC_ORDER_STATUS.PARTIAL_ORDER_COMPLETED,
  DIAGNOSTIC_ORDER_STATUS.SAMPLE_SUBMITTED,
];
export interface TestOrderDetailsProps extends NavigationScreenProps {
  orderId: string;
  showOrderSummaryTab: boolean;
  goToHomeOnBack: boolean;
  selectedTest?: any;
  selectedOrder: object;
  refundStatusArr?: any;
}
{
}

export const TestOrderDetails: React.FC<TestOrderDetailsProps> = (props) => {
  const orderId = props.navigation.getParam('orderId');
  const goToHomeOnBack = props.navigation.getParam('goToHomeOnBack');
  const showOrderSummaryTab = props.navigation.getParam('showOrderSummaryTab');
  const setOrders = props.navigation.getParam('setOrders');
  const selectedTest = props.navigation.getParam('selectedTest');
  const selectedOrder = props.navigation.getParam('selectedOrder');
  const refundStatusArr = props.navigation.getParam('refundStatusArr');
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
  const [labResults, setLabResults] = useState<
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults_response | null)[]
    | null
    | undefined
  >([]);
  const [orderLevelStatus, setOrderLevelStatus] = useState([] as any);
  const [showInclusionStatus, setShowInclusionStatus] = useState<boolean>(false);
  const [showError, setError] = useState<boolean>(false);
  const [isViewReport, setIsViewReport] = useState<boolean>(false);
  const [snackbarState, setSnackbarState] = useState<boolean>(false);
  const [displayViewReport, setDisplayViewReport] = useState<boolean>(false);
  const scrollViewRef = React.useRef<ScrollView | null>(null);
  const scrollToSlots = () => {
    scrollViewRef.current &&
      scrollViewRef.current.scrollTo({ x: 0, y: scrollYValue, animated: true });
  };

  //for showing the order level status.
  const fetchOrderLevelStatus = () =>
    client.query<getHCOrderFormattedTrackingHistory, getHCOrderFormattedTrackingHistoryVariables>({
      query: GET_ORDER_LEVEL_DIAGNOSTIC_STATUS,
      variables: { diagnosticOrderID: orderId },
      fetchPolicy: 'no-cache',
    });

  const fetchOrderDetails = () =>
    client.query<getDiagnosticOrderDetails, getDiagnosticOrdersListVariables>({
      query: GET_DIAGNOSTIC_ORDER_LIST,
      variables: { patientId: currentPatient && currentPatient.id },
      fetchPolicy: 'no-cache',
    });

  useEffect(() => {
    callOrderLevelStatusApi();
  }, []);

  async function callOrderLevelStatusApi() {
    try {
      let response = await fetchOrderLevelStatus();
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
    if (selectedTab == string.orders.trackOrder && newList?.length > 0) {
      let latestStatus = newList?.[newList?.length - 1]?.orderStatus;
      DiagnosticTrackOrderViewed(currentPatient, latestStatus, orderId, 'Track Order');
    }
  }, [selectedTab]);

  const { data, loading } = useQuery<getDiagnosticOrderDetails, getDiagnosticOrderDetailsVariables>(
    GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
    {
      variables: { diagnosticOrderId: orderId },
    }
  );
  const order = g(data, 'getDiagnosticOrderDetails', 'ordersList');

  const orderDetails = ((!loading && order) ||
    {}) as getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList;

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
      currentPatient?.id,
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
        setLabResults(labResultsData);
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
    if (!goToHomeOnBack) {
      fetchOrderDetails()
        .then((data: any) => {
          const _orders = g(data, 'data', 'getDiagnosticOrdersList', 'ordersList') || [];
          setOrders(_orders);
        })
        .catch((e: Error) => {
          CommonBugFender('TestOrderDetails_fetchOrders', e);
          setLoading?.(false);
        });
    }
    props.navigation.goBack();
    return false;
  };

  const updateRateDeliveryBtnVisibility = async () => {
    setLoading?.(true);
    try {
      if (!showRateDiagnosticBtn) {
        const response = await client.query<GetPatientFeedback, GetPatientFeedbackVariables>({
          query: GET_PATIENT_FEEDBACK,
          variables: {
            patientId: g(currentPatient, 'id') || '',
            transactionId: `${selectedTest?.id}`,
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
      setLoading!(false);
      CommonBugFender(`${AppRoutes.OrderDetailsScene}_updateRateDeliveryBtnVisibility`, error);
    }
  };

  const renderRefund = () => {
    if (!!orderLevelStatus && !_.isEmpty(orderLevelStatus) && refundStatusArr?.length > 0) {
      return <RefundCard refundArray={refundStatusArr} />;
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

  const renderCustomDescriptionOrDateAndTime = (
    data: getDiagnosticsOrderStatus_getDiagnosticsOrderStatus_ordersList
  ) => {
    return (
      <View style={{ alignSelf: 'flex-end' }}>
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
              <View style={styles.rowStyle}>
                {renderGraphicalStatus(order, index, isStatusDone, array)}
                <View style={{ marginBottom: 8, flex: 1 }}>
                  <View style={[isStatusDone ? styles.statusDoneView : { padding: 10 }]}>
                    <View style={styles.rowStyle}>
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
                      {isStatusDone ? renderCustomDescriptionOrDateAndTime(order) : null}
                    </View>
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

  const renderInclusionLevelDropDown = (order: any) => {
    /**add condition for sample submitted if inclusion level same */
    const totalInclusions = orderLevelStatus?.statusInclusions?.length;
    const hasDiffStatusLevelInclusion =
      !!orderLevelStatus?.statusInclusions &&
      totalInclusions > 0 &&
      orderLevelStatus?.statusInclusions?.filter(
        (item: any) => !DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY.includes(item?.orderStatus)
      );

    const isReportText = orderLevelStatus?.statusHistory?.find(
      (item: any) => item?.orderStatus == DIAGNOSTIC_ORDER_STATUS.PARTIAL_ORDER_COMPLETED
    );
    const pendingReportInclusions = orderLevelStatus?.statusInclusions?.filter(
      (item: any) => item?.orderStatus !== DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED
    );

    const sampleRejectedInclusions = orderLevelStatus?.statusInclusions?.filter(
      (item: any) => item?.orderStatus === DIAGNOSTIC_ORDER_STATUS.SAMPLE_REJECTED_IN_LAB
    );

    const reportText =
      !!pendingReportInclusions && pendingReportInclusions?.length > 0 && isReportText
        ? `Report pending for ${pendingReportInclusions?.length} of ${totalInclusions}`
        : !!sampleRejectedInclusions && sampleRejectedInclusions?.length > 0
        ? `${sampleRejectedInclusions?.length} test in order rejected `
        : '';

    return (
      <>
        {hasDiffStatusLevelInclusion?.length === 0 ? null : (
          <View>
            {!showInclusionStatus ? <View style={styles.lineSeparator} /> : null}

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
              orderLevelStatus?.statusInclusions?.map((item: any) => {
                return (
                  <>
                    {!!item?.itemName ? (
                      <View style={styles.itemNameContainer}>
                        <View style={{ width: '59%' }}>
                          <Text style={styles.itemNameText}>
                            {nameFormater(item?.itemName, 'default')}
                          </Text>
                        </View>
                        <StatusCard titleText={item?.orderStatus} />
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
          onPress={() => onPressButton(buttonTitle)}
          titleTextStyle={{
            ...theme.viewStyles.text('B', isIphone5s() ? 11 : 13, theme.colors.BUTTON_TEXT, 1, 24),
          }}
          title={buttonTitle}
          disabled={buttonTitle == 'VIEW REPORT' && !isReportGenerated}
        />
      </StickyBottomComponent>
    );
  };

  const onPressViewReport = () => {
    const visitId = order?.visitNo;
    const appointmentDetails = !!order?.slotDateTimeInUTC
      ? order?.slotDateTimeInUTC
      : order?.diagnosticDate;
    const appointmentDate = moment(appointmentDetails)?.format('DD MMM YYYY');
    const patientName = getPatientNameById(allCurrentPatients, order?.patientId!)?.replace(
      / /g,
      '_'
    );
    //need to remove the event once added
    DiagnosticViewReportClicked(
      'Track Order',
      !!order?.labReportURL ? 'Yes' : 'No',
      'Download Report PDF',
      order?.id
    );
    if (order?.labReportURL && order?.labReportURL != '') {
      downloadLabTest(order?.labReportURL, appointmentDate, patientName);
    } else if (visitId) {
      fetchTestReportResult();
    } else {
      props.navigation.navigate(AppRoutes.HealthRecordsHome);
    }
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

  const onPressButton = (buttonTitle?: string) => {
    // onPressViewReport();
    setIsViewReport(true)
    setDisplayViewReport(true)
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
          onPressViewReport={onPressButton}
          refundDetails={refundStatusArr}
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
      {displayViewReport && (
            <TestViewReportOverlay
              order={order}
              heading=""
              isVisible={displayViewReport}
              onClose={() => setDisplayViewReport(false)}
              onPressViewReport={()=>{
                onPressViewReport()
              }}
            />
        )
      }
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
            setSelectedTab(title);
          }}
          data={[{ title: string.orders.trackOrder }, { title: string.orders.viewBill }]}
          selectedTab={selectedTab}
        />
        <ScrollView bounces={false} style={{ flex: 1 }}>
          {selectedTab == string.orders.trackOrder ? renderOrderTracking() : renderOrderSummary()}

          {renderError()}
        </ScrollView>
        {selectedTab == string.orders.trackOrder ? renderBottomSection(order) : null}
      </SafeAreaView>

      {renderFeedbackPopup()}
      {(loading || loading1) && <Spinner style={{ zIndex: 200 }} />}
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
  modalMainView: {
    backgroundColor: 'rgba(100,100,100, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
    // alignItems: 'center',
    flexDirection: 'column',
  },
  reportModalView: {
    backgroundColor: 'white',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  reportModalOptionsView: {
    backgroundColor: 'white',
    width: '100%',
  },
  itemView: {
    backgroundColor: 'white',
    width: '100%',
    padding: 10,
    flexDirection: 'row',
    alignContent: 'center',
    borderBottomColor: '#e8e8e8',
    borderBottomWidth: 1,
  },
  itemTextStyle: {
    marginHorizontal: 10,
    ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE),
  },
  copyTextStyle: {
    marginHorizontal: 10,
    textAlign: 'left',
    ...theme.viewStyles.text('SB', 14, theme.colors.APP_GREEN),
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
  statusLineSeperator: {
    paddingHorizontal: 45,
    marginTop: '8%',
    paddingBottom: 25.5,
  },
  reportsGeneratedText: {
    textAlign: 'center',
    marginBottom: 6,
    ...theme.viewStyles.text('M', 13, '#01475b', 1, 21),
  },
  rateDeliveryText: {
    ...theme.viewStyles.text('B', isIphone5s() ? 11 : 13, theme.colors.BUTTON_TEXT, 1, 24),
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
    marginBottom: 16,
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
});
