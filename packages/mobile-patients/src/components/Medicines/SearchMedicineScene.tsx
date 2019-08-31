import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon, Filter } from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { saveSearch, saveSearchVariables } from '@aph/mobile-patients/src/graphql/types/saveSearch';
import {
  addProductToCartApi,
  CartInfoResponse,
  getCartInfo,
  incOrDecProductCountToCartApi,
  MedicineProduct,
  removeProductFromCartApi,
  searchMedicineApi,
  setLocalCartInfo,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { Mutation } from 'react-apollo';
import { useApolloClient } from 'react-apollo-hooks';
import axios from 'axios';
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
import { GET_PATIENT_PAST_MEDICINE_SEARCHES, SAVE_SEARCH } from '../../graphql/profiles';
import {
  getPatientPastMedicineSearches,
  getPatientPastMedicineSearchesVariables,
  getPatientPastMedicineSearches_getPatientPastMedicineSearches,
} from '../../graphql/types/getPatientPastMedicineSearches';
import { SEARCH_TYPE } from '../../graphql/types/globalTypes';
import { useAllCurrentPatients } from '../../hooks/authHooks';
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
  const [pastSearches, setPastSearches] = useState<
    (getPatientPastMedicineSearches_getPatientPastMedicineSearches | null)[]
  >([]);

  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();

  useEffect(() => {
    getCartInfo()
      .then((cartInfo) => {
        let cartStatus = {} as typeof medicineCardStatus;
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

  useEffect(() => {
    client
      .query<getPatientPastMedicineSearches, getPatientPastMedicineSearchesVariables>({
        query: GET_PATIENT_PAST_MEDICINE_SEARCHES,
        variables: {
          patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
      })
      .then(({ data: { getPatientPastMedicineSearches } }) => {
        console.log({ getPatientPastMedicineSearches });
        setPastSearches(getPatientPastMedicineSearches || []);
      })
      .catch((error) => {
        console.log('Error occured', { error });
      });
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
        const products = data.products || [];
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
        try {
          cartInfo = await getCartInfo();
          console.log({ cartInfo });
        } catch (error) {
          console.log(error);
        }
        // add to local cart
        const cartItemIndex = cartInfo!.items.findIndex((cartItem) => cartItem.sku == medicine.sku);
        if (cartItemIndex == -1) {
          setLocalCartInfo({ ...cartInfo!, items: [...cartInfo!.items, data] });
        } else {
          const items = cartInfo!.items.map((m, i) => {
            return i == cartItemIndex ? { ...m, ...{ qty: data.qty } } : m;
          });
          const updatedCart = { ...cartInfo!, items: [...items] };
          setLocalCartInfo(updatedCart);
        }

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
    if (unit < 1) {
      return;
    }
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
              activeOpacity={1}
              style={{ marginRight: 24 }}
              onPress={() => {
                console.log('YourCartProps onpress');
                props.navigation.navigate(AppRoutes.YourCart);
              }}
            >
              <CartIcon />
              {cartItems > 0 && renderBadge(cartItems, {})}
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
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

  const fetchLocation = (text: string) => {
    const key = 'AIzaSyDzbMikhBAUPlleyxkIS9Jz7oYY2VS8Xps';
    isValidPinCode(text);
    setPinCode(text);
    axios
      .get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&latitude=17.3355835&longitude=78.46756239999999&key=${key}`
      )
      .then((obj) => {
        console.log(obj, 'places');
        if (obj.data.predictions) {
          const address = obj.data.predictions.map(
            (item: {
              structured_formatting: {
                main_text: string;
              };
            }) => {
              return item.structured_formatting.main_text;
            }
          );
          console.log(address, 'address');
          // setlocationSearchList(address);
          // setcurrentLocation(address.toUpperCase());
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
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
          onChange={({ nativeEvent: { text } }) => fetchLocation(text)}
          underlineColorAndroid="transparent"
          style={styles.pinCodeTextInput}
        />
      </View>
    );
  };

  const renderPastSearchItem = (
    pastSeacrh: getPatientPastMedicineSearches_getPatientPastMedicineSearches,
    containerStyle: StyleProp<ViewStyle>
  ) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        key={pastSeacrh.typeId!}
        style={[styles.pastSearchItemStyle, containerStyle]}
        onPress={() => {
          props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
            sku: pastSeacrh.typeId,
            title: pastSeacrh.name,
          });
        }}
      >
        <Text style={styles.pastSearchTextStyle}>{pastSeacrh.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderPastSearches = () => {
    return (
      <>
        <SectionHeaderComponent sectionTitle={'Past Searches'} style={{ marginBottom: 0 }} />
        <View style={styles.pastSearchContainerStyle}>
          {pastSearches.map((pastSearch, i, array) =>
            renderPastSearchItem(pastSearch!, i == array.length - 1 ? { marginRight: 0 } : {})
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
      <Mutation<saveSearch, saveSearchVariables> mutation={SAVE_SEARCH}>
        {(mutate, { loading, data, error }) => (
          <MedicineCard
            containerStyle={medicineCardContainerStyle}
            onPress={() => {
              console.log('currentPatient', currentPatient && currentPatient.id);
              mutate({
                variables: {
                  saveSearchInput: {
                    type: SEARCH_TYPE.MEDICINE,
                    typeId: medicine.sku,
                    typeName: medicine.name,
                    patient: currentPatient && currentPatient.id ? currentPatient.id : '',
                  },
                },
              });
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
          >
            {data ? console.log(data, 'savesearch data') : null}
            {error ? console.log(error, 'savesearch error') : null}
          </MedicineCard>
        )}
      </Mutation>
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
