import { ReSchedulePopUp } from '@aph/mobile-doctors/src/components/Appointments/ReSchedulePopUp';
import { UploadPrescriprionPopup } from '@aph/mobile-doctors/src/components/Appointments/UploadPrescriprionPopup';
import { useAudioVideo } from '@aph/mobile-doctors/src/components/Chat/AudioVideoCotext';
import { getFavoutires } from '@aph/mobile-doctors/src/components/ConsultRoom/ConsultRoomAPICalls';
import { CaseSheetView } from '@aph/mobile-doctors/src/components/ConsultRoom/CaseSheetView';
import { ChatRoom } from '@aph/mobile-doctors/src/components/ConsultRoom/ChatRoom';
import { ConsultRoomScreenStyles } from '@aph/mobile-doctors/src/components/ConsultRoom/ConsultRoomScreen.styles';
import { RateCall } from '@aph/mobile-doctors/src/components/ConsultRoom/RateCall';
import { AphOverlay } from '@aph/mobile-doctors/src/components/ui/AphOverlay';
import { BottomButtons } from '@aph/mobile-doctors/src/components/ui/BottomButtons';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import {
  BackArrow,
  Call,
  ClosePopup,
  CloseWhite,
  ConnectCall,
  DotIcon,
  Down,
  Join,
  JoinWhite,
  Minimize,
  RoundCallIcon,
  RoundChatIcon,
  RoundVideoIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { ImageZoom } from '@aph/mobile-doctors/src/components/ui/ImageZoom';
import { OptionsObject } from '@aph/mobile-doctors/src/components/ui/MaterialMenu';
import { NotificationHeader } from '@aph/mobile-doctors/src/components/ui/NotificationHeader';
import { RenderPdf } from '@aph/mobile-doctors/src/components/ui/RenderPdf';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { TabsComponent } from '@aph/mobile-doctors/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-doctors/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import {
  CALL_DISCONNECT_NOTIFICATION,
  CANCEL_APPOINTMENT,
  CREATEAPPOINTMENTSESSION,
  CREATE_CASESHEET_FOR_SRD,
  END_APPOINTMENT_SESSION,
  END_CALL_NOTIFICATION,
  EXO_TEL_CALL,
  GET_CASESHEET,
  MODIFY_CASESHEET,
  POST_WEB_ENGAGE,
  SAVE_APPOINTMENT_CALL_FEEDBACK,
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
  GetCaseSheet_getCaseSheet_caseSheetDetails_removedMedicinePrescription,
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
  GetCaseSheet_getCaseSheet_pastAppointments,
  GetCaseSheet_getCaseSheet_patientDetails_familyHistory,
} from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet } from '@aph/mobile-doctors/src/graphql/types/GetDoctorAppointments';
import { GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList_adviceList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteAdviceList';
import { GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteMedicineList';
import { GetDoctorFavouriteTestList_getDoctorFavouriteTestList_testList } from '@aph/mobile-doctors/src/graphql/types/GetDoctorFavouriteTestList';
import {
  APPT_CALL_TYPE,
  BOOKINGSOURCE,
  CALL_FEEDBACK_RESPONSES_TYPES,
  ConsultMode,
  DEVICETYPE,
  DoctorType,
  DOCTOR_CALL_TYPE,
  exotelInput,
  MEDICINE_FORM_TYPES,
  ModifyCaseSheetInput,
  REQUEST_ROLES,
  STATUS,
  WebEngageEvent,
} from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import {
  initateConferenceTelephoneCall,
  initateConferenceTelephoneCallVariables,
} from '@aph/mobile-doctors/src/graphql/types/initateConferenceTelephoneCall';
import {
  modifyCaseSheet,
  modifyCaseSheetVariables,
} from '@aph/mobile-doctors/src/graphql/types/modifyCaseSheet';
import {
  postDoctorConsultEvent,
  postDoctorConsultEventVariables,
} from '@aph/mobile-doctors/src/graphql/types/postDoctorConsultEvent';
import {
  saveAppointmentCallFeedback,
  saveAppointmentCallFeedbackVariables,
} from '@aph/mobile-doctors/src/graphql/types/saveAppointmentCallFeedback';
import {
  sendCallDisconnectNotification,
  sendCallDisconnectNotificationVariables,
} from '@aph/mobile-doctors/src/graphql/types/sendCallDisconnectNotification';
import {
  SendCallNotification,
  SendCallNotificationVariables,
} from '@aph/mobile-doctors/src/graphql/types/SendCallNotification';
import { uploadChatDocument } from '@aph/mobile-doctors/src/graphql/types/uploadChatDocument';
import { AppConfig } from '@aph/mobile-doctors/src/helpers/AppConfig';
import { getPrismUrls } from '@aph/mobile-doctors/src/helpers/clientCalls';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import {
  callPermissions,
  g,
  getNetStatus,
  messageCodes,
  permissionHandler,
} from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { mimeType } from '@aph/mobile-doctors/src/helpers/mimeType';
import {
  postWebEngageEvent,
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-doctors/src/helpers/WebEngageHelper';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import { ApolloError } from 'apollo-client';
import moment from 'moment';
import Pubnub, { HereNowResponse } from 'pubnub';
import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient, useMutation } from 'react-apollo-hooks';
import {
  Alert,
  AppState,
  AppStateStatus,
  BackHandler,
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import firebase from 'react-native-firebase';
import KeepAwake from 'react-native-keep-awake';
import { PERMISSIONS } from 'react-native-permissions';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import RNFetchBlob from 'rn-fetch-blob';

const { width } = Dimensions.get('window');
// let joinTimerNoShow: NodeJS.Timeout;  //APP-2812: removed NoShow
const styles = ConsultRoomScreenStyles;

const timer = 900;
let intervalId: NodeJS.Timeout;
let stoppedTimer: number;
let callhandelBack: boolean = true;
let autoSaveTimerId: NodeJS.Timeout;

export interface ConsultRoomScreenProps
  extends NavigationScreenProps<{
    DoctorId: string;
    PatientId: string;
    PatientConsultTime: string;
    AppId: string;
    Appintmentdatetime: string; //Date;
    AppoinementData: any;
    prevCaseSheet?: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet | null;
    activeTabIndex?: number;
    caseSheetEnableEdit?: boolean;
  }> {
  activeTabIndex?: number;
}

interface DataPair {
  key: string;
  value: string;
}

export const ConsultRoomScreen: React.FC<ConsultRoomScreenProps> = (props) => {
  const tabsData = [
    { title: string.consult_room.case_sheet, key: '0' },
    { title: string.consult_room.chat, key: '1' },
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
  const {
    showAphAlert,
    hideAphAlert,
    loading,
    setLoading,
    showPopup,
    hidePopup,
    showFloatingCotainer,
    hideFloatingContainer,
  } = useUIElements();
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
  const [messageText, setMessageText] = useState<string>('');
  const [messages, setMessages] = useState([]);
  const [displayReSchedulePopUp, setDisplayReSchedulePopUp] = useState<boolean>(false);

  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const [startConsult, setStartConsult] = useState<boolean>(false);

  const [caseSheet, setcaseSheet] = useState<GetCaseSheet_getCaseSheet | null | undefined>();
  const [caseSheetEdit, setCaseSheetEdit] = useState<boolean>(
    props.navigation.getParam('caseSheetEnableEdit') || false
  );
  const [showEditPreviewButtons, setShowEditPreviewButtons] = useState<boolean>(false);
  const [chatFiles, setChatFiles] = useState<
    { prismId: string | null; url: string; fileType: 'image' | 'pdf' }[]
  >([]);
  const [symptonsData, setSymptonsData] = useState<
    (GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms | null)[] | null
  >([]);

  const [showPDF, setShowPDF] = useState<boolean>(false);
  const [patientImageshow, setPatientImageshow] = useState<boolean>(false);
  const [url, setUrl] = useState('');
  const [showCancelPopup, setshowCancelPopup] = useState<boolean>(false);
  const [showCancelReason, setshowCancelReason] = useState<boolean>(false);
  const [selectedReason, setselectedReason] = useState<string>(reasons[0]);
  const [otherReason, setotherReason] = useState<string>('');
  const [isAutoSaved, setIsAutoSaved] = useState<boolean>(false);

  const [savedTime, setSavedTime] = useState<string>('');
  const mutationCancelSrdConsult = useMutation<cancelAppointment, cancelAppointmentVariables>(
    CANCEL_APPOINTMENT
  );
  const { doctorDetails, specialties, getSpecialties } = useAuth();
  const [favList, setFavList] = useState<
    (GetDoctorFavouriteAdviceList_getDoctorFavouriteAdviceList_adviceList | null)[] | null
  >(null);
  const [favMed, setFavMed] = useState<
    (GetDoctorFavouriteMedicineList_getDoctorFavouriteMedicineList_medicineList | null)[] | null
  >(null);
  const [favTest, setFavTest] = useState<
    (GetDoctorFavouriteTestList_getDoctorFavouriteTestList_testList | null)[] | null
  >(null);

  const {
    setOpenTokKeys,
    setCallBacks,
    callData,
    callOptions,
    errorPopup,
    setGiveRating,
    giveRating,
  } = useAudioVideo();
  useEffect(() => {
    getSpecialties();
    getFavoutires(client, setFavList, setFavMed, setFavTest);
    // callAbandonmentCall();
    console.log('PatientConsultTime', PatientConsultTime);
    console.log(caseSheetEdit, 'caseSheetEdit');
    AsyncStorage.removeItem('editedInputData');
    AsyncStorage.removeItem('prevSavedData');
    KeepAwake.activate();
    setTimeout(() => {
      flatListRef.current && flatListRef.current.scrollToEnd();
    }, 1000);
    getCaseSheetAPI(() => {
      postBackendWebEngage(WebEngageEvent.DOCTOR_IN_CHAT_WINDOW);
    });
    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', backDataFunctionality);
    });

    const willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    });

    return () => {
      sendDoctorLeavesEvent();
      postBackendWebEngage(WebEngageEvent.DOCTOR_LEFT_CHAT_WINDOW);
      didFocusSubscription && didFocusSubscription.remove();
      willBlurSubscription && willBlurSubscription.remove();
      // stopNoShow();
      callOptions.stopMissedCallTimer();
      stopAutoSaveTimer();
      AsyncStorage.removeItem('editedInputData');
      AsyncStorage.removeItem('prevSavedData');
      AsyncStorage.removeItem('chatFileData');
      AsyncStorage.removeItem('scrollToEnd');
      AsyncStorage.removeItem('callDataSend');
      AsyncStorage.removeItem('patientName');
      AsyncStorage.removeItem('postWebEngageData');
      AsyncStorage.removeItem('basicAppointmentData');
      AsyncStorage.setItem('AppointmentSelect', 'false');
      KeepAwake.deactivate();
      pubnub.unsubscribeAll();
      pubnub.stop();
      hideFloatingContainer();
    };
  }, []);

  const showJoinPopUp = async () => {
    const patientName = (await AsyncStorage.getItem('patientName')) || '';
    showFloatingCotainer({
      child: renderJoinView(patientName),
      mainContainerStyle: styles.floatingContainerFullScreen,
      backHandleEnabled: true,
      customBack: () => {
        showFloatingCotainer({
          child: renderJoinMinimizedView(),
          mainContainerStyle: styles.floatingContainerButton,
          backHandleEnabled: true,
          customBack: () => {
            showAphAlert &&
              showAphAlert({
                title: string.common.alert,
                description: 'Patient has joined consult room, Do you want to leave?',
                CTAs: [
                  {
                    text: 'YES',
                    onPress: () => {
                      hideAphAlert && hideAphAlert();
                      backDataFunctionality();
                    },
                  },
                  {
                    text: 'NO',
                    type: 'white-button',
                    onPress: () => {
                      hideAphAlert && hideAphAlert();
                    },
                  },
                ],
              });
          },
        });
      },
    });
  };

  const renderJoinMinimizedView = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          connectCall('V', true);
        }}
      >
        <View style={styles.joinFloatingButtonContainer}>
          <JoinWhite />
          <Text style={styles.joinFloatingText}>JOIN</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderJoinView = (name: string) => {
    return (
      <View style={styles.joinMainContainer}>
        <View style={styles.joinSubContainer}>
          <View style={styles.joinMinimizeIconContainer}>
            <TouchableOpacity
              onPress={() => {
                showFloatingCotainer({
                  child: renderJoinMinimizedView(),
                  mainContainerStyle: styles.floatingContainerButton,
                });
              }}
            >
              <View style={styles.exobuttonContainer}>
                <Text style={styles.notNowText}>Not Now</Text>
                <Minimize />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.joinTextContainer}>
            <Join />
            <Text style={styles.joinDisplayTextStyle}>
              {string.case_sheet.join_heading.replace('{0}', name)}
            </Text>
          </View>
          <View style={styles.joinButtonContainer}>
            <Button
              onPress={() => {
                connectCall('V', true);
              }}
              title={'JOIN'}
              style={styles.joinButtonStyle}
            />
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    if ((appointmentData || {}).appointmentState == 'AWAITING_RESCHEDULE') {
      showPopup({
        description: string.popUP.awaiting_reschedule,
      });
    }
  }, [appointmentData]);
  useEffect(() => {
    if (startConsult) {
      AsyncStorage.setItem('showInAppNotification', 'false');
    } else {
      AsyncStorage.setItem('showInAppNotification', 'true');
    }
  }, [startConsult]);
  const backDataFunctionality = () => {
    try {
      console.log(callhandelBack, 'is back called');
      if (callhandelBack) {
        saveDetails(true, true, undefined, () => {
          setLoading && setLoading(false);
          props.navigation.popToTop();
        });
        return true;
      } else {
        return true;
      }
    } catch (error) {
      console.log(error, 'error');
    }
  };

  const sendDoctorLeavesEvent = () => {
    pubnub.publish(
      {
        message: {
          isTyping: true,
          message: messageCodes.leaveChatRoom,
        },
        channel: channel,
        storeInHistory: false,
        sendByPost: false,
      },
      (status: any, response: any) => {}
    );
  };

  const postBackendWebEngage = async (eventType: WebEngageEvent) => {
    const postData: {
      consultMode: ConsultMode;
      displayId: string;
      doctorFullName: string;
      mobileNumber: string;
    } | null = JSON.parse((await AsyncStorage.getItem('postWebEngageData')) || '');
    client
      .mutate<postDoctorConsultEvent, postDoctorConsultEventVariables>({
        mutation: POST_WEB_ENGAGE,
        variables: {
          doctorConsultEventInput: {
            consultID: channel,
            consultMode:
              (postData && postData.consultMode) ||
              g(appointmentData, 'appointmentType') ||
              g(caseSheet, 'caseSheetDetails', 'appointment', 'appointmentType') ||
              ConsultMode.BOTH,
            displayId:
              (
                (postData && postData.displayId) ||
                g(appointmentData, 'displayId') ||
                g(caseSheet, 'caseSheetDetails', 'appointment', 'displayId') ||
                ''
              ).toString() ||
              (g(appointmentData, 'displayId') || '').toString() ||
              '',
            doctorFullName:
              (postData && postData.doctorFullName) ||
              g(doctorDetails, 'fullName') ||
              g(caseSheet, 'caseSheetDetails', 'appointment', 'doctorInfo', 'fullName') ||
              '',
            eventName: eventType,
            mobileNumber:
              (postData && postData.mobileNumber) ||
              g(caseSheet, 'patientDetails', 'mobileNumber') ||
              '',
          },
        },
      })
      .then((data) => {})
      .catch((error) => {});
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
            title: string.common.alert,
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
  const [tests, setTests] = useState<
    { itemname: string; testInstruction?: string; isSelected: boolean }[]
  >([]);
  const [addedAdvices, setAddedAdvices] = useState<DataPair[]>([]);
  const [juniordoctornotes, setJuniorDoctorNotes] = useState<string | null>('');
  const [diagnosisData, setDiagnosisData] = useState<
    (GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis | null)[] | null
  >([]);
  const [medicinePrescriptionData, setMedicinePrescriptionData] = useState<
    (GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription | null)[] | null
  >();
  const [removedMedicinePrescriptionData, setRemovedMedicinePrescriptionData] = useState<
    (GetCaseSheet_getCaseSheet_caseSheetDetails_removedMedicinePrescription | null)[] | null
  >([]);
  const [existingMedicineId, setExistingMedicingId] = useState<string[]>([]);
  const [selectedMedicinesId, setSelectedMedicinesId] = useState<string[]>([]);
  const [caseSheetVersion, setCaseSheetVersion] = useState<number>(1);
  const [followupChatDays, setFollowupChatDays] = useState<OptionsObject>({
    key: g(doctorDetails, 'chatDays') || '',
    value: g(doctorDetails, 'chatDays') || '',
  });
  const [doctorNotes, setDoctorNotes] = useState<string>('');
  const [displayId, setDisplayId] = useState<string>('');
  const [prescriptionPdf, setPrescriptionPdf] = useState('');
  const [selectedReferral, setSelectedReferral] = useState<OptionsObject>({
    key: '-1',
    value: string.case_sheet.select_Speciality,
  });
  const [referralReason, setReferralReason] = useState<string>('');

  const basicAppointmentData = {
    'Doctor name': g(doctorDetails, 'fullName') || '',
    'Patient name': `${g(caseSheet, 'caseSheetDetails', 'patientDetails', 'firstName') ||
      g(patientDetails, 'firstName')} ${g(
      caseSheet,
      'caseSheetDetails',
      'patientDetails',
      'lastName'
    ) || g(patientDetails, 'lastName')}`.trim(),
    'Patient mobile number':
      g(caseSheet, 'caseSheetDetails', 'patientDetails', 'mobileNumber') ||
      g(patientDetails, 'mobileNumber') ||
      '',
    'Doctor Mobile number': g(doctorDetails, 'mobileNumber') || '',
    'Appointment Date time':
      g(caseSheet, 'caseSheetDetails', 'appointment', 'appointmentDateTime') || '',
    'Appointment display ID':
      g(appointmentData, 'displayId') ||
      g(caseSheet, 'caseSheetDetails', 'appointment', 'displayId') ||
      '',
    'Appointment ID': AppId || g(caseSheet, 'caseSheetDetails', 'appointment', 'id') || '',
  };

  useEffect(() => {
    AsyncStorage.setItem('basicAppointmentData', JSON.stringify(basicAppointmentData));
  }, [basicAppointmentData]);

  const getFamilyHistoryText = (
    familyValues:
      | (GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails_familyHistory | null)[]
      | null
  ) => {
    if (familyValues) {
      let familyHistory: string = '';
      if (familyValues[0]) {
        familyHistory += familyValues[0].relation
          ? familyValues[0].relation + ': ' + (familyValues[0].description || '') + '\n'
          : (familyValues[0].description || '') + '\n';
      }
      // familyValues.forEach((i) => {
      //   if (i) {
      //     familyHistory += i.relation
      //       ? i.relation + ': ' + (i.description || '') + '\n'
      //       : (i.description || '') + '\n';
      //   }
      // });
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
    AsyncStorage.setItem(
      'postWebEngageData',
      JSON.stringify({
        consultMode:
          g(caseSheet, 'caseSheetDetails', 'appointment', 'appointmentType') || ConsultMode.BOTH,
        displayId:
          (g(caseSheet, 'caseSheetDetails', 'appointment', 'displayId') || '').toString() || '',
        doctorFullName:
          g(caseSheet, 'caseSheetDetails', 'appointment', 'doctorInfo', 'fullName') || '',
        mobileNumber: g(caseSheet, 'patientDetails', 'mobileNumber') || '',
      })
    );

    callData.setCallerName(
      `${g(caseSheet, 'patientDetails', 'firstName') || ''} ${g(
        caseSheet,
        'patientDetails',
        'lastName'
      ) || ''}`
    );
    callData.setPatientImage(g(caseSheet, 'patientDetails', 'photoUrl') || '');
    callData.setDoctorImage(g(doctorDetails, 'photoUrl') || '');
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
    AsyncStorage.setItem(
      'patientName',
      `${g(caseSheet, 'caseSheetDetails', 'patientDetails', 'firstName')} ${g(
        caseSheet,
        'caseSheetDetails',
        'patientDetails',
        'lastName'
      )}`
    );
    setHealthWalletArrayData(
      g(caseSheet, 'caseSheetDetails', 'patientDetails', 'healthVault') || null
    );
    setPastList(
      (g(caseSheet, 'pastAppointments') || [])
        .filter(
          (item) =>
            g(item, 'displayId') !== g(caseSheet, 'caseSheetDetails', 'appointment', 'displayId')
        )
        .sort(
          (a, b) =>
            moment(b ? b.sdConsultationDate || b.appointmentDateTime : new Date())
              .toDate()
              .getTime() -
            moment(a ? a.sdConsultationDate || a.appointmentDateTime : new Date())
              .toDate()
              .getTime()
        )
        .map((item) => {
          if (item) {
            if (item.caseSheet) {
              item.caseSheet
                .sort((a, b) => (a.doctorType !== DoctorType.JUNIOR ? -1 : 1))
                .sort((a, b) => (b ? b.version || 1 : 1) - (a ? a.version || 1 : 1));
            }
          }
          return item;
        })
    );
    setAppintmentdatetime(g(caseSheet, 'caseSheetDetails', 'appointment', 'appointmentDateTime'));
    setappointmentData(g(caseSheet, 'caseSheetDetails', 'appointment'));
    setdoctorId(g(caseSheet, 'caseSheetDetails', 'doctorId') || '');
    setpatientId(g(caseSheet, 'caseSheetDetails', 'patientId') || '');

    // setAllergiesData(g(caseSheet, 'patientDetails', 'allergies') || null);
    setTests(
      (g(caseSheet, 'caseSheetDetails', 'diagnosticPrescription') || [])
        .filter(
          (item, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t &&
                item &&
                (t.itemname || '').toLowerCase() === (item.itemname || '').toLowerCase()
            )
        )
        .map((i) => {
          if (i) {
            return {
              itemname: i.itemname || '',
              testInstruction: i.testInstruction || '',
              isSelected: true,
            };
          } else {
            return { itemname: '', testInstruction: '', isSelected: false };
          }
        })
        .filter((i) => i.isSelected)
    );
    setAddedAdvices(
      (g(caseSheet, 'caseSheetDetails', 'otherInstructions') || [])
        .filter(
          (item, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t &&
                item &&
                (t.instruction || '').toLowerCase() === (item.instruction || '').toLowerCase()
            )
        )
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
    setDiagnosisData(
      (g(caseSheet, 'caseSheetDetails', 'diagnosis') || []).filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (t) => t && item && (t.name || '').toLowerCase() === (item.name || '').toLowerCase()
          )
      )
    );
    // setOtherInstructionsData(g(caseSheet, 'caseSheetDetails', 'otherInstructions') || null);
    // setDiagnosticPrescription(g(caseSheet, 'caseSheetDetails', 'diagnosticPrescription') || null);
    setMedicinePrescriptionData(
      (g(caseSheet, 'caseSheetDetails', 'medicinePrescription') || [])
        .filter(
          (item, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t &&
                item &&
                (t.externalId || t.id || t.medicineName || '').toLowerCase() ===
                  (item.externalId || item.id || item.medicineName || '').toLowerCase()
            )
        )
        .map((i) => {
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
      .filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t &&
              item &&
              (t.externalId || t.id || t.medicineName || '').toLowerCase() ===
                (item.externalId || item.id || item.medicineName || '').toLowerCase()
          )
      )
      .map((i) => (i ? i.externalId || i.id || i.medicineName : ''))
      .filter((i) => i !== null || i !== '') as string[]);
    setRemovedMedicinePrescriptionData(
      (g(caseSheet, 'caseSheetDetails', 'removedMedicinePrescription') || [])
        .filter(
          (item, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t &&
                item &&
                (t.externalId || t.id || t.medicineName || '').toLowerCase() ===
                  (item.externalId || item.id || item.medicineName || '').toLowerCase()
            )
        )
        .map((i) => {
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
    setFollowupChatDays({
      key:
        g(caseSheet, 'caseSheetDetails', 'followUpAfterInDays') ||
        g(doctorDetails, 'chatDays') ||
        0,
      value:
        g(caseSheet, 'caseSheetDetails', 'followUpAfterInDays') ||
        g(doctorDetails, 'chatDays') ||
        '0',
    });
    setDoctorNotes(g(caseSheet, 'caseSheetDetails', 'notes') || '');

    setDisplayId(g(caseSheet, 'caseSheetDetails', 'appointment', 'displayId') || '');
    setPrescriptionPdf(
      `${AppConfig.Configuration.DOCUMENT_BASE_URL}${g(caseSheet, 'caseSheetDetails', 'blobName')}`
    );
    setSavedTime(g(caseSheet, 'caseSheetDetails', 'updatedDate'));
    const referral = g(caseSheet, 'caseSheetDetails', 'referralSpecialtyName');
    if (referral) {
      const foundItem = specialties && specialties.find((i) => i.name === referral);
      setSelectedReferral(
        foundItem
          ? { key: foundItem.id, value: foundItem.name }
          : { key: referral, value: referral }
      );
      setReferralReason(g(caseSheet, 'caseSheetDetails', 'referralDescription') || '');
    }
    setCaseSheetVersion(g(caseSheet, 'caseSheetDetails', 'version') || 1);
  };
  const getCaseSheetAPI = (callBack?: () => void) => {
    setLoading && setLoading(true);
    client
      .query<GetCaseSheet>({
        query: GET_CASESHEET,
        fetchPolicy: 'no-cache',
        variables: { appointmentId: AppId },
      })
      .then((_data) => {
        const caseSheet = g(_data, 'data', 'getCaseSheet');
        if (g(caseSheet, 'caseSheetDetails', 'doctorId') !== g(doctorDetails, 'id')) {
          showAphAlert &&
            showAphAlert({
              title: string.common.alert,
              description: 'Unauthorized Access',
              unDismissable: true,
              onPressOk: () => {
                backDataFunctionality();
                hideAphAlert && hideAphAlert();
              },
            });
        } else {
          setcaseSheet(caseSheet);
          setData(caseSheet);
          if (props.navigation.getParam('prevCaseSheet')) {
            setExistingMedicingId([
              ...((g(props.navigation.getParam('prevCaseSheet'), 'medicinePrescription') || [])
                .filter(
                  (item, index, self) =>
                    index ===
                    self.findIndex(
                      (t) =>
                        t &&
                        item &&
                        (t.externalId || t.id || t.medicineName || '').toLowerCase() ===
                          (item.externalId || item.id || item.medicineName || '').toLowerCase()
                    )
                )
                .map((i) => (i ? i.externalId || i.id || i.medicineName : ''))
                .filter((i) => i !== null || i !== '') as string[]),
            ]);
          } else {
            setExistingMedicingId([
              ...((g(caseSheet, 'caseSheetDetails', 'medicinePrescription') || [])
                .filter(
                  (item, index, self) =>
                    index ===
                    self.findIndex(
                      (t) =>
                        t &&
                        item &&
                        (t.externalId || t.id || t.medicineName || '').toLowerCase() ===
                          (item.externalId || item.id || item.medicineName || '').toLowerCase()
                    )
                )
                .map((i) => (i ? i.externalId || i.id || i.medicineName : ''))
                .filter((i) => i !== null || i !== '') as string[]),
              ...((g(caseSheet, 'caseSheetDetails', 'removedMedicinePrescription') || [])
                .filter(
                  (item, index, self) =>
                    index ===
                    self.findIndex(
                      (t) =>
                        t &&
                        item &&
                        (t.externalId || t.id || t.medicineName || '').toLowerCase() ===
                          (item.externalId || item.id || item.medicineName || '').toLowerCase()
                    )
                )
                .map((i) => (i ? i.externalId || i.id || i.medicineName : ''))
                .filter((i) => i !== null || i !== '') as string[]),
            ]);
          }
          callBack && callBack();
          setLoading && setLoading(false);
        }
      })
      .catch((e) => {
        const message = e.message ? e.message.split(':')[1].trim() : '';
        if (message === 'NO_CASESHEET_EXIST') {
          createCaseSheetSRDAPI();
        } else {
          setLoading && setLoading(false);
          showAphAlert &&
            showAphAlert({
              title: string.common.alert,
              description: string.alerts.something_went_wrong,
              onPressOk: () => {
                hideAphAlert && hideAphAlert();
                backDataFunctionality();
              },
            });
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
    followupChatDays,
    addedAdvices,
    medicinePrescriptionData,
    selectedMedicinesId,
    lifeStyleData,
    familyValues,
    medicalHistory,
    selectedReferral,
    referralReason,
    removedMedicinePrescriptionData,
  ]);

  const getInputData = () => {
    return {
      symptoms:
        symptonsData && symptonsData.length > 0
          ? symptonsData
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
              .filter((i) => i !== '')
          : null,
      notes: doctorNotes || '',
      diagnosis:
        diagnosisData && diagnosisData.length > 0
          ? diagnosisData
              .map((i) => {
                if (i) {
                  return { name: i.name || '' };
                } else {
                  return '';
                }
              })
              .filter((i) => i !== '')
          : null,
      diagnosticPrescription:
        tests && tests.length > 0 && tests.filter((i) => i.isSelected).length > 0
          ? tests
              .filter((i) => i.isSelected)
              .map((i) => {
                return { itemname: i.itemname || '', testInstruction: i.testInstruction || '' };
              })
          : null,
      status: g(caseSheet, 'caseSheetDetails', 'status'),
      followUp: followupChatDays.key > 0,
      followUpDate: moment(
        g(caseSheet, 'caseSheetDetails', 'appointment', 'appointmentDateTime') || new Date()
      )
        .add(Number(followupChatDays.key), 'd')
        .format('YYYY-MM-DD'),
      followUpAfterInDays: Number(followupChatDays.key),
      followUpConsultType: g(caseSheet, 'caseSheetDetails', 'followUpConsultType'),
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
                    medicineCustomDetails: i.medicineCustomDetails || null,
                    includeGenericNameInPrescription: i.includeGenericNameInPrescription,
                    genericName: i.genericName,
                  };
                } else {
                  return '';
                }
              })
              .filter((i) => i !== '')
          : null,
      removedMedicinePrescription:
        removedMedicinePrescriptionData && removedMedicinePrescriptionData.length > 0
          ? removedMedicinePrescriptionData
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
                    medicineCustomDetails: i.medicineCustomDetails || null,
                    includeGenericNameInPrescription: i.includeGenericNameInPrescription,
                    genericName: i.genericName,
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
      familyHistory: familyValues,
      //  &&
      // getFamilyHistoryObject(familyValues)
      //   .map((i) => (i ? (i.relation ? i.relation + ': ' + i.description : i.description) : ''))
      //   .filter((i) => i !== '')
      //   .join('\n')
      //   .trim(),
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
      diagnosticTestResult: medicalHistory ? medicalHistory.diagnosticTestResult || '' : '',
      clinicalObservationNotes: medicalHistory ? medicalHistory.clinicalObservationNotes || '' : '',
    } as ModifyCaseSheetInput;
  };

  const saveDetails = (
    showLoader: boolean,
    autoSave: boolean,
    inputdata?: ModifyCaseSheetInput,
    callBack?: () => void
  ) => {
    showLoader && setLoading && setLoading(true);
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
          const modifiedData = {
            ...caseSheet,
            caseSheetDetails: g(_data, 'data', 'modifyCaseSheet'),
          } as GetCaseSheet_getCaseSheet | null | undefined;
          if (!autoSave) {
            setcaseSheet(modifiedData);
            setData(modifiedData);
          }
          setSavedTime(g(modifiedData, 'caseSheetDetails', 'updatedDate'));
          setIsAutoSaved(autoSave);
          AsyncStorage.setItem(
            'prevSavedData',
            JSON.stringify(inputdata ? inputdata : getInputData())
          );
          if (callBack) {
            setLoading && setLoading(true);
            callBack();
          } else {
            setLoading && setLoading(false);
          }
        })
        .catch((e) => {
          setLoading && setLoading(false);
          const errorMessage = e.graphQLErrors[0].message;
          if (errorMessage.includes('INVALID_REFERRAL_DESCRIPTION')) {
            showAphAlert &&
              showAphAlert({
                title: string.common.alert,
                description: string.alerts.missing_referral_description,
              });
          } else if (errorMessage.includes('CASESHEET_SENT_TO_PATIENT_ALREADY')) {
            showAphAlert &&
              showAphAlert({
                title: string.common.uh_oh,
                description: string.alerts.casesheet_already_send,
                onPressOk: () => {
                  hideAphAlert && hideAphAlert();
                  getCaseSheetAPI();
                  setCaseSheetEdit(false);
                },
              });
          } else {
            showAphAlert &&
              showAphAlert({
                title: string.common.uh_oh,
                description: string.common.oops_msg_saving,
              });
          }
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

  // const [remainingTime, setRemainingTime] = useState<number>(900);
  // const [consultStarted, setConsultStarted] = useState<boolean>(false);
  // let patientJoined = false; //APP-2812: removed NoShow
  // let abondmentStarted = false;
  // const timediffInSec = moment(Appintmentdatetime).diff(moment(new Date()), 's');
  // const startNoShow = (timer: number, callback?: () => void) => {
  //   stopNoShow();
  //   joinTimerNoShow = setInterval(() => {
  //     timer = timer - 1;
  //     if (timer === 0) {
  //       stopNoShow();
  //       callback && callback();
  //     }
  //   }, 1000);
  // };

  // const stopNoShow = () => {
  //   console.log('storpvi', joinTimerNoShow);
  //   joinTimerNoShow && clearInterval(joinTimerNoShow);
  // };

  const startAutoSaveTimer = (timer: number, callback?: () => void) => {
    stopAutoSaveTimer();
    autoSaveTimerId = setInterval(() => {
      timer = timer - 1;
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
      const prevData = await AsyncStorage.getItem('prevSavedData');
      if (prevData !== data) {
        saveDetails(false, true, JSON.parse(data || ''));
      }
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

  const stopAllCalls = (callType?: 'A' | 'V') => {
    if (callOptions.isAudio || callOptions.isVideo || callType) {
      endCallNotificationAPI(true);
      callOptions.stopCalls(false);
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
        message: `${callOptions.isVideo || callType === 'V' ? 'Video' : 'Audio'} ${
          string.consult_room.call_ended
        }`,
        duration: callData.callDuration,
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
    }
  };

  const callAbandonmentCall = () => {
    showAphAlert &&
      showAphAlert({
        title: `${string.common.hi},`,
        description: string.consult_room.patient_is_not_acitve_descr,
        CTAs: [
          {
            text: string.consult_room.continue,
            onPress: () => hideAphAlert!(),
            type: 'white-button',
          },
          {
            text: string.consult_room.reschedule,
            onPress: () => {
              endAppointmentApiCall(STATUS.CALL_ABANDON);
              hideAphAlert!();
            },
          },
        ],
      });
  };

  const endAppointmentApiCall = (status: STATUS) => {
    // stopNoShow();
    callOptions.stopMissedCallTimer();
    setShowLoading(true);
    client
      .mutate<EndAppointmentSession, EndAppointmentSessionVariables>({
        mutation: END_APPOINTMENT_SESSION,
        variables: {
          endAppointmentSessionInput: {
            appointmentId: AppId,
            status: status,
            noShowBy: REQUEST_ROLES.PATIENT,
            callSource: BOOKINGSOURCE.MOBILE,
            deviceType: Platform.OS === 'ios' ? DEVICETYPE.IOS : DEVICETYPE.ANDROID,
            appVersion:
              Platform.OS === 'ios'
                ? AppConfig.Configuration.iOS_Version
                : AppConfig.Configuration.Android_Version,
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
              title: string.common.alert,
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
              title: string.common.alert,
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
        // Alert.alert(string.common.error, errorMessage);
        Alert.alert(string.common.uh_oh, string.common.oops_msg);
      });
  };
  const [callId, setCallId] = useState<string>();
  const [chatId, setChatId] = useState<string>();

  const sendEndCallNotificationAPI = (callType: APPT_CALL_TYPE) => {
    client
      .query<sendCallDisconnectNotification, sendCallDisconnectNotificationVariables>({
        query: CALL_DISCONNECT_NOTIFICATION,
        fetchPolicy: 'no-cache',
        variables: {
          appointmentId: AppId,
          callType: callType,
        },
      })
      .then((_data) => {})
      .catch((error) => {});
  };

  const sendCallNotificationAPI = (callType: APPT_CALL_TYPE, isCall: boolean, count: number) => {
    client
      .query<SendCallNotification, SendCallNotificationVariables>({
        query: SEND_CALL_NOTIFICATION,
        fetchPolicy: 'no-cache',
        variables: {
          appointmentId: AppId,
          callType: callType,
          doctorType: DOCTOR_CALL_TYPE.SENIOR,
          callSource: BOOKINGSOURCE.MOBILE,
          deviceType: Platform.OS === 'ios' ? DEVICETYPE.IOS : DEVICETYPE.ANDROID,
          appVersion:
            Platform.OS === 'ios'
              ? AppConfig.Configuration.iOS_Version
              : AppConfig.Configuration.Android_Version,
          numberOfParticipants: count,
          patientId: g(caseSheet, 'patientDetails', 'id'),
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
    pubnubPresence((patient: number, doctor: number) => {
      if ((isCall && callId) || (!isCall && chatId)) {
        client
          .query<EndCallNotification, EndCallNotificationVariables>({
            query: END_CALL_NOTIFICATION,
            fetchPolicy: 'no-cache',
            variables: {
              appointmentCallId: isCall ? callId : chatId,
              patientId: g(caseSheet, 'patientDetails', 'id'),
              numberOfParticipants: patient + doctor,
            },
          })
          .catch((error) => {});
      }
    });
  };

  // const startInterval = (timer: number) => { //Consult remaning time
  //   setConsultStarted(true);
  //   intervalId = setInterval(() => {
  //     timer = timer - 1;
  //     stoppedTimer = timer;
  //     setRemainingTime(timer);
  //     // console.log('descriptionTextStyle remainingTime', timer);

  //     if (timer == 0) {
  //       // console.log('descriptionTextStyles remainingTime', timer);
  //       setRemainingTime(0);
  //       clearInterval(intervalId);
  //     }
  //   }, 1000);
  //   console.log('intervalId', intervalId);
  // };

  // const stopInterval = () => {
  //   const stopTimer = 900 - stoppedTimer;
  //   setRemainingTime(stopTimer);
  //   intervalId && clearInterval(intervalId);
  // };

  const config: Pubnub.PubnubConfig = {
    origin: 'apollo.pubnubapi.com',
    subscribeKey: AppConfig.Configuration.PRO_PUBNUB_SUBSCRIBER,
    publishKey: AppConfig.Configuration.PRO_PUBNUB_PUBLISH,
    ssl: true,
    uuid: `DOCTOR_${g(doctorDetails, 'id') || ''}`,
    restore: true,
    keepAlive: true,
    // autoNetworkDetection: true,
    // listenToBrowserNetworkEvents: true,
    // presenceTimeout: 20, //APP-2812: removed NoShow
    heartbeatInterval: 20,
  };

  const pubnub = new Pubnub(config);
  //console.log('pubnub', pubnub);
  useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, []);
  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'inactive' || nextAppState === 'background') {
    }
  };
  useEffect(() => {
    pubnub.subscribe({
      channels: [channel],
      // withPresence: true,//APP-2812: removed NoShow
    });

    getHistory(0);
    pubnub.addListener({
      status: (statusEvent) => {
        if (statusEvent.category === Pubnub.CATEGORIES.PNConnectedCategory) {
          console.log(statusEvent.category);
        } else if (statusEvent.operation === Pubnub.OPERATIONS.PNAccessManagerAudit) {
          console.log(statusEvent.operation);
        }
      },
      message: ({ message: messageInfo, timetoken }) => {
        const message = { ...messageInfo, timetoken };
        console.log('addListener', message);
        const messageText = message.message;
        if (message.isTyping) {
          const audioVideoMethod = () => {
            AsyncStorage.setItem('callDisconnected', 'true');
            callhandelBack = true;
            addMessages(message);
            callOptions.stopCalls(false);
            callOptions.setCallAccepted(false);
          };
          switch (messageText) {
            case messageCodes.acceptedCallMsg:
              callOptions.setCallAccepted(true);
              callOptions.stopMissedCallTimer();
              break;
            case messageCodes.endCallMsg:
              const callBack = async () => {
                const callDataSend = JSON.parse(
                  (await AsyncStorage.getItem('callDataSend')) || 'false'
                );
                if (!callDataSend) {
                  firebase
                    .analytics()
                    .logEvent(
                      callOptions.isAudio ? 'Doctor_audio_call_end' : 'Doctor_video_call_end',
                      {
                        caseSheet: caseSheet,
                        callDuration: callData.callDuration,
                      }
                    );
                  AsyncStorage.setItem('callDataSend', 'true');
                }
              };
              callBack();
              hideFloatingContainer();
              callOptions.stopCalls(false);
              callOptions.setCallAccepted(false);
              break;
            case messageCodes.covertVideoMsg:
              callOptions.setIsVideo(true);
              callOptions.setIsAudio(true);
              break;
            case messageCodes.covertAudioMsg:
              callOptions.setIsVideo(false);
              callOptions.setIsAudio(true);
              break;
            case 'Audio call ended':
              audioVideoMethod();
              setGiveRating(true);
              break;
            case 'Video call ended':
              audioVideoMethod();
              setGiveRating(true);
              break;
            case messageCodes.patientJoined:
              AsyncStorage.multiGet(['isAudio', 'isVideo']).then((data) => {
                if (data) {
                  const values = data.map((item) => item && item[1]);
                  if (!values.includes('true')) {
                    showJoinPopUp();
                  }
                }
              });
              break;
            case messageCodes.patientRejected:
              AsyncStorage.setItem('callDisconnected', 'true');
              hideFloatingContainer();
              callOptions.stopCalls(true);
              callOptions.setCallAccepted(false);
              errorPopup('Patient has rejected the call.', theme.colors.APP_YELLOW, 10);
              break;
            case messageCodes.exotelCall:
              addMessages(message);
              break;
            case messageCodes.startConsultMsg:
              addMessages(message);
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
          callData.setMessageReceived(true);
          addMessages(message);
        } else if (messageCodes.patientJoined === messageText) {
          AsyncStorage.multiGet(['isAudio', 'isVideo']).then((data) => {
            if (data) {
              const values = data.map((item) => item && item[1]);
              if (!values.includes('true')) {
                showJoinPopUp();
              }
            }
          });
        } else if (
          message === messageCodes.patientRejected ||
          messageText === messageCodes.patientRejected
        ) {
          AsyncStorage.setItem('callDisconnected', 'true');
          hideFloatingContainer();
          callOptions.stopCalls(true);
          callOptions.setCallAccepted(false);
          errorPopup('Patient has rejected the call.', theme.colors.APP_YELLOW, 10);
        } else {
          callData.setMessageReceived(true);
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
                fileType: message.fileType,
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
      // presence: (presenceEvent) => {//APP-2812: removed NoShow
      //   pubnub
      //     .hereNow({
      //       channels: [channel],
      //       includeUUIDs: true,
      //     })
      //     .then(async (response: HereNowResponse) => {
      //       console.log('hereNowresponse', response);
      //       const data = response.channels[channel].occupants;
      //       const isAudio = JSON.parse((await AsyncStorage.getItem('isAudio')) || 'false');
      //       const isVideo = JSON.parse((await AsyncStorage.getItem('isVideo')) || 'false');
      //       const callAccepted = JSON.parse(
      //         (await AsyncStorage.getItem('callAccepted')) || 'false'
      //       );
      //       const occupancyPatient = data.filter((obj) => {
      //         return obj.uuid === REQUEST_ROLES.PATIENT || obj.uuid.indexOf('PATIENT_') > -1;
      //       });
      //       console.log('occupancyPatient', occupancyPatient);
      //       if (occupancyPatient.length > 0) {
      //          stopNoShow();
      //         joinTimerNoShow && clearInterval(joinTimerNoShow);
      //         abondmentStarted = false;
      //         patientJoined = true;
      //       }
      // else if (occupancyPatient.length === 0 && (isAudio || isVideo) && callAccepted) {
      //   stopAllCalls(isAudio ? 'A' : isVideo ? 'V' : undefined);
      //   showAphAlert &&
      //     showAphAlert({
      //       title: string.common.alert,
      //       description: 'Call Disconnected',
      //     });
      // }
      //APP-1995: removed call abandonment
      // else {
      //   console.log(
      //     'Call ab',
      //     !abondmentStarted && patientJoined,
      //     patientJoined,
      //     abondmentStarted
      //   );
      //   if (
      //     !abondmentStarted &&
      //     patientJoined &&
      //     ![STATUS.COMPLETED, STATUS.NO_SHOW, STATUS.CALL_ABANDON, STATUS.CANCELLED].includes(
      //       (appointmentData || g(caseSheet, 'caseSheetDetails', 'appointment')).status
      //     )
      //   ) {
      //     abondmentStarted = true;
      //     startNoShow(600, () => {
      //       callAbandonmentCall();
      //     });
      //   }
      // }
      // const PatientConsultStartedMessage = insertText.filter((obj: any) => {
      //   return obj.message === messageCodes.consultPatientStartedMsg;
      // });
      //     })
      //     .catch((error) => {
      //       console.log(error);
      //     });
      // },
    });

    const addMessages = (message: Pubnub.MessageEvent) => {
      insertText[insertText.length] = message;
      setMessages(() => [...(insertText as [])]);
      if (!callOptions.isVideo || !callOptions.isAudio) {
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
  const newmessage: any[] = [];

  const getHistory = (timetoken: number) => {
    pubnub.history(
      {
        channel: channel,
        reverse: true,
        count: 1000,
        stringifiedTimeToken: true,
        start: timetoken,
      },
      (status, res) => {
        try {
          const end: any = res.endTimeToken ? res.endTimeToken : 1;
          res &&
            res.messages.forEach((element, index) => {
              const item = { ...element.entry, timetoken: element.timetoken };
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
          if (messages.length !== newmessage.length) {
            if (res.messages.length == 100) {
              getHistory(end);
              return;
            }
            insertText = newmessage;
            setMessages(newmessage as []);
            const files: { prismId: string | null; url: string; fileType: 'image' | 'pdf' }[] = [];

            newmessage.forEach((element, index) => {
              if (element.id === patientId && element.message === messageCodes.imageconsult) {
                files.push({
                  prismId: element.prismId,
                  url: element.url,
                  fileType: element.fileType,
                });
              }
            });
            setChatFiles(files);
            AsyncStorage.setItem('chatFileData', JSON.stringify(files));
            if (!callOptions.isVideo || !callOptions.isAudio) {
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
        if (g(caseSheet, 'caseSheetDetails', 'appointment', 'status') === STATUS.COMPLETED) {
          postBackendWebEngage(WebEngageEvent.DOCTOR_SENT_MESSAGE);
          postWebEngageEvent(WebEngageEventName.DOCTOR_SEND_MSG, {
            ...basicAppointmentData,
          } as WebEngageEvents[WebEngageEventName.DOCTOR_SEND_MSG]);
        }
        console.log(response, 'response');
      }
    );
  };

  const pubnubPresence = (callBack: (patientCount: number, doctorCount: number) => void) => {
    pubnub
      .hereNow({ channels: [channel], includeUUIDs: true })
      .then((response: HereNowResponse) => {
        const data = response.channels[appointmentData.id].occupants;
        let doctorCount = 0;
        let paientsCount = 0;
        data.forEach((item) => {
          if (item.uuid.indexOf('PATIENT') > -1) {
            paientsCount = 1;
          } else if (item.uuid.indexOf('DOCTOR') > -1) {
            doctorCount = 1;
          }
        });
        callBack(paientsCount, doctorCount);
      })
      .catch((error) => {
        CommonBugFender('ChatRoom_PUBNUB_PRESENCE', error);
      });
  };

  const connectCall = (callType: 'A' | 'V', isJoin?: boolean) => {
    getNetStatus().then(async (connected) => {
      if (connected) {
        const startConsultStorage = JSON.parse(
          (await AsyncStorage.getItem('showInAppNotification')) || 'false'
        );
        const storedBasicAppointmentData = JSON.parse(
          (await AsyncStorage.getItem('basicAppointmentData')) || 'false'
        );
        if (!startConsult && startConsultStorage) {
          Alert.alert(string.common.apollo, string.consult_room.please_start_consultation);
          return;
        }

        if (callOptions.isAudio || callOptions.isVideo) {
          return;
        }
        if (isJoin) {
          callOptions.setCallAccepted(true);
          hideFloatingContainer();
          setTimeout(() => {
            callData.setVideoEnabled(false);
          }, 1000);
        }
        callType === 'A' ? callOptions.setIsAudio(true) : callOptions.setIsAudio(false);
        callType === 'V' ? callOptions.setIsVideo(true) : callOptions.setIsVideo(false);
        callOptions.setIsMinimized(false);
        setCallBacks({
          onCallEnd: (consultType, callDuration) => {
            callOptions.stopMissedCallTimer();
            endCallNotificationAPI(true);
            if (callDuration === '00 : 00') {
              sendEndCallNotificationAPI(
                callType === 'V' ? APPT_CALL_TYPE.VIDEO : APPT_CALL_TYPE.AUDIO
              );
            }
            setGiveRating(true);
            firebase
              .analytics()
              .logEvent(callType == 'A' ? 'Doctor_audio_call_end' : 'Doctor_video_call_end', {
                caseSheet: caseSheet,
                callDuration: callDuration,
              });
            postWebEngageEvent(
              !isJoin
                ? callType === 'V'
                  ? WebEngageEventName.DOCTOR_STOP_VIDEO_CALL
                  : WebEngageEventName.DOCTOR_STOP_AUDIO_CALL
                : WebEngageEventName.DOCTOR_ACCEPTED_JOIN_END,
              {
                ...(storedBasicAppointmentData || basicAppointmentData),
                'Type of call': !isJoin
                  ? callType === 'V'
                    ? 'Video'
                    : 'Audio'
                  : 'Join Acceptance',
                'Call Duration': callDuration,
              }
            );
            AsyncStorage.setItem('callDataSend', 'true');
            pubnub.publish(
              {
                message: {
                  isTyping: true,
                  message:
                    callType === 'V'
                      ? string.consult_room.video_call_ended
                      : string.consult_room.audio_call_ended,
                  duration: callDuration,
                  messageDate: new Date(),
                  id: doctorId,
                },
                channel: channel,
                storeInHistory: true,
              },
              (status, response) => {}
            );
          },
          onCallMinimize: () => {},
        });
        callhandelBack = false;
        setShowPopUp(false);
        pubnubPresence((patient: number, doctor: number) => {
          sendCallNotificationAPI(
            callType === 'V' ? APPT_CALL_TYPE.VIDEO : APPT_CALL_TYPE.AUDIO,
            true,
            patient + doctor
          );
        });
        Keyboard.dismiss();
        AsyncStorage.setItem('callDisconnected', 'false');
        postWebEngageEvent(
          !isJoin
            ? callType === 'V'
              ? WebEngageEventName.DOCTOR_START_VIDEO_CALL
              : WebEngageEventName.DOCTOR_START_AUDIO_CALL
            : WebEngageEventName.DOCTOR_ACCEPTED_JOIN,
          {
            ...(storedBasicAppointmentData || basicAppointmentData),
            'Type of call': !isJoin ? (callType === 'V' ? 'Video' : 'Audio') : 'Join Acceptance',
          }
        );
        firebase
          .analytics()
          .logEvent(
            !isJoin
              ? callType == 'A'
                ? 'Doctor_audio_call'
                : 'Doctor_video_call'
              : 'Doctor_Join_Call',
            {
              caseSheet: caseSheet,
            }
          );
        AsyncStorage.setItem('callDataSend', 'false');
        if (!isJoin) {
          pubnub.publish(
            {
              message: {
                isTyping: true,
                message: callType === 'V' ? messageCodes.videoCallMsg : messageCodes.audioCallMsg,
                messageDate: new Date(),
              },
              channel: channel,
              storeInHistory: true,
            },
            (status, response) => {
              if (response) {
                callOptions.startMissedCallTimer(45, (count) => {
                  stopAllCalls(callType);
                  setGiveRating(true);
                  // if (missedCallCounter < 2) {

                  // } else {
                  //   callAbandonmentCall();
                  // }
                });
              }
            }
          );
        }
      } else {
        showAphAlert &&
          showAphAlert({ title: string.common.alert, description: string.alerts.no_internet });
      }
    });
  };

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
            {string.consult_room.how_do_you_talk}
          </Text>
          <TouchableOpacity onPress={() => connectCall('A')}>
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
                  {string.buttons.audio_call}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => connectCall('V')}>
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
                  {string.buttons.video_call}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const onEndConsult = () => {
    stopAllCalls();
    endCallNotificationAPI(false);
    postWebEngageEvent(WebEngageEventName.DOCTOR_STOP_CONSULT, {
      ...basicAppointmentData,
    } as WebEngageEvents[WebEngageEventName.DOCTOR_STOP_CONSULT]);
    firebase.analytics().logEvent('Doctor_end_consult', {
      doctorName: doctorDetails ? doctorDetails.fullName : doctorId,
      patientName: patientDetails
        ? `${patientDetails.firstName} ${patientDetails.lastName}`
        : patientId,
      appointmentData: appointmentData,
    });
  };
  const SrollRef = useRef<any>();
  useEffect(() => {
    if (SrollRef.current) {
      if (activeTabIndex === tabsData[0].title) {
        SrollRef.current.scrollTo({ x: 0, y: 0, animated: false });
      } else {
        SrollRef.current.scrollToEnd({ animated: false });
        setTimeout(() => {
          AsyncStorage.getItem('scrollToEnd').then((data) => {
            if (JSON.parse(data || 'true')) {
              flatListRef.current && flatListRef.current.scrollToEnd();
            }
            AsyncStorage.setItem('scrollToEnd', 'false');
          });
        }, 1000);
      }
    }
  }, [SrollRef, activeTabIndex, tabsData]);

  const renderTabPage = () => {
    return (
      <>
        <View style={[styles.shadowview]}>
          <TabsComponent
            data={tabsData}
            onChange={(index) => {
              Keyboard.dismiss();
              setActiveTabIndex(index);
            }}
            selectedTab={activeTabIndex}
          />
        </View>
        {!loading ? (
          <View
            style={{
              flex: 1,
            }}
          >
            <ScrollView
              ref={SrollRef}
              horizontal
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps={'always'}
            >
              <View style={{ width: width }}>
                <CaseSheetView
                  // disableConsultButton={!!PatientConsultTime}
                  caseSheetVersion={caseSheetVersion}
                  overlayDisplay={(component) => {
                    setOverlayDisplay(component);
                  }}
                  onStartConsult={onStartConsult}
                  onEndConsult={onEndConsult}
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
                  inCall={callOptions.isVideo || callOptions.isAudio}
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
                  existingMedicineId={existingMedicineId}
                  removedMedicinePrescriptionData={removedMedicinePrescriptionData}
                  setRemovedMedicinePrescriptionData={setRemovedMedicinePrescriptionData}
                  followupChatDays={followupChatDays}
                  setFollowupChatDays={setFollowupChatDays}
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
              </View>
              <View style={{ width: width }}>
                <ChatRoom
                  messageText={messageText}
                  setMessageText={setMessageText}
                  patientId={patientId}
                  setChatReceived={setChatReceived}
                  navigation={props.navigation}
                  messages={messages}
                  send={send}
                  flatListRef={flatListRef}
                  setShowPDF={setShowPDF}
                  setPatientImageshow={setPatientImageshow}
                  setUrl={setUrl}
                  isDropdownVisible={isDropdownVisible}
                  setDropdownVisible={setDropdownVisible}
                  patientDetails={patientDetails}
                  extendedHeader={
                    startConsult ||
                    g(caseSheet, 'caseSheetDetails', 'appointment', 'status') === STATUS.COMPLETED
                  }
                />
              </View>
            </ScrollView>
          </View>
        ) : null}
      </>
    );
  };

  const submitRatingHandler = (data: {
    rating: number;
    feedbackResponseType: CALL_FEEDBACK_RESPONSES_TYPES | null;
    audioFeedbacks: {}[];
    videoFeedbacks: {}[];
  }) => {
    setShowLoading!(true);
    setGiveRating(false);
    const query = {
      appointmentCallDetailsId: `${callId}`,
      ratingValue: data.rating,
      feedbackResponseType: data.feedbackResponseType,
      feedbackResponses:
        data.audioFeedbacks.length === 0 && data.videoFeedbacks.length === 0
          ? null
          : JSON.stringify({
              audio: data.audioFeedbacks,
              video: data.videoFeedbacks,
            }),
    };

    client
      .mutate<saveAppointmentCallFeedback, saveAppointmentCallFeedbackVariables>({
        mutation: SAVE_APPOINTMENT_CALL_FEEDBACK,
        variables: {
          saveAppointmentCallFeedback: query,
        },
      })
      .then((_data: any) => {
        setShowLoading!(false);
        showAphAlert &&
          showAphAlert({
            title: string.common.alert,
            description: 'Thank you for sharing your reviews.',
          });
      })
      .catch((e: any) => {
        setShowLoading!(false);
        showAphAlert &&
          showAphAlert({
            title: string.common.alert,
            description: 'Error in giving feedback. Please try again!',
          });
      });
  };

  const onStartConsult = (successCallback?: () => void) => {
    getNetStatus().then((connected) => {
      postWebEngageEvent(WebEngageEventName.DOCTOR_START_CONSULT, {
        ...basicAppointmentData,
      } as WebEngageEvents[WebEngageEventName.DOCTOR_START_CONSULT]);
      if (connected) {
        setShowLoading(true);
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
            firebase.analytics().logEvent('Doctor_start_consult', {
              doctorName: doctorDetails ? doctorDetails.fullName : doctorId,
              patientName: patientDetails
                ? `${patientDetails.firstName} ${patientDetails.lastName}`
                : patientId,
              appointmentData: appointmentData,
            });

            setCaseSheetEdit(true);
            console.log('createsession', _data);
            console.log('sessionid', _data.data.createAppointmentSession.sessionId);
            console.log('appointmentToken', _data.data.createAppointmentSession.appointmentToken);
            setOpenTokKeys({
              sessionId: _data.data.createAppointmentSession.sessionId,
              token: _data.data.createAppointmentSession.appointmentToken,
            });
            //
            setTimeout(() => {
              flatListRef.current && flatListRef.current.scrollToEnd();
            }, 1000);
            pubnubPresence((patient: number, doctor: number) => {
              sendCallNotificationAPI(APPT_CALL_TYPE.CHAT, true, patient + doctor);
            });
            console.log('onStartConsult');
            pubnub.publish(
              {
                message: {
                  id: g(doctorDetails, 'id'),
                  isTyping: true,
                  message: messageCodes.startConsultMsg,
                  automatedText: g(doctorDetails, 'displayName') + ' has joined the consult room!',
                  messageDate: new Date(),
                  sentBy: REQUEST_ROLES.DOCTOR,
                },
                channel: channel,
                storeInHistory: true,
              },
              (status, response) => {
                setActiveTabIndex(tabsData[0].title);
                setStartConsult(true);
                // if (timediffInSec > 0) { //APP-2812: removed NoShow
                //   startNoShow(timediffInSec, () => {
                //     console.log('countdown ', joinTimerNoShow);
                //     startNoShow(600, () => {
                //       console.log('Trigger no ShowAPi');
                //       console.log(joinTimerNoShow, 'joinTimerNoShow');

                //       endAppointmentApiCall(STATUS.NO_SHOW);
                //     });
                //   });
                // } else {
                //   startNoShow(600, () => {
                //     console.log('Trigger no ShowAPi');
                //     endAppointmentApiCall(STATUS.NO_SHOW);
                //   });
                // }
                // startInterval(timer);
              }
            );
            successCallback && successCallback();
            setShowLoading(false);
          })
          .catch((e: any) => {
            console.log('Error occured while adding Doctor', e);
            showAphAlert &&
              showAphAlert({
                title: string.common.alert,
                description: 'Error in starting consult. Please try again!',
              });
            setShowLoading(false);
          });
      } else {
        showAphAlert &&
          showAphAlert({
            title: string.common.alert,
            description: string.alerts.no_internet,
          });
      }
    });
  };

  const onStopConsult = () => {
    console.log('onStopConsult');
    endCallNotificationAPI(false);
    if (caseSheetVersion <= 1) {
      pubnub.publish(
        {
          message: {
            isTyping: true,
            message: messageCodes.stopConsultMsg,
            messageDate: new Date(),
          },
          channel: channel,
          storeInHistory: true,
        },
        (status, response) => {
          setStartConsult(false);
          // stopInterval();
          callOptions.stopMissedCallTimer();
          // stopNoShow();
        }
      );
      if (followupChatDays.key > 0) {
        send(
          `Congratulations! ${g(doctorDetails, 'displayName')} has provided you with ${
            followupChatDays.key
          } days of complimentary follow-up chat.`
        );
      }
    }
  };

  const renderCancelPopup = () => {
    return (
      <AphOverlay
        headingViewStyle={{
          ...theme.viewStyles.cardContainer,
          zIndex: 1,
          ...theme.viewStyles.shadowStyle,
        }}
        heading={string.consult.cancel_consult}
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
          whiteButtontitle={string.buttons.cancel}
          disabledOrange={showLoading ? true : selectedReason === 'Other' && otherReason === ''}
          cancelFun={() => {
            setshowCancelPopup(false);
          }}
          yellowButtontitle={string.consult.cancel_consult}
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
                postWebEngageEvent(WebEngageEventName.DOCTOR_APPOINTMETNT_CANCELLED, {
                  ...basicAppointmentData,
                  'Cancel reason': selectedReason === 'Other' ? otherReason : selectedReason,
                } as WebEngageEvents[WebEngageEventName.DOCTOR_APPOINTMETNT_CANCELLED]);
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
                    title: string.common.alert,
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
  const makeCall = () => {
    setShowExoPopup(false);
    if (
      (g(doctorDetails, 'mobileNumber') ||
        g(caseSheet, 'caseSheetDetails', 'appointment', 'doctorInfo', 'mobileNumber')) &&
      (g(patientDetails, 'mobileNumber') || g(caseSheet, 'patientDetails', 'mobileNumber'))
    ) {
      setShowLoading(true);
      const exotelInputData: exotelInput = {
        appointmentId: g(caseSheet, 'caseSheetDetails', 'appointment', 'id') || AppId,
        from:
          g(doctorDetails, 'mobileNumber') ||
          g(caseSheet, 'caseSheetDetails', 'appointment', 'doctorInfo', 'mobileNumber'),
        to: g(patientDetails, 'mobileNumber') || g(caseSheet, 'patientDetails', 'mobileNumber'),
        deviceType: Platform.OS === 'ios' ? DEVICETYPE.IOS : DEVICETYPE.ANDROID,
      };
      firebase.analytics().logEvent('DOCTOR_CALL_EXOTEL', { callBy: exotelInputData });
      client
        .query<initateConferenceTelephoneCall, initateConferenceTelephoneCallVariables>({
          query: EXO_TEL_CALL,
          fetchPolicy: 'no-cache',
          variables: {
            exotelInput: exotelInputData,
          },
        })
        .then((data) => {
          setShowLoading(false);
          if (g(data, 'data', 'initateConferenceTelephoneCall', 'isError')) {
            showAphAlert &&
              showAphAlert({
                title: string.common.alert,
                description:
                  'Error: ' + g(data, 'data', 'initateConferenceTelephoneCall', 'errorMessage') ||
                  'Try again',
              });
          } else {
            postWebEngageEvent(WebEngageEventName.DOCTOR_START_EXOTEL_CALL, {
              ...basicAppointmentData,
              'Type of call': 'Telephonic',
              'Exotel number': string.exoTel.exotelNumber,
            } as WebEngageEvents[WebEngageEventName.DOCTOR_START_EXOTEL_CALL]);
            pubnub.publish(
              {
                message: {
                  id: doctorId,
                  message: messageCodes.exotelCall,
                  exotelNumber: string.exoTel.exotelNumber,
                  isTyping: true,
                  sentBy: REQUEST_ROLES.DOCTOR,
                  messageDate: new Date(),
                },
                channel: AppId,
                storeInHistory: true,
              },
              (status, response) => {}
            );
            showPopup({
              description: string.exoTel.toastMessage,
              style: styles.exoToastContainer,
              popUpPointerStyle: { width: 0, height: 0 },
              descriptionTextStyle: theme.viewStyles.text('M', 12, theme.colors.WHITE, 1, 20),
              hideOk: true,
              icon: (
                <View style={styles.exoCloseContainer}>
                  <CloseWhite style={{ width: 16, height: 16 }} />
                </View>
              ),
              timer: 5,
            });
          }
        })
        .catch((e) => {
          setShowLoading(false);
        });
    } else {
      showAphAlert &&
        showAphAlert({
          title: string.common.alert,
          description: `${
            g(doctorDetails, 'mobileNumber') ||
            g(caseSheet, 'caseSheetDetails', 'appointment', 'doctorInfo', 'mobileNumber')
              ? g(patientDetails, 'mobileNumber') || g(caseSheet, 'patientDetails', 'mobileNumber')
                ? ''
                : "Patient's"
              : "Doctor's"
          } number is not present try again.`,
        });
    }
  };

  const exoTelPopup = () => {
    return (
      <View style={styles.exoTelPopupContainer}>
        <View style={styles.exoTelPopupMainContainer}>
          <Text style={styles.exoHeader}>{string.exoTel.heading}</Text>
          <Text style={styles.exosubHeader}>{string.exoTel.subHeading}</Text>
          <View style={styles.exopointContainer}>
            <View style={styles.exoPointMain}>
              <Text style={styles.exoPointNumberText}>1</Text>
            </View>
            <Text style={styles.exoPointText}>{string.exoTel.point1}</Text>
          </View>
          <View style={styles.exopointContainer}>
            <View style={styles.exoPointMain}>
              <Text style={styles.exoPointNumberText}>2</Text>
            </View>
            <Text style={styles.exoPointText}>{string.exoTel.point2}</Text>
          </View>
          <Text style={styles.exonoteText}>{string.exoTel.note}</Text>
          <View style={styles.exobuttonContainer}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.exoCancelContainer}
              onPress={() => {
                setShowExoPopup(false);
              }}
            >
              <Text style={styles.exoCancelText}>{string.buttons.cancel}</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={1} onPress={makeCall}>
              <View style={styles.exobuttonStyle}>
                <Text style={styles.exoProceedText}>{string.exoTel.proceed}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  const [showExoPopup, setShowExoPopup] = useState<boolean>(false);
  const renderexoTEl = () => {
    return (
      <View style={styles.exoMainContainer}>
        <TouchableOpacity
          onPress={() => {
            setShowExoPopup(true);
          }}
        >
          <View style={styles.exobuttonContainer}>
            <ConnectCall />
            <Text style={styles.exoConnectText}>{string.exoTel.connect_via_call}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

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
        middleText={string.consult_room.consult_room}
        // timerremaintext={!consultStarted ? PatientConsultTime : undefined}
        timerremaintext={
          isAutoSaved && moment(savedTime).isValid()
            ? 'Auto Saved at ' + moment(savedTime).format('DD:MM:YY:HH:mm:ss')
            : undefined
        }
        headingContainer={{
          marginLeft:
            (appointmentData || {}).appointmentState == 'AWAITING_RESCHEDULE' ||
            (appointmentData || {}).status == 'COMPLETED' ||
            showEditPreviewButtons ||
            callOptions.isAudio ||
            callOptions.isVideo
              ? (appointmentData || {}).status == 'COMPLETED' || showEditPreviewButtons
                ? -10
                : 40
              : 40,
        }}
        rightIcons={[
          {
            icon: (
              <View
                style={{
                  marginTop: 0,
                }}
              >
                {(appointmentData || {}).appointmentState == 'AWAITING_RESCHEDULE' ? (
                  <RoundChatIcon size="sm" />
                ) : null}
              </View>
            ),
            onPress: () => {
              showPopup({
                description: string.popUP.awaiting_reschedule,
              });
            },
          },
          {
            icon: (
              <View
                style={{
                  marginTop: 0,
                  opacity: startConsult ? 1 : 0.5,
                }}
              >
                {(appointmentData || {}).appointmentState == 'AWAITING_RESCHEDULE' ||
                (appointmentData || {}).status == 'COMPLETED' ||
                showEditPreviewButtons ? null : (
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
              <View
                style={{
                  marginTop: 0,
                  opacity:
                    (appointmentData || {}).appointmentState == 'AWAITING_RESCHEDULE' ? 0.5 : 1,
                }}
              >
                {showEditPreviewButtons || callOptions.isAudio || callOptions.isVideo ? null : (
                  <DotIcon />
                )}
              </View>
            ),
            onPress: () =>
              (appointmentData || {}).appointmentState == 'AWAITING_RESCHEDULE'
                ? null
                : setDropdownShow(!dropdownShow), //startConsult && setDropdownShow(!dropdownShow),
          },
        ]}
        subView={
          startConsult ||
          g(caseSheet, 'caseSheetDetails', 'appointment', 'status') === STATUS.COMPLETED
            ? renderexoTEl()
            : null
        }
      />
    );
  };
  const menuOptions = [
    {
      title: string.consult_room.reschedule,
      onPress: () => {
        setDisplayReSchedulePopUp(true);
      },
    },
    {
      title: string.consult.end_cancel_consult,
      onPress: () => {
        if (
          (appointmentData || {}).status === STATUS.PENDING ||
          (appointmentData || {}).status === STATUS.IN_PROGRESS ||
          ((appointmentData || {}).appointmentStatus === STATUS.COMPLETED &&
            (appointmentData || {}).sentToPatient === false)
        ) {
          setshowCancelPopup(true);
        } else {
          showAphAlert &&
            showAphAlert({
              title: string.common.alert,
              description: 'You are not allowed to cancel the appointment.',
            });
        }
      },
    },
  ];
  const menuOptionsComplete = [
    {
      title: 'Issue New Prescription',
      onPress: () => {
        createCaseSheetSRDAPI();
        setCaseSheetEdit(true);
      },
    },
    {
      title: 'Download Prescription',
      onPress: () => {
        permissionHandler(
          Platform.OS === 'ios' ? undefined : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
          'Enable storage permission from settings to save pdf.',
          () => {
            const dirs = RNFetchBlob.fs.dirs;
            const pdfTitle = `${appointmentData.displayId}_${
              appointmentData.patientInfo
                ? appointmentData.patientInfo.firstName || 'Patient'
                : 'Patient'
            }.pdf`;
            const downloadPath =
              Platform.OS === 'ios'
                ? (dirs.DocumentDir || dirs.MainBundleDir) + '/' + pdfTitle
                : dirs.DownloadDir + '/' + pdfTitle;
            setLoading!(true);
            RNFetchBlob.config({
              fileCache: true,
              path: downloadPath,
              addAndroidDownloads: {
                title: pdfTitle,
                mime: mimeType(downloadPath),
                useDownloadManager: true,
                notification: true,
                description: 'File downloaded by download manager.',
                path: downloadPath,
              },
            })
              .fetch(
                'GET',
                `${AppConfig.Configuration.DOCUMENT_BASE_URL}${g(
                  caseSheet,
                  'caseSheetDetails',
                  'blobName'
                )}`,
                {
                  //some headers ..
                }
              )
              .then((res) => {
                setLoading!(false);
                showAphAlert!({
                  title: 'Alert!',
                  description: 'Downloaded : ' + pdfTitle,
                  onPressOk: () => {
                    Platform.OS === 'ios'
                      ? RNFetchBlob.ios.previewDocument(res.path())
                      : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
                    hideAphAlert!();
                  },
                });
              })
              .catch((err) => {
                CommonBugFender('downloadPDF', err);
                setLoading!(false);
              });
          }
        );
      },
    },
  ];

  const renderDropdown = () => {
    return (
      <View style={styles.fullScreen}>
        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1 }}
          onPress={() => {
            setDropdownShow(false);
          }}
        >
          <View style={styles.menucontainer}>
            {menuOptionsComplete &&
            g(caseSheet, 'caseSheetDetails', 'sentToPatient') &&
            g(caseSheet, 'caseSheetDetails', 'appointment', 'status') === STATUS.COMPLETED
              ? menuOptionsComplete.map((i, index) => {
                  return (
                    <View style={styles.menuTextContainer}>
                      <TouchableOpacity
                        onPress={() => {
                          i.onPress();
                          setDropdownShow(false);
                        }}
                        activeOpacity={1}
                      >
                        <Text style={styles.menuItemText}>{i.title}</Text>
                      </TouchableOpacity>
                      {index !== menuOptionsComplete.length - 1 ? (
                        <View style={styles.seperatorStyle} />
                      ) : null}
                    </View>
                  );
                })
              : null}
            {menuOptions &&
            !g(caseSheet, 'caseSheetDetails', 'sentToPatient') &&
            g(caseSheet, 'caseSheetDetails', 'appointment', 'status') !== STATUS.COMPLETED
              ? menuOptions.map((i, index) => {
                  return (
                    <View style={styles.menuTextContainer}>
                      <TouchableOpacity
                        onPress={() => {
                          i.onPress();
                          setDropdownShow(false);
                        }}
                        activeOpacity={1}
                      >
                        <Text style={styles.menuItemText}>{i.title}</Text>
                      </TouchableOpacity>
                      {index !== menuOptions.length - 1 ? (
                        <View style={styles.seperatorStyle} />
                      ) : null}
                    </View>
                  );
                })
              : null}
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  const uploadPrescriptionPopup = () => {
    return isDropdownVisible ? (
      <UploadPrescriprionPopup
        heading={string.consult_room.attach_files}
        instructionHeading={string.consult_room.instruction_for_upload}
        instructions={[string.consult_room.instruction_list]}
        disabledOption={string.consult_room.none}
        blockCamera={callOptions.isVideo}
        blockCameraMessage={string.alerts.Open_camera_in_video_call}
        optionTexts={{
          camera: string.consult_room.take_a_photo,
          gallery: string.consult_room.choose_from_gallery,
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
    ) : null;
  };
  const closeviews = () => {
    setPatientImageshow(false);
    setOverlayDisplay(null);
    setUrl('');
  };

  useEffect(() => {
    if (patientImageshow) {
      setOverlayDisplay(<ImageZoom source={{ uri: url }} zoom pan onClose={() => closeviews()} />);
    }
  }, [patientImageshow, url]);

  const showRateCallModal = () => {
    return (
      <RateCall visible={giveRating} submitRatingCallback={(data) => submitRatingHandler(data)} />
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
        {/* {showRateCallModal()} */}
        {showHeaderView()}
        {overlayDisplay}
        {showExoPopup && exoTelPopup()}
        {displayReSchedulePopUp && (
          <ReSchedulePopUp
            doctorId={doctorId}
            appointmentId={AppId}
            onClose={() => setDisplayReSchedulePopUp(false)}
            date={Appintmentdatetime}
            loading={(val) => setLoading && setLoading(val)}
            onDone={(reschduleObject) => {
              postWebEngageEvent(WebEngageEventName.DOCTOR_APPOINTMENT_RESCHEDULED, {
                ...basicAppointmentData,
                'Reschedule date ': moment(reschduleObject.transferDateTime).format('DD-MM-YYYY'),
                'Reschedule time': moment(reschduleObject.transferDateTime).format('hh:mm A'),
                'Reschedule reason ': reschduleObject.reason,
              } as WebEngageEvents[WebEngageEventName.DOCTOR_APPOINTMENT_RESCHEDULED]);
              console.log(reschduleObject, 'reschduleObject');
              pubnub.publish(
                {
                  message: {
                    id: doctorId,
                    message: messageCodes.rescheduleconsult,
                    transferInfo: reschduleObject,
                    messageDate: new Date(),
                  },
                  channel: AppId,
                  storeInHistory: true,
                },
                (status, response) => {}
              );
              setDisplayReSchedulePopUp(false);
              showAphAlert &&
                showAphAlert({
                  title: string.common.alert,
                  description: string.alerts.reschedule_alert,
                  onPressOk: () => {
                    setLoading && setLoading(true);
                    backDataFunctionality();
                    hideAphAlert && hideAphAlert();
                  },
                });
            }}
          />
        )}
        {dropdownShow ? renderDropdown() : null}
        {renderTabPage()}
        {showPopUp && CallPopUp()}
        {uploadPrescriptionPopup()}
        {showPDF && (
          <RenderPdf
            uri={url}
            title={`${patientDetails ? patientDetails.firstName || 'Patient' : 'Patient'}_${url
              .split('/')
              .pop()!
              .split('.pdf')[0] || 'Appointment_Document'}`}
            pdfTitle={`${patientDetails ? patientDetails.firstName || 'Patient' : 'Patient'}_${url
              .split('/')
              .pop()!
              .split('.pdf')[0] || 'Appointment_Document'}.pdf`}
            isPopup={true}
            setDisplayPdf={() => {
              setShowPDF(false);
              setUrl('');
            }}
            navigation={props.navigation}
          />
        )}
        {showCancelPopup && renderCancelPopup()}
      </SafeAreaView>
    </View>
  );
};
