import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  GET_CUSTOMIZED_DIAGNOSTIC_SLOTS,
  GET_DIAGNOSTIC_ORDER_LIST,
  GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
  GET_INTERNAL_ORDER,
  GET_PATIENT_ADDRESS_BY_ID,
  GET_PHLOBE_DETAILS,
  RESCHEDULE_DIAGNOSTIC_ORDER,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getDiagnosticOrdersList,
  getDiagnosticOrdersListVariables,
  getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList,
  getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrdersStatus,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersList';
import {
  getDiagnosticOrdersListByMobile,
  getDiagnosticOrdersListByMobileVariables,
  getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList,
  getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrdersStatus,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';

import { CANCEL_DIAGNOSTIC_ORDER } from '@aph/mobile-patients/src/graphql/profiles';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
  DIAGNOSTIC_ORDER_STATUS,
  MedicalRecordType,
  RescheduleDiagnosticsInput,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useApolloClient } from 'react-apollo-hooks';
import {
  g,
  getTestOrderStatusText,
  handleGraphQlError,
  TestSlot,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  CrossPopup,
  DisabledTickIcon,
  TickIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
  AppConfig,
  BLACK_LIST_CANCEL_STATUS_ARRAY,
  BLACK_LIST_RESCHEDULE_STATUS_ARRAY,
  DIAGNOSTIC_ORDER_FAILED_STATUS,
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
import { TestSlotSelectionOverlay } from '@aph/mobile-patients/src/components/Tests/components/TestSlotSelectionOverlay';
import {
  rescheduleDiagnosticsOrder,
  rescheduleDiagnosticsOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/rescheduleDiagnosticsOrder';
import {
  getPatientAddressById,
  getPatientAddressByIdVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressById';
import { TestOrderSummaryView } from '@aph/mobile-patients/src/components/Tests/components/TestOrderSummaryView';
import {
  getDiagnosticOrderDetails,
  getDiagnosticOrderDetailsVariables,
  getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrderDetails';
import {
  getOrderInternal,
  getOrderInternalVariables,
} from '@aph/mobile-patients/src/graphql/types/getOrderInternal';
import {
  DiagnosticRescheduleOrder,
  DiagnosticViewReportClicked,
} from '@aph/mobile-patients/src/components/Tests/Events';
import {
  getDiagnosticSlotsCustomized,
  getDiagnosticSlotsCustomizedVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlotsCustomized';
import { OrderTestCard } from '@aph/mobile-patients/src/components/Tests/components/OrderTestCard';
import { getPatientPrismMedicalRecordsApi } from '@aph/mobile-patients/src/helpers/clientCalls';
import { Overlay } from 'react-native-elements';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  getOrderPhleboDetailsBulk,
  getOrderPhleboDetailsBulkVariables,
} from '@aph/mobile-patients/src/graphql/types/getOrderPhleboDetailsBulk';
const screenHeight = Dimensions.get('window').height;

export interface DiagnosticsOrderList
  extends getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList {
  maxStatus: string;
  maxTime?: string | undefined | null;
}

const width = Dimensions.get('window').width;
const isSmallDevice = width < 380;

export interface YourOrdersTestProps extends NavigationScreenProps {}

export const YourOrdersTest: React.FC<YourOrdersTestProps> = (props) => {
  const reasonForCancellation = TestCancelReasons.reasons;
  const reasonForRescheduling = TestReschedulingReasons.reasons;
  const OTHER_REASON = string.Diagnostics_Feedback_Others;

  const { addresses, diagnosticSlot, setDiagnosticSlot } = useDiagnosticsCart();

  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const { loading, setLoading, showAphAlert, hideAphAlert } = useUIElements();

  const [date, setDate] = useState<Date>(new Date());

  const [showDisplaySchedule, setDisplaySchedule] = useState<boolean>(false);
  const [pincode, setPincode] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<number>(0);
  const [slots, setSlots] = useState<TestSlot[]>([]);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<TestSlot>();
  const [showSummaryPopup, setSummaryPopup] = useState<boolean>(false);
  const [todaySlotNotAvailable, setTodaySlotNotAvailable] = useState<boolean>(false);
  const showSummaryPopupRef = useRef<boolean>(false);
  const [orderDetails, setOrderDetails] = useState<
    getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList
  >();
  const [rescheduleCount, setRescheduleCount] = useState<any>(null);
  const [rescheduledTime, setRescheduledTime] = useState<any>('');
  const [selectedReasonForCancel, setSelectedReasonForCancel] = useState('');
  const [commentForCancel, setCommentForCancel] = useState('');

  const RESCHEDULE_REASONS = [
    'Phlebo did not arrive on time',
    'I am not available right now',
    'I did not follow fasting requirement',
    'I picked a wrong slot',
    'Not feeling well to provide sample',
  ];

  const CANCELLATION_REASONS = [
    'Phlebo didn’t Arrive on Time',
    'Need to Modify Order Details',
    'I am not Available Right Now',
    'Booked by Mistake',
    'Need Report Urgently',
    'Others (Please specify)',
  ];

  //new reschedule.
  const [showBottomOverlay, setShowBottomOverlay] = useState<boolean>(false);
  const [showRescheduleOptions, setShowRescheduleOptions] = useState<boolean>(false);
  const [selectRescheduleOption, setSelectRescheduleOption] = useState<boolean>(true);
  const [selectCancelOption, setSelectCancelOption] = useState<boolean>(false);
  const [showRescheduleReasons, setShowRescheduleReasons] = useState<boolean>(false);
  const [showCancelReasons, setShowCancelReasons] = useState<boolean>(false);
  const [selectCancelReason, setSelectCancelReason] = useState<string>('');
  const [cancelReasonComment, setCancelReasonComment] = useState<string>('');
  const [selectRescheduleReason, setSelectRescheduleReason] = useState<string>('');
  const [selectedReasonForReschedule, setSelectedReasonForReschedule] = useState('');
  const [commentForReschedule, setCommentForReschedule] = useState('');
  const [refundStatusArr, setRefundStatusArr] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<
    getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList
  >();
  const [error, setError] = useState(false);
  const { getPatientApiCall } = useAuth();
  const client = useApolloClient();
  const [orders, setOrders] = useState<any>(props.navigation.getParam('orders'));
  const arrData: (string | null)[] = [];
  const phleboOTPData: (number | null)[] = [];

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
      setLoading?.(true);
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
          const orderIdsArr = ordersList?.map((item: any) => item?.id);
          getPhlobeOTP(orderIdsArr, ordersList, isRefetch);
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

  const getPhlobeOTP = (orderIdsArr: any, ordersList: any, isRefetch: boolean) => {
    try {
      setLoading?.(true);
      client
        .query<getOrderPhleboDetailsBulk, getOrderPhleboDetailsBulkVariables>({
          query: GET_PHLOBE_DETAILS,
          context: {
            sourceHeaders,
          },
          variables: {
            diagnosticOrdersIds: orderIdsArr,
          },
          fetchPolicy: 'no-cache',
        })
        .then((data) => {
          if (data?.data?.getOrderPhleboDetailsBulk?.orderPhleboDetailsBulk) {
            const orderPhleboDetailsBulk =
              data?.data?.getOrderPhleboDetailsBulk?.orderPhleboDetailsBulk;
            ordersList?.forEach((order: any) => {
              const findOrder = orderPhleboDetailsBulk?.find(
                (phleboDetails: any) =>
                  phleboDetails?.orderPhleboDetails !== null &&
                  phleboDetails?.orderPhleboDetails?.diagnosticOrdersId === order?.id
              );
              if (findOrder && findOrder.orderPhleboDetails !== null) {
                if (order.phleboDetailsObj === null) {
                  order.phleboDetailsObj = {
                    PhelboOTP: null,
                    __typename: 'PhleboDetailsObj',
                  };
                }
                order.phleboDetailsObj.PhelboOTP = findOrder?.orderPhleboDetails?.phleboOTP;
              }
            });
            setOrders(ordersList);
            setTimeout(() => setLoading!(false), isRefetch ? 1000 : 0);
          } else {
            setOrders(ordersList);
            setLoading?.(false);
          }
        })
        .catch((error) => {
          setLoading!(false);
          CommonBugFender(`${AppRoutes.YourOrdersTest}_fetchPhleboObject`, error);
        });
    } catch (error) {
      setLoading!(false);
      CommonBugFender(`${AppRoutes.YourOrdersTest}_fetchPhleboObject`, error);
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

  const fetchRefundForOrder = async (orderSelected: any, itemNameExist: any, itemIdObject: any) => {
    setRefundStatusArr(null);
    setLoading?.(true);
    client
      .query<getOrderInternal, getOrderInternalVariables>({
        query: GET_INTERNAL_ORDER,
        context: {
          sourceHeaders,
        },
        variables: {
          order_id: orderSelected?.paymentOrderId,
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        const refundData = g(data, 'getOrderInternal', 'refunds');
        if (refundData?.length! > 0) {
          setRefundStatusArr(refundData);
        }
        performNavigation(itemNameExist, orderSelected, itemIdObject, refundData);
      })
      .catch((e) => {
        CommonBugFender('OrderedTestStatus_fetchRefundOrder', e);
        setLoading?.(false);
      });
  };

  const onSubmitCancelOrder = (reason: string, comment: string) => {
    setLoading?.(true);
    setSelectedReasonForCancel(reason);
    setCommentForCancel(comment);

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

  const fetchTestReportResult = useCallback(
    (order: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList) => {
      setLoading?.(true);
      const getVisitId = order?.visitNo;
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
          let resultForVisitNo = labResultsData?.find(
            (item: any) => item?.identifier == getVisitId
          );
          console.log({ resultForVisitNo });

          !!resultForVisitNo && resultForVisitNo?.length > 0
            ? props.navigation.navigate(AppRoutes.HealthRecordDetails, {
                data: resultForVisitNo,
                labResults: true,
              })
            : renderReportError(string.diagnostics.responseUnavailableForReport);
        })
        .catch((error) => {
          CommonBugFender('YourOrdersTests_fetchTestReportsData', error);
          console.log('Error occured fetchTestReportsResult', { error });
          currentPatient && handleGraphQlError(error);
        })
        .finally(() => setLoading?.(false));
    },
    []
  );

  const renderReportError = (message: string) => {
    showAphAlert?.({
      title: string.common.uhOh,
      description: message,
    });
  };

  const checkIfPreTestingExists = (
    order: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList
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

  const checkSlotSelection = () => {
    const dt = moment(selectedOrder?.slotDateTimeInUTC)?.format('YYYY-MM-DD') || null;
    const tm = moment(selectedOrder?.slotDateTimeInUTC)?.format('hh:mm') || null;

    const orderItemId = selectedOrder?.diagnosticOrderLineItems?.map((item) =>
      Number(item?.itemId)
    );

    client
      .query<getDiagnosticSlotsCustomized, getDiagnosticSlotsCustomizedVariables>({
        query: GET_CUSTOMIZED_DIAGNOSTIC_SLOTS,
        fetchPolicy: 'no-cache',
        variables: {
          selectedDate: moment(date).format('YYYY-MM-DD'), //whether current date or the one which we gt fron diagnostiv api
          areaID: Number(selectedOrder?.areaId!),
          itemIds: orderItemId!,
        },
      })
      .then(({ data }) => {
        const diagnosticSlots = g(data, 'getDiagnosticSlotsCustomized', 'slots') || [];
        console.log('ORIGINAL DIAGNOSTIC SLOTS', { diagnosticSlots });

        const updatedDiagnosticSlots =
          moment(date).format('YYYY-MM-DD') == dt
            ? diagnosticSlots.filter((item) => item?.Timeslot != tm)
            : diagnosticSlots;

        const slotsArray: TestSlot[] = [];
        updatedDiagnosticSlots?.forEach((item) => {
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
        });

        const isSameDate = moment().isSame(moment(date), 'date');
        if (isSameDate && slotsArray?.length == 0) {
          setTodaySlotNotAvailable(true);
        } else {
          todaySlotNotAvailable && setTodaySlotNotAvailable(false);
        }

        setSlots(slotsArray);
        const slotDetails = slotsArray?.[0];
        slotsArray?.length && setselectedTimeSlot(slotDetails);

        //call the api to get the pincode.
        getAddressDatails();
      })
      .catch((e) => {
        CommonBugFender('TestsCart_checkServicability', e);
        console.log('Error occured', { e });
        setDiagnosticSlot && setDiagnosticSlot(null);
        setselectedTimeSlot(undefined);
        const noHubSlots = g(e, 'graphQLErrors', '0', 'message') === 'NO_HUB_SLOTS';
        setLoading?.(false);
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
          setLoading?.(false);
          //not trigger
          showAphAlert?.({
            title: string.common.uhOh,
            description: string.diagnostics.areaNotAvailableMessage,
          });
        }
      });
  };

  const _onPressTestReschedule = (item: any) => {
    setSelectedOrderId(item?.id);
    setSelectedOrder(item);
    setShowBottomOverlay(true); //show the overlay
    setShowRescheduleOptions(true); //show the cancel, reschedule options
  };

  const onReschduleDoneSelected = () => {
    setLoading?.(true);
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
      // reason: selectedReasonForReschedule,
      reason: selectRescheduleReason,
      slotId: employeeSlot,
    };
    DiagnosticRescheduleOrder(
      selectedReasonForReschedule,
      formatTime,
      formattedDate,
      String(selectedOrderId)
    );
    console.log({ rescheduleDiagnosticsInput });
    rescheduleOrder(rescheduleDiagnosticsInput)
      .then((data) => {
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
                : string.common.tryAgainLater,
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
                ? string.diagnostics.reschduleCountExceed
                : string.diagnostics.sameSlotError,
          });
        } else {
          handleGraphQlError(error);
        }
      });
  };

  const renderRescheduleOrderOverlay = () => {
    const orderItemId = selectedOrder?.diagnosticOrderLineItems?.map((item) =>
      Number(item?.itemId)
    );
    const isCovidItem = orderItemId?.map((item: number) =>
      AppConfig.Configuration.Covid_Items.includes(item)
    );
    const isOrderHasCovidItem = isCovidItem?.find((item) => item === true);
    const maxDaysToShow = !!isOrderHasCovidItem
      ? AppConfig.Configuration.Covid_Max_Slot_Days
      : AppConfig.Configuration.Non_Covid_Max_Slot_Days;

    return (
      <View style={{ flex: 1 }}>
        <TestSlotSelectionOverlay
          heading="Schedule Appointment"
          date={date}
          areaId={String(selectedOrder?.areaId)}
          isTodaySlotUnavailable={todaySlotNotAvailable}
          maxDate={moment()
            .add(maxDaysToShow, 'day')
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
              slotStartTime: slotInfo?.slotInfo?.startTime!,
              slotEndTime: slotInfo?.slotInfo?.endTime!,
              date: date1.getTime(),
              employeeSlotId: slotInfo?.slotInfo?.slot!,
              diagnosticBranchCode: slotInfo?.diagnosticBranchCode,
              diagnosticEmployeeCode: slotInfo?.employeeCode,
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

  //new reschedule flow
  const renderBottomPopUp = () => {
    return (
      <Overlay
        onRequestClose={() => onPressCloseOverlay()}
        isVisible={showBottomOverlay}
        onBackdropPress={() => onPressCloseOverlay()}
        windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
        containerStyle={{ marginBottom: 0 }}
        fullScreen
        transparent
        overlayStyle={styles.overlayStyle}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => onPressCloseOverlay()}>
            <View style={styles.overlayTouch}>
              <TouchableOpacity>
                <SafeAreaView style={styles.overlaySafeArea}>
                  <>
                    {showRescheduleOptions ? renderRescheduleCancelOptions() : null}
                    {showRescheduleReasons ? renderRescheduleReasons() : null}
                    {showCancelReasons ? renderCancelReasons() : null}
                  </>
                </SafeAreaView>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Overlay>
    );
  };

  const renderRescheduleReasons = () => {
    return (
      <View style={[styles.overlayContainer]}>
        <Text style={styles.overlayHeadingText}>Reason for Rescheduling</Text>
        <View style={styles.reasonsContainer}>
          {RESCHEDULE_REASONS?.map((item: string, index: number) => {
            return (
              <>
                <TouchableOpacity
                  onPress={() => setSelectRescheduleReason(item)}
                  style={styles.reasonsTouch}
                >
                  <View style={styles.rowStyle}>
                    <Text style={styles.reasonsText}>{item}</Text>
                    {selectRescheduleReason === item ? (
                      <TickIcon style={styles.checkIconStyle} />
                    ) : (
                      <DisabledTickIcon style={styles.checkIconStyle} />
                    )}
                  </View>
                </TouchableOpacity>
                {index === RESCHEDULE_REASONS?.length - 1 ? null : <Spearator />}
              </>
            );
          })}
        </View>
        <View style={styles.buttonView}>
          <Button
            title={'RESCHEDULE NOW'}
            style={styles.buttonStyle}
            disabled={selectRescheduleReason == ''}
            onPress={() => _onPressRescheduleNow()}
          />
        </View>
      </View>
    );
  };

  const renderCancelReasons = () => {
    return (
      <View style={[styles.overlayContainer]}>
        <Text style={styles.overlayHeadingText}>Reason for Cancellation</Text>
        <View style={styles.reasonsContainer}>
          {CANCELLATION_REASONS?.map((item: string, index: number) => {
            return (
              <>
                <TouchableOpacity
                  onPress={() => setSelectCancelReason(item)}
                  style={styles.reasonsTouch}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.reasonsText}>{item}</Text>
                    {selectCancelReason === item ? (
                      <TickIcon style={styles.checkIconStyle} />
                    ) : (
                      <DisabledTickIcon style={styles.checkIconStyle} />
                    )}
                  </View>
                  {index === CANCELLATION_REASONS?.length - 1 ? null : (
                    <Spearator style={{ marginTop: 6 }} />
                  )}
                  {selectCancelReason === 'Others (Please specify)' &&
                  item === 'Others (Please specify)' ? (
                    <TextInputComponent
                      value={cancelReasonComment}
                      onChangeText={(text) => {
                        setCancelReasonComment(text);
                      }}
                      placeholder={'Enter your comments here'}
                    />
                  ) : null}
                </TouchableOpacity>
              </>
            );
          })}
        </View>
        <View style={styles.buttonView}>
          <Button
            title={'CANCEL NOW'}
            style={styles.buttonStyle}
            disabled={
              selectCancelReason == 'Others (Please specify)'
                ? cancelReasonComment == ''
                : selectCancelReason == ''
            }
            onPress={() => _onPressCancelNow()}
          />
        </View>
      </View>
    );
  };

  const renderRescheduleCancelOptions = () => {
    const selectedOrderRescheduleCount = selectedOrder?.rescheduleCount;
    const setRescheduleCount = !!selectedOrderRescheduleCount
      ? 2 - selectedOrderRescheduleCount
      : 2;
    return (
      <View style={styles.overlayContainer}>
        <Text style={styles.overlayHeadingText}>What would you like to do?</Text>
        <TouchableOpacity onPress={() => _onPressReschduleOption()} style={styles.optionsTouch}>
          <View>
            <View style={styles.rowStyle}>
              <Text style={styles.optionText}>Reschedule Booking</Text>
              {selectRescheduleOption ? (
                <TickIcon style={styles.checkIconStyle} />
              ) : (
                <DisabledTickIcon style={styles.checkIconStyle} />
              )}
            </View>
            {selectRescheduleOption ? (
              <View style={{ marginVertical: '2%' }}>
                <Text style={styles.optionSubHeadingText}>
                  {selectedOrderRescheduleCount == 3
                    ? string.diagnostics.reschduleCountExceed
                    : string.diagnostics.rescheduleCountText.replace(
                        '{{setRescheduleCount}}',
                        String(setRescheduleCount)
                      )}
                </Text>
                <Button
                  onPress={() => _onPressProceedToReschedule(selectedOrderRescheduleCount!)}
                  title={'PROCEED TO RESCHEDULE'}
                />
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => _onPressCancelOption()} style={styles.optionsTouch}>
          <View>
            <View style={styles.rowStyle}>
              <Text style={styles.optionText}>Cancel Booking</Text>
              {selectCancelOption ? (
                <TickIcon style={styles.checkIconStyle} />
              ) : (
                <DisabledTickIcon style={styles.checkIconStyle} />
              )}
            </View>
            {selectCancelOption ? (
              <View style={{ marginVertical: '2%' }}>
                <Text style={styles.optionSubHeadingText}>
                  Are you sure you want to Cancel the booking?
                </Text>
                <Button onPress={() => _onPressProceedToCancel()} title={'PROCEED TO CANCEL'} />
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  function _onPressRescheduleNow() {
    setLoading?.(true);
    setShowBottomOverlay(false);
    setShowRescheduleOptions(false);
    setShowRescheduleReasons(false);
    setSelectRescheduleReason('');
    checkSlotSelection();
  }

  function _onPressCancelNow() {
    setLoading?.(true);
    setShowBottomOverlay(false);
    setShowRescheduleOptions(false);
    setShowRescheduleReasons(false);
    setShowCancelReasons(false);
    onSubmitCancelOrder(selectCancelReason, cancelReasonComment);
    setSelectCancelReason('');
    setCancelReasonComment('');
    setSelectRescheduleReason('');
  }

  //reset to default states
  function onPressCloseOverlay() {
    setShowBottomOverlay(false);
    setShowRescheduleOptions(false);
    setShowRescheduleReasons(false);
    setShowCancelReasons(false);
    setSelectRescheduleOption(true);
    setSelectCancelOption(false);
    setSelectRescheduleReason('');
    setSelectCancelReason('');
    setCancelReasonComment('');
  }

  function _onPressProceedToReschedule(count: number) {
    //hide the current view
    if (count == 3) {
      return;
    }
    setShowRescheduleOptions(false); //hide the options view
    setShowRescheduleReasons(true);
    showCancelReasons && setShowCancelReasons(false);
  }

  function _onPressProceedToCancel() {
    setShowRescheduleOptions(false); //hide the options view
    setShowCancelReasons(true);
    showRescheduleReasons && setShowRescheduleReasons(false);
  }
  function _onPressReschduleOption() {
    setSelectRescheduleOption(true);
    setSelectCancelOption(false);
  }

  function _onPressCancelOption() {
    setSelectCancelOption(true);
    setSelectRescheduleOption(false);
  }

  const _navigateToYourTestDetails = (order: any) => {
    const isPrepaid = order?.paymentType == DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT;
    setLoading?.(true);
    showSummaryPopup && setSummaryPopup(!showSummaryPopup);

    const itemLevelStatus = order?.diagnosticOrdersStatus?.map(
      (item: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrdersStatus) =>
        item
    );
    /**
     * if itemName == null , then directly show vertical tracking.
     */
    const itemNameExist = itemLevelStatus?.find(
      (order: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrdersStatus) =>
        order?.itemName != null && order?.itemId != null
    );

    const itemIdObject = _.groupBy(itemLevelStatus, 'itemId') as any;

    //call refund api only if prepaid order + order level status is failed/cancelled

    if (isPrepaid && DIAGNOSTIC_ORDER_FAILED_STATUS.includes(order?.orderStatus)) {
      fetchRefundForOrder(order, itemNameExist, itemIdObject);
    } else {
      performNavigation(itemNameExist, order, itemIdObject);
    }
  };

  function performNavigation(itemNameExist: any, order: any, itemIdObject: any, refundArray?: any) {
    if (!!itemNameExist) {
      _navigateToHorizontalTracking(order, itemIdObject, refundArray);
    } else {
      _navigateToVerticalTracking(order, itemIdObject, refundArray);
    }
  }

  function _navigateToVerticalTracking(order: any, itemIdObject: any, refundArray?: any) {
    const getUTCDateTime = order?.slotDateTimeInUTC;
    const dt = moment(getUTCDateTime != null ? getUTCDateTime : order?.diagnosticDate!).format(
      `D MMM YYYY`
    );
    const tm =
      getUTCDateTime != null ? moment(getUTCDateTime).format('hh:mm A') : order?.slotTimings;

    const updatedItemLevelStatus = itemIdObject?.['null']?.map((item: any) => ({
      ...item,
    }));

    let selectedTestStatus = [];
    const resultToShow = updatedItemLevelStatus?.[updatedItemLevelStatus?.length - 1];
    selectedTestStatus.push({
      id: resultToShow?.id,
      displayId: order?.displayId,
      slotTimings: tm,
      patientName: currentPatient?.firstName,
      showDateTime: dt,
      itemId: resultToShow?.itemId,
      currentStatus:
        order?.orderStatus == DIAGNOSTIC_ORDER_STATUS.PAYMENT_FAILED
          ? DIAGNOSTIC_ORDER_STATUS.PAYMENT_FAILED
          : DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED,

      statusDate: resultToShow?.statusDate,
    });
    setLoading?.(false);
    props.navigation.navigate(AppRoutes.TestOrderDetails, {
      orderId: order?.id,
      setOrders: (
        orders: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList[]
      ) => setOrders(orders),
      selectedOrder: order,
      individualTestStatus: updatedItemLevelStatus,
      comingFrom: AppRoutes.YourOrdersTest,
      refundStatusArr: refundArray || refundStatusArr,
    });
  }

  function _navigateToHorizontalTracking(order: any, itemIdObject: any, refundArray?: any) {
    setLoading?.(false);
    props.navigation.navigate(AppRoutes.OrderedTestStatus, {
      orderId: order?.id,
      selectedOrder: order,
      itemLevelStatus: itemIdObject,
      setOrders: (orders: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList[]) =>
        setOrders(orders),
      refundStatusArr: refundArray || refundStatusArr,
    });
  }

  function _openOrderSummary(order: any) {
    fetchOrderDetails(order);
  }

  const renderOrder = (order: DiagnosticsOrderList, index: number) => {
    if (order?.diagnosticOrderLineItems?.length == 0) {
      return <View style={{ paddingTop: 4 }} />;
    }
    const getUTCDateTime = order?.slotDateTimeInUTC;
    const currentStatus = order?.orderStatus;
    const patientName = g(currentPatient, 'firstName');
    const isPastOrder = moment(getUTCDateTime).diff(moment(), 'minutes') < 0;
    /**
     * show cancel & reschdule if status is something like this.
     */
    const isCancelValid = order?.diagnosticOrdersStatus?.find((item) =>
      BLACK_LIST_CANCEL_STATUS_ARRAY.includes(item?.orderStatus!)
    );
    const isCancelValidAtOrderLevel = BLACK_LIST_CANCEL_STATUS_ARRAY.includes(order?.orderStatus!);
    // const showCancel = isCancelValid == undefined && !isPastOrder ? true : false;
    const showCancel = isCancelValid == undefined && !isCancelValidAtOrderLevel ? true : false;
    const isRescheduleValid = order?.diagnosticOrdersStatus?.find((item: any) =>
      BLACK_LIST_RESCHEDULE_STATUS_ARRAY.includes(item?.orderStatus)
    );
    const isRescheduleValidAtOrderLevel = BLACK_LIST_RESCHEDULE_STATUS_ARRAY.includes(
      order?.orderStatus!
    );
    // const showReschedule = isRescheduleValid == undefined && !isPastOrder ? true : false;
    const showReschedule =
      isRescheduleValid == undefined && !isRescheduleValidAtOrderLevel ? true : false;

    //show the reschedule option :-

    const showPreTesting = showReschedule && checkIfPreTestingExists(order);
    const showRescheduleOption = showReschedule && order?.rescheduleCount! <= 3;

    //show view report option => inclusion level as report generated.
    const showReportInclusionLevel = order?.diagnosticOrdersStatus?.find(
      (
        item:
          | getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrdersStatus
          | any
      ) => item?.orderStatus == DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED
    );
    const showReport = !!showReportInclusionLevel;

    //show extra view if array contains SAMPLE_REJECTED_IN_LAB, 2nd reqd.
    const showExtraInfo = order?.diagnosticOrdersStatus?.filter(
      (
        item:
          | getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrdersStatus
          | any
      ) => item?.orderStatus == DIAGNOSTIC_ORDER_STATUS.SAMPLE_REJECTED_IN_LAB
    );

    const sampleRejectedString = showExtraInfo?.map(
      (
        item:
          | getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrdersStatus
          | any
      ) => item?.itemName
    );

    const getPatientName = (patientId: string): string => {
      const patientSelected = allCurrentPatients?.find(
        (patient: { id: string }) => patient?.id === patientId
      );

      return patientSelected ? `${patientSelected?.firstName} ${patientSelected?.lastName}` : '';
    };

    return (
      <OrderTestCard
        orderId={order?.displayId}
        key={order?.id}
        createdOn={order?.createdDate}
        orderLevelStatus={order?.orderStatus}
        patientName={getPatientName(order?.patientId)}
        gender={currentPatient?.gender == 'FEMALE' ? 'Ms.' : 'Mr.'}
        showAddTest={false}
        ordersData={order?.diagnosticOrderLineItems!}
        showPretesting={showPreTesting!}
        dateTime={!!order?.slotDateTimeInUTC ? order?.slotDateTimeInUTC : order?.diagnosticDate}
        slotTime={!!order?.slotDateTimeInUTC ? order?.slotDateTimeInUTC : order?.slotTimings}
        isPrepaid={order?.paymentType == DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT}
        isCancelled={currentStatus == DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED}
        showRescheduleCancel={
          showReschedule && order?.orderStatus != DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED
        }
        showReportOption={showReport}
        showAdditonalView={!!showExtraInfo && showExtraInfo?.length > 0}
        additonalRejectedInfo={sampleRejectedString}
        price={order?.totalPrice}
        onPressCard={() => _navigateToYourTestDetails(order)}
        onPressAddTest={() => _onPressAddTest()}
        onPressReschedule={() => _onPressTestReschedule(order)}
        onPressViewDetails={() => _navigateToYourTestDetails(order)}
        onPressViewReport={() => _onPressViewReport(order)}
        phelboObject={order?.phleboDetailsObj}
        style={[
          { marginHorizontal: 20 },
          index < orders?.length - 1 ? { marginBottom: 8 } : { marginBottom: 20 },
          index == 0 ? { marginTop: 20 } : {},
        ]}
      />
    );
  };

  function _onPressAddTest() {
    console.log('add test pressed');
  }

  function _onPressViewReport(order: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList) {
    const visitId = order?.visitNo;
    DiagnosticViewReportClicked();
    if (visitId) {
      fetchTestReportResult(order);
    } else {
      props.navigation.navigate(AppRoutes.HealthRecordsHome);
    }
  }

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
      {showDisplaySchedule && renderRescheduleOrderOverlay()}

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
          {showBottomOverlay && renderBottomPopUp()}
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

  orderSummaryOuterView: {
    marginHorizontal: 20,
    flexDirection: 'row',
    marginVertical: '15%',
  },
  overlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: colors.CLEAR,
    zIndex: 3000,
    overflow: 'hidden',
    elevation: 0,
    bottom: 0,
    position: 'absolute',
  },
  overlayTouch: {
    width: '100%',
    backgroundColor: colors.CLEAR,
    bottom: 0,
    position: 'absolute',
  },
  overlaySafeArea: { flex: 1, backgroundColor: colors.CLEAR },
  overlayContainer: {
    backgroundColor: 'white',
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'transparent',
  },
  overlayHeadingText: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
    textAlign: 'left',
    lineHeight: 24,
    margin: 16,
    marginBottom: 0,
  },
  optionsTouch: {
    ...theme.viewStyles.cardContainer,
    margin: 16,
    padding: 10,
    borderRadius: 8,
    borderColor: 'transparent',
  },
  rowStyle: { justifyContent: 'space-between', flexDirection: 'row' },
  optionText: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHERPA_BLUE,
    textAlign: 'left',
    lineHeight: 24,
  },
  checkIconStyle: { height: 16, width: 16, resizeMode: 'contain' },
  optionSubHeadingText: {
    ...theme.fonts.IBMPlexSansRegular(10),
    color: theme.colors.SHERPA_BLUE,
    textAlign: 'left',
    lineHeight: 14,
    marginBottom: '4%',
  },
  reasonsContainer: {
    ...theme.viewStyles.cardContainer,
    margin: 16,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'white',
    flex: 1,
    borderColor: 'transparent',
  },
  reasonsTouch: { flex: 1, margin: 16, marginBottom: 10 },
  buttonView: { margin: 16, marginTop: 4 },
  reasonsText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SHERPA_BLUE,
    textAlign: 'left',
    lineHeight: 18,
  },
  buttonStyle: { width: '85%', alignSelf: 'center' },
});
