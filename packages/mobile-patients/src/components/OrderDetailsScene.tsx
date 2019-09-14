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
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { BackHandler, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Overlay } from 'react-native-elements';
import {
  NavigationActions,
  NavigationScreenProps,
  ScrollView,
  StackActions,
} from 'react-navigation';
import { GET_MEDICINE_ORDER_DETAILS } from '../graphql/profiles';
import {
  GetMedicineOrderDetails,
  GetMedicineOrderDetailsVariables,
} from '../graphql/types/GetMedicineOrderDetails';
import { MEDICINE_ORDER_STATUS } from '../graphql/types/globalTypes';
import { g } from '../helpers/helperFunctions';
import { useAllCurrentPatients } from '../hooks/authHooks';
import { AppRoutes } from './NavigatorContainer';
import { OrderSummary } from './OrderSummaryView';
import { OrderCardProps } from './ui/OrderCard';
import { Spinner } from './ui/Spinner';
import { TabsComponent } from './ui/TabsComponent';

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
  showOrderSummaryTab: boolean;
  goToHomeOnBack: boolean;
}
{
}

export const OrderDetailsScene: React.FC<OrderDetailsSceneProps> = (props) => {
  const orderAutoId = props.navigation.getParam('orderAutoId');
  const goToHomeOnBack = props.navigation.getParam('goToHomeOnBack');
  const showOrderSummaryTab = props.navigation.getParam('showOrderSummaryTab');

  const [selectedTab, setSelectedTab] = useState<string>(
    showOrderSummaryTab ? string.orders.viewBill : string.orders.trackOrder
  );
  const [isReturnVisible, setReturnVisible] = useState(false);

  const { currentPatient } = useAllCurrentPatients();
  const { data, loading } = useQuery<GetMedicineOrderDetails, GetMedicineOrderDetailsVariables>(
    GET_MEDICINE_ORDER_DETAILS,
    {
      variables: { patientId: currentPatient && currentPatient.id, orderAutoId: orderAutoId },
    }
  );
  const order = g(data, 'getMedicineOrderDetails', 'MedicineOrderDetails');
  const orderDetails = (!loading && order) || {};
  const orderStatusList = (!loading && order && order.medicineOrdersStatus) || [];

  // !loading && console.log({ orderDetails });
  // !loading && error && console.error({ error });

  const handleBack = async () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
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
    return false;
  };

  useEffect(() => {
    const _didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    });

    const _willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });

    return () => {
      _didFocusSubscription && _didFocusSubscription.remove();
      _willBlurSubscription && _willBlurSubscription.remove();
    };
  }, []);

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
        {orderStatusList.map((order, index, array) => {
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

  const renderOrderSummary = () => {
    return <OrderSummary orderDetails={orderDetails as any} />;
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderReturnOrderOverlay()}
        <View style={styles.headerShadowContainer}>
          <Header
            leftIcon="backArrow"
            title={`ORDER #${orderAutoId}`}
            container={{ borderBottomWidth: 0 }}
            rightComponent={
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <More />
              </TouchableOpacity>
            }
            onPressLeftIcon={() => {
              handleBack();
            }}
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
        <ScrollView bounces={false}>
          {selectedTab == string.orders.trackOrder ? renderOrderHistory() : renderOrderSummary()}
        </ScrollView>
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};
