import {
  LocationData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import stripHtml from 'string-strip-html';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Badge, SectionHeader } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { PincodePopup } from '@aph/mobile-patients/src/components/Medicines/PincodePopup';

import {
  CartIcon,
  LocationOff,
  LocationOn,
  SearchSendIcon,
  TestsIcon,
  SearchIcon,
  HomeIcon,
  NotificationIcon,
  WorkflowIcon,
  ArrowRightYellow,
  ShieldIcon,
  Remove,
  PendingIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  SAVE_SEARCH,
  GET_DIAGNOSTIC_PINCODE_SERVICEABILITIES,
  GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
  GET_DIAGNOSTIC_HOME_PAGE_ITEMS,
  GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
  SET_DEFAULT_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics } from '@aph/mobile-patients/src/graphql/types/searchDiagnosticsByCityID';

import {
  PackageInclusion,
  getPlaceInfoByPincode,
  getLandingPageBanners,
  getDiagnosticsSearchResults,
  getDiagnosticHomePageWidgets,
  DIAGNOSTIC_GROUP_PLAN,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  aphConsole,
  doRequestAndAccessLocation,
  doRequestAndAccessLocationModified,
  g,
  isValidSearch,
  getFormattedLocation,
  nameFormater,
  isSmallDevice,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import React, { useEffect, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import {
  Dimensions,
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
  Image as ImageNative,
} from 'react-native';
import { Image, Input } from 'react-native-elements';
import { FlatList, NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import {
  SEARCH_TYPE,
  TEST_COLLECTION_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import moment from 'moment';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { postMyOrdersClicked } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import _, { flatten } from 'lodash';
import {
  getPincodeServiceability,
  getPincodeServiceabilityVariables,
} from '@aph/mobile-patients/src/graphql/types/getPincodeServiceability';
import {
  findDiagnosticsByItemIDsAndCityID,
  findDiagnosticsByItemIDsAndCityIDVariables,
  findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics,
} from '@aph/mobile-patients/src/graphql/types/findDiagnosticsByItemIDsAndCityID';
import {
  getDiagnosticsHomePageItems,
  getDiagnosticsHomePageItemsVariables,
  getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticHotSellers,
  getDiagnosticsHomePageItems_getDiagnosticsHomePageItems_diagnosticOrgans,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticsHomePageItems';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import {
  GetSubscriptionsOfUserByStatus,
  GetSubscriptionsOfUserByStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/GetSubscriptionsOfUserByStatus';
import { CarouselBanners } from '@aph/mobile-patients/src/components/ui/CarouselBanners';
import {
  getPackageInclusions,
  getUserBannersList,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  getPricesForItem,
  sourceHeaders,
  convertNumberToDecimal,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { SpecialDiscountText } from '@aph/mobile-patients/src/components/Tests/components/SpecialDiscountText';
import Carousel from 'react-native-snap-carousel';
import { DiagnosticsSearchSuggestionItem } from '@aph/mobile-patients/src/components/Tests/components/DiagnosticsSearchSuggestionItem';
import { savePatientAddress_savePatientAddress_patientAddress } from '../../graphql/types/savePatientAddress';
import { AccessLocation } from '@aph/mobile-patients/src/components/Medicines/Components/AccessLocation';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import { PincodeInput } from '@aph/mobile-patients/src/components/Medicines/Components/PicodeInput';
import {
  makeAdressAsDefault,
  makeAdressAsDefaultVariables,
} from '@aph/mobile-patients/src/graphql/types/makeAdressAsDefault';
import { CertifiedCard } from '@aph/mobile-patients/src/components/Tests/components/CertifiedCard';
import {
  DiagnosticAddToCartEvent,
  DiagnosticHomePageSearchItem,
  DiagnosticHomePageWidgetClicked,
  DiagnosticLandingPageViewedEvent,
  DiagnosticPinCodeClicked,
} from '@aph/mobile-patients/src/components/Tests/Events';
import { ItemCard } from '@aph/mobile-patients/src/components/Tests/components/ItemCard';
import { PackageCard } from '@aph/mobile-patients/src/components/Tests/components/PackageCard';
const imagesArray = [
  require('@aph/mobile-patients/src/components/ui/icons/diagnosticCertificate_1.png'),
  require('@aph/mobile-patients/src/components/ui/icons/diagnosticCertificate_2.png'),
  require('@aph/mobile-patients/src/components/ui/icons/diagnosticCertificate_3.png'),
  require('@aph/mobile-patients/src/components/ui/icons/diagnosticCertificate_4.png'),
];

const whyBookUsArray = [
  { image: require('@aph/mobile-patients/src/components/ui/icons/whyBookUs_1.png') },
  { image: require('@aph/mobile-patients/src/components/ui/icons/whyBookUs_2.png') },
  { image: require('@aph/mobile-patients/src/components/ui/icons/whyBookUs_3.png') },
];
const { width: winWidth } = Dimensions.get('window');

export interface TestsProps
  extends NavigationScreenProps<{
    focusSearch?: boolean;
    comingFrom?: string;
  }> {}

export const Tests: React.FC<TestsProps> = (props) => {
  const {
    cartItems,
    addCartItem,
    removeCartItem,
    isDiagnosticCircleSubscription,
    setIsDiagnosticCircleSubscription,
  } = useDiagnosticsCart();
  const {
    cartItems: shopCartItems,
    setCircleSubscriptionId,
    setHdfcSubscriptionId,
    setIsCircleSubscription,
    setHdfcPlanName,
    setIsFreeDelivery,
    setCirclePlanValidity,
    addresses,
    setAddresses,
    deliveryAddressId,
    setDeliveryAddressId,
  } = useShoppingCart();

  const {
    locationDetails,
    setLocationDetails,
    diagnosticLocation,
    setDiagnosticLocation,
    locationForDiagnostics,
    diagnosticServiceabilityData,
    setDiagnosticServiceabilityData,
    isDiagnosticLocationServiceable,
    setDiagnosticLocationServiceable,
    setBannerData,
    bannerData,
    pharmacyLocation,
    notificationCount,
    setNotificationCount,
  } = useAppCommonData();

  type addressListType = savePatientAddress_savePatientAddress_patientAddress[];
  type Address = savePatientAddress_savePatientAddress_patientAddress;

  const focusSearch = props.navigation.getParam('focusSearch');
  const comingFrom = props.navigation.getParam('comingFrom');
  const { currentPatient } = useAllCurrentPatients();

  const hdfc_values = string.Hdfc_values;
  const cartItemsCount = cartItems.length + shopCartItems.length;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const [bannerLoading, setBannerLoading] = useState(true);
  const [imgHeight, setImgHeight] = useState(150);
  const [slideIndex, setSlideIndex] = useState(0);
  const [banners, setBanners] = useState([]);

  const [bookUsSlideIndex, setBookUsSlideIndex] = useState(0);
  const [showbookingStepsModal, setShowBookingStepsModal] = useState(false);

  const [widgetsData, setWidgetsData] = useState([] as any);

  const [searchQuery, setSearchQuery] = useState({});
  const [showMatchingMedicines, setShowMatchingMedicines] = useState<boolean>(false);
  const [searchResult, setSearchResults] = useState<boolean>(false);

  const [serviceabilityMsg, setServiceabilityMsg] = useState('');
  const [showLocationpopup, setshowLocationpopup] = useState<boolean>(false);
  const [optionSelected, setOptionSelected] = useState<string>('');
  const { showAphAlert, hideAphAlert, setLoading: setLoadingContext } = useUIElements();
  const [locationError, setLocationError] = useState(false);
  const defaultAddress = addresses?.find((item) => item?.defaultAddress);
  const hasLocation = locationDetails || pharmacyLocation || defaultAddress;
  const diagnosticPincode = g(diagnosticLocation, 'pincode') || g(locationDetails, 'pincode');

  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>(
    currentPatient!
  );

  /**
   * home page items api
   */
  const { data: diagnosticsData, error: hError, loading: hLoading, refetch: hRefetch } = useQuery<
    getDiagnosticsHomePageItems,
    getDiagnosticsHomePageItemsVariables
  >(GET_DIAGNOSTIC_HOME_PAGE_ITEMS, {
    context: {
      sourceHeaders,
    },
    variables: { cityID: parseInt(diagnosticServiceabilityData?.cityId!) || 9 },
    fetchPolicy: 'cache-first',
  });

  const fetchPricesForCityId = (cityId: string | number, listOfId: []) =>
    client.query<findDiagnosticsByItemIDsAndCityID, findDiagnosticsByItemIDsAndCityIDVariables>({
      query: GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
      context: {
        sourceHeaders,
      },
      variables: {
        cityID: Number(cityId) || 9,
        itemIDs: listOfId,
      },
      fetchPolicy: 'no-cache',
    });
  /**
   * fetch widgets
   */

  useEffect(() => {
    getDiagnosticBanner();
    setBannerData && setBannerData([]);
    getHomePageWidgets();
    DiagnosticLandingPageViewedEvent(currentPatient, isDiagnosticLocationServiceable);
  }, []);

  const setWebEngageEventOnSearchItem = (keyword: string, results: any[]) => {
    DiagnosticHomePageSearchItem(currentPatient, keyword, results);
  };

  const setWebEnageEventForPinCodeClicked = (
    mode: string,
    pincode: string,
    serviceable: boolean
  ) => {
    DiagnosticPinCodeClicked(currentPatient, mode, pincode, serviceable);
  };

  const postHomePageWidgetClicked = (name: string, id: string, section: string) => {
    DiagnosticHomePageWidgetClicked(name, id, section);
  };

  const postDiagnosticAddToCartEvent = (
    name: string,
    id: string,
    price: number,
    discountedPrice: number,
    source: 'Home page' | 'Full search' | 'Details page' | 'Partial search',
    section?: 'Featured tests' | 'Browse packages'
  ) => {
    DiagnosticAddToCartEvent(name, id, price, discountedPrice, source, section);
  };

  /**
   * if any change in the location and pincode is changed
   */
  useEffect(() => {
    if (diagnosticPincode) {
      checkIsPinCodeServiceable(diagnosticPincode);
    }
  }, [diagnosticPincode]);

  /**
   * fetching the orders
   */
  useEffect(() => {
    if (currentPatient && profile && profile.id !== currentPatient.id) {
      setLoadingContext!(true);
      setProfile(currentPatient);
    }
    if (currentPatient) {
      getUserBanners();
    }
  }, [currentPatient]);

  /**
   * if there is any change in the location yellow pop-up ,if location is present.
   */
  useEffect(() => {
    checkLocation();
  }, [locationDetails]);

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setBannerData && setBannerData([]); // default banners to be empty
      getUserBanners();
    });
    return () => {
      didFocus && didFocus.remove();
    };
  });

  useEffect(() => {
    if (!loading && banners?.length > 0) {
      banners?.map((item: any) => {
        ImageNative.getSize(
          item?.bannerImage,
          (width, height) => {
            setImgHeight(height * (winWidth / width));
            setBannerLoading(false);
          },
          () => {
            setBannerLoading(false);
          }
        );
      });
    }
  }, [loading, banners]);

  const checkLocation = () => {
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
                    setLoadingContext!(false);
                    checkIsPinCodeServiceable(response.pincode, 'Auto-select');
                    response && setDiagnosticLocation!(response);
                    response && !locationDetails && setLocationDetails!(response);
                  })
                  .catch((e) => {
                    CommonBugFender('Tests_ALLOW_AUTO_DETECT', e);
                    setLoadingContext!(false);
                    showAphAlert!({
                      title: string.common.uhOh,
                      description: 'Unable to access location.',
                      onPressOk: () => {
                        hideAphAlert!();
                        setLocationError(true);
                      },
                    });
                  });
              }}
            />
          </View>
        ),
      });
  };

  const getDiagnosticBanner = async () => {
    const res: any = await getLandingPageBanners('diagnostic');
    if (res?.data?.success) {
      const bannerData = g(res, 'data', 'data');
      setBanners(bannerData);
    } else {
      setBanners([]);
      setBannerLoading(false);
    }
  };

  const getHomePageWidgets = async () => {
    const result: any = await getDiagnosticHomePageWidgets('diagnostic');
    if (result?.data?.success && result?.data?.data.length > 0) {
      const sortWidgets = result?.data?.data?.sort(
        (a: any, b: any) =>
          Number(a.diagnosticwidgetsRankOrder) - Number(b.diagnosticwidgetsRankOrder)
      );
      //call here the prices.

      fetchWidgetsPrices(sortWidgets);
    } else {
      setWidgetsData([]);
      setLoading!(false);
    }
  };

  const getUserBanners = async () => {
    const res: any = await getUserBannersList(
      client,
      currentPatient,
      string.banner_context.DIAGNOSTIC_HOME
    );
    if (res) {
      setBannerData && setBannerData(res);
    } else {
      setBannerData && setBannerData([]);
    }
  };

  const fetchWidgetsPrices = async (widgetsData: any) => {
    const itemIds = widgetsData?.map((item: any) =>
      item?.diagnosticWidgetData?.map((data: any, index: number) => Number(data?.itemId))
    );

    //restriction less than 12.
    const res = Promise.all(
      itemIds?.map((item: any) =>
        fetchPricesForCityId(
          Number(diagnosticServiceabilityData?.cityId!) || 9,
          item?.length > 12 ? item.slice(0, 12) : item
        )
      )
    );

    const response = (await res).map((item: any) =>
      g(item, 'data', 'findDiagnosticsByItemIDsAndCityID', 'diagnostics')
    );
    let newWidgetsData = [...widgetsData];

    for (let i = 0; i < widgetsData?.length; i++) {
      for (let j = 0; j < widgetsData?.[i]?.diagnosticWidgetData?.length; j++) {
        const findIndex = widgetsData?.[i]?.diagnosticWidgetData?.findIndex(
          (item: any) => item?.itemId == Number(response?.[i]?.[j]?.itemId)
        );
        if (findIndex !== -1) {
          (newWidgetsData[i].diagnosticWidgetData[findIndex].packageCalculatedMrp =
            response?.[i]?.[j]?.packageCalculatedMrp),
            (newWidgetsData[i].diagnosticWidgetData[findIndex].diagnosticPricing =
              response?.[i]?.[j]?.diagnosticPricing);
        }
      }
    }
    setWidgetsData(newWidgetsData);
    setLoading!(false);
  };

  const renderCarouselBanners = () => {
    const showBanner = bannerData && bannerData.length > 0;
    if (showBanner) {
      return (
        <CarouselBanners
          navigation={props.navigation}
          planActivationCallback={() => {
            getUserBanners();
            getUserSubscriptionsByStatus();
          }}
          from={string.banner_context.DIAGNOSTIC_HOME}
          source={'Diagnostic'}
          circleActivated={false}
        />
      );
    }
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

  const handleUpdatePlaceInfoByPincodeError = (e: Error) => {
    CommonBugFender('AddAddress_updateCityStateByPincode', e);
    setError(true);
  };

  //change the city name which comes from serviceability
  /**update the method wrt to pharmacy + diagnostics */
  const updatePlaceInfoByPincode = (pincode: string) => {
    getPlaceInfoByPincode(pincode)
      .then(({ data }) => {
        try {
          if (data?.results?.length > 0) {
            const addrComponents = data.results[0].address_components || [];
            const latLang = data.results[0].geometry.location || {};
            const response = getFormattedLocation(addrComponents, latLang, pincode);
            let setCity, setState;
            if (isDiagnosticLocationServiceable == 'true' && diagnosticServiceabilityData == null) {
              setCity = diagnosticLocation?.city! || '';
              setState = diagnosticLocation?.state! || '';
            } else if (
              isDiagnosticLocationServiceable == 'true' &&
              diagnosticServiceabilityData?.city != ''
            ) {
              setCity = diagnosticServiceabilityData?.city! || '';
              setState = diagnosticServiceabilityData?.state! || '';
            } else {
              setCity = response.city || '';
              setState = response.state || '';
            }
            (response.city = setCity), (response.state = setState);
            setDiagnosticLocation!(response);
            !locationDetails && setLocationDetails!(response);
          } else {
            //serviceable but no response
            let response = {
              displayName: '',
              area:
                isDiagnosticLocationServiceable == 'true'
                  ? diagnosticServiceabilityData == null
                    ? diagnosticLocation?.city!
                    : diagnosticServiceabilityData?.city!
                  : '',
              city:
                isDiagnosticLocationServiceable == 'true'
                  ? diagnosticServiceabilityData == null
                    ? diagnosticLocation?.city!
                    : diagnosticServiceabilityData?.city!
                  : '',
              state:
                isDiagnosticLocationServiceable == 'true'
                  ? diagnosticServiceabilityData == null
                    ? diagnosticLocation?.state!
                    : diagnosticServiceabilityData?.state!
                  : '',
              country: 'India',
              pincode: String(pincode),
            };
            setDiagnosticLocation!(response);
            !locationDetails && setLocationDetails!(response);
          }
        } catch (e) {
          console.log(e);
          handleUpdatePlaceInfoByPincodeError(e);
        }
      })
      .catch(handleUpdatePlaceInfoByPincodeError)
      .finally(() => setLoadingContext!(false));
  };

  const renderPopup = () => {
    const onClose = (serviceable?: boolean, response?: LocationData) => {
      setshowLocationpopup(false);
    };

    return (
      showLocationpopup && (
        <PincodePopup
          onClickClose={() => {
            onClose();
            checkLocation();
          }}
          toBeShownOn={'Diagnostics'}
          onComplete={onClose}
          onPressSubmit={(pincode) => checkIsPinCodeServiceable(pincode, 'Manually')}
          subText={string.diagnostics.locationPermissionText}
        />
      )
    );
  };

  /**check current location */
  const autoDetectLocation = async () => {
    setLoadingContext!(true);
    doRequestAndAccessLocationModified()
      .then((response) => {
        setLoadingContext!(false);
        // response && setPharmacyLocation!(response);
        // response && !locationDetails && setLocationDetails!(response);
        checkIsPinCodeServiceable(response.pincode, 'Auto-select');
        setDeliveryAddressId!('');
      })
      .catch((e) => {
        CommonBugFender('Diagnostic__ALLOW_AUTO_DETECT', e);
        setLoadingContext!(false);
        e &&
          typeof e == 'string' &&
          !e.includes('denied') &&
          showAphAlert!({
            title: string.common.uhOh,
            description: e,
          });
      });
  };

  /**
   * check for the pincode serviceability
   */
  const checkIsPinCodeServiceable = async (pincode: string, mode?: string) => {
    if (!!pincode) {
      setLoadingContext!(true);
      client
        .query<getPincodeServiceability, getPincodeServiceabilityVariables>({
          query: GET_DIAGNOSTIC_PINCODE_SERVICEABILITIES,
          context: {
            sourceHeaders,
          },
          variables: {
            pincode: parseInt(pincode, 10),
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          const serviceableData = g(data, 'getPincodeServiceability');
          if (serviceableData && serviceableData?.cityName != '') {
            let obj = {
              cityId: serviceableData.cityID?.toString() || '0',
              stateId: serviceableData.stateID?.toString() || '0',
              state: serviceableData.stateName || '',
              city: serviceableData.cityName || '',
            };
            setDiagnosticServiceabilityData!(obj);
            setDiagnosticLocationServiceable!('true');
            setServiceabilityMsg('');
            mode && setWebEnageEventForPinCodeClicked(mode, pincode, true);
          } else {
            setDiagnosticLocationServiceable!('false');
            setLoadingContext!(false);
            renderLocationNotServingPopUpForPincode(pincode);
            mode && setWebEnageEventForPinCodeClicked(mode, pincode, false);
          }
          setshowLocationpopup(false);
          updatePlaceInfoByPincode(pincode);
        })
        .catch((e) => {
          CommonBugFender('Tests_', e);
          setLoadingContext!(false);
          console.log('getDiagnosticsPincode serviceability Error\n', { e });
          showAphAlert!({
            unDismissable: true,
            title: string.common.uhOh,
            description: string.diagnostics.serviceabilityFailureText,
          });
        });
    }
  };

  const renderYourOrders = () => {
    return (
      <ListCard
        onPress={() => {
          postMyOrdersClicked('Diagnostics', currentPatient);
          setLoadingContext!(true);
          props.navigation.navigate(AppRoutes.YourOrdersTest, {
            isTest: true,
          });
        }}
        container={{
          marginBottom: 24,
          marginTop: 20,
        }}
        title={'My Orders'}
        leftIcon={<TestsIcon />}
      />
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

  const errorAlert = () => {
    showAphAlert!({
      title: string.common.uhOh,
      description: 'Unable to fetch package details.',
    });
  };

  const fetchPackageDetails = (
    itemIds: string,
    func: (
      product: findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics
    ) => void
  ) => {
    const removeSpaces = itemIds.replace(/\s/g, '');
    const arrayOfId = removeSpaces.split(',');
    const listOfIds = arrayOfId.map((item) => parseInt(item!));
    {
      setLoadingContext!(true);
      client
        .query<findDiagnosticsByItemIDsAndCityID, findDiagnosticsByItemIDsAndCityIDVariables>({
          query: GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
          context: {
            sourceHeaders,
          },
          variables: {
            cityID: parseInt(diagnosticServiceabilityData?.cityId!) || 9,
            itemIDs: listOfIds,
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          setLoadingContext!(false);
          aphConsole.log('findDiagnosticsItemsForCityId\n', { data });
          const product = g(data, 'findDiagnosticsByItemIDsAndCityID', 'diagnostics', '0' as any);
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
    savePastSearch(`${itemId}`, itemName).catch((e) => {
      aphConsole.log({ e });
    });
    // postDiagnosticAddToCartEvent(stripHtml(itemName), `${itemId}`, rate, rate, 'Partial search');
    //passed zero till the time prices aren't updated.
    postDiagnosticAddToCartEvent(stripHtml(itemName), `${itemId}`, 0, 0, 'Partial search');
    addCartItem!({
      id: `${itemId}`,
      name: stripHtml(itemName),
      price: pricesObject?.rate || 0,
      specialPrice: pricesObject?.specialPrice! || pricesObject?.rate || 0,
      circlePrice: pricesObject?.circlePrice,
      circleSpecialPrice: pricesObject?.circleSpecialPrice,
      discountPrice: pricesObject?.discountPrice,
      discountSpecialPrice: pricesObject?.discountSpecialPrice,
      mou: inclusions == null ? 1 : inclusions?.length,
      thumbnail: '',
      collectionMethod: collectionType! || TEST_COLLECTION_TYPE?.HC,
      groupPlan: selectedPlan?.groupPlan || DIAGNOSTIC_GROUP_PLAN.ALL,
      packageMrp: pricesObject?.mrpToDisplay || 0,
      inclusions: inclusions == null ? [Number(itemId)] : inclusions,
    });
  };

  const [searchText, setSearchText] = useState<string>('');
  const [diagnosticResults, setDiagnosticResults] = useState<
    searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics[]
  >([]);
  const [searchSate, setsearchSate] = useState<'load' | 'success' | 'fail' | undefined>();
  const [isSearchFocused, setSearchFocused] = useState(false);
  const client = useApolloClient();

  const onSearchTest = async (_searchText: string) => {
    if (isValidSearch(_searchText)) {
      if (!g(locationForDiagnostics, 'cityId')) {
        renderLocationNotServingPopup();
        return;
      }
      if (!(_searchText && _searchText.length > 2)) {
        setDiagnosticResults([]);
        return;
      }
      setShowMatchingMedicines(true);
      setsearchSate('load');
      try {
        const res: any = await getDiagnosticsSearchResults(
          'diagnostic',
          _searchText,
          parseInt(locationForDiagnostics?.cityId!, 10)
        );
        if (res?.data?.success) {
          const products = g(res, 'data', 'data') || [];
          setDiagnosticResults(
            products as searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics[]
          );
          setSearchResults(products?.length == 0);
          setsearchSate('success');
          setWebEngageEventOnSearchItem(_searchText, products);
        } else {
          setDiagnosticResults([]);
          setSearchResults(true);
          setsearchSate('success');
        }
      } catch (error) {
        CommonBugFender('Tests_onSearchTests', error);
        setsearchSate('fail'); //handle this case
      }
    }
  };

  const getUserSubscriptionsByStatus = async () => {
    setLoadingContext!(true);
    try {
      const query: GetSubscriptionsOfUserByStatusVariables = {
        mobile_number: g(currentPatient, 'mobileNumber'),
        status: ['active', 'deferred_inactive'],
      };
      const res = await client.query<GetSubscriptionsOfUserByStatus>({
        query: GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
        fetchPolicy: 'no-cache',
        variables: query,
      });
      const data = res?.data?.GetSubscriptionsOfUserByStatus?.response;
      setLoadingContext!(false);
      if (data) {
        if (data?.APOLLO?.[0]._id) {
          setCircleSubscriptionId && setCircleSubscriptionId(data?.APOLLO?.[0]._id);
          setIsCircleSubscription && setIsCircleSubscription(true);
          setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(true);
          const planValidity = {
            startDate: data?.APOLLO?.[0]?.start_date,
            endDate: data?.APOLLO?.[0]?.end_date,
          };
          setCirclePlanValidity && setCirclePlanValidity(planValidity);
        } else {
          setCircleSubscriptionId && setCircleSubscriptionId('');
          setIsCircleSubscription && setIsCircleSubscription(false);
          setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(false);
          setCirclePlanValidity && setCirclePlanValidity(null);
        }

        if (data?.HDFC?.[0]._id) {
          setHdfcSubscriptionId && setHdfcSubscriptionId(data?.HDFC?.[0]._id);

          const planName = data?.HDFC?.[0].name;
          setHdfcPlanName && setHdfcPlanName(planName);

          if (planName === hdfc_values.PLATINUM_PLAN && data?.HDFC?.[0].status === 'active') {
            setIsFreeDelivery && setIsFreeDelivery(true);
          }
        } else {
          setHdfcSubscriptionId && setHdfcSubscriptionId('');
          setHdfcPlanName && setHdfcPlanName('');
        }
      }
    } catch (error) {
      setLoadingContext!(false);
      CommonBugFender('Diagnositic_Landing_Page_Tests_GetSubscriptionsOfUserByStatus', error);
    }
  };

  const [scrollOffset, setScrollOffset] = useState<number>(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
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
            borderRadius: 5,
            backgroundColor: colors.WHITE,
            marginHorizontal: 10,
            borderWidth: 1,
            borderColor: colors.APP_GREEN,
          }
        : {
            borderRadius: 5,
            backgroundColor: colors.WHITE, //'#f7f8f5'
            marginHorizontal: 10,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: colors.APP_GREEN,
          },
      leftIconContainerStyle: scrollOffset > 10 ? { paddingLeft: isSearchFocused ? 0 : 16 } : {},
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
      searchViewShadow: {
        shadowColor: colors.SHADOW_GRAY,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
      },
    });

    const shouldEnableSearchSend = searchText.length > 2;
    const rigthIconView = (
      <TouchableOpacity
        activeOpacity={1}
        style={{
          opacity: shouldEnableSearchSend ? 1 : 0.4,
          marginRight: 5,
        }}
        disabled={!shouldEnableSearchSend}
        onPress={() => {
          props.navigation.navigate(AppRoutes.SearchTestScene, {
            searchText: searchText,
          });
          setSearchText('');
          setDiagnosticResults([]);
        }}
      >
        <SearchSendIcon />
      </TouchableOpacity>
    );

    const leftIconView = (
      <SearchIcon
        style={{
          marginLeft: -16,
          height: 21,
          width: 21,
          tintColor: colors.APP_GREEN,
          marginRight: 5,
        }}
      />
    );

    const itemsNotFound = searchSate == 'success' && searchText.length > 2 && searchResult;
    return (
      <View
        pointerEvents={isDiagnosticLocationServiceable ? 'auto' : 'none'}
        style={styles.searchViewShadow}
      >
        <Input
          autoFocus={!locationDetails ? false : focusSearch}
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
            setDiagnosticResults([]);
            setSearchText('');
            setsearchSate('success');
          }}
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
              if (value?.length >= 3) {
                setsearchSate('load');
              }
              setSearchQuery((prevSearch: any) => {
                if (prevSearch.cancel) {
                  prevSearch.cancel();
                }
                return search;
              });
              search(value);
            }
          }}
          leftIcon={isSearchFocused ? <View /> : leftIconView}
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
                  borderColor: '#890000',
                }
              : {},
          ]}
          leftIconContainerStyle={styles.leftIconContainerStyle}
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
      </View>
    );
  };

  const renderDeliverToLocationMenuAndCTA = () => {
    const options = ['Auto Select Pincode', 'Enter Pincode Manually'].map((item) => ({
      key: item,
      value: item,
    }));

    return (
      <MaterialMenu
        options={options}
        itemContainer={styles.menuItemContainer}
        menuContainerStyle={[
          styles.menuMenuContainerStyle,
          {
            marginTop: hasLocation ? winWidth * 0.08 : 35,
            marginLeft: 10,
          },
        ]}
        scrollViewContainerStyle={styles.menuScrollViewContainerStyle}
        itemTextStyle={styles.menuItemTextStyle}
        bottomPadding={styles.menuBottomPadding}
        onPress={(item) => {
          if (item.value == options[0].value) {
            autoDetectLocation();
            setOptionSelected('Auto Detect');
          } else {
            setshowLocationpopup(true);
            setOptionSelected('Enter Manually');
          }
        }}
      >
        {renderDeliverToLocationCTA()}
      </MaterialMenu>
    );
  };

  const formatText = (text: string, count: number) =>
    text.length > count ? `${text.slice(0, count)}...` : text;

  const renderDeliverToLocationCTA = () => {
    const location = diagnosticLocation
      ? `${formatText(
          g(diagnosticLocation, 'city') || g(diagnosticLocation, 'state') || '',
          18
        )} ${g(diagnosticLocation, 'pincode')}`
      : `${formatText(g(locationDetails, 'city') || g(locationDetails, 'state') || '', 18)} ${g(
          locationDetails,
          'pincode'
        )}`;
    return (
      <View style={{ paddingLeft: 15, marginTop: 3.5 }}>
        {hasLocation ? (
          <View style={{ marginTop: -7.5, marginRight: 40 }}>
            <View style={{ flexDirection: 'row' }}>
              <View>
                <Text style={[styles.locationText, { textTransform: 'capitalize' }]}>
                  {location}
                </Text>
                {!serviceabilityMsg ? null : ( // <Spearator style={styles.locationTextUnderline} />
                  <View style={{ height: 2 }} />
                )}
              </View>

              <View style={styles.dropdownGreenContainer}>
                <LocationOn />
              </View>
            </View>
          </View>
        ) : (
          <View style={{ marginTop: -3, marginRight: 3 }}>
            <LocationOff />
          </View>
        )}
      </View>
    );
  };

  const renderDot = (active: boolean) => (
    <View
      style={[styles.sliderDotStyle, { backgroundColor: active ? colors.APP_GREEN : '#d8d8d8' }]}
    />
  );

  const renderBanner = () => {
    if (loading || bannerLoading) {
      return (
        <View style={[styles.sliderPlaceHolderStyle, { height: imgHeight }]}>
          <Spinner style={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }} />
        </View>
      );
    } else if (banners?.length > 0) {
      return (
        <View style={{ marginBottom: 10 }}>
          <Carousel
            onSnapToItem={setSlideIndex}
            data={banners}
            renderItem={renderSliderItem}
            sliderWidth={winWidth}
            itemWidth={winWidth}
            loop={true}
            autoplay={true}
            autoplayDelay={3000}
            autoplayInterval={3000}
          />
          <View style={styles.landingBannerInnerView}>
            {banners.map((_, index) => (index == slideIndex ? renderDot(true) : renderDot(false)))}
          </View>
        </View>
      );
    }
  };

  const renderSliderItem = ({ item, index }: { item: any; index: number }) => {
    const handleOnPress = () => {
      if (item?.redirectUrl) {
        const data = item?.redirectUrl.split('=')[1];
        const extractData = data?.replace('apollopatients://', '');
        const getNavigationDetails = extractData.split('?');
        const route = getNavigationDetails[0];
        let itemId = '';
        try {
          if (getNavigationDetails.length >= 2) {
            itemId = getNavigationDetails[1].split('&');
            if (itemId.length > 0) {
              itemId = itemId[0];
            }
          }
        } catch (error) {}
        if (route == 'TestDetails') {
          props.navigation.navigate(AppRoutes.TestDetails, {
            itemId: itemId,
          });
        }
      }
    };
    return (
      <TouchableOpacity activeOpacity={1} onPress={handleOnPress}>
        <ImageNative
          resizeMode="stretch"
          style={{ width: '100%', minHeight: imgHeight }}
          source={{ uri: item.bannerImage }}
        />
      </TouchableOpacity>
    );
  };

  const savePastSearch = (sku: string, name: string) =>
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

  const renderSearchSuggestionItemView = (data: ListRenderItemInfo<any>) => {
    const { index, item } = data;

    return (
      <DiagnosticsSearchSuggestionItem
        onPress={() => {
          CommonLogEvent(AppRoutes.Tests, 'Search suggestion Item');
          props.navigation.navigate(AppRoutes.TestDetails, {
            itemId: item?.diagnostic_item_id,
            source: 'Partial Search',
          });
        }}
        onPressAddToCart={() => {
          onAddCartItem(item?.diagnostic_item_id, item?.diagnostic_item_name);
        }}
        data={item}
        loading={true}
        showSeparator={index !== diagnosticResults?.length - 1}
        style={{
          marginHorizontal: 20,
          paddingBottom: index == diagnosticResults?.length - 1 ? 20 : 0,
        }}
        onPressRemoveFromCart={() => removeCartItem!(`${item?.diagnostic_item_id}`)}
      />
    );
  };

  const renderSearchSuggestions = () => {
    const showResults = !!searchText && searchText?.length > 2 && diagnosticResults?.length > 0;
    const isLoading = searchSate == 'load';
    return (
      <>
        {isLoading ? (
          <View style={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }}>
            {renderSectionLoader(330)}
          </View>
        ) : (
          !!showResults && (
            <View>
              <FlatList
                keyboardShouldPersistTaps="always"
                // contentContainerStyle={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }}
                bounces={false}
                keyExtractor={(_, index) => `${index}`}
                showsVerticalScrollIndicator={true}
                persistentScrollbar={true}
                style={{
                  paddingTop: 10.5,
                  maxHeight: 266,
                  backgroundColor: '#f7f8f5',
                }}
                data={diagnosticResults}
                // extraData={itemsLoading}
                renderItem={renderSearchSuggestionItemView}
              />
              {diagnosticResults?.length > 6 && (
                <View style={styles.viewAllContainer}>
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      props.navigation.navigate(AppRoutes.SearchTestScene, {
                        searchText: searchText,
                      });
                      setSearchText('');
                      setDiagnosticResults([]);
                    }}
                    style={styles.viewAllTouchView}
                  >
                    <Text style={styles.viewAllText}>VIEW ALL RESULTS</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )
        )}
      </>
    );
  };

  const renderBottomViews = () => {
    const isWidget = widgetsData?.length > 0;
    const isWidget1 =
      isWidget && widgetsData?.find((item: any) => item?.diagnosticwidgetsRankOrder == '1');
    const isWidget2 =
      isWidget && widgetsData?.find((item: any) => item?.diagnosticwidgetsRankOrder == '2');
    const isWidget3 =
      isWidget && widgetsData?.find((item: any) => item?.diagnosticwidgetsRankOrder == '3');
    const restWidgets =
      isWidget && widgetsData?.length > 3 && widgetsData?.slice(3, widgetsData?.length);
    return (
      <>
        {!!isWidget1 ? renderWidgets(isWidget1) : null}
        {renderCarouselBanners()}
        {!!isWidget2 ? renderWidgets(isWidget2) : null}
        {renderWhyBookUs()}
        {!!isWidget3 ? renderWidgets(isWidget3) : null}
        {renderCertificateView()}
        {!!restWidgets && restWidgets.map((item: any) => renderWidgets(item))}
      </>
    );
  };

  const renderWidgets = (data: any) => {
    if (data?.diagnosticWidgetType == 'Package') {
      return renderPackageWidget(data);
    } else {
      return renderTestWidgets(data);
    }
  };

  const renderPackageWidget = (data: any) => {
    const showViewAll = data?.diagnosticWidgetData?.length > 13;
    return (
      <View>
        {!!data && data?.diagnosticWidgetData?.length > 0 ? (
          <>
            <SectionHeader
              leftText={nameFormater(data?.diagnosticWidgetTitle, 'upper')}
              leftTextStyle={styles.widgetHeading}
              rightText={showViewAll ? 'VIEW ALL' : ''}
              rightTextStyle={showViewAll ? styles.widgetViewAllText : {}}
              onPressRightText={
                showViewAll
                  ? () => {
                      props.navigation.navigate(AppRoutes.TestListing, {
                        comingFrom: 'Home Page',
                        data: data,
                      });
                    }
                  : undefined
              }
              style={showViewAll ? { paddingBottom: 1 } : {}}
            />
            {loading ? (
              renderSectionLoader(188)
            ) : (
              <PackageCard
                data={data}
                isCircleSubscribed={isDiagnosticCircleSubscription}
                isServiceable={isDiagnosticLocationServiceable == 'true'}
                isVertical={false}
                navigation={props.navigation}
                source={'Home Page'}
              />
            )}
          </>
        ) : null}
      </View>
    );
  };

  const renderTestWidgets = (data: any) => {
    const showViewAll = !!data && data?.diagnosticWidgetData?.length > 13;
    return (
      <View>
        {!!data && data?.diagnosticWidgetData?.length > 0 ? (
          <>
            <SectionHeader
              leftText={nameFormater(data?.diagnosticWidgetTitle, 'upper')}
              leftTextStyle={styles.widgetHeading}
              rightText={showViewAll ? 'VIEW ALL' : ''}
              rightTextStyle={showViewAll ? styles.widgetViewAllText : {}}
              onPressRightText={
                showViewAll
                  ? () => {
                      props.navigation.navigate(AppRoutes.TestListing, {
                        comingFrom: 'Home Page',
                        data: data,
                      });
                    }
                  : undefined
              }
              style={showViewAll ? { paddingBottom: 1 } : {}}
            />
            {loading ? (
              renderSectionLoader(188)
            ) : (
              <ItemCard
                data={data}
                isCircleSubscribed={isDiagnosticCircleSubscription}
                isServiceable={isDiagnosticLocationServiceable == 'true'}
                isVertical={false}
                navigation={props.navigation}
                source={'Home Page'}
              />
            )}
          </>
        ) : null}
      </View>
    );
  };

  const renderWhyBookUs = () => {
    return (
      <View style={{ marginBottom: 10, marginTop: '2%' }}>
        <View style={{ marginLeft: 32 }}>
          <Text style={styles.whyBookUsHeading}>{nameFormater('why book with us', 'upper')} ?</Text>
        </View>
        <Carousel
          onSnapToItem={setBookUsSlideIndex}
          data={whyBookUsArray}
          renderItem={renderWhyBookUsSlider}
          sliderWidth={winWidth}
          itemWidth={winWidth}
          loop={true}
          autoplay={true}
          autoplayDelay={3000}
          autoplayInterval={3000}
        />
        <View style={[styles.landingBannerInnerView, { bottom: 0 }]}>
          {whyBookUsArray?.map((_, index) =>
            index == bookUsSlideIndex ? renderDot(true) : renderDot(false)
          )}
        </View>
      </View>
    );
  };

  const renderWhyBookUsSlider = ({ item, index }: { item: any; index: number }) => {
    const handleOnPress = () => {};
    return (
      <TouchableOpacity activeOpacity={1} onPress={handleOnPress} key={index.toString()}>
        <ImageNative
          resizeMode="contain"
          style={{ width: '100%', minHeight: imgHeight, resizeMode: 'contain' }}
          source={item?.image}
        />
      </TouchableOpacity>
    );
  };

  function showBookingModal() {
    !showbookingStepsModal && setShowBookingStepsModal(true);
  }

  const renderStepsToBook = () => {
    return (
      <ListCard
        onPress={() => {
          renderBookingStepsModal();
        }}
        container={{
          marginBottom: 24,
          marginTop: 20,
        }}
        title={string.diagnostics.stepsToBook}
        leftIcon={<WorkflowIcon />}
        rightIcon={<ArrowRightYellow style={{ resizeMode: 'contain' }} />}
        titleStyle={{
          color: colors.SHERPA_BLUE,
          ...theme.fonts.IBMPlexSansMedium(13),
          lineHeight: 18,
        }}
      />
    );
  };

  const renderBookingStepsModal = () => {
    return showAphAlert!({
      unDismissable: isunDismissable(),
      removeTopIcon: true,
      children: (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => setShowBookingStepsModal(false)}
            activeOpacity={1}
            style={{ backgroundColor: 'transparent' }}
          >
            <Remove
              style={{
                position: 'absolute',
                tintColor: colors.APP_YELLOW_COLOR,
                zIndex: 1000,
                alignSelf: 'flex-end',
                height: 30,
                width: 30,
              }}
            />
            <ImageNative
              source={require('@aph/mobile-patients/src/components/ui/icons/stepsForBooking.png')}
              style={{
                height: 510,
                width: winWidth,
                resizeMode: 'cover',
                backgroundColor: 'transparent',
              }}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  };

  const renderCertificateView = () => {
    return (
      <CertifiedCard
        titleText={string.diagnostics.certificateText}
        titleStyle={{
          color: colors.SHERPA_BLUE,
          ...theme.fonts.IBMPlexSansMedium(13),
          lineHeight: 18,
        }}
        leftIcon={<ShieldIcon />}
        bottomView={renderCertificateImages()}
      />
    );
  };

  const renderCertificateImages = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: '4%' }}>
        {imagesArray.map((img) => (
          <Image source={img} style={{ height: 36, width: 70 }} resizeMode={'contain'} />
        ))}
      </View>
    );
  };

  const renderSections = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (diagnosticResults.length == 0 && !searchText) return;
          setSearchText('');
          setDiagnosticResults([]);
        }}
        style={{ flex: 1 }}
      >
        {/* {uploadPrescriptionCTA()} */}
        {renderYourOrders()}
        {renderBanner()}
        {renderStepsToBook()}

        {renderBottomViews()}
      </TouchableOpacity>
    );
  };

  const renderCartDetails = () => {
    return (
      <View style={styles.cartDetailView}>
        <Text style={styles.itemAddedText}>
          {cartItems?.length} {cartItems?.length == 1 ? 'Item' : 'Items'} Added to Cart
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => props.navigation.navigate(AppRoutes.MedAndTestCart)}
        >
          <Text style={styles.goToCartText}>GO TO CART</Text>
        </TouchableOpacity>
      </View>
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

  const renderLocationNotServingPopUpForPincode = (pincode: string) => {
    return (
      <View>
        <View>
          <Text>SORRY!</Text>
          <Text>
            This area is not serviceable by us yet.\n Until then please try please try different
            location
          </Text>
          <View>
            <TouchableOpacity>
              <Text>OK, GOT IT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderOverlay = () => {
    const isNoResultsFound =
      searchSate != 'load' && searchText.length > 2 && diagnosticResults?.length == 0;

    return (
      (!!diagnosticResults.length || searchSate == 'load' || isNoResultsFound) && (
        <View style={theme.viewStyles.overlayStyle}>
          <TouchableOpacity
            activeOpacity={1}
            style={theme.viewStyles.overlayStyle}
            onPress={() => {
              if (diagnosticResults?.length == 0 && !searchText) return;
              setSearchText('');
              setDiagnosticResults([]);
              setSearchFocused(false);
            }}
          />
        </View>
      )
    );
  };

  const renderDiagnosticHeader = () => {
    const localStyles = StyleSheet.create({
      headerContainer: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        paddingTop: 16,
        paddingBottom: serviceabilityMsg ? 0 : 10,
        backgroundColor: '#fff',
      },
      deliverToText: { ...theme.viewStyles.text('R', 11, '#01475b', 1, 16) },
      locationText: { ...theme.viewStyles.text('M', 14, '#01475b', 1, 18) },
      locationTextUnderline: {
        height: 2,
        backgroundColor: '#00b38e',
        opacity: 1,
      },
      dropdownGreenContainer: { justifyContent: 'flex-end', marginBottom: -2 },
      serviceabilityMsg: { ...theme.viewStyles.text('R', 10, '#890000') },
    });

    const renderIcon = () => (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          props.navigation.dispatch(
            StackActions.reset({
              index: 0,
              key: null,
              actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
            })
          );
        }}
      >
        <HomeIcon style={{ height: 33, width: 33, resizeMode: 'contain' }} />
      </TouchableOpacity>
    );

    const renderCartIcon = () => (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={{ alignItems: 'flex-end' }}
          activeOpacity={1}
          onPress={() => props.navigation.navigate(AppRoutes.MedAndTestCart)}
        >
          <CartIcon />
          {cartItemsCount > 0 && <Badge label={cartItemsCount} />}
        </TouchableOpacity>
      </View>
    );

    const renderNotificationIcon = () => {
      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            props.navigation.navigate(AppRoutes.NotificationScreen);
          }}
        >
          <NotificationIcon style={{ marginLeft: 10, marginRight: 5 }} />
          {notificationCount > 0 && renderBadge(notificationCount, {})}
        </TouchableOpacity>
      );
    };

    return (
      <View style={localStyles.headerContainer}>
        {renderIcon()}
        {renderDeliverToLocationCTA()}
        {renderCartIcon()}
        {renderNotificationIcon()}
      </View>
    );
  };

  function isunDismissable() {
    return !defaultAddress && !locationDetails && !pharmacyLocation ? true : false;
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...viewStyles.container }}>
        <View style={{ backgroundColor: 'white' }}>
          {renderDiagnosticHeader()}
          {!!serviceabilityMsg && (
            <View style={styles.serviceabiltyMessageBackground}>
              <View style={styles.serviceabiltyMessageView}>
                <View style={styles.serviceabiltyMessageInnerView}>
                  <PendingIcon style={styles.pendingIconStyle} />
                  <Text style={styles.serviceabilityMsg}>{serviceabilityMsg}</Text>
                </View>
              </View>
            </View>
          )}
          {renderSearchBar()}
          {renderSearchSuggestions()}
        </View>
        <View style={{ flex: 1 }}>
          <ScrollView
            removeClippedSubviews={true}
            bounces={false}
            style={{ flex: 1, marginBottom: !!cartItems && cartItems?.length > 0 ? 30 : 0 }}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
          >
            {renderSections()}
            {renderOverlay()}
          </ScrollView>
          {!!cartItems && cartItems?.length > 0 ? renderCartDetails() : null}
        </View>
      </SafeAreaView>
      {renderPopup()}
      {showbookingStepsModal ? renderBookingStepsModal() : null}
    </View>
  );
};

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

  menuItemContainer: {
    marginHorizontal: 0,
    padding: 0,
    margin: 0,
  },
  menuMenuContainerStyle: {
    marginLeft: winWidth * 0.25,
    marginTop: 50,
  },
  menuScrollViewContainerStyle: { paddingVertical: 0 },
  menuItemTextStyle: {
    ...theme.viewStyles.text('M', 14, '#01475b'),
    padding: 0,
    margin: 0,
  },
  menuBottomPadding: { paddingBottom: 0 },
  deliverToText: { ...theme.viewStyles.text('R', 11, '#01475b', 1, 16) },
  locationText: { ...theme.viewStyles.text('M', 14, '#01475b', 1, 18) },
  locationTextUnderline: {
    height: 2,
    backgroundColor: '#00b38e',
    opacity: 1,
  },
  dropdownGreenContainer: { justifyContent: 'flex-end', marginBottom: -2 },
  serviceabilityMsg: {
    marginHorizontal: 10,
    ...theme.viewStyles.text('R', 12, '#890000'),
    justifyContent: 'center',
    textAlign: 'left',
  },
  serviceabiltyMessageBackground: {
    backgroundColor: 'white',
  },
  serviceabiltyMessageView: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
    padding: 5,
    borderColor: '#890000',
    borderWidth: 1,
    borderRadius: 5,
  },
  serviceabiltyMessageInnerView: {
    flexDirection: 'row',
    marginHorizontal: 10,
    justifyContent: 'space-between',
  },
  pendingIconStyle: {
    height: 15,
    width: 15,
    resizeMode: 'contain',
    marginTop: '1%',
    tintColor: '#890000',
  },

  sliderPlaceHolderStyle: {
    ...theme.viewStyles.imagePlaceholderStyle,
    width: '100%',
    alignContent: 'center',
    justifyContent: 'center',
  },
  sliderDotStyle: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    marginTop: 9,
  },
  landingBannerInnerView: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  viewAllContainer: {
    paddingVertical: 10,
    paddingHorizontal: 60,
    backgroundColor: '#f7f8f5',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  viewAllTouchView: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FCB716',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  viewAllText: { ...theme.viewStyles.text('B', 15, '#FCB716', 1, 20) },
  widgetViewAllText: {
    ...theme.viewStyles.text('B', 14, theme.colors.APP_YELLOW, 1, 20),
    textAlign: 'right',
  },
  widgetHeading: {
    ...theme.viewStyles.text('B', 16, theme.colors.SHERPA_BLUE, 1, 20),
    textAlign: 'left',
  },
  widgetView: {
    marginLeft: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 32,
    marginBottom: '2%',
  },
  whyBookUsHeading: {
    ...theme.viewStyles.text('SB', 15, theme.colors.SHERPA_BLUE, 0.5, 20),
    textAlign: 'left',
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
  cartDetailView: {
    position: 'absolute',
    backgroundColor: colors.APP_YELLOW_COLOR,
    bottom: 0,
    height: 50,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
