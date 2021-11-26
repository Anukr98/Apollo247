import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { ArrowRight, OneTapConsult, PastIcon } from '@aph/mobile-patients/src/components/ui/Icons';
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
  GET_ALL_USER_SUSBSCRIPTIONS_WITH_PLAN_BENEFITS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { LocationOnHeader } from '../LocationOnHeader';
import {
  getAllSpecialties,
  getAllSpecialtiesVariables,
  getAllSpecialties_getAllSpecialties,
} from '@aph/mobile-patients/src/graphql/types/getAllSpecialties';
import { getPastSearches_getPastSearches } from '@aph/mobile-patients/src/graphql/types/getPastSearches';
import { getPatientPastSearches } from '@aph/mobile-patients/src/graphql/types/getPatientPastSearches';
import { SEARCH_TYPE, SPECIALTY_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
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
  getUserType,
  postWEGPatientAPIError,
  postCleverTapEvent,
  postConsultSearchCleverTapEvent,
  postConsultPastSearchSpecialityClicked,
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
import React, { useEffect, useState, useRef } from 'react';
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
  ImageBackground,
} from 'react-native';
import { NavigationParams, NavigationScreenProps, ScrollView } from 'react-navigation';
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
  getConsultWidgetPackages,
} from '@aph/mobile-patients/src/helpers/apiCalls';
var allSettled = require('promise.allsettled');
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { calculateCircleDoctorPricing } from '../../utils/commonUtils';
import { useShoppingCart } from '../ShoppingCartProvider';
import { LinearGradientComponent } from '@aph/mobile-patients/src/components/ui/LinearGradientComponent';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  GetAllUserSubscriptionsWithPlanBenefitsV2,
  GetAllUserSubscriptionsWithPlanBenefitsV2Variables,
} from '@aph/mobile-patients/src/graphql/types/GetAllUserSubscriptionsWithPlanBenefitsV2';
import HTML from 'react-native-render-html';

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
    justifyContent: 'center',
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
    marginLeft: 20,
    marginTop: 8,
  },
  listView: {
    marginVertical: 4,
    width: 'auto',
    backgroundColor: 'white',
    marginEnd: 16,
    shadowOpacity: 0,
    elevation: 0,
  },
  rowTextStyles: {
    color: theme.colors.SEARCH_TITLE_COLOR,
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
  oneTapContainer: {
    margin: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FC9916',
  },
  oneTapView: {
    paddingStart: 12,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  oneTapLogo: {
    width: 18,
    height: 27,
    marginEnd: 12,
  },
  oneTapText: {
    ...theme.viewStyles.text('B', 13, theme.colors.LIGHT_BLUE, 1, 24),
  },
  oneTapInfo: {
    marginVertical: -7,
    marginHorizontal: 14,
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE),
  },
  oneTapArrow: {
    tintColor: theme.colors.APP_YELLOW,
    position: 'absolute',
    end: 12,
    top: 12,
  },
  oneTapInfoView: {
    borderBottomLeftRadius: 4,
    borderBottomEndRadius: 4,
    backgroundColor: theme.colors.WHITE,
  },
  packageBanner: {
    height: 75,
    width: 250,
    borderRadius: 6,
    marginEnd: 10,
    backgroundColor: theme.colors.LIGHT_GRAY,
  },
  packageList: {
    margin: 16,
    marginTop: 10,
  },
  viewAllBtn: {
    width: 102,
    alignSelf: 'center',
  },
  pastLogo: {
    height: 13,
    width: 13,
    marginStart: 20,
    marginEnd: 8,
  },
  mySpecialtyPackageContainer: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  bannerBackground: {
    width: '100%',
    height: 100,
    borderRadius: 5,
    flex: 1,
    justifyContent: 'center',
  },

  packageTitle: {
    ...theme.viewStyles.text('M', 16, theme.colors.WHITE),
    marginLeft: 25,
  },
  packageInfoContainer: {
    flex: 1,
    marginHorizontal: 15,
    marginVertical: 16,
  },
  consultationBookedTitle: { ...theme.viewStyles.text('R', 12, theme.colors.PLATINUM_GREY) },
  consultationBooked: { ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE), marginTop: 5 },
  validTillTitle: { ...theme.viewStyles.text('R', 12, theme.colors.PLATINUM_GREY) },
  validTill: { ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE), marginTop: 5 },
  vericalSeparator: {
    width: 0.5,
    height: 40,
    marginLeft: -10,
    backgroundColor: theme.colors.SHERPA_BLUE,
    opacity: 0.2,
    marginVertical: 16,
  },
  pkgSectionHeader: {
    marginBottom: 20,
    marginTop: 28,
    paddingBottom: 5,
    borderBottomWidth: 0.4,
    borderBottomColor: theme.colors.LIGHT_BLUE,
  },
  morePackageForYourHeader: {
    marginBottom: 10,
    marginTop: 10,
    paddingBottom: 5,
    borderBottomWidth: 0.4,
    borderBottomColor: theme.colors.LIGHT_BLUE,
  },
  myPkgView: {
    margin: 5,
    flexDirection: 'row',
  },
  changeModeCtaContainer: {
    backgroundColor: '#fff',
    marginVertical: 8,
  },
  changeModeCtaInnerContainer: {
    flex: 1,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  changeModeText: {
    ...theme.fonts.IBMPlexSansMedium(14),
    marginBottom: 2,
    color: theme.colors.SHERPA_BLUE,
  },
  selectSpecialityButtonStyle: {
    width: 140,
    height: 30,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: 'white',
  },
});

export interface DoctorSearchProps
  extends NavigationScreenProps<{
    movedFrom?: string;
    isOnlineConsultMode?: boolean;
    consultTypeCta?: string;
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
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
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
  const [packages, setPackages] = useState<any>([]);
  const [oneTapPackage, setOneTapPackage] = useState<any | null>(null);
  const [purchasedPackage, setPurchasedPackage] = useState<any[]>([]);
  const clickedBucket = useRef<string>('');
  const { circlePlanSelected, circleSubscriptionId, circleSubPlanId } = useShoppingCart();
  const [oneTapPlanTitle, setOneTapPlanTitle] = useState<string>();
  const consultTypeCta = props.navigation?.getParam('consultTypeCta') || '';

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  const client = useApolloClient();

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
      User_Type: getUserType(allCurrentPatients),
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
            const searchResults =
              searchData?.doctors?.length === 0 &&
              searchData?.specialties?.length === 0 &&
              procedures?.length === 0 &&
              symptoms?.length === 0
                ? true
                : false;
            setProcedures(procedures);
            setSymptoms(symptoms);
            postSearchedResultWebEngageEvent(
              null,
              searchTextString,
              searchData?.doctors,
              searchData?.specialties,
              procedures,
              symptoms,
              searchResults
            );
            postConsultSearchCleverTapEvent(
              searchTextString,
              currentPatient,
              allCurrentPatients,
              searchResults,
              'speciality screen',
              !!circleSubscriptionId,
              circleSubPlanId || ''
            );
          } catch (e) {
            CommonBugFender('DoctorSearch_fetchSearchData_try', e);
          }
        })
        .catch((e) => {
          setProcedures([]);
          setSymptoms([]);
          setisSearching(false);
          postWEGPatientAPIError(
            currentPatient,
            '',
            'DoctorSearch',
            'GET_DOCTOR_LIST',
            JSON.stringify(e)
          );
          CommonBugFender('DoctorSearch_fetchSearchData', e);
        });
    }
  };

  const postSearchedResultWebEngageEvent = (
    clickedItem?: string | null,
    inputString?: string,
    doctors?: any,
    specialities?: any,
    searchedProcedures?: any,
    searchedSymptoms?: any,
    noResults?: boolean
  ) => {
    const doctorsSearchedList = (doctors || doctorsList || [])?.map((item: any) => {
      return item?.displayName;
    });
    const doctorIds = (doctors || doctorsList || [])?.map((item: any) => {
      return item?.id;
    });
    const doctorBucket = doctorsSearchedList?.length > 0 ? 'Doctor, ' : '';
    const specialitiesList = (specialities || searchSpecialities || [])?.map((item: any) => {
      return item?.name;
    });
    const specialityBucket = specialitiesList?.length > 0 ? 'Speciality, ' : '';
    const proceduresList = (searchedProcedures || procedures || [])?.map((item: any) => {
      return item?.name;
    });
    const procedureBucket = proceduresList?.length > 0 ? 'Procedure, ' : '';
    const symptomsList = (searchedSymptoms || symptoms || [])?.map((item: any) => {
      return item?.name;
    });
    const symptomBucket = symptomsList?.length > 0 ? 'Symptoms' : '';
    const searchSuggestions = [
      ...specialitiesList,
      ...doctorsSearchedList,
      ...proceduresList,
      ...symptomsList,
    ]?.join(', ');
    setSearchSuggestions(searchSuggestions);
    const bucket = doctorBucket
      ?.concat(specialityBucket)
      ?.concat(procedureBucket)
      ?.concat(symptomBucket);
    setSearchedBucket(bucket);
    let eventAttributes:
      | WebEngageEvents[WebEngageEventName.SEARCH_SUGGESTIONS]
      | CleverTapEvents[CleverTapEventName.CONSULT_SEARCH_SUGGESTIONS] = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      Keyword: inputString || searchText,
      'Search suggestions': searchSuggestions || savedSearchedSuggestions,
      Bucket: bucket || searchedBucket,
      Doctors: doctorIds?.join(', '),
      Symptoms: symptomsList?.join(', '),
      Specialities: specialitiesList?.join(', '),
      Procedures: proceduresList?.join(', '),
      User_Type: getUserType(allCurrentPatients),
    };

    if (clickedItem) {
      // search suggestions clicked event
      eventAttributes['Bucket clicked'] = clickedBucket.current;
      eventAttributes['Search suggestion clicked'] = clickedItem || '';
      eventAttributes['Source'] = 'Speciality screen';
      eventAttributes['Circle Member'] = !!circleSubscriptionId;
      eventAttributes['Circle Plan type'] = circleSubPlanId || '';
      postWebEngageEvent(WebEngageEventName.SEARCH_SUGGESTIONS_CLICKED, eventAttributes);
      postCleverTapEvent(CleverTapEventName.CONSULT_SEARCH_SUGGESTIONS_CLICKED, eventAttributes);
    } else {
      // searched suggestions event
      eventAttributes['search result success'] = noResults ? 'No' : 'Yes';
      postWebEngageEvent(WebEngageEventName.SEARCH_SUGGESTIONS, eventAttributes);
      postCleverTapEvent(CleverTapEventName.CONSULT_SEARCH_SUGGESTIONS, eventAttributes);
    }
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
    setshowSpinner(true);
    client
      .query<getAllSpecialties, getAllSpecialtiesVariables>({
        query: GET_ALL_SPECIALTIES,
        variables: {
          specialtyStatus: SPECIALTY_STATUS.TRUE,
        },
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

  const fetchConsultedDoctors = async () => {
    const userId = await dataSavedUserID('selectedProfileId');
    const input = {
      patientId: userId ? userId : g(currentPatient, 'id'),
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
    } else {
      postWEGPatientAPIError(
        currentPatient,
        '',
        'DoctorSearch',
        'GET_PATIENT_ALL_CONSULTED_DOCTORS',
        JSON.stringify(res)
      );
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
          getUserSubscriptionsWithBenefits();
          getPackages();
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

  const getPackages = () => {
    getConsultWidgetPackages()
      .then((response) => {
        const { data: packages } = response?.data || {};
        if (packages?.length) {
          const oneTapPackageIndex = packages?.findIndex((pkg: any) =>
            pkg?.PackagePlanDetails?.some((plan: any) => !!plan?.PackagePlanIsOneTap)
          );

          if (oneTapPackageIndex > -1) {
            let oneTapPackage = packages[oneTapPackageIndex];

            setOneTapPlanTitle(
              oneTapPackage?.PackagePlanDetails.find((plan) => plan.PackagePlanIsOneTap == true)
                ?.PackagePlanIsOneTapDescription || 'ONE TAP CONSULTATION'
            );

            setOneTapPackage(oneTapPackage);
            packages?.splice(oneTapPackageIndex, 1);
          }
          setPackages(packages?.slice(0, 3));
        }
      })
      .catch((error) => {
        CommonBugFender('GetConsultWidget_CmsError', error);
      });
  };

  const getUserSubscriptionsWithBenefits = () => {
    const mobile_number = currentPatient?.mobileNumber;
    client.query<
      GetAllUserSubscriptionsWithPlanBenefitsV2,
      GetAllUserSubscriptionsWithPlanBenefitsV2Variables
    >({
      query: GET_ALL_USER_SUSBSCRIPTIONS_WITH_PLAN_BENEFITS,
      variables: { mobile_number },
      fetchPolicy: 'no-cache',
    });
    if (mobile_number) {
      client
        .query<
          GetAllUserSubscriptionsWithPlanBenefitsV2,
          GetAllUserSubscriptionsWithPlanBenefitsV2Variables
        >({
          query: GET_ALL_USER_SUSBSCRIPTIONS_WITH_PLAN_BENEFITS,
          variables: { mobile_number },
          fetchPolicy: 'no-cache',
        })
        .then((data) => {
          const groupPlans = data?.data?.GetAllUserSubscriptionsWithPlanBenefitsV2?.response;

          if (!!groupPlans['APOLLO_CONSULT']) {
            let packages: any[] = [];
            groupPlans['APOLLO_CONSULT']?.forEach((pkg: any) => {
              if (
                //normal package
                (pkg?.plan_vertical === 'Consult' && pkg?.status === 'active') ||
                //onetap package
                (pkg?.plan_vertical === 'Consult' &&
                  (pkg?.status === 'deferred_active' || pkg?.status === 'active') &&
                  pkg?.is_one_tap_consultation_plan == true)
              ) {
                packages.push({
                  packageId: pkg?.sub_plan_id,
                  name: pkg?.name,
                  booked:
                    pkg?.benefits?.length > 1
                      ? pkg?.benefits?.reduce(
                          (prevBenefit: any, currBenefit: any) =>
                            prevBenefit?.attribute_type?.used ||
                            0 + currBenefit?.attribute_type?.used
                        )
                      : pkg?.benefits?.[0]?.attribute_type?.used,
                  validTill: pkg.subscriptionEndDate,
                  banner: pkg?.post_purchase_background_image_url,
                });
              }
            });
            setPurchasedPackage(packages);
          }
        })
        .catch((error) => {});
    }
  };

  const renderOneTapPackage = () => {
    return (
      <TouchableOpacity
        style={styles.oneTapContainer}
        onPress={() => {
          props.navigation.navigate(AppRoutes.ConsultPackageDetail, {
            planId: oneTapPackage?.PackageIdentifier,
            isOneTap: true,
          });
        }}
      >
        <LinearGradientComponent
          colors={[theme.colors.PEACH_CREAM, theme.colors.SOAP_STONE]}
          style={styles.oneTapView}
        >
          <OneTapConsult style={styles.oneTapLogo} />
          <Text style={styles.oneTapText}>
            {oneTapPlanTitle || string.consultPackages.oneTapConsultation}
          </Text>
        </LinearGradientComponent>
        <View style={styles.oneTapInfoView}>
          <HTML html={oneTapPackage?.PackageDescription || ''} containerStyle={styles.oneTapInfo} />
        </View>
        <ArrowRight style={styles.oneTapArrow} />
      </TouchableOpacity>
    );
  };

  const [isOnlineConsultMode, setIsOnlineConsultMode] = useState(
    typeof props.navigation.getParam('isOnlineConsultMode') === 'boolean'
      ? props.navigation.getParam('isOnlineConsultMode')
      : true
  );

  const postEventClickSelectLocation = (
    specialityName: string = '',
    specialityId: string = '',
    screen?: string,
    city?: string | ''
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
          titleComponent={
            <LocationOnHeader
              navigation={props.navigation}
              isOnlineConsultMode={isOnlineConsultMode}
              isSpecialityScreen={isOnlineConsultMode}
              goBack={true}
              postSelectLocation={() => postEventClickSelectLocation('', '', 'Speciality Screen')}
              postEventClickSelectLocation={(city) =>
                postEventClickSelectLocation('', '', '', city)
              }
            />
          }
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
          <FlatList
            horizontal={true}
            bounces={false}
            contentContainerStyle={{ alignItems: 'center' }}
            data={PastSearches}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={() => <PastIcon style={styles.pastLogo} />}
            renderItem={({ item, index }) => renderRow(item, index)}
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      );
    }
  };

  const { locationDetails } = useAppCommonData();

  const renderRow = (rowData: getPastSearches_getPastSearches | null, rowID: number) => {
    if (rowData) {
      return (
        <Button
          title={(rowData && rowData.name && rowData.name.toUpperCase()) || ''}
          style={[
            styles.listView,
            rowID === 0 ? { marginLeft: 8 } : null,
            rowID + 1 === PastSearches.length ? { marginRight: 8 } : null,
          ]}
          titleTextStyle={styles.rowTextStyles}
          onPress={() => {
            if (rowData.searchType === 'DOCTOR') {
              CommonLogEvent(AppRoutes.DoctorSearch, 'Doctor Search Move clicked');
              rowData?.allowBookingRequest
                ? props.navigation.navigate(AppRoutes.DoctorDetailsBookingOnRequest, {
                    doctorId: rowData.typeId,
                    callSaveSearch: 'true',
                    fromPastSearch: true,
                  })
                : props.navigation.navigate(AppRoutes.SlotSelection, {
                    doctorId: rowData.typeId,
                    callSaveSearch: 'true',
                    // fromPastSearch: true,
                    showBookAppointment: true,
                    consultModeSelected: isOnlineConsultMode
                      ? string.consultModeTab.VIDEO_CONSULT
                      : string.consultModeTab.HOSPITAL_VISIT,
                  });
            }
            if (rowData.searchType === 'SPECIALTY') {
              CommonLogEvent(AppRoutes.DoctorSearch, 'Doctor Search Move  SPECIALTY clicked');
              if (locationDetails || isOnlineConsultMode) {
                if (rowData?.typeId && rowData?.name) {
                  postConsultPastSearchSpecialityClicked(
                    currentPatient,
                    allCurrentPatients,
                    rowData
                  );
                  onClickSearch(
                    rowData?.typeId,
                    rowData?.name,
                    'true',
                    '',
                    isOnlineConsultMode
                      ? string.doctor_search_listing.avaliablity
                      : string.doctor_search_listing.location
                  );
                  postSpecialityEvent(rowData?.name, rowData?.typeId, 'Past searches');
                }
              } else {
                props.navigation.navigate(AppRoutes.SelectLocation, {
                  isOnlineConsultMode: isOnlineConsultMode,
                  patientId: g(currentPatient, 'id') || '',
                  patientMobileNumber: g(currentPatient, 'mobileNumber') || '',
                  goBackCallback: (loc: any) => {
                    if (rowData?.typeId && rowData?.name) {
                      postConsultPastSearchSpecialityClicked(
                        currentPatient,
                        allCurrentPatients,
                        rowData
                      );
                      onClickSearch(
                        rowData?.typeId,
                        rowData?.name,
                        'true',
                        '',
                        isOnlineConsultMode
                          ? string.doctor_search_listing.avaliablity
                          : string.doctor_search_listing.location
                      );
                      postSpecialityEvent(rowData?.name, rowData?.typeId, 'Past searches');
                    }
                  },
                  postEventClickSelectLocation: (city: string | '') =>
                    postEventClickSelectLocation(rowData?.name, rowData?.typeId, '', city),
                });
              }
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
            over 4000 doctors and {SpecialitiesList.length + 6} specialities
          </Text>
        </View>
      );
    }
  };

  const renderSpecialityCard = (item: any, index: number) => {
    let itemSymptom = item!.symptoms || '';
    itemSymptom = itemSymptom.charAt(0).toUpperCase() + itemSymptom.slice(1); // capitalize first character
    const symptom = itemSymptom.replace(/,\s*([a-z])/g, (d, e) => ', ' + e.toUpperCase()); // capitalize first character after comma (,)

    return (
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
            style={Platform.OS === 'ios' ? styles.topSpecialityNameiOS : styles.topSpecialityName}
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
    );
  };

  const onSelectSpecialityClicked = () => {
    const attributes: CleverTapEvents[CleverTapEventName.CONSULT_SELECT_SPECIALITY_CLICKED] = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Mobile number': g(currentPatient, 'mobileNumber'),
      'Location details': locationDetails?.city || '',
      'Consult mode': isOnlineConsultMode ? 'Video Consult' : 'Hospital Visit',
    };
    postCleverTapEvent(CleverTapEventName.CONSULT_SELECT_SPECIALITY_CLICKED, attributes);
    setIsOnlineConsultMode(!isOnlineConsultMode);
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
          <View style={{ flexDirection: 'row', marginLeft: 20, flexWrap: 'wrap' }}>
            {TopSpecialities.slice(0, 4).map((item, index) => {
              return (
                <Mutation<saveSearch> mutation={SAVE_SEARCH}>
                  {(mutate, { loading, data, error }) => renderSpecialityCard(item, index)}
                </Mutation>
              );
            })}
          </View>
          <View style={styles.changeModeCtaContainer}>
            <View style={styles.changeModeCtaInnerContainer}>
              <Text style={styles.changeModeText}>
                {!isOnlineConsultMode
                  ? string.common.consult_via_videocall
                  : string.common.consult_via_visit}
              </Text>
              <Button
                title={string.common.selectSpeciality}
                style={styles.selectSpecialityButtonStyle}
                onPress={onSelectSpecialityClicked}
                titleTextStyle={{ color: theme.colors.APP_YELLOW }}
              />
            </View>
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
                if (locationDetails || isOnlineConsultMode) {
                  clickedBucket.current = 'Speciality';
                  postSpecialityEvent(item?.name, item?.id);
                  postSearchedResultWebEngageEvent(item?.name);
                  onClickSearch(
                    item?.id,
                    item?.name,
                    searchText.length > 2 ? 'true' : 'false',
                    item?.specialistPluralTerm || '',
                    isOnlineConsultMode
                      ? string.doctor_search_listing.avaliablity
                      : string.doctor_search_listing.location
                  );
                } else {
                  props.navigation.navigate(AppRoutes.SelectLocation, {
                    isOnlineConsultMode,
                    patientId: g(currentPatient, 'id') || '',
                    patientMobileNumber: g(currentPatient, 'mobileNumber') || '',
                    goBackCallback: (loc: any) => {
                      clickedBucket.current = 'Speciality';
                      postSpecialityEvent(item?.name, item?.id);
                      postSearchedResultWebEngageEvent(item?.name);
                      onClickSearch(
                        item?.id,
                        item?.name,
                        searchText.length > 2 ? 'true' : 'false',
                        item?.specialistPluralTerm || '',
                        isOnlineConsultMode
                          ? string.doctor_search_listing.avaliablity
                          : string.doctor_search_listing.location
                      );
                    },
                    postEventClickSelectLocation: (city: string | '') =>
                      postEventClickSelectLocation(item?.name, item?.id, '', city),
                  });
                }
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
                if (locationDetails || isOnlineConsultMode) {
                  CommonLogEvent(AppRoutes.DoctorSearch, rowData?.name);
                  postSpecialityEvent(rowData?.name, rowData?.id);
                  onClickSearch(
                    rowData?.id,
                    rowData?.name,
                    isSearchResult ? 'true' : 'false',
                    rowData?.specialistPluralTerm || '',
                    isOnlineConsultMode
                      ? string.doctor_search_listing.avaliablity
                      : string.doctor_search_listing.location
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
                    } catch (error) {}
                  }
                } else {
                  props.navigation.navigate(AppRoutes.SelectLocation, {
                    isOnlineConsultMode: isOnlineConsultMode,
                    patientId: g(currentPatient, 'id') || '',
                    patientMobileNumber: g(currentPatient, 'mobileNumber') || '',
                    goBackCallback: (loc: any) => {
                      CommonLogEvent(AppRoutes.DoctorSearch, rowData?.name);
                      postSpecialityEvent(rowData?.name, rowData?.id);
                      onClickSearch(
                        rowData?.id,
                        rowData?.name,
                        isSearchResult ? 'true' : 'false',
                        rowData?.specialistPluralTerm || '',
                        isOnlineConsultMode
                          ? string.doctor_search_listing.avaliablity
                          : string.doctor_search_listing.location
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
                        } catch (error) {}
                      }
                    },
                    postEventClickSelectLocation: (city: string | '') =>
                      postEventClickSelectLocation(rowData?.name, rowData?.id, '', city),
                  });
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
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.SYMPTOM_TRACKER_CLICKED_ON_SPECIALITY_SCREEN]
      | CleverTapEvents[CleverTapEventName.SYMPTOM_TRACKER_CLICKED_ON_SPECIALITY_SCREEN] = {
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
    postCleverTapEvent(
      CleverTapEventName.SYMPTOM_TRACKER_CLICKED_ON_SPECIALITY_SCREEN,
      eventAttributes
    );
  };

  const postSpecialityEvent = (speciality: string, specialityId: string, source?: string) => {
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
      User_Type: getUserType(allCurrentPatients),
      'Circle Member': !!circleSubscriptionId,
      'Circle Plan type': circleSubPlanId || '',
      Source: source || 'Speciality list',
    };
    postWebEngageEvent(WebEngageEventName.SPECIALITY_CLICKED, eventAttributes);
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_SPECIALITY_CLICKED] = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation') || undefined,
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      'Speciality name': speciality,
      'Speciality ID': specialityId,
      User_Type: getUserType(allCurrentPatients),
      'Circle Member': !!circleSubscriptionId,
      'Circle Plan type': circleSubPlanId || '',
      Source: source || 'Speciality list',
    };
    postCleverTapEvent(CleverTapEventName.CONSULT_SPECIALITY_CLICKED, cleverTapEventAttributes);
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
      'Doctor ID': g(doctorDetails, 'id')!,
      'Doctor name': g(doctorDetails, 'displayName')!,
      'Speciality name': doctorDetails?.specialtydisplayName,
      'Speciality ID': 'NA',
      'Media source': 'NA',
      Experience: String(doctorDetails?.experience) || '',
      User_Type: getUserType(allCurrentPatients),
      Fee: Number(doctorDetails?.onlineConsultationFees),
      Languages: doctorDetails?.languages?.join(',') || '',
      Source: 'Search',
      'Doctor card clicked': 'Yes',
      Rank: doctorDetails?.rowId,
      Is_TopDoc: 'No',
      DOTH: 'F',
      'Doctor tab': 'NA',
      'Search screen': searchText?.length > 2 ? 'Speciality listing' : 'NA',
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
      eventAttributes['Source'] = 'List';
      postWebEngageEvent(WebEngageEventName.BOOK_APPOINTMENT, eventAttributes);
      postCleverTapEvent(
        CleverTapEventName.CONSULT_BOOK_APPOINTMENT_CONSULT_CLICKED,
        eventAttributes
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
    specialistPluralTerm?: string,
    sortBy?: string
  ) => {
    props.navigation.navigate('DoctorSearchListing', {
      specialityId: id,
      specialityName: name,
      callSaveSearch: callSaveSearch,
      specialistPluralTerm,
      isOnlineConsultMode,
      sortBy,
      consultTypeCta: consultTypeCta,
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
              clickedBucket.current = 'Doctor';
              const itemNo = index + 1;
              postDoctorClickWEGEvent({ ...item, itemNo }, 'Search');
              postSearchedResultWebEngageEvent(item?.displayName);
              CommonLogEvent(AppRoutes.DoctorSearch, 'renderSearchDoctorResultsRow clicked');
              item?.allowBookingRequest
                ? props.navigation.navigate(AppRoutes.DoctorDetailsBookingOnRequest, {
                    doctorId: item.id,
                    callSaveSearch: 'true',
                  })
                : props.navigation.navigate(AppRoutes.SlotSelection, {
                    doctorId: item?.id,
                    callSaveSearch: 'true',
                    showBookAppointment: true,
                    consultModeSelected: isOnlineConsultMode
                      ? string.consultModeTab.VIDEO_CONSULT
                      : string.consultModeTab.HOSPITAL_VISIT,
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
              clickedBucket.current = 'Procedure';
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
            onPressCallback={(item: any, index: number, name?: string) => {
              clickedBucket.current = 'Symptoms';
              onPressProcedure(item, index, name);
            }}
          />
        </View>
      );
    }
  };

  const onPressProcedure = (item: any, index?: number, name?: string) => {
    postSearchedResultWebEngageEvent(item?.name);
    if (item?.speciality?.toUpperCase() === 'ABSENT') {
      props.navigation.navigate(AppRoutes.SymptomTracker, {
        symptomData: item,
      });
    } else {
      if (name === 'symptoms') {
        if (isOnlineConsultMode || locationDetails) {
          props.navigation.navigate('DoctorSearchListing', {
            specialities: [item?.speciality],
            isOnlineConsultMode: isOnlineConsultMode,
            consultTypeCta: consultTypeCta,
            sortBy: isOnlineConsultMode
              ? string.doctor_search_listing.avaliablity
              : string.doctor_search_listing.location,
          });
        } else {
          props.navigation.navigate(AppRoutes.SelectLocation, {
            isOnlineConsultMode: isOnlineConsultMode,
            patientId: g(currentPatient, 'id') || '',
            patientMobileNumber: g(currentPatient, 'mobileNumber') || '',
            postEventClickSelectLocation: (city: string | '') =>
              postEventClickSelectLocation('', '', '', city),
          });
        }
      } else {
        props.navigation.navigate('DoctorSearchListing', {
          specialities: [item?.speciality],
          isOnlineConsultMode: isOnlineConsultMode,
          consultTypeCta: consultTypeCta,
          sortBy: isOnlineConsultMode
            ? string.doctor_search_listing.avaliablity
            : string.doctor_search_listing.location,
        });
      }
    }
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
        isOnlineConsultMode={isOnlineConsultMode}
        postEventClickSelectLocation={postEventClickSelectLocation}
      />
    );
  };

  const renderPackages = () => {
    return (
      <View>
        <SectionHeaderComponent
          sectionTitle={
            purchasedPackage.length > 0
              ? string.consultPackages.morePackagesForYour
              : string.consultPackages.packagesAndPlans
          }
          style={styles.morePackageForYourHeader}
        />
        <ScrollView
          horizontal
          bounces={false}
          style={styles.packageList}
          showsHorizontalScrollIndicator={false}
        >
          {packages?.map((pkg: any) => (
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate(AppRoutes.ConsultPackageDetail, {
                  planId: pkg?.PackageIdentifier,
                  isOneTap:
                    pkg?.PackagePlanDetails?.length > 0 &&
                    pkg?.PackagePlanDetails[0]?.PackagePlanIsOneTap,
                });

                let eventAttributes = {
                  'Patient name': `${g(currentPatient, 'firstName')} ${g(
                    currentPatient,
                    'lastName'
                  )}`,
                  'Patient UHID': g(currentPatient, 'uhid'),
                  Relation: g(currentPatient, 'relation'),
                  'Patient age': Math.round(
                    moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
                  ),
                  'Patient gender': g(currentPatient, 'gender'),
                  'Mobile Number': g(currentPatient, 'mobileNumber'),
                  'New user': !currentPatient?.isConsulted,
                  'Selling Source': 'banner',
                  'Package Name': pkg?.PackageIdentifier,
                };

                postCleverTapEvent(CleverTapEventName.CONSULT_PACKAGE_CLICKED, eventAttributes);
              }}
            >
              <Image
                resizeMode={'stretch'}
                style={styles.packageBanner}
                source={{ uri: pkg?.PackageSpecialityBanner }}
              />
            </TouchableOpacity>
          ))}
          <Button
            title={string.consultPackages.viewALL}
            style={styles.viewAllBtn}
            onPress={() => {
              props.navigation.navigate(AppRoutes.ConsultPackageList);
            }}
          />
        </ScrollView>
      </View>
    );
  };

  const renderMySpecialtyPackage = (pkg: any) => {
    return (
      <TouchableOpacity
        style={styles.mySpecialtyPackageContainer}
        onPress={() => {
          props.navigation.navigate(AppRoutes.ConsultPackagePostPurchase, {
            planId: pkg?.packageId,
            onSubscriptionCancelled: () => {
              props.navigation.goBack();
            },
          });
        }}
      >
        {/* bg image  */}
        <ImageBackground source={{ uri: pkg?.banner }} style={styles.bannerBackground}>
          <Text style={styles.packageTitle}>{pkg?.name} </Text>
        </ImageBackground>
        <View style={styles.myPkgView}>
          <View style={styles.packageInfoContainer}>
            <Text style={styles.consultationBookedTitle}>
              {string.consultPackages.bookedConsult}
            </Text>
            <Text style={styles.consultationBooked}>{pkg?.booked || 0}</Text>
          </View>
          <View style={styles.vericalSeparator} />
          <View style={styles.packageInfoContainer}>
            <Text style={styles.validTillTitle}>{string.consultPackages.validTill}</Text>
            <Text style={styles.validTill}>{moment(pkg?.validTill).format('D MMM YYYY')} </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPurchasedPackage = () => {
    return (
      <View>
        <SectionHeaderComponent
          sectionTitle={string.consultPackages.myPackages}
          style={styles.pkgSectionHeader}
        />
        {purchasedPackage?.map((pkg) => renderMySpecialtyPackage(pkg))}
      </View>
    );
  };

  const renderRemainingSpecialities = () => {
    if (
      TopSpecialities &&
      TopSpecialities.length > 0 &&
      displaySpeialist &&
      searchText.length < 3
    ) {
      return (
        <View style={{ flexDirection: 'row', marginLeft: 20, flexWrap: 'wrap', marginBottom: 20 }}>
          {TopSpecialities.slice(4).map((item, index) => {
            return (
              <Mutation<saveSearch> mutation={SAVE_SEARCH}>
                {(mutate, { loading, data, error }) => renderSpecialityCard(item, index)}
              </Mutation>
            );
          })}
        </View>
      );
    }
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
                    {searchText?.length < 3 && oneTapPackage && renderOneTapPackage()}
                    {searchText?.length < 3 &&
                      !!packages?.length &&
                      !purchasedPackage?.length &&
                      renderPackages()}
                    {renderTopSpecialities()}
                    {searchText?.length < 3 &&
                      !!purchasedPackage?.length &&
                      renderPurchasedPackage()}
                    {searchText?.length < 3 &&
                      !!packages?.length &&
                      !!purchasedPackage?.length &&
                      renderPackages()}
                    {renderRemainingSpecialities()}
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
