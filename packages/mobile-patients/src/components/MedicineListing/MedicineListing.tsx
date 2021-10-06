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
  getMedicineCategoryIds,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { ProductPageViewedSource } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { EventHandler, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  BackHandler,
  View,
  ScrollView,
  Animated,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AddedToCartToast } from '@aph/mobile-patients/src/components/ui/AddedToCartToast';
import { navigateToScreenWithEmptyStack } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import MedicineBottomFilters from './MedicineBottomFilters';
import { productsThumbnailUrl } from '@aph/mobile-patients/src/helpers/helperFunctions';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';

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
    categoryName?: string;
  }> {}

export const MedicineListing: React.FC<Props> = ({ navigation }) => {
  interface bottomFilter {
    category_id: string;
    url_key: string;
    title: string;
  }

  // navigation props
  const searchText = navigation.getParam('searchText') || '';
  const [categoryId, setCategoryId] = useState<string>(navigation.getParam('category_id') || '');
  const movedFrom = navigation.getParam('movedFrom');
  const productsNavProp = navigation.getParam('products') || [];
  const sortByNavProp = navigation.getParam('sortBy') || null;
  const filterByNavProp = navigation.getParam('filterBy') || {};
  const titleNavProp = navigation.getParam('title') || '';
  const breadCrumb = navigation.getParam('breadCrumb') || [];
  const categoryName = navigation.getParam('categoryName') || '';

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
  const [showFilterOption, setShowFilterOption] = useState<boolean>(false);
  const [bottomFilters, setBottomFilters] = React.useState<bottomFilter[]>([]);
  const [bottomCategoryId, setBottomCategoryId] = React.useState<string>('');
  const [scroll, setScroll] = React.useState(new Animated.Value(0));
  const [bannerImage, setBannerImage] = React.useState<string>('');
  const onEndReachedCalledDuringMomentum = React.useRef(true);

  const HEADER_MAX_HEIGHT = 140;
  const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 60 : 73;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  const scrollY = Animated.add(scroll, Platform.OS === 'ios' ? HEADER_MAX_HEIGHT : 0);

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_SCROLL_DISTANCE],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  const imageTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  // global contexts
  const { currentPatient } = useAllCurrentPatients();
  const { showAphAlert } = useUIElements();
  const { axdcCode } = useAppCommonData();

  //styles
  const styles2 = {
    shimmer: { height: bannerImage?.length > 0 ? 140 : 0, width: '100%', objectFit: 'contain' },
    animatedView: {
      marginTop: bannerImage?.length > 0 ? 140 : 0,
    },
  };

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
    } else if (categoryName) {
      getCategoryIdByName(categoryName);
    }
  }, [sortBy, filterBy]);

  useEffect(() => {
    const filterContent = filterOptions.filter(({ values }) => values?.length);
    setShowFilterOption(!!filterContent.length);
  }, [filterOptions]);

  useEffect(() => {
    if (categoryId && !searchText && movedFrom) {
      MedicineListingEvents.categoryPageViewed({
        source: movedFrom,
        CategoryId: categoryId,
        CategoryName: pageTitle.toUpperCase(),
      });
    }
    BackHandler.addEventListener('hardwareBackPress', onPressHardwareBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onPressHardwareBack);
    };
  }, []);

  const onBottomCategoryChange = (categoryId: string) => {
    if (categoryId?.length > 0) {
      setProducts([]);
      setProductsTotal(0);
      setPageId(1);
      setFilterBy({ category: [categoryId] });
      searchProductsByCategory(
        categoryId,
        1,
        sortBy?.id || null,
        { category: [categoryId] },
        filterOptions,
        []
      );
    }
  };

  const onPressHardwareBack = () => navigation.goBack();

  const getCategoryIdByName = async (category: string) => {
    try {
      const response = await getMedicineCategoryIds(category, 'category');
      const { data } = response;
      if (data?.category_id) {
        setCategoryId(data?.category_id);
        setPageTitle(category);
        searchProductsByCategory(
          data?.category_id,
          1,
          sortBy?.id || null,
          filterBy,
          filterOptions,
          products
        );
      }
    } catch (error) {
      CommonBugFender('getCategoryIdByName', error);
      renderAlert();
    }
  };

  const formatSearchFilter = (selectedFilters: SelectedFilters) => {
    const keys = Object.keys(selectedFilters);
    const selectedFilter: any = {};
    if (keys?.length) {
      keys.forEach((key) => {
        if (selectedFilters?.[key]?.length) {
          selectedFilter[key] = selectedFilters[key];
        }
      });
    }
    return selectedFilter;
  };

  const searchProducts = async (
    searchText: string,
    pageId: number,
    sortBy: string | null,
    selectedFilters: SelectedFilters,
    filters: MedFilter[]
  ) => {
    try {
      updateLoading(pageId, true);
      const _selectedFilters = formatSearchFilter(selectedFilters);
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
          'No of results': data.product_count || 0,
          source: movedFrom || '',
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
      if (_selectedFilters.category != navigation.getParam('category_id'))
        setBottomCategoryId(_selectedFilters?.category);
      else {
        setFilterBy({});
      }
      const { data } = await getProductsByCategoryApi(
        categoryId,
        pageId,
        sortBy,
        _selectedFilters,
        axdcCode,
        pinCode
      );
      if (
        data?.design[0]?.mobile_banner_image.endsWith('.jpg') ||
        data?.design[0]?.mobile_banner_image.endsWith('.png') ||
        data?.design[0]?.mobile_banner_image.endsWith('.jpeg')
      )
        setBannerImage(data?.design[0]?.mobile_banner_image);
      updateProducts(pageId, existingProducts, data);
      setProductsTotal(data.count);
      updateLoading(pageId, false);
      setPageId(pageId + 1);
      setSortByOptions(Array.isArray(data?.sort_by) ? data?.sort_by : []);
      setFilterOptions(Array.isArray(data?.filters) ? data?.filters : []);
      const arr: bottomFilter[] = [];

      if (data?.filters) {
        data?.filters?.map((item) => {
          if (item?.name === 'Category') {
            item?.values?.map((value) => {
              value?.child?.map((child: any) => {
                arr.push(child);
              });
            });
          }
        });
      }
      setBottomFilters((prev: any) => [...prev, ...arr]);
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
      showFilterOption,
    };
    return <MedicineListingSections {...props} />;
  };
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
  const renderProducts = () => {
    return (
      <>
        {isLoading ? (
          renderLoading()
        ) : (
          <>
            <MedicineListingProducts
              data={products}
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
              onMomentumScrollBegin={() => {
                onEndReachedCalledDuringMomentum.current = false;
              }}
            />
          </>
        )}
      </>
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
    return isLoading ? (
      <ActivityIndicator color="green" size="large" />
    ) : (
      !isLoadingMore && products.length < productsTotal && (
        <TouchableOpacity
          onPress={() => onEndReached()}
          style={{ ...styles.btnStyle, marginTop: 20 }}
        >
          <Text style={theme.viewStyles.text('SB', 10, '#fc9916', 1, 24, 0)}>Load More</Text>
        </TouchableOpacity>
      )
    );
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
    return isLoadingMore ? (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingMoreProducts}>Hold on, loading more products.</Text>
        <ActivityIndicator color="green" size="small" />
      </View>
    ) : null;
  };

  const renderFilterButtons = () => {
    return (
      <>
        {bottomFilters?.length > 0 && !isLoading && (
          <View style={styles.bottomFiltersContainer}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              {bottomFilters?.map((item) => (
                <MedicineBottomFilters
                  title={item?.title}
                  setBottomCategoryId={setBottomCategoryId}
                  bottomCategoryId={bottomCategoryId}
                  categoryId={item?.category_id}
                  navigationCategoryId={navigation.getParam('category_id') || ''}
                  onBottomCategoryChange={onBottomCategoryChange}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </>
    );
  };
  return (
    <SafeAreaView style={container}>
      {renderHeader()}
      <View style={styles.fill}>
        <Animated.ScrollView
          style={{ ...styles.fill }}
          scrollEventThrottle={1}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scroll } } }], {
            useNativeDriver: true,
          })}
          contentInset={{
            top: HEADER_MAX_HEIGHT,
          }}
          contentOffset={{
            y: -HEADER_MAX_HEIGHT,
          }}
        >
          <View style={styles2.animatedView}>
            {renderSections()}
            {renderProducts()}
          </View>
        </Animated.ScrollView>
        {renderLoadingMore()}
        {renderSortByOverlay()}
        {renderFilterByOverlay()}
        {showAddedToCart && renderAddedToCart()}
        {renderFilterButtons()}
        <Animated.View
          pointerEvents="none"
          style={[styles.header, { transform: [{ translateY: headerTranslate }] }]}
        >
          {isLoading ? (
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              shimmerStyle={styles2.shimmer}
            ></ShimmerPlaceholder>
          ) : (
            <Animated.Image
              style={[
                styles.backgroundImage,
                {
                  opacity: imageOpacity,
                  transform: [{ translateY: imageTranslate }],
                  objectFit: 'cover',
                },
              ]}
              source={{
                uri: productsThumbnailUrl(bannerImage),
              }}
              resizeMode={'cover'}
            />
          )}
        </Animated.View>
      </View>
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
  btnStyle: {
    alignSelf: 'center',
    borderColor: '#fc9916',
    borderWidth: 0.5,
    borderRadius: 1,
    paddingHorizontal: 8,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    backgroundColor: '#fff',
    elevation: 5,
  },
  fill: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    height: 140,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: null,
    height: 140,
    resizeMode: 'cover',
  },
  bar: {
    backgroundColor: 'transparent',
    marginTop: Platform.OS === 'ios' ? 28 : 38,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  title: {
    color: 'white',
    fontSize: 18,
  },
  scrollViewContent: {
    // iOS uses content inset, which acts like padding.
    paddingTop: Platform.OS !== 'ios' ? 140 : 0,
  },
  row: {
    height: 40,
    margin: 16,
    backgroundColor: '#D3D3D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomFiltersContainer: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 15,
    paddingBottom: 9,
    backgroundColor: '#fff',
    paddingHorizontal: 3,
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
