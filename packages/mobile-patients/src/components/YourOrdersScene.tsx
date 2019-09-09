import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { More } from '@aph/mobile-patients/src/components/ui/Icons';
import { OrderCard, OrderCardProps } from '@aph/mobile-patients/src/components/ui/OrderCard';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { useQuery } from 'react-apollo-hooks';
import { ActivityIndicator, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { GET_MEDICINE_ORDERS_LIST } from '../graphql/profiles';
import {
  GetMedicineOrdersList,
  GetMedicineOrdersListVariables,
} from '../graphql/types/GetMedicineOrdersList';
import { MEDICINE_DELIVERY_TYPE, MEDICINE_ORDER_STATUS } from '../graphql/types/globalTypes';
import { g } from '../helpers/helperFunctions';
import { useAllCurrentPatients } from '../hooks/authHooks';
import moment from 'moment';

const styles = StyleSheet.create({});

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
    { variables: { patientId: currentPatient && currentPatient.id } }
  );

  const orders = (!loading && data && data.getMedicineOrdersList.MedicineOrdersList!) || [];
  !loading && console.log({ orders });
  !loading && error && console.error({ error });

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

  return (
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
      {loading && (
        <ActivityIndicator
          style={{ flex: 1, alignItems: 'center' }}
          animating={loading}
          size="large"
          color="green"
        />
      )}
      <ScrollView bounces={false}>{renderOrders()}</ScrollView>
    </SafeAreaView>
  );
};
