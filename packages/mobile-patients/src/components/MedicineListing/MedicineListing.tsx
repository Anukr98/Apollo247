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
import React, { EventHandler, useEffect, useState, useRef } from 'react';
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
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AddedToCartToast } from '@aph/mobile-patients/src/components/ui/AddedToCartToast';
import { navigateToScreenWithEmptyStack } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import MedicineBottomFilters from './MedicineBottomFilters';
import { productsThumbnailUrl } from '@aph/mobile-patients/src/helpers/helperFunctions';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

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
    movedFrom?: 'registration' | 'deeplink' | 'home' | 'brandPages';
    breadCrumb?: Pick<Category, 'title' | 'category_id'>[];
    categoryName?: string;
    comingFromSearch?: boolean;
    navSrcForSearchSuccess?: string;
  }> {
  comingFromBrandPage?: boolean | undefined;
  currentBrandPageTab?: string;
}

// export const MedicineListing: React.FC<Props> = ({ navigation }) => {
export const MedicineListing: React.FC<Props> = (props) => {
  interface bottomFilter {
    category_id: string;
    url_key: string;
    title: string;
  }
  const navigation = props.navigation;

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
  const comingFromBrandPage = props?.comingFromBrandPage ? props?.comingFromBrandPage : false;
  const currentBrandPageTab = props?.currentBrandPageTab || '';

  const {
    pinCode,
    serverCartLoading,
    serverCartErrorMessage,
    setServerCartErrorMessage,
    locationCode,
    serverCartMessage,
    setServerCartMessage,
  } = useShoppingCart();

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

  const scrollA = useRef(new Animated.Value(0)).current;
  const bannerHeight = 140;

  // styles
  const styles2 = {
    bannerImageStyle: {
      height: bannerImage?.length > 0 ? bannerHeight : 0,
      transform: [
        {
          translateY: scrollA.interpolate({
            inputRange: [-bannerHeight, 0, bannerHeight, bannerHeight + 1],
            outputRange: [-bannerHeight / 2, 0, bannerHeight * 0.75, bannerHeight * 0.75],
          }),
        },
        {
          scale: scrollA.interpolate({
            inputRange: [-bannerHeight, 0, bannerHeight, bannerHeight + 1],
            outputRange: [2, 1, 0.5, 0.5],
          }),
        },
      ],
    },
  };

  // global contexts
  const { currentPatient } = useAllCurrentPatients();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { axdcCode } = useAppCommonData();

  useEffect(() => {
    if (currentBrandPageTab) {
      setCategoryId(navigation.getParam('category_id') || '');
      setSortBy(null);
      setFilterBy({});
    }
  }, [currentBrandPageTab]);

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
  }, [sortBy, filterBy, categoryId, searchText, currentBrandPageTab]);

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

  useEffect(() => {
    if (serverCartErrorMessage || serverCartMessage) {
      hideAphAlert?.();
      showAphAlert!({
        unDismissable: true,
        title: 'Hey',
        description: serverCartErrorMessage || serverCartMessage,
        titleStyle: theme.viewStyles.text('SB', 18, '#890000'),
        ctaContainerStyle: { justifyContent: 'flex-end' },
        CTAs: [
          {
            text: 'OKAY',
            type: 'orange-link',
            onPress: () => {
              setServerCartErrorMessage?.('');
              setServerCartMessage?.('');
              hideAphAlert?.();
            },
          },
        ],
      });
    }
  }, [serverCartErrorMessage, serverCartMessage]);

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
          if (key === 'price' || key === 'discount_percentage') {
            selectedFilter[key] = { min: selectedFilters[key][0], max: selectedFilters[key][1] };
          } else {
            selectedFilter[key] = selectedFilters[key];
          }
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
        pinCode,
        locationCode
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
      if (_selectedFilters.category != categoryId) setBottomCategoryId(_selectedFilters?.category);
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
        comingFromBrandPage
          ? setBannerImage('')
          : setBannerImage(data?.design[0]?.mobile_banner_image);
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
    let navSrcParamForSearchSuccess = '';
    if ((categoryId || categoryName) && !searchText) {
      navSrcParamForSearchSuccess = 'Category Listing';
    } else if (searchText) {
      navSrcParamForSearchSuccess = 'Search List';
    }
    return (
      <MedicineListingHeader
        navigation={navigation}
        movedFrom={movedFrom}
        navSrcForSearchSuccess={navSrcParamForSearchSuccess}
      />
    );
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
      comingFromBrandPage,
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
              totalProducts={productsTotal}
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
    const valuesToBeRemoved = [
      'PHARMA',
      'Non Dpco',
      'PL',
      'FMCG',
      'SHOP BY BRAND',
      'Banners',
      'Apollo247',
      'Apollo247v1',
      'Special Offers',
      'Banner 1',
      'Banner 2',
      'Banner 3',
      'MOST VIEWED',
    ];
    const filters = filterOptions.filter(
      ({ attribute }) => attribute !== 'color' && attribute !== '__categories'
    );
    const categoryFilter = filterOptions.filter(
      ({ attribute, values }) =>
        attribute === '__categories' &&
        values?.length &&
        values.map((ele) => valuesToBeRemoved.indexOf(ele.name) === -1)
    );
    let newFilters = [];
    if (categoryFilter?.length) {
      const categoryValues =
        categoryFilter?.[0]?.values?.length &&
        categoryFilter?.[0]?.values.filter(({ name }) => valuesToBeRemoved.indexOf(name) === -1);

      const categoryObject = {
        attribute: categoryFilter?.[0]?.attribute,
        name: categoryFilter?.[0]?.name,
        select_type: categoryFilter?.[0]?.select_type,
        values: categoryValues,
      };
      newFilters = [...filters, categoryObject];
    } else {
      newFilters = [...filters];
    }

    return (
      filterVisible && (
        <MedicineListingFilter
          isVisible={true}
          filters={newFilters}
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
          activeOpacity={0.5}
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
      {comingFromBrandPage == false && renderHeader()}
      <View style={styles.fill}>
        <Animated.ScrollView
          style={{ ...styles.fill }}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scroll } } }], {
            useNativeDriver: true,
          })}
        >
          <View>
            <Animated.Image
              style={styles2.bannerImageStyle}
              source={{
                uri: productsThumbnailUrl(bannerImage),
              }}
              resizeMode={'cover'}
            />
            {renderSections()}
            {renderProducts()}
            {serverCartLoading && <Spinner />}
          </View>
        </Animated.ScrollView>
        {renderLoadingMore()}
        {renderSortByOverlay()}
        {renderFilterByOverlay()}
        {showAddedToCart && renderAddedToCart()}
        {renderFilterButtons()}
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
