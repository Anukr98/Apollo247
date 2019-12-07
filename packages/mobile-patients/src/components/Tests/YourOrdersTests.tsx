import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TestOrderCard } from '@aph/mobile-patients/src/components/ui/TestOrderCard';
import { GET_DIAGNOSTIC_ORDER_LIST } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getDiagnosticOrdersList,
  getDiagnosticOrdersListVariables,
  getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersList';
import { GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList_medicineOrdersStatus } from '@aph/mobile-patients/src/graphql/types/GetMedicineOrdersList';
import { g, getOrderStatusText } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

const styles = StyleSheet.create({
  noDataCard: {
    height: 'auto',
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
});

export interface YourOrdersTestProps extends NavigationScreenProps {}

export const YourOrdersTest: React.FC<YourOrdersTestProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const isTest = props.navigation.getParam('isTest');
  const ordersFetched = props.navigation.getParam('orders');
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
  const loading = props.navigation.getParam('loading');

  useEffect(() => {
    console.log('fetched', ordersFetched);
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    refetch().then((data: any) => {
      const _orders = g(data, 'data', 'getDiagnosticOrdersList', 'ordersList') || [];
      setOrders(_orders);
    });
  }, []);

  // console.log('', currentPatient);
  // let { data, error, loading, refetch } = useQuery<
  //   getDiagnosticOrdersList,
  //   getDiagnosticOrdersListVariables
  // >(GET_DIAGNOSTIC_ORDER_LIST, {
  //   variables: { patientId: currentPatient && currentPatient.id },
  //   fetchPolicy: 'no-cache',
  // });

  // const orders: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList[] = props.navigation.getParam(
  //   'orders'
  // )||
  // (!loading && g(data, 'getDiagnosticOrdersList', 'ordersList')) ||
  // [];

  // console.log({ orders });

  // useEffect(() => {
  //   const _didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
  //     refetch()
  //       .then((data) => {
  //         console.log('test orders', data);
  //       })
  //       .catch((error) => {
  //         console.log('trestotdr erroe', error);
  //       });
  //   });
  //   return () => {
  //     _didFocusSubscription && _didFocusSubscription.remove();
  //   };
  // }, []);

  const getDeliverType = (type: string) => {
    switch (type) {
      case 'H':
        return 'Home Visit';
        break;
      case 'C':
        return 'Clinic Visit';
        break;
      case 'HC':
        return 'Home or Clinic Visit';
        break;
      default:
        return 'Unknown';
        break;
    }
  };

  const getSortedList = (
    orderStatusList: (GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList_medicineOrdersStatus | null)[]
  ) => {
    return orderStatusList.sort(
      (a, b) =>
        moment(b!.statusDate)
          .toDate()
          .getTime() -
        moment(a!.statusDate)
          .toDate()
          .getTime()
    );
  };

  const getStatusType = (
    orderStatusList: (GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList_medicineOrdersStatus | null)[]
  ) => {
    const sortedList = getSortedList(orderStatusList);
    return g(sortedList[0], 'orderStatus')!;
  };

  const getStatusDesc = (
    orderStatusList: (GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList_medicineOrdersStatus | null)[]
  ) => {
    const sortedList = getSortedList(orderStatusList);
    return getOrderStatusText(g(sortedList[0], 'orderStatus')!);
  };

  const getFormattedTime = (time: string) => {
    return moment(time).format('D MMM YY, hh:mm a');
  };

  const renderOrders = () => {
    return (
      <View style={{ margin: 20 }}>
        {orders.map((order, index, array) => {
          const title =
            g(order, 'diagnosticOrderLineItems', '0' as any, 'diagnostics', 'itemName') || 'Test';
          return (
            <TestOrderCard
              style={index < array.length - 1 ? { marginBottom: 8 } : {}}
              key={`${order!.id}`}
              orderId={`#${order!.displayId}`}
              onPress={() => {
                props.navigation.navigate(AppRoutes.TestOrderDetails, {
                  orderId: order!.id,
                  setOrders: (
                    orders: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList[]
                  ) => setOrders(orders),
                  refetch: refetch,
                });
              }}
              title={title}
              description={getDeliverType(order!.orderType)}
              statusDesc={order!.orderStatus!}
              status={order!.orderStatus!}
              dateTime={getFormattedTime(order!.createdDate)}
            />
          );
        })}
      </View>
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
    if (!loading && error) {
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

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          title={string.orders.urOrders}
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={() => props.navigation.goBack()}
          //   rightComponent={
          //     isTest && (
          //       <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          //         <More />
          //       </TouchableOpacity>
          //     )
          //   }
        />
        <ScrollView bounces={false}>
          {renderOrders()}
          {renderNoOrders()}
          {renderError()}
        </ScrollView>
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};
