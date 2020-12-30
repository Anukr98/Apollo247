import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { TestOrderSummaryView } from '@aph/mobile-patients/src/components/TestOrderSummaryView';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { FeedbackPopup } from '@aph/mobile-patients/src/components/FeedbackPopup';

import {
  OrderPlacedIcon,
  OrderTrackerSmallIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import _ from 'lodash';
import { SequenceForDiagnosticStatus } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  GetPatientFeedback,
  GetPatientFeedbackVariables,
} from '@aph/mobile-patients/src/graphql/types/GetPatientFeedback';
import {
  GET_DIAGNOSTIC_ORDER_LIST,
  GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
  GET_PATIENT_FEEDBACK,
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
  handleGraphQlError,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender, isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  DIAGNOSTIC_ORDER_STATUS,
  FEEDBACKTYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { getDiagnosticsOrderStatus_getDiagnosticsOrderStatus_ordersList } from '@aph/mobile-patients/src/graphql/types/getDiagnosticsOrderStatus';

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

export interface TestOrderDetailsProps extends NavigationScreenProps {
  orderId: string;
  showOrderSummaryTab: boolean;
  goToHomeOnBack: boolean;
  comingFrom?: string;
  selectedTest: any;
  individualTestStatus: any;
  selectedOrder: object;
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
  const [showRateDiagnosticBtn, setShowRateDiagnosticBtn] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
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
    DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED,
    DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED,
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

  const orderDetails = ((!loading && order) ||
    {}) as getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList;

  var orderStatusList: any[] = [];
  const sizeOfIndividualTestStatus = _.size(individualTestStatus);

  Object.entries(individualTestStatus).filter((item: any) => {
    if (item[0] == 'null') {
      if (sizeOfIndividualTestStatus == 1) {
        orderStatusList?.push(item[1]);
      } else {
        orderStatusList?.[0].push(item[1][0]);
      }
    } else if (item[0] == selectedTest?.itemId) {
      orderStatusList.push(item[1]);
    }
  });

  const showReportsGenerated =
    sequenceOfStatus.indexOf(selectedTest?.currentStatus) >=
    sequenceOfStatus.indexOf(DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED);
  const isReportGenerated = selectedTest?.currentStatus == DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED;

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
            transactionId: `${selectedTest?.id}`,
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
      sequenceOfStatus.indexOf(selectedTest?.currentStatus) >=
      sequenceOfStatus.indexOf(order?.orderStatus);
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
    const currentStatus = selectedTest?.currentStatus;
    let statusList = [];
    if (currentStatus == DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED) {
      statusList = [
        {
          orderStatus: DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED,
        },
        {
          orderStatus: DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED,
        },
      ];
    } else {
      statusList = [
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
    }

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
              sequenceOfStatus.indexOf(order?.orderStatus);

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
      </View>
    );
  };

  const renderBottomSection = (order: any) => {
    return <View>{showReportsGenerated ? renderButtons() : null}</View>;
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
    props.navigation.navigate(AppRoutes.HealthRecordsHome);
  };

  const onPressButton = (buttonTitle: string) => {
    onPressViewReport();
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

  const renderOrderSummary = () => {
    return !!g(orderDetails, 'totalPrice') && <TestOrderSummaryView orderDetails={orderDetails} />;
  };

  return (
    <View style={{ flex: 1 }}>
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
        </ScrollView>
      </SafeAreaView>
      {renderFeedbackPopup()}
      {loading && <Spinner style={{ zIndex: 200 }} />}
    </View>
  );
};
