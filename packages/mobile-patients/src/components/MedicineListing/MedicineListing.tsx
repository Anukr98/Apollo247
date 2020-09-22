import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { MedicineListingEvents } from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingEvents';
import {
  MedicineListingFilter,
  Props as MedicineListingFilterProps,
} from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingFilter';
import { MedicineListingHeader } from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingHeader';
import {
  MedicineListingProducts,
  ProductProps,
} from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingProducts';
import { OptionsDisplayView } from '@aph/mobile-patients/src/components/MedicineListing/OptionsDisplayView';
import { OptionSelectionOverlay } from '@aph/mobile-patients/src/components/Medicines/OptionSelectionOverlay';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Badge } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { CartIcon, FilterOutline } from '@aph/mobile-patients/src/components/ui/Icons';
import { ListGridSelectionView } from '@aph/mobile-patients/src/components/ui/ListGridSelectionView';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  getProductsByCategoryApi,
  MedicineProduct,
  MedicineProductsResponse,
  searchMedicineApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  addPharmaItemToCart,
  formatToCartItem,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Divider } from 'react-native-elements';
import { NavigationScreenProps } from 'react-navigation';

type SortByOption = MedicineProductsResponse['sort_by']['values'][0];
type Filter = MedicineProductsResponse['filters'][0];
type SelectedFilters = { [key: string]: string[] };

export interface Props
  extends NavigationScreenProps<{
    // pass one of searchText, category_id or products
    searchText?: string;
    category_id?: string;
    products?: MedicineProduct[];
    title?: string; // mandatory if category_id passed
    sortBy?: SortByOption; // support for deep link
    filterBy?: SelectedFilters; // support for deep link
    movedFrom?: 'registration' | 'deeplink' | 'home';
  }> {}

export const MedicineListing: React.FC<Props> = ({ navigation }) => {
  // navigation props
  const searchText = navigation.getParam('searchText') || '';
  const categoryId = navigation.getParam('category_id') || '';
  const movedFrom = navigation.getParam('movedFrom');
  const productsNavProp = navigation.getParam('products') || [];
  const sortByNavProp = navigation.getParam('sortBy') || null;
  const filterByNavProp = navigation.getParam('filterBy') || {};
  const titleNavProp = navigation.getParam('title') || '';

  // states
  const [isLoading, setLoading] = useState(false);
  const [isLoadingMore, setLoadingMore] = useState(false);
  const [showListView, setShowListView] = useState<boolean>(true);
  const [products, setProducts] = useState<MedicineProduct[]>(productsNavProp);
  const [productsTotal, setProductsTotal] = useState<number>(productsNavProp.length);
  const [pageId, setPageId] = useState(1);
  const [pageTitle, setPageTitle] = useState(titleNavProp);
  const [sortBy, setSortBy] = useState<SortByOption | null>(sortByNavProp);
  const [sortByOptions, setSortByOptions] = useState<SortByOption[]>([]);
  const [sortByVisible, setSortByVisible] = useState<boolean>(false);
  const [filterBy, setFilterBy] = useState<SelectedFilters>(filterByNavProp);
  const [filterOptions, setFilterOptions] = useState<Filter[]>([]);
  const [filterVisible, setFilterVisible] = useState<boolean>(false);

  // global contexts
  const { currentPatient } = useAllCurrentPatients();
  const { locationDetails, pharmacyLocation, isPharmacyLocationServiceable } = useAppCommonData();
  const { showAphAlert, setLoading: setGlobalLoading } = useUIElements();
  const { getCartItemQty, addCartItem, updateCartItem, removeCartItem } = useShoppingCart();

  // custom variables
  const pharmacyPincode = pharmacyLocation?.pincode || locationDetails?.pincode;
  const isFiltersApplied = Object.keys(filterBy).find((k) => filterBy[k]?.length);

  useEffect(() => {
    if (searchText.length >= 3) {
      searchProducts(searchText, 1);
    }
  }, [sortBy, filterBy]);

  useEffect(() => {
    if (categoryId && !searchText) {
      searchProductsByCategory(categoryId, 1, sortBy?.value || null, filterBy);
    }
  }, [sortBy, filterBy]);

  useEffect(() => {
    if (categoryId && !searchText && movedFrom) {
      MedicineListingEvents.categoryPageViewed({
        source: movedFrom,
        CategoryId: categoryId,
        CategoryName: pageTitle.toUpperCase(),
      });
    }
  }, []);

  const searchProducts = async (searchText: string, pageId: number) => {
    try {
      updateLoading(pageId, true);
      const { data } = await searchMedicineApi(searchText, pageId);
      updateProducts(pageId, products, data);
      setProductsTotal(data.product_count);
      updateLoading(pageId, false);
      setPageId(pageId + 1);
      setPageTitle(data.search_heading || '');
      if (pageId == 1) {
        MedicineListingEvents.searchEnterClick({
          keyword: searchText,
          numberofresults: data.product_count,
        });
      }
      MedicineListingEvents.tagalysSearch(currentPatient?.id, {
        pl_type: 'search',
        pl_details: { q: searchText },
        pl_products: products?.map((p) => p.sku) || [],
        pl_page: pageId,
        pl_total: data.product_count,
      });
    } catch (error) {
      updateLoading(pageId, false);
      renderAlert();
    }
  };

  const searchProductsByCategory = async (
    categoryId: string,
    pageId: number,
    sortBy: string | null,
    filters: SelectedFilters
  ) => {
    try {
      updateLoading(pageId, true);
      const { data } = await getProductsByCategoryApi(categoryId, pageId, sortBy, filters);
      updateProducts(pageId, products, data);
      setProductsTotal(data.count);
      updateLoading(pageId, false);
      setPageId(pageId + 1);
      setSortByOptions(data.sort_by.values || []);
      setFilterOptions(data.filters);
    } catch (error) {
      updateLoading(pageId, false);
      renderAlert();
    }
  };

  const updateLoading = (pageId: number, isLoading: boolean) => {
    pageId == 1 ? setLoading(isLoading) : setLoadingMore(isLoading);
  };

  const updateProducts = (
    pageId: number,
    existingProducts: MedicineProduct[],
    productsApiResponse: MedicineProductsResponse
  ) => {
    const { products } = productsApiResponse;
    if (pageId == 1) {
      setProducts(products || []);
    } else {
      setProducts([...existingProducts, ...(products || [])]);
    }
  };

  const renderAlert = (title?: string, message?: string) => {
    showAphAlert!({
      title: title || string.common.uhOh,
      description: message || 'Oops! seems like we are having an issue. Please try again.',
    });
  };

  const renderHeader = () => {
    return <MedicineListingHeader navigation={navigation} movedFrom={movedFrom} />;
  };

  const paddingView = <View style={styles.paddingView} />;

  const getMedListingProducts = (products: MedicineProduct[]): ProductProps[] => {
    const onPress = (sku: string) => {
      navigation.navigate(AppRoutes.MedicineDetailsScene, { sku, movedFrom: 'search' });
    };

    const onPressNotify = (name: string) => {
      renderAlert('Okay! :)', `You will be notified when ${name} is back in stock.`);
    };

    const onPressAddToCart = (item: MedicineProduct) => {
      addPharmaItemToCart(
        formatToCartItem(item),
        pharmacyPincode!,
        addCartItem,
        setGlobalLoading,
        navigation,
        currentPatient,
        !!isPharmacyLocationServiceable,
        { source: 'Pharmacy Full Search', categoryId: item.category_id }
      );
    };

    return products.map((item) => {
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
        ...item,
        quantity: qty,
        maxOrderQty: item.MaxOrderQty,
        onPress: () => onPress(id),
        onPressAddToCart: () => onPressAddToCart(item),
        onPressAdd: onPressAdd,
        onPressSubstract: onPressSubstract,
        onPressNotify: () => onPressNotify(item.name),
      };
    });
  };

  const renderProducts = () => {
    const onEndReached = () => {
      if (!isLoadingMore && products.length < productsTotal) {
        if (searchText) {
          searchProducts(searchText, pageId);
        } else {
          searchProductsByCategory(categoryId, pageId, sortBy?.value || null, filterBy);
        }
      }
    };

    return (
      <MedicineListingProducts
        data={isLoading ? [] : getMedListingProducts(products)}
        view={showListView ? 'list' : 'grid'}
        onEndReached={onEndReached}
        onEndReachedThreshold={1}
        ListHeaderComponent={renderSections()}
        ListFooterComponent={renderLoading()}
      />
    );
  };

  const renderSortByOverlay = () => {
    return (
      sortByVisible && (
        <OptionSelectionOverlay
          isVisible={true}
          title={'SORT BY'}
          options={sortByOptions.map(({ value, label }) => ({
            title: label,
            isSelected: sortBy?.value === value,
            onPress: () => {
              setSortByVisible(false);
              setSortBy({ value, label });
            },
          }))}
          onRequestClose={() => setSortByVisible(false)}
          onBackdropPress={() => setSortByVisible(false)}
        />
      )
    );
  };

  const renderFilterByOverlay = () => {
    const onClose = () => setFilterVisible(false);
    const onApplyFilters: MedicineListingFilterProps['onApplyFilters'] = (appliedFilters) => {
      onClose();
      setFilterBy(appliedFilters);
    };
    return (
      filterVisible && (
        <MedicineListingFilter
          isVisible={true}
          filters={filterOptions}
          selectedFilters={filterBy}
          onClose={onClose}
          onApplyFilters={onApplyFilters}
        />
      )
    );
  };

  const renderLoading = () => {
    return isLoading ? <ActivityIndicator color="green" size="large" /> : null;
  };

  const renderLoadingMore = () => {
    return isLoadingMore
      ? [
          <ActivityIndicator color="green" size="small" />,
          <Text style={styles.loadingMoreProducts}>Hold on, loading more products.</Text>,
        ]
      : null;
  };

  const renderSections = () => {
    // consider heading from API for search (OR) title from navigation prop for category based products
    const _pageTitle = (searchText && pageTitle) || titleNavProp || '';
    const _productsTotal =
      (categoryId || Number(categoryId) == 0) && !searchText && productsTotal
        ? ` | ${productsTotal} Products`
        : '';

    const pageTitleView = !!_pageTitle && (
      <Text style={styles.pageTitle}>
        {_pageTitle}
        {!!_productsTotal && <Text style={styles.productsTotal}>{_productsTotal}</Text>}
      </Text>
    );

    const divider = !!_pageTitle && <Divider style={styles.divider} />;

    const optionsView = (
      <OptionsDisplayView
        options={[
          {
            icon: <CartIcon />, // TODO: Replace icon
            title: 'Sort By',
            subtitle: sortBy?.label || 'Apply sorting',
            onPress: () => setSortByVisible(true),
            containerStyle: styles.sortByContainer,
          },
          {
            icon: (
              <View>
                <FilterOutline style={styles.filterOutline} />
                {isFiltersApplied && <Badge containerStyle={styles.filterBadgeContainer} />}
              </View>
            ),
            title: 'Filter By',
            subtitle: isFiltersApplied ? 'Filters applied' : 'Apply filters',
            onPress: () => setFilterVisible(true),
            containerStyle: styles.filterByContainer,
          },
          {
            icon: (
              <ListGridSelectionView
                isListView={showListView}
                onPressGridView={() => setShowListView(false)}
                onPressListView={() => setShowListView(true)}
              />
            ),
            onPress: () => {
              setShowListView(!showListView);
              MedicineListingEvents.categoryListGridView({
                Source: searchText ? 'Search' : 'Category',
                Type: showListView ? 'List' : 'Grid',
                'Category id': !searchText ? categoryId : undefined,
                'Category name': !searchText ? pageTitle : undefined,
              });
            },
            containerStyle: styles.listGridSelectionContainer,
          },
        ]}
      />
    );

    const views = [pageTitleView, [divider, optionsView]];

    return (
      <View style={styles.sectionWrapper}>
        {views.map((view, index, array) => [view, index + 1 !== array.length && paddingView])}
      </View>
    );
  };

  return (
    <SafeAreaView style={container}>
      {renderHeader()}
      {renderProducts()}
      {renderLoadingMore()}
      {renderSortByOverlay()}
      {renderFilterByOverlay()}
    </SafeAreaView>
  );
};

const { text, card, container } = theme.viewStyles;
const styles = StyleSheet.create({
  paddingView: { width: 20, height: 0 },
  sectionWrapper: {
    ...card(20, 0, 0, '#fff', 5),
    paddingVertical: 10,
    marginBottom: 16,
  },
  pageTitle: {
    ...text('SB', 14, '#02475B'),
  },
  loadingMoreProducts: {
    ...text('M', 14, '#02475B'),
    padding: 12,
    textAlign: 'center',
  },
  productsTotal: {
    ...text('R', 14, '#02475B'),
  },
  divider: { marginVertical: 10 },
  sortByContainer: { justifyContent: 'flex-start', width: '37%' },
  filterByContainer: { width: '37%' },
  listGridSelectionContainer: { justifyContent: 'flex-end', width: '25%' },
  filterBadgeContainer: {
    width: 6,
    height: 6,
    backgroundColor: '#00B38E',
    top: -2.5,
    right: -2.5,
  },
  filterOutline: { width: 16, height: 17 },
});
