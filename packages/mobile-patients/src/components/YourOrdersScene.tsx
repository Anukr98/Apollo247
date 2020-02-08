import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { More } from '@aph/mobile-patients/src/components/ui/Icons';
import { OrderCard } from '@aph/mobile-patients/src/components/ui/OrderCard';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  GetMedicineOrdersList,
  GetMedicineOrdersListVariables,
  GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList,
  GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList_medicineOrdersStatus,
} from '@aph/mobile-patients/src/graphql/types/GetMedicineOrdersList';
import {
  MEDICINE_DELIVERY_TYPE,
  MEDICINE_ORDER_STATUS,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { g, getOrderStatusText } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ApolloQueryResult } from 'apollo-client';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView, FlatList } from 'react-navigation';
import { useQuery } from 'react-apollo-hooks';
import { GET_MEDICINE_ORDERS_LIST } from '../graphql/profiles';
import { useUIElements } from './UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

const styles = StyleSheet.create({
  noDataCard: {
    height: 'auto',
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
});
type OrderRefetch = (
  variables?: GetMedicineOrdersListVariables
) => Promise<ApolloQueryResult<GetMedicineOrdersList>>;

export interface YourOrdersSceneProps extends NavigationScreenProps {
  refetch: OrderRefetch;
}
{
}

export const YourOrdersScene: React.FC<YourOrdersSceneProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const { loading, setLoading } = useUIElements();
  const { getPatientApiCall } = useAuth();
  const isTest = props.navigation.getParam('isTest');
  const ordersFetched = props.navigation.getParam('orders');
  const [orders, setOrders] = useState<
    GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList[]
  >(props.navigation.getParam('orders'));
  const refetch: OrderRefetch =
    props.navigation.getParam('refetch') ||
    useQuery<GetMedicineOrdersList, GetMedicineOrdersListVariables>(GET_MEDICINE_ORDERS_LIST, {
      variables: { patientId: currentPatient && currentPatient.id },
      fetchPolicy: 'cache-first',
    }).refetch;
  const error = props.navigation.getParam('error');
  // const loading = props.navigation.getParam('loading');
  const [isChanged, setisChanged] = useState<boolean>(false);
  useEffect(() => {
    setLoading!(true);
    refetch &&
      refetch()
        .then(({ data }) => {
          const _orders = (g(data, 'getMedicineOrdersList', 'MedicineOrdersList')! || []).filter(
            (item) =>
              !(
                (item!.medicineOrdersStatus || []).length == 1 &&
                (item!.medicineOrdersStatus || []).find((item) => !item!.hideStatus)
              )
          );
          setLoading!(false);
          setOrders(_orders as GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList[]);
          setisChanged(!isChanged);
        })
        .catch((e) => {
          CommonBugFender('YourOrdersScene_refetch', e);
        });
  }, []);

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    const filteredOrders = orders.filter(
      (item) =>
        !(
          (item!.medicineOrdersStatus || []).length == 1 &&
          (item!.medicineOrdersStatus || []).find((item) => !item!.hideStatus)
        )
    );
    setOrders(filteredOrders);
  }, [isChanged]);

  // let { data, error, loading, refetch } = useQuery<
  //   GetMedicineOrdersList,
  //   GetMedicineOrdersListVariables
  // >(GET_MEDICINE_ORDERS_LIST, {
  //   variables: { patientId: currentPatient && currentPatient.id },
  //   fetchPolicy: 'no-cache',
  // });

  // const orders = (
  //   (!loading && g(data, 'getMedicineOrdersList', 'MedicineOrdersList')) ||
  //   []
  // ).filter(
  //   (item) =>
  //     !(
  //       (item!.medicineOrdersStatus || []).length == 1 &&
  //       (item!.medicineOrdersStatus || []).find(
  //         (item) => item!.orderStatus == MEDICINE_ORDER_STATUS.QUOTE
  //       )
  //     )
  // );

  // useEffect(() => {
  //   const _didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
  //     refetch()
  //       .then(() => {})
  //       .catch(() => {});
  //   });
  //   return () => {
  //     _didFocusSubscription && _didFocusSubscription.remove();
  //   };
  // }, []);

  const getDeliverType = (type: MEDICINE_DELIVERY_TYPE) => {
    switch (type) {
      case MEDICINE_DELIVERY_TYPE.HOME_DELIVERY:
        return 'Home Delivery';
        break;
      case MEDICINE_DELIVERY_TYPE.STORE_PICKUP:
        return 'Store Pickup';
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
    return moment(time).format('D MMM YY, hh:mm A');
  };

  const renderOrder = (
    order: GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList,
    index: number
  ) => {
    return (
      <OrderCard
        isTest={isTest}
        style={[
          { marginHorizontal: 20 },
          index < orders.length - 1 ? { marginBottom: 8 } : { marginBottom: 20 },
          index == 0 ? { marginTop: 20 } : {},
        ]}
        key={`${order!.orderAutoId}`}
        orderId={`#${order!.orderAutoId}`}
        onPress={() => {
          props.navigation.navigate(AppRoutes.OrderDetailsScene, {
            orderAutoId: order!.orderAutoId,
            orderDetails: order!.medicineOrdersStatus,
            setOrders: (
              orders: GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList[]
            ) => {
              setOrders(orders);
              setisChanged(!isChanged);
            },
            refetch: refetch,
          });
        }}
        title={'Medicines'}
        description={getDeliverType(order!.deliveryType)}
        statusDesc={getStatusDesc(g(order, 'medicineOrdersStatus')!)}
        status={getStatusType(g(order, 'medicineOrdersStatus')!)!}
        dateTime={getFormattedTime(g(order!.medicineOrdersStatus![0]!, 'statusDate'))}
      />
    );
  };

  const renderOrders = () => {
    return (
      <View>
        <FlatList
          bounces={false}
          data={orders}
          renderItem={({ item, index }) => renderOrder(item, index)}
        />
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
              props.navigation.navigate(AppRoutes.SearchMedicineScene);
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
          title={props.navigation.getParam('header') || string.orders.urOrders}
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={() => props.navigation.goBack()}
          rightComponent={
            isTest && (
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <More />
              </TouchableOpacity>
            )
          }
        />
        <ScrollView bounces={false}>
          {renderOrders()}
          {renderNoOrders()}
          {renderError()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
