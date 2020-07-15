import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { OrderCard } from '@aph/mobile-patients/src/components/ui/OrderCard';
import { MEDICINE_DELIVERY_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { g, getOrderStatusText } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React from 'react';
import { SafeAreaView, StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { useQuery } from 'react-apollo-hooks';
import { GET_MEDICINE_ORDERS_OMS__LIST } from '@aph/mobile-patients/src/graphql/profiles';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  getMedicineOrdersOMSListVariables,
  getMedicineOrdersOMSList,
  getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList,
} from '@aph/mobile-patients/src/graphql/types/getMedicineOrdersOMSList';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';

const styles = StyleSheet.create({
  noDataCard: {
    height: 'auto',
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
});

type MedOrder = getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList;
export interface YourOrdersSceneProps extends NavigationScreenProps<{ header: string }> {}

export const YourOrdersScene: React.FC<YourOrdersSceneProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const { data, error, loading, refetch } = useQuery<
    getMedicineOrdersOMSList,
    getMedicineOrdersOMSListVariables
  >(GET_MEDICINE_ORDERS_OMS__LIST, {
    variables: { patientId: currentPatient && currentPatient.id },
    fetchPolicy: 'no-cache',
  });
  const orders =
    (loading || error) && !data
      ? []
      : ((g(data, 'getMedicineOrdersOMSList', 'medicineOrdersList') as MedOrder[]) || []).filter(
          (item) =>
            !(
              (item.medicineOrdersStatus || []).length == 1 &&
              (item.medicineOrdersStatus || []).find((s) => !s!.hideStatus)
            )
        );

  const refetchOrders = async () => {
    try {
      await refetch();
    } catch (e) {
      CommonBugFender(`${AppRoutes.YourOrdersScene}_refetchOrders`, e);
    }
  };

  const getDeliverTypeOrDescription = (
    order: getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList
  ) => {
    const getStore = () => {
      const shopAddress = g(order, 'shopAddress');
      const parsedShopAddress = JSON.parse(shopAddress || '{}');
      return (
        (parsedShopAddress &&
          parsedShopAddress.storename &&
          parsedShopAddress.address &&
          [
            g(parsedShopAddress, 'storename'),
            g(parsedShopAddress, 'city'),
            g(parsedShopAddress, 'zipcode'),
          ]
            .filter((a) => a)
            .join(', ')) ||
        ''
      );
    };

    const offlineOrderNumber = g(order, 'billNumber');
    if (offlineOrderNumber) {
      return getStore();
    }

    const type = g(order, 'deliveryType');
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

  /*
  const getSortedList = (
    orderStatusList: (getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList_medicineOrdersStatus | null)[]
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
    orderStatusList: (getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList_medicineOrdersStatus | null)[]
  ) => {
    const sortedList = getSortedList(orderStatusList);
    return g(sortedList[0], 'orderStatus')!;
  };
  const getStatusDesc = (
    orderStatusList: (getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList_medicineOrdersStatus | null)[]
  ) => {
    const sortedList = getSortedList(orderStatusList);
    return getOrderStatusText(g(sortedList[0], 'orderStatus')!);
  };
  */

  const getFormattedTime = (time: string) => {
    return moment(time).format('D MMM YY, hh:mm A');
  };

  const getOrderTitle = (
    order: getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList
  ) => {
    // use billedItems for delivered orders
    const billedItems = g(
      order,
      'medicineOrderShipments',
      '0' as any,
      'medicineOrderInvoice',
      '0' as any,
      'itemDetails'
    );
    const billedLineItems = billedItems
      ? (JSON.parse(billedItems) as { itemName: string }[])
      : null;
    const lineItems = (billedLineItems || g(order, 'medicineOrderLineItems') || []) as {
      itemName?: string;
      medicineName?: string;
    }[];
    let title = 'Medicines';

    if (lineItems.length) {
      const firstItem = g(lineItems, '0' as any, billedLineItems ? 'itemName' : 'medicineName')!;
      const lineItemsLength = lineItems.length;
      title =
        lineItemsLength > 1
          ? `${firstItem} + ${lineItemsLength - 1} item${lineItemsLength > 2 ? 's ' : ' '}`
          : firstItem;
    }

    return title;
  };

  const renderOrder = (
    order: getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList,
    index: number
  ) => {
    const orderNumber = order.billNumber || order.orderAutoId;
    return (
      <OrderCard
        style={[
          { marginHorizontal: 20 },
          index < orders.length - 1 ? { marginBottom: 8 } : { marginBottom: 20 },
          index == 0 ? { marginTop: 20 } : {},
        ]}
        key={`${orderNumber}`}
        orderId={`#${orderNumber}`}
        onPress={() => {
          props.navigation.navigate(AppRoutes.OrderDetailsScene, {
            orderAutoId: order.orderAutoId,
            billNumber: order.billNumber,
            refetchOrders: refetchOrders,
          });
        }}
        title={getOrderTitle(order)}
        description={getDeliverTypeOrDescription(order)}
        statusDesc={getOrderStatusText(order.currentStatus!)}
        status={order.currentStatus!}
        dateTime={getFormattedTime(g(order, 'createdDate'))}
      />
    );
  };

  const renderOrders = () => {
    return (
      <View>
        <FlatList
          keyExtractor={(_, index) => `${index}`}
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
