import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  GET_DIAGNOSTIC_ORDER_LIST,
  GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
  GET_DIAGNOSTIC_SLOTS_WITH_AREA_ID,
  GET_PATIENT_ADDRESS_BY_ID,
  RESCHEDULE_DIAGNOSTIC_ORDER,
} from '@aph/mobile-patients/src/graphql/profiles';
import { AlertPopup } from '@aph/mobile-patients/src/components/ui/AlertPopup';
import {
  getDiagnosticOrdersList,
  getDiagnosticOrdersListVariables,
  getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersList';

import { CANCEL_DIAGNOSTIC_ORDER } from '@aph/mobile-patients/src/graphql/profiles';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Dimensions,
  BackHandler,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import {
  CancellationDiagnosticsInput,
  DIAGNOSTIC_ORDER_STATUS,
  RescheduleDiagnosticsInput,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { TestOrderCard } from '@aph/mobile-patients/src/components/ui/TestOrderCard';
import { ReasonPopUp } from '@aph/mobile-patients/src/components/ui/ReasonPopUp';
import { useApolloClient } from 'react-apollo-hooks';
import {
  g,
  getTestOrderStatusText,
  getTestSlotDetailsByTime,
  getUniqueTestSlots,
  handleGraphQlError,
  isValidTestSlotWithArea,
  TestSlot,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  AppConfig,
  BLACK_LIST_CANCEL_STATUS_ARRAY,
  BLACK_LIST_RESCHEDULE_STATUS_ARRAY,
  SequenceForDiagnosticStatus,
  TestCancelReasons,
  TestReschedulingReasons,
} from '@aph/mobile-patients/src/strings/AppConfig';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import _ from 'lodash';
import {
  cancelDiagnosticsOrder,
  cancelDiagnosticsOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/cancelDiagnosticsOrder';
import { TestSlotSelectionOverlay } from './TestSlotSelectionOverlay';
import {
  getDiagnosticSlotsWithAreaID,
  getDiagnosticSlotsWithAreaIDVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlotsWithAreaID';
import {
  rescheduleDiagnosticsOrder,
  rescheduleDiagnosticsOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/rescheduleDiagnosticsOrder';
import {
  getPatientAddressById,
  getPatientAddressByIdVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressById';
import { TestOrderSummaryView } from '../TestOrderSummaryView';
import {
  getDiagnosticOrderDetails,
  getDiagnosticOrderDetailsVariables,
  getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrderDetails';

export interface DiagnosticsOrderList
  extends getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList {
  maxStatus: string;
  maxTime?: string | undefined | null;
}
const width = Dimensions.get('window').width;
const isSmallDevice = width < 380;
const sequenceOfStatus = SequenceForDiagnosticStatus;

export interface YourOrdersTestProps extends NavigationScreenProps {}

export const YourOrdersTest: React.FC<YourOrdersTestProps> = (props) => {
  const reasonForCancellation = TestCancelReasons.reasons;
  const reasonForRescheduling = TestReschedulingReasons.reasons;
  const OTHER_REASON = string.Diagnostics_Feedback_Others;

  const { addresses, diagnosticSlot, setDiagnosticSlot } = useDiagnosticsCart();

  const { currentPatient } = useAllCurrentPatients();
  const { loading, setLoading, showAphAlert, hideAphAlert } = useUIElements();

  const [date, setDate] = useState<Date>(new Date());

  /**cancel & reschedule */
  const [showCancelPopUp, setCancelPopUp] = useState<boolean>(false);
  const [showReschedulePopUp, setReschedulePopUp] = useState<boolean>(false);
  const [showCancelReasonPopUp, setCancelReasonPopUp] = useState<boolean>(false);
  const [showRescheduleReasonPopUp, setRescheduleReasonPopUp] = useState<boolean>(false);
  const [showDisplaySchedule, setDisplaySchedule] = useState<boolean>(false);
  const [pincode, setPincode] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<number>(0);
  const [slots, setSlots] = useState<TestSlot[]>([]);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<TestSlot>();
  const [showSummaryPopup, setSummaryPopup] = useState<boolean>(false);
  const showSummaryPopupRef = useRef<boolean>(false);
  const [orderDetails, setOrderDetails] = useState<
    getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList
  >();
  const [rescheduleCount, setRescheduleCount] = useState<any>(null);
  const [rescheduledTime, setRescheduledTime] = useState<any>('');
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
  const statusForCancelReschedule = [
    DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED,
    DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED,
    DIAGNOSTIC_ORDER_STATUS.PAYMENT_SUCCESSFUL,
    DIAGNOSTIC_ORDER_STATUS.PHLEBO_PENDING,
    DIAGNOSTIC_ORDER_STATUS.ORDER_RESCHEDULED,
  ];
  var rescheduleDate: Date,
    rescheduleSlotObject: {
      slotStartTime: any;
      slotEndTime?: string;
      date?: number;
      employeeSlotId?: string;
      diagnosticBranchCode?: string;
      diagnosticEmployeeCode?: string;
      city?: string;
    };

  const cancelOrder = (cancellationDiagnosticsInput: CancellationDiagnosticsInput) =>
    client.mutate<cancelDiagnosticsOrder, cancelDiagnosticsOrderVariables>({
      mutation: CANCEL_DIAGNOSTIC_ORDER,
      context: { sourceHeaders },
      variables: { cancellationDiagnosticsInput: cancellationDiagnosticsInput },
      fetchPolicy: 'no-cache',
    });

  const rescheduleOrder = (rescheduleDiagnosticsInput: RescheduleDiagnosticsInput) =>
    client.mutate<rescheduleDiagnosticsOrder, rescheduleDiagnosticsOrderVariables>({
      mutation: RESCHEDULE_DIAGNOSTIC_ORDER,
      variables: { rescheduleDiagnosticsInput: rescheduleDiagnosticsInput },
      fetchPolicy: 'no-cache',
    });

  const handleBack = () => {
    if (showSummaryPopupRef.current) {
      setSummaryPopup(false);
      return true;
    }
    return false;
  };

  useEffect(() => {
    showSummaryPopupRef.current = showSummaryPopup;
  }, [showSummaryPopup]);

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

  useEffect(() => {
    fetchOrders(false);
  }, []);

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  const refetchOrders = async () => {
    fetchOrders(true);
  };

  const fetchOrders = async (isRefetch: boolean) => {
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
          setTimeout(() => setLoading!(false), isRefetch ? 1000 : 0);
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

  const fetchOrderDetails = async (order: any) => {
    try {
      setLoading!(true);
      client
        .query<getDiagnosticOrderDetails, getDiagnosticOrderDetailsVariables>({
          query: GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
          context: {
            sourceHeaders,
          },
          variables: { diagnosticOrderId: order?.id },
          fetchPolicy: 'no-cache',
        })

        .then((data) => {
          const getOrderDetails =
            g(data, 'data', 'getDiagnosticOrderDetails', 'ordersList') ||
            ({} as getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList);
          setSelectedOrder(order);
          setOrderDetails(getOrderDetails);
          setLoading!(false);
          setSummaryPopup(true);
        })
        .catch((error) => {
          setLoading!(false);
          CommonBugFender(`${AppRoutes.YourOrdersTest}_fetchOrderDetails`, error);
        });
    } catch (error) {
      setLoading!(false);
      CommonBugFender(`${AppRoutes.YourOrdersTest}_fetchOrderDetails`, error);
    }
  };

  const getAddressDatails = async () => {
    try {
      setLoading!(true);
      const address = addresses.find((item) => item?.id == selectedOrder?.patientAddressId);
      let getPincode = '';
      if (address) {
        getPincode = address?.zipcode!;
      } else {
        const getPatientAddressByIdResponse = await client.query<
          getPatientAddressById,
          getPatientAddressByIdVariables
        >({
          query: GET_PATIENT_ADDRESS_BY_ID,
          variables: { id: selectedOrder?.patientAddressId },
        });

        getPincode = g(
          getPatientAddressByIdResponse,
          'data',
          'getPatientAddressById',
          'patientAddress',
          'zipcode'
        )!;
      }
      setPincode(getPincode);
      setLoading!(false);

      setDisplaySchedule(true); //show slot popup
    } catch (error) {
      setLoading!(false);
      CommonBugFender(`${AppRoutes.YourOrdersTest}_getAddressDatails`, error);
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
      .then((data: any) => {
        console.log({ data });
        const cancelResponse = g(data, 'data', 'cancelDiagnosticsOrder', 'status');
        if (cancelResponse == 'true') {
          setLoading!(true);
          setTimeout(() => refetchOrders(), 2000);
          showAphAlert!({
            unDismissable: true,
            title: 'Hi! :)',
            description: string.diagnostics.orderCancelledSuccessText,
          });
        } else {
          setLoading!(false);
          showAphAlert!({
            unDismissable: true,
            title: string.common.uhOh,
            description: cancelResponse?.message,
          });
        }
        //refetch the orders
      })
      .catch((error) => {
        // DIAGNOSTIC_CANCELLATION_ALLOWED_BEFORE_IN_HOURS
        CommonBugFender('TestOrderDetails_callApiAndRefetchOrderDetails', error);
        handleGraphQlError(error);
        setLoading!(false);
      });
  };

  const getSlotStartTime = (slot: string /*07:00-07:30 */) => {
    return moment((slot?.split('-')[0] || '').trim(), 'hh:mm').format('hh:mm A');
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

  const renderOrderSummary = () => {
    return showSummaryPopup ? (
      <View style={styles.reasonCancelOverlay}>
        <View style={styles.orderSummaryOuterView}>
          <View
            style={[
              styles.reasonCancelView,
              {
                backgroundColor: 'transparent',
              },
            ]}
          >
            <TestOrderSummaryView
              orderDetails={orderDetails!}
              showViewOrderDetails={true}
              onPressViewDetails={() => _navigateToYourTestDetails(selectedOrder)}
            />
          </View>
          <TouchableOpacity style={{ marginTop: 20 }} onPress={() => setSummaryPopup(false)}>
            <CrossPopup
              style={{ height: isSmallDevice ? 20 : 28, width: isSmallDevice ? 20 : 28 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    ) : null;
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
      <View style={styles.reasonCancelOverlay}>
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

  const checkSlotSelection = () => {
    const dt = moment(selectedOrder?.slotDateTimeInUTC).format('YYYY-MM-DD') || null;
    const tm = moment(selectedOrder?.slotDateTimeInUTC).format('hh:mm') || null;

    const orderItemId = selectedOrder?.diagnosticOrderLineItems?.map((item) => item?.itemId);
    const checkCovidItem = orderItemId?.map((item) =>
      AppConfig.Configuration.DIAGNOSTIC_COVID_SLOT_ITEMID.includes(Number(item))
    );

    const isCovidItemInCart = checkCovidItem?.find((item) => item == false);
    const isContainOnlyCovidItem = isCovidItemInCart == undefined ? true : isCovidItemInCart;

    client
      .query<getDiagnosticSlotsWithAreaID, getDiagnosticSlotsWithAreaIDVariables>({
        query: GET_DIAGNOSTIC_SLOTS_WITH_AREA_ID,
        fetchPolicy: 'no-cache',
        variables: {
          selectedDate: moment(date).format('YYYY-MM-DD'), //whether current date or the one which we gt fron diagnostiv api
          areaID: Number(selectedOrder?.areaId!),
        },
      })
      .then(({ data }) => {
        const diagnosticSlots = g(data, 'getDiagnosticSlotsWithAreaID', 'slots') || [];
        console.log('ORIGINAL DIAGNOSTIC SLOTS', { diagnosticSlots });

        const covidItem_Slot_StartTime = moment(
          AppConfig.Configuration.DIAGNOSTIC_COVID_MIN_SLOT_TIME,
          'HH:mm'
        );

        const updatedDiagnosticSlots =
          moment(date).format('YYYY-MM-DD') == dt
            ? diagnosticSlots.filter((item) => item?.Timeslot != tm)
            : diagnosticSlots;

        const diagnosticSlotsToShow = isContainOnlyCovidItem
          ? updatedDiagnosticSlots?.filter((item) =>
              moment(item?.Timeslot!, 'HH:mm').isSameOrAfter(covidItem_Slot_StartTime)
            )
          : updatedDiagnosticSlots;

        const slotsArray: TestSlot[] = [];
        diagnosticSlotsToShow?.forEach((item) => {
          if (isValidTestSlotWithArea(item!, date)) {
            slotsArray.push({
              employeeCode: 'apollo_employee_code',
              employeeName: 'apollo_employee_name',
              slotInfo: {
                endTime: item?.Timeslot!,
                status: 'empty',
                startTime: item?.Timeslot!,
                slot: item?.TimeslotID,
              },
              date: date,
              diagnosticBranchCode: 'apollo_route',
            } as TestSlot);
          }
        });

        const uniqueSlots = getUniqueTestSlots(slotsArray);
        setSlots(slotsArray);
        uniqueSlots?.length &&
          setselectedTimeSlot(
            getTestSlotDetailsByTime(slotsArray, uniqueSlots[0].startTime!, uniqueSlots[0].endTime!)
          );

        //call the api to get the pincode.
        getAddressDatails();
      })
      .catch((e) => {
        CommonBugFender('TestsCart_checkServicability', e);
        console.log('Error occured', { e });
        setDiagnosticSlot && setDiagnosticSlot(null);
        setselectedTimeSlot(undefined);
        const noHubSlots = g(e, 'graphQLErrors', '0', 'message') === 'NO_HUB_SLOTS';

        if (noHubSlots) {
          showAphAlert!({
            title: string.common.uhOh,
            description: `Sorry! There are no slots available on ${moment(date).format(
              'DD MMM, YYYY'
            )}. Please choose another date.`,
            onPressOk: () => {
              setDisplaySchedule(true);
              hideAphAlert && hideAphAlert();
            },
          });
        } else {
          //not trigger
          showAphAlert!({
            title: string.common.uhOh,
            description: string.diagnostics.areaNotAvailableMessage,
          });
        }
      });
  };

  const onPressTestReschedule = (item: any) => {
    console.log({ item });
    setSelectedOrderId(item.id);
    setSelectedOrder(item);
    setReschedulePopUp(true);
  };

  const renderReschedulePopUp = () => {
    const selectedOrderRescheduleCount = selectedOrder?.rescheduleCount;
    const setRescheduleCount = !!selectedOrderRescheduleCount
      ? 2 - selectedOrderRescheduleCount
      : 2;

    return (
      <AlertPopup
        visible={showReschedulePopUp}
        onDismiss={() => setReschedulePopUp(false)}
        title={
          selectedOrderRescheduleCount == 3
            ? string.diagnostics.reschduleCountExceed
            : string.diagnostics.rescheduleCountText.replace(
                '{{setRescheduleCount}}',
                String(setRescheduleCount)
              )
        }
        leftButton={'CANCEL'}
        rightButton={'OK, GOT IT'}
        showCloseIcon={false}
        onContinue={() => {
          //call the cancel
          setReschedulePopUp(false);
          selectedOrderRescheduleCount == 3 ? null : setRescheduleReasonPopUp(true);
        }}
      />
    );
  };

  const renderRescheduleReasonPopUp = () => {
    //show skip option
    return showRescheduleReasonPopUp ? (
      <View style={styles.reasonCancelOverlay}>
        <ReasonPopUp
          onPressSubmit={(reason, comment) => onSubmitRescheduleRequest(reason, comment)}
          cancelVisible={showRescheduleReasonPopUp}
          headingText={'Reschedule Order'}
          reasonForCancelText={'Why are you rescheduling this order?'}
          dropDownOptions={reasonForRescheduling}
          onPressCross={hideRescheduleReasonOverlay}
          otherReasonText={OTHER_REASON}
          optionPlaceholderText={'Select reason for rescheduling'}
          submitOthersWithoutComment={true}
          showSkip={true}
        />
      </View>
    ) : null;
  };

  const onSubmitRescheduleRequest = (reason: string, comment: string) => {
    //show the slot pop up and call teh api
    setLoading!(true);
    setSelectedReasonForReschedule(reason);
    setCommentForReschedule(comment);
    setRescheduleReasonPopUp(false);

    checkSlotSelection();
  };

  const hideRescheduleReasonOverlay = () => {
    setRescheduleReasonPopUp(false);
  };

  const onReschduleDoneSelected = () => {
    setLoading!(true);
    const formattedDate = moment(rescheduleDate || diagnosticSlot?.date).format('YYYY-MM-DD');
    const formatTime = rescheduleSlotObject?.slotStartTime || diagnosticSlot?.slotStartTime;
    const employeeSlot =
      rescheduleSlotObject?.employeeSlotId?.toString() ||
      diagnosticSlot?.employeeSlotId?.toString() ||
      '0';
    const dateTimeInUTC = moment(formattedDate + ' ' + formatTime).toISOString();
    const dateTimeToShow = formattedDate + ', ' + moment(dateTimeInUTC).format('hh:mm A');
    console.log({ dateTimeInUTC });
    const rescheduleDiagnosticsInput: RescheduleDiagnosticsInput = {
      comment: commentForReschedule,
      date: formattedDate,
      dateTimeInUTC: dateTimeInUTC,
      orderId: String(selectedOrderId),
      patientId: g(currentPatient, 'id'),
      reason: selectedReasonForReschedule,
      slotId: employeeSlot,
    };

    console.log({ rescheduleDiagnosticsInput });
    rescheduleOrder(rescheduleDiagnosticsInput)
      .then((data) => {
        console.log({ data });
        const rescheduleResponse = g(data, 'data', 'rescheduleDiagnosticsOrder');
        console.log({ rescheduleResponse });
        if (rescheduleResponse?.status == 'true' && rescheduleResponse?.rescheduleCount <= 3) {
          setTimeout(() => refetchOrders(), 2000);
          setRescheduleCount(rescheduleResponse?.rescheduleCount);
          setRescheduledTime(dateTimeInUTC);
          showAphAlert!({
            unDismissable: true,
            title: 'Hi! :)',
            description: string.diagnostics.orderRescheduleSuccessText.replace(
              '{{dateTime}}',
              dateTimeToShow
            ),
          });
        } else {
          setLoading!(false);
          showAphAlert!({
            unDismissable: true,
            title: string.common.uhOh,
            description:
              rescheduleResponse?.message == 'SLOT_ALREADY_BOOKED'
                ? string.diagnostics.sameSlotError
                : rescheduleResponse?.message,
          });
        }
      })
      .catch((error) => {
        console.log('error' + error);
        CommonBugFender('TestOrderDetails_callApiAndRefetchOrderDetails', error);
        setLoading!(false);
        if (
          error?.message?.indexOf('RESCHEDULE_COUNT_EXCEEDED') > 0 ||
          error?.message?.indexOf('SLOT_ALREADY_BOOKED') > 0
        ) {
          showAphAlert!({
            unDismissable: true,
            title: string.common.uhOh,
            description:
              error?.message?.indexOf('RESCHEDULE_COUNT_EXCEEDED') > 0
                ? string.diagnostics.sameSlotError
                : string.diagnostics.reschduleCountExceed,
          });
        } else {
          handleGraphQlError(error);
        }
      });
  };

  const renderRescheduleOrderOverlay = () => {
    const orderItemId = selectedOrder?.diagnosticOrderLineItems?.map((item) => item?.itemId);
    return (
      <View style={{ flex: 1 }}>
        <TestSlotSelectionOverlay
          heading="Schedule Appointment"
          date={date}
          areaId={String(selectedOrder?.areaId)}
          maxDate={moment()
            .add(AppConfig.Configuration.DIAGNOSTIC_SLOTS_MAX_FORWARD_DAYS, 'day')
            .toDate()}
          isVisible={showDisplaySchedule}
          onClose={() => setDisplaySchedule(false)}
          slots={slots}
          zipCode={Number(pincode!)}
          slotInfo={selectedTimeSlot}
          isReschdedule={true}
          itemId={orderItemId}
          slotBooked={selectedOrder?.slotDateTimeInUTC}
          onSchedule={(date1: Date, slotInfo: TestSlot) => {
            rescheduleDate = date1;
            rescheduleSlotObject = {
              slotStartTime: slotInfo?.slotInfo?.startTime!,
              slotEndTime: slotInfo?.slotInfo?.endTime!,
              date: date1?.getTime(),
              employeeSlotId: slotInfo?.slotInfo?.slot!,
              diagnosticBranchCode: slotInfo?.diagnosticBranchCode,
              diagnosticEmployeeCode: slotInfo?.employeeCode,
              city: '', // not using city from this in order place API
            };

            setDate(date1);
            setselectedTimeSlot(slotInfo);

            setDiagnosticSlot!({
              slotStartTime: slotInfo.slotInfo.startTime!,
              slotEndTime: slotInfo.slotInfo.endTime!,
              date: date1.getTime(),
              employeeSlotId: slotInfo.slotInfo.slot!,
              diagnosticBranchCode: slotInfo.diagnosticBranchCode,
              diagnosticEmployeeCode: slotInfo.employeeCode,
              city: '', // not using city from this in order place API
            });
            console.log({ diagnosticSlot });
            setDisplaySchedule(false);
            //call rechedule api
            setTimeout(() => onReschduleDoneSelected(), 100);
          }}
        />
      </View>
    );
  };

  const _navigateToYourTestDetails = (order: any) => {
    showSummaryPopup && setSummaryPopup(!showSummaryPopup);
    props.navigation.navigate(AppRoutes.OrderedTestStatus, {
      orderId: order?.id,
      selectedOrder: order,
      setOrders: (orders: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList[]) =>
        setOrders(orders),
    });
  };

  const _openOrderSummary = (order: any) => {
    fetchOrderDetails(order);
  };

  const _navigateToPHR = () => {
    props.navigation.navigate(AppRoutes.HealthRecordsHome);
  };

  const renderOrder = (order: DiagnosticsOrderList, index: number) => {
    if (order?.diagnosticOrderLineItems?.length == 0) {
      return <View style={{ paddingTop: 4 }} />;
    }
    const getUTCDateTime = order?.slotDateTimeInUTC;
    const dt = moment(getUTCDateTime != null ? getUTCDateTime : order?.diagnosticDate!).format(
      `D MMM YYYY`
    );
    const tm =
      getUTCDateTime != null
        ? moment(getUTCDateTime).format('hh:mm A')
        : getSlotStartTime(order?.slotTimings);
    const dtTm = `${dt}, ${tm}`;

    const currentStatus = order?.orderStatus;
    const patientName = g(currentPatient, 'firstName');

    const showDateTime = order?.isRescheduled ? true : false;

    /**
     * show cancel & reschdule if status is something like this.
     */
    const isCancelValid = order?.diagnosticOrdersStatus?.find((item) =>
      BLACK_LIST_CANCEL_STATUS_ARRAY.includes(item?.orderStatus!)
    );

    const showCancel = isCancelValid == undefined ? true : false;

    const isRescheduleValid = order?.diagnosticOrdersStatus?.find((item: any) =>
      BLACK_LIST_RESCHEDULE_STATUS_ARRAY.includes(item?.orderStatus)
    );

    const showReschedule = isRescheduleValid == undefined ? true : false;
    /**
     * as per previous check
     */
    // const isCancelRescheduleValid =
    //   moment(getUTCDateTime).diff(moment(), 'minutes') > 120 &&
    //   statusForCancelReschedule.includes(currentStatus);

    //show the reschedule option :-

    const showPreTesting = showReschedule && checkIfPreTestingExists(order);
    const showRescheduleOption = showReschedule && order?.rescheduleCount! <= 3;
    /**
     *  1. show reports generated, if any of the status of the test goes into sample collected.
     *  2. if status is pickup requested, then show cancel - reschedule option prior 2hrs to pick up date-time
     *  3. if pickup confirmed, then don't show anything?
     *  4. if greater than this, then start showing view report option
     *  5. only showing if reschedule is showing + !orderCancelled + done reschedule
     */

    return (
      <TestOrderCard
        key={`${order.id}`}
        orderId={`${order.displayId}`}
        showStatus={false}
        patientName={patientName}
        isComingFrom={'individualOrders'}
        showDateTime={
          showCancel && order?.orderStatus != DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED
            ? showDateTime
            : false
        }
        showRescheduleCancel={
          showReschedule && order?.orderStatus != DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED
        }
        ordersData={order?.diagnosticOrderLineItems!}
        dateTime={`Rescheduled For: ${dtTm}`}
        statusDesc={'Home Visit'}
        isCancelled={currentStatus == DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED}
        showViewReport={false}
        onPress={() => {
          _navigateToYourTestDetails(order);
        }}
        status={currentStatus}
        statusText={getTestOrderStatusText(currentStatus)}
        style={[
          { marginHorizontal: 20 },
          index < orders?.length - 1 ? { marginBottom: 8 } : { marginBottom: 20 },
          index == 0 ? { marginTop: 20 } : {},
        ]}
        onPressCancel={() => onPressTestCancel(order)}
        onPressReschedule={() => onPressTestReschedule(order)}
        showTestPreparation={showPreTesting!}
        onOptionPress={() => _openOrderSummary(order)}
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
    if (!loading && !error && orders?.length == 0) {
      return (
        <Card
          cardContainer={[styles.noDataCard]}
          heading={string.common.uhOh}
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
          heading={string.common.uhOh}
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
      {showRescheduleReasonPopUp && renderRescheduleReasonPopUp()}
      {showDisplaySchedule && renderRescheduleOrderOverlay()}
      {showSummaryPopup && renderOrderSummary()}
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
          {renderCancelPopUp()}
          {renderReschedulePopUp()}
        </ScrollView>
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};

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
    zIndex: 3000,
  },
  reasonCancelCrossTouch: { marginTop: 80, alignSelf: 'flex-end' },
  reasonCancelView: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  orderSummaryOuterView: {
    marginHorizontal: 20,
    flexDirection: 'row',
    marginVertical: '15%',
  },
});
