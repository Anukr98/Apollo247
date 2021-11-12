import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { BuyAgainSection } from '@aph/mobile-patients/src/components/ui/BuyAgainSection';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { OrderCard } from '@aph/mobile-patients/src/components/ui/OrderCard';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_MEDICINE_ORDERS_OMS__LIST,
  GET_PREVIOUS_ORDERS_SKUS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getMedicineOrdersOMSList,
  getMedicineOrdersOMSListVariables,
  getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList,
} from '@aph/mobile-patients/src/graphql/types/getMedicineOrdersOMSList';
import {
  getPreviousOrdersSkus,
  getPreviousOrdersSkusVariables,
} from '@aph/mobile-patients/src/graphql/types/getPreviousOrdersSkus';
import {
  MEDICINE_DELIVERY_TYPE,
  MEDICINE_ORDER_STATUS,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  getOrderStatusText,
  isEmptyObject,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import ApolloClient from 'apollo-client';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  FlatList,
  ListRenderItem,
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  BackHandler,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { Props as BreadcrumbProps } from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';

const styles = StyleSheet.create({
  noDataCard: {
    height: 'auto',
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
  helpTextStyle: { ...theme.viewStyles.text('B', 13, '#FC9916', 1, 24) },
});

type AppSection = { buyAgainSection: true };
export type MedOrder = getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList;
export interface YourOrdersSceneProps extends NavigationScreenProps<{ header: string }> {
  showHeader?: boolean;
}

export const YourOrdersScene: React.FC<YourOrdersSceneProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any>([]);
  const [skuList, setSkuList] = useState<string[]>([]);

  useEffect(() => {
    fetchOrders();
    BackHandler.addEventListener('hardwareBackPress', onPressHardwareBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onPressHardwareBack);
    };
  }, []);

  const onPressHardwareBack = () => props.navigation.goBack();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersResponse = await client.query<
        getMedicineOrdersOMSList,
        getMedicineOrdersOMSListVariables
      >({
        query: GET_MEDICINE_ORDERS_OMS__LIST,
        variables: { patientId: currentPatient?.id },
        fetchPolicy: 'no-cache',
      });
      const skuArray = await getBuyAgainSkuList(client, currentPatient?.id);
      setOrders(formatOrdersWithBuyAgain(ordersResponse?.data, skuArray));
      setSkuList(skuArray);
      setLoading(false);
      setError(false);
    } catch (error) {
      setLoading(false);
      setError(true);
      CommonBugFender(`${AppRoutes.YourOrdersScene}_fetchOrders`, error);
    }
  };

  const refetchOrders = async () => {
    fetchOrders();
  };

  const statusToShowNewItems = [
    MEDICINE_ORDER_STATUS.ORDER_PLACED,
    MEDICINE_ORDER_STATUS.VERIFICATION_DONE,
    MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
  ];

  const checkIsJSON = (val: string) => {
    try {
      JSON.parse(val);
      return true;
    } catch (error) {
      return false;
    }
  };

  const renderOrder = (order: MedOrder, index: number) => {
    const orderNumber = order?.billNumber || order?.orderAutoId;
    const ordersOnHold =
      order?.medicineOrdersStatus?.filter(
        (item) => item?.orderStatus! == MEDICINE_ORDER_STATUS.ON_HOLD //PRESCRIPTION_UPLOADED
      ) || [];
    const isNonCart = order?.medicineOrdersStatus!.find(
      (item) => item?.orderStatus === MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED
    );

    const orderType = getDeliverTypeOrDescription(order);

    const latestOrdersOnHold = ordersOnHold?.sort((a: any, b: any) => {
      (new Date(b?.statusDate) as any) - (new Date(a?.statusDate) as any);
    });

    const orderOnHold = latestOrdersOnHold?.[0];

    const reasonForOnHold =
      orderOnHold! &&
      !isEmptyObject(orderOnHold!) &&
      checkIsJSON(orderOnHold?.statusMessage!) &&
      JSON.parse(orderOnHold?.statusMessage!);

    const isOnHold = reasonForOnHold! && reasonForOnHold?.showOnHold;
    return (
      <OrderCard
        style={[
          { marginHorizontal: 20 },
          index < orders?.length - 1 ? { marginBottom: 8 } : { marginBottom: 20 },
          index == 0 ? { marginTop: 20 } : {},
        ]}
        key={`${orderNumber}`}
        orderId={`#${orderNumber}`}
        onPress={() => {
          props.navigation.navigate(AppRoutes.OrderDetailsScene, {
            orderAutoId: order?.orderAutoId,
            billNumber: order?.billNumber,
            refetchOrders: refetchOrders,
            orderType: orderType,
          });
        }}
        title={getOrderTitle(order)}
        description={getDeliverTypeOrDescription(order)}
        statusDesc={
          order?.currentStatus == MEDICINE_ORDER_STATUS.ON_HOLD
            ? getOrderStatusText(MEDICINE_ORDER_STATUS.ORDER_PLACED)
            : getOrderStatusText(order?.currentStatus!)
        }
        status={order?.currentStatus!}
        isOnHold={
          order?.currentStatus == MEDICINE_ORDER_STATUS.ORDER_PLACED &&
          isOnHold &&
          !order?.medicineOrdersStatus?.find(
            (item) =>
              item?.orderStatus == MEDICINE_ORDER_STATUS.VERIFICATION_DONE ||
              item?.orderStatus == MEDICINE_ORDER_STATUS.READY_FOR_VERIFICATION
          ) //remove just after verification done (no check earlier)
            ? true
            : false
        }
        isItemsUpdated={
          statusToShowNewItems.includes(order?.currentStatus!) &&
          isNonCart && //check
          order?.medicineOrderLineItems?.length! > 0
            ? true
            : false
        }
        isChanged={
          statusToShowNewItems.includes(order?.currentStatus!) && order?.oldOrderTat! ? true : false
        }
        dateTime={getFormattedTime(order?.createdDate)}
        reOrder={() =>
          props.navigation.navigate(AppRoutes.OrderDetailsScene, {
            orderAutoId: order?.orderAutoId,
            billNumber: order?.billNumber,
            refetchOrders: refetchOrders,
            reOrder: true,
            orderType: orderType,
          })
        }
      />
    );
  };

  const renderOrders = () => {
    const renderItem: ListRenderItem<MedOrder | AppSection> = ({ item, index }) => {
      const onPressBuyAgain = () => {
        props.navigation.navigate(AppRoutes.MedicineBuyAgain, {
          movedFrom: AppRoutes.YourOrdersScene,
          skuList: skuList,
        });
      };

      return (item as AppSection)?.buyAgainSection ? (
        <BuyAgainSection onPress={onPressBuyAgain} />
      ) : (
        renderOrder(item as MedOrder, index)
      );
    };

    return (
      <FlatList
        keyExtractor={(_, index) => `${index}`}
        bounces={false}
        data={orders as MedOrder[]}
        renderItem={renderItem}
        ListEmptyComponent={renderNoOrders()}
      />
    );
  };

  const renderNoOrders = () => {
    if (!loading && !error && orders?.length == 0) {
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
              props.navigation.navigate(AppRoutes.MedicineSearch);
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

  const onPressHelp = () => {
    const helpSectionQueryId = AppConfig.Configuration.HELP_SECTION_CUSTOM_QUERIES;
    props.navigation.navigate(AppRoutes.NeedHelpPharmacyOrder, {
      queryIdLevel1: helpSectionQueryId.pharmacy,
      sourcePage: 'My Orders',
    });
  };

  const renderHeaderRightComponent = () => {
    return (
      <TouchableOpacity activeOpacity={1} style={{ paddingLeft: 10 }} onPress={onPressHelp}>
        <Text style={styles.helpTextStyle}>{string.help.toUpperCase()}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {props?.showHeader == false ? null : (
          <Header
            leftIcon="backArrow"
            title={props.navigation.getParam('header') || string.orders.urOrders}
            container={{ borderBottomWidth: 0 }}
            onPressLeftIcon={() => props.navigation.goBack()}
            rightComponent={renderHeaderRightComponent()}
          />
        )}
        {renderError()}
        {renderOrders()}
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};

export const getDeliverTypeOrDescription = (order: MedOrder) => {
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

export const getFormattedTime = (time: string) => {
  return moment(time).format('D MMM YY, hh:mm A');
};

export const getOrderTitle = (order: MedOrder) => {
  // use billedItems for delivered orders
  const billedItems = order?.medicineOrderShipments?.[0]?.medicineOrderInvoice?.[0]?.itemDetails;
  const billedLineItems = billedItems ? (JSON.parse(billedItems) as { itemName: string }[]) : null;
  const lineItems = (billedLineItems || order?.medicineOrderLineItems || []) as {
    itemName?: string;
    medicineName?: string;
  }[];
  let title = 'Medicines';

  if (lineItems.length) {
    const firstItem = lineItems?.[0]?.[billedLineItems ? 'itemName' : 'medicineName']!;
    const lineItemsLength = lineItems?.length;
    title =
      lineItemsLength > 1
        ? `${firstItem} + ${lineItemsLength - 1} item${lineItemsLength > 2 ? 's ' : ' '}`
        : firstItem;
  }

  return title;
};

export const formatOrders = (orders?: getMedicineOrdersOMSList) => {
  return (orders?.getMedicineOrdersOMSList?.medicineOrdersList || []).filter(
    (item) =>
      !(
        item?.medicineOrdersStatus?.length == 1 &&
        item?.medicineOrdersStatus?.find((s) => !s!.hideStatus)
      )
  );
};

export const formatOrdersWithBuyAgain = (orders: getMedicineOrdersOMSList, skuArray: string[]) => {
  const formattedOrders = (
    (orders?.getMedicineOrdersOMSList?.medicineOrdersList as MedOrder[]) || []
  ).filter(
    (item) =>
      !(
        item.medicineOrdersStatus?.length == 1 &&
        item.medicineOrdersStatus?.find((s) => !s!.hideStatus)
      )
  );

  return formattedOrders?.length && skuArray?.length
    ? [...formattedOrders.slice(0, 1), { buyAgainSection: true }, ...formattedOrders.slice(1)]
    : formattedOrders;
};

export const getBuyAgainSkuList = async (client: ApolloClient<{}>, patientId: string) => {
  const skuResponse = await client.mutate<getPreviousOrdersSkus, getPreviousOrdersSkusVariables>({
    mutation: GET_PREVIOUS_ORDERS_SKUS,
    variables: {
      previousOrdersSkus: { patientId },
    },
    fetchPolicy: 'no-cache',
  });
  const skuArray = (skuResponse?.data?.getPreviousOrdersSkus?.SkuDetails || []) as string[];
  return skuArray;
};
