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
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { CommonBugFender, isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_MEDICAL_PRISM_RECORD,
  GET_PAST_CONSULTS_PRESCRIPTIONS,
  UPDATE_PATIENT_MEDICAL_PARAMETERS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { BloodGroups } from '@aph/mobile-patients/src/graphql/types/globalTypes';
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
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
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
  TextInput,
} from 'react-native';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import {
  getPatientPrismMedicalRecords,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizationsNew_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecksNew_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalBills_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalInsurances_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalConditions_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medications_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthRestrictions_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_allergies_response,
} from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import _ from 'lodash';
import { ListItem, Overlay } from 'react-native-elements';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';

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
    marginTop: 16,
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
    borderBottomWidth: 2,
    paddingTop: 0,
    paddingBottom: 0,
    width: '70%',
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SHERPA_BLUE,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
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

export interface HealthRecordsHomeProps extends NavigationScreenProps {}

export const HealthRecordsHome: React.FC<HealthRecordsHomeProps> = (props) => {
  const [healthChecksNew, setHealthChecksNew] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecksNew_response | null)[]
    | null
    | undefined
  >([]);
  const [hospitalizationsNew, setHospitalizationsNew] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizationsNew_response | null)[]
    | null
    | undefined
  >([]);
  const [labResults, setLabResults] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response | null)[]
    | null
    | undefined
  >([]);
  const [prescriptions, setPrescriptions] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response | null)[]
    | null
    | undefined
  >([]);
  const [medicalBills, setMedicalBills] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalBills_response | null)[]
    | null
    | undefined
  >([]);
  const [medicalInsurance, setInsuranceBills] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalInsurances_response | null)[]
    | null
    | undefined
  >([]);
  const [medicalConditions, setMedicalConditions] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medicalConditions_response | null)[]
    | null
    | undefined
  >([]);
  const [medicalHealthRestrictions, setMedicalHealthRestrictions] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthRestrictions_response | null)[]
    | null
    | undefined
  >([]);
  const [medicalMedications, setMedicalMedications] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_medications_response | null)[]
    | null
    | undefined
  >([]);
  const [medicalAllergies, setMedicalAllergies] = useState<
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_allergies_response | null)[]
    | null
    | undefined
  >([]);
  const [healthConditions, setHealthConditions] = useState<any[] | null>(null);

  const [consultsData, setConsultsData] = useState<(ConsultsType | null)[] | null>(null);
  const [medicineOrders, setMedicineOrders] = useState<(medicineOrders | null)[] | null>(null);
  const [combination, setCombination] = useState<{ type: string; data: any }[]>();
  const [testAndHealthCheck, setTestAndHealthCheck] = useState<{ type: string; data: any }[]>();
  const { loading, setLoading } = useUIElements();
  const [prismdataLoader, setPrismdataLoader] = useState<boolean>(false);
  const [pastDataLoader, setPastDataLoader] = useState<boolean>(false);
  const [arrayValues, setarrayValues] = useState<any>();
  const client = useApolloClient();
  const { getPatientApiCall } = useAuth();
  const { currentPatient } = useAllCurrentPatients();
  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>();
  const [displayAddProfile, setDisplayAddProfile] = useState<boolean>(false);
  const [callApi, setCallApi] = useState(true);
  const [showUpdateProfilePopup, setShowUpdateProfilePopup] = useState(false);
  const [currentUpdatePopupId, setCurrentUpdatePopupId] = useState(0);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [selectedBloodGroupArray, setSelectedBloodGroupArray] = useState<BloodGroupArray[]>(
    bloodGroupArray
  );
  const [heightArrayValue, setHeightArrayValue] = useState<HEIGHT_ARRAY | string>(HEIGHT_ARRAY.CM);
  const [bloodGroup, setBloodGroup] = useState<BloodGroupArray>();
  const [overlaySpinner, setOverlaySpinner] = useState(false);

  useEffect(() => {
    currentPatient && setProfile(currentPatient!);
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);
  useEffect(() => {
    if (prismdataLoader || pastDataLoader) {
      !loading && setLoading!(true);
    } else {
      loading && setLoading!(false);
    }
  }, [prismdataLoader, pastDataLoader]);

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
            patient: currentPatient && currentPatient.id ? currentPatient.id : '',
            filter: filterArray,
          },
        },
      })
      .then((_data) => {
        const consults = _data.data.getPatientPastConsultsAndPrescriptions!.consults || [];
        const medOrders = _data.data.getPatientPastConsultsAndPrescriptions!.medicineOrders || [];
        const consultsAndMedOrders: { [key: string]: any } = {};
        setConsultsData(consults);
        setMedicineOrders(medOrders);
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
        const error = JSON.parse(JSON.stringify(e));
        console.log('Error occured while fetching Heath records', error);
      })
      .finally(() => setPastDataLoader(false));
  };

  const sortByDate = (array: { type: string; data: any }[]) => {
    return array.sort(({ data: data1 }, { data: data2 }) => {
      let date1 = new Date(data1.date || data1.bookingDate || data1.quoteDateTime);
      let date2 = new Date(data2.date || data2.bookingDate || data2.quoteDateTime);
      return date1 > date2 ? -1 : date1 < date2 ? 1 : data2.id - data1.id;
    });
  };

  const sortWithDate = (array: any) => {
    return array?.sort(
      (a: any, b: any) =>
        moment(b.date || b.billDateTime || b.startDateTime)
          .toDate()
          .getTime() -
        moment(a.date || a.billDateTime || a.startDateTime)
          .toDate()
          .getTime()
    );
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

  const fetchTestData = useCallback(() => {
    client
      .query<getPatientPrismMedicalRecords>({
        query: GET_MEDICAL_PRISM_RECORD,
        variables: {
          patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        const labResultsData = g(data, 'getPatientPrismMedicalRecords', 'labResults', 'response');
        const prescriptionsData = g(
          data,
          'getPatientPrismMedicalRecords',
          'prescriptions',
          'response'
        );
        const healthChecksNewData = g(
          data,
          'getPatientPrismMedicalRecords',
          'healthChecksNew',
          'response'
        );
        const hospitalizationsNewData = g(
          data,
          'getPatientPrismMedicalRecords',
          'hospitalizationsNew',
          'response'
        );
        const medicalBillsData = g(
          data,
          'getPatientPrismMedicalRecords',
          'medicalBills',
          'response'
        );
        const medicalInsuranceData = g(
          data,
          'getPatientPrismMedicalRecords',
          'medicalInsurances',
          'response'
        );
        const medicalConditionsData = g(
          data,
          'getPatientPrismMedicalRecords',
          'medicalConditions',
          'response'
        );
        const medicalHealthRestrictionsData = g(
          data,
          'getPatientPrismMedicalRecords',
          'healthRestrictions',
          'response'
        );
        const medicalMedicationsData = g(
          data,
          'getPatientPrismMedicalRecords',
          'medications',
          'response'
        );
        const medicalAllergiesData = g(
          data,
          'getPatientPrismMedicalRecords',
          'allergies',
          'response'
        );
        console.log('data', data);
        setLabResults(labResultsData);
        setPrescriptions(prescriptionsData);
        setHealthChecksNew(healthChecksNewData);
        setHospitalizationsNew(sortWithDate(hospitalizationsNewData));
        setMedicalBills(sortWithDate(medicalBillsData));
        setInsuranceBills(sortWithDate(medicalInsuranceData));
        setMedicalConditions(medicalConditionsData);
        setMedicalHealthRestrictions(medicalHealthRestrictionsData);
        setMedicalMedications(medicalMedicationsData);
        setMedicalAllergies(medicalAllergiesData);
      })
      .catch((error) => {
        CommonBugFender('HealthRecordsHome_fetchTestData', error);
        console.log('Error occured', { error });
        currentPatient && handleGraphQlError(error);
      })
      .finally(() => setPrismdataLoader(false));
  }, [currentPatient]);

  useEffect(() => {
    setPastDataLoader(true);
    setPrismdataLoader(true);
    fetchPastData();
    fetchTestData();
  }, [currentPatient]);

  useEffect(() => {
    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      if (callApi) {
        fetchPastData();
        fetchTestData();
      }
    });
    return () => {
      didFocusSubscription && didFocusSubscription.remove();
    };
  }, [props.navigation, currentPatient, callApi]);

  useEffect(() => {
    if (consultsData && medicineOrders && prescriptions) {
      let mergeArray: { type: string; data: any }[] = [];
      arrayValues?.forEach((item: any) => {
        item['myPrescriptionName'] = 'Prescription';
        mergeArray.push({ type: 'pastConsults', data: item });
      });
      prescriptions?.forEach((c) => {
        mergeArray.push({ type: 'prescriptions', data: c });
      });
      setCombination(sortByDate(mergeArray));
    }
  }, [arrayValues, prescriptions]);

  useEffect(() => {
    let mergeArray: { type: string; data: any }[] = [];
    labResults?.forEach((c) => {
      mergeArray.push({ type: 'testReports', data: c });
    });
    healthChecksNew?.forEach((c) => {
      mergeArray.push({ type: 'healthCheck', data: c });
    });
    setTestAndHealthCheck(sortByDate(mergeArray));
  }, [labResults, healthChecksNew]);

  useEffect(() => {
    const healthConditionsArray: any[] = [];
    medicalMedications?.forEach((medicationRecord: any) => {
      medicationRecord && healthConditionsArray.push(medicationRecord);
    });
    medicalConditions?.forEach((medicalConditionsRecord: any) => {
      medicalConditionsRecord && healthConditionsArray.push(medicalConditionsRecord);
    });
    medicalHealthRestrictions?.forEach((healthRestrictionRecord: any) => {
      healthRestrictionRecord && healthConditionsArray.push(healthRestrictionRecord);
    });
    medicalAllergies?.forEach((allergyRecord: any) => {
      allergyRecord && healthConditionsArray.push(allergyRecord);
    });
    const sortedData = sortWithDate(healthConditionsArray);
    setHealthConditions(sortedData);
  }, [medicalConditions, medicalHealthRestrictions, medicalMedications, medicalAllergies]);

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

  const updateMedicalParameters = (height: string, weight: string, bloodGroup: string) => {
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
          setBloodGroup(undefined);
          setHeight('');
          setWeight('');
          setShowUpdateProfilePopup(false);
          getPatientApiCall();
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          setOverlaySpinner(false);
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
        rightComponent={
          <ProfileList
            showProfilePic={true}
            navigation={props.navigation}
            saveUserChange={true}
            childView={renderProfileImage()}
            listContainerStyle={{ marginLeft: 6, marginTop: 44 }}
            selectedProfile={profile}
            setDisplayAddProfile={(val) => setDisplayAddProfile(val)}
            unsetloaderDisplay={true}
          ></ProfileList>
        }
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={() => {
          props.navigation.dispatch(
            StackActions.reset({
              index: 0,
              key: null,
              actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
            })
          );
        }}
      />
    );
  };

  const renderProfileDetailsView = () => {
    const separatorLineView = () => {
      return <View style={styles.separatorLineStyle} />;
    };

    const patientTextView = (text: string) => {
      return (
        <Text
          numberOfLines={1}
          style={[styles.userHeightTextStyle, text === '-' && { paddingRight: 50 }]}
        >
          {text}
        </Text>
      );
    };

    return (
      <View style={styles.profileDetailsMainViewStyle}>
        <View style={{ flexDirection: 'row' }}>
          {renderProfileImage()}
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.profileNameTextStyle} numberOfLines={1}>
              {'hi ' + (currentPatient?.firstName?.toLowerCase() + '!') || ''}
            </Text>
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
            <View style={{ flex: 1 }}>
              <View style={{ paddingLeft: 30 }}>
                <Text style={styles.userBloodTextStyle}>{'Height'}</Text>
              </View>
              <View style={styles.heightWeightViewStyle}>
                <HeightIcon style={{ width: 14, height: 22.14 }} />
                {currentPatient?.patientMedicalHistory?.height &&
                currentPatient?.patientMedicalHistory?.height !== 'No Idea' &&
                currentPatient?.patientMedicalHistory?.height !== 'Not Recorded' ? (
                  patientTextView(currentPatient?.patientMedicalHistory?.height || '')
                ) : (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      setCurrentUpdatePopupId(1);
                      setShowUpdateProfilePopup(true);
                    }}
                  >
                    {patientTextView('-')}
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {separatorLineView()}
            <View style={{ flex: 1 }}>
              <View style={{ paddingLeft: 25 }}>
                <Text style={styles.userBloodTextStyle}>{'Weight'}</Text>
              </View>
              <View style={styles.heightWeightViewStyle}>
                <WeightIcon style={{ width: 14, height: 14, paddingBottom: 8 }} />
                {currentPatient?.patientMedicalHistory?.weight &&
                currentPatient?.patientMedicalHistory?.weight !== 'No Idea' &&
                currentPatient?.patientMedicalHistory?.weight !== 'Not Recorded' ? (
                  patientTextView(
                    currentPatient?.patientMedicalHistory?.weight
                      ? currentPatient?.patientMedicalHistory?.weight
                      : ''
                  )
                ) : (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      setCurrentUpdatePopupId(2);
                      setShowUpdateProfilePopup(true);
                    }}
                  >
                    {patientTextView('-')}
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {separatorLineView()}
            <View style={{ flex: 1 }}>
              <View style={{ paddingLeft: 23 }}>
                <Text style={styles.userBloodTextStyle}>{'Blood'}</Text>
              </View>
              <View style={styles.heightWeightViewStyle}>
                <BloodIcon style={{ width: 14, height: 15.58 }} />
                {currentPatient?.patientMedicalHistory?.bloodGroup ? (
                  patientTextView(
                    getBloodGroupValue(currentPatient?.patientMedicalHistory?.bloodGroup)
                  )
                ) : (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      setCurrentUpdatePopupId(3);
                      setShowUpdateProfilePopup(true);
                    }}
                  >
                    {patientTextView('-')}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const onBackArrowPressed = () => {
    setCallApi(false);
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
          return <BillPhrIcon style={{ height: 18.63, width: 24 }} />;
        case 6:
          return <InsurancePhrIcon style={{ height: 16.71, width: 20 }} />;
        case 7:
          return <ClinicalDocumentPhrIcon style={{ height: 27.92, width: 20 }} />;
      }
    };

    const onPressListItem = () => {
      switch (id) {
        case 1:
          tabsClickedWebEngageEvent(WebEngageEventName.PHR_VIEW_PRESCRIPTIONS);
          props.navigation.navigate(AppRoutes.ConsultRxScreen, {
            consultRxData: combination,
            onPressBack: onBackArrowPressed,
          });
          break;
        case 2:
          tabsClickedWebEngageEvent(WebEngageEventName.PHR_VIEW_LAB_TESTS);
          tabsClickedWebEngageEvent(WebEngageEventName.PHR_VIEW_HEALTH_CHECKS);
          props.navigation.navigate(AppRoutes.TestReportScreen, {
            testReportsData: testAndHealthCheck,
            onPressBack: onBackArrowPressed,
          });
          break;
        case 3:
          tabsClickedWebEngageEvent(WebEngageEventName.PHR_VIEW_HOSPITALIZATIONS);
          props.navigation.navigate(AppRoutes.HospitalizationScreen, {
            hospitalizationData: hospitalizationsNew,
            onPressBack: onBackArrowPressed,
          });
          break;
        case 4:
          props.navigation.navigate(AppRoutes.HealthConditionScreen, {
            healthConditionData: healthConditions,
            onPressBack: onBackArrowPressed,
          });
          break;
        case 5:
          props.navigation.navigate(AppRoutes.BillScreen, {
            medicalBillsData: medicalBills,
            onPressBack: onBackArrowPressed,
          });
          break;
        case 6:
          props.navigation.navigate(AppRoutes.InsuranceScreen, {
            medicalInsuranceData: medicalInsurance,
            onPressBack: onBackArrowPressed,
          });
          break;
        case 7:
          props.navigation.navigate(AppRoutes.ClinicalDocumentScreen);
          break;
      }
    };

    return (
      <ListItem
        title={title}
        titleProps={{ numberOfLines: 1 }}
        titleStyle={styles.listItemTitleStyle}
        pad={0}
        containerStyle={[
          styles.listItemViewStyle,
          (id === 7 || id === 4 || id === 6) && { borderBottomWidth: 0 },
        ]}
        underlayColor={'#FFFFFF'}
        activeOpacity={1}
        onPress={onPressListItem}
        leftAvatar={renderLeftAvatar()}
        rightAvatar={<ArrowRight style={{ height: 24, width: 24 }} />}
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
          {renderListItemView('Doctor Consultations', 1)}
          {renderListItemView('Test Reports', 2)}
          {renderListItemView('Hospitalization', 3)}
          {renderListItemView('Health Conditions', 4)}
        </View>
      </View>
    );
  };

  const renderBillsInsuranceView = () => {
    return (
      <View style={{ marginHorizontal: 20, marginBottom: 14 }}>
        <Text style={{ ...theme.viewStyles.text('B', 18, theme.colors.LIGHT_BLUE, 1, 21) }}>
          {'More From Health'}
        </Text>
        <View style={styles.listItemCardStyle}>
          {renderListItemView('Bills', 5)}
          {renderListItemView('Insurance', 6)}
        </View>
      </View>
    );
  };

  const renderClinicalDocumentsView = () => {
    return (
      <View style={styles.clinicalDocumentViewStyle}>
        {renderListItemView('Clinical Documents', 7)}
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
          <TextInput
            placeholder={'Enter Height'}
            style={styles.textInputTextStyle}
            selectionColor={theme.colors.INPUT_CURSOR_COLOR}
            placeholderTextColor={theme.colors.placeholderTextColor}
            value={height}
            onChangeText={(text) => {
              setHeight(text);
            }}
          />
          <View style={[styles.placeholderViewStyle, { marginLeft: 10 }]}>
            <Text style={[styles.placeholderTextStyle]}>{heightArrayValue}</Text>
            <View style={[{ flex: 1, alignItems: 'flex-end', marginLeft: 22 }]}>
              <DropdownGreen />
            </View>
          </View>
        </View>
      </MaterialMenu>
    );
  };

  const renderWeightView = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInputComponent
          placeholder={'Enter Weight'}
          value={weight}
          onChangeText={(text) => {
            setWeight(text);
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
            setHeight('');
            setWeight('');
            setBloodGroup(undefined);
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
        updateMedicalParameters(
          height + ' ' + heightArrayValue,
          currentPatient?.patientMedicalHistory?.weight,
          currentPatient?.patientMedicalHistory?.bloodGroup
        );
      } else if (currentUpdatePopupId === 2) {
        updateMedicalParameters(
          currentPatient?.patientMedicalHistory?.height,
          weight + ' Kgs',
          currentPatient?.patientMedicalHistory?.bloodGroup
        );
      } else {
        updateMedicalParameters(
          currentPatient?.patientMedicalHistory?.height,
          currentPatient?.patientMedicalHistory?.weight,
          bloodGroup?.key?.toString() || ''
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

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderUpdateProfileDetailsPopup()}
        {renderHeader()}
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {renderProfileDetailsView()}
          {renderHealthCategoriesView()}
          {renderBillsInsuranceView()}
          {/* PHR Phase 2 UI */}
          {/* {renderClinicalDocumentsView()} */}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
