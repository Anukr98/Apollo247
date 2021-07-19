import { filterDataType } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearchListing';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  AccountCircleDarkIcon,
  BloodIcon,
  HeightIcon,
  WeightIcon,
  ArrowRight,
  HealthConditionPhrIcon,
  LabTestIcon,
  ClinicalDocumentPhrIcon,
  PrescriptionPhrIcon,
  BillPhrIcon,
  InsurancePhrIcon,
  HospitalPhrIcon,
  CrossPopup,
  DropdownGreen,
  PhrArrowRightIcon,
  PhrSearchIcon,
  PrescriptionPhrSearchIcon,
  LabTestPhrSearchIcon,
  BillPhrSearchIcon,
  InsurancePhrSearchIcon,
  HospitalPhrSearchIcon,
  HealthConditionPhrSearchIcon,
  Vaccination,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { CommonBugFender, isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_PAST_CONSULTS_PRESCRIPTIONS,
  UPDATE_PATIENT_MEDICAL_PARAMETERS,
  GET_PRISM_AUTH_TOKEN,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getPrismAuthTokenVariables,
  getPrismAuthToken,
} from '@aph/mobile-patients/src/graphql/types/getPrismAuthToken';
import { BloodGroups, MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import {
  getPatientPastConsultsAndPrescriptions,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults as ConsultsType,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders as medicineOrders,
} from '@aph/mobile-patients/src/graphql/types/getPatientPastConsultsAndPrescriptions';
import {
  g,
  handleGraphQlError,
  postWebEngageEvent,
  phrSortByDate,
  isValidSearch,
  HEALTH_CONDITIONS_TITLE,
  getPhrHighlightText,
  phrSearchWebEngageEvents,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Keyboard,
  TextInput,
  Platform,
  FlatList,
  Dimensions,
  BackHandler,
} from 'react-native';
import { SearchHealthRecordCard } from '@aph/mobile-patients/src/components/HealthRecords/Components/SearchHealthRecordCard';
import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import { searchPHRApiWithAuthToken } from '@aph/mobile-patients/src/helpers/apiCalls';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { NavigationScreenProps } from 'react-navigation';
import {
  getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_healthChecks_response,
  getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults_response,
  getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_prescriptions_response,
} from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords_V2';
import { getPatientPrismMedicalRecordsApi } from '@aph/mobile-patients/src/helpers/clientCalls';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import _ from 'lodash';
import { ListItem, Overlay } from 'react-native-elements';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { navigateToHome } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { renderHealthRecordShimmer } from '@aph/mobile-patients/src/components/ui/ShimmerFactory';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: '#E5E5E5',
  },
  filterViewStyle: {
    height: 60,
    ...theme.viewStyles.lightSeparatorStyle,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hiTextStyle: {
    marginLeft: 20,
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  nameTextContainerStyle: {
    maxWidth: '75%',
  },
  nameTextStyle: {
    marginLeft: 5,
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  seperatorStyle: {
    height: 2,
    backgroundColor: '#00b38e',
    marginHorizontal: 5,
    marginBottom: 6,
    marginRight: -5,
  },
  descriptionTextStyle: {
    marginTop: 8,
    marginBottom: 16,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  notifyUsersTextStyle: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.SKY_BLUE,
    fontWeight: '500',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  selectedMemberTextStyle: {
    ...theme.viewStyles.text('B', isIphone5s() ? 11 : 13, '#FC9916', 1, 24),
    marginLeft: 8,
  },
  userHeightTextStyle: {
    ...theme.viewStyles.text('SB', 16, theme.colors.LIGHT_BLUE, 1, 20.8),
    paddingLeft: 10,
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
  },
  userBloodTextStyle: {
    ...theme.viewStyles.text('R', 12, '#00B38E', 1, 16),
  },
  profileDetailsMainViewStyle: {
    backgroundColor: '#FFFFFF',
    paddingTop: 26,
    paddingHorizontal: 18,
    paddingBottom: 70,
  },
  profileDetailsCardView: {
    ...theme.viewStyles.cardViewStyle,
    width: '100%',
    position: 'absolute',
    alignSelf: 'center',
    bottom: -22,
  },
  profileDetailsViewStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 18,
    marginLeft: 22,
    marginRight: 25,
  },
  heightWeightViewStyle: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  separatorLineStyle: {
    width: 0.5,
    backgroundColor: 'rgba(2,71,91,0.2)',
    marginHorizontal: 10,
    marginBottom: 0,
  },
  listItemTitleStyle: {
    ...theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE, 1, 21),
    paddingHorizontal: 6,
    paddingLeft: 14,
  },
  listItemViewStyle: {
    paddingLeft: 0,
    paddingRight: 3,
    marginTop: 7,
    borderBottomColor: 'rgba(2,71,91,0.2)',
    borderBottomWidth: 0.5,
  },
  listItemCardStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 11,
    paddingLeft: 18,
    paddingRight: 25,
  },
  clinicalDocumentViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 11,
    paddingLeft: 18,
    paddingRight: 25,
    marginBottom: 50,
    marginHorizontal: 20,
  },
  phrOverlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  phrUploadOptionsViewStyle: {
    backgroundColor: '#F7F8F5',
    paddingHorizontal: 29,
    borderRadius: 10,
    paddingVertical: 34,
  },
  overlayViewStyle: {
    width: '100%',
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  overlaySafeAreaViewStyle: {
    flex: 1,
    backgroundColor: 'transparent',
    marginHorizontal: 20,
  },
  updateTitleTextStyle: {
    ...theme.viewStyles.text('R', 12, '#00B38E', 1, 16),
    textAlign: 'center',
  },
  menuContainerStyle: {
    alignItems: 'flex-end',
    marginTop: 60,
    marginLeft: -40,
  },
  itemTextStyle: {
    ...theme.viewStyles.text('M', 16, '#01475b'),
    paddingHorizontal: 0,
  },
  selectedTextStyle: {
    ...theme.viewStyles.text('M', 16, '#00b38e'),
    alignSelf: 'flex-start',
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    paddingTop: 0,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  placeholderTextStyle: {
    textAlign: 'center',
    alignSelf: 'center',
    ...theme.viewStyles.text('SB', 36, '#01475b', 1, 46.8),
  },
  textInputTextStyle: {
    paddingBottom: 0,
    paddingTop: Platform.OS === 'ios' ? 13 : 8.5,
    width: '73%',
  },
  kgsTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SHERPA_BLUE,
    marginLeft: 10,
  },
  overlayMainViewStyle: {
    width: 160,
    marginBottom: 37,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 26,
    backgroundColor: '#FFFFFF',
  },
  closeIconViewStyle: {
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  profileNameTextStyle: { ...theme.viewStyles.text('SB', 36, theme.colors.LIGHT_BLUE, 1, 47) },
  moreHealthViewStyle: { marginHorizontal: 20, marginBottom: 39 },
  profileNameViewStyle: { flexDirection: 'row', alignItems: 'center' },
  notificationViewStyle: {
    backgroundColor: '#00B38E',
    borderRadius: 10,
    justifyContent: 'center',
    height: 15,
  },
  notificationMainViewStyle: { flexDirection: 'row', alignItems: 'center' },
  notificationCountTextStyle: {
    ...theme.viewStyles.text('M', 10, '#FFFFFF', 1, 13),
    paddingHorizontal: 6,
  },
  errorPopupViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    paddingTop: 28,
    paddingLeft: 33,
    paddingRight: 24,
    paddingBottom: 21,
    borderRadius: 2,
  },
  uhHoTextStyle: { ...theme.viewStyles.text('SB', 18, '#000000', 1, 23.4) },
  validTextStyle: { ...theme.viewStyles.text('M', 13, '#880200', 1, 16.9), marginTop: 16 },
  errorOKTextStyle: {
    ...theme.viewStyles.text('M', 13, '#0B8178', 1, 16.9),
    marginTop: 16,
    textAlign: 'right',
  },
  textInputStyle: {
    ...theme.viewStyles.text('R', 14, theme.colors.SHERPA_BLUE, 1, 18),
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 1,
  },
  searchBarMainViewStyle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  searchBarViewStyle: {
    backgroundColor: theme.colors.CARD_BG,
    flexDirection: 'row',
    padding: 10,
    flex: 1,
    alignItems: 'center',
    borderRadius: 5,
  },
  cancelTextStyle: {
    ...theme.viewStyles.text('M', 12, theme.colors.SKY_BLUE, 1, 15.6),
    marginLeft: 18,
  },
  healthRecordTypeTextStyle: {
    ...theme.viewStyles.text('R', 12, theme.colors.SILVER_LIGHT, 1, 21),
    marginHorizontal: 13,
  },
  healthRecordTypeViewStyle: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  searchListHeaderViewStyle: { marginHorizontal: 17, marginVertical: 15 },
  searchListHeaderTextStyle: { ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE, 1, 21) },
  loaderViewStyle: { justifyContent: 'center', flex: 1, alignItems: 'center' },
  loaderStyle: { height: 100, backgroundColor: 'transparent', alignSelf: 'center' },
  phrNodataMainViewStyle: { marginTop: 59, backgroundColor: 'transparent' },
});

type BloodGroupArray = {
  key: BloodGroups;
  title: string;
};

type HeightArray = {
  key: string;
  title: string;
};

const bloodGroupArray: BloodGroupArray[] = [
  { key: BloodGroups.APositive, title: 'A+' },
  { key: BloodGroups.ANegative, title: 'A-' },
  { key: BloodGroups.BPositive, title: 'B+' },
  { key: BloodGroups.BNegative, title: 'B-' },
  { key: BloodGroups.ABPositive, title: 'AB+' },
  { key: BloodGroups.ABNegative, title: 'AB-' },
  { key: BloodGroups.OPositive, title: 'O+' },
  { key: BloodGroups.ONegative, title: 'O-' },
];

enum HEIGHT_ARRAY {
  CM = 'cm',
  FT = 'ft',
}

const heightArray: HeightArray[] = [
  { key: HEIGHT_ARRAY.CM, title: HEIGHT_ARRAY.CM },
  { key: HEIGHT_ARRAY.FT, title: HEIGHT_ARRAY.FT },
];

export interface HealthRecordsHomeProps extends NavigationScreenProps {
  movedFrom?: string;
}

export const HealthRecordsHome: React.FC<HealthRecordsHomeProps> = (props) => {
  const [healthChecksNew, setHealthChecksNew] = useState<
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_healthChecks_response | null)[]
    | null
    | undefined
  >([]);
  const [labResults, setLabResults] = useState<
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_labResults_response | null)[]
    | null
    | undefined
  >([]);
  const [prescriptions, setPrescriptions] = useState<
    | (getPatientPrismMedicalRecords_V2_getPatientPrismMedicalRecords_V2_prescriptions_response | null)[]
    | null
    | undefined
  >([]);

  const movedFrom = props.navigation.getParam('movedFrom');
  const [testAndHealthCheck, setTestAndHealthCheck] = useState<{ type: string; data: any }[]>();
  const { loading, setLoading } = useUIElements();
  const [prismdataLoader, setPrismdataLoader] = useState<boolean>(false);
  const [pastDataLoader, setPastDataLoader] = useState<boolean>(false);
  const [arrayValues, setarrayValues] = useState<any>([]);
  const client = useApolloClient();
  const { getPatientApiCall } = useAuth();
  const { phrNotificationData, setPhrNotificationData } = useAppCommonData();
  const { currentPatient } = useAllCurrentPatients();
  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>();
  const [displayAddProfile, setDisplayAddProfile] = useState<boolean>(false);
  const [callApi, setCallApi] = useState(true);
  const [callPrescriptionApi, setCallPrescriptionApi] = useState(false);
  const [callTestReportApi, setCallTestReportApi] = useState(false);
  const [updatePatientDetailsApi, setUpdatePatientDetailsApi] = useState(true);
  const [showUpdateProfilePopup, setShowUpdateProfilePopup] = useState(false);
  const [showUpdateProfileErrorPopup, setShowUpdateProfileErrorPopup] = useState(false);
  const [currentUpdatePopupId, setCurrentUpdatePopupId] = useState(0);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isSearchFocus, SetIsSearchFocus] = useState(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const _searchInputRef = useRef(null);
  const [healthRecordSearchResults, setHealthRecordSearchResults] = useState<any>([]);
  const [prismAuthToken, setPrismAuthToken] = useState<string>('');
  const [errorPopupText, setErrorPopupText] = useState<string>(
    string.common.error_enter_number_text
  );
  const [selectedBloodGroupArray, setSelectedBloodGroupArray] = useState<BloodGroupArray[]>(
    bloodGroupArray
  );
  const [heightArrayValue, setHeightArrayValue] = useState<HEIGHT_ARRAY | string>(HEIGHT_ARRAY.CM);
  const [bloodGroup, setBloodGroup] = useState<BloodGroupArray>();
  const [overlaySpinner, setOverlaySpinner] = useState(false);
  const [searchQuery, setSearchQuery] = useState({});
  const isHeightAvailable =
    currentPatient?.patientMedicalHistory?.height &&
    currentPatient?.patientMedicalHistory?.height !== 'No Idea' &&
    currentPatient?.patientMedicalHistory?.height !== 'Not Recorded';
  const isWeightAvailable =
    currentPatient?.patientMedicalHistory?.weight &&
    currentPatient?.patientMedicalHistory?.weight !== 'No Idea' &&
    currentPatient?.patientMedicalHistory?.weight !== 'Not Recorded';

  useEffect(() => {
    currentPatient && setProfile(currentPatient!);
    if (!currentPatient) {
      getPatientApiCall();
    }
    setPatientHistoryValues();
  }, [currentPatient]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const handleBack = () => {
    navigateToHome(props.navigation, {}, movedFrom === 'deeplink');
    return true;
  };

  useEffect(() => {
    if (currentPatient) {
      getAuthToken();
    }
  }, [currentPatient]);

  const getAuthToken = async () => {
    client
      .query<getPrismAuthToken, getPrismAuthTokenVariables>({
        query: GET_PRISM_AUTH_TOKEN,
        fetchPolicy: 'no-cache',
        variables: {
          uhid: currentPatient?.uhid || '',
        },
      })
      .then(({ data }) => {
        const prism_auth_token = g(data, 'getPrismAuthToken', 'response');
        if (prism_auth_token) {
          setPrismAuthToken(prism_auth_token);
        }
      })
      .catch((e) => {
        CommonBugFender('HealthRecordsHome_GET_PRISM_AUTH_TOKEN', e);
      });
  };

  useEffect(() => {
    if (prismdataLoader || pastDataLoader) {
      setPageLoading!(true);
    } else {
      setPageLoading!(false);
    }
  }, [prismdataLoader, pastDataLoader]);

  const setPatientHistoryValues = () => {
    setHeight(isHeightAvailable ? currentPatient?.patientMedicalHistory?.height : '');
    setWeight(isWeightAvailable ? currentPatient?.patientMedicalHistory?.weight : '');
    setBloodGroup(
      currentPatient?.patientMedicalHistory?.bloodGroup
        ? {
            key: getBloodGroupValue(
              currentPatient?.patientMedicalHistory?.bloodGroup
            ) as BloodGroups,
            title: getBloodGroupValue(
              currentPatient?.patientMedicalHistory?.bloodGroup?.toString()
            ),
          }
        : undefined
    );
  };

  const fetchPastData = (filters: filterDataType[] = []) => {
    const filterArray = [];
    const selectedOptions =
      filters.length > 0 && filters[0].selectedOptions ? filters[0].selectedOptions : [];
    if (selectedOptions.includes('Online')) filterArray.push('ONLINE');
    if (selectedOptions.includes('Physical')) filterArray.push('PHYSICAL');
    if (selectedOptions.includes('All Consults')) {
      !filterArray.includes('ONLINE') && filterArray.push('ONLINE');
      !filterArray.includes('PHYSICAL') && filterArray.push('PHYSICAL');
    }
    setPastDataLoader(true);
    client
      .query<getPatientPastConsultsAndPrescriptions>({
        query: GET_PAST_CONSULTS_PRESCRIPTIONS,
        fetchPolicy: 'no-cache',
        variables: {
          consultsAndOrdersInput: {
            patient: currentPatient?.id || '',
            filter: filterArray,
          },
        },
      })
      .then((_data) => {
        const consults = _data?.data?.getPatientPastConsultsAndPrescriptions?.consults || [];
        const medOrders = _data?.data?.getPatientPastConsultsAndPrescriptions?.medicineOrders || [];
        const consultsAndMedOrders: { [key: string]: any } = {};
        consults.forEach((c) => {
          consultsAndMedOrders[c!.bookingDate] = {
            ...consultsAndMedOrders[c!.bookingDate],
            ...c,
          };
        });
        medOrders.forEach((c) => {
          consultsAndMedOrders[c!.quoteDateTime] = {
            ...consultsAndMedOrders[c!.quoteDateTime],
            ...c,
          };
        });
        const array = Object.keys(consultsAndMedOrders)
          .map((i) => consultsAndMedOrders[i])
          .sort(
            (a: any, b: any) =>
              moment(b.bookingDate || b.quoteDateTime)
                .toDate()
                .getTime() -
              moment(a.bookingDate || a.quoteDateTime)
                .toDate()
                .getTime()
          )
          .filter(
            (i) =>
              (!i.patientId && (i.prescriptionImageUrl || i.prismPrescriptionFileId)) || i.patientId
          );
        setarrayValues(array);
      })
      .catch((e) => {
        CommonBugFender('HealthRecordsHome_fetchPastData', e);
      })
      .finally(() => setPastDataLoader(false));
  };

  const getBloodGroupValue = (bloodGroup: BloodGroups) => {
    switch (bloodGroup) {
      case BloodGroups.APositive:
        return 'A+';
      case BloodGroups.ANegative:
        return 'A-';
      case BloodGroups.BPositive:
        return 'B+';
      case BloodGroups.BNegative:
        return 'B-';
      case BloodGroups.ABPositive:
        return 'AB+';
      case BloodGroups.ABNegative:
        return 'AB-';
      case BloodGroups.OPositive:
        return 'O+';
      case BloodGroups.ONegative:
        return 'O-';
    }
  };

  const fetchPrescriptionAndTestReportData = useCallback(() => {
    setPrismdataLoader(true);
    getPatientPrismMedicalRecordsApi(client, currentPatient?.id, [
      MedicalRecordType.PRESCRIPTION,
      MedicalRecordType.TEST_REPORT,
      MedicalRecordType.HEALTHCHECK,
    ])
      .then((data: any) => {
        const labResultsData = g(
          data,
          'getPatientPrismMedicalRecords_V2',
          'labResults',
          'response'
        );
        const prescriptionsData = g(
          data,
          'getPatientPrismMedicalRecords_V2',
          'prescriptions',
          'response'
        );
        const healthChecksData = g(
          data,
          'getPatientPrismMedicalRecords_V2',
          'healthChecks',
          'response'
        );
        tabsClickedWebEngageEvent(WebEngageEventName.PHR_LOAD_HEALTH_RECORDS);
        setLabResults(labResultsData);
        setPrescriptions(prescriptionsData);
        setHealthChecksNew(healthChecksData);
      })
      .catch((error) => {
        CommonBugFender('HealthRecordsHome_fetchTestData', error);
        currentPatient && handleGraphQlError(error);
      })
      .finally(() => setPrismdataLoader(false));
  }, [currentPatient]);

  const fetchTestReportsData = useCallback(() => {
    setPrismdataLoader(true);
    getPatientPrismMedicalRecordsApi(client, currentPatient?.id, [
      MedicalRecordType.TEST_REPORT,
      MedicalRecordType.HEALTHCHECK,
    ])
      .then((data: any) => {
        const labResultsData = g(
          data,
          'getPatientPrismMedicalRecords_V2',
          'labResults',
          'response'
        );
        const healthChecksData = g(
          data,
          'getPatientPrismMedicalRecords_V2',
          'healthChecks',
          'response'
        );
        setLabResults(labResultsData);
        setHealthChecksNew(healthChecksData);
      })
      .catch((error) => {
        CommonBugFender('HealthRecordsHome_fetchTestReportsData', error);
        currentPatient && handleGraphQlError(error);
      })
      .finally(() => setPrismdataLoader(false));
  }, []);

  const fetchPrescriptionData = useCallback(() => {
    setPrismdataLoader(true);
    getPatientPrismMedicalRecordsApi(client, currentPatient?.id, [MedicalRecordType.PRESCRIPTION])
      .then((data: any) => {
        const prescriptionsData = g(
          data,
          'getPatientPrismMedicalRecords_V2',
          'prescriptions',
          'response'
        );
        setPrescriptions(prescriptionsData);
      })
      .catch((error) => {
        CommonBugFender('HealthRecordsHome_fetchPrescriptionData', error);
        currentPatient && handleGraphQlError(error);
      })
      .finally(() => setPrismdataLoader(false));
  }, []);

  useEffect(() => {
    if (updatePatientDetailsApi) {
      setPastDataLoader(true);
      setPrismdataLoader(true);
      fetchPastData();
      fetchPrescriptionAndTestReportData();
    }
  }, [currentPatient, updatePatientDetailsApi]);

  useEffect(() => {
    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      if (callApi) {
        fetchPastData();
        fetchPrescriptionAndTestReportData();
      } else if (callPrescriptionApi) {
        fetchPrescriptionData();
      } else if (callTestReportApi) {
        fetchTestReportsData();
      }
    });
    const didBlurSubsription = props.navigation.addListener('didBlur', (payload) => {
      setCallApi(true);
      setCallPrescriptionApi(false);
      setCallTestReportApi(false);
      setPhrNotificationData && setPhrNotificationData(null);
    });
    return () => {
      didFocusSubscription && didFocusSubscription.remove();
      didBlurSubsription && didBlurSubsription.remove();
    };
  }, [props.navigation, currentPatient, callApi, callTestReportApi, callPrescriptionApi]);

  useEffect(() => {
    let mergeArray: { type: string; data: any }[] = [];
    labResults?.forEach((c) => {
      mergeArray.push({ type: 'testReports', data: c });
    });
    healthChecksNew?.forEach((c) => {
      mergeArray.push({ type: 'healthCheck', data: c });
    });
    setTestAndHealthCheck(phrSortByDate(mergeArray));
  }, [labResults, healthChecksNew]);

  const tabsClickedWebEngageEvent = (webEngageEventName: WebEngageEventName) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.MEDICAL_RECORDS] = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(moment().diff(currentPatient.dateOfBirth, 'years', true)),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(webEngageEventName, eventAttributes);
  };

  const updateMedicalParametersWebEngageEvents = (
    webEngageEventName: WebEngageEventName,
    type: string,
    value: string
  ) => {
    const eventAttributes = {
      type,
      value,
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(moment().diff(currentPatient.dateOfBirth, 'years', true)),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(webEngageEventName, eventAttributes);
  };

  const updateMedicalParameters = (height: string, weight: string, bloodGroup: string) => {
    Keyboard.dismiss();
    if (currentPatient?.id) {
      setOverlaySpinner(true);
      client
        .query({
          query: UPDATE_PATIENT_MEDICAL_PARAMETERS,
          variables: {
            patientMedicalParameters: {
              patientId: currentPatient?.id || '',
              height: height,
              weight: weight,
              bloodGroup: bloodGroup,
            },
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          getPatientApiCall();
          setUpdatePatientDetailsApi(false);
          setTimeout(() => {
            setShowUpdateProfilePopup(false);
            setOverlaySpinner(false);
          }, 1800);
        })
        .catch((e) => {
          CommonBugFender('HealthRecordsHome_UPDATE_PATIENT_MEDICAL_PARAMETERS', e);
          setShowUpdateProfilePopup(false);
          setOverlaySpinner(false);
          loading && setLoading!(false);
        });
    }
  };

  const renderProfileImage = () => {
    return currentPatient?.photoUrl?.match(
      /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG|jpeg|JPEG)/
    ) ? (
      <Image
        source={{ uri: currentPatient?.photoUrl }}
        style={{ height: 30, width: 30, borderRadius: 15, marginTop: 8 }}
      />
    ) : (
      <AccountCircleDarkIcon
        style={{
          height: 36,
          width: 36,
          borderRadius: 18,
          marginTop: 5,
        }}
      />
    );
  };

  const renderHeader = () => {
    return (
      <Header
        title={'HEALTH RECORDS'}
        leftIcon={'homeIcon'}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={() => {
          setPhrNotificationData && setPhrNotificationData(null);
          navigateToHome(props.navigation);
        }}
      />
    );
  };

  const renderProfileDetailsView = () => {
    const separatorLineView = () => {
      return <View style={styles.separatorLineStyle} />;
    };

    const patientTextView = (text: string, style: any = {}) => {
      return (
        <Text
          numberOfLines={1}
          style={[styles.userHeightTextStyle, text === '-' && { paddingRight: 50 }, style]}
        >
          {text}
        </Text>
      );
    };

    const arrowRightIcon = () => {
      return <PhrArrowRightIcon style={{ width: 20, height: 20 }} />;
    };

    const renderProfileNameView = () => {
      if (pageLoading) {
        return renderHealthRecordShimmer();
      } else {
        return (
          <View style={styles.profileNameViewStyle}>
            <Text style={styles.profileNameTextStyle} numberOfLines={1}>
              {'hi ' + (currentPatient?.firstName?.toLowerCase() + '!') || ''}
            </Text>
            <DropdownGreen />
          </View>
        );
      }
    };

    return (
      <View style={styles.profileDetailsMainViewStyle}>
        <View style={{ flexDirection: 'row' }}>
          {renderProfileImage()}
          <View style={{ marginLeft: 8, flex: 1, marginRight: 18 }}>
            <ProfileList
              showProfilePic={true}
              navigation={props.navigation}
              saveUserChange={true}
              childView={renderProfileNameView()}
              listContainerStyle={{ marginLeft: 0, marginTop: 44 }}
              selectedProfile={profile}
              setDisplayAddProfile={(val) => setDisplayAddProfile(val)}
              onProfileChange={() => setUpdatePatientDetailsApi(true)}
              unsetloaderDisplay={true}
            ></ProfileList>
            <View>
              <Text style={{ ...theme.viewStyles.text('R', 18, '#67919D', 1, 21) }}>
                {moment(currentPatient?.dateOfBirth).format('DD MMM YYYY')}
                {'    |    '}
                {_.capitalize(currentPatient?.gender) || ''}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.profileDetailsCardView}>
          <View style={styles.profileDetailsViewStyle}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                setCurrentUpdatePopupId(1);
                setShowUpdateProfilePopup(true);
              }}
              style={{ flex: 1 }}
            >
              <View style={[styles.profileNameViewStyle, { paddingLeft: 30 }]}>
                <Text style={styles.userBloodTextStyle}>{'Height'}</Text>
                {arrowRightIcon()}
              </View>
              <View style={styles.heightWeightViewStyle}>
                <HeightIcon style={{ width: 14, height: 22.14 }} />
                {isHeightAvailable
                  ? patientTextView(
                      currentPatient?.patientMedicalHistory?.height?.includes('’') ||
                        currentPatient?.patientMedicalHistory?.height?.includes("'")
                        ? currentPatient?.patientMedicalHistory?.height
                        : currentPatient?.patientMedicalHistory?.height + ' cms',
                      { paddingLeft: 7 }
                    )
                  : patientTextView('-')}
              </View>
            </TouchableOpacity>
            {separatorLineView()}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                setCurrentUpdatePopupId(2);
                setShowUpdateProfilePopup(true);
              }}
              style={{ flex: 1 }}
            >
              <View style={[styles.profileNameViewStyle, { paddingLeft: 25 }]}>
                <Text style={styles.userBloodTextStyle}>{'Weight'}</Text>
                {arrowRightIcon()}
              </View>
              <View style={styles.heightWeightViewStyle}>
                <WeightIcon style={{ width: 14, height: 14, paddingBottom: 8 }} />
                {isWeightAvailable
                  ? patientTextView(
                      currentPatient?.patientMedicalHistory?.weight
                        ? currentPatient?.patientMedicalHistory?.weight + ' kgs'
                        : '-'
                    )
                  : patientTextView('-')}
              </View>
            </TouchableOpacity>
            {separatorLineView()}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                setCurrentUpdatePopupId(3);
                setShowUpdateProfilePopup(true);
              }}
              style={{ flex: 1 }}
            >
              <View style={[styles.profileNameViewStyle, { paddingLeft: 23 }]}>
                <Text style={styles.userBloodTextStyle}>{'Blood'}</Text>
                {arrowRightIcon()}
              </View>
              <View style={styles.heightWeightViewStyle}>
                <BloodIcon style={{ width: 14, height: 15.58 }} />
                {currentPatient?.patientMedicalHistory?.bloodGroup
                  ? patientTextView(
                      getBloodGroupValue(currentPatient?.patientMedicalHistory?.bloodGroup)
                    )
                  : patientTextView('-')}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const onBackArrowPressed = () => {
    setCallApi(false);
  };

  const onBackPrescriptionPressed = () => {
    setCallApi(false);
    setCallTestReportApi(false);
    setCallPrescriptionApi(true);
  };

  const onBackTestReportPressed = () => {
    setCallApi(false);
    setCallPrescriptionApi(false);
    setCallTestReportApi(true);
  };

  const renderListItemView = (title: string, id: number) => {
    const renderLeftAvatar = () => {
      switch (id) {
        case 1:
          return <PrescriptionPhrIcon style={{ height: 23, width: 20 }} />;
        case 2:
          return <LabTestIcon style={{ height: 21.3, width: 20 }} />;
        case 3:
          return <HospitalPhrIcon style={{ height: 23.3, width: 20 }} />;
        case 4:
          return <HealthConditionPhrIcon style={{ height: 24.94, width: 20 }} />;
        case 5:
          return <Vaccination style={{ height: 20, width: 20 }} />;
        case 6:
          return <BillPhrIcon style={{ height: 18.63, width: 24 }} />;
        case 7:
          return <InsurancePhrIcon style={{ height: 16.71, width: 20 }} />;
        case 8:
          return <ClinicalDocumentPhrIcon style={{ height: 27.92, width: 20 }} />;
      }
    };

    const onPressListItem = () => {
      switch (id) {
        case 1:
          tabsClickedWebEngageEvent(WebEngageEventName.PHR_CLICK_DOCTOR_CONSULTATIONS);
          props.navigation.navigate(AppRoutes.ConsultRxScreen, {
            consultArray: arrayValues,
            prescriptionArray: prescriptions,
            authToken: prismAuthToken,
            onPressBack: onBackArrowPressed,
            callPrescriptionsApi: onBackPrescriptionPressed,
          });
          break;
        case 2:
          tabsClickedWebEngageEvent(WebEngageEventName.PHR_CLICK_TEST_REPORTS);
          props.navigation.navigate(AppRoutes.TestReportScreen, {
            testReportsData: testAndHealthCheck,
            authToken: prismAuthToken,
            onPressBack: onBackArrowPressed,
            callTestReportsApi: onBackTestReportPressed,
          });
          break;
        case 3:
          tabsClickedWebEngageEvent(WebEngageEventName.PHR_CLICK_HOSPITALIZATIONS);
          props.navigation.navigate(AppRoutes.HospitalizationScreen, {
            authToken: prismAuthToken,
            onPressBack: onBackArrowPressed,
          });
          break;
        case 4:
          tabsClickedWebEngageEvent(WebEngageEventName.PHR_CLICK_HEALTH_CONDITIONS);
          props.navigation.navigate(AppRoutes.HealthConditionScreen, {
            authToken: prismAuthToken,
            onPressBack: onBackArrowPressed,
          });
          break;
        case 5:
          tabsClickedWebEngageEvent(WebEngageEventName.PHR_CLICK_VACCINATION);
          props.navigation.navigate(AppRoutes.VaccinationScreen, {
            authToken: prismAuthToken,
            onPressBack: onBackArrowPressed,
          });
          break;
        case 6:
          tabsClickedWebEngageEvent(WebEngageEventName.PHR_CLICK_BILLS);
          props.navigation.navigate(AppRoutes.BillScreen, {
            authToken: prismAuthToken,
            onPressBack: onBackArrowPressed,
          });
          break;
        case 7:
          tabsClickedWebEngageEvent(WebEngageEventName.PHR_CLICK_INSURANCES);
          props.navigation.navigate(AppRoutes.InsuranceScreen, {
            authToken: prismAuthToken,
            onPressBack: onBackArrowPressed,
          });
          break;
        case 8:
          props.navigation.navigate(AppRoutes.ClinicalDocumentScreen);
          break;
      }
    };

    const getNotificationCount = () => {
      switch (id) {
        case 1:
          return phrNotificationData?.Prescription || 0;
        case 2:
          return (phrNotificationData?.LabTest || 0) + (phrNotificationData?.HealthCheck || 0);
        case 3:
          return phrNotificationData?.Hospitalization || 0;
        case 4:
          return (
            (phrNotificationData?.Allergy || 0) +
            (phrNotificationData?.MedicalCondition || 0) +
            (phrNotificationData?.Medication || 0) +
            (phrNotificationData?.Restriction || 0)
          );
        case 5:
          return phrNotificationData?.Bill || 0;
        case 6:
          return phrNotificationData?.Insurance || 0;
        case 7:
          return 0;
      }
    };

    const renderRightElement = () => {
      return (
        <View style={styles.notificationMainViewStyle}>
          {getNotificationCount() !== 0 ? (
            <View style={styles.notificationViewStyle}>
              <Text style={styles.notificationCountTextStyle}>
                {getNotificationCount() + ' New'}
              </Text>
            </View>
          ) : null}
          <ArrowRight style={{ height: 24, width: 24 }} />
        </View>
      );
    };

    return (
      <ListItem
        title={title}
        titleProps={{ numberOfLines: 1 }}
        titleStyle={styles.listItemTitleStyle}
        pad={0}
        containerStyle={[
          styles.listItemViewStyle,
          (id === 7 || id === 5) && { borderBottomWidth: 0 },
        ]}
        underlayColor={'#FFFFFF'}
        activeOpacity={1}
        onPress={onPressListItem}
        leftAvatar={renderLeftAvatar()}
        rightAvatar={renderRightElement()}
      />
    );
  };

  const renderHealthCategoriesView = () => {
    return (
      <View style={{ marginTop: 54, marginHorizontal: 20, marginBottom: 25 }}>
        <Text style={{ ...theme.viewStyles.text('B', 18, theme.colors.LIGHT_BLUE, 1, 21) }}>
          {'Health Categories'}
        </Text>
        <View style={styles.listItemCardStyle}>
          {pageLoading
            ? renderHealthRecordShimmer()
            : renderListItemView('Doctor Consultations', 1)}
          {pageLoading ? renderHealthRecordShimmer() : renderListItemView('Test Reports', 2)}
          {renderListItemView('Hospitalization', 3)}
          {renderListItemView('Health Conditions', 4)}
          {renderListItemView('Vaccination', 5)}
        </View>
      </View>
    );
  };

  const renderBillsInsuranceView = () => {
    return (
      <View style={styles.moreHealthViewStyle}>
        <Text style={{ ...theme.viewStyles.text('B', 18, theme.colors.LIGHT_BLUE, 1, 21) }}>
          {'More From Health'}
        </Text>
        <View style={styles.listItemCardStyle}>
          {renderListItemView('Bills', 6)}
          {renderListItemView('Insurance', 7)}
        </View>
      </View>
    );
  };

  const renderClinicalDocumentsView = () => {
    return (
      <View style={styles.clinicalDocumentViewStyle}>
        {renderListItemView('Clinical Documents', 8)}
      </View>
    );
  };

  const renderBloodGroup = () => {
    const bloodGroupData = selectedBloodGroupArray.map((i) => {
      return { key: i.key, value: i.title };
    });
    return (
      <MaterialMenu
        options={bloodGroupData}
        selectedText={bloodGroup?.key?.toString() || ''}
        menuContainerStyle={styles.menuContainerStyle}
        itemContainer={{ height: 44.8, marginHorizontal: 12, width: 150 / 2 }}
        itemTextStyle={styles.itemTextStyle}
        selectedTextStyle={styles.selectedTextStyle}
        lastContainerStyle={{ borderBottomWidth: 0 }}
        bottomPadding={{ paddingBottom: 10 }}
        onPress={(selected) => {
          setBloodGroup({
            key: selected.key as BloodGroups,
            title: selected.value.toString(),
          });
        }}
      >
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <View style={styles.placeholderViewStyle}>
            <Text
              style={[
                styles.placeholderTextStyle,
                bloodGroup !== undefined ? null : styles.placeholderStyle,
              ]}
            >
              {bloodGroup !== undefined ? bloodGroup.title : 'Select'}
            </Text>
            <View style={[{ flex: 1, alignItems: 'flex-end', marginLeft: 22 }]}>
              <DropdownGreen />
            </View>
          </View>
        </View>
      </MaterialMenu>
    );
  };

  const renderHeightView = () => {
    const heightArrayData = heightArray?.map((i) => {
      return { key: i.key, value: i.title };
    });
    return (
      <View style={{ flexDirection: 'row' }}>
        <TextInputComponent
          conatinerstyles={styles.textInputTextStyle}
          placeholder={'Enter Height'}
          value={height}
          numberOfLines={1}
          keyboardType={'numbers-and-punctuation'}
          onChangeText={(text) => {
            setHeight(text);
          }}
        />
        <MaterialMenu
          options={heightArrayData}
          selectedText={heightArrayValue}
          menuContainerStyle={styles.menuContainerStyle}
          itemContainer={{ height: 44.8, marginHorizontal: 12, width: 150 / 2 }}
          itemTextStyle={styles.itemTextStyle}
          selectedTextStyle={styles.selectedTextStyle}
          lastContainerStyle={{ borderBottomWidth: 0 }}
          bottomPadding={{ paddingBottom: 0 }}
          onPress={(selected) => {
            setHeightArrayValue(selected?.key);
          }}
        >
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <View style={[styles.placeholderViewStyle, { marginLeft: 10 }]}>
              <Text style={[styles.placeholderTextStyle, { lineHeight: 36 }]}>
                {heightArrayValue}
              </Text>
              <View style={[{ flex: 1, alignItems: 'flex-end', marginLeft: 22 }]}>
                <DropdownGreen />
              </View>
            </View>
          </View>
        </MaterialMenu>
      </View>
    );
  };

  const formatWeightNumber = (value: string) => {
    let number =
      value.indexOf('.') === value.length - 1 ||
      value.indexOf('0', value.length - 1) === value.length - 1
        ? value
        : parseFloat(value);
    return number || 0;
  };

  const setWeightValue = (text: string) => {
    let format_number = formatWeightNumber(text);
    setWeight((format_number || '').toString());
  };

  const renderWeightView = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInputComponent
          placeholder={'Enter Weight'}
          value={weight}
          numberOfLines={1}
          maxLength={3}
          keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
          onChangeText={(text) => {
            setWeightValue(text);
          }}
        />
        <Text style={styles.kgsTextStyle}>{'Kgs'}</Text>
      </View>
    );
  };

  const renderCloseIcon = () => {
    return (
      <View style={styles.closeIconViewStyle}>
        <TouchableOpacity
          onPress={() => {
            setPatientHistoryValues();
            setShowUpdateProfilePopup(false);
          }}
        >
          <CrossPopup style={{ marginRight: 1, width: 28, height: 28 }} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderUpdateProfileDetailsPopup = () => {
    const title =
      currentUpdatePopupId === 1
        ? 'Update Height'
        : currentUpdatePopupId === 2
        ? 'Update Weight'
        : 'Update Blood Group';

    const onPressUpdate = () => {
      if (currentUpdatePopupId === 1) {
        if (heightArrayValue === HEIGHT_ARRAY.CM) {
          if (
            isNaN(Number(height)) ||
            !height ||
            !/^[0-9\.]*$/.test(height) ||
            (heightArrayValue === HEIGHT_ARRAY.CM && Number(height) >= 400)
          ) {
            setShowUpdateProfileErrorPopup(true);
            setErrorPopupText(string.common.error_enter_number_text);
          } else {
            updateMedicalParameters(
              height,
              currentPatient?.patientMedicalHistory?.weight,
              currentPatient?.patientMedicalHistory?.bloodGroup
            );
            isHeightAvailable
              ? updateMedicalParametersWebEngageEvents(
                  WebEngageEventName.PHR_UPDATE_HEIGHT,
                  'Height',
                  height
                )
              : updateMedicalParametersWebEngageEvents(
                  WebEngageEventName.PHR_ADD_HEIGHT,
                  'Height',
                  height
                );
          }
        } else {
          if (
            parseFloat(height) <= 0 ||
            !height ||
            (heightArrayValue === HEIGHT_ARRAY.FT &&
              !/^(\d{1,2})[\'’]?((\d)|([0-1][0-2]))?[\"”]?$/.test(height))
          ) {
            setShowUpdateProfileErrorPopup(true);
            setErrorPopupText('Please enter correct height(ft)');
          } else {
            updateMedicalParameters(
              height,
              currentPatient?.patientMedicalHistory?.weight,
              currentPatient?.patientMedicalHistory?.bloodGroup
            );
            isHeightAvailable
              ? updateMedicalParametersWebEngageEvents(
                  WebEngageEventName.PHR_UPDATE_HEIGHT,
                  'Height',
                  height
                )
              : updateMedicalParametersWebEngageEvents(
                  WebEngageEventName.PHR_ADD_HEIGHT,
                  'Height',
                  height
                );
          }
        }
      } else if (currentUpdatePopupId === 2) {
        if (parseFloat(weight) <= 0 || !weight) {
          setShowUpdateProfileErrorPopup(true);
        } else {
          updateMedicalParameters(
            currentPatient?.patientMedicalHistory?.height,
            weight,
            currentPatient?.patientMedicalHistory?.bloodGroup
          );
          isWeightAvailable
            ? updateMedicalParametersWebEngageEvents(
                WebEngageEventName.PHR_UPDATE_WEIGHT,
                'Weight',
                weight
              )
            : updateMedicalParametersWebEngageEvents(
                WebEngageEventName.PHR_ADD_WEIGHT,
                'Weight',
                weight
              );
        }
      } else {
        updateMedicalParameters(
          currentPatient?.patientMedicalHistory?.height,
          currentPatient?.patientMedicalHistory?.weight,
          bloodGroup?.key?.toString() || ''
        );
        currentPatient?.patientMedicalHistory?.bloodGroup
          ? updateMedicalParametersWebEngageEvents(
              WebEngageEventName.PHR_UPDATE_BLOOD_GROUP,
              'BloodGroup',
              bloodGroup?.title || ''
            )
          : updateMedicalParametersWebEngageEvents(
              WebEngageEventName.PHR_ADD_BLOOD_GROUP,
              'BloodGroup',
              bloodGroup?.title || ''
            );
      }
    };

    return (
      <Overlay
        onRequestClose={() => setShowUpdateProfilePopup(false)}
        isVisible={showUpdateProfilePopup}
        windowBackgroundColor={'rgba(0, 0, 0, 0.2)'}
        containerStyle={{ marginBottom: 0 }}
        fullScreen
        overlayStyle={styles.phrOverlayStyle}
      >
        <>
          {overlaySpinner ? <Spinner /> : null}
          <View style={styles.overlayViewStyle}>
            <View style={styles.overlaySafeAreaViewStyle}>
              {renderCloseIcon()}
              <View style={{ ...theme.viewStyles.cardViewStyle, paddingTop: 20 }}>
                <Text style={styles.updateTitleTextStyle}>{title}</Text>
                <View style={styles.overlayMainViewStyle}>
                  {currentUpdatePopupId === 3
                    ? renderBloodGroup()
                    : currentUpdatePopupId === 1
                    ? renderHeightView()
                    : renderWeightView()}
                  {renderErrorPopup()}
                  <Button
                    title={'UPDATE'}
                    onPress={onPressUpdate}
                    style={{ width: '100%', marginTop: 40 }}
                  />
                </View>
              </View>
            </View>
          </View>
        </>
      </Overlay>
    );
  };

  const renderErrorPopup = () => {
    return (
      <Overlay
        onRequestClose={() => setShowUpdateProfileErrorPopup(false)}
        isVisible={showUpdateProfileErrorPopup}
        windowBackgroundColor={'rgba(0, 0, 0, 0.2)'}
        containerStyle={{ marginBottom: 0 }}
        fullScreen
        overlayStyle={styles.phrOverlayStyle}
      >
        <View style={styles.overlayViewStyle}>
          <View style={styles.overlaySafeAreaViewStyle}>
            <View style={styles.errorPopupViewStyle}>
              <Text style={styles.uhHoTextStyle}>{string.common.uhOh}</Text>
              <Text style={styles.validTextStyle}>{errorPopupText}</Text>
              <Text
                style={styles.errorOKTextStyle}
                onPress={() => setShowUpdateProfileErrorPopup(false)}
              >
                {'OK'}
              </Text>
            </View>
          </View>
        </View>
      </Overlay>
    );
  };

  const onSearchHealthRecords = (_searchText: string) => {
    setSearchLoading(true);
    searchPHRApiWithAuthToken(_searchText, prismAuthToken)
      .then(({ data }) => {
        setHealthRecordSearchResults([]);
        if (data?.response) {
          const recordData = data.response;
          const finalData: any[] = [];
          recordData.forEach((recordData: any) => {
            const { healthrecordType } = recordData;
            switch (healthrecordType) {
              case 'PRESCRIPTION':
                finalData.push({ healthkey: MedicalRecordType.PRESCRIPTION, value: recordData });
                break;
              case 'LABTEST':
                finalData.push({ healthkey: MedicalRecordType.TEST_REPORT, value: recordData });
                break;
              case 'HOSPITALIZATION':
                finalData.push({ healthkey: MedicalRecordType.HOSPITALIZATION, value: recordData });
                break;
              case 'ALLERGY':
                finalData.push({ healthkey: MedicalRecordType.ALLERGY, value: recordData });
                break;
              case 'MEDICATION':
                finalData.push({ healthkey: MedicalRecordType.MEDICATION, value: recordData });
                break;
              case 'MEDICALCONDITION':
                finalData.push({
                  healthkey: MedicalRecordType.MEDICALCONDITION,
                  value: recordData,
                });
                break;
              case 'RESTRICTION':
                finalData.push({
                  healthkey: MedicalRecordType.HEALTHRESTRICTION,
                  value: recordData,
                });
                break;
              case 'INSURANCE':
                finalData.push({
                  healthkey: MedicalRecordType.MEDICALINSURANCE,
                  value: recordData,
                });
                break;
              case 'BILLS':
                finalData.push({ healthkey: MedicalRecordType.MEDICALBILL, value: recordData });
                break;
              case 'FAMILYHISTORY':
                finalData.push({ healthkey: MedicalRecordType.FAMILY_HISTORY, value: recordData });
                break;
            }
          });
          setHealthRecordSearchResults(finalData);
          setSearchLoading(false);
          phrSearchWebEngageEvents(
            WebEngageEventName.PHR_NO_OF_USERS_SEARCHED_GLOBAL,
            currentPatient,
            _searchText
          );
        } else {
          getAuthToken();
          setSearchLoading(false);
        }
      })
      .catch((error) => {
        CommonBugFender('HealthRecordsHome_searchPHRApiWithAuthToken', error);
        getAuthToken();
        setSearchLoading(false);
      });
  };

  const onCancelTextClick = () => {
    if (_searchInputRef.current) {
      setSearchText('');
      SetIsSearchFocus(false);
      _searchInputRef?.current?.clear();
      setHealthRecordSearchResults([]);
      Keyboard.dismiss();
    }
  };

  const onSearchTextChange = (value: string) => {
    SetIsSearchFocus(true);
    if (isValidSearch(value)) {
      setSearchText(value);
      if (!(value && value.length > 2)) {
        setHealthRecordSearchResults([]);
        return;
      }
      setSearchLoading(true);
      const search = _.debounce(onSearchHealthRecords, 500);
      setSearchQuery((prevSearch: any) => {
        if (prevSearch.cancel) {
          prevSearch.cancel();
        }
        return search;
      });
      search(value);
    }
  };

  const renderSearchLoader = () => {
    return (
      <View style={styles.loaderViewStyle}>
        <Spinner style={styles.loaderStyle} />
      </View>
    );
  };

  const renderSearchBar = () => {
    return (
      <View
        style={[
          styles.searchBarMainViewStyle,
          { backgroundColor: isSearchFocus ? 'rgba(0,0,0,0.05)' : 'transparent' },
        ]}
      >
        <View style={styles.searchBarViewStyle}>
          <PhrSearchIcon style={{ width: 20, height: 20 }} />
          <TextInput
            placeholder={'Search'}
            autoCapitalize={'none'}
            style={styles.textInputStyle}
            selectionColor={theme.colors.TURQUOISE_LIGHT_BLUE}
            numberOfLines={1}
            ref={_searchInputRef}
            onFocus={() => SetIsSearchFocus(true)}
            value={searchText}
            placeholderTextColor={theme.colors.placeholderTextColor}
            underlineColorAndroid={'transparent'}
            onChangeText={(value) => onSearchTextChange(value)}
          />
        </View>
        {isSearchFocus ? (
          <Text style={styles.cancelTextStyle} onPress={onCancelTextClick}>
            {'Cancel'}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderHealthRecordSearchItem = (item: any, index: number) => {
    const healthCardTopView = () => {
      switch (item?.healthkey) {
        case MedicalRecordType.PRESCRIPTION:
          return (
            <View style={styles.healthRecordTypeViewStyle}>
              <PrescriptionPhrSearchIcon style={{ width: 12, height: 13 }} />
              <Text style={styles.healthRecordTypeTextStyle} numberOfLines={1}>
                {'Doctor Consultations'}
              </Text>
            </View>
          );
        case MedicalRecordType.TEST_REPORT:
          return (
            <View style={styles.healthRecordTypeViewStyle}>
              <LabTestPhrSearchIcon style={{ width: 14, height: 15 }} />
              <Text style={styles.healthRecordTypeTextStyle} numberOfLines={1}>
                {'Test Reports'}
              </Text>
            </View>
          );
        case MedicalRecordType.HOSPITALIZATION:
          return (
            <View style={styles.healthRecordTypeViewStyle}>
              <HospitalPhrSearchIcon style={{ width: 13, height: 15.17 }} />
              <Text style={styles.healthRecordTypeTextStyle} numberOfLines={1}>
                {'Hospitalizations'}
              </Text>
            </View>
          );
        case MedicalRecordType.MEDICALBILL:
          return (
            <View style={styles.healthRecordTypeViewStyle}>
              <BillPhrSearchIcon style={{ width: 16, height: 13 }} />
              <Text style={styles.healthRecordTypeTextStyle} numberOfLines={1}>
                {'Bills'}
              </Text>
            </View>
          );
        case MedicalRecordType.MEDICALINSURANCE:
          return (
            <View style={styles.healthRecordTypeViewStyle}>
              <InsurancePhrSearchIcon style={{ width: 15.55, height: 13 }} />
              <Text style={styles.healthRecordTypeTextStyle} numberOfLines={1}>
                {'Insurance'}
              </Text>
            </View>
          );
        case MedicalRecordType.ALLERGY:
          return (
            <View style={styles.healthRecordTypeViewStyle}>
              <HealthConditionPhrSearchIcon style={{ width: 13, height: 16 }} />
              <Text style={styles.healthRecordTypeTextStyle} numberOfLines={1}>
                {'Health Conditions > Allergies'}
              </Text>
            </View>
          );
        case MedicalRecordType.MEDICATION:
          return (
            <View style={styles.healthRecordTypeViewStyle}>
              <HealthConditionPhrSearchIcon style={{ width: 13, height: 16 }} />
              <Text style={styles.healthRecordTypeTextStyle} numberOfLines={1}>
                {'Health Conditions > Medications'}
              </Text>
            </View>
          );
        case MedicalRecordType.HEALTHRESTRICTION:
          return (
            <View style={styles.healthRecordTypeViewStyle}>
              <HealthConditionPhrSearchIcon style={{ width: 13, height: 16 }} />
              <Text style={styles.healthRecordTypeTextStyle} numberOfLines={1}>
                {'Health Conditions > Health Restrictions'}
              </Text>
            </View>
          );
        case MedicalRecordType.MEDICALCONDITION:
          return (
            <View style={styles.healthRecordTypeViewStyle}>
              <HealthConditionPhrSearchIcon style={{ width: 13, height: 16 }} />
              <Text style={styles.healthRecordTypeTextStyle} numberOfLines={1}>
                {'Health Conditions > Medical Conditions'}
              </Text>
            </View>
          );
        case MedicalRecordType.FAMILY_HISTORY:
          return (
            <View style={styles.healthRecordTypeViewStyle}>
              <HealthConditionPhrSearchIcon style={{ width: 13, height: 16 }} />
              <Text style={styles.healthRecordTypeTextStyle} numberOfLines={1}>
                {'Health Conditions > Family History'}
              </Text>
            </View>
          );
      }
    };
    const dateText = `${moment(item?.value?.date).format('DD MMM YYYY')} - `;
    const healthMoreText = getPhrHighlightText(item?.value?.highlight || '');
    return (
      <SearchHealthRecordCard
        dateText={dateText}
        healthRecordTitle={item?.value?.title}
        healthRecordMoreText={healthMoreText}
        searchHealthCardTopView={healthCardTopView()}
        item={item}
        index={index}
        onSearchHealthCardPress={(item) => onClickSearchHealthCard(item)}
      />
    );
  };

  const onClickSearchHealthCard = (item: any) => {
    const { healthrecordId } = item?.value;
    switch (item?.healthkey) {
      case MedicalRecordType.PRESCRIPTION:
        const prescription_item = item?.value?.healthRecord
          ? JSON.parse(item?.value?.healthRecord || '{}')
          : {};
        return props.navigation.navigate(AppRoutes.HealthRecordDetails, {
          healthrecordId: healthrecordId,
          healthRecordType: MedicalRecordType.PRESCRIPTION,
          prescriptions: true,
          prescriptionSource: prescription_item?.source,
          onPressBack: onBackArrowPressed,
        });
      case MedicalRecordType.TEST_REPORT:
        return props.navigation.navigate(AppRoutes.TestReportViewScreen, {
          healthrecordId: healthrecordId,
          healthRecordType: MedicalRecordType.TEST_REPORT,
          labResults: true,
          onPressBack: onBackArrowPressed,
        });
      case MedicalRecordType.HOSPITALIZATION:
        return props.navigation.navigate(AppRoutes.HealthRecordDetails, {
          healthrecordId: healthrecordId,
          healthRecordType: MedicalRecordType.HOSPITALIZATION,
          hospitalization: true,
          onPressBack: onBackArrowPressed,
        });
      case MedicalRecordType.MEDICALBILL:
        return props.navigation.navigate(AppRoutes.HealthRecordDetails, {
          healthrecordId: healthrecordId,
          healthRecordType: MedicalRecordType.MEDICALBILL,
          medicalBill: true,
          onPressBack: onBackArrowPressed,
        });
      case MedicalRecordType.MEDICALINSURANCE:
        return props.navigation.navigate(AppRoutes.HealthRecordDetails, {
          healthrecordId: healthrecordId,
          healthRecordType: MedicalRecordType.MEDICALINSURANCE,
          medicalInsurance: true,
          onPressBack: onBackArrowPressed,
        });
      case MedicalRecordType.ALLERGY:
        return props.navigation.navigate(AppRoutes.HealthRecordDetails, {
          healthrecordId: healthrecordId,
          healthRecordType: MedicalRecordType.ALLERGY,
          healthCondition: true,
          healthHeaderTitle: HEALTH_CONDITIONS_TITLE.ALLERGY,
          onPressBack: onBackArrowPressed,
        });
      case MedicalRecordType.MEDICATION:
        return props.navigation.navigate(AppRoutes.HealthRecordDetails, {
          healthrecordId: healthrecordId,
          healthRecordType: MedicalRecordType.MEDICATION,
          healthCondition: true,
          healthHeaderTitle: HEALTH_CONDITIONS_TITLE.MEDICATION,
          onPressBack: onBackArrowPressed,
        });
      case MedicalRecordType.HEALTHRESTRICTION:
        return props.navigation.navigate(AppRoutes.HealthRecordDetails, {
          healthrecordId: healthrecordId,
          healthRecordType: MedicalRecordType.HEALTHRESTRICTION,
          healthCondition: true,
          healthHeaderTitle: HEALTH_CONDITIONS_TITLE.HEALTH_RESTRICTION,
          onPressBack: onBackArrowPressed,
        });
      case MedicalRecordType.MEDICALCONDITION:
        return props.navigation.navigate(AppRoutes.HealthRecordDetails, {
          healthrecordId: healthrecordId,
          healthRecordType: MedicalRecordType.MEDICALCONDITION,
          healthCondition: true,
          healthHeaderTitle: HEALTH_CONDITIONS_TITLE.MEDICAL_CONDITION,
          onPressBack: onBackArrowPressed,
        });
      case MedicalRecordType.FAMILY_HISTORY:
        return props.navigation.navigate(AppRoutes.HealthRecordDetails, {
          healthrecordId: healthrecordId,
          healthRecordType: MedicalRecordType.FAMILY_HISTORY,
          healthCondition: true,
          healthHeaderTitle: HEALTH_CONDITIONS_TITLE.FAMILY_HISTORY,
          onPressBack: onBackArrowPressed,
        });
    }
  };

  const searchListHeaderView = () => {
    const search_result_text =
      healthRecordSearchResults?.length === 1
        ? `${healthRecordSearchResults?.length} search result for \‘${searchText}\’`
        : `${healthRecordSearchResults?.length} search results for \‘${searchText}\’`;
    return (
      <View style={styles.searchListHeaderViewStyle}>
        <Text style={styles.searchListHeaderTextStyle}>{search_result_text}</Text>
      </View>
    );
  };

  const renderHealthRecordSearchResults = () => {
    return searchLoading ? (
      renderSearchLoader()
    ) : (
      <FlatList
        keyExtractor={(_, index) => `${index}`}
        bounces={false}
        data={healthRecordSearchResults}
        ListEmptyComponent={
          <PhrNoDataComponent mainViewStyle={styles.phrNodataMainViewStyle} phrSearchList />
        }
        ListHeaderComponent={searchListHeaderView}
        renderItem={({ item, index }) => renderHealthRecordSearchItem(item, index)}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderUpdateProfileDetailsPopup()}
        {renderHeader()}
        {renderSearchBar()}
        {searchText?.length > 2 ? (
          renderHealthRecordSearchResults()
        ) : (
          <ScrollView style={{ flex: 1 }} bounces={false}>
            {renderProfileDetailsView()}
            {renderHealthCategoriesView()}
            {renderBillsInsuranceView()}
            {/* PHR Phase 2 UI */}
            {/* {renderClinicalDocumentsView()} */}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
};
