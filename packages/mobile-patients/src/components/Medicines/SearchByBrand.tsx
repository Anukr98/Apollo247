import {
  FilterRange,
  MedicineFilter,
  SortByOptions,
} from '@aph/mobile-patients/src/components/Medicines/MedicineFilter';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CartIcon,
  Filter,
  InjectionIcon,
  MedicineIcon,
  MedicineRxIcon,
  SearchSendIcon,
  SyrupBottleIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { SAVE_SEARCH } from '@aph/mobile-patients/src/graphql/profiles';
import { SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  Doseform,
  getMedicineSearchSuggestionsApi,
  getProductsByCategoryApi,
  MedicineProduct,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Image, Input } from 'react-native-elements';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  isValidSearch,
  postWebEngageEvent,
  postwebEngageAddToCartEvent,
  postAppsFlyerAddToCartEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';

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

export interface SearchByBrandProps
  extends NavigationScreenProps<{
    title: string;
    category_id: string;
    isTest?: boolean; // Ignoring for now
  }> {}

export const SearchByBrand: React.FC<SearchByBrandProps> = (props) => {
  const category_id = props.navigation.getParam('category_id');
  const pageTitle = props.navigation.getParam('title');
  const isTest = props.navigation.getParam('isTest');
  const [searchText, setSearchText] = useState<string>('');
  const [productsList, setProductsList] = useState<MedicineProduct[]>([]);
  const [medicineList, setMedicineList] = useState<MedicineProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchSate, setsearchSate] = useState<'load' | 'success' | 'fail' | undefined>();
  const medicineListRef = useRef<FlatList<MedicineProduct> | null>();
  const [pageCount, setPageCount] = useState<number>(1);
  const [listFetching, setListFetching] = useState<boolean>(true);
  const [endReached, setEndReached] = useState<boolean>(false);
  const [prevData, setPrevData] = useState<MedicineProduct[]>();
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { addCartItem, removeCartItem, updateCartItem, cartItems } = useShoppingCart();
  const { cartItems: diagnosticCartItems } = useDiagnosticsCart();
  const { getPatientApiCall } = useAuth();
  const { showAphAlert } = useUIElements();

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    getProductsByCategoryApi(category_id, pageCount)
      .then(({ data }) => {
        console.log(data, 'getProductsByCategoryApi');
        const products = data.products || [];
        setProductsList(products);
        setPageCount(pageCount + 1);
        setPrevData(products);
      })
      .catch((err) => {
        CommonBugFender('SearchByBrand_getProductsByCategoryApi', err);
        console.log(err, 'errr');
      })
      .finally(() => {
        setIsLoading(false);
        setListFetching(false);
      });
  }, []);

  const savePastSeacrh = (sku: string, name: string) =>
    client.mutate({
      mutation: SAVE_SEARCH,
      variables: {
        saveSearchInput: {
          type: SEARCH_TYPE.MEDICINE,
          typeId: sku,
          typeName: name,
          patient: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
      },
    });

  const onAddCartItem = (item: MedicineProduct) => {
    const { sku, mou, name, price, special_price, is_prescription_required, thumbnail } = item;
    addCartItem!({
      id: sku,
      mou,
      name,
      price: price,
      specialPrice: special_price
        ? typeof special_price == 'string'
          ? parseInt(special_price)
          : special_price
        : undefined,
      prescriptionRequired: is_prescription_required == '1',
      quantity: 1,
      thumbnail,
      isInStock: true,
    });
    postwebEngageAddToCartEvent(item, 'Pharmacy List');
    postAppsFlyerAddToCartEvent(item, 'Pharmacy List');
  };

  const onRemoveCartItem = ({ sku }: MedicineProduct) => {
    removeCartItem && removeCartItem(sku);
  };

  const onUpdateCartItem = ({ sku }: MedicineProduct, unit: number) => {
    if (!(unit < 1)) {
      updateCartItem &&
        updateCartItem({
          id: sku,
          quantity: unit,
        });
    }
  };

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const renderHeader = () => {
    const cartItemsCount = cartItems.length + diagnosticCartItems.length;
    return (
      <Header
        container={{
          borderBottomWidth: 0,
        }}
        leftIcon={'backArrow'}
        title={pageTitle || 'SEARCH PRODUCTS'}
        rightComponent={
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{
                marginRight: 24,
              }}
              onPress={() => {
                props.navigation.navigate(AppRoutes.MedAndTestCart);
              }}
            >
              <CartIcon />
              {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={1} onPress={() => setFilterVisible(true)}>
              <Filter />
            </TouchableOpacity>
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
    <View
      style={{
        paddingBottom: 19,
      }}
    />
  );

  interface SuggestionType {
    name: string;
    price: number;
    specialPrice?: number;
    isOutOfStock: boolean;
    type: Doseform;
    imgUri?: string;
    prescriptionRequired: boolean;
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
            style={{
              ...theme.viewStyles.text('M', 16, '#01475b', 1, 24, 0),
            }}
          >
            {data.name}
          </Text>
          {data.isOutOfStock ? (
            <Text
              style={{
                ...theme.viewStyles.text('M', 12, '#890000', 1, 20, 0.04),
              }}
            >
              {'Out Of Stock'}
            </Text>
          ) : (
            <View
              style={{
                flexDirection: 'row',
              }}
            >
              <Text
                style={{
                  ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0.04),
                }}
              >
                Rs. {data.specialPrice || data.price}
              </Text>
              {data.specialPrice ? (
                <Text
                  style={[
                    {
                      ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0.04),
                      marginLeft: 8,
                    },
                  ]}
                >
                  {'('}
                  <Text
                    style={{
                      textDecorationLine: 'line-through',
                    }}
                  >{`Rs. ${data.price}`}</Text>
                  {')'}
                </Text>
              ) : null}
            </View>
          )}
        </View>
      );
    };

    const renderIconOrImage = () => {
      return (
        <View style={localStyles.iconOrImageContainerStyle}>
          {data.imgUri ? (
            <Image
              // placeholderStyle={styles.imagePlaceholderStyle}
              // PlaceholderContent={<ImagePlaceholderView />}
              source={{
                uri: data.imgUri,
              }}
              style={{
                height: 40,
                width: 40,
              }}
              resizeMode="contain"
            />
          ) : data.type == 'SYRUP' ? (
            <SyrupBottleIcon />
          ) : data.type == 'INJECTION' ? (
            <InjectionIcon />
          ) : data.prescriptionRequired ? (
            <MedicineRxIcon />
          ) : (
            <MedicineIcon />
          )}
        </View>
      );
    };

    return (
      <TouchableOpacity activeOpacity={1} onPress={data.onPress}>
        <View style={localStyles.containerStyle} key={data.name}>
          <View style={localStyles.iconAndDetailsContainerStyle}>
            {renderIconOrImage()}
            <View
              style={{
                width: 16,
              }}
            />
            {renderNamePriceAndInStockStatus()}
          </View>
          {data.showSeparator ? <Spearator /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSearchSuggestionItemView = (data: ListRenderItemInfo<MedicineProduct>) => {
    const { index, item } = data;
    const imgUri = item.thumbnail
      ? `${AppConfig.Configuration.IMAGES_BASE_URL[0]}${item.thumbnail}`
      : '';
    const specialPrice = item.special_price
      ? typeof item.special_price == 'string'
        ? parseInt(item.special_price)
        : item.special_price
      : undefined;

    return renderSearchSuggestionItem({
      onPress: () => {
        props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
          sku: item.sku,
        });
        resetSearchState();
      },
      name: item.name,
      price: item.price,
      specialPrice,
      isOutOfStock: !item.is_in_stock,
      type: ((item.PharmaOverview || [])[0] || {}).Doseform,
      style: {
        marginHorizontal: 20,
        paddingBottom: index == medicineList.length - 1 ? 10 : 0,
      },
      showSeparator: !(index == medicineList.length - 1),
      imgUri,
      prescriptionRequired: item.is_prescription_required == '1',
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
        props.navigation.navigate(AppRoutes.SearchMedicineScene, { searchText });
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
      <View
        style={{
          paddingHorizontal: 10,
          backgroundColor: theme.colors.WHITE,
        }}
      >
        <Input
          value={searchText}
          onSubmitEditing={goToSearchPage}
          onChangeText={(value) => {
            onSearchMedicine(value);
          }}
          autoCorrect={false}
          rightIcon={rigthIconView}
          placeholder={'Search medicine and more'}
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

  const postwebEngageProductClickedEvent = ({ name, sku }: MedicineProduct) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_PRODUCT_CLICKED] = {
      'product name': name,
      'product id': sku,
      Brand: '',
      'Brand ID': '',
      'category name': '',
      'category ID': category_id,
      Source: 'List',
      'Section Name': 'SEARCH',
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_PRODUCT_CLICKED, eventAttributes);
  };

  const renderMedicineCard = (
    medicine: MedicineProduct,
    index: number,
    array: MedicineProduct[]
  ) => {
    const medicineCardContainerStyle = [
      {
        marginBottom: 8,
        marginHorizontal: 20,
      },
      index == 0 ? { marginTop: 20 } : {},
      index == array.length - 1 ? { marginBottom: 20 } : {},
    ];
    const foundMedicineInCart = cartItems.find((item) => item.id == medicine.sku);
    const price = medicine.price;
    const specialPrice = medicine.special_price
      ? typeof medicine.special_price == 'string'
        ? parseInt(medicine.special_price)
        : medicine.special_price
      : undefined;

    return (
      <MedicineCard
        containerStyle={[medicineCardContainerStyle, {}]}
        onPress={() => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Save past Search');
          savePastSeacrh(medicine.sku, medicine.name).catch((e) => {
            // handleGraphQlError(e);
          });
          postwebEngageProductClickedEvent(medicine);
          props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
            sku: medicine.sku,
            title: medicine.name,
          });
        }}
        medicineName={medicine.name}
        imageUrl={
          medicine.thumbnail && !medicine.thumbnail.includes('/default/placeholder')
            ? `${AppConfig.Configuration.IMAGES_BASE_URL[0]}${medicine.thumbnail}`
            : ''
        }
        price={price}
        specialPrice={specialPrice}
        unit={(foundMedicineInCart && foundMedicineInCart.quantity) || 0}
        onPressAdd={() => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Add item to cart');
          onAddCartItem(medicine);
        }}
        onPressRemove={() => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Remove item from cart');
          onRemoveCartItem(medicine);
        }}
        onChangeUnit={(unit) => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Change unit in cart');
          onUpdateCartItem(medicine, unit);
        }}
        isCardExpanded={!!foundMedicineInCart}
        isInStock={medicine.is_in_stock}
        packOfCount={(medicine.mou && parseInt(medicine.mou)) || undefined}
        isPrescriptionRequired={medicine.is_prescription_required == '1'}
        subscriptionStatus={'unsubscribed'}
        onChangeSubscription={() => {}}
        onEditPress={() => {}}
        onAddSubscriptionPress={() => {}}
      />
    );
  };

  const renderEmptyData = () => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <Card
          cardContainer={{
            marginTop: 0,
            elevation: 0,
          }}
          heading={'Uh oh! :('}
          description={'No data Found!'}
          descriptionTextStyle={{
            fontSize: 14,
          }}
          headingTextStyle={{
            fontSize: 14,
          }}
        />
      </View>
    );
  };

  const [filterVisible, setFilterVisible] = useState(false);
  const [discount, setdiscount] = useState<FilterRange>({
    from: undefined,
    to: undefined,
  });
  const [price, setprice] = useState<FilterRange>({
    from: undefined,
    to: undefined,
  });
  const [sortBy, setSortBy] = useState<SortByOptions>();

  const renderFilterView = () => {
    return (
      <MedicineFilter
        hideCategoryFilter={true}
        isVisible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApplyFilter={(discountRange, priceRange, sortBy) => {
          setFilterVisible(false);
          setIsLoading(true);
          setdiscount(discountRange);
          setprice(priceRange);
          setSortBy(sortBy);
          medicineListRef.current && medicineListRef.current.scrollToOffset({ offset: 0 });
          setIsLoading(false);
        }}
      />
    );
  };

  const getSpecialPrice = (special_price?: string | number) =>
    special_price
      ? typeof special_price == 'string'
        ? parseInt(special_price)
        : special_price
      : undefined;

  const renderMatchingMedicines = () => {
    let filteredProductsList = productsList;
    // Price
    if (typeof price.from == 'number' || typeof price.to == 'number') {
      filteredProductsList = filteredProductsList.filter(
        (item) =>
          (price.from ? item.price >= price.from! : true) &&
          (price.to ? item.price <= price.to! : true)
      );
    }
    // Discount
    if (typeof discount.from == 'number' && typeof discount.to == 'number') {
      filteredProductsList = filteredProductsList.filter((item) => {
        if (!item.special_price) return discount.from == 0 || discount.from == undefined;
        const specialPrice = getSpecialPrice(item.special_price);
        const discountPercentage = ((item.price - specialPrice!) / item.price) * 100;

        return discountPercentage >= (discount.from || 0) && discountPercentage <= discount.to!
          ? true
          : false;
      });
    }
    // Sorting
    if (sortBy == 'Price-L-H') {
      filteredProductsList = filteredProductsList.sort((med1, med2) => {
        return (
          getSpecialPrice(med1.special_price || med1.price)! -
          getSpecialPrice(med2.special_price || med2.price)!
        );
      });
    } else if (sortBy == 'Price-H-L') {
      filteredProductsList = filteredProductsList.sort((med1, med2) => {
        return (
          getSpecialPrice(med2.special_price || med2.price)! -
          getSpecialPrice(med1.special_price || med1.price)!
        );
      });
    } else if (sortBy == 'A-Z') {
      filteredProductsList = filteredProductsList.sort((med1, med2) =>
        med1.name < med2.name ? -1 : med1.name > med2.name ? 1 : 0
      );
    } else if (sortBy == 'Z-A') {
      filteredProductsList = filteredProductsList.sort((med1, med2) =>
        med1.name > med2.name ? -1 : med1.name < med2.name ? 1 : 0
      );
    }

    return filteredProductsList.length ? (
      <FlatList
        removeClippedSubviews={true}
        onScroll={() => Keyboard.dismiss()}
        ref={(ref) => {
          medicineListRef.current = ref;
        }}
        data={filteredProductsList}
        renderItem={({ item, index }) => renderMedicineCard(item, index, filteredProductsList)}
        keyExtractor={(_, index) => `${index}`}
        bounces={false}
        ListFooterComponent={
          listFetching ? (
            <View style={{ marginBottom: 20 }}>
              <ActivityIndicator animating={true} size="large" color="green" />
            </View>
          ) : null
        }
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (!listFetching && !endReached) {
            setListFetching(true);
            getProductsByCategoryApi(category_id, pageCount)
              .then(({ data }) => {
                const products = data.products || [];
                if (prevData && JSON.stringify(prevData) !== JSON.stringify(products)) {
                  setProductsList([...productsList, ...products]);
                  setPageCount(pageCount + 1);
                  setPrevData(products);
                } else {
                  setEndReached(true);
                  showAphAlert &&
                    showAphAlert({
                      title: 'Alert!',
                      description: "You've reached the end of the list",
                    });
                }
              })
              .catch((err) => {
                CommonBugFender('SearchByBrand_getProductsByCategoryApi', err);
                console.log(err, 'errr');
              })
              .finally(() => {
                setIsLoading(false);
                setListFetching(false);
              });
          }
        }}
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
    return (
      <Spinner
        style={{
          height,
          position: 'relative',
          backgroundColor: 'transparent',
        }}
      />
    );
  };

  const onSearchMedicine = (_searchText: string) => {
    if (isValidSearch(_searchText)) {
      setSearchText(_searchText);
      if (!(_searchText && _searchText.length > 2)) {
        setMedicineList([]);
        return;
      }
      const eventAttributes: WebEngageEvents[WebEngageEventName.SEARCH] = {
        keyword: _searchText,
        Source: 'Pharmacy Home',
      };
      postWebEngageEvent(WebEngageEventName.SEARCH, eventAttributes);

      setsearchSate('load');
      getMedicineSearchSuggestionsApi(_searchText)
        .then(({ data }) => {
          // aphConsole.log({ data });
          const products = data.products || [];
          setMedicineList(products);
          setsearchSate('success');
        })
        .catch((e) => {
          CommonBugFender('SearchByBrand_onSearchMedicine', e);
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
          <View
            style={{
              backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
            }}
          >
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
                paddingTop: 10.5,
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
          <View
            style={{
              flex: 1,
            }}
          >
            {renderMatchingMedicines()}
            {renderOverlay()}
          </View>
        </SafeAreaView>
      )}
      {renderFilterView()}
    </View>
  );
};
