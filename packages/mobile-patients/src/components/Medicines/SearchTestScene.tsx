import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
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
  SEARCH_DIAGNOSTICS_BY_CITY_ID,
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
  isValidSearch,
  postWebEngageEvent,
  postWEGNeedHelpEvent,
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
} from 'react-native';
import { FlatList, NavigationScreenProps, ScrollView } from 'react-navigation';
import stripHtml from 'string-strip-html';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { TestPackageForDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { getPackageData, PackageInclusion } from '@aph/mobile-patients/src/helpers/apiCalls';
import { WebEngageEvents, WebEngageEventName } from '../../helpers/webEngageEvents';
import string from '@aph/mobile-patients/src/strings/strings.json';
import _ from 'lodash';

const styles = StyleSheet.create({
  safeAreaViewStyle: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
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
    top: -3,
    right: -3,
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
});

export interface SearchTestSceneProps
  extends NavigationScreenProps<{
    searchText: string;
  }> {}

export const SearchTestScene: React.FC<SearchTestSceneProps> = (props) => {
  const searchTextFromProp = props.navigation.getParam('searchText');
  const [showMatchingMedicines, setShowMatchingMedicines] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [medicineList, setMedicineList] = useState<
    searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pastSearches, setPastSearches] = useState<
    (getPatientPastMedicineSearches_getPatientPastMedicineSearches | null)[]
  >([]);
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
    client
      .query<getPatientPastMedicineSearches, getPatientPastMedicineSearchesVariables>({
        query: GET_PATIENT_PAST_MEDICINE_SEARCHES,
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
      title: 'Uh oh! :(',
      description: 'Unable to fetch pakage details.',
    });
  };

  const fetchPackageDetails = (
    name: string,
    func: (product: searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics) => void
  ) => {
    {
      setGlobalLoading!(true);
      client
        .query<searchDiagnosticsByCityID, searchDiagnosticsByCityIDVariables>({
          query: SEARCH_DIAGNOSTICS_BY_CITY_ID,
          variables: {
            searchText: name,
            cityID: parseInt(locationForDiagnostics?.cityId!, 10), //be default show of hyderabad
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          aphConsole.log('searchDiagnostics\n', { data });
          const product = g(data, 'searchDiagnosticsByCityID', 'diagnostics', '0' as any);
          if (product) {
            func && func(product);
          } else {
            errorAlert();
          }
        })
        .catch((e) => {
          CommonBugFender('SearchTestScene_fetchPackageDetails', e);
          aphConsole.log({ e });
          errorAlert();
        })
        .finally(() => {
          setGlobalLoading!(false);
        });
    }
  };

  const fetchPackageInclusion = (id: string, func: (tests: PackageInclusion[]) => void) => {
    setGlobalLoading!(true);
    getPackageData(id)
      .then(({ data }) => {
        console.log('getPackageData\n', { data });
        const product = g(data, 'data');
        if (product && product.length) {
          func && func(product);
        } else {
          errorAlert();
        }
      })
      .catch((e) => {
        CommonBugFender('SearchTestScene_fetchPackageInclusion', e);
        console.log({ e });
        errorAlert();
      })
      .finally(() => {
        setGlobalLoading!(false);
      });
  };

  const showGenericALert = (e: { response: AxiosResponse }) => {
    const error = e && e.response && e.response.data.message;
    aphConsole.log({ errorResponse: e.response, error }); //remove this line later
    showAphAlert!({
      title: `Uh oh.. :(`,
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

  const onSearchTest = (_searchText: string) => {
    setShowMatchingMedicines(true);
    setIsLoading(true);

    client
      .query<searchDiagnosticsByCityID, searchDiagnosticsByCityIDVariables>({
        query: SEARCH_DIAGNOSTICS_BY_CITY_ID,
        variables: {
          searchText: _searchText,
          cityID: parseInt(locationForDiagnostics?.cityId!, 10),
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        const products = g(data, 'searchDiagnosticsByCityID', 'diagnostics') || [];
        setMedicineList(
          products as searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics[]
        );
        setIsLoading(false);
      })
      .catch((e) => {
        CommonBugFender('SearchTestScene_onSearchTest', e);
        setIsLoading(false);
        showGenericALert(e);
      });
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

  const postDiagnosticAddToCartEvent = (
    name: string,
    id: string,
    price: number,
    discountedPrice: number
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ADD_TO_CART] = {
      'product name': name,
      'product id': id,
      Price: price,
      'Discounted Price': discountedPrice,
      Quantity: 1,
      Source: 'Diagnostic',
      // 'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      // 'Patient UHID': g(currentPatient, 'uhid'),
      // Relation: g(currentPatient, 'relation'),
      // 'Patient Age': Math.round(moment().diff(currentPatient.dateOfBirth, 'years', true)),
      // 'Patient Gender': g(ender': g(currentPatient, 'gender'),
      // 'Mobile Number': g(currentPatient, 'mobileNumber'),
      // 'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ADD_TO_CART, eventAttributes);
  };

  const onAddCartItem = (
    {
      itemId,
      itemName,
      rate,
      collectionType,
    }: searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics,
    testsIncluded: number
  ) => {
    savePastSeacrh(`${itemId}`, itemName).catch((e) => {
      aphConsole.log({ e });
    });
    postDiagnosticAddToCartEvent(stripHtml(itemName), `${itemId}`, rate, rate);
    addCartItem!({
      id: `${itemId}`,
      name: stripHtml(itemName),
      price: rate,
      mou: testsIncluded,
      thumbnail: '',
      collectionMethod: collectionType!,
    });
  };

  const onRemoveCartItem = ({
    itemId,
  }: searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics) => {
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
    const cartItemsCount = cartItems.length + shopCartItems.length;
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
            {/* <TouchableOpacity activeOpacity={1} onPress={() => setFilterVisible(true)}>
              <Filter />
            </TouchableOpacity> */}
          </View>
        }
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const isNoTestsFound = !isLoading && searchText.length > 2 && medicineList.length == 0;

  const renderSorryMessage = isNoTestsFound ? (
    <Text style={styles.sorryTextStyle}>Sorry, we couldn’t find what you are looking for :(</Text>
  ) : (
    <View style={{ paddingBottom: 19 }} />
  );

  const renderSearchInput = () => {
    return (
      <View style={{ paddingHorizontal: 20, backgroundColor: theme.colors.WHITE }}>
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
                setMedicineList([]);
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
            props.navigation.navigate(AppRoutes.TestDetails, {
              testDetails: {
                Rate: product.rate,
                Gender: product.gender,
                ItemID: `${product.itemId}`,
                ItemName: product.itemName,
                FromAgeInDays: product.fromAgeInDays,
                ToAgeInDays: product.toAgeInDays,
                collectionType: product.collectionType,
                preparation: product.testPreparationData,
                source: 'Search Page',
                type: product.itemType,
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
        {pastSearches.length > 0 && (
          <SectionHeaderComponent sectionTitle={'Past Searches'} style={{ marginBottom: 0 }} />
        )}
        <View style={styles.pastSearchContainerStyle}>
          {pastSearches
            .slice(0, 5)
            .map((pastSearch, i, array) =>
              renderPastSearchItem(pastSearch!, i == array.length - 1 ? { marginRight: 0 } : {})
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
    product: searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics,
    index: number,
    array: searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics[]
  ) => {
    const productCardContainerStyle = [
      { marginBottom: 8, marginHorizontal: 20 },
      index == 0 ? { marginTop: 20 } : {},
      index == array.length - 1 ? { marginBottom: 20 } : {},
    ];
    const foundMedicineInCart = cartItems.find((item) => item.id == `${product.itemId}`);
    const testsIncluded = g(foundMedicineInCart, 'mou') || 1;
    const price = product.rate;

    return (
      <MedicineCard
        isTest={true}
        containerStyle={[productCardContainerStyle, {}]}
        onPress={() => {
          savePastSeacrh(product.id, product.itemName).catch((e) => {});
          props.navigation.navigate(AppRoutes.TestDetails, {
            testDetails: {
              Rate: price,
              Gender: product.gender,
              ItemID: `${product.itemId}`,
              ItemName: product.itemName,
              FromAgeInDays: product.fromAgeInDays,
              ToAgeInDays: product.toAgeInDays,
              collectionType: product.collectionType,
              preparation: product.testPreparationData,
              source: 'Search Page',
              type: product.itemType,
            } as TestPackageForDetails,
          });
        }}
        medicineName={stripHtml(product.itemName)}
        imageUrl={''}
        price={price}
        specialPrice={undefined}
        unit={1}
        onPressAdd={() => {
          CommonLogEvent(AppRoutes.SearchTestScene, 'Add item to cart');
          fetchPackageInclusion(`${product.itemId}`, (tests) => {
            onAddCartItem(product, tests.length);
          });
        }}
        onPressRemove={() => {
          CommonLogEvent(AppRoutes.SearchTestScene, 'Remove item from cart');
          onRemoveCartItem(product);
        }}
        onChangeUnit={() => {}}
        isCardExpanded={!!foundMedicineInCart}
        isInStock={true}
        packOfCount={testsIncluded}
        isPrescriptionRequired={false}
        subscriptionStatus={'unsubscribed'}
        onChangeSubscription={() => {}}
        onEditPress={() => {}}
        onAddSubscriptionPress={() => {}}
      />
    );
  };

  const renderMatchingTests = () => {
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
          searchText.length > 2 && (
            <FlatList
              onScroll={() => Keyboard.dismiss()}
              data={medicineList}
              renderItem={({ item, index }) => renderTestCard(item, index, medicineList)}
              keyExtractor={(_, index) => `${index}`}
              bounces={false}
              ListHeaderComponent={
                (medicineList.length > 0 && (
                  <SectionHeaderComponent
                    sectionTitle={`Matching Tests — ${medicineList.length}`}
                    style={{ marginBottom: 0 }}
                  />
                )) ||
                null
              }
            />
          )
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaViewStyle}>
      <View style={styles.headerSearchInputShadow}>
        {renderHeader()}
        {renderSearchInput()}
      </View>
      {showMatchingMedicines ? renderMatchingTests() : renderPastSearches()}
    </SafeAreaView>
  );
};
