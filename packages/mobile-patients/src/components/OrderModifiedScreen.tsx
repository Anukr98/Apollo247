import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails } from '@aph/mobile-patients/src/graphql/types/getMedicineOrderOMSDetails';
import React from 'react';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export interface OrderModifiedScreenProps
  extends NavigationScreenProps<{
    orderDetails: getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails;
  }> {}

export const OrderModifiedScreen: React.FC<OrderModifiedScreenProps> = (props) => {
  const orderDetails = props.navigation.getParam('orderDetails');
  const orderAutoId = `Your order #${orderDetails.orderAutoId} has been modified.`;
  console.log('orderDetails', orderDetails);
  return (
    <View
      style={{
        ...theme.viewStyles.container,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title="ORDER MODIFIED"
          leftIcon="backArrow"
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView bounces={false}>
          <View
            style={{
              backgroundColor: '#f7f8f5',
              justifyContent: 'center',
              shadowColor: 'rgba(128, 128, 128, 0.3)',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.4,
              shadowRadius: 5,
              elevation: 5,
            }}
          >
            <Text
              style={{
                ...theme.viewStyles.text('M', 14, '#02475b'),
                marginVertical: 13,
                textAlign: 'center',
              }}
            >
              {orderAutoId}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
