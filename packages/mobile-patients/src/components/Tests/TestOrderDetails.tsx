import { TestOrderSummaryView } from '@aph/mobile-patients/src/components/TestOrderSummaryView';
import {
  SlotInfo,
  TestScheduleOverlay,
  TestScheduleType,
} from '@aph/mobile-patients/src/components/Tests/TestScheduleOverlay';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { More } from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { OrderProgressCard } from '@aph/mobile-patients/src/components/ui/OrderProgressCard';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
// import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import {
  CANCEL_DIAGNOSTIC_ORDER,
  GET_DIAGNOSTIC_ORDER_LIST,
  GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
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
import { g, handleGraphQlError } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { OrderCancelOverlay } from './OrderCancelOverlay';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

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
}
{
}

export const TestOrderDetails: React.FC<TestOrderDetailsProps> = (props) => {
  const orderId = props.navigation.getParam('orderId');
  const goToHomeOnBack = props.navigation.getParam('goToHomeOnBack');
  const showOrderSummaryTab = props.navigation.getParam('showOrderSummaryTab');
  const setOrders = props.navigation.getParam('setOrders');
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const [selectedTab, setSelectedTab] = useState<string>(
    // showOrderSummaryTab ? string.orders.viewBill : string.orders.trackOrder
    string.orders.viewBill
  );
  const [apiLoading, setApiLoading] = useState(false);
  const [isCancelVisible, setCancelVisible] = useState(false);
  const [isRescheduleVisible, setRescheduleVisible] = useState(false);
  const { getPatientApiCall } = useAuth();

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

  const { data, loading, refetch } = useQuery<
    getDiagnosticOrderDetails,
    getDiagnosticOrderDetailsVariables
  >(GET_DIAGNOSTIC_ORDER_LIST_DETAILS, {
    variables: { diagnosticOrderId: orderId },
  });
  const order = g(data, 'getDiagnosticOrderDetails', 'ordersList');
  console.log({ order });

  const orderDetails = ((!loading && order) ||
    {}) as getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList;

  // useEffect(() => {
  //   setRescheduleVisible(true);
  // }, []);

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

  const getFormattedDate = (time: string) => {
    return moment(time).format('D MMM YYYY');
  };

  const getFormattedTime = (time: string) => {
    return moment(time).format('hh:mm A');
  };

  const renderOrderHistory = () => {
    return (
      <View>
        <View style={{ margin: 20 }}>
          <OrderProgressCard
            style={{ marginBottom: 8 }}
            // key={index}
            description={''}
            status={orderDetails.orderStatus && orderDetails.orderStatus.replace('_', ' ')}
            date={getFormattedDate(orderDetails.createdDate)}
            time={getFormattedTime(orderDetails.createdDate)}
            isStatusDone={true}
            nextItemStatus={'NOT_EXIST'}
          />
        </View>
      </View>
    );
  };

  const renderCancelOrderOverlay = () => {
    return (
      isCancelVisible && (
        <OrderCancelOverlay
          heading="Cancel Order"
          onClose={() => setCancelVisible(false)}
          isVisible={isCancelVisible}
          loading={apiLoading}
          options={cancelOptions}
          onSubmit={onSubmitCancelOrder}
        />
      )
    );
  };

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
    setCancelVisible(false);
    setRescheduleVisible(false);
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

  const onSubmitCancelOrder = (reason: string, comment?: string) => {
    // TODO: call api and change visibility, refetch
    setApiLoading(true);
    const api = client.mutate<cancelDiagnosticOrder, cancelDiagnosticOrderVariables>({
      mutation: CANCEL_DIAGNOSTIC_ORDER,
      variables: { diagnosticOrderId: orderDetails.displayId },
    });
    callApiAndRefetchOrderDetails(api);
  };

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

  const renderMoreMenu = () => {
    return (
      <MaterialMenu
        options={['Cancel Order', 'Reschedule Order'].map((item) => ({
          key: item,
          value: item,
        }))}
        menuContainerStyle={{
          alignItems: 'center',
          marginTop: 24,
        }}
        lastContainerStyle={{ borderBottomWidth: 0 }}
        bottomPadding={{ paddingBottom: 0 }}
        itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b') }}
        onPress={({ value }) => {
          if (value === 'Cancel Order') {
            setCancelVisible(true);
          } else if (value === 'Reschedule Order') {
            setRescheduleVisible(true);
          }
        }}
      >
        <More />
      </MaterialMenu>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {renderCancelOrderOverlay()}
      {renderRescheduleOrderOverlay()}
      <SafeAreaView style={theme.viewStyles.container}>
        <View style={styles.headerShadowContainer}>
          <Header
            leftIcon="backArrow"
            title={`ORDER #${orderDetails.displayId || ''}`}
            titleStyle={{ marginHorizontal: 10 }}
            container={{ borderBottomWidth: 0 }}
            // rightComponent={renderMoreMenu()}
            onPressLeftIcon={() => {
              handleBack();
            }}
          />
        </View>
        {/* <TabsComponent
          style={styles.tabsContainer}
          onChange={(title) => {
            setSelectedTab(title);
          }}
          data={[{ title: string.orders.trackOrder }, { title: string.orders.viewBill }]}
          selectedTab={selectedTab}
        /> */}
        <ScrollView bounces={false}>
          {selectedTab == string.orders.trackOrder ? renderOrderHistory() : renderOrderSummary()}
          <NeedHelpAssistant
            containerStyle={{ marginTop: 20, marginBottom: 30 }}
            navigation={props.navigation}
          />
        </ScrollView>
      </SafeAreaView>
      {loading && <Spinner style={{ zIndex: 200 }} />}
    </View>
  );
};
