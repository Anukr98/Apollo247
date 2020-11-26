import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  GET_DIAGNOSTIC_ORDER_LIST,
  GET_DIAGNOSTIC_ORDER_STATUS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getDiagnosticOrdersList,
  getDiagnosticOrdersListVariables,
  getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersList';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment, { length } from 'moment';
import React, { useState, useEffect } from 'react';
import { useQuery, useApolloClient } from 'react-apollo-hooks';
import _ from 'lodash';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import { NavigationScreenProps, ScrollView, FlatList } from 'react-navigation';
import { DIAGNOSTIC_ORDER_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
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
import { getPackageData } from '@aph/mobile-patients/src/helpers/apiCalls';
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

export interface YourTestDetailsProps extends NavigationScreenProps {}

export const YourTestDetails: React.FC<YourTestDetailsProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const { loading, setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const [date, setDate] = useState<Date>(new Date());
  const [statusForTest, setStatusForTest] = useState({});

  const [apiLoading, setApiLoading] = useState(false);
  const orderSelectedId = props.navigation.getParam('orderId');
  const orderSelected = props.navigation.getParam('selectedOrder');
  const [individualTestData, setIndividualTestData] = useState([]);

  const { getPatientApiCall } = useAuth();
  const client = useApolloClient();

  const [orders, setOrders] = useState<
    getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList[]
  >(props.navigation.getParam('orders'));

  const refetch =
    props.navigation.getParam('refetch') ||
    useQuery<getDiagnosticOrdersList, getDiagnosticOrdersListVariables>(GET_DIAGNOSTIC_ORDER_LIST, {
      variables: {
        patientId: currentPatient && currentPatient.id,
      },
      fetchPolicy: 'cache-first',
    }).refetch;

  const error = props.navigation.getParam('error');

  useEffect(() => {
    setLoading!(true);
    fetchOrderStatusForEachTest();
  }, []);

  const fetchOrderStatusForEachTest = async () => {
    setLoading!(true);
    client
      .query<getDiagnosticsOrderStatus, getDiagnosticsOrderStatusVariables>({
        query: GET_DIAGNOSTIC_ORDER_STATUS,
        variables: {
          diagnosticOrderId: orderSelectedId,
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        const _testStatus = g(data, 'getDiagnosticsOrderStatus', 'ordersList') || [];
        console.log(_testStatus);
        console.log({ orderSelected });
        getStatusForAllTests(_testStatus);

        //check for the status and for the testItems

        setLoading!(false);
      })
      .catch((e) => {
        console.log('error in fetching the staus for each test' + e);
        CommonBugFender('Tests_', e);
        setLoading!(false);
      });
  };

  const getStatusForAllTests = (
    data: getDiagnosticsOrderStatus_getDiagnosticsOrderStatus_ordersList | any
  ) => {
    const testStatusData = createObject(data);

    setIndividualTestData(testStatusData);
  };

  const createObject = (
    statusData: getDiagnosticsOrderStatus_getDiagnosticsOrderStatus_ordersList
  ) => {
    const itemIdObject = _.groupBy(statusData, 'itemId');
    setStatusForTest(itemIdObject);

    var newArr: TestStatusObject[] = [];

    //create interface
    let objArray: TestStatusObject[] = [];
    const lengthOfItems = Object.keys(itemIdObject).length;
    Object.keys(itemIdObject).forEach((key) => {
      /**
       * key is null for all pickup requested + all the packages are pickup requested
       * we don't have the itemId,packageId so creating the object with the data from
       *  all the tests/packages (searchDiagnosticsById + getPackages).
       */
      console.log('yaahhhh...');
      if (key == 'null' && lengthOfItems == 1) {
        for (let index = 0; index < orderSelected.diagnosticOrderLineItems.length; index++) {
          let inclusionVal =
            orderSelected?.diagnosticOrderLineItems[index]?.diagnostics?.inclusions == null
              ? [{}]
              : orderSelected?.diagnosticOrderLineItems[index]?.diagnostics?.inclusions.length;
          inclusionVal?.map((test: any) => {
            objArray.push({
              id: orderSelected.diagnosticOrderLineItems[index].diagnostics.id,
              displayId: orderSelected!.displayId!,
              slotTimings: orderSelected!.slotTimings,
              patientName: currentPatient.firstName,
              showDateTime: orderSelected!.diagnosticDate,
              itemId: orderSelected.diagnosticOrderLineItems[index].diagnostics.itemId,
              // currentStatus: orderSelected.maxStatus,
              currentStatus: DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED,
              packageId: orderSelected.diagnosticOrderLineItems[index].diagnostics.itemId,
              packageName: orderSelected.diagnosticOrderLineItems[index].diagnostics.itemName,
              itemName: test.TestName,
              statusDate: itemIdObject[key][0].statusDate,
              testPreparationData:
                orderSelected.diagnosticOrderLineItems[index].diagnostics.testPreparationData,
            });
          });
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
          const sortedSelectedObj =
            key != null &&
            itemIdObject[key].sort(function(a, b) {
              return new Date(b.statusDate) - new Date(a.statusDate);
            });

          objArray.push({
            id: getSelectedObj?.id! || orderSelectedId,
            displayId: orderSelected!.displayId!,
            slotTimings: orderSelected!.slotTimings,
            patientName: currentPatient.firstName,
            showDateTime: orderSelected!.diagnosticDate,
            itemId: key,
            currentStatus: sortedSelectedObj[0].orderStatus,
            packageId: sortedSelectedObj[0].packageId,
            itemName: sortedSelectedObj[0].itemName,
            packageName: sortedSelectedObj[0].packageName,
            statusDate: sortedSelectedObj[0].statusDate,
            testPreparationData: '',
          });
        }
      }
    });

    console.log({ objArray });
    return objArray;
  };

  const getSlotStartTime = (slot: string /*07:00-07:30 */) => {
    return moment((slot.split('-')[0] || '').trim(), 'hh:mm').format('hh:mm A');
  };

  const getFormattedTime = (time: string) => {
    return moment(time).format('hh:mm A');
  };

  const renderOrder = (order: TestOrder, index: number) => {
    console.log({ order });
    const isHomeVisit = !!order.slotTimings;
    const dt = moment(order!.statusDate).format(`D MMM YYYY`);
    const tm = getSlotStartTime(order!.statusDate);
    const statusTime = getFormattedTime(order!.statusDate);
    const dtTm = `${dt}${isHomeVisit ? `, ${statusTime}` : ''}`;
    const currentStatus = order.currentStatus;
    return (
      <TestOrderCard
        key={`${order.id}`}
        orderId={`${order.displayId}`}
        showStatus={true}
        patientName={order.patientName}
        isComingFrom={'individualTest'}
        showDateTime={true}
        showRescheduleCancel={false}
        isTypeOfPackage={order.packageName != null ? true : false}
        ordersData={order}
        dateTime={
          order.currentStatus == DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED
            ? `Completed On: ${dtTm}`
            : `Scheduled For: ${dtTm}`
        }
        statusDesc={isHomeVisit ? 'Home Visit' : 'Clinic Visit'}
        isCancelled={currentStatus == DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED}
        showViewReport={false}
        onPress={() => {
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
        status={currentStatus}
        statusText={mapStatusWithText(currentStatus)}
        style={[
          { marginHorizontal: 20 },
          index < individualTestData.length - 1 ? { marginBottom: 8 } : { marginBottom: 20 },
          index == 0 ? { marginTop: 20 } : {},
        ]}
        showTestPreparation={order.testPreparationData != ''} //call the service
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
      />
    );
  };

  const mapStatusWithText = (val: string) => {
    return val.replace(/[_]/g, ' ');
  };

  const renderOrders = () => {
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
