import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { MedicineSearchSuggestionItemProps } from '@aph/mobile-patients/src/components/Medicines/MedicineSearchSuggestionItem';
import { MedicineSearchEvents } from '@aph/mobile-patients/src/components/MedicineSearch/MedicineSearchEvents';
import { MedSearchBar } from '@aph/mobile-patients/src/components/MedicineSearch/MedSearchBar';
import { MedSearchSection } from '@aph/mobile-patients/src/components/MedicineSearch/MedSearchSection';
import {
  MedSearchSectionBadgeView,
  Props as MedSearchSectionBadgeViewProps,
} from '@aph/mobile-patients/src/components/MedicineSearch/MedSearchSectionBadgeView';
import { MedSearchSectionProductView } from '@aph/mobile-patients/src/components/MedicineSearch/MedSearchSectionProductView';
import { MedSearchSuggestions } from '@aph/mobile-patients/src/components/MedicineSearch/MedSearchSuggestions';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { GET_PATIENT_PAST_MEDICINE_SEARCHES } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getPatientPastMedicineSearches,
  getPatientPastMedicineSearchesVariables,
  getPatientPastMedicineSearches_getPatientPastMedicineSearches,
} from '@aph/mobile-patients/src/graphql/types/getPatientPastMedicineSearches';
import { SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  availabilityApi247,
  getMedicineSearchSuggestionsApi,
  MedicineProduct,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  addPharmaItemToCart,
  formatToCartItem,
  g,
  getAvailabilityForSearchSuccess,
  getDiscountPercentage,
  postCleverTapEvent,
  productsThumbnailUrl,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { ProductPageViewedSource } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { SafeAreaView, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { CartIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { Badge } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { SuggestedQuantityNudge } from '@aph/mobile-patients/src/components/SuggestedQuantityNudge/SuggestedQuantityNudge';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';

type RecentSearch = getPatientPastMedicineSearches_getPatientPastMedicineSearches;

export interface Props
  extends NavigationScreenProps<{
    movedFrom?: string;
    navSrcForSearchSuccess?: string;
  }> {}

export const MedicineSearch: React.FC<Props> = ({ navigation }) => {
  const [searchText, setSearchText] = useState<string>('');
  const [searchResults, setSearchResults] = useState<MedicineProduct[]>([]);
  const [isSearchFocused, setSearchFocused] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [itemsAddingToCart, setItemsAddingToCart] = useState<{ [key: string]: boolean }>({});
  const [showSuggestedQuantityNudge, setShowSuggestedQuantityNudge] = useState<boolean>(false);
  const [shownNudgeOnce, setShownNudgeOnce] = useState<boolean>(false);
  const [currentProductIdInCart, setCurrentProductIdInCart] = useState<string>(null);
  const [currentProductQuantityInCart, setCurrentProductQuantityInCart] = useState<number>(0);
  const [itemPackForm, setItemPackForm] = useState<string>('');
  const [maxOrderQty, setMaxOrderQty] = useState<number>(0);
  const [suggestedQuantity, setSuggestedQuantity] = useState<string>(null);
  const navSrcForSearchSuccess = navigation.getParam('navSrcForSearchSuccess')
    ? navigation.getParam('navSrcForSearchSuccess')
    : '';

  const { currentPatient } = useAllCurrentPatients();
  const {
    locationDetails,
    pharmacyLocation,
    isPharmacyLocationServiceable,
    pharmacyUserType,
  } = useAppCommonData();
  const { showAphAlert } = useUIElements();
  const {
    getCartItemQty,
    addCartItem,
    updateCartItem,
    removeCartItem,
    pinCode,
    pharmacyCircleAttributes,
    cartItems,
    asyncPincode,
    axdcCode,
  } = useShoppingCart();
  const { cartItems: diagnosticCartItems } = useDiagnosticsCart();

  const cartItemsCount = cartItems.length + diagnosticCartItems.length;

  const { data } = useQuery<
    getPatientPastMedicineSearches,
    getPatientPastMedicineSearchesVariables
  >(GET_PATIENT_PAST_MEDICINE_SEARCHES, {
    variables: {
      patientId: currentPatient?.id,
      type: SEARCH_TYPE.MEDICINE,
    },
    fetchPolicy: 'no-cache',
  });

  const recentSearches = (data?.getPatientPastMedicineSearches as RecentSearch[]) || [];
  const customersAlsoBought: RecentSearch[] = [];
  const categories: MedSearchSectionBadgeViewProps[] = [];
  const pharmacyPincode = pharmacyLocation?.pincode || locationDetails?.pincode;

  useEffect(() => {
    debounce.current(searchText);
  }, [searchText]);

  const onSearch = (searchText: string) => {
    if (searchText.length >= 3) {
      fetchSearchSuggestions(searchText);
    } else {
      setSearchResults([]);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (cartItems.find(({ id }) => id?.toUpperCase() === currentProductIdInCart)) {
      if (shownNudgeOnce === false) {
        setShowSuggestedQuantityNudge(true);
      }
    }
  }, [cartItems, currentProductQuantityInCart, currentProductIdInCart]);

  useEffect(() => {
    if (showSuggestedQuantityNudge === false) {
      setShownNudgeOnce(false);
    }
  }, [currentProductIdInCart]);

  useEffect(() => {}, [showSuggestedQuantityNudge]);

  const debounce = useRef(_.debounce(onSearch, 300));

  const fireSearchEvent = (keyword: string, results: number) => {
    MedicineSearchEvents.pharmacySearchResults({
      Source: 'Pharmacy Search',
      keyword: keyword,
    });
    MedicineSearchEvents.search({
      Source: 'Pharmacy List',
      keyword: keyword,
      resultsdisplayed: results,
      User_Type: pharmacyUserType,
    });
    MedicineSearchEvents.pharmacySearch({
      source: 'Pharmacy List',
      keyword: keyword,
      results: results,
      'User Type': pharmacyUserType,
    });
  };

  const fetchSearchSuggestions = async (searchText: string) => {
    try {
      setLoading(true);
      const {
        data: { products },
      } = await getMedicineSearchSuggestionsApi(searchText, axdcCode, pinCode);
      fireSearchEvent(searchText, products.length);
      setSearchResults(products || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const renderCartIcon = () => (
    <View>
      <TouchableOpacity
        style={{ alignItems: 'flex-end' }}
        activeOpacity={1}
        onPress={() =>
          navigation.navigate(
            diagnosticCartItems.length ? AppRoutes.MedAndTestCart : AppRoutes.MedicineCart
          )
        }
      >
        <CartIcon />
        {cartItemsCount > 0 && <Badge label={cartItemsCount} />}
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => {
    const onPressLeftIcon = () => navigation.goBack();
    return (
      <Header
        leftIcon="backArrow"
        onPressLeftIcon={onPressLeftIcon}
        titleComponent={renderCartIcon()}
        titleTextViewStyle={styles.headerSearchBarContainer}
        container={styles.headerContainer}
      />
    );
  };

  const renderSearchBar = () => {
    const onSearchSend = () => {
      navigation.push(AppRoutes.MedicineListing, {
        searchText: searchText,
        comingFromSearch: true,
        navSrcForSearchSuccess,
      });
    };
    const errorMessage =
      !isLoading && searchText.length >= 3 && searchResults.length === 0
        ? `Hit enter to search for '${searchText}'`
        : undefined;
    const onChangeText = (text: string) => {
      if (text.length >= 3) {
        setLoading(true);
      } // this block is to fix no results errorMessage appearing while loading response
      setSearchText(text);
    };

    return (
      <View style={styles.searchContainer}>
        <MedSearchBar
          value={searchText}
          onChangeText={onChangeText}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          isFocused={isSearchFocused}
          minCharacterLength={3}
          onSearchSend={onSearchSend}
          errorMessage={errorMessage}
          isLoading={isLoading}
        />
      </View>
    );
  };

  const renderRecentSearches = () => {
    if (!recentSearches.length) return null;
    const recentlySearchedProducts = true;
    return (
      <MedSearchSection
        title={'Recent Searched Products'}
        children={renderProducts(recentSearches.slice(0, 5), recentlySearchedProducts)}
        childrenContainerStyle={styles.childrenContainer}
      />
    );
  };

  const renderCustomersAlsoBought = () => {
    if (!customersAlsoBought.length) return null;
    return (
      <MedSearchSection
        title={'Customer’s Also Bought'}
        children={renderProducts(customersAlsoBought)}
        childrenContainerStyle={styles.childrenContainer}
      />
    );
  };

  const renderProducts = (array: RecentSearch[], ...param) => {
    const recentlySearchedProducts = param;
    console.log(recentlySearchedProducts);
    const onPress = (sku: string, index: number, name: string) => {
      navigation.push(AppRoutes.ProductDetailPage, {
        sku,
        movedFrom: ProductPageViewedSource.RECENT_SEARCH,
      });
      if (recentlySearchedProducts) {
        const pincode = asyncPincode?.pincode || pharmacyPincode;
        const availability = getAvailabilityForSearchSuccess(pincode, sku);
        const cleverTapEventAttributes = {
          'Nav src': navSrcForSearchSuccess,
          Status: 'Success',
          Keyword: searchText,
          Position: index + 1,
          Source: 'Recent Searched Products',
          Action: 'Product detail page viewed',
          'Product availability': availability ? 'Is in stock' : 'Out of stock',
          'Product position': index + 1,
          'Results shown': recentSearches?.length,
          'SKU ID': sku,
          'Product name': name,
        };
        postCleverTapEvent(CleverTapEventName.PHARMACY_SEARCH_SUCCESS, cleverTapEventAttributes);
      }
    };

    return array.map(({ typeId, name, image }, index, array) => (
      <MedSearchSectionProductView
        key={typeId!}
        title={name!}
        image={image ? productsThumbnailUrl(image) : undefined}
        onPress={() => onPress(typeId!, index, name)}
        containerStyle={
          index + 1 === array.length ? styles.productViewContainer2 : styles.productViewContainer
        }
      />
    ));
  };

  const renderTrendingSearches = () => {
    if (!categories.length) return null;
    return (
      <MedSearchSection
        title={'Trending Searches'}
        children={renderCategories(categories)}
        childrenContainerStyle={styles.childrenContainer}
      />
    );
  };

  const renderPopularCategory = () => {
    if (!categories.length) return null;
    return (
      <MedSearchSection
        title={'Popular Category'}
        children={renderCategories(categories)}
        childrenContainerStyle={styles.childrenContainer}
      />
    );
  };

  const renderCategories = (array: MedSearchSectionBadgeViewProps[]) => {
    return array.map((item) => (
      <MedSearchSectionBadgeView key={`${item.value}`} badgeStyle={styles.badge} {...item} />
    ));
  };

  const renderSections = () => {
    return (
      <ScrollView bounces={false}>
        {renderRecentSearches()}
        {renderCustomersAlsoBought()}
        {renderTrendingSearches()}
        {renderPopularCategory()}
      </ScrollView>
    );
  };

  const renderOverlay = () => {
    const showOverlay = searchText.length >= 3 && searchResults.length;
    return !!showOverlay && <View style={overlayStyle} />;
  };

  const renderSearchResults = () => {
    if (!searchResults.length) return null;

    const key = 'queryName';
    const keywordArr = [];
    searchResults.map((obj) => {
      if (Object.keys(obj).includes(key)) {
        keywordArr.push(obj?.queryName);
      }
    });

    const onPress = (sku: string, urlKey: string, index: number, item) => {
      navigation.push(AppRoutes.ProductDetailPage, {
        sku,
        urlKey,
        movedFrom: ProductPageViewedSource.PARTIAL_SEARCH,
      });
      const pincode = asyncPincode?.pincode || pharmacyPincode;
      const availability = getAvailabilityForSearchSuccess(pincode, item?.sku);
      const discount = getDiscountPercentage(item?.price, item?.special_price);
      const discountPercentage = discount ? discount + '%' : '0%';
      const cleverTapEventAttributes = {
        'Nav src': navSrcForSearchSuccess,
        Status: 'Success',
        Keyword: searchText,
        Position: index + 1,
        Source: 'Partial search',
        Action: 'Product detail page viewed',
        'Product availability': availability ? 'Is in stock' : 'Out of stock',
        'Product position': index + 1 - keywordArr?.length,
        'Results shown': searchResults?.length,
        'SKU ID': item?.sku,
        'Product name': item?.name,
        Discount: discountPercentage,
      };
      postCleverTapEvent(CleverTapEventName.PHARMACY_SEARCH_SUCCESS, cleverTapEventAttributes);
    };

    const onPressNotify = (name: string) => {
      showAphAlert!({
        title: 'Okay! :)',
        description: `You will be notified when ${name} is back in stock.`,
      });
    };

    const onPressAddToCart = (
      item: MedicineProduct,
      comingFromSearch: boolean,
      cleverTapSearchSuccessEventAttributes: object
    ) => {
      setItemsAddingToCart({ ...itemsAddingToCart, [item.sku]: true });
      addPharmaItemToCart(
        formatToCartItem(item),
        asyncPincode?.pincode || pharmacyPincode!,
        addCartItem,
        null,
        navigation,
        currentPatient,
        !!isPharmacyLocationServiceable,
        { source: 'Pharmacy Partial Search', categoryId: item.category_id },
        JSON.stringify(cartItems),
        () => setItemsAddingToCart({ ...itemsAddingToCart, [item.sku]: false }),
        pharmacyCircleAttributes!,
        () => {},
        comingFromSearch,
        cleverTapSearchSuccessEventAttributes
      );
      setCurrentProductIdInCart(item.sku);
      item.pack_form ? setItemPackForm(item.pack_form) : setItemPackForm('');
      item.suggested_qty ? setSuggestedQuantity(item.suggested_qty) : setSuggestedQuantity(null);
      item.MaxOrderQty
        ? setMaxOrderQty(item.MaxOrderQty)
        : item.suggested_qty
        ? setMaxOrderQty(+item.suggested_qty)
        : setMaxOrderQty(0);
      setCurrentProductQuantityInCart(1);
    };

    const products: MedicineSearchSuggestionItemProps[] = searchResults.map((item, index) => {
      const id = item.sku;
      const qty = getCartItemQty(id);
      const onPressAdd = () => {
        if (qty < item.MaxOrderQty) {
          updateCartItem!({ id, quantity: qty + 1 });
          setCurrentProductQuantityInCart(qty + 1);
        }
      };
      const onPressSubstract = () => {
        qty == 1 ? removeCartItem!(id) : updateCartItem!({ id, quantity: qty - 1 });
        setCurrentProductQuantityInCart(qty - 1);
      };
      const comingFromSearch = true;

      const discount = getDiscountPercentage(item?.price, item?.special_price);
      const discountPercentage = discount ? discount + '%' : '0%';

      const cleverTapSearchSuccessEventAttributes = {
        'Nav src': navSrcForSearchSuccess,
        Status: 'Success',
        Keyword: searchText,
        Position: index + 1,
        Source: 'Partial search',
        Action: 'Add to cart',
        'Product availability': 'Available',
        'Product position': index + 1 - keywordArr?.length,
        'Results shown': searchResults?.length,
        'SKU ID': item?.sku,
        'Product name': item?.name,
        Discount: discountPercentage,
      };

      return {
        data: item,
        quantity: qty,
        maxOrderQty: item.MaxOrderQty,
        onPress: () => onPress(id, item?.url_key, index, item),
        onPressAddToCart: () =>
          onPressAddToCart(item, comingFromSearch, cleverTapSearchSuccessEventAttributes),
        onPressAdd: onPressAdd,
        onPressSubstract: onPressSubstract,
        onPressNotify: () => onPressNotify(item.name),
        loading: itemsAddingToCart[item.sku],
      };
    });
    return <MedSearchSuggestions data={products} />;
  };

  return (
    <SafeAreaView style={container}>
      {renderHeader()}
      {renderSearchBar()}
      {renderSearchResults()}
      <View style={container}>
        {renderSections()}
        {renderOverlay()}
      </View>
      {showSuggestedQuantityNudge &&
        shownNudgeOnce === false &&
        !!suggestedQuantity &&
        +suggestedQuantity > 1 &&
        currentProductQuantityInCart < +suggestedQuantity && (
          <SuggestedQuantityNudge
            suggested_qty={suggestedQuantity}
            sku={currentProductIdInCart}
            packForm={itemPackForm}
            maxOrderQty={maxOrderQty}
            setShownNudgeOnce={setShownNudgeOnce}
            showSuggestedQuantityNudge={showSuggestedQuantityNudge}
            setShowSuggestedQuantityNudge={setShowSuggestedQuantityNudge}
            setCurrentProductQuantityInCart={setCurrentProductQuantityInCart}
          />
        )}
    </SafeAreaView>
  );
};

const { card, container, overlayStyle } = theme.viewStyles;
const styles = StyleSheet.create({
  headerSearchBarContainer: {
    flexGrow: 100,
  },
  headerContainer: {
    ...card(0, 0, 0, '#fff', 6),
    borderBottomWidth: 0,
    zIndex: 1,
  },
  childrenContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  badge: { marginRight: 10, marginBottom: 10 },
  productViewContainer: { marginRight: 20, marginBottom: 10 },
  productViewContainer2: { marginRight: 0, marginBottom: 10 },
  searchContainer: {
    padding: 10,
    backgroundColor: theme.colors.WHITE,
  },
});
