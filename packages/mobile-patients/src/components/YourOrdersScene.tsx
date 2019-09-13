import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { OrderCard, OrderCardProps } from '@aph/mobile-patients/src/components/ui/OrderCard';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { GET_MEDICINE_ORDERS_LIST } from '@aph/mobile-patients/src/graphql/profiles';
import {
  GetMedicineOrdersList,
  GetMedicineOrdersListVariables,
} from '@aph/mobile-patients/src/graphql/types/GetMedicineOrdersList';
import {
  MEDICINE_DELIVERY_TYPE,
  MEDICINE_ORDER_STATUS,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React from 'react';
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

const list = [
  {
    title: 'Medicines',
    description: 'Home Delivery',
    orderId: 'A2472707936',
    status: 'Order Placed',
    dateTime: '9 Aug 19, 12:00 pm',
  },
  {
    title: 'Medicines',
    description: 'Return Order',
    orderId: 'A2472707937',
    status: 'Return Accepted',
    dateTime: '9 Aug 19, 12:00 pm',
  },
  {
    title: 'Medicines',
    description: 'Return Order',
    orderId: 'A2472707938',
    status: 'Order Cancelled',
    dateTime: '9 Aug 19, 12:00 pm',
  },
] as OrderCardProps[];

export interface YourOrdersSceneProps extends NavigationScreenProps {}

export const YourOrdersScene: React.FC<YourOrdersSceneProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();

  const { data, error, loading } = useQuery<GetMedicineOrdersList, GetMedicineOrdersListVariables>(
    GET_MEDICINE_ORDERS_LIST,
    { variables: { patientId: currentPatient && currentPatient.id }, fetchPolicy: 'no-cache' }
  );

  const orders = (!loading && data && data.getMedicineOrdersList.MedicineOrdersList!) || [];
  // !loading && console.log({ orders });
  // !loading && error && console.error({ error });

  const getDeliverType = (type: MEDICINE_DELIVERY_TYPE) => {
    switch (type) {
      case MEDICINE_DELIVERY_TYPE.HOME_DELIVERY:
        return 'Home Delivery';
        break;
      case MEDICINE_DELIVERY_TYPE.STORE_PICKUP:
        return 'Store Pickup';
        break;
      default:
        return '';
        break;
    }
  };

  const getStatusType = (type: MEDICINE_ORDER_STATUS) => {
    let status = '' as OrderCardProps['status'];
    switch (type) {
      case MEDICINE_ORDER_STATUS.CANCELLED:
        status = 'Order Cancelled';
        break;
      case MEDICINE_ORDER_STATUS.DELIVERED:
        status = 'Order Delivered';
        break;
      case MEDICINE_ORDER_STATUS.ITEMS_RETURNED:
        status = 'Items Returned';
        break;
      case MEDICINE_ORDER_STATUS.ORDER_FAILED:
        status = 'Order Failed';
        break;
      case MEDICINE_ORDER_STATUS.ORDER_PLACED:
        status = 'Order Placed';
        break;
      case MEDICINE_ORDER_STATUS.ORDER_VERIFIED:
        status = 'Order Verified';
        break;
      case MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY:
        status = 'Out For Delivery';
        break;
      case MEDICINE_ORDER_STATUS.PICKEDUP:
        status = 'Order Picked Up';
        break;
      case MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED:
        status = 'Prescription Uploaded';
        break;
      case MEDICINE_ORDER_STATUS.QUOTE:
        status = 'Quote';
        break;
      case MEDICINE_ORDER_STATUS.RETURN_ACCEPTED:
        status = 'Return Accepted';
        break;
      case MEDICINE_ORDER_STATUS.RETURN_INITIATED:
        status = 'Return Requested';
        break;
    }
    return status;
  };

  const getFormattedTime = (time: string) => {
    return moment(time).format('D MMM YY, hh:mm a');
  };

  const renderOrders = () => {
    return (
      <View style={{ margin: 20 }}>
        {orders.map((order, index, array) => {
          return (
            <OrderCard
              style={index < array.length - 1 ? { marginBottom: 8 } : {}}
              key={`${order!.orderAutoId}`}
              orderId={`#${order!.orderAutoId}`}
              onPress={() => {
                props.navigation.navigate(AppRoutes.OrderDetailsScene, {
                  orderAutoId: order!.orderAutoId,
                  orderDetails: order!.medicineOrdersStatus,
                });
              }}
              title={'Medicines'}
              description={getDeliverType(order!.deliveryType)}
              status={getStatusType(g(order!.medicineOrdersStatus![0]!, 'orderStatus')!)}
              dateTime={getFormattedTime(g(order!.medicineOrdersStatus![0]!, 'statusDate'))}
            />
          );
        })}
      </View>
    );
  };

  const renderNoOrders = () => {
    if (!loading && orders.length == 0) {
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

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          title={string.orders.urOrders}
          container={{ borderBottomWidth: 0 }}
          // rightComponent={
          //   <TouchableOpacity activeOpacity={1} onPress={() => props.navigation.goBack()}>
          //     <More />
          //   </TouchableOpacity>
          // }
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView bounces={false}>
          {renderOrders()}
          {renderNoOrders()}
        </ScrollView>
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};
