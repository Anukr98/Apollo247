import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CrossPopup, DropdownGreen, More } from '@aph/mobile-patients/src/components/ui/Icons';
import { OrderProgressCard } from '@aph/mobile-patients/src/components/ui/OrderProgressCard';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  GetMedicineOrderDetails,
  GetMedicineOrderDetailsVariables,
} from '@aph/mobile-patients/src/graphql/types/GetMedicineOrderDetails';
import { MEDICINE_ORDER_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  saveOrderCancelStatus,
  saveOrderCancelStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/saveOrderCancelStatus';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Mutation, MutationFn, MutationResult } from 'react-apollo';
import { useQuery } from 'react-apollo-hooks';
import { BackHandler, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  NavigationActions,
  NavigationScreenProps,
  ScrollView,
  StackActions,
} from 'react-navigation';
import { GET_MEDICINE_ORDER_DETAILS, SAVE_ORDER_CANCEL_STATUS } from '../graphql/profiles';
import { AppRoutes } from './NavigatorContainer';
import { OrderSummary } from './OrderSummaryView';
import { DropDown } from './ui/DropDown';
import { NeedHelpAssistant } from './ui/NeedHelpAssistant';
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
] as any[];
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
  const [isCancelVisible, setCancelVisible] = useState(false);

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
    let status = type as any;
    switch (type) {
      case MEDICINE_ORDER_STATUS.CANCELLED:
        status = 'Order Cancelled';
        break;
      case MEDICINE_ORDER_STATUS.CANCEL_REQUEST:
        status = 'Cancel Requested';
        break;
      case MEDICINE_ORDER_STATUS.DELIVERED:
        status = 'Order Delivered';
        break;
      case MEDICINE_ORDER_STATUS.ITEMS_RETURNED:
        status = 'Items Returned';
        break;
      case MEDICINE_ORDER_STATUS.ORDER_CONFIRMED:
        status = 'Order Confirmed';
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
      case MEDICINE_ORDER_STATUS.PRESCRIPTION_CART_READY:
        status = 'Prescription Cart Ready';
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
      <View>
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
        <NeedHelpAssistant
          containerStyle={{ marginTop: 20, marginBottom: 30 }}
          navigation={props.navigation}
        />
      </View>
    );
  };

  const [selectedReason, setSelectedReason] = useState('');
  const [overlayDropdown, setOverlayDropdown] = useState(false);
  const renderReturnOrderOverlay = () => {
    const optionsDropdown = overlayDropdown && (
      <View
        style={{
          position: 'absolute',
          right: 16,
          alignItems: 'center',
          zIndex: 101,
          top: 100,
          // elevation: 100,
        }}
      >
        <DropDown
          options={[
            {
              optionText: 'Option 1',
              onPress: () => {
                setSelectedReason('Option1');
                setOverlayDropdown(false);
              },
            },
          ]}
        />
      </View>
    );

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
        <Text
          style={[
            {
              marginBottom: 12,
              color: '#0087ba',
              ...theme.fonts.IBMPlexSansMedium(17),
              lineHeight: 24,
            },
          ]}
        >
          Why are you cancelling this order?
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setOverlayDropdown(true);
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                opacity: 0.3,
                flex: 0.9,
                ...theme.fonts.IBMPlexSansMedium(18),
                color: theme.colors.SHERPA_BLUE,
              }}
              numberOfLines={1}
            >
              {'Select reason for cancelling'}
            </Text>
            <View style={{ flex: 0.1 }}>
              <DropdownGreen style={{ alignSelf: 'flex-end' }} />
            </View>
          </View>
          <View
            style={{
              marginTop: 5,
              backgroundColor: '#00b38e',
              height: 2,
            }}
          />
        </TouchableOpacity>
        <TextInputComponent
          label={'Add Comments (Optional)'}
          placeholder={'Enter your comments here…'}
        />
      </View>
    );

    const bottomButton = (
      <Button style={{ margin: 16, marginTop: 32, width: 'auto' }} title={'SUBMIT REQUEST'} />
    );

    return (
      isCancelVisible && (
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            position: 'absolute',
            width: '100%',
            height: '100%',
            justifyContent: 'flex-start',
            flex: 1,
            left: 0,
            right: 0,
            zIndex: 100,
          }}
        >
          <View style={{ marginHorizontal: 20 }}>
            <TouchableOpacity
              style={{ marginTop: 38, alignSelf: 'flex-end' }}
              onPress={() => setCancelVisible(!isCancelVisible)}
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
              {optionsDropdown}
              {heading}
              {content}
              {bottomButton}
            </View>
          </View>
        </View>
      )
    );
  };

  const renderOrderSummary = () => {
    return <OrderSummary orderDetails={orderDetails as any} />;
  };

  const onCancelOrder = (
    mutate: MutationFn<saveOrderCancelStatus, saveOrderCancelStatusVariables>,
    mutateResult: MutationResult<saveOrderCancelStatus>
  ) => {
    setMenuOpen(false);
    setCancelVisible(true);
    console.log({ mutateResult });

    // mutate({
    //   variables: {
    //     orderCancelInput: {
    //       orderNo: 1,
    //       remarksCode: '',
    //     },
    //   },
    // });
    // setShowSpinner(mutateResult.loading);
  };

  const [isMenuOpen, setMenuOpen] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const renderMenuOptions = () => {
    if (isMenuOpen) {
      return (
        <Mutation<saveOrderCancelStatus, saveOrderCancelStatusVariables>
          mutation={SAVE_ORDER_CANCEL_STATUS}
        >
          {(mutate, mutateResult) => (
            <View style={{ position: 'absolute', top: 0, right: 0 }}>
              <DropDown
                options={[
                  {
                    optionText: 'Cancel Order',
                    onPress: () => onCancelOrder(mutate, mutateResult),
                  },
                ]}
              />
            </View>
          )}
        </Mutation>
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderReturnOrderOverlay()}
      <SafeAreaView style={theme.viewStyles.container}>
        <View style={styles.headerShadowContainer}>
          <Header
            leftIcon="backArrow"
            title={`ORDER #${orderAutoId}`}
            container={{ borderBottomWidth: 0 }}
            // rightComponent={
            //   <TouchableOpacity
            //     activeOpacity={1}
            //     onPress={() => {
            //       setMenuOpen(true);
            //     }}
            //   >
            //     <More />
            //   </TouchableOpacity>
            // }
            onPressLeftIcon={() => {
              handleBack();
            }}
          />
          {renderMenuOptions()}
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
      {(loading || showSpinner) && <Spinner />}
    </View>
  );
};
