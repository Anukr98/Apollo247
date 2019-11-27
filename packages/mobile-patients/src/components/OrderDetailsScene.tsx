import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { OrderSummary } from '@aph/mobile-patients/src/components/OrderSummaryView';
import {
  EPrescription,
  ShoppingCartItem,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DropDown, Option } from '@aph/mobile-patients/src/components/ui/DropDown';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CrossPopup, DropdownGreen, More } from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { OrderProgressCard } from '@aph/mobile-patients/src/components/ui/OrderProgressCard';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  GET_MEDICINE_ORDER_DETAILS,
  SAVE_ORDER_CANCEL_STATUS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  GetMedicineOrderDetails,
  GetMedicineOrderDetailsVariables,
  GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails,
} from '@aph/mobile-patients/src/graphql/types/GetMedicineOrderDetails';
import { MEDICINE_ORDER_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  saveOrderCancelStatus,
  saveOrderCancelStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/saveOrderCancelStatus';
import { getMedicineDetailsApi } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  aphConsole,
  g,
  getOrderStatusText,
  handleGraphQlError,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
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
  const { getPatientApiCall } = useAuth();
  const { cartItems, setCartItems, ePrescriptions, setEPrescriptions } = useShoppingCart();
  const { showAphAlert, setLoading } = useUIElements();

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  const { data, loading, refetch } = useQuery<
    GetMedicineOrderDetails,
    GetMedicineOrderDetailsVariables
  >(GET_MEDICINE_ORDER_DETAILS, {
    variables: { patientId: currentPatient && currentPatient.id, orderAutoId: orderAutoId },
  });
  const order = g(data, 'getMedicineOrderDetails', 'MedicineOrderDetails');
  console.log({ order });

  const orderDetails = ((!loading && order) ||
    {}) as GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails;
  const orderStatusList = ((!loading && order && order.medicineOrdersStatus) || []).filter(
    (item) => item!.orderStatus != MEDICINE_ORDER_STATUS.QUOTE
  );

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

  const showErrorPopup = (desc: string) => {
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: desc,
    });
  };

  const getFormattedDate = (time: string) => {
    return moment(time).format('D MMM YYYY');
  };

  const getFormattedTime = (time: string) => {
    return moment(time).format('hh:mm a');
  };

  const reOrder = () => {
    setLoading!(true);
    const items = (orderDetails!.medicineOrderLineItems || [])
      .map((item) => ({
        sku: item!.medicineSKU!,
        qty: item!.quantity!,
      }))
      .filter((item) => item.sku);
    Promise.all(items.map((item) => getMedicineDetailsApi(item!.sku!)))
      .then((result) => {
        const itemsToAdd = result
          .map(({ data: { productdp } }, index) => {
            const medicineDetails = (productdp && productdp[0]) || {};
            if (!medicineDetails.is_in_stock) return null;
            return {
              id: medicineDetails!.sku!,
              mou: medicineDetails.mou,
              name: medicineDetails!.name,
              price: medicineDetails!.price,
              quantity: items[index].qty || 1,
              prescriptionRequired: medicineDetails.is_prescription_required == '1',
              thumbnail: medicineDetails.thumbnail || medicineDetails.image,
            } as ShoppingCartItem;
          })
          .filter((item) => item) as ShoppingCartItem[];

        const itemsToAddSkus = itemsToAdd.map((i) => i.id);
        const itemsToAddInCart = [
          ...itemsToAdd,
          ...cartItems.filter((item) => !itemsToAddSkus.includes(item.id!)),
        ];
        setCartItems!(itemsToAddInCart);

        // Adding prescriptions
        if (orderDetails!.prescriptionImageUrl) {
          const imageUrls = orderDetails!.prescriptionImageUrl
            .split(',')
            .map((item) => item.trim());

          const ePresToAdd = imageUrls.map(
            (item) =>
              ({
                id: item,
                date: moment(order!.medicineOrdersStatus![0]!.statusDate).format('DD MMM YYYY'),
                doctorName: '',
                forPatient: (currentPatient && currentPatient.firstName) || '',
                medicines: (order!.medicineOrderLineItems || [])
                  .map((item) => item!.medicineName)
                  .join(', '),
                uploadedUrl: item,
              } as EPrescription)
          );
          const ePresIds = ePresToAdd.map((i) => i!.uploadedUrl);
          setEPrescriptions!([
            ...ePrescriptions.filter((item) => !ePresIds.includes(item.uploadedUrl!)),
            ...ePresToAdd,
          ]);
        }

        setLoading!(false);
        if (items.length > itemsToAdd.length) {
          showErrorPopup('Few items are out of stock.');
        }
        props.navigation.navigate(AppRoutes.YourCart, { isComingFromConsult: true });
      })
      .catch((e) => {
        setLoading!(false);
        showErrorPopup('Something went wrong.');
      });
  };

  const renderOrderHistory = () => {
    const isDelivered = orderStatusList.find(
      (item) => item!.orderStatus == MEDICINE_ORDER_STATUS.DELIVERED
    );

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
        {isDelivered ? (
          <Button
            style={{ flex: 1, width: '80%', alignSelf: 'center' }}
            onPress={() => reOrder()}
            title={'RE-ORDER'}
          />
        ) : null}
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
        aphConsole.log({
          s: data!.saveOrderCancelStatus!,
        });
        const setInitialSate = () => {
          setShowSpinner(false);
          setCancelVisible(false);
          setComment('');
          setSelectedReason('');
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

  // const onPressCancelOrder = () => {
  // const isDelivered = orderStatusList.find(
  //   (item) => item!.orderStatus == MEDICINE_ORDER_STATUS.DELIVERED
  // );
  // const isCancelled = orderStatusList.find(
  //   (item) => item!.orderStatus == MEDICINE_ORDER_STATUS.CANCELLED
  // );
  // const isPrescriptionOrder = orderStatusList.find(
  //   (item) =>
  //     item!.orderStatus == MEDICINE_ORDER_STATUS.PRESCRIPTION_CART_READY ||
  //     item!.orderStatus == MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED
  // );
  // if (isDelivered) {
  //   showErrorPopup('You cannot cancel the order wich is delivered.');
  //   // Alert.alert('Alert', 'You cannot cancel the order wich is delivered.');
  // } else if (isCancelled) {
  //   showErrorPopup('Order is already cancelled.');
  //   // Alert.alert('Alert', 'Order is already cancelled.');
  // } else {
  //   setCancelVisible(true);
  // }
  // setCancelVisible(true);
  // };

  const [showSpinner, setShowSpinner] = useState(false);

  const renderMoreMenu = () => {
    const cannotCancelOrder = orderStatusList.find(
      (item) =>
        item!.orderStatus == MEDICINE_ORDER_STATUS.DELIVERED ||
        item!.orderStatus == MEDICINE_ORDER_STATUS.CANCELLED ||
        item!.orderStatus == MEDICINE_ORDER_STATUS.PRESCRIPTION_CART_READY ||
        item!.orderStatus == MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED
    );
    if (cannotCancelOrder || !orderStatusList.length) return null;
    return (
      <MaterialMenu
        options={['Cancel Order'].map((item) => ({
          key: item,
          value: item,
        }))}
        menuContainerStyle={{
          alignItems: 'center',
          marginTop: 24,
        }}
        lastContainerStyle={{ borderBottomWidth: 0 }}
        bottomPadding={{ paddingBottom: 0 }}
        itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b') }}
        onPress={(item) => {
          if (item.value == 'Cancel Order') {
            setCancelVisible(true);
          }
        }}
      >
        <More />
      </MaterialMenu>
    );
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
            rightComponent={renderMoreMenu()}
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
      {(loading || showSpinner) && <Spinner style={{ zIndex: 200 }} />}
    </View>
  );
};
