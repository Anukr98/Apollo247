import { MedicineListingEvents } from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingEvents';
import {
  MedicineListingFilter,
  Props as MedicineListingFilterProps,
} from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingFilter';
import { MedicineListingHeader } from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingHeader';
import { MedicineListingProducts } from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingProducts';
import {
  MedicineListingSections,
  Props as MedicineListingSectionsProps,
} from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingSections';
import { OptionSelectionOverlay } from '@aph/mobile-patients/src/components/Medicines/OptionSelectionOverlay';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  Category,
  getProductsByCategoryApi,
  MedFilter,
  MedicineProduct,
  MedicineProductsResponse,
  searchMedicineApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { ProductPageViewedSource } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { isProductInStock } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AddedToCartToast } from '@aph/mobile-patients/src/components/ui/AddedToCartToast';
import { navigateToScreenWithEmptyStack } from '@aph/mobile-patients/src/helpers/helperFunctions';

export type SortByOption = {
  id: string;
  name: string;
};
export type Filter = MedFilter;
export type SelectedFilters = { [key: string]: string[] };

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
    breadCrumb?: Pick<Category, 'title' | 'category_id'>[];
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
  const breadCrumb = navigation.getParam('breadCrumb') || [];

  const { pinCode } = useShoppingCart();

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
  const [showAddedToCart, setShowAddedToCart] = useState<boolean>(false);

  // global contexts
  const { currentPatient } = useAllCurrentPatients();
  const { showAphAlert } = useUIElements();
  const { axdcCode } = useAppCommonData();

  useEffect(() => {
    if (categoryId && !searchText) {
      searchProductsByCategory(
        categoryId,
        1,
        sortBy?.id || null,
        filterBy,
        filterOptions,
        products
      );
    } else if (searchText.length >= 3) {
      searchProducts(searchText, 1, sortBy?.id || null, filterBy, filterOptions);
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

  const searchProducts = async (
    searchText: string,
    pageId: number,
    sortBy: string | null,
    selectedFilters: SelectedFilters,
    filters: MedFilter[]
  ) => {
    try {
      updateLoading(pageId, true);
      const _selectedFilters = formatFilters(selectedFilters, filters);
      const { data } = await searchMedicineApi(
        searchText,
        pageId,
        sortBy,
        _selectedFilters,
        axdcCode,
        pinCode
      );
      updateProducts(pageId, products, data);
      setProductsTotal(data.product_count);
      updateLoading(pageId, false);
      setPageId(pageId + 1);
      if (data.product_count) {
        setSortByOptions(Array.isArray(data?.sort_by) ? data?.sort_by : []);
        setFilterOptions(Array.isArray(data?.filters) ? data?.filters : []);
      }
      setPageTitle(data.search_heading || '');
      if (pageId == 1) {
        MedicineListingEvents.searchEnterClick({
          keyword: searchText,
          numberofresults: data.product_count || 0,
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
    selectedFilters: SelectedFilters,
    filters: MedFilter[],
    existingProducts: MedicineProduct[]
  ) => {
    try {
      updateLoading(pageId, true);
      const _selectedFilters = formatFilters(selectedFilters, filters);
      const { data } = await getProductsByCategoryApi(
        categoryId,
        pageId,
        sortBy,
        _selectedFilters,
        axdcCode,
        pinCode
      );
      updateProducts(pageId, existingProducts, data);
      setProductsTotal(data.count);
      updateLoading(pageId, false);
      setPageId(pageId + 1);
      setSortByOptions(Array.isArray(data?.sort_by) ? data?.sort_by : []);
      setFilterOptions(Array.isArray(data?.filters) ? data?.filters : []);
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

  const formatFilters = (appliedFilters: SelectedFilters, filters: MedFilter[]) => {
    const isMultiSelection = (key: string) =>
      filters.find(({ attribute }) => attribute === key)?.select_type === 'multi';

    return Object.keys(appliedFilters).reduce(
      (prevVal, currKey) => ({
        ...prevVal,
        ...(appliedFilters[currKey] !== undefined
          ? {
              [currKey]: isMultiSelection(currKey)
                ? appliedFilters[currKey]
                : appliedFilters[currKey][0],
            } // convert to string based on filters attribute value (single/multi)
          : {}),
      }),
      {}
    );
  };

  const renderHeader = () => {
    return <MedicineListingHeader navigation={navigation} movedFrom={movedFrom} />;
  };

  const renderSections = () => {
    const homeBreadCrumb: MedicineListingSectionsProps['breadCrumb'][0] = {
      title: 'Home',
      onPress: () => {
        navigateToScreenWithEmptyStack(navigation, AppRoutes.Medicine);
      },
    };

    const breadCrumbInfo: MedicineListingSectionsProps['breadCrumb'] =
      !breadCrumb.length && !searchText
        ? [{ title: pageTitle }]
        : breadCrumb.map(({ title, category_id }) => ({
            title,
            onPress: () => navigation.push(AppRoutes.MedicineListing, { category_id, title }),
          }));

    const props: MedicineListingSectionsProps = {
      searchText,
      categoryId,
      pageTitle,
      titleNavProp,
      productsTotal,
      filterBy,
      sortBy,
      showListView,
      breadCrumb: searchText ? [] : [homeBreadCrumb, ...breadCrumbInfo],
      setShowListView,
      setFilterVisible,
      setSortByVisible,
    };
    return <MedicineListingSections {...props} />;
  };

  const renderProducts = () => {
    const onEndReached = () => {
      if (!isLoadingMore && products.length < productsTotal) {
        if (searchText) {
          searchProducts(searchText, pageId, sortBy?.id || null, filterBy, filterOptions);
        } else {
          searchProductsByCategory(
            categoryId,
            pageId,
            sortBy?.id || null,
            filterBy,
            filterOptions,
            products
          );
        }
      }
    };

    return (
      <MedicineListingProducts
        data={isLoading ? [] : products}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderLoading()}
        ListEmptyComponent={renderProductsNotFound()}
        navigation={navigation}
        addToCartSource={
          searchText
            ? 'Pharmacy Full Search'
            : breadCrumb.length
            ? 'Category Tree'
            : 'Pharmacy List'
        }
        movedFrom={
          searchText
            ? ProductPageViewedSource.FULL_SEARCH
            : ProductPageViewedSource.CATEGORY_OR_LISTING
        }
        productPageViewedEventProps={{
          CategoryID: categoryId,
          CategoryName: categoryId ? pageTitle : '',
          SectionName: categoryId ? 'Category Tree' : '',
        }}
        view={showListView ? 'list' : 'grid'}
        onAddedSuccessfully={() => {
          setShowAddedToCart(true);
          setTimeout(() => {
            setShowAddedToCart(false);
          }, 7000);
        }}
      />
    );
  };

  const renderAddedToCart = () => <AddedToCartToast navigation={navigation} />;

  const renderSortByOverlay = () => {
    return (
      sortByVisible && (
        <OptionSelectionOverlay
          isVisible={true}
          title={'SORT BY'}
          options={sortByOptions.map(({ id, name }) => ({
            title: name,
            isSelected: sortBy?.id === id,
            onPress: () => {
              setSortByVisible(false);
              setSortBy({ id, name });
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
    const filters = filterOptions.filter(({ values }) => values?.length);

    return (
      filterVisible && (
        <MedicineListingFilter
          isVisible={true}
          filters={filters}
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

  const renderProductsNotFound = () => {
    const isFiltersApplied = Object.keys(filterBy).filter((k) => filterBy[k].length).length;
    const noResults = 'No results found.';
    const clickHere = ' Click here ';
    const remove = 'to remove associated filters.';

    return !isLoading ? (
      <>
        <Text style={styles.loadingMoreProducts}>
          {noResults}
          {!!isFiltersApplied && [
            <Text style={styles.clickHere} onPress={() => setFilterBy({})}>
              {clickHere}
            </Text>,
            <Text>{remove}</Text>,
          ]}
        </Text>
      </>
    ) : null;
  };

  const renderLoadingMore = () => {
    return isLoadingMore
      ? [
          <ActivityIndicator color="green" size="small" />,
          <Text style={styles.loadingMoreProducts}>Hold on, loading more products.</Text>,
        ]
      : null;
  };

  return (
    <SafeAreaView style={container}>
      {renderHeader()}
      {renderSections()}
      {renderProducts()}
      {renderLoadingMore()}
      {renderSortByOverlay()}
      {renderFilterByOverlay()}
      {showAddedToCart && renderAddedToCart()}
    </SafeAreaView>
  );
};

let savedFilter: MedFilter | null = null;
export const getSavedFilter = () => savedFilter;
export const saveFilter = (filter: MedFilter) => {
  savedFilter = filter;
};

const { text, container } = theme.viewStyles;
const { APP_YELLOW, LIGHT_BLUE } = theme.colors;
const styles = StyleSheet.create({
  loadingMoreProducts: {
    ...text('M', 14, LIGHT_BLUE),
    padding: 12,
    textAlign: 'center',
  },
  clickHere: {
    ...text('M', 14, APP_YELLOW),
  },
});
