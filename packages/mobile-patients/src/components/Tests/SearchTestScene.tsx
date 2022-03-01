import {
  DiagnosticPatientCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon, RemoveIconGrey } from '@aph/mobile-patients/src/components/ui/Icons';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { TEST_COLLECTION_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  aphConsole,
  calculateDiagnosticCartItems,
  g,
  isEmptyObject,
  isSmallDevice,
  isValidSearch,
  nameFormater,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  ActivityIndicator,
  Keyboard,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  ListRenderItemInfo,
  BackHandler,
} from 'react-native';
import { FlatList, NavigationScreenProps, ScrollView } from 'react-navigation';
import stripHtml from 'string-strip-html';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  DIAGNOSTIC_GROUP_PLAN,
  getDiagnosticsPopularResults,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import string from '@aph/mobile-patients/src/strings/strings.json';
import _ from 'lodash';
import {
  checkSku,
  createDiagnosticAddToCartObject,
  DiagnosticPopularSearchGenderMapping,
  diagnosticsDisplayPrice,
  DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
  getPricesForItem,
} from '@aph/mobile-patients/src/components/Tests/utils/helpers';
import { DiagnosticsNewSearch } from '@aph/mobile-patients/src/components/Tests/components/DiagnosticsNewSearch';
import {
  DiagnosticAddToCartEvent,
  DiagnosticItemSearched,
} from '@aph/mobile-patients/src/components/Tests/utils/Events';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import {
  getDiagnosticSearchResults,
  getDiagnosticWidgetPricing,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { searchDiagnosticItem_searchDiagnosticItem_data } from '@aph/mobile-patients/src/graphql/types/searchDiagnosticItem';
import { DiagnosticsSearchResultItem } from '@aph/mobile-patients/src/components/Tests/components/DiagnosticSearchResultItem';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DIAGNOSTICS_ITEM_TYPE } from '@aph/mobile-patients/src/helpers/CleverTapEvents';

type searchResults = searchDiagnosticItem_searchDiagnosticItem_data;

const GO_TO_CART_HEIGHT = 50;
export interface SearchTestSceneProps
  extends NavigationScreenProps<{
    searchText: string;
    duplicateOrderId?: any;
  }> {}

export const SearchTestScene: React.FC<SearchTestSceneProps> = (props) => {
  const searchTextFromProp = props.navigation.getParam('searchText');
  const [searchText, setSearchText] = useState<string>(searchTextFromProp);
  const [diagnosticResults, setDiagnosticResults] = useState<
    searchDiagnosticItem_searchDiagnosticItem_data[]
  >([]);
  const [searchResult, setSearchResult] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [popularArray, setPopularArray] = useState([]);
  const [searchQuery, setSearchQuery] = useState({});
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [showToolTip, setShowToolTip] = useState<boolean>(false);

  const { locationForDiagnostics, diagnosticServiceabilityData } = useAppCommonData();

  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const {
    addCartItem,
    removePatientCartItem,
    removeCartItem,
    cartItems,
    setModifyHcCharges,
    setModifiedOrderItemIds,
    setHcCharges,
    asyncDiagnosticPincode,
    setModifiedOrder,
    modifiedOrder,
    patientCartItems,
    setPatientCartItems,
    setModifiedPatientCart,
    setDistanceCharges,
    setDeliveryAddressId,
    setCartItems,
  } = useDiagnosticsCart();
  const { showAphAlert, setLoading: setGlobalLoading, hideAphAlert } = useUIElements();
  const { getPatientApiCall } = useAuth();
  const { isDiagnosticCircleSubscription } = useDiagnosticsCart();
  const isModify = !!modifiedOrder && !isEmptyObject(modifiedOrder);
  const duplicateOrderId = props.navigation.getParam('duplicateOrderId');
  const showGoToCart = !!cartItems && cartItems?.length > 0;

  //add the cityId in case of modifyFlow
  const cityId = isModify
    ? modifiedOrder?.cityId
    : locationForDiagnostics?.cityId != ''
    ? locationForDiagnostics?.cityId
    : !!diagnosticServiceabilityData && diagnosticServiceabilityData?.city != ''
    ? diagnosticServiceabilityData?.cityId
    : AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID;

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    if (isModify) {
      if (duplicateOrderId?.length > 0) {
        const filteredArray = cartItems?.filter(
          (cItem) => !duplicateOrderId?.includes(Number(cItem?.id))
        );
        setCartItems?.(filteredArray);
      }
      const unSelectRemainingPatients = patientCartItems?.filter(
        (item) => item?.patientId !== modifiedOrder?.patientId
      );
      if (
        patientCartItems?.length > 0 &&
        !!unSelectRemainingPatients &&
        unSelectRemainingPatients?.length > 0
      ) {
        const obj = {
          patientId: modifiedOrder?.patientId,
          cartItems: cartItems,
        } as DiagnosticPatientCartItem;
        setPatientCartItems?.([obj]);
      }
      setModifiedPatientCart?.([
        {
          patientId: modifiedOrder?.patientId,
          cartItems: cartItems,
        },
      ]);
    }
    searchTextFromProp && onSearchTest(searchTextFromProp);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    if (!popularArray?.length) {
      fetchPopularDetails();
    }
    //for time being removing Diagnostic search clicked ct event from here required for ticket https://apollogarage.atlassian.net/browse/APP-18205
  }, []);

  useEffect(() => {
    const _didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    });
    const _willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });
    return () => {
      _didFocusSubscription && _didFocusSubscription.remove();
      _willBlurSubscription && _willBlurSubscription.remove();
    };
  }, []);

  function checkGenderSku(product: any) {
    const patientGender = modifiedOrder?.patientObj?.gender;
    if (product?.length > 0) {
      const filteredResult = product?.filter((sku: any) =>
        checkSku(
          patientGender,
          DiagnosticPopularSearchGenderMapping(sku?.diagnostic_item_gender),
          true
        )
      );
      setPopularArray(filteredResult);
    } else {
      setPopularArray([]);
    }
  }

  const fetchPopularDetails = async () => {
    try {
      const res: any = await getDiagnosticsPopularResults('diagnostic', Number(cityId));
      if (res?.data?.success) {
        const product = res?.data?.data || [];
        isModify ? checkGenderSku(product) : setPopularArray(product);
        setIsLoading(false);
      }
      setIsLoading?.(false);
      setGlobalLoading?.(false);
    } catch (error) {
      CommonBugFender('SearchTestScene_getDiagnosticsPopularResults', error);
      aphConsole.log({ error });
      setGlobalLoading?.(false);
      setIsLoading?.(false);
    }
  };

  const fetchPricesForItems = async (item: any) => {
    const itemId = [Number(item?.diagnostic_item_id)];
    try {
      const res = await getDiagnosticWidgetPricing(client, cityId, itemId);
      if (
        !!res?.data?.findDiagnosticsWidgetsPricing?.diagnostics &&
        res?.data?.findDiagnosticsWidgetsPricing?.diagnostics?.length > 0
      ) {
        const result = res?.data?.findDiagnosticsWidgetsPricing?.diagnostics?.[0];
        fetchPrices(item, 'popular', result);
      } else {
        onAddCartItem(
          item?.diagnostic_item_id,
          item?.diagnostic_item_name,
          DiagnosticPopularSearchGenderMapping(item?.diagnostic_item_gender),
          DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.POPULAR_SEARCH,
          item?.diagnostic_inclusions,
          item?.test_parameters_data?.length || item?.diagnostic_inclusions?.length
        );
      }
    } catch (error) {
      onAddCartItem(
        item?.diagnostic_item_id,
        item?.diagnostic_item_name,
        DiagnosticPopularSearchGenderMapping(item?.diagnostic_item_gender),
        DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.POPULAR_SEARCH,
        item?.diagnostic_inclusions,
        item?.test_parameters_data?.length || item?.diagnostic_inclusions?.length
      );
      CommonBugFender('fetchPricesForItems_SearchTestScene', error);
    }
  };

  const showGenericALert = (e: any) => {
    showAphAlert?.({
      title: string.common.uhOh,
      description: `Something went wrong.`,
    });
  };

  const renderLocationNotServingPopup = () => {
    const cityName =
      !!asyncDiagnosticPincode && asyncDiagnosticPincode?.city != ''
        ? asyncDiagnosticPincode?.city
        : 'this area';
    showAphAlert?.({
      title: `Hi ${currentPatient && currentPatient.firstName},`,
      description: string.diagnostics.nonServiceableMsg.replace('{{city_name}}', cityName),
    });
  };

  const onSearchTest = async (_searchText: string) => {
    setIsLoading(true);
    try {
      const res: any = await getDiagnosticSearchResults(client, _searchText, Number(cityId), 50);
      if (!!res?.data?.searchDiagnosticItem && res?.data?.searchDiagnosticItem?.data?.length > 0) {
        const products = res?.data?.searchDiagnosticItem?.data || [];
        setDiagnosticResults(products as searchDiagnosticItem_searchDiagnosticItem_data[]);
        setSearchResult(products?.length == 0);
        if (_searchText?.length > 0) {
          setWebEngageEventOnSearchItem(_searchText, products);
        }
      } else {
        setDiagnosticResults([]);
        setSearchResult(true);
      }
      setIsLoading(false);
    } catch (error) {
      CommonBugFender('SearchTestScene_onSearchTest', error);
      setIsLoading(false);
      showGenericALert(error);
    }
  };

  const postDiagnosticAddToCartEvent = (
    name: string,
    id: string,
    price: number,
    discountedPrice: number,
    source: DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
    inclusions?: any
  ) => {
    const itemType =
      !!inclusions && inclusions?.length > 1
        ? DIAGNOSTICS_ITEM_TYPE.PACKAGE
        : DIAGNOSTICS_ITEM_TYPE.TEST;
    DiagnosticAddToCartEvent(
      name,
      id,
      price, //mrp
      discountedPrice, //actual price
      source,
      itemType,
      undefined,
      currentPatient,
      isDiagnosticCircleSubscription
    );
  };

  const setWebEngageEventOnSearchItem = (keyword: string, results: searchResults[]) => {
    DiagnosticItemSearched(currentPatient, keyword, results, isDiagnosticCircleSubscription);
  };

  const onAddCartItem = (
    itemId: string | number,
    itemName: string,
    itemGender: any,
    source: DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
    inclusions?: any[],
    parameterCount?: number,
    rate?: number,
    collectionType?: TEST_COLLECTION_TYPE,
    pricesObject?: any,
    promoteCircle?: boolean,
    promoteDiscount?: boolean,
    selectedPlan?: any
  ) => {
    const priceToShow = !!pricesObject
      ? diagnosticsDisplayPrice(pricesObject, isDiagnosticCircleSubscription)?.priceToShow
      : 0;
    postDiagnosticAddToCartEvent(
      stripHtml(itemName),
      `${itemId}`,
      !!rate ? rate : 0,
      priceToShow,
      source,
      inclusions
    );
    const normalPrice = !!pricesObject?.rate ? pricesObject?.rate : pricesObject?.price || 0;
    const normalSpecialPrice = !!pricesObject?.specialPrice
      ? pricesObject?.specialPrice!
      : !!pricesObject?.rate
      ? pricesObject?.rate
      : pricesObject?.price || 0;

    const addedItem = createDiagnosticAddToCartObject(
      Number(itemId),
      stripHtml(itemName),
      itemGender,
      normalPrice,
      normalSpecialPrice,
      pricesObject?.circlePrice,
      pricesObject?.circleSpecialPrice,
      pricesObject?.discountPrice,
      pricesObject?.discountSpecialPrice,
      collectionType! || TEST_COLLECTION_TYPE?.HC,
      selectedPlan?.groupPlan || DIAGNOSTIC_GROUP_PLAN.ALL,
      pricesObject?.packageMrp || 0,
      inclusions == null ? [Number(itemId)] : inclusions,
      AppConfig.Configuration.DEFAULT_ITEM_SELECTION_FLAG,
      '',
      !!parameterCount ? parameterCount : !!pricesObject ? pricesObject?.parameterCount : null
    );

    isModify &&
      setModifiedPatientCart?.([
        {
          patientId: modifiedOrder?.patientId,
          cartItems: cartItems?.concat(addedItem),
        },
      ]);
    addCartItem?.(addedItem);
  };

  const onRemoveCartItem = (itemId: string | number) => {
    if (isModify) {
      const newCartItems = cartItems?.filter((item) => Number(item?.id) !== Number(itemId));
      setModifiedPatientCart?.([
        {
          patientId: modifiedOrder?.patientId,
          cartItems: newCartItems,
        },
      ]);
    }
    patientCartItems?.map((pItem) => removePatientCartItem?.(pItem?.patientId, `${itemId}`));
    removeCartItem?.(`${itemId}`);
  };

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const renderHeader = () => {
    const cartItemsCount = isModify
      ? cartItems?.length
      : calculateDiagnosticCartItems(cartItems, patientCartItems)?.length;
    return (
      <Header
        container={{ borderBottomWidth: 1 }}
        leftIcon={'backArrow'}
        title={isModify ? string.diagnostics.modifyHeader : 'SEARCH TESTS'}
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                CommonLogEvent(AppRoutes.SearchTestScene, 'Navigate to your cart');
                isModify
                  ? props.navigation.navigate(AppRoutes.CartPage, {
                      orderDetails: modifiedOrder,
                    })
                  : props.navigation.navigate(AppRoutes.MedAndTestCart);
              }}
            >
              <CartIcon />
              {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
            </TouchableOpacity>
          </View>
        }
        onPressLeftIcon={() => handleBack()}
      />
    );
  };

  function handleBack() {
    if (isModify) {
      showAphAlert?.({
        title: string.common.hiWithSmiley,
        description: string.diagnostics.modifyDiscardText,
        unDismissable: true,
        CTAs: [
          {
            text: 'DISCARD',
            onPress: () => {
              hideAphAlert?.();
              clearModifyDetails();
            },
            type: 'orange-button',
          },
          {
            text: 'CANCEL',
            onPress: () => {
              hideAphAlert?.();
            },
            type: 'orange-button',
          },
        ],
      });
    } else {
      props.navigation.goBack();
    }
    return true;
  }

  function clearModifyDetails() {
    setModifiedOrder?.(null);
    setModifyHcCharges?.(0);
    setModifiedOrderItemIds?.([]);
    setHcCharges?.(0);
    setDistanceCharges?.(0);
    setModifiedPatientCart?.([]);
    setDeliveryAddressId?.('');
    //go back to homepage
    props.navigation.navigate('TESTS', { focusSearch: true });
  }

  const isNoTestsFound = !isLoading && searchText?.length > 2 && searchResult;

  const renderSorryMessage = isNoTestsFound ? (
    <Text style={styles.sorryTextStyle}>Sorry, we couldn’t find what you are looking for :(</Text>
  ) : (
    <View style={{ paddingBottom: 19 }} />
  );

  const renderSearchInput = () => {
    return (
      <View style={styles.inputStyle}>
        <View style={{ flexDirection: 'row' }}>
          <TextInputComponent
            conatinerstyles={{ paddingBottom: 0 }}
            inputStyle={[
              styles.searchValueStyle,
              isNoTestsFound ? { borderColor: '#e50000' } : {},
              isFocus
                ? { borderColor: isNoTestsFound ? '#e50000' : colors.APP_GREEN, borderWidth: 2 }
                : {},
            ]}
            textInputprops={{
              ...(isNoTestsFound ? { selectionColor: '#e50000' } : {}),
              autoFocus: true,
            }}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            value={searchText}
            placeholder="Search tests &amp; packages"
            underlineColorAndroid="transparent"
            onChangeText={(value) => {
              if (isValidSearch(value)) {
                if (!isModify && !g(locationForDiagnostics, 'cityId')) {
                  renderLocationNotServingPopup();
                  return;
                }
                setSearchText(value);
                if (!(value && value.length > 2)) {
                  setDiagnosticResults([]);
                  return;
                }
                const search = _.debounce(onSearchTest, 500);
                setSearchQuery((prevSearch: any) => {
                  if (prevSearch?.cancel) {
                    prevSearch?.cancel();
                  }
                  return search;
                });
                search(value);
              }
            }}
          />
          {!!searchText && searchText?.length > 0 && (
            <TouchableOpacity
              activeOpacity={1}
              style={styles.crossIconTouch}
              onPress={() => {
                setSearchText('');
                setDiagnosticResults([]);
              }}
            >
              <RemoveIconGrey style={styles.crossIconStyle} />
            </TouchableOpacity>
          )}
        </View>
        {renderSorryMessage}
      </View>
    );
  };

  function fetchPrices(data: any, source: string, apiResult?: any) {
    const pricesForItem = getPricesForItem(
      source == 'popular' && !!apiResult
        ? apiResult?.diagnosticPricing
        : data?.diagnostic_item_price,
      data?.packageCalculatedMrp!
    );

    const obj = createDiagnosticAddToCartObject(
      data?.diagnostic_item_id,
      data?.diagnostic_item_name,
      source == 'popular' ? apiResult?.gender : data?.diagnostic_item_gender,
      pricesForItem?.price!,
      pricesForItem?.specialPrice!,
      pricesForItem?.circlePrice,
      pricesForItem?.circleSpecialPrice!,
      pricesForItem?.discountPrice!,
      pricesForItem?.discountSpecialPrice!,
      TEST_COLLECTION_TYPE.HC,
      pricesForItem?.planToConsider?.groupPlan,
      data?.packageCalculatedMrp!,
      data?.diagnostic_inclusions,
      AppConfig.Configuration.DEFAULT_ITEM_SELECTION_FLAG,
      '',
      source == 'search'
        ? data?.diagnostic_inclusions_test_parameter_data?.length ||
            data?.diagnostic_inclusions?.length
        : data?.test_parameters_data?.length || data?.diagnostic_inclusions?.length
    );
    onAddCartItem(
      data?.diagnostic_item_id,
      data?.diagnostic_item_name,
      source == 'popular'
        ? DiagnosticPopularSearchGenderMapping(apiResult?.gender)
        : data?.diagnostic_item_gender,
      source == 'search'
        ? DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.PARTIAL_SEARCH
        : DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.POPULAR_SEARCH,
      data?.diagnostic_inclusions,
      source == 'search'
        ? data?.diagnostic_inclusions_test_parameter_data?.length ||
            data?.diagnostic_inclusions?.length
        : data?.test_parameters_data?.length || data?.diagnostic_inclusions?.length,
      obj?.price,
      TEST_COLLECTION_TYPE.HC,
      obj
    );
  }

  const renderTestCard = (product: any, index: number, array: searchResults[]) => {
    return (
      <DiagnosticsSearchResultItem
        onPress={() => {
          CommonLogEvent(AppRoutes.SearchTestScene, 'Search suggestion Item');
          props.navigation.navigate(AppRoutes.TestDetails, {
            itemId: product?.diagnostic_item_id,
            source: DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.PARTIAL_SEARCH,
            comingFrom: AppRoutes.SearchTestScene,
          });
        }}
        onPressAddToCart={() => fetchPrices(product, 'search')}
        data={product}
        loading={true}
        showSeparator={index !== diagnosticResults?.length - 1}
        style={{
          marginHorizontal: 20,
          paddingBottom: index == diagnosticResults?.length - 1 ? 20 : 0,
        }}
        onPressRemoveFromCart={() => onRemoveCartItem(product?.diagnostic_item_id)}
        isCircleSubscribed={isDiagnosticCircleSubscription}
        searchedString={searchText}
      />
    );
  };

  const renderMatchingTests = () => {
    const bottomStyles = { marginBottom: showGoToCart ? 50 : 0 };
    let popularTests: never[] = [];
    let popularPackages: never[] = [];
    if (popularArray?.length) {
      popularPackages = popularArray?.filter(
        (item: any) => item?.diagnostic_inclusions?.length > 1
      );
      popularTests = popularArray?.filter((item: any) => item?.diagnostic_inclusions?.length == 1);
      if (popularTests?.length == 0) {
        popularTests = popularArray;
      }
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
        ) : !!searchText && searchText?.length > 2 ? (
          <FlatList
            onScroll={() => Keyboard.dismiss()}
            data={diagnosticResults}
            renderItem={({ item, index }) => renderTestCard(item, index, diagnosticResults)}
            keyExtractor={(_, index) => `${index}`}
            bounces={false}
            ListHeaderComponent={
              (diagnosticResults?.length > 0 && (
                <SectionHeaderComponent
                  sectionTitle={`Showing search results (${diagnosticResults?.length})`}
                  style={styles.sectionHeaderView}
                  titleStyle={styles.sectionHeaderText}
                />
              )) ||
              null
            }
            style={bottomStyles}
          />
        ) : !!searchText && searchText?.length > 2 ? (
          <FlatList
            onScroll={() => Keyboard.dismiss()}
            data={diagnosticResults}
            renderItem={({ item, index }) => renderTestCard(item, index, diagnosticResults)}
            keyExtractor={(_, index) => `${index}`}
            bounces={false}
            ListHeaderComponent={
              (diagnosticResults?.length > 0 && (
                <SectionHeaderComponent
                  sectionTitle={`Showing search results (${diagnosticResults?.length})`}
                  style={styles.sectionHeaderView}
                  titleStyle={styles.sectionHeaderText}
                />
              )) ||
              null
            }
            style={bottomStyles}
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={[styles.viewDefaultContainer, bottomStyles]}
          >
            {popularPackages?.length > 0 ? (
              <>
                <Text style={styles.headingSections}>POPULAR PACKAGES</Text>
                <View style={[styles.defaultContainer, { marginBottom: 20 }]}>
                  <FlatList
                    keyExtractor={(_, index) => `${index}`}
                    scrollEnabled={false}
                    data={popularPackages}
                    bounces={false}
                    renderItem={renderPopularDiagnostic}
                  />
                </View>
              </>
            ) : null}
            {popularTests?.length > 0 ? (
              <>
                <Text style={styles.headingSections}>POPULAR TESTS</Text>
                <View style={styles.defaultContainer}>
                  <FlatList
                    keyExtractor={(_, index) => `${index}`}
                    scrollEnabled={false}
                    data={popularTests}
                    bounces={false}
                    renderItem={renderPopularDiagnostic}
                  />
                </View>
              </>
            ) : null}
          </ScrollView>
        )}
      </>
    );
  };

  const renderPopularDiagnostic = (data: ListRenderItemInfo<any>) => {
    const { index, item } = data;
    return (
      <DiagnosticsNewSearch
        onPress={() => {
          CommonLogEvent(AppRoutes.Tests, 'Search suggestion Item');
          props.navigation.navigate(AppRoutes.TestDetails, {
            itemId: item?.diagnostic_item_id,
            itemName: item?.diagnostic_item_name,
            source: DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.POPULAR_SEARCH,
            comingFrom: AppRoutes.SearchTestScene,
          });
        }}
        onPressAddToCart={() => fetchPricesForItems(item)}
        data={item}
        loading={true}
        showSeparator={index !== diagnosticResults?.length - 1}
        style={{
          paddingBottom: index == diagnosticResults?.length - 1 ? 20 : 0,
        }}
        onPressRemoveFromCart={() => onRemoveCartItem(`${item?.diagnostic_item_id}`)}
      />
    );
  };

  function _navigateToCartPage() {
    if (isModify) {
      props.navigation.navigate(AppRoutes.CartPage, {
        orderDetails: modifiedOrder,
      });
    } else {
      props.navigation.navigate(AppRoutes.AddPatients, {
        orderDetails: modifiedOrder,
      });
    }
  }
  const renderStickyBottom = () => {
    const cartCount = cartItems?.length > 9 ? `${cartItems?.length}` : `0${cartItems?.length}`;
    return (
      <StickyBottomComponent style={styles.stickyBottomStyle}>
        <Text style={styles.itemsAddedText}>
          {cartCount} {cartItems?.length == 1 ? 'item' : 'items'} added
        </Text>
        <Button
          title={nameFormater(string.diagnostics.goToCart, 'upper')}
          onPress={() => _navigateToCartPage()}
          style={{ width: '60%' }}
        />
      </StickyBottomComponent>
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaViewStyle}>
      <View style={styles.headerSearchInputShadow}>
        {renderHeader()}
        {renderSearchInput()}
      </View>
      {renderMatchingTests()}
      {showGoToCart ? renderStickyBottom() : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaViewStyle: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
  },
  headerSearchInputShadow: {
    zIndex: 1,
    backgroundColor: theme.colors.WHITE,
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  labelView: {
    position: 'absolute',
    top: -10,
    right: -8,
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
    backgroundColor: '#F7F8F5',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 5,
    width: '100%',
    height: 50,
    paddingLeft: 10,
  },
  sorryTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#890000',
    paddingVertical: 8,
  },
  headingSections: { ...theme.viewStyles.text('B', isSmallDevice ? 14 : 15, '#01475B', 1, 22) },
  viewDefaultContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f7f8f5',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    flexGrow: 1,
  },
  defaultContainer: {
    width: '100%',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingVertical: 0,
    backgroundColor: 'white',
    marginBottom: GO_TO_CART_HEIGHT,
  },
  crossIconStyle: {
    position: 'absolute',
    right: 10,
    height: 16,
    width: 16,
    alignSelf: 'center',
  },
  crossIconTouch: {
    justifyContent: 'center',
    height: 40,
    width: 40,
    position: 'absolute',
    right: 10,
    alignSelf: 'center',
  },
  sectionHeaderView: { marginBottom: 5, marginTop: 16 },
  sectionHeaderText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansRegular(12),
    opacity: 0.6,
    letterSpacing: 0,
  },
  inputStyle: { paddingHorizontal: 16, backgroundColor: theme.colors.WHITE, marginTop: 16 },
  stickyBottomStyle: {
    shadowColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemsAddedText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 13 : 14, theme.colors.SHERPA_BLUE, 1, 20),
    textAlign: 'center',
    marginTop: 6,
  },
});
