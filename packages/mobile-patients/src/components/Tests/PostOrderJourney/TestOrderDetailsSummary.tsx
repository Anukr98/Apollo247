import { TestOrderSummaryView } from '@aph/mobile-patients/src/components/Tests/components/TestOrderSummaryView';

import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { More } from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { OrderProgressCard } from '@aph/mobile-patients/src/components/ui/OrderProgressCard';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import {
  GET_DIAGNOSTIC_ORDER_LIST,
  GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
  GET_PRISM_AUTH_TOKEN,
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
import { g, handleGraphQlError } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import { BackHandler, SafeAreaView, StyleSheet, View } from 'react-native';
import {
  NavigationActions,
  NavigationScreenProps,
  ScrollView,
  StackActions,
} from 'react-navigation';
import { OrderCancelOverlay } from '@aph/mobile-patients/src/components/Tests/OrderCancelOverlay';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  getPrismAuthToken,
  getPrismAuthTokenVariables,
} from '@aph/mobile-patients/src/graphql/types/getPrismAuthToken';
import { getPatientPrismMedicalRecordsApi } from '@aph/mobile-patients/src/helpers/clientCalls';
import { MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useUIElements } from '../../UIElementsProvider';

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

export interface TestOrderDetailsSummaryProps extends NavigationScreenProps {
  orderId: string;
  showOrderSummaryTab: boolean;
  goToHomeOnBack: boolean;
  comingFrom?: string;
}
{
}

export const TestOrderDetailsSummary: React.FC<TestOrderDetailsSummaryProps> = (props) => {
  const orderId = props.navigation.getParam('orderId');
  const goToHomeOnBack = props.navigation.getParam('goToHomeOnBack');
  const setOrders = props.navigation.getParam('setOrders');
  const isComingFrom = props.navigation.getParam('comingFrom');
  const { showAphAlert } = useUIElements();
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
      context: {
        sourceHeaders,
      },
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
    context: {
      sourceHeaders,
    },
    variables: { diagnosticOrderId: orderId },
  });
  const order = g(data, 'getDiagnosticOrderDetails', 'ordersList');
  console.log({ order });

  const orderDetails = ((!loading && order) ||
    {}) as getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList;

  // useEffect(() => {
  //   setRescheduleVisible(true);
  // }, []);

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

  const handleBack = () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
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
    if (isComingFrom == AppRoutes.TestsCart) {
      props.navigation.dispatch(
        StackActions.reset({
          index: 0,
          key: null,
          actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
        })
      );
      props.navigation.navigate('TESTS', { focusSearch: false });
    } else {
      props.navigation.goBack();
    }
    return true;
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

  const renderOrderSummary = () => {
    return (
      !!g(orderDetails, 'totalPrice') && (
        <TestOrderSummaryView orderDetails={orderDetails} onPressViewReport={() => {}} />
      )
    );
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

        <ScrollView bounces={false}>{renderOrderSummary()}</ScrollView>
      </SafeAreaView>
      {loading && <Spinner style={{ zIndex: 200 }} />}
    </View>
  );
};
