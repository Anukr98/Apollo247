import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon, Filter } from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
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
import { MedicineProduct, searchMedicineApi } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  aphConsole,
  isValidSearch,
  postWebEngageEvent,
  postwebEngageAddToCartEvent,
  postWEGNeedHelpEvent,
  postAppsFlyerAddToCartEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { FlatList, NavigationScreenProps, ScrollView } from 'react-navigation';
import stripHtml from 'string-strip-html';
import { FilterRange, MedicineFilter, SortByOptions } from './MedicineFilter';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { WebEngageEvents, WebEngageEventName } from '../../helpers/webEngageEvents';

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

export interface SearchMedicineSceneProps
  extends NavigationScreenProps<{
    searchText: string;
    isTest: boolean;
  }> {}

export const SearchMedicineScene: React.FC<SearchMedicineSceneProps> = (props) => {
  const searchTextFromProp = props.navigation.getParam('searchText');
  const isTest = props.navigation.getParam('isTest');

  const [showMatchingMedicines, setShowMatchingMedicines] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [searchHeading, setSearchHeading] = useState<string>('');
  const [medicineList, setMedicineList] = useState<MedicineProduct[]>([]);
  const [pinCode, setPinCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pastSearches, setPastSearches] = useState<
    (getPatientPastMedicineSearches_getPatientPastMedicineSearches | null)[]
  >([]);
  const medicineListRef = useRef<FlatList<MedicineProduct> | null>();

  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { addCartItem, removeCartItem, updateCartItem, cartItems } = useShoppingCart();
  const { cartItems: diagnosticCartItems } = useDiagnosticsCart();
  const { showAphAlert } = useUIElements();
  const { getPatientApiCall } = useAuth();

  const getSpecialPrice = (special_price?: string | number) =>
    special_price
      ? typeof special_price == 'string'
        ? parseInt(special_price)
        : special_price
      : undefined;

  // const filteredMedicineList = medicineList
  //   .filter((item) => item.price >= 100 && item.price <= 200)
  //   .filter((item) => {
  //     if (!item.special_price) return false;
  //     const specialPrice = getSpecialPrice(item.price);
  //     const discountPercentage = ((item.price - specialPrice!) / item.price) * 100;
  //     return discountPercentage >= 5 && discountPercentage <= 90 ? true : false;
  //   })
  //   .sort((med1, med2) => {
  //     return getSpecialPrice(med2.special_price)! - getSpecialPrice(med1.special_price)!;
  //   });

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    searchTextFromProp && onSearchMedicine(searchTextFromProp);
  }, []);

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
          type: SEARCH_TYPE.MEDICINE,
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data: { getPatientPastMedicineSearches } }) => {
        setPastSearches(getPatientPastMedicineSearches || []);
      })
      .catch((error) => {
        CommonBugFender('SearchMedicineScene_GET_PATIENT_PAST_MEDICINE_SEARCHES', error);
        aphConsole.log('Error occured', { error });
      });
  }, [currentPatient]);

  const showGenericALert = (e: { response: AxiosResponse }) => {
    const error = e && e.response && e.response.data.message;
    aphConsole.log({ errorResponse: e.response, error }); //remove this line later
    showAphAlert!({
      title: `Uh oh.. :(`,
      description: `Something went wrong.`,
    });
  };

  const onSearchMedicine = (_searchText: string) => {
    if (isValidSearch(_searchText)) {
      setSearchText(_searchText);
      if (!(_searchText && _searchText.length > 2)) {
        setMedicineList([]);
        return;
      }
      const eventAttributes: WebEngageEvents[WebEngageEventName.SEARCH] = {
        keyword: _searchText,
        Source: 'Pharmacy List',
      };
      postWebEngageEvent(WebEngageEventName.SEARCH, eventAttributes);

      setShowMatchingMedicines(true);
      setIsLoading(true);
      searchMedicineApi(_searchText)
        .then(async ({ data }) => {
          const products = data.products || [];
          setSearchHeading(data.search_heading)
          setMedicineList(products);
          setIsLoading(false);
        })
        .catch((e) => {
          CommonBugFender('SearchMedicineScene_onSearchMedicine', e);
          if (!axios.isCancel(e)) {
            setIsLoading(false);
            showGenericALert(e);
          }
        });
    }
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

  const onAddCartItem = (item: MedicineProduct) => {
    const {
      sku,
      mou,
      name,
      price,
      special_price,
      is_prescription_required,
      thumbnail,
      type_id,
    } = item;
    savePastSeacrh(sku, name).catch((e) => {
      aphConsole.log({ e });
    });
    addCartItem!({
      id: sku,
      mou,
      name: stripHtml(name),
      price: price,
      specialPrice: special_price
        ? typeof special_price == 'string'
          ? parseInt(special_price)
          : special_price
        : undefined,
      prescriptionRequired: is_prescription_required == '1',
      isMedicine: type_id == 'Pharma',
      quantity: 1,
      thumbnail,
      isInStock: true,
    });
    postwebEngageAddToCartEvent(item, 'Pharmacy List');
    postAppsFlyerAddToCartEvent(item, 'Pharmacy List');
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
        } catch (error) {
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
    let cartItemId = 0;
    let cartInfo: CartInfoResponse | null = null;
    try {
      cartInfo = await getCartInfo();
      const cartItem = cartInfo.items.find((cartItem) => cartItem.sku == medicine.sku);
      cartItemId = (cartItem && cartItem.item_id) || 0;
    } catch (error) {
    }
    if (!cartItemId) {
      Alert.alert('Error', 'Item does not exist in cart');
      return;
    }
    removeProductFromCartApi(cartItemId)
      .then(({ data }) => {
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

  const [filterVisible, setFilterVisible] = useState(false);
  const [discount, setdiscount] = useState<FilterRange>({
    from: undefined,
    to: undefined,
  });
  const [price, setprice] = useState<FilterRange>({
    from: undefined,
    to: undefined,
  });
  const [sortBy, setSortBy] = useState<SortByOptions>();
  const [categoryIds, setcategoryIds] = useState<string[]>([]);

  const renderFilterView = () => {
    return (
      <MedicineFilter
        isVisible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApplyFilter={(discountRange, priceRange, sortBy, categoryIds) => {
          setFilterVisible(false);
          setIsLoading(true);
          setdiscount(discountRange);
          setprice(priceRange);
          setSortBy(sortBy);
          setcategoryIds(categoryIds);
          medicineListRef.current && medicineListRef.current.scrollToOffset({ offset: 0 });
          setIsLoading(false);
        }}
      />
    );
  };

  const renderHeader = () => {
    const cartItemsCount = cartItems.length + diagnosticCartItems.length;
    return (
      <Header
        container={{ borderBottomWidth: 0 }}
        leftIcon={'backArrow'}
        title={isTest ? 'SEARCH TESTS ' : 'SEARCH MEDICINE'}
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              activeOpacity={1}
              style={{ marginRight: medicineList.length ? 24 : 0 }}
              onPress={() => {
                CommonLogEvent(AppRoutes.SearchMedicineScene, 'Navigate to your cart');
                props.navigation.navigate(AppRoutes.MedAndTestCart, { isComingFromConsult: true });
              }}
            >
              <CartIcon />
              {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
            </TouchableOpacity>
            {!!medicineList.length && (
              <TouchableOpacity activeOpacity={1} onPress={() => setFilterVisible(true)}>
                <Filter />
              </TouchableOpacity>
            )}
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
          textInputprops={{
            ...(isNoMedicinesFound ? { selectionColor: '#e50000' } : {}),
            autoFocus: true,
          }}
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
          onNeedHelpPress={() => {
            postWEGNeedHelpEvent(currentPatient, 'Medicines');
          }}
        />
      </ScrollView>
    );
  };

  const postwebEngageProductClickedEvent = ({ name, sku, category_id }: MedicineProduct) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_PRODUCT_CLICKED] = {
      'product name': name,
      'product id': sku,
      Brand: '',
      'Brand ID': '',
      'category name': '',
      'category ID': category_id,
      Source: 'List',
      'Section Name': 'SEARCH',
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_PRODUCT_CLICKED, eventAttributes);
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
    const price = medicine.price;
    const specialPrice = medicine.special_price
      ? typeof medicine.special_price == 'string'
        ? parseInt(medicine.special_price)
        : medicine.special_price
      : undefined;

    return (
      <MedicineCard
        containerStyle={[medicineCardContainerStyle, {}]}
        onPress={() => {
          savePastSeacrh(medicine.sku, medicine.name).catch((e) => {});
          postwebEngageProductClickedEvent(medicine);
          props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
            sku: medicine.sku,
            title: medicine.name,
          });
        }}
        medicineName={stripHtml(medicine.name)}
        imageUrl={
          medicine.thumbnail && !medicine.thumbnail.includes('/default/placeholder')
            ? `${AppConfig.Configuration.IMAGES_BASE_URL[0]}${medicine.thumbnail}`
            : ''
        }
        isTest={isTest}
        // specialPrice={}
        price={price}
        specialPrice={specialPrice}
        unit={(foundMedicineInCart && foundMedicineInCart.quantity) || 0}
        onPressAdd={() => {
          CommonLogEvent(AppRoutes.SearchMedicineScene, 'Add item to cart');
          onAddCartItem(medicine);
        }}
        onPressRemove={() => {
          CommonLogEvent(AppRoutes.SearchMedicineScene, 'Remove item from cart');
          onRemoveCartItem(medicine);
        }}
        onChangeUnit={(unit) => {
          CommonLogEvent(AppRoutes.SearchMedicineScene, 'Change unit in cart');
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
    let filteredMedicineList = medicineList;
    let search_heading_text = searchHeading && searchHeading.split('\'');
    // Category
    if (categoryIds.length) {
      filteredMedicineList = filteredMedicineList.filter((item) =>
        categoryIds.includes(item.category_id)
      );
    }
    // Price
    if (typeof price.from == 'number' || typeof price.to == 'number') {
      filteredMedicineList = filteredMedicineList.filter(
        (item) =>
          (price.from ? item.price >= price.from! : true) &&
          (price.to ? item.price <= price.to! : true)
      );
    }
    // Discount
    if (typeof discount.from == 'number' && typeof discount.to == 'number') {
      filteredMedicineList = filteredMedicineList.filter((item) => {
        if (!item.special_price) return discount.from == 0 || discount.from == undefined;
        const specialPrice = getSpecialPrice(item.special_price);
        const discountPercentage = ((item.price - specialPrice!) / item.price) * 100;

        return discountPercentage >= (discount.from || 0) && discountPercentage <= discount.to!
          ? true
          : false;
      });
    }
    // Sorting
    if (sortBy == 'Price-L-H') {
      filteredMedicineList = filteredMedicineList.sort((med1, med2) => {
        return (
          getSpecialPrice(med1.special_price || med1.price)! -
          getSpecialPrice(med2.special_price || med2.price)!
        );
      });
    } else if (sortBy == 'Price-H-L') {
      filteredMedicineList = filteredMedicineList.sort((med1, med2) => {
        return (
          getSpecialPrice(med2.special_price || med2.price)! -
          getSpecialPrice(med1.special_price || med1.price)!
        );
      });
    } else if (sortBy == 'A-Z') {
      filteredMedicineList = filteredMedicineList.sort((med1, med2) =>
        med1.name < med2.name ? -1 : med1.name > med2.name ? 1 : 0
      );
    } else if (sortBy == 'Z-A') {
      filteredMedicineList = filteredMedicineList.sort((med1, med2) =>
        med1.name > med2.name ? -1 : med1.name < med2.name ? 1 : 0
      );
    }

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
          !!searchText &&
          searchText.length > 2 && (
            <FlatList
              ref={(ref) => {
                medicineListRef.current = ref;
              }}
              onScroll={() => Keyboard.dismiss()}
              data={filteredMedicineList}
              renderItem={({ item, index }) =>
                renderMedicineCard(item, index, filteredMedicineList)
              }
              keyExtractor={(_, index) => `${index}`}
              bounces={false}
              ListEmptyComponent={
                discount.from ||
                (discount.to && discount.to != 100) ||
                false ||
                price.from ||
                price.to ||
                categoryIds.length ? (
                  <Text
                    style={{
                      textAlign: 'center',
                      marginTop: 20,
                      ...theme.viewStyles.text('M', 14, '#02475b'),
                    }}
                  >
                    No results matching your filter criteria, please change the filter and try
                    again.
                  </Text>
                ) : null
              }
              ListHeaderComponent={
                (filteredMedicineList.length > 0 && (
                  isTest ?
                  <SectionHeaderComponent
                    sectionTitle={`Matching Tests — ${filteredMedicineList.length}`}
                    style={{ marginBottom: 0 }}
                  /> : search_heading_text ?
                  <View style={{ marginHorizontal:20, marginTop:24, backgroundColor:'transparent' }} >
                    <Text style={{...theme.viewStyles.text('R', 14, '#01475b', 1, 14)}} >{search_heading_text[0]}
                    <Text style={{...theme.viewStyles.text('SB', 14, '#01475b', 1, 14)}} >{'\''+search_heading_text[1]+'\''}</Text>
                    {search_heading_text[2] && search_heading_text[2]}
                    <Text style={{...theme.viewStyles.text('SB', 14, '#01475b', 1, 14)}} >{search_heading_text[3] && '\''+search_heading_text[3]+'\''}</Text>
                    {search_heading_text[4]}
                    </Text>
                  </View> :
                  <SectionHeaderComponent
                    sectionTitle={`Matching Medicines — ${filteredMedicineList.length}`}
                    style={{ marginBottom: 0 }}
                  />
                )) ||
                null
              }
            />
          )
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
      {/* {renderDeliveryPinCode()} */}
      {showMatchingMedicines ? renderMatchingMedicines() : renderPastSearches()}
      {renderFilterView()}
    </SafeAreaView>
  );
};
