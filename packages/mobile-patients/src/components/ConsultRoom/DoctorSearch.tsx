import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  ArrowRight,
  DropdownGreen,
  LinkedUhidIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_ALL_SPECIALTIES,
  GET_PATIENT_PAST_SEARCHES,
  SAVE_SEARCH,
  GET_DOCTOR_LIST,
  GET_PATIENT_ALL_CONSULTED_DOCTORS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getAllSpecialties,
  getAllSpecialties_getAllSpecialties,
} from '@aph/mobile-patients/src/graphql/types/getAllSpecialties';
import { getPastSearches_getPastSearches } from '@aph/mobile-patients/src/graphql/types/getPastSearches';
import { getPatientPastSearches } from '@aph/mobile-patients/src/graphql/types/getPatientPastSearches';
import { SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { saveSearch } from '@aph/mobile-patients/src/graphql/types/saveSearch';
import {
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors,
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
import { ProfileList } from '../ui/ProfileList';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import _ from 'lodash';
import { getDoctorList } from '@aph/mobile-patients/src/graphql/types/getDoctorList';
import { SymptomTrackerCard } from '@aph/mobile-patients/src/components/ConsultRoom/Components/SymptomTrackerCard';
import { DefaultSearchComponent } from '@aph/mobile-patients/src/components/ConsultRoom/Components/DefaultSearchComponent';
const { width } = Dimensions.get('window');
import { getPatientAllAppointments } from '@aph/mobile-patients/src/graphql/types/getPatientAllAppointments';
import { SearchResultCard } from '@aph/mobile-patients/src/components/ConsultRoom/Components/SearchResultCard';
import {
  searchProceduresAndSymptoms,
  ProceduresAndSymptomsParams,
  ProceduresAndSymptomsResult,
} from '@aph/mobile-patients/src/helpers/apiCalls';
var allSettled = require('promise.allsettled');

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
  lightGrayText: {
    ...theme.viewStyles.text('M', 11, theme.colors.LIGHTISH_GRAY),
    marginTop: 12,
    lineHeight: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewAllBtnTxt: {
    ...theme.viewStyles.text('M', 12, theme.colors.APP_YELLOW),
    marginRight: 20,
  },
  sectionHeader: {
    marginBottom: 0,
    paddingBottom: 5,
    borderBottomWidth: 0.4,
    borderBottomColor: theme.colors.LIGHT_BLUE,
  },
  specialityCard: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  specialityIcon: {
    height: 40,
    width: 40,
    marginVertical: 16,
    marginLeft: 16,
  },
});

let timeout: NodeJS.Timeout;

export interface DoctorSearchProps
  extends NavigationScreenProps<{
    movedFrom?: string;
  }> {}

export const DoctorSearch: React.FC<DoctorSearchProps> = (props) => {
  const [searchText, setSearchText] = useState<string>('');
  const [pastSearch, setPastSearch] = useState<boolean>(true);
  const [needHelp, setNeedHelp] = useState<boolean>(true);
  const [displaySpeialist, setdisplaySpeialist] = useState<boolean>(true);
  const [Specialities, setSpecialities] = useState<getAllSpecialties_getAllSpecialties[]>([]);
  const [AllSpecialities, setAllSpecialities] = useState<getAllSpecialties_getAllSpecialties[]>([]);
  const [TopSpecialities, setTopSpecialities] = useState<getAllSpecialties_getAllSpecialties[]>([]);
  const [searchSpecialities, setsearchSpecialities] = useState<
    (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties | null)[] | null
  >([]);
  const [PastSearches, setPastSearches] = useState<(getPastSearches_getPastSearches | null)[]>([]);
  const [doctorsList, setdoctorsList] = useState<
    (SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors | null)[] | null
  >([]);

  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [isSearching, setisSearching] = useState<boolean>(false);
  const [showPastSearchSpinner, setshowPastSearchSpinner] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState({});
  const { currentPatient, allCurrentPatients, setCurrentPatientId } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const [showList, setShowList] = useState<boolean>(false);
  const [showProfilePopUp, setShowProfilePopUp] = useState<boolean>(false);
  const [gender, setGender] = useState<string>(currentPatient?.gender);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [consultedDoctors, setConsultedDoctors] = useState<any>([]);
  const [showAllSearchedDoctorData, setShowAllSearchedDoctorData] = useState<boolean>(false);
  const [showAllSearchedSymptomsData, setShowAllSearchedSymptomsData] = useState<boolean>(false);
  const [showAllSearchedSymptoms, setShowAllSearchedSymptoms] = useState<boolean>(false);
  const [showAllSearchedProcedures, setShowAllSearchedProcedures] = useState<boolean>(false);
  const [procedures, setProcedures] = useState<ProceduresAndSymptomsResult[]>([]);
  const [symptoms, setSymptoms] = useState<ProceduresAndSymptomsResult[]>([]);
  const [savedSearchedSuggestions, setSearchSuggestions] = useState<string>('');
  const [searchedBucket, setSearchedBucket] = useState<string>('');

  useEffect(() => {
    newUserPastSearch();
    if (!currentPatient) {
      console.log('No current patients available');
      getPatientApiCall();
    }
  }, [currentPatient]);

  const client = useApolloClient();

  const newUserPastSearch = async () => {
    const newPatientId = await AsyncStorage.getItem('selectUserId');
    setTimeout(() => {
      newPatientId && fetchPastSearches(newPatientId);
      newPatientId && fetchConsultedDoctors(newPatientId);
    }, 1500);
  };

  const handleBack = async () => {
    props.navigation.goBack();
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

  const getDoctorList = (searchText: string) => {
    return client.query<getDoctorList>({
      query: GET_DOCTOR_LIST,
      fetchPolicy: 'no-cache',
      variables: {
        filterInput: {
          pageNo: 1,
          pageSize: 50,
          searchText,
        },
      },
    });
  };

  const fetchProceduresAndSymptoms = (searchString: string) => {
    const queryParams: ProceduresAndSymptomsParams = {
      text: searchString,
    };
    return searchProceduresAndSymptoms(queryParams);
  };

  const fetchSearchData = (searchTextString: string = searchText) => {
    if (searchTextString.length > 2) {
      postSearchEvent(searchTextString);
      setisSearching(true);
      allSettled([getDoctorList(searchTextString), fetchProceduresAndSymptoms(searchTextString)])
        .then((res: any) => {
          try {
            const searchData = res?.[0]?.value?.data?.getDoctorList || null;
            if (searchData) {
              if (searchData.doctors) {
                setdoctorsList(searchData.doctors);
              }
              if (searchData.specialties) {
                setsearchSpecialities(searchData.specialties);
              }
              setshowSpinner(false);
            }
            setisSearching(false);

            const result = res?.[1]?.value?.data?.results;
            const procedures = result?.filter(
              (item: ProceduresAndSymptomsResult) => item?.tag?.toUpperCase() === 'PROCEDURE'
            );
            const symptoms = result?.filter(
              (item: ProceduresAndSymptomsResult) => item?.tag?.toUpperCase() === 'SYMPTOM'
            );
            setProcedures(procedures);
            setSymptoms(symptoms);
            postSearchedResultWebEngageEvent(
              null,
              searchTextString,
              searchData?.doctors,
              searchData?.specialties,
              procedures,
              symptoms
            );
          } catch (e) {
            CommonBugFender('DoctorSearch_fetchSearchData_try', e);
          }
        })
        .catch((e) => {
          setProcedures([]);
          setSymptoms([]);
          setisSearching(false);
          CommonBugFender('DoctorSearch_fetchSearchData', e);
          console.log('Error occured while searching Doctor', e);
        });
    }
  };

  const postSearchedResultWebEngageEvent = (
    clickedItem?: string | null,
    inputString?: string,
    doctors?: any,
    searchSpecialities?: any,
    procedures?: any,
    symptoms?: any
  ) => {
    const doctorsList =
      doctors?.map((item: any) => {
        return item?.displayName;
      }) || [];
    const doctorBucket = doctorsList?.length > 0 ? 'Doctor, ' : '';
    const specialitiesList =
      searchSpecialities?.map((item: any) => {
        return item?.name;
      }) || [];
    const specialityBucket = specialitiesList?.length > 0 ? 'Speciality, ' : '';
    const proceduresList =
      procedures?.map((item: any) => {
        return item?.name;
      }) || [];
    const procedureBucket = proceduresList?.length > 0 ? 'Procedure, ' : '';
    const symptomsList =
      symptoms?.map((item: any) => {
        return item?.name;
      }) || [];
    const symptomBucket = symptomsList?.length > 0 ? 'Symptoms' : '';
    const searchSuggestions = [
      ...specialitiesList,
      ...doctorsList,
      ...proceduresList,
      ...symptomsList,
    ]?.join(', ');
    setSearchSuggestions(searchSuggestions);
    const bucket = doctorBucket
      ?.concat(specialityBucket)
      ?.concat(procedureBucket)
      ?.concat(symptomBucket);
    setSearchedBucket(bucket);
    let eventAttributes: WebEngageEvents[WebEngageEventName.SEARCH_SUGGESTIONS] = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      'Text typed by the user': inputString || searchText,
      'Search Suggestions': searchSuggestions || savedSearchedSuggestions,
      Bucket: bucket || searchedBucket,
      'Search Suggestion Clicked': clickedItem || '',
    };
    postWebEngageEvent(WebEngageEventName.SEARCH_SUGGESTIONS, eventAttributes);
  };

  const postViewAllWebEngageEvent = (
    bucket: 'Speciality' | 'Doctor' | 'Procedure' | 'Symptoms',
    results: string
  ) => {
    let eventAttributes: WebEngageEvents[WebEngageEventName.SEARCH_SUGGESTIONS_VIEW_ALL] = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      Bucket: bucket,
      'Search suggestions in the particular bucket': results,
    };
    postWebEngageEvent(WebEngageEventName.SEARCH_SUGGESTIONS_VIEW_ALL, eventAttributes);
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
            setShowProfilePopUp(true);
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
    setAllSpecialities(specialities);
    setSpecialities(specialities);
    setshowSpinner(false);
    AsyncStorage.setItem('SpecialistData', JSON.stringify(specialities));
    AsyncStorage.setItem('APICalledDate', todayDate);
    fetchTopSpecialities(specialities);
  };

  useEffect(() => {
    AllSpecialities?.length && fetchTopSpecialities(AllSpecialities);
  }, [gender]);

  const fetchTopSpecialities = (data: getAllSpecialties_getAllSpecialties[]) => {
    const topSpecialityIDs = AppConfig.Configuration.TOP_SPECIALITIES;
    const specialities = topSpecialityIDs?.filter(
      (item) => item.gender == 'UNISEX' || item.gender == gender
    );
    specialities?.sort(function(a, b) {
      if (a.speciality_order < b.speciality_order) {
        return -1;
      }
      if (a.speciality_order > b.speciality_order) {
        return 1;
      }
      return 0;
    });
    const topSpecialities: any = [];
    specialities?.forEach((ids) => {
      let array = data.filter((item) => {
        return ids.speciality_id == item.id;
      });
      data = data.filter((item) => {
        return ids.speciality_id != item.id;
      });
      array.length && topSpecialities.push(array[0]);
    });
    setTopSpecialities(topSpecialities);
    setSpecialities(data);
  };

  const fetchConsultedDoctors = async (selectedUser?: any) => {
    const userId = await dataSavedUserID('selectedProfileId');
    const input = {
      patientId: selectedUser ? selectedUser : userId ? userId : g(currentPatient, 'id'),
    };
    const res = await client.query<getPatientAllAppointments>({
      query: GET_PATIENT_ALL_CONSULTED_DOCTORS,
      fetchPolicy: 'no-cache',
      variables: input,
    });
    const appointments = res?.data?.getPatientAllAppointments?.appointments;
    const consultedDoctors = [];
    const map = new Map();
    if (appointments) {
      for (const item of appointments) {
        if (!map.has(item?.doctorInfo?.id)) {
          map.set(item?.doctorInfo?.id, true);
          consultedDoctors.push({
            ...item?.doctorInfo,
          });
        }
      }
    }
    setConsultedDoctors(consultedDoctors);
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
  };

  const todayDate = moment(new Date()).format('YYYY-MM-DD');
  const callSpecialityAPI = async () => {
    setshowSpinner(false);
    fetchSpecialities();
  };

  useEffect(() => {
    getNetStatus()
      .then((status) => {
        if (status) {
          fetchPastSearches();
          callSpecialityAPI();
          fetchConsultedDoctors();
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
    const didFocusSubscription = props.navigation.addListener('didFocus', () => {
      !!searchText && fetchSearchData();
    });
    return () => {
      didFocusSubscription && didFocusSubscription.remove();
    };
  }, [searchText]);

  const backDataFunctionality = async () => {
    setIsSearchFocused(false);
    Keyboard.dismiss();
    props.navigation.goBack();
  };
  const renderSearch = () => {
    const hasError =
      searchText.length > 2 &&
      doctorsList &&
      doctorsList.length === 0 &&
      !showSpinner &&
      !isSearching &&
      searchSpecialities &&
      searchSpecialities.length === 0 &&
      (!procedures || procedures?.length === 0) &&
      (!symptoms || symptoms?.length === 0)
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
            placeholder="Search doctors, specialities or symptoms"
            underlineColorAndroid="transparent"
            onChangeText={(value) => {
              if (isValidSearch(value)) {
                setSearchText(value);
                setShowAllSearchedDoctorData(false);
                setShowAllSearchedSymptomsData(false);
                setShowAllSearchedSymptoms(false);
                setShowAllSearchedProcedures(false);
                const search = _.debounce(fetchSearchData, 300);
                setSearchQuery((prevSearch: any) => {
                  if (prevSearch.cancel) {
                    prevSearch.cancel();
                  }
                  return search;
                });
                search(value);
                if (value.length > 2) {
                  setdisplaySpeialist(true);
                  setisSearching(true);
                  setIsSearchFocused(false);
                } else {
                  setdisplaySpeialist(false);
                  setisSearching(false);
                  setIsSearchFocused(true);
                  setProcedures([]);
                  setSymptoms([]);
                }
              }
            }}
            onFocus={() => {
              setIsSearchFocused(true);
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
    const SpecialitiesList = searchText.length > 2 ? searchSpecialities : Specialities;
    if (SpecialitiesList && SpecialitiesList.length > 0 && displaySpeialist) {
      return (
        <View>
          <View style={styles.row}>
            <SectionHeaderComponent
              sectionTitle={
                searchText.length > 2
                  ? `Matching Specialities - ${searchSpecialities && searchSpecialities.length}`
                  : 'OTHER SPECIALTIES'
              }
              style={[
                styles.sectionHeader,
                {
                  marginTop:
                    PastSearches?.length > 0
                      ? searchText?.length > 0 && doctorsList?.length === 0
                        ? 24
                        : 8
                      : 24,
                  borderBottomWidth: searchText.length > 2 ? 0 : 0.4,
                },
              ]}
            />
            {searchText.length > 2 && !showAllSearchedSymptomsData && SpecialitiesList?.length > 2 && (
              <TouchableOpacity
                onPress={() => {
                  setShowAllSearchedSymptomsData(true);
                  const result = (
                    SpecialitiesList?.map((item: any) => {
                      return item?.name;
                    }) || []
                  )?.join(', ');
                  postViewAllWebEngageEvent('Speciality', result);
                }}
              >
                <Text style={styles.viewAllBtnTxt}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {searchText.length > 2 ? (
            <SearchResultCard
              data={SpecialitiesList}
              showAllData={showAllSearchedSymptomsData}
              componentName="speciality"
              navigation={props.navigation}
              onPressCallback={(item: any) => {
                postSpecialityEvent(item?.name, item?.id);
                postSearchedResultWebEngageEvent(item?.name);
                onClickSearch(
                  item?.id,
                  item?.name,
                  searchText.length > 2 ? 'true' : 'false',
                  item?.specialistPluralTerm || ''
                );
              }}
            />
          ) : (
            <View style={{ flexDirection: 'row' }}>
              <FlatList
                bounces={false}
                data={SpecialitiesList}
                onEndReachedThreshold={0.5}
                renderItem={({ item, index }) => {
                  return (
                    <View>
                      {index == 2 && renderTrackSymptoms()}
                      {renderSpecialistRow(
                        item,
                        index,
                        SpecialitiesList.length,
                        searchText.length > 2
                      )}
                    </View>
                  );
                }}
                keyExtractor={(_, index) => index.toString()}
                numColumns={1}
              />
            </View>
          )}
        </View>
      );
    }
  };

  const renderTrackSymptoms = () => {
    return (
      <SymptomTrackerCard
        onPressTrack={() => {
          props.navigation.navigate(AppRoutes.SymptomTracker);
          postSymptomTrackEvent();
        }}
      />
    );
  };

  const renderSpecialistRow = (
    rowData: getAllSpecialties_getAllSpecialties | null,
    rowID: number,
    length: number,
    isSearchResult?: boolean
  ) => {
    if (rowData) {
      let itemSymptom = rowData?.symptoms || '';
      itemSymptom = itemSymptom?.charAt(0)?.toUpperCase() + itemSymptom?.slice(1); // capitalize first character
      const symptom = itemSymptom?.replace(/,\s*([a-z])/g, (d, e) => ', ' + e?.toUpperCase()); // capitalize first character after comma (,)
      return (
        <Mutation<saveSearch> mutation={SAVE_SEARCH}>
          {(mutate, { loading, data, error }) => (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                CommonLogEvent(AppRoutes.DoctorSearch, rowData?.name);
                postSpecialityEvent(rowData?.name, rowData?.id);
                onClickSearch(
                  rowData?.id,
                  rowData?.name,
                  isSearchResult ? 'true' : 'false',
                  rowData?.specialistPluralTerm || ''
                );
                const searchInput = {
                  type: SEARCH_TYPE.SPECIALTY,
                  typeId: rowData?.id,
                  patient: currentPatient?.id || '',
                };
                if (isSearchResult) {
                  try {
                    mutate({
                      variables: {
                        saveSearchInput: searchInput,
                      },
                    });
                  } catch (error) {
                    console.log(error);
                  }
                }
              }}
              style={[
                styles.specialityCard,
                {
                  marginTop: rowID === 0 ? 16 : 6,
                  marginBottom: length === rowID + 1 ? 16 : 6,
                },
              ]}
              key={rowID}
            >
              <View style={styles.listSpecialistView}>
                {rowData?.image?.length !== 0 ? (
                  <Image
                    source={{
                      uri: rowData?.image!,
                    }}
                    resizeMode={'contain'}
                    style={styles.specialityIcon}
                  />
                ) : null}
                <View>
                  <Text numberOfLines={1} style={styles.rowSpecialistStyles}>
                    {rowData?.name}
                  </Text>
                  <View style={styles.descriptionCont}>
                    <Text numberOfLines={2} style={styles.rowDescriptionSpecialistStyles}>
                      {rowData?.shortDescription}
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
            </TouchableOpacity>
          )}
        </Mutation>
      );
    } else return null;
  };

  const postSymptomTrackEvent = () => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.SYMPTOM_TRACKER_CLICKED_ON_SPECIALITY_SCREEN] = {
      'Patient UHID': g(currentPatient, 'uhid'),
      'Patient ID': g(currentPatient, 'id'),
      'Patient Name': g(currentPatient, 'firstName'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Date of Birth': g(currentPatient, 'dateOfBirth'),
      Email: g(currentPatient, 'emailAddress'),
      Relation: g(currentPatient, 'relation'),
    };
    postWebEngageEvent(
      WebEngageEventName.SYMPTOM_TRACKER_CLICKED_ON_SPECIALITY_SCREEN,
      eventAttributes
    );
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
    postAppsFlyerEvent(AppsFlyerEventName.SPECIALITY_CLICKED, eventAttributes);
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
    _doctorDetails: any,
    source: WebEngageEvents[WebEngageEventName.DOCTOR_CLICKED]['Source'],
    type?: 'consult-now' | 'book-appointment'
  ) => {
    const doctorDetails = _doctorDetails;
    const eventAttributes: WebEngageEvents[WebEngageEventName.DOCTOR_CLICKED] = {
      'Doctor Name': doctorDetails.displayName!,
      Source: source,
      'Doctor ID': doctorDetails.id,
      'Doctor Category': doctorDetails.doctorType,
      Fee: Number(doctorDetails?.fee),
      'Doctor Speciality': doctorDetails?.specialtydisplayName,
      Rank: doctorDetails?.rowId,
    };

    const eventAttributesFirebase: FirebaseEvents[FirebaseEventName.DOCTOR_CLICKED] = {
      DoctorName: doctorDetails.fullName!,
      Source: source,
      DoctorID: doctorDetails.id,
      SpecialityID: g(doctorDetails, 'specialty', 'id')!,
      DoctorCategory: doctorDetails.doctorType,
      Fee: Number(doctorDetails?.fee),
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
    });
  };

  const renderDoctorSearches = () => {
    if (searchText.length > 2 && doctorsList && doctorsList.length > 0) {
      const SpecialitiesList = (searchText.length > 2 ? searchSpecialities : Specialities) || [];
      let totalNoOfBuckets = 0;
      if (procedures?.length > 0) {
        totalNoOfBuckets++;
      }
      if (symptoms?.length > 0) {
        totalNoOfBuckets++;
      }
      if (SpecialitiesList?.length > 0) {
        totalNoOfBuckets++;
      }
      if (doctorsList?.length > 0) {
        totalNoOfBuckets++;
      }
      const noOtherBucket =
        procedures?.length === 0 && symptoms?.length === 0 && SpecialitiesList?.length === 0;
      const visibleDataCount = totalNoOfBuckets === 2 ? 6 : totalNoOfBuckets === 1 ? -1 : 2; // -1 representing for all data
      const showViewAllDoctors =
        (visibleDataCount === 6 && doctorsList?.length <= 6) ||
        (totalNoOfBuckets === 1 && noOtherBucket)
          ? false
          : !showAllSearchedDoctorData && doctorsList?.length > 2;
      const showAllData = noOtherBucket ? true : showAllSearchedDoctorData;
      return (
        <View>
          <View style={styles.row}>
            <SectionHeaderComponent
              sectionTitle={'Matching Doctors — ' + doctorsList.length}
              style={{ marginBottom: 0 }}
            />
            {showViewAllDoctors && (
              <TouchableOpacity
                onPress={() => {
                  setShowAllSearchedDoctorData(true);
                  const result = (
                    doctorsList?.map((item: any) => {
                      return item?.displayName;
                    }) || []
                  )?.join(', ');
                  postViewAllWebEngageEvent('Doctor', result);
                }}
              >
                <Text style={[styles.viewAllBtnTxt, { marginTop: 24 }]}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
          <SearchResultCard
            data={doctorsList}
            showAllData={showAllData}
            visibleDataCount={visibleDataCount}
            componentName="doctor"
            navigation={props.navigation}
            onPressCallback={(item: any, index: number) => {
              const itemNo = index + 1;
              postDoctorClickWEGEvent({ ...item, itemNo }, 'Search');
              postSearchedResultWebEngageEvent(item?.displayName);
              CommonLogEvent(AppRoutes.DoctorSearch, 'renderSearchDoctorResultsRow clicked');
              props.navigation.navigate(AppRoutes.DoctorDetails, {
                doctorId: item?.id,
                callSaveSearch: 'true',
              });
            }}
          />
        </View>
      );
    }
  };

  const renderProcedures = () => {
    if (procedures?.length > 0) {
      return (
        <View>
          <View style={styles.row}>
            <SectionHeaderComponent
              sectionTitle={'Matching Procedures — ' + procedures?.length}
              style={{ marginBottom: 0 }}
            />
            {!showAllSearchedProcedures && procedures?.length > 2 && (
              <TouchableOpacity
                onPress={() => {
                  setShowAllSearchedProcedures(true);
                  const result = (
                    procedures?.map((item: any) => {
                      return item?.name;
                    }) || []
                  )?.join(', ');
                  postViewAllWebEngageEvent('Procedure', result);
                }}
              >
                <Text style={[styles.viewAllBtnTxt, { marginTop: 24 }]}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
          <SearchResultCard
            data={procedures}
            showAllData={showAllSearchedProcedures}
            componentName="procedures"
            navigation={props.navigation}
            onPressCallback={(item: any) => {
              onPressProcedure(item);
            }}
          />
        </View>
      );
    }
  };

  const renderSymptoms = () => {
    if (symptoms?.length > 0) {
      return (
        <View>
          <View style={styles.row}>
            <SectionHeaderComponent
              sectionTitle={'Matching Symptoms — ' + symptoms?.length}
              style={{ marginBottom: 0 }}
            />
            {!showAllSearchedSymptoms && symptoms?.length > 2 && (
              <TouchableOpacity
                onPress={() => {
                  setShowAllSearchedSymptoms(true);
                  const result = (
                    symptoms?.map((item: any) => {
                      return item?.name;
                    }) || []
                  )?.join(', ');
                  postViewAllWebEngageEvent('Symptoms', result);
                }}
              >
                <Text style={[styles.viewAllBtnTxt, { marginTop: 24 }]}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
          <SearchResultCard
            data={symptoms}
            showAllData={showAllSearchedSymptoms}
            componentName="symptoms"
            navigation={props.navigation}
            postSymptomTrackEvent={postSymptomTrackEvent}
            onPressCallback={(item: any) => {
              onPressProcedure(item);
            }}
          />
        </View>
      );
    }
  };

  const onPressProcedure = (item: any) => {
    postSearchedResultWebEngageEvent(item?.name);
    if (item?.speciality?.toUpperCase() === 'ABSENT') {
      props.navigation.navigate(AppRoutes.SymptomTracker, {
        symptomData: item,
      });
    } else {
      props.navigation.navigate('DoctorSearchListing', {
        specialities: [item?.speciality],
      });
    }
  };

  const selectUser = (selectedUser: any) => {
    setGender(selectedUser?.gender);
    setCurrentPatientId(selectedUser?.id);
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
      fetchConsultedDoctors(item.id);
    }, 1000);
  };
  const onProfileChange = () => {
    setShowList(false);

    setTimeout(() => {
      setShowProfilePopUp(false);
      fetchPastSearches();
      fetchConsultedDoctors();
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
        <View style={styles.mainView}>
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

  const renderDefaultSearchScreen = () => {
    return (
      <DefaultSearchComponent
        consultedDoctors={consultedDoctors}
        pastSearches={PastSearches}
        topSpecialities={TopSpecialities}
        navigation={props.navigation}
        postSymptomTrackEvent={postSymptomTrackEvent}
        postSpecialityEvent={postSpecialityEvent}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: isSearchFocused && searchText?.length < 3 ? 'white' : '#f0f1ec',
        }}
      >
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
                keyboardDismissMode="on-drag"
                onScrollBeginDrag={Keyboard.dismiss}
              >
                {isSearchFocused && searchText?.length < 3 ? (
                  renderDefaultSearchScreen()
                ) : (
                  <View>
                    {renderPastSearch()}
                    {renderSpecialityText()}
                    {renderTopSpecialities()}
                    {renderSpecialist()}
                    {renderDoctorSearches()}
                    {renderProcedures()}
                    {renderSymptoms()}
                  </View>
                )}
              </ScrollView>
            </>
          )
        ) : null}
      </SafeAreaView>
      {showSpinner && <Spinner />}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
    </View>
  );
};
