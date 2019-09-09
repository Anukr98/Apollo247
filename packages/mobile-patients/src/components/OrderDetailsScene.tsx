import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CrossPopup, More } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  OrderProgressCard,
  OrderProgressCardProps,
} from '@aph/mobile-patients/src/components/ui/OrderProgressCard';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Overlay } from 'react-native-elements';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList_medicineOrdersStatus } from '../graphql/types/GetMedicineOrdersList';
import { useAllCurrentPatients } from '../hooks/authHooks';
import { MEDICINE_ORDER_STATUS } from '../graphql/types/globalTypes';
import { OrderCardProps } from './ui/OrderCard';
import moment from 'moment';
import { StackActions } from 'react-navigation';
import { NavigationActions } from 'react-navigation';
import { AppRoutes } from './NavigatorContainer';

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

const _list = [
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
  orderAutoId: string;
  orderDetails: GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList_medicineOrdersStatus[];
  goToHomeOnBack: boolean;
}
{
}

export const OrderDetailsScene: React.FC<OrderDetailsSceneProps> = (props) => {
  const [selectedTab, setSelectedTab] = useState<string>(string.orders.trackOrder);
  const [isReturnVisible, setReturnVisible] = useState(false);
  const orderId = props.navigation.getParam('orderAutoId');
  const { currentPatient } = useAllCurrentPatients();
  const goToHomeOnBack = props.navigation.getParam('goToHomeOnBack');

  // const { data, error, loading } = useQuery<GetMedicineOrdersList, GetMedicineOrdersListVariables>(
  //   GET_MEDICINE_ORDER_DETAILS,
  //   { variables: { patientId: currentPatient && currentPatient.id } }
  // );

  // const orders = (!loading && data && data.getMedicineOrdersList.MedicineOrdersList!) || [];
  // !loading && console.log({ orders });
  // !loading && error && console.error({ error });

  const orderDetails: GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList_medicineOrdersStatus[] = props.navigation.getParam(
    'orderDetails'
  );

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

  const getFormattedDate = (time: string) => {
    return moment(time).format('D MMM YYYY');
  };

  const getFormattedTime = (time: string) => {
    return moment(time).format('hh:mm a');
  };

  const renderOrderHistory = () => {
    return (
      <View style={{ margin: 20 }}>
        {(orderDetails || []).map((order, index, array) => {
          return (
            <OrderProgressCard
              style={index < array.length - 1 ? { marginBottom: 8 } : {}}
              key={index}
              description={''}
              status={getStatusType(order!.orderStatus!)}
              date={getFormattedDate(order!.statusDate)}
              time={getFormattedTime(order!.statusDate)}
              isStatusDone={true}
              nextItemStatus={index == array.length - 1 ? 'NOT_EXIST' : 'DONE'}
            />
          );
        })}
      </View>
    );
  };

  const renderReturnOrderOverlay = () => {
    const heading = (
      <View
        style={{
          ...theme.viewStyles.cardContainer,
          backgroundColor: theme.colors.WHITE,
          padding: 18,
          marginBottom: 24,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
      >
        <Text
          style={{
            ...theme.fonts.IBMPlexSansMedium(16),
            color: theme.colors.SHERPA_BLUE,
            textAlign: 'center',
          }}
        >
          Cancel Order
        </Text>
      </View>
    );

    const content = (
      <View style={{ paddingHorizontal: 16 }}>
        <TextInputComponent
          label={'Why are you cancelling this order?'}
          placeholder={'Select reason for cancelling'}
        />
        <TextInputComponent
          label={'Add Comments (Optional)'}
          placeholder={'Enter your comments here…'}
        />
      </View>
    );

    const bottomButton = <Button title={'SUBMIT REQUEST'} />;

    return (
      <Overlay
        windowBackgroundColor={'rgba(0, 0, 0, 0.8)'}
        containerStyle={{ alignSelf: 'flex-start' }}
        overlayStyle={{
          padding: 0,
          margin: 0,
          width: '88.88%',
          height: 'auto',
          borderRadius: 10,
        }}
        isVisible={isReturnVisible}
      >
        <View>
          <TouchableOpacity
            style={{ marginTop: -42, alignSelf: 'flex-end' }}
            onPress={() => setReturnVisible(!isReturnVisible)}
          >
            <CrossPopup />
          </TouchableOpacity>
          <View style={{ height: 16 }} />
          <View
            style={{
              backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              borderBottomRightRadius: 10,
              borderBottomLeftRadius: 10,
            }}
          >
            {heading}
            {content}
          </View>
        </View>
      </Overlay>
    );
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      {renderReturnOrderOverlay()}
      <View style={styles.headerShadowContainer}>
        <Header
          leftIcon="backArrow"
          title={`ORDER #${orderId}`}
          container={{ borderBottomWidth: 0 }}
          rightComponent={
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <More />
            </TouchableOpacity>
          }
          onPressLeftIcon={() => {
            if (goToHomeOnBack) {
              props.navigation.dispatch(
                StackActions.reset({
                  index: 0,
                  key: null,
                  actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
                })
              );
            } else {
              props.navigation.goBack();
            }
          }}
        />
      </View>

      {/* {loading && (
        <ActivityIndicator
          style={{ flex: 1, alignItems: 'center' }}
          animating={loading}
          size="large"
          color="green"
        />
      )} */}

      {/* <TabsComponent
        style={styles.tabsContainer}
        onChange={(title) => {
          setSelectedTab(title);
        }}
        data={[{ title: string.orders.trackOrder }, { title: string.orders.viewBill }]}
        selectedTab={selectedTab}
      /> */}
      <ScrollView bounces={false}>{renderOrderHistory()}</ScrollView>
    </SafeAreaView>
  );
};
