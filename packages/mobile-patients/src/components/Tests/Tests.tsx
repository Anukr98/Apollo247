import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { AddProfile } from '@aph/mobile-patients/src/components/ui/AddProfile';
import { SectionHeader, Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  CartIcon,
  DropdownGreen,
  LocationOff,
  LocationOn,
  NotificationIcon,
  SearchSendIcon,
  TestsIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  GET_DIAGNOSTICS_CITES,
  GET_DIAGNOSTIC_DATA,
  GET_DIAGNOSTIC_ORDER_LIST,
  SEARCH_DIAGNOSTICS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import {
  getDiagnosticsCites,
  getDiagnosticsCitesVariables,
  getDiagnosticsCites_getDiagnosticsCites_diagnosticsCities,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticsCites';
import {
  searchDiagnostics,
  searchDiagnosticsVariables,
  searchDiagnostics_searchDiagnostics_diagnostics,
} from '@aph/mobile-patients/src/graphql/types/searchDiagnostics';
import {
  autoCompletePlaceSearch,
  getPlaceInfoByPlaceId,
  getTestsPackages,
  GooglePlacesType,
  TestPackage,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  aphConsole,
  doRequestAndAccessLocation,
  g,
  getNetStatus,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import React, { useEffect, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
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
} from 'react-native';
import { Image, Input } from 'react-native-elements';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import {
  getDiagnosticOrdersList,
  getDiagnosticOrdersListVariables,
} from '../../graphql/types/getDiagnosticOrdersList';
import {
  getDiagnosticsData,
  getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers,
  getDiagnosticsData_getDiagnosticsData_diagnosticOrgans,
} from '../../graphql/types/getDiagnosticsData';
import { TEST_COLLECTION_TYPE } from '../../graphql/types/globalTypes';
import { BottomPopUp } from '../ui/BottomPopUp';
import { TestPackageForDetails } from './TestDetails';

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
  hiTextStyle: {
    marginLeft: 20,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  nameTextStyle: {
    marginLeft: 5,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  seperatorStyle: {
    height: 2,
    backgroundColor: '#00b38e',
    marginTop: 5,
    marginHorizontal: 5,
  },
  gotItStyles: {
    height: 60,
    paddingRight: 25,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
});

export interface TestsProps extends NavigationScreenProps {}

export const Tests: React.FC<TestsProps> = (props) => {
  const { cartItems, addCartItem, removeCartItem } = useDiagnosticsCart();
  const cartItemsCount = cartItems.length;
  const { currentPatient } = useAllCurrentPatients();
  // const [data, setData] = useState<MedicinePageAPiResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [currentLocation, setcurrentLocation] = useState<string>('');
  const [showLocationpopup, setshowLocationpopup] = useState<boolean>(false);
  const [locationSearchList, setlocationSearchList] = useState<{ name: string; placeId: string }[]>(
    []
  );
  const [displayAddProfile, setDisplayAddProfile] = useState<boolean>(false);
  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>(
    currentPatient!
  );

  const { data: diagnosticsData, error: hError, loading: hLoading } = useQuery<getDiagnosticsData>(
    GET_DIAGNOSTIC_DATA,
    {
      variables: {},
      fetchPolicy: 'no-cache',
    }
  );
  const [errorPopUp, setErrorPopUp] = useState<boolean>(false);

  const { showAphAlert, hideAphAlert, setLoading: setLoadingContext } = useUIElements();
  const {
    locationDetails,
    setLocationDetails,
    setDiagnosticsCities,
    locationForDiagnostics,
  } = useAppCommonData();

  const [testPackages, setTestPackages] = useState<TestPackage[]>([]);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    console.log(locationDetails, 'locationDetails');
    locationDetails && setcurrentLocation(locationDetails.displayName);
  }, [locationDetails]);

  useEffect(() => {
    if (locationDetails && locationDetails.city) {
      client
        .query<getDiagnosticsCites, getDiagnosticsCitesVariables>({
          query: GET_DIAGNOSTICS_CITES,
          variables: {
            cityName: locationDetails.city,
            patientId: (currentPatient && currentPatient.id) || '',
          },
        })
        .then(({ data }) => {
          aphConsole.log('getDiagnosticsCites\n', { data });
          const cities = g(data, 'getDiagnosticsCites', 'diagnosticsCities') || [];
          setDiagnosticsCities!(
            cities as getDiagnosticsCites_getDiagnosticsCites_diagnosticsCities[]
          );
        })
        .catch((e) => {
          aphConsole.log('getDiagnosticsCites Error\n', { e });
          showAphAlert!({
            unDismissable: true,
            title: 'Uh oh! :(',
            description: 'Something went wrong.',
          });
        });
    }
  }, [locationDetails]);

  useEffect(() => {
    !locationDetails &&
      showAphAlert!({
        unDismissable: true,
        title: 'Hi! :)',
        description:
          'We need to know your location to function better. Please allow us to auto detect your location or enter location manually.',
        children: (
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: 20,
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginVertical: 18,
            }}
          >
            <Button
              style={{
                flex: 1,
                marginRight: 16,
              }}
              title={'ENTER MANUALY'}
              onPress={() => {
                hideAphAlert!();
                setshowLocationpopup(true);
              }}
            />
            <Button
              style={{ flex: 1 }}
              title={'ALLOW AUTO DETECT'}
              onPress={() => {
                hideAphAlert!();
                setLoadingContext!(true);
                doRequestAndAccessLocation()
                  .then((response) => {
                    //console.log('response', { response });
                    setLocationDetails!(response);
                  })
                  .catch((e) => {
                    showAphAlert!({
                      title: 'Uh oh! :(',
                      description: 'Unable to access location.',
                    });
                    setLocationError(true);
                    setshowLocationpopup(true);
                  })
                  .finally(() => {
                    setLoadingContext!(false);
                  });
              }}
            />
          </View>
        ),
      });
  }, [locationDetails]);

  useEffect(() => {
    console.log(
      'locationForDiagnosticslength',
      locationForDiagnostics && locationForDiagnostics.cityId
    );

    if (locationForDiagnostics && locationForDiagnostics.cityId) {
      setLoading(true);
      getTestsPackages(locationForDiagnostics.cityId, locationForDiagnostics.stateId)
        .then(({ data }) => {
          aphConsole.log('getTestsPackages\n', { data });
          setTestPackages(g(data, 'data') || []);
        })
        .catch((e) => {
          aphConsole.log('getTestsPackages Error\n', { e });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setTestPackages([]);
    }
  }, [locationForDiagnostics && locationForDiagnostics.cityId]);

  const hotSellers = (g(diagnosticsData, 'getDiagnosticsData', 'diagnosticHotSellers') ||
    []) as getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers[];

  const shopByOrgans = (g(diagnosticsData, 'getDiagnosticsData', 'diagnosticOrgans') ||
    []) as getDiagnosticsData_getDiagnosticsData_diagnosticOrgans[];

  const { data: orders, error: ordersError, loading: ordersLoading } = useQuery<
    getDiagnosticOrdersList,
    getDiagnosticOrdersListVariables
  >(GET_DIAGNOSTIC_ORDER_LIST, {
    variables: {
      patientId: currentPatient && currentPatient.id,
    },
    fetchPolicy: 'no-cache',
  });

  const _orders = (!ordersLoading && g(orders, 'getDiagnosticOrdersList', 'ordersList')) || [];

  // Common Views

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
        autoCompletePlaceSearch(searchText)
          .then((obj) => {
            console.log({});

            try {
              if (obj.data.predictions) {
                const address = obj.data.predictions.map(
                  (item: {
                    place_id: string;
                    structured_formatting: {
                      main_text: string;
                    };
                  }) => {
                    return {
                      name: item.structured_formatting.main_text,
                      placeId: item.place_id,
                    };
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

  const findAddrComponents = (
    proptoFind: GooglePlacesType,
    addrComponents: {
      long_name: string;
      short_name: string;
      types: GooglePlacesType[];
    }[]
  ) => {
    return (
      (addrComponents.find((item) => item.types.indexOf(proptoFind) > -1) || {}).long_name || ''
    );
  };

  const saveLatlong = (item: { name: string; placeId: string }) => {
    console.log('placeId\n', {
      placeId: item.placeId,
    });
    // update address to context here
    getPlaceInfoByPlaceId(item.placeId)
      .then((response) => {
        const addrComponents = g(response, 'data', 'result', 'address_components') || [];
        const { lat, lng } = g(response, 'data', 'result', 'geometry', 'location')! || {};

        if (addrComponents.length > 0) {
          setLocationDetails!({
            displayName: item.name,
            latitude: lat,
            longitude: lng,
            area: [
              findAddrComponents('route', addrComponents),
              findAddrComponents('sublocality_level_2', addrComponents),
              findAddrComponents('sublocality_level_1', addrComponents),
            ]
              .filter((i) => i)
              .join(', '),
            city:
              findAddrComponents('locality', addrComponents) ||
              findAddrComponents('administrative_area_level_2', addrComponents),
            state: findAddrComponents('administrative_area_level_1', addrComponents),
            country: findAddrComponents('country', addrComponents),
            pincode: findAddrComponents('postal_code', addrComponents),
            lastUpdated: new Date().getTime(),
          });
        }
      })
      .catch((error) => {
        console.log('saveLatlong error\n', error);
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
                      setshowLocationpopup(false);
                      saveLatlong(item);
                      setLocationDetails!({
                        displayName: item.name,
                        city: item.name,
                      } as any);
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
      <View
        style={{
          flexDirection: 'row',
          right: 35,
        }}
      >
        {!locationDetails ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              getNetStatus().then((status) => {
                if (status) {
                  setshowLocationpopup(true);
                  // fetchCurrentLocation();
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
              {locationDetails ? (
                <Text
                  style={{
                    color: theme.colors.SHERPA_BLUE,
                    ...theme.fonts.IBMPlexSansSemiBold(13),
                    textTransform: 'uppercase',
                  }}
                >
                  {locationDetails.displayName && locationDetails.displayName.substring(0, 15)}
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

  // const [imgHeight, setImgHeight] = useState(120);
  // const { width: winWidth } = Dimensions.get('window');
  // const renderOfferBanner = () => {
  //   if (offerBannerImage)
  //     return (
  //       <Image
  //         placeholderStyle={styles.imagePlaceholderStyle}
  //         onLoad={(value) => {
  //           const { height, width } = value.nativeEvent.source;
  //           setImgHeight(height * (winWidth / width));
  //         }}
  //         style={{ width: '100%', minHeight: imgHeight }}
  //         source={{ uri: `${config.IMAGES_BASE_URL[0]}${offerBannerImage}` }}
  //       />
  //     );
  // };

  const renderYourOrders = () => {
    return (
      (!ordersLoading && _orders.length > 0 && (
        <ListCard
          onPress={() => props.navigation.navigate(AppRoutes.YourOrdersTest, { isTest: true })}
          container={{
            marginBottom: 24,
            marginTop: 20,
          }}
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
        <View
          style={[
            {
              flexDirection: 'row',
              marginBottom: 8,
            },
          ]}
        >
          <Text style={[styles.priceText, { marginRight: 4 }]}>Rs. {specialPrice || price}</Text>
          {!!specialPrice && (
            <Text style={styles.discountedPriceText}>
              (
              <Text
                style={[
                  {
                    textDecorationLine: 'line-through',
                  },
                ]}
              >
                Rs. {price}
              </Text>
              )
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
            style={{
              height: 40,
              width: 40,
              marginBottom: 8,
            }}
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

  const renderHotSellerItem = (
    data: ListRenderItemInfo<getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers>
  ) => {
    const { id, packageImage, packageName, diagnostics } = data.item;
    const foundMedicineInCart = !!cartItems.find((item) => item.id == `${diagnostics!.itemId}`);
    const specialPrice = undefined;
    const addToCart = () =>
      addCartItem!({
        id: `${diagnostics!.itemId!}`,
        mou: 1,
        name: packageName!,
        price: diagnostics!.rate,
        specialPrice: specialPrice,
        thumbnail: packageImage,
        collectionMethod: diagnostics!.collectionType!,
      });
    const removeFromCart = () => removeCartItem!(`${diagnostics!.itemId}`);
    // const specialPrice = special_price
    //   ? typeof special_price == 'string'
    //     ? parseInt(special_price)
    //     : special_price
    //   : price;

    return hotSellerCard({
      name: packageName!,
      imgUrl: packageImage!,
      price: diagnostics!.rate,
      specialPrice: undefined,
      isAddedToCart: foundMedicineInCart,
      onAddOrRemoveCartItem: foundMedicineInCart ? removeFromCart : addToCart,
      onPress: () =>
        props.navigation.navigate(AppRoutes.TestDetails, {
          testDetails: {
            Rate: diagnostics!.rate,
            Gender: diagnostics!.gender,
            ItemID: `${diagnostics!.itemId}`,
            ItemName: packageName,
            collectionType: diagnostics!.collectionType,
          } as TestPackageForDetails,
        }),
      style: {
        marginHorizontal: 4,
        marginTop: 16,
        marginBottom: 20,
        ...(data.index == 0 ? { marginLeft: 20 } : {}),
      },
    });
  };

  const renderHotSellers = () => {
    if (hotSellers.length == 0) return null;
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

  // const renderBrowseByCondition = () => {
  //   return (
  //     <View>
  //       <SectionHeader leftText={'BROWSE BY CONDITION'} />
  //       <FlatList
  //         bounces={false}
  //         keyExtractor={(_, index) => `${index}`}
  //         showsHorizontalScrollIndicator={false}
  //         horizontal
  //         data={shopByOrgans}
  //         renderItem={({ item, index }) => {
  //           return renderCatalogCard(
  //             item.title,
  //             `${config.IMAGES_BASE_URL[0]}${item.image_url}`,
  //             () =>
  //               props.navigation.navigate(AppRoutes.SearchByBrand, {
  //                 category_id: item.category_id,
  //                 title: `${item.title || 'Products'}`.toUpperCase(),
  //                 isTest: true,
  //               }),
  //             {
  //               marginHorizontal: 4,
  //               marginTop: 16,
  //               marginBottom: 20,
  //               ...(index == 0 ? { marginLeft: 20 } : {}),
  //             }
  //           );
  //         }}
  //       />
  //     </View>
  //   );
  // };

  const renderPackageCard = (
    title: string,
    subtitle: string,
    desc: string,
    price: number,
    specialPrice: number | undefined,
    style: ViewStyle,
    isAddedToCart: boolean,
    onPress: () => void,
    onPressBookNow: () => void
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
        onPress={onPress}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
          }}
        >
          <View
            style={{
              flexGrow: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                width: Dimensions.get('window').width * 0.4,
              }}
            >
              <Text style={theme.viewStyles.text('SB', 16, '#02475b', 1, 24)} numberOfLines={2}>
                {title}
              </Text>
              <View style={{ height: 8 }} />
              <Text style={theme.viewStyles.text('M', 10, '#02475b', 1, undefined, 0.25)}>
                {subtitle}
              </Text>
              <View style={{ height: 16 }} />
              <Text style={theme.viewStyles.text('M', 14, '#0087ba', 1, 22)}>{desc}</Text>
            </View>
            <View style={{}}>
              <Image
                source={{
                  uri: '',
                  height: 120,
                  width: 120,
                }}
                style={{ borderRadius: 5 }}
              />
            </View>
          </View>
        </View>
        <Spearator style={{ marginVertical: 11.5 }} />

        <View
          style={{
            flexDirection: 'row',
            flex: 1,
          }}
        >
          <View
            style={{
              flexGrow: 1,
              flexDirection: 'row',
            }}
          >
            <Text
              style={{
                marginRight: 8,
                ...theme.viewStyles.text('SB', 14, '#02475b', 1, 24),
              }}
            >
              Rs. {specialPrice || price}
            </Text>
            {!!specialPrice && (
              <Text
                style={{
                  ...theme.viewStyles.text('SB', 14, '#02475b', 0.6, 24),
                  textAlign: 'center',
                }}
              >
                (
                <Text
                  style={[
                    {
                      textDecorationLine: 'line-through',
                    },
                  ]}
                >
                  Rs. {price}
                </Text>
                )
              </Text>
            )}
          </View>
          <View
            style={{
              flexGrow: 1,
              alignItems: 'flex-end',
            }}
          >
            <Text style={theme.viewStyles.text('B', 13, '#fc9916', 1, 24)} onPress={onPressBookNow}>
              {isAddedToCart ? 'ADDED TO CART' : 'BOOK NOW'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTestPackages = () => {
    if (testPackages.length > 0) {
      return (
        <View>
          <SectionHeader leftText={'BROWSE PACKAGES'} />
          <FlatList
            bounces={false}
            keyExtractor={(_, index) => `${index}`}
            showsHorizontalScrollIndicator={false}
            horizontal
            data={testPackages}
            renderItem={({ item, index }) => {
              const inclusionCount = (item.PackageInClussion || []).length;
              const desc = inclusionCount
                ? `${inclusionCount} TEST${inclusionCount == 1 ? '' : 'S'} INCLUDED`
                : '';
              const applicableAge = `Ideal for individuals between ${(
                item.FromAgeInDays / 365
              ).toFixed(0)}-${(item.ToAgeInDays / 365).toFixed(0)} years.`;
              return renderPackageCard(
                item.ItemName,
                desc,
                applicableAge,
                parseInt(item.Rate.toFixed(0)),
                0,
                {
                  marginHorizontal: 4,
                  marginTop: 16,
                  marginBottom: 20,
                  ...(index == 0 ? { marginLeft: 20 } : {}),
                },
                !!cartItems.find((_item) => _item.id == item.ItemID),
                () => props.navigation.navigate(AppRoutes.TestDetails, { testDetails: item }),
                () =>
                  addCartItem!({
                    id: item.ItemID,
                    name: item.ItemName,
                    mou: item.PackageInClussion.length,
                    price: item.Rate,
                    thumbnail: '',
                    specialPrice: undefined,
                    collectionMethod: TEST_COLLECTION_TYPE.HC, // hardcoding here
                  })
              );
            }}
          />
        </View>
      );
    }
  };

  const preventiveTestCard = (name: string, price: number, style: ViewStyle) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[
          {
            ...theme.viewStyles.card(16, 4, 10, '#fff', 10),
            paddingBottom: 12,
          },
          style,
        ]}
      >
        <Text style={theme.viewStyles.text('M', 14, '#01475b', 1, 22)}>{name}</Text>
        <Spearator style={{ marginVertical: 7.5 }} />
        <Text style={theme.viewStyles.text('B', 14, '#01475b', 1, 20)}>Rs. {price}</Text>
      </TouchableOpacity>
    );
  };

  const renderPreventiveTests = () => {
    const preventiveTests = Array.from({
      length: 10,
    }).map((_) => ({
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
    if (shopByOrgans.length == 0) return null;
    return (
      <View>
        <SectionHeader leftText={'BROWSE TESTS BY ORGANS'} />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={shopByOrgans}
          renderItem={({ item, index }) => {
            return renderCatalogCard(
              item.organName!,
              item.organImage!,
              () =>
                props.navigation.navigate(AppRoutes.TestsByCategory, {
                  // category_id: item.category_id,
                  title: `${item.organName || 'Products'}`.toUpperCase(),
                  isTest: true,
                  products: [item.diagnostics],
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
  const [medicineList, setMedicineList] = useState<
    searchDiagnostics_searchDiagnostics_diagnostics[]
  >([]);
  const [searchSate, setsearchSate] = useState<'load' | 'success' | 'fail' | undefined>();
  const [isSearchFocused, setSearchFocused] = useState(false);
  const client = useApolloClient();

  const onSearchMedicine = (_searchText: string) => {
    setSearchText(_searchText);
    if (!(_searchText && _searchText.length > 2)) {
      setMedicineList([]);
      console.log('onSearchMedicine');
      return;
    }
    setsearchSate('load');
    client
      .query<searchDiagnostics, searchDiagnosticsVariables>({
        query: SEARCH_DIAGNOSTICS,
        variables: {
          searchText: _searchText,
          city: locationForDiagnostics && locationForDiagnostics.city, //'Hyderabad' | 'Chennai,
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
        // aphConsole.log({ e });
        setsearchSate('fail');
      });
  };

  interface SuggestionType {
    name: string;
    price: number;
    type: 'TEST' | 'PACKAGE';
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
            style={{
              ...theme.viewStyles.text('M', 16, '#01475b', 1, 24, 0),
            }}
          >
            {data.name}
          </Text>
          <Text
            style={{
              ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0.04),
            }}
          >
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
              placeholderStyle={styles.imagePlaceholderStyle}
              source={{ uri: data.imgUri }}
              style={{
                height: 40,
                width: 40,
              }}
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

    const shouldEnableSearchSend = searchText.length > 2;
    const rigthIconView = (
      <TouchableOpacity
        activeOpacity={1}
        style={{
          opacity: shouldEnableSearchSend ? 1 : 0.4,
        }}
        disabled={!shouldEnableSearchSend}
        onPress={() => {
          props.navigation.navigate(AppRoutes.SearchTestScene, {
            searchText: searchText,
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
              props.navigation.navigate(AppRoutes.SearchTestScene, {
                searchText: searchText,
              });
            }
          }}
          value={searchText}
          // editable={!!locationDetails}
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
            itemsNotFound
              ? {
                  borderBottomColor: '#890000',
                }
              : {},
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

  const renderSearchSuggestionItemView = (
    data: ListRenderItemInfo<searchDiagnostics_searchDiagnostics_diagnostics>
  ) => {
    const { index, item } = data;
    const imgUri = undefined; //`${config.IMAGES_BASE_URL[0]}${1}`;
    const { rate, gender, itemId, itemName, collectionType } = item;
    return renderSearchSuggestionItem({
      onPress: () => {
        props.navigation.navigate(AppRoutes.TestDetails, {
          testDetails: {
            Rate: rate,
            Gender: gender,
            ItemID: `${itemId}`,
            ItemName: itemName,
            collectionType: collectionType,
          } as TestPackageForDetails,
        });
      },
      name: item.itemName,
      price: item.rate,
      type: 'TEST',
      style: {
        marginHorizontal: 20,
        paddingBottom: index == medicineList.length - 1 ? 10 : 0,
      },
      showSeparator: !(index == medicineList.length - 1),
      imgUri,
    });
  };

  const renderSearchSuggestions = () => {
    // if (medicineList.length == 0) return null;
    return (
      <View
        style={{
          width: '100%',
          position: 'absolute',
        }}
      >
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
        {/* {renderOfferBanner()} */}
        {renderYourOrders()}
        {(!!(locationForDiagnostics && locationForDiagnostics.cityId) && (
          <>
            {renderHotSellers()}
            {/* {renderBrowseByCondition()} */}
            {renderTestPackages()}
            {renderTestsByOrgan()}
            {/* {renderPreventiveTests()} */}
          </>
        )) || (
          <Text
            style={{
              ...theme.viewStyles.text('M', 16, '#0087ba', 1, 24),
              marginBottom: 20,
              textAlign: 'center',
            }}
          >{`${currentPatient &&
            currentPatient.firstName}, our diagnostic services are only available in Chennai and Hyderabad for now. Kindly change location to Chennai or Hyderabad.`}</Text>
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
          <ProfileList
            navigation={props.navigation}
            saveUserChange={true}
            childView={
              <View
                style={{
                  flexDirection: 'row',
                  paddingRight: 8,
                  borderRightWidth: 0,
                  borderRightColor: 'rgba(2, 71, 91, 0.2)',
                  backgroundColor: theme.colors.WHITE,
                }}
              >
                <Text style={styles.hiTextStyle}>{'hi'}</Text>
                <View>
                  <Text style={styles.nameTextStyle}>
                    {(currentPatient && currentPatient!.firstName!.toLowerCase()) || ''}
                  </Text>
                  <View style={styles.seperatorStyle} />
                </View>
                <View style={{ paddingTop: 15 }}>
                  <DropdownGreen />
                </View>
              </View>
            }
            selectedProfile={profile}
            setDisplayAddProfile={(val) => setDisplayAddProfile(val)}
          ></ProfileList>

          <View style={[isSearchFocused ? { flex: 1 } : {}]}>
            <View
              style={{
                backgroundColor: 'white',
              }}
            >
              {renderSearchBar()}
            </View>
            {renderSearchBarAndSuggestions()}
          </View>
          <View style={[isSearchFocused && searchText.length > 2 ? { height: 0 } : {}]}>
            {renderSections()}
          </View>
        </ScrollView>
        {errorPopUp && (
          <BottomPopUp
            title={`Hi ${currentPatient && currentPatient.firstName},`}
            description={`Our diagnostic services are only available in Chennai and Hyderabad for now. Kindly change location to Chennai or Hyderabad.`}
          >
            <View
              style={{
                height: 60,
                alignItems: 'flex-end',
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                style={styles.gotItStyles}
                onPress={() => {
                  setErrorPopUp(false);
                }}
              >
                <Text style={styles.gotItTextStyles}>Okay, got it</Text>
              </TouchableOpacity>
            </View>
          </BottomPopUp>
        )}
      </SafeAreaView>
      {renderPopup()}
      {displayAddProfile && (
        <AddProfile
          setdisplayoverlay={setDisplayAddProfile}
          setProfile={(profile) => {
            setProfile(profile);
          }}
        />
      )}
    </View>
  );
};
