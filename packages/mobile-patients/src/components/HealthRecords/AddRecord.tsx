import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DatePicker } from '@aph/mobile-patients/src/components/ui/DatePicker';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CrossYellow, DropdownGreen, FileBig } from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
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
} from '@aph/mobile-patients/src/graphql/profiles';
import { addPatientMedicalRecord } from '@aph/mobile-patients/src/graphql/types/addPatientMedicalRecord';
import { addPatientLabTestRecord } from '@aph/mobile-patients/src/graphql/types/addPatientLabTestRecord';
import { addPatientHealthCheckRecord } from '@aph/mobile-patients/src/graphql/types/addPatientHealthCheckRecord';
import { addPatientHospitalizationRecord } from '@aph/mobile-patients/src/graphql/types/addPatientHospitalizationRecord';
import {
  LabTestParameters,
  mediaPrescriptionSource,
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
  const [showImages, setshowImages] = useState<boolean>(true);
  const [showRecordDetails, setshowRecordDetails] = useState<boolean>(true);
  const [showReportDetails, setshowReportDetails] = useState<boolean>(false);
  const [displayOrderPopup, setdisplayOrderPopup] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [testName, settestName] = useState<string>('');
  const [docName, setDocName] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');
  const [typeofRecord, settypeofRecord] = useState<MedicRecordType>();
  const [dateOfTest, setdateOfTest] = useState<string>('');
  const [referringDoctor, setreferringDoctor] = useState<string>('');
  const [observations, setobservations] = useState<string>('');
  const [additionalNotes, setadditionalNotes] = useState<string>('');
  const [testRecordParameters, setTestRecordParameters] = useState<LabTestParameters[]>([
    TestRecordInitialValues,
  ]);
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);

  const [showPopUp, setshowPopUp] = useState<boolean>(false);
  const { showAphAlert } = useUIElements();

  const [Images, setImages] = useState<PickerImage>(props.navigation.state.params ? [] : []);

  const navigatedFrom = props.navigation.state.params!.navigatedFrom
    ? props.navigation.state.params!.navigatedFrom
    : '';

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
    const validRecordDetails1 = typeofRecord && testName && dateOfTest ? true : false;
    const validRecordDetails2 = typeofRecord && locationName && dateOfTest ? true : false;
    const validRecordDetails3 =
      typeofRecord && typeofRecord === MedicRecordType.PRESCRIPTION && docName && dateOfTest
        ? true
        : false;
    const validRecordDetails4 =
      typeofRecord && testName && dateOfTest && locationName ? true : false;

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

    let message = typeofRecord
      ? testName || docName || locationName
        ? dateOfTest
          ? !locationName && typeofRecord === MedicRecordType.HOSPITALIZATION
            ? 'Enter hospital name'
            : ''
          : typeofRecord === MedicRecordType.PRESCRIPTION
          ? 'Enter Date of Prescription'
          : typeofRecord === MedicRecordType.HOSPITALIZATION
          ? 'Enter Date of Discharge'
          : 'Enter Date of Test'
        : typeofRecord === MedicRecordType.PRESCRIPTION
        ? 'Enter doctor name'
        : !docName && typeofRecord === MedicRecordType.HOSPITALIZATION
        ? 'Enter doctor name'
        : typeofRecord === MedicRecordType.HOSPITALIZATION
        ? 'Enter hospital name'
        : typeofRecord === MedicRecordType.CONSULTATION
        ? 'Enter Location of Consultation'
        : typeofRecord === MedicRecordType.TEST_REPORT
        ? 'Enter test name'
        : typeofRecord === MedicRecordType.HEALTHCHECK
        ? 'Enter name of health check'
        : 'Enter Name'
      : 'Select the Record Type';

    message === '' &&
      valid.forEach((item) => {
        if (item.maxmin === false) {
          message = 'Please enter valid Maximum and Minimum';
        }
      });

    const finval = validRecordDetails1
      ? true
      : validRecordDetails2
      ? true
      : validRecordDetails3
      ? true
      : validRecordDetails4
      ? true
      : false;

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

  const addMedicalRecord = () => {
    const inputData =
      Images.length > 0
        ? {
            patientId: currentPatient ? currentPatient.id : '',
            testName: testName,
            issuingDoctor: docName,
            location: locationName,
            testDate:
              dateOfTest !== '' ? Moment(dateOfTest, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
            recordType: typeofRecord,
            sourceName: mediaPrescriptionSource.SELF,
            documentURLs: '',
            prismFileIds: '',
            testResultFiles: {
              fileName: Images[0].title + '.' + Images[0].fileType,
              mimeType: mimeType(Images[0].title + '.' + Images[0].fileType),
              content: Images[0].base64,
            },
          }
        : {
            patientId: currentPatient ? currentPatient.id : '',
            testName: testName,
            issuingDoctor: docName,
            location: locationName,
            testDate:
              dateOfTest !== '' ? Moment(dateOfTest, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
            recordType: typeofRecord,
            sourceName: mediaPrescriptionSource.SELF,
            documentURLs: '',
            prismFileIds: '',
          };
    client
      .mutate<addPatientMedicalRecord>({
        mutation: ADD_MEDICAL_RECORD,
        variables: {
          AddMedicalRecordInput: inputData,
        },
      })
      .then(({ data }) => {
        setshowSpinner(false);
        const status = g(data, 'addPatientMedicalRecord', 'status');
        if (status) {
          postWebEngagePHR('Prescription', WebEngageEventName.PHR_ADD_PRESCRIPTIONS);
          props.navigation.goBack();
        }
      })
      .catch((e) => {
        CommonBugFender('AddRecord_ADD_MEDICAL_RECORD', e);
        setshowSpinner(false);
        console.log(JSON.stringify(e), 'eeeee');
        Alert.alert('Alert', 'Please fill all the details', [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
      });
  };

  const addPatientLabTestRecords = () => {
    const inputData =
      Images.length > 0
        ? {
            patientId: currentPatient ? currentPatient.id : '',
            labTestName: testName,
            labTestDate:
              dateOfTest !== '' ? Moment(dateOfTest, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
            recordType: typeofRecord,
            referringDoctor: referringDoctor,
            observations: observations,
            additionalNotes: additionalNotes,
            labTestResults: showReportDetails ? isTestRecordParameterFilled() : [],
            testResultFiles: {
              fileName: Images[0].title + '.' + Images[0].fileType,
              mimeType: mimeType(Images[0].title + '.' + Images[0].fileType),
              content: Images[0].base64,
            },
          }
        : {
            patientId: currentPatient ? currentPatient.id : '',
            labTestName: testName,
            labTestDate:
              dateOfTest !== '' ? Moment(dateOfTest, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
            recordType: typeofRecord,
            referringDoctor: referringDoctor,
            observations: observations,
            additionalNotes: additionalNotes,
            labTestResults: showReportDetails ? isTestRecordParameterFilled() : [],
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
          props.navigation.goBack();
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
    if (valid.isvalid && !valid.isValidParameter) {
      setshowSpinner(true);
      if (typeofRecord === MedicRecordType.PRESCRIPTION) {
        addMedicalRecord();
      } else if (typeofRecord === MedicRecordType.TEST_REPORT) {
        addPatientLabTestRecords();
      } else if (typeofRecord === MedicRecordType.HEALTHCHECK) {
        addPatientHealthCheckRecords();
      } else {
        addPatientHospitalizationRecords();
      }
    } else {
      showAphAlert!({
        title: 'Alert!',
        description: valid.message,
      });
    }
  };

  const renderImagesRow = (data: PickerImage, i: number) => {
    const base64Icon = 'data:image/png;base64,';
    fin = base64Icon.concat(data.base64);
    const fileType = data.fileType;

    return (
      <TouchableOpacity activeOpacity={1} key={i} onPress={() => {}}>
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            shadowRadius: 4,
            height: 56,
            marginHorizontal: 20,
            backgroundColor: theme.colors.WHITE,
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: i === 0 ? 16 : 4,
            marginBottom: Images.length === i + 1 ? 16 : 4,
          }}
          key={i}
        >
          <View
            style={{
              paddingLeft: 8,
              paddingRight: 16,
              width: 54,
            }}
          >
            {fileType === 'pdf' || fileType === 'application/pdf' ? (
              <FileBig
                style={{
                  height: 45,
                  width: 30,
                }}
              />
            ) : (
              <Image
                style={{
                  height: 40,
                  width: 30,
                }}
                source={{ uri: fin }}
              />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text>{data.title}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={1}
            style={{
              width: 40,
              paddingHorizontal: 8,
            }}
            onPress={() => {
              const imageCOPY = [...Images];
              imageCOPY.splice(i, 1);

              setImages(imageCOPY);
              CommonLogEvent('ADD_RECORD', 'Set Images');
            }}
          >
            <CrossYellow />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderUploadedImages = () => {
    return (
      <View>
        <CollapseCard
          heading="IMAGES UPLOADED"
          collapse={showImages}
          onPress={() => {
            CommonLogEvent('ADD_RECORD', 'Show Images');
            setshowImages(!showImages);
          }}
        >
          <View style={[styles.cardViewStyle, { paddingHorizontal: 8 }]}>
            <FlatList
              bounces={false}
              data={Images}
              onEndReachedThreshold={0.5}
              renderItem={({ item, index }) => renderImagesRow(item, index)}
              keyExtractor={(_, index) => index.toString()}
            />
            {Images.length === 0 && (
              <Text
                style={[
                  theme.viewStyles.yellowTextStyle,
                  { textAlign: 'right', paddingBottom: 16 },
                ]}
                onPress={() => {
                  CommonLogEvent('ADD_RECORD', 'Display order popup');
                  setdisplayOrderPopup(true);
                }}
              >
                ADD DOCUMENT
              </Text>
            )}
          </View>
        </CollapseCard>
      </View>
    );
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

  const renderData = () => {
    return (
      <View
        style={{
          marginTop: 28,
        }}
      >
        {renderUploadedImages()}
        {renderRecordDetails()}
        {typeofRecord === MedicRecordType.TEST_REPORT ? renderTestReportDetails() : null}
      </View>
    );
  };

  const renderBottomButton = () => {
    return (
      <StickyBottomComponent defaultBG>
        <Button
          title="SAVE RECORD"
          style={{ flex: 1, marginHorizontal: 60 }}
          onPress={onSavePress}
        />
      </StickyBottomComponent>
    );
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
          title="ADD A RECORD"
          leftIcon="backArrow"
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <KeyboardAwareScrollView bounces={false}>
          {renderData()}
          <View style={{ height: 80 }} />
        </KeyboardAwareScrollView>
      </SafeAreaView>
      {renderBottomButton()}
      {displayOrderPopup && (
        <UploadPrescriprionPopup
          isVisible={displayOrderPopup}
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
          onResponse={(selectedType: any, response: any) => {
            setdisplayOrderPopup(false);
            if (selectedType == 'CAMERA_AND_GALLERY') {
              if (response.length == 0) return;
              setImages(response);
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
