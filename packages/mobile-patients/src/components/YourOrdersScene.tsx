import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { More } from '@aph/mobile-patients/src/components/ui/Icons';
import { OrderCard, OrderCardProps } from '@aph/mobile-patients/src/components/ui/OrderCard';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

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
  const renderOrders = () => {
    return (
      <View style={{ margin: 20 }}>
        {list.map((order, index, array) => {
          return (
            <OrderCard
              style={index < array.length - 1 ? { marginBottom: 8 } : {}}
              key={order.orderId}
              orderId={order.orderId}
              onPress={(orderId) => {
                props.navigation.navigate(AppRoutes.OrderDetailsScene, {
                  orderId: orderId,
                });
              }}
              title={order.title}
              description={order.description}
              status={order.status}
              dateTime={order.dateTime}
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
        rightComponent={
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <More />
          </TouchableOpacity>
        }
        onPressLeftIcon={() => props.navigation.goBack()}
      />
      <ScrollView bounces={false}>{renderOrders()}</ScrollView>
    </SafeAreaView>
  );
};
