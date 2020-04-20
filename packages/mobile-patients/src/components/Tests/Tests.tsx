import {
  LocationData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { TestPackageForDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';
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
  ShieldIcon,
  HomeIcon,
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
  SAVE_SEARCH,
  SEARCH_DIAGNOSTICS_BY_ID,
} from '@aph/mobile-patients/src/graphql/profiles';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import {
  getDiagnosticOrdersList,
  getDiagnosticOrdersListVariables,
  getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersList';
import {
  getDiagnosticsCites,
  getDiagnosticsCitesVariables,
  getDiagnosticsCites_getDiagnosticsCites_diagnosticsCities,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticsCites';
import {
  getDiagnosticsData,
  getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers,
  getDiagnosticsData_getDiagnosticsData_diagnosticOrgans,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticsData';
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
  PackageInclusion,
  getPackageData,
  getPlaceInfoByLatLng,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  aphConsole,
  doRequestAndAccessLocation,
  g,
  getNetStatus,
  isValidSearch,
  postWebEngageEvent,
  postWEGNeedHelpEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
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
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image, Input } from 'react-native-elements';
import { FlatList, NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import { SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  searchDiagnosticsById,
  searchDiagnosticsByIdVariables,
  searchDiagnosticsById_searchDiagnosticsById_diagnostics,
} from '@aph/mobile-patients/src/graphql/types/searchDiagnosticsById';
import { WebEngageEventName, WebEngageEvents } from '../../helpers/webEngageEvents';
import moment from 'moment';
import string from '@aph/mobile-patients/src/strings/strings.json';

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
  nameTextContainerStyle: {
    maxWidth: '65%',
  },
  nameTextStyle: {
    marginLeft: 5,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  seperatorStyle: {
    height: 2,
    backgroundColor: '#00b38e',
    //marginTop: 5,
    marginHorizontal: 5,
    marginBottom: 6,
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

export interface TestsProps
  extends NavigationScreenProps<{
    focusSearch?: boolean;
  }> {}

export const Tests: React.FC<TestsProps> = (props) => {
  const focusSearch = props.navigation.getParam('focusSearch');
  const { cartItems, addCartItem, removeCartItem, clearCartInfo } = useDiagnosticsCart();
  const { cartItems: shopCartItems } = useShoppingCart();
  const cartItemsCount = cartItems.length + shopCartItems.length;
  const { currentPatient } = useAllCurrentPatients();
  // const [data, setData] = useState<MedicinePageAPiResponse>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [currentLocation, setcurrentLocation] = useState<string>('');
  const [showLocationpopup, setshowLocationpopup] = useState<boolean>(false);
  const [locationSearchList, setlocationSearchList] = useState<{ name: string; placeId: string }[]>(
    []
  );
  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>(
    currentPatient!
  );

  const [ordersFetched, setOrdersFetched] = useState<
    (getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList | null)[]
  >([]);

  const { data: diagnosticsData, error: hError, loading: hLoading, refetch: hRefetch } = useQuery<
    getDiagnosticsData
  >(GET_DIAGNOSTIC_DATA, {
    variables: {},
    fetchPolicy: 'cache-first',
  });

  const { showAphAlert, hideAphAlert, setLoading: setLoadingContext } = useUIElements();
  const {
    locationDetails,
    setLocationDetails,
    diagnosticsCities,
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
    if (currentPatient && profile && profile.id !== currentPatient.id) {
      setLoadingContext!(true);
      setProfile(currentPatient);
      ordersRefetch()
        .then((data: any) => {
          const orderData = g(data, 'data', 'getDiagnosticOrdersList', 'ordersList') || [];
          setOrdersFetched(orderData);
          setLoadingContext!(false);
        })
        .catch((e) => {
          CommonBugFender('Tests_ordersRefetch_PATIENT_CHANGE', e);
        });
    }
  }, [currentPatient]);

  useEffect(() => {
    if (diagnosticsCities.length) {
      // Don't call getDiagnosticsCites API if already fetched
      return;
    }

    if (g(currentPatient, 'id') && g(locationDetails, 'city')) {
      client
        .query<getDiagnosticsCites, getDiagnosticsCitesVariables>({
          query: GET_DIAGNOSTICS_CITES,
          variables: {
            cityName: locationDetails!.city,
            patientId: currentPatient.id || '',
          },
        })
        .then(({ data }) => {
          console.log('getDiagnosticsCites\n', { data });
          const cities = g(data, 'getDiagnosticsCites', 'diagnosticsCities') || [];
          setDiagnosticsCities!(
            cities as getDiagnosticsCites_getDiagnosticsCites_diagnosticsCities[]
          );
        })
        .catch((e) => {
          CommonBugFender('Tests_GET_DIAGNOSTICS_CITES', e);
          console.log('getDiagnosticsCites Error\n', { e });
          showAphAlert!({
            unDismissable: true,
            title: 'Uh oh! :(',
            description:
              "Something went wrong. We're unable to check diagnostics serviceability for your location.",
          });
        });
    }
  }, [locationDetails, currentPatient, diagnosticsCities]);

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
              title={'ENTER MANUALLY'}
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
                    setLoadingContext!(false);
                    response && setLocationDetails!(response);
                  })
                  .catch((e) => {
                    CommonBugFender('Tests_ALLOW_AUTO_DETECT', e);
                    setLoadingContext!(false);
                    showAphAlert!({
                      title: 'Uh oh! :(',
                      description: 'Unable to access location.',
                    });
                    setLocationError(true);
                    setshowLocationpopup(true);
                  });
              }}
            />
          </View>
        ),
      });
  }, [locationDetails]);

  useEffect(() => {
    if (
      locationDetails &&
      diagnosticsCities.length > 0 &&
      !diagnosticsCities.find((item) => item!.cityname === locationDetails!.city)
    ) {
      renderLocationNotServingPopup();
    }
  }, [locationDetails && diagnosticsCities]);

  const [n, sN] = useState(0);

  useEffect(() => {
    if (locationForDiagnostics && locationForDiagnostics.cityId) {
      getTestsPackages(locationForDiagnostics.cityId, locationForDiagnostics.stateId)
        .then(({ data }) => {
          setLoading(false);
          aphConsole.log('getTestsPackages\n', { data });
          setTestPackages(g(data, 'data') || []);
        })
        .catch((e) => {
          CommonBugFender('Tests_getTestsPackages', e);
          setLoading(false);
          aphConsole.log('getTestsPackages Error\n', { e });
        });
      // .finally(() => {
      //   setLoading(false);
      // });
    } else {
      setTestPackages([]);
      setLoading(false);
    }
  }, [locationForDiagnostics && locationForDiagnostics.cityId]);

  const {
    data: orders,
    error: ordersError,
    loading: ordersLoading,
    refetch: ordersRefetch,
  } = useQuery<getDiagnosticOrdersList, getDiagnosticOrdersListVariables>(
    GET_DIAGNOSTIC_ORDER_LIST,
    {
      variables: {
        patientId: currentPatient && currentPatient.id,
      },
      fetchPolicy: 'cache-first',
    }
  );

  // let _orders = (!ordersLoading && g(orders, 'getDiagnosticOrdersList', 'ordersList')) || [];

  useEffect(() => {
    if (!ordersLoading) {
      const orderData = g(orders, 'getDiagnosticOrdersList', 'ordersList') || [];
      orderData.length > 0 && setOrdersFetched(orderData);
    }
  }, [ordersLoading]);

  useEffect(() => {
    hRefetch();
    if (ordersFetched.length == 0) {
      ordersRefetch()
        .then((data: any) => {
          const orderData = g(data, 'data', 'getDiagnosticOrdersList', 'ordersList') || [];
          orderData.length > 0 && setOrdersFetched(orderData);
        })
        .catch((e) => {
          CommonBugFender('Tests_ordersRefetch_initial', e);
        });
    }
  }, []);

  const postFeaturedTestEvent = (name: string, id: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.FEATURED_TEST_CLICKED] = {
      'Product name': name,
      'Product id (SKUID)': id,
      Source: 'Home',
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      Age: Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
      Gender: g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(WebEngageEventName.FEATURED_TEST_CLICKED, eventAttributes);
  };

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
      // Age: Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
      // Gender: g(currentPatient, 'gender'),
      // 'Mobile Number': g(currentPatient, 'mobileNumber'),
      // 'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ADD_TO_CART, eventAttributes);
  };

  const postBrowsePackageEvent = (packageName: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.BROWSE_PACKAGE] = {
      'Package Name': packageName,
      // Category: '',
      Source: 'Home',
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      Age: Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
      Gender: g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(WebEngageEventName.BROWSE_PACKAGE, eventAttributes);
  };

  // Common Views

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
    getNetStatus()
      .then((status) => {
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
              } catch (e) {
                CommonBugFender('Tests_autoSearch_try', e);
              }
            })
            .catch((error) => {
              CommonBugFender('Tests_autoSearch', error);
              console.log(error);
            });
        }
      })
      .catch((e) => {
        CommonBugFender('Tests_getNetStatus_autoSearch', e);
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
        const city =
          findAddrComponents('locality', addrComponents) ||
          findAddrComponents('administrative_area_level_2', addrComponents);
        if (
          city.toLowerCase() !=
          ((locationForDiagnostics && locationForDiagnostics.city) || '').toLowerCase()
        ) {
          clearCartInfo && clearCartInfo();
        }
        if (addrComponents.length > 0) {
          const locationData: LocationData = {
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
            city,
            state: findAddrComponents('administrative_area_level_1', addrComponents),
            country: findAddrComponents('country', addrComponents),
            pincode: findAddrComponents('postal_code', addrComponents),
            lastUpdated: new Date().getTime(),
          };

          setLocationDetails!(locationData);

          getPlaceInfoByLatLng(lat, lng)
            .then((response) => {
              const addrComponents =
                g(response, 'data', 'results', '0' as any, 'address_components') || [];
              if (addrComponents.length > 0) {
                setLocationDetails!({
                  ...locationData,
                  pincode: findAddrComponents('postal_code', addrComponents),
                  lastUpdated: new Date().getTime(),
                });
              }
            })
            .catch((error) => {
              CommonBugFender('LocationSearchPopup_saveLatlong', error);
            });
        }
      })
      .catch((error) => {
        CommonBugFender('Tests_saveLatlong', error);
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
                  textInputprops={{ autoFocus: true }}
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
              getNetStatus()
                .then((status) => {
                  if (status) {
                    setshowLocationpopup(true);
                    // fetchCurrentLocation();
                  } else {
                    setError(true);
                  }
                })
                .catch((e) => {
                  CommonBugFender('Tests_getNetStatus', e);
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
                  {locationDetails.displayName && locationDetails.displayName.length > 15
                    ? `${locationDetails.displayName.substring(0, 15)}...`
                    : locationDetails.displayName}
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
          paddingBottom: 12,
          paddingHorizontal: 20,
          backgroundColor: theme.colors.WHITE,
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          // onPress={() => props.navigation.popToTop()}
          onPress={() => {
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
          }}
        >
          <HomeIcon />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          {renderLocation()}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              props.navigation.navigate(AppRoutes.MedAndTestCart, { isComingFromConsult: true })
            }
            // style={{ right: 20 }}
          >
            <CartIcon />
            {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
          </TouchableOpacity>
          {/* <NotificationIcon /> */}
        </View>
      </View>
    );
  };

  /*
  const uploadPrescriptionCTA = () => {
    return (
      <View
        style={[
          {
            ...theme.viewStyles.card(),
            marginTop: 20,
            marginBottom: 0,
          },
          medicineList.length > 0 && searchText
            ? {
                elevation: 0,
              }
            : {},
        ]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text
              style={{
                ...theme.viewStyles.text('M', 16, '#02475b', 1, 24, 0),
                paddingBottom: 12,
              }}
            >
              Have a prescription ready?
            </Text>
            <Button
              onPress={() => {
                // setShowPopop(true);
              }}
              style={{ width: 'auto' }}
              titleTextStyle={{
                ...theme.viewStyles.text('B', 13, '#fff', 1, 24, 0),
              }}
              title={'UPLOAD PRESCRIPTION'}
            />
          </View>
          <FileBig style={{ height: 60, width: 40 }} />
        </View>
      </View>
    );
  };
*/
  const renderYourOrders = () => {
    // if (ordersLoading) return renderSectionLoader(70);
    return (
      // (!ordersLoading && ordersFetched.length > 0 && (
      <ListCard
        onPress={() => {
          setLoadingContext!(true);
          props.navigation.navigate(AppRoutes.YourOrdersTest, {
            orders: ordersFetched,
            isTest: true,
            refetch: ordersRefetch,
            error: ordersError,
            loading: ordersLoading,
          });
        }}
        container={{
          marginBottom: 24,
          marginTop: 20,
        }}
        title={'My Orders'}
        leftIcon={<TestsIcon />}
      />
      // )) || <View style={{ height: 24 }} />
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
          <Text style={[styles.priceText, { marginRight: 4 }]}>Rs. {specialPrice || price}</Text>
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
                Rs. {price}
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
            {data.isAddedToCart ? 'REMOVE' : 'ADD TO CART'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHotSellerItem = (
    data: ListRenderItemInfo<getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers>
  ) => {
    const { packageImage, packageName, diagnostics } = data.item;
    const foundMedicineInCart = !!cartItems.find((item) => item.id == `${diagnostics!.itemId}`);
    const specialPrice = undefined;
    const addToCart = () => {
      fetchPackageInclusion(`${diagnostics!.itemId}`, (tests) => {
        postDiagnosticAddToCartEvent(
          packageName!,
          `${diagnostics!.itemId}`,
          diagnostics!.rate,
          diagnostics!.rate // since no special price
        );
        addCartItem!({
          id: `${diagnostics!.itemId}`,
          mou: tests.length,
          name: packageName!,
          price: diagnostics!.rate,
          specialPrice: specialPrice,
          thumbnail: packageImage,
          collectionMethod: diagnostics!.collectionType!,
        });
      });
    };
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
      onPress: () => {
        postFeaturedTestEvent(packageName!, `${diagnostics!.itemId}`);
        props.navigation.navigate(AppRoutes.TestDetails, {
          testDetails: {
            Rate: diagnostics!.rate,
            Gender: diagnostics!.gender,
            ItemID: `${diagnostics!.itemId}`,
            ItemName: packageName,
            collectionType: diagnostics!.collectionType,
            FromAgeInDays: diagnostics!.fromAgeInDays,
            ToAgeInDays: diagnostics!.toAgeInDays,
            preparation: diagnostics!.testPreparationData,
          } as TestPackageForDetails,
        });
      },
      style: {
        marginHorizontal: 4,
        marginTop: 16,
        marginBottom: 20,
        ...(data.index == 0 ? { marginLeft: 20 } : {}),
      },
    });
  };

  const renderHotSellers = () => {
    const hotSellers = (g(diagnosticsData, 'getDiagnosticsData', 'diagnosticHotSellers') ||
      []) as getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers[];

    if (!hLoading && hotSellers.length == 0) return null;
    return (
      <View>
        <SectionHeader leftText={'FEATURED TESTS'} />
        {hLoading ? (
          renderSectionLoader(188)
        ) : (
          <FlatList
            bounces={false}
            keyExtractor={(_, index) => `${index}`}
            showsHorizontalScrollIndicator={false}
            horizontal
            data={hotSellers}
            renderItem={renderHotSellerItem}
          />
        )}
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
                  Rs. {price}
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

  const errorAlert = () => {
    showAphAlert!({
      title: 'Uh oh! :(',
      description: 'Unable to fetch pakage details.',
    });
  };

  const fetchPackageDetails = (
    itemIds: string,
    func: (product: searchDiagnosticsById_searchDiagnosticsById_diagnostics) => void
  ) => {
    {
      setLoadingContext!(true);
      client
        .query<searchDiagnosticsById, searchDiagnosticsByIdVariables>({
          query: SEARCH_DIAGNOSTICS_BY_ID,
          variables: {
            itemIds: itemIds,
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          setLoadingContext!(false);
          aphConsole.log('searchDiagnostics\n', { data });
          const product = g(data, 'searchDiagnosticsById', 'diagnostics', '0' as any);
          if (product) {
            func && func(product);
          } else {
            errorAlert();
          }
        })
        .catch((e) => {
          CommonBugFender('Tests_fetchPackageDetails', e);
          setLoadingContext!(false);
          aphConsole.log({ e });
          errorAlert();
        });
      // .finally(() => {
      //   setLoadingContext!(false);
      // });
    }
  };

  const fetchPackageInclusion = (id: string, func: (tests: PackageInclusion[]) => void) => {
    setLoadingContext!(true);
    getPackageData(id)
      .then(({ data }) => {
        setLoadingContext!(false);
        console.log('getPackageData\n', { data });
        const product = g(data, 'data');
        if (product && product.length) {
          func && func(product);
        } else {
          errorAlert();
        }
      })
      .catch((e) => {
        CommonBugFender('Tests_fetchPackageInclusion', e);
        setLoadingContext!(false);
        console.log('getPackageData Error\n', { e });
        errorAlert();
      });
    // .finally(() => {
    //   setLoadingContext!(false);
    // });
  };

  const renderTestPackages = () => {
    if (!loading && testPackages.length == 0) return null;
    return (
      <View>
        <SectionHeader leftText={'BROWSE PACKAGES'} />
        {loading ? (
          renderSectionLoader(205)
        ) : (
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
                () => {
                  fetchPackageDetails(item.ItemID, (product) => {
                    props.navigation.navigate(AppRoutes.TestDetails, {
                      testDetails: {
                        ...item,
                        collectionType: product.collectionType,
                        preparation: product.testPreparationData,
                      } as TestPackageForDetails,
                    });
                  });
                },
                () => {
                  fetchPackageDetails(item.ItemID, (product) => {
                    addCartItem!({
                      id: item.ItemID,
                      name: item.ItemName,
                      mou: item.PackageInClussion.length,
                      price: item.Rate,
                      thumbnail: '',
                      specialPrice: undefined,
                      collectionMethod: product.collectionType!,
                    });
                  });
                }
              );
            }}
          />
        )}
      </View>
    );
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
    const shopByOrgans = (g(diagnosticsData, 'getDiagnosticsData', 'diagnosticOrgans') ||
      []) as getDiagnosticsData_getDiagnosticsData_diagnosticOrgans[];

    if (!hLoading && shopByOrgans.length == 0) return null;
    return (
      <View>
        <SectionHeader leftText={'BROWSE PACKAGES'} />
        {hLoading ? (
          renderSectionLoader()
        ) : (
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
                () => {
                  postBrowsePackageEvent(item.organName!);
                  props.navigation.navigate(AppRoutes.TestsByCategory, {
                    title: `${item.organName || 'Products'}`.toUpperCase(),
                    products: [item.diagnostics],
                  });
                },
                {
                  marginHorizontal: 4,
                  marginTop: 16,
                  marginBottom: 20,
                  ...(index == 0 ? { marginLeft: 20 } : {}),
                }
              );
            }}
          />
        )}
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
        onNeedHelpPress={() => {
          postWEGNeedHelpEvent(currentPatient, 'Tests');
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
    if (isValidSearch(_searchText)) {
      if (!g(locationForDiagnostics, 'cityId')) {
        renderLocationNotServingPopup();
        return;
      }
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
          CommonBugFender('Tests_onSearchMedicine', e);
          // aphConsole.log({ e });
          setsearchSate('fail');
        });
    }
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

  const [scrollOffset, setScrollOffset] = useState<number>(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // console.log(`scrollOffset, ${event.nativeEvent.contentOffset.y}`);
    setScrollOffset(event.nativeEvent.contentOffset.y);
  };

  const renderSearchBar = () => {
    const isFocusedStyle = scrollOffset > 10 || isSearchFocused;

    const styles = StyleSheet.create({
      inputStyle: {
        minHeight: 29,
        ...theme.fonts.IBMPlexSansMedium(18),
      },
      inputContainerStyle: isFocusedStyle
        ? {
            borderBottomColor: '#00b38e',
            borderBottomWidth: 2,
            marginHorizontal: 10,
          }
        : {
            borderRadius: 5,
            backgroundColor: '#f7f8f5',
            marginHorizontal: 10,
            paddingHorizontal: 16,
            borderBottomWidth: 0,
          },
      rightIconContainerStyle: isFocusedStyle
        ? {
            height: 24,
          }
        : {},
      style: isFocusedStyle
        ? {
            paddingBottom: 18.5,
          }
        : { borderRadius: 5 },
      containerStyle: isFocusedStyle
        ? {
            marginBottom: 20,
            marginTop: 8,
          }
        : {
            marginBottom: 20,
            marginTop: 12,
            alignSelf: 'center',
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
          autoFocus={focusSearch}
          onSubmitEditing={() => {
            if (searchText.length > 2) {
              props.navigation.navigate(AppRoutes.SearchTestScene, {
                searchText: searchText,
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
          rightIcon={isSearchFocused ? rigthIconView : <View />}
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

  const renderBanner = () => {
    return (
      <View
        style={{
          backgroundColor: theme.colors.APP_GREEN,
          width: '100%',
          paddingVertical: 16,
          paddingHorizontal: 20,
          flexDirection: 'row',
        }}
      >
        <ShieldIcon />
        <View
          style={{
            borderRightWidth: 1,
            borderRightColor: 'rgba(2, 71, 91, 0.5)',
            marginHorizontal: 19.5,
          }}
        />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <Text style={theme.viewStyles.text('M', 14, theme.colors.WHITE, 1, 22)}>
            Most trusted diagnostics from the comfort of your home!
          </Text>
        </View>
      </View>
    );
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
      toAgeInDays,
      testPreparationData,
    } = item;
    return renderSearchSuggestionItem({
      onPress: () => {
        savePastSeacrh(`${itemId}`, itemName).catch((e) => {});
        props.navigation.navigate(AppRoutes.TestDetails, {
          testDetails: {
            Rate: rate,
            Gender: gender,
            ItemID: `${itemId}`,
            ItemName: itemName,
            collectionType: collectionType,
            FromAgeInDays: fromAgeInDays,
            ToAgeInDays: toAgeInDays,
            preparation: testPreparationData,
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
              // contentContainerStyle={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }}
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
        {renderBanner()}
        {/* {uploadPrescriptionCTA()} */}
        {renderYourOrders()}
        <>
          {renderHotSellers()}
          {/* {renderBrowseByCondition()} */}
          {renderTestPackages()}
          {renderTestsByOrgan()}
          {/* {renderPreventiveTests()} */}
        </>
        {renderNeedHelp()}
      </TouchableOpacity>
    );
  };

  const renderLocationNotServingPopup = () => {
    showAphAlert!({
      title: `Hi ${currentPatient && currentPatient.firstName},`,
      description: string.diagnostics.nonServiceableMsg.replace(
        '{{city_name}}',
        g(locationDetails, 'displayName')!
      ),
      onPressOk: () => {
        hideAphAlert!();
        setshowLocationpopup(true);
      },
    });
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
          onScroll={handleScroll}
          scrollEventThrottle={20}
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
                <View style={styles.nameTextContainerStyle}>
                  <Text style={styles.nameTextStyle} numberOfLines={1}>
                    {(currentPatient && currentPatient.firstName!.toLowerCase()) || ''}
                  </Text>
                  <View style={styles.seperatorStyle} />
                </View>
                <View style={{ paddingTop: 15 }}>
                  <DropdownGreen />
                </View>
              </View>
            }
            selectedProfile={profile}
            setDisplayAddProfile={() => {}}
            unsetloaderDisplay={true}
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
      </SafeAreaView>
      {renderPopup()}
    </View>
  );
};
