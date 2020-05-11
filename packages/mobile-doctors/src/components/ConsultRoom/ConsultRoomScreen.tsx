import { ReSchedulePopUp } from '@aph/mobile-doctors/src/components/Appointments/ReSchedulePopUp';
import { UploadPrescriprionPopup } from '@aph/mobile-doctors/src/components/Appointments/UploadPrescriprionPopup';
import { AudioCall } from '@aph/mobile-doctors/src/components/ConsultRoom/AudioCall';
import { CaseSheetAPI } from '@aph/mobile-doctors/src/components/ConsultRoom/CaseSheetAPI';
import { CaseSheetView } from '@aph/mobile-doctors/src/components/ConsultRoom/CaseSheetView';
import { ChatRoom } from '@aph/mobile-doctors/src/components/ConsultRoom/ChatRoom';
import ConsultRoomScreenStyles from '@aph/mobile-doctors/src/components/ConsultRoom/ConsultRoomScreen.styles';
import { VideoCall } from '@aph/mobile-doctors/src/components/ConsultRoom/VideoCall';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { AphOverlay } from '@aph/mobile-doctors/src/components/ui/AphOverlay';
import { BottomButtons } from '@aph/mobile-doctors/src/components/ui/BottomButtons';
import { DropDown } from '@aph/mobile-doctors/src/components/ui/DropDown';
import {
  BackArrow,
  Call,
  ClosePopup,
  CrossPopup,
  DotIcon,
  Down,
  RoundCallIcon,
  RoundVideoIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { NotificationHeader } from '@aph/mobile-doctors/src/components/ui/NotificationHeader';
import { RenderPdf } from '@aph/mobile-doctors/src/components/ui/RenderPdf';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { TabsComponent } from '@aph/mobile-doctors/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-doctors/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import {
  CANCEL_APPOINTMENT,
  CREATEAPPOINTMENTSESSION,
  CREATE_CASESHEET_FOR_SRD,
  END_APPOINTMENT_SESSION,
  END_CALL_NOTIFICATION,
  GET_CASESHEET,
  MODIFY_CASESHEET,
  SEND_CALL_NOTIFICATION,
  UPLOAD_CHAT_FILE,
} from '@aph/mobile-doctors/src/graphql/profiles';
import {
  cancelAppointment,
  cancelAppointmentVariables,
} from '@aph/mobile-doctors/src/graphql/types/cancelAppointment';
import {
  CreateAppointmentSession,
  CreateAppointmentSessionVariables,
} from '@aph/mobile-doctors/src/graphql/types/CreateAppointmentSession';
import {
  EndAppointmentSession,
  EndAppointmentSessionVariables,
} from '@aph/mobile-doctors/src/graphql/types/EndAppointmentSession';
import {
  EndCallNotification,
  EndCallNotificationVariables,
} from '@aph/mobile-doctors/src/graphql/types/EndCallNotification';
import {
  GetCaseSheet,
  GetCaseSheet_getCaseSheet,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis,
  GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
  GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails,
  GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_familyHistory,
  GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_healthVault,
  GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_lifeStyle,
  GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory,
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
  GetCaseSheet_getCaseSheet_pastAppointments,
  GetCaseSheet_getCaseSheet_patientDetails_familyHistory,
} from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import {
  APPOINTMENT_TYPE,
  APPT_CALL_TYPE,
  DOCTOR_CALL_TYPE,
  MEDICINE_FORM_TYPES,
  ModifyCaseSheetInput,
  REQUEST_ROLES,
  STATUS,
} from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import {
  modifyCaseSheet,
  modifyCaseSheetVariables,
} from '@aph/mobile-doctors/src/graphql/types/modifyCaseSheet';
import {
  SendCallNotification,
  SendCallNotificationVariables,
} from '@aph/mobile-doctors/src/graphql/types/SendCallNotification';
import { uploadChatDocument } from '@aph/mobile-doctors/src/graphql/types/uploadChatDocument';
import { AppConfig } from '@aph/mobile-doctors/src/helpers/AppConfig';
import { getPrismUrls } from '@aph/mobile-doctors/src/helpers/clientCalls';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { callPermissions, g, messageCodes } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import { ApolloError } from 'apollo-client';
import moment from 'moment';
import Pubnub, { HereNowResponse } from 'pubnub';
import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient, useMutation } from 'react-apollo-hooks';
import {
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';
import { WebView } from 'react-native-webview';
import { NavigationScreenProps } from 'react-navigation';
import { OptionsObject } from '@aph/mobile-doctors/src/components/ui/MaterialMenu';

const { width } = Dimensions.get('window');
let joinTimerNoShow: NodeJS.Timeout;
let missedCallTimer: NodeJS.Timeout;
const styles = ConsultRoomScreenStyles;

let connectionCount = 0;
const timer = 900;
let intervalId: NodeJS.Timeout;
let stoppedTimer: number;
let timerId: NodeJS.Timeout;
let callhandelBack: boolean = true;
let autoSaveTimerId: NodeJS.Timeout;
// let joinTimerId: any;
// let diffInHours: number;
// let callAbandonmentTimer: any;
// let callAbandonmentStoppedTimer: number = 200;

export interface ConsultRoomScreenProps
  extends NavigationScreenProps<{
    DoctorId: string;
    PatientId: string;
    PatientConsultTime: string;
    AppId: string;
    Appintmentdatetime: string; //Date;
    AppoinementData: any;
    activeTabIndex?: number;
    // navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
  }> {
  activeTabIndex?: number;
  // navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
}

interface DataPair {
  key: string;
  value: string;
}

export const ConsultRoomScreen: React.FC<ConsultRoomScreenProps> = (props) => {
  const tabsData = [
    { title: strings.consult_room.case_sheet, key: '0' },
    { title: strings.consult_room.chat, key: '1' },
  ];
  const reasons = [
    'Not related to my specialty',
    'Needs a second opinion from a senior specialist',
    'Patient requested for a slot when I am not available',
    'Patient needs a in person visit',
    'Other',
  ];
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [overlayDisplay, setOverlayDisplay] = useState<React.ReactNode>(null);
  const [chatReceived, setChatReceived] = useState(false);
  const client = useApolloClient();
  const { showAphAlert, hideAphAlert, loading, setLoading } = useUIElements();
  const AppId = props.navigation.getParam('AppId');
  const [Appintmentdatetime, setAppintmentdatetime] = useState(
    props.navigation.getParam('Appintmentdatetime')
  );
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const [appointmentData, setappointmentData] = useState(
    props.navigation.getParam('AppoinementData')
  );

  const [dropdownShow, setDropdownShow] = useState(false);
  const channel = props.navigation.getParam('AppId');
  const [doctorId, setdoctorId] = useState(props.navigation.getParam('DoctorId'));
  const [patientId, setpatientId] = useState(props.navigation.getParam('PatientId'));
  const PatientConsultTime = props.navigation.getParam('PatientConsultTime');
  const preselectTabIndex = props.activeTabIndex || props.navigation.getParam('activeTabIndex');
  const [activeTabIndex, setActiveTabIndex] = useState(
    preselectTabIndex ? tabsData[preselectTabIndex].title : tabsData[0].title
  );
  const flatListRef = useRef<FlatList<never> | undefined | null>();
  const otSessionRef = React.createRef();
  const [messages, setMessages] = useState([]);
  const [displayReSchedulePopUp, setDisplayReSchedulePopUp] = useState<boolean>(false);
  const [sessionId, setsessionId] = useState<string>('');
  const [token, settoken] = useState<string>('');
  const [cameraPosition, setCameraPosition] = useState<string>('front');
  const [showVideo, setShowVideo] = useState<boolean>(true);
  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const [isCall, setIsCall] = useState<boolean>(false);
  const [isAudioCall, setIsAudioCall] = useState<boolean>(false);
  const [startConsult, setStartConsult] = useState<boolean>(false);
  const [returnToCall, setReturnToCall] = useState<boolean>(false);
  const [caseSheet, setcaseSheet] = useState<GetCaseSheet_getCaseSheet | null | undefined>();
  const [caseSheetEdit, setCaseSheetEdit] = useState<boolean>(false);
  const [showEditPreviewButtons, setShowEditPreviewButtons] = useState<boolean>(false);
  const [chatFiles, setChatFiles] = useState<{ prismId: string | null; url: string }[]>([]);
  const [symptonsData, setSymptonsData] = useState<
    (GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms | null)[] | null
  >([]);
  // const [textinputStyles, setTextInputStyles] = useState<Object>({
  //   width: width,
  //   height: 66,
  //   backgroundColor: 'white',
  //   top: 0,
  //   // bottom: -20,
  // });
  // const [linestyles, setLinestyles] = useState<Object>({
  //   marginLeft: 20,
  //   marginRight: 64,
  //   marginTop: 0,
  //   height: 2,
  //   backgroundColor: '#00b38e',
  //   zIndex: -1,
  // });
  const [showPDF, setShowPDF] = useState<boolean>(false);
  const [patientImageshow, setPatientImageshow] = useState<boolean>(false);
  const [showweb, setShowWeb] = useState<boolean>(false);
  const [url, setUrl] = useState('');
  const [showMorePopup, setshowMorePopup] = useState<boolean>(false);
  const [showCancelPopup, setshowCancelPopup] = useState<boolean>(false);
  const [showCancelReason, setshowCancelReason] = useState<boolean>(false);
  const [selectedReason, setselectedReason] = useState<string>(reasons[0]);
  const [otherReason, setotherReason] = useState<string>('');
  const [isAutoSaved, setIsAutoSaved] = useState<boolean>(false);
  const [savedTime, setSavedTime] = useState<string>('');
  const mutationCancelSrdConsult = useMutation<cancelAppointment, cancelAppointmentVariables>(
    CANCEL_APPOINTMENT
  );

  const {
    favList,
    // favListError,
    // favlistLoading,
    favMed,
    // favMedLoading,
    // favMedError,
    favTest,
    // favTestLoading,
    // favTestError,
  } = CaseSheetAPI();

  useEffect(() => {
    console.log(appointmentData, 'appointmentData');
    // callAbandonmentCall();
    console.log('PatientConsultTime', PatientConsultTime);
    console.log(caseSheetEdit, 'caseSheetEdit');
    AsyncStorage.removeItem('editedInputData');
    KeepAwake.activate();
    setTimeout(() => {
      flatListRef.current && flatListRef.current.scrollToEnd();
    }, 1000);
    getCaseSheetAPI();
    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', backDataFunctionality);
    });

    const willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    });

    return () => {
      didFocusSubscription && didFocusSubscription.remove();
      willBlurSubscription && willBlurSubscription.remove();
      stopNoShow();
      stopMissedCallTimer();
      stopAutoSaveTimer();
      AsyncStorage.removeItem('editedInputData');
      AsyncStorage.removeItem('chatFileData');
      KeepAwake.deactivate();
    };
  }, []);

  const backDataFunctionality = () => {
    try {
      console.log(callhandelBack, 'is back called');
      if (callhandelBack) {
        saveDetails(true, true, undefined, () => {
          setLoading && setLoading(false);
          props.navigation.pop();
        });
        return true;
      } else {
        return true;
      }
    } catch (error) {
      console.log(error, 'error');
    }
  };

  const createCaseSheetSRDAPI = () => {
    setLoading && setLoading(true);
    client
      .mutate({
        mutation: CREATE_CASESHEET_FOR_SRD,
        variables: {
          appointmentId: AppId,
        },
      })
      .then((data) => {
        getCaseSheetAPI();
      })
      .catch(() => {
        setLoading && setLoading(false);
        showAphAlert &&
          showAphAlert({
            title: 'Alert!',
            description: 'Error occured while creating Case Sheet. Please try again',
          });
      });
  };
  const [pastList, setPastList] = useState<
    (GetCaseSheet_getCaseSheet_pastAppointments | null)[] | null
  >([]);
  const [lifeStyleData, setLifeStyleData] = useState<
    (GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_lifeStyle | null)[] | null
  >();
  const [
    medicalHistory,
    setMedicalHistory,
  ] = useState<GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_patientMedicalHistory | null>();
  const [familyValues, setFamilyValues] = useState<string>('');
  const [
    patientDetails,
    setPatientDetails,
  ] = useState<GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails | null>();
  const [healthWalletArrayData, setHealthWalletArrayData] = useState<
    (GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_healthVault | null)[] | null
  >([]);
  const [tests, setTests] = useState<{ itemname: string; isSelected: boolean }[]>([]);
  const [addedAdvices, setAddedAdvices] = useState<DataPair[]>([]);
  const [juniordoctornotes, setJuniorDoctorNotes] = useState<string | null>('');
  const [diagnosisData, setDiagnosisData] = useState<
    (GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis | null)[] | null
  >([]);
  const [medicinePrescriptionData, setMedicinePrescriptionData] = useState<
    (GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription | null)[] | null
  >();
  const [selectedMedicinesId, setSelectedMedicinesId] = useState<string[]>([]);
  const [switchValue, setSwitchValue] = useState<boolean | null>(true);
  const [followupDays, setFollowupDays] = useState<number | string>();
  const [followUpConsultationType, setFollowUpConsultationType] = useState<APPOINTMENT_TYPE>();
  const [doctorNotes, setDoctorNotes] = useState<string>('');
  const [displayId, setDisplayId] = useState<string>('');
  const [prescriptionPdf, setPrescriptionPdf] = useState('');
  const [selectedReferral, setSelectedReferral] = useState<OptionsObject>({
    key: '-1',
    value: strings.case_sheet.select_Speciality,
  });
  const [referralReason, setReferralReason] = useState<string>('');

  const getFamilyHistoryText = (
    familyValues:
      | (GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_familyHistory | null)[]
      | null
  ) => {
    if (familyValues) {
      let familyHistory: string = '';
      familyValues.forEach((i) => {
        if (i) {
          familyHistory += i.relation
            ? i.relation + ': ' + (i.description || '') + '\n'
            : (i.description || '') + '\n';
        }
      });
      return familyHistory.slice(0, -1);
    } else {
      return '';
    }
  };
  const getFamilyHistoryObject = (text: string) => {
    const eachMember = text.split('\n');
    const famHist: GetCaseSheet_getCaseSheet_patientDetails_familyHistory[] = [];
    eachMember.forEach((item) => {
      const history = item.split(':');
      if (history.length > 1) {
        famHist.push({
          relation: history[0].trim(),
          description: history[1].trim(),
        } as GetCaseSheet_getCaseSheet_patientDetails_familyHistory);
      } else {
        famHist.push({
          relation: null,
          description: history[0].trim(),
        } as GetCaseSheet_getCaseSheet_patientDetails_familyHistory);
      }
    });
    return famHist;
  };
  const setData = (caseSheet: GetCaseSheet_getCaseSheet | null | undefined) => {
    setLifeStyleData(g(caseSheet, 'caseSheetDetails', 'patientDetails', 'lifeStyle') || null);
    setMedicalHistory(
      g(caseSheet, 'caseSheetDetails', 'patientDetails', 'patientMedicalHistory') || null
    );
    setFamilyValues(
      getFamilyHistoryText(
        g(caseSheet, 'caseSheetDetails', 'patientDetails', 'familyHistory') || null
      )
    );
    setPatientDetails(g(caseSheet, 'caseSheetDetails', 'patientDetails') || null);
    setHealthWalletArrayData(
      g(caseSheet, 'caseSheetDetails', 'patientDetails', 'healthVault') || null
    );
    setPastList(g(caseSheet, 'pastAppointments') || null);
    setAppintmentdatetime(g(caseSheet, 'caseSheetDetails', 'appointment', 'appointmentDateTime'));
    setappointmentData(g(caseSheet, 'caseSheetDetails', 'appointment'));
    setdoctorId(g(caseSheet, 'caseSheetDetails', 'doctorId') || '');
    setpatientId(g(caseSheet, 'caseSheetDetails', 'patientId') || '');

    // setAllergiesData(g(caseSheet, 'patientDetails', 'allergies') || null);
    setTests(
      (g(caseSheet, 'caseSheetDetails', 'diagnosticPrescription') || [])
        .map((i) => {
          if (i) {
            return { itemname: i.itemname || '', isSelected: true };
          } else {
            return { itemname: '', isSelected: false };
          }
        })
        .filter((i) => i.isSelected)
    );
    setAddedAdvices(
      (g(caseSheet, 'caseSheetDetails', 'otherInstructions') || [])
        .map((i) => {
          if (i) {
            return { key: i.instruction || '', value: i.instruction || '' };
          } else {
            return { key: '', value: '' };
          }
        })
        .filter((i) => i.value !== '')
    );
    setSymptonsData(g(caseSheet, 'caseSheetDetails', 'symptoms') || null);
    setJuniorDoctorNotes(g(caseSheet, 'juniorDoctorNotes') || null);
    setDiagnosisData(g(caseSheet, 'caseSheetDetails', 'diagnosis') || null);
    // setOtherInstructionsData(g(caseSheet, 'caseSheetDetails', 'otherInstructions') || null);
    // setDiagnosticPrescription(g(caseSheet, 'caseSheetDetails', 'diagnosticPrescription') || null);
    setMedicinePrescriptionData(
      (g(caseSheet, 'caseSheetDetails', 'medicinePrescription') || []).map((i) => {
        if (i) {
          if (i.externalId || (i.id && i.id !== '')) {
            return { ...i, externalId: i.externalId || i.id };
          } else {
            return { ...i, externalId: i.medicineName };
          }
        }
        return i;
      })
    );
    setSelectedMedicinesId((g(caseSheet, 'caseSheetDetails', 'medicinePrescription') || [])
      .map((i) => (i ? i.externalId || i.id || i.medicineName : ''))
      .filter((i) => i !== null || i !== '') as string[]);
    setSwitchValue(g(caseSheet, 'caseSheetDetails', 'followUp') || null);
    setFollowupDays(g(caseSheet, 'caseSheetDetails', 'followUpAfterInDays') || '');
    setFollowUpConsultationType(
      g(caseSheet, 'caseSheetDetails', 'followUpConsultType') || undefined
    );
    setDoctorNotes(g(caseSheet, 'caseSheetDetails', 'notes') || '');

    setDisplayId(g(caseSheet, 'caseSheetDetails', 'appointment', 'displayId') || '');
    setPrescriptionPdf(
      `${AppConfig.Configuration.DOCUMENT_BASE_URL}${g(caseSheet, 'caseSheetDetails', 'blobName')}`
    );
    setSavedTime(g(caseSheet, 'caseSheetDetails', 'updatedDate'));
  };
  const getCaseSheetAPI = () => {
    setLoading && setLoading(true);
    client
      .query<GetCaseSheet>({
        query: GET_CASESHEET,
        fetchPolicy: 'no-cache',
        variables: { appointmentId: AppId },
      })
      .then((_data) => {
        const caseSheet = g(_data, 'data', 'getCaseSheet');
        setcaseSheet(caseSheet);
        setData(caseSheet);
        setLoading && setLoading(false);
      })
      .catch((e) => {
        setLoading && setLoading(false);
        const message = e.message ? e.message.split(':')[1].trim() : '';
        if (message === 'NO_CASESHEET_EXIST') {
          createCaseSheetSRDAPI();
        }
        console.log('Error occured while fetching Doctor GetJuniorDoctorCaseSheet', message);
      });
  };
  useEffect(() => {
    AsyncStorage.setItem('editedInputData', JSON.stringify(getInputData()));
  }, [
    symptonsData,
    doctorNotes,
    diagnosisData,
    tests,
    switchValue,
    followupDays,
    followUpConsultationType,
    addedAdvices,
    medicinePrescriptionData,
    lifeStyleData,
    familyValues,
    medicalHistory,
  ]);
  const getInputData = () => {
    return {
      symptoms:
        symptonsData &&
        symptonsData
          .map((i) => {
            if (i) {
              return {
                symptom: i.symptom || '',
                since: i.since || '',
                howOften: i.howOften || '',
                severity: i.severity || '',
                details: i.details || '',
              };
            } else {
              return '';
            }
          })
          .filter((i) => i !== ''),
      notes: doctorNotes || '',
      diagnosis:
        diagnosisData &&
        diagnosisData
          .map((i) => {
            if (i) {
              return { name: i.name || '' };
            } else {
              return '';
            }
          })
          .filter((i) => i !== ''),
      diagnosticPrescription:
        tests && tests.length > 0 && tests.filter((i) => i.isSelected).length > 0
          ? tests
              .filter((i) => i.isSelected)
              .map((i) => {
                return { itemname: i.itemname || '' };
              })
          : null,
      status: g(caseSheet, 'caseSheetDetails', 'status'),
      followUp: switchValue,
      followUpDate: moment(
        g(caseSheet, 'caseSheetDetails', 'appointment', 'appointmentDateTime') || new Date()
      )
        .add(Number(followupDays), 'd')
        .format('YYYY-MM-DD'),
      followUpAfterInDays: Number(followupDays),
      followUpConsultType: followUpConsultationType,
      otherInstructions:
        addedAdvices && addedAdvices.length > 0
          ? addedAdvices.map((i) => {
              return { instruction: i.value || '' };
            })
          : null,
      medicinePrescription:
        medicinePrescriptionData && selectedMedicinesId.length > 0
          ? medicinePrescriptionData
              .filter(
                (med) =>
                  selectedMedicinesId.findIndex((i) => i === (med && (med.externalId || med.id))) >=
                  0
              )
              .map((i) => {
                if (i) {
                  return {
                    id: i.externalId === i.medicineName ? '' : i.externalId || '',
                    medicineConsumptionDuration: i.medicineConsumptionDuration || '',
                    medicineConsumptionDurationInDays: i.medicineConsumptionDurationInDays || '',
                    medicineConsumptionDurationUnit: i.medicineConsumptionDurationUnit,
                    medicineDosage: i.medicineDosage || '',
                    medicineFormTypes: i.medicineFormTypes || MEDICINE_FORM_TYPES.OTHERS,
                    medicineFrequency: i.medicineFrequency,
                    medicineInstructions: i.medicineInstructions || '',
                    medicineName: i.medicineName || '',
                    medicineTimings: i.medicineTimings || [],
                    medicineToBeTaken: i.medicineToBeTaken || [],
                    medicineUnit: i.medicineUnit,
                    routeOfAdministration: i.routeOfAdministration,
                    medicineCustomDosage: i.medicineCustomDosage || '',
                  };
                } else {
                  return '';
                }
              })
              .filter((i) => i !== '')
          : null,
      id: g(caseSheet, 'caseSheetDetails', 'id') || '',
      lifeStyle:
        lifeStyleData &&
        lifeStyleData
          .map((i) => (i ? i.description || '' : ''))
          .filter((i) => i !== '')
          .join('\n')
          .trim(),
      occupationHistory:
        lifeStyleData &&
        lifeStyleData
          .map((i) => (i ? i.occupationHistory || '' : ''))
          .filter((i) => i !== '')
          .join('\n')
          .trim(),
      familyHistory:
        familyValues &&
        getFamilyHistoryObject(familyValues)
          .map((i) => (i ? (i.relation ? i.relation + ': ' + i.description : i.description) : ''))
          .filter((i) => i !== '')
          .join('\n')
          .trim(),
      dietAllergies: medicalHistory ? medicalHistory.dietAllergies || '' : '',
      drugAllergies: medicalHistory ? medicalHistory.drugAllergies || '' : '',
      height: medicalHistory ? medicalHistory.height || '' : '',
      menstrualHistory: medicalHistory ? medicalHistory.menstrualHistory || '' : '',
      medicationHistory: medicalHistory ? medicalHistory.medicationHistory || '' : '',
      pastMedicalHistory: medicalHistory ? medicalHistory.pastMedicalHistory || '' : '',
      pastSurgicalHistory: medicalHistory ? medicalHistory.pastSurgicalHistory || '' : '',
      temperature: medicalHistory ? medicalHistory.temperature || '' : '',
      weight: medicalHistory ? medicalHistory.weight || '' : '',
      bp: medicalHistory ? medicalHistory.bp || '' : '',
      referralSpecialtyName: selectedReferral.key !== '-1' ? selectedReferral.value : null,
      referralDescription: selectedReferral.key !== '-1' ? referralReason : null,
    } as ModifyCaseSheetInput;
  };

  const saveDetails = (
    showLoading: boolean,
    autoSave: boolean,
    inputdata?: ModifyCaseSheetInput,
    callBack?: () => void
  ) => {
    showLoading && setLoading && setLoading(true);
    if (caseSheetEdit) {
      client
        .mutate<modifyCaseSheet, modifyCaseSheetVariables>({
          mutation: MODIFY_CASESHEET,
          variables: {
            ModifyCaseSheetInput: inputdata ? inputdata : getInputData(),
          },
          fetchPolicy: 'no-cache',
        })
        .then((_data) => {
          console.log('savecasesheet', _data);
          const modifiedData = {
            ...caseSheet,
            caseSheetDetails: g(_data, 'data', 'modifyCaseSheet'),
          } as GetCaseSheet_getCaseSheet | null | undefined;
          setcaseSheet(modifiedData);
          setData(modifiedData);
          setIsAutoSaved(autoSave);
          if (callBack) {
            setLoading && setLoading(true);
            callBack();
          } else {
            setLoading && setLoading(false);
          }
        })
        .catch((e) => {
          setLoading && setLoading(false);
          console.log('Error occured while update casesheet', e);
          const error = JSON.parse(JSON.stringify(e));
          const errorMessage = error && error.message;
          console.log('Error occured while adding Doctor', errorMessage, error);
          showAphAlert &&
            showAphAlert({
              title: strings.common.uh_oh,
              description: strings.common.oops_msg_saving,
            });
        });
    } else {
      if (callBack) {
        setLoading && setLoading(true);
        callBack();
      } else {
        setLoading && setLoading(false);
      }
    }
  };

  const [audioCallStyles, setAudioCallStyles] = useState<object>({
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 10000,
  });
  const [remainingTime, setRemainingTime] = useState<number>(900);
  const [consultStarted, setConsultStarted] = useState<boolean>(false);
  const [hideStatusBar, setHideStatusBar] = useState<boolean>(false);
  const [callTimer, setCallTimer] = useState<number>(0);
  const [callAccepted, setCallAccepted] = useState<boolean>(false);
  const [convertVideo, setConvertVideo] = useState<boolean>(false);
  let patientJoined = false;
  let abondmentStarted = false;

  const timediffInSec = moment(Appintmentdatetime).diff(moment(new Date()), 's');

  const startNoShow = (timer: number, callback?: () => void) => {
    stopNoShow();
    joinTimerNoShow = setInterval(() => {
      timer = timer - 1;
      console.log('uptimer startNoShow', timer);
      if (timer === 0) {
        stopNoShow();
        callback && callback();
      }
    }, 1000);
  };

  const stopNoShow = () => {
    console.log('storpvi', joinTimerNoShow);
    joinTimerNoShow && clearInterval(joinTimerNoShow);
  };

  const startMissedCallTimer = (timer: number, callback?: () => void) => {
    stopMissedCallTimer();
    missedCallTimer = setInterval(() => {
      timer = timer - 1;
      console.log('timer missedCallllll', timer);
      if (timer === 0) {
        stopMissedCallTimer();
        callback && callback();
      }
    }, 1000);
  };

  const stopMissedCallTimer = () => {
    console.log('stop missed Call', missedCallTimer);
    missedCallTimer && clearInterval(missedCallTimer);
  };
  const [missedCallCounter, setMissedCallCounter] = useState<number>(0);

  const startAutoSaveTimer = (timer: number, callback?: () => void) => {
    stopAutoSaveTimer();
    autoSaveTimerId = setInterval(() => {
      timer = timer - 1;
      console.log('auto timer started', timer);
      if (timer === 0) {
        stopAutoSaveTimer();
        callback && callback();
      }
    }, 1000);
  };

  const stopAutoSaveTimer = () => {
    console.log('auto timer stopped', autoSaveTimerId);
    autoSaveTimerId && clearInterval(autoSaveTimerId);
  };

  const timerLoop = (timer: number) => {
    startAutoSaveTimer(timer, async () => {
      const data = await AsyncStorage.getItem('editedInputData');
      saveDetails(false, true, JSON.parse(data || ''));
      timerLoop(timer);
    });
  };
  useEffect(() => {
    if (caseSheetEdit) {
      timerLoop(45);
    } else {
      stopAutoSaveTimer();
    }
  }, [caseSheetEdit]);

  const stopAllCalls = () => {
    console.log('isA', isAudioCall, '\nisVe', isCall);
    endCallNotificationAPI(true);
    setIsAudioCall(false);
    setHideStatusBar(false);
    setChatReceived(false);
    setConvertVideo(false);
    setShowVideo(true);
    setIsCall(false);
    const text = {
      id: doctorId,
      message: messageCodes.endCallMsg,
      isTyping: true,
      messageDate: new Date(),
      sentBy: REQUEST_ROLES.DOCTOR,
    };
    pubnub.publish(
      {
        channel: channel,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status: any, response: any) => {}
    );
    const stoptext = {
      id: doctorId,
      message: `${isAudioCall ? 'Audio' : 'Video'} ${strings.consult_room.call_ended}`,
      duration: callTimerStarted,
      isTyping: true,
      messageDate: new Date(),
      sentBy: REQUEST_ROLES.DOCTOR,
    };
    pubnub.publish(
      {
        channel: channel,
        message: stoptext,
        storeInHistory: true,
        sendByPost: true,
      },
      (status: any, response: any) => {}
    );
  };

  const callAbandonmentCall = () => {
    showAphAlert &&
      showAphAlert({
        title: `${strings.common.hi},`,
        description: strings.consult_room.patient_is_not_acitve_descr,
        CTAs: [
          {
            text: strings.consult_room.continue,
            onPress: () => hideAphAlert!(),
            type: 'white-button',
          },
          {
            text: strings.consult_room.reschedule,
            onPress: () => {
              endAppointmentApiCall(STATUS.CALL_ABANDON);
              hideAphAlert!();
            },
          },
        ],
      });
  };

  const endAppointmentApiCall = (status: STATUS) => {
    stopNoShow();
    stopMissedCallTimer();
    setShowLoading(true);
    client
      .mutate<EndAppointmentSession, EndAppointmentSessionVariables>({
        mutation: END_APPOINTMENT_SESSION,
        variables: {
          endAppointmentSessionInput: {
            appointmentId: AppId,
            status: status,
            noShowBy: REQUEST_ROLES.PATIENT,
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        setShowLoading(false);
        setShowPopUp(false);
        console.log('EndAppointmentSession', _data);
        const text = {
          id: doctorId,
          message: messageCodes.callAbandonment,
          isTyping: true,
          messageDate: new Date(),
          sentBy: REQUEST_ROLES.DOCTOR,
        };
        pubnub.publish(
          {
            message: text,
            channel: channel,
            storeInHistory: true,
          },
          (status: any, response: any) => {}
        );
        //setShowButtons(false);
        onStopConsult();
        if (status === STATUS.NO_SHOW) {
          showAphAlert &&
            showAphAlert({
              title: 'Alert!',
              description:
                'Since the patient is not responding from last 10 mins, we are rescheduling this appointment.',
              unDismissable: true,
              onPressOk: () => {
                hideAphAlert && hideAphAlert();
                props.navigation.pop();
              },
            });
        } else {
          showAphAlert &&
            showAphAlert({
              title: 'Alert!',
              description: 'Successfully Rescheduled',
              unDismissable: true,
              onPressOk: () => {
                hideAphAlert && hideAphAlert();
                props.navigation.pop();
              },
            });
        }
      })
      .catch((e) => {
        setShowLoading(false);
        setShowPopUp(false);
        console.log('Error occured while End casesheet', e);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while End casesheet', errorMessage, error);
        // Alert.alert(strings.common.error, errorMessage);
        Alert.alert(strings.common.uh_oh, strings.common.oops_msg);
      });
  };
  const [callId, setCallId] = useState<string>();
  const [chatId, setChatId] = useState<string>();
  const sendCallNotificationAPI = (callType: APPT_CALL_TYPE, isCall: boolean) => {
    client
      .query<SendCallNotification, SendCallNotificationVariables>({
        query: SEND_CALL_NOTIFICATION,
        fetchPolicy: 'no-cache',
        variables: {
          appointmentId: AppId,
          callType: callType,
          doctorType: DOCTOR_CALL_TYPE.SENIOR,
        },
      })
      .then((_data) => {
        if (g(_data, 'data', 'sendCallNotification', 'status')) {
          if (isCall) {
            setCallId(g(_data, 'data', 'sendCallNotification', 'callDetails', 'id'));
          } else {
            setChatId(g(_data, 'data', 'sendCallNotification', 'callDetails', 'id'));
          }
        }
      })
      .catch((error) => {});
  };

  const endCallNotificationAPI = (isCall: boolean) => {
    client
      .query<EndCallNotification, EndCallNotificationVariables>({
        query: END_CALL_NOTIFICATION,
        fetchPolicy: 'no-cache',
        variables: {
          appointmentCallId: isCall ? callId : chatId,
        },
      })
      .catch((error) => {});
  };

  const { doctorDetails } = useAuth();
  // let dateIsAfter = moment(new Date()).isAfter(moment(Appintmentdatetime));

  const consultTime =
    (doctorDetails &&
      (
        doctorDetails.consultHours!.filter(
          (item) =>
            item!.weekDay ===
            moment(Appintmentdatetime)
              .format('dddd')
              .toUpperCase()
        )[0] || {}
      ).consultDuration) ||
    15;
  const isAfter = moment(Appintmentdatetime).isAfter(moment().add(-consultTime, 'minutes'));

  const startInterval = (timer: number) => {
    setConsultStarted(true);
    intervalId = setInterval(() => {
      timer = timer - 1;
      stoppedTimer = timer;
      setRemainingTime(timer);
      // console.log('descriptionTextStyle remainingTime', timer);

      if (timer == 0) {
        // console.log('descriptionTextStyles remainingTime', timer);
        setRemainingTime(0);
        clearInterval(intervalId);
      }
    }, 1000);
    console.log('intervalId', intervalId);
  };

  const startTimer = (timer: number) => {
    timerId = setInterval(() => {
      timer = timer + 1;
      stoppedTimer = timer;
      setCallTimer(timer);
      // console.log('uptimer', timer);

      if (timer == 0) {
        // console.log('uptimer', timer);
        setCallTimer(0);
        clearInterval(timerId);
      }
    }, 1000);
  };

  const stopTimer = () => {
    setCallTimer(0);
    timerId && clearInterval(timerId);
  };

  const stopInterval = () => {
    const stopTimer = 900 - stoppedTimer;

    setRemainingTime(stopTimer);
    intervalId && clearInterval(intervalId);
  };

  const publisherEventHandlers = {
    streamCreated: (event: string) => {
      console.log('Publisher stream created!', event);
    },
    streamDestroyed: (event: string) => {
      console.log('Publisher stream destroyed!', event);
    },
  };

  const subscriberEventHandlers = {
    error: (error: string) => {
      console.log(`There was an error with the subscriber: ${error}`);
    },
    connected: (event: string) => {
      console.log('Subscribe stream connected!', event);

      console.log('after styles', event);
    },
    disconnected: (event: string) => {
      console.log('Subscribe stream disconnected!', event);
    },
  };

  const sessionEventHandlers = {
    error: (error: string) => {
      console.log(`There was an error with the session: ${error}`);
    },
    connectionCreated: (event: string) => {
      connectionCount++;
      console.log('otSessionRef', otSessionRef);
      console.log('Another client connected. ' + connectionCount + ' total.');
      console.log('session stream connectionCreated!', event);
    },
    connectionDestroyed: (event: string) => {
      connectionCount--;
      setIsCall(false);
      setIsAudioCall(false);
      setHideStatusBar(false);
      stopTimer();
      setCallAccepted(false);
      setReturnToCall(false);
      console.log('session stream connectionDestroyed!', event);
    },
    sessionConnected: (event: string) => {
      console.log('session stream sessionConnected!', event);
    },
    sessionDisconnected: (event: string) => {
      console.log('session stream sessionDisconnected!', event);
    },
    sessionReconnected: (event: string) => {
      console.log('session stream sessionReconnected!', event);
    },
    sessionReconnecting: (event: string) => {
      console.log('session stream sessionReconnecting!', event);
    },
    signal: (event: string) => {
      console.log('session stream signal!', event);
    },
  };
  const config: Pubnub.PubnubConfig = {
    subscribeKey: AppConfig.Configuration.PRO_PUBNUB_SUBSCRIBER,
    publishKey: AppConfig.Configuration.PRO_PUBNUB_PUBLISH,
    ssl: true,
    uuid: REQUEST_ROLES.DOCTOR,
    restore: true,
    keepAlive: true,
    // autoNetworkDetection: true,
    // listenToBrowserNetworkEvents: true,
    presenceTimeout: 20,
    heartbeatInterval: 20,
  };

  const pubnub = new Pubnub(config);
  //console.log('pubnub', pubnub);

  useEffect(() => {
    pubnub.subscribe({
      channels: [channel],
      withPresence: true,
    });

    getHistory();
    pubnub.addListener({
      status: (statusEvent) => {
        if (statusEvent.category === Pubnub.CATEGORIES.PNConnectedCategory) {
          console.log(statusEvent.category);
        } else if (statusEvent.operation === Pubnub.OPERATIONS.PNAccessManagerAudit) {
          console.log(statusEvent.operation);
        }
      },
      message: ({ message }) => {
        console.log('addListener', message);
        const messageText = message.message;
        if (message.isTyping) {
          const audioVideoMethod = () => {
            callhandelBack = true;
            addMessages(message);
            setIsCall(false);
            setIsAudioCall(false);
            setHideStatusBar(false);
            stopTimer();
            setCallAccepted(false);
            setReturnToCall(false);
          };
          switch (messageText) {
            case messageCodes.acceptedCallMsg:
              startTimer(0);
              setCallAccepted(true);
              stopMissedCallTimer();
              break;
            case messageCodes.endCallMsg:
              setIsCall(false);
              setIsAudioCall(false);
              setHideStatusBar(false);
              stopTimer();
              setCallAccepted(false);
              setReturnToCall(false);
              break;
            case messageCodes.covertVideoMsg:
              setConvertVideo(true);
              break;
            case messageCodes.covertAudioMsg:
              setConvertVideo(false);
              break;
            case 'Audio call ended':
              audioVideoMethod();
              break;
            case 'Video call ended':
              audioVideoMethod();
              break;
            default:
          }
        } else if (
          [
            messageCodes.consultPatientStartedMsg,
            messageCodes.startConsultjr,
            messageCodes.imageconsult,
            messageCodes.firstMessage,
            messageCodes.secondMessage,
            messageCodes.languageQue,
            messageCodes.jdThankyou,
          ].includes(messageText)
        ) {
          addMessages(message);
        } else {
          addMessages(message);
          setTimeout(() => {
            flatListRef.current && flatListRef.current.scrollToEnd();
          }, 500);
        }
        try {
          if (message.fileType && message.id === patientId) {
            const asyncDisplay = async () => {
              const chatFileData = await AsyncStorage.getItem('chatFileData');
              const chatFilesRetrived = JSON.parse(chatFileData || '[]');

              chatFilesRetrived.push({
                prismId: message.prismId,
                url: message.url,
              });
              AsyncStorage.setItem('chatFileData', JSON.stringify(chatFilesRetrived));
              setChatFiles(chatFilesRetrived);
            };
            setTimeout(() => {
              asyncDisplay();
            }, 500);
          }
        } catch (error) {
          CommonBugFender('Chatfile_update', error);
        }
      },
      presence: (presenceEvent) => {
        pubnub
          .hereNow({
            channels: [channel],
            includeUUIDs: true,
          })
          .then((response: HereNowResponse) => {
            console.log('hereNowresponse', response);
            const data = response.channels[channel].occupants;

            const occupancyPatient = data.filter((obj) => {
              return obj.uuid === REQUEST_ROLES.PATIENT;
            });
            console.log('occupancyPatient', occupancyPatient);
            if (occupancyPatient.length > 0) {
              console.log('vsndfiburdcna;ldfhionjioshbvkn', joinTimerNoShow);
              stopNoShow();
              joinTimerNoShow && clearInterval(joinTimerNoShow);
              abondmentStarted = false;
              patientJoined = true;
            } else {
              console.log(
                'Call ab',
                !abondmentStarted && patientJoined,
                patientJoined,
                abondmentStarted
              );
              if (
                !abondmentStarted &&
                patientJoined &&
                ![STATUS.COMPLETED, STATUS.NO_SHOW, STATUS.CALL_ABANDON, STATUS.CANCELLED].includes(
                  (appointmentData || g(caseSheet, 'caseSheetDetails', 'appointment')).status
                )
              ) {
                abondmentStarted = true;
                startNoShow(600, () => {
                  callAbandonmentCall();
                });
              }
            }
            // const PatientConsultStartedMessage = insertText.filter((obj: any) => {
            //   return obj.message === messageCodes.consultPatientStartedMsg;
            // });
          })
          .catch((error) => {
            console.log(error);
          });
      },
    });

    const addMessages = (message: Pubnub.MessageEvent) => {
      insertText[insertText.length] = message;
      setMessages(() => [...(insertText as [])]);
      if (!isCall || !isAudioCall) {
        setChatReceived(true);
      }
      setTimeout(() => {
        flatListRef.current && flatListRef.current.scrollToEnd();
      }, 200);
    };

    return function cleanup() {
      pubnub.unsubscribe({
        channels: [channel],
      });
    };
  }, []);

  let insertText: object[] = [];
  const getHistory = () => {
    pubnub.history(
      {
        channel: channel,
        reverse: true,
        count: 1000,
      },
      (status, res) => {
        const newmessage: object[] = [];
        res &&
          res.messages.forEach((element, index) => {
            const item = element.entry;
            // console.log(item, 'element');
            if (item.prismId) {
              getPrismUrls(client, patientId, item.prismId)
                .then((data) => {
                  if (data && data.urls) {
                    item.url = data.urls[0] || item.url;
                  }
                })
                .catch((e) => {
                  CommonBugFender('ChatRoom_getPrismUrls', e);
                });
            }
            newmessage[newmessage.length] = item;
          });
        try {
          const files: { prismId: string | null; url: string }[] = [];
          res.messages.forEach((element, index) => {
            newmessage[index] = element.entry;
            if (
              element.entry.id === patientId &&
              element.entry.message === messageCodes.imageconsult
            ) {
              files.push({ prismId: element.entry.prismId, url: element.entry.url });
            }
          });
          console.log('res', res.messages);
          setChatFiles(files);
          AsyncStorage.setItem('chatFileData', JSON.stringify(files));
          if (messages.length !== newmessage.length) {
            console.log('set saved');
            insertText = newmessage;

            setMessages(newmessage as []);
            if (!isCall || !isAudioCall) {
              console.log('chat icon', chatReceived);
              setChatReceived(true);
            }
          }
        } catch (error) {
          console.log('chat error', error);
        }
      }
    );
  };

  const send = (messageText: string) => {
    const text = {
      id: doctorId,
      message: messageText,
      messageDate: new Date(),
    };
    console.log(text, 'response');
    pubnub.publish(
      {
        channel: channel,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {
        console.log(response, 'response');
      }
    );
  };

  const callMinutes = Math.floor(callTimer / 60);
  const callSeconds = callTimer - callMinutes * 60;
  const callTimerStarted = `${
    callMinutes.toString().length < 2 ? '0' + callMinutes : callMinutes
  } : ${callSeconds.toString().length < 2 ? '0' + callSeconds : callSeconds}`;

  const CallPopUp = () => {
    return (
      <View
        style={{
          flex: 1,
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          width: width,
          backgroundColor: 'transparent',
          position: 'absolute',
          elevation: 2000,
        }}
      >
        <View
          style={{
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            width: width,
            backgroundColor: 'black',
            position: 'absolute',
            opacity: 0.41,
          }}
        />
        <View
          style={{
            marginHorizontal: 40,
            marginTop: 112,
            height: 289,
            borderRadius: 10,
            backgroundColor: 'white',
          }}
        >
          <TouchableOpacity
            onPress={() => setShowPopUp(false)}
            style={{
              height: 40,
            }}
          >
            <ClosePopup
              style={{
                top: 16,
                position: 'absolute',
                right: 16,
              }}
            />
          </TouchableOpacity>

          <Text
            style={{
              marginHorizontal: 20,
              marginTop: 21,
              color: '#02475b',
              ...theme.fonts.IBMPlexSansSemiBold(20),
            }}
          >
            {strings.consult_room.how_do_you_talk}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (!startConsult) {
                console.log('consult not started');
                Alert.alert(strings.common.apollo, strings.consult_room.please_start_consultation);
                return;
              }

              if (isAudioCall) {
                return;
              }
              //need to work form here
              callhandelBack = false;
              setIsAudioCall(true);
              setShowPopUp(false);
              setHideStatusBar(true);
              setChatReceived(false);
              sendCallNotificationAPI(APPT_CALL_TYPE.AUDIO, true);
              Keyboard.dismiss();
              pubnub.publish(
                {
                  message: {
                    isTyping: true,
                    message: messageCodes.audioCallMsg, //'^^#audiocall',
                  },
                  channel: channel,
                  storeInHistory: true,
                },
                (status, response) => {
                  if (response) {
                    startMissedCallTimer(45, () => {
                      stopAllCalls();
                      if (missedCallCounter < 2) {
                        setMissedCallCounter(missedCallCounter + 1);
                      } else {
                        callAbandonmentCall();
                      }
                    });
                  }
                }
              );
            }}
          >
            <View
              style={{
                marginHorizontal: 20,
                marginTop: 32,
                backgroundColor: '#fc9916',
                height: 40,
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                }}
              >
                <RoundCallIcon />
                <Text
                  style={{
                    marginLeft: 8,
                    color: 'white',
                    lineHeight: 24,
                    ...theme.fonts.IBMPlexSansBold(13),
                  }}
                >
                  {strings.buttons.audio_call}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (!startConsult) {
                console.log('consult not started');
                Alert.alert(strings.common.apollo, strings.consult_room.please_start_consultation);
                return;
              }
              if (isAudioCall) {
                return;
              }
              callhandelBack = false;
              setIsCall(true);
              setShowPopUp(false);
              setHideStatusBar(true);
              setChatReceived(false);
              sendCallNotificationAPI(APPT_CALL_TYPE.VIDEO, true);
              Keyboard.dismiss();
              pubnub.publish(
                {
                  message: {
                    isTyping: true,
                    message: messageCodes.videoCallMsg, //'^^#videocall',
                  },
                  channel: channel,
                  storeInHistory: true,
                },
                (status, response) => {
                  if (response) {
                    startMissedCallTimer(45, () => {
                      stopAllCalls();
                      if (missedCallCounter < 2) {
                        setMissedCallCounter(missedCallCounter + 1);
                      } else {
                        callAbandonmentCall();
                      }
                    });
                    // startNoShow(45, () => {
                    //   stopAllCalls();
                    //   if (missedCallCounter < 2) {
                    //     setMissedCallCounter(missedCallCounter + 1);
                    //   } else {
                    //     callAbandonmentCall();
                    //   }
                    // });
                  }
                }
              );
            }}
          >
            <View
              style={{
                marginHorizontal: 20,
                marginTop: 12,
                backgroundColor: '#fc9916',
                height: 40,
                borderRadius: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                }}
              >
                <RoundVideoIcon />
                <Text
                  style={{
                    marginLeft: 8,
                    color: 'white',
                    lineHeight: 24,
                    ...theme.fonts.IBMPlexSansBold(13),
                  }}
                >
                  {strings.buttons.video_call}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTabPage = () => {
    return (
      <>
        <View style={[styles.shadowview]}>
          <TabsComponent
            data={tabsData}
            onChange={(index) => setActiveTabIndex(index)}
            selectedTab={activeTabIndex}
          />
        </View>
        {!loading ? (
          <View
            style={{
              flex: 1,
            }}
          >
            {activeTabIndex == tabsData[0].title ? (
              <CaseSheetView
                // disableConsultButton={!!PatientConsultTime}
                overlayDisplay={(component) => {
                  setOverlayDisplay(component);
                }}
                onStartConsult={onStartConsult}
                onStopConsult={onStopConsult}
                startConsult={startConsult}
                navigation={props.navigation}
                messagePublish={(message: any) => {
                  pubnub.publish(
                    {
                      message,
                      channel: channel,
                      storeInHistory: true,
                    },
                    (status, response) => {}
                  );
                }}
                chatFiles={chatFiles}
                setUrl={setUrl}
                setPatientImageshow={setPatientImageshow}
                setShowPDF={setShowPDF}
                favList={favList}
                favMed={favMed}
                favTest={favTest}
                caseSheet={caseSheet}
                getdetails={() => getCaseSheetAPI()}
                saveDetails={(
                  showLoading: boolean,
                  inputdata?: ModifyCaseSheetInput,
                  callBack?: () => void
                ) => saveDetails(showLoading, false, inputdata, callBack)}
                caseSheetEdit={caseSheetEdit}
                setCaseSheetEdit={setCaseSheetEdit}
                showEditPreviewButtons={showEditPreviewButtons}
                setShowEditPreviewButtons={setShowEditPreviewButtons}
                symptonsData={symptonsData}
                setSymptonsData={(data) => setSymptonsData(data)}
                pastList={pastList}
                setPastList={setPastList}
                lifeStyleData={lifeStyleData}
                setLifeStyleData={setLifeStyleData}
                medicalHistory={medicalHistory}
                setMedicalHistory={setMedicalHistory}
                familyValues={familyValues}
                setFamilyValues={setFamilyValues}
                patientDetails={patientDetails}
                setPatientDetails={setPatientDetails}
                healthWalletArrayData={healthWalletArrayData}
                setHealthWalletArrayData={setHealthWalletArrayData}
                tests={tests}
                setTests={setTests}
                addedAdvices={addedAdvices}
                setAddedAdvices={setAddedAdvices}
                juniordoctornotes={juniordoctornotes}
                setJuniorDoctorNotes={setJuniorDoctorNotes}
                diagnosisData={diagnosisData}
                setDiagnosisData={setDiagnosisData}
                medicinePrescriptionData={medicinePrescriptionData}
                setMedicinePrescriptionData={setMedicinePrescriptionData}
                selectedMedicinesId={selectedMedicinesId}
                setSelectedMedicinesId={setSelectedMedicinesId}
                switchValue={switchValue}
                setSwitchValue={setSwitchValue}
                followupDays={followupDays}
                setFollowupDays={setFollowupDays}
                followUpConsultationType={followUpConsultationType}
                setFollowUpConsultationType={setFollowUpConsultationType}
                doctorNotes={doctorNotes}
                setDoctorNotes={setDoctorNotes}
                displayId={displayId}
                setDisplayId={setDisplayId}
                prescriptionPdf={prescriptionPdf}
                setPrescriptionPdf={setPrescriptionPdf}
                selectedReferral={selectedReferral}
                setSelectedReferral={setSelectedReferral}
                referralReason={referralReason}
                setReferralReason={setReferralReason}
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  width: '100%',
                }}
              >
                <ChatRoom
                  returnToCall={returnToCall}
                  setReturnToCall={setReturnToCall}
                  setChatReceived={setChatReceived}
                  navigation={props.navigation}
                  messages={messages}
                  send={send}
                  setAudioCallStyles={setAudioCallStyles}
                  flatListRef={flatListRef}
                  setShowPDF={setShowPDF}
                  setPatientImageshow={setPatientImageshow}
                  setUrl={setUrl}
                  isDropdownVisible={isDropdownVisible}
                  setDropdownVisible={setDropdownVisible}
                  patientDetails={patientDetails}
                />
              </View>
            )}
          </View>
        ) : null}
      </>
    );
  };

  const onStartConsult = () => {
    client
      .mutate<CreateAppointmentSession, CreateAppointmentSessionVariables>({
        mutation: CREATEAPPOINTMENTSESSION,
        variables: {
          createAppointmentSessionInput: {
            appointmentId: AppId,
            requestRole: REQUEST_ROLES.DOCTOR,
          },
        },
      })
      .then((_data: any) => {
        setCaseSheetEdit(true);
        console.log('createsession', _data);
        console.log('sessionid', _data.data.createAppointmentSession.sessionId);
        console.log('appointmentToken', _data.data.createAppointmentSession.appointmentToken);
        setsessionId(_data.data.createAppointmentSession.sessionId);
        settoken(_data.data.createAppointmentSession.appointmentToken);

        //
        setTimeout(() => {
          flatListRef.current && flatListRef.current.scrollToEnd();
        }, 1000);
        sendCallNotificationAPI(APPT_CALL_TYPE.CHAT, false);
        console.log('onStartConsult');
        pubnub.publish(
          {
            message: {
              isTyping: true,
              message: messageCodes.startConsultMsg,
            },
            channel: channel,
            storeInHistory: true,
          },
          (status, response) => {
            setActiveTabIndex(tabsData[0].title);
            setStartConsult(true);
            if (timediffInSec > 0) {
              startNoShow(timediffInSec, () => {
                console.log('countdown ', joinTimerNoShow);
                startNoShow(600, () => {
                  console.log('Trigger no ShowAPi');
                  console.log(joinTimerNoShow, 'joinTimerNoShow');

                  endAppointmentApiCall(STATUS.NO_SHOW);
                });
              });
            } else {
              startNoShow(600, () => {
                console.log('Trigger no ShowAPi');
                endAppointmentApiCall(STATUS.NO_SHOW);
              });
            }
            startInterval(timer);
          }
        );
      })
      .catch((e: any) => {
        console.log('Error occured while adding Doctor', e);
      });
  };

  const onStopConsult = () => {
    console.log('onStopConsult');
    endCallNotificationAPI(false);
    pubnub.publish(
      {
        message: {
          isTyping: true,
          message: messageCodes.stopConsultMsg,
        },
        channel: channel,
        storeInHistory: true,
      },
      (status, response) => {
        setStartConsult(false);
        stopInterval();
        stopTimer();
        stopMissedCallTimer();
        stopNoShow();
      }
    );
  };

  const renderCancelPopup = () => {
    return (
      <AphOverlay
        headingViewStyle={{
          ...theme.viewStyles.cardContainer,
          zIndex: 1,
          ...theme.viewStyles.shadowStyle,
        }}
        heading={strings.consult.cancel_consult}
        onClose={() => {
          // setfavAdvice('');
          // setIsAdvice(false);
          setshowCancelPopup(false);
        }}
        isVisible={true}
      >
        <View
          style={{
            backgroundColor: 'white',
            margin: 16,
            borderRadius: 10,
            padding: 16,
            marginBottom: 60,
          }}
        >
          <Text style={styles.inputTextStyle}>Why do you want to cancel this consult?</Text>
          <TouchableOpacity
            style={{ marginBottom: 20 }}
            onPress={() => {
              setshowCancelReason(true);
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                borderBottomWidth: 2,
                borderBottomColor: theme.colors.APP_GREEN,
                // justifyContent: 'space-between',
              }}
            >
              <Text style={{ ...theme.viewStyles.text('M', 16, theme.colors.SHARP_BLUE), flex: 1 }}>
                {selectedReason}
              </Text>
              <Down />
            </View>
          </TouchableOpacity>

          {selectedReason === 'Other' && (
            <TextInputComponent
              placeholder="Enter here..."
              value={otherReason}
              onChangeText={setotherReason}
            />
          )}
        </View>
        <BottomButtons
          whiteButtontitle={strings.buttons.cancel}
          disabledOrange={showLoading ? true : selectedReason === 'Other' && otherReason === ''}
          cancelFun={() => {
            setshowCancelPopup(false);
          }}
          yellowButtontitle={strings.consult.cancel_consult}
          successFun={() => {
            console.log('successFun:');
            setShowLoading(true);
            mutationCancelSrdConsult({
              variables: {
                cancelAppointmentInput: {
                  appointmentId: AppId,
                  cancelReason: selectedReason === 'Other' ? otherReason : selectedReason,
                  cancelledBy: REQUEST_ROLES.DOCTOR,
                  cancelledById: doctorDetails ? doctorDetails.id : '',
                },
              },
            })
              .then((response) => {
                console.log(response, 'cancel response');
                const text = {
                  id: doctorDetails ? doctorDetails.id : '',
                  message: messageCodes.cancelConsultInitiated,
                  isTyping: true,
                  messageDate: new Date(),
                  sentBy: REQUEST_ROLES.DOCTOR,
                };
                pubnub.publish(
                  {
                    message: text,
                    channel: channel,
                    storeInHistory: true,
                  },
                  (status: any, response: any) => {
                    props.navigation.goBack();
                  }
                );
              })
              .catch((e: ApolloError) => {
                console.log(e, 'cancel');

                setShowLoading(false);
                showAphAlert &&
                  showAphAlert({
                    title: 'Alert!',
                    description: 'Error occured while cancelling appointment. Please try again',
                  });
                Alert.alert(e.graphQLErrors[0].message);
              });
          }}
        />
        {showCancelReason && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10000,
              elevation: 10000,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 10,
                ...theme.viewStyles.shadowStyle,
                padding: 16,
                paddingBottom: 0,
                marginHorizontal: 16,
              }}
            >
              {reasons.map((name) => (
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 16, theme.colors.SHARP_BLUE),
                    paddingBottom: 16,
                  }}
                  onPress={() => {
                    setselectedReason(name);
                    setshowCancelReason(false);
                    setotherReason('');
                  }}
                >
                  {name}
                </Text>
              ))}
            </View>
          </View>
        )}
      </AphOverlay>
    );
  };

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime - minutes * 60;

  const showHeaderView = () => {
    return (
      <NotificationHeader
        containerStyle={styles.mainview}
        leftIcons={[
          {
            icon: (
              <View
                style={{
                  marginTop: 0,
                }}
              >
                <BackArrow />
              </View>
            ),
            onPress: () => backDataFunctionality(),
          },
        ]}
        middleText={strings.consult_room.consult_room}
        // timerremaintext={!consultStarted ? PatientConsultTime : undefined}
        timerremaintext={
          isAutoSaved ? 'Auto Saved at ' + moment(savedTime).format('DD:MM:YY:HH:mm:ss') : undefined
        }
        headingContainer={{
          marginLeft:
            (appointmentData || {}).appointmentState == 'AWAITING_RESCHEDULE' ||
            (appointmentData || {}).status == 'COMPLETED' ||
            showEditPreviewButtons ||
            isAudioCall ||
            isCall
              ? (appointmentData || {}).status == 'COMPLETED' || showEditPreviewButtons
                ? -30
                : 0
              : 20,
        }}
        rightIcons={[
          {
            icon: (
              <View
                style={{
                  marginTop: 0,
                  opacity: startConsult ? 1 : 0.5,
                }}
              >
                {(appointmentData || {}).status == 'COMPLETED' || showEditPreviewButtons ? null : (
                  <Call />
                )}
              </View>
            ),
            onPress: () => {
              callPermissions(() => {
                if (startConsult) {
                  setActiveTabIndex(tabsData[1].title);
                  setShowPopUp(true);
                }
              });
            },
          },
          {
            icon: (
              <>
                <View
                  style={{
                    marginTop: 0,
                    //opacity: startConsult ? 1 : 0.5,
                  }}
                >
                  {(appointmentData || {}).appointmentState == 'AWAITING_RESCHEDULE' ||
                  (appointmentData || {}).status == 'COMPLETED' ||
                  showEditPreviewButtons ||
                  isAudioCall ||
                  isCall ? null : (
                    <DotIcon />
                  )}
                </View>
              </>
            ),
            onPress: () => setDropdownShow(!dropdownShow), //startConsult && setDropdownShow(!dropdownShow),
          },
        ]}
      />
    );
  };

  const renderDropdown = () => {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          alignItems: 'flex-end',
          overflow: 'hidden',
          ...Platform.select({
            ios: {
              zIndex: 1,
            },
            android: {
              elevation: 12,
              zIndex: 2,
            },
          }),
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            width: '100%',
            height: '100%',
            alignItems: 'flex-end',
          }}
          onPress={() => {
            setDropdownShow(false);
          }}
        >
          <DropDown
            containerStyle={{
              width: '50%',
              marginRight: 20,
              marginTop: 40,
              height: 120,
            }}
            options={[
              {
                optionText: strings.consult_room.reschedule,
                onPress: () => {
                  setDropdownShow(false);
                  setDisplayReSchedulePopUp(true);
                },
              },
              {
                optionText: strings.consult.end_cancel_consult,
                onPress: () => {
                  if (
                    (appointmentData || {}).status === STATUS.PENDING ||
                    (appointmentData || {}).status === STATUS.IN_PROGRESS ||
                    ((appointmentData || {}).appointmentStatus === STATUS.COMPLETED &&
                      (appointmentData || {}).sentToPatient === false)
                    // (appointmentData.appointmentStatus === STATUS.COMPLETED &&
                    //   appointmentData.sentToPatient === false) ||
                    // // (isClickedOnPriview || props.sentToPatient === false) &&
                    // caseSheetEdit ||
                    // (!caseSheetEdit &&
                    //   (appointmentData.status === STATUS.PENDING ||
                    //     appointmentData.status === STATUS.IN_PROGRESS))
                  ) {
                    setDropdownShow(false);
                    setshowCancelPopup(true);
                  } else {
                    showAphAlert &&
                      showAphAlert({
                        title: 'Alert!',
                        description: 'You are not allowed to cancel the appointment.',
                      });
                  }
                },
              },
            ]}
          />
        </TouchableOpacity>
      </View>
    );
  };
  const uploadPrescriptionPopup = () => {
    return (
      <UploadPrescriprionPopup
        heading={strings.consult_room.attach_files}
        instructionHeading={strings.consult_room.instruction_for_upload}
        instructions={[strings.consult_room.instruction_list]}
        isVisible={isDropdownVisible}
        disabledOption={strings.consult_room.none}
        optionTexts={{
          camera: strings.consult_room.take_a_photo,
          gallery: strings.consult_room.choose_from_gallery,
        }}
        hideTAndCs={true}
        onClickClose={() => setDropdownVisible(false)}
        onResponse={(selectedType, response) => {
          setDropdownVisible(false);
          if (selectedType == 'CAMERA_AND_GALLERY') {
            console.log('ca', selectedType);
            console.log('CAMERA_AND_GALLERY', response);
            response.forEach((item: any) => {
              if (
                item.fileType == 'jpg' ||
                item.fileType == 'jpeg' ||
                item.fileType == 'pdf' ||
                item.fileType == 'png'
              ) {
                setShowLoading(true);
                client
                  .mutate<uploadChatDocument>({
                    mutation: UPLOAD_CHAT_FILE,
                    fetchPolicy: 'no-cache',
                    variables: {
                      fileType: item.fileType == 'jpg' ? 'JPEG' : item.fileType.toUpperCase(), //type.toUpperCase(),
                      base64FileInput: item.base64, //resource.data,
                      appointmentId: channel,
                    },
                  })
                  .then((data) => {
                    console.log('upload data', data);
                    setShowLoading(false);
                    const text = {
                      id: doctorId,
                      message: messageCodes.imageconsult,
                      fileType: 'image',
                      url: g(data, 'data', 'uploadChatDocument', 'filePath') || '',
                      messageDate: new Date(),
                    };
                    pubnub.publish(
                      {
                        channel: channel,
                        message: text,
                        storeInHistory: true,
                        sendByPost: true,
                      },
                      (status, response) => {}
                    );
                  })
                  .catch((e) => {
                    setShowLoading(false);
                    console.log('upload data error', e);
                  });
              }
            });

            // uploadDocument(response, response[0].base64, response[0].fileType);
            //updatePhysicalPrescriptions(response);
          } else {
            // setSelectPrescriptionVisible(true);
          }
        }}
      />
    );
  };
  const closeviews = () => {
    setPatientImageshow(false);
    setShowWeb(false);
  };
  const popupView = (children: React.ReactNode) => {
    return (
      <View style={styles.positionAbsolute}>
        <View
          style={{
            ...styles.positionAbsolute,
            backgroundColor: 'black',
            opacity: 0.6,
          }}
        />
        <View
          style={{
            alignSelf: 'flex-end',
            backgroundColor: 'transparent',
            marginRight: 16,
            marginTop: 30,
          }}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => closeviews()}>
            <CrossPopup
              style={{
                marginRight: 1,
                height: 28,
                width: 28,
              }}
            />
          </TouchableOpacity>
        </View>
        {children}
      </View>
    );
  };

  const imageOpen = () => {
    console.log(url);

    return popupView(
      <Image
        style={{
          flex: 1,
          resizeMode: 'contain',
          marginTop: 20,
          marginHorizontal: 20,
          marginBottom: 20,
          borderRadius: 10,
        }}
        source={{
          uri: url,
        }}
      />
    );
  };
  const showWeimageOpen = () => {
    console.log(url, 'showWeimageOpen url');

    return popupView(
      <WebView
        style={{
          marginTop: 20,
          marginHorizontal: 20,
          marginBottom: 20,
          borderRadius: 10,
        }}
        source={{
          uri: url,
        }}
      />
    );
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      {showLoading && <Spinner />}
      <SafeAreaView
        style={{
          flex: 1,
        }}
      >
        <StatusBar hidden={hideStatusBar} />
        {showHeaderView()}
        {overlayDisplay}
        {displayReSchedulePopUp && (
          <ReSchedulePopUp
            doctorId={doctorId}
            appointmentId={AppId}
            onClose={() => setDisplayReSchedulePopUp(false)}
            date={Appintmentdatetime}
            loading={(val) => setLoading && setLoading(val)}
            onDone={(reschduleObject) => {
              console.log(reschduleObject, 'reschduleObject');
              pubnub.publish(
                {
                  message: {
                    id: doctorId,
                    message: messageCodes.rescheduleconsult,
                    transferInfo: reschduleObject,
                  },
                  channel: AppId,
                  storeInHistory: true,
                },
                (status, response) => {}
              );
              props.navigation.push(AppRoutes.TabBar);
            }}
          />
        )}
        {dropdownShow ? renderDropdown() : null}
        {renderTabPage()}
        {showPopUp && CallPopUp()}
        {isAudioCall && (
          <AudioCall
            minutes={minutes}
            seconds={seconds}
            convertVideo={convertVideo}
            callTimerStarted={callTimerStarted}
            audioCallStyles={audioCallStyles}
            setAudioCallStyles={setAudioCallStyles}
            cameraPosition={cameraPosition}
            setCameraPosition={setCameraPosition}
            firstName={patientDetails ? patientDetails.firstName || '' : ''}
            profileImage={patientDetails ? patientDetails.photoUrl || '' : ''}
            chatReceived={chatReceived}
            callAccepted={callAccepted}
            setChatReceived={setChatReceived}
            setReturnToCall={setReturnToCall}
            showVideo={showVideo}
            otSessionRef={otSessionRef}
            sessionId={sessionId}
            token={token}
            subscriberEventHandlers={subscriberEventHandlers}
            publisherEventHandlers={publisherEventHandlers}
            sessionEventHandlers={sessionEventHandlers}
            navigation={props.navigation}
            onVideoToggle={() => {
              showVideo === true ? setShowVideo(false) : setShowVideo(true);
              pubnub.publish(
                {
                  message: {
                    isTyping: true,
                    message:
                      showVideo === true
                        ? messageCodes.covertVideoMsg
                        : messageCodes.covertAudioMsg,
                  },
                  channel: channel,
                  storeInHistory: false,
                },
                (status, response) => {}
              );
            }}
            onPressEndCall={() => {
              setIsAudioCall(false);
              setHideStatusBar(false);
              stopTimer();
              stopMissedCallTimer();
              setChatReceived(false);
              setConvertVideo(false);
              setShowVideo(true);
              endCallNotificationAPI(true);
              pubnub.publish(
                {
                  message: {
                    isTyping: true,
                    message: strings.consult_room.audio_call_ended,
                    duration: callTimerStarted,
                    id: doctorId,
                    messageDate: new Date(),
                  },
                  channel: channel,
                  storeInHistory: true,
                },
                (status, response) => {}
              );
            }}
          />
        )}
        {isCall && (
          <VideoCall
            navigation={props.navigation}
            setChatReceived={setChatReceived}
            chatReceived={chatReceived}
            callAccepted={callAccepted}
            callMinutes={callMinutes}
            callSeconds={callSeconds}
            minutes={minutes}
            seconds={seconds}
            firstName={patientDetails ? patientDetails.firstName || '' : ''}
            subscriberEventHandlers={subscriberEventHandlers}
            sessionEventHandlers={sessionEventHandlers}
            sessionId={sessionId}
            token={token}
            otSessionRef={otSessionRef}
            publisherEventHandlers={publisherEventHandlers}
            cameraPosition={cameraPosition}
            setCameraPosition={setCameraPosition}
            onPressBottomEndCall={() => {
              setIsCall(false);
              stopTimer();
              setHideStatusBar(false);
              setChatReceived(false);
              stopMissedCallTimer();
              endCallNotificationAPI(true);
              pubnub.publish(
                {
                  message: {
                    isTyping: true,
                    message: strings.consult_room.video_call_ended,
                    duration: callTimerStarted,
                    id: doctorId,
                  },
                  channel: channel,
                  storeInHistory: true,
                },
                (status, response) => {}
              );
            }}
            onPressEnd={() => {
              // setIsCall(false);
              stopTimer();
              setHideStatusBar(false);
              setChatReceived(false);
              stopMissedCallTimer();
              endCallNotificationAPI(true);
              pubnub.publish(
                {
                  message: {
                    isTyping: true,
                    message: strings.consult_room.video_call_ended,
                    duration: callTimerStarted,
                    id: doctorId,
                  },
                  channel: channel,
                  storeInHistory: true,
                },
                (status, response) => {}
              );
            }}
          />
        )}
        {uploadPrescriptionPopup()}
        {patientImageshow && imageOpen()}
        {showweb && showWeimageOpen()}
        {showPDF && (
          <RenderPdf
            uri={url}
            title={
              url
                .split('/')
                .pop()!
                .split('=')
                .pop() || 'Document'
            }
            isPopup={true}
            setDisplayPdf={() => {
              setShowPDF(false);
              setUrl('');
            }}
            navigation={props.navigation}
          />
        )}
        {showCancelPopup && renderCancelPopup()}
        {/* {showMorePopup && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            // width: 200,
            // backgroundColor: 'red',
            zIndex: 1000,
            elevation: 100,
            alignItems: 'flex-end',
          }}
          onPress={() => setshowMorePopup(false)}
        >
          <View
            style={{
              // width: 150,
              // height: 50,
              marginTop: 30,
              marginRight: 20,
              ...theme.viewStyles.shadowStyle,
              borderRadius: 10,
              backgroundColor: 'white',
            }}
          >
            <Text
              style={{
                color: theme.colors.LIGHT_BLUE,
                ...theme.fonts.IBMPlexSansMedium(15),
                textAlign: 'left',
                padding: 15,
              }}
              onPress={() => {
                setshowCancelPopup(true);
                setshowMorePopup(false);
              }}
            >
              {strings.consult.end_cancel_consult}
            </Text>
          </View>
        </TouchableOpacity>
      )} */}
      </SafeAreaView>
    </View>
  );
};
