import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { OrderSummary } from '@aph/mobile-patients/src/components/OrderSummaryView';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DropDown, Option } from '@aph/mobile-patients/src/components/ui/DropDown';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CrossPopup, DropdownGreen, More } from '@aph/mobile-patients/src/components/ui/Icons';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { OrderProgressCard } from '@aph/mobile-patients/src/components/ui/OrderProgressCard';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  GET_MEDICINE_ORDER_DETAILS,
  SAVE_ORDER_CANCEL_STATUS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  GetMedicineOrderDetails,
  GetMedicineOrderDetailsVariables,
} from '@aph/mobile-patients/src/graphql/types/GetMedicineOrderDetails';
import {
  saveOrderCancelStatus,
  saveOrderCancelStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/saveOrderCancelStatus';
import {
  g,
  getOrderStatusText,
  handleGraphQlError,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import {
  Alert,
  BackHandler,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Overlay } from 'react-native-elements';
import {
  NavigationActions,
  NavigationScreenProps,
  ScrollView,
  StackActions,
} from 'react-navigation';
import { MEDICINE_ORDER_STATUS } from '../graphql/types/globalTypes';

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
  dropdownOverlayStyle: {
    padding: 0,
    margin: 0,
    height: 'auto',
    borderRadius: 10,
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

const cancelOptions: [string, string][] = [
  ['MCCR0036', 'Placed order by mistake'],
  ['MCCR0040', 'Higher discounts available on other app'],
  ['MCCR0046', 'Delay in delivery'],
  ['MCCR0047', 'Delay in order confirmation'],
  ['MCCR0048', 'Do not require medicines any longer'],
  ['MCCR0049', 'Already purchased'],
];

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

  const client = useApolloClient();

  const [selectedTab, setSelectedTab] = useState<string>(
    showOrderSummaryTab ? string.orders.viewBill : string.orders.trackOrder
  );
  const [isCancelVisible, setCancelVisible] = useState(false);

  const { currentPatient } = useAllCurrentPatients();
  const { data, loading, refetch } = useQuery<
    GetMedicineOrderDetails,
    GetMedicineOrderDetailsVariables
  >(GET_MEDICINE_ORDER_DETAILS, {
    variables: { patientId: currentPatient && currentPatient.id, orderAutoId: orderAutoId },
  });
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
                status={getOrderStatusText(order!.orderStatus!)}
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
  const [comment, setComment] = useState('');
  const [overlayDropdown, setOverlayDropdown] = useState(false);
  const renderReturnOrderOverlay = () => {
    const optionsDropdown = overlayDropdown && (
      <Overlay
        onBackdropPress={() => setOverlayDropdown(false)}
        isVisible={overlayDropdown}
        overlayStyle={styles.dropdownOverlayStyle}
      >
        <DropDown
          cardContainer={{
            margin: 0,
          }}
          options={cancelOptions.map(
            (item, i) =>
              ({
                onPress: () => {
                  setSelectedReason(item[1]);
                  setOverlayDropdown(false);
                },
                optionText: item[1],
              } as Option)
          )}
        />
      </Overlay>
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
              style={[
                {
                  flex: 0.9,
                  ...theme.fonts.IBMPlexSansMedium(18),
                  color: theme.colors.SHERPA_BLUE,
                },
                selectedReason ? {} : { opacity: 0.3 },
              ]}
              numberOfLines={1}
            >
              {selectedReason || 'Select reason for cancelling'}
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
          value={comment}
          onChangeText={(text) => {
            setComment(text);
          }}
          label={'Add Comments (Optional)'}
          placeholder={'Enter your comments here…'}
        />
      </View>
    );

    const bottomButton = (
      <Button
        style={{ margin: 16, marginTop: 32, width: 'auto' }}
        onPress={onPressConfirmCancelOrder}
        disabled={!!!selectedReason}
        title={'SUBMIT REQUEST'}
      />
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
              onPress={() => {
                setCancelVisible(!isCancelVisible);
                setSelectedReason('');
              }}
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

  const onPressConfirmCancelOrder = () => {
    setShowSpinner(true);
    client
      .mutate<saveOrderCancelStatus, saveOrderCancelStatusVariables>({
        mutation: SAVE_ORDER_CANCEL_STATUS,
        variables: {
          orderCancelInput: {
            orderNo: orderAutoId,
            remarksCode: cancelOptions.find((item) => item[1] == selectedReason)![0]!,
          },
        },
      })
      .then(({ data }) => {
        console.log({
          s: data!.saveOrderCancelStatus!,
        });
        const setInitialSate = () => {
          setShowSpinner(false);
          setCancelVisible(false);
          setComment('');
          setSelectedReason('');
          setMenuOpen(false);
        };
        const requestStatus = g(data, 'saveOrderCancelStatus', 'requestStatus');
        if (requestStatus == 'true') {
          refetch()
            .then(() => {
              setInitialSate();
            })
            .catch(() => {
              setInitialSate();
            });
        } else {
          Alert.alert('Error', g(data, 'saveOrderCancelStatus', 'requestMessage')!);
        }
      })
      .catch((e) => {
        setShowSpinner(false);
        handleGraphQlError(e);
      });
  };

  const onPressCancelOrder = () => {
    setMenuOpen(false);
    const isDelivered = orderStatusList.find(
      (item) => item!.orderStatus == MEDICINE_ORDER_STATUS.DELIVERED
    );
    const isCancelled = orderStatusList.find(
      (item) => item!.orderStatus == MEDICINE_ORDER_STATUS.CANCELLED
    );

    if (isDelivered) {
      Alert.alert('Alert', 'You cannot cancel the order wich is delivered.');
    } else if (isCancelled) {
      Alert.alert('Alert', 'Order is already cancelled.');
    } else {
      setCancelVisible(true);
    }
  };

  const [isMenuOpen, setMenuOpen] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const renderMenuOptions = () => {
    if (isMenuOpen) {
      return (
        <View style={{ position: 'absolute', top: 0, right: 0 }}>
          <DropDown
            options={[
              {
                optionText: 'Cancel Order',
                onPress: () => onPressCancelOrder(),
              },
            ]}
          />
        </View>
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
      {(loading || showSpinner) && <Spinner style={{ zIndex: 200 }} />}
    </View>
  );
};
