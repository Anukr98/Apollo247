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
  getMedicineSearchSuggestionsApi,
  MedicineProduct,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  formatToCartItem,
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
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';

type RecentSearch = getPatientPastMedicineSearches_getPatientPastMedicineSearches;

export interface Props extends NavigationScreenProps<{}> {}

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

  const { currentPatient } = useAllCurrentPatients();
  const { setUserActionPayload } = useServerCart();
  const {
    locationDetails,
    pharmacyLocation,
    isPharmacyLocationServiceable,
    axdcCode,
    pharmacyUserType,
  } = useAppCommonData();
  const { showAphAlert } = useUIElements();
  const {
    getCartItemQty,
    pinCode,
    pharmacyCircleAttributes,
    cartItems,
    asyncPincode,
    serverCartItems,
  } = useShoppingCart();
  const { cartItems: diagnosticCartItems } = useDiagnosticsCart();

  const cartItemsCount = serverCartItems?.length + diagnosticCartItems.length;

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
            diagnosticCartItems.length ? AppRoutes.MedAndTestCart : AppRoutes.ServerCart
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
      navigation.push(AppRoutes.MedicineListing, { searchText: searchText });
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
    return (
      <MedSearchSection
        title={'Recent Searched Products'}
        children={renderProducts(recentSearches.slice(0, 5))}
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

  const renderProducts = (array: RecentSearch[]) => {
    const onPress = (sku: string) => {
      navigation.push(AppRoutes.ProductDetailPage, {
        sku,
        movedFrom: ProductPageViewedSource.RECENT_SEARCH,
      });
    };

    return array.map(({ typeId, name, image }, index, array) => (
      <MedSearchSectionProductView
        key={typeId!}
        title={name!}
        image={image ? productsThumbnailUrl(image) : undefined}
        onPress={() => onPress(typeId!)}
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

    const onPress = (sku: string, urlKey: string) => {
      navigation.push(AppRoutes.ProductDetailPage, {
        sku,
        urlKey,
        movedFrom: ProductPageViewedSource.PARTIAL_SEARCH,
      });
    };

    const onPressNotify = (name: string) => {
      showAphAlert!({
        title: 'Okay! :)',
        description: `You will be notified when ${name} is back in stock.`,
      });
    };

    const onPressAddToCart = (item: MedicineProduct) => {
      setUserActionPayload?.({
        medicineOrderCartLineItems: [
          {
            medicineSKU: item?.sku,
            quantity: 1,
          },
        ],
      });
      setItemsAddingToCart({ ...itemsAddingToCart, [item.sku]: true });
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

    const products: MedicineSearchSuggestionItemProps[] = searchResults.map((item) => {
      const id = item.sku;
      const qty = getCartItemQty(id);
      const onPressAdd = () => {
        if (qty < item.MaxOrderQty) {
          setCurrentProductQuantityInCart(qty + 1);
          setUserActionPayload?.({
            medicineOrderCartLineItems: [
              {
                medicineSKU: item?.sku,
                quantity: qty + 1,
              },
            ],
          });
        }
      };
      const onPressSubstract = () => {
        setCurrentProductQuantityInCart(qty - 1);
        setUserActionPayload?.({
          medicineOrderCartLineItems: [
            {
              medicineSKU: item?.sku,
              quantity: qty - 1,
            },
          ],
        });
      };

      return {
        data: item,
        quantity: qty,
        maxOrderQty: item.MaxOrderQty,
        onPress: () => onPress(id, item?.url_key),
        onPressAddToCart: () => onPressAddToCart(item),
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
