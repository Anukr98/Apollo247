import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  OrderProgressCard,
  OrderProgressCardProps,
} from '@aph/mobile-patients/src/components/ui/OrderProgressCard';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { More } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';

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

const list = [
  {
    status: 'Order Placed',
    date: '9 Aug 2019',
    time: '12:00 pm',
    isStatusDone: true,
    nextItemStatus: 'DONE',
  },
  {
    status: 'Order Verified',
    date: '9 Aug 2019',
    time: '12:00 pm',
    isStatusDone: true,
    nextItemStatus: 'NOT_DONE',
  },
  {
    status: 'Order Verified',
    date: '9 Aug 2019',
    time: '12:00 pm',
    isStatusDone: false,
    nextItemStatus: 'NOT_EXIST',
    description: 'To Be Delivered Within — 2hrs',
  },
] as OrderProgressCardProps[];

export interface OrderDetailsSceneProps extends NavigationScreenProps {
  orderId: string;
}
{
}

export const OrderDetailsScene: React.FC<OrderDetailsSceneProps> = (props) => {
  const [selectedTab, setSelectedTab] = useState<string>(string.orders.trackOrder);

  const renderOrderHistory = () => {
    return (
      <View style={{ margin: 20 }}>
        {list.map((order, index, array) => {
          return (
            <OrderProgressCard
              style={index < array.length - 1 ? { marginBottom: 8 } : {}}
              key={index}
              description={order.description}
              status={order.status}
              date={order.date}
              time={order.time}
              isStatusDone={order.isStatusDone}
              nextItemStatus={order.nextItemStatus}
            />
          );
        })}
      </View>
    );
  };

  const orderId = props.navigation.getParam('orderId') || '';
  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <View style={styles.headerShadowContainer}>
        <Header
          leftIcon="backArrow"
          title={`ORDER #${orderId}`}
          container={{ borderBottomWidth: 0 }}
          rightComponent={
            <TouchableOpacity onPress={() => {}}>
              <More />
            </TouchableOpacity>
          }
          onPressLeftIcon={() => props.navigation.goBack()}
        />
      </View>
      <TabsComponent
        style={styles.tabsContainer}
        onChange={(title) => {
          setSelectedTab(title);
        }}
        data={[{ title: string.orders.trackOrder }, { title: string.orders.viewBill }]}
        selectedTab={selectedTab}
      />
      <ScrollView bounces={false}>{renderOrderHistory()}</ScrollView>
    </SafeAreaView>
  );
};
