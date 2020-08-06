import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon, SearchSendIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { SearchMedicineCard } from '@aph/mobile-patients/src/components/ui/SearchMedicineCard';
import { SearchMedicineGridCard } from '@aph/mobile-patients/src/components/ui/SearchMedicineGridCard';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
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
import {
  MedicineProduct,
  searchMedicineApi,
  getMedicineSearchSuggestionsApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  aphConsole,
  isValidSearch,
  postWebEngageEvent,
  postwebEngageAddToCartEvent,
  postAppsFlyerAddToCartEvent,
  addPharmaItemToCart,
  g,
  getMaxQtyForMedicineItem,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { SearchInput } from '@aph/mobile-patients/src/components/ui/SearchInput';
import { FilterAndListViewComponent } from '@aph/mobile-patients/src/components/ui/FilterAndListViewComponent';
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
  Dimensions,
  ListRenderItemInfo,
} from 'react-native';
import { FlatList, NavigationScreenProps, ScrollView } from 'react-navigation';
import stripHtml from 'string-strip-html';
import { FilterRange, MedicineFilter, SortByOptions } from './MedicineFilter';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { MedicineSearchSuggestionItem } from '@aph/mobile-patients/src/components/Medicines/MedicineSearchSuggestionItem';
import Axios from 'axios';
import { StickyBottomComponent } from '../ui/StickyBottomComponent';
import { Button } from '../ui/Button';

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
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#02475b',
    paddingVertical: 8,
    marginHorizontal: 10,
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
  listHeaderViewStyle: {
    flexDirection: 'row',
    marginTop: 24,
    justifyContent: 'space-between',
  },
  listHeaderTextStyle: {
    marginBottom: 0,
    ...theme.viewStyles.text('M', 12, '#02475b'),
  },
});

export interface SearchMedicineSceneProps
  extends NavigationScreenProps<{
    searchText: string;
    isTest: boolean;
    showButton: boolean;
  }> {}

export const SearchMedicineScene: React.FC<SearchMedicineSceneProps> = (props) => {
  const searchTextFromProp = props.navigation.getParam('searchText');
  const isTest = props.navigation.getParam('isTest');
  const showButton = props.navigation.getParam('showButton');

  const [showMatchingMedicines, setShowMatchingMedicines] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [searchHeading, setSearchHeading] = useState<string>('');
  const [medicineList, setMedicineList] = useState<MedicineProduct[]>([]);
  const [productsList, setProductsList] = useState<MedicineProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProductsLoading, setProductsIsLoading] = useState<boolean>(false);
  const [isSearchFocused, setSearchFocused] = useState(false);
  const [showListView, setShowListView] = useState<boolean>(true);
  const [pastSearches, setPastSearches] = useState<
    (getPatientPastMedicineSearches_getPatientPastMedicineSearches | null)[]
  >([]);
  const [searchSate, setsearchSate] = useState<'load' | 'success' | 'fail' | undefined>();
  const [itemsLoading, setItemsLoading] = useState<{ [key: string]: boolean }>({});
  const medicineListRef = useRef<FlatList<MedicineProduct> | null>();

  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { addCartItem, removeCartItem, updateCartItem, cartItems } = useShoppingCart();
  const { cartItems: diagnosticCartItems } = useDiagnosticsCart();
  const { showAphAlert, setLoading: globalLoading } = useUIElements();
  const { getPatientApiCall } = useAuth();
  const { locationDetails, pharmacyLocation, isPharmacyLocationServiceable } = useAppCommonData();
  const pharmacyPincode = g(pharmacyLocation, 'pincode') || g(locationDetails, 'pincode');

  const getSpecialPrice = (special_price?: string | number) =>
    special_price
      ? typeof special_price == 'string'
        ? Number(special_price)
        : special_price
      : undefined;

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    searchTextFromProp && onSearchProduct(searchTextFromProp);
  }, []);

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
      setsearchSate('load');
      getMedicineSearchSuggestionsApi(_searchText)
        .then(({ data }) => {
          // aphConsole.log({ data });
          const products = data.products || [];
          setMedicineList(products);
          setsearchSate('success');
          const eventAttributes: WebEngageEvents[WebEngageEventName.SEARCH] = {
            keyword: _searchText,
            Source: 'Pharmacy Home',
            resultsdisplayed: products.length,
          };
          postWebEngageEvent(WebEngageEventName.SEARCH, eventAttributes);
        })
        .catch((e) => {
          CommonBugFender('SearchByBrand_onSearchMedicine', e);
          // aphConsole.log({ e });
          if (!Axios.isCancel(e)) {
            setsearchSate('fail');
          }
        });
    }
  };

  const onSearchProduct = (_searchText: string) => {
    if (isValidSearch(_searchText)) {
      setSearchText(_searchText);
      if (!(_searchText && _searchText.length > 2)) {
        setProductsList([]);
        return;
      }
      setShowMatchingMedicines(true);
      setProductsIsLoading(true);
      searchMedicineApi(_searchText)
        .then(async ({ data }) => {
          const products = data.products || [];
          setSearchHeading(data.search_heading!);
          setProductsList(products);
          setProductsIsLoading(false);
          const eventAttributes: WebEngageEvents[WebEngageEventName.SEARCH] = {
            keyword: _searchText,
            Source: 'Pharmacy List',
            resultsdisplayed: products.length,
          };
          postWebEngageEvent(WebEngageEventName.SEARCH, eventAttributes);
        })
        .catch((e) => {
          CommonBugFender('SearchMedicineScene_onSearchMedicine', e);
          if (!axios.isCancel(e)) {
            setProductsIsLoading(false);
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

  const onAddCartItem = (item: MedicineProduct, suggestionItem?: boolean) => {
    const {
      sku,
      mou,
      name,
      price,
      special_price,
      is_prescription_required,
      thumbnail,
      type_id,
      MaxOrderQty,
    } = item;
    savePastSeacrh(sku, name).catch((e) => {
      aphConsole.log({ e });
    });
    suggestionItem && setItemsLoading({ ...itemsLoading, [sku]: true });

    addPharmaItemToCart(
      {
        id: sku,
        mou,
        name: stripHtml(name),
        price: price,
        specialPrice: special_price
          ? typeof special_price == 'string'
            ? Number(special_price)
            : special_price
          : undefined,
        prescriptionRequired: is_prescription_required == '1',
        isMedicine: (type_id || '').toLowerCase() == 'pharma',
        quantity: 1,
        thumbnail,
        isInStock: true,
        maxOrderQty: MaxOrderQty,
      },
      pharmacyPincode!,
      addCartItem,
      suggestionItem ? null : globalLoading,
      props.navigation,
      currentPatient,
      !!isPharmacyLocationServiceable,
      suggestionItem ? () => setItemsLoading({ ...itemsLoading, [sku]: false }) : undefined
    );
    postwebEngageAddToCartEvent(item, 'Pharmacy Full Search');
    let id = currentPatient && currentPatient.id ? currentPatient.id : '';
    postAppsFlyerAddToCartEvent(item, id);
  };

  const onRemoveCartItem = ({ sku }: MedicineProduct) => {
    removeCartItem && removeCartItem(sku);
  };

  const onUpdateCartItem = ({ sku }: MedicineProduct, unit: number) => {
    if (!(unit < 1)) {
      updateCartItem && updateCartItem({ id: sku, quantity: unit });
    }
  };

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
        title={showButton ? ' ' : isTest ? 'SEARCH TESTS ' : 'SEARCH MEDICINE'}
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                CommonLogEvent(AppRoutes.SearchMedicineScene, 'Navigate to your cart');
                props.navigation.navigate(
                  diagnosticCartItems.length ? AppRoutes.MedAndTestCart : AppRoutes.YourCart
                );
              }}
            >
              <CartIcon />
              {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
            </TouchableOpacity>
          </View>
        }
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const isNoResultsFound =
    !!searchSate && searchSate != 'load' && searchText.length > 2 && medicineList.length == 0;
  //  && searchMode == 'partial';

  const renderSorryMessage = isNoResultsFound ? (
    <Text style={styles.sorryTextStyle}>{`Hit enter to search for '${searchText}'`}</Text>
  ) : (
    <View style={{ paddingBottom: 19 }} />
  );

  const renderSearchInput = () => {
    const startFullSearch = () => {
      if (searchText.length > 2) {
        const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_SEARCH_RESULTS] = {
          keyword: searchText,
          Source: 'Pharmacy Search',
        };
        postWebEngageEvent(WebEngageEventName.PHARMACY_SEARCH_RESULTS, eventAttributes);

        const searchEventAttribute: WebEngageEvents[WebEngageEventName.SEARCH_ENTER_CLICK] = {
          keyword: searchText,
          numberofresults: medicineList.length,
        };
        postWebEngageEvent(WebEngageEventName.SEARCH_ENTER_CLICK, searchEventAttribute);
        onSearchProduct(searchText);
        setsearchSate(undefined);
      }
    };
    const enableSearchEnterBtn = searchText.length > 2;
    const rigthIconView = (
      <TouchableOpacity
        activeOpacity={1}
        style={{
          opacity: enableSearchEnterBtn ? 1 : 0.4,
        }}
        disabled={!enableSearchEnterBtn}
        onPress={startFullSearch}
      >
        <SearchSendIcon />
      </TouchableOpacity>
    );

    return (
      <View
        style={{
          paddingHorizontal: 0,
          backgroundColor: theme.colors.WHITE,
        }}
      >
        <SearchInput
          value={searchText}
          onSubmitEditing={startFullSearch}
          onChangeText={(value) => {
            onSearchMedicine(value);
          }}
          _isSearchFocused={isSearchFocused}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => {
            setSearchFocused(false);
          }}
          _rigthIconView={rigthIconView}
          placeholder="Search meds, brands &amp; more"
          _itemsNotFound={isNoResultsFound}
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
            movedFrom: 'search',
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
        ? Number(medicine.special_price)
        : medicine.special_price
      : undefined;

    const onNotifyMeClick = () => {
      showAphAlert!({
        title: 'Okay! :)',
        description: `You will be notified when ${medicine.name} is back in stock.`,
      });
    };
    const isMedicineAddedToCart = cartItems.findIndex((item) => item.id == medicine.sku) != -1;
    const getItemQuantity = (id: string) => {
      const foundItem = cartItems.find((item) => item.id == id);
      return foundItem ? foundItem.quantity : 1;
    };

    return (
      <SearchMedicineCard
        containerStyle={[medicineCardContainerStyle, {}]}
        onPress={() => {
          savePastSeacrh(medicine.sku, medicine.name).catch((e) => {});
          postwebEngageProductClickedEvent(medicine);
          props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
            sku: medicine.sku,
            title: medicine.name,
            movedFrom: 'search',
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
        quantity={getItemQuantity(medicine.sku)}
        onPressAdd={() => {
          CommonLogEvent(AppRoutes.SearchMedicineScene, 'Add item to cart');
          onAddCartItem(medicine);
        }}
        onPressRemove={() => {
          CommonLogEvent(AppRoutes.SearchMedicineScene, 'Remove item from cart');
          onRemoveCartItem(medicine);
        }}
        onNotifyMeClicked={() => {
          onNotifyMeClick();
        }}
        onPressAddQuantity={() =>
          getItemQuantity(medicine.sku) == getMaxQtyForMedicineItem(medicine.MaxOrderQty)
            ? null
            : onUpdateCartItem(medicine, getItemQuantity(medicine.sku) + 1)
        }
        onPressSubtractQuantity={() =>
          getItemQuantity(medicine.sku) == 1
            ? onRemoveCartItem(medicine)
            : onUpdateCartItem(medicine, getItemQuantity(medicine.sku) - 1)
        }
        onChangeUnit={(unit) => {
          CommonLogEvent(AppRoutes.SearchMedicineScene, 'Change unit in cart');
          onUpdateCartItem(medicine, unit);
        }}
        isMedicineAddedToCart={isMedicineAddedToCart}
        isCardExpanded={!!foundMedicineInCart}
        isInStock={!!medicine.is_in_stock}
        packOfCount={(medicine.mou && Number(medicine.mou)) || undefined}
        isPrescriptionRequired={medicine.is_prescription_required == '1'}
        subscriptionStatus={'unsubscribed'}
        onChangeSubscription={() => {}}
        onEditPress={() => {}}
        onAddSubscriptionPress={() => {}}
        removeCartItem={() => removeCartItem!(medicine.sku)}
        maxOrderQty={getMaxQtyForMedicineItem(medicine.MaxOrderQty)}
      />
    );
  };

  const renderMedicineGridCard = (
    medicine: MedicineProduct,
    index: number,
    array: MedicineProduct[]
  ) => {
    const medicineCardContainerStyle = [
      { marginRight: 5, marginLeft: 5, marginVertical: 3 },
      index === 0 || index === 1 ? { marginTop: 20 } : {},
      index == array.length - 2 ? array.length % 2 == 0 && { marginBottom: 20 } : {},
      index == array.length - 1
        ? array.length % 2 != 0
          ? { flex: 0.459, marginBottom: 20 }
          : { marginBottom: 20 }
        : {},
    ];
    const foundMedicineInCart = cartItems.find((item) => item.id == medicine.sku);
    const price = medicine.price;
    const specialPrice = medicine.special_price
      ? typeof medicine.special_price == 'string'
        ? Number(medicine.special_price)
        : medicine.special_price
      : undefined;

    const onNotifyMeClick = () => {
      showAphAlert!({
        title: 'Okay! :)',
        description: `You will be notified when ${medicine.name} is back in stock.`,
      });
    };
    const isMedicineAddedToCart = cartItems.findIndex((item) => item.id == medicine.sku) != -1;
    const getItemQuantity = (id: string) => {
      const foundItem = cartItems.find((item) => item.id == id);
      return foundItem ? foundItem.quantity : 1;
    };

    return (
      <SearchMedicineGridCard
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
        quantity={getItemQuantity(medicine.sku)}
        onPressAdd={() => {
          CommonLogEvent(AppRoutes.SearchMedicineScene, 'Add item to cart');
          onAddCartItem(medicine);
        }}
        onPressRemove={() => {
          CommonLogEvent(AppRoutes.SearchMedicineScene, 'Remove item from cart');
          onRemoveCartItem(medicine);
        }}
        onNotifyMeClicked={() => {
          onNotifyMeClick();
        }}
        onPressAddQuantity={() =>
          getItemQuantity(medicine.sku) == getMaxQtyForMedicineItem(medicine.MaxOrderQty)
            ? null
            : onUpdateCartItem(medicine, getItemQuantity(medicine.sku) + 1)
        }
        onPressSubtractQuantity={() =>
          getItemQuantity(medicine.sku) == 1
            ? onRemoveCartItem(medicine)
            : onUpdateCartItem(medicine, getItemQuantity(medicine.sku) - 1)
        }
        onChangeUnit={(unit) => {
          CommonLogEvent(AppRoutes.SearchMedicineScene, 'Change unit in cart');
          onUpdateCartItem(medicine, unit);
        }}
        isMedicineAddedToCart={isMedicineAddedToCart}
        isCardExpanded={!!foundMedicineInCart}
        isInStock={!!medicine.is_in_stock}
        packOfCount={(medicine.mou && Number(medicine.mou)) || undefined}
        isPrescriptionRequired={medicine.is_prescription_required == '1'}
        subscriptionStatus={'unsubscribed'}
        onChangeSubscription={() => {}}
        onEditPress={() => {}}
        onAddSubscriptionPress={() => {}}
        removeCartItem={() => removeCartItem!(medicine.sku)}
        maxOrderQty={getMaxQtyForMedicineItem(medicine.MaxOrderQty)}
      />
    );
  };

  const renderMatchingMedicines = () => {
    let filteredMedicineList = productsList;
    let search_heading_text = searchHeading && searchHeading.split("'");
    const flatListStyle = {
      paddingLeft: showListView ? 0 : 15,
      paddingRight: showListView ? 0 : 15,
      paddingBottom: showListView ? 0 : 20,
    };
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
        {isProductsLoading ? (
          <ActivityIndicator
            style={{ marginTop: 20 }}
            animating={isProductsLoading}
            size="large"
            color="green"
          />
        ) : (
          !!searchText &&
          searchText.length > 2 && (
            <FlatList
              style={flatListStyle}
              ref={(ref) => {
                medicineListRef.current = ref;
              }}
              numColumns={showListView ? 1 : 2}
              key={showListView ? 1 : 0}
              onScroll={() => Keyboard.dismiss()}
              data={filteredMedicineList}
              renderItem={({ item, index }) =>
                showListView
                  ? renderMedicineCard(item, index, filteredMedicineList)
                  : renderMedicineGridCard(item, index, filteredMedicineList)
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
                (filteredMedicineList.length > 0 &&
                  (isTest ? (
                    <View style={styles.listHeaderViewStyle}>
                      <Text
                        style={[
                          styles.listHeaderTextStyle,
                          {
                            marginHorizontal: showListView ? 20 : 5,
                          },
                        ]}
                      >{`Matching Tests — ${filteredMedicineList.length}`}</Text>
                      {renderFilterAndListView(true)}
                    </View>
                  ) : search_heading_text ? (
                    <>
                      <View
                        style={{
                          marginLeft: showListView ? 20 : 5,
                          marginRight: showListView ? 20 : 5,
                          marginTop: 24,
                        }}
                      >
                        <Text style={{ ...theme.viewStyles.text('R', 14, '#01475b', 1, 18) }}>
                          {search_heading_text[0]}
                          <Text style={{ ...theme.viewStyles.text('SB', 14, '#01475b', 1, 18) }}>
                            {"'" + search_heading_text[1] + "'"}
                          </Text>
                          {search_heading_text[2] && search_heading_text[2]}
                          <Text style={{ ...theme.viewStyles.text('SB', 14, '#01475b', 1, 18) }}>
                            {search_heading_text[3] && "'" + search_heading_text[3] + "'"}
                          </Text>
                          {search_heading_text[4]}
                        </Text>
                      </View>
                      {renderFilterAndListView()}
                      <View
                        style={{
                          backgroundColor: '#02475b',
                          marginTop: 5,
                          marginLeft: showListView ? 20 : 5,
                          marginRight: showListView ? 20 : 5,
                          opacity: 0.2,
                          height: 1,
                        }}
                      />
                    </>
                  ) : (
                    <View style={styles.listHeaderViewStyle}>
                      <Text
                        style={[
                          styles.listHeaderTextStyle,
                          {
                            marginHorizontal: showListView ? 20 : 5,
                          },
                        ]}
                      >{`Matching Medicines — ${filteredMedicineList.length}`}</Text>
                      {renderFilterAndListView(true)}
                    </View>
                  ))) ||
                null
              }
            />
          )
        )}
      </>
    );
  };

  const renderFilterAndListView = (showFilterByView = false) => {
    return (
      <FilterAndListViewComponent
        showFilterByView={showFilterByView}
        showListView={showListView}
        onPressFilter={() => setFilterVisible(true)}
        onPressGridView={() => {
          showListView && setShowListView(false);
        }}
        onPressListView={() => {
          !showListView && setShowListView(true);
        }}
      />
    );
  };

  const renderSectionLoader = (height: number = 100) => {
    return (
      <Spinner
        style={{
          height,
          position: 'relative',
          backgroundColor: 'transparent',
        }}
      />
    );
  };

  const onNotifyMeClick = (name: string) => {
    showAphAlert!({
      title: 'Okay! :)',
      description: `You will be notified when ${name} is back in stock.`,
    });
  };
  const getItemQuantity = (id: string) => {
    const foundItem = cartItems.find((item) => item.id == id);
    return foundItem ? foundItem.quantity : 0;
  };

  const renderSearchSuggestionItemView = (data: ListRenderItemInfo<MedicineProduct>) => {
    const { item, index } = data;
    return (
      <MedicineSearchSuggestionItem
        onPress={() => {
          props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
            sku: item.sku,
            movedFrom: 'search',
          });
          resetSearchState();
        }}
        onPressAddToCart={() => {
          onAddCartItem(item, true);
        }}
        onPressNotify={() => {
          onNotifyMeClick(item.name);
        }}
        onPressAdd={() => {
          const q = getItemQuantity(item.sku);
          if (q == getMaxQtyForMedicineItem(item.MaxOrderQty)) return;
          onUpdateCartItem(item, getItemQuantity(item.sku) + 1);
        }}
        onPressSubstract={() => {
          const q = getItemQuantity(item.sku);
          q == 1 ? onRemoveCartItem(item) : onUpdateCartItem(item, q - 1);
        }}
        quantity={getItemQuantity(item.sku)}
        data={item}
        loading={itemsLoading[item.sku]}
        showSeparator={index !== medicineList.length - 1}
        style={{
          marginHorizontal: 20,
          paddingBottom: index == medicineList.length - 1 ? 10 : 0,
        }}
        maxOrderQty={getMaxQtyForMedicineItem(item.MaxOrderQty)}
        removeCartItem={() => onRemoveCartItem(item)}
      />
    );
  };

  const renderSearchResults = () => {
    return (
      <>
        {searchSate == 'load' ? (
          <View
            style={{
              backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
            }}
          >
            {renderSectionLoader(266)}
          </View>
        ) : (
          !!searchSate &&
          !!searchText &&
          searchText.length > 2 && (
            <FlatList
              keyboardShouldPersistTaps="always"
              // contentContainerStyle={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }}
              bounces={false}
              keyExtractor={(_, index) => `${index}`}
              showsVerticalScrollIndicator={false}
              style={{
                maxHeight: 266,
                backgroundColor: '#f7f8f5',
              }}
              data={medicineList}
              renderItem={renderSearchSuggestionItemView}
            />
          )
        )}
      </>
    );
  };

  const resetSearchState = () => {
    setMedicineList([]);
    setSearchText('');
    setsearchSate(undefined);
  };

  const closeOverlay = () => {
    if (searchText.length > 2) {
      const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_SEARCH_RESULTS] = {
        keyword: searchText,
        Source: 'Pharmacy Search',
      };
      postWebEngageEvent(WebEngageEventName.PHARMACY_SEARCH_RESULTS, eventAttributes);
      props.navigation.navigate(AppRoutes.SearchMedicineScene, { searchText });
      resetSearchState();
    }
  };

  const renderOverlay = () => {
    const isNoResultsFound =
      !!searchSate && searchSate != 'load' && searchText.length > 2 && medicineList.length == 0;
    const overlayStyle = {
      flex: 1,
      position: 'absolute',
      left: 0,
      top: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    } as ViewStyle;

    return (
      ((!!searchSate && medicineList.length) || searchSate == 'load' || isNoResultsFound) && (
        <View style={overlayStyle}>
          <TouchableOpacity activeOpacity={1} style={overlayStyle} onPress={closeOverlay} />
        </View>
      )
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaViewStyle}>
      <View style={styles.headerSearchInputShadow}>
        {renderHeader()}
        {renderSearchInput()}
        {renderSearchResults()}
      </View>
      <View style={{ flex: 1 }}>
        {showMatchingMedicines ? renderMatchingMedicines() : renderPastSearches()}
        {renderOverlay()}
      </View>
      {renderFilterView()}
      {showButton && (
        <StickyBottomComponent style={{ position: 'relative' }} defaultBG>
          <Button
            title={'PROCEED'}
            onPress={() => props.navigation.navigate(AppRoutes.YourCart)}
            style={{ marginHorizontal: 40, flex: 1 }}
          />
        </StickyBottomComponent>
      )}
    </SafeAreaView>
  );
};
