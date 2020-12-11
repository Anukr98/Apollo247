import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DatePicker } from '@aph/mobile-patients/src/components/ui/DatePicker';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  PhrRemoveBlueIcon,
  FileBig,
  Remove,
  PhrEditIcon,
  PhrAddPrescriptionRecordIcon,
  PhrAddTestRecordIcon,
  PhrAddHospitalizationRecordIcon,
  PhrAddTestDetailsIcon,
  PhrAddBillRecordIcon,
  PhrAddInsuranceRecordIcon,
  PhrMinusCircleIcon,
  PhrCheckboxIcon,
  PhrUncheckboxIcon,
  DropdownGreen,
  PhrDropdownBlueUpIcon,
  PhrRemoveTestDetailsIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  ADD_PATIENT_HOSPITALIZATION_RECORD,
  ADD_PATIENT_LAB_TEST_RECORD,
  ADD_PATIENT_MEDICAL_BILL_RECORD,
  ADD_PRESCRIPTION_RECORD,
  ADD_PATIENT_MEDICAL_INSURANCE_RECORD,
  ADD_PATIENT_ALLERGY_RECORD,
  ADD_PATIENT_HEALTH_RESTRICTION_RECORD,
  ADD_PATIENT_MEDICAL_CONDITION_RECORD,
  ADD_PATIENT_MEDICATION_RECORD,
  DELETE_HEALTH_RECORD_FILES,
} from '@aph/mobile-patients/src/graphql/profiles';
import { addPatientLabTestRecord } from '@aph/mobile-patients/src/graphql/types/addPatientLabTestRecord';
import { addPatientHospitalizationRecord } from '@aph/mobile-patients/src/graphql/types/addPatientHospitalizationRecord';
import { addPatientMedicalBillRecord } from '@aph/mobile-patients/src/graphql/types/addPatientMedicalBillRecord';
import { addPatientMedicalInsuranceRecord } from '@aph/mobile-patients/src/graphql/types/addPatientMedicalInsuranceRecord';
import { addPatientPrescriptionRecord } from '@aph/mobile-patients/src/graphql/types/addPatientPrescriptionRecord';
import { addPatientAllergyRecord } from '@aph/mobile-patients/src/graphql/types/addPatientAllergyRecord';
import { addPatientHealthRestrictionRecord } from '@aph/mobile-patients/src/graphql/types/addPatientHealthRestrictionRecord';
import { addPatientMedicalConditionRecord } from '@aph/mobile-patients/src/graphql/types/addPatientMedicalConditionRecord';
import { addPatientMedicationRecord } from '@aph/mobile-patients/src/graphql/types/addPatientMedicationRecord';
import { deleteHealthRecordFiles } from '@aph/mobile-patients/src/graphql/types/deleteHealthRecordFiles';
import {
  LabTestParameters,
  AddPrescriptionRecordInput,
  MedicalRecordType,
  AddLabTestRecordInput,
  AddHospitalizationRecordInput,
  AddPatientMedicalBillRecordInput,
  AddPatientMedicalInsuranceRecordInput,
  AllergySeverity,
  AllergyFileProperties,
  AddAllergyRecordInput,
  DeleteHealthRecordFilesInput,
  AddMedicalConditionRecordInput,
  AddPatientHealthRestrictionRecordInput,
  AddPatientMedicationRecordInput,
  HealthRestrictionNature,
  MedicalConditionIllnessTypes,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  g,
  isValidText,
  postWebEngagePHR,
  handleGraphQlError,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  BackHandler,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { WebEngageEventName } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { Overlay, ListItem } from 'react-native-elements';
import _ from 'lodash';
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  labelStyle: {
    paddingBottom: 4,
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  labelViewStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
  },
  cardViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 16,
    marginBottom: 24,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  placeholderTextStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
    paddingRight: 40,
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 'auto',
    paddingTop: 0,
    borderColor: theme.colors.SKY_BLUE,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  gotItStyles: {
    height: 60,
    paddingRight: 25,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
  phrOverlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    overflow: 'hidden',
    elevation: 0,
  },
  phrUploadOptionsViewStyle: {
    backgroundColor: '#F7F8F5',
    paddingHorizontal: 29,
    borderRadius: 10,
    paddingVertical: 34,
  },
  overlayViewStyle: {
    flexGrow: 1,
    backgroundColor: 'transparent',
  },
  overlaySafeAreaViewStyle: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bottonButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 0,
    paddingTop: 24,
    paddingBottom: 20,
  },
  bottomButtonStyle: {
    flex: 1,
  },
  bottomWhiteButtonStyle: {
    flex: 1,
    backgroundColor: 'transparent',
    borderColor: theme.colors.APP_YELLOW,
    borderWidth: 1,
    elevation: 0,
  },
  bottomWhiteButtonTextStyle: {
    color: theme.colors.APP_YELLOW,
  },
  buttonSeperatorStyle: {
    width: 16,
  },
  buttonViewStyle: {
    width: '30%',
    marginRight: 16,
    backgroundColor: 'white',
  },
  reviewPhotoDetailsViewStyle: {
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    justifyContent: 'center',
    marginTop: 23,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  textInputStyle: {
    ...theme.viewStyles.text('M', 16, theme.colors.SKY_BLUE, 1, 20.8),
    paddingHorizontal: 14,
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 30,
  },
  additionalTextInputStyle: {
    height: 110,
    borderColor: '#AFC3C9',
    borderWidth: 1,
    marginLeft: 14,
    paddingLeft: 5,
    marginRight: 20,
    marginTop: 11,
    textAlignVertical: 'top',
  },
  listItemViewStyle: {
    marginTop: 32,
    borderBottomColor: 'rgba(2,71,91,0.2)',
    borderBottomWidth: 0.5,
  },
  recordTypeTextStyle: {
    ...theme.viewStyles.text('R', 14, theme.colors.SKY_BLUE, 1, 18.2),
    marginTop: 8,
    marginBottom: 30,
  },
  imageViewStyle: {
    height: 72,
    width: 72,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
  },
  imageStyle: { height: 72, width: 60 },
  plusTextStyle: {
    ...theme.viewStyles.text('R', 24, theme.colors.LIGHT_BLUE, 1, 31.2),
    textAlign: 'center',
    paddingTop: 5,
  },
  addMoreTextStyle: {
    ...theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE, 1, 13),
    textAlign: 'center',
    flex: 1,
  },
  ensureTextStyle: {
    ...theme.viewStyles.text('R', 12, theme.colors.LIGHT_BLUE, 1, 15.6),
    textAlign: 'center',
  },
  reviewPhotoImageStyle: {
    height: 350,
    width: '100%',
  },
  headerContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  imageListViewStyle: {
    marginTop: 6,
    marginHorizontal: 21,
    marginBottom: 100,
    flexDirection: 'row',
  },
  addMoreImageViewStyle: { width: 82, height: 82, paddingTop: 10 },
  menuContainerStyle: {
    alignItems: 'flex-end',
    marginTop: 0,
    marginLeft: width / 2 - 95,
  },
  itemTextStyle: {
    ...theme.viewStyles.text('M', 16, '#01475b'),
    paddingHorizontal: 0,
  },
  selectedTextStyle: {
    ...theme.viewStyles.text('M', 16, '#00b38e'),
    alignSelf: 'flex-start',
  },
  doctorPrefixContainerStyle: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 18,
    marginTop: 0,
    marginBottom: 30,
  },
  doctorPrefixTextInputStyle: {
    ...theme.viewStyles.text('M', 16, theme.colors.SKY_BLUE, 1, 20.8),
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 0,
    paddingHorizontal: 0,
    paddingRight: 14,
    paddingLeft: 2,
  },
  morningViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 14,
  },
  morningTextStyle: {
    ...theme.viewStyles.text('R', 14, theme.colors.LIGHT_BLUE, 1, 18.2),
    marginLeft: 11,
  },
  allergyViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginHorizontal: 14,
    marginBottom: 20,
  },
  dateViewStyle: { paddingTop: 0, paddingBottom: 10 },
  illnessTypeViewStyle: { marginBottom: 30 },
  menuContainerViewStyle: { marginLeft: 14, marginRight: 18 },
  parameterContainerStyle: {
    paddingTop: 0,
    paddingBottom: 3,
    paddingRight: 20,
  },
  parameterNameStyle: { ...theme.viewStyles.text('R', 14, theme.colors.LIGHT_BLUE, 1, 18.2) },
});

type RecordTypeType = {
  key: string;
  value: string;
};
type PickerImage = any;

export enum MedicRecordType {
  TEST_REPORT = 'TEST_REPORT',
  CONSULTATION = 'CONSULTATION',
  PRESCRIPTION = 'PRESCRIPTION',
  HEALTHCHECK = 'HEALTHCHECK',
  HOSPITALIZATION = 'HOSPITALIZATION',
}
const RecordType: RecordTypeType[] = [
  {
    value: MedicRecordType.TEST_REPORT.toLowerCase().replace('_', ' '),
    key: MedicRecordType.TEST_REPORT,
  },
  {
    value: MedicRecordType.PRESCRIPTION.toLowerCase().replace('_', ' '),
    key: MedicRecordType.PRESCRIPTION,
  },
  {
    value: 'Health Check',
    key: MedicRecordType.HEALTHCHECK,
  },
  {
    value: 'Discharge Summary',
    key: MedicRecordType.HOSPITALIZATION,
  },
];

interface SeverityType {
  key: string;
  value: string;
}

const severityType: SeverityType[] = [
  {
    value: _.startCase(_.toLower(AllergySeverity.MILD)),
    key: AllergySeverity.MILD,
  },
  {
    value: _.startCase(_.toLower(AllergySeverity.SEVERE)),
    key: AllergySeverity.SEVERE,
  },
  {
    value: _.startCase(_.toLower(AllergySeverity.LIFE_THREATENING)),
    key: AllergySeverity.LIFE_THREATENING,
  },
  {
    value: _.startCase(_.toLower(AllergySeverity.NOT_KNOWN)),
    key: AllergySeverity.NOT_KNOWN,
  },
];

const natureType: SeverityType[] = [
  {
    value: _.startCase(_.toLower(HealthRestrictionNature.Physical)),
    key: HealthRestrictionNature.Physical,
  },
  {
    value: _.startCase(_.toLower(HealthRestrictionNature.Dietary)),
    key: HealthRestrictionNature.Dietary,
  },
  {
    value: _.startCase(_.toLower(HealthRestrictionNature.OTHER)),
    key: HealthRestrictionNature.OTHER,
  },
];

const illnessTypeArray: SeverityType[] = [
  {
    value: _.startCase(_.toLower(MedicalConditionIllnessTypes.Acute)),
    key: MedicalConditionIllnessTypes.Acute,
  },
  {
    value: _.startCase(_.toLower(MedicalConditionIllnessTypes.Chronic)),
    key: MedicalConditionIllnessTypes.Chronic,
  },
  {
    value: _.startCase(_.toLower(MedicalConditionIllnessTypes.Intermittent)),
    key: MedicalConditionIllnessTypes.Intermittent,
  },
  {
    value: _.startCase(_.toLower(MedicalConditionIllnessTypes.Recurring)),
    key: MedicalConditionIllnessTypes.Recurring,
  },
];

const TestRecordInitialValues: LabTestParameters = {
  parameterName: '',
  unit: '',
  result: 0,
  minimum: 0,
  maximum: 0,
};

export interface AddRecordProps
  extends NavigationScreenProps<{
    onRecordAdded: () => void;
  }> {}

export const AddRecord: React.FC<AddRecordProps> = (props) => {
  var fin = '';
  const [showRecordDetails, setshowRecordDetails] = useState<boolean>(true);
  const [showReportDetails, setshowReportDetails] = useState<boolean>(false);
  const [displayOrderPopup, setdisplayOrderPopup] = useState<boolean>(false);
  const [displayAllergyPopup, setdisplayAllergyPopup] = useState<boolean>(false);
  const [displayMedicalConditionPopup, setdisplayMedicalConditionPopup] = useState<boolean>(false);
  const [displayReviewPhotoPopup, setDisplayReviewPhotoPopup] = useState<boolean>(false);
  const [reviewPopupID, setReviewPopupID] = useState<number>(1);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [testName, settestName] = useState<string>('');
  const [docName, setDocName] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');
  const [typeofRecord, settypeofRecord] = useState<MedicRecordType>(MedicRecordType.PRESCRIPTION);
  const [
    selectedRestrictionType,
    setSelectedRestrictionType,
  ] = useState<HealthRestrictionNature | null>(null);
  const [
    selectedIllnessType,
    setSelectedIllnessType,
  ] = useState<MedicalConditionIllnessTypes | null>(null);
  const [selectedSeverityType, setSelectedSeverityType] = useState<AllergySeverity | null>(null);
  const [dateOfTest, setdateOfTest] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [referringDoctor, setreferringDoctor] = useState<string>('');
  const [observations, setobservations] = useState<string>('');
  const [additionalNotes, setadditionalNotes] = useState<string>('');
  const [testRecordParameters, setTestRecordParameters] = useState<LabTestParameters[]>([
    TestRecordInitialValues,
  ]);
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);
  const [endDateTimePickerVisible, setEndDateTimePickerVisible] = useState<boolean>(false);
  const [allergyCheckbox, setAllergyCheckbox] = useState(false);
  const [showAllergyDetails, setShowAllergyDetails] = useState<boolean>(false);
  const [allergyName, setAllergyName] = useState<string>('');
  const [allergyDocName, setAllergyDocName] = useState<string>('');
  const [allergyEndDate, setAllergyEndDate] = useState<string>('');
  const [isAllergyDateTimePicker, setIsAllergyDateTimePicker] = useState<boolean>(false);
  const [allergyReaction, setAllergyReaction] = useState<string>('');
  const [allergyAdditionalNotes, setAllergyAdditionalNotes] = useState<string>('');
  const [allergyImage, setAllergyImage] = useState<PickerImage>([]);

  const [medicationCheckbox, setMedicationCheckbox] = useState(false);
  const [showMedicationDetails, setShowMedicationDetails] = useState<boolean>(false);
  const [medicationMedicineName, setMedicationMedicineName] = useState<string>('');
  const [medicationCondition, setMedicationCondition] = useState<string>('');
  const [medicationDocName, setMedicationDocName] = useState<string>('');
  const [medicationEndDate, setMedicationEndDate] = useState<string>('');
  const [isMorningChecked, setIsMorningChecked] = useState<boolean>(false);
  const [isNoonChecked, setIsNoonChecked] = useState<boolean>(false);
  const [isEveningChecked, setIsEveningChecked] = useState<boolean>(false);
  const [isMedicationDateTimePicker, setIsMedicationDateTimePicker] = useState<boolean>(false);
  const [medicationAdditionalNotes, setMedicationAdditionalNotes] = useState<string>('');

  const [healthRestrictionCheckbox, setHealthRestrictionCheckbox] = useState(false);
  const [showHealthRestrictionDetails, setShowHealthRestrictionDetails] = useState<boolean>(false);
  const [healthRestrictionName, setHealthRestrictionName] = useState<string>('');
  const [healthRestrictionDocName, setHealthRestrictionDocName] = useState<string>('');
  const [healthRestrictionEndDate, setHealthRestrictionEndDate] = useState<string>('');
  const [healthRestrictionAdditionalNotes, setHealthRestrictionAdditionalNotes] = useState<string>(
    ''
  );
  const [isHealthRestrictionDateTimePicker, setIsHealthRestrictionDateTimePicker] = useState<
    boolean
  >(false);

  const [medicalConditionCheckbox, setMedicalConditionCheckbox] = useState(false);
  const [showMedicalConditionDetails, setShowMedicalConditionDetails] = useState<boolean>(false);
  const [medicalConditionName, setMedicalConditionName] = useState<string>('');
  const [medicalConditionDocName, setMedicalConditionDocName] = useState<string>('');
  const [medicalConditionEndDate, setMedicalConditionEndDate] = useState<string>('');
  const [isMedicalConditionDateTimePicker, setIsMedicalConditionDateTimePicker] = useState<boolean>(
    false
  );
  const [medicalConditionAdditionalNotes, setMedicalConditionAdditionalNotes] = useState<string>(
    ''
  );
  const [medicalConditionImage, setMedicalConditionImage] = useState<PickerImage>([]);

  const [showPopUp, setshowPopUp] = useState<boolean>(false);
  const { showAphAlert } = useUIElements();

  const [Images, setImages] = useState<PickerImage>(props.navigation.state.params ? [] : []);
  const [imageUpdate, setImageUpdate] = useState<boolean>(false);
  const [callDeleteAttachmentApi, setCallDeleteAttachmentApi] = useState<boolean>(false);
  const [currentImage, setCurrentImage] = useState<PickerImage>(null);
  const [openCamera, setOpenCamera] = useState<boolean>(false);
  const navigatedFrom = props.navigation.state.params!.navigatedFrom
    ? props.navigation.state.params!.navigatedFrom
    : '';
  const recordType = props.navigation.state.params
    ? props.navigation.state.params.recordType
    : false;
  const selectedRecordID = props.navigation.state.params
    ? props.navigation.state.params.selectedRecordID
    : null;
  const selectedRecord = props.navigation.state.params
    ? props.navigation.state.params.selectedRecord
    : null;

  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const client = useApolloClient();
  const numberKeyboardType = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric';

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  const handleBack = async () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    props.navigation.goBack();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  useEffect(() => {
    if (selectedRecord) {
      setImageUpdate(selectedRecord?.fileUrl ? true : false);
      if (recordType === MedicalRecordType.PRESCRIPTION) {
        settestName(selectedRecord?.prescriptionName || '');
        setDocName(selectedRecord?.prescribedBy || '');
        setdateOfTest(
          selectedRecord?.date
            ? moment(selectedRecord?.date).format(string.common.date_placeholder_text)
            : ''
        );
        setadditionalNotes(selectedRecord?.notes || '');
        setImages(setUploadedImages(selectedRecord?.prescriptionFiles));
      } else if (recordType === MedicalRecordType.TEST_REPORT) {
        let labResultsArray: LabTestParameters[] = [];
        settestName(selectedRecord?.labTestName || '');
        setDocName(selectedRecord?.labTestRefferedBy || '');
        selectedRecord?.labTestResults?.forEach((item: any) => {
          let labResultsObj: LabTestParameters = {};
          labResultsObj.result = parseFloat((item?.result || 0).toString());
          labResultsObj.unit = item?.unit || '';
          labResultsObj.parameterName = item?.parameterName || '';
          let maxMin = item?.range?.split('-');
          labResultsObj.minimum = parseFloat((maxMin[0] || 0).toString());
          labResultsObj.maximum = parseFloat((maxMin[1] || 0).toString());
          labResultsArray.push(labResultsObj);
        });
        setTestRecordParameters(
          labResultsArray?.length > 0 ? labResultsArray : [TestRecordInitialValues]
        );
        setadditionalNotes(selectedRecord?.additionalNotes || '');
        setdateOfTest(
          selectedRecord?.date
            ? moment(selectedRecord?.date).format(string.common.date_placeholder_text)
            : ''
        );
        setUploadedImages(selectedRecord?.testResultFiles);
        setImages(setUploadedImages(selectedRecord?.testResultFiles));
      } else if (recordType === MedicalRecordType.HOSPITALIZATION) {
        setDocName(selectedRecord?.doctorName || '');
        settestName(selectedRecord?.hospitalName || '');
        setdateOfTest(
          selectedRecord?.date
            ? moment(selectedRecord?.date).format(string.common.date_placeholder_text)
            : ''
        );
        setImages(setUploadedImages(selectedRecord?.hospitalizationFiles));
        setadditionalNotes(selectedRecord?.diagnosisNotes || '');
      } else if (recordType === MedicalRecordType.MEDICALBILL) {
        settestName(selectedRecord?.bill_no || '');
        setDocName(selectedRecord?.hospitalName || '');
        setImages(setUploadedImages(selectedRecord?.billFiles));
        setdateOfTest(
          selectedRecord?.billDateTime
            ? moment(selectedRecord?.billDateTime).format(string.common.date_placeholder_text)
            : ''
        );
      } else if (recordType === MedicalRecordType.MEDICALINSURANCE) {
        settestName(selectedRecord?.insuranceCompany || '');
        setdateOfTest(
          selectedRecord?.startDateTime
            ? moment(selectedRecord?.startDateTime).format(string.common.date_placeholder_text)
            : ''
        );
        setEndDate(
          selectedRecord?.endDateTime
            ? moment(selectedRecord?.endDateTime).format(string.common.date_placeholder_text)
            : ''
        );
        setDocName(selectedRecord?.policyNumber || '');
        setLocationName(selectedRecord?.sumInsured || '');
        setImages(setUploadedImages(selectedRecord?.insuranceFiles));
        setadditionalNotes(selectedRecord?.notes || '');
      } else if (recordType === MedicalRecordType.ALLERGY) {
        setAllergyCheckbox(true);
        setAllergyName(selectedRecord?.allergyName || '');
        setSelectedSeverityType(selectedRecord?.severity || null);
        setShowAllergyDetails(true);
        setAllergyDocName(selectedRecord?.doctorTreated || '');
        setdateOfTest(
          selectedRecord?.startDateTime
            ? moment(selectedRecord?.startDateTime).format(string.common.date_placeholder_text)
            : ''
        );
        setAllergyEndDate(
          selectedRecord?.endDateTime
            ? moment(selectedRecord?.endDateTime).format(string.common.date_placeholder_text)
            : ''
        );
        setAllergyReaction(selectedRecord?.reactionToAllergy || '');
        setAllergyImage(setUploadedImages(selectedRecord?.attachmentList));
        setAllergyAdditionalNotes(selectedRecord?.notes || '');
      } else if (recordType === MedicalRecordType.MEDICATION) {
        setMedicationCheckbox(true);
        setShowMedicationDetails(true);
        setMedicationDocName(selectedRecord?.doctorName || '');
        setMedicationMedicineName(selectedRecord?.medicineName || '');
        setMedicationCondition(selectedRecord?.medicalCondition || '');
        setdateOfTest(
          selectedRecord?.startDateTime
            ? moment(selectedRecord?.startDateTime).format(string.common.date_placeholder_text)
            : ''
        );
        setMedicationEndDate(
          selectedRecord?.endDateTime
            ? moment(selectedRecord?.endDateTime).format(string.common.date_placeholder_text)
            : ''
        );
        setIsMorningChecked(selectedRecord?.morning || false);
        setIsNoonChecked(selectedRecord?.noon || false);
        setIsEveningChecked(selectedRecord?.evening || false);
        setMedicationAdditionalNotes(selectedRecord?.notes || '');
      } else if (recordType === MedicalRecordType.HEALTHRESTRICTION) {
        setHealthRestrictionCheckbox(true);
        setShowHealthRestrictionDetails(true);
        setHealthRestrictionName(selectedRecord?.restrictionName || '');
        setHealthRestrictionDocName(selectedRecord?.suggestedByDoctor || '');
        setSelectedRestrictionType(selectedRecord?.nature || null);
        setdateOfTest(
          selectedRecord?.startDateTime
            ? moment(selectedRecord?.startDateTime).format(string.common.date_placeholder_text)
            : ''
        );
        setHealthRestrictionEndDate(
          selectedRecord?.endDateTime
            ? moment(selectedRecord?.endDateTime).format(string.common.date_placeholder_text)
            : ''
        );
        setHealthRestrictionAdditionalNotes(selectedRecord?.notes || '');
      } else if (recordType === MedicalRecordType.MEDICALCONDITION) {
        setMedicalConditionCheckbox(true);
        setShowMedicalConditionDetails(true);
        setMedicalConditionAdditionalNotes(selectedRecord?.notes || '');
        setMedicalConditionDocName(selectedRecord?.doctorTreated || '');
        setSelectedIllnessType(selectedRecord?.illnessType || null);
        setMedicalConditionName(selectedRecord?.medicalConditionName || '');
        setdateOfTest(
          selectedRecord?.startDateTime
            ? moment(selectedRecord?.startDateTime).format(string.common.date_placeholder_text)
            : ''
        );
        setMedicalConditionEndDate(
          selectedRecord?.endDateTime
            ? moment(selectedRecord?.endDateTime).format(string.common.date_placeholder_text)
            : ''
        );
        setMedicalConditionImage(setUploadedImages(selectedRecord?.medicationFiles));
      }
    }
  }, [selectedRecord]);

  const isTestRecordParameterFilled = () => {
    const testRecordsVaild = testRecordParameters
      .map((item) => {
        return {
          ...item,
          result: parseFloat((item?.result || 0).toString()),
          maximum: parseFloat((item?.maximum || 0).toString()),
          minimum: parseFloat((item?.minimum || 0).toString()),
        };
      })
      .filter((item) => item !== undefined) as LabTestParameters[];

    if (testRecordsVaild?.length > 0) {
      setTestRecordParameters(testRecordsVaild);
      return testRecordsVaild;
    } else {
      return [];
    }
  };

  const isValid = () => {
    const validRecordDetails1 = recordType && dateOfTest && testName && docName;
    const valid = isTestRecordParameterFilled().map((item) => {
      return {
        maxmin: item?.maximum! > item?.minimum!,
        changed: true,
        noParameterName: item?.parameterName || '',
        noUnits: item?.unit || '',
        notinitial:
          item?.parameterName === '' &&
          item?.result === 0 &&
          item?.maximum === 0 &&
          item?.minimum === 0,
      };
    });

    let message = !dateOfTest
      ? 'Please enter Record date'
      : !testName
      ? 'Please enter record name'
      : !docName
      ? 'Please enter record doctor’s name'
      : '';

    message === '' &&
      valid.forEach((item) => {
        if (!item?.noParameterName) {
          message = 'Please enter parameter name';
        } else if (!item?.noUnits) {
          message = 'Please enter units';
        } else if (item?.maxmin === false) {
          message = 'Please enter valid Maximum and Minimum';
        }
      });

    const finval = validRecordDetails1;
    return {
      isvalid: finval,
      isValidParameter:
        valid.find((i) => i?.maxmin === false || !i?.noParameterName || !i?.noUnits) !== undefined,
      message: message,
    };
  };

  const setTestParametersData = (key: string, value: string, i: number, isNumber?: boolean) => {
    const dataCopy = [...testRecordParameters];
    dataCopy[i] = {
      ...dataCopy[i],
      [key]: isNumber ? formatNumber(value) : value,
    };
    setTestRecordParameters(dataCopy);
  };

  const formatNumber = (value: string) => {
    let number =
      value.indexOf('.') === value.length - 1 ||
      value.indexOf('0', value.length - 1) === value.length - 1 ||
      value.indexOf('-') === value.length - 1
        ? value
        : parseFloat(value);
    return number || 0;
  };

  const isValidImage = () => {
    setshowSpinner(false);
    if (Images?.length === 0) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please add document',
      });
      return false;
    } else if (Images?.length > 1) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please add only one document',
      });
      return false;
    } else {
      return true;
    }
  };

  const isValidPrescription = () => {
    setshowSpinner(false);
    if (!dateOfTest) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter record date',
      });
      return false;
    } else if (!testName) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter record name',
      });
      return false;
    } else if (!docName) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter record prescribed by',
      });
      return false;
    } else {
      return true;
    }
  };

  const isValidHospitalizationRecord = () => {
    setshowSpinner(false);
    if (!dateOfTest) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter record date',
      });
      return false;
    } else if (!docName) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter record doctor’s name',
      });
      return false;
    } else if (!testName) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter record from',
      });
      return false;
    } else {
      return true;
    }
  };

  const isValidBillRecord = () => {
    setshowSpinner(false);
    if (!dateOfTest) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter record date',
      });
      return false;
    } else if (!docName) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter record hospital name',
      });
      return false;
    } else if (!testName) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter record bill number',
      });
      return false;
    } else {
      return true;
    }
  };

  const isValidInsuranceRecord = () => {
    setshowSpinner(false);
    if (!dateOfTest) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter record issue date',
      });
      return false;
    } else if (!endDate) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter record end date',
      });
      return false;
    } else if (moment(endDate).isSameOrBefore(dateOfTest)) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please select correct end date',
      });
      return false;
    } else if (!testName) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter record name',
      });
      return false;
    } else if (!locationName) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter record insurance amount',
      });
      return false;
    } else {
      return true;
    }
  };

  const setUploadedImages = (selectedImages: any) => {
    let imagesArray = [] as any;
    selectedImages?.forEach((item: any) => {
      let imageObj = {} as any;
      imageObj.title = item?.fileName;
      imageObj.fileType = item?.mimeType;
      imageObj.base64 = selectedRecord?.fileUrl;
      imagesArray.push(imageObj);
    });
    return imagesArray;
  };

  const getAddedImages = () => {
    let imagesArray = [] as any;
    Images?.forEach((item: any) => {
      let imageObj = {} as any;
      imageObj.fileName = item?.title + '.' + item?.fileType;
      imageObj.mimeType = mimeType(item?.title + '.' + item?.fileType);
      imageObj.content = item?.base64;
      imagesArray.push(imageObj);
    });
    return imagesArray;
  };

  const getAddedAllergyImage = () => {
    let imagesArray = [] as any;
    allergyImage?.forEach((item: any) => {
      let imageObj = {} as any;
      imageObj.fileName = item?.title + '.' + item?.fileType;
      imageObj.mimeType = mimeType(item?.title + '.' + item?.fileType);
      imageObj.content = item?.base64;
      imagesArray.push(imageObj);
    });
    return imagesArray;
  };

  const getAddedMedicalConditionImage = () => {
    let imagesArray = [] as any;
    medicalConditionImage?.forEach((item: any) => {
      let imageObj = {} as any;
      imageObj.fileName = item?.title + '.' + item?.fileType;
      imageObj.mimeType = mimeType(item?.title + '.' + item?.fileType);
      imageObj.content = item?.base64;
      imagesArray.push(imageObj);
    });
    return imagesArray;
  };

  const gotoHealthRecordsHomeScreen = () => {
    props.navigation.state.params?.onRecordAdded();
    props.navigation.goBack();
  };

  const addMedicalRecord = () => {
    setshowSpinner(true);
    const inputData: AddPrescriptionRecordInput = {
      id: selectedRecordID,
      patientId: currentPatient?.id || '',
      prescriptionName: testName,
      issuingDoctor: docName,
      location: locationName,
      additionalNotes: additionalNotes,
      dateOfPrescription:
        dateOfTest !== ''
          ? moment(dateOfTest, string.common.date_placeholder_text).format('YYYY-MM-DD')
          : '',
      recordType: MedicalRecordType.PRESCRIPTION,
      prescriptionFiles: imageUpdate ? [] : getAddedImages(),
    };
    client
      .mutate<addPatientPrescriptionRecord>({
        mutation: ADD_PRESCRIPTION_RECORD,
        variables: {
          AddPrescriptionRecordInput: inputData,
        },
      })
      .then(({ data }) => {
        setshowSpinner(false);
        const status = g(data, 'addPatientPrescriptionRecord', 'status');
        if (status) {
          if (selectedRecord) {
            postWebEngagePHR(
              'Doctor Consultation',
              WebEngageEventName.PHR_UPDATE_DOCTOR_CONSULTATION
            );
          } else {
            postWebEngagePHR(
              'Doctor Consultation',
              WebEngageEventName.PHR_ADD_DOCTOR_CONSULTATIONS
            );
          }
          gotoHealthRecordsHomeScreen();
        }
      })
      .catch((e) => {
        CommonBugFender('AddRecord_ADD_PRESCRIPTION_RECORD', e);
        setshowSpinner(false);
        console.log(JSON.stringify(e), 'eeeee');
        currentPatient && handleGraphQlError(e);
      });
  };

  const addAllergyRecord = () => {
    setshowSpinner(true);
    const inputData: AddAllergyRecordInput = {
      id: selectedRecordID,
      patientId: currentPatient?.id || '',
      allergyName: allergyName,
      doctorTreated: showAllergyDetails ? allergyDocName : '',
      reactionToAllergy: showAllergyDetails ? allergyReaction : '',
      notes: showAllergyDetails ? allergyAdditionalNotes : '',
      severity: selectedSeverityType!,
      startDate:
        dateOfTest !== ''
          ? moment(dateOfTest, string.common.date_placeholder_text).format('YYYY-MM-DD')
          : '',
      recordType: MedicalRecordType.ALLERGY,
      endDate:
        showAllergyDetails && allergyEndDate !== ''
          ? moment(allergyEndDate, string.common.date_placeholder_text).format('YYYY-MM-DD')
          : null,
      attachmentList: imageUpdate ? [] : getAddedAllergyImage(),
    };
    client
      .mutate<addPatientAllergyRecord>({
        mutation: ADD_PATIENT_ALLERGY_RECORD,
        variables: {
          addAllergyRecordInput: inputData,
        },
      })
      .then(({ data }) => {
        if (medicationCheckbox) {
          addMedicationRecord();
        } else if (healthRestrictionCheckbox) {
          addHealthRestrictionRecord();
        } else if (medicalConditionCheckbox) {
          addMedicalConditionRecord();
        } else {
          setshowSpinner(false);
          gotoHealthRecordsHomeScreen();
        }
      })
      .catch((e) => {
        CommonBugFender('AddRecord_ADD_PATIENT_ALLERGY_RECORD', e);
        setshowSpinner(false);
        console.log(JSON.stringify(e), 'eeeee');
        currentPatient && handleGraphQlError(e);
      });
  };

  const addMedicationRecord = () => {
    setshowSpinner(true);
    const inputData: AddPatientMedicationRecordInput = {
      id: selectedRecordID,
      patientId: currentPatient?.id || '',
      medicineName: medicationMedicineName,
      doctorName: showMedicationDetails ? medicationDocName : '',
      medicalCondition: showMedicationDetails ? medicationCondition : '',
      notes: showMedicationDetails ? medicationAdditionalNotes : '',
      noon: showMedicationDetails ? isNoonChecked : false,
      morning: showMedicationDetails ? isMorningChecked : false,
      evening: showMedicationDetails ? isEveningChecked : false,
      startDate:
        dateOfTest !== ''
          ? moment(dateOfTest, string.common.date_placeholder_text).format('YYYY-MM-DD')
          : '',
      endDate:
        showMedicationDetails && medicationEndDate !== ''
          ? moment(medicationEndDate, string.common.date_placeholder_text).format('YYYY-MM-DD')
          : null,
      recordType: MedicalRecordType.MEDICATION,
    };
    client
      .mutate<addPatientMedicationRecord>({
        mutation: ADD_PATIENT_MEDICATION_RECORD,
        variables: {
          addPatientMedicationRecordInput: inputData,
        },
      })
      .then(({ data }) => {
        if (healthRestrictionCheckbox) {
          addHealthRestrictionRecord();
        } else if (medicalConditionCheckbox) {
          addMedicalConditionRecord();
        } else {
          setshowSpinner(false);
          gotoHealthRecordsHomeScreen();
        }
      })
      .catch((e) => {
        CommonBugFender('AddRecord_ADD_PRESCRIPTION_RECORD', e);
        setshowSpinner(false);
        console.log(JSON.stringify(e), 'eeeee');
        currentPatient && handleGraphQlError(e);
      });
  };

  const addHealthRestrictionRecord = () => {
    setshowSpinner(true);
    const inputData: AddPatientHealthRestrictionRecordInput = {
      id: selectedRecordID,
      patientId: currentPatient?.id || '',
      restrictionName: healthRestrictionName,
      suggestedByDoctor: showHealthRestrictionDetails ? healthRestrictionDocName : '',
      nature: selectedRestrictionType!,
      startDate:
        dateOfTest !== ''
          ? moment(dateOfTest, string.common.date_placeholder_text).format('YYYY-MM-DD')
          : '',
      endDate:
        showHealthRestrictionDetails && healthRestrictionEndDate !== ''
          ? moment(healthRestrictionEndDate, string.common.date_placeholder_text).format(
              'YYYY-MM-DD'
            )
          : null,
      recordType: MedicalRecordType.HEALTHRESTRICTION,
      notes: healthRestrictionAdditionalNotes,
    };
    client
      .mutate<addPatientHealthRestrictionRecord>({
        mutation: ADD_PATIENT_HEALTH_RESTRICTION_RECORD,
        variables: {
          addPatientHealthRestrictionRecordInput: inputData,
        },
      })
      .then(({ data }) => {
        if (medicalConditionCheckbox) {
          addMedicalConditionRecord();
        } else {
          setshowSpinner(false);
          gotoHealthRecordsHomeScreen();
        }
      })
      .catch((e) => {
        CommonBugFender('AddRecord_ADD_PRESCRIPTION_RECORD', e);
        setshowSpinner(false);
        console.log(JSON.stringify(e), 'eeeee');
        currentPatient && handleGraphQlError(e);
      });
  };

  const addMedicalConditionRecord = () => {
    setshowSpinner(true);
    const inputData: AddMedicalConditionRecordInput = {
      id: selectedRecordID,
      patientId: currentPatient?.id || '',
      medicalConditionName: medicalConditionName,
      doctorTreated: medicalConditionDocName,
      notes: showMedicalConditionDetails ? medicalConditionAdditionalNotes : '',
      illnessType: selectedIllnessType!,
      startDate:
        dateOfTest !== ''
          ? moment(dateOfTest, string.common.date_placeholder_text).format('YYYY-MM-DD')
          : '',
      endDate:
        showMedicalConditionDetails && medicalConditionEndDate !== ''
          ? moment(medicalConditionEndDate, string.common.date_placeholder_text).format(
              'YYYY-MM-DD'
            )
          : null,
      recordType: MedicalRecordType.MEDICALCONDITION,
      medicationFiles: imageUpdate ? [] : getAddedMedicalConditionImage(),
    };
    client
      .mutate<addPatientMedicalConditionRecord>({
        mutation: ADD_PATIENT_MEDICAL_CONDITION_RECORD,
        variables: {
          addMedicalConditionRecordInput: inputData,
        },
      })
      .then(({ data }) => {
        setshowSpinner(false);
        gotoHealthRecordsHomeScreen();
      })
      .catch((e) => {
        CommonBugFender('AddRecord_ADD_PRESCRIPTION_RECORD', e);
        setshowSpinner(false);
        console.log(JSON.stringify(e), 'eeeee');
        currentPatient && handleGraphQlError(e);
      });
  };

  const addPatientLabTestRecords = () => {
    setshowSpinner(true);
    const inputData: AddLabTestRecordInput = {
      id: selectedRecordID,
      patientId: currentPatient?.id || '',
      labTestName: testName,
      labTestDate:
        dateOfTest !== ''
          ? moment(dateOfTest, string.common.date_placeholder_text).format('YYYY-MM-DD')
          : '',
      recordType: recordType,
      referringDoctor: docName,
      observations: observations,
      additionalNotes: additionalNotes,
      labTestResults: isTestRecordParameterFilled(),
      testResultFiles: imageUpdate ? [] : getAddedImages(),
    };
    client
      .mutate<addPatientLabTestRecord>({
        mutation: ADD_PATIENT_LAB_TEST_RECORD,
        variables: {
          AddLabTestRecordInput: inputData,
        },
      })
      .then(({ data }) => {
        setshowSpinner(false);
        const status = g(data, 'addPatientLabTestRecord', 'status');
        if (status) {
          if (selectedRecord) {
            postWebEngagePHR('Test Report', WebEngageEventName.PHR_UPDATE_TEST_REPORT);
          } else {
            postWebEngagePHR('Test Report', WebEngageEventName.PHR_ADD_TEST_REPORT);
          }
          gotoHealthRecordsHomeScreen();
        }
      })
      .catch((e) => {
        CommonBugFender('AddRecord_ADD_PATIENT_LAB_TEST_RECORD', e);
        setshowSpinner(false);
        console.log(JSON.stringify(e), 'eeeee');
        currentPatient && handleGraphQlError(e);
      });
  };

  const addPatientHospitalizationRecords = () => {
    setshowSpinner(true);
    const inputData: AddHospitalizationRecordInput = {
      id: selectedRecordID,
      patientId: currentPatient?.id || '',
      doctorName: docName,
      dischargeDate:
        dateOfTest !== ''
          ? moment(dateOfTest, string.common.date_placeholder_text).format('YYYY-MM-DD')
          : '',
      recordType: recordType,
      hospitalName: testName,
      hospitalizationFiles: imageUpdate ? [] : getAddedImages(),
      diagnosisNotes: additionalNotes,
    };

    client
      .mutate<addPatientHospitalizationRecord>({
        mutation: ADD_PATIENT_HOSPITALIZATION_RECORD,
        variables: {
          AddHospitalizationRecordInput: inputData,
        },
      })
      .then(({ data }) => {
        setshowSpinner(false);
        const status = g(data, 'addPatientHospitalizationRecord', 'status');
        if (status) {
          if (selectedRecord) {
            postWebEngagePHR(
              'Discharge Summary Record',
              WebEngageEventName.PHR_UPDATE_HOSPITALIZATIONS
            );
          } else {
            postWebEngagePHR(
              'Discharge Summary Record',
              WebEngageEventName.PHR_ADD_HOSPITALIZATIONS
            );
          }
          gotoHealthRecordsHomeScreen();
        }
      })
      .catch((e) => {
        CommonBugFender('AddRecord_ADD_PATIENT_HOSPITALIZATION_RECORD', e);
        setshowSpinner(false);
        console.log(JSON.stringify(e), 'eeeee');
        currentPatient && handleGraphQlError(e);
      });
  };

  const addPatientBillRecords = () => {
    setshowSpinner(true);
    const inputData: AddPatientMedicalBillRecordInput = {
      id: selectedRecordID,
      patientId: currentPatient?.id || '',
      hospitalName: docName,
      billDate:
        dateOfTest !== ''
          ? moment(dateOfTest, string.common.date_placeholder_text).format('YYYY-MM-DD')
          : '',
      recordType: recordType,
      bill_no: testName,
      billFiles: imageUpdate ? [] : getAddedImages(),
    };

    client
      .mutate<addPatientMedicalBillRecord>({
        mutation: ADD_PATIENT_MEDICAL_BILL_RECORD,
        variables: {
          addPatientMedicalBillRecordInput: inputData,
        },
      })
      .then(({ data }) => {
        setshowSpinner(false);
        const status = g(data, 'addPatientMedicalBillRecord', 'status');
        if (status) {
          if (selectedRecord) {
            postWebEngagePHR('Bills', WebEngageEventName.PHR_UPDATE_BILLS);
          } else {
            postWebEngagePHR('Bills', WebEngageEventName.PHR_ADD_BILLS);
          }
          gotoHealthRecordsHomeScreen();
        }
      })
      .catch((e) => {
        CommonBugFender('AddRecord_ADD_PATIENT_MEDICAL_BILL_RECORD', e);
        setshowSpinner(false);
        console.log(JSON.stringify(e), 'eeeee');
        currentPatient && handleGraphQlError(e);
      });
  };

  const addPatientInsuranceRecords = () => {
    setshowSpinner(true);
    const inputData: AddPatientMedicalInsuranceRecordInput = {
      id: selectedRecordID,
      patientId: currentPatient?.id || '',
      insuranceCompany: testName,
      startDate:
        dateOfTest !== ''
          ? moment(dateOfTest, string.common.date_placeholder_text).format('YYYY-MM-DD')
          : '',
      endDate:
        endDate !== ''
          ? moment(endDate, string.common.date_placeholder_text).format('YYYY-MM-DD')
          : '',
      recordType: recordType,
      policyNumber: docName,
      sumInsured: locationName,
      insuranceFiles: imageUpdate ? [] : getAddedImages(),
      notes: additionalNotes,
    };

    client
      .mutate<addPatientMedicalInsuranceRecord>({
        mutation: ADD_PATIENT_MEDICAL_INSURANCE_RECORD,
        variables: {
          addPatientMedicalInsuranceRecordInput: inputData,
        },
      })
      .then(({ data }) => {
        setshowSpinner(false);
        const status = g(data, 'addPatientMedicalInsuranceRecord', 'status');
        if (status) {
          if (selectedRecord) {
            postWebEngagePHR('Insurance', WebEngageEventName.PHR_UPDATE_INSURANCE);
          } else {
            postWebEngagePHR('Insurance', WebEngageEventName.PHR_ADD_INSURANCE);
          }
          gotoHealthRecordsHomeScreen();
        }
      })
      .catch((e) => {
        CommonBugFender('AddRecord_ADD_PATIENT_MEDICAL_INSURANCE_RECORD', e);
        setshowSpinner(false);
        console.log(JSON.stringify(e), 'eeeee');
        currentPatient && handleGraphQlError(e);
      });
  };

  const callDeleteHealthRecordFileApi = () => {
    setshowSpinner(true);
    const inputData: DeleteHealthRecordFilesInput = {
      patientId: currentPatient?.id || '',
      recordType: recordType,
      recordId: selectedRecordID,
      fileIndex: '0',
    };
    client
      .mutate<deleteHealthRecordFiles>({
        mutation: DELETE_HEALTH_RECORD_FILES,
        variables: {
          deleteHealthRecordFilesInput: inputData,
        },
      })
      .then(({ data }) => {
        setshowSpinner(false);
        const status = g(data, 'deleteHealthRecordFiles', 'status');
        if (status) {
          if (recordType === MedicalRecordType.PRESCRIPTION) {
            addMedicalRecord();
          } else if (recordType === MedicalRecordType.TEST_REPORT) {
            addPatientLabTestRecords();
          } else if (recordType === MedicalRecordType.HOSPITALIZATION) {
            addPatientHospitalizationRecords();
          } else if (recordType === MedicalRecordType.MEDICALBILL) {
            addPatientBillRecords();
          } else if (recordType === MedicalRecordType.MEDICALINSURANCE) {
            addPatientInsuranceRecords();
          } else if (
            recordType === MedicalRecordType.ALLERGY ||
            recordType === MedicalRecordType.MEDICALCONDITION
          ) {
            callHealthConditionApis();
          }
        }
      })
      .catch((e) => {
        CommonBugFender('AddRecord_DELETE_HEALTH_RECORD_FILES', e);
        setshowSpinner(false);
        console.log(JSON.stringify(e), 'eeeee');
        currentPatient && handleGraphQlError(e);
      });
  };

  const onSavePress = () => {
    setshowSpinner(true);
    const valid = isValid();
    const callDeleteApi = selectedRecord && callDeleteAttachmentApi;
    if (recordType === MedicalRecordType.TEST_REPORT && isValidImage()) {
      if (valid.isvalid && !valid.isValidParameter) {
        if (callDeleteApi) {
          callDeleteHealthRecordFileApi();
        } else {
          addPatientLabTestRecords();
        }
      } else {
        setshowSpinner(false);
        showAphAlert!({
          title: 'Alert!',
          description: valid.message,
        });
      }
    } else if (
      recordType === MedicalRecordType.PRESCRIPTION &&
      isValidImage() &&
      isValidPrescription()
    ) {
      if (callDeleteApi) {
        callDeleteHealthRecordFileApi();
      } else {
        addMedicalRecord();
      }
    } else if (
      recordType === MedicRecordType.HOSPITALIZATION &&
      isValidImage() &&
      isValidHospitalizationRecord()
    ) {
      if (callDeleteApi) {
        callDeleteHealthRecordFileApi();
      } else {
        addPatientHospitalizationRecords();
      }
    } else if (recordType === MedicalRecordType.MEDICALBILL && isValidBillRecord()) {
      if (callDeleteApi) {
        callDeleteHealthRecordFileApi();
      } else {
        addPatientBillRecords();
      }
    } else if (recordType === MedicalRecordType.MEDICALINSURANCE && isValidInsuranceRecord()) {
      if (callDeleteApi) {
        callDeleteHealthRecordFileApi();
      } else {
        addPatientInsuranceRecords();
      }
    } else if (
      recordType === MedicalRecordType.MEDICALCONDITION ||
      recordType === MedicalRecordType.ALLERGY ||
      recordType === MedicalRecordType.MEDICATION ||
      recordType === MedicalRecordType.HEALTHRESTRICTION
    ) {
      if (
        callDeleteApi &&
        (recordType === MedicalRecordType.MEDICALCONDITION ||
          recordType === MedicalRecordType.ALLERGY)
      ) {
        callDeleteHealthRecordFileApi();
      } else {
        callHealthConditionApis();
      }
    }
  };

  const callAllergyApi = () => {
    if (!allergyName) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter name of allergy',
      });
    } else if (!selectedSeverityType) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please select allergy severity',
      });
    } else if (allergyEndDate && moment(allergyEndDate).isSameOrBefore(dateOfTest)) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please select correct end date of allergy',
      });
    } else if (medicationCheckbox) {
      callMedicationApi();
    } else if (healthRestrictionCheckbox) {
      callHealthRestricitonApi();
    } else if (medicalConditionCheckbox) {
      callMedicalConditionApi();
    } else {
      addAllergyRecord();
    }
  };

  const callMedicationApi = () => {
    if (!medicationMedicineName) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter name of medicine',
      });
    } else if (medicationEndDate && moment(medicationEndDate).isSameOrBefore(dateOfTest)) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please select correct end date of medicine',
      });
    } else if (healthRestrictionCheckbox) {
      callHealthRestricitonApi();
    } else if (medicalConditionCheckbox) {
      callMedicalConditionApi();
    } else if (allergyCheckbox) {
      addAllergyRecord();
    } else {
      addMedicationRecord();
    }
  };

  const callHealthRestricitonApi = () => {
    if (!healthRestrictionName) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter name of health restriction',
      });
    } else if (!selectedRestrictionType) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please select restriction nature',
      });
    } else if (
      healthRestrictionEndDate &&
      moment(healthRestrictionEndDate).isSameOrBefore(dateOfTest)
    ) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please select correct end date of restriction',
      });
    } else if (medicalConditionCheckbox) {
      callMedicalConditionApi();
    } else if (allergyCheckbox) {
      addAllergyRecord();
    } else if (medicationCheckbox) {
      addMedicationRecord();
    } else {
      addHealthRestrictionRecord();
    }
  };

  const callMedicalConditionApi = () => {
    if (!medicalConditionName) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter medical condition name',
      });
    } else if (!medicalConditionDocName) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter name of doctor',
      });
    } else if (!selectedIllnessType) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please select illness type',
      });
    } else if (
      medicalConditionEndDate &&
      moment(medicalConditionEndDate).isSameOrBefore(dateOfTest)
    ) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please select correct end date of condition',
      });
    } else if (allergyCheckbox) {
      addAllergyRecord();
    } else if (medicationCheckbox) {
      addMedicalRecord();
    } else if (healthRestrictionCheckbox) {
      addHealthRestrictionRecord();
    } else {
      addMedicalConditionRecord();
    }
  };

  const callHealthConditionApis = () => {
    setshowSpinner(false);
    if (!dateOfTest) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please enter record date',
      });
    } else {
      if (allergyCheckbox) {
        callAllergyApi();
      } else if (medicationCheckbox) {
        callMedicationApi();
      } else if (healthRestrictionCheckbox) {
        callHealthRestricitonApi();
      } else if (medicalConditionCheckbox) {
        callMedicalConditionApi();
      }
      if (
        !allergyCheckbox &&
        !medicationCheckbox &&
        !healthRestrictionCheckbox &&
        !medicalConditionCheckbox
      ) {
        showAphAlert!({
          title: 'Alert!',
          description: 'Please select any one option to proceed',
        });
      }
    }
  };

  const renderImagesRow = (data: PickerImage, i: number, id: number) => {
    const base64Icon = 'data:image/png;base64,';
    fin = base64Icon.concat(data?.base64);
    const fileType = data?.fileType;
    const deleteImage = () => {
      const imageCOPY =
        id === 1 ? [...Images] : id === 2 ? [...allergyImage] : [...medicalConditionImage];
      imageCOPY.splice(i, 1);
      id === 1
        ? setImages(imageCOPY)
        : id === 2
        ? setAllergyImage(imageCOPY)
        : setMedicalConditionImage(imageCOPY);
      if (imageUpdate) {
        setCallDeleteAttachmentApi(true);
      }
      CommonLogEvent('ADD_RECORD', 'Set Images');
    };
    const onPressRemoveIcon = () => {
      if (
        imageUpdate &&
        (recordType === MedicalRecordType.MEDICALBILL ||
          recordType === MedicalRecordType.MEDICALINSURANCE ||
          recordType === MedicalRecordType.ALLERGY ||
          recordType === MedicalRecordType.MEDICALCONDITION)
      ) {
        Alert.alert('Alert!', 'Are you sure, you want to remove the attachment', [
          { text: 'Yes', onPress: () => deleteImage() },
          { text: 'No', onPress: () => {} },
        ]);
      } else {
        deleteImage();
      }
    };
    return (
      <View style={[styles.addMoreImageViewStyle, { marginRight: 5 }]}>
        <View style={styles.imageViewStyle}>
          <TouchableOpacity
            onPress={onPressRemoveIcon}
            style={{ position: 'absolute', right: -8, zIndex: 99, top: -8 }}
          >
            <PhrRemoveBlueIcon style={{ width: 16, height: 16 }} />
          </TouchableOpacity>
          {fileType === 'pdf' || fileType === 'application/pdf' ? (
            <FileBig style={styles.imageStyle} />
          ) : (
            <Image style={styles.imageStyle} source={{ uri: imageUpdate ? data?.base64 : fin }} />
          )}
        </View>
      </View>
    );
  };

  const renderUploadedImages = (id: number) => {
    const imagesArray = id === 1 ? Images : id === 2 ? allergyImage : medicalConditionImage;
    const onPressAddPage = () => {
      id === 1
        ? setdisplayOrderPopup(true)
        : id === 2
        ? setdisplayAllergyPopup(true)
        : setdisplayMedicalConditionPopup(true);
    };
    const renderAddMorePagesCard = () => {
      return (
        <View style={styles.addMoreImageViewStyle}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={onPressAddPage}
            style={{ height: 72, width: 72, backgroundColor: id === 1 ? '#FFFFFF' : '#979797' }}
          >
            <Text style={[styles.plusTextStyle, id !== 1 && { color: '#FFFFFF' }]}>{'+'}</Text>
            <Text style={[styles.addMoreTextStyle, id !== 1 && { color: '#FFFFFF' }]}>
              {id !== 1 ? 'ADD PAGE' : 'ADD MORE PAGES'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    };
    return (
      <View
        style={[
          styles.imageListViewStyle,
          id !== 1 && {
            marginHorizontal: 14,
            marginBottom: 0,
            marginTop: 0,
          },
        ]}
      >
        <FlatList
          bounces={false}
          data={imagesArray}
          collapsable
          onEndReachedThreshold={0.5}
          horizontal
          renderItem={({ item, index }) => renderImagesRow(item, index, id)}
          keyExtractor={(_, index) => index.toString()}
          ListFooterComponent={() => (imagesArray?.length > 0 ? null : renderAddMorePagesCard())}
        />
        {/* UI for multiple images */}
        {/* {Images?.length > 3 ? renderAddMorePagesCard() : null} */}
      </View>
    );
  };

  const renderListItem = (
    title: string,
    rightIcon: boolean = true,
    mandatoryField: boolean = false
  ) => {
    const renderTitle = () => {
      return (
        <Text style={styles.parameterNameStyle}>
          {title}
          {mandatoryField ? <Text style={{ color: '#E50000' }}>{' *'}</Text> : null}
        </Text>
      );
    };
    return (
      <ListItem
        title={renderTitle()}
        pad={14}
        containerStyle={{ paddingTop: 0, paddingBottom: 3, paddingRight: 20 }}
        rightElement={rightIcon ? <PhrEditIcon style={{ width: 16, height: 16 }} /> : undefined}
      />
    );
  };

  const renderListItemAdd = (
    title: string,
    mandatoryField: boolean = false,
    rightElement: React.ReactElement
  ) => {
    const renderTitle = () => {
      return (
        <Text style={styles.parameterNameStyle}>
          {title}
          {mandatoryField ? <Text style={{ color: '#E50000' }}>{' *'}</Text> : null}
        </Text>
      );
    };
    return (
      <ListItem
        title={renderTitle()}
        pad={14}
        containerStyle={{ paddingTop: 0, paddingBottom: 0, paddingRight: 20 }}
        rightElement={rightElement}
      />
    );
  };

  const renderDoctorPrefixListItem = (
    titleComponent: React.ReactElement,
    style: any = {},
    doctorPrefix: string = 'Dr.'
  ) => {
    return (
      <ListItem
        title={titleComponent}
        pad={0}
        containerStyle={[styles.doctorPrefixContainerStyle, style]}
        leftElement={
          <Text style={{ ...theme.viewStyles.text('M', 16, theme.colors.SKY_BLUE, 1, 20.8) }}>
            {doctorPrefix}
          </Text>
        }
      />
    );
  };

  const renderRecordDetailsTopView = () => {
    const renderRecordTypeIcon = () => {
      return recordType === MedicalRecordType.TEST_REPORT ? (
        <PhrAddTestRecordIcon style={{ width: 35, height: 35, marginLeft: 28 }} />
      ) : recordType === MedicalRecordType.HOSPITALIZATION ? (
        <PhrAddHospitalizationRecordIcon style={{ width: 35, height: 35, marginLeft: 28 }} />
      ) : recordType === MedicalRecordType.MEDICALBILL ? (
        <PhrAddBillRecordIcon style={{ width: 35, height: 35, marginLeft: 28 }} />
      ) : recordType === MedicalRecordType.MEDICALINSURANCE ? (
        <PhrAddInsuranceRecordIcon style={{ width: 35, height: 35, marginLeft: 28 }} />
      ) : (
        <PhrAddPrescriptionRecordIcon style={{ width: 35, height: 35, marginLeft: 28 }} />
      );
    };
    const recordTypeTitle =
      recordType === MedicalRecordType.TEST_REPORT
        ? 'Report'
        : recordType === MedicalRecordType.HOSPITALIZATION
        ? 'Discharge Summary'
        : recordType === MedicalRecordType.MEDICALBILL
        ? 'Bill'
        : recordType === MedicalRecordType.MEDICALINSURANCE
        ? 'Insurance'
        : 'Prescription';
    return (
      <>
        <View style={styles.listItemViewStyle}>
          {renderListItem('Record for', false)}
          <Text style={styles.textInputStyle} numberOfLines={1}>
            {_.capitalize(currentPatient?.firstName) || ''}
          </Text>
        </View>
        {recordType === MedicalRecordType.MEDICALCONDITION ||
        recordType === MedicalRecordType.ALLERGY ||
        recordType === MedicalRecordType.MEDICATION ||
        recordType === MedicalRecordType.HEALTHRESTRICTION ? null : (
          <View style={styles.listItemViewStyle}>
            {renderListItem('Type of Record', false)}
            <View style={{ marginTop: 14, marginHorizontal: 14 }}>
              {renderRecordTypeIcon()}
              <Text
                style={[
                  styles.recordTypeTextStyle,
                  {
                    marginLeft:
                      recordType === MedicalRecordType.TEST_REPORT
                        ? 23
                        : recordType === MedicalRecordType.HOSPITALIZATION
                        ? 0
                        : recordType === MedicalRecordType.MEDICALBILL
                        ? 34
                        : recordType === MedicalRecordType.MEDICALINSURANCE
                        ? 18
                        : 10,
                  },
                ]}
                numberOfLines={1}
              >
                {recordTypeTitle}
              </Text>
            </View>
          </View>
        )}
        <View style={styles.listItemViewStyle}>
          {renderListItem(
            recordType === MedicalRecordType.MEDICALINSURANCE ? 'Record issue date' : 'Record date',
            true,
            true
          )}
          <View style={styles.dateViewStyle}>
            <Text
              style={[styles.textInputStyle, dateOfTest !== '' ? null : styles.placeholderStyle]}
              onPress={() => {
                Keyboard.dismiss();
                setIsDateTimePickerVisible(true);
                CommonLogEvent('ADD_RECORD', 'Date picker visible');
              }}
            >
              {dateOfTest !== '' ? dateOfTest : string.common.date_placeholder_text}
            </Text>
          </View>
          <DatePicker
            isDateTimePickerVisible={isDateTimePickerVisible}
            handleDatePicked={(date) => {
              setIsDateTimePickerVisible(false);
              const formatDate = moment(date).format(string.common.date_placeholder_text);
              setdateOfTest(formatDate);
              Keyboard.dismiss();
            }}
            hideDateTimePicker={() => {
              setIsDateTimePickerVisible(false);
              Keyboard.dismiss();
            }}
          />
        </View>
      </>
    );
  };

  const renderRecordDetailsPrescription = () => {
    return (
      <>
        <View style={styles.listItemViewStyle}>
          {renderListItem('Record name', true, true)}
          <TextInput
            placeholder={'Enter Record name'}
            style={styles.textInputStyle}
            selectionColor={theme.colors.SKY_BLUE}
            numberOfLines={1}
            value={testName}
            placeholderTextColor={theme.colors.placeholderTextColor}
            underlineColorAndroid={'transparent'}
            onChangeText={(testName) => {
              if (isValidText(testName)) {
                settestName(testName);
              }
            }}
          />
        </View>
        <View style={styles.listItemViewStyle}>
          {renderListItem('Record prescribed by', true, true)}
          {renderDoctorPrefixListItem(
            <TextInput
              placeholder={'Enter Record prescribed by'}
              style={styles.doctorPrefixTextInputStyle}
              selectionColor={theme.colors.SKY_BLUE}
              numberOfLines={1}
              value={docName}
              placeholderTextColor={theme.colors.placeholderTextColor}
              underlineColorAndroid={'transparent'}
              onChangeText={(docName) => {
                if (isValidText(docName)) {
                  setDocName(docName);
                }
              }}
            />
          )}
        </View>
        {renderAdditionalTextInputView()}
      </>
    );
  };

  const renderRecordDetailsTestReports = () => {
    const onPressAddRecordParameter = () => {
      const dataCopy = [...testRecordParameters];
      dataCopy.push(TestRecordInitialValues);
      setTestRecordParameters(dataCopy);
    };

    const rightElement = () => {
      return (
        <TouchableOpacity activeOpacity={1} onPress={onPressAddRecordParameter}>
          <PhrAddTestDetailsIcon style={{ width: 24, height: 24 }} />
        </TouchableOpacity>
      );
    };

    const onPressRemoveRecordParameter = (i: number) => {
      const dataCopy = [...testRecordParameters];
      dataCopy?.splice(i, 1);
      setTestRecordParameters(dataCopy);
    };

    const rightElementParameter = (i: number) => {
      return testRecordParameters?.length > 1 ? (
        <TouchableOpacity activeOpacity={1} onPress={() => onPressRemoveRecordParameter(i)}>
          <PhrRemoveTestDetailsIcon style={{ width: 20, height: 20 }} />
        </TouchableOpacity>
      ) : (
        undefined
      );
    };

    const renderTitleParameter = () => {
      return <Text style={styles.parameterNameStyle}>{'Parameter Name'}</Text>;
    };

    const renderTitle = () => {
      return <Text style={styles.parameterNameStyle}>{'Record details'}</Text>;
    };
    return (
      <>
        <View style={styles.listItemViewStyle}>
          {renderListItem('Record name', true, true)}
          <TextInput
            placeholder={'Enter Record name'}
            style={styles.textInputStyle}
            selectionColor={theme.colors.SKY_BLUE}
            numberOfLines={1}
            value={testName}
            placeholderTextColor={theme.colors.placeholderTextColor}
            underlineColorAndroid={'transparent'}
            onChangeText={(testName) => {
              if (isValidText(testName)) {
                settestName(testName);
              }
            }}
          />
        </View>
        <View style={styles.listItemViewStyle}>
          {renderListItem('Record doctor’s name', true, true)}
          {renderDoctorPrefixListItem(
            <TextInput
              placeholder={'Enter Record doctor’s name'}
              style={styles.doctorPrefixTextInputStyle}
              selectionColor={theme.colors.SKY_BLUE}
              numberOfLines={1}
              value={docName}
              placeholderTextColor={theme.colors.placeholderTextColor}
              underlineColorAndroid={'transparent'}
              onChangeText={(docName) => {
                if (isValidText(docName)) {
                  setDocName(docName);
                }
              }}
            />
          )}
        </View>
        <ListItem
          title={renderTitle()}
          pad={14}
          containerStyle={{ paddingTop: 0, paddingBottom: 0, paddingRight: 18, marginTop: 30 }}
          rightElement={rightElement()}
        />
        {testRecordParameters.map((item, i) => (
          <View>
            <View style={{ marginTop: 32 }}>
              <ListItem
                title={renderTitleParameter()}
                pad={14}
                containerStyle={styles.parameterContainerStyle}
                rightElement={rightElementParameter(i)}
              />
              <TextInput
                placeholder={'Enter name'}
                style={[styles.textInputStyle, { marginBottom: 0 }]}
                selectionColor={theme.colors.SKY_BLUE}
                numberOfLines={1}
                placeholderTextColor={theme.colors.placeholderTextColor}
                underlineColorAndroid={'transparent'}
                value={item.parameterName || ''}
                onChangeText={(value) => {
                  if (isValidText(value)) {
                    setTestParametersData('parameterName', value, i);
                  }
                }}
              />
            </View>
            <View style={{ marginTop: 20 }}>
              {renderListItem('Result', true)}
              <View style={{ flexDirection: 'row' }}>
                <TextInput
                  placeholder={'0'}
                  style={[styles.textInputStyle, { marginBottom: 0 }]}
                  selectionColor={theme.colors.SKY_BLUE}
                  numberOfLines={1}
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  underlineColorAndroid={'transparent'}
                  value={(item.result || '').toString()}
                  onChangeText={(value) => setTestParametersData('result', value, i, true)}
                  keyboardType={numberKeyboardType}
                />
                <TextInput
                  placeholder={'unit'}
                  style={[styles.textInputStyle, { marginBottom: 0 }]}
                  selectionColor={theme.colors.SKY_BLUE}
                  numberOfLines={1}
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  underlineColorAndroid={'transparent'}
                  value={(item.unit || '').toString()}
                  onChangeText={(value) => {
                    if (/^([a-zA-Z0-9 %]+[ ]{0,1}[a-zA-Z0-9\-.\\/%?,&]*)*$/.test(value)) {
                      setTestParametersData('unit', value, i);
                    }
                  }}
                />
              </View>
            </View>
            <View style={{ marginTop: 20 }}>
              {renderListItem('Range', true)}
              <View style={{ flexDirection: 'row', marginTop: 5 }}>
                <TextInput
                  placeholder={'min'}
                  style={[styles.textInputStyle, { marginBottom: 0 }]}
                  selectionColor={theme.colors.SKY_BLUE}
                  numberOfLines={1}
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  underlineColorAndroid={'transparent'}
                  value={(item.minimum || '').toString()}
                  onChangeText={(value) => setTestParametersData('minimum', value, i, true)}
                  keyboardType={numberKeyboardType}
                />
                <TextInput
                  placeholder={'unit'}
                  style={[styles.textInputStyle, { marginBottom: 0 }]}
                  selectionColor={theme.colors.SKY_BLUE}
                  numberOfLines={1}
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  underlineColorAndroid={'transparent'}
                  value={(item.unit || '').toString()}
                  onChangeText={(value) => {
                    if (/^([a-zA-Z0-9 %]+[ ]{0,1}[a-zA-Z0-9\-.\\/%?,&]*)*$/.test(value)) {
                      setTestParametersData('unit', value, i);
                    }
                  }}
                />
                <TextInput
                  placeholder={'max'}
                  style={[styles.textInputStyle, { marginBottom: 0 }]}
                  selectionColor={theme.colors.SKY_BLUE}
                  numberOfLines={1}
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  underlineColorAndroid={'transparent'}
                  value={(item.maximum || '').toString()}
                  onChangeText={(value) => setTestParametersData('maximum', value, i, true)}
                  keyboardType={numberKeyboardType}
                />
                <TextInput
                  placeholder={'unit'}
                  style={[styles.textInputStyle, { marginBottom: 0 }]}
                  selectionColor={theme.colors.SKY_BLUE}
                  numberOfLines={1}
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  underlineColorAndroid={'transparent'}
                  value={(item.unit || '').toString()}
                  onChangeText={(value) => {
                    if (/^([a-zA-Z0-9 %]+[ ]{0,1}[a-zA-Z0-9\-.\\/%?,&]*)*$/.test(value)) {
                      setTestParametersData('unit', value, i);
                    }
                  }}
                />
              </View>
            </View>
          </View>
        ))}
        {renderAdditionalTextInputView()}
      </>
    );
  };

  const renderAdditionalTextInputView = () => {
    return (
      <View style={{ marginTop: 32 }}>
        {renderListItem(string.common.additional_text, false)}
        <TextInput
          placeholder={string.common.enter_additional_text}
          style={[styles.textInputStyle, styles.additionalTextInputStyle]}
          multiline
          selectionColor={theme.colors.SKY_BLUE}
          value={additionalNotes}
          placeholderTextColor={theme.colors.placeholderTextColor}
          underlineColorAndroid={'transparent'}
          onChangeText={(additionalNotes) => {
            if (isValidText(additionalNotes)) {
              setadditionalNotes(additionalNotes);
            }
          }}
        />
      </View>
    );
  };

  const renderRecordDetailsHospitalization = () => {
    return (
      <>
        <View style={styles.listItemViewStyle}>
          {renderListItem('Record doctor’s name', true, true)}
          {renderDoctorPrefixListItem(
            <TextInput
              placeholder={'Enter Record doctor’s name'}
              style={styles.doctorPrefixTextInputStyle}
              selectionColor={theme.colors.SKY_BLUE}
              numberOfLines={1}
              value={docName}
              placeholderTextColor={theme.colors.placeholderTextColor}
              underlineColorAndroid={'transparent'}
              onChangeText={(docName) => {
                if (isValidText(docName)) {
                  setDocName(docName);
                }
              }}
            />
          )}
        </View>
        <View style={styles.listItemViewStyle}>
          {renderListItem('Record from', true, true)}
          <TextInput
            placeholder={'Enter Record from'}
            style={styles.textInputStyle}
            selectionColor={theme.colors.SKY_BLUE}
            numberOfLines={1}
            value={testName}
            placeholderTextColor={theme.colors.placeholderTextColor}
            underlineColorAndroid={'transparent'}
            onChangeText={(testName) => {
              if (isValidText(testName)) {
                settestName(testName);
              }
            }}
          />
        </View>
        {renderAdditionalTextInputView()}
      </>
    );
  };

  const renderRecordDetailsBill = () => {
    return (
      <>
        <View style={styles.listItemViewStyle}>
          {renderListItem('Record hospital name', true, true)}
          <TextInput
            placeholder={'Enter Record hospital name'}
            style={styles.textInputStyle}
            selectionColor={theme.colors.SKY_BLUE}
            numberOfLines={1}
            value={docName}
            placeholderTextColor={theme.colors.placeholderTextColor}
            underlineColorAndroid={'transparent'}
            onChangeText={(docName) => {
              if (isValidText(docName)) {
                setDocName(docName);
              }
            }}
          />
        </View>
        <View style={[styles.listItemViewStyle, { marginBottom: 33 }]}>
          {renderListItem('Record bill number', true, true)}
          <TextInput
            placeholder={'Enter Record bill number'}
            style={styles.textInputStyle}
            selectionColor={theme.colors.SKY_BLUE}
            numberOfLines={1}
            value={testName}
            placeholderTextColor={theme.colors.placeholderTextColor}
            underlineColorAndroid={'transparent'}
            onChangeText={(testName) => {
              if (isValidText(testName)) {
                settestName(testName);
              }
            }}
          />
        </View>
      </>
    );
  };

  const renderRecordDetailsInsurance = () => {
    return (
      <>
        <View style={styles.listItemViewStyle}>
          {renderListItem('Record end date', true, true)}
          <View style={styles.dateViewStyle}>
            <Text
              style={[styles.textInputStyle, endDate !== '' ? null : styles.placeholderStyle]}
              onPress={() => {
                Keyboard.dismiss();
                setEndDateTimePickerVisible(true);
                CommonLogEvent('ADD_RECORD', 'Date picker visible');
              }}
            >
              {endDate !== '' ? endDate : string.common.date_placeholder_text}
            </Text>
          </View>
          <DatePicker
            isDateTimePickerVisible={endDateTimePickerVisible}
            handleDatePicked={(date) => {
              setEndDateTimePickerVisible(false);
              const formatDate = moment(date).format(string.common.date_placeholder_text);
              setEndDate(formatDate);
              Keyboard.dismiss();
            }}
            hideDateTimePicker={() => {
              setEndDateTimePickerVisible(false);
              Keyboard.dismiss();
            }}
            maximumDate={false}
          />
        </View>
        <View style={styles.listItemViewStyle}>
          {renderListItem('Record name', true, true)}
          <TextInput
            placeholder={'Enter Record name'}
            style={styles.textInputStyle}
            selectionColor={theme.colors.SKY_BLUE}
            numberOfLines={1}
            value={testName}
            placeholderTextColor={theme.colors.placeholderTextColor}
            underlineColorAndroid={'transparent'}
            onChangeText={(testName) => {
              if (isValidText(testName)) {
                settestName(testName);
              }
            }}
          />
        </View>
        <View style={styles.listItemViewStyle}>
          {renderListItem('Record insurance amount ', true, true)}
          {renderDoctorPrefixListItem(
            <TextInput
              placeholder={'Enter Record insurance amount '}
              style={styles.doctorPrefixTextInputStyle}
              selectionColor={theme.colors.SKY_BLUE}
              numberOfLines={1}
              value={locationName}
              keyboardType={numberKeyboardType}
              placeholderTextColor={theme.colors.placeholderTextColor}
              underlineColorAndroid={'transparent'}
              onChangeText={(locName) => {
                if (/^[0-9.]*$/.test(locName)) {
                  setLocationName(locName);
                }
              }}
            />,
            {},
            'Rs'
          )}
        </View>
        <View style={styles.listItemViewStyle}>
          {renderListItem('Record ID number', true)}
          <TextInput
            placeholder={'Enter Record ID number'}
            style={styles.textInputStyle}
            selectionColor={theme.colors.SKY_BLUE}
            numberOfLines={1}
            value={docName}
            placeholderTextColor={theme.colors.placeholderTextColor}
            underlineColorAndroid={'transparent'}
            onChangeText={(docName) => {
              if (isValidText(docName)) {
                setDocName(docName);
              }
            }}
          />
        </View>
        {renderAdditionalTextInputView()}
      </>
    );
  };

  const renderAllergyDetails = () => {
    const rightElement = () => {
      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowAllergyDetails(!showAllergyDetails)}
        >
          {showAllergyDetails ? (
            <PhrMinusCircleIcon style={{ width: 24, height: 24 }} />
          ) : (
            <PhrAddTestDetailsIcon style={{ width: 24, height: 24 }} />
          )}
        </TouchableOpacity>
      );
    };
    return (
      <>
        <View>
          {renderListItem('Allergy name', true, true)}
          <TextInput
            placeholder={string.common.enter_name_of_text?.replace('{0}', 'allergy')}
            style={styles.textInputStyle}
            selectionColor={theme.colors.SKY_BLUE}
            numberOfLines={1}
            value={allergyName}
            keyboardType={'numbers-and-punctuation'}
            placeholderTextColor={theme.colors.placeholderTextColor}
            underlineColorAndroid={'transparent'}
            onChangeText={(locName) => {
              if (isValidText(locName)) {
                setAllergyName(locName);
              }
            }}
          />
        </View>
        <View style={styles.illnessTypeViewStyle}>
          {renderListItemAdd('Severity of allergy', true, rightElement())}
          <View style={styles.menuContainerViewStyle}>
            <MaterialMenu
              menuContainerStyle={styles.menuContainerStyle}
              itemContainer={{ height: 44.8, width: 150 / 2 }}
              itemTextStyle={styles.itemTextStyle}
              selectedTextStyle={styles.selectedTextStyle}
              lastContainerStyle={{ borderBottomWidth: 0 }}
              bottomPadding={{ paddingBottom: 0 }}
              options={severityType}
              selectedText={selectedSeverityType!}
              onPress={(data) => {
                setSelectedSeverityType(data.key as AllergySeverity);
              }}
            >
              <TextInputComponent noInput={true} conatinerstyles={{ paddingBottom: 0 }} />
              <View style={{ flexDirection: 'row' }}>
                <View style={[styles.placeholderViewStyle]}>
                  <Text
                    style={[
                      styles.placeholderTextStyle,
                      !selectedSeverityType && styles.placeholderStyle,
                    ]}
                    numberOfLines={1}
                  >
                    {selectedSeverityType
                      ? severityType?.find((item) => item.key === selectedSeverityType)?.value
                      : string.common.select_text}
                  </Text>
                  <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
                    <PhrDropdownBlueUpIcon />
                  </View>
                </View>
              </View>
            </MaterialMenu>
          </View>
        </View>
        {showAllergyDetails ? (
          <>
            {renderListItem(string.common.doctor_name_text)}
            {renderDoctorPrefixListItem(
              <TextInput
                placeholder={string.common.enter_doctor_name_text}
                style={styles.doctorPrefixTextInputStyle}
                selectionColor={theme.colors.SKY_BLUE}
                numberOfLines={1}
                value={allergyDocName}
                keyboardType={'numbers-and-punctuation'}
                placeholderTextColor={theme.colors.placeholderTextColor}
                underlineColorAndroid={'transparent'}
                onChangeText={(locName) => {
                  if (isValidText(locName)) {
                    setAllergyDocName(locName);
                  }
                }}
              />
            )}
            {renderListItem(string.common.end_date_text)}
            <View style={styles.dateViewStyle}>
              <Text
                style={[
                  styles.textInputStyle,
                  allergyEndDate !== '' ? null : styles.placeholderStyle,
                  { marginBottom: 20 },
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setIsAllergyDateTimePicker(true);
                  CommonLogEvent('ADD_RECORD', 'Date picker visible');
                }}
              >
                {allergyEndDate !== ''
                  ? allergyEndDate
                  : string.common.enter_date_text?.replace('{0}', 'allergy')}
              </Text>
            </View>
            <DatePicker
              isDateTimePickerVisible={isAllergyDateTimePicker}
              handleDatePicked={(date) => {
                setIsAllergyDateTimePicker(false);
                const formatDate = moment(date).format(string.common.date_placeholder_text);
                setAllergyEndDate(formatDate);
                Keyboard.dismiss();
              }}
              hideDateTimePicker={() => {
                setIsAllergyDateTimePicker(false);
                Keyboard.dismiss();
              }}
              maximumDate={false}
            />
            {renderListItem('Allergy Reaction')}
            <TextInput
              placeholder={'Enter allergy reaction'}
              style={styles.textInputStyle}
              selectionColor={theme.colors.SKY_BLUE}
              numberOfLines={1}
              value={allergyReaction}
              keyboardType={'numbers-and-punctuation'}
              placeholderTextColor={theme.colors.placeholderTextColor}
              underlineColorAndroid={'transparent'}
              onChangeText={(locName) => {
                if (isValidText(locName)) {
                  setAllergyReaction(locName);
                }
              }}
            />

            {renderUploadedImages(2)}
            <View style={{ marginTop: 24 }}>
              {renderListItem(string.common.additional_text, false)}
              <TextInput
                placeholder={string.common.enter_additional_text}
                style={[styles.textInputStyle, styles.additionalTextInputStyle]}
                multiline
                selectionColor={theme.colors.SKY_BLUE}
                numberOfLines={1}
                value={allergyAdditionalNotes}
                placeholderTextColor={theme.colors.placeholderTextColor}
                underlineColorAndroid={'transparent'}
                onChangeText={(additionalNotes) => {
                  if (isValidText(additionalNotes)) {
                    setAllergyAdditionalNotes(additionalNotes);
                  }
                }}
              />
            </View>
          </>
        ) : null}
      </>
    );
  };

  const renderHealthRestrictionDetails = () => {
    const rightElement = () => {
      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowHealthRestrictionDetails(!showHealthRestrictionDetails)}
        >
          {showHealthRestrictionDetails ? (
            <PhrMinusCircleIcon style={{ width: 24, height: 24 }} />
          ) : (
            <PhrAddTestDetailsIcon style={{ width: 24, height: 24 }} />
          )}
        </TouchableOpacity>
      );
    };
    return (
      <>
        <View>
          {renderListItem('Health restriction name', true, true)}
          <TextInput
            placeholder={string.common.enter_name_of_text?.replace('{0}', 'health restriction')}
            style={[styles.textInputStyle]}
            selectionColor={theme.colors.SKY_BLUE}
            numberOfLines={1}
            value={healthRestrictionName}
            keyboardType={'numbers-and-punctuation'}
            placeholderTextColor={theme.colors.placeholderTextColor}
            underlineColorAndroid={'transparent'}
            onChangeText={(locName) => {
              if (isValidText(locName)) {
                setHealthRestrictionName(locName);
              }
            }}
          />
        </View>
        <View style={styles.illnessTypeViewStyle}>
          {renderListItemAdd('Nature of restriction', true, rightElement())}
          <View style={styles.menuContainerViewStyle}>
            <MaterialMenu
              menuContainerStyle={styles.menuContainerStyle}
              itemContainer={{ height: 44.8, width: 150 / 2 }}
              itemTextStyle={styles.itemTextStyle}
              selectedTextStyle={styles.selectedTextStyle}
              lastContainerStyle={{ borderBottomWidth: 0 }}
              bottomPadding={{ paddingBottom: 0 }}
              options={natureType}
              selectedText={selectedRestrictionType!}
              onPress={(data) => {
                setSelectedRestrictionType(data.key as HealthRestrictionNature);
              }}
            >
              <TextInputComponent noInput={true} conatinerstyles={{ paddingBottom: 0 }} />
              <View style={{ flexDirection: 'row' }}>
                <View style={[styles.placeholderViewStyle]}>
                  <Text
                    style={[
                      styles.placeholderTextStyle,
                      !selectedRestrictionType && styles.placeholderStyle,
                    ]}
                  >
                    {selectedRestrictionType
                      ? natureType?.find((item) => item.key === selectedRestrictionType)?.value
                      : string.common.select_text}
                  </Text>
                  <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
                    <PhrDropdownBlueUpIcon />
                  </View>
                </View>
              </View>
            </MaterialMenu>
          </View>
        </View>
        {showHealthRestrictionDetails ? (
          <>
            {renderListItem(string.common.doctor_name_text)}
            {renderDoctorPrefixListItem(
              <TextInput
                placeholder={string.common.enter_doctor_name_text}
                style={styles.doctorPrefixTextInputStyle}
                selectionColor={theme.colors.SKY_BLUE}
                numberOfLines={1}
                value={healthRestrictionDocName}
                keyboardType={'numbers-and-punctuation'}
                placeholderTextColor={theme.colors.placeholderTextColor}
                underlineColorAndroid={'transparent'}
                onChangeText={(locName) => {
                  if (isValidText(locName)) {
                    setHealthRestrictionDocName(locName);
                  }
                }}
              />
            )}
            {renderListItem(string.common.end_date_text)}
            <View style={styles.dateViewStyle}>
              <Text
                style={[
                  styles.textInputStyle,
                  healthRestrictionEndDate !== '' ? null : styles.placeholderStyle,
                  { marginBottom: 20 },
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setIsHealthRestrictionDateTimePicker(true);
                  CommonLogEvent('ADD_RECORD', 'Date picker visible');
                }}
              >
                {healthRestrictionEndDate !== ''
                  ? healthRestrictionEndDate
                  : string.common.enter_date_text?.replace('{0}', 'restriction')}
              </Text>
            </View>
            <DatePicker
              isDateTimePickerVisible={isHealthRestrictionDateTimePicker}
              handleDatePicked={(date) => {
                setIsHealthRestrictionDateTimePicker(false);
                const formatDate = moment(date).format(string.common.date_placeholder_text);
                setHealthRestrictionEndDate(formatDate);
                Keyboard.dismiss();
              }}
              hideDateTimePicker={() => {
                setIsHealthRestrictionDateTimePicker(false);
                Keyboard.dismiss();
              }}
              maximumDate={false}
            />
            {renderListItem(string.common.additional_text, false)}
            <TextInput
              placeholder={string.common.enter_additional_text}
              style={[styles.textInputStyle, styles.additionalTextInputStyle]}
              multiline
              selectionColor={theme.colors.SKY_BLUE}
              numberOfLines={1}
              value={healthRestrictionAdditionalNotes}
              placeholderTextColor={theme.colors.placeholderTextColor}
              underlineColorAndroid={'transparent'}
              onChangeText={(additionalNotes) => {
                if (isValidText(additionalNotes)) {
                  setHealthRestrictionAdditionalNotes(additionalNotes);
                }
              }}
            />
          </>
        ) : null}
      </>
    );
  };

  const renderMedicalConditionDetails = () => {
    const rightElement = () => {
      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowMedicalConditionDetails(!showMedicalConditionDetails)}
        >
          {showMedicalConditionDetails ? (
            <PhrMinusCircleIcon style={{ width: 24, height: 24 }} />
          ) : (
            <PhrAddTestDetailsIcon style={{ width: 24, height: 24 }} />
          )}
        </TouchableOpacity>
      );
    };
    return (
      <>
        <View>
          {renderListItem('Medical condition name', true, true)}
          <TextInput
            placeholder={string.common.enter_name_of_text?.replace('{0}', 'medical condition')}
            style={[styles.textInputStyle]}
            selectionColor={theme.colors.SKY_BLUE}
            numberOfLines={1}
            value={medicalConditionName}
            keyboardType={'numbers-and-punctuation'}
            placeholderTextColor={theme.colors.placeholderTextColor}
            underlineColorAndroid={'transparent'}
            onChangeText={(locName) => {
              if (isValidText(locName)) {
                setMedicalConditionName(locName);
              }
            }}
          />
        </View>
        {renderListItem(string.common.doctor_name_text, false, true)}
        {renderDoctorPrefixListItem(
          <TextInput
            placeholder={string.common.enter_doctor_name_text}
            style={styles.doctorPrefixTextInputStyle}
            selectionColor={theme.colors.SKY_BLUE}
            numberOfLines={1}
            value={medicalConditionDocName}
            keyboardType={'numbers-and-punctuation'}
            placeholderTextColor={theme.colors.placeholderTextColor}
            underlineColorAndroid={'transparent'}
            onChangeText={(locName) => {
              if (isValidText(locName)) {
                setMedicalConditionDocName(locName);
              }
            }}
          />
        )}
        <View style={styles.illnessTypeViewStyle}>
          {renderListItemAdd('Illness type', true, rightElement())}
          <View style={styles.menuContainerViewStyle}>
            <MaterialMenu
              menuContainerStyle={styles.menuContainerStyle}
              itemContainer={{ height: 44.8, width: 150 / 2 }}
              itemTextStyle={styles.itemTextStyle}
              selectedTextStyle={styles.selectedTextStyle}
              lastContainerStyle={{ borderBottomWidth: 0 }}
              bottomPadding={{ paddingBottom: 0 }}
              options={illnessTypeArray}
              selectedText={selectedIllnessType!}
              onPress={(data) => {
                setSelectedIllnessType(data.key as MedicalConditionIllnessTypes);
              }}
            >
              <TextInputComponent noInput={true} conatinerstyles={{ paddingBottom: 0 }} />
              <View style={{ flexDirection: 'row' }}>
                <View style={[styles.placeholderViewStyle]}>
                  <Text
                    style={[
                      styles.placeholderTextStyle,
                      !selectedIllnessType && styles.placeholderStyle,
                    ]}
                  >
                    {selectedIllnessType
                      ? illnessTypeArray?.find((item) => item.key === selectedIllnessType)?.value
                      : string.common.select_text}
                  </Text>
                  <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
                    <PhrDropdownBlueUpIcon />
                  </View>
                </View>
              </View>
            </MaterialMenu>
          </View>
        </View>
        {showMedicalConditionDetails ? (
          <>
            {renderListItem(string.common.end_date_text)}
            <View style={styles.dateViewStyle}>
              <Text
                style={[
                  styles.textInputStyle,
                  medicalConditionEndDate !== '' ? null : styles.placeholderStyle,
                  { marginBottom: 10 },
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setIsMedicalConditionDateTimePicker(true);
                  CommonLogEvent('ADD_RECORD', 'Date picker visible');
                }}
              >
                {medicalConditionEndDate !== ''
                  ? medicalConditionEndDate
                  : string.common.enter_date_text?.replace('{0}', 'condition')}
              </Text>
            </View>
            <DatePicker
              isDateTimePickerVisible={isMedicalConditionDateTimePicker}
              handleDatePicked={(date) => {
                setIsMedicalConditionDateTimePicker(false);
                const formatDate = moment(date).format(string.common.date_placeholder_text);
                setMedicalConditionEndDate(formatDate);
                Keyboard.dismiss();
              }}
              hideDateTimePicker={() => {
                setIsMedicalConditionDateTimePicker(false);
                Keyboard.dismiss();
              }}
              maximumDate={false}
            />
            {renderUploadedImages(3)}
            <View style={{ marginTop: 32 }}>
              {renderListItem(string.common.additional_text, false)}
              <TextInput
                placeholder={string.common.enter_additional_text}
                style={[styles.textInputStyle, styles.additionalTextInputStyle]}
                multiline
                selectionColor={theme.colors.SKY_BLUE}
                numberOfLines={1}
                value={medicalConditionAdditionalNotes}
                placeholderTextColor={theme.colors.placeholderTextColor}
                underlineColorAndroid={'transparent'}
                onChangeText={(additionalNotes) => {
                  if (isValidText(additionalNotes)) {
                    setMedicalConditionAdditionalNotes(additionalNotes);
                  }
                }}
              />
            </View>
          </>
        ) : null}
      </>
    );
  };

  const renderMedicationDetails = () => {
    const rightElement = () => {
      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowMedicationDetails(!showMedicationDetails)}
        >
          {showMedicationDetails ? (
            <PhrMinusCircleIcon style={{ width: 24, height: 24 }} />
          ) : (
            <PhrAddTestDetailsIcon style={{ width: 24, height: 24 }} />
          )}
        </TouchableOpacity>
      );
    };
    return (
      <>
        <View>
          {renderListItemAdd('Medicine name', true, rightElement())}
          <TextInput
            placeholder={string.common.enter_name_of_text?.replace('{0}', 'medicine')}
            style={[styles.textInputStyle]}
            selectionColor={theme.colors.SKY_BLUE}
            numberOfLines={1}
            value={medicationMedicineName}
            keyboardType={'numbers-and-punctuation'}
            placeholderTextColor={theme.colors.placeholderTextColor}
            underlineColorAndroid={'transparent'}
            onChangeText={(locName) => {
              if (isValidText(locName)) {
                setMedicationMedicineName(locName);
              }
            }}
          />
        </View>
        {showMedicationDetails ? (
          <>
            {renderListItem('Medical condition')}
            <TextInput
              placeholder={'Enter medical condition'}
              style={[styles.textInputStyle]}
              selectionColor={theme.colors.SKY_BLUE}
              numberOfLines={1}
              value={medicationCondition}
              keyboardType={'numbers-and-punctuation'}
              placeholderTextColor={theme.colors.placeholderTextColor}
              underlineColorAndroid={'transparent'}
              onChangeText={(locName) => {
                if (isValidText(locName)) {
                  setMedicationCondition(locName);
                }
              }}
            />
            {renderListItem(string.common.doctor_name_text)}
            {renderDoctorPrefixListItem(
              <TextInput
                placeholder={string.common.enter_doctor_name_text}
                style={styles.doctorPrefixTextInputStyle}
                selectionColor={theme.colors.SKY_BLUE}
                numberOfLines={1}
                value={medicationDocName}
                keyboardType={'numbers-and-punctuation'}
                placeholderTextColor={theme.colors.placeholderTextColor}
                underlineColorAndroid={'transparent'}
                onChangeText={(locName) => {
                  if (isValidText(locName)) {
                    setMedicationDocName(locName);
                  }
                }}
              />
            )}
            {renderListItem(string.common.end_date_text)}
            <View style={styles.dateViewStyle}>
              <Text
                style={[
                  styles.textInputStyle,
                  medicationEndDate !== '' ? null : styles.placeholderStyle,
                  { marginBottom: 20 },
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setIsMedicationDateTimePicker(true);
                  CommonLogEvent('ADD_RECORD', 'Date picker visible');
                }}
              >
                {medicationEndDate !== ''
                  ? medicationEndDate
                  : string.common.enter_date_text?.replace('{0}', 'medicine')}
              </Text>
            </View>
            <DatePicker
              isDateTimePickerVisible={isMedicationDateTimePicker}
              handleDatePicked={(date) => {
                setIsMedicationDateTimePicker(false);
                const formatDate = moment(date).format(string.common.date_placeholder_text);
                setMedicationEndDate(formatDate);
                Keyboard.dismiss();
              }}
              hideDateTimePicker={() => {
                setIsMedicationDateTimePicker(false);
                Keyboard.dismiss();
              }}
              maximumDate={false}
            />
            {renderListItem('Dosage Level', false)}
            <View style={styles.morningViewStyle}>
              <TouchableOpacity
                onPress={() => setIsMorningChecked(!isMorningChecked)}
                style={{ flexDirection: 'row', flex: 1 }}
              >
                {isMorningChecked ? (
                  <PhrCheckboxIcon style={{ height: 18, width: 18 }} />
                ) : (
                  <PhrUncheckboxIcon style={{ width: 18, height: 18 }} />
                )}
                <Text style={styles.morningTextStyle}>{'Morning'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsNoonChecked(!isNoonChecked)}
                style={{ flexDirection: 'row', flex: 1 }}
              >
                {isNoonChecked ? (
                  <PhrCheckboxIcon style={{ height: 18, width: 18 }} />
                ) : (
                  <PhrUncheckboxIcon style={{ width: 18, height: 18 }} />
                )}
                <Text style={styles.morningTextStyle}>{'Noon'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsEveningChecked(!isEveningChecked)}
                style={{ flexDirection: 'row', flex: 1 }}
              >
                {isEveningChecked ? (
                  <PhrCheckboxIcon style={{ height: 18, width: 18 }} />
                ) : (
                  <PhrUncheckboxIcon style={{ width: 18, height: 18 }} />
                )}
                <Text style={styles.morningTextStyle}>{'Evening'}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ marginTop: 32 }}>
              {renderListItem(string.common.additional_text, false)}
              <TextInput
                placeholder={'Enter additional notes'}
                style={[styles.textInputStyle, styles.additionalTextInputStyle]}
                multiline
                selectionColor={theme.colors.SKY_BLUE}
                numberOfLines={1}
                value={medicationAdditionalNotes}
                placeholderTextColor={theme.colors.placeholderTextColor}
                underlineColorAndroid={'transparent'}
                onChangeText={(additionalNotes) => {
                  if (isValidText(additionalNotes)) {
                    setMedicationAdditionalNotes(additionalNotes);
                  }
                }}
              />
            </View>
          </>
        ) : null}
      </>
    );
  };

  const renderAllergyTopView = () => {
    return (
      <View style={styles.allergyViewStyle}>
        <TouchableOpacity
          onPress={() => setAllergyCheckbox(!allergyCheckbox)}
          style={{ flexDirection: 'row', flex: 1 }}
        >
          {allergyCheckbox ? (
            <PhrCheckboxIcon style={{ height: 18, width: 18 }} />
          ) : (
            <PhrUncheckboxIcon style={{ width: 18, height: 18 }} />
          )}
          <Text style={styles.morningTextStyle}>{'Yes'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setAllergyCheckbox(!allergyCheckbox)}
          style={{ flexDirection: 'row', flex: 1 }}
        >
          {!allergyCheckbox ? (
            <PhrCheckboxIcon style={{ height: 18, width: 18 }} />
          ) : (
            <PhrUncheckboxIcon style={{ width: 18, height: 18 }} />
          )}
          <Text style={styles.morningTextStyle}>{'No'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMedicationTopView = () => {
    return (
      <View style={styles.allergyViewStyle}>
        <TouchableOpacity
          onPress={() => setMedicationCheckbox(!medicationCheckbox)}
          style={{ flexDirection: 'row', flex: 1 }}
        >
          {medicationCheckbox ? (
            <PhrCheckboxIcon style={{ height: 18, width: 18 }} />
          ) : (
            <PhrUncheckboxIcon style={{ width: 18, height: 18 }} />
          )}
          <Text style={styles.morningTextStyle}>{'Yes'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMedicationCheckbox(!medicationCheckbox)}
          style={{ flexDirection: 'row', flex: 1 }}
        >
          {!medicationCheckbox ? (
            <PhrCheckboxIcon style={{ height: 18, width: 18 }} />
          ) : (
            <PhrUncheckboxIcon style={{ width: 18, height: 18 }} />
          )}
          <Text style={styles.morningTextStyle}>{'No'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHealthRestrictionTopView = () => {
    return (
      <View style={styles.allergyViewStyle}>
        <TouchableOpacity
          onPress={() => setHealthRestrictionCheckbox(!healthRestrictionCheckbox)}
          style={{ flexDirection: 'row', flex: 1 }}
        >
          {healthRestrictionCheckbox ? (
            <PhrCheckboxIcon style={{ height: 18, width: 18 }} />
          ) : (
            <PhrUncheckboxIcon style={{ width: 18, height: 18 }} />
          )}
          <Text style={styles.morningTextStyle}>{'Yes'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setHealthRestrictionCheckbox(!healthRestrictionCheckbox)}
          style={{ flexDirection: 'row', flex: 1 }}
        >
          {!healthRestrictionCheckbox ? (
            <PhrCheckboxIcon style={{ height: 18, width: 18 }} />
          ) : (
            <PhrUncheckboxIcon style={{ width: 18, height: 18 }} />
          )}
          <Text style={styles.morningTextStyle}>{'No'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMedicalConditionTopView = () => {
    return (
      <View style={styles.allergyViewStyle}>
        <TouchableOpacity
          onPress={() => setMedicalConditionCheckbox(!medicalConditionCheckbox)}
          style={{ flexDirection: 'row', flex: 1 }}
        >
          {medicalConditionCheckbox ? (
            <PhrCheckboxIcon style={{ height: 18, width: 18 }} />
          ) : (
            <PhrUncheckboxIcon style={{ width: 18, height: 18 }} />
          )}
          <Text style={styles.morningTextStyle}>{'Yes'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMedicalConditionCheckbox(!medicalConditionCheckbox)}
          style={{ flexDirection: 'row', flex: 1 }}
        >
          {!medicalConditionCheckbox ? (
            <PhrCheckboxIcon style={{ height: 18, width: 18 }} />
          ) : (
            <PhrUncheckboxIcon style={{ width: 18, height: 18 }} />
          )}
          <Text style={styles.morningTextStyle}>{'No'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderUpdateRecordDetailsHealthCondition = () => {
    return (
      <View style={styles.illnessTypeViewStyle}>
        {recordType === MedicalRecordType.ALLERGY ? renderAllergyView() : null}
        {recordType === MedicalRecordType.MEDICATION ? renderMedicationView() : null}
        {recordType === MedicalRecordType.HEALTHRESTRICTION ? renderHealthRestrictionView() : null}
        {recordType === MedicalRecordType.MEDICALCONDITION ? renderMedicalConditionView() : null}
      </View>
    );
  };

  const renderAllergyView = () => {
    return (
      <View style={styles.listItemViewStyle}>
        {renderListItem('Do you have any allergy?', false)}
        {renderAllergyTopView()}
        {allergyCheckbox ? renderAllergyDetails() : null}
      </View>
    );
  };

  const renderMedicationView = () => {
    return (
      <View style={styles.listItemViewStyle}>
        {renderListItem('Are you taking any medication?', false)}
        {renderMedicationTopView()}
        {medicationCheckbox ? renderMedicationDetails() : null}
      </View>
    );
  };

  const renderHealthRestrictionView = () => {
    return (
      <View style={styles.listItemViewStyle}>
        {renderListItem('Do you have any health restrictions?', false)}
        {renderHealthRestrictionTopView()}
        {healthRestrictionCheckbox ? renderHealthRestrictionDetails() : null}
      </View>
    );
  };

  const renderMedicalConditionView = () => {
    return (
      <View style={styles.listItemViewStyle}>
        {renderListItem('Are you suffering from any medical condition?', false)}
        {renderMedicalConditionTopView()}
        {medicalConditionCheckbox ? renderMedicalConditionDetails() : null}
      </View>
    );
  };

  const renderRecordDetailsHealthCondition = () => {
    return (
      <View style={styles.illnessTypeViewStyle}>
        {renderAllergyView()}
        {renderMedicationView()}
        {renderHealthRestrictionView()}
        {renderMedicalConditionView()}
      </View>
    );
  };

  const renderRecordDetailsCard = () => {
    return (
      <View style={{ ...theme.viewStyles.cardViewStyle, marginHorizontal: 7, marginBottom: 30 }}>
        {renderRecordDetailsTopView()}
        {recordType === MedicalRecordType.TEST_REPORT
          ? renderRecordDetailsTestReports()
          : recordType === MedicalRecordType.HOSPITALIZATION
          ? renderRecordDetailsHospitalization()
          : recordType === MedicalRecordType.MEDICALBILL
          ? renderRecordDetailsBill()
          : recordType === MedicalRecordType.MEDICALINSURANCE
          ? renderRecordDetailsInsurance()
          : recordType === MedicalRecordType.MEDICALCONDITION ||
            recordType === MedicalRecordType.ALLERGY ||
            recordType === MedicalRecordType.MEDICATION ||
            recordType === MedicalRecordType.HEALTHRESTRICTION
          ? selectedRecord
            ? renderUpdateRecordDetailsHealthCondition()
            : renderRecordDetailsHealthCondition()
          : renderRecordDetailsPrescription()}
        {renderBottomButton()}
      </View>
    );
  };

  const renderData = () => {
    return (
      <View style={{ marginTop: 28 }}>
        {recordType === MedicalRecordType.MEDICALCONDITION ||
        recordType === MedicalRecordType.ALLERGY ||
        recordType === MedicalRecordType.MEDICATION ||
        recordType === MedicalRecordType.HEALTHRESTRICTION
          ? null
          : renderUploadedImages(1)}
        {renderRecordDetailsCard()}
      </View>
    );
  };

  const renderBottomButton = () => {
    return (
      <Button
        title="UPLOAD DATA"
        style={{ width: '70%', alignSelf: 'center', marginBottom: 20 }}
        onPress={onSavePress}
      />
    );
  };

  const renderReviewPhotoDetails = () => {
    const base64Icon = 'data:image/png;base64,';
    fin = base64Icon.concat(currentImage?.base64 || '');

    const onPressReviewPhotoSave = () => {
      setDisplayReviewPhotoPopup(false);
      setdisplayOrderPopup(false);
      setdisplayMedicalConditionPopup(false);
      setdisplayAllergyPopup(false);
    };

    const onPressClickMorePhoto = () => {
      setOpenCamera(true);
      setDisplayReviewPhotoPopup(false);
      setdisplayOrderPopup(true);
    };

    return (
      <ScrollView bounces={false} style={{ flex: 1 }}>
        <View style={{ marginTop: 28, paddingHorizontal: 16, marginBottom: 30 }}>
          <Text style={styles.ensureTextStyle}>{'Ensure your document is clearly visible'}</Text>
          <View style={styles.reviewPhotoDetailsViewStyle}>
            <Image
              style={styles.reviewPhotoImageStyle}
              resizeMode={'contain'}
              source={{ uri: fin }}
            />
          </View>
          <View style={styles.bottonButtonContainer}>
            <Button
              onPress={onPressReviewPhotoSave}
              title={'SAVE'}
              style={styles.bottomWhiteButtonStyle}
              titleTextStyle={styles.bottomWhiteButtonTextStyle}
            />
            {/* UI for multiple images */}
            {/* <View style={styles.buttonSeperatorStyle} />
            <View style={styles.bottomButtonStyle}>
              <Button
                onPress={onPressClickMorePhoto}
                title={'CLICK MORE PHOTO'}
                style={styles.bottomButtonStyle}
              />
            </View> */}
          </View>
        </View>
      </ScrollView>
    );
  };

  const onPressCloseReview = () => {
    const imageCOPY =
      reviewPopupID === 1
        ? [...Images]
        : reviewPopupID === 2
        ? [...allergyImage]
        : [...medicalConditionImage];
    const index = imageCOPY.findIndex((item) => item.title === currentImage?.title);
    imageCOPY.splice(index, 1);
    reviewPopupID === 1
      ? setImages(imageCOPY)
      : reviewPopupID === 2
      ? setAllergyImage(imageCOPY)
      : setMedicalConditionImage(imageCOPY);
    setDisplayReviewPhotoPopup(false);
    setdisplayOrderPopup(false);
    setdisplayMedicalConditionPopup(false);
    setdisplayAllergyPopup(false);
  };

  const renderUploadPrescriptionPopup = (id: number) => {
    const displayPopup =
      id === 1 ? displayOrderPopup : id === 2 ? displayAllergyPopup : displayMedicalConditionPopup;

    const onResponseCall = (selectedType: any, response: any, type) => {
      if (id === 1) {
        setdisplayOrderPopup(false);
        if (selectedType == 'CAMERA_AND_GALLERY') {
          if (response.length == 0) return;
          if (type === 'Camera') {
            setDisplayReviewPhotoPopup(true);
            setCurrentImage(response[0]);
          }
          // Logic for multiple images
          // setImages([...Images, ...response]);
          setImageUpdate(false);
          setImages(response);
          setdisplayOrderPopup(false);
        }
      } else if (id === 2) {
        setdisplayAllergyPopup(false);
        if (selectedType == 'CAMERA_AND_GALLERY') {
          if (response.length == 0) return;
          if (type === 'Camera') {
            setDisplayReviewPhotoPopup(true);
            setReviewPopupID(2);
            setCurrentImage(response[0]);
          }
          // Logic for multiple images
          // setImages([...Images, ...response]);
          setImageUpdate(false);
          setAllergyImage(response);
          setdisplayAllergyPopup(false);
        }
      } else {
        setdisplayMedicalConditionPopup(false);
        if (selectedType == 'CAMERA_AND_GALLERY') {
          if (response.length == 0) return;
          if (type === 'Camera') {
            setDisplayReviewPhotoPopup(true);
            setReviewPopupID(3);
            setCurrentImage(response[0]);
          }
          // Logic for multiple images
          // setImages([...Images, ...response]);
          setImageUpdate(false);
          setMedicalConditionImage(response);
          setdisplayMedicalConditionPopup(false);
        }
      }
    };

    const onClickClose = () => {
      id === 1
        ? setdisplayOrderPopup(false)
        : id === 2
        ? setdisplayAllergyPopup(false)
        : setdisplayMedicalConditionPopup(false);
    };

    return (
      <UploadPrescriprionPopup
        isVisible={displayPopup}
        openCamera={openCamera}
        phrUpload={true}
        disabledOption="NONE"
        //type=""
        heading={'Upload File'}
        instructionHeading={'Instructions For Uploading Prescriptions'}
        instructions={[
          'Take clear picture of your entire prescription.',
          'Doctor details & date of the prescription should be clearly visible.',
          'Medicines will be dispensed as per prescription.',
        ]}
        optionTexts={{
          camera: 'TAKE A PHOTO',
          gallery: 'CHOOSE\nFROM GALLERY',
        }}
        onClickClose={onClickClose}
        onResponse={(selectedType: any, response: any, type) => {
          onResponseCall(selectedType, response, type);
        }}
      />
    );
  };

  const renderReviewPhotoPopup = () => {
    return (
      <Overlay
        onRequestClose={() => setDisplayReviewPhotoPopup(false)}
        isVisible={displayReviewPhotoPopup}
        containerStyle={{ marginBottom: 0 }}
        fullScreen
        overlayStyle={styles.phrOverlayStyle}
      >
        <View style={styles.overlayViewStyle}>
          <SafeAreaView style={styles.overlaySafeAreaViewStyle}>
            <Header
              container={styles.headerContainerStyle}
              title="REVIEW YOUR PHOTO"
              leftIcon="backArrow"
              onPressLeftIcon={onPressCloseReview}
              rightComponent={headerRightComponent()}
            />
            {renderReviewPhotoDetails()}
          </SafeAreaView>
        </View>
      </Overlay>
    );
  };

  const headerRightComponent = () => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={onPressCloseReview}>
        <Remove />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ ...theme.viewStyles.container }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          container={styles.headerContainerStyle}
          title="ADD DATA"
          leftIcon="backArrow"
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <KeyboardAwareScrollView bounces={false}>
          {renderData()}
          <View style={{ height: 60 }} />
        </KeyboardAwareScrollView>
      </SafeAreaView>
      {displayReviewPhotoPopup && currentImage && renderReviewPhotoPopup()}
      {displayOrderPopup && renderUploadPrescriptionPopup(1)}
      {displayAllergyPopup && renderUploadPrescriptionPopup(2)}
      {displayMedicalConditionPopup && renderUploadPrescriptionPopup(3)}
      {showSpinner && <Spinner />}
      {showPopUp && (
        <BottomPopUp
          title={`Hi ${(currentPatient && currentPatient.firstName!.toLowerCase()) || ''},`}
          description={'Please select images first'}
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.gotItStyles}
              onPress={() => {
                setshowPopUp(false);
              }}
            >
              <Text style={styles.gotItTextStyles}>{string.home.welcome_popup.cta_label}</Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
    </View>
  );
};
