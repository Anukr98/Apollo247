import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { TestOrderSummaryView } from '@aph/mobile-patients/src/components/Tests/components/TestOrderSummaryView';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { FeedbackPopup } from '@aph/mobile-patients/src/components/FeedbackPopup';

import {
  More,
  OrderPlacedIcon,
  OrderTrackerSmallIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import _ from 'lodash';
import {
  DIAGNOSTIC_JUSPAY_INVALID_REFUND_STATUS,
  DIAGNOSTIC_JUSPAY_REFUND_STATUS,
  DIAGNOSTIC_ORDER_FAILED_STATUS,
  DIAGNOSTIC_VERTICAL_STATUS_TO_SHOW,
  SequenceForDiagnosticStatus,
} from '@aph/mobile-patients/src/strings/AppConfig';
import {
  GetPatientFeedback,
  GetPatientFeedbackVariables,
} from '@aph/mobile-patients/src/graphql/types/GetPatientFeedback';
import {
  GET_DIAGNOSTIC_ORDER_LIST,
  GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
  GET_PATIENT_FEEDBACK,
  GET_PRISM_AUTH_TOKEN,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getDiagnosticOrderDetails,
  getDiagnosticOrderDetailsVariables,
  getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrderDetails';
import {
  getDiagnosticOrdersList,
  getDiagnosticOrdersListVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersList';
import {
  g,
  getTestOrderStatusText,
  handleGraphQlError,
  nameFormater,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender, isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
  DIAGNOSTIC_ORDER_STATUS,
  FEEDBACKTYPE,
  MedicalRecordType,
  REFUND_STATUSES,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { getDiagnosticsOrderStatus_getDiagnosticsOrderStatus_ordersList } from '@aph/mobile-patients/src/graphql/types/getDiagnosticsOrderStatus';
import {
  getPrismAuthToken,
  getPrismAuthTokenVariables,
} from '@aph/mobile-patients/src/graphql/types/getPrismAuthToken';
import { getPatientPrismMedicalRecordsApi } from '@aph/mobile-patients/src/helpers/clientCalls';
import { getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults_response } from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords_V2';

const OTHER_REASON = string.Diagnostics_Feedback_Others;
import { RefundCard } from '@aph/mobile-patients/src/components/Tests/components/RefundCard';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import {
  DiagnosticFeedbackSubmitted,
  DiagnosticTrackOrderViewed,
  DiagnosticViewReportClicked,
} from '@aph/mobile-patients/src/components/Tests/Events';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';

/**
 * this needs to be removed once hidestatus starts working
 */
const statusToBeShown = DIAGNOSTIC_VERTICAL_STATUS_TO_SHOW;
export interface TestOrderDetailsProps extends NavigationScreenProps {
  orderId: string;
  showOrderSummaryTab: boolean;
  goToHomeOnBack: boolean;
  comingFrom?: string;
  selectedTest: any;
  individualTestStatus: any;
  selectedOrder: object;
  refundStatusArr: any;
}
{
}

export const TestOrderDetails: React.FC<TestOrderDetailsProps> = (props) => {
  const orderId = props.navigation.getParam('orderId');
  const goToHomeOnBack = props.navigation.getParam('goToHomeOnBack');
  const showOrderSummaryTab = props.navigation.getParam('showOrderSummaryTab');
  const setOrders = props.navigation.getParam('setOrders');
  const selectedTest = props.navigation.getParam('selectedTest');
  const individualTestStatus = props.navigation.getParam('individualTestStatus');
  const selectedOrder = props.navigation.getParam('selectedOrder');
  const refundStatusArr = props.navigation.getParam('refundStatusArr');
  const comingFrom = props.navigation.getParam('comingFrom');
  const isPrepaid = selectedOrder?.paymentType == DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT;
  const client = useApolloClient();
  const [selectedTab, setSelectedTab] = useState<string>(
    showOrderSummaryTab ? string.orders.viewBill : string.orders.trackOrder
  );
  const [showRateDiagnosticBtn, setShowRateDiagnosticBtn] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const { currentPatient } = useAllCurrentPatients();
  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();
  const { getPatientApiCall } = useAuth();
  const [scrollYValue, setScrollYValue] = useState(0);
  const [prismAuthToken, setPrismAuthToken] = useState('');
  const [labResults, setLabResults] = useState<
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults_response | null)[]
    | null
    | undefined
  >([]);

  const scrollViewRef = React.useRef<ScrollView | null>(null);
  const scrollToSlots = () => {
    scrollViewRef.current &&
      scrollViewRef.current.scrollTo({ x: 0, y: scrollYValue, animated: true });
  };

  const sequenceOfStatus = SequenceForDiagnosticStatus;

  const fetchOrderDetails = () =>
    client.query<getDiagnosticOrderDetails, getDiagnosticOrdersListVariables>({
      query: GET_DIAGNOSTIC_ORDER_LIST,
      variables: { patientId: currentPatient && currentPatient.id },
      fetchPolicy: 'no-cache',
    });

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
      DiagnosticTrackOrderViewed(currentPatient, latestStatus, orderId);
    }
  }, [selectedTab]);

  const { data, loading, refetch } = useQuery<
    getDiagnosticOrderDetails,
    getDiagnosticOrderDetailsVariables
  >(GET_DIAGNOSTIC_ORDER_LIST_DETAILS, {
    variables: { diagnosticOrderId: orderId },
  });
  const order = g(data, 'getDiagnosticOrderDetails', 'ordersList');

  const orderDetails = ((!loading && order) ||
    {}) as getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList;

  var orderStatusList: any[] = [];
  var refundArr: any[] = [];
  var newList: any[] = [];
  const sizeOfIndividualTestStatus = _.size(individualTestStatus);

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

  if (comingFrom == AppRoutes.OrderedTestStatus) {
    //find the item id based on selected key.
    const getNullObject = Object.entries(individualTestStatus).find(
      ([key, value]) => key == 'null'
    );
    const existingStatus = getNullObject?.[1] || ([] as any);

    const getSelectedKeyObject = Object.entries(individualTestStatus).find(
      ([key, value]) => String(key) === String(selectedTest?.itemId)
    );
    const selectedStatusArray = getSelectedKeyObject?.[1] || ([] as any);
    var statusArray = [...existingStatus, ...selectedStatusArray];

    orderStatusList[0] = statusArray;
  } else {
    orderStatusList[0] = !!individualTestStatus ? individualTestStatus : [];
  }

  const getAuthToken = async () => {
    setLoading?.(true);
    client
      .query<getPrismAuthToken, getPrismAuthTokenVariables>({
        query: GET_PRISM_AUTH_TOKEN,
        fetchPolicy: 'no-cache',
        variables: {
          uhid: currentPatient?.uhid || '',
        },
      })
      .then(({ data }) => {
        const prism_auth_token = g(data, 'getPrismAuthToken', 'response');
        if (prism_auth_token) {
          setPrismAuthToken(prism_auth_token);
          fetchTestReportResult();
        }
      })
      .catch((e) => {
        CommonBugFender('HealthRecordsHome_GET_PRISM_AUTH_TOKEN', e);
        const error = JSON.parse(JSON.stringify(e));
        console.log('Error occured while fetching GET_PRISM_AUTH_TOKEN', error);
        setLoading!(false);
      });
  };

  const fetchTestReportResult = useCallback(() => {
    const getVisitId = selectedOrder?.visitNo;
    getPatientPrismMedicalRecordsApi(client, currentPatient?.id, [MedicalRecordType.TEST_REPORT])
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
        console.log('Error occured fetchTestReportsResult', { error });
        currentPatient && handleGraphQlError(error);
      })
      .finally(() => setLoading?.(false));
  }, []);

  if (refundStatusArr?.length > 0) {
    const getObject = createRefundObject();

    const isAlreadyPresent = orderStatusList?.[0]?.find(
      (item: any) => item?.orderStatus == getObject?.[0]?.orderStatus
    );
    //avoid pushing duplicates to list
    if (isAlreadyPresent != undefined) {
    } else {
      getObject?.map((item) => orderStatusList?.[0]?.push(item));
    }
  }

  const isReportGenerated = selectedTest?.currentStatus == DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED;

  const handleBack = () => {
    if (!goToHomeOnBack) {
      fetchOrderDetails()
        .then((data: any) => {
          const _orders = g(data, 'data', 'getDiagnosticOrdersList', 'ordersList') || [];
          setOrders(_orders);
        })
        .catch((e: Error) => {
          CommonBugFender('TestOrderDetails_fetchOrders', e);
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
      setLoading!(false);
    } catch (error) {
      setLoading!(false);
      CommonBugFender(`${AppRoutes.OrderDetailsScene}_updateRateDeliveryBtnVisibility`, error);
    }
  };

  const renderRefund = () => {
    if (refundStatusArr?.length > 0) {
      return <RefundCard refundArray={refundStatusArr} />;
    }
  };

  const getFormattedDate = (time: string) => {
    return moment(time).format('D MMM YYYY');
  };

  const getFormattedTime = (time: string) => {
    return moment(time).format('hh:mm A');
  };

  const getFormattedDateTime = (time: string) => {
    let finalDateTime =
      moment(time).format('D MMMM YYYY') + ' at ' + moment(time).format('hh:mm A');
    return finalDateTime;
  };

  const renderGraphicalStatus = (
    order: any,
    index: number,
    isStatusDone: boolean,
    isFailureCase: boolean,
    isRefundCase: boolean,
    array: any
  ) => {
    return (
      <View style={styles.graphicalStatusViewStyle}>
        {isStatusDone ? (
          <OrderPlacedIcon style={styles.statusIconStyle} />
        ) : (
          <OrderTrackerSmallIcon style={[styles.statusIconSmallStyle]} />
        )}
        {/**
         * change the length of the status whenever change the sequenceOfStatus (minus is total no of status in app config start index is 0)
         */}

        <View
          style={[
            styles.verticalProgressLine,
            {
              backgroundColor:
                // index == sequenceOfStatus.length - (isNegativeCase ? 11 : isRefundCase ? 10 : 8) // 10 : 7 (last)
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
      <View style={styles.viewRowStyle}>
        <Text style={styles.dateTimeStyle}>
          {!!data?.statusDate
            ? getFormattedDate(data?.statusDate)
            : getFormattedDate(orderDetails?.createdDate)}
        </Text>
        <Text style={styles.dateTimeStyle}>
          {!!data?.statusDate
            ? getFormattedTime(data?.statusDate)
            : getFormattedTime(orderDetails?.createdDate)}
        </Text>
      </View>
    );
  };

  const renderOrderTracking = () => {
    newList = orderStatusList?.[0]?.filter((item: any) =>
      statusToBeShown?.includes(item?.orderStatus)
    );
    scrollToSlots();
    return (
      <View>
        <View style={{ margin: 20 }}>
          {newList?.map((order: any, index: number, array: any) => {
            const isOrderFailedCase = DIAGNOSTIC_ORDER_FAILED_STATUS.includes(order?.orderStatus);
            const isRefundCase = refundStatusArr?.length > 0;
            const compareStatus = DIAGNOSTIC_ORDER_FAILED_STATUS.includes(
              selectedOrder?.orderStatus
            )
              ? sequenceOfStatus.indexOf(selectedOrder?.orderStatus) >=
                sequenceOfStatus.indexOf(order?.orderStatus)
              : sequenceOfStatus.indexOf(selectedTest?.currentStatus) >=
                sequenceOfStatus.indexOf(order?.orderStatus);

            const isStatusCompletedForPrepaid = true;
            const isStatusDone = true;
            return (
              <View style={{ flexDirection: 'row' }}>
                {renderGraphicalStatus(
                  order,
                  index,
                  isStatusDone,
                  isOrderFailedCase,
                  isRefundCase,
                  array
                )}
                <View style={{ marginBottom: 8, flex: 1 }}>
                  <View style={[isStatusDone ? styles.statusDoneView : { padding: 10 }]}>
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
                    {isStatusDone ? <View style={styles.lineSeparator} /> : null}
                    {isStatusDone ? renderCustomDescriptionOrDateAndTime(order) : null}
                  </View>
                </View>
              </View>
            );
          })}

          {/**either reports generated :: rate your delivery will be shown or refund option would  bve shown */}
        </View>
        {renderBottomSection(order)}
        {renderRefund()}
        {isReportGenerated ? (
          <View style={styles.statusLineSeperator}>
            <Text style={styles.reportsGeneratedText}>
              {`Your order no. #${
                selectedTest.displayId
              } is successfully picked up on ${isReportGenerated &&
                selectedTest.statusDate &&
                getFormattedDateTime(selectedTest.statusDate)}.`}
            </Text>
            <Text style={styles.thankYouText}>{'Thank You for choosing Apollo 24|7'}</Text>
            {!!showRateDiagnosticBtn && (
              <Button
                style={styles.feedbackPop}
                onPress={() => setShowFeedbackPopup(true)}
                titleTextStyle={styles.rateDeliveryText}
                title={'RATE YOUR DELIVERY EXPERIENCE'}
              />
            )}
          </View>
        ) : null}
      </View>
    );
  };

  const renderBottomSection = (order: any) => {
    return <View>{isReportGenerated ? renderButtons() : null}</View>;
  };

  const renderButtons = () => {
    let buttonTitle = 'VIEW REPORT';

    return (
      <>
        <Button
          style={styles.buttonStyle}
          onPress={() => onPressButton(buttonTitle)}
          titleTextStyle={{
            ...theme.viewStyles.text('B', isIphone5s() ? 11 : 13, theme.colors.BUTTON_TEXT, 1, 24),
          }}
          title={buttonTitle}
          disabled={buttonTitle == 'VIEW REPORT' && !isReportGenerated}
        />
      </>
    );
  };

  const onPressViewReport = () => {
    const visitId = selectedOrder?.visitNo;
    if (visitId) {
      getAuthToken();
    } else {
      props.navigation.navigate(AppRoutes.HealthRecordsHome);
    }
  };

  const renderReportError = (message: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
    });
  };

  const onPressButton = (buttonTitle: string) => {
    DiagnosticViewReportClicked();
    onPressViewReport();
  };

  function postRatingGivenWebEngageEvent(rating: string, reason: string) {
    DiagnosticFeedbackSubmitted(currentPatient, rating, reason);
  }

  const renderFeedbackPopup = () => {
    return (
      <>
        <FeedbackPopup
          containerStyle={{ paddingTop: 120 }}
          title="We value your feedback! :)"
          description="How was your overall experience -"
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
              description: 'Your feedback has been submitted. Thanks for your time.',
            });
            setShowRateDiagnosticBtn(false);
            // updateRateDeliveryBtnVisibility();
          }}
        />
      </>
    );
  };

  const renderOrderSummary = () => {
    return (
      !!g(orderDetails, 'totalPrice') && (
        <TestOrderSummaryView orderDetails={orderDetails} onPressViewReport={() => onPressButton} />
      )
    );
  };

  const renderError = () => {
    if (orderStatusList?.[0]?.length == 0) {
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
            setSelectedTab(title);
          }}
          data={[{ title: string.orders.trackOrder }, { title: string.orders.viewBill }]}
          selectedTab={selectedTab}
        />
        <ScrollView bounces={false}>
          {selectedTab == string.orders.trackOrder ? renderOrderTracking() : renderOrderSummary()}
          {renderError()}
        </ScrollView>
      </SafeAreaView>
      {renderFeedbackPopup()}
      {loading && <Spinner style={{ zIndex: 200 }} />}
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
  chatWithUsView: { paddingBottom: 10, paddingTop: 5 },
  chatWithUsTouch: { flexDirection: 'row', justifyContent: 'flex-end' },
  whatsappIconStyle: { height: 24, width: 24, resizeMode: 'contain' },
  chatWithUsText: {
    textAlign: 'center',
    paddingRight: 0,
    marginHorizontal: 5,
    ...theme.viewStyles.text('B', 14, theme.colors.APP_YELLOW),
  },
  graphicalStatusViewStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    marginRight: 18,
  },
  verticalProgressLine: { flex: 1, width: 4, alignSelf: 'center' },
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
  },
  dateTimeStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    letterSpacing: 0.04,
    color: theme.colors.LIGHT_BLUE,
  },
  thankYouText: {
    textAlign: 'center',
    marginBottom: 12,
    ...theme.viewStyles.text('SB', 13, '#01475b', 1, 21),
  },
  feedbackPop: { flex: 1, width: '95%', marginBottom: 20, alignSelf: 'center' },
  statusDoneView: {
    ...theme.viewStyles.cardViewStyle,
    padding: 16,
    marginBottom: 8,
    flex: 1,
  },
  statusTextStyle: {
    ...theme.fonts.IBMPlexSansSemiBold(15),
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
  preTestingCardView: { ...theme.viewStyles.cardViewStyle, padding: 16, flex: 1, marginTop: 13 },
  buttonStyle: { width: '40%', marginBottom: 20, alignSelf: 'center' },
  popUpOverlay: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    flex: 1,
    left: 0,
    right: 0,
    zIndex: 3000,
  },
  chatWithUsOuterView: {
    margin: 30,
    marginTop: 100,
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  reachUsOutText: {
    textAlign: 'center',
    ...theme.fonts.IBMPlexSansRegular(13),
    color: theme.colors.SHERPA_BLUE,
  },
  noDataCard: {
    height: 'auto',
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
});
