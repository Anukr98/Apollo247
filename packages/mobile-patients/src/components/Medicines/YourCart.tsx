import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { ArrowRight, CouponIcon, MedicineIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  CartInfoResponse,
  CartItem,
  getCartInfo,
  MedicineProduct,
  removeProductFromCartApi,
  setLocalCartInfo,
  incOrDecProductCountToCartApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { FlatList, NavigationScreenProps, ScrollView } from 'react-navigation';
import { AuthContext } from '../AuthProvider';
import { AxiosResponse } from 'axios';

const styles = StyleSheet.create({
  labelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    marginHorizontal: 20,
  },
  labelTextStyle: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
  yellowTextStyle: {
    ...theme.viewStyles.yellowTextStyle,
    padding: 16,
  },
  blueTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  medicineCostStyle: {
    ...theme.fonts.IBMPlexSansBold(11),
    lineHeight: 20,
    color: theme.colors.SHERPA_BLUE,
  },
});

interface MedicineCardState {
  // subscriptionStatus: 'already-subscribed' | 'subscribed-now' | 'unsubscribed';
  isCardExpanded: boolean;
  isAddedToCart: boolean;
  unit: number;
  price: number;
}

export interface YourCartProps extends NavigationScreenProps {}

export const YourCart: React.FC<YourCartProps> = (props) => {
  const tabs = [{ title: 'Home Delivery' }, { title: 'Store Pick Up' }];
  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [selectedHomeDelivery, setselectedHomeDelivery] = useState<string>('');
  const [medicineList, setMedicineList] = useState<CartItem[]>([]);
  const [cartDetails, setcartDetails] = useState<CartInfoResponse>();
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [medicineCardStatus, setMedicineCardStatus] = useState<{
    [sku: string]: MedicineCardState;
  }>({});

  const { currentPatient } = useAllCurrentPatients();
  const addressList = useContext(AuthContext).addresses;
  const selectedAddressId = useContext(AuthContext).selectedAddressId;
  const setSelectedAddressId = useContext(AuthContext).setSelectedAddressId;
  const totalItemsPrices = Object.keys(medicineCardStatus).map(
    (sku) => medicineCardStatus[sku].price * medicineCardStatus[sku].unit
  );
  const grandTotal =
    totalItemsPrices.length > 0
      ? totalItemsPrices.reduce((accumulator, currentValue) => accumulator + currentValue)
      : 0;

  useEffect(() => {
    getCartInfo()
      .then((cartInfo) => {
        setcartDetails(cartInfo);
        let cartStatus = {} as typeof medicineCardStatus;
        cartInfo &&
          cartInfo.items.forEach((item) => {
            cartStatus[item.sku] = {
              isAddedToCart: true,
              isCardExpanded: true,
              unit: item.qty,
              price: item.price,
            };
          });
        setMedicineCardStatus({
          ...medicineCardStatus,
          ...cartStatus,
        });
        setMedicineList(cartInfo.items);
        setshowSpinner(false);
      })
      .catch(() => {
        setshowSpinner(false);
      });
  }, []);

  const showGenericALert = (e: { response: AxiosResponse }) => {
    const error = e && e.response && e.response.data.message;
    console.log({ errorResponse: e.response, error }); //remove this line later
    Alert.alert('Error', error || 'Unknown error occurred.');
  };

  const onPressRemoveFromCart = async (medicine: MedicineProduct) => {
    console.log({ id: medicine.id });
    let cartItemId = 0;
    let cartInfo: CartInfoResponse | null = null;
    try {
      cartInfo = await getCartInfo();
      const cartItem = cartInfo.items.find((cartItem) => cartItem.sku == medicine.sku);
      cartItemId = (cartItem && cartItem.item_id) || 0;
    } catch (error) {
      console.log(error);
    }
    if (!cartItemId) {
      Alert.alert('Error', 'Item does not exist in cart');
      return;
    }
    removeProductFromCartApi(cartItemId)
      .then(({ data }) => {
        console.log('onPressRemoveFromCar', data);
        const cloneOfMedicineCardStatus = { ...medicineCardStatus };
        delete cloneOfMedicineCardStatus[medicine.sku];
        setMedicineCardStatus(cloneOfMedicineCardStatus);
        // remove from local cart
        const cartItems = cartInfo!.items.filter((item) => item.item_id != cartItemId);
        setLocalCartInfo({ ...cartInfo!, items: cartItems });
        setcartDetails({ ...cartInfo!, items: cartItems });
      })
      .catch((e) => {
        showGenericALert(e);
      });
  };

  const onChangeUnitFromCart = async (medicine: MedicineProduct, unit: number) => {
    if (unit < 1) {
      return;
    }
    console.log({ id: medicine.id });
    let cartItemId = 0;
    let cartInfo: CartInfoResponse | null = null;
    try {
      cartInfo = await getCartInfo();
      const cartItem = cartInfo.items.find((cartItem) => cartItem.sku == medicine.sku);
      cartItemId = (cartItem && cartItem.item_id) || 0;
    } catch (error) {
      console.log(error);
    }
    if (!cartItemId) {
      Alert.alert('Error', 'Item does not exist in cart');
      return;
    }
    incOrDecProductCountToCartApi(medicine.sku, cartItemId, unit)
      .then(({ data }) => {
        console.log('onChangeUnitFromCart', data);
        setMedicineCardStatus({
          ...medicineCardStatus,
          [medicine.sku]: {
            ...medicineCardStatus[medicine.sku],
            unit: data.qty,
            price: data.price,
          },
        });
        const cartItems = cartInfo!.items.map((item) => (item.item_id != cartItemId ? item : data));
        setLocalCartInfo({ ...cartInfo!, items: cartItems });
      })
      .catch((e) => {
        showGenericALert(e);
      });
  };

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={'YOUR CART'}
        rightComponent={
          <View>
            <TouchableOpacity activeOpacity={1} onPress={() => props.navigation.pop()}>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansSemiBold(13),
                  color: theme.colors.APP_YELLOW,
                }}
              >
                ADD ITEMS
              </Text>
            </TouchableOpacity>
          </View>
        }
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderLabel = (label: string, rightText?: string) => {
    return (
      <View style={styles.labelView}>
        <Text style={styles.labelTextStyle}>{label}</Text>
        {rightText && <Text style={styles.labelTextStyle}>{rightText}</Text>}
      </View>
    );
  };

  const renderItemsInCart = () => {
    const cartItemsCount = Object.keys(medicineCardStatus).length || 0;
    const _cartItemsCount =
      cartItemsCount < 10 && cartItemsCount > 0 ? `0${cartItemsCount}` : cartItemsCount.toString();
    return (
      <View>
        {renderLabel('ITEMS IN YOUR CART', _cartItemsCount)}
        {medicineList.map((medicine, index, array) => {
          const medicineCardContainerStyle = [
            { marginBottom: 8, marginHorizontal: 20 },
            index == 0 ? { marginTop: 20 } : {},
            index == array.length - 1 ? { marginBottom: 20 } : {},
          ];
          return (
            <MedicineCard
              personName={
                currentPatient && currentPatient.firstName ? currentPatient.firstName : ''
              }
              containerStyle={medicineCardContainerStyle}
              key={medicine.sku}
              onPress={() => {
                props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
                  sku: medicine.sku,
                  title: medicine.name,
                });
              }}
              medicineName={medicine.name}
              price={medicine.price}
              unit={
                (medicineCardStatus[medicine.sku] && medicineCardStatus[medicine.sku].unit) || 1
              }
              onPressAdd={() => {}}
              onPressRemove={() => {
                onPressRemoveFromCart((medicine as unknown) as MedicineProduct);
              }}
              onChangeUnit={(unit) => {
                onChangeUnitFromCart((medicine as unknown) as MedicineProduct, unit);
              }}
              isCardExpanded={
                medicineCardStatus[medicine.sku] && medicineCardStatus[medicine.sku].isCardExpanded
              }
              isInStock={true}
              isPrescriptionRequired={/*medicine.is_prescription_required == '1'*/ false} //solve this problem by maintaing a state in cart
              subscriptionStatus={
                // (medicineCardStatus[medicine.sku] && medicineCardStatus[medicine.sku].subscriptionStatus) ||
                'unsubscribed'
              }
              onChangeSubscription={() => {}}
              onEditPress={() => {}}
              onAddSubscriptionPress={() => {}}
            />
          );
        })}
      </View>
    );
  };

  const renderUploadPrescription = () => {
    return (
      <View>
        {renderLabel('UPLOAD PRESCRIPTION')}
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            marginTop: 15,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(16),
              lineHeight: 24,
              color: theme.colors.SKY_BLUE,
              padding: 16,
            }}
          >{`Some of your medicines require prescription to make a purchase.\nPlease upload the necessary prescriptions.`}</Text>
          <Text
            style={{
              ...styles.yellowTextStyle,
              paddingTop: 0,
              textAlign: 'right',
            }}
          >
            UPLOAD
          </Text>
        </View>
      </View>
    );
  };

  const renderHomeDelivery = () => {
    const selectedAddressIndex =
      addressList && addressList.findIndex((address) => address.id == selectedAddressId);
    const addressListLength = addressList && addressList.length;
    const spliceStartIndex =
      selectedAddressIndex == addressListLength - 1
        ? selectedAddressIndex - 1
        : selectedAddressIndex;
    const startIndex = spliceStartIndex == -1 ? 0 : spliceStartIndex;

    return (
      <View
        style={{
          marginTop: 8,
          marginHorizontal: 16,
        }}
      >
        {addressList &&
          addressList.slice(startIndex, startIndex + 2).map((item, index) => {
            console.log({ item, i: item.id }, item.id === selectedAddressId);
            return (
              <RadioSelectionItem
                key={item.id}
                title={`${item.addressLine1}, ${item.addressLine2}\n${item.landmark}\n${item.city}, ${item.state} - ${item.zipcode}`}
                isSelected={selectedAddressId == item.id}
                onPress={() => {
                  setSelectedAddressId && setSelectedAddressId(item.id);
                }}
                containerStyle={{
                  marginTop: 16,
                }}
                hideSeparator={index + 1 === addressList.length}
              />
            );
          })}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={styles.yellowTextStyle}
            onPress={() => props.navigation.navigate(AppRoutes.AddAddress)}
          >
            ADD NEW ADDRESS
          </Text>
          <View>
            {addressList && addressList.length > 2 && (
              <Text
                style={styles.yellowTextStyle}
                onPress={() => props.navigation.navigate(AppRoutes.SelectDeliveryAddress)}
              >
                VIEW ALL
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderStorePickup = () => {
    return (
      <View
        style={{
          margin: 16,
          marginTop: 20,
        }}
      >
        <TextInputComponent />
        {[...addressList].slice(0, 2).map((item, index: number) => (
          <RadioSelectionItem
            title={item.addressLine1!}
            isSelected={selectedHomeDelivery === item.id}
            onPress={() => setselectedHomeDelivery(item.id)}
            containerStyle={{
              marginTop: 16,
            }}
            hideSeparator={index + 1 === addressList.length}
          />
        ))}
        <View>
          {addressList.length > 2 && (
            <Text
              style={{
                ...styles.yellowTextStyle,
                textAlign: 'right',
              }}
              onPress={() => props.navigation.navigate(AppRoutes.StorPickupScene)}
            >
              VIEW ALL
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderDelivery = () => {
    return (
      <View>
        {renderLabel('WHERE SHOULD WE DELIVER?')}
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            marginTop: 16,
            marginBottom: 24,
            overflow: 'hidden',
          }}
        >
          <TabsComponent
            style={{
              //   ...theme.viewStyles.cardViewStyle,
              borderRadius: 0,
              borderBottomWidth: 0.5,
              borderBottomColor: 'rgba(2, 71, 91, 0.2)',
            }}
            data={tabs}
            onChange={(selectedTab: string) => {
              setselectedTab(selectedTab);
            }}
            selectedTab={selectedTab}
          />
          {selectedTab === tabs[0].title ? renderHomeDelivery() : renderStorePickup()}
        </View>
      </View>
    );
  };

  const renderTotalCharges = () => {
    return (
      <View>
        {renderLabel('TOTAL CHARGES')}
        <TouchableOpacity activeOpacity={1}
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            marginTop: 16,
            marginBottom: 4,
            flexDirection: 'row',
            height: 56,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}
          onPress={() => props.navigation.navigate(AppRoutes.ApplyCouponScene)}
        >
          <CouponIcon />
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(16),
              color: theme.colors.SHERPA_BLUE,
              lineHeight: 24,
              paddingLeft: 16,
            }}
          >
            Apply Coupon
          </Text>
          <View
            style={{
              flex: 1,
              alignItems: 'flex-end',
            }}
          >
            <ArrowRight />
          </View>
        </TouchableOpacity>
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            marginTop: 4,
            marginBottom: 12,
            padding: 16,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.blueTextStyle}>Subtotal</Text>
            <Text style={styles.blueTextStyle}>Rs. {grandTotal}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.blueTextStyle}>Delivery Charges</Text>
            <Text style={styles.blueTextStyle}>+ Rs. {0}</Text>
          </View>
          <View style={[styles.separatorStyle, { marginTop: 16, marginBottom: 7 }]} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.blueTextStyle}>To Pay </Text>
            <Text style={[styles.blueTextStyle, { ...theme.fonts.IBMPlexSansBold }]}>
              {' '}
              Rs. {grandTotal}{' '}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  const medicineSuggestions = [
    {
      name: 'Metformin 500mg',
      requirePrescription: false,
      cost: 'Rs. 120',
    },
    {
      name: 'Metformin 500mg',
      requirePrescription: false,
      cost: 'Rs. 120',
    },
    {
      name: 'Metformin 500mg',
      requirePrescription: false,
      cost: 'Rs. 120',
    },
  ];

  const renderMedicineItem = (
    item: { name: string; cost: string },
    index: number,
    length: number
  ) => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          shadowRadius: 4,
          marginBottom: 20,
          marginTop: 11,
          marginHorizontal: 6,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        <MedicineIcon />
        <Text style={[styles.blueTextStyle, { paddingTop: 4 }]}>{item.name}</Text>
        <View style={[styles.separatorStyle, { marginTop: 3, marginBottom: 5 }]} />
        <Text style={styles.medicineCostStyle}>
          {item.cost} <Text style={{ ...theme.fonts.IBMPlexSansMedium(12) }}>/strip</Text>
        </Text>
      </View>
    );
  };

  const renderMedicineSuggestions = () => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardContainer,
          paddingTop: 16,
          marginTop: 12,
        }}
      >
        {renderLabel('YOU SHOULD ALSO ADD')}

        <FlatList
          contentContainerStyle={{
            marginHorizontal: 14,
          }}
          horizontal={true}
          bounces={false}
          data={medicineSuggestions}
          renderItem={({ item, index }) =>
            renderMedicineItem(item, index, medicineSuggestions.length)
          }
          keyExtractor={(_, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...theme.viewStyles.container }}>
        {renderHeader()}
        <ScrollView>
          <View style={{ marginVertical: 24 }}>
            {renderItemsInCart()}
            {renderUploadPrescription()}
            {renderDelivery()}
            {renderTotalCharges()}
            {renderMedicineSuggestions()}
          </View>
          <View style={{ height: 70 }} />
        </ScrollView>
        <StickyBottomComponent defaultBG>
          <Button
            title={`PROCEED TO PAY — RS. ${grandTotal}`}
            style={{ flex: 1, marginHorizontal: 40 }}
          />
        </StickyBottomComponent>
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};
