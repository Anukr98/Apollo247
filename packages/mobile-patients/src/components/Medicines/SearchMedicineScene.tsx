import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Filter, ShoppingCart } from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  getProductsBasedOnCategory,
  MedicineProductsResponse,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
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
import { NavigationScreenProps, ScrollView } from 'react-navigation';
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
  const [medicineList, setMedicineList] = useState<MedicineProductsResponse['products']>([]);
  const [pinCode, setPinCode] = useState<string>('500033');
  const [medicineCardStatus, setMedicineCardStatus] = useState<{
    [id: string]: MedicineCardState;
  }>({});

  useEffect(() => {
    getProductsBasedOnCategory()
      .then(({ data: { products } }) => {
        setMedicineList(products);
      })
      .catch((e) => {
        Alert.alert('Error occurred', e);
      });
  }, []);

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
            <TouchableOpacity style={{ marginRight: 24 }} onPress={() => {}}>
              <ShoppingCart />
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

  const isNoMedicinesFound = searchText.length > 2 && medicineList.length == 0;

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
            setSearchText(value);
            // value.length > 2 ? setShowMatchingMedicines(true) : setShowMatchingMedicines(false);
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

  const renderMatchingMedicines = () => {
    return (
      <>
        <SectionHeaderComponent
          sectionTitle={`Matching Medicines — ${medicineList.length}`}
          style={{ marginBottom: 0 }}
        />
        {medicineList.map((medicine, index, array) => {
          const medicineCardContainerStyle = [
            { marginBottom: 8, marginHorizontal: 20 },
            index == 0 ? { marginTop: 20 } : {},
            index == array.length - 1 ? { marginBottom: 20 } : {},
          ];
          return (
            <MedicineCard
              containerStyle={medicineCardContainerStyle}
              key={medicine.id}
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
              isAddedToCart={true}
              onPressAdd={(id) => {
                setMedicineCardStatus({
                  ...medicineCardStatus,
                  [id]: { isAddedToCart: true, isCardExpanded: true },
                });
                // Call Add to cart API
              }}
              onPressRemove={(id) => {
                setMedicineCardStatus({
                  ...medicineCardStatus,
                  [id]: { isAddedToCart: false, isCardExpanded: false },
                });
                // Call Remove from cart API
              }}
              onChangeUnit={(id, unit) => {
                setMedicineCardStatus({
                  ...medicineCardStatus,
                  [id]: { ...medicineCardStatus[id], unit },
                });
                // Update no. of units to cart for this item via API
              }}
              isCardExpanded={
                medicineCardStatus[medicine.id] && medicineCardStatus[medicine.id].isCardExpanded
              }
              isInStock={!!medicine.is_in_stock}
              isPrescriptionRequired={!!!medicine.is_prescription_required}
              subscriptionStatus={
                (medicineCardStatus[medicine.id] &&
                  medicineCardStatus[medicine.id].subscriptionStatus) ||
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
        })}
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
