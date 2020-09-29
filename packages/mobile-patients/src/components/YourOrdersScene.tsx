import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { OrderCard } from '@aph/mobile-patients/src/components/ui/OrderCard';
import { MEDICINE_DELIVERY_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { getOrderStatusText } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React from 'react';
import { SafeAreaView, StyleSheet, View, FlatList } from 'react-native';
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

const formatOrders = (orders?: getMedicineOrdersOMSList) =>
  ((orders?.getMedicineOrdersOMSList?.medicineOrdersList as MedOrder[]) || []).filter(
    (item) =>
      !(
        item.medicineOrdersStatus?.length == 1 &&
        item.medicineOrdersStatus?.find((s) => !s!.hideStatus)
      )
  );

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
  const orders = loading || error ? [] : formatOrders(data);

  const refetchOrders = async () => {
    try {
      await refetch();
    } catch (e) {
      CommonBugFender(`${AppRoutes.YourOrdersScene}_refetchOrders`, e);
    }
  };

  const getDeliverTypeOrDescription = (order: MedOrder) => {
    const getStore = () => {
      const shopAddress = order?.shopAddress;
      const parsedShopAddress = JSON.parse(shopAddress || '{}');
      return (
        (parsedShopAddress?.storename &&
          [parsedShopAddress.storename, parsedShopAddress.city, parsedShopAddress.zipcode]
            .filter((a) => a)
            .join(', ')) ||
        ''
      );
    };

    if (order?.billNumber) {
      return getStore();
    }

    const type = order?.deliveryType;

    if (type === MEDICINE_DELIVERY_TYPE.HOME_DELIVERY) {
      return 'Home Delivery';
    } else if (type === MEDICINE_DELIVERY_TYPE.STORE_PICKUP) {
      return 'Store Pickup';
    } else {
      return '';
    }
  };

  const getFormattedTime = (time: string) => {
    return moment(time).format('D MMM YY, hh:mm A');
  };

  const getOrderTitle = (order: MedOrder) => {
    // use billedItems for delivered orders
    const billedItems = order?.medicineOrderShipments?.[0]?.medicineOrderInvoice?.[0]?.itemDetails;
    const billedLineItems = billedItems
      ? (JSON.parse(billedItems) as { itemName: string }[])
      : null;
    const lineItems = (billedLineItems || order?.medicineOrderLineItems || []) as {
      itemName?: string;
      medicineName?: string;
    }[];
    let title = 'Medicines';

    if (lineItems.length) {
      const firstItem = lineItems?.[0]?.[billedLineItems ? 'itemName' : 'medicineName']!;
      const lineItemsLength = lineItems.length;
      title =
        lineItemsLength > 1
          ? `${firstItem} + ${lineItemsLength - 1} item${lineItemsLength > 2 ? 's ' : ' '}`
          : firstItem;
    }

    return title;
  };

  const renderOrder = (order: MedOrder, index: number) => {
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
        dateTime={getFormattedTime(order?.createdDate)}
      />
    );
  };

  const renderOrders = () => {
    return (
      <FlatList
        keyExtractor={(_, index) => `${index}`}
        bounces={false}
        data={orders}
        renderItem={({ item, index }) => renderOrder(item, index)}
        ListEmptyComponent={renderNoOrders()}
      />
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
    if (error) {
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
        {renderError()}
        {renderOrders()}
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};
