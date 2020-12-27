import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import {
  DiagnosticsCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
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
} from '../../graphql/types/getDiagnosticSlotsWithAreaID';
import {
  rescheduleDiagnosticsOrder,
  rescheduleDiagnosticsOrderVariables,
} from '../../graphql/types/rescheduleDiagnosticsOrder';
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
  const { getPatientApiCall } = useAuth();
  const client = useApolloClient();

  /**
   * fetching the list of orders
   */
  const [orders, setOrders] = useState<
    getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList[]
  >(props.navigation.getParam('orders'));
  const refetch =
    props.navigation.getParam('refetch') ||
    useQuery<getDiagnosticOrdersList, getDiagnosticOrdersListVariables>(GET_DIAGNOSTIC_ORDER_LIST, {
      context: {
        sourceHeaders,
      },
      variables: {
        patientId: currentPatient && currentPatient.id,
      },
      fetchPolicy: 'cache-first',
    }).refetch;
  const error = props.navigation.getParam('error');

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    setLoading!(true);
    refetch()
      .then((data: any) => {
        const _orders = g(data, 'data', 'getDiagnosticOrdersList', 'ordersList') || [];
        setOrders(_orders);
        setLoading!(false);
      })
      .catch((e: any) => {
        setLoading!(false);
        CommonBugFender('YourOrdersTest_refetch', e);
      });
  }, []);

  useEffect(() => {
    if (orders) {
      orders.map((order) => {
        if (
          order.orderStatus != DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED ||
          order?.diagnosticOrderLineItems?.length! > 0
        ) {
          fetchOrderStatusForEachTest(order!.id!, order);
          // fetchTestDetails(order!.id, order);
        }
      });
    }
  }, [orders]);

  const fetchTestDetails = async (
    id: string,
    order: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList
  ) => {
    setLoading!(true);
    order?.diagnosticOrderLineItems!.map((items: any) => {
      const itemType = items?.diagnostics?.itemType!;
      const itemId = items?.diagnostics?.itemId!;
      if (itemType == 'PACKAGE') {
        loadPackageDetails(itemId!, items!);
      } else {
        loadTestDetails(itemId!, items!);
      }
    });
  };

  const loadTestDetails = async (itemId: string, item: any) => {
    try {
      const {
        data: { searchDiagnosticsById },
      } = await client.query<searchDiagnosticsById, searchDiagnosticsByIdVariables>({
        query: SEARCH_DIAGNOSTICS_BY_ID,
        context: {
          sourceHeaders,
        },
        variables: {
          itemIds: itemId!.toString(),
        },
        fetchPolicy: 'no-cache',
      });
      const {
        rate,
        gender,
        itemName,
        collectionType,
        fromAgeInDays,
        toAgeInDays,
        testPreparationData,
      } = g(searchDiagnosticsById, 'diagnostics', '0' as any)!;
      const partialTestDetails = {
        Rate: rate,
        Gender: gender,
        ItemID: `${itemId}`,
        ItemName: itemName,
        collectionType: collectionType!,
        FromAgeInDays: fromAgeInDays,
        ToAgeInDays: toAgeInDays,
        preparation: testPreparationData,
      };

      try {
        const arrayOfId = [Number(itemId)];
        const res: any = await getPackageInclusions(client, arrayOfId);
        if (res) {
          const data = g(res, 'data', 'getInclusionsOfMultipleItems', 'inclusions');
          item.diagnostics.partialTestDetails = partialTestDetails;
          item.diagnostics.PackageInclussion = data || [];
        }
      } catch (e) {
        CommonBugFender('Your test details', e);
        setLoading!(false);
      }
    } catch (error) {
      // setsearchSate('fail');
      setLoading!(false);
      console.log('error in loading test details..' + error);
    }
  };

  const loadPackageDetails = async (packageId: string, items: any) => {
    try {
      const arrayOfId = [Number(packageId)];
      const res: any = await getPackageInclusions(client, arrayOfId);
      if (res) {
        const data = g(res, 'data', 'getInclusionsOfMultipleItems', 'inclusions');
        items.diagnostics.PackageInclussion! = data || [];
        setLoading!(false);
      } else {
        setLoading!(false);
      }
    } catch (e) {
      CommonBugFender('TestDetails', e);
      setLoading!(false);
      console.log('getPackageData Error \n', { e });
    }
  };

  const fetchOrderStatusForEachTest = async (id: string, order: DiagnosticsOrderList) => {
    setLoading!(true);
    client
      .query<getDiagnosticsOrderStatus, getDiagnosticsOrderStatusVariables>({
        query: GET_DIAGNOSTIC_ORDER_STATUS,
        context: {
          sourceHeaders,
        },
        variables: {
          diagnosticOrderId: id,
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        const _testStatus = g(data, 'getDiagnosticsOrderStatus', 'ordersList') || [];
        let maxStatus;
        if (_testStatus.length == 1) {
          order.maxStatus = _testStatus[0]?.orderStatus;
          order.maxTime = _testStatus[0]?.statusDate;
        } else {
          if (calMaxStatus(_testStatus, DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED)) {
            maxStatus = DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED;
          } else if (calMaxStatus(_testStatus, DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB)) {
            maxStatus = DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB;
          } else if (calMaxStatus(_testStatus, DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED)) {
            maxStatus = DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED;
          } else {
            maxStatus = DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED;
          }
          order.maxStatus = maxStatus;
        }

        setLoading!(false);
      })
      .catch((e) => {
        CommonBugFender('Tests_', e);
        setLoading!(false);
      });
  };

  const calMaxStatus = (testStatus: any, status: string) => {
    return testStatus.some((item: any) => item?.orderStatus == status);
  };

  const setInitialState = () => {
    setLoading!(false);
    // setCancelPopUp(false);
    // setReschedulePopUp(false);
  };

  /**
   *
   * code for reschedule
   */

  const checkSlotSelection = () => {
    client
      .query<getDiagnosticSlotsWithAreaID, getDiagnosticSlotsWithAreaIDVariables>({
        query: GET_DIAGNOSTIC_SLOTS_WITH_AREA_ID,
        fetchPolicy: 'no-cache',
        variables: {
          selectedDate: moment(date).format('YYYY-MM-DD'), //whether current date or the one which we gt fron diagnostiv api
          areaID: 62142,
        },
      })
      .then(({ data }) => {
        const diagnosticSlots = g(data, 'getDiagnosticSlotsWithAreaID', 'slots') || [];
        console.log('ORIGINAL DIAGNOSTIC SLOTS', { diagnosticSlots });
        const slotsArray: TestSlot[] = [];
        diagnosticSlots!.forEach((item) => {
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

        console.log('ARRAY OF SLOTS', { slotsArray });

        setSlots(slotsArray);
        uniqueSlots.length &&
          setselectedTimeSlot(
            getTestSlotDetailsByTime(slotsArray, uniqueSlots[0].startTime!, uniqueSlots[0].endTime!)
          );
        setDisplaySchedule(true); //show slot popup
      })
      .catch((e) => {
        CommonBugFender('TestsCart_checkServicability', e);
        console.log('Error occured', { e });
        setDiagnosticSlot && setDiagnosticSlot(null);
        setselectedTimeSlot(undefined);
        const noHubSlots = g(e, 'graphQLErrors', '0', 'message') === 'NO_HUB_SLOTS';

        if (noHubSlots) {
          showAphAlert!({
            title: 'Uh oh.. :(',
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
            title: 'Uh oh.. :(',
            description:
              'Sorry! We’re working hard to get to this area! In the meantime, you can either visit clinic near your location or change the address.',
          });
        }
      });
  };

  const getSlotStartTime = (slot: string /*07:00-07:30 */) => {
    return moment((slot.split('-')[0] || '').trim(), 'hh:mm').format('hh:mm A');
  };

  const onPressTestReschedule = (item: any) => {
    setSelectedOrderId(item.id);
    setSelectedOrder(item);
    setReschedulePopUp(true);
  };

  const renderReschedulePopUp = () => {
    const selectedOrderRescheduleCount = selectedOrder?.rescheduleCount;
    console.log({ selectedOrderRescheduleCount });
    return (
      <AlertPopup
        visible={showReschedulePopUp}
        onDismiss={() => setReschedulePopUp(false)}
        title={`You can reschedule to a maximum of 3 times. If you click ok, you will have 2 reschedule attempt(s) left.`}
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

  const renderRescheduleReasonPopUp = () => {
    //show skip option
    return showRescheduleReasonPopUp ? (
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
          onPressSubmit={(reason, comment) => onSubmitRescheduleRequest(reason, comment)}
          cancelVisible={showRescheduleReasonPopUp}
          headingText={'Reschedule Order'}
          reasonForCancelText={'Why are you rescheduling this order?'}
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
    setLoading!(true);
    setSelectedReasonForReschedule(reason);
    setCommentForReschedule(comment);
    setRescheduleReasonPopUp(false);

    checkSlotSelection();
  };

  const hideRescheduleReasonOverlay = () => {
    setRescheduleReasonPopUp(false);
  };

  const rescheduleOrder = (rescheduleDiagnosticsInput: RescheduleDiagnosticsInput) =>
    client.mutate<rescheduleDiagnosticsOrder, rescheduleDiagnosticsOrderVariables>({
      mutation: RESCHEDULE_DIAGNOSTIC_ORDER,
      variables: { rescheduleDiagnosticsInput: rescheduleDiagnosticsInput },
      fetchPolicy: 'no-cache',
    });

  const onReschduleDoneSelected = () => {
    setLoading!(true);
    const formattedDate = moment(diagnosticSlot?.date).format('YYYY-MM-DD');
    console.log({ diagnosticSlot });

    const dateTimeInUTC = moment(formattedDate + ' ' + diagnosticSlot?.slotStartTime).toISOString();
    const rescheduleDiagnosticsInput: RescheduleDiagnosticsInput = {
      comment: commentForReschedule,
      date: formattedDate,
      dateTimeInUTC: dateTimeInUTC,
      orderId: String(selectedOrderId),
      patientId: g(currentPatient, 'id'),
      reason: selectedReasonForReschedule,
      slotId: diagnosticSlot?.employeeSlotId?.toString() || '0',
    };

    console.log({ rescheduleDiagnosticsInput });
    rescheduleOrder(rescheduleDiagnosticsInput)
      .then((data) => {
        console.log({ data });
        const rescheduleResponse = g(data, 'data', 'rescheduleDiagnosticsOrder');
        if (rescheduleResponse?.status == 'true' && rescheduleResponse.rescheduleCount <= 3) {
          refetch()
            .then((data: any) => {
              const _orders = g(data, 'data', 'getDiagnosticOrdersList', 'ordersList') || [];
              setOrders(_orders);
              setLoading!(false);
            })
            .catch((e: any) => {
              CommonBugFender('TestOrderDetails_refetch_callApiAndRefetchOrderDetails', e);
              setInitialState();
              // showAphAlert!({
              //   unDismissable: true,
              //   title: 'Uh oh! :(',
              //   description: 'We are not servicing in this area.',
              // });
            });
        } else {
          showAphAlert!({
            unDismissable: true,
            title: 'Uh oh! :(',
            description: rescheduleResponse?.message,
          });
        }
      })
      .catch((error) => {
        // DIAGNOSTIC_CANCELLATION_ALLOWED_BEFORE_IN_HOURS
        console.log('error' + error);
        CommonBugFender('TestOrderDetails_callApiAndRefetchOrderDetails', error);
        handleGraphQlError(error);
        setLoading!(false);
      })
      .finally(() => {
        setLoading!(false);
      });
  };

  const renderRescheduleOrderOverlay = () => {
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
          zipCode={500030}
          slotInfo={selectedTimeSlot}
          onSchedule={(date: Date, slotInfo: TestSlot) => {
            console.log({ date });
            console.log({ slotInfo });
            setDate(date);
            setselectedTimeSlot(slotInfo);
            setDiagnosticSlot!({
              slotStartTime: slotInfo.slotInfo.startTime!,
              slotEndTime: slotInfo.slotInfo.endTime!,
              date: date.getTime(),
              employeeSlotId: slotInfo.slotInfo.slot!,
              diagnosticBranchCode: slotInfo.diagnosticBranchCode,
              diagnosticEmployeeCode: slotInfo.employeeCode,
              city: '', // not using city from this in order place API
            });
            console.log({ diagnosticSlot });
            setDisplaySchedule(false);
            //call rechedule api
            onReschduleDoneSelected();
          }}
        />
      </View>
    );
  };

  const callApiAndRefetchOrderDetails = (func: Promise<any>) => {
    func
      .then(() => {
        refetch()
          .then(() => {
            setInitialState();
          })
          .catch((e: any) => {
            CommonBugFender('TestOrderDetails_refetch_callApiAndRefetchOrderDetails', e);
            setInitialState();
          });
      })
      .catch((e) => {
        CommonBugFender('TestOrderDetails_callApiAndRefetchOrderDetails', e);
        console.log({ e });
        handleGraphQlError(e);
        setLoading!(false);
      });
  };

  /**
   *
   * order cancellation
   */

  const cancelOrder = (cancellationDiagnosticsInput: CancellationDiagnosticsInput) =>
    client.mutate<cancelDiagnosticsOrder, cancelDiagnosticsOrderVariables>({
      mutation: CANCEL_DIAGNOSTIC_ORDER,
      variables: { cancellationDiagnosticsInput: cancellationDiagnosticsInput },
      fetchPolicy: 'no-cache',
    });

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
          refetch()
            .then((data: any) => {
              const _orders = g(data, 'data', 'getDiagnosticOrdersList', 'ordersList') || [];
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
        console.log('error' + error);
        CommonBugFender('TestOrderDetails_callApiAndRefetchOrderDetails', error);
        handleGraphQlError(error);
        setLoading!(false);
      })
      .finally(() => {
        setLoading!(false);
        console.log('finally mein');
      });
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

  const checkIfPreTestingExists = (
    order: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList
  ) => {
    if (order != null) {
      const filterPreTestingData = order?.diagnosticOrderLineItems?.filter(
        (items) => items?.diagnostics?.testPreparationData != ''
      );
      return filterPreTestingData?.length == 0 ? false : true;
    }
    return false;
  };

  const renderOrder = (order: DiagnosticsOrderList, index: number) => {
    if (
      order.orderStatus == DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED ||
      order?.diagnosticOrderLineItems?.length == 0
    ) {
      return;
    }
    const isHomeVisit = !!order.slotTimings;
    const dt = moment(order?.diagnosticDate).format(`D MMM YYYY`);
    const tm = getSlotStartTime(order?.slotTimings);
    const dtTm = `${dt}${isHomeVisit ? `, ${tm}` : ''}`;
    // const currentStatus = order.orderStatus;
    const currentStatus = order.maxStatus! ? order.maxStatus! : order.orderStatus;
    const patientName = g(currentPatient, 'firstName'); //check for only firstName
    //create an interface with new additions in the object. or copy it and then manipulate
    const isSampleCollected = order?.maxStatus!
      ? sequenceOfStatus.indexOf(order?.maxStatus!) >=
        sequenceOfStatus.indexOf(DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED)
      : false;

    const showPreTesting = isSampleCollected ? false : checkIfPreTestingExists(order);
    const getStartTime = order?.slotTimings.split('-')[0];
    //don't show reschedule cancel option if diagnostic date is same and slot time within 2 hrs of current time
    const showCancelReschdule =
      order?.diagnosticDate == moment().format('YYYY-MM-DD') && getStartTime;

    return (
      <TestOrderCard
        key={`${order.id}`}
        orderId={`${order.displayId}`}
        showStatus={false}
        patientName={patientName}
        isComingFrom={'individualOrders'}
        showDateTime={false}
        showRescheduleCancel={
          !isSampleCollected && order.orderStatus != DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED
        }
        ordersData={order?.diagnosticOrderLineItems!}
        dateTime={`Scheduled For: ${dtTm}`}
        statusDesc={isHomeVisit ? 'Home Visit' : 'Clinic Visit'}
        isCancelled={currentStatus == DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED}
        showViewReport={isSampleCollected}
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

  const _navigateToYourTestDetails = (order: any) => {
    props.navigation.navigate(AppRoutes.YourTestDetails, {
      orderId: order!.id,
      selectedOrder: order,
      setOrders: (orders: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList[]) =>
        setOrders(orders),
      refetch: refetch,
    });
  };

  const _navigateToPHR = () => {
    props.navigation.navigate(AppRoutes.HealthRecordsHome);
  };

  const mapStatusWithText = (val: string) => {
    return val.replace(/[_]/g, ' ');
  };

  const [scrollOffSet, setScrollOffSet] = useState<number>(0);
  const [show, setShow] = useState<boolean>(true);

  const onScrolling = (offSet: number) => {
    if (scrollOffSet > offSet) {
      if (!show) {
        setShow(true);
      }
    } else {
      setShow(false);
    }
    if (offSet <= 0) {
      setShow(true);
    }
    setScrollOffSet(offSet);
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

  /**
   * whatsapp icon (should be removed for the time being)
   */
  const renderChatWithUs = () => {
    return (
      <View style={{ justifyContent: 'center', alignSelf: 'center' }}>
        <View style={styles.chatWithUsView}>
          <TouchableOpacity
            style={styles.chatWithUsTouch}
            onPress={() => {
              Linking.openURL(
                AppConfig.Configuration.MED_ORDERS_CUSTOMER_CARE_WHATSAPP_LINK
              ).catch((err) => CommonBugFender(`${AppRoutes.YourOrdersTest}_ChatWithUs`, err));
            }}
          >
            <WhatsAppIcon style={styles.whatsappIconStyle} />
            <Text style={styles.chatWithUsText}>{string.OrderSummery.chatWithUs}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: '34%' }}>
          <Text
            style={{
              textAlign: 'center',
              ...theme.fonts.IBMPlexSansRegular(13),
              color: colors.SHERPA_BLUE,
            }}
          >
            {string.reachUsOut}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {showCancelReasonPopUp && renderCancelReasonPopUp()}
      {showRescheduleReasonPopUp && renderRescheduleReasonPopUp()}
      {showDisplaySchedule && renderRescheduleOrderOverlay()}
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          title={string.orders.urOrders}
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView
          bounces={false}
          onScroll={(i) => onScrolling(i.nativeEvent.contentOffset.y)}
          scrollEventThrottle={1}
        >
          {renderError()}
          {renderOrders()}
          {/* {!loading && !error && renderChatWithUs()} */}
          {renderCancelPopUp()}
          {renderReschedulePopUp()}
        </ScrollView>
        {!loading && <ScrollableFooter show={show} />}
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};
