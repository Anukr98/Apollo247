import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  GET_DIAGNOSTIC_ORDER_LIST,
  GET_DIAGNOSTIC_ORDER_STATUS,
  GET_DIAGNOSTIC_SLOTS_WITH_AREA_ID,
  RESCHEDULE_DIAGNOSTIC_ORDER,
  SEARCH_DIAGNOSTICS_BY_ID,
} from '@aph/mobile-patients/src/graphql/profiles';
import { AlertPopup } from '@aph/mobile-patients/src/components/ui/AlertPopup';
import {
  getDiagnosticOrdersList,
  getDiagnosticOrdersListVariables,
  getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList,
  getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems,
  getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems_diagnostics,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersList';

import {
  CANCEL_DIAGNOSTIC_ORDER,
  GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { useQuery, useApolloClient } from 'react-apollo-hooks';
import { Overlay } from 'react-native-elements';
import { DropDown, Option } from '@aph/mobile-patients/src/components/ui/DropDown';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { NavigationScreenProps, ScrollView, FlatList } from 'react-navigation';
import {
  CancellationDiagnosticsInput,
  DIAGNOSTIC_ORDER_STATUS,
  RescheduleDiagnosticsInput,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { ScrollableFooter } from '@aph/mobile-patients/src/components/ui/ScrollableFooter';
import { TestOrderCard } from '@aph/mobile-patients/src/components/ui/TestOrderCard';
import { ReasonPopUp } from '@aph/mobile-patients/src/components/ui/ReasonPopUp';
import {
  g,
  getTestSlotDetailsByTime,
  getUniqueTestSlots,
  handleGraphQlError,
  isValidTestSlotWithArea,
  TestSlot,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WhatsAppIcon,
  DropdownGreen,
  CrossPopup,
  BackArrow,
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
  AppConfig,
  SequenceForDiagnosticStatus,
  TestCancelReasons,
  TestReschedulingReasons,
} from '@aph/mobile-patients/src/strings/AppConfig';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  getDiagnosticsOrderStatus,
  getDiagnosticsOrderStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticsOrderStatus';
import _ from 'lodash';
import {
  searchDiagnosticsById,
  searchDiagnosticsByIdVariables,
} from '@aph/mobile-patients/src/graphql/types/searchDiagnosticsById';
import {
  cancelDiagnosticsOrder,
  cancelDiagnosticsOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/cancelDiagnosticsOrder';
import { TestSlotSelectionOverlay } from './TestSlotSelectionOverlay';
import { areaObject } from './TestsCart';
import {
  getDiagnosticSlotsWithAreaID,
  getDiagnosticSlotsWithAreaIDVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlotsWithAreaID';
import {
  rescheduleDiagnosticsOrder,
  rescheduleDiagnosticsOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/rescheduleDiagnosticsOrder';
import { getPackageInclusions } from '@aph/mobile-patients/src/helpers/clientCalls';

export interface DiagnosticsOrderList
  extends getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList {
  maxStatus: string;
  maxTime?: string | undefined | null;
}

const sequenceOfStatus = SequenceForDiagnosticStatus;
const styles = StyleSheet.create({
  noDataCard: {
    height: 'auto',
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
  chatWithUsView: { paddingBottom: 10, paddingTop: 5 },
  chatWithUsTouch: { flexDirection: 'row', justifyContent: 'flex-end' },
  whatsappIconStyle: { height: 24, width: 24, resizeMode: 'contain' },
  chatWithUsText: {
    textAlign: 'center',
    paddingRight: 0,
    marginHorizontal: 5,
    ...theme.viewStyles.text('B', 14, colors.APP_YELLOW),
  },
  dropdownOverlayStyle: {
    padding: 0,
    margin: 0,
    height: 'auto',
    borderRadius: 10,
  },
  cancelReasonHeadingView: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.WHITE,
    padding: 18,
    marginBottom: 24,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flexDirection: 'row',
  },
  cancelReasonHeadingText: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
    textAlign: 'center',
    marginHorizontal: '20%',
  },
  cancelReasonContentHeading: {
    marginBottom: 12,
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  cancelReasonContentView: { flexDirection: 'row', alignItems: 'center' },
  cancelReasonContentText: {
    flex: 0.9,
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SHERPA_BLUE,
  },
  reasonCancelDropDownExtraView: {
    marginTop: 5,
    backgroundColor: '#00b38e',
    height: 2,
  },
  cancelReasonSubmitButton: { margin: 16, marginTop: 32, width: 'auto' },
  reasonCancelOverlay: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    flex: 1,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  reasonCancelCrossTouch: { marginTop: 80, alignSelf: 'flex-end' },
  reasonCancelView: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
});

export interface YourOrdersTestProps extends NavigationScreenProps {}

export const YourOrdersTest: React.FC<YourOrdersTestProps> = (props) => {
  const reasonForCancellation = TestCancelReasons.reasons;
  const reasonForRescheduling = TestReschedulingReasons.reasons;
  const OTHER_REASON = string.Diagnostics_Feedback_Others;

  const {
    setAddresses,
    addresses,
    setDeliveryAddressId,
    deliveryAddressId,

    pinCode,
    setPinCode,
    clinicId,
    setClinicId,
    clinics,
    setClinics,
    ePrescriptions,
    forPatientId,
    setPatientId,
    diagnosticSlot,
    setDiagnosticClinic,
    setDiagnosticSlot,
    setEPrescriptions,
    deliveryCharges,
    coupon,
  } = useDiagnosticsCart();

  const { currentPatient } = useAllCurrentPatients();
  const { loading, setLoading, showAphAlert, hideAphAlert } = useUIElements();

  const [date, setDate] = useState<Date>(new Date());

  /**cancel & reschedule */
  const [showCancelPopUp, setCancelPopUp] = useState<boolean>(false);
  const [showReschedulePopUp, setReschedulePopUp] = useState<boolean>(false);
  const [showCancelReasonPopUp, setCancelReasonPopUp] = useState<boolean>(false);
  const [showRescheduleReasonPopUp, setRescheduleReasonPopUp] = useState<boolean>(false);
  const [showDisplaySchedule, setDisplaySchedule] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number>(0);
  const [apiLoading, setApiLoading] = useState(false);
  const [slots, setSlots] = useState<TestSlot[]>([]);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<TestSlot>();

  const [selectedReasonForCancel, setSelectedReasonForCancel] = useState('');
  const [commentForCancel, setCommentForCancel] = useState('');

  const [selectedReasonForReschedule, setSelectedReasonForReschedule] = useState('');
  const [commentForReschedule, setCommentForReschedule] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<
    getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList
  >();
  const [error, setError] = useState(false);
  const { getPatientApiCall } = useAuth();
  const client = useApolloClient();
  const [orders, setOrders] = useState<any>(props.navigation.getParam('orders'));

  const cancelOrder = (cancellationDiagnosticsInput: CancellationDiagnosticsInput) =>
    client.mutate<cancelDiagnosticsOrder, cancelDiagnosticsOrderVariables>({
      mutation: CANCEL_DIAGNOSTIC_ORDER,
      context: { sourceHeaders },
      variables: { cancellationDiagnosticsInput: cancellationDiagnosticsInput },
      fetchPolicy: 'no-cache',
    });

  const setInitialState = () => {
    setLoading!(false);
    // setCancelPopUp(false);
    // setReschedulePopUp(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  const refetchOrders = async () => {
    fetchOrders();
  };

  const fetchOrders = async () => {
    try {
      setLoading!(true);
      client
        .query<getDiagnosticOrdersList, getDiagnosticOrdersListVariables>({
          query: GET_DIAGNOSTIC_ORDER_LIST,
          context: {
            sourceHeaders,
          },
          variables: {
            patientId: currentPatient && currentPatient.id,
          },
          fetchPolicy: 'no-cache',
        })
        .then((data) => {
          const ordersList = data?.data?.getDiagnosticOrdersList?.ordersList || [];
          setOrders(ordersList);
          setLoading!(false);
        })
        .catch((error) => {
          setLoading!(false);
          setError(true);
          CommonBugFender(`${AppRoutes.YourOrdersTest}_fetchOrders`, error);
        });
    } catch (error) {
      setLoading!(false);
      setError(true);
      CommonBugFender(`${AppRoutes.YourOrdersTest}_fetchOrders`, error);
    }
  };

  const onSubmitCancelOrder = (reason: string, comment: string) => {
    setLoading!(true);
    setSelectedReasonForCancel(reason);
    setCommentForCancel(comment);
    setCancelReasonPopUp(false);

    const orderCancellationInput: CancellationDiagnosticsInput = {
      comment: comment,
      orderId: String(selectedOrderId),
      patientId: g(currentPatient, 'id'),
      reason: reason,
    };
    console.log({ orderCancellationInput });
    cancelOrder(orderCancellationInput)
      .then((data) => {
        console.log({ data });
        const cancelResponse = g(data, 'data', 'cancelDiagnosticsOrder', 'status');
        if (cancelResponse == 'true') {
          setLoading!(true);
          refetchOrders()
            .then((data: any) => {
              const _orders = g(data, 'data', 'getDiagnosticOrdersList', 'ordersList') || [];
              console.log({ _orders });
              setOrders(_orders);
              setLoading!(false);
            })
            .catch((e: any) => {
              CommonBugFender('TestOrderDetails_refetch_callApiAndRefetchOrderDetails', e);
              setInitialState();
            });
        }
        //refetch the orders
      })
      .catch((error) => {
        // DIAGNOSTIC_CANCELLATION_ALLOWED_BEFORE_IN_HOURS
        CommonBugFender('TestOrderDetails_callApiAndRefetchOrderDetails', error);
        handleGraphQlError(error);
        setLoading!(false);
      })
      .finally(() => {
        setLoading!(false);
        console.log('finally mein');
      });
  };

  const getSlotStartTime = (slot: string /*07:00-07:30 */) => {
    return moment((slot.split('-')[0] || '').trim(), 'hh:mm').format('hh:mm A');
  };

  const mapStatusWithText = (val: string) => {
    return val?.replace(/[_]/g, ' ');
  };

  const checkIfPreTestingExists = (
    order: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList
  ) => {
    if (order != null) {
      const filterPreTestingData = order?.diagnosticOrderLineItems?.filter((items) =>
        items?.itemObj
          ? items?.itemObj?.testPreparationData != ''
          : items?.diagnostics?.testPreparationData != ''
      );
      return filterPreTestingData?.length == 0 ? false : true;
    }
    return false;
  };

  const onPressTestCancel = (item: any) => {
    setCancelPopUp(true);
    setSelectedOrderId(item.id);
    setSelectedOrder(item);
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
      <View
        style={{
          backgroundColor: 'rgba(0,0,0,0.8)',
          position: 'absolute',
          width: '100%',
          height: '100%',
          justifyContent: 'flex-start',
          flex: 1,
          left: 0,
          right: 0,
          zIndex: 3000,
        }}
      >
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

  const _navigateToYourTestDetails = (order: any) => {
    props.navigation.navigate(AppRoutes.OrderedTestStatus, {
      orderId: order!.id,
      selectedOrder: order,
      setOrders: (orders: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList[]) =>
        setOrders(orders),
      // refetch: refetch,
    });
  };

  const _navigateToPHR = () => {
    props.navigation.navigate(AppRoutes.HealthRecordsHome);
  };

  const renderOrder = (order: DiagnosticsOrderList, index: number) => {
    if (
      order.orderStatus == DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED ||
      order?.diagnosticOrderLineItems?.length == 0
    ) {
      return;
    }

    const getUTCDateTime = order?.slotDateTimeInUTC;
    const isHomeVisit = !!order.slotTimings;
    const dt = moment(getUTCDateTime != null ? getUTCDateTime : order?.diagnosticDate!).format(
      `D MMM YYYY`
    );
    const tm =
      getUTCDateTime != null
        ? moment(getUTCDateTime).format()
        : getSlotStartTime(order?.slotTimings);
    const dtTm = `${dt}${isHomeVisit ? `, ${tm}` : 'hh:mm A'}`;

    const currentStatus = order?.maxStatus! ? order?.maxStatus! : order?.orderStatus;
    const patientName = g(currentPatient, 'firstName');

    const isCancelRescheduleValid = moment(getUTCDateTime).diff(moment(), 'minutes') > 120;
    const showPreTesting = isCancelRescheduleValid && checkIfPreTestingExists(order);
    const showRescheduleOption = isCancelRescheduleValid && order?.rescheduleCount! <= 3;
    /**
     *  1. show reports generated, if any of the status of the test goes into sample collected.
     *  2. if status is pickup requested, then show cancel - reschedule option prior 2hrs to pick up date-time
     *  3. if pickup confirmed, then don't show anything?
     *  4. if greater than this, then start showing view report option
     */

    return (
      <TestOrderCard
        key={`${order.id}`}
        orderId={`${order.displayId}`}
        showStatus={false}
        patientName={patientName}
        isComingFrom={'individualOrders'}
        showDateTime={false}
        showRescheduleOption={showRescheduleOption}
        showRescheduleCancel={
          isCancelRescheduleValid && order.orderStatus != DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED
        }
        ordersData={order?.diagnosticOrderLineItems!}
        dateTime={`Scheduled For: ${dtTm}`}
        statusDesc={isHomeVisit ? 'Home Visit' : 'Clinic Visit'}
        isCancelled={currentStatus == DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED}
        showViewReport={false}
        onPress={() => {
          _navigateToYourTestDetails(order);
        }}
        status={currentStatus}
        statusText={mapStatusWithText(currentStatus)}
        style={[
          { marginHorizontal: 20 },
          index < orders.length - 1 ? { marginBottom: 8 } : { marginBottom: 20 },
          index == 0 ? { marginTop: 20 } : {},
        ]}
        onPressCancel={() => onPressTestCancel(order)}
        onPressReschedule={() => onPressTestReschedule(order)}
        showTestPreparation={showPreTesting}
        onOptionPress={() => _navigateToYourTestDetails(order)}
        onPressViewReport={() => _navigateToPHR()}
      />
    );
  };

  const renderOrders = () => {
    return (
      <FlatList
        bounces={false}
        data={orders}
        renderItem={({ item, index }) => renderOrder(item, index)}
        ListEmptyComponent={renderNoOrders()}
      />
    );
  };

  const renderNoOrders = () => {
    if (!loading && !error && orders.length == 0) {
      return (
        <Card
          cardContainer={[styles.noDataCard]}
          heading={'Uh oh! :('}
          description={'No Orders Found!'}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        >
          <Button
            style={{ marginTop: 20 }}
            title={'ORDER NOW'}
            onPress={() => {
              props.navigation.navigate(AppRoutes.SearchTestScene);
            }}
          />
        </Card>
      );
    }
  };

  const renderError = () => {
    if (error) {
      return (
        <Card
          cardContainer={[styles.noDataCard]}
          heading={'Uh oh! :('}
          description={'Something went wrong.'}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        />
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {showCancelReasonPopUp && renderCancelReasonPopUp()}
      {/* {showRescheduleReasonPopUp && renderRescheduleReasonPopUp()} */}
      {/* {showDisplaySchedule && renderRescheduleOrderOverlay()} */}
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          title={string.orders.urOrders}
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView bounces={false} scrollEventThrottle={1}>
          {renderError()}
          {renderOrders()}
          {/* {!loading && !error && renderChatWithUs()} */}
          {renderCancelPopUp()}
          {/* {renderReschedulePopUp()} */}
        </ScrollView>
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};
