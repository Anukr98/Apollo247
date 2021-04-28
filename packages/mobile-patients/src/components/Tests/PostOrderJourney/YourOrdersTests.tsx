import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  GET_CUSTOMIZED_DIAGNOSTIC_SLOTS,
  GET_INTERNAL_ORDER,
  GET_PATIENT_ADDRESS_BY_ID,
  RESCHEDULE_DIAGNOSTIC_ORDER,
  GET_DIAGNOSTIC_ORDERS_LIST_BY_MOBILE,
  GET_PHLOBE_DETAILS,
} from '@aph/mobile-patients/src/graphql/profiles';
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
  TouchableOpacity,
  FlatList,
  ScrollView,
  BackHandler,
  Text,
  Modal,
} from 'react-native';
import { Down, Up, DownO } from '@aph/mobile-patients/src/components/ui/Icons';
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
  downloadDiagnosticReport,
  g,
  getPatientNameById,
  handleGraphQlError,
  TestSlot,
  nameFormater
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { DisabledTickIcon, TickIcon } from '@aph/mobile-patients/src/components/ui/Icons';
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
import {
  getDiagnosticRefundOrders,
  getPatientPrismMedicalRecordsApi,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { Overlay } from 'react-native-elements';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';

import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList as orderListByMobile } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import {
  getOrderPhleboDetailsBulk,
  getOrderPhleboDetailsBulkVariables,
} from '@aph/mobile-patients/src/graphql/types/getOrderPhleboDetailsBulk';

export interface YourOrdersTestProps extends NavigationScreenProps {
  showHeader?: boolean;
}

export const YourOrdersTest: React.FC<YourOrdersTestProps> = (props) => {
  const RESCHEDULE_REASONS = TestReschedulingReasons.reasons;
  const CANCELLATION_REASONS = TestCancelReasons.reasons;
  const CANCEL_RESCHEDULE_OPTION = [
    string.diagnostics.reasonForCancel_TestOrder.latePhelbo,
    string.diagnostics.reasonForCancel_TestOrder.userUnavailable,
  ];

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
  const [rescheduleCount, setRescheduleCount] = useState<any>(null);
  const [rescheduledTime, setRescheduledTime] = useState<any>('');
  const [selectedReasonForCancel, setSelectedReasonForCancel] = useState('');
  const [commentForCancel, setCommentForCancel] = useState('');

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
    getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList
  >();
  const [error, setError] = useState(false);
  const { getPatientApiCall } = useAuth();
  const client = useApolloClient();
  const [orders, setOrders] = useState<any>(props.navigation.getParam('orders'));

  const [isPaitentList, setIsPaitentList] = useState<boolean>(false);
  const [selectedPaitent, setSelectedPaitent] = useState<string>('All');
  const [selectedPaitentId, setSelectedPaitentId] = useState<string>('');
  const [orderListData, setOrderListData] = useState<(orderListByMobile | null)[] | null>([]);
  const [filteredOrderList, setFilteredOrderList] = useState<(orderListByMobile | null)[] | null>(
    []
  );
  const [profileArray, setProfileArray] = useState<
    GetCurrentPatients_getCurrentPatients_patients[] | null
  >(allCurrentPatients);
  const [currentOffset, setCurrentOffset] = useState<number>(1);
  const [resultList, setResultList] = useState<(orderListByMobile | null)[] | null>(
    []
  );
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
  useEffect(() => {
    if (selectedPaitent == 'All') {
      setOrders(filteredOrderList);
    } else {
      setOrders(fetchFilteredOrder());
    }
  }, [selectedPaitentId]);
  const refetchOrders = async () => {
    fetchOrders(true);
  };

  useEffect(() => {
    refetchOrders()
  }, [currentOffset]);
  const fetchOrders = async (isRefetch: boolean) => {
    try {
      setLoading!(true);
      client
        .query<getDiagnosticOrdersListByMobile, getDiagnosticOrdersListByMobileVariables>({
          query: GET_DIAGNOSTIC_ORDERS_LIST_BY_MOBILE,
          context: {
            sourceHeaders,
          },
          variables: {
            mobileNumber: currentPatient && currentPatient.mobileNumber,
            paginated: true,
            limit: 10,
            offset: currentOffset
          },
          fetchPolicy: 'no-cache',
        })
        .then( (data) => {
          const ordersList =  data?.data?.getDiagnosticOrdersListByMobile?.ordersList || [];
          setOrderListData(ordersList)
          if (currentOffset == 1) {
            setResultList(ordersList);
          } else {
            setResultList(resultList?.concat(ordersList))
          }
          const finalList = currentOffset == 1 ? ordersList : resultList?.concat(ordersList)
          const filteredOrderList =
          finalList ||
            []?.filter((item: orderListByMobile) => {
              if (
                item?.diagnosticOrderLineItems?.length &&
                item?.diagnosticOrderLineItems?.length > 0
              ) {
                return item;
              }
            });
          const orderIdsArr = filteredOrderList?.map((item: any) => item?.id);
          getPhlobeOTP(orderIdsArr, filteredOrderList, isRefetch);
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

  const fetchFilteredOrder = () => {
    let filteredList = filteredOrderList?.filter((item) => {
      if (selectedPaitentId === item?.patientId) {
        return item;
      }
    });
    return filteredList;
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
            ordersList?.forEach(
              (
                order: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList
              ) => {
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
              }
            );
            setOrders(ordersList);
            setFilteredOrderList(ordersList);
            setTimeout(() => setLoading!(false), isRefetch ? 1000 : 0);
          } else {
            setOrders(ordersList);
            setFilteredOrderList(ordersList);
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

  const fetchRefundForOrder = async (orderSelected: any, tab: boolean) => {
    setRefundStatusArr(null);
    setLoading?.(true);
    try {
      let response: any = await getDiagnosticRefundOrders(client, orderSelected?.paymentOrderId);
      if (response?.data?.data) {
        const refundData = g(response, 'data', 'data', 'getOrderInternal', 'refunds');
        if (refundData?.length! > 0) {
          setRefundStatusArr(refundData);
        }
        performNavigation(orderSelected, tab, refundData);
      } else {
        performNavigation(orderSelected, tab, []);
      }
    } catch (error) {
      CommonBugFender('OrderedTestStatus_fetchRefundOrder', e);
      setLoading?.(false);
    }
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
    cancelOrder(orderCancellationInput)
      .then((data: any) => {
        const cancelResponse = g(data, 'data', 'cancelDiagnosticsOrder', 'status');
        if (cancelResponse == 'true') {
          setLoading!(true);
          setTimeout(() => refetchOrders(), 2000);
          showAphAlert!({
            unDismissable: true,
            title: string.common.hiWithSmiley,
            description: string.diagnostics.orderCancelledSuccessText,
          });
        } else {
          setLoading?.(false);
          showAphAlert!({
            unDismissable: true,
            title: string.common.uhOh,
            description: cancelResponse?.message,
          });
        }
        setSelectCancelReason('');
        setCancelReasonComment('');
        setSelectRescheduleReason('');
        //refetch the orders
      })
      .catch((error) => {
        // DIAGNOSTIC_CANCELLATION_ALLOWED_BEFORE_IN_HOURS
        CommonBugFender('TestOrderDetails_callApiAndRefetchOrderDetails', error);
        handleGraphQlError(error);
        setLoading!(false);
        setSelectCancelReason('');
        setCancelReasonComment('');
        setSelectRescheduleReason('');
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
          setLoading?.(false);
          !!resultForVisitNo
            ? props.navigation.navigate(AppRoutes.HealthRecordDetails, {
                data: resultForVisitNo,
                labResults: true,
              })
            : renderReportError(string.diagnostics.responseUnavailableForReport);
        })
        .catch((error) => {
          CommonBugFender('YourOrdersTests_fetchTestReportsData', error);
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
  const renderFilterArea = () => {
    return (
      <View style={styles.filterContainer}>
        <Text style={styles.textPaitent}>Patient Name : </Text>
        <TouchableOpacity
          style={styles.activeFilterView}
          onPress={() => {
            setIsPaitentList(true);
          }}
        >
          <Text style={styles.textSelectedPaitent}>{selectedPaitent}</Text>
          <Down />
        </TouchableOpacity>
      </View>
    );
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
    const rescheduleDiagnosticsInput: RescheduleDiagnosticsInput = {
      comment: commentForReschedule,
      date: formattedDate,
      dateTimeInUTC: dateTimeInUTC,
      orderId: String(selectedOrderId),
      patientId: g(currentPatient, 'id'),
      reason: selectRescheduleReason,
      slotId: employeeSlot,
    };
    DiagnosticRescheduleOrder(
      selectedReasonForReschedule,
      formatTime,
      formattedDate,
      String(selectedOrderId)
    );
    rescheduleOrder(rescheduleDiagnosticsInput)
      .then((data) => {
        const rescheduleResponse = g(data, 'data', 'rescheduleDiagnosticsOrder');
        if (rescheduleResponse?.status == 'true' && rescheduleResponse?.rescheduleCount <= 3) {
          setTimeout(() => refetchOrders(), 2000);
          setRescheduleCount(rescheduleResponse?.rescheduleCount);
          setRescheduledTime(dateTimeInUTC);
          showAphAlert?.({
            unDismissable: true,
            title: string.common.hiWithSmiley,
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
        setSelectCancelReason('');
        setCancelReasonComment('');
        setSelectRescheduleReason('');
      })
      .catch((error) => {
        setSelectCancelReason('');
        setCancelReasonComment('');
        setSelectRescheduleReason('');
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
          source={'Tests'}
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
            rescheduleDate = slotInfo?.date;
            rescheduleSlotObject = {
              slotStartTime: slotInfo?.slotInfo?.startTime!,
              slotEndTime: slotInfo?.slotInfo?.endTime!,
              date: slotInfo?.date?.getTime(),
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
              date: slotInfo?.date?.getTime(),
              employeeSlotId: slotInfo?.slotInfo?.slot!,
              diagnosticBranchCode: slotInfo?.diagnosticBranchCode,
              diagnosticEmployeeCode: slotInfo?.employeeCode,
              city: '', // not using city from this in order place API
            });
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
                  <View style={styles.overlayContainer}>
                    <View>
                      {showRescheduleOptions && renderRescheduleCancelOptions()}
                      {showRescheduleReasons && renderRescheduleReasons()}
                      {showCancelReasons && renderCancelReasons()}
                    </View>
                  </View>
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
      <View>
        <Text style={styles.overlayHeadingText}>
          {string.diagnostics.reasonForReschedulingText}
        </Text>
        <View style={styles.reasonsContainer}>
          {RESCHEDULE_REASONS?.map((item: string, index: number) => {
            return (
              <>
                <TouchableOpacity
                  onPress={() => setSelectRescheduleReason(item)}
                  style={styles.reasonsTouch}
                >
                  <View style={[styles.rowStyle]}>
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
    const selectedOrderRescheduleCount = selectedOrder?.rescheduleCount;
    return (
      <View>
        <Text style={styles.overlayHeadingText}>
          {string.diagnostics.reasonForCancellationText}
        </Text>
        <View style={styles.reasonsContainer}>
          {CANCELLATION_REASONS?.map((item: string, index: number) => {
            return (
              <>
                <TouchableOpacity
                  onPress={() => _onPressCancelReason(item)}
                  style={[
                    styles.reasonsTouch,
                    {
                      height:
                        selectCancelReason === item &&
                        selectedOrderRescheduleCount! < 3 &&
                        CANCEL_RESCHEDULE_OPTION.includes(selectCancelReason)
                          ? 100
                          : 40,
                    },
                  ]}
                >
                  <View style={styles.rowStyle}>
                    <Text style={styles.reasonsText}>{item}</Text>
                    {selectCancelReason === item ? (
                      <TickIcon style={styles.checkIconStyle} />
                    ) : (
                      <DisabledTickIcon style={styles.checkIconStyle} />
                    )}
                  </View>

                  {selectCancelReason === item &&
                  selectedOrderRescheduleCount! < 3 &&
                  CANCEL_RESCHEDULE_OPTION.includes(selectCancelReason) ? (
                    <View style={{ marginTop: 10, marginBottom: 5 }}>
                      <Text style={styles.wantToReschedule}>
                        {string.diagnostics.wantToReschedule}
                      </Text>
                      <TouchableOpacity activeOpacity={1} onPress={() => _onPressRescheduleNow()}>
                        <Text style={styles.yellowText}>RESCHEDULE NOW</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {index === CANCELLATION_REASONS?.length - 1 ? null : (
                    <Spearator style={{ marginTop: 6 }} />
                  )}
                  {selectCancelReason ===
                    string.diagnostics.reasonForCancel_TestOrder.otherReasons &&
                  item === string.diagnostics.reasonForCancel_TestOrder.otherReasons ? (
                    <TextInputComponent
                      value={cancelReasonComment}
                      onChangeText={(text) => {
                        setCancelReasonComment(text);
                      }}
                      placeholder={string.common.return_order_comment_text}
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
              selectCancelReason == string.diagnostics.reasonForCancel_TestOrder.otherReasons
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
      <View>
        <Text style={styles.overlayHeadingText}>{string.diagnostics.whatWudLikeText}</Text>
        <TouchableOpacity onPress={() => _onPressReschduleOption()} style={styles.optionsTouch}>
          <View>
            <View style={styles.rowStyle}>
              <Text style={styles.optionText}>{string.diagnostics.rescheduleBookingText}</Text>
              {selectRescheduleOption ? (
                <TickIcon style={styles.checkIconStyle} />
              ) : (
                <DisabledTickIcon style={styles.checkIconStyle} />
              )}
            </View>
            {selectRescheduleOption && (
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
                  disabled={selectedOrderRescheduleCount == 3}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => _onPressCancelOption()} style={styles.optionsTouch}>
          <View>
            <View style={styles.rowStyle}>
              <Text style={styles.optionText}>{string.diagnostics.cancelBookingText}</Text>
              {selectCancelOption ? (
                <TickIcon style={styles.checkIconStyle} />
              ) : (
                <DisabledTickIcon style={styles.checkIconStyle} />
              )}
            </View>
            {selectCancelOption && (
              <View style={{ marginVertical: '2%' }}>
                <Text style={styles.optionSubHeadingText}>{string.diagnostics.sureCancelText}</Text>
                <Button onPress={() => _onPressProceedToCancel()} title={'PROCEED TO CANCEL'} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  function _onPressCancelReason(item: string) {
    if (CANCEL_RESCHEDULE_OPTION.includes(item)) {
      setSelectRescheduleReason(item);
    }
    setSelectCancelReason(item);
  }

  function _onPressRescheduleNow() {
    setLoading?.(true);
    setShowBottomOverlay(false);
    setShowRescheduleOptions(false);
    setShowRescheduleReasons(false);
    setSelectCancelReason('');
    setShowCancelReasons(false);
    checkSlotSelection();
  }

  function _onPressCancelNow() {
    setLoading?.(true);
    setShowBottomOverlay(false);
    setShowRescheduleOptions(false);
    setShowRescheduleReasons(false);
    setShowCancelReasons(false);
    onSubmitCancelOrder(selectCancelReason, cancelReasonComment);
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
    setSelectRescheduleOption(true);
    setShowCancelReasons(false);
    selectCancelOption && setSelectCancelOption(false);
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

  function _navigateToYourTestDetails(
    order: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList,
    tab: boolean
  ) {
    const isPrepaid = order?.paymentType == DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT;
    setLoading?.(true);
    if (isPrepaid && DIAGNOSTIC_ORDER_FAILED_STATUS.includes(order?.orderStatus)) {
      fetchRefundForOrder(order, tab);
    } else {
      performNavigation(order, tab);
    }
  }

  function performNavigation(order: any, tab: boolean, refundArray?: any) {
    setLoading?.(false);
    props.navigation.navigate(AppRoutes.TestOrderDetails, {
      orderId: order?.id,
      setOrders: (
        orders: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList[]
      ) => setOrders(orders),
      selectedOrder: order,
      refundStatusArr: refundArray,
      comingFrom: AppRoutes.YourOrdersTest,
      showOrderSummaryTab: tab,
    });
  }

  const renderOrder = (
    order: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList,
    index: number
  ) => {
    if (order?.diagnosticOrderLineItems?.length == 0) {
      return <View style={{ paddingTop: 4 }} />;
    }
    const getUTCDateTime = order?.slotDateTimeInUTC;

    const currentStatus = order?.orderStatus;
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

    return (
      <OrderTestCard
        orderId={order?.displayId}
        key={order?.id}
        createdOn={order?.createdDate}
        orderLevelStatus={order?.orderStatus}
        patientName={getPatientNameById(allCurrentPatients, order?.patientId)}
        gender={currentPatient?.gender == 'FEMALE' ? 'Ms.' : 'Mr.'}
        showAddTest={false}
        ordersData={order?.diagnosticOrderLineItems!}
        showPretesting={showPreTesting!}
        dateTime={!!order?.slotDateTimeInUTC ? order?.slotDateTimeInUTC : order?.diagnosticDate}
        slotTime={!!order?.slotDateTimeInUTC ? order?.slotDateTimeInUTC : order?.slotTimings}
        isPrepaid={order?.paymentType == DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT}
        isCancelled={currentStatus == DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED}
        cancelledReason={
          currentStatus == DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED &&
          order?.diagnosticOrderCancellation != null
            ? order?.diagnosticOrderCancellation
            : null
        }
        showRescheduleCancel={
          showReschedule && order?.orderStatus != DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED
        }
        showReportOption={
          showReport || order?.orderStatus === DIAGNOSTIC_ORDER_STATUS.ORDER_COMPLETED
        }
        showAdditonalView={!!showExtraInfo && showExtraInfo?.length > 0}
        additonalRejectedInfo={sampleRejectedString}
        price={order?.totalPrice}
        onPressCard={() => _navigateToYourTestDetails(order, false)}
        onPressAddTest={() => _onPressAddTest()}
        onPressReschedule={() => _onPressTestReschedule(order)}
        onPressViewDetails={() => _navigateToYourTestDetails(order, true)}
        onPressViewReport={() => _onPressViewReport(order)}
        phelboObject={order?.phleboDetailsObj}
        onPressRatingStar={(star)=>{
          props.navigation.navigate(AppRoutes.TestRatingScreen, {
            ratingStar: star,
            orderDetails: order
          });
        }}
        style={[
          { marginHorizontal: 20 },
          index < orders?.length - 1 ? { marginBottom: 8 } : { marginBottom: 20 },
          index == 0 ? { marginTop: 20 } : {},
        ]}
      />
    );
  };

  function _onPressAddTest() {}

  function _onPressViewReport(
    order: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList
  ) {
    const visitId = order?.visitNo;
    const appointmentDetails = !!order?.slotDateTimeInUTC
      ? order?.slotDateTimeInUTC
      : order?.diagnosticDate;
    const appointmentDate = moment(appointmentDetails)?.format('DD MMM YYYY');
    const patientName = getPatientNameById(allCurrentPatients, order?.patientId)?.replace(
      / /g,
      '_'
    );

    DiagnosticViewReportClicked();
    if (order?.labReportURL && order?.labReportURL != '') {
      downloadLabTest(order?.labReportURL, appointmentDate, patientName);
    } else if (visitId) {
      fetchTestReportResult(order);
    } else {
      props.navigation.navigate(AppRoutes.HealthRecordsHome);
    }
  }

  async function downloadLabTest(pdfUrl: string, appointmentDate: string, patientName: string) {
    setLoading?.(true);
    try {
      await downloadDiagnosticReport(pdfUrl, appointmentDate, patientName, true);
    } catch (error) {
      setLoading?.(false);
      CommonBugFender('YourOrderTests_downloadLabTest', error);
    } finally {
      setLoading?.(false);
    }
  }

  const renderLoadMore = () => {
    return (
        <TouchableOpacity style={styles.loadMoreView} onPress={()=>{
          setCurrentOffset(currentOffset + 1);
        }}>
          <Text style={styles.textLoadMore}>{nameFormater('load more', 'upper')}</Text>
          <DownO size="sm_l" style={styles.downArrow}/>
        </TouchableOpacity>
    );
  }
  const renderOrders = () => {
    return (
      <FlatList
        bounces={false}
        data={orders}
        extraData={orderListData}
        renderItem={({ item, index }) => renderOrder(item, index)}
        ListEmptyComponent={renderNoOrders()}
        ListFooterComponent={orderListData?.length && orderListData?.length < 10 || loading || error ? null : renderLoadMore()}
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
  const newProfileArray = [
    {
      firstName: 'All',
      lastName: '',
      gender: '',
      dateOfBirth: '',
    },
    ...profileArray?.slice(0, profileArray.length - 1),
  ];
  const renderError = () => {
    if (error) {
      return (
        <Card
          cardContainer={[styles.noDataCard]}
          heading={string.common.uhOh}
          description={string.common.somethingWentWrong}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        />
      );
    }
  };
  const renderModalView = (item: any, index: number) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedPaitent(item?.firstName == null ? '' : item?.firstName);
          setSelectedPaitentId(item?.id);
          setIsPaitentList(false);
          setCurrentOffset(1);
        }}
        style={[
          styles.paitentItem,
          {
            backgroundColor: selectedPaitentId == item.id ? '#00B38E' : 'white',
          },
        ]}
      >
        <Text
          style={[
            styles.paitentText,
            { color: selectedPaitentId == item.id ? 'white' : '#00B38E' },
          ]}
        >
          {item?.firstName}
        </Text>
        {item?.gender && item?.dateOfBirth ? (
          <Text
            style={[
              styles.paitentSubText,
              { color: selectedPaitentId == item.id ? 'white' : '#00B38E' },
            ]}
          >{`${item?.gender}, ${moment().diff(item?.dateOfBirth, 'years')}`}</Text>
        ) : null}
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      {showDisplaySchedule && renderRescheduleOrderOverlay()}

      <SafeAreaView style={theme.viewStyles.container}>
        {props?.showHeader == false ? null : (
          <Header
            leftIcon="backArrow"
            title={string.orders.urOrders}
            container={{ borderBottomWidth: 0 }}
            onPressLeftIcon={() => props.navigation.goBack()}
          />
        )}
        {renderFilterArea()}
        <ScrollView bounces={false} scrollEventThrottle={1}>
          {renderError()}
          {renderOrders()}
          {showBottomOverlay && renderBottomPopUp()}
        </ScrollView>
        <Modal
          animationType="fade"
          transparent={true}
          visible={isPaitentList}
          onRequestClose={() => {
            setIsPaitentList(false);
          }}
          onDismiss={() => {
            setIsPaitentList(false);
          }}
        >
          <View style={styles.modalMainView}>
            <View style={styles.paitentModalView}>
              <Text style={styles.textHeadingModal}>Select Patient Name</Text>
              <View style={styles.paitentCard}>
                <FlatList
                  data={newProfileArray}
                  extraData={selectedPaitentId}
                  keyExtractor={(_, index) => `${index}`}
                  renderItem={({ item, index }) => renderModalView(item, index)}
                />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
      {loading && !props?.showHeader ? null : loading && <Spinner />}
    </View>
  );
};

const styles = StyleSheet.create({
  wantToReschedule: {
    ...theme.fonts.IBMPlexSansRegular(12),
    color: theme.colors.SHERPA_BLUE,
    textAlign: 'left',
    lineHeight: 18,
    marginBottom: 8,
  },
  yellowText: { ...theme.viewStyles.yellowTextStyle, fontSize: 14, textAlign: 'left' },
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
  reasonsTouch: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 8,
    justifyContent: 'center',
    height: 40,
  },
  buttonView: { margin: 16, marginTop: 4 },
  reasonsText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SHERPA_BLUE,
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonStyle: { width: '85%', alignSelf: 'center' },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  loadMoreView:{
    flexDirection:'row',
    justifyContent: 'center',
    width:'100%',
    paddingBottom:10,
  },
  textLoadMore:{
    ...theme.viewStyles.text('SB', 15, '#FC9916'),
    paddingHorizontal:8,
    alignSelf:'flex-start',
  },
  downArrow: {
    alignSelf:'flex-end',
  },
  textHeadingModal: {
    ...theme.viewStyles.text('SB', 17, '#02475b'),
    marginBottom: 20,
  },
  textPaitent: {
    ...theme.viewStyles.text('SB', 14, '#02475b'),
    // marginBottom: 5,
  },
  textSelectedPaitent: {
    ...theme.viewStyles.text('SB', 14, '#02475b'),
    width: '85%',
  },
  activeFilterView: {
    ...theme.viewStyles.text('SB', 14, '#02475b'),
    backgroundColor: '#F3F3F3',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    width: '55%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    // border: 1px solid #BDBDBD;
    // box-sizing: border-box;
    // border-radius: 8px;
  },
  modalMainView: {
    backgroundColor: 'rgba(100,100,100, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
    // alignItems: 'center',
    flexDirection: 'column',
  },
  paitentModalView: {
    backgroundColor: 'white',
    width: '100%',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  paitentCard: {
    backgroundColor: '#F7F8F5',
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  paitentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 2,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 20,
    margin: 5,
  },
  paitentText: {
    ...theme.viewStyles.text('R', 16, '#00B38E'),
    width: '80%',
  },
  paitentSubText: {
    ...theme.viewStyles.text('R', 12, '#00B38E'),
    width: '20%',
  },
});
