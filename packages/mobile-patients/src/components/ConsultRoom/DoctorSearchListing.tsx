import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { FilterScene } from '@aph/mobile-patients/src/components/FilterScene';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { DoctorCard } from '@aph/mobile-patients/src/components/ui/DoctorCard';
import { LinearGradientComponent } from '@aph/mobile-patients/src/components/ui/LinearGradientComponent';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  DoctorFilter,
  SearchIcon,
  FamilyDoctorIcon,
  RetryButtonIcon,
  CallIcon,
  Sort,
  DropdownGreen,
  Toggle,
  LeftToggle,
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
  postWEGPatientAPIError,
  postCleverTapEvent,
  postDoctorShareCleverTapEvents,
  postConsultSearchCleverTapEvent,
  getTimeDiff,
  checkIfValidUUID,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  getAllSpecialties,
  getAllSpecialties_getAllSpecialties,
} from '@aph/mobile-patients/src/graphql/types/getAllSpecialties';
import { GET_ALL_SPECIALTIES } from '@aph/mobile-patients/src/graphql/profiles';
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
  Linking,
} from 'react-native';
import {
  NavigationActions,
  NavigationScreenProps,
  ScrollView,
  StackActions,
} from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { AppsFlyerEventName, AppsFlyerEvents } from '../../helpers/AppsFlyerEvents';
import {
  calculateCircleDoctorPricing,
  getValuesArray,
} from '@aph/mobile-patients/src/utils/commonUtils';
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
import { BookingRequestOverlay } from '@aph/mobile-patients/src/components/ConsultRoom/BookingRequestOverlay';
import { BookingRequestSubmittedOverlay } from '../ui/BookingRequestSubmittedOverlay';
import {
  consultUserLocationCleverTapEvents,
  userLocationConsultWEBEngage,
} from '@aph/mobile-patients/src/helpers/CommonEvents';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { useShoppingCart } from '../ShoppingCartProvider';
import { LocationOnHeader } from '../LocationOnHeader';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';

const searchFilters = require('@aph/mobile-patients/src/strings/filters');
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  },

  bottomMainContainer: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  bottomOptionsContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    marginHorizontal: 8,
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
  askApolloView: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: theme.colors.WHITE,
  },
  quickBookBtn: {
    width: 104,
    height: 25,
    padding: 4,
    backgroundColor: theme.colors.APP_YELLOW,
  },
  quickBookText: {
    ...theme.viewStyles.text('M', 14, theme.colors.WHITE, undefined, 17),
  },
  horizontalEnd: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  askApolloNumber: {
    ...theme.viewStyles.text('M', 14, theme.colors.APP_YELLOW, undefined, 17),
  },
  callLogo: {
    height: 15,
    width: 15,
    marginEnd: 6,
  },
  horizontalView: {
    flexDirection: 'row',
  },
  sortIcon: {
    width: 17,
    height: 17,
    marginRight: 8,
  },
  selectedFilterText: {
    ...theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  consultModeText: {
    ...theme.viewStyles.text('B', 10, theme.colors.SHERPA_BLUE),
  },
  toggleIcon: {
    width: 32,
    height: 32,
    marginHorizontal: 6,
  },
  nearbyContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 15,
    elevation: 15,
    marginTop: Platform.OS === 'ios' ? 85 : 55,
  },
  nearbyInnerContainer: {
    ...theme.viewStyles.cardViewStyle,
    width: 335,
    padding: 16,
  },
});

const provideLocationStyles = StyleSheet.create({
  provideLocationOuterContainer: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginBottom: 30,
  },
  provideLocationInnerContainer: {
    flex: 1,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  provideLocationHeadingData: {
    ...theme.fonts.IBMPlexSansMedium(14),
    marginBottom: 2,
    color: theme.colors.SHERPA_BLUE,
  },
  buttonHeading: {
    width: 140,
    height: 30,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: 'white',
  },
});

let latlng: locationType | null = null;

export interface DoctorSearchListingProps extends NavigationScreenProps {}
export type filterDataType = {
  label: string;
  options: string[];
  selectedOptions: string[];
  isOnlineConsultMode?: boolean;
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
  const {
    locationForDiagnostics,
    locationDetails,
    setLocationDetails,
    displayAskApolloNumber,
    displayQuickBookAskApollo,
  } = useAppCommonData();

  const { showAphAlert, hideAphAlert, setLoading: setLoadingContext } = useUIElements();

  const [isDeepLink, setIsDeepLink] = useState(false);

  const [
    specialities,
    // setspecialities,
  ] = useState<getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_specialty | null>(
    null
  );
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const isOnlineConsultMode =
    typeof props.navigation.getParam('isOnlineConsultMode') === 'boolean'
      ? props.navigation.getParam('isOnlineConsultMode')
      : true;
  const [filterMode, setfilterMode] = useState<ConsultMode>(
    isOnlineConsultMode ? ConsultMode.ONLINE : ConsultMode.PHYSICAL
  );
  const [searchQuery, setSearchQuery] = useState({});

  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const [sortValue, setSortValue] = useState<string>(
    props.navigation.getParam('sortBy')?.toLowerCase() ||
      string.doctor_search_listing.avaliablity.toLowerCase()
  );
  const [searchIconClicked, setSearchIconClicked] = useState<boolean>(false);
  const [careDoctorsSwitch, setCareDoctorsSwitch] = useState<boolean>(false);
  const [filterActionTaken, setFilterActionTaken] = useState<boolean>(false);
  const [doctorShareData, setDoctorShareData] = useState<any>();
  const [showDoctorSharePopup, setShowDoctorSharePopup] = useState<boolean>(false);
  const [doctorShareRank, setDoctorShareRank] = useState<number>(1);
  const [requestDoctorSelected, setRequestDoctorSelected] = useState<string>('');
  const [requestDoctorSelectedDetails, setRequestDoctorSelectedDetails] = useState<any>({});
  const [requestErrorMessage, setRequestErrorMessage] = useState<string>('');
  const [requestError, setRequestError] = useState<boolean>(false);
  const [specialityId, setSpecialityId] = useState<string>(
    props.navigation.getParam('specialityId') || ''
  );
  const { circlePlanSelected, circleSubscriptionId, circleSubPlanId } = useShoppingCart();
  const specialityName = props.navigation.getParam('specialityName');

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

  const [selectedSortInput, setSelectedSortInput] = useState<string | number>(
    props.navigation.getParam('sortBy') || string.doctor_search_listing.avaliablity
  );
  const sort_filter = [
    { key: '1', value: string.doctor_search_listing.location },
    { key: '2', value: string.doctor_search_listing.avaliablity },
    { key: '3', value: string.doctor_search_listing.near },
  ];

  const checkIsSpecialtyId = (uuid: string) => {
    let s: any = uuid;
    s = s.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
    if (s === null) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    async function fetchFilter() {
      const retrievedFilterOptions: any = await AsyncStorage.getItem('FilterOptions');
      retrievedFilterOptions && setFilterData(filterOptions(JSON.parse(retrievedFilterOptions)));
    }
    fetchFilter();

    let isSpecialtyId = checkIsSpecialtyId(specialityId);
    if (isSpecialtyId == false) {
      fetchAllSpecialities();
    }
  }, []);

  const fetchAllSpecialities = () => {
    client
      .query<getAllSpecialties>({
        query: GET_ALL_SPECIALTIES,
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        try {
          let specialitiesList = data.getAllSpecialties.filter(function(specialty) {
            let obtainedSpecialtyId = specialityId;
            obtainedSpecialtyId = obtainedSpecialtyId.replace('and', '&');

            let specialityName: string = specialty?.name || '';
            specialityName = specialityName.toLowerCase().replace(' ', '-');

            let specialistPluralTerm: string = specialty?.specialistPluralTerm || '';
            specialistPluralTerm = specialistPluralTerm.toLowerCase().replace(' ', '-');

            let specialistSingularTerm: string = specialty?.specialistSingularTerm || '';
            specialistSingularTerm = specialistSingularTerm.toLowerCase().replace(' ', '-');
            return (
              specialty?.slugName == obtainedSpecialtyId ||
              specialityName == obtainedSpecialtyId ||
              specialistPluralTerm == obtainedSpecialtyId ||
              specialistSingularTerm == obtainedSpecialtyId
            );
          });

          setSpecialityId(specialitiesList?.[0].id);
          setDoctorSearch('');
        } catch (error) {}
      })
      .catch((e) => {});
  };

  useEffect(() => {
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
          specialtyId: specialityId,
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
          postPlatinumDoctorCleverTapEvents(
            platinum_doctor,
            CleverTapEventName.CONSULT_DOH_Viewed,
            state
          );
        } else {
          setPlatinumDoctor(null);
        }
      })
      .catch((e) => {
        postWEGPatientAPIError(
          currentPatient,
          '',
          'DoctorSearchListing',
          'GET_PLATINUM_DOCTOR',
          JSON.stringify(e)
        );
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
      response?.data.getPatientAddressList
        ? null
        : postWEGPatientAPIError(
            currentPatient,
            '',
            'DoctorSearchListing',
            'GET_PATIENT_ADDRESS_LIST',
            JSON.stringify(response)
          );
    } catch (error) {
      postWEGPatientAPIError(
        currentPatient,
        '',
        'DoctorSearchListing',
        'GET_PATIENT_ADDRESS_LIST',
        JSON.stringify(error)
      );
      CommonBugFender('DoctorSearchListing_fetchAddress', error);
    }
  }

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
        sortValue,
        undefined,
        false,
        doctorSearch,
        0,
        sortValue?.toLowerCase() === string.doctor_search_listing.location.toLowerCase()
          ? locationDetails?.city
          : ''
      );
      setcurrentLocation(locationDetails.displayName);
      setLocationSearchText(locationDetails.displayName);
    } else if (isOnlineConsultMode) {
      fetchDoctorListByAvailability('availability');
    }
    return () => {
      didFocusSubscription && didFocusSubscription.remove();
      willBlurSubscription && willBlurSubscription.remove();
    };
  }, []);

  const getData = (sortValue = 'availability', locationDetails?: any) => {
    if (locationDetails) {
      const coordinates = {
        lat: locationDetails.latitude || '',
        lng: locationDetails.longitude || '',
      };
      latlng = coordinates;
      if (sortValue?.toLowerCase() === string.doctor_search_listing.avaliablity.toLowerCase()) {
        sortValue = string.doctor_search_listing.location.toLowerCase();
        setSelectedSortInput(string.doctor_search_listing.location);
        setSortValue(string.doctor_search_listing.location.toLowerCase());
      }
      fetchSpecialityFilterData(
        filterMode,
        FilterData,
        latlng,
        sortValue,
        locationDetails?.pincode,
        doctors_partners,
        doctorSearch,
        0,
        locationDetails?.city
      );
    }
  };

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

  const fetchDoctorListByAvailability = (sortValue: string, city?: string | '') => {
    setshowSpinner(false);
    const sortVal = sortValue;
    setSortValue(sortValue);
    const sortInput = sort_filter.find(
      (item) => item?.value?.toLowerCase() === sortVal?.toLowerCase()
    );
    setSelectedSortInput(sortInput?.value);

    !doctorsList?.length &&
      fetchSpecialityFilterData(
        filterMode,
        FilterData,
        latlng,
        sortValue,
        undefined,
        doctors_partners,
        doctorSearch,
        0,
        city || ''
      );
  };

  const fireLocationPermissionEvent = (permissionType: string) => {
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.LOCATION_PERMISSION]
      | CleverTapEvents[CleverTapEventName.CONSULT_LOCATION_PERMISSION] = {
      'Patient name': currentPatient.firstName,
      Source: 'Doctor listing screen',
      'Patient UHID': currentPatient.uhid,
      'Patient age': Math.round(moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)),
      'Patient gender': currentPatient.gender,
      'Patient ID': currentPatient.id,
      'Mobile number': currentPatient?.mobileNumber || '',
      'Circle Member': !!circleSubscriptionId,
      'Circle Plan type': circleSubPlanId,
      'Location permission': permissionType,
      Location: locationDetails?.displayName || locationDetails?.city || '',
      User_Type: getUserType(allCurrentPatients),
    };
    postWebEngageEvent(WebEngageEventName.LOCATION_PERMISSION, eventAttributes);
    postCleverTapEvent(CleverTapEventName.CONSULT_LOCATION_PERMISSION, eventAttributes);
  };
  const fetchSpecialityFilterData = (
    filterMode: ConsultMode = ConsultMode.ONLINE,
    SearchData: filterDataType[] = FilterData,
    location: locationType | null = latlng,
    sort: string | null = sortValue,
    pinCode: string | undefined,
    docTabSelected: boolean = false,
    searchText: string,
    pageNo?: number,
    city?: string
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
      pincode: pinCode || g(locationDetails, 'pincode') || null,
      doctorType:
        brandFilter === undefined || brandFilter === null
          ? SearchData[1].selectedOptions
          : brandFilter,
      city:
        cityFilter === undefined || cityFilter === null
          ? SearchData[0]?.selectedOptions
          : cityFilter,
      experience: experienceArray,
      availability: availabilityArray,
      fees: feesArray,
      gender: SearchData[5].selectedOptions,
      language: SearchData[6].selectedOptions,
      ...availableNow,
      ...specialtyName,
      ...geolocation,
      sort:
        (sort && sort.toLowerCase() === 'distance') ||
        sort === string.doctor_search_listing.location.toLowerCase()
          ? 'distance'
          : sort,
      pageNo: pageNo ? pageNo + 1 : 1,
      pageSize: pageSize,
      searchText: searchText,
      isCare: careDoctorsSwitch,
      consultMode: filterMode,
    };

    if (checkIfValidUUID(specialityId)) {
      FilterInput['specialty'] = specialityId;
    } else {
      FilterInput['slugName'] = specialityId;
    }

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
        if (searchText?.length > 2) {
          postConsultSearchCleverTapEvent(
            searchText,
            currentPatient,
            allCurrentPatients,
            data?.getDoctorList?.doctors?.length == 0,
            'Doctor listing screen',
            !!circleSubscriptionId,
            circleSubPlanId || ''
          );
        }
        pageNo ? setpageNo(pageNo + 1) : setpageNo(1);
        setData(data, docTabSelected, pageNo);
        !pageNo &&
          (setshowSpinner(false),
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
          titleComponent={
            <LocationOnHeader
              navigation={props.navigation}
              onLocationChange={(loc) => getData(sortValue, loc)}
              isAvailabilityMode={selectedSortInput === string.doctor_search_listing.avaliablity}
              isOnlineConsultMode={isOnlineConsultMode}
              goBack={true}
              postSelectLocation={() =>
                postEventClickSelectLocation(
                  props.navigation.getParam('specialityName'),
                  specialityId,
                  'Doctor list'
                )
              }
              postEventClickSelectLocation={(city) =>
                postEventClickSelectLocation(
                  props.navigation.getParam('specialityName'),
                  specialityId,
                  '',
                  city
                )
              }
            />
          }
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
                    sortValue,
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
    states?: any
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DOH_Viewed] = {
      doctorId: doctorData?.id,
      doctorName: doctorData?.displayName,
      doctorType: doctorData?.doctorType,
      specialtyId: specialityId,
      specialtyName: props.navigation.getParam('specialityName') || '',
      zone: states || locationDetails?.state || '',
      userName: `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      userPhoneNumber: currentPatient?.mobileNumber,
    };
    postWebEngageEvent(eventName, eventAttributes);
  };

  const postPlatinumDoctorCleverTapEvents = (
    doctorData: any,
    eventName: CleverTapEventName,
    states?: any
  ) => {
    const eventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_DOH_Viewed] = {
      'Doctor ID': doctorData?.id,
      'Doctor name': doctorData?.displayName,
      'Doctor category': doctorData?.doctorType,
      'Speciality ID': props.navigation.getParam('specialityId') || '',
      'Speciality name': props.navigation.getParam('specialityName') || '',
      Zone: states || locationDetails?.state || '',
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Mobile number': currentPatient?.mobileNumber,
      'Patient UHID': currentPatient?.uhid || '',
      'Patient age': Math.round(moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)),
      'Patient gender': currentPatient?.gender,
    };
    postCleverTapEvent(eventName, eventAttributes);
  };

  const postDoctorClickWEGEvent = (
    doctorDetails: any,
    source: WebEngageEvents[WebEngageEventName.DOCTOR_CLICKED]['Source'],
    isTopDoc: boolean,
    type?: 'consult-now' | 'book-appointment' | ''
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DOCTOR_CLICKED] = {
      'Doctor Name': doctorDetails.displayName!,
      Source: source,
      'Doctor ID': doctorDetails.id,
      'Speciality ID': specialityId,
      'Doctor Category': doctorDetails.doctorType,
      Fee: Number(doctorDetails?.fee),
      'Doctor Speciality': doctorDetails?.specialtydisplayName,
      Rank: doctorDetails?.rowId,
      Is_TopDoc: !!isTopDoc ? 'Yes' : 'No',
      User_Type: getUserType(allCurrentPatients),
    };

    const {
      onlineConsultDiscountedPrice,
      cashbackEnabled,
      cashbackAmount,
    } = calculateCircleDoctorPricing(doctorDetails);

    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_DOCTOR_PROFILE_VIEWED] = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile number': g(currentPatient, 'mobileNumber'),
      'Doctor ID': g(doctorDetails, 'id')! || undefined,
      'Doctor name': g(doctorDetails, 'displayName')! || undefined,
      'Speciality name': doctorDetails?.specialtydisplayName,
      Experience: String(doctorDetails?.experience) || '',
      'Speciality ID': props.navigation.getParam('specialityId') || '',
      'Media source': 'NA',
      User_Type: getUserType(allCurrentPatients),
      Languages: doctorDetails?.languages?.join(',') || '',
      Fee: Number(doctorDetails?.onlineConsultationFees) || doctorDetails?.fee || undefined,
      Source: 'Doctor Card clicked',
      'Doctor card clicked': 'Yes',
      Rank: doctorDetails?.rowId,
      Is_TopDoc: !!isTopDoc ? 'Yes' : 'No',
      DOTH: !!isTopDoc ? 'T' : 'F',
      'Doctor tab': doctorsType === 'PARTNERS' ? 'Partner' : 'Apollo Tab',
      'Search screen': doctorSearch?.length > 2 ? 'Doctor listing' : 'NA',
      'Doctor category': doctorDetails?.doctorType,
      'Appointment CTA': 'NA',
      'Customer ID': g(currentPatient, 'id'),
      'Available in mins': String(doctorDetails?.earliestSlotInMinutes) || '',
      Relation: g(currentPatient, 'relation'),
      'Circle Membership added': String(!!circlePlanSelected),
      'Circle discount': onlineConsultDiscountedPrice ? onlineConsultDiscountedPrice : 0,
      'Circle Cashback': cashbackEnabled ? cashbackAmount! : 0,
      'Doctor city': 'NA',
      'Hospital name': 'NA',
    };
    const eventAttributesFirebase: FirebaseEvents[FirebaseEventName.DOCTOR_CLICKED] = {
      DoctorName: doctorDetails.fullName!,
      Source: source,
      DoctorID: doctorDetails.id,
      SpecialityID: specialityId,
      DoctorCategory: doctorDetails.doctorType,
      Fee: Number(doctorDetails?.fee),
      DoctorSpeciality: doctorDetails?.specialistSingularTerm,
    };

    if (type == 'consult-now') {
      postWebEngageEvent(WebEngageEventName.CONSULT_NOW_CLICKED, eventAttributes);
      const appsflyereventAttributes: AppsFlyerEvents[AppsFlyerEventName.CONSULT_NOW_CLICKED] = {
        'customer id': currentPatient ? currentPatient.id : '',
        'doctor id': doctorDetails.id,
        'specialty id': specialityId,
      };
      postAppsFlyerEvent(AppsFlyerEventName.CONSULT_NOW_CLICKED, appsflyereventAttributes);
      postFirebaseEvent(FirebaseEventName.CONSULT_NOW_CLICKED, eventAttributesFirebase);
    } else if (type == 'book-appointment') {
      const _cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_BOOK_APPOINTMENT_CONSULT_CLICKED] = {
        'Patient name': currentPatient.firstName,
        'Doctor ID': doctorDetails?.id,
        'Speciality ID': doctorDetails?.specialty?.id,
        'Speciality name': doctorDetails?.specialty?.name,
        Experience: Number(doctorDetails?.experience),
        'Doctor hospital': doctorDetails?.doctorHospital?.[0]?.facility?.name,
        'Doctor city': doctorDetails?.doctorHospital?.[0]?.facility?.city,
        'Available in mins': getTimeDiff(doctorDetails?.slot),
        Source: 'Doctor card doctor listing screen',
        'Patient UHID': currentPatient.uhid,
        Relation: currentPatient?.relation,
        'Patient age': Math.round(moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)),
        'Patient gender': currentPatient.gender,
        'Customer ID': currentPatient.id,
        User_Type: getUserType(allCurrentPatients),
        rank: doctorDetails.rowId || undefined,
        'Online consult fee':
          Number(doctorDetails?.onlineConsultationFees) || Number(doctorDetails?.fee) || undefined,
        'Physical consult fee':
          Number(doctorDetails?.physicalConsultationFees) ||
          Number(doctorDetails?.fee) ||
          undefined,
        'Mobile number': currentPatient?.mobileNumber || '',
        'Circle Member': !!circleSubscriptionId,
        'Circle Plan type': circleSubPlanId,
      };
      eventAttributes['Source'] = 'List';
      postWebEngageEvent(WebEngageEventName.BOOK_APPOINTMENT, eventAttributes);
      postCleverTapEvent(
        CleverTapEventName.CONSULT_BOOK_APPOINTMENT_CONSULT_CLICKED,
        _cleverTapEventAttributes
      );
      const appsflyereventAttributes: AppsFlyerEvents[AppsFlyerEventName.BOOK_APPOINTMENT] = {
        'customer id': currentPatient ? currentPatient.id : '',
      };
      postAppsFlyerEvent(AppsFlyerEventName.BOOK_APPOINTMENT, appsflyereventAttributes);
      postFirebaseEvent(FirebaseEventName.BOOK_APPOINTMENT, eventAttributesFirebase);
    } else {
      postWebEngageEvent(WebEngageEventName.DOCTOR_CLICKED, eventAttributes);
      postCleverTapEvent(
        CleverTapEventName.CONSULT_DOCTOR_PROFILE_VIEWED,
        cleverTapEventAttributes
      );
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
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.APOLLO_DOCTOR_TAB_CLICKED]
      | CleverTapEvents[CleverTapEventName.CONSULT_DOCTOR_TAB_CLICKED] = {
      'Patient UHID': g(currentPatient, 'uhid'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      Source: tab == 'APOLLO' ? 'Apollo Doctors' : 'Partner Doctors',
    };
    postCleverTapEvent(CleverTapEventName.CONSULT_DOCTOR_TAB_CLICKED, eventAttributes);
    if (tab == 'APOLLO') {
      postWebEngageEvent(WebEngageEventName.APOLLO_DOCTOR_TAB_CLICKED, eventAttributes);
    } else {
      postWebEngageEvent(WebEngageEventName.DOCTOR_CONNECT_TAB_CLICKED, eventAttributes);
    }
  };

  const renderDoctorCard = (
    rowData: any,
    index: number,
    styles: StyleProp<ViewStyle> = {},
    filter?: ConsultMode
  ) => {
    return platinumDoctor?.id !== rowData?.id ? (
      <DoctorCard
        key={index}
        rowId={index + 1}
        rowData={rowData}
        navigation={props.navigation}
        style={styles}
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
              consultModeSelected: rowData?.consultMode,
            });
          } else {
            props.navigation.navigate(AppRoutes.DoctorDetailsBookingOnRequest, {
              doctorId: rowData.id,
              callSaveSearch: callSaveSearch,
            });
          }
        }}
        onPressConsultNowOrBookAppointment={(type) => {
          postDoctorClickWEGEvent(rowData, 'List', false, type);
        }}
        onPlanSelected={() => setShowCarePlanNotification(true)}
        selectedConsultMode={filter}
      />
    ) : null;
  };
  const [showProvideLocation, setShowProvideLocation] = useState<boolean>(true);
  const renderSearchDoctorResultsRow = (
    rowData: any,
    index: number,
    styles: StyleProp<ViewStyle> = {},
    filter?: ConsultMode
  ) => {
    if (rowData) {
      return index === 0 && platinumDoctor ? (
        <>
          {renderPlatinumDoctorView(index)}
          {renderDoctorCard(rowData, index, styles, filter)}
        </>
      ) : (
        <>
          {/* Commenting on temporary basis for the release of 6.1.0 */}
          {/* {index === 2 && (
            <View style={provideLocationStyles.provideLocationOuterContainer}>
              <View style={provideLocationStyles.provideLocationInnerContainer}>
                <Text style={provideLocationStyles.provideLocationHeadingData}>
                  {string.common.consult_via_visit}
                </Text>

                <Button
                  title={'Provide Location'}
                  style={provideLocationStyles.buttonHeading}
                  onPress={() => {
                    props.navigation.navigate(AppRoutes.SelectLocation, {
                      isOnlineConsultMode: false,
                      patientId: g(currentPatient, 'id') || '',
                      patientMobileNumber: g(currentPatient, 'mobileNumber') || '',
                      goBackCallback: (loc: any) => {
                        setOnlineCheckbox(false);
                        setPhysicalCheckbox(true);
                        setShowProvideLocation(false);
                        if (loc?.city) setCityFilter([loc?.city]);
                        fetchDoctorListByAvailability(
                          string.doctor_search_listing.location,
                          loc?.city
                        );
                      },
                      postEventClickSelectLocation: (city: string | '') =>
                        postEventClickSelectLocation(
                          props.navigation.getParam('specialityName'),
                          specialityId,
                          '',
                          city
                        ),
                    });
                  }}
                  titleTextStyle={{ color: theme.colors.APP_YELLOW }}
                />
              </View>
            </View>
          )} */}
          {renderDoctorCard(rowData, index, styles, filter)}
        </>
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
                    if (filterMode === ConsultMode.PHYSICAL) {
                      onPressVideoConsult();
                    } else {
                      onPressHospitalVisit();
                    }
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
            renderItem={({ item, index }) => renderSearchDoctorResultsRow(item, index, {}, filter)}
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

  const renderNearByPopup = () => (
    <View style={styles.nearbyContainer}>
      <View style={styles.nearbyInnerContainer}>
        <Text
          style={{
            color: theme.colors.CARD_HEADER,
            ...theme.fonts.IBMPlexSansMedium(14),
          }}
        >
          <Text>{'Your selected location is '}</Text>
          <Text style={{ color: theme.colors.APP_GREEN }}>
            {locationDetails?.displayName ? `${locationDetails?.displayName}. ` : '-'}
          </Text>
          <Text>{'Do you wish to go ahead with the same? '}</Text>
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <Button
            style={{ flex: 1, marginRight: 5, backgroundColor: 'white' }}
            titleTextStyle={{ ...theme.viewStyles.text('B', 13, theme.colors.APP_YELLOW_COLOR) }}
            title={'ALLOW AUTO DETECT'}
            onPress={() => {
              fireLocationPermissionEvent('Allow auto detect');
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
                      undefined,
                      doctors_partners,
                      doctorSearch
                    );
                  setNearbyPopup(false);
                })
                .catch((e) => {
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
                });
            }}
          />
          <Button
            style={{ flex: 1 }}
            titleTextStyle={{ ...theme.viewStyles.text('B', 13, theme.colors.WHITE) }}
            title={'YES, GO AHEAD'}
            onPress={() => {
              getData('distance', locationDetails);
              setNearbyPopup(false);
            }}
          />
        </View>
      </View>
    </View>
  );

  const locationWebEngageEvent = (location: any, type: 'Auto Detect' | 'Manual entry') => {
    if (fireLocationEvent.current) {
      userLocationConsultWEBEngage(currentPatient, location, 'Doctor list', type);
      consultUserLocationCleverTapEvents(currentPatient, location, 'Doctor listing screen', type);
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
        sortValue,
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
        style={[
          styles.linearGradient,
          setHeight && { minHeight: 310, flex: Platform.OS === 'ios' ? 0.05 : 0.09 },
        ]}
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
          isPlatinumDoctor={true}
          style={doctorCardStyle}
          buttonViewStyle={{ overflow: 'hidden' }}
          buttonStyle={buttonStyle}
          buttonTextStyle={buttonTextStyle}
          onPress={(id: string, onlineConsult: boolean) => {
            postDoctorClickWEGEvent(platinumDoctor, 'List', true);
            postPlatinumDoctorWEGEvents(platinumDoctor, WebEngageEventName.DOH_Clicked);
            postPlatinumDoctorCleverTapEvents(
              platinumDoctor,
              CleverTapEventName.CONSULT_DOH_Clicked
            );
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
        postDoctorShareCleverTapEvents(
          doctorData,
          CleverTapEventName.CONSULT_SHARE_PROFILE_CLICKED,
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
    postDoctorShareCleverTapEvents(
      doctorData,
      CleverTapEventName.CONSULT_GO_BACK_CLICKED,
      currentPatient,
      specialityId,
      doctorShareRank
    );
  };

  const renderDoctorShareComponent = () => {
    const selectedMode = onlineCheckBox ? ConsultMode.ONLINE : ConsultMode.PHYSICAL;
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
  const [onlineCheckBox, setOnlineCheckbox] = useState<boolean>(isOnlineConsultMode);
  const [physicalCheckBox, setPhysicalCheckbox] = useState<boolean>(!isOnlineConsultMode);

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
    if (typeOfConsult) {
      setPhysicalCheckbox(false);
      setOnlineCheckbox(true);
      setIsDeepLink(true);
      onPressSortValues(string.doctor_search_listing.avaliablity);
    }
  };

  const fireFilterWebengageEvent = (
    filterApplied: string,
    filterValue: string,
    filterAppliedData?: any,
    isIconEvent: boolean = false
  ) => {
    if (isIconEvent) {
      const eventAttributesNew: CleverTapEvents[CleverTapEventName.CONSULT_FILTER_ICON_CLICKED] = {
        'Patient name': `${currentPatient?.firstName} ${currentPatient?.lastName}`,
        'Patient UHID': currentPatient?.uhid || '',
        'Mobile number': currentPatient?.mobileNumber,
        'Patient age': Math.round(moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)),
        'Patient gender': currentPatient?.gender || '',
        User_Type: getUserType(allCurrentPatients),
        'Speciality name': specialityName || '',
        'Doctor tab': doctorsType || '',
        'Circle member': !!circleSubscriptionId,
        'Circle plan type': circleSubPlanId || '',
        'Customer ID': currentPatient?.id || '',
      };
      postCleverTapEvent(CleverTapEventName.CONSULT_FILTER_ICON_CLICKED, eventAttributesNew);
    } else {
      const eventAttributes: WebEngageEvents[WebEngageEventName.DOCTOR_LISTING_FILTER_APPLIED] = {
        'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
        'Patient UHID': g(currentPatient, 'uhid'),
        'Mobile Number': g(currentPatient, 'mobileNumber'),
        pincode: g(locationDetails, 'pincode') || '',
        'Filter Applied': filterApplied || undefined,
        'Filter Value': filterValue || undefined,
        ...filterAppliedData,
      };
      const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_FILTER_APPLIED] = {
        'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
        'Patient UHID': g(currentPatient, 'uhid'),
        'Mobile number': g(currentPatient, 'mobileNumber'),
        'Patient age': Math.round(
          moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
        ),
        'Patient gender': g(currentPatient, 'gender'),
        Pincode: g(locationDetails, 'pincode') || undefined,
        User_Type: getUserType(allCurrentPatients),
        'Doctor tab': doctorsType || undefined,
        'User city': g(locationDetails, 'city') || undefined,
        'Filters applied': filterApplied || undefined,
        'Filter Value': filterValue || undefined,
        'Circle member': !!circleSubscriptionId,
        'Circle plan type': circleSubPlanId || '',
        ...filterAppliedData,
      };
      postWebEngageEvent(WebEngageEventName.DOCTOR_LISTING_FILTER_APPLIED, eventAttributes);
      postCleverTapEvent(CleverTapEventName.CONSULT_FILTER_APPLIED, cleverTapEventAttributes);
    }
  };
  const [nearbyPopup, setNearbyPopup] = useState<boolean>(false);
  const doctors_partners = doctorsType === 'PARTNERS' ? true : false;
  const postSortEvent = (sort: any) => {
    const eventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_SORT] = {
      'Sort names': sort,
      'Patient UHID': currentPatient?.uhid,
      'Patient name': `${currentPatient?.firstName} ${currentPatient?.lastName}` || '',
      'Mobile number': currentPatient?.mobileNumber || '',
      'Patient age': Math.round(moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)),
      'Patient gender': currentPatient?.gender || '',
      'Speciality name': specialityName,
      'Speciality ID': specialityId,
    };
    postCleverTapEvent(CleverTapEventName.CONSULT_SORT, eventAttributes);
  };
  const onApplyingSortFilters = (sort: string) => {
    const attributes = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      User_Type: getUserType(allCurrentPatients),
      'Sort By': sort,
    };
    postWebEngageEvent(WebEngageEventName.CONSULT_SORT, attributes);
    postSortEvent(sort);
    if (sort === 'distance') {
      setDoctorsList([]);
      if (locationDetails) {
        setNearbyPopup(true);
        setSortValue(sort);
        setSelectedSortInput(string.doctor_search_listing.near);
      } else {
        props.navigation.navigate(AppRoutes.SelectLocation, {
          isOnlineConsultMode: isOnlineConsultMode,
          patientId: g(currentPatient, 'id') || '',
          patientMobileNumber: g(currentPatient, 'mobileNumber') || '',
          goBack: true,
          goBackCallback: (loc: any) => {
            const coordinates = {
              lat: loc?.latitude || '',
              lng: loc?.longitude || '',
            };
            latlng = coordinates;
            setSortValue(sort);
            setSelectedSortInput(string.doctor_search_listing.near);
            fetchSpecialityFilterData(
              filterMode,
              FilterData,
              latlng,
              'distance',
              undefined,
              doctors_partners,
              doctorSearch
            );
          },
        });
      }
    } else if (sort === string.doctor_search_listing.location.toLowerCase()) {
      setshowSpinner(true);
      setSortValue(sort);
      fetchSpecialityFilterData(
        filterMode,
        FilterData,
        latlng,
        sort,
        undefined,
        doctors_partners,
        doctorSearch,
        0,
        locationDetails?.city
      );
    } else {
      setSortValue(sort);
      setshowSpinner(true);
      fetchSpecialityFilterData(
        filterMode,
        FilterData,
        latlng,
        sort,
        undefined,
        doctors_partners,
        doctorSearch
      );
    }
  };

  const onPressSortValues = (value: string | number) => {
    switch (value) {
      case string.doctor_search_listing.avaliablity:
        setSelectedSortInput(value);
        onApplyingSortFilters('availability');
        break;
      case string.doctor_search_listing.near:
        onApplyingSortFilters('distance');
        break;
      case string.doctor_search_listing.location:
        if (!locationDetails) {
          props.navigation.navigate(AppRoutes.SelectLocation, {
            isOnlineConsultMode: isOnlineConsultMode,
            patientId: g(currentPatient, 'id') || '',
            patientMobileNumber: g(currentPatient, 'mobileNumber') || '',
            goBack: true,
            goBackCallback: (loc: any) => {
              const coordinates = {
                lat: loc?.latitude || '',
                lng: loc?.longitude || '',
              };
              latlng = coordinates;
              setSelectedSortInput(value);
              onApplyingSortFilters('location');
            },
          });
        } else {
          setSelectedSortInput(value);
          onApplyingSortFilters('location');
        }
        break;
      default:
        break;
    }
  };
  const postEventClickSelectLocation = (
    specialityName: string = '',
    specialityId: string = '',
    screen?: string,
    city?: string
  ) => {
    if (screen) {
      const attributes = {
        'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}` || '',
        'Patient UHID': g(currentPatient, 'uhid'),
        'Patient age': Math.round(
          moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
        ),
        'Mobile number': g(currentPatient, 'mobileNumber'),
        'Speciality name': specialityName,
        'Location details': city || locationDetails?.displayName || '',
        Screen: screen,
      };
      postCleverTapEvent(CleverTapEventName.CONSULT_USER_LOCATION, attributes);
    } else {
      const attributes: CleverTapEvents[CleverTapEventName.CONSULT_SELECT_LOCATION] = {
        'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}` || '',
        'Patient UHID': g(currentPatient, 'uhid'),
        'Patient age': Math.round(
          moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
        ),
        'Mobile number': g(currentPatient, 'mobileNumber'),
        'Speciality name': specialityName,
        'Location details': city || locationDetails?.displayName || '',
        'Consult mode': isOnlineConsultMode ? 'Video Consult' : 'Hospital Visit',
        'Speciality ID': specialityId,
      };
      postCleverTapEvent(CleverTapEventName.CONSULT_SELECT_LOCATION, attributes);
    }
  };
  const consultTypeCta = props.navigation?.getParam('consultTypeCta');

  const callToggleChangeWEGEvent = (onlineToggle: boolean = true) => {
    const attributes: CleverTapEvents[CleverTapEventName.CONSULT_MODE_TOGGLE] = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}` || '',
      'Patient UHID': g(currentPatient, 'uhid') || '',
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Mobile number': g(currentPatient, 'mobileNumber'),
      'Initial consult mode': !onlineToggle ? 'Video consult' : 'Hospital Visit',
      'Location details': locationDetails?.displayName || '',
      'Speciality ID': specialityId || '',
      'Speciality name': props.navigation.getParam('specialityName') || '',
      CTA: consultTypeCta || 'NA',
    };
    postCleverTapEvent(CleverTapEventName.CONSULT_MODE_TOGGLE, attributes);
  };

  const onPressHospitalVisit = () => {
    callToggleChangeWEGEvent(false);
    if (isOnlineConsultMode) {
      if (!locationDetails) {
        props.navigation.navigate(AppRoutes.SelectLocation, {
          isOnlineConsultMode: isOnlineConsultMode,
          patientId: g(currentPatient, 'id') || '',
          patientMobileNumber: g(currentPatient, 'mobileNumber') || '',
          goBack: true,
          goBackCallback: (loc: any) => {
            const coordinates = {
              lat: loc?.latitude || '',
              lng: loc?.longitude || '',
            };
            latlng = coordinates;
            setPhysicalCheckbox(!physicalCheckBox);
            setOnlineCheckbox(false);
            setSelectedSortInput(string.doctor_search_listing.location);
            setSortValue(string.doctor_search_listing.location.toLowerCase());
            setfilterMode(ConsultMode.PHYSICAL);
            fetchSpecialityFilterData(
              ConsultMode.PHYSICAL,
              FilterData,
              latlng,
              string.doctor_search_listing.location.toLowerCase(),
              loc?.pincode,
              doctors_partners,
              doctorSearch,
              0,
              loc?.city
            );
          },
        });
      } else {
        setSelectedSortInput(string.doctor_search_listing.location);
        setSortValue(string.doctor_search_listing.location.toLowerCase());
        setPhysicalCheckbox(!physicalCheckBox);
        setOnlineCheckbox(false);
        setfilterMode(ConsultMode.PHYSICAL);
        fetchSpecialityFilterData(
          ConsultMode.PHYSICAL,
          FilterData,
          latlng,
          string.doctor_search_listing.location.toLowerCase(),
          locationDetails?.pincode,
          doctors_partners,
          doctorSearch,
          0,
          locationDetails?.city
        );
      }
    } else {
      setPhysicalCheckbox(!physicalCheckBox);
      setOnlineCheckbox(false);
      setfilterMode(ConsultMode.PHYSICAL);
      setSelectedSortInput(string.doctor_search_listing.location);
      setSortValue(string.doctor_search_listing.location.toLowerCase());
      fetchSpecialityFilterData(
        ConsultMode.PHYSICAL,
        FilterData,
        latlng,
        string.doctor_search_listing.location.toLowerCase(),
        locationDetails?.pincode,
        doctors_partners,
        doctorSearch,
        0,
        locationDetails?.city
      );
    }
  };

  const onPressVideoConsult = () => {
    callToggleChangeWEGEvent();
    setOnlineCheckbox(!onlineCheckBox);
    setPhysicalCheckbox(false);
    setfilterMode(ConsultMode.ONLINE);
    setSelectedSortInput(string.doctor_search_listing.avaliablity);
    setSortValue(string.doctor_search_listing.avaliablity.toLowerCase());
    fetchSpecialityFilterData(
      ConsultMode.ONLINE,
      FilterData,
      latlng,
      string.doctor_search_listing.avaliablity.toLowerCase(),
      locationDetails?.pincode,
      doctors_partners,
      doctorSearch
    );
  };

  const renderBottomOptions = () => {
    return (
      <View style={styles.bottomMainContainer}>
        <View style={[styles.bottomOptionsContainer, { paddingRight: 14 }]}>
          <View style={styles.bottomItemContainer}>
            <Sort style={styles.sortIcon} />
            <View>
              <Text style={styles.sortByTextStyle}>{string.doctor_search_listing.sortby} :</Text>
              <MaterialMenu
                options={sort_filter}
                menuContainerStyle={{
                  top: Platform.OS === 'ios' ? screenHeight - 95 : screenHeight - 60,
                }}
                itemContainer={{ borderBottomWidth: 0 }}
                itemTextStyle={{
                  ...theme.viewStyles.text('M', 16, '#01475b'),
                  paddingHorizontal: 0,
                }}
                selectedTextStyle={{
                  ...theme.viewStyles.text('M', 16, 'red'),
                  alignSelf: 'flex-start',
                }}
                onPress={(input) => {
                  onPressSortValues(input?.value);
                }}
                bottomPadding={{ paddingBottom: 0 }}
              >
                <View style={styles.row}>
                  <Text style={styles.selectedFilterText}>{selectedSortInput}</Text>
                  <DropdownGreen />
                </View>
              </MaterialMenu>
            </View>
          </View>
          <View style={styles.seperator} />
          <View style={styles.bottomItemContainer}>
            <View style={styles.bottomItemContainer}>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.centerRow}
                onPress={() => onPressHospitalVisit()}
              >
                <Text style={[styles.consultModeText, { opacity: physicalCheckBox ? 1 : 0.6 }]}>
                  Hospital Visit
                </Text>
              </TouchableOpacity>
              {onlineCheckBox ? (
                <TouchableOpacity onPress={() => onPressHospitalVisit()}>
                  <Toggle style={styles.toggleIcon} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => onPressVideoConsult()}>
                  <LeftToggle style={styles.toggleIcon} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.centerRow}
                activeOpacity={1}
                onPress={() => onPressVideoConsult()}
              >
                <Text style={[styles.consultModeText, { opacity: onlineCheckBox ? 1 : 0.6 }]}>
                  Video Consult
                </Text>
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
                fireFilterWebengageEvent('', '', '', true);
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

  const postDoctorPartnerTabClickEvent = () => {
    const eventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_DOC_PARTNER_TAB_CLICKED] = {
      'Patient name': `${currentPatient?.firstName} ${currentPatient?.lastName}` || '',
      'Patient UHID': currentPatient?.uhid || '',
      'Patient gender': currentPatient?.gender || '',
      'Patient age': Math.round(moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)),
      User_Type: getUserType(allCurrentPatients),
      'Speciality ID': specialityId,
      'Customer ID': currentPatient?.id || '',
      'Mobile number': currentPatient?.mobileNumber,
      'Circle member': !!circleSubscriptionId,
      'Circle plan type': circleSubPlanId || '',
    };
    postCleverTapEvent(CleverTapEventName.CONSULT_DOC_PARTNER_TAB_CLICKED, eventAttributes);
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
            onPress={() => {
              onPressDoctorPartnersTab();
              postDoctorPartnerTabClickEvent();
            }}
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

  const callAskApolloNumber = () => {
    const eventAttributes: CleverTapEvents[CleverTapEventName.CLICKED_ON_APOLLO_NUMBER] = {
      'Screen type': 'Speciality Listing Page',
      'Patient Number': currentPatient?.mobileNumber,
      'Speciality ID': specialityId,
      'Speciality Name': specialityName,
    };
    postCleverTapEvent(CleverTapEventName.CLICKED_ON_APOLLO_NUMBER, eventAttributes);
    Linking.openURL(`tel:${AppConfig.Configuration.Ask_Apollo_Number}`);
  };

  const navigateToQuickBook = () => {
    const ctAttributes = {
      'Screen type': 'Speciality Listing Page',
      'Patient Number': currentPatient?.mobileNumber,
      'Speciality ID': specialityId,
      'Speciality Name': specialityName,
    };
    props.navigation.navigate(AppRoutes.AskApolloQuickBook, { ctAttributes });
  };

  const renderAskApolloView = () => {
    return (
      <View style={styles.askApolloView}>
        {displayQuickBookAskApollo && (
          <Button
            title="QUICK BOOK"
            style={styles.quickBookBtn}
            titleTextStyle={styles.quickBookText}
            onPress={navigateToQuickBook}
          />
        )}
        {displayAskApolloNumber && (
          <View style={styles.horizontalEnd}>
            <TouchableOpacity onPress={callAskApolloNumber} style={styles.horizontalView}>
              <CallIcon style={styles.callLogo} />
              <Text style={styles.askApolloNumber}>
                {AppConfig.Configuration.Ask_Apollo_Number}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderTopView()}
        {searchIconClicked && renderDoctorSearchBar()}
        {(displayQuickBookAskApollo || displayAskApolloNumber) && renderAskApolloView()}
        {renderTopTabBar()}
        {renderDoctorShareComponent()}
        <ScrollView bounces={false} ref={scrollViewRef} contentContainerStyle={{ flex: 1 }}>
          {showSpinner ? (
            renderSearchLoadingView()
          ) : (
            <View style={{ flex: 1 }}>
              {renderDoctorSearches(
                onlineCheckBox ? ConsultMode.ONLINE : ConsultMode.PHYSICAL,
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
            let selectedOptionsObj: any = {};
            selecteddata.forEach((value) => {
              const { label, selectedOptions } = value;
              if (selectedOptions.length) {
                selectedOptionsObj[`${label}`] = selectedOptions?.join();
              }
            });
            fireFilterWebengageEvent('', '', selectedOptionsObj);
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
      {nearbyPopup && renderNearByPopup()}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
    </View>
  );
};
