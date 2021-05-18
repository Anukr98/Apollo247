import { TestOrderSummaryView } from '@aph/mobile-patients/src/components/Tests/components/TestOrderSummaryView';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import {
  GET_DIAGNOSTIC_ORDER_LIST,
  GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
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
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { BackHandler, SafeAreaView, StyleSheet, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { navigateToHome } from '@aph/mobile-patients/src/helpers/helperFunctions';

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

export const TestOrderDetailsSummary: React.FC<TestOrderDetailsSummaryProps> = (props) => {
  const orderId = props.navigation.getParam('orderId');
  const goToHomeOnBack = props.navigation.getParam('goToHomeOnBack');
  const setOrders = props.navigation.getParam('setOrders');
  const isComingFrom = props.navigation.getParam('comingFrom');
  const amount = props.navigation.getParam('amount');
  const { currentPatient } = useAllCurrentPatients();
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

  const orderDetails = ((!loading && order) ||
    {}) as getDiagnosticOrderDetails_getDiagnosticOrderDetails_ordersList;

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
      navigateToHome(props.navigation);
      props.navigation.navigate('TESTS', { focusSearch: false });
    } else {
      props.navigation.goBack();
    }
    return true;
  };

  const renderOrderSummary = () => {
    return (
      !!g(orderDetails, 'totalPrice') && (
        <TestOrderSummaryView orderDetails={orderDetails} onPressViewReport={() => {}} />
      )
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <View style={styles.headerShadowContainer}>
          <Header
            leftIcon="backArrow"
            title={`ORDER #${orderDetails?.displayId || ''}`}
            titleStyle={{ marginHorizontal: 10 }}
            container={{ borderBottomWidth: 0 }}
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
