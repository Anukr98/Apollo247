import {
  useAppCommonData,
  LocationData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { FilterScene } from '@aph/mobile-patients/src/components/FilterScene';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { DoctorCard } from '@aph/mobile-patients/src/components/ui/DoctorCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Filter, LocationOff, LocationOn } from '@aph/mobile-patients/src/components/ui/Icons';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { DOCTOR_SPECIALITY_BY_FILTERS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getDoctorsBySpecialtyAndFilters,
  getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors,
  getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsNextAvailability,
  getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_specialty,
  getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsAvailability,
} from '@aph/mobile-patients/src/graphql/types/getDoctorsBySpecialtyAndFilters';
import {
  ConsultMode,
  Gender,
  Range,
  SpecialtySearchType,
  FilterDoctorInput,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  getPlaceInfoByPlaceId,
  GooglePlacesType,
  getPlaceInfoByLatLng,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  doRequestAndAccessLocation,
  g,
  getNetStatus,
  postWebEngageEvent,
  callPermissions,
  postAppsFlyerEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Animated,
  BackHandler,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StyleProp,
  ViewStyle,
  Image,
} from 'react-native';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { AppsFlyerEventName } from '../../helpers/AppsFlyerEvents';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  topView: {
    height: 56,
    borderRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 2,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 24 : 0,
    left: 0,
    right: 0,
    zIndex: 3,
    elevation: 3,
    backgroundColor: theme.colors.WHITE,
    borderBottomWidth: 0,
  },
  headingText: {
    paddingBottom: 8,
    color: theme.colors.CARD_HEADER,
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  descriptionText: {
    color: theme.colors.CARD_DESCRIPTION,
    paddingBottom: 20,
    ...theme.fonts.IBMPlexSansMedium(17),
  },
});

let latlng: locationType | null = null;
const key = AppConfig.Configuration.GOOGLE_API_KEY;
export interface DoctorSearchListingProps extends NavigationScreenProps {}
export type filterDataType = {
  label: string;
  options: string[];
  selectedOptions: string[];
};

export type locationType = { lat: number | string; lng: number | string };
export const DoctorSearchListing: React.FC<DoctorSearchListingProps> = (props) => {
  const filterData: filterDataType[] = [
    // {
    //   label: 'City',
    //   options: ['Hyderabad', 'Chennai'],
    //   selectedOptions: [],
    // },
    {
      label: 'Experience In Years',
      options: ['0 - 5', '6 - 10', '11 - 15', '15+'],
      selectedOptions: [],
    },
    {
      label: 'Availability',
      options: ['Now', 'Today', 'Tomorrow', 'Next 3 Days'],
      selectedOptions: [],
    },
    {
      label: 'Fees In Rupees',
      options: ['100 - 500', '501 - 1000', '1000+'],
      selectedOptions: [],
    },
    {
      label: 'Gender',
      options: [Gender.MALE, Gender.FEMALE],
      selectedOptions: [],
    },
    {
      label: 'Language',
      options: ['Hindi', 'English', 'Telugu'],
      selectedOptions: [],
    },
  ];
  const tabs = [
    { title: 'All Consults' },
    { title: 'Online Consults' },
    { title: 'Clinic Visits' },
  ];

  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [showLocationpopup, setshowLocationpopup] = useState<boolean>(false);
  const [displayFilter, setDisplayFilter] = useState<boolean>(false);
  const [currentLocation, setcurrentLocation] = useState<string>('');
  const [locationSearchText, setLocationSearchText] = useState<string>('');
  // const [latlng, setlatlng] = useState<locationType | null>(null);
  const [doctorsList, setDoctorsList] = useState<
    (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors | null)[]
  >([]);
  const [FilterData, setFilterData] = useState<filterDataType[]>([...filterData]);
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [locationSearchList, setlocationSearchList] = useState<{ name: string; placeId: string }[]>(
    []
  );
  const { locationForDiagnostics, locationDetails, setLocationDetails } = useAppCommonData();
  const { clearCartInfo } = useDiagnosticsCart();
  const { showAphAlert, hideAphAlert, setLoading: setLoadingContext } = useUIElements();

  const [doctorsAvailability, setdoctorsAvailability] = useState<
    | (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsAvailability | null)[]
    | null
  >([]);
  // const [doctorAvailalbeSlots, setdoctorAvailalbeSlots] = useState<
  //   (GetDoctorNextAvailableSlot_getDoctorNextAvailableSlot_doctorAvailalbeSlots | null)[] | null
  // >([]);
  // const [doctorIds, setdoctorIds] = useState<(string | null)[]>([]);

  const [doctorsNextAvailability, setdoctorsNextAvailability] = useState<
    | (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsNextAvailability | null)[]
    | null
  >([]);

  const [
    specialities,
    setspecialities,
  ] = useState<getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_specialty | null>(
    null
  );
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);

  const [filterMode, setfilterMode] = useState<ConsultMode>(ConsultMode.BOTH);

  const [scrollY] = useState(new Animated.Value(0));
  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const { generalPhysicians, ent, Urology, Dermatology } = useAppCommonData();

  useEffect(() => {
    if (!currentPatient) {
      console.log('No current patients available');
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    // console.log(generalPhysicians, 'generalPhysicians 1111111');
    // if pincode changed, then don't show local data, fetch from API
    if (
      doctorsList.length === 0 &&
      g(locationDetails, 'pincode') == g(generalPhysicians, 'pinCode')
    ) {
      if (
        generalPhysicians &&
        generalPhysicians.data &&
        props.navigation.getParam('specialityId') === generalPhysicians.id
      ) {
        setData(generalPhysicians.data);
      }
      if (ent && ent.data && props.navigation.getParam('specialityId') === ent.id) {
        setData(ent.data);
      }
      if (
        Dermatology &&
        Dermatology.data &&
        props.navigation.getParam('specialityId') === Dermatology.id
      ) {
        setData(Dermatology.data);
      }
      if (Urology && Urology.data && props.navigation.getParam('specialityId') === Urology.id) {
        setData(Urology.data);
      }
    }
  }, [generalPhysicians, ent, Urology, Dermatology]);

  const client = useApolloClient();
  const params = props.navigation.getParam('specialities') || null;

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the location');
        // fetchCurrentLocation();
      } else {
        console.log('location permission denied');
      }
    } catch (err) {
      CommonBugFender('DoctorSearchListing_requestLocationPermission_try', err);
      console.log(err);
    }
  };

  useEffect(() => {
    // Platform.OS === 'android' && requestLocationPermission();
    getNetStatus()
      .then((status) => {
        if (status) {
          // fetchCurrentLocation();
          fetchSpecialityFilterData(filterMode, FilterData);
        } else {
          setshowSpinner(false);
          setshowOfflinePopup(true);
        }
      })
      .catch((e) => {
        CommonBugFender('DoctorSearchListing_getNetStatus', e);
      });

    // const handleBackPress = async () => {
    //   props.navigation.goBack();
    //   return false;
    // };

    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      //setshowSpinner(true);
      //fetchSpecialityFilterData();
      BackHandler.addEventListener('hardwareBackPress', backDataFunctionality);
    });

    const willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    });

    console.log(locationDetails, 'locationDetails');

    if (!locationDetails) {
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
              style={{ flex: 1, marginRight: 16 }}
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
                    console.log('response', { response });
                    response && setLocationDetails!(response);
                    response && setcurrentLocation(response.displayName);
                    response && setLocationSearchText(response.displayName);
                    response &&
                      fetchSpecialityFilterData(
                        filterMode,
                        FilterData,
                        {
                          lat: response.latitude || '',
                          lng: response.longitude || '',
                        },
                        response.pincode
                      );
                  })
                  .catch((e) => {
                    CommonBugFender('DoctorSearchListing_ALLOW_AUTO_DETECT', e);
                    showAphAlert!({
                      title: 'Uh oh! :(',
                      description: 'Unable to access location.',
                    });
                  })
                  .finally(() => {
                    setLoadingContext!(false);
                  });
              }}
            />
          </View>
        ),
      });
    } else {
      const coordinates = {
        lat: locationDetails.latitude || '',
        lng: locationDetails.longitude || '',
      };
      latlng = coordinates;

      console.log(latlng, 'latlng []');

      fetchSpecialityFilterData(filterMode, FilterData, latlng);
      setcurrentLocation(locationDetails.displayName);
      setLocationSearchText(locationDetails.displayName);
    }
    callPermissions();
    return () => {
      didFocusSubscription && didFocusSubscription.remove();
      willBlurSubscription && willBlurSubscription.remove();
    };
  }, []);

  // const fetchNextSlots = (doctorIds: (string | null)[]) => {
  //   const todayDate = new Date().toISOString().slice(0, 10);

  //   getNextAvailableSlots(client, doctorIds, todayDate)
  //     .then(({ data }: any) => {
  //       try {
  //         console.log(data, 'data res');
  //         if (data) {
  //           if (doctorAvailalbeSlots !== data) {
  //             setdoctorAvailalbeSlots(data);
  //             setshowSpinner(false);
  //           }
  //         }
  //       } catch {}
  //     })
  //     .catch((e: string) => {
  //       setshowSpinner(false);
  //       console.log('Error occured ', e);
  //     });
  // };

  const setData = (data: getDoctorsBySpecialtyAndFilters) => {
    try {
      const filterGetData =
        data && data.getDoctorsBySpecialtyAndFilters ? data.getDoctorsBySpecialtyAndFilters : null;
      if (filterGetData) {
        if (filterGetData.doctors) {
          // const ids = filterGetData.doctors
          //   ? filterGetData.doctors.map((item) => item && item.id)
          //   : [];
          // const prevIds = [...doctorIds];
          // if (ids !== prevIds) {
          //   prevIds.push(...ids);
          //   setdoctorIds(prevIds);
          //   prevIds.length > 0 && fetchNextSlots(prevIds);
          // }
          // prevIds.length === 0 && setshowSpinner(false);
          setDoctorsList(filterGetData.doctors);
        }

        if (filterGetData.doctorsAvailability) {
          setdoctorsAvailability(filterGetData.doctorsAvailability);
          setshowSpinner(false);
        }
        if (filterGetData.specialty) {
          setspecialities(filterGetData.specialty);
          setshowSpinner(false);
        }

        if (filterGetData.doctorsNextAvailability) {
          setdoctorsNextAvailability(filterGetData.doctorsNextAvailability);
          setshowSpinner(false);
        }
      }
    } catch (e) {
      CommonBugFender('DoctorSearchListing_fetchSpecialityFilterData_try', e);
    }
  };

  const fetchSpecialityFilterData = (
    filterMode: ConsultMode = ConsultMode.BOTH,
    SearchData: filterDataType[] = FilterData,
    location: locationType | null = latlng,
    pinCode?: string
  ) => {
    const experienceArray: Range[] = [];
    if (SearchData[0].selectedOptions && SearchData[0].selectedOptions.length > 0)
      SearchData[0].selectedOptions.forEach((element: string) => {
        const splitArray = element.split(' - ');
        let object: Range | null = {};
        if (splitArray.length > 0)
          object = {
            minimum: Number(splitArray[0].replace('+', '')),
            maximum: splitArray.length > 1 ? Number(element.split(' - ')[1]) : -1,
          };
        if (object) {
          experienceArray.push(object);
        }
      });

    const feesArray: Range[] = [];
    if (SearchData[2].selectedOptions && SearchData[2].selectedOptions.length > 0)
      SearchData[2].selectedOptions.forEach((element: string) => {
        const splitArray = element.split(' - ');
        let object: Range | null = {};
        if (splitArray.length > 0)
          object = {
            minimum: Number(splitArray[0].replace('+', '')),
            maximum: splitArray.length > 1 ? Number(element.split(' - ')[1]) : -1,
          };

        if (object) {
          feesArray.push(object);
        }
      });

    let availableNow = {};
    const availabilityArray: string[] = [];
    const today = moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');
    if (SearchData[1].selectedOptions && SearchData[1].selectedOptions.length > 0)
      SearchData[1].selectedOptions.forEach((element: string) => {
        if (element === 'Now') {
          availableNow = {
            availableNow: moment(new Date())
              .utc()
              .format('YYYY-MM-DD hh:mm'),
          };
        } else if (element === 'Today') {
          availabilityArray.push(today);
        } else if (element === 'Tomorrow') {
          availabilityArray.push(
            moment(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
              'YYYY-MM-DD'
            )
          );
        } else if (element === 'Next 3 Days') {
          availabilityArray.push(
            moment(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
              'YYYY-MM-DD'
            )
          );
          availabilityArray.push(
            moment(new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
              'YYYY-MM-DD'
            )
          );
          availabilityArray.push(
            moment(new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD').format(
              'YYYY-MM-DD'
            )
          );
        } else {
          availabilityArray.push(element);
        }
      });

    console.log(params, 'params specialities');

    const specialtyName = params
      ? { specialtyName: params, specialtySearchType: SpecialtySearchType.NAME }
      : [];

    let geolocation = {} as any;
    if (location) {
      geolocation['geolocation'] = {
        latitude: parseFloat(location.lat.toString()),
        longitude: parseFloat(location.lng.toString()),
      };
    }

    console.log(geolocation, 'geolocation');

    const FilterInput: FilterDoctorInput = {
      patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
      specialty: props.navigation.getParam('specialityId') || '',
      // city: SearchData[0].selectedOptions,
      pincode: pinCode || g(locationDetails, 'pincode') || null,
      experience: experienceArray,
      availability: availabilityArray,
      fees: feesArray,
      gender: SearchData[3].selectedOptions,
      language: SearchData[4].selectedOptions,
      ...availableNow,
      // consultMode: filterMode,
      ...specialtyName,
      ...geolocation,
    };
    console.log(FilterInput, 'FilterInput');

    client
      .query<getDoctorsBySpecialtyAndFilters>({
        query: DOCTOR_SPECIALITY_BY_FILTERS,
        fetchPolicy: 'no-cache',
        variables: {
          filterInput: FilterInput,
        },
      })
      .then(({ data }) => {
        console.log(data, 'dataaaaa');
        setData(data);
      })
      .catch((e) => {
        CommonBugFender('DoctorSearchListing_fetchSpecialityFilterData', e);
        setshowSpinner(false);
        console.log('Error occured while searching Doctor', e);
      });
  };

  const handleScroll = () => {
    // console.log(e, 'jvjhvhm');
  };

  const autoSearch = (searchText: string) => {
    getNetStatus()
      .then((status) => {
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
              } catch (e) {
                CommonBugFender('DoctorSearchListing_autoSearch_try', e);
              }
            })
            .catch((error) => {
              CommonBugFender('DoctorSearchListing_autoSearch', error);
              console.log(error);
            });
        }
      })
      .catch((e) => {
        CommonBugFender('DoctorSearchListing_getNetStatus_autoSearch', e);
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
    // getNetStatus().then((status) => {
    //   if (status) {
    //     axios
    //       .get(
    //         `https://maps.googleapis.com/maps/api/place/details/json?placeid=${item.placeId}&key=${key}`
    //       )
    //       .then((obj) => {
    //         try {
    //           if (obj.data.result.geometry && obj.data.result.geometry.location) {
    //             AsyncStorage.setItem(
    //               'location',
    //               JSON.stringify({ latlong: obj.data.result.geometry.location, name: item.name })
    //             );
    //             // setlatlng(obj.data.result.geometry.location);
    //             latlng = obj.data.result.geometry.location;
    //             setshowSpinner(true);
    //             fetchSpecialityFilterData(filterMode, FilterData, latlng);
    //           }
    //         } catch (error) {
    //           console.log(error);
    //         }
    //       })
    //       .catch((error) => {
    //         console.log(error);
    //       });
    //   }
    // });
    console.log('savelatlngplaceId\n', { placeId: item.placeId });
    // update address to context here
    getPlaceInfoByPlaceId(item.placeId)
      .then((response) => {
        const addrComponents = g(response, 'data', 'result', 'address_components') || [];
        const coordinates = g(response, 'data', 'result', 'geometry', 'location')! || {};
        console.log(coordinates, 'coordinates lllll');

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
          setcurrentLocation(item.name);
          setLocationSearchText(item.name);
          setshowSpinner(true);
          const locationData: LocationData = {
            displayName: item.name,
            latitude:
              typeof coordinates.lat == 'string' ? Number(coordinates.lat) : coordinates.lat,
            longitude:
              typeof coordinates.lng == 'string' ? Number(coordinates.lng) : coordinates.lng,
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

          getPlaceInfoByLatLng(coordinates.lat, coordinates.lng)
            .then((response) => {
              const addrComponents =
                g(response, 'data', 'results', '0' as any, 'address_components') || [];
              if (addrComponents.length > 0) {
                fetchSpecialityFilterData(
                  filterMode,
                  FilterData,
                  {
                    lat: coordinates.lat,
                    lng: coordinates.lng,
                  },
                  findAddrComponents('postal_code', addrComponents)
                );
                latlng = {
                  lat: coordinates.lat,
                  lng: coordinates.lng,
                };

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
        CommonBugFender('DoctorSearchListing_getPlaceInfoByPlaceId', error);
        console.log('saveLatlong error\n', error);
      });
  };

  const RightHeader = () => {
    return (
      <View style={{ flexDirection: 'row' }}>
        {currentLocation === '' ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              CommonLogEvent(AppRoutes.DoctorSearchListing, 'Location popup clicked');
              getNetStatus()
                .then((status) => {
                  if (status) {
                    setshowLocationpopup(true);
                    // fetchCurrentLocation();
                  } else {
                    setshowOfflinePopup(true);
                  }
                })
                .catch((e) => {
                  CommonBugFender('DoctorSearchListing_getNetStatus_RightHeader', e);
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
                  {currentLocation.length > 15
                    ? `${currentLocation.substring(0, 15)}...`
                    : currentLocation}
                </Text>
              ) : null}
              <LocationOn />
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          activeOpacity={1}
          style={{ marginLeft: 20 }}
          onPress={() => {
            CommonLogEvent(AppRoutes.DoctorSearchListing, 'Filter view opened');
            setDisplayFilter(true);
          }}
        >
          <Filter />
        </TouchableOpacity>
      </View>
    );
  };

  const backDataFunctionality = async () => {
    BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    const movedata = props.navigation.getParam('MoveDoctor') || '';
    if (movedata == 'MoveDoctor') {
      props.navigation.push(AppRoutes.SymptomChecker);
    } else {
      CommonLogEvent(AppRoutes.DoctorSearchListing, 'Go back clicked');
      props.navigation.goBack();
    }
    return false;
  };

  const renderTopView = () => {
    return (
      <View style={styles.topView}>
        <Header
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          rightComponent={<RightHeader />}
          onPressLeftIcon={backDataFunctionality}
        />
      </View>
    );
  };

  const postDoctorClickWEGEvent = (
    doctorName: string,
    source: WebEngageEvents[WebEngageEventName.DOCTOR_CLICKED]['Source']
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DOCTOR_CLICKED] = {
      'Doctor Name': doctorName,
      Source: source,
    };
    postWebEngageEvent(WebEngageEventName.DOCTOR_CLICKED, eventAttributes);
    postAppsFlyerEvent(AppsFlyerEventName.DOCTOR_CLICKED, eventAttributes);
  };

  const renderSearchDoctorResultsRow = (
    rowData: getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors | null,
    index: number,
    styles: StyleProp<ViewStyle> = {},
    numberOfLines?: number,
    filter?: ConsultMode
  ) => {
    if (rowData) {
      return (
        <DoctorCard
          key={index}
          rowData={rowData}
          navigation={props.navigation}
          doctorsNextAvailability={doctorsNextAvailability}
          style={styles}
          numberOfLines={numberOfLines}
          availableModes={filter ? filter : null}
          onPress={() => {
            postDoctorClickWEGEvent(rowData.fullName!, 'List');
            props.navigation.navigate(AppRoutes.DoctorDetails, {
              doctorId: rowData.id,
            });
          }}
        />
      );
    }
    return null;
  };

  const consultionType = (id: string, filter: ConsultMode) => {
    // console.log(id, 'consultionType', filter);
    // console.log(doctorsAvailability, 'doctorsAvailability');

    let filterType = false;
    doctorsAvailability &&
      doctorsAvailability.forEach((element) => {
        if (
          element &&
          element.doctorId === id &&
          element.availableModes &&
          element.availableModes.includes(filter)
        ) {
          filterType = true;
        }
      });
    return filterType;
  };

  const renderDoctorSearches = (filter?: ConsultMode) => {
    const doctors =
      doctorsList.length && filter // filter
        ? doctorsList.filter(
            (
              obj: getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors | null
            ) => {
              return consultionType(obj!.id, filter) || consultionType(obj!.id, ConsultMode.BOTH);
            }
          )
        : doctorsList;

    // //filter for consults before 15 mins
    // const filterAvailabilityData = doctorsNextAvailability
    //   ? doctorsNextAvailability
    //       .filter((item) => {
    //         if (item && item.referenceSlot) {
    //           const today: Date = new Date();
    //           const date2: Date = new Date(item.referenceSlot);
    //           if (date2 && today) {
    //             const timeDiff = Math.round(((date2 as any) - (today as any)) / 60000);
    //             console.log(timeDiff, 'timeDiff', Number(timeDiff) > 15 || timeDiff < 0);

    //             return Number(timeDiff) > 15 || timeDiff < 0 ? false : true;
    //           }
    //         }
    //       })
    //       .map((item) => item && item.doctorId)
    //   : [];
    // const filteredDoctorsList: (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors | null)[] = [];

    // const doctors = doctorsList.filter((item) => {
    //   if (item) {
    //     if (filterAvailabilityData.includes(item.id)) filteredDoctorsList.push(item);
    //     else return !filterAvailabilityData.includes(item.id);
    //   }
    // });

    // console.log(doctors, 'doctors');
    // console.log(filteredDoctorsList, 'filteredDoctorsList');

    if (doctors.length === 0 && !showSpinner) {
      const specialistSingular =
        specialities && specialities.specialistSingularTerm
          ? specialities.specialistSingularTerm
          : params && params.length === 1
          ? params[0]
          : 'Specialist';
      return (
        <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 64 }}>
          <Card
            cardContainer={{
              marginHorizontal: 64,
              shadowRadius: 0,
              shadowOffset: { width: 0, height: 0 },
              shadowColor: 'white',
              elevation: 0,
            }}
            heading={'Uh oh! :('}
            description={
              filter === ConsultMode.PHYSICAL
                ? `There is no ${specialistSingular} available for Physical Consult. Please you try Online Consultation.`
                : `There is no ${specialistSingular} available to match your filters. Please try again with different filters.`
            }
            descriptionTextStyle={{ fontSize: 14 }}
            headingTextStyle={{ fontSize: 14 }}
          />
        </View>
      );
    }
    return (
      <View>
        {/* {filteredDoctorsList.length > 0 && (
          <View
            style={{
              backgroundColor: theme.colors.WHITE,
              marginTop: 24,
              ...theme.viewStyles.shadowStyle,
            }}
          >
            <Text
              style={{
                ...theme.viewStyles.text('M', 14, theme.colors.SKY_BLUE),
                marginHorizontal: 20,
                paddingTop: 12.5,
                paddingBottom: 5,
              }}
            >
              Consult our best GPs within 15mins!!
            </Text>
            <View
              style={{
                borderBottomColor: 'rgba(0, 135, 186, 0.4)',
                borderBottomWidth: 1,
                marginHorizontal: 20,
              }}
            />
            <FlatList
              contentContainerStyle={{
                // marginTop: 20,
                // marginBottom: 8,
                marginHorizontal: 14,
                paddingRight: 28,
              }}
              bounces={false}
              // data={doctors}
              data={filteredDoctorsList}
              onEndReachedThreshold={0.5}
              renderItem={({ item, index }) =>
                renderSearchDoctorResultsRow(
                  item,
                  index,
                  {
                    width: width - 40,
                    marginHorizontal: 6,
                    marginTop: 11.5,
                    marginBottom: 16,
                    height: 215,
                  },
                  1
                )
              }
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )} */}

        {doctors.length > 0 && (
          <FlatList
            contentContainerStyle={{
              marginTop: 20,
              marginBottom: 8,
            }}
            bounces={false}
            data={doctors}
            onEndReachedThreshold={0.5}
            renderItem={({ item, index }) =>
              renderSearchDoctorResultsRow(item, index, {}, undefined, filter)
            }
          />
        )}
      </View>
    );
  };

  const headMov = scrollY.interpolate({
    inputRange: [0, 180, 181],
    outputRange: [0, -105, -105],
  });
  const headColor = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ['white', 'white'],
  });
  const imgOp = scrollY.interpolate({
    inputRange: [0, 90, 91],
    outputRange: [1, 0, 0],
  });

  const renderAnimatedView = () => {
    return (
      <Animated.View
        style={{
          position: 'absolute',
          height: 156,
          width: '100%',
          top: Platform.OS === 'ios' ? 80 : 56,
          backgroundColor: headColor,
          justifyContent: 'flex-end',
          flexDirection: 'column',
          transform: [{ translateY: headMov }],
          zIndex: 2,
          elevation: 2,
        }}
      >
        <Animated.View style={{ paddingHorizontal: 20, top: 0, opacity: imgOp }}>
          <Text style={styles.headingText}>{string.common.okay}</Text>
          <Text style={styles.descriptionText}>
            {string.common.best_doctor_text}
            {specialities && specialities.specialistPluralTerm
              ? specialities.specialistPluralTerm
              : params && params.length === 1
              ? params[0]
              : 'Specialists'}
          </Text>
        </Animated.View>

        <TabsComponent
          style={{
            backgroundColor: theme.colors.CARD_BG,
            ...theme.viewStyles.cardViewStyle,
            borderRadius: 0,
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 1.0,
          }}
          data={tabs}
          onChange={(selectedTab: string) => {
            // setshowSpinner(true);
            setselectedTab(selectedTab);
            const selectedFilterMode =
              selectedTab === tabs[0].title
                ? ConsultMode.BOTH
                : selectedTab === tabs[1].title
                ? ConsultMode.ONLINE
                : ConsultMode.PHYSICAL;
            setfilterMode(selectedFilterMode);
            // fetchSpecialityFilterData(selectedFilterMode);
            CommonLogEvent(AppRoutes.DoctorSearchListing, selectedFilterMode);
          }}
          selectedTab={selectedTab}
        />
      </Animated.View>
    );
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
                  value={locationSearchText}
                  onChangeText={(value) => {
                    setLocationSearchText(value);
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
                      CommonLogEvent(AppRoutes.DoctorSearchListing, 'Search List clicked');
                      setcurrentLocation(item.name);
                      setLocationSearchText(item.name);
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

  const renderSearchLoadingView = () => {
    const getWidth = (percentage: number) => screenWidth * (percentage / 100);
    const localStyles = StyleSheet.create({
      container: {
        flexDirection: 'row',
        marginTop: 73,
      },
      imageStyle: {
        width: getWidth(50.27),
        height: getWidth(50.27) * 0.88 /* w181, h159, tw360 */,
      },
      pleaseWaitTextStyle: {
        ...theme.viewStyles.text('M', 17, '#0089b7', 1, 26),
        textAlign: 'center',
        marginTop: 25,
      },
      lookingForDoctorsTextStyle: {
        ...theme.viewStyles.text('M', 17, '#9a9a9a', 1, 26),
        textAlign: 'center',
        marginTop: 10,
      },
    });
    return (
      <View>
        <View style={localStyles.container}>
          <View style={{ width: getWidth(20) }} />
          <Image
            style={localStyles.imageStyle}
            source={require('@aph/mobile-patients/src/images/doctor/doctor_search_filler_img.png')}
          />
        </View>
        <Text style={localStyles.pleaseWaitTextStyle}>
          {string.doctor_search_listing.pleaseWait}
        </Text>
        <Text style={localStyles.lookingForDoctorsTextStyle}>
          {string.doctor_search_listing.lookingForBestDoctors}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <SafeAreaView
        style={{
          ...theme.viewStyles.container,
        }}
      >
        <Animated.ScrollView
          style={{ flex: 1 }}
          bounces={false}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingTop: 215,
          }}
          onScroll={Animated.event(
            [
              {
                nativeEvent: { contentOffset: { y: scrollY } },
              },
            ],
            { listener: handleScroll }
          )}
        >
          {showSpinner && renderSearchLoadingView()}
          {!showSpinner && (
            <>
              {selectedTab === tabs[0].title && renderDoctorSearches()}
              {selectedTab === tabs[1].title && renderDoctorSearches(ConsultMode.ONLINE)}
              {selectedTab === tabs[2].title && renderDoctorSearches(ConsultMode.PHYSICAL)}
            </>
          )}
        </Animated.ScrollView>
      </SafeAreaView>
      {displayFilter ? (
        <FilterScene
          onClickClose={() => {
            setDisplayFilter(false);
          }}
          setData={(selecteddata) => {
            setshowSpinner(true);
            setFilterData(selecteddata);
            getNetStatus()
              .then((status) => {
                if (status) {
                  fetchSpecialityFilterData(filterMode, selecteddata);
                  CommonLogEvent(
                    AppRoutes.DoctorSearchListing,
                    `Filter selected data ${selecteddata}`
                  );
                } else {
                  setshowSpinner(false);
                  setshowOfflinePopup(true);
                }
              })
              .catch((e) => {
                CommonBugFender('DoctorSearchListing_getNetStatus_FilterScene', e);
              });
          }}
          filterLength={() => {
            setTimeout(() => {
              setshowSpinner(false);
            }, 500);
          }}
          data={JSON.parse(JSON.stringify(FilterData))}
        />
      ) : null}
      {renderAnimatedView()}
      {renderTopView()}
      {renderPopup()}
      {/* {showSpinner && <Spinner />} */}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
    </View>
  );
};
