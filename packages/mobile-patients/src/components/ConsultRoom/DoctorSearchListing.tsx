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
import { LinearGradientComponent } from '@aph/mobile-patients/src/components/ui/LinearGradientComponent';
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
  FamilyDoctorIcon,
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
import {
  getPlatinumDoctor_getPlatinumDoctor_doctors,
  getPlatinumDoctor,
} from '@aph/mobile-patients/src/graphql/types/getPlatinumDoctor';
import {
  GET_DOCTOR_LIST,
  GET_PLATINUM_DOCTOR,
  GET_DOCTORLIST_FILTERS,
  GET_PATIENT_ADDRESS_LIST,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors,
  getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_specialty,
} from '@aph/mobile-patients/src/graphql/types/getDoctorsBySpecialtyAndFilters';
import { getDoctorList } from '@aph/mobile-patients/src/graphql/types/getDoctorList';
import {
  ConsultMode,
  FilterDoctorInput,
  Range,
  SpecialtySearchType,
  ZoneType,
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
  setWebEngageScreenNames,
  getDoctorShareMessage,
  postDoctorShareWEGEvents,
  getUserType,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState, useRef } from 'react';
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
  Share,
} from 'react-native';
import {
  NavigationActions,
  NavigationScreenProps,
  ScrollView,
  StackActions,
} from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { AppsFlyerEventName, AppsFlyerEvents } from '../../helpers/AppsFlyerEvents';
import { getValuesArray } from '@aph/mobile-patients/src/utils/commonUtils';
import _ from 'lodash';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { CirclePlanAddedToCart } from '@aph/mobile-patients/src/components/ui/CirclePlanAddedToCart';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { DoctorShareComponent } from '@aph/mobile-patients/src/components/ConsultRoom/Components/DoctorShareComponent';
import { SKIP_LOCATION_PROMPT } from '@aph/mobile-patients/src/utils/AsyncStorageKey';
import { userLocationConsultWEBEngage } from '@aph/mobile-patients/src/helpers/CommonEvents';
import { BookingRequestOverlay } from '@aph/mobile-patients/src/components/ConsultRoom/BookingRequestOverlay';
import { BookingRequestSubmittedOverlay } from '../ui/BookingRequestSubmittedOverlay';

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
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 20,
  },
  careLogo: {
    width: 45,
    height: 27,
    marginHorizontal: 3,
  },
  careHeadingText: {
    ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE),
  },
  linearGradient: {
    flex: 1,
    paddingTop: 16,
    marginBottom: 20,
  },
  doctorOfTheHourTextStyle: {
    ...theme.viewStyles.text('SB', 13, '#FFFFFF', 1, 16.9, 0.3),
    textAlign: 'center',
    paddingTop: 4,
    paddingLeft: 20,
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
  const typeOfConsult = props.navigation.getParam('typeOfConsult');
  const doctorTypeFilter = props.navigation.getParam('doctorType');
  const cityFilter = props.navigation.getParam('city');
  const brandFilter = props.navigation.getParam('brand');
  const scrollViewRef = React.useRef<ScrollView | null>(null);
  const [showLocationpopup, setshowLocationpopup] = useState<boolean>(false);
  const [displayFilter, setDisplayFilter] = useState<boolean>(false);
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const [submittedDisplayOverlay, setSubmittedDisplayOverlay] = useState<boolean>(false);
  const [currentLocation, setcurrentLocation] = useState<string>('');
  const [locationSearchText, setLocationSearchText] = useState<string>('');
  const [showCarePlanNotification, setShowCarePlanNotification] = useState<boolean>(false);
  const fireLocationEvent = useRef<boolean>(false);
  const [
    platinumDoctor,
    setPlatinumDoctor,
  ] = useState<getPlatinumDoctor_getPlatinumDoctor_doctors | null>(null);
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
  const { clearDiagnoticCartInfo } = useDiagnosticsCart();
  const { showAphAlert, hideAphAlert, setLoading: setLoadingContext } = useUIElements();

  const [
    specialities,
    setspecialities,
  ] = useState<getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_specialty | null>(
    null
  );
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);

  const [filterMode, setfilterMode] = useState<ConsultMode>(ConsultMode.BOTH);
  const [searchQuery, setSearchQuery] = useState({});

  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const [showLocations, setshowLocations] = useState<boolean>(false);
  const [sortValue, setSortValue] = useState<string>('');
  const [searchIconClicked, setSearchIconClicked] = useState<boolean>(false);
  const [careDoctorsSwitch, setCareDoctorsSwitch] = useState<boolean>(false);
  const [filterActionTaken, setFilterActionTaken] = useState<boolean>(false);
  const [doctorShareData, setDoctorShareData] = useState<any>();
  const [showDoctorSharePopup, setShowDoctorSharePopup] = useState<boolean>(false);
  const [doctorShareRank, setDoctorShareRank] = useState<number>(1);
  const specialityId = props.navigation.getParam('specialityId') || '';
  const [requestDoctorSelected, setRequestDoctorSelected] = useState<string>('');
  const [requestDoctorSelectedDetails, setRequestDoctorSelectedDetails] = useState<any>({});
  const [requestErrorMessage, setRequestErrorMessage] = useState<string>('');
  const [requestError, setRequestError] = useState<boolean>(false);

  let DoctorsflatListRef: any;
  const filterOptions = (filters: any) => {
    let preFilters = filters;
    let filterData: filterDataType[] = [
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

    return filterData;
  };
  const [FilterData, setFilterData] = useState<filterDataType[]>([...filterOptions(searchFilters)]);
  const [pageNo, setpageNo] = useState<number>(1);
  const [pageSize, setpageSize] = useState<number>(AppConfig.Configuration.Doctors_Page_Size);
  const [fetching, setfetching] = useState<boolean>(false);
  const callSaveSearch = props.navigation.getParam('callSaveSearch');

  useEffect(() => {
    async function fetchFilter() {
      const retrievedFilterOptions: any = await AsyncStorage.getItem('FilterOptions');
      retrievedFilterOptions && setFilterData(filterOptions(JSON.parse(retrievedFilterOptions)));
    }
    fetchFilter();
  }, []);
  useEffect(() => {
    fetchDoctorListByAvailability();
    setDeepLinkFilter();
    setDeepLinkDoctorTypeFilter();
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    if (filterActionTaken) {
      fetchSpecialityFilterData(
        filterMode,
        FilterData,
        latlng,
        sortValue,
        undefined,
        false,
        doctorSearch
      );
    }
  }, [careDoctorsSwitch]);

  useEffect(() => {
    if (showCarePlanNotification) {
      setTimeout(() => {
        setShowCarePlanNotification(false);
      }, 10 * 1000);
    }
  }, [showCarePlanNotification]);

  useEffect(() => {
    if (doctorsType != 'PARTNERS') {
      getDoctorOfTheHour(false);
      fetchAddress(false, 'from effect');
    }
  }, []);

  const getDoctorOfTheHour = async (partnerDoctor: boolean = false, state?: string) => {
    client
      .query<getPlatinumDoctor>({
        query: GET_PLATINUM_DOCTOR,
        fetchPolicy: 'no-cache',
        variables: {
          specialtyId: props.navigation.getParam('specialityId') || '',
          zoneType: ZoneType.STATE,
          zone: state || locationDetails?.state,
          partnerDoctor,
        },
      })
      .then(({ data }) => {
        const platinum_doctor = g(data, 'getPlatinumDoctor', 'doctors', '0' as any);
        if (platinum_doctor) {
          setPlatinumDoctor(platinum_doctor);
          postPlatinumDoctorWEGEvents(platinum_doctor, WebEngageEventName.DOH_Viewed, state);
        } else {
          setPlatinumDoctor(null);
        }
      })
      .catch((e) => {
        setPlatinumDoctor(null);
        CommonBugFender('GET_PLATINUM_DOCTOR', e);
      });
  };

  async function fetchAddress(partnerDoctor: boolean = false, from?: string) {
    try {
      if (locationDetails?.state) {
        return;
      }
      const userId = g(currentPatient, 'id');
      const response = await client.query<getPatientAddressList, getPatientAddressListVariables>({
        query: GET_PATIENT_ADDRESS_LIST,
        variables: { patientId: userId },
        fetchPolicy: 'no-cache',
      });
      const { data } = response;
      const addressList =
        (data?.getPatientAddressList
          ?.addressList as savePatientAddress_savePatientAddress_patientAddress[]) || [];
      const state = addressList?.[0]?.state;
      if (state) {
        await getDoctorOfTheHour(partnerDoctor, state);
      }
    } catch (error) {
      CommonBugFender('DoctorSearchListing_fetchAddress', error);
    }
  }

  const vaueChange = (sort: any) => {
    if (sort === 'distance') {
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
    setWebEngageScreenNames('Speciality Listing');
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
      fetchSpecialityFilterData(
        filterMode,
        FilterData,
        latlng,
        'availability',
        undefined,
        false,
        doctorSearch
      );
      setcurrentLocation(locationDetails.displayName);
      setLocationSearchText(locationDetails.displayName);
    }
    return () => {
      didFocusSubscription && didFocusSubscription.remove();
      willBlurSubscription && willBlurSubscription.remove();
    };
  }, []);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = () => {
    client
      .query({
        query: GET_DOCTORLIST_FILTERS,
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        if (data?.getDoctorListFilters?.filters) {
          setFilterData(filterOptions(data?.getDoctorListFilters?.filters)),
            AsyncStorage.setItem(
              'FilterOptions',
              JSON.stringify(data?.getDoctorListFilters?.filters)
            );
        }
      })
      .catch((e) => {
        CommonBugFender('fetchDoctorsFilterData', e);
      });
  };

  const filterDoctors = (data: any, type: string, searchText: string = doctorSearch) => {
    const doctorsApollo = data;
    if (type == 'APOLLO') {
      const apolloDoctors = doctorsApollo.filter((item) => {
        return item && item.doctorType !== 'DOCTOR_CONNECT';
      });
      setFilteredDoctorsList(apolloDoctors);
    } else {
      const otherDoctors = doctorsApollo.filter((item) => {
        return item && item.doctorType === 'DOCTOR_CONNECT';
      });
      setFilteredDoctorsList(otherDoctors);
    }
  };

  const setData = (data: any, docTabSelected: boolean = false, pageNo?: number) => {
    try {
      const filterGetData = data && data.getDoctorList ? data.getDoctorList : null;
      if (filterGetData?.doctors) {
        let array = pageNo ? doctorsList || [] : [];
        array = array.concat(filterGetData.doctors);
        setDoctorsList(array);
        filterDoctors(array, docTabSelected ? 'PARTNERS' : 'APOLLO');
      }
    } catch (e) {
      CommonBugFender('DoctorSearchListing_fetchSpecialityFilterData_try', e);
      setshowSpinner(false);
    }
  };

  const onLocationAlertCloseIconPres = () => {
    fireLocationPermissionEvent('Not provided');
    AsyncStorage.setItem(SKIP_LOCATION_PROMPT, 'true');
    hideAphAlert!();
    fetchDoctorListByAvailability();
  };

  const fetchDoctorListByAvailability = () => {
    setNearyByFlag(false);
    setAvailabilityFlag(true);
    setshowSpinner(false);

    !doctorsList?.length &&
      fetchSpecialityFilterData(
        filterMode,
        FilterData,
        latlng,
        'availability',
        undefined,
        false,
        doctorSearch
      );
  };

  const checkLocation = (docTabSelected: boolean = false) => {
    if (!locationDetails) {
      showAphAlert!({
        unDismissable: false,
        title: 'Hi! :)',
        onPressOutside: () => {
          setSortValue('availability');
          fetchSpecialityFilterData(
            filterMode,
            FilterData,
            latlng,
            'availability',
            undefined,
            false,
            doctorSearch
          );
        },
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
                fireLocationEvent.current = true;
                hideAphAlert!();
                setshowLocationpopup(true);
                fireLocationPermissionEvent('Enter Manually');
              }}
            />
            <Button
              style={{ flex: 1 }}
              title={'ALLOW AUTO DETECT'}
              onPress={() => {
                fireLocationPermissionEvent('Allow auto detect');
                hideAphAlert!();
                setLoadingContext!(true);
                doRequestAndAccessLocationModified()
                  .then((response) => {
                    fireLocationEvent.current = true;
                    locationWebEngageEvent(response, 'Auto Detect');
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
                        'availability',
                        undefined,
                        false,
                        doctorSearch
                      );
                  })
                  .catch((e) => {
                    CommonBugFender('DoctorSearchListing_ALLOW_AUTO_DETECT', e);
                    setSortValue('availability');
                    fetchSpecialityFilterData(
                      filterMode,
                      FilterData,
                      latlng,
                      'availability',
                      undefined,
                      false,
                      doctorSearch
                    );
                  })
                  .finally(() => {
                    setLoadingContext!(false);
                  });
              }}
            />
          </View>
        ),
        showCloseIcon: true,
        onCloseIconPress: onLocationAlertCloseIconPres,
      });
    }
  };

  const fireLocationPermissionEvent = (permissionType: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.LOCATION_PERMISSION] = {
      'Location permission': permissionType,
    };
    postWebEngageEvent(WebEngageEventName.LOCATION_PERMISSION, eventAttributes);
  };

  const fetchSpecialityFilterData = (
    filterMode: ConsultMode = ConsultMode.BOTH,
    SearchData: filterDataType[] = FilterData,
    location: locationType | null = latlng,
    sort: string | null = sortValue,
    pinCode: string | undefined,
    docTabSelected: boolean = false,
    searchText: string,
    pageNo?: number
  ) => {
    const experienceArray: Range[] = [];
    if (SearchData[2].selectedOptions && SearchData[2].selectedOptions.length > 0)
      SearchData[2].selectedOptions.forEach((element: string) => {
        const splitArray = element.split('-');
        let object: Range | null = {};
        if (splitArray.length > 0)
          object = {
            minimum: Number(splitArray[0].replace('+', '')),
            maximum: splitArray.length > 1 ? Number(element.split('-')[1]) : null,
          };
        if (object) {
          experienceArray.push(object);
        }
      });

    const feesArray: Range[] = [];
    if (SearchData[4].selectedOptions && SearchData[4].selectedOptions.length > 0)
      SearchData[4].selectedOptions.forEach((element: string) => {
        const splitArray = element.split('-');
        let object: Range | null = {};
        if (splitArray.length > 0)
          object = {
            minimum: Number(splitArray[0].replace('+', '')),
            maximum: splitArray.length > 1 ? Number(element.split('-')[1]) : null,
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
      ...specialtyName,
      ...geolocation,
      sort: sort,
      pageNo: pageNo ? pageNo + 1 : 1,
      pageSize: pageSize,
      searchText: searchText,
      isCare: careDoctorsSwitch,
    };
    setBugFenderLog('DOCTOR_FILTER_INPUT', JSON.stringify(FilterInput));
    !pageNo && setshowSpinner(true);
    client
      .query<getDoctorList>({
        query: GET_DOCTOR_LIST,
        fetchPolicy: 'no-cache',
        variables: {
          filterInput: FilterInput,
        },
      })
      .then(({ data }) => {
        setfetching(false);
        pageNo ? setpageNo(pageNo + 1) : setpageNo(1);
        setData(data, docTabSelected, pageNo);
        !pageNo &&
          (setshowSpinner(false),
          sort && vaueChange(sort),
          setApolloDocsNumber(
            data.getDoctorList?.apolloDoctorCount ? data.getDoctorList?.apolloDoctorCount : 0
          ),
          setPartnerDocsNumber(
            data.getDoctorList?.partnerDoctorCount ? data.getDoctorList?.partnerDoctorCount : 0
          ));
      })
      .catch((e) => {
        CommonBugFender('DoctorSearchListing_fetchSpecialityFilterData', e);
        setshowSpinner(false);
        setfetching(false);
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
          clearDiagnoticCartInfo && clearDiagnoticCartInfo();
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
                  findAddrComponents('postal_code', addrComponents),
                  doctorsType === 'PARTNERS' ? true : false,
                  doctorSearch
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
                const locationAttribute = {
                  ...locationData,
                  pincode: findAddrComponents('postal_code', addrComponents),
                };
                locationWebEngageEvent(locationAttribute, 'Manual entry');
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
    const movedata = props.navigation.getParam('MoveDoctor') || '';
    if (movedata == 'MoveDoctor') {
      props.navigation.goBack();
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
    return true;
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
                if (searchIconClicked) {
                  fetchSpecialityFilterData(
                    filterMode,
                    FilterData,
                    latlng,
                    'availability',
                    undefined,
                    doctorsType === 'PARTNERS' ? true : false,
                    ''
                  );
                }
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

  const postPlatinumDoctorWEGEvents = (
    doctorData: any,
    eventName: WebEngageEventName,
    states: any
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DOH_Viewed] = {
      doctorId: doctorData?.id,
      doctorName: doctorData?.displayName,
      doctorType: doctorData?.doctorType,
      specialtyId: props.navigation.getParam('specialityId') || '',
      specialtyName: props.navigation.getParam('specialityName') || '',
      zone: states || locationDetails?.state || '',
      userName: `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      userPhoneNumber: currentPatient?.mobileNumber,
    };
    postWebEngageEvent(eventName, eventAttributes);
  };

  const postDoctorClickWEGEvent = (
    doctorDetails: any,
    source: WebEngageEvents[WebEngageEventName.DOCTOR_CLICKED]['Source'],
    isTopDoc: boolean,
    type?: 'consult-now' | 'book-appointment'
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DOCTOR_CLICKED] = {
      'Doctor Name': doctorDetails.displayName!,
      Source: source,
      'Doctor ID': doctorDetails.id,
      'Speciality ID': props.navigation.getParam('specialityId') || '',
      'Doctor Category': doctorDetails.doctorType,
      Fee: Number(doctorDetails?.fee),
      'Doctor Speciality': doctorDetails?.specialtydisplayName,
      Rank: doctorDetails?.rowId,
      Is_TopDoc: !!isTopDoc ? 'Yes' : 'No',
      User_Type: getUserType(allCurrentPatients),
    };

    const eventAttributesFirebase: FirebaseEvents[FirebaseEventName.DOCTOR_CLICKED] = {
      DoctorName: doctorDetails.fullName!,
      Source: source,
      DoctorID: doctorDetails.id,
      SpecialityID: props.navigation.getParam('specialityId') || '',
      DoctorCategory: doctorDetails.doctorType,
      Fee: Number(doctorDetails?.fee),
      DoctorSpeciality: doctorDetails?.specialistSingularTerm,
    };

    if (type == 'consult-now') {
      postWebEngageEvent(WebEngageEventName.CONSULT_NOW_CLICKED, eventAttributes);
      const appsflyereventAttributes: AppsFlyerEvents[AppsFlyerEventName.CONSULT_NOW_CLICKED] = {
        'customer id': currentPatient ? currentPatient.id : '',
        'doctor id': doctorDetails.id,
        'specialty id': props.navigation.getParam('specialityId') || '',
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
        'specialty id': props.navigation.getParam('specialityId') || '',
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

  const onClickDoctorShare = (doctorData: any, rank: number) => {
    if (doctorData) {
      postDoctorShareWEGEvents(
        doctorData,
        WebEngageEventName.SHARE_CLICK_DOC_LIST_SCREEN,
        currentPatient,
        specialityId,
        rank
      );
      setShowDoctorSharePopup(true);
      setDoctorShareData(doctorData);
      setDoctorShareRank(rank);
    }
  };

  const renderDoctorCard = (
    rowData: any,
    index: number,
    styles: StyleProp<ViewStyle> = {},
    numberOfLines?: number,
    filter?: ConsultMode
  ) => {
    return platinumDoctor?.id !== rowData?.id ? (
      <DoctorCard
        key={index}
        rowId={index + 1}
        rowData={rowData}
        navigation={props.navigation}
        style={styles}
        numberOfLines={numberOfLines}
        availableModes={rowData.consultMode}
        callSaveSearch={callSaveSearch}
        onPressRequest={(arg: boolean) => {
          setRequestDoctorSelected(rowData?.displayName);
          setRequestDoctorSelectedDetails(rowData);
          setdisplayoverlay(arg);
        }}
        onPress={() => {
          postDoctorClickWEGEvent({ ...rowData, rowId: index + 1 }, 'List');
          if (!rowData?.allowBookingRequest) {
            props.navigation.navigate(AppRoutes.DoctorDetails, {
              doctorId: rowData.id,
              callSaveSearch: callSaveSearch,
            });
          } else {
            props.navigation.navigate(AppRoutes.DoctorDetailsBookingOnRequest, {
              doctorId: rowData.id,
              callSaveSearch: callSaveSearch,
            });
          }
        }}
        onPressShare={(doctorData) => onClickDoctorShare(doctorData, index + 1)}
        onPressConsultNowOrBookAppointment={(type) => {
          postDoctorClickWEGEvent(rowData, 'List', type);
        }}
        onPlanSelected={() => setShowCarePlanNotification(true)}
        selectedConsultMode={filter}
      />
    ) : null;
  };

  const renderSearchDoctorResultsRow = (
    rowData: any,
    index: number,
    styles: StyleProp<ViewStyle> = {},
    numberOfLines?: number,
    filter?: ConsultMode
  ) => {
    if (rowData) {
      return index === 0 && platinumDoctor ? (
        <>
          {renderPlatinumDoctorView(index)}
          {renderDoctorCard(rowData, index, styles, numberOfLines, filter)}
        </>
      ) : (
        renderDoctorCard(rowData, index, styles, numberOfLines, filter)
      );
    }
    return null;
  };

  const renderDoctorSearches = (filter?: ConsultMode, searchText?: string) => {
    const doctors =
      filteredDoctorsList.length && filter
        ? filteredDoctorsList.filter((obj: any) => {
            return obj?.consultMode == ConsultMode.BOTH || obj?.consultMode == filter;
          })
        : filteredDoctorsList;
    if (doctors.length === 0 && !showSpinner && !platinumDoctor) {
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
                    fetchSpecialityFilterData(
                      filterMode,
                      FilterData,
                      latlng,
                      sortValue,
                      undefined,
                      doctorsType === 'PARTNERS' ? true : false,
                      doctorSearch
                    );
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

    const renderCirclePlanAddedToCartView = () => <CirclePlanAddedToCart />;

    return (
      <View style={{ flex: 1 }}>
        {doctorsType === 'APOLLO' && showCarePlanNotification && renderCirclePlanAddedToCartView()}
        {doctors.length > 0 && (
          <FlatList
            ref={(ref) => {
              DoctorsflatListRef = ref;
            }}
            contentContainerStyle={{
              marginTop: 20,
              marginBottom: 8,
              paddingTop: Platform.OS == 'android' ? 10 : 1,
            }}
            bounces={false}
            data={doctors}
            renderItem={({ item, index }) =>
              renderSearchDoctorResultsRow(item, index, {}, undefined, filter)
            }
            keyExtractor={(item) => item!.id}
            onEndReachedThreshold={0.2}
            onEndReached={(info: { distanceFromEnd: number }) => {
              onEndReached();
            }}
            ListFooterComponent={renderListFooter()}
          />
        )}
        {doctors.length === 0 && platinumDoctor ? renderPlatinumDoctorView(0, true) : null}
      </View>
    );
  };

  const renderListFooter = () => {
    return (
      <View style={{ height: 100, justifyContent: 'flex-start' }}>
        {fetching && <Spinner style={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }} />}
      </View>
    );
  };

  const onEndReached = () => {
    let totalDocs = doctorsType == 'APOLLO' ? apolloDocsNumber : partnerDocsNumber;
    if (!fetching && filteredDoctorsList.length < totalDocs) {
      setfetching(true);
      fetchSpecialityFilterData(
        filterMode,
        FilterData,
        latlng,
        sortValue,
        undefined,
        doctorsType === 'PARTNERS' ? true : false,
        doctorSearch,
        pageNo
      );
    }
  };

  const scrollToTop = () => {
    const filter = onlineCheckBox
      ? physicalCheckBox
        ? undefined
        : ConsultMode.ONLINE
      : physicalCheckBox
      ? ConsultMode.PHYSICAL
      : undefined;
    const doctors =
      filteredDoctorsList.length && filter
        ? filteredDoctorsList.filter((obj: any) => {
            return obj?.consultMode == filter || obj?.consultMode == ConsultMode.BOTH;
          })
        : filteredDoctorsList;
    scrollViewRef.current && scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
    doctors.length > 0 && DoctorsflatListRef.scrollToOffset({ x: 0, y: 0, animated: false });
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
            locationWebEngageEvent(undefined, 'Manual entry');
            setshowLocationpopup(false);
            setshowSpinner(false);
            !doctorsList?.length &&
              fetchSpecialityFilterData(
                filterMode,
                FilterData,
                latlng,
                'availability',
                undefined,
                false,
                doctorSearch
              );
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

  const locationWebEngageEvent = (location: any, type: 'Auto Detect' | 'Manual entry') => {
    if (fireLocationEvent.current) {
      userLocationConsultWEBEngage(currentPatient, location, 'Doctor list', type);
    }
    fireLocationEvent.current = false;
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
            source={require('@aph/mobile-patients/src/images/doctor/doctor_search_filler_img.webp')}
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
  useEffect(() => {
    if (isValidSearch(doctorSearch) && doctorSearch.length > 2) {
      fetchSpecialityFilterData(
        filterMode,
        FilterData,
        latlng,
        'availability',
        undefined,
        doctorsType === 'PARTNERS' ? true : false,
        doctorSearch
      );
    }
  }, [doctorSearch]);

  const renderPlatinumDoctorView = (index: number, setHeight: boolean = false) => {
    const doctorCardStyle = {
      backgroundColor: theme.colors.WHITE,
      shadowColor: theme.colors.SHADOW_GRAY,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    };
    const buttonStyle = {
      backgroundColor: theme.colors.BUTTON_BG,
      shadowColor: theme.colors.WHITE,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
      height: 44,
      borderRadius: 0,
    };
    const buttonTextStyle = {
      color: theme.colors.BUTTON_TEXT,
    };
    const doctorOfHourText =
      platinumDoctor?.availabilityTitle?.DOCTOR_OF_HOUR || 'Doctor of the Hour!';

    return (
      <LinearGradientComponent
        style={[styles.linearGradient, setHeight && { minHeight: 310, flex: undefined }]}
      >
        <View style={{ flexDirection: 'row', alignSelf: 'center', marginBottom: 15 }}>
          <FamilyDoctorIcon style={{ width: 16.58, height: 24 }} />
          <Text style={styles.doctorOfTheHourTextStyle}>{doctorOfHourText}</Text>
        </View>

        <DoctorCard
          rowData={platinumDoctor}
          navigation={props.navigation}
          availableModes={platinumDoctor?.consultMode}
          callSaveSearch={callSaveSearch}
          style={doctorCardStyle}
          buttonViewStyle={{ overflow: 'hidden' }}
          buttonStyle={buttonStyle}
          buttonTextStyle={buttonTextStyle}
          onPressShare={(doctorData) => onClickDoctorShare(doctorData, index + 1)}
          onPress={(id: string, onlineConsult: boolean) => {
            postDoctorClickWEGEvent(platinumDoctor, 'List', true);
            postPlatinumDoctorWEGEvents(platinumDoctor, WebEngageEventName.DOH_Clicked);
            props.navigation.navigate(AppRoutes.DoctorDetails, {
              doctorId: platinumDoctor?.id,
              callSaveSearch: callSaveSearch,
              platinumDoctor: true,
              consultModeSelected: onlineConsult ? ConsultMode.ONLINE : ConsultMode.PHYSICAL,
            });
          }}
          onPressConsultNowOrBookAppointment={(type) => {
            postDoctorClickWEGEvent(platinumDoctor, 'List', true, type);
          }}
          onPlanSelected={() => setShowCarePlanNotification(true)}
        />
      </LinearGradientComponent>
    );
  };

  const onPressShareProfileButton = async (doctorData: any) => {
    const shareDoctorMessage = getDoctorShareMessage(doctorData);
    try {
      const result = await Share.share({
        message: shareDoctorMessage,
      });
      if (result.action === Share.sharedAction) {
        postDoctorShareWEGEvents(
          doctorData,
          WebEngageEventName.SHARE_PROFILE_CLICKED_DOC_LIST,
          currentPatient,
          specialityId,
          doctorShareRank
        );
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error) {}
  };

  const onPressGoBackShareDoctor = (doctorData: any) => {
    setShowDoctorSharePopup(false);
    postDoctorShareWEGEvents(
      doctorData,
      WebEngageEventName.GO_BACK_CLICKED_DOC_LIST,
      currentPatient,
      specialityId,
      doctorShareRank
    );
  };

  const renderDoctorShareComponent = () => {
    const selectedMode = onlineCheckBox
      ? physicalCheckBox
        ? undefined
        : ConsultMode.ONLINE
      : physicalCheckBox
      ? ConsultMode.PHYSICAL
      : undefined;
    return showDoctorSharePopup ? (
      <DoctorShareComponent
        doctorData={doctorShareData}
        onPressGoBack={(doctorData) => onPressGoBackShareDoctor(doctorData)}
        onPressSharePropfile={(doctorData) => onPressShareProfileButton(doctorData)}
        selectedConsultMode={selectedMode}
        availableModes={doctorShareData?.consultMode}
      />
    ) : null;
  };

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
              const search = _.debounce(setDoctorSearch, 300);
              setSearchQuery((prevSearch: any) => {
                if (prevSearch.cancel) {
                  prevSearch.cancel();
                }
                return search;
              });
              setDoctorSearch(value);
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
      setNearyByFlag(true);
      setAvailabilityFlag(false);
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

  const onPressNearByRadioButton = (doctorTabsSelected: boolean = false) => {
    if (!nearyByFlag) {
      setNearyByFlag(!nearyByFlag);
      setAvailabilityFlag(false);
      setshowSpinner(true);
      postWebEngageEvent(WebEngageEventName.CONSULT_SORT, {
        'Sort By': 'distance',
      });
      setSortValue('distance');
      if (locationDetails) {
        const coordinates = {
          lat: locationDetails.latitude || '',
          lng: locationDetails.longitude || '',
        };
        latlng = coordinates;
        fetchSpecialityFilterData(
          filterMode,
          FilterData,
          latlng,
          'distance',
          undefined,
          doctorTabsSelected,
          doctorSearch
        );
      } else {
        setDoctorsList([]);
        checkLocation(doctorTabsSelected);
      }
    }
  };

  const onPressAvailabiltyRadioButton = (docTabSelected: boolean = false) => {
    if (!availabilityFlag) {
      setAvailabilityFlag(!availabilityFlag);
      setNearyByFlag(false);
      setshowSpinner(true);
      postWebEngageEvent(WebEngageEventName.CONSULT_SORT, {
        'Sort By': 'availability',
      });
      setSortValue('availability');
      fetchSpecialityFilterData(
        filterMode,
        FilterData,
        latlng,
        'availability',
        undefined,
        docTabSelected,
        doctorSearch
      );
    }
  };

  const fireFilterWebengageEvent = (filterApplied: string, filterValue: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DOCTOR_LISTING_FILTER_APPLIED] = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      pincode: g(locationDetails, 'pincode') || '',
      'Filter Applied': filterApplied,
      'Filter Value': filterValue,
    };
    postWebEngageEvent(WebEngageEventName.DOCTOR_LISTING_FILTER_APPLIED, eventAttributes);
  };

  const renderBottomOptions = () => {
    const doctors_partners = doctorsType === 'PARTNERS' ? true : false;
    return (
      <View style={styles.bottomMainContainer}>
        <Text style={styles.sortByTextStyle}>{string.doctor_search_listing.sortby}</Text>
        <View style={styles.bottomOptionsContainer}>
          <View style={styles.bottomItemContainer}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                fireFilterWebengageEvent(
                  string.doctor_search_listing.near,
                  nearyByFlag ? 'True' : 'False'
                );
                onPressNearByRadioButton(doctors_partners);
              }}
            >
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
              onPress={() => {
                fireFilterWebengageEvent(
                  string.doctor_search_listing.avaliablity,
                  availabilityFlag ? 'True' : 'False'
                );
                onPressAvailabiltyRadioButton(doctors_partners);
              }}
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
                  fireFilterWebengageEvent(
                    string.doctor_search_listing.online,
                    onlineCheckBox ? 'True' : 'False'
                  );
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
                  fireFilterWebengageEvent(
                    string.doctor_search_listing.inperson,
                    physicalCheckBox ? 'True' : 'False'
                  );
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
      setFilteredDoctorsList([]);
      filterDoctors(doctorsList, 'APOLLO');
      scrollToTop();
      setPlatinumDoctor(null);
      getDoctorOfTheHour();
      fetchAddress(false, 'from apollo button press'); // this will get called when locationDetails?.state is null
    }
  };

  const onPressDoctorPartnersTab = () => {
    if (doctorsType != 'PARTNERS') {
      postTabBarClickWEGEvent('PARTNERS');
      setDoctorsType('PARTNERS');
      setFilteredDoctorsList([]);
      filterDoctors(doctorsList, 'PARTNERS');
      scrollToTop();
      setPlatinumDoctor(null);
      getDoctorOfTheHour(true);
      fetchAddress(true, 'from partner button press');
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

  const filterCircleWebEngage = () => {
    const eventAttributes = {
      'Patient UHID': g(currentPatient, 'uhid'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(WebEngageEventName.VC_CIRCLE_FILTER, eventAttributes);
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderTopView()}
        {searchIconClicked && renderDoctorSearchBar()}
        {renderTopTabBar()}
        {renderDoctorShareComponent()}
        <ScrollView bounces={false} ref={scrollViewRef} contentContainerStyle={{ flex: 1 }}>
          {showSpinner ? (
            renderSearchLoadingView()
          ) : (
            <View style={{ flex: 1 }}>
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
      {displayoverlay && (
        <BookingRequestOverlay
          setdisplayoverlay={(arg0: boolean, arg1: string, arg2: boolean) => {
            setRequestError(arg0);
            setRequestErrorMessage(arg1);
            setdisplayoverlay(arg2);
          }}
          onRequestComplete={(arg: boolean) => setSubmittedDisplayOverlay(arg)}
          navigation={props.navigation}
          doctor={requestDoctorSelectedDetails}
          hospitalId={''}
        />
      )}
      {submittedDisplayOverlay && (
        <BookingRequestSubmittedOverlay
          setdisplayoverlay={() => setSubmittedDisplayOverlay(false)}
          navigation={props.navigation}
          doctor={requestDoctorSelected}
          error={requestError}
          errorMessage={requestErrorMessage || 'Something went wrong! \nPlease try again'}
        />
      )}
      {displayFilter ? (
        <FilterScene
          onClickClose={() => {
            setDisplayFilter(false);
          }}
          setData={(selecteddata) => {
            selecteddata.forEach((value) => {
              const { label, selectedOptions } = value;
              if (selectedOptions.length) {
                fireFilterWebengageEvent(label, selectedOptions.join());
              }
            });
            setshowSpinner(true);
            setFilterData(selecteddata);
            getNetStatus()
              .then((status) => {
                if (status) {
                  fetchSpecialityFilterData(
                    filterMode,
                    selecteddata,
                    latlng,
                    sortValue,
                    undefined,
                    doctorsType === 'PARTNERS' ? true : false,
                    doctorSearch
                  );
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
