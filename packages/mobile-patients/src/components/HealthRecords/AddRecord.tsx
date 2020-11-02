import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DatePicker } from '@aph/mobile-patients/src/components/ui/DatePicker';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CrossYellow,
  DropdownGreen,
  FileBig,
  Remove,
  PhrEditIcon,
  PhrAddPrescriptionRecordIcon,
  PhrAddTestRecordIcon,
  PhrAddHospitalizationRecordIcon,
  PhrAddTestDetailsIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  ADD_MEDICAL_RECORD,
  ADD_PATIENT_HEALTH_CHECK_RECORD,
  ADD_PATIENT_HOSPITALIZATION_RECORD,
  ADD_PATIENT_LAB_TEST_RECORD,
  ADD_PRESCRIPTION_RECORD,
} from '@aph/mobile-patients/src/graphql/profiles';
import { addPatientLabTestRecord } from '@aph/mobile-patients/src/graphql/types/addPatientLabTestRecord';
import { addPatientHealthCheckRecord } from '@aph/mobile-patients/src/graphql/types/addPatientHealthCheckRecord';
import { addPatientHospitalizationRecord } from '@aph/mobile-patients/src/graphql/types/addPatientHospitalizationRecord';
import { addPatientPrescriptionRecord } from '@aph/mobile-patients/src/graphql/types/addPatientPrescriptionRecord';
import {
  LabTestParameters,
  AddPrescriptionRecordInput,
  MedicalRecordType,
  AddLabTestRecordInput,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  g,
  isValidText,
  postWebEngageEvent,
  postWebEngagePHR,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Moment from 'moment';
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
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import { string } from '@aph/mobile-patients/src/strings/string';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { Overlay, ListItem } from 'react-native-elements';
import _ from 'lodash';

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
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 0,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
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
    ...theme.viewStyles.text('M', 16, '#0087BA', 1, 20.8),
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
  },
  listItemViewStyle: {
    marginTop: 32,
    borderBottomColor: 'rgba(2,71,91,0.2)',
    borderBottomWidth: 0.5,
  },
  recordTypeTextStyle: {
    ...theme.viewStyles.text('R', 14, '#0087BA', 1, 18.2),
    marginTop: 8,
    marginBottom: 30,
  },
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

const TestRecordInitialValues: LabTestParameters = {
  parameterName: '',
  unit: '',
  result: 0,
  minimum: 0,
  maximum: 0,
};

export interface AddRecordProps extends NavigationScreenProps {}

export const AddRecord: React.FC<AddRecordProps> = (props) => {
  var fin = '';
  const { width } = Dimensions.get('window');
  const [showRecordDetails, setshowRecordDetails] = useState<boolean>(true);
  const [showReportDetails, setshowReportDetails] = useState<boolean>(false);
  const [displayOrderPopup, setdisplayOrderPopup] = useState<boolean>(false);
  const [displayReviewPhotoPopup, setDisplayReviewPhotoPopup] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [testName, settestName] = useState<string>('');
  const [docName, setDocName] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');
  const [typeofRecord, settypeofRecord] = useState<MedicRecordType>(MedicRecordType.PRESCRIPTION);
  const [dateOfTest, setdateOfTest] = useState<string>('');
  const [referringDoctor, setreferringDoctor] = useState<string>('');
  const [observations, setobservations] = useState<string>('');
  const [additionalNotes, setadditionalNotes] = useState<string>('');
  const [testRecordParameters, setTestRecordParameters] = useState<LabTestParameters[]>([]);
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);

  const [showPopUp, setshowPopUp] = useState<boolean>(false);
  const { showAphAlert } = useUIElements();

  const [Images, setImages] = useState<PickerImage>(props.navigation.state.params ? [] : []);
  const [currentImage, setCurrentImage] = useState<PickerImage>(null);
  const [openCamera, setOpenCamera] = useState<boolean>(false);
  const navigatedFrom = props.navigation.state.params!.navigatedFrom
    ? props.navigation.state.params!.navigatedFrom
    : '';
  const recordType = props.navigation.state.params
    ? props.navigation.state.params.recordType
    : false;

  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  const client = useApolloClient();

  const isTestRecordParameterFilled = () => {
    const testRecordsVaild = testRecordParameters
      .map((item) => {
        return item !== TestRecordInitialValues
          ? {
              ...item,
              result: parseFloat(((item && item.result) || 0).toString()),
              maximum: parseFloat(((item && item.maximum) || 0).toString()),
              minimum: parseFloat(((item && item.minimum) || 0).toString()),
            }
          : undefined;
      })
      .filter((item) => item !== undefined) as LabTestParameters[];

    if (testRecordsVaild.length > 0) {
      setTestRecordParameters(testRecordsVaild);
      return testRecordsVaild;
    } else {
      return [];
    }
  };

  const isValid = () => {
    const validRecordDetails1 = recordType && dateOfTest && testName && docName ? true : false;
    const valid = isTestRecordParameterFilled().map((item) => {
      return {
        maxmin: (item.maximum || item.minimum) && item.maximum! > item.minimum!,
        changed: true,
        notinitial:
          item.parameterName === '' &&
          item.result === 0 &&
          item.maximum === 0 &&
          item.minimum === 0,
      };
    });

    let message =
      dateOfTest === ''
        ? 'Enter Record date'
        : testName === ''
        ? 'Enter Record name'
        : docName === ''
        ? 'Enter Record doctor’s name'
        : '';

    message === '' &&
      valid.forEach((item) => {
        if (item.maxmin === false) {
          message = 'Please enter valid Maximum and Minimum';
        }
      });

    const finval = validRecordDetails1 ? true : false;

    return {
      isvalid: finval,
      isValidParameter:
        valid.find((i) => i.maxmin === false || (i.changed === false && !i.notinitial)) !==
        undefined,
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

  const isValidPrescription = () => {
    if (Images.length === 0) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please add document',
      });
      return false;
    } else if (_.isEmpty(dateOfTest)) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Enter Record date',
      });
      return false;
    } else if (_.isEmpty(testName)) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Enter Record name',
      });
      return false;
    } else if (_.isEmpty(docName)) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Enter Record prescribed by',
      });
      return false;
    } else {
      return true;
    }
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

  const addMedicalRecord = () => {
    setshowSpinner(true);
    const inputData: AddPrescriptionRecordInput = {
      patientId: currentPatient ? currentPatient.id : '',
      prescriptionName: testName,
      issuingDoctor: docName,
      location: locationName,
      additionalNotes: additionalNotes,
      dateOfPrescription:
        dateOfTest !== '' ? Moment(dateOfTest, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
      recordType: MedicalRecordType.PRESCRIPTION,
      prescriptionFiles: getAddedImages(),
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
          postWebEngagePHR('Prescription', WebEngageEventName.PHR_ADD_PRESCRIPTIONS);
          props.navigation.pop(2);
        }
      })
      .catch((e) => {
        CommonBugFender('AddRecord_ADD_PRESCRIPTION_RECORD', e);
        setshowSpinner(false);
        console.log(JSON.stringify(e), 'eeeee');
        Alert.alert('Alert', 'Please fill all the details', [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
      });
  };

  const addPatientLabTestRecords = () => {
    const inputData: AddLabTestRecordInput = {
      patientId: currentPatient?.id,
      labTestName: testName,
      labTestDate: dateOfTest !== '' ? Moment(dateOfTest, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
      recordType: recordType,
      referringDoctor: docName,
      observations: observations,
      additionalNotes: additionalNotes,
      labTestResults: isTestRecordParameterFilled(),
      testResultFiles: getAddedImages(),
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
          postWebEngagePHR('Lab Test', WebEngageEventName.PHR_ADD_LAB_TESTS);
          props.navigation.pop(2);
        }
      })
      .catch((e) => {
        CommonBugFender('AddRecord_ADD_PATIENT_LAB_TEST_RECORD', e);
        setshowSpinner(false);
        console.log(JSON.stringify(e), 'eeeee');
        Alert.alert('Alert', 'Please fill all the details', [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
      });
  };

  const addPatientHealthCheckRecords = () => {
    let inputData =
      Images.length > 0
        ? {
            patientId: currentPatient ? currentPatient.id : '',
            healthCheckName: testName,
            healthCheckDate:
              dateOfTest !== '' ? Moment(dateOfTest, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
            recordType: typeofRecord,
            healthCheckFiles: {
              fileName: Images[0].title + '.' + Images[0].fileType,
              mimeType: mimeType(Images[0].title + '.' + Images[0].fileType),
              content: Images[0].base64,
            },
          }
        : {
            patientId: currentPatient ? currentPatient.id : '',
            healthCheckName: testName,
            healthCheckDate:
              dateOfTest !== '' ? Moment(dateOfTest, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
            recordType: typeofRecord,
          };
    client
      .mutate<addPatientHealthCheckRecord>({
        mutation: ADD_PATIENT_HEALTH_CHECK_RECORD,
        variables: {
          AddHealthCheckRecordInput: inputData,
        },
      })
      .then(({ data }) => {
        setshowSpinner(false);
        const status = g(data, 'addPatientHealthCheckRecord', 'status');
        if (status) {
          postWebEngagePHR('Health Check Record', WebEngageEventName.PHR_ADD_HEALTH_CHECKS);
          props.navigation.goBack();
        }
      })
      .catch((e) => {
        CommonBugFender('AddRecord_ADD_PATIENT_HEALTH_CHECK_RECORD', e);
        setshowSpinner(false);
        console.log(JSON.stringify(e), 'eeeee');
        Alert.alert('Alert', 'Please fill all the details', [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
      });
  };

  const addPatientHospitalizationRecords = () => {
    const inputData =
      Images.length > 0
        ? {
            patientId: currentPatient ? currentPatient.id : '',
            doctorName: docName,
            dischargeDate:
              dateOfTest !== '' ? Moment(dateOfTest, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
            recordType: typeofRecord,
            hospitalName: locationName,
            hospitalizationFiles: {
              fileName: Images[0].title + '.' + Images[0].fileType,
              mimeType: mimeType(Images[0].title + '.' + Images[0].fileType),
              content: Images[0].base64,
            },
          }
        : {
            patientId: currentPatient ? currentPatient.id : '',
            doctorName: docName,
            dischargeDate:
              dateOfTest !== '' ? Moment(dateOfTest, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
            recordType: typeofRecord,
            hospitalName: locationName,
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
          postWebEngagePHR('Discharge Summary Record', WebEngageEventName.PHR_ADD_HOSPITALIZATIONS);
          props.navigation.goBack();
        }
      })
      .catch((e) => {
        CommonBugFender('AddRecord_ADD_PATIENT_HOSPITALIZATION_RECORD', e);
        setshowSpinner(false);
        console.log(JSON.stringify(e), 'eeeee');
        Alert.alert('Alert', 'Please fill all the details', [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
      });
  };

  const onSavePress = () => {
    const valid = isValid();
    if (recordType === MedicalRecordType.TEST_REPORT) {
      if (Images.length === 0) {
        showAphAlert!({
          title: 'Alert!',
          description: 'Please add document',
        });
      } else if (valid.isvalid && !valid.isValidParameter) {
        setshowSpinner(true);
        addPatientLabTestRecords();
      } else {
        showAphAlert!({
          title: 'Alert!',
          description: valid.message,
        });
      }
    } else if (recordType === MedicalRecordType.PRESCRIPTION && isValidPrescription()) {
      setshowSpinner(true);
      addMedicalRecord();
    } else if (typeofRecord === MedicRecordType.TEST_REPORT) {
      addPatientLabTestRecords();
    } else if (typeofRecord === MedicRecordType.HEALTHCHECK) {
      addPatientHealthCheckRecords();
    } else {
      // addPatientHospitalizationRecords();
    }
  };

  const renderDateInpt = () => {
    return (
      <View>
        <View style={{ paddingTop: 0, paddingBottom: 10 }}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.placeholderViewStyle}
            onPress={() => {
              Keyboard.dismiss();
              setIsDateTimePickerVisible(true);
              CommonLogEvent('ADD_RECORD', 'Date picker visible');
            }}
          >
            <Text
              style={[
                styles.placeholderTextStyle,
                dateOfTest !== '' ? null : styles.placeholderStyle,
              ]}
            >
              {dateOfTest !== '' ? dateOfTest : 'dd/mm/yyyy'}
            </Text>
          </TouchableOpacity>
        </View>
        <DatePicker
          isDateTimePickerVisible={isDateTimePickerVisible}
          handleDatePicked={(date) => {
            setIsDateTimePickerVisible(false);
            const formatDate = Moment(date).format('DD/MM/YYYY');
            setdateOfTest(formatDate);
            Keyboard.dismiss();
          }}
          hideDateTimePicker={() => {
            setIsDateTimePickerVisible(false);
            Keyboard.dismiss();
          }}
        />
      </View>
    );
  };

  const inputRecordType = () => {
    switch (typeofRecord) {
      case MedicRecordType.TEST_REPORT:
        return (
          <View>
            <TextInputComponent
              label={'Name of Test'}
              value={testName}
              placeholder={'Enter name of test'}
              onChangeText={(testName) => {
                if (isValidText(testName)) {
                  settestName(testName);
                }
              }}
            />
            <TextInputComponent label={'Date of Test'} noInput={true} />
            {renderDateInpt()}
          </View>
        );
      case MedicRecordType.HEALTHCHECK:
        return (
          <View>
            <TextInputComponent
              label={'Name of Health Check'}
              value={testName}
              placeholder={'Enter name of health check'}
              onChangeText={(testName) => {
                if (isValidText(testName)) {
                  settestName(testName);
                }
              }}
            />
            <TextInputComponent label={'Date of Test'} noInput={true} />
            {renderDateInpt()}
          </View>
        );
      case MedicRecordType.PRESCRIPTION:
        return (
          <View>
            <TextInputComponent
              label={'Doctor who issued prescription'}
              value={docName}
              showDrPrefix={true}
              inputStyle={{ flex: 1 }}
              placeholder={'Enter doctor name'}
              onChangeText={(docName) => {
                if (isValidText(docName)) {
                  setDocName(docName);
                }
              }}
            />
            <TextInputComponent label={'Date of Prescription'} noInput={true} />
            {renderDateInpt()}
            <TextInputComponent
              label={'Location (optional)'}
              value={locationName}
              placeholder={'Enter Location '}
              onChangeText={(name) => {
                setLocationName(name);
              }}
            />
          </View>
        );
      case MedicRecordType.HOSPITALIZATION:
        return (
          <View>
            <TextInputComponent
              label={'Name of Doctor'}
              value={docName}
              showDrPrefix={true}
              inputStyle={{ flex: 1 }}
              placeholder={'Enter doctor name'}
              onChangeText={(docName) => {
                if (isValidText(docName)) {
                  setDocName(docName);
                }
              }}
            />
            <TextInputComponent label={'Date of Discharge'} noInput={true} />
            {renderDateInpt()}
            <TextInputComponent
              label={'Name of Hospital'}
              value={locationName}
              placeholder={'Enter hospital name'}
              onChangeText={(name) => {
                setLocationName(name);
              }}
            />
          </View>
        );
      case MedicRecordType.CONSULTATION:
        return (
          <View>
            <TextInputComponent
              label={'Location of Consultation'}
              value={locationName}
              placeholder={'Enter location of consultation'}
              onChangeText={(text) => {
                setLocationName(text);
              }}
            />
            <TextInputComponent label={'Date of Test'} noInput={true} />
            {renderDateInpt()}
          </View>
        );
    }
  };
  const renderRecordDetails = () => {
    return (
      <View>
        <CollapseCard
          heading="RECORD DETAILS"
          collapse={showRecordDetails}
          onPress={() => {
            CommonLogEvent('ADD_RECORD', 'RECORD DETAILS');
            setshowRecordDetails(!showRecordDetails);
          }}
        >
          <View style={[styles.cardViewStyle, { paddingTop: 6, paddingBottom: 5 }]}>
            <MaterialMenu
              menuContainerStyle={[
                {
                  alignItems: 'flex-end',
                  marginTop: 16,
                  marginLeft: width / 2 - 95,
                },
              ]}
              itemTextStyle={{ textTransform: 'capitalize' }}
              options={RecordType}
              selectedText={typeofRecord}
              onPress={(data) => {
                // setshowRecordTypePopup(false);
                if (data.key !== typeofRecord) {
                  setDocName('');
                  setLocationName('');
                  settestName('');
                  setdateOfTest('');
                }
                settypeofRecord(data.key as MedicRecordType);

                if (data.key === 'TEST_REPORT') {
                  const eventAttributes: WebEngageEvents[WebEngageEventName.ITEMS_CLICKED] = {
                    Source: navigatedFrom,
                    Type: 'Test Result',
                  };
                  postWebEngageEvent(WebEngageEventName.ITEMS_CLICKED, eventAttributes);
                } else {
                  const eventAttributes: WebEngageEvents[WebEngageEventName.ITEMS_CLICKED] = {
                    Source: navigatedFrom,
                    Type: 'Prescription',
                  };
                  postWebEngageEvent(WebEngageEventName.ITEMS_CLICKED, eventAttributes);
                }
              }}
              selectedTextStyle={{ color: theme.colors.APP_GREEN }}
            >
              <TextInputComponent
                label={'Type of Record'}
                noInput={true}
                conatinerstyles={{
                  paddingBottom: 0,
                }}
              />
              <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                <View style={[styles.placeholderViewStyle]}>
                  <Text
                    style={[
                      styles.placeholderTextStyle,
                      typeofRecord !== undefined
                        ? { textTransform: 'capitalize' }
                        : styles.placeholderStyle,
                    ]}
                  >
                    {typeofRecord !== undefined
                      ? RecordType.find((item) => item.key === typeofRecord)!.value
                      : 'Select type of record'}
                  </Text>
                  <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
                    <DropdownGreen />
                  </View>
                </View>
              </View>
            </MaterialMenu>
            {inputRecordType()}
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderTestReportDetails = () => {
    return (
      <View>
        <CollapseCard
          heading="REPORT DETAILS (Optional)"
          collapse={showReportDetails}
          onPress={() => setshowReportDetails(!showReportDetails)}
        >
          <View
            style={[
              {
                ...theme.viewStyles.cardContainer,
                marginTop: 15,
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 20,
              },
            ]}
          >
            <View>
              <View style={styles.labelViewStyle}>
                <Text style={styles.labelStyle}>Parameters</Text>
              </View>
              {testRecordParameters.map((item, i) => (
                <View
                  key={i}
                  style={{
                    marginTop: 16,
                    ...theme.viewStyles.cardViewStyle,
                    shadowRadius: 4,
                    paddingHorizontal: 16,
                    paddingTop: 6,
                    paddingBottom: 5,
                  }}
                >
                  <TextInputComponent
                    label={'Name of Parameter'}
                    placeholder={'Enter name'}
                    value={item.parameterName || ''}
                    onChangeText={(value) => {
                      if (isValidText(value)) {
                        setTestParametersData('parameterName', value, i);
                      }
                    }}
                  />
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <TextInputComponent
                        label={'Result'}
                        placeholder={'Enter value'}
                        value={(item.result || '').toString()}
                        onChangeText={(value) => setTestParametersData('result', value, i, true)}
                        keyboardType={'numbers-and-punctuation'}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <TextInputComponent
                        label={'Unit'}
                        placeholder={'Enter unit'}
                        value={(item.unit || '').toString()}
                        onChangeText={(value) => {
                          if (/^([a-zA-Z0-9 %]+[ ]{0,1}[a-zA-Z0-9\-.\\/%?,&]*)*$/.test(value)) {
                            setTestParametersData('unit', value, i);
                          }
                        }}
                      />
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <TextInputComponent
                        label={'Min'}
                        placeholder={'Enter value'}
                        value={(item.minimum || '').toString()}
                        onChangeText={(value) => setTestParametersData('minimum', value, i, true)}
                        keyboardType={'numbers-and-punctuation'}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <TextInputComponent
                        label={'Max'}
                        placeholder={'Enter value'}
                        value={(item.maximum || '').toString()}
                        onChangeText={(value) => setTestParametersData('maximum', value, i, true)}
                        keyboardType={'numbers-and-punctuation'}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
            <Text
              style={{ ...theme.viewStyles.yellowTextStyle, textAlign: 'right', paddingTop: 16 }}
              onPress={() => {
                const dataCopy = [...testRecordParameters];
                dataCopy.push(TestRecordInitialValues);
                setTestRecordParameters(dataCopy);
              }}
            >
              ADD PARAMETER
            </Text>
            <View>
              <View style={styles.labelViewStyle}>
                <Text style={[styles.labelStyle, { paddingTop: 20 }]}>Observation Details</Text>
              </View>
              <View
                style={{
                  marginTop: 16,
                  ...theme.viewStyles.cardViewStyle,
                  shadowRadius: 4,
                  paddingHorizontal: 16,
                  paddingTop: 6,
                  paddingBottom: 5,
                }}
              >
                <TextInputComponent
                  label={'Referring Doctor'}
                  placeholder={'Enter name'}
                  value={referringDoctor}
                  showDrPrefix={true}
                  inputStyle={{ flex: 1 }}
                  onChangeText={(referringDoctor) => {
                    if (isValidText(referringDoctor)) {
                      setreferringDoctor(referringDoctor);
                    }
                  }}
                />
                <TextInputComponent
                  label={'Observations / Impressions'}
                  placeholder={'Enter observations'}
                  value={observations}
                  onChangeText={(observations) => {
                    if (isValidText(observations)) {
                      setobservations(observations);
                    }
                  }}
                />
                <TextInputComponent
                  label={'Additional Notes'}
                  placeholder={'Enter notes'}
                  value={additionalNotes}
                  onChangeText={(additionalNotes) => {
                    if (isValidText(additionalNotes)) {
                      setadditionalNotes(additionalNotes);
                    }
                  }}
                />
              </View>
            </View>
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderImagesRow = (data: PickerImage, i: number) => {
    const base64Icon = 'data:image/png;base64,';
    fin = base64Icon.concat(data.base64);
    const fileType = data.fileType;
    return (
      <View
        style={{
          height: 72,
          width: 72,
          marginRight: 9,
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          paddingHorizontal: 6,
        }}
      >
        {fileType === 'pdf' || fileType === 'application/pdf' ? (
          <FileBig
            style={{
              height: 72,
              width: 60,
            }}
          />
        ) : (
          <Image
            style={{
              height: 72,
              width: 60,
            }}
            source={{ uri: fin }}
          />
        )}
      </View>
    );
  };

  const renderUploadedImages = () => {
    const renderAddMorePagesCard = () => {
      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setdisplayOrderPopup(true)}
          style={{ height: 72, width: 72, backgroundColor: '#FFFFFF' }}
        >
          <Text
            style={{
              ...theme.viewStyles.text('R', 24, '#02475B', 1, 31.2),
              textAlign: 'center',
              paddingTop: 5,
            }}
          >
            {'+'}
          </Text>
          <Text
            style={{
              ...theme.viewStyles.text('R', 10, '#02475B', 1, 13),
              textAlign: 'center',
              flex: 1,
            }}
          >
            {'ADD MORE PAGES'}
          </Text>
        </TouchableOpacity>
      );
    };
    return (
      <View style={{ marginTop: 6, marginHorizontal: 21, marginBottom: 100, flexDirection: 'row' }}>
        <FlatList
          bounces={false}
          data={Images}
          collapsable
          onEndReachedThreshold={0.5}
          horizontal
          renderItem={({ item, index }) => renderImagesRow(item, index)}
          keyExtractor={(_, index) => index.toString()}
          ListFooterComponent={() => (Images?.length > 3 ? null : renderAddMorePagesCard())}
        />
        {Images?.length > 3 ? renderAddMorePagesCard() : null}
      </View>
    );
  };

  const renderListItem = (
    title: string,
    rightIcon: boolean = true,
    mandatoryField: boolean = false
  ) => {
    return (
      <ListItem
        title={
          <Text style={{ ...theme.viewStyles.text('R', 14, '#02475B', 1, 18.2) }}>
            {title}
            {mandatoryField ? <Text style={{ color: '#E50000' }}>{' *'}</Text> : null}
          </Text>
        }
        pad={14}
        containerStyle={{ paddingTop: 0, paddingBottom: 0, paddingRight: 20 }}
        rightElement={rightIcon ? <PhrEditIcon style={{ width: 16, height: 16 }} /> : undefined}
      />
    );
  };

  const renderRecordDetailsTopView = () => {
    const renderRecordTypeIcon = () => {
      return recordType === MedicalRecordType.TEST_REPORT ? (
        <PhrAddTestRecordIcon style={{ width: 35, height: 35, marginLeft: 28 }} />
      ) : recordType === MedicalRecordType.HOSPITALIZATION ? (
        <PhrAddHospitalizationRecordIcon style={{ width: 35, height: 35, marginLeft: 28 }} />
      ) : (
        <PhrAddPrescriptionRecordIcon style={{ width: 35, height: 35, marginLeft: 28 }} />
      );
    };
    const recordTypeTitle =
      recordType === MedicalRecordType.TEST_REPORT
        ? 'Report'
        : recordType === MedicalRecordType.HOSPITALIZATION
        ? 'Discharge Summary'
        : 'Prescription';
    return (
      <>
        <View style={styles.listItemViewStyle}>
          {renderListItem('Record for')}
          <Text style={styles.textInputStyle} numberOfLines={1}>
            {_.capitalize(currentPatient?.firstName) || ''}
          </Text>
        </View>
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
                      : 10,
                },
              ]}
              numberOfLines={1}
            >
              {recordTypeTitle}
            </Text>
          </View>
        </View>
        <View style={styles.listItemViewStyle}>
          {renderListItem('Record date', true, true)}
          <View style={{ paddingTop: 0, paddingBottom: 10 }}>
            <Text
              style={[styles.textInputStyle, dateOfTest !== '' ? null : styles.placeholderStyle]}
              onPress={() => {
                Keyboard.dismiss();
                setIsDateTimePickerVisible(true);
                CommonLogEvent('ADD_RECORD', 'Date picker visible');
              }}
            >
              {dateOfTest !== '' ? dateOfTest : 'dd/mm/yyyy'}
            </Text>
          </View>
          <DatePicker
            isDateTimePickerVisible={isDateTimePickerVisible}
            handleDatePicked={(date) => {
              setIsDateTimePickerVisible(false);
              const formatDate = Moment(date).format('DD/MM/YYYY');
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
            selectionColor={'#0087BA'}
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
          <TextInput
            placeholder={'Enter Record prescribed by'}
            style={styles.textInputStyle}
            selectionColor={'#0087BA'}
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

  const renderRecordDetailsTestReports = () => {
    return (
      <>
        <View style={styles.listItemViewStyle}>
          {renderListItem('Record name', true, true)}
          <TextInput
            placeholder={'Enter Record name'}
            style={styles.textInputStyle}
            selectionColor={'#0087BA'}
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
          <TextInput
            placeholder={'Enter Record doctor’s name'}
            style={styles.textInputStyle}
            selectionColor={'#0087BA'}
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
        <ListItem
          title={
            <Text style={{ ...theme.viewStyles.text('R', 14, '#02475B', 1, 18.2) }}>
              {'Record details'}
            </Text>
          }
          pad={14}
          containerStyle={{ paddingTop: 0, paddingBottom: 0, paddingRight: 18, marginTop: 30 }}
          rightElement={
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                const dataCopy = [...testRecordParameters];
                dataCopy.push(TestRecordInitialValues);
                setTestRecordParameters(dataCopy);
              }}
            >
              <PhrAddTestDetailsIcon style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
          }
        />
        {testRecordParameters.map((item, i) => (
          <View>
            <View style={{ marginTop: 32 }}>
              {renderListItem('Parameter Name', true)}
              <TextInput
                placeholder={'Enter name'}
                style={styles.textInputStyle}
                selectionColor={'#0087BA'}
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
                  style={styles.textInputStyle}
                  selectionColor={'#0087BA'}
                  numberOfLines={1}
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  underlineColorAndroid={'transparent'}
                  value={(item.result || '').toString()}
                  onChangeText={(value) => setTestParametersData('result', value, i, true)}
                  keyboardType={'numbers-and-punctuation'}
                />
                <TextInput
                  placeholder={'unit'}
                  style={styles.textInputStyle}
                  selectionColor={'#0087BA'}
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
                  style={styles.textInputStyle}
                  selectionColor={'#0087BA'}
                  numberOfLines={1}
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  underlineColorAndroid={'transparent'}
                  value={(item.minimum || '').toString()}
                  onChangeText={(value) => setTestParametersData('minimum', value, i, true)}
                  keyboardType={'numbers-and-punctuation'}
                />
                <TextInput
                  placeholder={'unit'}
                  style={styles.textInputStyle}
                  selectionColor={'#0087BA'}
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
                  style={styles.textInputStyle}
                  selectionColor={'#0087BA'}
                  numberOfLines={1}
                  placeholderTextColor={theme.colors.placeholderTextColor}
                  underlineColorAndroid={'transparent'}
                  value={(item.maximum || '').toString()}
                  onChangeText={(value) => setTestParametersData('maximum', value, i, true)}
                  keyboardType={'numbers-and-punctuation'}
                />
                <TextInput
                  placeholder={'unit'}
                  style={styles.textInputStyle}
                  selectionColor={'#0087BA'}
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
        {renderListItem('Additional Notes', false)}
        <TextInput
          placeholder={'Enter Additional Notes'}
          style={[styles.textInputStyle, styles.additionalTextInputStyle]}
          multiline
          selectionColor={'#0087BA'}
          numberOfLines={1}
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

  const renderRecordDetailsCard = () => {
    return (
      <View style={{ ...theme.viewStyles.cardViewStyle, marginHorizontal: 7, marginBottom: 30 }}>
        {renderRecordDetailsTopView()}
        {recordType === MedicalRecordType.TEST_REPORT
          ? renderRecordDetailsTestReports()
          : renderRecordDetailsPrescription()}
        {renderBottomButton()}
      </View>
    );
  };

  const renderData = () => {
    return (
      <View style={{ marginTop: 28 }}>
        {renderUploadedImages()}
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
    return (
      <ScrollView bounces={false} style={{ flex: 1 }}>
        <View style={{ marginTop: 28, paddingHorizontal: 16, marginBottom: 30 }}>
          <Text
            style={{
              ...theme.viewStyles.text('R', 12, '#02475B', 1, 15.6),
              textAlign: 'center',
            }}
          >
            {'Ensure your document is clearly visible'}
          </Text>
          <View style={styles.reviewPhotoDetailsViewStyle}>
            <Image
              style={{
                height: 350,
                width: '100%',
              }}
              resizeMode={'contain'}
              source={{ uri: fin }}
            />
          </View>
          <View style={styles.bottonButtonContainer}>
            <Button
              onPress={() => {
                setDisplayReviewPhotoPopup(false);
                setdisplayOrderPopup(false);
              }}
              title={'SAVE'}
              style={styles.bottomWhiteButtonStyle}
              titleTextStyle={styles.bottomWhiteButtonTextStyle}
            />
            <View style={styles.buttonSeperatorStyle} />
            <View style={styles.bottomButtonStyle}>
              <Button
                onPress={() => {
                  setOpenCamera(true);
                  setDisplayReviewPhotoPopup(false);
                  setdisplayOrderPopup(true);
                }}
                title={'CLICK MORE PHOTO'}
                style={styles.bottomButtonStyle}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const onPressCloseReview = () => {
    const imageCOPY = [...Images];
    const index = imageCOPY.findIndex((item) => item.title === currentImage?.title);
    imageCOPY.splice(index, 1);
    setImages(imageCOPY);
    setDisplayReviewPhotoPopup(false);
    setdisplayOrderPopup(false);
  };

  return (
    <View
      style={{
        ...theme.viewStyles.container,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          container={{
            ...theme.viewStyles.cardViewStyle,
            borderRadius: 0,
          }}
          title="ADD DATA"
          leftIcon="backArrow"
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <KeyboardAwareScrollView bounces={false}>
          {renderData()}
          <View style={{ height: 60 }} />
        </KeyboardAwareScrollView>
      </SafeAreaView>
      {displayReviewPhotoPopup && currentImage && (
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
                container={{
                  ...theme.viewStyles.cardViewStyle,
                  borderRadius: 0,
                }}
                title="REVIEW YOUR PHOTO"
                leftIcon="backArrow"
                onPressLeftIcon={onPressCloseReview}
                rightComponent={
                  <TouchableOpacity activeOpacity={1} onPress={onPressCloseReview}>
                    <Remove />
                  </TouchableOpacity>
                }
              />
              {renderReviewPhotoDetails()}
            </SafeAreaView>
          </View>
        </Overlay>
      )}
      {displayOrderPopup && (
        <UploadPrescriprionPopup
          isVisible={displayOrderPopup}
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
          onClickClose={() => setdisplayOrderPopup(false)}
          onResponse={(selectedType: any, response: any, type) => {
            setdisplayOrderPopup(false);
            if (selectedType == 'CAMERA_AND_GALLERY') {
              console.log('response', response, type);
              if (response.length == 0) return;
              if (type === 'Camera') {
                setDisplayReviewPhotoPopup(true);
                setCurrentImage(response[0]);
              }
              setImages([...Images, ...response]);
              setdisplayOrderPopup(false);
            }
          }}
        />
      )}

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
              <Text style={styles.gotItTextStyles}>{string.LocalStrings.ok}</Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
    </View>
  );
};
