import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { TestOrderSummaryView } from '@aph/mobile-patients/src/components/TestOrderSummaryView';
import {
  SlotInfo,
  TestScheduleOverlay,
  TestScheduleType,
} from '@aph/mobile-patients/src/components/Tests/TestScheduleOverlay';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { More, WhatsAppIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { FeedbackPopup } from '@aph/mobile-patients/src/components/FeedbackPopup';
import { AlertPopup } from '@aph/mobile-patients/src/components/ui/AlertPopup';
import { ReasonPopUp } from '@aph/mobile-patients/src/components/ui/ReasonPopUp';
import {
  OrderPlacedIcon,
  OrderTrackerSmallIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import _ from 'lodash';
import {
  AppConfig,
  SequenceForDiagnosticStatus,
  TestCancelReasons,
  TestReschedulingReasons,
} from '@aph/mobile-patients/src/strings/AppConfig';
import {
  GetPatientFeedback,
  GetPatientFeedbackVariables,
} from '@aph/mobile-patients/src/graphql/types/GetPatientFeedback';
import {
  CANCEL_DIAGNOSTIC_ORDER,
  GET_DIAGNOSTIC_ORDER_LIST,
  GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
  GET_PATIENT_FEEDBACK,
  UPDATE_DIAGNOSTIC_ORDER,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  cancelDiagnosticOrder,
  cancelDiagnosticOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/cancelDiagnosticOrder';
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
  updateDiagnosticOrder,
  updateDiagnosticOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/updateDiagnosticOrder';
import {
  g,
  handleGraphQlError,
  postWebEngageEvent,
  postWEGNeedHelpEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { OrderCancelOverlay } from '@aph/mobile-patients/src/components/Tests/OrderCancelOverlay';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender, isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  DIAGNOSTIC_ORDER_STATUS,
  FEEDBACKTYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { RefundDetails } from '@aph/mobile-patients/src/components/RefundDetails';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import {
  getDiagnosticsOrderStatus_getDiagnosticsOrderStatus,
  getDiagnosticsOrderStatus_getDiagnosticsOrderStatus_ordersList,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticsOrderStatus';

const screenHeight = Dimensions.get('window').height;
const reasonForCancellation = TestCancelReasons.reasons;
const reasonForRescheduling = TestReschedulingReasons.reasons;
const OTHER_REASON = string.Diagnostics_Feedback_Others;

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
    ...theme.fonts.IBMPlexSansMedium(16),
    letterSpacing: 0.0,
    color: theme.colors.SHERPA_BLUE,
    flex: 1,
    textTransform: 'capitalize',
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
});

const cancelOptions: [string, string][] = [
  'Booked from else where',
  'Pick up person did not turn up',
  'Not available at selected time',
  'Pick up person was late',
  'Do not require medicines any longer',
  'Unhappy with the discounts',
  'Others',
].map((val, idx) => [(idx + 1).toString(), val]);

const rescheduleOptions: [string, string][] = [
  'Not available at selected time',
  'Pick up person was late',
  'Not in fasting condition',
  'Others',
].map((val, idx) => [(idx + 1).toString(), val]);

export interface TestOrderDetailsProps extends NavigationScreenProps {
  orderId: string;
  showOrderSummaryTab: boolean;
  goToHomeOnBack: boolean;
  selectedTest: any;
  individualTestStatus: any;
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
  const client = useApolloClient();
  const [selectedTab, setSelectedTab] = useState<string>(
    showOrderSummaryTab ? string.orders.viewBill : string.orders.trackOrder
  );
  const [apiLoading, setApiLoading] = useState(false);
  const [isCancelVisible, setCancelVisible] = useState(false);
  const [isRescheduleVisible, setRescheduleVisible] = useState(false);
  const [showRateDiagnosticBtn, setShowRateDiagnosticBtn] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [showCancelPopUp, setCancelPopUp] = useState<boolean>(false);
  const [showReschedulePopUp, setReschedulePopUp] = useState<boolean>(false);
  const [showCancelReasonPopUp, setCancelReasonPopUp] = useState<boolean>(false);
  const [showRescheduleReasonPopUp, setRescheduleReasonPopUp] = useState<boolean>(false);
  const [selectedReasonForCancel, setSelectedReasonForCancel] = useState('');
  const [commentForCancel, setCommentForCancel] = useState('');
  const [allStatusForTest, setAllStatusForTest] = useState();

  const [selectedReasonForReschedule, setSelectedReasonForReschedule] = useState('');
  const [commentForReschedule, setCommentForReschedule] = useState('');
  // const [selectedOrderId, setSelectedOrderId] = useState<number>(0);

  const { currentPatient } = useAllCurrentPatients();
  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();
  const { getPatientApiCall } = useAuth();
  const [scrollYValue, setScrollYValue] = useState(0);

  const scrollViewRef = React.useRef<ScrollView | null>(null);
  const scrollToSlots = () => {
    scrollViewRef.current &&
      scrollViewRef.current.scrollTo({ x: 0, y: scrollYValue, animated: true });
  };

  const statusBeforeCollection = [
    DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED,
    DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED,
  ];

  const sequenceOfStatus = SequenceForDiagnosticStatus;

  const refetchOrders =
    props.navigation.getParam('refetch') ||
    useQuery<getDiagnosticOrdersList, getDiagnosticOrdersListVariables>(GET_DIAGNOSTIC_ORDER_LIST, {
      variables: {
        patientId: currentPatient && currentPatient.id,
      },
      fetchPolicy: 'cache-first',
    }).refetch;

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

  const { data, loading, refetch } = useQuery<
    getDiagnosticOrderDetails,
    getDiagnosticOrderDetailsVariables
  >(GET_DIAGNOSTIC_ORDER_LIST_DETAILS, {
    variables: { diagnosticOrderId: orderId },
  });
  const order = g(data, 'getDiagnosticOrderDetails', 'ordersList');

  const currentPatientId = currentPatient && currentPatient.id;

  const orderDetails = ((!loading && order) ||
    {}) as getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList;

  var orderStatusList: any[] = [];
  const sizeOfIndividualTestStatus = _.size(individualTestStatus);
  Object.entries(individualTestStatus).filter((item: any) => {
    if (item[0] == 'null') {
      if (sizeOfIndividualTestStatus == 1) {
        orderStatusList.push(item[1]);
      } else {
        orderStatusList[0].push(item[1][0]);
      }
    } else if (item[0] == selectedTest.itemId) {
      orderStatusList.push(item[1]);
    }
  });
  console.log({ orderStatusList });

  const showReportsGenerated =
    sequenceOfStatus.indexOf(selectedTest.currentStatus) >=
    sequenceOfStatus.indexOf(DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED);
  const isReportGenerated = selectedTest.currentStatus == DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED;

  const handleBack = () => {
    if (!goToHomeOnBack) {
      refetchOrders()
        .then((data: any) => {
          const _orders = g(data, 'data', 'getDiagnosticOrdersList', 'ordersList') || [];
          setOrders(_orders);
        })
        .catch((e: Error) => {
          CommonBugFender('TestOrderDetails_refetchOrders', e);
        });
    }
    props.navigation.goBack();
    return false;
  };

  const updateRateDeliveryBtnVisibility = async () => {
    setLoading!(true);
    try {
      if (!showRateDiagnosticBtn) {
        const response = await client.query<GetPatientFeedback, GetPatientFeedbackVariables>({
          query: GET_PATIENT_FEEDBACK,
          variables: {
            patientId: g(currentPatient, 'id') || '',
            transactionId: `${selectedTest.id}`,
          },
          fetchPolicy: 'no-cache',
        });
        const feedback = g(response, 'data', 'getPatientFeedback', 'feedback', 'length');
        console.log({ feedback });
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

  const getFormattedDate = (time: string) => {
    return moment(time).format('D MMM YYYY');
  };

  const getFormattedTime = (time: string) => {
    return moment(time).format('hh:mm A');
  };

  const mapStatusWithText = (val: string) => {
    return val.replace(/[_]/g, ' ');
  };

  const getFormattedDateTime = (time: string) => {
    let finalDateTime =
      moment(time).format('D MMMM YYYY') + ' at ' + moment(time).format('hh:mm A');
    return finalDateTime;
  };

  const renderGraphicalStatus = (order: any, index: number) => {
    const isStatusDone =
      sequenceOfStatus.indexOf(selectedTest.currentStatus) >=
      sequenceOfStatus.indexOf(order.orderStatus);
    return (
      <View style={styles.graphicalStatusViewStyle}>
        {isStatusDone ? (
          <OrderPlacedIcon style={styles.statusIconStyle} />
        ) : (
          <OrderTrackerSmallIcon style={[styles.statusIconSmallStyle]} />
        )}
        {/**
         * change the length of the status whenever change the sequenceOfStatus
         */}
        <View
          style={[
            styles.verticalProgressLine,
            {
              backgroundColor:
                index == sequenceOfStatus.length - 4
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
        <Text style={styles.dateTimeStyle}>{getFormattedDate(data!.statusDate)}</Text>
        <Text style={styles.dateTimeStyle}>{getFormattedTime(data!.statusDate)}</Text>
      </View>
    );
  };

  const renderOrderTracking = () => {
    const currentStatus = selectedTest.currentStatus;

    let statusList = [
      {
        orderStatus: DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED,
      },
      {
        orderStatus: DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED,
      },
      {
        orderStatus: DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED,
      },
      {
        orderStatus: DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB,
      },
      {
        orderStatus: DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED,
      },
    ];

    const newList = statusList.map(
      (obj) =>
        orderStatusList[0].find(
          (o: getDiagnosticsOrderStatus_getDiagnosticsOrderStatus_ordersList) =>
            o.orderStatus === obj.orderStatus
        ) || obj
    );

    scrollToSlots();
    return (
      <View>
        <View style={{ margin: 20 }}>
          {newList.map((order, index, array) => {
            const isStatusDone =
              sequenceOfStatus.indexOf(currentStatus) >=
              sequenceOfStatus.indexOf(order.orderStatus);
            console.log('current status' + currentStatus + 'order.orderStatus' + order.orderStatus);
            console.log('isDone?' + isStatusDone);

            return (
              <View style={{ flexDirection: 'row' }}>
                {renderGraphicalStatus(order, index)}
                <View style={{ marginBottom: 8, flex: 1 }}>
                  <View style={[isStatusDone ? styles.statusDoneView : { padding: 10 }]}>
                    <Text style={styles.statusTextStyle}>
                      {mapStatusWithText(order.orderStatus)}
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
        {/**  show whatsapp icon only in case of refund ..*/}
        {/* {orderDetails.orderStatus == 'ORDER_CANCELLED' && renderChatWithUs()} */}
      </View>
    );
  };

  const renderBottomSection = (order: any) => {
    return (
      <View>
        {!showReportsGenerated && renderPreTestingRequirement(order)}
        {showReportsGenerated ? renderButtons() : null}
        {/* {!showReportsGenerated ? (
          <>
            <Spearator />
            {renderNotesSection()}
          </>
        ) : null} */}
      </View>
    );
  };

  const renderPreTestingRequirement = (order: any) => {
    return (
      <>
        {selectedTest.testPreparationData! != '' ? (
          <>
            <Spearator />
            <View style={{ margin: 16, marginBottom: 20 }}>
              <Text
                style={[
                  styles.statusTextStyle,
                  {
                    ...theme.fonts.IBMPlexSansMedium(13),
                    textTransform: 'none',
                  },
                ]}
              >
                PRE-TESTING REQUIREMENTS
              </Text>
              <View style={styles.preTestingCardView}>
                <Text
                  style={[
                    styles.statusTextStyle,
                    {
                      ...theme.fonts.IBMPlexSansMedium(12),
                    },
                  ]}
                >
                  {selectedTest.testPreparationData!}
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </>
    );
  };

  const renderButtons = () => {
    let buttonTitle = !showReportsGenerated ? 'RESCHEDULE' : 'VIEW REPORT';
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

        {/* {orderDetails && !isReportGenerated ? (
          <View style={{ justifyContent: 'center', alignSelf: 'center' }}>
            <TouchableOpacity onPress={() => onPressTestCancel()}>
              <Text
                style={{
                  ...viewStyles.yellowTextStyle,
                  textAlign: 'center',
                  fontSize: 14,
                  lineHeight: 24,
                  padding: 8,
                }}
              >
                CANCEL
              </Text>
            </TouchableOpacity>
          </View>
        ) : null} */}
      </>
    );
  };

  const onPressViewReport = () => {
    props.navigation.navigate(AppRoutes.HealthRecordsHome);
  };

  const onPressButton = (buttonTitle: string) => {
    buttonTitle == 'RESCHEDULE' ? setReschedulePopUp(true) : onPressViewReport();
  };
  const renderReschedulePopUp = () => {
    //check for the number of time the order can be rescheduled. by seeing the doctor consult logic
    return (
      <AlertPopup
        visible={showReschedulePopUp}
        onDismiss={() => setReschedulePopUp(false)}
        title={
          'You can reschedule to a maximum of 3 times. If you click ok, you will have 2 reschedule attempt(s) left.'
        }
        leftButton={'CANCEL'}
        rightButton={'OK, GOT IT'}
        showCloseIcon={false}
        onContinue={() => {
          //call the cancel
          setReschedulePopUp(false);
          setRescheduleReasonPopUp(true);
        }}
      />
    );
  };

  const hideRescheduleReasonOverlay = () => {
    setRescheduleReasonPopUp(false);
  };

  const renderRescheduleReasonPopUp = () => {
    //show skip option
    return showRescheduleReasonPopUp ? (
      <View style={styles.popUpOverlay}>
        <ReasonPopUp
          onPressSubmit={(reason, comment) => onSubmitRescheduleRequest(reason, comment)}
          cancelVisible={showRescheduleReasonPopUp}
          headingText={'Reschedule Order'}
          reasonForCancelText={'Why are you cancelling this order?'}
          dropDownOptions={reasonForRescheduling}
          onPressCross={hideRescheduleReasonOverlay}
          otherReasonText={OTHER_REASON}
          optionPlaceholderText={'Select reason for rescheduling'}
          submitOthersWithoutComment={true}
        />
      </View>
    ) : null;
  };
  const onSubmitRescheduleRequest = (reason: string, comment: string) => {
    //show the slot pop up and call teh api
    setSelectedReasonForReschedule(reason);
    setCommentForReschedule(comment);
    setRescheduleReasonPopUp(false);
    setDisplaySchedule(true);
  };

  const onSubmitCancelOrder = (reason: string, comment: string) => {
    setApiLoading(true);
    setSelectedReasonForCancel(reason);
    setCommentForCancel(comment);
    setCancelReasonPopUp(false);

    /**check for the cancel diagnostic api. */
    // const api = client.mutate<cancelDiagnosticOrder, cancelDiagnosticOrderVariables>({
    //   mutation: CANCEL_DIAGNOSTIC_ORDER,
    //   variables: { diagnosticOrderId: selectedOrderId },
    // });
    // callApiAndRefetchOrderDetails(api);
  };

  const onPressTestCancel = () => {
    setCancelPopUp(true);
    // setSelectedOrderId(item.id);
  };

  const renderCancelPopUp = () => {
    return (
      <AlertPopup
        visible={showCancelPopUp}
        onDismiss={() => setCancelPopUp(false)}
        title={'Are you sure you wish to cancel your order?'}
        leftButton={"DON'T CANCEL"}
        rightButton={'CANCEL'}
        showCloseIcon={false}
        onContinue={() => {
          setCancelPopUp(false);
          setCancelReasonPopUp(true);
        }}
      />
    );
  };

  const renderCancelReasonPopUp = () => {
    return showCancelReasonPopUp ? (
      <View style={styles.popUpOverlay}>
        <ReasonPopUp
          onPressSubmit={(reason, comment) => {
            onSubmitCancelOrder(reason, comment);
          }}
          cancelVisible={showCancelReasonPopUp}
          headingText={'Cancel Order'}
          reasonForCancelText={'Why are you cancelling this order?'}
          dropDownOptions={reasonForCancellation}
          onPressCross={hideReasonOverlay}
          otherReasonText={OTHER_REASON}
          optionPlaceholderText={'Select reason for cancelling'}
          submitOthersWithoutComment={false}
        />
      </View>
    ) : null;
  };

  const hideReasonOverlay = () => {
    setCancelReasonPopUp(false);
  };

  // const renderNotesSection = () => {
  //   return (
  //     <View style={{ margin: 20 }}>
  //       <Text style={{ color: theme.colors.SHERPA_BLUE, ...fonts.IBMPlexSansSemiBold(14) }}>
  //         Note:
  //       </Text>
  //       <View style={{ marginTop: 3, flexDirection: 'row' }}>
  //         <Text
  //           style={{
  //             color: theme.colors.SHERPA_BLUE,
  //             fontSize: 6,
  //             textAlign: 'center',
  //             paddingTop: 3,
  //           }}
  //         >
  //           {'\u2B24'}
  //         </Text>
  //         <Text
  //           style={{
  //             color: theme.colors.SHERPA_BLUE,
  //             ...fonts.IBMPlexSansRegular(11),
  //             textAlign: 'left',
  //             marginHorizontal: 5,
  //           }}
  //         >
  //           Cancellation and Rescheduling should be done 1 hour before sample collection
  //         </Text>
  //       </View>
  //       <View style={{ marginTop: 3, flexDirection: 'row' }}>
  //         <Text
  //           style={{
  //             color: theme.colors.SHERPA_BLUE,
  //             fontSize: 6,
  //             textAlign: 'center',
  //             paddingTop: 3,
  //             lineHeight: 13,
  //           }}
  //         >
  //           {'\u2B24'}
  //         </Text>
  //         <Text
  //           style={{
  //             color: theme.colors.SHERPA_BLUE,
  //             ...fonts.IBMPlexSansRegular(11),
  //             textAlign: 'left',
  //             marginHorizontal: 5,
  //             lineHeight: 13,
  //           }}
  //         >
  //           Rescheduling can be done upto 3 times only
  //         </Text>
  //       </View>
  //     </View>
  //   );
  // };

  /**check this on small device */
  const renderChatWithUs = () => {
    return (
      <View style={styles.chatWithUsOuterView}>
        <View style={styles.chatWithUsView}>
          <TouchableOpacity
            style={styles.chatWithUsTouch}
            onPress={() => {
              Linking.openURL(
                AppConfig.Configuration.MED_ORDERS_CUSTOMER_CARE_WHATSAPP_LINK
              ).catch((err) => CommonBugFender(`${AppRoutes.TestOrderDetails}_ChatWithUs`, err));
            }}
          >
            <WhatsAppIcon style={styles.whatsappIconStyle} />
            <Text style={styles.chatWithUsText}>{string.OrderSummery.chatWithUs}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: '45%' }}>
          <Text style={styles.reachUsOutText}>{string.reachUsOut}</Text>
        </View>
      </View>
    );
  };

  const postRatingGivenWebEngageEvent = (rating: string, reason: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_FEEDBACK_GIVEN] = {
      'Patient UHID': g(currentPatient, 'uhid'),
      'Patient Name': g(currentPatient, 'firstName'),
      Rating: rating,
      'Thing to Imporve selected': reason,
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_FEEDBACK_GIVEN, eventAttributes);
  };

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

  // const renderCancelOrderOverlay = () => {
  //   return (
  //     isCancelVisible && (
  //       <OrderCancelOverlay
  //         heading="Cancel Order"
  //         onClose={() => setCancelVisible(false)}
  //         isVisible={isCancelVisible}
  //         loading={apiLoading}
  //         options={cancelOptions}
  //         onSubmit={onSubmitCancelOrder}
  //       />
  //     )
  //   );
  // };

  const renderRescheduleOrderOverlay = () => {
    return (
      isRescheduleVisible && (
        <TestScheduleOverlay
          type={g(order, 'slotTimings') ? 'home-visit' : 'clinic-visit'}
          heading="Schedule Appointment"
          onClose={() => setRescheduleVisible(false)}
          isVisible={isRescheduleVisible}
          loading={apiLoading}
          options={rescheduleOptions}
          onReschedule={onSubmitRescheduleOrder}
          addressId={orderDetails.patientAddressId}
        />
      )
    );
  };

  const setInitialSate = () => {
    setApiLoading(false);
    // setCancelVisible(false);
    // setRescheduleVisible(false);
  };

  const callApiAndRefetchOrderDetails = (func: Promise<any>) => {
    func
      .then(() => {
        refetch()
          .then(() => {
            setInitialSate();
          })
          .catch((e) => {
            CommonBugFender('TestOrderDetails_refetch_callApiAndRefetchOrderDetails', e);
            setInitialSate();
          });
      })
      .catch((e) => {
        CommonBugFender('TestOrderDetails_callApiAndRefetchOrderDetails', e);
        console.log({ e });
        handleGraphQlError(e);
        setApiLoading(false);
      });
  };

  // const onSubmitCancelOrder = (reason: string, comment?: string) => {
  //   // TODO: call api and change visibility, refetch
  //   setApiLoading(true);
  //   const api = client.mutate<cancelDiagnosticOrder, cancelDiagnosticOrderVariables>({
  //     mutation: CANCEL_DIAGNOSTIC_ORDER,
  //     variables: { diagnosticOrderId: orderDetails.displayId },
  //   });
  //   callApiAndRefetchOrderDetails(api);
  // };

  const onSubmitRescheduleOrder = (
    type: TestScheduleType,
    date: Date,
    reason: string,
    comment?: string,
    slotInfo?: SlotInfo
  ) => {
    // TODO: call api and change visibility, refetch
    setApiLoading(true);
    const isClinicVisit = type == 'clinic-visit';
    const slotTimings = !isClinicVisit
      ? [slotInfo!.startTime, slotInfo!.endTime].map((val) => val.trim()).join(' - ')
      : '';
    const variables: updateDiagnosticOrderVariables = {
      updateDiagnosticOrderInput: {
        id: g(order, 'id'),
        prescriptionUrl: g(order, 'prescriptionUrl')!,
        centerName: g(order, 'centerName')!,
        centerCode: g(order, 'centerCode')!,
        centerCity: g(order, 'centerCity')!,
        centerState: g(order, 'centerState')!,
        centerLocality: g(order, 'centerLocality')!,
        // customizations
        diagnosticDate: moment(date).format('YYYY-MM-DD'),
        slotTimings: slotTimings || '',
        employeeSlotId: g(slotInfo, 'slot')!,
        diagnosticEmployeeCode: g(slotInfo, 'employeeCode') || '',
        diagnosticBranchCode: g(slotInfo, 'diagnosticBranchCode') || '',
      },
    };
    console.log({ variables });
    console.log(JSON.stringify(variables));

    const api = client.mutate<updateDiagnosticOrder, updateDiagnosticOrderVariables>({
      mutation: UPDATE_DIAGNOSTIC_ORDER,
      variables,
    });
    callApiAndRefetchOrderDetails(api);
  };

  const renderOrderSummary = () => {
    return !!g(orderDetails, 'totalPrice') && <TestOrderSummaryView orderDetails={orderDetails} />;
  };

  return (
    <View style={{ flex: 1 }}>
      {/* {showCancelReasonPopUp && renderCancelReasonPopUp()} */}
      {/* {showRescheduleReasonPopUp && renderRescheduleReasonPopUp()} */}
      {/* {renderCancelOrderOverlay()} */}
      {/* {renderRescheduleOrderOverlay()} */}
      <SafeAreaView style={theme.viewStyles.container}>
        <View style={styles.headerShadowContainer}>
          <Header
            leftIcon="backArrow"
            title={`ORDER #${orderDetails.displayId || ''}`}
            titleStyle={{ marginHorizontal: 10 }}
            container={{ borderBottomWidth: 0 }}
            onPressLeftIcon={() => {
              handleBack();
            }}
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
          {/* <NeedHelpAssistant
            containerStyle={{ marginTop: 20, marginBottom: 30 }}
            navigation={props.navigation}
            onNeedHelpPress={() => {
              postWEGNeedHelpEvent(currentPatient, 'Tests');
            }}
          /> */}
          {/* {renderCancelPopUp()} */}
          {/* {renderReschedulePopUp()} */}
        </ScrollView>
      </SafeAreaView>
      {renderFeedbackPopup()}
      {loading && <Spinner style={{ zIndex: 200 }} />}
    </View>
  );
};
