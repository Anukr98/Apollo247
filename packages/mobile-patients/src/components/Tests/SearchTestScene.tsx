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
import {
  GET_PATIENT_PAST_MEDICINE_SEARCHES,
  SAVE_SEARCH,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getPatientPastMedicineSearches,
  getPatientPastMedicineSearchesVariables,
  getPatientPastMedicineSearches_getPatientPastMedicineSearches,
} from '@aph/mobile-patients/src/graphql/types/getPatientPastMedicineSearches';
import {
  SEARCH_TYPE,
  TEST_COLLECTION_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
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
  Platform,
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
import { TestPackageForDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  DIAGNOSTIC_GROUP_PLAN,
  getDiagnosticsPopularResults,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import string from '@aph/mobile-patients/src/strings/strings.json';
import _ from 'lodash';
import {
  diagnosticsDisplayPrice,
  DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
  getPricesForItem,
  sourceHeaders,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { DiagnosticsNewSearch } from '@aph/mobile-patients/src/components/Tests/components/DiagnosticsNewSearch';
import {
  DiagnosticAddToCartEvent,
  DiagnosticItemSearched,
} from '@aph/mobile-patients/src/components/Tests/Events';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import DeviceInfo from 'react-native-device-info';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { getDiagnosticSearchResults } from '@aph/mobile-patients/src/helpers/clientCalls';
import { searchDiagnosticItem_searchDiagnosticItem_data } from '@aph/mobile-patients/src/graphql/types/searchDiagnosticItem';
import { DiagnosticsSearchResultItem } from '@aph/mobile-patients/src/components/Tests/components/DiagnosticSearchResultItem';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DIAGNOSTICS_ITEM_TYPE } from '../../helpers/CleverTapEvents';

type searchResults = searchDiagnosticItem_searchDiagnosticItem_data;

const GO_TO_CART_HEIGHT = 50;
const isIphoneX = DeviceInfo.hasNotch();
export interface SearchTestSceneProps
  extends NavigationScreenProps<{
    searchText: string;
    duplicateOrderId?: any;
  }> {}

export const SearchTestScene: React.FC<SearchTestSceneProps> = (props) => {
  const searchTextFromProp = props.navigation.getParam('searchText');
  const [showMatchingMedicines, setShowMatchingMedicines] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>(searchTextFromProp);
  const [diagnosticResults, setDiagnosticResults] = useState<
    searchDiagnosticItem_searchDiagnosticItem_data[]
  >([]);
  const [searchResult, setSearchResult] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pastSearches, setPastSearches] = useState<
    (getPatientPastMedicineSearches_getPatientPastMedicineSearches | null)[]
  >([]);
  const [popularArray, setPopularArray] = useState([]);
  const [searchQuery, setSearchQuery] = useState({});
  const [isFocus, setIsFocus] = useState<boolean>(false);

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
  const { serverCartItems: shopCartItems } = useShoppingCart();
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
    setWebEngageEventOnSearchItem('', []);
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

  useEffect(() => {
    client
      .query<getPatientPastMedicineSearches, getPatientPastMedicineSearchesVariables>({
        query: GET_PATIENT_PAST_MEDICINE_SEARCHES,
        context: {
          sourceHeaders,
        },
        variables: {
          patientId: currentPatient?.id,
          type: SEARCH_TYPE.TEST,
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data: { getPatientPastMedicineSearches } }) => {
        setPastSearches(getPatientPastMedicineSearches || []);
      })
      .catch((error) => {
        CommonBugFender('SearchTestScene_GET_PATIENT_PAST_MEDICINE_SEARCHES', error);
        aphConsole.log('Error occured', { error });
      });
  }, [currentPatient]);

  //for past item search
  const fetchPackageDetails = async (name: string, func: (product: any) => void) => {
    try {
      const res: any = await getDiagnosticSearchResults(client, name, Number(cityId), 50);
      if (!!res?.data?.searchDiagnosticItem && res?.data?.searchDiagnosticItem?.data?.length > 0) {
        const product = res?.data?.searchDiagnosticItem?.data || [];
        func && func(product);
      }
      setIsLoading?.(false);
      setGlobalLoading?.(false);
    } catch (error) {
      CommonBugFender('SearchTestScene_fetchPackageDetails', error);
      aphConsole.log({ error });
      setIsLoading?.(false);
      setGlobalLoading!(false);
    }
  };

  const fetchPopularDetails = async () => {
    try {
      const res: any = await getDiagnosticsPopularResults('diagnostic', Number(cityId));
      if (res?.data?.success) {
        const product = res?.data?.data || [];
        setPopularArray(product);
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
    setShowMatchingMedicines(true);
    setIsLoading(true);
    try {
      const res: any = await getDiagnosticSearchResults(client, _searchText, Number(cityId), 50);
      if (!!res?.data?.searchDiagnosticItem && res?.data?.searchDiagnosticItem?.data?.length > 0) {
        const products = res?.data?.searchDiagnosticItem?.data || [];
        setDiagnosticResults(products as searchDiagnosticItem_searchDiagnosticItem_data[]);
        setSearchResult(products?.length == 0);
        setWebEngageEventOnSearchItem(_searchText, products);
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

  const savePastSearch = (sku: string, name: string) =>
    client.mutate({
      mutation: SAVE_SEARCH,
      variables: {
        saveSearchInput: {
          type: SEARCH_TYPE.TEST,
          typeId: sku,
          typeName: name,
          patient: currentPatient?.id || '',
        },
      },
    });

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
    source: DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
    inclusions?: any[],
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
    savePastSearch(`${itemId}`, itemName).catch((e) => {});
    postDiagnosticAddToCartEvent(
      stripHtml(itemName),
      `${itemId}`,
      !!rate ? rate : 0,
      priceToShow,
      source,
      inclusions
    );
    const addedItem = {
      id: `${itemId}`,
      name: stripHtml(itemName),
      price: pricesObject?.rate || 0,
      specialPrice: pricesObject?.specialPrice! || pricesObject?.rate || 0,
      circlePrice: pricesObject?.circlePrice,
      circleSpecialPrice: pricesObject?.circleSpecialPrice,
      discountPrice: pricesObject?.discountPrice,
      discountSpecialPrice: pricesObject?.discountSpecialPrice,
      mou: 1,
      thumbnail: '',
      collectionMethod: collectionType! || TEST_COLLECTION_TYPE?.HC,
      groupPlan: selectedPlan?.groupPlan || DIAGNOSTIC_GROUP_PLAN.ALL,
      packageMrp: pricesObject?.packageMrp || 0,
      inclusions: inclusions == null ? [Number(itemId)] : inclusions,
      isSelected: AppConfig.Configuration.DEFAULT_ITEM_SELECTION_FLAG,
    };
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
      : calculateDiagnosticCartItems(cartItems, patientCartItems);
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
                if (!g(locationForDiagnostics, 'cityId')) {
                  renderLocationNotServingPopup();
                  return;
                }
                setSearchText(value);
                if (!(value && value.length > 2)) {
                  setDiagnosticResults([]);
                  return;
                }
                const search = _.debounce(onSearchTest, 300);
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
          fetchPackageDetails(pastSeacrh.name!, (product) => {
            const packageMrp = product?.packageCalculatedMrp;
            const pricesForItem = getPricesForItem(product?.diagnosticPricing, packageMrp!);
            if (!pricesForItem?.itemActive) {
              return null;
            }
            const specialPrice = pricesForItem?.specialPrice!;
            const price = pricesForItem?.price!;
            const circlePrice = pricesForItem?.circlePrice!;
            const circleSpecialPrice = pricesForItem?.circleSpecialPrice!;
            const discountPrice = pricesForItem?.discountPrice!;
            const discountSpecialPrice = pricesForItem?.discountSpecialPrice!;
            const mrpToDisplay = pricesForItem?.mrpToDisplay!;

            props.navigation.navigate(AppRoutes.TestDetails, {
              itemId: `${product?.itemId}`,
              comingFrom: AppRoutes.SearchTestScene,
              testDetails: {
                Rate: price,
                specialPrice: specialPrice! || price,
                circleRate: circlePrice,
                circleSpecialPrice: circleSpecialPrice,
                discountPrice: discountPrice,
                discountSpecialPrice: discountSpecialPrice,
                Gender: product?.gender,
                ItemID: `${product?.itemId}`,
                ItemName: product?.itemName,
                FromAgeInDays: product?.fromAgeInDays,
                ToAgeInDays: product?.toAgeInDays,
                collectionType: product?.collectionType,
                preparation: product?.testPreparationData,
                testDescription: product?.testPreparationData,
                source: DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.FULL_SEARCH,
                type: product?.itemType,
                packageMrp: product?.packageCalculatedMrp!,
                mrpToDisplay: mrpToDisplay,
                inclusions:
                  product?.inclusions == null ? [Number(product?.inclusions)] : product?.inclusions,
              } as TestPackageForDetails,
            });
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
        {pastSearches?.length > 0 && (
          <SectionHeaderComponent sectionTitle={'Past Searches'} style={{ marginBottom: 0 }} />
        )}
        <View style={styles.pastSearchContainerStyle}>
          {pastSearches
            .slice(0, 5)
            .map((pastSearch, i, array) =>
              renderPastSearchItem(pastSearch!, i == array?.length - 1 ? { marginRight: 0 } : {})
            )}
        </View>
      </ScrollView>
    );
  };

  function fetchPrices(data: any) {
    const pricesForItem = getPricesForItem(
      data?.diagnostic_item_price,
      data?.packageCalculatedMrp!
    );
    const obj = {
      id: data?.diagnostic_item_id,
      name: data?.diagnostic_item_name,
      mou: 1,
      price: pricesForItem?.price!,
      thumbnail: null,
      specialPrice: pricesForItem?.specialPrice!,
      circlePrice: pricesForItem?.circlePrice,
      circleSpecialPrice: pricesForItem?.circleSpecialPrice!,
      discountPrice: pricesForItem?.discountPrice!,
      discountSpecialPrice: pricesForItem?.discountSpecialPrice!,
      collectionMethod: TEST_COLLECTION_TYPE.HC,
      groupPlan: pricesForItem?.planToConsider?.groupPlan,
      packageMrp: data?.packageCalculatedMrp!,
      inclusions: data?.diagnostic_inclusions,
    };
    onAddCartItem(
      data?.diagnostic_item_id,
      data?.diagnostic_item_name,
      DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.PARTIAL_SEARCH,
      data?.diagnostic_inclusions,
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
        onPressAddToCart={() => {
          fetchPrices(product);
        }}
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
              <View>
                <Text style={styles.headingSections}>POPULAR PACKAGES</Text>
                <View style={styles.defaultContainer}>
                  <FlatList
                    keyExtractor={(_, index) => `${index}`}
                    scrollEnabled={false}
                    data={popularPackages}
                    bounces={false}
                    renderItem={renderPopularDiagnostic}
                  />
                </View>
              </View>
            ) : null}
            {popularTests?.length > 0 ? (
              <View>
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
              </View>
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
        onPressAddToCart={() => {
          onAddCartItem(
            item?.diagnostic_item_id,
            item?.diagnostic_item_name,
            DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.POPULAR_SEARCH,
            item?.diagnostic_inclusions
          );
        }}
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
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#890000',
    paddingVertical: 8,
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
  cartDetailView: {
    position: 'absolute',
    backgroundColor: theme.colors.APP_YELLOW_COLOR,
    bottom: isIphoneX ? 10 : 0,
    height: GO_TO_CART_HEIGHT,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemAddedText: {
    marginLeft: 20,
    ...theme.viewStyles.text('SB', isSmallDevice ? 13 : 14, theme.colors.WHITE),
    lineHeight: 16,
    textAlign: 'left',
    alignSelf: 'center',
  },
  goToCartText: {
    marginRight: 20,
    ...theme.viewStyles.text('SB', isSmallDevice ? 15 : 16, theme.colors.WHITE),
    lineHeight: 20,
    textAlign: 'right',
    alignSelf: 'center',
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
