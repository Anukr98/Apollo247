import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { MedicineSearchSuggestionItemProps } from '@aph/mobile-patients/src/components/Medicines/MedicineSearchSuggestionItem';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { MedicineSearchEvents } from '@aph/mobile-patients/src/components/SearchMedicine/MedicineSearchEvents';
import { MedSearchBar } from '@aph/mobile-patients/src/components/SearchMedicine/MedSearchBar';
import { MedSearchSection } from '@aph/mobile-patients/src/components/SearchMedicine/MedSearchSection';
import {
  MedSearchSectionBadgeView,
  Props as MedSearchSectionBadgeViewProps,
} from '@aph/mobile-patients/src/components/SearchMedicine/MedSearchSectionBadgeView';
import { MedSearchSectionProductView } from '@aph/mobile-patients/src/components/SearchMedicine/MedSearchSectionProductView';
import { MedSearchSuggestions } from '@aph/mobile-patients/src/components/SearchMedicine/MedSearchSuggestions';
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
  addPharmaItemToCart,
  formatToCartItem,
  savePastSearch,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

type RecentSearch = getPatientPastMedicineSearches_getPatientPastMedicineSearches;

export interface Props extends NavigationScreenProps<{}> {}

export const MedicineSearch: React.FC<Props> = ({ navigation }) => {
  const [searchText, setSearchText] = useState<string>('');
  const [searchResults, setSearchResults] = useState<MedicineProduct[]>([]);
  const [isSearchFocused, setSearchFocused] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [itemsAddingToCart, setItemsAddingToCart] = useState<{ [key: string]: boolean }>({});

  const { currentPatient } = useAllCurrentPatients();
  const { locationDetails, pharmacyLocation, isPharmacyLocationServiceable } = useAppCommonData();
  const { showAphAlert } = useUIElements();
  const { getCartItemQty, addCartItem, updateCartItem, removeCartItem } = useShoppingCart();
  const client = useApolloClient();

  const { data } = useQuery<
    getPatientPastMedicineSearches,
    getPatientPastMedicineSearchesVariables
  >(GET_PATIENT_PAST_MEDICINE_SEARCHES, {
    variables: {
      patientId: currentPatient?.id,
      type: SEARCH_TYPE.MEDICINE,
    },
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
    });
  };

  const fetchSearchSuggestions = async (searchText: string) => {
    try {
      setLoading(true);
      const {
        data: { products },
      } = await getMedicineSearchSuggestionsApi(searchText);
      fireSearchEvent(searchText, products.length);
      setSearchResults(products || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    const onPressLeftIcon = () => navigation.goBack();
    return (
      <Header
        leftIcon="backArrow"
        onPressLeftIcon={onPressLeftIcon}
        titleComponent={renderSearchBar()}
        titleTextViewStyle={styles.headerSearchBarContainer}
        container={styles.headerContainer}
      />
    );
  };

  const renderSearchBar = () => {
    const onSearchSend = () => {
      navigation.navigate(AppRoutes.MedicineListing, { searchText: searchText });
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
    );
  };

  const renderRecentSearches = () => {
    if (!recentSearches.length) return null;
    return (
      <MedSearchSection
        title={'Recent Searches'}
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
    const onPress = (sku: string, name: string) => {
      navigation.navigate(AppRoutes.MedicineDetailsScene, { sku, movedFrom: 'recent-search' });
      savePastSearch(client, {
        typeId: sku,
        typeName: name,
        type: SEARCH_TYPE.MEDICINE,
        patient: currentPatient?.id,
      });
    };

    return array.map(({ typeId, name, image }) => (
      <MedSearchSectionProductView
        key={typeId!}
        title={name!}
        image={image || ''}
        onPress={() => onPress(typeId!, name!)}
        containerStyle={styles.medSearchSectionProductViewContainer}
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
      <MedSearchSectionBadgeView
        key={`${item.value}`}
        badgeStyle={styles.medSearchSectionBadgeViewBadge}
        {...item}
      />
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

    const onPress = (sku: string, name: string) => {
      navigation.navigate(AppRoutes.MedicineDetailsScene, { sku, movedFrom: 'search' });
      savePastSearch(client, {
        typeId: sku,
        typeName: name,
        type: SEARCH_TYPE.MEDICINE,
        patient: currentPatient?.id,
      });
    };

    const onPressNotify = (name: string) => {
      showAphAlert!({
        title: 'Okay! :)',
        description: `You will be notified when ${name} is back in stock.`,
      });
    };

    const onPressAddToCart = (item: MedicineProduct) => {
      setItemsAddingToCart({ ...itemsAddingToCart, [item.sku]: true });
      addPharmaItemToCart(
        formatToCartItem(item),
        pharmacyPincode!,
        addCartItem,
        null,
        navigation,
        currentPatient,
        !!isPharmacyLocationServiceable,
        { source: 'Pharmacy Partial Search', categoryId: item.category_id },
        () => setItemsAddingToCart({ ...itemsAddingToCart, [item.sku]: false })
      );
    };

    const products: MedicineSearchSuggestionItemProps[] = searchResults.map((item) => {
      const id = item.sku;
      const qty = getCartItemQty(id);
      const onPressAdd = () => {
        if (qty < item.MaxOrderQty) {
          updateCartItem!({ id, quantity: qty + 1 });
        }
      };
      const onPressSubstract = () => {
        qty == 1 ? removeCartItem!(id) : updateCartItem!({ id, quantity: qty - 1 });
      };

      return {
        data: item,
        quantity: qty,
        maxOrderQty: item.MaxOrderQty,
        onPress: () => onPress(id, item.name),
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
      {renderSearchResults()}
      <View style={container}>
        {renderSections()}
        {renderOverlay()}
      </View>
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
  medSearchSectionBadgeViewBadge: { marginRight: 10, marginBottom: 10 },
  medSearchSectionProductViewContainer: { marginRight: 20, marginBottom: 10 },
});
