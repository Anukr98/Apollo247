import {
  FilterRange,
  MedicineFilter,
  SortByOptions,
} from '@aph/mobile-patients/src/components/Medicines/MedicineFilter';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon, Filter, SearchSendIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { SearchMedicineCard } from '@aph/mobile-patients/src/components/ui/SearchMedicineCard';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { SAVE_SEARCH } from '@aph/mobile-patients/src/graphql/profiles';
import { SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  getMedicineSearchSuggestionsApi,
  getProductsByCategoryApi,
  MedicineProduct,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { SearchMedicineGridCard } from '@aph/mobile-patients/src/components/ui/SearchMedicineGridCard';
import { FilterAndListViewComponent } from '@aph/mobile-patients/src/components/ui/FilterAndListViewComponent';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  Keyboard,
  ListRenderItemInfo,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Input } from 'react-native-elements';
import { FlatList, NavigationScreenProps, NavigationActions, StackActions } from 'react-navigation';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  isValidSearch,
  postWebEngageEvent,
  postwebEngageAddToCartEvent,
  postAppsFlyerAddToCartEvent,
  addPharmaItemToCart,
  g,
  getMaxQtyForMedicineItem,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { MedicineSearchSuggestionItem } from '@aph/mobile-patients/src/components/Medicines/MedicineSearchSuggestionItem';
import { SearchInput } from '@aph/mobile-patients/src/components/ui/SearchInput';

const styles = StyleSheet.create({
  safeAreaViewStyle: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
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
  sorryTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#02475b',
    paddingVertical: 8,
    marginHorizontal: 10,
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

export interface SearchByBrandProps
  extends NavigationScreenProps<{
    title: string;
    category_id: string;
    movedFrom?: string;
    products?: MedicineProduct[];
  }> {}

export const SearchByBrand: React.FC<SearchByBrandProps> = (props) => {
  const products = props.navigation.getParam('products');
  const category_id = props.navigation.getParam('category_id');
  const pageTitle = props.navigation.getParam('title');
  const [searchText, setSearchText] = useState<string>('');
  const [isSearchFocused, setSearchFocused] = useState(false);
  const [productsList, setProductsList] = useState<MedicineProduct[]>(products || []);
  const [medicineList, setMedicineList] = useState<MedicineProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(products ? false : true);
  const [showListView, setShowListView] = useState<boolean>(false);
  const [searchSate, setsearchSate] = useState<'load' | 'success' | 'fail' | undefined>();
  const medicineListRef = useRef<FlatList<MedicineProduct> | null>();
  const [pageCount, setPageCount] = useState<number>(1);
  const [listFetching, setListFetching] = useState<boolean>(false);
  const [endReached, setEndReached] = useState<boolean>(products ? true : false);
  const [prevData, setPrevData] = useState<MedicineProduct[]>();
  const [itemsLoading, setItemsLoading] = useState<{ [key: string]: boolean }>({});
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { addCartItem, removeCartItem, updateCartItem, cartItems } = useShoppingCart();
  const { cartItems: diagnosticCartItems } = useDiagnosticsCart();
  const { getPatientApiCall } = useAuth();
  const { showAphAlert, setLoading: globalLoading } = useUIElements();
  const { locationDetails, pharmacyLocation, isPharmacyLocationServiceable } = useAppCommonData();
  const pharmacyPincode = g(pharmacyLocation, 'pincode') || g(locationDetails, 'pincode');

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    if (products) {
      return;
    }
    getProductsByCategoryApi(category_id, pageCount)
      .then(({ data }) => {
        console.log(data, 'getProductsByCategoryApi');
        const products = data.products || [];
        setProductsList(products);
        if (products.length < 10) {
          setEndReached(true);
        }
        setPageCount(pageCount + 1);
        setPrevData(products);
      })
      .catch((err) => {
        CommonBugFender('SearchByBrand_getProductsByCategoryApi', err);
        console.log(err, 'errr');
      })
      .finally(() => {
        setIsLoading(false);
        setListFetching(false);
      });

    const movedFrom = props.navigation.getParam('movedFrom');
    if (typeof movedFrom !== 'undefined') {
      const eventAttributes: WebEngageEvents[WebEngageEventName.CATEGORY_PAGE_VIEWED] = {
        source: movedFrom,
        CategoryId: category_id,
        CategoryName: pageTitle,
      };
      postWebEngageEvent(WebEngageEventName.CATEGORY_PAGE_VIEWED, eventAttributes);
    }
  }, []);

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
    suggestionItem && setItemsLoading({ ...itemsLoading, [sku]: true });
    addPharmaItemToCart(
      {
        id: sku,
        mou,
        name,
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
        productType: type_id,
      },
      pharmacyPincode!,
      addCartItem,
      suggestionItem ? null : globalLoading,
      props.navigation,
      currentPatient,
      !!isPharmacyLocationServiceable,
      { source: 'Pharmacy List', categoryId: category_id },
      suggestionItem ? () => setItemsLoading({ ...itemsLoading, [sku]: false }) : undefined
    );
  };

  const onRemoveCartItem = ({ sku }: MedicineProduct) => {
    removeCartItem && removeCartItem(sku);
  };

  const onUpdateCartItem = ({ sku }: MedicineProduct, unit: number) => {
    if (!(unit < 1)) {
      updateCartItem &&
        updateCartItem({
          id: sku,
          quantity: unit,
        });
    }
  };

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const renderHeader = () => {
    const cartItemsCount = cartItems.length + diagnosticCartItems.length;
    return (
      <Header
        container={{
          borderBottomWidth: 0,
        }}
        leftIcon={'backArrow'}
        title={pageTitle || 'SEARCH PRODUCTS'}
        rightComponent={
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
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
        onPressLeftIcon={() => {
          try {
            const MoveDoctor = props.navigation.getParam('movedFrom') || '';

            console.log('MoveDoctor', MoveDoctor);
            if (MoveDoctor === 'registration') {
              props.navigation.dispatch(
                StackActions.reset({
                  index: 0,
                  key: null,
                  actions: [
                    NavigationActions.navigate({
                      routeName: AppRoutes.ConsultRoom,
                    }),
                  ],
                })
              );
            } else {
              props.navigation.goBack();
            }
          } catch (error) {}
        }}
      />
    );
  };

  const isNoResultsFound =
    searchSate != 'load' && searchText.length > 2 && medicineList.length == 0;

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

  const renderSearchInput = () => {
    const goToSearchPage = () => {
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
        props.navigation.navigate(AppRoutes.SearchMedicineScene, { searchText });
        resetSearchState();
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
        onPress={goToSearchPage}
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
          _isSearchFocused={isSearchFocused}
          value={searchText}
          onSubmitEditing={goToSearchPage}
          onChangeText={(value) => {
            onSearchMedicine(value);
          }}
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

  const postwebEngageProductClickedEvent = ({ name, sku }: MedicineProduct) => {
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

  const renderMedicineCard = (
    medicine: MedicineProduct,
    index: number,
    array: MedicineProduct[]
  ) => {
    const medicineCardContainerStyle = [
      {
        marginBottom: 8,
        marginHorizontal: 20,
      },
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

    const isMedicineAddedToCart = cartItems.findIndex((item) => item.id == medicine.sku) != -1;

    return (
      <SearchMedicineCard
        containerStyle={[medicineCardContainerStyle, {}]}
        onPress={() => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Save past Search');
          savePastSeacrh(medicine.sku, medicine.name).catch((e) => {
            // handleGraphQlError(e);
          });
          postwebEngageProductClickedEvent(medicine);
          props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
            sku: medicine.sku,
            title: medicine.name,
            movedFrom: 'search',
          });
        }}
        medicineName={medicine.name}
        imageUrl={
          medicine.thumbnail && !medicine.thumbnail.includes('/default/placeholder')
            ? `${AppConfig.Configuration.IMAGES_BASE_URL[0]}${medicine.thumbnail}`
            : ''
        }
        price={price}
        specialPrice={specialPrice}
        unit={(foundMedicineInCart && foundMedicineInCart.quantity) || 0}
        quantity={getItemQuantity(medicine.sku)}
        onPressAdd={() => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Add item to cart');
          onAddCartItem(medicine);
        }}
        onPressRemove={() => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Remove item from cart');
          onRemoveCartItem(medicine);
        }}
        onNotifyMeClicked={() => {
          onNotifyMeClick(medicine.name);
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
          CommonLogEvent('SEARCH_BY_BRAND', 'Change unit in cart');
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

    const isMedicineAddedToCart = cartItems.findIndex((item) => item.id == medicine.sku) != -1;

    return (
      <SearchMedicineGridCard
        containerStyle={[medicineCardContainerStyle, {}]}
        onPress={() => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Save past Search');
          savePastSeacrh(medicine.sku, medicine.name).catch((e) => {
            // handleGraphQlError(e);
          });
          postwebEngageProductClickedEvent(medicine);
          props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
            sku: medicine.sku,
            title: medicine.name,
          });
        }}
        medicineName={medicine.name}
        imageUrl={
          medicine.thumbnail && !medicine.thumbnail.includes('/default/placeholder')
            ? `${AppConfig.Configuration.IMAGES_BASE_URL[0]}${medicine.thumbnail}`
            : ''
        }
        price={price}
        specialPrice={specialPrice}
        unit={(foundMedicineInCart && foundMedicineInCart.quantity) || 0}
        quantity={getItemQuantity(medicine.sku)}
        onPressAdd={() => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Add item to cart');
          onAddCartItem(medicine);
        }}
        onPressRemove={() => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Remove item from cart');
          onRemoveCartItem(medicine);
        }}
        onNotifyMeClicked={() => {
          onNotifyMeClick(medicine.name);
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
          CommonLogEvent('SEARCH_BY_BRAND', 'Change unit in cart');
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

  const renderEmptyData = () => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <Card
          cardContainer={{
            marginTop: 0,
            elevation: 0,
          }}
          heading={'Uh oh! :('}
          description={'No data Found!'}
          descriptionTextStyle={{
            fontSize: 14,
          }}
          headingTextStyle={{
            fontSize: 14,
          }}
        />
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

  const renderFilterView = () => {
    return (
      <MedicineFilter
        hideCategoryFilter={true}
        isVisible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApplyFilter={(discountRange, priceRange, sortBy) => {
          setFilterVisible(false);
          setIsLoading(true);
          setdiscount(discountRange);
          setprice(priceRange);
          setSortBy(sortBy);
          medicineListRef.current && medicineListRef.current.scrollToOffset({ offset: 0 });
          setIsLoading(false);

          const dicountRangeEvent = discountRange.from + '-' + discountRange.to;
          const eventAttributes: WebEngageEvents[WebEngageEventName.CATEGORY_FILTER_APPLIED] = {
            'category ID': category_id,
            'category name': pageTitle,
            discount: dicountRangeEvent === '0-100' ? '' : dicountRangeEvent,
            price:
              typeof priceRange.from === 'undefined' ? '' : priceRange.from + '-' + priceRange.to,
            'sort by': typeof sortBy === 'undefined' ? '' : JSON.stringify(sortBy),
          };
          postWebEngageEvent(WebEngageEventName.CATEGORY_FILTER_APPLIED, eventAttributes);
        }}
      />
    );
  };

  const getSpecialPrice = (special_price?: string | number) =>
    special_price
      ? typeof special_price == 'string'
        ? Number(special_price)
        : special_price
      : undefined;

  const renderMatchingMedicines = () => {
    let filteredProductsList = productsList;
    const flatListStyle = {
      paddingLeft: showListView ? 0 : 15,
      paddingRight: showListView ? 0 : 15,
      paddingBottom: showListView ? 0 : 20,
    };
    // Price
    if (typeof price.from == 'number' || typeof price.to == 'number') {
      filteredProductsList = filteredProductsList.filter(
        (item) =>
          (price.from ? item.price >= price.from! : true) &&
          (price.to ? item.price <= price.to! : true)
      );
    }
    // Discount
    if (typeof discount.from == 'number' && typeof discount.to == 'number') {
      filteredProductsList = filteredProductsList.filter((item) => {
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
      filteredProductsList.sort((med1, med2) => {
        return (
          getSpecialPrice(med1.special_price || med1.price)! -
          getSpecialPrice(med2.special_price || med2.price)!
        );
      });
    } else if (sortBy == 'Price-H-L') {
      filteredProductsList.sort((med1, med2) => {
        return (
          getSpecialPrice(med2.special_price || med2.price)! -
          getSpecialPrice(med1.special_price || med1.price)!
        );
      });
    } else if (sortBy == 'A-Z') {
      filteredProductsList.sort((med1, med2) =>
        med1.name < med2.name ? -1 : med1.name > med2.name ? 1 : 0
      );
    } else if (sortBy == 'Z-A') {
      filteredProductsList.sort((med1, med2) =>
        med1.name > med2.name ? -1 : med1.name < med2.name ? 1 : 0
      );
    }

    return filteredProductsList.length ? (
      <>
        <FlatList
          removeClippedSubviews={true}
          style={flatListStyle}
          onScroll={() => Keyboard.dismiss()}
          ref={(ref) => {
            medicineListRef.current = ref;
          }}
          data={filteredProductsList}
          numColumns={showListView ? 1 : 2}
          key={showListView ? 1 : 0}
          renderItem={({ item, index }) =>
            showListView
              ? renderMedicineCard(item, index, filteredProductsList)
              : renderMedicineGridCard(item, index, filteredProductsList)
          }
          keyExtractor={(_, index) => `${index}`}
          ListHeaderComponent={
            filteredProductsList.length > 0 ? (
              <View style={styles.listHeaderViewStyle}>
                <Text
                  style={[
                    styles.listHeaderTextStyle,
                    {
                      marginHorizontal: showListView ? 20 : 5,
                    },
                  ]}
                >{`Matching results — ${filteredProductsList.length}`}</Text>
                {renderFilterAndListView(true)}
              </View>
            ) : null
          }
          bounces={false}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (!listFetching && !endReached) {
              setListFetching(true);
              getProductsByCategoryApi(category_id, pageCount)
                .then(({ data }) => {
                  const products = data.products || [];
                  if (prevData && JSON.stringify(prevData) !== JSON.stringify(products)) {
                    setProductsList([...productsList, ...products]);
                    setPageCount(pageCount + 1);
                    setPrevData(products);
                  } else {
                    setEndReached(true);
                    showAphAlert &&
                      showAphAlert({
                        title: 'Alert!',
                        description: "You've reached the end of the list",
                      });
                  }
                })
                .catch((err) => {
                  CommonBugFender('SearchByBrand_getProductsByCategoryApi', err);
                  console.log(err, 'errr');
                })
                .finally(() => {
                  setIsLoading(false);
                  setListFetching(false);
                });
            }
          }}
        />
        {listFetching ? (
          <ActivityIndicator
            style={{ backgroundColor: 'transparent' }}
            animating={listFetching}
            size="large"
            color="green"
          />
        ) : null}
      </>
    ) : (
      renderEmptyData()
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

  const resetSearchState = () => {
    setMedicineList([]);
    setSearchText('');
    setsearchSate(undefined);
  };

  const renderOverlay = () => {
    const isNoResultsFound =
      searchSate != 'load' && searchText.length > 2 && medicineList.length == 0;
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
      (medicineList.length || searchSate == 'load' || isNoResultsFound) && (
        <View style={overlayStyle}>
          <TouchableOpacity activeOpacity={1} style={overlayStyle} onPress={resetSearchState} />
        </View>
      )
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
          if (!Axios.isCancel(e)) {
            setsearchSate('fail');
          }
        });
    }
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

  return (
    <View style={{ flex: 1 }}>
      {isLoading ? (
        <Spinner />
      ) : (
        <SafeAreaView style={styles.safeAreaViewStyle}>
          <View style={styles.headerSearchInputShadow}>
            {renderHeader()}
            {renderSearchInput()}
            {renderSearchResults()}
          </View>
          <View
            style={{
              flex: 1,
            }}
          >
            {renderMatchingMedicines()}
            {renderOverlay()}
          </View>
        </SafeAreaView>
      )}
      {renderFilterView()}
    </View>
  );
};
