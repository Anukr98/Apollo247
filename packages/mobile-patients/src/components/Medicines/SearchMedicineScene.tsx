import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon, Filter } from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  addProductToCartApi,
  incOrDecProductCountToCartApi,
  MedicineProduct,
  quoteId,
  removeProductFromCartApi,
  searchMedicineApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Axios, { AxiosResponse } from 'axios';
import React, { useState } from 'react';
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
  subscriptionStatus: 'already-subscribed' | 'subscribed-now' | 'unsubscribed';
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
    [id: string]: MedicineCardState;
  }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      .then(({ data }) => {
        setIsLoading(false);
        setMedicineList(data.products || []);
      })
      .catch((e) => {
        setIsLoading(false);
        showGenericALert(e);
      });
  };

  const onPressAddToCart = (id: number, productSku: string) => {
    addProductToCartApi(productSku)
      .then(({ data }) => {
        setMedicineCardStatus({
          ...medicineCardStatus,
          [id]: { isAddedToCart: true, isCardExpanded: true, unit: data.qty },
        });
      })
      .catch((e) => {
        showGenericALert(e);
      });
  };

  const onPressRemoveFromCart = (id: number) => {
    removeProductFromCartApi(id)
      .then(({ data }) => {
        console.log('onPressRemoveFromCar', data);
        setMedicineCardStatus({
          ...medicineCardStatus,
          [id]: { isAddedToCart: false, isCardExpanded: false, unit: 0 },
        });
      })
      .catch((e) => {
        showGenericALert(e);
      });
  };

  const onChangeUnitFromCart = (id: number, sku: string, unit: number) => {
    incOrDecProductCountToCartApi(sku, id, unit)
      .then(({ data }) => {
        console.log('onChangeUnitFromCart', data);
        setMedicineCardStatus({
          ...medicineCardStatus,
          [id]: { ...medicineCardStatus[id], unit: data.qty },
        });
      })
      .catch((e) => {
        showGenericALert(e);
      });
  };

  const addToCart = (sku: string) => {
    const cartItem = {
      cartItem: {
        quote_id: quoteId,
        sku: sku,
        qty: 1,
      },
    };
    console.log(cartItem, 'cartItem', CartId, 'CartId');
    Axios.post(`http://api.apollopharmacy.in/rest/V1/guest-carts/${CartId}/items`, {
      cartItem,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer dp50h14gpxtqf8gi1ggnctqcrr0io6ms',
      },
    })
      .then((res) => {
        console.log(res, 'addToCart dt');
      })
      .catch((err) => {
        console.log(err, 'addToCart err');
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

  const fetchSearchData = (searchText: string) => {
    console.log('fetchSearchData');
    Axios.post(
      'http://uat.apollopharmacy.in/searchprd_api.php',
      { params: searchText },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer dp50h14gpxtqf8gi1ggnctqcrr0io6ms',
        },
      }
    )
      .then((res) => {
        //do something
        console.log(res, 'res');
        if (res.data.products) setMedicineList(res.data.products);
      })
      .catch((err) => {
        console.log(err, 'err');

        //do something
      });
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
        onPress={(_, sku) => {
          props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
            sku: sku,
            title: medicine.name,
          });
        }}
        id={medicine.id}
        sku={medicine.sku}
        medicineName={medicine.name}
        price={medicine.price}
        unit={(medicineCardStatus[medicine.id] && medicineCardStatus[medicine.id].unit) || 1}
        onPressAdd={(id, sku) => {
          onPressAddToCart(id, sku);
        }}
        onPressRemove={(id) => {
          onPressRemoveFromCart(id);
        }}
        onChangeUnit={(id, unit, sku) => {
          console.log('onChangeUnitFromCart', { id, unit, sku });

          onChangeUnitFromCart(id, sku, unit);
        }}
        isCardExpanded={
          medicineCardStatus[medicine.id] && medicineCardStatus[medicine.id].isCardExpanded
        }
        isInStock={medicine.is_in_stock}
        isPrescriptionRequired={medicine.is_prescription_required == '1'}
        subscriptionStatus={
          (medicineCardStatus[medicine.id] && medicineCardStatus[medicine.id].subscriptionStatus) ||
          'unsubscribed'
        }
        onChangeSubscription={(id, status) => {
          setMedicineCardStatus({
            ...medicineCardStatus,
            [id]: { ...medicineCardStatus[id], subscriptionStatus: status },
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
