import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { SectionHeader, Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import {
  CartIcon,
  InjectionIcon,
  MedicineIcon,
  MedicineRxIcon,
  NotificationIcon,
  SearchSendIcon,
  SyrupBottleIcon,
  TestsIcon,
  LocationOn,
  LocationOff,
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
  getNetStatus,
  getUserCurrentPosition,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import axios from 'axios';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { GET_MEDICINE_ORDERS_LIST } from '@aph/mobile-patients/src/graphql/profiles';
import {
  GetMedicineOrdersList,
  GetMedicineOrdersListVariables,
} from '@aph/mobile-patients/src/graphql/types/GetMedicineOrdersList';
import {
  Doseform,
  getMedicinePageProducts,
  getMedicineSearchSuggestionsApi,
  MedicinePageAPiResponse,
  MedicineProduct,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import {
  Dimensions,
  Keyboard,
  ListRenderItemInfo,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  PermissionsAndroid,
  Platform,
  AsyncStorage,
} from 'react-native';
import { Image, Input } from 'react-native-elements';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';

const styles = StyleSheet.create({
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
  imagePlaceholderStyle: {
    backgroundColor: '#f7f8f5',
    opacity: 0.5,
    borderRadius: 5,
  },
});
const key = 'AIzaSyDzbMikhBAUPlleyxkIS9Jz7oYY2VS8Xps';

export type locationType = { lat: string; lng: string };

export interface TestsProps extends NavigationScreenProps {}

export const Tests: React.FC<TestsProps> = (props) => {
  const config = AppConfig.Configuration;
  const { cartItems, addCartItem, removeCartItem } = useDiagnosticsCart();
  const cartItemsCount = cartItems.length;
  const { currentPatient } = useAllCurrentPatients();
  const { showAphAlert } = useUIElements();

  useEffect(() => {
    getMedicinePageProducts()
      .then((d) => {
        setData(d.data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e);
        setLoading(false);
        showAphAlert!({
          title: 'Uh oh! :(',
          description: "We're unable to fetch products, try later.",
        });
      });
  }, []);

  useEffect(() => {
    Platform.OS === 'android' && requestLocationPermission();
    getNetStatus().then((status) => {
      if (status) {
        fetchCurrentLocation();
        // fetchSpecialityFilterData(filterMode, FilterData);
      } else {
        setLoading(false);
        setError(true);
      }
    });
  }, []);
  const [data, setData] = useState<MedicinePageAPiResponse>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [currentLocation, setcurrentLocation] = useState<string>('');
  const [showLocationpopup, setshowLocationpopup] = useState<boolean>(false);
  const [locationSearchList, setlocationSearchList] = useState<{ name: string; placeId: string }[]>(
    []
  );

  const offerBanner = (g(data, 'mainbanners') || [])[0];
  const offerBannerImage = ''; //g(offerBanner, 'image');
  const shopByCategory = g(data, 'shop_by_category') || [];
  const hotSellers = g(data, 'hot_sellers', 'products') || [];
  let latlng: locationType | null = null;

  const { data: orders, error: ordersError, loading: ordersLoading } = useQuery<
    GetMedicineOrdersList,
    GetMedicineOrdersListVariables
  >(GET_MEDICINE_ORDERS_LIST, {
    variables: { patientId: currentPatient && currentPatient.id },
    fetchPolicy: 'no-cache',
  });

  const _orders =
    (!ordersLoading && g(orders, 'getMedicineOrdersList', 'MedicineOrdersList')) || [];

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the location');
        fetchCurrentLocation();
      } else {
        console.log('location permission denied');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCurrentLocation = () => {
    getUserCurrentPosition()
      .then((res: any) => {
        res.name && setcurrentLocation(res.name.toUpperCase());
        // fetchSpecialityFilterData(filterMode, FilterData, res.latlong);
        latlng = res.latlong;
        console.log(res, 'getUserCurrentPosition');
      })
      .catch((error) => console.log(error, 'getUserCurrentPosition err'));
  };

  // Common Views

  const renderSectionLoader = (height: number = 100) => {
    return <Spinner style={{ height, position: 'relative', backgroundColor: 'transparent' }} />;
  };

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const autoSearch = (searchText: string) => {
    getNetStatus().then((status) => {
      if (status) {
        axios
          .get(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${searchText}&key=${key}`
          )
          .then((obj) => {
            try {
              if (obj.data.predictions) {
                const address = obj.data.predictions.map(
                  (item: {
                    place_id: string;
                    structured_formatting: {
                      main_text: string;
                    };
                  }) => {
                    return { name: item.structured_formatting.main_text, placeId: item.place_id };
                  }
                );
                setlocationSearchList(address);
              }
            } catch {}
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  const saveLatlong = (item: { name: string; placeId: string }) => {
    getNetStatus().then((status) => {
      if (status) {
        axios
          .get(
            `https://maps.googleapis.com/maps/api/place/details/json?placeid=${item.placeId}&key=${key}`
          )
          .then((obj) => {
            try {
              if (obj.data.result.geometry && obj.data.result.geometry.location) {
                AsyncStorage.setItem(
                  'location',
                  JSON.stringify({ latlong: obj.data.result.geometry.location, name: item.name })
                );
                // setlatlng(obj.data.result.geometry.location);
                latlng = obj.data.result.geometry.location;
                // setLoading(true);
                // fetchSpecialityFilterData(filterMode, FilterData, latlng);
              }
            } catch (error) {
              console.log(error);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  const renderPopup = () => {
    if (showLocationpopup) {
      return (
        <TouchableOpacity
          activeOpacity={1}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            zIndex: 15,
            elevation: 15,
          }}
          onPress={() => setshowLocationpopup(false)}
        >
          <View
            style={{
              ...theme.viewStyles.cardViewStyle,
              width: 235,
              padding: 16,
              marginTop: 40,
            }}
          >
            <Text
              style={{
                color: theme.colors.CARD_HEADER,
                ...theme.fonts.IBMPlexSansMedium(14),
              }}
            >
              Current Location
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 7 }}>
                <TextInputComponent
                  value={currentLocation}
                  onChangeText={(value) => {
                    setcurrentLocation(value);
                    autoSearch(value);
                  }}
                />
              </View>
              <View
                style={{
                  marginLeft: 20,
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <LocationOn />
              </View>
            </View>
            <View>
              {locationSearchList.map((item, i) => (
                <View
                  key={i}
                  style={{
                    borderBottomWidth: 0.5,
                    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
                    paddingVertical: 7,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.LIGHT_BLUE,
                      ...theme.fonts.IBMPlexSansMedium(18),
                    }}
                    onPress={() => {
                      setcurrentLocation(item.name);
                      saveLatlong(item);
                      setshowLocationpopup(false);
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const renderLocation = () => {
    return (
      <View style={{ flexDirection: 'row', right: 35 }}>
        {currentLocation === '' ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              getNetStatus().then((status) => {
                if (status) {
                  setshowLocationpopup(true);
                  fetchCurrentLocation();
                } else {
                  setError(true);
                }
              });
            }}
          >
            <LocationOff />
          </TouchableOpacity>
        ) : (
          <View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setshowLocationpopup(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {currentLocation ? (
                <Text
                  style={{
                    color: theme.colors.SHERPA_BLUE,
                    ...theme.fonts.IBMPlexSansSemiBold(13),
                    textTransform: 'uppercase',
                  }}
                >
                  {currentLocation}
                </Text>
              ) : null}
              <LocationOn />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderTopView = () => {
    return (
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          paddingTop: 16,
          paddingHorizontal: 20,
          backgroundColor: theme.colors.WHITE,
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => props.navigation.replace(AppRoutes.ConsultRoom)}
        >
          <ApolloLogo />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          {renderLocation()}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              props.navigation.navigate(AppRoutes.MedAndTestCart, { isComingFromConsult: true })
            }
            style={{ right: 20 }}
          >
            <CartIcon />
            {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
          </TouchableOpacity>
          <NotificationIcon />
        </View>
      </View>
    );
  };

  const [imgHeight, setImgHeight] = useState(120);
  const { width: winWidth } = Dimensions.get('window');
  const renderOfferBanner = () => {
    if (offerBannerImage)
      return (
        <Image
          placeholderStyle={styles.imagePlaceholderStyle}
          onLoad={(value) => {
            const { height, width } = value.nativeEvent.source;
            setImgHeight(height * (winWidth / width));
          }}
          style={{ width: '100%', minHeight: imgHeight }}
          source={{ uri: `${config.IMAGES_BASE_URL[0]}${offerBannerImage}` }}
        />
      );
  };

  const renderYourOrders = () => {
    return (
      (!ordersLoading && _orders.length > 0 && (
        <ListCard
          onPress={() => props.navigation.navigate(AppRoutes.YourOrdersScene)}
          container={{ marginBottom: 24, marginTop: 20 }}
          title={'Your Orders'}
          leftIcon={<TestsIcon />}
        />
      )) || <View style={{ height: 24 }} />
    );
  };

  const renderCatalogCard = (
    text: string,
    imgUrl: string,
    onPress: () => void,
    style?: ViewStyle
  ) => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={onPress}>
        <View
          style={[
            {
              ...theme.viewStyles.card(12, 0),
              elevation: 10,
              flexDirection: 'row',
              width: 152,
              height: 68,
            },
            style,
          ]}
        >
          <Image
            source={{ uri: imgUrl }}
            style={{
              height: 40,
              width: 40,
            }}
          />
          <View style={{ width: 16 }} />
          <Text
            numberOfLines={2}
            style={{
              flex: 1,
              ...theme.viewStyles.text('M', 14, '#01475b', 1, 20, 0),
            }}
          >
            {text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const hotSellerCard = (data: {
    name: string;
    imgUrl: string;
    price: number;
    specialPrice?: number;
    isAddedToCart: boolean;
    onAddOrRemoveCartItem: () => void;
    onPress: () => void;
    style?: ViewStyle;
  }) => {
    const { name, imgUrl, price, specialPrice, style } = data;

    const renderDiscountedPrice = () => {
      const styles = StyleSheet.create({
        discountedPriceText: {
          ...theme.viewStyles.text('M', 14, '#02475b', 0.4, 24),
          textAlign: 'center',
        },
        priceText: {
          ...theme.viewStyles.text('SB', 14, '#01475b', 1, 24),
          textAlign: 'center',
        },
      });
      return (
        <View style={[{ flexDirection: 'row', marginBottom: 8 }]}>
          <Text style={[styles.priceText, { marginRight: 4 }]}>Rs. {specialPrice || price}</Text>
          {!!specialPrice && (
            <Text style={styles.discountedPriceText}>
              (<Text style={[{ textDecorationLine: 'line-through' }]}>Rs. {price}</Text>)
            </Text>
          )}
        </View>
      );
    };

    return (
      <TouchableOpacity activeOpacity={1} onPress={data.onPress}>
        <View
          style={{
            ...theme.viewStyles.card(12, 0),
            elevation: 10,
            height: 188,
            width: 152,
            marginHorizontal: 4,
            alignItems: 'center',
            ...style,
          }}
        >
          <Image
            placeholderStyle={styles.imagePlaceholderStyle}
            source={{ uri: imgUrl }}
            style={{ height: 40, width: 40, marginBottom: 8 }}
          />
          <View style={{ height: 47.5 }}>
            <Text
              style={{
                ...theme.viewStyles.text('M', 14, '#01475b', 1, 20),
                textAlign: 'center',
              }}
              numberOfLines={2}
            >
              {name}
            </Text>
          </View>
          <Spearator style={{ marginBottom: 7.5 }} />
          {renderDiscountedPrice()}
          <Text
            style={{
              ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
              textAlign: 'center',
            }}
            onPress={data.onAddOrRemoveCartItem}
          >
            {data.isAddedToCart ? 'REMOVE' : 'ADD TO CART'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHotSellerItem = (data: ListRenderItemInfo<MedicineProduct>) => {
    const {
      sku,
      is_prescription_required,
      name,
      mou,
      special_price,
      price,
      image,
      thumbnail,
    } = data.item;
    const addToCart = () =>
      addCartItem!({
        id: sku,
        mou: mou,
        name: name,
        price: specialPrice,
        thumbnail,
      });
    const removeFromCart = () => removeCartItem!(sku);
    const foundMedicineInCart = !!cartItems.find((item) => item.id == sku);
    const specialPrice = special_price
      ? typeof special_price == 'string'
        ? parseInt(special_price)
        : special_price
      : price;

    return hotSellerCard({
      name,
      imgUrl: `${config.IMAGES_BASE_URL[0]}${image}`,
      price,
      specialPrice: special_price
        ? typeof special_price == 'string'
          ? parseInt(special_price)
          : special_price
        : undefined,
      isAddedToCart: foundMedicineInCart,
      onAddOrRemoveCartItem: foundMedicineInCart ? removeFromCart : addToCart,
      onPress: () => props.navigation.navigate(AppRoutes.TestDetails, { sku }),
      style: {
        marginHorizontal: 4,
        marginTop: 16,
        marginBottom: 20,
        ...(data.index == 0 ? { marginLeft: 20 } : {}),
      },
    });
  };

  const renderHotSellers = () => {
    return (
      <View>
        <SectionHeader leftText={'HOT SELLERS'} />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={hotSellers}
          renderItem={renderHotSellerItem}
        />
      </View>
    );
  };

  const renderBrowseByCondition = () => {
    return (
      <View>
        <SectionHeader leftText={'BROWSE BY CONDITION'} />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={shopByCategory}
          renderItem={({ item, index }) => {
            return renderCatalogCard(
              item.title,
              `${config.IMAGES_BASE_URL[0]}${item.image_url}`,
              () =>
                props.navigation.navigate(AppRoutes.SearchByBrand, {
                  category_id: item.category_id,
                  title: `${item.title || 'Products'}`.toUpperCase(),
                }),
              {
                marginHorizontal: 4,
                marginTop: 16,
                marginBottom: 20,
                ...(index == 0 ? { marginLeft: 20 } : {}),
              }
            );
          }}
        />
      </View>
    );
  };

  const renderPackageCard = (
    title: string,
    subtitle: string,
    desc: string,
    price: number,
    specialPrice: number,
    style: ViewStyle
  ) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[
          {
            width: Dimensions.get('window').width * 0.86,
            ...theme.viewStyles.card(16, 4, 10, '#fff', 10),
            paddingVertical: 12,
          },
          style,
        ]}
      >
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flexGrow: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: Dimensions.get('window').width * 0.4 }}>
              <Text style={theme.viewStyles.text('SB', 16, '#02475b', 1, 24)}>{title}</Text>
              <View style={{ height: 8 }} />
              <Text style={theme.viewStyles.text('M', 10, '#02475b', 1, undefined, 0.25)}>
                {subtitle}
              </Text>
              <View style={{ height: 16 }} />
              <Text style={theme.viewStyles.text('M', 14, '#0087ba', 1, 22)}>{desc}</Text>
            </View>
            <View style={{}}>
              <Image
                source={{ uri: 'https://via.placeholder.com/120', height: 120, width: 120 }}
                style={{ borderRadius: 5 }}
              />
            </View>
          </View>
        </View>
        <Spearator style={{ marginVertical: 11.5 }} />

        <View style={{ flexDirection: 'row', flex: 1 }}>
          <View style={{ flexGrow: 1, flexDirection: 'row' }}>
            <Text style={{ marginRight: 8, ...theme.viewStyles.text('SB', 14, '#02475b', 1, 24) }}>
              Rs. {specialPrice}
            </Text>
            {!!specialPrice && (
              <Text
                style={{
                  ...theme.viewStyles.text('SB', 14, '#02475b', 0.6, 24),
                  textAlign: 'center',
                }}
              >
                (<Text style={[{ textDecorationLine: 'line-through' }]}>Rs. {price}</Text>)
              </Text>
            )}
          </View>
          <View style={{ flexGrow: 1, alignItems: 'flex-end' }}>
            <Text style={theme.viewStyles.text('B', 13, '#fc9916', 1, 24)}>{'BOOK NOW'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const packages = [
    ...Array.from({ length: 10 }).map(() => ({
      title: 'Basic Diabetic Screening Checkup',
      subtitle: '66 TESTS INCLUDED',
      desc: 'Ideal for individuals between 20-40 years.',
      specialPrice: 1599,
      price: 2000,
    })),
  ];

  const renderTestPackages = () => {
    return (
      <View>
        <SectionHeader leftText={'BROWSE PACKAGES'} />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={packages}
          renderItem={({ item, index }) => {
            return renderPackageCard(
              item.title,
              item.subtitle,
              item.desc,
              item.price,
              item.specialPrice,
              {
                marginHorizontal: 4,
                marginTop: 16,
                marginBottom: 20,
                ...(index == 0 ? { marginLeft: 20 } : {}),
              }
            );
          }}
        />
      </View>
    );
  };

  const preventiveTestCard = (name: string, price: number, style: ViewStyle) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[{ ...theme.viewStyles.card(16, 4, 10, '#fff', 10), paddingBottom: 12 }, style]}
      >
        <Text style={theme.viewStyles.text('M', 14, '#01475b', 1, 22)}>{name}</Text>
        <Spearator style={{ marginVertical: 7.5 }} />
        <Text style={theme.viewStyles.text('B', 14, '#01475b', 1, 20)}>Rs. {price}</Text>
      </TouchableOpacity>
    );
  };

  const renderPreventiveTests = () => {
    const preventiveTests = Array.from({ length: 10 }).map((_) => ({
      name: 'Blood Glucose Test',
      price: 120,
    }));

    return (
      <View>
        <SectionHeader leftText={'SOME PREVENTIVE TESTS FOR YOU'} />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={preventiveTests}
          renderItem={({ item, index }) => {
            return preventiveTestCard(item.name, item.price, {
              marginHorizontal: 4,
              marginTop: 16,
              marginBottom: 20,
              ...(index == 0 ? { marginLeft: 20 } : {}),
            });
          }}
        />
      </View>
    );
  };

  const renderTestsByOrgan = () => {
    return (
      <View>
        <SectionHeader leftText={'BROWSE TESTS BY ORGANS'} />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={shopByCategory}
          renderItem={({ item, index }) => {
            return renderCatalogCard(
              item.title,
              `${config.IMAGES_BASE_URL[0]}${item.image_url}`,
              () =>
                props.navigation.navigate(AppRoutes.SearchByBrand, {
                  category_id: item.category_id,
                  title: `${item.title || 'Products'}`.toUpperCase(),
                }),
              {
                // marginRight: 8,
                marginHorizontal: 4,
                marginTop: 16,
                marginBottom: 20,
                ...(index == 0 ? { marginLeft: 20 } : {}),
              }
            );
          }}
        />
      </View>
    );
  };

  const renderNeedHelp = () => {
    return (
      <NeedHelpAssistant
        navigation={props.navigation}
        containerStyle={{
          paddingBottom: 20,
          paddingTop: 20,
        }}
      />
    );
  };

  const [searchText, setSearchText] = useState<string>('');
  const [medicineList, setMedicineList] = useState<MedicineProduct[]>([]);
  const [searchSate, setsearchSate] = useState<'load' | 'success' | 'fail' | undefined>();
  const [isSearchFocused, setSearchFocused] = useState(false);

  const onSearchMedicine = (_searchText: string) => {
    setSearchText(_searchText);
    if (!(_searchText && _searchText.length > 2)) {
      setMedicineList([]);
      return;
    }
    setsearchSate('load');
    getMedicineSearchSuggestionsApi(_searchText)
      .then(({ data }) => {
        // aphConsole.log({ data });
        const products = data.products || [];
        setMedicineList(products);
        setsearchSate('success');
      })
      .catch((e) => {
        // aphConsole.log({ e });
        if (!Axios.isCancel(e)) {
          setsearchSate('fail');
        }
      });
  };

  interface SuggestionType {
    name: string;
    price: number;
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
            style={{ ...theme.viewStyles.text('M', 16, '#01475b', 1, 24, 0) }}
          >
            {data.name}
          </Text>
          {data.isOutOfStock ? (
            <Text style={{ ...theme.viewStyles.text('M', 12, '#890000', 1, 20, 0.04) }}>
              {'Out Of Stock'}
            </Text>
          ) : (
            <Text style={{ ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0.04) }}>
              Rs. {data.price}
            </Text>
          )}
        </View>
      );
    };

    const renderIconOrImage = () => {
      return (
        <View style={localStyles.iconOrImageContainerStyle}>
          {data.imgUri ? (
            <Image
              placeholderStyle={styles.imagePlaceholderStyle}
              source={{ uri: data.imgUri }}
              style={{ height: 40, width: 40 }}
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
            <View style={{ width: 16 }} />
            {renderNamePriceAndInStockStatus()}
          </View>
          {data.showSeparator ? <Spearator /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSearchBar = () => {
    const styles = StyleSheet.create({
      inputStyle: {
        minHeight: 29,
        ...theme.fonts.IBMPlexSansMedium(18),
      },
      inputContainerStyle: {
        borderBottomColor: '#00b38e',
        borderBottomWidth: 2,
        marginHorizontal: 10,
      },
      rightIconContainerStyle: {
        height: 24,
      },
      style: {
        paddingBottom: 18.5,
      },
      containerStyle: {
        marginBottom: 19,
        marginTop: 18,
      },
    });

    const shouldEnableSearchSend = searchText.length > 2 && medicineList.length > 0;
    const rigthIconView = (
      <TouchableOpacity
        activeOpacity={1}
        style={{
          opacity: shouldEnableSearchSend ? 1 : 0.4,
        }}
        disabled={!shouldEnableSearchSend}
        onPress={() => {
          props.navigation.navigate(AppRoutes.SearchMedicineScene, {
            searchText: searchText,
            isTest: true,
          });
          setSearchText('');
          setMedicineList([]);
        }}
      >
        <SearchSendIcon />
      </TouchableOpacity>
    );

    const itemsNotFound =
      searchSate == 'success' && searchText.length > 2 && medicineList.length == 0;

    return (
      <>
        <Input
          onSubmitEditing={() => {
            if (searchText.length > 2) {
              props.navigation.navigate(AppRoutes.SearchMedicineScene, {
                searchText: searchText,
                isTest: true,
              });
            }
          }}
          value={searchText}
          autoCapitalize="none"
          spellCheck={false}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => {
            setSearchFocused(false);
            setMedicineList([]);
            setSearchText('');
            setsearchSate('success');
          }}
          onChangeText={(value) => {
            onSearchMedicine(value);
          }}
          autoCorrect={false}
          rightIcon={rigthIconView}
          placeholder="Search tests &amp; packages"
          selectionColor={itemsNotFound ? '#890000' : '#00b38e'}
          underlineColorAndroid="transparent"
          placeholderTextColor="rgba(1,48,91, 0.4)"
          inputStyle={styles.inputStyle}
          inputContainerStyle={[
            styles.inputContainerStyle,
            itemsNotFound ? { borderBottomColor: '#890000' } : {},
          ]}
          rightIconContainerStyle={styles.rightIconContainerStyle}
          style={styles.style}
          containerStyle={styles.containerStyle}
          errorStyle={{
            ...theme.viewStyles.text('M', 12, '#890000'),
            marginHorizontal: 10,
          }}
          errorMessage={
            itemsNotFound ? 'Sorry, we couldn’t find what you are looking for :(' : undefined
          }
        />
      </>
    );
  };

  const renderSearchSuggestionItemView = (data: ListRenderItemInfo<MedicineProduct>) => {
    const { index, item } = data;
    const imgUri = item.thumbnail ? `${config.IMAGES_BASE_URL[0]}${item.thumbnail}` : '';
    return renderSearchSuggestionItem({
      onPress: () => {
        props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
          sku: item.sku,
        });
      },
      name: item.name,
      price: item.price,
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

  const renderSearchSuggestions = () => {
    // if (medicineList.length == 0) return null;
    return (
      <View style={{ width: '100%', position: 'absolute' }}>
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
                paddingTop: 10.5,
                maxHeight: 266,
                backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
              }}
              data={medicineList}
              renderItem={renderSearchSuggestionItemView}
            />
          )
        )}
      </View>
    );
  };

  const renderSearchBarAndSuggestions = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          Keyboard.dismiss();
        }}
        style={[
          (searchSate == 'success' || searchSate == 'fail') && medicineList.length == 0
            ? {
                height: '100%',
                width: '100%',
              }
            : searchText.length > 2
            ? {
                height: '100%',
                width: '100%',
                backgroundColor: 'rgba(0,0,0,0.8)',
              }
            : {},
        ]}
      >
        {renderSearchSuggestions()}
      </TouchableOpacity>
    );
  };

  const renderSections = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (medicineList.length == 0 && !searchText) return;
          setSearchText('');
          setMedicineList([]);
        }}
        style={{ flex: 1 }}
      >
        {renderOfferBanner()}
        {renderYourOrders()}
        {loading
          ? renderSectionLoader()
          : !error && (
              <>
                {renderHotSellers()}
                {renderBrowseByCondition()}
                {renderTestPackages()}
                {renderTestsByOrgan()}
                {renderPreventiveTests()}
              </>
            )}
        {renderNeedHelp()}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...viewStyles.container }}>
        {renderTopView()}
        <ScrollView
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          bounces={false}
          stickyHeaderIndices={[1]}
          contentContainerStyle={[
            isSearchFocused && searchText.length > 2 && medicineList.length > 0 ? { flex: 1 } : {},
          ]}
        >
          <Text
            style={{
              height: isSearchFocused ? 0 : 'auto',
              ...theme.viewStyles.text('SB', 36, '#02475b', 1),
              paddingTop: 20,
              backgroundColor: '#fff',
              paddingHorizontal: 20,
            }}
          >
            {(currentPatient &&
              currentPatient.firstName &&
              `hi ${currentPatient.firstName.toLowerCase()}!`) ||
              ''}
          </Text>

          <View style={[isSearchFocused ? { flex: 1 } : {}]}>
            <View style={{ backgroundColor: 'white' }}>{renderSearchBar()}</View>
            {renderSearchBarAndSuggestions()}
          </View>
          <View style={[isSearchFocused && searchText.length > 2 ? { height: 0 } : {}]}>
            {renderSections()}
          </View>
        </ScrollView>
      </SafeAreaView>
      {renderPopup()}
    </View>
  );
};
