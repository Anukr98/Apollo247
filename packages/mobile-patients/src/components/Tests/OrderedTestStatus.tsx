import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  GET_DIAGNOSTIC_CANCELLED_ORDER_DETAILS,
  GET_DIAGNOSTIC_ORDER_LIST,
  GET_DIAGNOSTIC_ORDER_STATUS,
  GET_PRISM_AUTH_TOKEN,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getDiagnosticOrdersList,
  getDiagnosticOrdersListVariables,
  getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersList';
import { sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment, { length } from 'moment';
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useApolloClient } from 'react-apollo-hooks';
import _ from 'lodash';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import { NavigationScreenProps, ScrollView, FlatList } from 'react-navigation';
import {
  DIAGNOSTIC_ORDER_STATUS,
  MedicalRecordType,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { TestOrderCard } from '@aph/mobile-patients/src/components/ui/TestOrderCard';
import { g, handleGraphQlError } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { WhatsAppIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppConfig, SequenceForDiagnosticStatus } from '@aph/mobile-patients/src/strings/AppConfig';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  getDiagnosticsOrderStatus,
  getDiagnosticsOrderStatusVariables,
  getDiagnosticsOrderStatus_getDiagnosticsOrderStatus_ordersList,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticsOrderStatus';
import {
  getPackageInclusions,
  getPatientPrismMedicalRecordsApi,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  getDiagnosticCancelledOrderDetails,
  getDiagnosticCancelledOrderDetailsVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticCancelledOrderDetails';
import {
  getPrismAuthToken,
  getPrismAuthTokenVariables,
} from '@aph/mobile-patients/src/graphql/types/getPrismAuthToken';
import { getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults_response } from '../../graphql/types/getPatientPrismMedicalRecords_V2';
const sequenceOfStatus = SequenceForDiagnosticStatus;

export interface TestStatusObject {
  id: string;
  displayId: string;
  slotTimings: string;
  patientName: string;
  showDateTime: string;
  currentStatus: string;
  itemId: string;
  packageId: string | null;
  itemName: string;
  packageName: string;
  statusDate: string;
  testPreparationData: string;
}

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

export interface OrderedTestStatusProps extends NavigationScreenProps {}

export const OrderedTestStatus: React.FC<OrderedTestStatusProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const { loading, setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const [date, setDate] = useState<Date>(new Date());
  const [statusForTest, setStatusForTest] = useState({});

  const orderSelectedId = props.navigation.getParam('orderId');
  const orderSelected = props.navigation.getParam('selectedOrder');
  const [individualTestData, setIndividualTestData] = useState<any>([]);
  const [prismAuthToken, setPrismAuthToken] = useState('');
  const [labResults, setLabResults] = useState<
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults_response | null)[]
    | null
    | undefined
  >([]);

  const { getPatientApiCall } = useAuth();
  const client = useApolloClient();

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
    setLoading!(true);
    if (orderSelected?.orderStatus == DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED) {
      fetchCancelledOrderTest();
    } else {
      fetchOrderStatusForEachTest();
    }
  }, []);

  const calMaxStatus = (statusForTest: any, status: string) => {
    return statusForTest?.find((item: any) => item?.orderStatus == status);
  };

  const fetchOrderStatusForEachTest = async () => {
    setLoading!(true);
    client
      .query<getDiagnosticsOrderStatus, getDiagnosticsOrderStatusVariables>({
        query: GET_DIAGNOSTIC_ORDER_STATUS,
        context: {
          sourceHeaders,
        },
        variables: {
          diagnosticOrderId: orderSelectedId,
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        const _testStatus = g(data, 'getDiagnosticsOrderStatus', 'ordersList') || [];
        getStatusForAllTests(_testStatus);
      })
      .catch((e) => {
        CommonBugFender('OrderedTestStatus_fetchTestStatus', e);
        setLoading!(false);
      });
  };

  const fetchCancelledOrderTest = async () => {
    setLoading!(true);
    client
      .query<getDiagnosticCancelledOrderDetails, getDiagnosticCancelledOrderDetailsVariables>({
        query: GET_DIAGNOSTIC_CANCELLED_ORDER_DETAILS,
        context: {
          sourceHeaders,
        },
        variables: {
          diagnosticOrderId: orderSelectedId,
          patientId: currentPatient?.id,
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        const _testStatus = g(data, 'getDiagnosticCancelledOrderDetails', 'ordersList') || [];
        getStatusForAllTests(_testStatus);
      })
      .catch((e) => {
        CommonBugFender('OrderedTestStatus_fetchTestStatus', e);
        setLoading!(false);
      });
  };

  const getAuthToken = async () => {
    setLoading!(true);
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
    getPatientPrismMedicalRecordsApi(client, currentPatient?.id, [MedicalRecordType.TEST_REPORT])
      .then((data: any) => {
        console.log({ data });
        const labResultsData = g(
          data,
          'getPatientPrismMedicalRecords_V2',
          'labResults',
          'response'
        );
        setLabResults(labResultsData);
        // put a check to filter based on identifier
        props.navigation.navigate(AppRoutes.HealthRecordDetails, {
          data: labResultsData[1],
          labResults: true,
        });
      })
      .catch((error) => {
        CommonBugFender('OrderedTestStatus_fetchTestReportsData', error);
        console.log('Error occured fetchTestReportsResult', { error });
        currentPatient && handleGraphQlError(error);
      })
      .finally(() => setLoading!(false));
  }, []);

  const loadPackageDetails = async (
    packageId: string,
    index: number,
    date: string,
    time: string,
    objArray: any,
    itemIdObject: any,
    key: string
  ) => {
    try {
      setLoading!(true);
      const arrayOfId = packageId.length == 1 ? [Number(packageId)] : packageId;
      const res: any = await getPackageInclusions(client, arrayOfId);
      if (res) {
        const data = g(res, 'data', 'getInclusionsOfMultipleItems', 'inclusions');
        console.log({ data });
        data?.map((test: any) => {
          //call getPackage
          objArray.push({
            id: orderSelected?.diagnosticOrderLineItems[index]?.diagnostics?.id,
            displayId: orderSelected?.displayId,
            slotTimings: time,
            patientName: currentPatient?.firstName,
            showDateTime: date,
            itemId: test?.itemId,
            // currentStatus: orderSelected.maxStatus,
            currentStatus: DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED,
            packageId: orderSelected?.diagnosticOrderLineItems?.[index]?.itemId,
            packageName: orderSelected?.diagnosticOrderLineItems?.[index]?.itemName,
            itemName: test?.name,
            statusDate: itemIdObject?.[key][0]?.statusDate,
            testPreparationData:
              test?.testPreparationData! ||
              orderSelected?.diagnosticOrderLineItems?.[index]?.itemObj?.testPreparationData, //need to check
          });
        });
        setLoading!(false);
        return objArray;
      } else {
        setLoading!(false);
      }
    } catch (e) {
      CommonBugFender('TestDetails', e);
      setLoading!(false);
      console.log('getPackageData Error \n', { e });
    }
  };

  const getStatusForAllTests = (
    data: getDiagnosticsOrderStatus_getDiagnosticsOrderStatus_ordersList | any
  ) => {
    const testStatusData = createObject(data);

    // setIndividualTestData(testStatusData);
  };

  const createObject = (
    statusData: getDiagnosticsOrderStatus_getDiagnosticsOrderStatus_ordersList
  ) => {
    const itemIdObject = _.groupBy(statusData, 'itemId');
    setStatusForTest(itemIdObject);

    let objArray: TestStatusObject[] = [];
    const lengthOfItems = Object.keys(itemIdObject)?.length;
    Object.keys(itemIdObject).forEach(async (key) => {
      /**
       * key is null for all pickup requested + all the packages are pickup requested
       * we don't have the itemId,packageId so creating the object with the data from
       *  all the tests/packages (searchDiagnosticsById + getPackages).
       */
      const getUTCDateTime = orderSelected?.slotDateTimeInUTC;
      const dt = moment(
        getUTCDateTime != null ? getUTCDateTime : orderSelected?.diagnosticDate!
      ).format(`D MMM YYYY`);
      const tm =
        getUTCDateTime != null
          ? moment(getUTCDateTime).format('hh:mm A')
          : orderSelected?.slotTimings;

      if (key == 'null' && lengthOfItems == 1) {
        for (let index = 0; index < orderSelected?.diagnosticOrderLineItems?.length; index++) {
          let inclusionVal =
            orderSelected?.diagnosticOrderLineItems?.[index]?.itemObj?.inclusions == null
              ? [orderSelected?.diagnosticOrderLineItems?.[index]?.itemId]
              : orderSelected?.diagnosticOrderLineItems?.[index]?.itemObj?.inclusions!;
          const createdObject = await loadPackageDetails(
            inclusionVal,
            index,
            dt,
            tm,
            objArray,
            itemIdObject,
            key
          );
          setIndividualTestData(createdObject);
        }
      } else {
        /**
         * if any of the status of the test/package is more than requested then we get itemId & packageId
         *  and show the packages/items present from the api.
         */
        /**
         * if status is more than pickup requested and only one is present,
         * then don't show the null box
         */
        //to handle a null case to stop showing the extra box
        if (key == 'null') {
        } else {
          const getSelectedObj =
            key != 'null' &&
            orderSelected.diagnosticOrderLineItems.filter(
              (item: any) => item.itemId.toString() == key
            );
          let sortedSelectedObj: any;
          //when backend will be fixed use this logic.
          // sortedSelectedObj =
          //   key != null &&
          //   itemIdObject[key].sort(function(a: any, b: any) {
          //     return new Date(b.statusDate).valueOf() - new Date(a.statusDate).valueOf();
          //   });

          if (
            key != null &&
            calMaxStatus(itemIdObject[key], DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED)
          ) {
            sortedSelectedObj = calMaxStatus(
              itemIdObject[key],
              DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED
            );
          } else if (
            key != null &&
            calMaxStatus(itemIdObject[key], DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB)
          ) {
            sortedSelectedObj = calMaxStatus(
              itemIdObject[key],
              DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB
            );
          } else if (
            key != null &&
            calMaxStatus(itemIdObject[key], DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED)
          ) {
            sortedSelectedObj = calMaxStatus(
              itemIdObject[key],
              DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED
            );
          } else {
            sortedSelectedObj =
              key != null &&
              calMaxStatus(itemIdObject[key], DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED);
          }

          objArray.push({
            id: getSelectedObj?.id! || orderSelectedId,
            displayId: orderSelected?.displayId!,
            slotTimings: tm,
            patientName: currentPatient?.firstName,
            showDateTime: dt,
            itemId: key,
            currentStatus: sortedSelectedObj?.orderStatus,
            packageId: sortedSelectedObj?.packageId,
            itemName: sortedSelectedObj?.itemName,
            packageName: sortedSelectedObj?.packageName,
            statusDate: sortedSelectedObj?.statusDate,
            testPreparationData: '',
          });
        }
        setLoading!(false);
        setIndividualTestData(objArray);
      }
    });
  };

  const getSlotStartTime = (slot: string /*07:00-07:30 */) => {
    return moment((slot.split('-')[0] || '').trim(), 'hh:mm').format('hh:mm A');
  };

  const getFormattedTime = (time: string) => {
    return moment(time).format('hh:mm A');
  };

  const renderOrder = (order: any, index: number) => {
    console.log({ order });

    const isHomeVisit = !!order?.slotTimings;

    const dt = moment(order?.statusDate).format(`D MMM YYYY`); //status date
    const tm = getSlotStartTime(order?.statusDate); //status time

    //here schedule for date should be time when you selected slot for pickup requested.
    const getScheduleDate = moment(order?.showDateTime).format(`D MMM YYYY`);
    const getScheduleTime = order?.slotTimings;
    const scheduledDtTm = `${getScheduleDate}${isHomeVisit ? `, ${getScheduleTime}` : ''}`;

    const statusTime = getFormattedTime(order?.statusDate);
    const dtTm = `${dt}${isHomeVisit ? `, ${statusTime}` : ''}`;
    const currentStatus = order?.currentStatus;
    return (
      <TestOrderCard
        key={`${order?.id}`}
        orderId={`${order?.displayId}`}
        showStatus={true}
        patientName={order?.patientName}
        isComingFrom={'individualTest'}
        showDateTime={true}
        showRescheduleCancel={false}
        isTypeOfPackage={order?.packageName != null ? true : false}
        ordersData={order}
        dateTime={
          order.currentStatus == DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED
            ? `Completed On: ${dtTm}`
            : order?.currentStatus == DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED
            ? orderSelected?.isRescheduled == true
              ? `Rescheduled For: ${scheduledDtTm}`
              : `Scheduled For: ${scheduledDtTm}`
            : `Scheduled For: ${dtTm}`
        }
        statusDesc={isHomeVisit ? 'Home Visit' : 'Clinic Visit'}
        isCancelled={currentStatus == DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED}
        showViewReport={currentStatus == DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED}
        onPress={() => {
          props.navigation.navigate(AppRoutes.TestOrderDetails, {
            orderId: orderSelected?.id,
            setOrders: (orders: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList[]) =>
              setOrders(orders),
            refetch: refetch,
            selectedTest: order,
            selectedOrder: orderSelected,
            individualTestStatus: statusForTest,
            comingFrom: AppRoutes.YourOrdersTest,
          });
        }}
        status={currentStatus}
        statusText={mapStatusWithText(currentStatus)}
        style={[
          { marginHorizontal: 20 },
          index < individualTestData.length - 1 ? { marginBottom: 8 } : { marginBottom: 20 },
          index == 0 ? { marginTop: 20 } : {},
        ]}
        showTestPreparation={order?.testPreparationData != ''} //call the service
        onOptionPress={() => {
          props.navigation.navigate(AppRoutes.TestOrderDetails, {
            orderId: orderSelected!.id,
            setOrders: (orders: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList[]) =>
              setOrders(orders),
            refetch: refetch,
            selectedTest: order,
            selectedOrder: orderSelected,
            individualTestStatus: statusForTest,
            comingFrom: AppRoutes.YourOrdersTest,
          });
        }}
        onPressViewReport={() => _navigateToPHR()}
      />
    );
  };

  const _navigateToPHR = () => {
    const visitId = orderSelected?.visitNo;
    if (visitId) {
      getAuthToken();
    } else {
      renderReportError(string.diagnostics.unableToOpenReport);
    }
  };

  const renderReportError = (message: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
    });
  };

  const mapStatusWithText = (val: string) => {
    return val?.replace(/[_]/g, ' ');
  };

  const renderOrders = () => {
    console.log({ individualTestData });
    return (
      <FlatList
        bounces={false}
        data={individualTestData}
        renderItem={({ item, index }) => renderOrder(item, index)}
        ListEmptyComponent={renderNoOrders()}
      />
    );
  };

  const renderNoOrders = () => {
    if (!loading && !error) {
      return (
        <Card
          cardContainer={[styles.noDataCard]}
          heading={'Uh oh! :('}
          description={'We are unable to fetch details.. Please try again later'}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        ></Card>
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
   * hide for the time being
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
        </ScrollView>
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};
