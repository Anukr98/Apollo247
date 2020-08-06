import {
  LocationData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { FilterScene } from '@aph/mobile-patients/src/components/FilterScene';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { DoctorCard } from '@aph/mobile-patients/src/components/ui/DoctorCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CheckedIcon,
  CheckUnselectedIcon,
  DoctorFilter,
  LocationOff,
  LocationOn,
  RadioButtonIcon,
  RadioButtonUnselectedIcon,
  SearchIcon,
  RetryButtonIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonBugFender,
  CommonLogEvent,
  setBugFenderLog,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { DOCTOR_SPECIALITY_BY_FILTERS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getDoctorsBySpecialtyAndFilters,
  getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors,
  getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsAvailability,
  getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsNextAvailability,
  getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_specialty,
} from '@aph/mobile-patients/src/graphql/types/getDoctorsBySpecialtyAndFilters';
import {
  ConsultMode,
  FilterDoctorInput,
  Range,
  SpecialtySearchType,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  autoCompletePlaceSearch,
  getPlaceInfoByLatLng,
  getPlaceInfoByPlaceId,
  GooglePlacesType,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import {
  doRequestAndAccessLocationModified,
  g,
  getNetStatus,
  isValidSearch,
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  Platform,
} from 'react-native';
import {
  NavigationActions,
  NavigationScreenProps,
  ScrollView,
  StackActions,
} from 'react-navigation';
import { AppsFlyerEventName, AppsFlyerEvents } from '../../helpers/AppsFlyerEvents';
import { getValuesArray } from '@aph/mobile-patients/src/utils/commonUtils';

const searchFilters = require('@aph/mobile-patients/src/strings/filters');
const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: 'white' },
  topView: {
    height: 56,
    borderRadius: 0,
    backgroundColor: theme.colors.WHITE,
    borderBottomWidth: 0,
  },
  shadowStyle: {
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 15 },
    zIndex: 1,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  consultHeadingText: {
    textAlign: 'center',
    marginVertical: 20,
    ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE),
  },
  sortByTextStyle: {
    ...theme.viewStyles.text('M', 8, theme.colors.SHERPA_BLUE),
    marginLeft: 13,
    marginTop: 13,
  },

  bottomMainContainer: { backgroundColor: theme.colors.WHITE },
  bottomOptionsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    marginHorizontal: 13,
    justifyContent: 'space-between',
  },
  bottomItemContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomCenterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  seperator: {
    height: 34,
    width: 0.5,
    backgroundColor: '#b4b4b4',
  },
  searchContainer: {
    paddingHorizontal: 20,
    backgroundColor: theme.colors.WHITE,
    paddingTop: 10,
    paddingBottom: 22,
  },
  inputTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHERPA_BLUE,
    paddingBottom: 5,
  },
  topTabBar: {
    backgroundColor: '#f7f8f5',
    flexDirection: 'row',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  docTypeCont: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 4,
  },
});

let latlng: locationType | null = null;

export interface DoctorSearchListingProps extends NavigationScreenProps {}
export type filterDataType = {
  label: string;
  options: string[];
  selectedOptions: string[];
};

export type locationType = { lat: number | string; lng: number | string };
export const DoctorSearchListing: React.FC<DoctorSearchListingProps> = (props) => {
  const specialistPluralTerm = props.navigation.getParam('specialistPluralTerm');
  const docFilters = props.navigation.getParam('filters');
  const typeOfConsult = props.navigation.getParam('typeOfConsult');
  const doctorTypeFilter = props.navigation.getParam('doctorType');
  const cityFilter = props.navigation.getParam('city');
  const brandFilter = props.navigation.getParam('brand');
  const [docFiltersOptions, setDocFilterOptions] = useState<any>(docFilters);
  const [showLocationpopup, setshowLocationpopup] = useState<boolean>(false);
  const [displayFilter, setDisplayFilter] = useState<boolean>(false);
  const [currentLocation, setcurrentLocation] = useState<string>('');
  const [locationSearchText, setLocationSearchText] = useState<string>('');

  const [doctorsList, setDoctorsList] = useState<
    (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors | null)[]
  >([]);
  const [filteredDoctorsList, setFilteredDoctorsList] = useState<
    (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors | null)[]
  >([]);
  const [doctorsType, setDoctorsType] = useState<string>('APOLLO');
  const [apolloDocsNumber, setApolloDocsNumber] = useState<number>(0);
  const [partnerDocsNumber, setPartnerDocsNumber] = useState<number>(0);

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

  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const { generalPhysicians, ent, Urology, Dermatology } = useAppCommonData();
  const [showLocations, setshowLocations] = useState<boolean>(false);
  const [value, setValue] = useState<boolean>(false);
  const [sortValue, setSortValue] = useState<string>('');
  const [searchIconClicked, setSearchIconClicked] = useState<boolean>(false);

  const preFilters = docFilters === undefined ? searchFilters : docFilters;
  const filterData: filterDataType[] = [
    {
      label: 'City',
      options: preFilters['city'],
      selectedOptions: [],
    },
    {
      label: 'Brands',
      options: preFilters['brands'],
      selectedOptions: [],
    },
    {
      label: 'In Years',
      options: getValuesArray(preFilters['experience']),
      selectedOptions: [],
    },
    {
      label: 'Availability',
      options: getValuesArray(preFilters['availability']),
      selectedOptions: [],
    },
    {
      label: 'In Rupees',
      options: getValuesArray(preFilters['fee']),
      selectedOptions: [],
    },
    {
      label: '',
      options: getValuesArray(preFilters['gender']),
      selectedOptions: [],
    },
    {
      label: '',
      options: getValuesArray(preFilters['language']),
      selectedOptions: [],
    },
  ];
  const [FilterData, setFilterData] = useState<filterDataType[]>([...filterData]);
  const callSaveSearch = props.navigation.getParam('callSaveSearch');

  useEffect(() => {
    setDeepLinkFilter();
    setDeepLinkDoctorTypeFilter();
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    if (doctorsList.length === 0) {
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

  const vaueChange = (data: any) => {
    const filterGetData =
      data && data.getDoctorsBySpecialtyAndFilters ? data.getDoctorsBySpecialtyAndFilters : null;
    if (filterGetData.sort === 'distance') {
      setNearyByFlag(true);
      setAvailabilityFlag(false);
    } else {
      setAvailabilityFlag(true);
      setNearyByFlag(false);
    }
  };

  const client = useApolloClient();
  const params = props.navigation.getParam('specialities') || null;

  useEffect(() => {
    getNetStatus()
      .then((status) => {
        if (status) {
          // fetchSpecialityFilterData(filterMode, FilterData);
        } else {
          setshowSpinner(false);
          setshowOfflinePopup(true);
        }
      })
      .catch((e) => {
        CommonBugFender('DoctorSearchListing_getNetStatus', e);
      });

    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', backDataFunctionality);
    });

    const willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    });

    if (locationDetails) {
      const coordinates = {
        lat: locationDetails.latitude || '',
        lng: locationDetails.longitude || '',
      };
      latlng = coordinates;

      fetchSpecialityFilterData(filterMode, FilterData, latlng);
      setcurrentLocation(locationDetails.displayName);
      setLocationSearchText(locationDetails.displayName);
    }
    return () => {
      didFocusSubscription && didFocusSubscription.remove();
      willBlurSubscription && willBlurSubscription.remove();
    };
  }, []);

  const filterDoctors = (
    data: (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors | null)[],
    type: string,
    searchText: string = doctorSearch
  ) => {
    const doctorsApollo =
      data && data.length && searchText
        ? data.filter(
            (i) =>
              i &&
              (i.fullName || '')
                .toString()
                .toLowerCase()
                .includes(searchText.toLowerCase())
          )
        : data;
    if (type == 'APOLLO') {
      const apolloDoctors = doctorsApollo.filter((item) => {
        return item && item.doctorType !== 'DOCTOR_CONNECT';
      });
      setFilteredDoctorsList(apolloDoctors);
      setApolloDocsNumber(apolloDoctors.length);
      setPartnerDocsNumber(doctorsApollo.length - apolloDoctors.length);
    } else {
      const otherDoctors = doctorsApollo.filter((item) => {
        return item && item.doctorType === 'DOCTOR_CONNECT';
      });
      setFilteredDoctorsList(otherDoctors);
      setApolloDocsNumber(doctorsApollo.length - otherDoctors.length);
      setPartnerDocsNumber(otherDoctors.length);
    }
  };

  const setData = (data: getDoctorsBySpecialtyAndFilters) => {
    try {
      const filterGetData =
        data && data.getDoctorsBySpecialtyAndFilters ? data.getDoctorsBySpecialtyAndFilters : null;
      if (filterGetData) {
        if (filterGetData.doctors) {
          setDoctorsList(filterGetData.doctors);
          filterDoctors(filterGetData.doctors, doctorsType);
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
      setshowSpinner(false);
    }
  };

  const checkLocation = () => {
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
                doRequestAndAccessLocationModified()
                  .then((response) => {
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
                        'distance',
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
      fetchSpecialityFilterData(filterMode, FilterData, latlng, 'distance');
    }
  };

  const fetchSpecialityFilterData = (
    filterMode: ConsultMode = ConsultMode.BOTH,
    SearchData: filterDataType[] = FilterData,
    location: locationType | null = latlng,
    sort: string | null = sortValue,
    pinCode?: string
  ) => {
    const experienceArray: Range[] = [];
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
          experienceArray.push(object);
        }
      });

    const feesArray: Range[] = [];
    if (SearchData[4].selectedOptions && SearchData[4].selectedOptions.length > 0)
      SearchData[4].selectedOptions.forEach((element: string) => {
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
    if (SearchData[3].selectedOptions && SearchData[3].selectedOptions.length > 0)
      SearchData[3].selectedOptions.forEach((element: string) => {
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

    const specialtyName = params
      ? { specialtyName: params, specialtySearchType: SpecialtySearchType.NAME }
      : [];

    const geolocation = {} as any;
    if (location) {
      geolocation['geolocation'] = {
        latitude: parseFloat(location.lat.toString()),
        longitude: parseFloat(location.lng.toString()),
      };
    }

    const FilterInput: FilterDoctorInput = {
      patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
      specialty: props.navigation.getParam('specialityId') || '',
      // city: SearchData[0].selectedOptions,
      pincode: pinCode || g(locationDetails, 'pincode') || null,
      doctorType:
        brandFilter === undefined || brandFilter === null
          ? SearchData[1].selectedOptions
          : brandFilter,
      city:
        cityFilter === undefined || cityFilter === null
          ? SearchData[0].selectedOptions
          : cityFilter,
      experience: experienceArray,
      availability: availabilityArray,
      fees: feesArray,
      gender: SearchData[5].selectedOptions,
      language: SearchData[6].selectedOptions,
      ...availableNow,
      // consultMode: filterMode,
      ...specialtyName,
      ...geolocation,
      sort: sort,
    };
    setBugFenderLog('DOCTOR_FILTER_INPUT', JSON.stringify(FilterInput));
    setshowSpinner(true);
    client
      .query<getDoctorsBySpecialtyAndFilters>({
        query: DOCTOR_SPECIALITY_BY_FILTERS,
        fetchPolicy: 'no-cache',
        variables: {
          filterInput: FilterInput,
        },
      })
      .then(({ data }) => {
        setData(data);
        vaueChange(data);
        setshowSpinner(false);
        //log data
        const doctorInfo =
          data &&
          data.getDoctorsBySpecialtyAndFilters &&
          data.getDoctorsBySpecialtyAndFilters.doctors === null
            ? {}
            : data &&
              data.getDoctorsBySpecialtyAndFilters &&
              data.getDoctorsBySpecialtyAndFilters.doctors &&
              data.getDoctorsBySpecialtyAndFilters.doctors[0];
        setBugFenderLog('DOCTOR_FILTER_DATA', JSON.stringify(doctorInfo));
        //end log data
      })
      .catch((e) => {
        CommonBugFender('DoctorSearchListing_fetchSpecialityFilterData', e);
        setshowSpinner(false);
      });
  };

  const autoSearch = (searchText: string) => {
    getNetStatus()
      .then((status) => {
        if (status) {
          autoCompletePlaceSearch(searchText)
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
    // update address to context here
    getPlaceInfoByPlaceId(item.placeId)
      .then((response) => {
        const addrComponents = g(response, 'data', 'result', 'address_components') || [];
        const coordinates = g(response, 'data', 'result', 'geometry', 'location')! || {};

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
                  sortValue,
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
      });
  };

  const RightHeader = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
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
                justifyContent: 'flex-end',
              }}
            >
              <LocationOn />
              {currentLocation ? (
                <Text
                  style={{
                    color: theme.colors.SHERPA_BLUE,
                    ...theme.fonts.IBMPlexSansSemiBold(13),
                    textTransform: 'uppercase',
                    maxWidth: screenWidth / 2,
                  }}
                  numberOfLines={1}
                >
                  {currentLocation}
                </Text>
              ) : null}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const backDataFunctionality = () => {
    BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    const movedata = props.navigation.getParam('MoveDoctor') || '';
    if (movedata == 'MoveDoctor') {
      props.navigation.push(AppRoutes.SymptomChecker);
    } else {
      try {
        const MoveDoctor = props.navigation.getParam('movedFrom') || '';

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
          CommonLogEvent(AppRoutes.DoctorSearchListing, 'Go back clicked');
          props.navigation.goBack();
        }
      } catch (error) {}
    }
    return false;
  };

  const renderTopView = () => {
    return (
      <View style={[styles.topView, styles.shadowStyle]}>
        <Header
          leftIcon="backArrow"
          container={{ borderBottomWidth: 1 }}
          titleTextViewStyle={{ maxWidth: screenWidth / 1.8 }}
          titleComponent={<RightHeader />}
          rightComponent={
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                setSearchIconClicked(!searchIconClicked);
                setDoctorSearch('');
                filterDoctors(doctorsList, doctorsType, '');
              }}
            >
              <View
                style={{ height: 32, width: 32, alignItems: 'center', justifyContent: 'center' }}
              >
                <SearchIcon />
              </View>
            </TouchableOpacity>
          }
          onPressLeftIcon={backDataFunctionality}
        />
      </View>
    );
  };

  const postDoctorClickWEGEvent = (
    doctorDetails: getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors,
    source: WebEngageEvents[WebEngageEventName.DOCTOR_CLICKED]['Source'],
    type?: 'consult-now' | 'book-appointment'
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DOCTOR_CLICKED] = {
      'Doctor Name': doctorDetails.fullName!,
      Source: source,
      'Doctor ID': doctorDetails.id,
      'Speciality ID': g(doctorDetails, 'specialty', 'id')!,
      'Doctor Category': doctorDetails.doctorType,
      'Online Price': Number(doctorDetails.onlineConsultationFees),
      'Physical Price': Number(doctorDetails.physicalConsultationFees),
      'Doctor Speciality': g(doctorDetails, 'specialty', 'name')!,
    };

    const eventAttributesFirebase: FirebaseEvents[FirebaseEventName.DOCTOR_CLICKED] = {
      DoctorName: doctorDetails.fullName!,
      Source: source,
      DoctorID: doctorDetails.id,
      SpecialityID: g(doctorDetails, 'specialty', 'id')!,
      DoctorCategory: doctorDetails.doctorType,
      OnlinePrice: Number(doctorDetails.onlineConsultationFees),
      PhysicalPrice: Number(doctorDetails.physicalConsultationFees),
      DoctorSpeciality: g(doctorDetails, 'specialty', 'name')!,
    };

    if (type == 'consult-now') {
      postWebEngageEvent(WebEngageEventName.CONSULT_NOW_CLICKED, eventAttributes);
      const appsflyereventAttributes: AppsFlyerEvents[AppsFlyerEventName.CONSULT_NOW_CLICKED] = {
        'customer id': currentPatient ? currentPatient.id : '',
        'doctor id': doctorDetails.id,
        'specialty id': g(doctorDetails, 'specialty', 'id')!,
      };
      postAppsFlyerEvent(AppsFlyerEventName.CONSULT_NOW_CLICKED, appsflyereventAttributes);
      postFirebaseEvent(FirebaseEventName.CONSULT_NOW_CLICKED, eventAttributesFirebase);
    } else if (type == 'book-appointment') {
      postWebEngageEvent(WebEngageEventName.BOOK_APPOINTMENT, eventAttributes);
      const appsflyereventAttributes: AppsFlyerEvents[AppsFlyerEventName.BOOK_APPOINTMENT] = {
        'customer id': currentPatient ? currentPatient.id : '',
      };
      postAppsFlyerEvent(AppsFlyerEventName.BOOK_APPOINTMENT, appsflyereventAttributes);
      postFirebaseEvent(FirebaseEventName.BOOK_APPOINTMENT, eventAttributesFirebase);
    } else {
      postWebEngageEvent(WebEngageEventName.DOCTOR_CLICKED, eventAttributes);
      const appsflyereventAttributes: AppsFlyerEvents[AppsFlyerEventName.DOCTOR_CLICKED] = {
        'customer id': currentPatient ? currentPatient.id : '',
        'doctor id': doctorDetails.id,
        'specialty id': g(doctorDetails, 'specialty', 'id')!,
      };
      postAppsFlyerEvent(AppsFlyerEventName.DOCTOR_CLICKED, appsflyereventAttributes);
      postFirebaseEvent(FirebaseEventName.DOCTOR_CLICKED, eventAttributesFirebase);
    }
  };

  const postTabBarClickWEGEvent = (tab: 'APOLLO' | 'PARTNERS') => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.APOLLO_DOCTOR_TAB_CLICKED] = {
      'Patient UHID': g(currentPatient, 'uhid'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    if (tab == 'APOLLO') {
      postWebEngageEvent(WebEngageEventName.APOLLO_DOCTOR_TAB_CLICKED, eventAttributes);
    } else {
      postWebEngageEvent(WebEngageEventName.DOCTOR_CONNECT_TAB_CLICKED, eventAttributes);
    }
  };

  const getDoctorAvailableMode = (id: string) => {
    let availableMode: ConsultMode | null = null;
    if (doctorsAvailability) {
      const itemIndex = doctorsAvailability.findIndex((i) => i && i.doctorId === id);
      if (itemIndex > -1) {
        availableMode = (doctorsAvailability[itemIndex]!.availableModes || [null])[0];
      }
    }
    return availableMode;
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
          availableModes={getDoctorAvailableMode(rowData.id)}
          callSaveSearch={callSaveSearch}
          onPress={() => {
            postDoctorClickWEGEvent(rowData, 'List');
            props.navigation.navigate(AppRoutes.DoctorDetails, {
              doctorId: rowData.id,
              callSaveSearch: callSaveSearch,
            });
          }}
          onPressConsultNowOrBookAppointment={(type) => {
            postDoctorClickWEGEvent(rowData, 'List', type);
          }}
        />
      );
    }
    return null;
  };

  const consultionType = (id: string, filter: ConsultMode) => {
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

  const renderDoctorSearches = (filter?: ConsultMode, searchText?: string) => {
    const doctors =
      filteredDoctorsList.length && filter
        ? filteredDoctorsList.filter(
            (
              obj: getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors | null
            ) => {
              return consultionType(obj!.id, filter) || consultionType(obj!.id, ConsultMode.BOTH);
            }
          )
        : filteredDoctorsList;

    if (doctors.length === 0 && !showSpinner) {
      const eventAttributes: WebEngageEvents[WebEngageEventName.DOCTOR_SPECIALITY_SEARCH_NO_RESULT] = {
        'Text Searched': doctorSearch,
        'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
        'Patient UHID': g(currentPatient, 'uhid'),
        Relation: g(currentPatient, 'relation'),
        'Patient Age': Math.round(
          moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
        ),
        'Patient Gender': g(currentPatient, 'gender'),
      };
      postWebEngageEvent(WebEngageEventName.DOCTOR_SPECIALITY_SEARCH_NO_RESULT, eventAttributes);
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
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setshowSpinner(true);
              getNetStatus()
                .then((status) => {
                  if (status) {
                    fetchSpecialityFilterData(filterMode, FilterData, latlng);
                  } else {
                    setshowSpinner(false);
                    setshowOfflinePopup(true);
                  }
                })
                .catch((e) => {
                  CommonBugFender('DoctorSearchListing_getNetStatus', e);
                });
            }}
          >
            <RetryButtonIcon style={{ width: 185, height: 48, marginTop: 30 }} />
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View>
        {doctors.length > 0 && (
          <FlatList
            contentContainerStyle={{
              marginTop: 10,
              marginBottom: 8,
              paddingTop: Platform.OS == 'android' ? 10 : 1,
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
          onPress={() => {
            setshowLocationpopup(false), !locationDetails && checkLocation();
          }}
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
                    if (value.length > 2) {
                      autoSearch(value);
                      setshowLocations(true);
                    } else {
                      setshowLocations(false);
                    }
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
            {showLocations && (
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
            )}
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
  const [doctorSearch, setDoctorSearch] = useState<string>('');

  const renderDoctorSearchBar = () => {
    return (
      <View style={[styles.searchContainer, styles.shadowStyle]}>
        <TextInputComponent
          conatinerstyles={{ paddingBottom: 0 }}
          inputStyle={styles.inputTextStyle}
          value={doctorSearch}
          placeholder="Search doctors"
          underlineColorAndroid="transparent"
          onChangeText={(value) => {
            if (isValidSearch(value)) {
              setDoctorSearch(value);
              filterDoctors(doctorsList, doctorsType, value);
            }
          }}
        />
      </View>
    );
  };
  const [onlineCheckBox, setOnlineCheckbox] = useState<boolean>(true);
  const [physicalCheckBox, setPhysicalCheckbox] = useState<boolean>(true);
  const [nearyByFlag, setNearyByFlag] = useState<boolean>(false);
  const [availabilityFlag, setAvailabilityFlag] = useState<boolean>(true);

  const setDeepLinkDoctorTypeFilter = () => {
    if (doctorTypeFilter === 'apollo') {
      setDoctorsType('APOLLO');
      filterDoctors(doctorsList, 'APOLLO');
    } else if (doctorTypeFilter === 'partners') {
      setDoctorsType('PARTNERS');
      filterDoctors(doctorsList, 'PARTNERS');
    }
  };
  const setDeepLinkFilter = () => {
    if (typeOfConsult === 'online') {
      setPhysicalCheckbox(false);
    } else if (typeOfConsult === 'inperson') {
      setOnlineCheckbox(false);
    }
  };

  const onPressNearByRadioButton = () => {
    if (!nearyByFlag) {
      setNearyByFlag(!nearyByFlag);
      setAvailabilityFlag(false);
      setshowSpinner(true);
      postWebEngageEvent(WebEngageEventName.CONSULT_SORT, {
        'Sort By': 'distance',
      });
      setSortValue('distance');
      checkLocation();
    }
  };

  const onPressAvailabiltyRadioButton = () => {
    if (!availabilityFlag) {
      setAvailabilityFlag(!availabilityFlag);
      setNearyByFlag(false);
      setshowSpinner(true);
      postWebEngageEvent(WebEngageEventName.CONSULT_SORT, {
        'Sort By': 'availability',
      });
      setSortValue('availability');
      fetchSpecialityFilterData(filterMode, FilterData, latlng, 'availability');
    }
  };

  const renderBottomOptions = () => {
    return (
      <View style={styles.bottomMainContainer}>
        <Text style={styles.sortByTextStyle}>{string.doctor_search_listing.sortby}</Text>
        <View style={styles.bottomOptionsContainer}>
          <View style={styles.bottomItemContainer}>
            <TouchableOpacity activeOpacity={1} onPress={onPressNearByRadioButton}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
              >
                {nearyByFlag ? <RadioButtonIcon /> : <RadioButtonUnselectedIcon />}
                <Text
                  style={{
                    ...theme.viewStyles.text(
                      'B',
                      10,
                      theme.colors.SHERPA_BLUE,
                      nearyByFlag ? 1 : 0.6
                    ),
                    marginLeft: 1,
                  }}
                >
                  {string.doctor_search_listing.near}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={1}
              style={{ marginLeft: 8 }}
              onPress={onPressAvailabiltyRadioButton}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {availabilityFlag ? <RadioButtonIcon /> : <RadioButtonUnselectedIcon />}
                <Text
                  style={{
                    ...theme.viewStyles.text(
                      'B',
                      10,
                      theme.colors.SHERPA_BLUE,
                      availabilityFlag ? 1 : 0.6
                    ),
                    marginLeft: 1,
                  }}
                >
                  {string.doctor_search_listing.avaliablity}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.seperator} />
          <View style={styles.bottomItemContainer}>
            <View style={styles.bottomItemContainer}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  setOnlineCheckbox(!onlineCheckBox);
                  if (!physicalCheckBox) {
                    setPhysicalCheckbox(!physicalCheckBox);
                  }
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {onlineCheckBox ? <CheckedIcon /> : <CheckUnselectedIcon />}
                  <Text
                    style={{
                      ...theme.viewStyles.text(
                        'B',
                        10,
                        theme.colors.SHERPA_BLUE,
                        onlineCheckBox ? 1 : 0.6
                      ),
                      marginLeft: 4,
                    }}
                  >
                    {string.doctor_search_listing.online}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.bottomCenterContainer}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  setPhysicalCheckbox(!physicalCheckBox);
                  if (!onlineCheckBox) {
                    setOnlineCheckbox(!onlineCheckBox);
                  }
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {physicalCheckBox ? <CheckedIcon /> : <CheckUnselectedIcon />}
                  <Text
                    style={{
                      ...theme.viewStyles.text(
                        'B',
                        10,
                        theme.colors.SHERPA_BLUE,
                        physicalCheckBox ? 1 : 0.6
                      ),
                      marginLeft: 4,
                    }}
                  >
                    {string.doctor_search_listing.inperson}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.seperator} />
          <View style={styles.bottomItemContainer}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                CommonLogEvent(AppRoutes.DoctorSearchListing, 'Filter view opened');
                setDisplayFilter(true);
              }}
            >
              <DoctorFilter />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const onPressApolloDoctorsTab = () => {
    if (doctorsType != 'APOLLO') {
      postTabBarClickWEGEvent('APOLLO');
      setDoctorsType('APOLLO');
      filterDoctors(doctorsList, 'APOLLO');
    }
  };

  const onPressDoctorPartnersTab = () => {
    if (doctorsType != 'PARTNERS') {
      postTabBarClickWEGEvent('PARTNERS');
      setDoctorsType('PARTNERS');
      onPressNearByRadioButton();
      filterDoctors(doctorsList, 'PARTNERS');
    }
  };

  const renderTopTabBar = () => {
    const doctor_partners_text = `${AppConfig.Configuration.DOCTOR_PARTNER_TEXT} (${partnerDocsNumber})`;
    const apollo_doctors_text = `Apollo Doctors (${apolloDocsNumber})`;
    if (doctorsList && filteredDoctorsList && doctorsList.length > filteredDoctorsList.length) {
      return (
        <View style={styles.topTabBar}>
          <TouchableOpacity
            style={{
              ...styles.docTypeCont,
              borderBottomColor:
                doctorsType == 'APOLLO' ? theme.colors.SEARCH_UNDERLINE_COLOR : '#f7f8f5',
            }}
            onPress={onPressApolloDoctorsTab}
          >
            <Text
              style={{
                ...theme.fonts.IBMPlexSansMedium(15),
                marginVertical: 13,
                color: doctorsType == 'APOLLO' ? theme.colors.LIGHT_BLUE : 'rgba(1,28,36,0.6)',
              }}
            >
              {apollo_doctors_text}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              ...styles.docTypeCont,
              borderBottomColor:
                doctorsType == 'PARTNERS' ? theme.colors.SEARCH_UNDERLINE_COLOR : '#f7f8f5',
            }}
            onPress={onPressDoctorPartnersTab}
          >
            <Text
              style={{
                ...theme.fonts.IBMPlexSansMedium(15),
                marginVertical: 13,
                color: doctorsType == 'PARTNERS' ? theme.colors.LIGHT_BLUE : 'rgba(1,28,36,0.6)',
              }}
            >
              {doctor_partners_text}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  };
  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderTopView()}
        {searchIconClicked && renderDoctorSearchBar()}
        {renderTopTabBar()}
        <ScrollView bounces={false} style={{ flex: 1 }}>
          {showSpinner ? (
            renderSearchLoadingView()
          ) : (
            <View>
              <Text style={styles.consultHeadingText}>
                {string.doctor_search_listing.consultBest.replace(
                  '{0}',
                  specialistPluralTerm || 'Doctors'
                )}
              </Text>
              {renderDoctorSearches(
                onlineCheckBox
                  ? physicalCheckBox
                    ? undefined
                    : ConsultMode.ONLINE
                  : physicalCheckBox
                  ? ConsultMode.PHYSICAL
                  : undefined,
                doctorSearch
              )}
            </View>
          )}
        </ScrollView>
        {renderBottomOptions()}
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
      {renderPopup()}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
    </View>
  );
};
