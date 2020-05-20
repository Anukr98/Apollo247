import {
  FilterRange,
  MedicineFilter,
  SortByOptions,
} from '@aph/mobile-patients/src/components/Medicines/MedicineFilter';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon, Filter, SearchSendIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { SearchMedicineCard } from '@aph/mobile-patients/src/components/ui/SearchMedicineCard';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { SAVE_SEARCH } from '@aph/mobile-patients/src/graphql/profiles';
import { SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
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
import { Input } from 'react-native-elements';
import { FlatList, NavigationScreenProps, NavigationActions, StackActions } from 'react-navigation';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  isValidSearch,
  postWebEngageEvent,
  postwebEngageAddToCartEvent,
  postAppsFlyerAddToCartEvent,
  addPharmaItemToCart,
  g,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { MedicineSearchSuggestionItem } from '@aph/mobile-patients/src/components/Medicines/MedicineSearchSuggestionItem';

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
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#02475b',
    paddingVertical: 8,
    marginHorizontal: 10,
  },
});

export interface SearchByBrandProps
  extends NavigationScreenProps<{
    title: string;
    category_id: string;
    isTest?: boolean; // Ignoring for now
    movedFrom?: string;
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
  const [itemsLoading, setItemsLoading] = useState<{ [key: string]: boolean }>({});
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { addCartItem, removeCartItem, updateCartItem, cartItems } = useShoppingCart();
  const { cartItems: diagnosticCartItems } = useDiagnosticsCart();
  const { getPatientApiCall } = useAuth();
  const { showAphAlert, setLoading: globalLoading } = useUIElements();
  const { locationDetails, pharmacyLocation } = useAppCommonData();
  const pharmacyPincode = g(pharmacyLocation, 'pincode') || g(locationDetails, 'pincode');

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
        if (products.length < 10) {
          setEndReached(true);
        }
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

  const onAddCartItem = (item: MedicineProduct, suggestionItem?: boolean) => {
    const {
      sku,
      mou,
      name,
      price,
      special_price,
      is_prescription_required,
      thumbnail,
      type_id,
    } = item;
    suggestionItem && setItemsLoading({ ...itemsLoading, [sku]: true });
    addPharmaItemToCart(
      {
        id: sku,
        mou,
        name,
        price: price,
        specialPrice: special_price
          ? typeof special_price == 'string'
            ? Number(special_price)
            : special_price
          : undefined,
        prescriptionRequired: is_prescription_required == '1',
        isMedicine: type_id == 'Pharma',
        quantity: 1,
        thumbnail,
        isInStock: true,
      },
      pharmacyPincode!,
      addCartItem,
      globalLoading,
      props.navigation,
      currentPatient
    );
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
              style={{
                marginRight: 24,
              }}
              activeOpacity={1}
              onPress={() => setFilterVisible(true)}
            >
              <Filter />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                props.navigation.navigate(AppRoutes.MedAndTestCart);
              }}
            >
              <CartIcon />
              {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
            </TouchableOpacity>
          </View>
        }
        onPressLeftIcon={() => {
          try {
            const MoveDoctor = props.navigation.getParam('movedFrom') || '';

            console.log('MoveDoctor', MoveDoctor);
            if (MoveDoctor === 'registration') {
              props.navigation.dispatch(
                StackActions.reset({
                  index: 0,
                  key: null,
                  actions: [
                    NavigationActions.navigate({
                      routeName: AppRoutes.ConsultRoom,
                    }),
                  ],
                })
              );
            } else {
              props.navigation.goBack();
            }
          } catch (error) {}
        }}
      />
    );
  };

  const isNoResultsFound =
    searchSate != 'load' && searchText.length > 2 && medicineList.length == 0;

  const renderSorryMessage = isNoResultsFound ? (
    <Text style={styles.sorryTextStyle}>{`Hit enter to search for '${searchText}'`}</Text>
  ) : (
    <View
      style={{
        paddingBottom: 19,
      }}
    />
  );

  interface SuggestionType {
    sku: string;
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
    medicineProduct: MedicineProduct;
  }

  const renderSearchSuggestionItem = (data: SuggestionType) => {
    const isMedicineAddedToCart = cartItems.findIndex((item) => item.id == data.sku) != -1;
    const localStyles = StyleSheet.create({
      containerStyle: {
        ...data.style,
      },
      iconAndDetailsContainerStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 9.5,
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

    const onAddCartItem = (item: MedicineProduct) => {
      const {
        sku,
        mou,
        name,
        price,
        special_price,
        is_prescription_required,
        type_id,
        thumbnail,
      } = item;
      setItemsLoading({ ...itemsLoading, [sku]: true });
      addPharmaItemToCart(
        {
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
          isMedicine: type_id == 'Pharma',
          quantity: Number(1),
          thumbnail: thumbnail,
          isInStock: true,
        },
        pharmacyPincode!,
        addCartItem,
        null,
        props.navigation,
        currentPatient,
        () => setItemsLoading({ ...itemsLoading, [sku]: false })
      );
      postwebEngageAddToCartEvent(item, 'Pharmacy Partial Search');
    };

    const getItemQuantity = (id: string) => {
      const foundItem = cartItems.find((item) => item.id == id);
      return foundItem ? foundItem.quantity : 1;
    };

    const onNotifyMeClick = () => {
      showAphAlert!({
        title: 'Okay! :)',
        description: `You will be notified when ${data.name} is back in stock.`,
      });
    };

    const renderAddToCartView = () => {
      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() =>
            data.isOutOfStock
              ? onNotifyMeClick()
              : itemsLoading[data.sku]
              ? null
              : onAddCartItem(data.medicineProduct)
          }
        >
          <Text style={{ ...theme.viewStyles.text('SB', 12, '#fc9916', 1, 24, 0) }}>
            {data.isOutOfStock
              ? 'NOTIFY ME'
              : itemsLoading[data.sku]
              ? 'Loading...'
              : 'ADD TO CART'}
          </Text>
        </TouchableOpacity>
      );
    };

    const renderQuantityView = () => {
      return (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              getItemQuantity(data.sku) == 1
                ? onRemoveCartItem(data.sku)
                : onUpdateCartItem(data.sku, getItemQuantity(data.sku) - 1)
            }
          >
            <Text
              style={{
                ...theme.viewStyles.text('SB', 14, '#fc9916', 1, 24, 0),
                paddingRight: 12,
                paddingLeft: 3,
              }}
            >
              {'-'}
            </Text>
          </TouchableOpacity>
          <Text style={{ ...theme.viewStyles.text('B', 14, '#fc9916', 1, 24, 0) }}>
            {getItemQuantity(data.sku)}
          </Text>
          <TouchableOpacity
            style={{ marginRight: 20 }}
            activeOpacity={1}
            onPress={() =>
              getItemQuantity(data.sku) == 20
                ? null
                : onUpdateCartItem(data.sku, getItemQuantity(data.sku) + 1)
            }
          >
            <Text
              style={{ ...theme.viewStyles.text('SB', 14, '#fc9916', 1, 24, 0), paddingLeft: 12 }}
            >
              {'+'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    };

    const onUpdateCartItem = (id: string, quantity: number) => {
      updateCartItem && updateCartItem({ id, quantity: quantity });
    };

    const onRemoveCartItem = (id: string) => {
      removeCartItem && removeCartItem(id);
    };

    return (
      <MedicineSearchSuggestionItem
        onPress={() => {
          props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
            sku: item.sku,
          });
          resetSearchState();
        }}
        onPressAddToCart={() => {
          onAddCartItem(item, true);
        }}
        onPressNotify={() => {
          onNotifyMeClick(item.name);
        }}
        onPressAdd={() => {
          const q = getItemQuantity(item.sku);
          if (q == 20) return;
          onUpdateCartItem(item, getItemQuantity(item.sku) + 1);
        }}
        onPressSubstract={() => {
          const q = getItemQuantity(item.sku);
          q == 1 ? onRemoveCartItem(item) : onUpdateCartItem(item, q - 1);
        }}
        quantity={getItemQuantity(item.sku)}
        data={item}
        loading={itemsLoading[item.sku]}
        showSeparator={index !== medicineList.length - 1}
        style={{
          marginHorizontal: 20,
          paddingBottom: index == medicineList.length - 1 ? 10 : 0,
        }}
      />
    );
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
        const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_SEARCH_RESULTS] = {
          keyword: searchText,
          Source: 'Pharmacy Search',
        };
        postWebEngageEvent(WebEngageEventName.PHARMACY_SEARCH_RESULTS, eventAttributes);
        props.navigation.navigate(AppRoutes.SearchMedicineScene, { searchText });
        resetSearchState();
      }
    };
    const enableSearchEnterBtn = searchText.length > 2;
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

  const onNotifyMeClick = (name: string) => {
    showAphAlert!({
      title: 'Okay! :)',
      description: `You will be notified when ${name} is back in stock.`,
    });
  };
  const getItemQuantity = (id: string) => {
    const foundItem = cartItems.find((item) => item.id == id);
    return foundItem ? foundItem.quantity : 0;
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
        ? Number(medicine.special_price)
        : medicine.special_price
      : undefined;

    const isMedicineAddedToCart = cartItems.findIndex((item) => item.id == medicine.sku) != -1;

    return (
      <SearchMedicineCard
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
        quantity={getItemQuantity(medicine.sku)}
        onPressAdd={() => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Add item to cart');
          onAddCartItem(medicine);
        }}
        onPressRemove={() => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Remove item from cart');
          onRemoveCartItem(medicine);
        }}
        onNotifyMeClicked={() => {
          onNotifyMeClick(medicine.name);
        }}
        onPressAddQuantity={() =>
          getItemQuantity(medicine.sku) == 20
            ? null
            : onUpdateCartItem(medicine, getItemQuantity(medicine.sku) + 1)
        }
        onPressSubtractQuantity={() =>
          getItemQuantity(medicine.sku) == 1
            ? onRemoveCartItem(medicine)
            : onUpdateCartItem(medicine, getItemQuantity(medicine.sku) - 1)
        }
        onChangeUnit={(unit) => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Change unit in cart');
          onUpdateCartItem(medicine, unit);
        }}
        isMedicineAddedToCart={isMedicineAddedToCart}
        isCardExpanded={!!foundMedicineInCart}
        isInStock={medicine.is_in_stock}
        packOfCount={(medicine.mou && Number(medicine.mou)) || undefined}
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
        ? Number(special_price)
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
      filteredProductsList.sort((med1, med2) => {
        return (
          getSpecialPrice(med1.special_price || med1.price)! -
          getSpecialPrice(med2.special_price || med2.price)!
        );
      });
    } else if (sortBy == 'Price-H-L') {
      filteredProductsList.sort((med1, med2) => {
        return (
          getSpecialPrice(med2.special_price || med2.price)! -
          getSpecialPrice(med1.special_price || med1.price)!
        );
      });
    } else if (sortBy == 'A-Z') {
      filteredProductsList.sort((med1, med2) =>
        med1.name < med2.name ? -1 : med1.name > med2.name ? 1 : 0
      );
    } else if (sortBy == 'Z-A') {
      filteredProductsList.sort((med1, med2) =>
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
    const isNoResultsFound =
      searchSate != 'load' && searchText.length > 2 && medicineList.length == 0;
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
      (medicineList.length || searchSate == 'load' || isNoResultsFound) && (
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
                maxHeight: 266,
                backgroundColor: '#f7f8f5',
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
