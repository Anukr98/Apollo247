import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { GET_PHLEBO_DETAILS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList,
  getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems,
  getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrdersStatus,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';

import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  BackHandler,
  Text,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  AlertTriangle,
  Down,
  DownO,
  InfoIconRed,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { NavigationScreenProps } from 'react-navigation';
import {
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
  DIAGNOSTIC_ORDER_STATUS,
  MedicalRecordType,
  Gender,
  DiagnosticsRescheduleSource,
  DiagnosticLineItem,
  CancellationDiagnosticsInputv2,
  CALL_TO_ORDER_CTA_PAGE_ID,
  CANCELLATION_REASONS_CTA,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useApolloClient } from 'react-apollo-hooks';
import {
  downloadDiagnosticReport,
  g,
  getPatientNameById,
  handleGraphQlError,
  TestSlot,
  nameFormater,
  aphConsole,
  removeWhiteSpaces,
  isSmallDevice,
  getAge,
  extractPatientDetails,
  showDiagnosticCTA,
  isEmptyObject,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  DisabledTickIcon,
  TickIcon,
  PromoCashback,
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
  AppConfig,
  BLACK_LIST_CANCEL_STATUS_ARRAY,
  BLACK_LIST_RESCHEDULE_STATUS_ARRAY,
  DIAGNOSTIC_EDIT_PROFILE_ARRAY,
  DIAGNOSTIC_ORDER_CANCELLED_STATUS,
  DIAGNOSTIC_SHOW_RESCHEDULE_CANCEL_ARRAY,
} from '@aph/mobile-patients/src/strings/AppConfig';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import _ from 'lodash';
import { TestSlotSelectionOverlayNew } from '@aph/mobile-patients/src/components/Tests/components/TestSlotSelectionOverlayNew';
import {
  DiagnosticPhleboCallingClicked,
  DiagnosticAddTestClicked,
  DiagnosticRescheduleOrder,
  DiagnosticCancellationRetention,
} from '@aph/mobile-patients/src/components/Tests/utils/Events';
import { OrderTestCard } from '@aph/mobile-patients/src/components/Tests/components/OrderTestCard';
import {
  diagnosticCancelOrder,
  diagnosticExotelCall,
  diagnosticGetCustomizedSlotsV2,
  diagnosticRescheduleOrder,
  diagnosticsOrderListByParentId,
  getDiagnosticReasons,
  getDiagnosticsOrder,
  getPatientPrismMedicalRecordsApi,
  switchDiagnosticOrderPatientId,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { TestPdfRender } from '@aph/mobile-patients/src/components/Tests/components/TestPdfRender';
import { Overlay } from 'react-native-elements';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList as orderListByMobile } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import {
  getOrderPhleboDetailsBulk,
  getOrderPhleboDetailsBulkVariables,
} from '@aph/mobile-patients/src/graphql/types/getOrderPhleboDetailsBulk';
import {
  getRescheduleAndCancellationReasons_getRescheduleAndCancellationReasons,
  getRescheduleAndCancellationReasons_getRescheduleAndCancellationReasons_cancellationReasonsv2,
  getRescheduleAndCancellationReasons_getRescheduleAndCancellationReasons_cancellationReasonsv2_ctaOptions,
} from '@aph/mobile-patients/src/graphql/types/getRescheduleAndCancellationReasons';
import { PatientListOverlay } from '@aph/mobile-patients/src/components/Tests/components/PatientListOverlay';
import { getDiagnosticOrdersListByParentOrderID_getDiagnosticOrdersListByParentOrderID_ordersList } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByParentOrderID';
import { CallToOrderView } from '@aph/mobile-patients/src/components/Tests/components/CallToOrderView';
import { PhleboCallPopup } from '@aph/mobile-patients/src/components/Tests/components/PhleboCallPopup';
import { checkPatientWithSkuGender } from '@aph/mobile-patients/src/components/Tests/utils/helpers';

type orderList = getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList;

type OrderRescheduleType = {
  utcFormatedDate: string;
  date: string | Date;
  slot: string;
  rescheduleCount: number;
};

const screenHeight = Dimensions.get('window')?.height;
export interface YourOrdersTestProps extends NavigationScreenProps {
  showHeader?: boolean;
}

export const YourOrdersTest: React.FC<YourOrdersTestProps> = (props) => {
  const CANCEL_RESCHEDULE_OPTION = [
    string.diagnostics.reasonForCancel_TestOrder.latePhelbo,
    string.diagnostics.reasonForCancel_TestOrder.userUnavailable,
  ];
  const ALL = 'All';

  const {
    diagnosticSlot,
    setDiagnosticSlot,
    setHcCharges,
    setModifyHcCharges,
    cartItems,
    removeCartItem,
    setModifiedOrderItemIds,
    setModifiedOrder,
    removePatientCartItem,
    patientCartItems,
    setDistanceCharges,
    setModifiedPatientCart,
  } = useDiagnosticsCart();
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const { loading, setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const [date, setDate] = useState<Date>(new Date());
  const [showDisplaySchedule, setDisplaySchedule] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<any>();
  const [slots, setSlots] = useState<TestSlot[]>([]);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<TestSlot>();
  const [todaySlotNotAvailable, setTodaySlotNotAvailable] = useState<boolean>(false);
  const [cancelRequestedReason, setCancelRequestedReason] = useState<string>('');
  const [showBottomOverlay, setShowBottomOverlay] = useState<boolean>(false);
  const [showRescheduleOptions, setShowRescheduleOptions] = useState<boolean>(false);
  const [selectRescheduleOption, setSelectRescheduleOption] = useState<boolean>(true);
  const [selectCancelOption, setSelectCancelOption] = useState<boolean>(false);
  const [showRescheduleReasons, setShowRescheduleReasons] = useState<boolean>(false);
  const [showCancelReasons, setShowCancelReasons] = useState<boolean>(false);
  const [showPromoteCashback, setShowPromoteCashback] = useState<boolean>(false);
  const [cancelReasonList, setCancelReasonList] = useState([] as any);
  const [rescheduleReasonList, setRescheduleReasonList] = useState([] as any);
  const [selectCancelReason, setSelectCancelReason] = useState<string>('');
  const [cancelReasonComment, setCancelReasonComment] = useState<string>('');
  const [selectRescheduleReason, setSelectRescheduleReason] = useState<string>('');
  const [showMultiUhidOption, setShowMultiUhidOption] = useState<boolean>(false);
  const [isMultiUhid, setIsMultiUhid] = useState<boolean>(false);
  const [showViewReportModal, setShowViewReportModal] = useState<boolean>(false);
  const [showPhleboCallPopUp, setShowPhleboCallPopUp] = useState<boolean>(false);
  const [callPhleboObj, setCallPhleboObj] = useState<any>('');
  const [slideCallToOrder, setSlideCallToOrder] = useState<boolean>(false);
  const [multipleOrdersList, setMultipleOrdersList] = useState<
    | (getDiagnosticOrdersListByParentOrderID_getDiagnosticOrdersListByParentOrderID_ordersList | null)[]
    | null
  >([]);
  const [selectedTestArray, setSelectedTestArray] = useState([] as any);
  const [rescheduleSource, setRescheduleSource] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<orderList>();
  const [error, setError] = useState(false);
  const { getPatientApiCall, buildApolloClient, authToken } = useAuth();
  const client = useApolloClient();
  const [orders, setOrders] = useState<any>(props.navigation.getParam('orders'));
  const cityId = props.navigation.getParam('cityId');
  const [showPatientsOverlay, setShowPatientsOverlay] = useState<boolean>(false);
  const [activeOrder, setActiveOrder] = useState<orderList>();
  const [selectedPatient, setSelectedPatient] = useState<string>(ALL);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [orderListData, setOrderListData] = useState<(orderListByMobile | null)[] | null>([]);
  const [diagnosticSlotDuration, setDiagnosticSlotDuration] = useState<number>(0);
  const [slotInput, setSlotInput] = useState({});
  const [switchPatientResponse, setSwitchPatientResponse] = useState<any>('');
  const [selectedCTAOption, setSelectedCTAOption] = useState<string>('');
  const [profileArray, setProfileArray] = useState<
    GetCurrentPatients_getCurrentPatients_patients[] | null
  >(allCurrentPatients);
  const [currentOffset, setCurrentOffset] = useState<number>(1);
  const [resultList, setResultList] = useState([] as any);
  const [showPatientListOverlay, setShowPatientListOverlay] = useState<boolean>(false);
  const [patientListSelectedPatient, setPatientListSelectedPatient] = useState([]);
  const [isDirectCancelRequest, setIsDirectCancelRequest] = useState<boolean>(true);
  const source = props.navigation.getParam('source');
  const getCTADetails = showDiagnosticCTA(CALL_TO_ORDER_CTA_PAGE_ID.MYORDERS, cityId);
  const { isDiagnosticCircleSubscription } = useDiagnosticsCart();
  const apolloClientWithAuth = buildApolloClient(authToken);
  const ctaColumn = 3;

  var rescheduleDate: Date,
    rescheduleSlotObject: {
      slotStartTime: any;
      slotEndTime?: string;
      date?: number;
      internalSlots: (string | null)[] | null;
      isPaidSlot: boolean;
      distanceCharges: number;
    };

  const handleBack = () => {
    if (source === AppRoutes.CartPage) {
      props.navigation.navigate('TESTS');
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

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  //orderListData => next set of results
  //orders => data to be shown (can have filter)
  //resultList => entire list without filter
  useEffect(() => {
    if (selectedPatient === ALL) {
      setOrders(resultList); // set all the orders present.
    } else {
      setOrders(filterResultsForPatient(resultList));
    }
  }, [selectedPatientId]);

  function filterResultsForPatient(list: orderList[]) {
    const getPatientFilteredResults = list?.filter(
      (item: orderList) => item?.patientId === selectedPatientId
    );
    return getPatientFilteredResults;
  }

  const refetchOrders = async () => {
    fetchOrders(true);
  };

  useEffect(() => {
    refetchOrders();
  }, [currentOffset, selectedPatientId]);

  const fetchOrders = async (isRefetch: boolean) => {
    //clear the modify data.
    setModifiedOrder?.(null);
    setModifiedOrderItemIds?.([]);
    setModifiedPatientCart?.([]);

    try {
      setLoading?.(true);
      getDiagnosticsOrder(
        apolloClientWithAuth,
        currentPatient?.mobileNumber,
        10,
        currentOffset,
        selectedPatient === ALL ? '' : selectedPatientId
      )
        .then((data) => {
          const ordersList = data?.data?.getDiagnosticOrdersListByMobile?.ordersList || [];
          const requestedCancelReason =
            data?.data?.getDiagnosticOrdersListByMobile?.cancellationRequestedDisplayText;
          setOrderListData(ordersList);
          setCancelRequestedReason(requestedCancelReason!);
          if (currentOffset == 1) {
            setResultList(ordersList);
          } else {
            setResultList(resultList?.concat(ordersList)!);
          }
          const finalList = currentOffset == 1 ? ordersList : resultList?.concat(ordersList);
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
          getPhleboOTP(orderIdsArr, filteredOrderList, isRefetch);
        })
        .catch((error) => {
          console.log({ error });
          setLoading?.(false);
          setError(true);
          CommonBugFender(`${AppRoutes.YourOrdersTest}_fetchOrders`, error);
        });
    } catch (error) {
      setLoading?.(false);
      setError(true);
      CommonBugFender(`${AppRoutes.YourOrdersTest}_fetchOrders`, error);
    }
  };
  const getReasons = async (item: any) => {
    let selectedOrderTime = item?.slotDateTimeInUTC;
    try {
      getDiagnosticReasons(client, selectedOrderTime)
        .then((data) => {
          const reasonList =
            (data?.data
              ?.getRescheduleAndCancellationReasons as getRescheduleAndCancellationReasons_getRescheduleAndCancellationReasons) ||
            [];
          setCancelReasonList(reasonList?.cancellationReasonsv2);
          setRescheduleReasonList(reasonList?.rescheduleReasons);
        })
        .catch((error) => {
          CommonBugFender(`${AppRoutes.YourOrdersTest}_getReasons`, error);
        });
    } catch (error) {
      CommonBugFender(`${AppRoutes.YourOrdersTest}_getReasons`, error);
    }
  };

  const getPhleboOTP = (orderIdsArr: any, ordersList: any, isRefetch: boolean) => {
    try {
      setLoading?.(true);
      client
        .query<getOrderPhleboDetailsBulk, getOrderPhleboDetailsBulkVariables>({
          query: GET_PHLEBO_DETAILS,
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
                if (order?.diagnosticOrderPhlebotomists === null) {
                  order.diagnosticOrderPhlebotomists = {
                    phleboRating: null,
                    phleboOTP: null,
                    checkinDateTime: null,
                    phleboTrackLink: null,
                    allowCalling: null,
                    showPhleboDetails: null,
                    phleboDetailsETAText: null,
                    allowCallingETAText: null,
                    isPhleboChanged: null,
                    diagnosticPhlebotomists: {
                      name: null,
                      mobile: null,
                      vaccinationStatus: null,
                    },
                    isPhleboETAElapsed: null,
                    phleboETAElapsedMessage: null,
                  };
                }
                order.diagnosticOrderPhlebotomists.phleboOTP =
                  findOrder?.orderPhleboDetails?.phleboOTP;
                order.diagnosticOrderPhlebotomists.diagnosticPhlebotomists.name =
                  findOrder?.orderPhleboDetails?.diagnosticPhlebotomists?.name;
                order.diagnosticOrderPhlebotomists.diagnosticPhlebotomists.mobile =
                  findOrder?.orderPhleboDetails?.diagnosticPhlebotomists?.mobile;
                order.diagnosticOrderPhlebotomists.phleboTrackLink =
                  findOrder?.orderPhleboDetails?.phleboTrackLink;
                order.diagnosticOrderPhlebotomists.checkinDateTime =
                  findOrder?.phleboEta?.estimatedArrivalTime;
                order.diagnosticOrderPhlebotomists.phleboRating =
                  findOrder?.orderPhleboDetails?.phleboRating;
                order.diagnosticOrderPhlebotomists.allowCalling = findOrder?.allowCalling;
                order.diagnosticOrderPhlebotomists.showPhleboDetails = findOrder?.showPhleboDetails;
                order.diagnosticOrderPhlebotomists.phleboDetailsETAText =
                  findOrder?.phleboDetailsETAText;
                order.diagnosticOrderPhlebotomists.allowCallingETAText =
                  findOrder?.allowCallingETAText;
                order.diagnosticOrderPhlebotomists.isPhleboChanged =
                  findOrder?.orderPhleboDetails?.isPhleboChanged;
              }
            });
            setOrders(ordersList);
            setTimeout(() => setLoading?.(false), 1000);
          } else {
            setOrders(ordersList);
            setLoading?.(false);
          }
        })
        .catch((error) => {
          setLoading?.(false);
          CommonBugFender(`${AppRoutes.YourOrdersTest}_fetchPhleboObject`, error);
        });
    } catch (error) {
      setLoading?.(false);
      CommonBugFender(`${AppRoutes.YourOrdersTest}_fetchPhleboObject`, error);
    }
  };

  function updateCancelCard(orderId: string | number) {
    const findOrderIndex = orders?.findIndex((arrObj: orderListByMobile) => arrObj?.id === orderId);
    if (findOrderIndex !== -1) {
      orders[findOrderIndex].orderStatus = DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED;
    }
    setLoading?.(false);
  }

  const onSubmitCancelOrder = (reason: string, comment: string) => {
    setLoading?.(true);
    const orderCancellationInput: CancellationDiagnosticsInputv2 = {
      comment: comment?.length != 0 ? comment : '',
      orderIds: [String(selectedOrderId)],
      patientId: String(selectedOrder?.patientId),
      reason: selectedCTAOption != '' ? reason + ' - ' + selectedCTAOption : reason,
      allowCancellationRequest: true,
    };
    diagnosticCancelOrder(client, orderCancellationInput)
      .then((data: any) => {
        const cancelResponse = data?.data?.cancelDiagnosticOrdersv2?.status;
        const cancelMsg = data?.data?.cancelDiagnosticOrdersv2?.message;
        if (!!cancelResponse && cancelResponse === true) {
          // updateCancelCard(selectedOrderId);
          setTimeout(() => refetchOrders(), 1000);
          setSelectedCTAOption('');
          showAphAlert?.({
            unDismissable: true,
            title: string.common.hiWithSmiley,
            description:
              !!cancelMsg && cancelMsg != ''
                ? cancelMsg
                : string.diagnostics.orderCancelledSuccessText,
          });
        } else {
          setLoading?.(false);
          showAphAlert?.({
            unDismissable: true,
            title: string.common.uhOh,
            description: cancelMsg,
          });
        }
        setSelectCancelReason('');
        setCancelReasonComment('');
        setSelectRescheduleReason('');
        setSelectedCTAOption('');
        //refetch the orders
      })
      .catch((error) => {
        aphConsole.log({ error });
        // DIAGNOSTIC_CANCELLATION_ALLOWED_BEFORE_IN_HOURS
        CommonBugFender('YourOrdersTests_callApiAndRefetchOrderDetails', error);
        handleGraphQlError(error);
        setLoading?.(false);
        setSelectCancelReason('');
        setCancelReasonComment('');
        setSelectRescheduleReason('');
        setSelectedCTAOption('');
      });
  };

  const fetchTestReportResult = useCallback((order: orderList) => {
    setLoading?.(true);
    const getVisitId = order?.visitNo;
    getPatientPrismMedicalRecordsApi(
      client,
      !!order?.patientId ? order?.patientId : currentPatient?.id,
      [MedicalRecordType.TEST_REPORT],
      'Diagnostics'
    )
      .then((data: any) => {
        const labResultsData = data?.getPatientPrismMedicalRecords_V3?.labResults?.response;
        let resultForVisitNo = labResultsData?.find((item: any) => item?.identifier == getVisitId);
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
  }, []);

  const renderReportError = (message: string) => {
    showAphAlert?.({
      title: string.common.uhOh,
      description: message,
    });
  };

  const checkIfPreTestingExists = (order: orderList) => {
    if (order != null) {
      const filterPreTestingData = order?.diagnosticOrderLineItems?.filter(
        (items) => items?.itemObj && items?.itemObj?.testPreparationData != ''
      );
      return filterPreTestingData?.length == 0 ? false : true;
    }
    return false;
  };

  function populateMrp(item: any) {
    const selectedGroupPlan = item?.groupPlan;
    //add type
    const findPriceobj = item?.pricingObj?.find(
      (items: any) => items?.groupPlan === selectedGroupPlan
    );
    const mrp = !!item?.itemObj?.packageCalculatedMrp
      ? item?.itemObj?.packageCalculatedMrp
      : !!findPriceobj && findPriceobj?.mrp;
    return mrp;
  }

  var pricesForItemArray;
  //add a type
  function createPatientObjLineItems(selectedOrder: any) {
    pricesForItemArray = selectedOrder?.diagnosticOrderLineItems?.map(
      (item: any, index: number) =>
        ({
          itemId: Number(item?.itemId),
          price: item?.price,
          mrp: populateMrp(item),
          groupPlan: item?.groupPlan,
        } as DiagnosticLineItem)
    );

    const totalPrice = pricesForItemArray
      ?.map((item: any) => Number(item?.price))
      ?.reduce((prev: number, curr: number) => prev + curr, 0);
    var array = [];
    array.push({
      patientID: selectedOrder?.patientId,
      lineItems: pricesForItemArray,
      totalPrice: totalPrice,
    });
    return array;
  }

  const getSlots = async () => {
    try {
      const dt = moment(selectedOrder?.slotDateTimeInUTC)?.format('YYYY-MM-DD') || null;
      const tm = moment(selectedOrder?.slotDateTimeInUTC)?.format('hh:mm A') || null; //format changed from hh:mm

      var getAddressObject = {
        addressLine1: selectedOrder?.patientAddressObj?.addressLine1!,
        addressLine2: selectedOrder?.patientAddressObj?.addressLine2!,
        zipcode: selectedOrder?.patientAddressObj?.zipcode! || '0',
        landmark: selectedOrder?.patientAddressObj?.landmark,
        latitude: Number(selectedOrder?.patientAddressObj?.latitude! || 0),
        longitude: Number(selectedOrder?.patientAddressObj?.longitude! || 0),
        city: selectedOrder?.patientAddressObj?.city!,
        state: selectedOrder?.patientAddressObj?.state!,
        patientAddressID: selectedOrder?.patientAddressId!,
      };

      const getPatientObjWithLineItems = createPatientObjLineItems(selectedOrder);

      const billAmount = getPatientObjWithLineItems
        ?.map((item) => Number(item?.totalPrice))
        ?.reduce((prev: number, curr: number) => prev + curr, 0);

      const selectedDate = moment(date)?.format('YYYY-MM-DD');

      const orderId = selectedOrder?.id;
      const getServiceabilityObject = {
        cityID: Number(selectedOrder?.cityId),
        stateID: 0,
      };

      setSlotInput({
        addressObject: getAddressObject,
        lineItems: getPatientObjWithLineItems,
        total: billAmount,
        serviceabilityObj: getServiceabilityObject,
        orderId: orderId,
      });

      const slotsResponse = await diagnosticGetCustomizedSlotsV2(
        client,
        getAddressObject,
        getPatientObjWithLineItems,
        billAmount,
        selectedDate, //will be current date
        getServiceabilityObject,
        orderId
      );
      if (slotsResponse?.data?.getCustomizedSlotsv2) {
        const getSlotResponse = slotsResponse?.data?.getCustomizedSlotsv2;
        const getDistanceCharges = getSlotResponse?.distanceCharges;
        const getIndividualSlotDuration = getSlotResponse?.slotDurationInMinutes;
        //get the slots array
        const diagnosticSlots = getSlotResponse?.available_slots || [];
        const updatedDiagnosticSlots =
          moment(date).format('YYYY-MM-DD') == dt
            ? diagnosticSlots?.filter((item: any) => item?.slotDetail?.slotDisplayTime != tm)
            : diagnosticSlots;

        let slotsArray: any = [];
        updatedDiagnosticSlots?.forEach((item: any) => {
          slotsArray.push({
            slotInfo: {
              endTime: item?.slotDetail?.slotDisplayTime,
              isPaidSlot: item?.isPaidSlot,
              status: 'empty',
              internalSlots: item?.slotDetail?.internalSlots,
              startTime: item?.slotDetail?.slotDisplayTime,
              distanceCharges: !!item?.isPaidSlot && item?.isPaidSlot ? getDistanceCharges : 0, //would be overall
            } as any,
          });
        });

        const isSameDate = moment().isSame(moment(date), 'date');
        if (isSameDate && slotsArray?.length == 0) {
          setTodaySlotNotAvailable(true);
          setDisplaySchedule(true);
        } else {
          setDisplaySchedule(true);
          todaySlotNotAvailable && setTodaySlotNotAvailable(false);
        }
        setDiagnosticSlotDuration(getIndividualSlotDuration! || 0);
        setSlots(slotsArray);
        const slotDetails = slotsArray?.[0];
        slotsArray?.length && setselectedTimeSlot(slotDetails);
      }
    } catch (e) {
      CommonBugFender('YourOrdersTests_getSlots', e);
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
    }
  };

  const renderFilterArea = () => {
    return (
      <View style={styles.filterContainer}>
        <Text style={styles.textPaitent}>Patient Name : </Text>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.activeFilterView}
          onPress={() => {
            setShowPatientsOverlay(true);
          }}
        >
          <Text style={styles.textSelectedPatient}>{selectedPatient}</Text>
          <Down />
        </TouchableOpacity>
      </View>
    );
  };

  const _onPressTestReschedule = (item: orderList) => {
    const isMultipleOrder = !!item?.attributesObj?.isMultiUhid
      ? item?.attributesObj?.isMultiUhid
      : false;
    setIsMultiUhid(isMultipleOrder);
    getReasons(item);
    setSelectedOrderId(item?.id);
    setSelectedOrder(item);
    setShowBottomOverlay(true); //show the overlay
    setShowRescheduleOptions(true); //show the cancel, reschedule options
  };

  function rescheduleSelectedOrder(resOrder: OrderRescheduleType) {
    //if multiple uhid,
    if (selectedOrder?.attributesObj?.isMultiUhid) {
      const multiUhidOrderIds: orderListByMobile[] = orders?.filter(
        (order: orderListByMobile) => order?.parentOrderId === selectedOrder?.parentOrderId
      );
      multiUhidOrderIds?.forEach((multiOrder: orderListByMobile) => {
        const findOrderIndex = orders.findIndex(
          (arrObj: orderListByMobile) => arrObj?.id === multiOrder?.id
        );
        if (findOrderIndex !== -1) {
          orders[findOrderIndex].rescheduleCount = resOrder?.rescheduleCount;
          orders[findOrderIndex].slotDateTimeInUTC = resOrder?.utcFormatedDate;
        }
      });
    }
    //for single uhid
    else {
      const findOrderIndex = orders.findIndex(
        (arrObj: orderListByMobile) => arrObj?.id === selectedOrder?.id
      );
      if (findOrderIndex !== -1) {
        orders[findOrderIndex].rescheduleCount = resOrder?.rescheduleCount;
        orders[findOrderIndex].slotDateTimeInUTC = resOrder?.utcFormatedDate;
      }
    }
    setLoading?.(false);
  }
  const onReschduleDoneSelected = () => {
    setLoading?.(true);
    const formattedDate = moment(rescheduleDate || diagnosticSlot?.date).format(
      'YYYY-MM-DD'
    ) as string;
    const formatTime =
      rescheduleSlotObject?.slotStartTime || (diagnosticSlot?.slotStartTime as string);

    const formattedString = moment(formattedDate).format('YYYY/MM/DD') + ' ' + formatTime;
    const dateTimeInUTC = new Date(formattedString)?.toISOString();

    const dateTimeToShow = formattedDate + ', ' + formatTime;
    const comment = '';
    const orderId = !!selectedOrder?.parentOrderId
      ? selectedOrder?.parentOrderId
      : selectedOrder?.id;
    const slotInfo = {
      slotDetails: {
        slotDisplayTime: rescheduleSlotObject?.slotStartTime,
        internalSlots: rescheduleSlotObject?.internalSlots,
      },
      paidSlot: rescheduleSlotObject?.isPaidSlot,
    };

    diagnosticRescheduleOrder(
      client,
      String(orderId),
      slotInfo,
      formattedDate,
      comment,
      selectRescheduleReason,
      DiagnosticsRescheduleSource.MOBILE
    )
      .then((data) => {
        const rescheduleResponse = data?.data?.rescheduleDiagnosticsOrderv2!;
        if (
          !!rescheduleResponse &&
          rescheduleResponse?.status === true &&
          rescheduleResponse?.rescheduleCount <= 3
        ) {
          const obj: OrderRescheduleType = {
            utcFormatedDate: dateTimeInUTC,
            date: formattedDate,
            slot: formatTime,
            rescheduleCount: rescheduleResponse?.rescheduleCount,
          };
          DiagnosticRescheduleOrder(
            selectRescheduleReason,
            formatTime,
            formattedDate,
            String(selectedOrder?.displayId!),
            currentPatient,
            selectedOrder?.patientObj!,
            isDiagnosticCircleSubscription
          );
          rescheduleSelectedOrder(obj);
          showAphAlert?.({
            unDismissable: true,
            title: string.common.hiWithSmiley,
            description: string.diagnostics.orderRescheduleSuccessText.replace(
              '{{dateTime}}',
              dateTimeToShow
            ),
          });
        } else {
          setLoading?.(false);
          showAphAlert?.({
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
        setRescheduleSource('');
      })
      .catch((error) => {
        aphConsole.log({ error });
        setSelectCancelReason('');
        setCancelReasonComment('');
        setSelectRescheduleReason('');
        setRescheduleSource('');
        CommonBugFender('YourOrdersTests_callApiAndRefetchOrderDetails', error);
        setLoading?.(false);
        if (
          error?.message?.indexOf('RESCHEDULE_COUNT_EXCEEDED') > 0 ||
          error?.message?.indexOf('SLOT_ALREADY_BOOKED') > 0
        ) {
          showAphAlert?.({
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
        <TestSlotSelectionOverlayNew
          isFocus={true}
          source={'Tests'}
          showInOverlay={true}
          heading="Schedule Appointment"
          date={date}
          isTodaySlotUnavailable={todaySlotNotAvailable}
          maxDate={moment()
            .add(maxDaysToShow, 'day')
            .toDate()}
          isVisible={showDisplaySchedule}
          onClose={() => {
            setDisplaySchedule(false);
            setLoading?.(false);
          }}
          slots={slots}
          slotInfo={selectedTimeSlot}
          slotInput={slotInput}
          isReschdedule={true}
          itemId={orderItemId}
          slotBooked={selectedOrder?.slotDateTimeInUTC}
          slotDuration={diagnosticSlotDuration}
          onSchedule={(
            date1: Date,
            slotInfo: TestSlot,
            getSlotDuration: number,
            currentDate: Date | undefined
          ) => {
            rescheduleDate = date1; //whatever date has been selected
            let rescheduleObject = {
              internalSlots: slotInfo?.slotInfo?.internalSlots! as any,
              distanceCharges:
                !!slotInfo?.slotInfo?.isPaidSlot && slotInfo?.slotInfo?.isPaidSlot!
                  ? slotInfo?.slotInfo?.distanceCharges!
                  : 0,
              slotStartTime: slotInfo?.slotInfo?.startTime!,
              slotEndTime: slotInfo?.slotInfo?.endTime!,
              date: date1?.getTime(),
              selectedDate: date1,
              isPaidSlot: !!slotInfo?.slotInfo?.isPaidSlot ? slotInfo?.slotInfo?.isPaidSlot : false,
            };
            rescheduleSlotObject = rescheduleObject;
            setDate(currentDate!);
            setselectedTimeSlot(slotInfo);
            setDiagnosticSlot?.(rescheduleObject);

            setDisplaySchedule(false);
            //call rechedule api
            setTimeout(() => onReschduleDoneSelected(), 100);
          }}
        />
      </View>
    );
  };

  const renderPhleboCallPopup = () => {
    return (
      <PhleboCallPopup
        onPressBack={() => {
          setShowPhleboCallPopUp(false);
        }}
        onPressProceed={() => {
          _onPressPhleboCall(callPhleboObj?.name, callPhleboObj?.number, callPhleboObj?.orderId);
        }}
      />
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
          <TouchableOpacity
            activeOpacity={0.5}
            style={{ flex: 1 }}
            onPress={() => onPressCloseOverlay()}
          />
          <SafeAreaView style={[styles.overlaySafeArea, styles.overlayTouch]}>
            <View
              style={[
                styles.overlayContainer,
                showMultiUhidOption ? { maxHeight: screenHeight / 1.5 } : { flex: 1 },
              ]}
            >
              <View>
                {showRescheduleOptions && renderRescheduleCancelOptions()}
                {showMultiUhidOption &&
                  !!multipleOrdersList &&
                  multipleOrdersList?.length > 0 &&
                  renderMultiUhidMessage()}
                {showRescheduleReasons && renderRescheduleReasons()}
                {showCancelReasons && renderCancelReasons()}
                {showPromoteCashback && renderPromoteCashback()}
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Overlay>
    );
  };

  const renderMultiUhidMessage = () => {
    const count = !!multipleOrdersList ? multipleOrdersList?.length : 0;
    return (
      <View style={styles.multiUhidView}>
        <View style={styles.topMultiUhidView}>
          <AlertTriangle style={styles.alertIconStyle} />
          <Text style={styles.orangeText}>{count} orders will be Rescheduled</Text>
        </View>
        <View style={{ marginTop: 8, marginBottom: 8 }}>
          <Text style={styles.muhidSubheading}>
            The following orders will be rescheduled along with the current order
          </Text>
        </View>
        <FlatList
          style={{ flexGrow: 1 }}
          bounces={false}
          data={multipleOrdersList}
          extraData={selectedPatientId}
          keyExtractor={(_, index) => `${index}`}
          renderItem={({ item, index }) => renderList(item, index, count)}
        />
        <View style={{ marginTop: 16, marginBottom: 16 }}>
          <Button
            title={string.common.continue}
            style={styles.buttonStyle}
            disabled={false}
            onPress={() => _onPressMultiUhidContinue()}
          />
        </View>
      </View>
    );
  };

  const renderList = (item: any, index: number, count: number) => {
    return (
      <TouchableOpacity activeOpacity={0.5} onPress={() => {}} style={{}}>
        {renderPatientTestView(item, count, index)}
      </TouchableOpacity>
    );
  };

  const renderPatientTestView = (item: any, count: number, index: number) => {
    const { patientName, patientSalutation } = extractPatientDetails(item?.patientObj);
    const remainingItems = item?.diagnosticOrderLineItems?.length - 2;
    const totalLineItems = item?.diagnosticOrderLineItems;
    return (
      <View style={{ marginTop: 2 }}>
        <Text style={styles.patientNameText}>
          {patientSalutation} {nameFormater(patientName, 'title')}
        </Text>
        <View style={[styles.itemsView]}>
          {item?.diagnosticOrderLineItems?.map((lineItems: any, index: number) => {
            return renderTestNames1(
              lineItems,
              remainingItems,
              item?.displayId,
              index,
              totalLineItems
            );
          })}
        </View>
        {count - 1 == index ? null : <Spearator style={{ marginBottom: 4 }} />}
      </View>
    );
  };

  const renderTestNames1 = (
    lineItems: any,
    remainingItems: number,
    displayId: number,
    index: number,
    totalLineItems: any
  ) => {
    return (
      <>
        {!selectedTestArray?.includes(displayId)
          ? index < 2 && (
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.bulletStyle}>{'\u2B24'}</Text>
                <Text style={styles.testName}>{nameFormater(lineItems?.itemName, 'title')}</Text>
                {remainingItems > 0 && index == 1 && (
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => _onPressMore(displayId)}
                    style={{}}
                  >
                    <Text style={styles.moreText}>+ {remainingItems} MORE</Text>
                  </TouchableOpacity>
                )}
              </View>
            )
          : renderTestName(lineItems, remainingItems, displayId, index, totalLineItems)}
      </>
    );
  };

  function _onPressMore(displayId: number) {
    const array = selectedTestArray?.concat(displayId);
    setSelectedTestArray(array);
  }

  function _onPressLess(displayId: number) {
    const removeItem = selectedTestArray?.filter((id: number) => id !== displayId);
    setSelectedTestArray(removeItem);
  }

  const renderTestName = (
    lineItems: any,
    remainingItems: number,
    displayId: number,
    index: number,
    totalLineItems: any
  ) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.bulletStyle}>{'\u2B24'}</Text>
        <Text style={styles.testName}>{nameFormater(lineItems?.itemName, 'title')}</Text>
        {index === totalLineItems?.length - 1 && (
          <TouchableOpacity activeOpacity={0.5} onPress={() => _onPressLess(displayId)} style={{}}>
            <Text style={styles.moreText}>SHOW LESS</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderRescheduleReasons = () => {
    return (
      <View>
        <Text style={styles.overlayHeadingText}>
          {string.diagnostics.reasonForReschedulingText}
        </Text>
        <View style={styles.reasonsContainer}>
          {rescheduleReasonList?.map((item: string, index: number) => {
            return (
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => setSelectRescheduleReason(item)}
                  style={styles.reasonsTouch}
                >
                  <View style={[styles.rowStyle, styles.marginStyle]}>
                    <Text style={styles.reasonsText}>{item}</Text>
                    {selectRescheduleReason === item ? (
                      <TickIcon style={styles.checkIconStyle} />
                    ) : (
                      <DisabledTickIcon style={styles.checkIconStyle} />
                    )}
                  </View>
                </TouchableOpacity>
                {index === rescheduleReasonList?.length - 1 ? null : <Spearator />}
              </View>
            );
          })}
        </View>
        <View style={styles.buttonView}>
          <Button
            title={'RESCHEDULE NOW'}
            style={styles.buttonStyle}
            disabled={selectRescheduleReason == ''}
            onPress={() => _onPressRescheduleNow('directReschedule')}
          />
        </View>
      </View>
    );
  };

  const renderCallToOrder = () => {
    return getCTADetails?.length ? (
      <CallToOrderView
        cityId={cityId}
        slideCallToOrder={slideCallToOrder}
        onPressSmallView={() => {
          setSlideCallToOrder(false);
        }}
        onPressCross={() => {
          setSlideCallToOrder(true);
        }}
        pageId={CALL_TO_ORDER_CTA_PAGE_ID.MYORDERS}
      />
    ) : null;
  };

  const renderCancelReasons = () => {
    const selectedOrderRescheduleCount = selectedOrder?.rescheduleCount;
    let selectedOrderTime = selectedOrder?.slotDateTimeInUTC;
    selectedOrderTime = moment(selectedOrderTime);
    const cancelReasonArray = cancelReasonList;
    return (
      <View style={{ height: screenHeight / 1.6 }}>
        <Text style={styles.overlayHeadingText}>
          {string.diagnostics.reasonForCancellationText}
        </Text>

        <View style={styles.reasonsContainer}>
          <ScrollView style={{ flex: 1 }}>
            {cancelReasonArray?.map(
              (
                item: getRescheduleAndCancellationReasons_getRescheduleAndCancellationReasons_cancellationReasonsv2,
                index: number
              ) => {
                const reasonString = item?.reason;
                const showAddtionalCTA = item?.ctaOptions;
                const showAddtionalView = !!showAddtionalCTA && !isEmptyObject(showAddtionalCTA);
                const showMulitpleCTA = showAddtionalCTA?.multiCtas;
                const isMultiCTA = showAddtionalView && showMulitpleCTA;
                const ctaOption = showAddtionalCTA?.cta;
                const hideRescheduleView =
                  selectCancelReason === reasonString &&
                  selectedOrderRescheduleCount! >= 3 &&
                  ctaOption == CANCELLATION_REASONS_CTA.RESCHEDULE;
                return (
                  <View style={{ flex: 1 }}>
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={() => _onPressCancelReason(item, isMultiCTA)}
                      style={[
                        styles.reasonsTouch,
                        {
                          height:
                            selectCancelReason === reasonString &&
                            !hideRescheduleView &&
                            showAddtionalView
                              ? !!isMultiCTA
                                ? showMulitpleCTA?.length > ctaColumn
                                  ? 120
                                  : 110
                                : !!ctaOption
                                ? 150
                                : 100
                              : 40,
                          paddingTop: 10,
                          justifyContent: 'space-between',
                        },
                        styles.marginStyle,
                      ]}
                    >
                      {renderTickOption(reasonString!)}
                      {hideRescheduleView
                        ? null
                        : showAddtionalView && selectCancelReason === reasonString
                        ? renderCancelAddtionalView(showAddtionalCTA)
                        : null}
                      {index === cancelReasonArray?.length - 1 ? null : (
                        <Spearator style={{ marginTop: 6 }} />
                      )}
                      {renderOthersOption(reasonString!)}
                    </TouchableOpacity>
                  </View>
                );
              }
            )}
          </ScrollView>
        </View>
        {renderCancelButton()}
      </View>
    );
  };

  const renderTickOption = (reasonString: string) => {
    return (
      <View style={styles.rowStyle}>
        <Text style={styles.reasonsText}>{reasonString}</Text>
        {selectCancelReason === reasonString ? (
          <TickIcon style={styles.checkIconStyle} />
        ) : (
          <DisabledTickIcon style={styles.checkIconStyle} />
        )}
      </View>
    );
  };

  function triggerCTEventForCancelRetention(sourceCTA: 'Reschedule' | 'Add Test' | 'Edit Patient') {
    const date = moment(selectedOrder?.slotDateTimeInUTC)?.format('DD/MM/YYYY');
    const time = moment(selectedOrder?.slotDateTimeInUTC)?.format('hh:mm A');
    const pName = `${selectedOrder?.patientObj?.firstName} ${selectedOrder?.patientObj?.lastName}`;
    const pGender = selectedOrder?.patientObj?.gender === Gender.MALE ? 'Mr.' : 'Ms.';
    const city = selectedOrder?.patientAddressObj?.city;
    DiagnosticCancellationRetention(
      selectedOrder?.preBookingId!,
      selectedOrder?.displayId!,
      date,
      time,
      selectCancelReason,
      sourceCTA,
      pName,
      pGender,
      currentPatient?.mobileNumber,
      city!
    );
  }

  function _handleCancellationReasonNavigation(sourceCTA: CANCELLATION_REASONS_CTA) {
    switch (sourceCTA) {
      case CANCELLATION_REASONS_CTA.ADD_TESTS:
        setShowCancelReasons(false);
        _onPressAddTest(selectedOrder!, 'cancelModify');
        triggerCTEventForCancelRetention('Add Test');
        break;
      case CANCELLATION_REASONS_CTA.EDIT_PATIENT_DETAILS:
        _onPressEditPatient(selectedOrder!);
        triggerCTEventForCancelRetention('Edit Patient');
        break;
      case CANCELLATION_REASONS_CTA.RESCHEDULE:
        _onPressRescheduleNow('cancelReschedule');
        triggerCTEventForCancelRetention('Reschedule');
        break;
      default:
        _onPressCancelNow();
        break;
    }
  }

  const renderCancelAddtionalView = (
    ctaOptions: getRescheduleAndCancellationReasons_getRescheduleAndCancellationReasons_cancellationReasonsv2_ctaOptions
  ) => {
    const displayText = ctaOptions?.displayText;
    const ctaText = ctaOptions?.cta;
    const showMulitpleCTA = ctaOptions?.multiCtas;
    return !!displayText || !!ctaText ? (
      <View style={{ marginTop: 10 }}>
        {!!displayText && <Text style={styles.wantToReschedule}>{displayText}</Text>}
        {!!ctaText && renderCancellationCTA(ctaText!)}
        {!!showMulitpleCTA && showMulitpleCTA?.length > 0 && renderCTA(showMulitpleCTA)}
      </View>
    ) : null;
  };

  const renderCancellationCTA = (ctaText: CANCELLATION_REASONS_CTA) => {
    return (
      <Button
        title={ctaText?.replace(/[_]/g, ' ')}
        disabled={false}
        onPress={() => _handleCancellationReasonNavigation(ctaText!)}
      />
    );
  };

  const renderCTA = (ctaArray: any) => {
    return (
      <FlatList
        data={ctaArray}
        numColumns={ctaColumn}
        renderItem={({ item, index }: { item: string; index: number }) => renderView(item, index)}
      />
    );
  };

  function _selectOption(item: string) {
    setSelectedCTAOption(item);
  }

  const renderView = (item: string, index: number) => {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => _selectOption(item)}
        style={[
          styles.ctaTouch,
          { backgroundColor: selectedCTAOption == item ? colors.APP_GREEN : colors.BGK_GRAY },
        ]}
      >
        <Text
          style={{
            ...theme.viewStyles.text(
              'M',
              12,
              selectedCTAOption == item ? colors.WHITE : colors.SHERPA_BLUE,
              1,
              18
            ),
          }}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderOthersOption = (reasonString: string) => {
    return;
    <>
      {selectCancelReason === string.diagnostics.reasonForCancel_TestOrder.otherReasons &&
      reasonString === string.diagnostics.reasonForCancel_TestOrder.otherReasons ? (
        <TextInputComponent
          value={cancelReasonComment}
          onChangeText={(text) => {
            setCancelReasonComment(text);
          }}
          placeholder={string.common.return_order_comment_text}
          inputStyle={{ fontSize: 14 }}
        />
      ) : null}
    </>;
  };

  const renderCancelButton = () => {
    return (
      <View style={styles.buttonView}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.cancelCTATouch}
          disabled={
            selectCancelReason == string.diagnostics.reasonForCancel_TestOrder.otherReasons
              ? cancelReasonComment?.trim() == '' || cancelReasonComment.length < 10
              : selectCancelReason == ''
          }
          onPress={() => _onPressCancelNow()}
        >
          <Text style={styles.yellowText}>
            {isDirectCancelRequest ? 'CANCEL NOW' : 'SUBMIT CANCEL REQUEST'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPromoteCashback = () => {
    return (
      <View style={styles.promoViewContainer}>
        <Text style={styles.overlayHeadingText}>{string.diagnostics.promoteCashbackHeading}</Text>
        <View style={styles.promoContainer}>
          <PromoCashback />
        </View>
        <View style={styles.promoButtonContainer}>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.proceedToCancelTouch}
            onPress={() => {
              _onPressProceedToCancel();
            }}
          >
            <Text style={styles.yellowText}>PROCEED TO CANCEL</Text>
          </TouchableOpacity>
          <Button
            onPress={() => {
              setShowPromoteCashback(false);
              _onPressTestReschedule(selectedOrder!);
            }}
            style={{ width: '40%' }}
            title={'GO BACK'}
          />
        </View>
      </View>
    );
  };
  const enable_cancelellation_policy =
    AppConfig.Configuration.Enable_Diagnostics_Cancellation_Policy;
  const cancelellation_policy_text = AppConfig.Configuration.Diagnostics_Cancel_Policy_Text_Msg;
  const renderCancelationPolicy = () => {
    return (
      <View style={styles.cancel_container}>
        <InfoIconRed />
        <Text style={styles.cancel_text}>{cancelellation_policy_text}</Text>
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
        {enable_cancelellation_policy ? renderCancelationPolicy() : null}
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => _onPressReschduleOption()}
          style={styles.optionsTouch}
        >
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
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => _onPressCancelOption()}
          style={styles.optionsTouch}
        >
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
                <Button
                  onPress={() => {
                    if (selectedOrder?.totalPrice && selectedOrder?.totalPrice >= 500) {
                      _onPressProceedToCancelForPromo();
                    } else {
                      _onPressProceedToCancel();
                    }
                  }}
                  title={'PROCEED TO CANCEL'}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  function _onPressCancelReason(
    item: getRescheduleAndCancellationReasons_getRescheduleAndCancellationReasons_cancellationReasonsv2,
    isMultiCTA: any
  ) {
    const selectedCancelReason = item?.reason!;
    setIsDirectCancelRequest(item?.isDirectCancellation!);
    if (CANCEL_RESCHEDULE_OPTION.includes(selectedCancelReason)) {
      setSelectRescheduleReason(selectedCancelReason);
    }
    setSelectCancelReason(selectedCancelReason);
    if ((!!!isMultiCTA || !isMultiCTA || isMultiCTA?.length == 0) && selectedCTAOption != '') {
      setSelectedCTAOption('');
    }
  }

  function _proceedWithReschedule() {
    setLoading?.(true);
    setShowBottomOverlay(false);
    setShowRescheduleOptions(false);
    setShowRescheduleReasons(false);
    setSelectCancelReason('');
    setShowCancelReasons(false);
    getSlots();
  }

  function _onPressRescheduleNow(source: string) {
    if (isMultiUhid && source == 'cancelReschedule') {
      callMultiUhidApi(string.diagnosticsOrders.cancel);
    } else {
      _proceedWithReschedule();
    }
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
    setShowMultiUhidOption(false);
    setShowBottomOverlay(false);
    setShowRescheduleOptions(false);
    setShowRescheduleReasons(false);
    setShowCancelReasons(false);
    setSelectRescheduleOption(true);
    setShowPromoteCashback(false);
    setSelectCancelOption(false);
    setSelectRescheduleReason('');
    setSelectCancelReason('');
    setCancelReasonComment('');
    setSelectedTestArray([]);
    setRescheduleSource('');
    setSelectedCTAOption('');
  }

  function _onPressProceedToReschedule(count: number) {
    //hide the current view
    if (count == 3) {
      return;
    }
    setShowRescheduleOptions(false); //hide the options view
    if (isMultiUhid) {
      callMultiUhidApi(string.diagnosticsOrders.reschedule);
    } else {
      setShowRescheduleReasons(true);
      setSelectRescheduleOption(true);
    }

    showCancelReasons && setShowCancelReasons(false);
    setShowCancelReasons(false);
    selectCancelOption && setSelectCancelOption(false);
  }

  function _onPressProceedToCancelForPromo() {
    setShowRescheduleOptions(false); //hide the options view
    setShowCancelReasons(false);
    setShowRescheduleReasons(false);
    setShowPromoteCashback(true);
  }
  function _onPressMultiUhidContinue() {
    setShowMultiUhidOption(false);
    if (rescheduleSource == string.diagnosticsOrders.cancel) {
      _proceedWithReschedule();
    } else {
      setShowRescheduleReasons(true);
      setSelectRescheduleOption(true);
    }
  }

  function _onProceedWithSingleUhidRescheduleFlow(source?: string) {
    if (source == string.diagnosticsOrders.cancel) {
      _proceedWithReschedule();
    } else {
      setShowRescheduleReasons(true);
      setSelectRescheduleOption(true);
    }
  }

  async function callMultiUhidApi(source: string) {
    setRescheduleSource(source);
    setLoading?.(true);
    const parentOrderId = selectedOrder?.parentOrderId || selectedOrder?.id;
    try {
      const res = await diagnosticsOrderListByParentId(client, parentOrderId!);
      if (res?.data?.getDiagnosticOrdersListByParentOrderID) {
        const getOrders = res?.data?.getDiagnosticOrdersListByParentOrderID?.ordersList! || [];
        if (getOrders?.length == 0) {
          //in that case when res is [] => cancelled all muhid order except one, try to reschedule
          setIsMultiUhid(false);
          setShowMultiUhidOption(false);
          _onProceedWithSingleUhidRescheduleFlow(source);
        } else {
          setMultipleOrdersList(getOrders);
          if (string.diagnosticsOrders.cancel) {
            setShowRescheduleOptions(false);
            setShowRescheduleReasons(false);
            setSelectCancelReason('');
            setShowCancelReasons(false);
          }
          setShowMultiUhidOption(true);
        }
      } else {
        setMultipleOrdersList([]);
        setShowMultiUhidOption(false);
        _onProceedWithSingleUhidRescheduleFlow(source);
      }
      setLoading?.(false);
    } catch (error) {
      setMultipleOrdersList([]);
      setIsMultiUhid(false);
      setShowMultiUhidOption(false);
      _onProceedWithSingleUhidRescheduleFlow(source);
      setLoading?.(false);
      CommonBugFender('YourOrdersTest_callMultiUhidApi', error);
    }
  }

  function _onPressProceedToCancel() {
    setShowPromoteCashback(false);
    setShowRescheduleOptions(false); //hide the options view
    setShowCancelReasons(true);
    showRescheduleReasons && setShowRescheduleReasons(false);
  }

  function _onPressReschduleOption() {
    setShowPromoteCashback(false);
    setSelectRescheduleOption(true);
    setSelectCancelOption(false);
  }

  function _onPressCancelOption() {
    setShowPromoteCashback(false);
    setSelectCancelOption(true);
    setSelectRescheduleOption(false);
  }

  function _navigateToYourTestDetails(order: orderList, tab: boolean) {
    const isPrepaid = order?.paymentType == DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT;
    setLoading?.(true);
    performNavigation(order, tab);
  }

  function performNavigation(order: any, tab: boolean) {
    setLoading?.(false);
    props.navigation.push(AppRoutes.TestOrderDetails, {
      orderId: order?.id,
      setOrders: (orders: orderList[]) => setOrders(orders),
      selectedOrder: order,
      comingFrom: AppRoutes.YourOrdersTest,
      showOrderSummaryTab: tab,
    });
  }

  const renderOrder = (order: orderList, index: number) => {
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

    //commented for future ref
    // const showReschedule =
    //   isRescheduleValid == undefined && !isRescheduleValidAtOrderLevel ? true : false;
    const showReschedule = DIAGNOSTIC_SHOW_RESCHEDULE_CANCEL_ARRAY.includes(order?.orderStatus);

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

    const showEditProfileOption = DIAGNOSTIC_EDIT_PROFILE_ARRAY.includes(order?.orderStatus!);

    const getSlotStartTime = (slot: string /*07:00-07:30 */) => {
      return moment((slot?.split('-')[0] || '').trim(), 'hh:mm');
    };

    return (
      <OrderTestCard
        orderId={order?.displayId}
        key={order?.id}
        createdOn={order?.createdDate}
        orderLevelStatus={order?.orderStatus}
        orderAttributesObj={order?.attributesObj}
        patientName={
          !!order?.patientObj
            ? `${order?.patientObj?.firstName} ${order?.patientObj?.lastName}`
            : getPatientNameById(allCurrentPatients, order?.patientId)
        }
        gender={
          !!order?.patientObj?.gender
            ? order?.patientObj?.gender === Gender.MALE
              ? 'Mr.'
              : order?.patientObj?.gender === Gender.FEMALE
              ? 'Ms.'
              : ''
            : ''
        }
        patientDetails={!!order?.patientObj ? order?.patientObj : null}
        showEditIcon={showEditProfileOption}
        showAddTest={showEditProfileOption}
        ordersData={order?.diagnosticOrderLineItems!}
        showPretesting={showPreTesting!}
        dateTime={!!order?.slotDateTimeInUTC ? order?.slotDateTimeInUTC : order?.diagnosticDate}
        slotTime={
          !!order?.slotDateTimeInUTC
            ? order?.slotDateTimeInUTC
            : getSlotStartTime(order?.slotTimings)
        }
        slotDuration={
          order?.attributesObj?.slotDurationInMinutes || AppConfig.Configuration.DEFAULT_PHELBO_ETA
        }
        isPrepaid={order?.paymentType == DIAGNOSTIC_ORDER_PAYMENT_TYPE.ONLINE_PAYMENT}
        isCancelled={DIAGNOSTIC_ORDER_CANCELLED_STATUS.includes(currentStatus)}
        cancelledReason={
          DIAGNOSTIC_ORDER_CANCELLED_STATUS.includes(currentStatus) &&
          order?.diagnosticOrderCancellation != null
            ? order?.diagnosticOrderCancellation
            : null
        }
        showRescheduleCancel={
          showReschedule && !DIAGNOSTIC_ORDER_CANCELLED_STATUS.includes(order?.orderStatus)
        }
        showReportOption={
          showReport || order?.orderStatus === DIAGNOSTIC_ORDER_STATUS.ORDER_COMPLETED
        }
        showAdditonalView={!!showExtraInfo && showExtraInfo?.length > 0}
        additonalRejectedInfo={sampleRejectedString}
        price={order?.totalPrice}
        onPressCard={() => _navigateToYourTestDetails(order, false)}
        onPressAddTest={() => _onPressAddTest(order)}
        onPressReschedule={() => _onPressTestReschedule(order)}
        onPressViewDetails={() => _navigateToYourTestDetails(order, false)}
        onPressViewReport={() => _onPressViewReportAction(order)}
        phelboObject={order?.diagnosticOrderPhlebotomists}
        onPressRatingStar={(star) => _navigateToRatingScreen(star, order)}
        onPressEditPatient={() => _onPressEditPatient(order)}
        onPressCallOption={(name, number) => {
          setShowPhleboCallPopUp(true);
          const callObj = {
            name: name,
            number: number,
            orderId: order?.id,
          };
          setCallPhleboObj(callObj);
        }}
        style={[
          { marginHorizontal: 20 },
          index < orders?.length - 1 ? { marginBottom: 8 } : { marginBottom: 20 },
          index == 0 ? { marginTop: 20 } : {},
        ]}
        cancelRequestedReason={cancelRequestedReason}
      />
    );
  };

  function _onPressEditPatient(order: orderList) {
    setSelectedOrder(order);
    setSwitchPatientResponse('');
    setShowPatientListOverlay(true);
    onPressCloseOverlay();
  }

  function _navigateToRatingScreen(star: any, order: any) {
    props.navigation.navigate(AppRoutes.TestRatingScreen, {
      ratingStar: star,
      orderDetails: order,
      onPressBack: fetchOrders,
    });
  }

  function _onPressPhleboCall(phleboName: string, phoneNumber: string, orderId: string) {
    //if allowCalling is true.
    const id = orderId.toString();
    DiagnosticPhleboCallingClicked(currentPatient, id, phleboName, isDiagnosticCircleSubscription);
    setShowPhleboCallPopUp(false);
    _callDiagnosticExotelApi(phoneNumber, orderId);
  }

  async function _callDiagnosticExotelApi(phoneNumber: string, orderId: string) {
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
      CommonBugFender('_callDiagnosticExotelApi_YourOrdersTests', error);
    }
  }

  function _onPressAddTest(order: orderList, source?: string) {
    !!source && onPressCloseOverlay();
    DiagnosticAddTestClicked(
      order?.id,
      currentPatient,
      order?.orderStatus,
      isDiagnosticCircleSubscription
    );

    //clear the cart, if it has some duplicate item present.
    const getOrderItems = order?.diagnosticOrderLineItems?.map(
      (
        item:
          | getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems
          | any
      ) => Number(item?.itemId)
    );
    const getCartItemsWithId = cartItems?.length > 0 && cartItems?.map((item) => Number(item?.id));
    const findSelectedPatient = patientCartItems?.find(
      (item) => item?.patientId === order?.patientId
    );
    const isAlreadyPartOfOrder =
      !!getCartItemsWithId &&
      getCartItemsWithId?.length > 0 &&
      getOrderItems?.filter((val) => getCartItemsWithId?.includes(val));

    updateModifyData(order, getOrderItems);
    if (!!isAlreadyPartOfOrder && isAlreadyPartOfOrder?.length > 0) {
      isAlreadyPartOfOrder?.map((id: number) => {
        removeCartItem?.(String(id));
        !!findSelectedPatient && removePatientCartItem?.(order?.patientId, String(id));
      });
      showAphAlert?.({
        onPressOk: () => {
          hideAphAlert && hideAphAlert();
          _navigateToSearchPage(order?.patientId, isAlreadyPartOfOrder);
        },
        title: string.common.uhOh,
        description: string.diagnostics.modifyItemAlreadyExist,
      });
    } else {
      _navigateToSearchPage(order?.patientId);
    }
  }

  function _navigateToSearchPage(patientId: string, duplicateId?: any) {
    props.navigation.push(AppRoutes.SearchTestScene, {
      searchText: '',
      isModify: true,
      duplicateOrderId: duplicateId?.map((item: string | number) => Number(item)),
    });
  }

  function updateModifyData(order: orderList, modifiedItems: any) {
    setHcCharges?.(0);
    setModifyHcCharges?.(0);
    setModifiedOrder?.(order);
    setModifiedOrderItemIds?.(modifiedItems);
    setDistanceCharges?.(0);
    setModifiedPatientCart?.([]);
  }
  const renderViewReportModal = () => {
    return (
      <View>
        <TestPdfRender
          uri={activeOrder?.labReportURL || ''}
          order={activeOrder}
          isReport={true}
          onPressClose={() => {
            setActiveOrder(activeOrder);
            setShowViewReportModal(false);
          }}
        />
      </View>
    );
  };

  function _onPressViewReportAction(order: orderList) {
    if (!!order?.labReportURL && order?.labReportURL != '') {
      setActiveOrder(order);
      setShowViewReportModal(true);
    } else if (!!order?.visitNo && order?.visitNo != '') {
      //directly open the phr section
      fetchTestReportResult(order);
    } else {
      props.navigation.navigate(AppRoutes.HealthRecordsHome);
    }
  }

  function _onPressViewReport(order: orderList) {
    const appointmentDetails = !!order?.slotDateTimeInUTC
      ? order?.slotDateTimeInUTC
      : order?.diagnosticDate;
    const appointmentDate = moment(appointmentDetails)?.format('DD MMM YYYY');
    const patientName = getPatientNameById(allCurrentPatients, order?.patientId)?.replace(
      / /g,
      '_'
    );
    downloadLabTest(removeWhiteSpaces(order?.labReportURL)!, appointmentDate, patientName, order);
  }

  async function downloadLabTest(
    pdfUrl: string,
    appointmentDate: string,
    patientName: string,
    order: orderList
  ) {
    setLoading?.(true);
    try {
      await downloadDiagnosticReport(
        setLoading,
        pdfUrl,
        appointmentDate,
        patientName,
        true,
        undefined,
        order?.orderStatus,
        (order?.displayId).toString(),
        true
      );
    } catch (error) {
      setLoading?.(false);
      CommonBugFender('YourOrderTests_downloadLabTest', error);
    } finally {
      setLoading?.(false);
    }
  }

  const keyExtractor = useCallback((item: any, index: number) => `${index}`, []);

  const renderLoadMore = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.loadMoreView}
        onPress={() => {
          setCurrentOffset(currentOffset + 1);
        }}
      >
        <Text style={styles.textLoadMore}>{nameFormater('load more', 'upper')}</Text>
        <DownO size="sm_l" style={styles.downArrow} />
      </TouchableOpacity>
    );
  };

  const renderOrders = () => {
    return (
      <FlatList
        keyExtractor={keyExtractor}
        bounces={false}
        data={orders}
        extraData={orderListData}
        scrollEventThrottle={16}
        onScroll={() => {
          setSlideCallToOrder(true);
        }}
        renderItem={({ item, index }) => renderOrder(item, index)}
        initialNumToRender={10}
        ListEmptyComponent={renderNoOrders()}
        ListFooterComponent={
          (orderListData?.length && orderListData?.length < 10) ||
          loading ||
          error ||
          !orderListData?.length
            ? null
            : renderLoadMore()
        }
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
      firstName: ALL,
      lastName: '',
      gender: '',
      dateOfBirth: '',
    },
    ...profileArray?.slice(0, profileArray?.length - 1),
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
    const isSelected = selectedPatientId == item?.id;
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          setSelectedPatient(item?.firstName == null ? '' : item?.firstName);
          setSelectedPatientId(item?.id);
          setCurrentOffset(1);
          setOrderListData([]);
          setShowPatientsOverlay(false);
        }}
        style={[
          styles.patientItem,
          {
            backgroundColor: isSelected ? colors.APP_GREEN : colors.WHITE,
          },
        ]}
      >
        <Text style={[styles.patientText, { color: isSelected ? colors.WHITE : colors.APP_GREEN }]}>
          {item?.firstName}
        </Text>
        {item?.gender && item?.dateOfBirth ? (
          <Text
            style={[styles.patientSubText, { color: isSelected ? colors.WHITE : colors.APP_GREEN }]}
          >{`${item?.gender}, ${moment().diff(item?.dateOfBirth, 'years')}`}</Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  function _onPressClosePatientOverlay() {
    setShowPatientsOverlay(false);
  }

  const renderPatientsOverlay = () => {
    return (
      <Overlay
        onRequestClose={() => _onPressClosePatientOverlay()}
        isVisible={showPatientsOverlay}
        onBackdropPress={() => _onPressClosePatientOverlay()}
        windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
        containerStyle={{ marginBottom: 0 }}
        fullScreen
        transparent
        overlayStyle={styles.overlayStyle}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <TouchableOpacity
            activeOpacity={0.5}
            style={{ flex: 1 }}
            onPress={() => _onPressClosePatientOverlay()}
          >
            <View style={styles.modalMainView}>
              <View style={styles.paitentModalView}>
                <Text style={styles.textHeadingModal}>Select Patient Name</Text>
                <View style={styles.patientCard}>
                  <FlatList
                    bounces={false}
                    data={newProfileArray}
                    extraData={selectedPatientId}
                    keyExtractor={(_, index) => `${index}`}
                    renderItem={({ item, index }) => renderModalView(item, index)}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      </Overlay>
    );
  };

  function _onPressClosePatientListOverlay() {
    setShowPatientListOverlay(false);
  }

  const checkPatientAge = (_selectedPatient: any, fromNewProfile: boolean = false) => {
    let age = !!_selectedPatient?.dateOfBirth ? getAge(_selectedPatient?.dateOfBirth) : null;
    if (age != null && age != undefined && age <= 10) {
      setShowPatientListOverlay?.(false);
      showAphAlert?.({
        title: string.common.uhOh,
        description: string.diagnostics.minorAgeText,
        onPressOk: () => {
          hideAphAlert?.();
          setShowPatientListOverlay(true);
        },
      });
      return true;
    }
    return false;
  };

  const onNewProfileAdded = (newPatient: any) => {
    if (newPatient?.profileData) {
      if (!checkPatientAge(newPatient?.profileData, true)) {
        setShowPatientListOverlay(false);
        _changeSelectedPatient(newPatient?.profileData);
      }
    }
  };

  const _onPressBackButton = () => {
    if (!patientListSelectedPatient) {
      setShowPatientListOverlay(true);
    }
  };

  async function _changeSelectedPatient(patientSelected: any) {
    setPatientListSelectedPatient([]);
    _onPressClosePatientListOverlay();
    if (patientSelected?.id === selectedOrder?.patientId) {
      _onPressClosePatientListOverlay();
      return;
    }

    try {
      setLoading?.(true);
      const result = await switchDiagnosticOrderPatientId(
        client,
        selectedOrder?.id!,
        patientSelected?.id
      );
      if (
        result?.data?.switchDiagnosticOrderPatientID &&
        result?.data?.switchDiagnosticOrderPatientID?.status
      ) {
        setShowPatientListOverlay(true);
        setSwitchPatientResponse('success');
      } else {
        setShowPatientListOverlay(true);
        setSwitchPatientResponse('fail');
        setLoading?.(false);
      }
    } catch (error) {
      setShowPatientListOverlay(true);
      setSwitchPatientResponse('fail');
      setLoading?.(false);
      CommonBugFender('_onChangeSelectedPatient_YourOrdersTests', error);
    }
  }

  function _afterSuccess() {
    _onPressClosePatientListOverlay();
    refetchOrders();
  }

  function updatePatientSwitchChecks(selectedOrder: orderList) {
    /* if rtpcr is present in order (only) + irrespective of age => can switch to any user except itself
     * if rtpcr is present in order (...+ rtpcr) + user >=10 => cannot switch to any user -> exisitng flow
     */
    const orderItems = selectedOrder?.diagnosticOrderLineItems;
    const hasRtpcrInOrder = orderItems?.find((diagItems) =>
      AppConfig.Configuration.DIAGNOSTICS_COVID_ITEM_IDS.includes(Number(diagItems?.itemId))
    );
    if (!!hasRtpcrInOrder && orderItems?.length == 1) {
      return true;
    }
    return false;
  }

  function _onPressDoneSwitchUhid(selectedPatient: any, removeMinorAge: boolean) {
    if (removeMinorAge || !checkPatientAge(selectedPatient)) {
      setPatientListSelectedPatient(selectedPatient);
      _changeSelectedPatient(selectedPatient);
    }
  }

  function _onPressAddNewProfile() {
    setShowPatientListOverlay(false);
    props.navigation.navigate(AppRoutes.EditProfile, {
      isEdit: false,
      isPoptype: true,
      mobileNumber: currentPatient?.mobileNumber,
      onNewProfileAdded: onNewProfileAdded,
      onPressBackButton: _onPressBackButton,
    });
  }

  const renderPatientsListOverlay = () => {
    const orderPatient = allCurrentPatients?.find(
      (item: any) => item?.id === selectedOrder?.patientId
    );
    const updatePatientCheck = updatePatientSwitchChecks(selectedOrder!);
    const skuItem = selectedOrder?.diagnosticOrderLineItems!;
    const removeAllOther = checkPatientWithSkuGender(skuItem)?.removeAllOther;
    const getPatientDisableValue = allCurrentPatients?.map(
      (patient: any) => checkPatientWithSkuGender(skuItem, patient)?.nonValidPatient
    );
    const checkIsPatientDisableWithSku =
      !!getPatientDisableValue && getPatientDisableValue?.find((value: boolean) => value == true);
    return (
      <PatientListOverlay
        showCloseIcon={true}
        onCloseIconPress={() => _onPressClosePatientListOverlay()}
        onPressClose={() => _onPressClosePatientListOverlay()}
        onPressDone={(_selectedPatient: any) => {
          _onPressDoneSwitchUhid(_selectedPatient, updatePatientCheck);
        }}
        onPressAddNewProfile={() => _onPressAddNewProfile()}
        patientSelected={orderPatient}
        onPressAndroidBack={() => {
          setShowPatientListOverlay(false);
          handleBack();
        }}
        disabledPatientId={selectedOrder?.patientId}
        subTitle={''}
        titleStyle={styles.patientOverlayTitleStyle}
        source={AppRoutes.YourOrdersTest}
        responseMessage={switchPatientResponse}
        onCloseError={() => setSwitchPatientResponse('')}
        refetchResult={() => _afterSuccess()}
        removeAllSwitchRestrictions={updatePatientCheck}
        skuItem={skuItem!}
        showGenderSkuMsg={!!checkIsPatientDisableWithSku}
        skuGender={
          !!removeAllOther && removeAllOther?.length > 0
            ? removeAllOther?.[0]
            : selectedOrder?.patientObj?.gender?.toLowerCase()
        }
      />
    );
  };

  const onPressHelp = () => {
    const helpSectionQueryId = AppConfig.Configuration.HELP_SECTION_CUSTOM_QUERIES;
    props.navigation.navigate(AppRoutes.NeedHelpDiagnosticsOrder, {
      queryIdLevel1: helpSectionQueryId.diagnostic,
      sourcePage: 'My Orders',
    });
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
      {showDisplaySchedule && renderRescheduleOrderOverlay()}
      <SafeAreaView style={theme.viewStyles.container}>
        {props?.showHeader == false ? null : (
          <Header
            leftIcon="backArrow"
            title={string.orders.urOrders}
            container={{ borderBottomWidth: 0 }}
            onPressLeftIcon={() => handleBack()}
            rightComponent={renderHeaderRightComponent()}
          />
        )}
        {renderFilterArea()}
        {renderError()}
        {renderOrders()}
        {renderCallToOrder()}
        {showBottomOverlay && renderBottomPopUp()}
        {showPatientsOverlay && renderPatientsOverlay()}
        {showPatientListOverlay && renderPatientsListOverlay()}
        {showViewReportModal ? renderViewReportModal() : null}
        {showPhleboCallPopUp ? renderPhleboCallPopup() : null}
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
  promoViewContainer: { height: 300 },
  promoContainer: { justifyContent: 'center', flex: 1, alignItems: 'center', paddingVertical: 20 },
  promoButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
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
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'transparent',
  },
  cancel_container: {
    width: '92%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderRadius: 10,
    backgroundColor: theme.colors.TEST_CARD_BUTTOM_BG,
    padding: 10,
    margin: 10,
    alignSelf: 'center',
    elevation: 2,
  },
  cancel_text: {
    ...theme.viewStyles.text('M', 12, '#01475b', 0.6, 16),
    width: '90%',
    marginHorizontal: 5,
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
  loadMoreView: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingBottom: 10,
  },
  textLoadMore: {
    ...theme.viewStyles.text('SB', 15, '#FC9916'),
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  downArrow: {
    alignSelf: 'flex-end',
  },
  textHeadingModal: {
    ...theme.viewStyles.text('SB', 17, '#02475b'),
    marginBottom: 20,
  },
  textPaitent: {
    ...theme.viewStyles.text('SB', 14, '#02475b'),
    // marginBottom: 5,
  },
  textSelectedPatient: {
    ...theme.viewStyles.text('M', 14, colors.LIGHT_BLUE, 1),
    width: '85%',
  },
  activeFilterView: {
    ...theme.viewStyles.text('SB', 14, '#02475b'),
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    width: '55%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
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
    height: screenHeight / 2,
    width: '100%',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  patientCard: {
    backgroundColor: colors.DEFAULT_BACKGROUND_COLOR,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 30,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  patientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 2,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 15,
    margin: 5,
  },
  patientText: {
    ...theme.viewStyles.text('R', isSmallDevice ? 15 : 16, '#00B38E'),
    width: isSmallDevice ? '72%' : '78%',
  },
  patientSubText: {
    ...theme.viewStyles.text('R', isSmallDevice ? 11 : 12, '#00B38E'),
  },
  patientOverlayTitleStyle: { ...theme.viewStyles.text('B', 16, colors.SHERPA_BLUE, 1, 24) },
  marginStyle: {
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 8,
  },
  itemsView: {
    backgroundColor: colors.DEFAULT_BACKGROUND_COLOR,
    margin: 8,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.DEFAULT_BACKGROUND_COLOR,
  },
  moreText: {
    ...theme.viewStyles.text('SB', 13, theme.colors.APP_YELLOW, 1, 18),
  },
  bulletStyle: {
    color: '#007C9D',
    fontSize: 5,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  testName: {
    ...theme.viewStyles.text('M', isSmallDevice ? 11.5 : 12, '#007C9D', 1, 17),
    letterSpacing: 0,
    marginBottom: '1.5%',
    marginHorizontal: '3%',
    maxWidth: '80%',
  },
  orangeText: {
    ...theme.viewStyles.text('SB', 13, '#EF7A0E', 1, 18),
    marginHorizontal: 6,
  },
  multiUhidView: {
    backgroundColor: '#F7F8F5',
    padding: 10,
    borderRadius: 10,
    elevation: 2,
    flexGrow: 1,
    maxHeight: screenHeight / 1.8,
    paddingBottom: 0,
  },
  topMultiUhidView: { flexDirection: 'row', alignItems: 'center' },
  alertIconStyle: { height: 27, width: 27, resizeMode: 'contain' },
  muhidSubheading: { ...theme.viewStyles.text('R', 12, colors.SHERPA_BLUE, 1, 18) },
  patientNameText: { ...theme.viewStyles.text('SB', 12, colors.SHERPA_BLUE, 1, 18) },
  proceedToCancelTouch: {
    height: 40,
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpTextStyle: { ...theme.viewStyles.text('B', 13, colors.APP_YELLOW, 1, 24) },
  ctaTouch: {
    padding: 5,
    marginLeft: 16,
    borderRadius: 8,
    marginBottom: 6,
  },
  cancelCTATouch: {
    width: '60%',
    height: 40,
    justifyContent: 'center',
  },
});
