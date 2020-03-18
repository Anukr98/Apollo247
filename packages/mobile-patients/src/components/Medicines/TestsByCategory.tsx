import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { TestPackageForDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon, SearchSendIcon, TestsIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { SAVE_SEARCH, SEARCH_DIAGNOSTICS } from '@aph/mobile-patients/src/graphql/profiles';
import { getDiagnosticsData_getDiagnosticsData_diagnosticOrgans_diagnostics } from '@aph/mobile-patients/src/graphql/types/getDiagnosticsData';
import { DIAGNOSTICS_TYPE, SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  searchDiagnostics,
  searchDiagnosticsVariables,
  searchDiagnostics_searchDiagnostics_diagnostics,
} from '@aph/mobile-patients/src/graphql/types/searchDiagnostics';
import { getPackageData, PackageInclusion } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  g,
  isValidSearch,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  Keyboard,
  ListRenderItemInfo,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Image, Input } from 'react-native-elements';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import { WebEngageEvents, WebEngageEventName } from '../../helpers/webEngageEvents';
import moment from 'moment';

const styles = StyleSheet.create({
  safeAreaViewStyle: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
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
  sorryTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#890000',
    paddingVertical: 8,
    marginHorizontal: 10,
  },
});

export interface TestsByCategoryProps
  extends NavigationScreenProps<{
    title: string;
    products: getDiagnosticsData_getDiagnosticsData_diagnosticOrgans_diagnostics[];
  }> {}

export const TestsByCategory: React.FC<TestsByCategoryProps> = (props) => {
  const pageTitle = props.navigation.getParam('title');
  const products = props.navigation.getParam('products');
  const [searchText, setSearchText] = useState<string>('');
  const [productsList, setProductsList] = useState<
    getDiagnosticsData_getDiagnosticsData_diagnosticOrgans_diagnostics[]
  >(products || []);
  const [medicineList, setMedicineList] = useState<
    searchDiagnostics_searchDiagnostics_diagnostics[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchSate, setsearchSate] = useState<'load' | 'success' | 'fail' | undefined>();

  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { addCartItem, removeCartItem, updateCartItem, cartItems } = useDiagnosticsCart();
  const { cartItems: shopCartItems } = useShoppingCart();
  const { getPatientApiCall } = useAuth();
  const { locationForDiagnostics } = useAppCommonData();
  const { showAphAlert, setLoading: setGlobalLoading } = useUIElements();

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

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
      Source: 'Diagnostic',
      Price: price,
      'Discounted Price': discountedPrice,
      Quantity: 1,
      // 'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      // 'Patient UHID': g(currentPatient, 'uhid'),
      // Relation: g(currentPatient, 'relation'),
      // Age: Math.round(moment().diff(currentPatient.dateOfBirth, 'years', true)),
      // Gender: g(currentPatient, 'gender'),
      // 'Mobile Number': g(currentPatient, 'mobileNumber'),
      // 'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ADD_TO_CART, eventAttributes);
  };

  const errorAlert = () => {
    showAphAlert!({
      title: 'Uh oh! :(',
      description: 'Unable to fetch pakage details.',
    });
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
        CommonBugFender('TestsByCategory_fetchPackageInclusion', e);
        console.log({ e });
        errorAlert();
      })
      .finally(() => {
        setGlobalLoading!(false);
      });
  };

  const onAddCartItem = (
    { itemId, collectionType, itemName, rate }: searchDiagnostics_searchDiagnostics_diagnostics,
    testsIncluded: number
  ) => {
    postDiagnosticAddToCartEvent(itemName, `${itemId}`, rate, rate);
    addCartItem!({
      id: `${itemId}`,
      mou: testsIncluded,
      name: itemName,
      price: rate,
      thumbnail: '',
      collectionMethod: collectionType!,
    });
  };

  const onRemoveCartItem = ({ itemId }: searchDiagnostics_searchDiagnostics_diagnostics) => {
    removeCartItem && removeCartItem(`${itemId}`);
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
        title={pageTitle || 'SEARCH PRODUCTS'}
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              activeOpacity={1}
              // style={{ marginRight: 24 }}
              onPress={() => {
                props.navigation.navigate(AppRoutes.MedAndTestCart, { isComingFromConsult: true });
              }}
            >
              <CartIcon />
              {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
            </TouchableOpacity>
            {/* <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <Filter />
            </TouchableOpacity> */}
          </View>
        }
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const isNoResultsFound =
    searchSate != 'load' && searchText.length > 2 && medicineList.length == 0;

  const renderSorryMessage = isNoResultsFound ? (
    <Text style={styles.sorryTextStyle}>Sorry, we couldn’t find what you are looking for :(</Text>
  ) : (
    <View style={{ paddingBottom: 19 }} />
  );

  interface SuggestionType {
    name: string;
    price: number;
    type: DIAGNOSTICS_TYPE;
    imgUri?: string;
    onPress: () => void;
    showSeparator?: boolean;
    style?: ViewStyle;
  }

  const renderSearchSuggestionItem = (data: SuggestionType) => {
    const localStyles = StyleSheet.create({
      containerStyle: {
        ...data.style,
      },
      iconAndDetailsContainerStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 9.5,
        marginHorizontal: 12,
      },
      iconOrImageContainerStyle: {
        width: 40,
      },
      nameAndPriceViewStyle: {
        flex: 1,
      },
    });

    const renderNamePriceAndInStockStatus = () => {
      return (
        <View style={localStyles.nameAndPriceViewStyle}>
          <Text
            numberOfLines={1}
            style={{ ...theme.viewStyles.text('M', 16, '#01475b', 1, 24, 0) }}
          >
            {data.name}
          </Text>
          <Text style={{ ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0.04) }}>
            Rs. {data.price}
          </Text>
        </View>
      );
    };

    const renderIconOrImage = () => {
      return (
        <View style={localStyles.iconOrImageContainerStyle}>
          {data.imgUri ? (
            <Image
              // placeholderStyle={styles.imagePlaceholderStyle}
              source={{ uri: data.imgUri }}
              style={{ height: 40, width: 40 }}
              resizeMode="contain"
            />
          ) : data.type == 'PACKAGE' ? (
            <TestsIcon />
          ) : (
            <TestsIcon />
          )}
        </View>
      );
    };

    return (
      <TouchableOpacity activeOpacity={1} onPress={data.onPress}>
        <View style={localStyles.containerStyle} key={data.name}>
          <View style={localStyles.iconAndDetailsContainerStyle}>
            {renderIconOrImage()}
            <View style={{ width: 16 }} />
            {renderNamePriceAndInStockStatus()}
          </View>
          {data.showSeparator ? <Spearator /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSearchSuggestionItemView = (
    data: ListRenderItemInfo<searchDiagnostics_searchDiagnostics_diagnostics>
  ) => {
    const { index, item } = data;
    const imgUri = undefined; //`${config.IMAGES_BASE_URL[0]}${1}`;
    const {
      rate,
      gender,
      itemId,
      itemName,
      collectionType,
      fromAgeInDays,
      testPreparationData,
      toAgeInDays,
    } = item;
    return renderSearchSuggestionItem({
      onPress: () => {
        props.navigation.navigate(AppRoutes.TestDetails, {
          testDetails: {
            Rate: rate,
            Gender: gender,
            ItemID: `${itemId}`,
            ItemName: itemName,
            FromAgeInDays: fromAgeInDays,
            ToAgeInDays: toAgeInDays,
            collectionType: collectionType,
            preparation: testPreparationData,
          } as TestPackageForDetails,
        });
      },
      name: item.itemName,
      price: item.rate,
      type: item.itemType!,
      style: {
        marginHorizontal: 20,
        paddingBottom: index == medicineList.length - 1 ? 10 : 0,
      },
      showSeparator: !(index == medicineList.length - 1),
      imgUri,
    });
  };

  const renderSearchInput = () => {
    const styles = StyleSheet.create({
      inputStyle: {
        minHeight: 29,
        ...theme.fonts.IBMPlexSansMedium(18),
      },
      inputContainerStyle: {
        borderBottomColor: '#00b38e',
        borderBottomWidth: 2,
        // marginHorizontal: 10,
      },
      rightIconContainerStyle: {
        height: 24,
      },
      style: {
        // paddingBottom: 18.5,
      },
      containerStyle: {
        // marginBottom: 19,
        // marginTop: 18,
      },
    });

    const goToSearchPage = () => {
      if (searchText.length > 2) {
        props.navigation.navigate(AppRoutes.SearchTestScene, { searchText });
        resetSearchState();
      }
    };
    const enableSearchEnterBtn = searchText.length > 0 && medicineList.length > 0;
    const rigthIconView = (
      <TouchableOpacity
        activeOpacity={1}
        style={{
          opacity: enableSearchEnterBtn ? 1 : 0.4,
        }}
        disabled={!enableSearchEnterBtn}
        onPress={goToSearchPage}
      >
        <SearchSendIcon />
      </TouchableOpacity>
    );

    return (
      <View style={{ paddingHorizontal: 10, backgroundColor: theme.colors.WHITE }}>
        <Input
          value={searchText}
          onSubmitEditing={goToSearchPage}
          onChangeText={(value) => {
            onSearchMedicine(value);
          }}
          autoCorrect={false}
          rightIcon={rigthIconView}
          placeholder={'Search tests & packages'}
          selectionColor="#00b38e"
          underlineColorAndroid="transparent"
          placeholderTextColor="rgba(1,48,91, 0.4)"
          inputStyle={styles.inputStyle}
          inputContainerStyle={styles.inputContainerStyle}
          rightIconContainerStyle={styles.rightIconContainerStyle}
          style={styles.style}
          containerStyle={styles.containerStyle}
        />
        {renderSorryMessage}
      </View>
    );
  };

  const renderMedicineCard = (
    medicine: searchDiagnostics_searchDiagnostics_diagnostics,
    index: number,
    array: searchDiagnostics_searchDiagnostics_diagnostics[]
  ) => {
    const medicineCardContainerStyle = [
      { marginBottom: 8, marginHorizontal: 20 },
      index == 0 ? { marginTop: 20 } : {},
      index == array.length - 1 ? { marginBottom: 20 } : {},
    ];
    const foundMedicineInCart = cartItems.find((item) => item.id == `${medicine.itemId}`);
    const price = medicine.rate;
    const testsIncluded = g(foundMedicineInCart, 'mou') || 1;
    // const specialPrice = medicine.special_price
    //   ? typeof medicine.special_price == 'string'
    //     ? parseInt(medicine.special_price)
    //     : medicine.special_price
    //   : undefined;
    const specialPrice = undefined;

    return (
      <MedicineCard
        isTest={true}
        containerStyle={[medicineCardContainerStyle, {}]}
        onPress={() => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Save past Search');
          savePastSeacrh(`${medicine.itemId}`, medicine.itemName).catch((e) => {
            // handleGraphQlError(e);
          });
          props.navigation.navigate(AppRoutes.TestDetails, {
            title: medicine.itemName,
            testDetails: {
              Rate: medicine!.rate,
              Gender: medicine!.gender,
              ItemID: `${medicine!.itemId}`,
              ItemName: medicine!.itemName,
              collectionType: medicine!.collectionType,
              FromAgeInDays: medicine!.fromAgeInDays,
              ToAgeInDays: medicine!.toAgeInDays,
              preparation: medicine!.testPreparationData,
            } as TestPackageForDetails,
          });
        }}
        medicineName={medicine.itemName}
        imageUrl={''}
        price={price}
        specialPrice={specialPrice}
        unit={1}
        onPressAdd={() => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Add item to cart');
          fetchPackageInclusion(`${medicine.itemId}`, (product) => {
            onAddCartItem(medicine, product.length);
          });
        }}
        onPressRemove={() => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Remove item from cart');
          onRemoveCartItem(medicine);
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

  const renderEmptyData = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Card
          cardContainer={{ marginTop: 0, elevation: 0 }}
          heading={'Uh oh! :('}
          description={'No data Found!'}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        />
      </View>
    );
  };

  const renderMatchingMedicines = () => {
    return productsList.length ? (
      <FlatList
        onScroll={() => Keyboard.dismiss()}
        data={productsList}
        renderItem={({ item, index }) => renderMedicineCard(item, index, productsList)}
        keyExtractor={(_, index) => `${index}`}
        bounces={false}
      />
    ) : (
      renderEmptyData()
    );
  };

  const resetSearchState = () => {
    setMedicineList([]);
    setSearchText('');
    setsearchSate(undefined);
  };

  const renderOverlay = () => {
    const overlayStyle = {
      flex: 1,
      position: 'absolute',
      left: 0,
      top: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    } as ViewStyle;

    return (
      (medicineList.length || searchSate == 'load') && (
        <View style={overlayStyle}>
          <TouchableOpacity activeOpacity={1} style={overlayStyle} onPress={resetSearchState} />
        </View>
      )
    );
  };

  const renderSectionLoader = (height: number = 100) => {
    return <Spinner style={{ height, position: 'relative', backgroundColor: 'transparent' }} />;
  };

  const onSearchMedicine = (_searchText: string) => {
    if (isValidSearch(_searchText)) {
      setSearchText(_searchText);
      if (!(_searchText && _searchText.length > 2)) {
        setMedicineList([]);
        return;
      }
      setsearchSate('load');
      client
        .query<searchDiagnostics, searchDiagnosticsVariables>({
          query: SEARCH_DIAGNOSTICS,
          variables: {
            searchText: _searchText,
            city: locationForDiagnostics && locationForDiagnostics.city,
            patientId: (currentPatient && currentPatient.id) || '',
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          // aphConsole.log({ data });
          const products = g(data, 'searchDiagnostics', 'diagnostics') || [];
          setMedicineList(products as searchDiagnostics_searchDiagnostics_diagnostics[]);
          setsearchSate('success');
        })
        .catch((e) => {
          CommonBugFender('TestsByCategory_onSearchMedicine', e);
          // aphConsole.log({ e });
          if (!Axios.isCancel(e)) {
            setsearchSate('fail');
          }
        });
    }
  };

  const renderSearchResults = () => {
    return (
      <>
        {searchSate == 'load' ? (
          <View style={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }}>
            {renderSectionLoader(266)}
          </View>
        ) : (
          !!searchText &&
          searchText.length > 2 && (
            <FlatList
              keyboardShouldPersistTaps="always"
              // contentContainerStyle={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }}
              bounces={false}
              keyExtractor={(_, index) => `${index}`}
              showsVerticalScrollIndicator={false}
              style={{
                paddingTop: medicineList.length > 0 ? 10.5 : 0,
                maxHeight: 266,
                backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
              }}
              data={medicineList}
              renderItem={renderSearchSuggestionItemView}
            />
          )
        )}
      </>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {isLoading ? (
        <Spinner />
      ) : (
        <SafeAreaView style={styles.safeAreaViewStyle}>
          <View style={styles.headerSearchInputShadow}>
            {renderHeader()}
            {renderSearchInput()}
            {renderSearchResults()}
          </View>
          <View style={{ flex: 1 }}>
            {renderMatchingMedicines()}
            {renderOverlay()}
          </View>
        </SafeAreaView>
      )}
    </View>
  );
};
