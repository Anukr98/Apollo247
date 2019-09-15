import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  GET_PATIENT_PAST_MEDICINE_SEARCHES,
  SAVE_SEARCH,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getPatientPastMedicineSearches,
  getPatientPastMedicineSearchesVariables,
  getPatientPastMedicineSearches_getPatientPastMedicineSearches,
} from '@aph/mobile-patients/src/graphql/types/getPatientPastMedicineSearches';
import { SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  MedicineProduct,
  pinCodeServiceabilityApi,
  searchMedicineApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
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
import { handleGraphQlError } from '../../helpers/helperFunctions';

const styles = StyleSheet.create({
  safeAreaViewStyle: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  headerStyle: {},
  headerSearchInputShadow: {
    zIndex: 1,
    backgroundColor: theme.colors.WHITE,
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
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
    ...theme.viewStyles.cardContainer,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS == 'ios' ? 12 : 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    width: Platform.OS === 'ios' ? 51 : 54,
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

export interface SearchMedicineSceneProps extends NavigationScreenProps {}

export const SearchMedicineScene: React.FC<SearchMedicineSceneProps> = (props) => {
  const [showMatchingMedicines, setShowMatchingMedicines] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [medicineList, setMedicineList] = useState<MedicineProduct[]>([]);
  const [pinCode, setPinCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pastSearches, setPastSearches] = useState<
    (getPatientPastMedicineSearches_getPatientPastMedicineSearches | null)[]
  >([]);

  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { addCartItem, removeCartItem, updateCartItem, cartItems } = useShoppingCart();

  /*
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
  */

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
  }, [currentPatient]);

  const showGenericALert = (e: { response: AxiosResponse }) => {
    const error = e && e.response && e.response.data.message;
    console.log({ errorResponse: e.response, error }); //remove this line later
    Alert.alert('Alert', error || 'Unknown error occurred.');
  };

  const onSearchMedicine = (_searchText: string) => {
    setSearchText(_searchText);
    if (!(_searchText && _searchText.length > 2)) {
      setMedicineList([]);
      return;
    }
    setShowMatchingMedicines(true);
    setIsLoading(true);
    searchMedicineApi(_searchText)
      .then(async ({ data }) => {
        const products = data.products || [];
        setMedicineList(products);
        setIsLoading(false);
      })
      .catch((e) => {
        if (axios.isCancel(e)) {
          console.log('Request canceled', e);
        } else {
          // handle error
          setIsLoading(false);
          showGenericALert(e);
        }
      });
  };

  const savePastSeacrh = (sku: string, name: string) =>
    client.mutate({
      mutation: SAVE_SEARCH,
      variables: {
        saveSearchInput: {
          type: SEARCH_TYPE.MEDICINE,
          typeId: sku,
          typeName: name,
          patient: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
      },
    });

  const onAddCartItem = ({
    sku,
    mou,
    name,
    price,
    special_price,
    is_prescription_required,
  }: MedicineProduct) => {
    savePastSeacrh(sku, name).catch((e) => {
      handleGraphQlError(e);
    });
    addCartItem &&
      addCartItem({
        id: sku,
        mou,
        name,
        price: special_price || price,
        prescriptionRequired: is_prescription_required == '1',
        quantity: 1,
      });
  };

  const onRemoveCartItem = ({ sku }: MedicineProduct) => {
    removeCartItem && removeCartItem(sku);
  };

  const onUpdateCartItem = ({ sku }: MedicineProduct, unit: number) => {
    if (!(unit < 1)) {
      updateCartItem && updateCartItem({ id: sku, quantity: unit });
    }
  };

  /*
  const onAddCartItem = (medicine: MedicineProduct) => {
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
  */
  /*  
  const onRemoveCartItem = async (medicine: MedicineProduct) => {
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
  */
  /*
  const onUpdateCartItem = async (medicine: MedicineProduct, unit: number) => {
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
  */

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const renderHeader = () => {
    const cartItemsCount = cartItems.length;
    return (
      <Header
        container={{ borderBottomWidth: 0 }}
        leftIcon={'backArrow'}
        title={'SEARCH MEDICINE'}
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              activeOpacity={1}
              // style={{ marginRight: 24 }}
              onPress={() => {
                console.log('YourCartProps onpress');
                props.navigation.navigate(AppRoutes.YourCart);
              }}
            >
              <CartIcon />
              {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
            </TouchableOpacity>
            {/* <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <Filter />
            </TouchableOpacity> */}
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
        />
        {renderSorryMessage}
      </View>
    );
  };

  /**
   * @description returns true if empty string or starts with number other than zero else false
   */
  const isValidPinCode = (text: string): boolean => text == '' || /^([1-9][0-9]*)$/.test(text);

  const checkServicability = (text: string) => {
    isValidPinCode(text) && setPinCode(text);
    if (text.length == 6) {
      // call api here
      pinCodeServiceabilityApi(text, 'PHARMA')
        .then(({ data: { Availability } }) => {
          const isAndroid = Platform.OS == 'android';
          if (!isAndroid && !Availability) {
            Alert.alert('Alert', 'Sorry! This pincode is not serviceable.');
          }
        })
        .catch((e) => {
          // handleGraphQlError(e);
        });
    }
  };

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

  const renderDeliveryPinCode = () => {
    return (
      <View style={styles.deliveryPinCodeContaner}>
        <Text numberOfLines={1} style={styles.pinCodeStyle}>
          Delivery Pincode
        </Text>
        <TextInput
          maxLength={6}
          value={pinCode}
          onChange={({ nativeEvent: { text } }) => checkServicability(text)}
          underlineColorAndroid="transparent"
          style={styles.pinCodeTextInput}
          selectionColor={theme.colors.INPUT_BORDER_SUCCESS}
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
      <ScrollView bounces={false} onScroll={() => Keyboard.dismiss()}>
        {pastSearches.length > 0 && (
          <SectionHeaderComponent sectionTitle={'Past Searches'} style={{ marginBottom: 0 }} />
        )}
        <View style={styles.pastSearchContainerStyle}>
          {pastSearches
            .slice(0, 5)
            .map((pastSearch, i, array) =>
              renderPastSearchItem(pastSearch!, i == array.length - 1 ? { marginRight: 0 } : {})
            )}
        </View>
        <NeedHelpAssistant
          navigation={props.navigation}
          containerStyle={{ marginTop: 84, marginBottom: 50 }}
        />
      </ScrollView>
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
    const foundMedicineInCart = cartItems.find((item) => item.id == medicine.sku);
    return (
      <MedicineCard
        containerStyle={[medicineCardContainerStyle, {}]}
        onPress={() => {
          savePastSeacrh(medicine.sku, medicine.name).catch((e) => {
            handleGraphQlError(e);
          });
          props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
            sku: medicine.sku,
            title: medicine.name,
          });
        }}
        medicineName={medicine.name}
        price={medicine.special_price || medicine.price}
        unit={(foundMedicineInCart && foundMedicineInCart.quantity) || 0}
        onPressAdd={() => {
          onAddCartItem(medicine);
        }}
        onPressRemove={() => {
          onRemoveCartItem(medicine);
        }}
        onChangeUnit={(unit) => {
          onUpdateCartItem(medicine, unit);
        }}
        isCardExpanded={!!foundMedicineInCart}
        isInStock={medicine.is_in_stock}
        packOfCount={(medicine.mou && parseInt(medicine.mou)) || undefined}
        isPrescriptionRequired={medicine.is_prescription_required == '1'}
        subscriptionStatus={'unsubscribed'}
        onChangeSubscription={() => {}}
        onEditPress={() => {}}
        onAddSubscriptionPress={() => {}}
      />
    );
  };

  const renderMatchingMedicines = () => {
    return (
      <>
        {isLoading ? (
          <ActivityIndicator
            style={{ marginTop: 20 }}
            animating={isLoading}
            size="large"
            color="green"
          />
        ) : (
          <FlatList
            onScroll={() => Keyboard.dismiss()}
            data={medicineList}
            renderItem={({ item, index }) => renderMedicineCard(item, index, medicineList)}
            keyExtractor={(_, index) => `${index}`}
            bounces={false}
            ListHeaderComponent={
              (medicineList.length > 0 && (
                <SectionHeaderComponent
                  sectionTitle={`Matching Medicines — ${medicineList.length}`}
                  style={{ marginBottom: 0 }}
                />
              )) ||
              null
            }
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
      {showMatchingMedicines ? renderMatchingMedicines() : renderPastSearches()}
    </SafeAreaView>
  );
};
