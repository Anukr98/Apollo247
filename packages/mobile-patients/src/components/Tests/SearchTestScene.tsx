import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon, Filter } from '@aph/mobile-patients/src/components/ui/Icons';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
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
  searchDiagnosticsByCityID,
  searchDiagnosticsByCityIDVariables,
  searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics,
} from '@aph/mobile-patients/src/graphql/types/searchDiagnosticsByCityID';
import {
  aphConsole,
  g,
  getDiscountPercentage,
  isValidSearch,
  postWebEngageEvent,
  postWEGNeedHelpEvent,
  postFirebaseEvent,
  postAppsFlyerEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AxiosResponse } from 'axios';
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
  ListRenderItemInfo
} from 'react-native';
import { FlatList, NavigationScreenProps, ScrollView } from 'react-navigation';
import stripHtml from 'string-strip-html';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { TestPackageForDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  DIAGNOSTIC_GROUP_PLAN,
  getDiagnosticsSearchResults,
  PackageInclusion,
  getDiagnosticsPopularResults,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { WebEngageEvents, WebEngageEventName } from '../../helpers/webEngageEvents';
import string from '@aph/mobile-patients/src/strings/strings.json';
import _ from 'lodash';
import moment from 'moment';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { getPricesForItem, sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import { getPackageInclusions } from '@aph/mobile-patients/src/helpers/clientCalls';
import { DiagnosticsSearchSuggestionItem } from '@aph/mobile-patients/src/components/Tests/components/DiagnosticsSearchSuggestionItem';
import { DiagnosticsNewSearch } from '@aph/mobile-patients/src/components/Tests/components/DiagnosticsNewSearch';
const styles = StyleSheet.create({
  safeAreaViewStyle: {
    flex: 1,
    backgroundColor: 'white' //theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  headerStyle: {},
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
    width:'100%',
    height: 48,
    paddingHorizontal: 10,
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
  headingSections: { ...theme.viewStyles.text('B', 14, '#01475B', 1, 22)},
  viewDefaultContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f7f8f5',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  defaultContainer: {
    width: '100%',
    justifyContent:'space-between',
    marginVertical: 10,
    paddingVertical: 0,
    backgroundColor: 'white'
  },
});

export interface SearchTestSceneProps
  extends NavigationScreenProps<{
    searchText: string;
  }> {}

export const SearchTestScene: React.FC<SearchTestSceneProps> = (props) => {
  const searchTextFromProp = props.navigation.getParam('searchText');
  const [showMatchingMedicines, setShowMatchingMedicines] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>(searchTextFromProp);
  const [diagnosticResults, setDiagnosticResults] = useState<
    searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics[]
  >([]);
  const [searchResult, setSearchResult] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pastSearches, setPastSearches] = useState<
    (getPatientPastMedicineSearches_getPatientPastMedicineSearches | null)[]
  >([]);
  const [popularArray, setPopularArray] = useState([]);
  const [searchQuery, setSearchQuery] = useState({});

  const { locationForDiagnostics, locationDetails } = useAppCommonData();

  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { addCartItem, removeCartItem, cartItems } = useDiagnosticsCart();
  const { cartItems: shopCartItems } = useShoppingCart();
  const { showAphAlert, setLoading: setGlobalLoading } = useUIElements();
  const { getPatientApiCall } = useAuth();

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    searchTextFromProp && onSearchTest(searchTextFromProp);
  }, []);
  useEffect(() => {
    setIsLoading(true)
    if (!popularArray?.length) {
      fetchPopularDetails()
    }
  }, []);

  useEffect(() => {
    client
      .query<getPatientPastMedicineSearches, getPatientPastMedicineSearchesVariables>({
        query: GET_PATIENT_PAST_MEDICINE_SEARCHES,
        context: {
          sourceHeaders,
        },
        variables: {
          patientId: g(currentPatient, 'id') || '',
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

  const errorAlert = () => {
    showAphAlert!({
      title: string.common.uhOh,
      description: 'Unable to fetch pakage details.',
    });
  };

  const fetchPackageDetails = async (name: string, func: (product: any) => void) => {
    try {
      const res: any = await getDiagnosticsSearchResults(
        'diagnostic',
        name,
        parseInt(locationForDiagnostics?.cityId!, 10)
      );
      if (res?.data?.success) {
        const product = g(res, 'data', 'data') || [];
        func && func(product);
      } else {
        errorAlert();
      }
      setGlobalLoading!(false);
    } catch (error) {
      CommonBugFender('SearchTestScene_fetchPackageDetails', error);
      aphConsole.log({ error });
      errorAlert();
      setGlobalLoading!(false);
    }
  };
  const fetchPopularDetails = async () => {
    try {
      const res: any = await getDiagnosticsPopularResults('diagnostic');
      if (res?.data?.success) {
        const product = g(res, 'data', 'data') || [];
        setPopularArray(product)
        setIsLoading(false)
      } else {
        errorAlert();
      }
      setGlobalLoading!(false);
    } catch (error) {
      CommonBugFender('SearchTestScene_getDiagnosticsPopularResults', error);
      aphConsole.log({ error });
      errorAlert();
      setGlobalLoading!(false);
    }
  };
  const fetchPackageInclusion = async (id: string, func: (tests: PackageInclusion[]) => void) => {
    try {
      const arrayOfId = [Number(id)];
      setGlobalLoading!(true);
      const res: any = await getPackageInclusions(client, arrayOfId);
      if (res) {
        const data = g(res, 'data', 'getInclusionsOfMultipleItems', 'inclusions');
        setGlobalLoading!(false);
        const product = data;
        if (product && product.length) {
          func && func(product);
        } else {
          errorAlert();
        }
      }
    } catch (e) {
      CommonBugFender('Tests_fetchPackageInclusion', e);
      setGlobalLoading!(false);
      console.log('getPackageData Error\n', { e });
      errorAlert();
    }
  };

  const showGenericALert = (e: { response: AxiosResponse }) => {
    const error = e && e.response && e.response.data.message;
    aphConsole.log({ errorResponse: e.response, error }); //remove this line later
    showAphAlert!({
      title: string.common.uhOh,
      description: `Something went wrong.`,
    });
  };

  const renderLocationNotServingPopup = () => {
    showAphAlert!({
      title: `Hi ${currentPatient && currentPatient.firstName},`,
      description: string.diagnostics.nonServiceableMsg.replace(
        '{{city_name}}',
        g(locationDetails, 'displayName')!
      ),
    });
  };

  const onSearchTest = async (_searchText: string) => {
    setShowMatchingMedicines(true);
    setIsLoading(true);
    try {
      const res: any = await getDiagnosticsSearchResults(
        'diagnostic',
        _searchText,
        parseInt(locationForDiagnostics?.cityId!, 10)
      );

      if (res?.data?.success) {
        console.log({ res });
        const products = g(res, 'data', 'data') || [];
        setDiagnosticResults(
          products as searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics[]
        );
        setSearchResult(products?.length == 0);
        setWebEngageEventOnSearchItem(_searchText, products);
      } else {
        console.log('po');
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

  const savePastSeacrh = (sku: string, name: string) =>
    client.mutate({
      mutation: SAVE_SEARCH,
      variables: {
        saveSearchInput: {
          type: SEARCH_TYPE.TEST,
          typeId: sku,
          typeName: name,
          patient: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
      },
    });

  const patientAttributes = {
    'Patient UHID': g(currentPatient, 'uhid'),
    'Patient Gender': g(currentPatient, 'gender'),
    'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Patient Age': Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
  };

  const postDiagnosticAddToCartEvent = (
    name: string,
    id: string,
    price: number,
    discountedPrice: number
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ADD_TO_CART] = {
      'Item Name': name,
      'Item ID': id,
      Source: 'Full search',
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ADD_TO_CART, eventAttributes);

    const firebaseAttributes: FirebaseEvents[FirebaseEventName.DIAGNOSTIC_ADD_TO_CART] = {
      productname: name,
      productid: id,
      Source: 'Diagnostic',
      Price: price,
      DiscountedPrice: discountedPrice,
      Quantity: 1,
    };
    postFirebaseEvent(FirebaseEventName.DIAGNOSTIC_ADD_TO_CART, firebaseAttributes);
    postAppsFlyerEvent(AppsFlyerEventName.DIAGNOSTIC_ADD_TO_CART, firebaseAttributes);
  };

  const setWebEngageEventOnSearchItem = (
    keyword: string,
    results: searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics[]
  ) => {
    if (keyword.length > 2) {
      const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ITEM_SEARCHED] = {
        ...patientAttributes,
        'Keyword Entered': keyword,
        '# Results appeared': results.length,
      };
      postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ITEM_SEARCHED, eventAttributes);
    }
  };

  const onAddCartItem = (
    itemId: string | number,
    itemName: string,
    rate?: number,
    collectionType?: TEST_COLLECTION_TYPE,
    pricesObject?: any,
    promoteCircle?: boolean,
    promoteDiscount?: boolean,
    selectedPlan?: any,
    inclusions?: any[]
  ) => {
    savePastSeacrh(`${itemId}`, itemName).catch((e) => {
      aphConsole.log({ e });
    });
    // postDiagnosticAddToCartEvent(stripHtml(itemName), `${itemId}`, rate, rate);
    postDiagnosticAddToCartEvent(stripHtml(itemName), `${itemId}`, 0, 0);

    addCartItem!({
      id: `${itemId}`,
      name: stripHtml(itemName),
      price: pricesObject?.rate || 0,
      specialPrice: pricesObject?.specialPrice! || pricesObject?.rate || 0,
      circlePrice: pricesObject?.circlePrice,
      circleSpecialPrice: pricesObject?.circleSpecialPrice,
      discountPrice: pricesObject?.discountPrice,
      discountSpecialPrice: pricesObject?.discountSpecialPrice,
      mou: inclusions == null ? 1 : inclusions.length,
      thumbnail: '',
      collectionMethod: collectionType! || TEST_COLLECTION_TYPE?.HC,
      groupPlan: selectedPlan?.groupPlan || DIAGNOSTIC_GROUP_PLAN.ALL,
      packageMrp: pricesObject?.packageMrp || 0,
      inclusions: inclusions == null ? [Number(itemId)] : inclusions,
    });
  };

  const onRemoveCartItem = (itemId: string | number) => {
    removeCartItem!(`${itemId}`);
  };

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const renderHeader = () => {
    const cartItemsCount = cartItems?.length + shopCartItems?.length;
    return (
      <Header
        container={{ borderBottomWidth: 0 }}
        leftIcon={'backArrow'}
        title={'SEARCH TESTS'}
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              activeOpacity={1}
              // style={{ marginRight: 24 }}
              onPress={() => {
                CommonLogEvent(AppRoutes.SearchTestScene, 'Navigate to your cart');
                props.navigation.navigate(AppRoutes.MedAndTestCart);
              }}
            >
              <CartIcon />
              {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={{ marginLeft: 10 }}
              disabled={true}
              activeOpacity={1}
              onPress={() => console.log('filter press')}
            >
              <Filter />
            </TouchableOpacity> */}
          </View>
        }
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const isNoTestsFound = !isLoading && searchText?.length > 2 && searchResult;

  const renderSorryMessage = isNoTestsFound ? (
    <Text style={styles.sorryTextStyle}>Sorry, we couldn’t find what you are looking for :(</Text>
  ) : (
    <View style={{ paddingBottom: 19 }} />
  );

  const renderSearchInput = () => {
    return (
      <View style={{ paddingHorizontal: 10, backgroundColor: theme.colors.WHITE }}>
        <TextInputComponent
          conatinerstyles={{ paddingBottom: 0 }}
          inputStyle={[
            styles.searchValueStyle,
            isNoTestsFound ? { borderBottomColor: '#e50000' } : {},
          ]}
          textInputprops={{
            ...(isNoTestsFound ? { selectionColor: '#e50000' } : {}),
            autoFocus: true,
          }}
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
                if (prevSearch.cancel) {
                  prevSearch.cancel();
                }
                return search;
              });
              search(value);
            }
          }}
        />
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
                source: 'Full Search',
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
        {/* <NeedHelpAssistant
          navigation={props.navigation}
          containerStyle={{ marginTop: 84, marginBottom: 50 }}
          onNeedHelpPress={() => {
            postWEGNeedHelpEvent(currentPatient, 'Tests');
          }}
        /> */}
      </ScrollView>
    );
  };

  const renderTestCard = (
    product: any,
    index: number,
    array: searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics[]
  ) => {
    const foundMedicineInCart = cartItems.find((item) => item.id == `${product.itemId}`);

    return (
      <DiagnosticsSearchSuggestionItem
        onPress={() => {
          CommonLogEvent(AppRoutes.SearchTestScene, 'Search suggestion Item');
          props.navigation.navigate(AppRoutes.TestDetails, {
            itemId: product?.diagnostic_item_id,
            source: 'Full Search',
            comingFrom: AppRoutes.SearchTestScene,
          });
        }}
        onPressAddToCart={() => {
          onAddCartItem(product?.diagnostic_item_id, product?.diagnostic_item_name);
        }}
        data={product}
        loading={true}
        showSeparator={index !== diagnosticResults?.length - 1}
        style={{
          marginHorizontal: 20,
          paddingBottom: index == diagnosticResults?.length - 1 ? 20 : 0,
        }}
        onPressRemoveFromCart={() => onRemoveCartItem(product?.diagnostic_item_id)}
      />
    );
  };

  const renderMatchingTests = () => {
    let popularTests: never[] = []
    let popularPackages: never[] = []
    if (popularArray?.length) {
      popularPackages = popularArray.filter(item => item?.diagnostic_inclusions?.length > 1)
      popularTests = popularArray.filter(item => item?.diagnostic_inclusions?.length == 1)
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
        ) : (
          !!searchText &&
          searchText?.length > 2 ? (
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
                    style={{ marginBottom: 5 }}
                  />
                )) ||
                null
              }
            />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.viewDefaultContainer}>
              <Text style={styles.headingSections}>Popular Packages</Text>
                  <View style={styles.defaultContainer}>
                    <FlatList
                      keyExtractor={(_, index) => `${index}`}
                      scrollEnabled={false}
                      data={popularPackages}
                      renderItem={renderPopularDiagnostic}
                    />
                  </View>
                  <Text style={styles.headingSections}>Popular Tests</Text>
                  <View style={styles.defaultContainer}>
                    <FlatList
                      keyExtractor={(_, index) => `${index}`}
                      scrollEnabled={false}
                      data={popularTests}
                      renderItem={renderPopularDiagnostic}
                    />
                  </View>
                </ScrollView>
          )
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
        source: 'Partial Search',
        comingFrom: AppRoutes.Tests,
      });
    }}
    onPressAddToCart={() => {
      onAddCartItem(item?.diagnostic_item_id, item?.diagnostic_item_name);
    }}
    data={item}
    loading={true}
    showSeparator={index !== diagnosticResults?.length - 1}
    style={{
      marginHorizontal: 5,
      paddingBottom: index == diagnosticResults?.length - 1 ? 20 : 0,
    }}
    onPressRemoveFromCart={() => removeCartItem!(`${item?.diagnostic_item_id}`)}
    />
    )
  }

  return (
    <SafeAreaView style={styles.safeAreaViewStyle}>
      <View style={styles.headerSearchInputShadow}>
        {renderHeader()}
        {renderSearchInput()}
      </View>
      {renderMatchingTests()}
    </SafeAreaView>
  );
};
