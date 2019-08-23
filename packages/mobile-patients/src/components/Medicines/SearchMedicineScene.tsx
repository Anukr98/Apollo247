import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon, Filter } from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  addProductToCartApi,
  MedicineProduct,
  removeProductFromCartApi,
  searchMedicineApi,
  incOrDecProductCountToCartApi,
  getCartInfo,
  setLocalCartInfo,
  CartInfoResponse,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AxiosResponse } from 'axios';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { FlatList, NavigationScreenProps, ScrollView } from 'react-navigation';
import { AppRoutes } from '../NavigatorContainer';

const styles = StyleSheet.create({
  safeAreaViewStyle: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  headerStyle: {},
  headerSearchInputShadow: {},
  labelView: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#ff748e',
    height: 14,
    width: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    ...theme.fonts.IBMPlexSansBold(9),
    color: theme.colors.WHITE,
  },
  searchValueStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SHERPA_BLUE,
  },
  deliveryPinCodeContaner: {
    paddingHorizontal: 20,
    paddingTop: 13,
    paddingBottom: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f7f8f5',
  },
  pinCodeStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHERPA_BLUE,
    flex: 0.9,
  },
  pinCodeTextInput: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHERPA_BLUE,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
    paddingBottom: 3,
    paddingLeft: Platform.OS === 'ios' ? 0 : -3,
    paddingTop: 0,
    width: 51,
  },
  sorryTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#890000',
    paddingVertical: 8,
  },
  pastSearchContainerStyle: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginHorizontal: 20,
  },
  pastSearchItemStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: 'white',
    marginTop: 16,
    marginRight: 16,
  },
  pastSearchTextStyle: {
    color: '#00b38e',
    padding: 12,
    ...theme.fonts.IBMPlexSansSemiBold(14),
  },
});

type MedicineCardState = {
  // subscriptionStatus: 'already-subscribed' | 'subscribed-now' | 'unsubscribed';
  isCardExpanded: boolean;
  isAddedToCart: boolean;
  unit: number;
};

export interface SearchMedicineSceneProps extends NavigationScreenProps {}

export const SearchMedicineScene: React.FC<SearchMedicineSceneProps> = (props) => {
  const [showMatchingMedicines, setShowMatchingMedicines] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [medicineList, setMedicineList] = useState<MedicineProduct[]>([]);
  const [pinCode, setPinCode] = useState<string>('500033');
  const [medicineCardStatus, setMedicineCardStatus] = useState<{
    [sku: string]: MedicineCardState;
  }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    getCartInfo()
      .then((cartInfo) => {
        let cartStatus = {} as { [sku: string]: MedicineCardState };
        cartInfo &&
          cartInfo.items.forEach((item) => {
            cartStatus[item.sku] = { isAddedToCart: true, isCardExpanded: true, unit: item.qty };
          });
        setMedicineCardStatus({
          ...medicineCardStatus,
          ...cartStatus,
        });
      })
      .catch(() => {});
  }, []);

  const showGenericALert = (e: { response: AxiosResponse }) => {
    const error = e && e.response && e.response.data.message;
    console.log({ errorResponse: e.response, error }); //remove this line later
    Alert.alert('Error', error || 'Unknown error occurred.');
  };

  const onSearchMedicine = (searchText: string) => {
    setSearchText(searchText);
    if (!(searchText && searchText.length > 2)) {
      setMedicineList([]);
      return;
    }
    setIsLoading(true);
    searchMedicineApi(searchText)
      .then(async ({ data }) => {
        // let cartInfo: CartInfoResponse | null = null;
        // try {
        //   cartInfo = await getCartInfo();
        // } catch (error) {
        //   console.log(error);
        // }

        const products = data.products || [];
        // products.forEach((medicine) => {
        // const cartItem =
        //   cartInfo && cartInfo.items.find((cartItem) => cartItem.sku == medicine.sku);
        // if (cartItem) {
        //   setMedicineCardStatus({
        //     ...medicineCardStatus,
        //     [medicine.sku]: { isAddedToCart: true, isCardExpanded: true, unit: cartItem.qty },
        //   });
        // }
        // });
        setMedicineList(products);
        setIsLoading(false);
      })
      .catch((e) => {
        setIsLoading(false);
        showGenericALert(e);
      });
  };

  const onPressAddToCart = (medicine: MedicineProduct) => {
    addProductToCartApi(medicine.sku)
      .then(async ({ data }) => {
        let cartInfo: CartInfoResponse | null = null;
        // let cartItemId = 0;
        try {
          cartInfo = await getCartInfo();
          console.log({ cartInfo });
          // const cartItem = cartInfo.items.find((cartItem) => cartItem.sku == medicine.sku);
          // cartItemId = (cartItem && cartItem.item_id) || 0;
        } catch (error) {
          console.log(error);
        }
        // add to local cart
        console.log('cartInfo before', { cartInfo });
        const cartItemIndex = cartInfo!.items.findIndex((cartItem) => cartItem.sku == medicine.sku);
        if (cartItemIndex == -1) {
          setLocalCartInfo({ ...cartInfo!, items: [...cartInfo!.items, data] });
        } else {
          const items = cartInfo!.items.map((m, i) => {
            return i == cartItemIndex ? { ...m, ...{ qty: data.qty } } : m;
          });

          const updatedCart = { ...cartInfo!, items: [...items] };
          console.log({ updatedCart });
          setLocalCartInfo(updatedCart);
        }

        // console.log('cartItems', { cartItems });
        // setLocalCartInfo({ ...cartInfo!, items: [...cartInfo!.items, ...cartItems] });

        setMedicineCardStatus({
          ...medicineCardStatus,
          [medicine.sku]: {
            isAddedToCart: true,
            isCardExpanded: true,
            unit: data.qty,
          },
        });
      })
      .catch((e) => {
        showGenericALert(e);
      });
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
      })
      .catch((e) => {
        showGenericALert(e);
      });
  };

  const onChangeUnitFromCart = async (medicine: MedicineProduct, unit: number) => {
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
          [medicine.sku]: { ...medicineCardStatus[medicine.sku], unit: data.qty },
        });
        const cartItems = cartInfo!.items.map((item) => (item.item_id != cartItemId ? item : data));
        setLocalCartInfo({ ...cartInfo!, items: cartItems });
      })
      .catch((e) => {
        showGenericALert(e);
      });
  };

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const renderHeader = () => {
    console.log({ medicineCardStatus });
    const cartItems = Object.keys(medicineCardStatus).filter(
      (m) => medicineCardStatus[m].isAddedToCart
    ).length;
    return (
      <Header
        container={{ borderBottomWidth: 0 }}
        leftIcon={'backArrow'}
        title={'SEARCH MEDICINE'}
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={{ marginRight: 24 }}
              onPress={() => {
                console.log('YourCartProps onpress');
                props.navigation.navigate(AppRoutes.YourCart);
              }}
            >
              <CartIcon />
              {cartItems > 0 && renderBadge(cartItems, {})}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
              <Filter />
            </TouchableOpacity>
          </View>
        }
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const isNoMedicinesFound = !isLoading && searchText.length > 2 && medicineList.length == 0;

  const renderSorryMessage = isNoMedicinesFound ? (
    <Text style={styles.sorryTextStyle}>Sorry, we couldn’t find what you are looking for :(</Text>
  ) : (
    <View style={{ paddingBottom: 19 }} />
  );

  const performTextInputEvent = (event: 'focus' | 'blur') => {
    searchText.length < 3 && setShowMatchingMedicines(event == 'focus' ? true : false);
  };

  const renderSearchInput = () => {
    return (
      <View style={{ paddingHorizontal: 20, backgroundColor: theme.colors.WHITE }}>
        <TextInputComponent
          conatinerstyles={{ paddingBottom: 0 }}
          inputStyle={[
            styles.searchValueStyle,
            isNoMedicinesFound ? { borderBottomColor: '#e50000' } : {},
          ]}
          textInputprops={isNoMedicinesFound ? { selectionColor: '#e50000' } : {}}
          autoCorrect={false}
          value={searchText}
          placeholder="Enter name of the medicine"
          underlineColorAndroid="transparent"
          onChangeText={(value) => {
            onSearchMedicine(value);
          }}
          onFocus={() => performTextInputEvent('focus')}
          onBlur={() => {} /*performTextInputEvent('blur')*/}
        />
        {renderSorryMessage}
      </View>
    );
  };

  /**
   * @description returns true if empty string or starts with number other than zero else false
   */
  const isValidPinCode = (text: string): boolean => /^(\s*|[1-9][0-9]*)$/.test(text);

  const renderDeliveryPinCode = () => {
    return (
      <View style={styles.deliveryPinCodeContaner}>
        <Text numberOfLines={1} style={styles.pinCodeStyle}>
          Delivery Pincode
        </Text>
        <TextInput
          maxLength={6}
          value={pinCode}
          onChange={({ nativeEvent: { text } }) => isValidPinCode(text) && setPinCode(text)}
          underlineColorAndroid="transparent"
          style={styles.pinCodeTextInput}
        />
      </View>
    );
  };

  const renderPastSearchItem = (
    id: string,
    pastSearch: string,
    containerStyle: StyleProp<ViewStyle>
  ) => {
    return (
      <TouchableOpacity
        key={id}
        style={[styles.pastSearchItemStyle, containerStyle]}
        onPress={() => {
          props.navigation.navigate(AppRoutes.MedicineDetailsScene, { medicineId: id });
        }}
      >
        <Text style={styles.pastSearchTextStyle}>{pastSearch}</Text>
      </TouchableOpacity>
    );
  };

  const renderPastSearches = () => {
    return (
      <>
        <SectionHeaderComponent sectionTitle={'Past Searches'} style={{ marginBottom: 0 }} />
        <View style={styles.pastSearchContainerStyle}>
          {string.medicine.pastMedicineSearches.map((pastSearch, i, array) =>
            renderPastSearchItem(
              pastSearch.id,
              pastSearch.name,
              i == array.length - 1 ? { marginRight: 0 } : {}
            )
          )}
        </View>
        <NeedHelpAssistant containerStyle={{ marginTop: 84 }} />
      </>
    );
  };

  const renderMedicineCard = (
    medicine: MedicineProduct,
    index: number,
    array: MedicineProduct[]
  ) => {
    const medicineCardContainerStyle = [
      { marginBottom: 8, marginHorizontal: 20 },
      index == 0 ? { marginTop: 20 } : {},
      index == array.length - 1 ? { marginBottom: 20 } : {},
    ];
    return (
      <MedicineCard
        containerStyle={medicineCardContainerStyle}
        onPress={() => {
          props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
            sku: medicine.sku,
            title: medicine.name,
          });
        }}
        medicineName={medicine.name}
        price={medicine.price}
        unit={(medicineCardStatus[medicine.sku] && medicineCardStatus[medicine.sku].unit) || 1}
        onPressAdd={() => {
          onPressAddToCart(medicine);
        }}
        onPressRemove={() => {
          onPressRemoveFromCart(medicine);
        }}
        onChangeUnit={(unit) => {
          console.log('onChangeUnitFromCart', { id: medicine.id, unit, sku: medicine.sku });
          onChangeUnitFromCart(medicine, unit);
        }}
        isCardExpanded={
          medicineCardStatus[medicine.sku] && medicineCardStatus[medicine.sku].isCardExpanded
        }
        isInStock={medicine.status == 1}
        isPrescriptionRequired={medicine.is_prescription_required == '1'}
        subscriptionStatus={
          // (medicineCardStatus[medicine.sku] && medicineCardStatus[medicine.sku].subscriptionStatus) ||
          'unsubscribed'
        }
        onChangeSubscription={(status) => {
          setMedicineCardStatus({
            ...medicineCardStatus,
            // [medicine.sku]: { ...medicineCardStatus[medicine.sku], subscriptionStatus: status },
          });
        }}
        onEditPress={() => {}}
        onAddSubscriptionPress={() => {}}
      />
    );
  };

  const renderMatchingMedicines = () => {
    return (
      <>
        <SectionHeaderComponent
          sectionTitle={`Matching Medicines — ${medicineList.length}`}
          style={{ marginBottom: 0 }}
        />
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={medicineList}
            renderItem={({ item, index }) => renderMedicineCard(item, index, medicineList)}
            keyExtractor={(_, index) => `${index}`}
            bounces={false}
          />
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaViewStyle}>
      <View style={styles.headerSearchInputShadow}>
        {renderHeader()}
        {renderSearchInput()}
      </View>
      {renderDeliveryPinCode()}
      <ScrollView bounces={false}>
        {showMatchingMedicines ? renderMatchingMedicines() : renderPastSearches()}
      </ScrollView>
    </SafeAreaView>
  );
};
