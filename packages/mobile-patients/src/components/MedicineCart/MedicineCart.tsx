import React, { useEffect, useRef, useState } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  BackHandler,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { CartItemsList } from '@aph/mobile-patients/src/components/MedicineCart/Components/CartItemsList';
import {
  useShoppingCart,
  ShoppingCartItem,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { FreeDelivery } from '@aph/mobile-patients/src/components/MedicineCart/Components/FreeDelivery';
import { AmountCard } from '@aph/mobile-patients/src/components/MedicineCart/Components/AmountCard';
import { Coupon } from '@aph/mobile-patients/src/components/MedicineCart/Components/Coupon';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { Savings } from '@aph/mobile-patients/src/components/MedicineCart/Components/Savings';
import { KerbSidePickup } from '@aph/mobile-patients/src/components/MedicineCart/Components/KerbSidePickup';
import { ProceedBar } from '@aph/mobile-patients/src/components/MedicineCart/Components/ProceedBar';
import { ChooseAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/ChooseAddress';
import { useApolloClient } from 'react-apollo-hooks';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '../../graphql/types/getPatientAddressList';
import { GET_PATIENT_ADDRESS_LIST } from '@aph/mobile-patients/src/graphql/profiles';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { g } from '@aph/mobile-patients/src//helpers/helperFunctions';
import {
  pinCodeServiceabilityApi247,
  availabilityApi247,
  GetTatResponse247,
  TatApiInput247,
  getDeliveryTAT247,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { Prescriptions } from '@aph/mobile-patients/src/components/MedicineCart/Components/Prescriptions';
import { UploadPrescription } from '@aph/mobile-patients/src/components/MedicineCart/Components/UploadPrescription';
import { UnServiceable } from '@aph/mobile-patients/src/components/MedicineCart/Components/UnServiceable';
export interface MedicineCartProps extends NavigationScreenProps {}

export const MedicineCart: React.FC<MedicineCartProps> = (props) => {
  const {
    setCoupon,
    cartTotal,
    couponProducts,
    cartItems,
    setAddresses,
    setCartItems,
    setCouponProducts,
    addresses,
    deliveryAddressId,
    setDeliveryAddressId,
  } = useShoppingCart();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const [loading, setloading] = useState<boolean>(false);
  const [lastCartItems, setlastCartItems] = useState('');
  const [storeType, setStoreType] = useState<string | undefined>('');
  const [shopId, setShopId] = useState<string | undefined>('');
  const [deliveryTime, setdeliveryTime] = useState<string>('');
  const [showPopUp, setshowPopUp] = useState<boolean>(false);
  const [isfocused, setisfocused] = useState<boolean>(false);

  useEffect(() => {
    fetchAddress();
  }, []);

  useEffect(() => {
    availabilityTat();
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setisfocused(true);
    });
    const didBlur = props.navigation.addListener('didBlur', (payload) => {
      setisfocused(false);
    });
    return () => {
      didFocus && didFocus.remove();
      didBlur && didBlur.remove();
    };
  }, []);

  useEffect(() => {
    if (!deliveryAddressId && cartItems.length > 0) {
      setCartItems!(cartItems.map((item) => ({ ...item, unserviceable: false })));
    }
  }, [deliveryAddressId]);

  useEffect(() => {
    if (isfocused) {
      availabilityTat();
      console.log('inside CArt useEffect');
    }
  }, [deliveryAddressId, cartItems]);

  async function fetchAddress() {
    try {
      if (addresses.length) {
        return;
      }
      const userId = g(currentPatient, 'id');
      const response = await client.query<getPatientAddressList, getPatientAddressListVariables>({
        query: GET_PATIENT_ADDRESS_LIST,
        variables: { patientId: userId },
        fetchPolicy: 'no-cache',
      });
      const { data } = response;
      const addressList =
        (data.getPatientAddressList
          .addressList as savePatientAddress_savePatientAddress_patientAddress[]) || [];
      setAddresses!(addressList);
    } catch (error) {
      console.log(error);
      renderAlert(`Something went wrong, unable to fetch addresses.`);
    }
  }

  async function checkServicability(address: savePatientAddress_savePatientAddress_patientAddress) {
    if (deliveryAddressId && deliveryAddressId == address.id) {
      return;
    }
    try {
      setloading(true);
      const response = await pinCodeServiceabilityApi247(address.zipcode!);
      const { data } = response;
      console.log(data);
      if (data.response) {
        setDeliveryAddressId && setDeliveryAddressId(address.id);
      } else {
        setDeliveryAddressId && setDeliveryAddressId('');
        setloading(false);
      }
    } catch (error) {
      console.log(error);
      setloading(false);
    }
  }

  async function availabilityTat() {
    const newCartItems =
      cartItems.map(({ id, quantity }) => id + quantity).toString() + deliveryAddressId;
    if (newCartItems == lastCartItems) {
      return;
    }
    if (deliveryAddressId && cartItems.length > 0) {
      setloading(true);
      setlastCartItems(newCartItems);
      const skus = cartItems.map((item) => item.id);
      const selectedAddress: any = addresses.find((item) => item.id == deliveryAddressId);
      try {
        const response = await availabilityApi247(selectedAddress.zipcode || '', skus.join(','));
        console.log('in cart >>', response.data);
        const items = g(response, 'data', 'response') || [];
        const unserviceableSkus = items.filter(({ exist }) => exist == false).map(({ sku }) => sku);
        const updatedCartItems = cartItems.map((item) => ({
          ...item,
          unserviceable: unserviceableSkus.indexOf(item.id) != -1,
        }));
        setCartItems!(updatedCartItems);
        if (unserviceableSkus.length) {
          // showUnServiceableItemsAlert(updatedCartItems);
        }
        const serviceableItems = updatedCartItems
          .filter((item) => !item.unserviceable)
          .map((item) => {
            return { sku: item.id, qty: item.quantity };
          });

        const tatInput: TatApiInput247 = {
          pincode: selectedAddress.zipcode || '',
          lat: selectedAddress?.latitude!,
          lng: selectedAddress?.longitude!,
          items: serviceableItems,
        };
        const res = await getDeliveryTAT247(tatInput);
        console.log('res >>', res.data);
        const tatTimeStamp = g(res, 'data', 'response', 'tatU');
        if (tatTimeStamp && tatTimeStamp !== -1) {
          const deliveryDate = g(res, 'data', 'response', 'tat');
          if (deliveryDate) {
            const inventoryData = g(res, 'data', 'response', 'items') || [];
            if (inventoryData && inventoryData.length) {
              setloading!(false);
              setStoreType(g(res, 'data', 'response', 'storeCode'));
              setShopId(g(res, 'data', 'response', 'storeType'));
              setdeliveryTime(deliveryDate);
              updatePricesAfterTat(inventoryData, updatedCartItems);
            }
          } else {
            setloading(false);
          }
        } else {
          setloading(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  function updatePricesAfterTat(
    inventoryData: GetTatResponse247['response']['items'],
    updatedCartItems: ShoppingCartItem[]
  ) {
    let Items: ShoppingCartItem[] = [];
    updatedCartItems.forEach((item) => {
      let object = item;
      let cartItem = inventoryData.filter((cartItem) => cartItem.sku == item.id);
      if (cartItem.length) {
        if (object.price != Number(object.mou) * cartItem[0].mrp && cartItem[0].mrp != 0) {
          object.specialPrice &&
            (object.specialPrice =
              Number(object.mou) * cartItem[0].mrp * (object.specialPrice / object.price));
          object.price = Number(object.mou) * cartItem[0].mrp;
        }
      }
      Items.push(object);
    });
    setCartItems!(Items);
    console.log(loading);
  }

  function showAddressPopup() {
    showAphAlert!({
      title: string.common.selectAddress,
      children: (
        <ChooseAddress
          addresses={addresses}
          deliveryAddressId={deliveryAddressId}
          onPressAddAddress={() => {}}
          onPressEditAddress={(address) => {
            console.log(address);
          }}
          onPressSelectAddress={(address) => {
            checkServicability(address);
            hideAphAlert && hideAphAlert();
          }}
        />
      ),
    });
  }

  const headerRightComponent = () => {
    return (
      <TouchableOpacity activeOpacity={0.5} onPress={() => {}}>
        <Text style={{ ...theme.fonts.IBMPlexSansSemiBold(13), color: theme.colors.APP_YELLOW }}>
          ADD ITEMS
        </Text>
      </TouchableOpacity>
    );
  };
  const renderHeader = () => {
    return (
      <Header
        container={styles.header}
        leftIcon={'backArrow'}
        title={'YOUR CART'}
        rightComponent={headerRightComponent()}
        onPressLeftIcon={() => {
          CommonLogEvent(AppRoutes.YourCart, 'Go back to add items');
          props.navigation.goBack();
        }}
      />
    );
  };

  const renderAlert = (message: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
    });
  };

  const removeFreeProductsFromCart = () => {
    const updatedCartItems = cartItems.filter((item) => item.price != 0);
    setCartItems!(updatedCartItems);
    setCouponProducts!([]);
  };

  function applyCoupon() {
    if (cartTotal == 0) {
      renderAlert('Please add items in the cart to apply coupon.');
    } else {
      props.navigation.navigate(AppRoutes.ApplyCouponScene);
      setCoupon!(null);
      if (couponProducts.length) {
        removeFreeProductsFromCart();
      }
    }
  }

  const renderCartItems = () => {
    return <CartItemsList screen={'cart'} />;
  };
  const renderAvailFreeDelivery = () => {
    return <FreeDelivery />;
  };

  const renderCouponSection = () => {
    return (
      <Coupon onPressApplyCoupon={() => applyCoupon()} onPressRemove={() => setCoupon!(null)} />
    );
  };

  const renderAmountSection = () => {
    return (
      <View>
        <View style={styles.amountHeader}>
          <Text style={styles.amountHeaderText}>TOTAL CHARGES</Text>
        </View>
        {renderCouponSection()}
        <AmountCard />
      </View>
    );
  };

  const renderSavings = () => {
    return <Savings />;
  };

  const renderuploadPrescriptionPopup = () => {
    return (
      <UploadPrescription
        showPopUp={showPopUp}
        onClickClose={() => setshowPopUp(false)}
        navigation={props.navigation}
      />
    );
  };

  const renderPrescriptions = () => {
    return <Prescriptions onPressUploadMore={() => setshowPopUp(true)} />;
  };

  const renderKerbSidePickup = () => {
    return (
      <KerbSidePickup
        style={{ marginTop: 20 }}
        onPressProceed={() => {
          props.navigation.navigate(AppRoutes.StorePickup);
        }}
      />
    );
  };

  const renderProceedBar = () => {
    return (
      <ProceedBar
        onPressAddDeliveryAddress={() => showAddressPopup()}
        onPressUploadPrescription={() =>
          props.navigation.navigate(AppRoutes.CartSummary, {
            deliveryTime: deliveryTime,
          })
        }
        onPressProceedtoPay={() => {
          console.log('proceed to pay');
        }}
        deliveryTime={deliveryTime}
        onPressChangeAddress={showAddressPopup}
      />
    );
  };

  const renderUnServiceable = () => {
    return <UnServiceable style={{ marginTop: 24 }} />;
  };
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
          {renderHeader()}
          {renderUnServiceable()}
          {renderCartItems()}
          {renderAvailFreeDelivery()}
          {renderAmountSection()}
          {renderSavings()}
          {renderPrescriptions()}
          {renderKerbSidePickup()}
        </ScrollView>
        {renderuploadPrescriptionPopup()}
        {renderProceedBar()}
        {loading && <Spinner />}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    marginTop: 20,
    marginHorizontal: 20,
  },
  amountHeaderText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
});
