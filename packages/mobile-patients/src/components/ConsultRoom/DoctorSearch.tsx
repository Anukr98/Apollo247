import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DoctorCard } from '@aph/mobile-patients/src/components/ui/DoctorCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  ArrowRight,
  Mascot,
  DropdownGreen,
  PrimaryIcon,
  LinkedUhidIcon,
  SympTrackerIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  DOCTOR_SPECIALITY_BY_FILTERS,
  GET_ALL_SPECIALTIES,
  GET_PATIENT_PAST_SEARCHES,
  SAVE_SEARCH,
  SEARCH_DOCTOR_AND_SPECIALITY_BY_NAME,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getAllSpecialties,
  getAllSpecialties_getAllSpecialties,
} from '@aph/mobile-patients/src/graphql/types/getAllSpecialties';
import { getPastSearches_getPastSearches } from '@aph/mobile-patients/src/graphql/types/getPastSearches';
import { getPatientPastSearches } from '@aph/mobile-patients/src/graphql/types/getPatientPastSearches';
import {
  FilterDoctorInput,
  SEARCH_TYPE,
  ConsultMode,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { saveSearch } from '@aph/mobile-patients/src/graphql/types/saveSearch';
import {
  SearchDoctorAndSpecialtyByName,
  SearchDoctorAndSpecialtyByNameVariables,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctorsNextAvailability,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties,
} from '@aph/mobile-patients/src/graphql/types/SearchDoctorAndSpecialtyByName';
import {
  AppsFlyerEventName,
  AppsFlyerEvents,
} from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import {
  dataSavedUserID,
  g,
  getNetStatus,
  isValidSearch,
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
  postWEGNeedHelpEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';

import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Mutation } from 'react-apollo';
import { useApolloClient } from 'react-apollo-hooks';
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import {
  NavigationActions,
  NavigationScreenProps,
  ScrollView,
  StackActions,
} from 'react-navigation';
import { getDoctorsBySpecialtyAndFilters } from '../../graphql/types/getDoctorsBySpecialtyAndFilters';
import { useAppCommonData } from '../AppCommonDataProvider';
import { useUIElements } from '../UIElementsProvider';
import { ProfileList } from '../ui/ProfileList';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import Video from 'react-native-video';
import _ from 'lodash';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 0.4,
    borderBottomColor: theme.colors.BORDER_BOTTOM_COLOR,
  },
  searchView: {
    paddingHorizontal: 20,
  },
  pastSearches: {
    backgroundColor: 'white',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  searchValueStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SHERPA_BLUE,
  },
  specialityText: {
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 20,
  },
  topSpecilityCard: {
    width: 0.5 * (width - 60),
    backgroundColor: '#fff',
    marginRight: 20,
    marginTop: 20,
    ...theme.viewStyles.cardViewStyle,
  },
  topSpecialityName: {
    ...theme.fonts.IBMPlexSansMedium(14),
    marginVertical: 7,
    marginHorizontal: 8,
    textAlign: 'center',
    alignItems: 'center',
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 18,
  },
  topSpecialityNameiOS: {
    ...theme.fonts.IBMPlexSansMedium(14),
    marginHorizontal: 8,
    textAlign: 'center',
    color: theme.colors.SHERPA_BLUE,
  },
  topSpecialityDescription: {
    ...theme.fonts.IBMPlexSansMedium(12),
    marginHorizontal: 20,
    color: theme.colors.LIGHT_BLUE,
    opacity: 0.6,
    lineHeight: 14,
    textAlign: 'center',
    letterSpacing: 0.04,
  },
  topSpecialityFriendlyname: {
    ...theme.fonts.IBMPlexSansMedium(10),
    marginHorizontal: 20,
    color: theme.colors.LIGHT_BLUE,
    lineHeight: 12,
    letterSpacing: 0.04,
    textAlign: 'center',
  },
  whichSpecialityTxt: {
    ...theme.fonts.IBMPlexSansMedium(14),
    marginTop: 12,
    color: theme.colors.SHERPA_BLUE,
  },
  TrackTxt: {
    ...theme.fonts.IBMPlexSansBold(13),
    marginTop: 5,
    color: theme.colors.APP_YELLOW,
  },
  bookConsultTxt: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    // lineHeight: 20,
    marginLeft: 20,
    marginTop: 8,
  },
  listView: {
    ...theme.viewStyles.cardViewStyle,
    marginVertical: 16,
    width: 'auto',
    backgroundColor: 'white',
    marginHorizontal: 8,
  },
  rowTextStyles: {
    color: theme.colors.SEARCH_TITLE_COLOR,
    paddingHorizontal: 12,
    ...theme.fonts.IBMPlexSansSemiBold(14),
  },
  listSpecialistView: {
    ...theme.viewStyles.cardViewStyle,
    flexDirection: 'row',
  },
  rowSpecialistStyles: {
    ...theme.fonts.IBMPlexSansMedium(14),
    marginLeft: 16,
    marginTop: 12,
    color: theme.colors.SHERPA_BLUE,
    textAlign: 'left',
    height: 24,
    width: width - 168,
    lineHeight: 24,
    paddingRight: 1,
  },
  descriptionCont: {
    borderBottomWidth: 0.4,
    borderBottomColor: theme.colors.BORDER_BOTTOM_COLOR,
    marginLeft: 16,
    marginBottom: 7,
  },
  rowDescriptionSpecialistStyles: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.LIGHT_BLUE,
    textAlign: 'left',
    width: width - 168,
    opacity: 0.6,
    lineHeight: 20,
    letterSpacing: 0.04,
    paddingRight: 1,
    marginBottom: 8,
  },
  rowUserFriendlySpecialistStyles: {
    ...theme.fonts.IBMPlexSansMedium(10),
    marginLeft: 16,
    color: theme.colors.LIGHT_BLUE,
    textAlign: 'left',
    width: width - 168,
    lineHeight: 13,
    letterSpacing: 0.04,
    paddingRight: 1,
    marginBottom: 13,
  },
  helpView: {
    marginTop: 40,
    marginBottom: 20,
  },
  showPopUp: {
    backgroundColor: 'rgba(0,0,0,0.01)',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    elevation: 5,
  },
  container: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  mainView: {
    backgroundColor: 'rgba(100,100,100, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subViewPopup: {
    backgroundColor: 'white',
    width: '88%',
    alignSelf: 'center',
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  congratulationsDescriptionStyle: {
    marginHorizontal: 24,
    marginTop: 8,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  popDescriptionStyle: {
    marginHorizontal: 24,
    marginTop: 8,
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  aphAlertCtaViewStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
  },
  ctaWhiteButtonViewStyle: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    marginRight: 15,
    marginVertical: 5,
    shadowColor: '#4c808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
  },
  textViewStyle: {
    padding: 8,
    marginRight: 15,
    marginVertical: 5,
  },
  ctaOrangeButtonViewStyle: { flex: 1, minHeight: 40, height: 'auto' },
  ctaOrangeTextStyle: {
    textAlign: 'center',
    ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
    marginHorizontal: 5,
  },
  hiTextStyle: {
    marginLeft: 20,
    marginTop: 27,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(18),
  },
  nameTextContainerStyle: {
    maxWidth: '75%',
  },
  nameTextStyle: {
    marginLeft: 5,
    marginTop: 27,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(18),
  },
  seperatorStyle: {
    height: 2,
    backgroundColor: '#00b38e',
    marginTop: 6,
    marginHorizontal: 5,
    marginBottom: 6,
  },
});

let timeout: NodeJS.Timeout;

// let doctorIds: (string | undefined)[] = [];
export interface DoctorSearchProps
  extends NavigationScreenProps<{
    movedFrom?: string;
  }> {}

export const DoctorSearch: React.FC<DoctorSearchProps> = (props) => {
  // const params = props.navigation.state.params ? props.navigation.state.params!.searchText : '';
  // const MoveDoctor = props.navigation.state.params ? props.navigation.state.params!.MoveDoctor : '';
  const [filtersList, setFiltersList] = useState<any>();
  const [searchText, setSearchText] = useState<string>('');
  const [pastSearch, setPastSearch] = useState<boolean>(true);
  const [needHelp, setNeedHelp] = useState<boolean>(true);
  const [displaySpeialist, setdisplaySpeialist] = useState<boolean>(true);
  const [Specialities, setSpecialities] = useState<getAllSpecialties_getAllSpecialties[]>([]);
  const [TopSpecialities, setTopSpecialities] = useState<getAllSpecialties_getAllSpecialties[]>([]);
  const [searchSpecialities, setsearchSpecialities] = useState<
    (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties | null)[] | null
  >([]);
  const [PastSearches, setPastSearches] = useState<(getPastSearches_getPastSearches | null)[]>([]);
  const [doctorsList, setdoctorsList] = useState<
    (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors | null)[] | null
  >([]);

  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [possibleMatches, setpossibleMatches] = useState<
    SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches
  >();
  const [otherDoctors, setotherDoctors] = useState<
    (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_otherDoctors | null)[] | null
  >();
  const [doctorAvailalbeSlots, setdoctorAvailalbeSlots] = useState<
    | (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctorsNextAvailability | null)[]
    | null
  >([]);
  const [OtherDoctorAvailalbeSlots, setOtherDoctorAvailalbeSlots] = useState<
    | (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctorsNextAvailability | null)[]
    | null
  >([]);
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [isSearching, setisSearching] = useState<boolean>(false);
  const [showPastSearchSpinner, setshowPastSearchSpinner] = useState<boolean>(false);

  const {
    currentPatient,
    allCurrentPatients,
    setCurrentPatientId,
    profileAllPatients,
  } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const {
    setGeneralPhysicians,
    locationDetails,
    setUrology,
    setDermatology,
    setEnt,
  } = useAppCommonData();
  const [showList, setShowList] = useState<boolean>(false);
  const [showProfilePopUp, setShowProfilePopUp] = useState<boolean>(true);
  const [playVideo, setPlayVideo] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(true);

  useEffect(() => {
    newUserPastSearch();
    if (!currentPatient) {
      console.log('No current patients available');
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    const _didFocus = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    });

    const _willBlur = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
      return () => {
        _didFocus && _didFocus.remove();
        _willBlur && _willBlur.remove();
      };
    });
  }, []);

  const client = useApolloClient();

  const newUserPastSearch = async () => {
    const newPatientId = await AsyncStorage.getItem('selectUserId');
    setTimeout(() => {
      newPatientId && fetchPastSearches(newPatientId);
    }, 1500);
  };
  const handleBack = async () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    props.navigation.goBack();
    return false;
  };

  const fetchDoctorData = (id: string, speciality: string) => {
    let geolocation = {} as any;
    if (locationDetails) {
      geolocation = {
        geolocation: {
          latitude: parseFloat(locationDetails.latitude ? locationDetails.latitude.toString() : ''),
          longitude: parseFloat(
            locationDetails.longitude ? locationDetails.longitude.toString() : ''
          ),
        },
      };
    }

    console.log(geolocation, 'geolocation');

    const FilterInput: FilterDoctorInput = {
      patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
      specialty: id,
      pincode: g(locationDetails, 'pincode') || null,
      ...geolocation,
    };
    console.log(FilterInput, 'FilterInput1111');

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
        setFiltersList(data.getDoctorsBySpecialtyAndFilters.filters);
        if (speciality === 'General Physician/ Internal Medicine')
          setGeneralPhysicians && setGeneralPhysicians({ id: id, data: data });
        else if (speciality === 'Urology') {
          setUrology && setUrology({ id: id, data: data });
        } else if (speciality === 'ENT') {
          setEnt && setEnt({ id: id, data: data });
        } else if (speciality === 'Dermatology') {
          setDermatology && setDermatology({ id: id, data: data });
        }

        // try {
        //   const filterGetData =
        //     data && data.getDoctorsBySpecialtyAndFilters
        //       ? data.getDoctorsBySpecialtyAndFilters
        //       : null;
        //   if (filterGetData) {
        //     if (filterGetData.doctors) {
        //       // setDoctorsList(filterGetData.doctors);
        //     }

        //     if (filterGetData.doctorsAvailability) {
        //       // setdoctorsAvailability(filterGetData.doctorsAvailability);
        //       setshowSpinner(false);
        //     }
        //     if (filterGetData.specialty) {
        //       // setspecialities(filterGetData.specialty);
        //       setshowSpinner(false);
        //     }

        //     if (filterGetData.doctorsNextAvailability) {
        //       // setdoctorsNextAvailability(filterGetData.doctorsNextAvailability);
        //       setshowSpinner(false);
        //     }
        //   }
        // } catch (e) {
        //   CommonBugFender('DoctorSearchListing_fetchSpecialityFilterData_try', e);
        // }
      })
      .catch((e) => {
        // CommonBugFender('DoctorSearchListing_fetchSpecialityFilterData', e);
        // setshowSpinner(false);
        console.log('Error 11111111', e);
      });
  };
  const moveSelectedToTop = () => {
    if (currentPatient !== undefined) {
      const patientLinkedProfiles = [
        allCurrentPatients.find((item: any) => item.uhid === currentPatient.uhid),
        ...allCurrentPatients.filter((item: any) => item.uhid !== currentPatient.uhid),
      ];
      return patientLinkedProfiles;
    }
    return [];
  };
  const postSearchEvent = (searchInput: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DOCTOR_SEARCH] = {
      'Search Text': searchInput,
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(WebEngageEventName.DOCTOR_SEARCH, eventAttributes);

    const eventAttributesFirebase: FirebaseEvents[FirebaseEventName.DOCTOR_SEARCH] = {
      SearchText: searchInput,
      PatientName: `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      PatientUHID: g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      PatientAge: Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
      PatientGender: g(currentPatient, 'gender'),
      MobileNumber: g(currentPatient, 'mobileNumber'),
      CustomerID: g(currentPatient, 'id'),
    };
    postFirebaseEvent(FirebaseEventName.DOCTOR_SEARCH, eventAttributesFirebase);
  };

  const fetchSearchData = (searchTextString: string = searchText) => {
    if (searchTextString.length > 2) {
      postSearchEvent(searchTextString);
      setisSearching(true);
      client
        .query<SearchDoctorAndSpecialtyByName, SearchDoctorAndSpecialtyByNameVariables>({
          query: SEARCH_DOCTOR_AND_SPECIALITY_BY_NAME,
          fetchPolicy: 'no-cache',
          variables: {
            searchText: searchTextString,
            patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
            pincode: g(locationDetails, 'pincode') || null,
            geolocation: g(locationDetails, 'latitude')
              ? {
                  latitude: parseFloat(locationDetails!.latitude!.toString()),
                  longitude: parseFloat(locationDetails!.longitude!.toString()),
                }
              : null,
          },
        })
        .then(({ data }) => {
          try {
            const searchData =
              data && data.SearchDoctorAndSpecialtyByName
                ? data.SearchDoctorAndSpecialtyByName
                : null;
            if (searchData) {
              if (searchData.doctors) {
                console.log(searchData.doctors, 'searchData.doctors', searchTextString);
                // doctorIds = getIds(searchData.doctors);
                setdoctorsList(searchData.doctors);
                setdoctorAvailalbeSlots(searchData.doctorsNextAvailability);
              }
              if (searchData.possibleMatches) {
                // const ids = getIds(searchData.possibleMatches.doctors);
                // doctorIds.push(...ids);
                setpossibleMatches(searchData.possibleMatches);
              }
              if (searchData.specialties) {
                setsearchSpecialities(searchData.specialties);
              }
              if (searchData.otherDoctors) {
                // const ids = getIds(searchData.otherDoctors);
                // doctorIds.push(...ids);
                setotherDoctors(searchData.otherDoctors);
                setOtherDoctorAvailalbeSlots(searchData.otherDoctorsNextAvailability);
              }
              // doctorIds.length > 0 ? fetchNextSlots(doctorIds) :
              setshowSpinner(false);
            }
            setisSearching(false);
          } catch (e) {
            CommonBugFender('DoctorSearch_fetchSearchData_try', e);
          }
        })
        .catch((e) => {
          setisSearching(false);
          CommonBugFender('DoctorSearch_fetchSearchData', e);
          console.log('Error occured while searching Doctor', e);
        });
    }
  };

  const fetchSpecialities = () => {
    console.log('fetchSpecialities');
    setshowSpinner(true);
    client
      .query<getAllSpecialties>({
        query: GET_ALL_SPECIALTIES,
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        try {
          if (
            data &&
            data.getAllSpecialties &&
            Specialities !== data.getAllSpecialties &&
            data.getAllSpecialties.length
          ) {
            sortSpecialities(data.getAllSpecialties);
            // setSpecialities(data.getAllSpecialties);
            // setLocalData(data.getAllSpecialties);
            // setshowSpinner(false);
            // AsyncStorage.setItem('SpecialistData', JSON.stringify(data.getAllSpecialties));
            // AsyncStorage.setItem('APICalledDate', todayDate);
          }
        } catch (e) {
          CommonBugFender('DoctorSearch_fetchSpecialities_try', e);
        }
      })
      .catch((e) => {
        CommonBugFender('DoctorSearch_fetchSpecialities', e);
        setshowSpinner(false);
        console.log('Error occured', e);
      });
  };

  const sortSpecialities = (specialities: getAllSpecialties_getAllSpecialties[]) => {
    specialities.sort(function(a, b) {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    setSpecialities(specialities);
    setLocalData(specialities);
    setshowSpinner(false);
    AsyncStorage.setItem('SpecialistData', JSON.stringify(specialities));
    AsyncStorage.setItem('APICalledDate', todayDate);
    fetchTopSpecialities(specialities);
  };

  const fetchTopSpecialities = (data: getAllSpecialties_getAllSpecialties[]) => {
    const topSpecialityIDs = AppConfig.Configuration.TOP_SPECIALITIES;
    topSpecialityIDs.sort(function(a, b) {
      if (a.speciality_order < b.speciality_order) {
        return -1;
      }
      if (a.speciality_order > b.speciality_order) {
        return 1;
      }
      return 0;
    });
    const topSpecialities: any = [];
    console.log('topSpecialityIDs----------------------------', topSpecialityIDs);
    topSpecialityIDs.forEach((ids) => {
      let array = data.filter((item) => {
        return ids.speciality_id == item.id;
      });
      data = data.filter((item) => {
        return ids.speciality_id != item.id;
      });
      array.length && topSpecialities.push(array[0]);
    });
    console.log('TopSpecialities----------------------------', topSpecialities);
    setTopSpecialities(topSpecialities);
    setSpecialities(data);
  };

  const fetchPastSearches = async (selectedUser?: any) => {
    setshowPastSearchSpinner(true);
    const userId = await dataSavedUserID('selectedProfileId');

    const Input = {
      patientId: selectedUser ? selectedUser : userId ? userId : g(currentPatient, 'id'),
    };

    client
      .query<getPatientPastSearches>({
        query: GET_PATIENT_PAST_SEARCHES,
        variables: Input,
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        try {
          setshowPastSearchSpinner(false);
          if (data && data.getPatientPastSearches) {
            const eventAttributes: WebEngageEvents[WebEngageEventName.PAST_DOCTOR_SEARCH] = {
              'Patient UHID': g(currentPatient, 'uhid'),
              'Mobile Number': g(currentPatient, 'mobileNumber'),
              'Customer ID': g(currentPatient, 'id'),
              'Past Searches': data.getPatientPastSearches,
            };
            postWebEngageEvent(WebEngageEventName.PAST_DOCTOR_SEARCH, eventAttributes);
            console.log('fetchPastSearches', data.getPatientPastSearches);
            setPastSearches(data.getPatientPastSearches);
          }
          !!searchText && fetchSearchData();
        } catch (e) {
          CommonBugFender('DoctorSearch_fetchPastSearches_try', e);
        }
      })
      .catch((e) => {
        setshowPastSearchSpinner(false);
        CommonBugFender('DoctorSearch_fetchPastSearches', e);
        console.log('Error occured', e);
        !!searchText && fetchSearchData();
      });
    // .finally(() => {
    //   callSpecialityAPI();
    //   !!searchText && fetchSearchData();
    // });
  };

  const todayDate = moment(new Date()).format('YYYY-MM-DD');
  const callSpecialityAPI = async () => {
    // let isToday = false;
    // const checkDate: any = await AsyncStorage.getItem('APICalledDate');
    // if (checkDate == null) {
    //   AsyncStorage.setItem('APICalledDate', todayDate);
    // }
    // isToday = checkDate ? checkDate === todayDate : false;
    // const specialistData = await AsyncStorage.getItem('SpecialistData');
    // if (isToday && specialistData && specialistData.length) {
    //   if (specialistData) {
    //     setSpecialities(JSON.parse(specialistData));
    //     setLocalData(JSON.parse(specialistData));
    //     fetchTopSpecialities(JSON.parse(specialistData));
    //     // fetchDoctorData(JSON.parse(specialistData)[0].id);
    //   }
    //   setshowSpinner(false);
    // } else {
    setshowSpinner(false);
    fetchSpecialities();
    // }
  };

  const setLocalData = (data: any) => {
    const Physicians = data.filter(
      (item: any) =>
        item.name.toLowerCase() === 'General Physician/ Internal Medicine'.toLowerCase()
    );
    Physicians.length > 0 &&
      fetchDoctorData(Physicians[0].id, 'General Physician/ Internal Medicine');

    const Ent = data.filter((item: any) => item.name.toLowerCase() === 'ENT'.toLowerCase());
    Ent.length > 0 && fetchDoctorData(Ent[0].id, 'ENT');

    const Dermatology = data.filter(
      (item: any) => item.name.toLowerCase() === 'Dermatology'.toLowerCase()
    );
    Dermatology.length > 0 && fetchDoctorData(Dermatology[0].id, 'Dermatology');

    const Urology = data.filter((item: any) => item.name.toLowerCase() === 'Urology'.toLowerCase());
    Urology.length > 0 && fetchDoctorData(Urology[0].id, 'Urology');
  };

  useEffect(() => {
    getNetStatus()
      .then((status) => {
        if (status) {
          fetchPastSearches();
          callSpecialityAPI();
        } else {
          setshowSpinner(false);
          setshowOfflinePopup(true);
        }
      })
      .catch((e) => {
        CommonBugFender('DoctorSearch_getNetStatus', e);
      });
  }, []);

  useEffect(() => {
    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', backDataFunctionality);
      !!searchText && fetchSearchData();
    });

    const willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    });

    return () => {
      didFocusSubscription && didFocusSubscription.remove();
      willBlurSubscription && willBlurSubscription.remove();
    };
  }, [searchText]);

  const backDataFunctionality = async () => {
    try {
      BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
      const MoveDoctor = props.navigation.getParam('movedFrom') || '';

      console.log('MoveDoctor', MoveDoctor);
      CommonLogEvent(AppRoutes.DoctorSearch, 'Go back clicked');
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
    } catch (error) {}

    return false;
  };
  const renderSearch = () => {
    const hasError =
      searchText.length > 2 &&
      doctorsList &&
      doctorsList.length === 0 &&
      !showSpinner &&
      !isSearching &&
      searchSpecialities &&
      searchSpecialities.length === 0
        ? true
        : false;
    return (
      <View style={styles.searchContainer}>
        <Header
          title={'DOCTORS / SPECIALITIES'}
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={() => backDataFunctionality()}
        />
        <View style={styles.searchView}>
          <TextInputComponent
            conatinerstyles={{ paddingBottom: 0 }}
            inputStyle={[
              styles.searchValueStyle,
              hasError
                ? {
                    borderBottomColor: '#e50000',
                  }
                : {},
            ]}
            textInputprops={
              hasError
                ? {
                    selectionColor: '#e50000',
                  }
                : {}
            }
            value={searchText}
            placeholder="Search doctors or specialities"
            underlineColorAndroid="transparent"
            onChangeText={(value) => {
              if (isValidSearch(value)) {
                setSearchText(value);
                const search = _.debounce(fetchSearchData, 300);
                search(value);
                if (value.length > 2) {
                  // fetchSearchData(value);
                  // setDoctorName(true);
                  setdisplaySpeialist(true);
                  setisSearching(true);
                } else {
                  setdisplaySpeialist(false);
                  setisSearching(false);
                }
              }
            }}
            onFocus={() => {
              if (searchText === '' || searchText.length < 3) {
                setPastSearch(false);
                setNeedHelp(false);
                setdisplaySpeialist(false);
                setisSearching(false);
              }
            }}
            onBlur={() => {
              if (searchText === '' || searchText.length < 3) {
                setPastSearch(true);
                setNeedHelp(true);
                setdisplaySpeialist(true);
              }
            }}
          />
          {hasError ? (
            <Text
              style={{
                ...theme.fonts.IBMPlexSansMedium(12),
                color: '#890000',
                paddingVertical: 8,
              }}
            >
              Sorry, we couldn’t find what you are looking for :(
            </Text>
          ) : (
            <View
              style={{
                paddingBottom: 19,
              }}
            />
          )}
        </View>
      </View>
    );
  };

  const renderPastSearch = () => {
    if (showPastSearchSpinner) {
      return (
        <View
          style={{
            height: 50,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
          }}
        >
          <ActivityIndicator size="small" />
        </View>
      );
    } else if (pastSearch && PastSearches.length > 0) {
      return (
        <View style={styles.pastSearches}>
          <SectionHeaderComponent
            sectionTitle={'Past Searches'}
            style={{ marginBottom: 0, marginTop: 10 }}
          />
          <FlatList
            contentContainerStyle={
              {
                // flexWrap: 'wrap',
                // marginHorizontal: 12,
              }
            }
            horizontal={true}
            bounces={false}
            data={PastSearches}
            onEndReachedThreshold={0.5}
            renderItem={({ item, index }) => renderRow(item, index)}
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      );
    }
  };

  const renderRow = (rowData: getPastSearches_getPastSearches | null, rowID: number) => {
    if (rowData) {
      return (
        <Button
          title={(rowData && rowData.name && rowData.name.toUpperCase()) || ''}
          style={[
            styles.listView,
            rowID === 0 ? { marginLeft: 20 } : null,
            rowID + 1 === PastSearches.length ? { marginRight: 20 } : null,
          ]}
          titleTextStyle={styles.rowTextStyles}
          onPress={() => {
            if (rowData.searchType === 'DOCTOR') {
              CommonLogEvent(AppRoutes.DoctorSearch, 'Doctor Search Move clicked');
              props.navigation.navigate(AppRoutes.DoctorDetails, {
                doctorId: rowData.typeId,
                callSaveSearch: 'true',
              });
            }
            if (rowData.searchType === 'SPECIALTY') {
              CommonLogEvent(AppRoutes.DoctorSearch, 'Doctor Search Move  SPECIALTY clicked');
              if (rowData.typeId && rowData.name)
                onClickSearch(rowData.typeId, rowData.name, 'true');
              // props.navigation.navigate('DoctorSearchListing', { speciality: rowData.name });
            }
          }}
        />
      );
    } else return null;
  };

  const renderSpecialityText = () => {
    const SpecialitiesList = searchText.length > 2 ? searchSpecialities : Specialities;
    if (
      SpecialitiesList &&
      SpecialitiesList.length > 0 &&
      displaySpeialist &&
      searchText.length < 3
    ) {
      return (
        <View style={{ alignItems: 'center', marginVertical: 15 }}>
          <Text style={styles.specialityText}>Start your care now by choosing from</Text>
          <Text style={styles.specialityText}>
            over 2000 doctors and {SpecialitiesList.length + 6} specialities
          </Text>
        </View>
      );
    }
  };

  const renderTopSpecialities = () => {
    // const TopSpecialities = Specialities.slice(0, 6);
    if (
      TopSpecialities &&
      TopSpecialities.length > 0 &&
      displaySpeialist &&
      searchText.length < 3
    ) {
      return (
        <View style={{}}>
          <SectionHeaderComponent
            sectionTitle={'TOP SPECIALITIES'}
            style={{
              marginBottom: 0,
              marginTop: 8,
              paddingBottom: 5,
              borderBottomWidth: 0.4,
              borderBottomColor: theme.colors.LIGHT_BLUE,
            }}
          />
          <View
            style={{ flexDirection: 'row', marginLeft: 20, flexWrap: 'wrap', marginBottom: 20 }}
          >
            {TopSpecialities.map((item, index) => {
              let itemSymptom = item!.symptoms || '';
              itemSymptom = itemSymptom.charAt(0).toUpperCase() + itemSymptom.slice(1); // capitalize first character
              const symptom = itemSymptom.replace(/,\s*([a-z])/g, (d, e) => ', ' + e.toUpperCase()); // capitalize first character after comma (,)
              return (
                <Mutation<saveSearch> mutation={SAVE_SEARCH}>
                  {(mutate, { loading, data, error }) => (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => {
                        CommonLogEvent(AppRoutes.DoctorSearch, item.name);
                        postSpecialityEvent(item.name, item.id);
                        onClickSearch(
                          item.id,
                          item.name,
                          searchText.length > 2 ? 'true' : 'false',
                          item.specialistPluralTerm || ''
                        );
                        const searchInput = {
                          type: SEARCH_TYPE.SPECIALTY,
                          typeId: item.id,
                          patient: currentPatient && currentPatient.id ? currentPatient.id : '',
                        };
                        if (searchText.length > 2) {
                          mutate({
                            variables: {
                              saveSearchInput: searchInput,
                            },
                          });
                        }
                      }}
                      style={styles.topSpecilityCard}
                      key={index}
                    >
                      <View
                        style={{
                          alignItems: 'center',
                          borderBottomWidth: 0.4,
                          borderBottomColor: theme.colors.BORDER_BOTTOM_COLOR,
                          height: 50,
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          numberOfLines={2}
                          style={
                            Platform.OS === 'ios'
                              ? styles.topSpecialityNameiOS
                              : styles.topSpecialityName
                          }
                        >
                          {item.name}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Image
                          source={{ uri: item.image }}
                          resizeMode={'contain'}
                          style={{ height: 40, width: 40, marginVertical: 14 }}
                        />
                      </View>
                      <View style={{ alignItems: 'center', height: 30, justifyContent: 'center' }}>
                        <Text numberOfLines={2} style={styles.topSpecialityDescription}>
                          {item.shortDescription}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'center', marginVertical: 12 }}>
                        <Text style={styles.topSpecialityFriendlyname}>{symptom}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </Mutation>
              );
            })}
          </View>
        </View>
      );
    }
  };

  const renderSpecialist = () => {
    // const SpecialitiesList = Specialities;

    const SpecialitiesList = searchText.length > 2 ? searchSpecialities : Specialities;
    // console.log(SpecialitiesList, 'SpecialitiesList');
    if (SpecialitiesList && SpecialitiesList.length > 0 && displaySpeialist) {
      return (
        <View>
          <SectionHeaderComponent
            sectionTitle={
              searchText.length > 2
                ? `Matching Specialities — ${searchSpecialities && searchSpecialities.length}`
                : 'OTHER SPECIALTIES'
            }
            style={{
              marginBottom: 0,
              marginTop:
                PastSearches.length > 0
                  ? searchText.length > 0 && doctorsList && doctorsList.length === 0
                    ? 24
                    : 8
                  : 24,
              paddingBottom: 5,
              borderBottomWidth: 0.4,
              borderBottomColor: theme.colors.LIGHT_BLUE,
            }}
          />
          <View style={{ flexDirection: 'row' }}>
            <FlatList
              bounces={false}
              data={SpecialitiesList}
              onEndReachedThreshold={0.5}
              renderItem={({ item, index }) =>
                renderSpecialistRow(item, index, SpecialitiesList.length, searchText.length > 2)
              }
              keyExtractor={(_, index) => index.toString()}
              numColumns={1}
            />
          </View>
        </View>
      );
    }
  };

  const renderBookConsultVideo = (
    item: getAllSpecialties_getAllSpecialties | null,
    index: number,
    length: number,
    isSearchResult?: boolean
  ) => {
    return (
      <View>
        {renderSpecialistRow(item, index, length, isSearchResult)}
        <Text style={styles.bookConsultTxt}>How to Book Consult?</Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setPlayVideo(true);
            setPaused(!paused);
            console.log(playVideo);
          }}
        >
          {playVideo ? (
            <Video
              source={{
                uri:
                  'https://player.vimeo.com/external/432445688.hd.mp4?s=abfa637fd2a47a4548c71ce2ac4cc48819a2d1a5&profile_id=174',
              }}
              onLoad={(data) => {
                console.log(JSON.stringify(data));
              }}
              // paused={paused}
              controls={true}
              style={{ height: 0.374 * width, width: width, marginVertical: 10 }}
              volume={0.5}
            />
          ) : (
            <Image
              style={{ height: 0.374 * width, width: width, marginVertical: 10 }}
              source={require('@aph/mobile-patients/src/components/ui/icons/bookconsult.png')}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderTrackSymptoms = () => {
    // return (
    //   <View style={{ backgroundColor: '#fff', marginVertical: 8, flexDirection: 'row' }}>
    //     <SympTrackerIcon
    //       style={{
    //         width: 40,
    //         height: 40,
    //         marginVertical: 16,
    //         marginHorizontal: 15,
    //       }}
    //     />
    //     <View>
    //       <Text style={styles.whichSpecialityTxt}>Not sure about which speciality to choose?</Text>
    //       <TouchableOpacity
    //         onPress={() => {
    //           props.navigation.navigate(AppRoutes.SymptomChecker);
    //         }}
    //       >
    //         <Text style={styles.TrackTxt}>TRACK YOUR SYMPTOMS</Text>
    //       </TouchableOpacity>
    //     </View>
    //   </View>
    // );
  };

  const postSpecialityEvent = (speciality: string, specialityId: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.SPECIALITY_CLICKED] = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      'Speciality Name': speciality,
      'Speciality ID': specialityId,
    };
    postWebEngageEvent(WebEngageEventName.SPECIALITY_CLICKED, eventAttributes);

    const eventAttributesFirebase: FirebaseEvents[FirebaseEventName.SPECIALITY_CLICKED] = {
      PatientName: `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      PatientUHID: g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      PatientAge: Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
      PatientGender: g(currentPatient, 'gender'),
      MobileNumber: g(currentPatient, 'mobileNumber'),
      CustomerID: g(currentPatient, 'id'),
      SpecialityName: speciality,
      SpecialityID: specialityId,
    };
    postFirebaseEvent(FirebaseEventName.SPECIALITY_CLICKED, eventAttributesFirebase);
  };

  const postDoctorClickWEGEvent = (
    _doctorDetails:
      | SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors
      | SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors,
    source: WebEngageEvents[WebEngageEventName.DOCTOR_CLICKED]['Source'],
    type?: 'consult-now' | 'book-appointment'
  ) => {
    const doctorDetails = _doctorDetails;
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

  const renderSpecialistRow = (
    rowData: getAllSpecialties_getAllSpecialties | null,
    rowID: number,
    length: number,
    isSearchResult?: boolean
  ) => {
    if (rowData) {
      let itemSymptom = rowData!.symptoms || '';
      itemSymptom = itemSymptom.charAt(0).toUpperCase() + itemSymptom.slice(1); // capitalize first character
      const symptom = itemSymptom.replace(/,\s*([a-z])/g, (d, e) => ', ' + e.toUpperCase()); // capitalize first character after comma (,)
      return (
        <Mutation<saveSearch> mutation={SAVE_SEARCH}>
          {(mutate, { loading, data, error }) => (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                CommonLogEvent(AppRoutes.DoctorSearch, rowData.name);
                postSpecialityEvent(rowData.name, rowData.id);
                onClickSearch(
                  rowData.id,
                  rowData.name,
                  isSearchResult ? 'true' : 'false',
                  rowData.specialistPluralTerm || ''
                );
                const searchInput = {
                  type: SEARCH_TYPE.SPECIALTY,
                  typeId: rowData.id,
                  patient: currentPatient && currentPatient.id ? currentPatient.id : '',
                };
                if (isSearchResult) {
                  mutate({
                    variables: {
                      saveSearchInput: searchInput,
                    },
                  });
                }
              }}
              style={{
                marginHorizontal: 20,
                marginVertical: 8,
                marginTop: rowID === 0 ? 16 : 6,
                marginBottom: length === rowID + 1 ? 16 : 6,
                // height: 100,
              }}
              key={rowID}
            >
              <View style={styles.listSpecialistView}>
                {rowData.image && (
                  <Image
                    source={{
                      // uri: 'https://apollouatstg.blob.core.windows.net/hospitals/ic_cardiology.png',
                      uri: rowData.image,
                    }}
                    resizeMode={'contain'}
                    style={{
                      height: 40,
                      width: 40,
                      marginVertical: 16,
                      marginLeft: 16,
                    }}
                  />
                )}
                <View>
                  <Text numberOfLines={1} style={styles.rowSpecialistStyles}>
                    {rowData.name}
                  </Text>
                  <View style={styles.descriptionCont}>
                    <Text numberOfLines={2} style={styles.rowDescriptionSpecialistStyles}>
                      {rowData.shortDescription}
                    </Text>
                  </View>
                  <Text numberOfLines={1} style={styles.rowUserFriendlySpecialistStyles}>
                    {symptom}
                  </Text>
                </View>
                <ArrowRight
                  style={{
                    height: 24,
                    width: 24,
                    marginVertical: 22,
                  }}
                  resizeMode={'contain'}
                />
              </View>
              {data ? console.log(data, 'savesearch data') : null}
              {error ? console.log(error, 'savesearch error') : null}
            </TouchableOpacity>
          )}
        </Mutation>
      );
    } else return null;
  };

  const onClickSearch = (
    id: string,
    name: string,
    callSaveSearch: string,
    specialistPluralTerm?: string
  ) => {
    props.navigation.navigate('DoctorSearchListing', {
      specialityId: id,
      specialityName: name,
      callSaveSearch: callSaveSearch,
      specialistPluralTerm,
      filters: filtersList,
    });
  };

  const renderHelpView = () => {
    if (needHelp) {
      return (
        <NeedHelpAssistant
          navigation={props.navigation}
          containerStyle={styles.helpView}
          onNeedHelpPress={() => {
            postWEGNeedHelpEvent(currentPatient, 'Doctor Search');
          }}
        />
      );
    }
  };

  const renderDoctorSearches = () => {
    if (searchText.length > 2 && doctorsList && doctorsList.length > 0) {
      return (
        <View>
          <SectionHeaderComponent
            sectionTitle={'Matching Doctors — ' + doctorsList.length}
            style={{ marginBottom: 0 }}
          />
          <FlatList
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{
              marginTop: 20,
              marginBottom: 8,
              paddingTop: Platform.OS == 'android' ? 10 : 1,
            }}
            bounces={false}
            data={doctorsList}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => renderSearchDoctorResultsRow(item)}
          />
        </View>
      );
    }
  };
  const getDoctorAvailableMode = (id: string, slot: 'other' | 'result') => {
    let availableMode: ConsultMode | null = null;
    if (doctorAvailalbeSlots && slot === 'result') {
      const itemIndex = doctorAvailalbeSlots.findIndex((i) => i && i.doctorId === id);
      if (itemIndex > -1) {
        if (
          g(doctorAvailalbeSlots[itemIndex], 'onlineSlot') &&
          g(doctorAvailalbeSlots[itemIndex], 'physicalSlot')
        ) {
          availableMode = ConsultMode.BOTH;
        } else if (g(doctorAvailalbeSlots[itemIndex], 'onlineSlot')) {
          availableMode = ConsultMode.ONLINE;
        } else if (g(doctorAvailalbeSlots[itemIndex], 'physicalSlot')) {
          availableMode = ConsultMode.PHYSICAL;
        }
      }
    } else if (OtherDoctorAvailalbeSlots && slot === 'other') {
      const itemIndex = OtherDoctorAvailalbeSlots.findIndex((i) => i && i.doctorId === id);
      if (itemIndex > -1) {
        if (
          g(OtherDoctorAvailalbeSlots[itemIndex], 'onlineSlot') &&
          g(OtherDoctorAvailalbeSlots[itemIndex], 'physicalSlot')
        ) {
          availableMode = ConsultMode.BOTH;
        } else if (g(OtherDoctorAvailalbeSlots[itemIndex], 'onlineSlot')) {
          availableMode = ConsultMode.ONLINE;
        } else if (g(OtherDoctorAvailalbeSlots[itemIndex], 'physicalSlot')) {
          availableMode = ConsultMode.PHYSICAL;
        }
      }
    }
    // OtherDoctorAvailalbeSlots;
    return availableMode;
  };

  const renderSearchDoctorResultsRow = (
    rowData: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors | null
  ) => {
    if (rowData)
      return (
        <Mutation<saveSearch> mutation={SAVE_SEARCH}>
          {(mutate, { loading, data, error }) => (
            <DoctorCard
              saveSearch={true}
              doctorsNextAvailability={doctorAvailalbeSlots}
              availableModes={getDoctorAvailableMode(rowData.id, 'result')}
              rowData={rowData}
              navigation={props.navigation}
              onPress={() => {
                postDoctorClickWEGEvent(rowData, 'Search');
                CommonLogEvent(AppRoutes.DoctorSearch, 'renderSearchDoctorResultsRow clicked');
                const searchInput = {
                  type: SEARCH_TYPE.DOCTOR,
                  typeId: rowData.id,
                  patient: currentPatient && currentPatient.id ? currentPatient.id : '',
                };
                mutate({
                  variables: {
                    saveSearchInput: searchInput,
                  },
                });
                props.navigation.navigate(AppRoutes.DoctorDetails, {
                  doctorId: rowData.id,
                  callSaveSearch: 'true',
                });
              }}
              onPressConsultNowOrBookAppointment={(type) => {
                postDoctorClickWEGEvent(rowData, 'Search', type);
              }}
            >
              {/* {data ? console.log(data, 'savesearch doctor data ') : null}
              {error ? console.log(error, 'savesearch doctor error') : null} */}
            </DoctorCard>
          )}
        </Mutation>
      );
    return null;
  };

  const renderPossibleDoctorResultsRow = (
    rowData: SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors | null,
    isPossibleDoctor: boolean = false
  ) => {
    if (rowData)
      return (
        <Mutation<saveSearch> mutation={SAVE_SEARCH}>
          {(mutate, { loading, data, error }) => (
            <DoctorCard
              doctorsNextAvailability={
                isPossibleDoctor
                  ? possibleMatches
                    ? possibleMatches.doctorsNextAvailability
                    : []
                  : OtherDoctorAvailalbeSlots
              }
              availableModes={getDoctorAvailableMode(rowData.id, 'other')}
              rowData={rowData}
              navigation={props.navigation}
              onPress={() => {
                postDoctorClickWEGEvent(rowData, 'Search');
                CommonLogEvent(AppRoutes.DoctorSearch, 'renderPossibleDoctorResultsRow clicked');
                const searchInput = {
                  type: SEARCH_TYPE.DOCTOR,
                  typeId: rowData.id,
                  patient: currentPatient && currentPatient.id ? currentPatient.id : '',
                };
                mutate({
                  variables: {
                    saveSearchInput: searchInput,
                  },
                });
                props.navigation.navigate(AppRoutes.DoctorDetails, {
                  doctorId: rowData.id,
                  callSaveSearch: 'true',
                });
              }}
              onPressConsultNowOrBookAppointment={(type) => {
                postDoctorClickWEGEvent(rowData, 'Search', type);
              }}
            >
              {data ? console.log(data, 'savesearch doctor data ') : null}
              {error ? console.log(error, 'savesearch doctor error') : null}
            </DoctorCard>
          )}
        </Mutation>
      );
    return null;
  };

  const renderPossibleMatches = () => {
    return (
      <View>
        {possibleMatches && possibleMatches.doctors && possibleMatches.doctors.length > 0 && (
          <View>
            <SectionHeaderComponent
              sectionTitle={'Possible Doctors — ' + possibleMatches.doctors.length}
              style={{ marginBottom: 0 }}
            />
            <FlatList
              keyExtractor={(_, index) => index.toString()}
              contentContainerStyle={{
                marginTop: 16,
                marginBottom: 8,
              }}
              bounces={false}
              data={possibleMatches.doctors}
              onEndReachedThreshold={0.5}
              renderItem={({ item }) => renderPossibleDoctorResultsRow(item, true)}
            />
          </View>
        )}
        {possibleMatches && possibleMatches.specialties && possibleMatches.specialties.length > 0 && (
          <View>
            <SectionHeaderComponent
              sectionTitle={`Possible Specialities — ${possibleMatches.specialties.length}`}
              style={{
                marginBottom: 0,
                marginTop: 4,
              }}
            />
            <FlatList
              contentContainerStyle={
                {
                  // marginHorizontal: 12,
                }
              }
              bounces={false}
              data={possibleMatches.specialties}
              onEndReachedThreshold={0.5}
              renderItem={({ item, index }) =>
                renderSpecialistRow(item, index, possibleMatches.specialties!.length, true)
              }
              keyExtractor={(_, index) => index.toString()}
              numColumns={1}
            />
          </View>
        )}
      </View>
    );
  };

  const renderOtherSUggestedDoctors = () => {
    if (otherDoctors && otherDoctors.length)
      return (
        <View>
          <SectionHeaderComponent
            sectionTitle={'Other Suggested Doctors'}
            style={{ marginBottom: 0, marginTop: 4 }}
          />
          <FlatList
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{
              marginTop: 16,
              marginBottom: 8,
            }}
            bounces={false}
            data={otherDoctors}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => renderPossibleDoctorResultsRow(item)}
          />
        </View>
      );
    return null;
  };
  const selectUser = (selectedUser: any) => {
    AsyncStorage.setItem('selectUserId', selectedUser!.id);
    AsyncStorage.setItem('selectUserUHId', selectedUser!.uhid);
    AsyncStorage.setItem('isNewProfile', 'yes');
  };
  const renderCTAs = () => (
    <View style={styles.aphAlertCtaViewStyle}>
      {moveSelectedToTop()
        .slice(0, 5)
        .map((item: any, index: any, array: any) =>
          item.firstName !== '+ADD MEMBER' ? (
            <TouchableOpacity
              onPress={() => {
                onSelectedProfile(item);
              }}
              style={[styles.ctaWhiteButtonViewStyle]}
            >
              <Text style={[styles.ctaOrangeTextStyle]}>{item.firstName}</Text>
            </TouchableOpacity>
          ) : null
        )}
      <View style={[styles.textViewStyle]}>
        <Text
          onPress={() => {
            if (allCurrentPatients.length > 6) {
              setShowList(true);
            } else {
              setShowProfilePopUp(false);
              props.navigation.navigate(AppRoutes.EditProfile, {
                isEdit: false,
                isPoptype: true,
                mobileNumber: currentPatient && currentPatient!.mobileNumber,
              });
            }
          }}
          style={[styles.ctaOrangeTextStyle]}
        >
          {allCurrentPatients.length > 6 ? 'OTHERS' : '+ADD MEMBER'}
        </Text>
      </View>
    </View>
  );
  const onSelectedProfile = (item: any) => {
    selectUser(item);
    setShowProfilePopUp(false);
    setTimeout(() => {
      fetchPastSearches(item.id);
    }, 1000);
  };
  const onProfileChange = () => {
    setShowList(false);

    setTimeout(() => {
      setShowProfilePopUp(false);
      fetchPastSearches();
    }, 1000);
  };

  const renderProfileDrop = () => {
    return (
      <ProfileList
        showList={showList}
        menuHidden={() => setShowList(false)}
        onProfileChange={onProfileChange}
        navigation={props.navigation}
        saveUserChange={true}
        listContainerStyle={{ marginTop: Platform.OS === 'ios' ? 10 : 60 }}
        childView={
          <View
            style={{
              flexDirection: 'row',
              paddingRight: 8,
              borderRightWidth: 0,
              // paddingTop: 80,
              // marginTop: 30,
              borderRightColor: 'rgba(2, 71, 91, 0.2)',
              backgroundColor: theme.colors.CLEAR,
            }}
          >
            <Text style={styles.hiTextStyle}>{'Hi'}</Text>
            <View style={styles.nameTextContainerStyle}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.nameTextStyle} numberOfLines={1}>
                  {(currentPatient && currentPatient!.firstName + ' ' + currentPatient!.lastName) ||
                    ''}
                </Text>
                {currentPatient && g(currentPatient, 'isUhidPrimary') ? (
                  <LinkedUhidIcon
                    style={{
                      width: 22,
                      height: 20,
                      marginLeft: 5,
                      marginTop: Platform.OS === 'ios' ? 26 : 30,
                    }}
                    resizeMode={'contain'}
                  />
                ) : null}
                <View style={{ paddingTop: 28 }}>
                  <DropdownGreen />
                </View>
              </View>
              <View style={styles.seperatorStyle} />
            </View>
          </View>
        }
        // setDisplayAddProfile={(val) => setDisplayAddProfile(val)}
        unsetloaderDisplay={true}
      />
    );
  };

  const renderProfileListView = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showProfilePopUp}
        onRequestClose={() => {
          setShowProfilePopUp(false);
          handleBack();
        }}
        onDismiss={() => {
          setShowProfilePopUp(false);
        }}
      >
        <View
          style={styles.mainView}
          // onPress={() => {
          //   //TODO:comment this if any issues with modal closing
          //   setShowProfilePopUp(false);
          // }}
        >
          <View style={styles.subViewPopup}>
            {renderProfileDrop()}
            <Text style={styles.congratulationsDescriptionStyle}>Who is the patient?</Text>
            <Text style={styles.popDescriptionStyle}>
              Prescription to be generated in the name of?
            </Text>
            {renderCTAs()}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
        {doctorsList && renderSearch()}
        {!showSpinner ? (
          isSearching ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator animating={true} size="large" color="green" />
            </View>
          ) : (
            <>
              <ScrollView
                style={{ flex: 1 }}
                bounces={false}
                keyboardDismissMode="on-drag"
                onScrollBeginDrag={Keyboard.dismiss}
              >
                {// props.navigation.state.params!.MoveDoctor == 'MoveDoctor'
                // ? null
                // :
                renderPastSearch()}
                {renderDoctorSearches()}
                {renderSpecialityText()}
                {renderTopSpecialities()}
                {renderSpecialist()}
                {searchText.length > 2 &&
                  doctorsList &&
                  doctorsList.length === 0 &&
                  searchSpecialities &&
                  searchSpecialities.length === 0 &&
                  possibleMatches &&
                  renderPossibleMatches()}
                {doctorsList &&
                  searchText.length > 2 &&
                  doctorsList.length === 1 &&
                  otherDoctors &&
                  renderOtherSUggestedDoctors()}
                {/* {!showSpinner && renderHelpView()} */}
              </ScrollView>
            </>
          )
        ) : null}
        {showProfilePopUp && renderProfileListView()}
      </SafeAreaView>
      {showSpinner && <Spinner />}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
    </View>
  );
};
