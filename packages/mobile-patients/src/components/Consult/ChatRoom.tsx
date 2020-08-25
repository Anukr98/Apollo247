import { OverlayRescheduleView } from '@aph/mobile-patients/src/components/Consult/OverlayRescheduleView';
import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
import { UploadPrescriprionChatPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionChatPopup';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  BackCameraIcon,
  ChatCallIcon,
  ChatIcon,
  ChatSend,
  ChatWithNotification,
  CrossPopup,
  DoctorImage,
  DoctorPlaceholderImage,
  EndCallIcon,
  FileBig,
  FrontCameraIcon,
  FullScreenIcon,
  Loader,
  Mascot,
  MissedCallIcon,
  MuteIcon,
  PickCallIcon,
  UnMuteIcon,
  VideoOffIcon,
  UploadHealthRecords,
  FreeArrowIcon,
  VideoOnIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import {
  CommonBugFender,
  CommonLogEvent,
  DeviceHelper,
  setBugFenderLog,
  isIos,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  BOOK_APPOINTMENT_RESCHEDULE,
  BOOK_APPOINTMENT_TRANSFER,
  CANCEL_APPOINTMENT,
  UPDATE_APPOINTMENT_SESSION,
  UPLOAD_CHAT_FILE_PRISM,
  ADD_CHAT_DOCUMENTS,
  UPLOAD_MEDIA_DOCUMENT_PRISM,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  bookRescheduleAppointment,
  bookRescheduleAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/bookRescheduleAppointment';
import {
  bookTransferAppointment,
  bookTransferAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/bookTransferAppointment';
import { getAppointmentData_getAppointmentData_appointmentsHistory } from '@aph/mobile-patients/src/graphql/types/getAppointmentData';
import { getPatinetAppointments_getPatinetAppointments_patinetAppointments } from '@aph/mobile-patients/src/graphql/types/getPatinetAppointments';
import {
  APPOINTMENT_STATE,
  APPOINTMENT_TYPE,
  BookTransferAppointmentInput,
  ConsultQueueInput,
  FEEDBACKTYPE,
  MessageInput,
  notificationEventName,
  notificationStatus,
  notificationType,
  REQUEST_ROLES,
  MediaPrescriptionUploadRequest,
  STATUS,
  TRANSFER_INITIATED_TYPE,
  mediaPrescriptionSource,
  MediaPrescriptionFileProperties,
  Gender,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  updateAppointmentSession,
  updateAppointmentSessionVariables,
} from '@aph/mobile-patients/src/graphql/types/updateAppointmentSession';
import {
  addToConsultQueue,
  addToConsultQueueWithAutomatedQuestions,
  checkIfRescheduleAppointment,
  endCallSessionAppointment,
  getAppointmentDataDetails,
  getNextAvailableSlots,
  getPrismUrls,
  insertMessage,
  getPastAppoinmentCount,
  updateExternalConnect,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import { OTPublisher, OTSession, OTSubscriber } from 'opentok-react-native';
import Pubnub, { HereNowResponse } from 'pubnub';
import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  AppState,
  AppStateStatus,
  BackHandler,
  Dimensions,
  FlatList,
  Image as ImageReact,
  Keyboard,
  KeyboardEvent,
  Linking,
  NativeModules,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CryptoJS from 'crypto-js';
import { Image } from 'react-native-elements';
import KeepAwake from 'react-native-keep-awake';
import SoftInputMode from 'react-native-set-soft-input-mode';
import { WebView } from 'react-native-webview';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import RNFetchBlob from 'rn-fetch-blob';
import {
  cancelAppointment,
  cancelAppointmentVariables,
} from '../../graphql/types/cancelAppointment';
import { uploadChatDocumentToPrism } from '../../graphql/types/uploadChatDocumentToPrism';
import {
  callPermissions,
  g,
  postWebEngageEvent,
  nameFormater,
} from '../../helpers/helperFunctions';
import { mimeType } from '../../helpers/mimeType';
import { FeedbackPopup } from '../FeedbackPopup';
import { RenderPdf } from '../ui/RenderPdf';
import { useUIElements } from '../UIElementsProvider';
import { ChatQuestions } from './ChatQuestions';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { CustomAlert } from '../ui/CustomAlert';
import { Snackbar } from 'react-native-paper';
import BackgroundTimer from 'react-native-background-timer';
import { UploadPrescriprionPopup } from '../Medicines/UploadPrescriprionPopup';
import { ChatRoom_NotRecorded_Value } from '@aph/mobile-patients/src/strings/strings.json';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import RNCallKeep from 'react-native-callkeep';
import VoipPushNotification from 'react-native-voip-push-notification';

interface OpentokStreamObject {
  connection: {
    connectionId: string;
    creationTime: string;
    data: string;
  };
  connectionId: string;
  creationTime: string;
  hasAudio: boolean;
  hasVideo: boolean;
  height: number;
  name: string;
  sessionId: string;
  streamId: string;
  videoType: 'camera' | 'screen';
  width: number;
}

type OptntokChangeProp = {
  changedProperty: string;
  newValue: string;
  oldValue: boolean;
  stream: OpentokStreamObject;
};

type OpentokError = {
  code: string | number;
  message: string;
};

const { ExportDeviceToken } = NativeModules;
const { height, width } = Dimensions.get('window');

const timer: number = 900;
let timerId: any;
let joinTimerId: any;
let diffInHours: number;
// let callAbandonmentTimer: any;
// let callAbandonmentStoppedTimer: number = 620;
// let messageSent: string;
let rescheduleInitiatedBy: string;
let callhandelBack: boolean = true;
let jdCount: any = 1;
let isJdAllowed: boolean = true;
let abondmentStarted = false;

type rescheduleType = {
  rescheduleCount: number;
  appointmentState: string;
  isCancel: number;
  isFollowUp: number;
  isPaid: number;
};

const styles = StyleSheet.create({
  rescheduleTextStyles: {
    ...theme.viewStyles.yellowTextStyle,
    marginVertical: 10,
    textAlign: 'center',
  },
  claimStyles: {
    flex: 0.5,
    marginLeft: 5,
    marginRight: 8,
    backgroundColor: 'white',
    borderRadius: 10,
    ...theme.viewStyles.shadowStyle,
  },
  rescheduletyles: {
    flex: 0.5,
    marginRight: 5,
    marginLeft: 8,
    backgroundColor: theme.colors.APP_YELLOW_COLOR,
    borderRadius: 10,
    ...theme.viewStyles.shadowStyle,
  },
  gotItStyles: {
    height: 60,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
  mainView: {
    backgroundColor: theme.colors.CARD_BG,
    paddingTop: 12,
    paddingHorizontal: 20,
    ...theme.viewStyles.shadowStyle,
  },
  // displayId: {
  //   ...theme.fonts.IBMPlexSansMedium(12),
  //   color: theme.colors.SEARCH_EDUCATION_COLOR,
  //   paddingBottom: 4,
  //   marginTop: 10,
  // },
  // separatorStyle: {
  //   borderBottomWidth: 0.5,
  //   borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  // },
  displayId: {
    ...theme.fonts.IBMPlexSansMedium(13),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
    paddingBottom: 4,
    // marginTop: 10,
    letterSpacing: 0.33,
  },
  separatorStyle: {
    // borderBottomWidth: 0.5,
    // borderBottomColor: 'rgba(2, 71, 91, 0.2)',
    backgroundColor: '#02475b',
    opacity: 0.2,
    height: 0.5,
    // marginBottom: 6,
  },
  doctorNameStyle: {
    paddingTop: 8,
    paddingBottom: 0,
    textTransform: 'capitalize',
    ...theme.fonts.IBMPlexSansSemiBold(23),
    color: theme.colors.LIGHT_BLUE,
  },
  doctorSpecialityStyle: {
    paddingTop: 0,
    paddingBottom: 12,
    ...theme.fonts.IBMPlexSansRegular(11),
    color: theme.colors.LIGHT_BLUE,
    lineHeight: 15,
  },
  timeStyle: {
    paddingBottom: 20,
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SKY_BLUE,
  },
  imageView: {
    width: 80,
    height: 80,
    marginLeft: 20,
    borderRadius: 40,
    backgroundColor: theme.colors.CARD_BG,
    ...theme.viewStyles.shadowStyle,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  chatDisabledContainer: {
    marginVertical: 20,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
  },
  chatDisabledHeader: {
    ...theme.viewStyles.text('M', 13, theme.colors.SHERPA_BLUE),
    textAlign: 'center',
    marginBottom: 10,
  },
  callHeaderView: {
    backgroundColor: theme.colors.HEADER_GREY,
    height: 60,
    ...theme.viewStyles.shadowStyle,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  joinRoomDescriptionText: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(13),
    width: '65%',
  },
  callHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  joinBtn: {
    width: 73,
    height: 40,
  },
  centerTxt: {
    position: 'absolute',
    left: 20,
    top: '50%',
    width: width - 40,
    color: 'white',
    ...theme.fonts.IBMPlexSansSemiBold(13),
    textAlign: 'center',
    zIndex: 1,
  },
});

const urlRegEx = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG|jfif|jpeg|JPEG)/;

export interface ChatRoomProps extends NavigationScreenProps {}
export const ChatRoom: React.FC<ChatRoomProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const fromIncomingCall = props.navigation.state.params!.isCall;
  const { isIphoneX } = DeviceHelper();

  let appointmentData: any = props.navigation.getParam('data');
  const disableChat =
    props.navigation.getParam('disableChat') ||
    moment(new Date(appointmentData.appointmentDateTime))
      .add(6, 'days')
      .startOf('day')
      .isBefore(moment(new Date()).startOf('day'));
  // console.log('appointmentData >>>>', appointmentData);

  const callType = props.navigation.state.params!.callType
    ? props.navigation.state.params!.callType
    : '';

  const prescription = props.navigation.state.params!.prescription
    ? props.navigation.state.params!.prescription
    : '';

  const isVoipCall = props.navigation.state.params!.isVoipCall;

  let dateIsAfter = moment(new Date()).isAfter(moment(appointmentData.appointmentDateTime));

  const flatListRef = useRef<FlatList<never> | undefined | null>();
  const otSessionRef = React.createRef();
  const textInput = React.createRef();

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState<string>('');
  const [heightList, setHeightList] = useState<number>(
    isIphoneX() ? height - 166 : Platform.OS === 'ios' ? height - 141 : height - 141
  );
  const [status, setStatus] = useState<STATUS>(appointmentData.status);
  const [sessionId, setsessionId] = useState<string>('');
  const [token, settoken] = useState<string>('');
  const [cameraPosition, setCameraPosition] = useState<string>('front');
  const [isPublishAudio, setIsPublishAudio] = useState<boolean>(true);
  const [showVideo, setShowVideo] = useState<boolean>(true);
  const [PipView, setPipView] = useState<boolean>(false);
  const [isCall, setIsCall] = useState<boolean>(false);
  const [onSubscribe, setOnSubscribe] = useState<boolean>(false);
  const isAudio = useRef<boolean>(false);
  const [isAudioCall, setIsAudioCall] = useState<boolean>(false);
  const [showAudioPipView, setShowAudioPipView] = useState<boolean>(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showCallAbandmentPopup, setShowCallAbandmentPopup] = useState(false);
  const [showConnectAlertPopup, setShowConnectAlertPopup] = useState(false);
  const { setDoctorJoinedChat, doctorJoinedChat } = useAppCommonData(); //setting in context since we are updating this in NotificationListener
  const [name, setname] = useState<string>('');
  const [talkStyles, setTalkStyles] = useState<object>({
    flex: 1,
    backgroundColor: 'black',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  });
  const [subscriberStyles, setSubscriberStyles] = useState<object>({
    width,
    height,
  });
  const [publisherStyles, setPublisherStyles] = useState<object>({
    position: 'absolute',
    top: isIphoneX() ? 74 : 44,
    right: 20,
    width: 148,
    height: 112,
    zIndex: 1000,
    borderRadius: 30,
  });
  const [audioCallStyles, setAudioCallStyles] = useState<object>({
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: 'black',
  });
  const [audioCallImageStyles, setAudioCallImageStyles] = useState<object>({
    width,
    height,
  });

  const [timerStyles, setTimerStyles] = useState<object>({
    position: 'absolute',
    marginHorizontal: 20,
    marginTop: isIphoneX() ? 91 : 81,
    width: width - 40,
    color: 'white',
    ...theme.fonts.IBMPlexSansSemiBold(12),
    textAlign: 'center',
    letterSpacing: 0.46,
    zIndex: 1005,
  });

  const disAllowReschedule =
    g(appointmentData, 'appointmentState') != APPOINTMENT_STATE.AWAITING_RESCHEDULE;

  const [remainingTime, setRemainingTime] = useState<number>(900);
  const [consultStarted, setConsultStarted] = useState<boolean>(true);
  const [callTimer, setCallTimer] = useState<number>(0);
  const [joinCounter, setJoinCounter] = useState<number>(0);
  const [callAccepted, setCallAccepted] = useState<boolean>(false);
  const [hideStatusBar, setHideStatusBar] = useState<boolean>(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [chatReceived, setChatReceived] = useState(false);
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);
  const [doctorJoined, setDoctorJoined] = useState(false);
  const [apiCalled, setApiCalled] = useState(false);
  const [userName, setuserName] = useState<string>('');
  const [convertVideo, setConvertVideo] = useState<boolean>(false);
  const [transferAccept, setTransferAccept] = useState<boolean>(false);
  const [transferDcotorName, setTransferDcotorName] = useState<string>('');
  const [bottompopup, setBottompopup] = useState<boolean>(false);
  const [wrongFormat, setwrongFormat] = useState<boolean>(false);
  const [checkReschudule, setCheckReschudule] = useState<boolean>(false);
  const [newRescheduleCount, setNewRescheduleCount] = useState<rescheduleType>();
  const [nextSlotAvailable, setNextSlotAvailable] = useState<string>('');
  const [transferData, setTransferData] = useState<any>([]);
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const [doctorScheduleId, setDoctorScheduleId] = useState<string>('');
  const [dropDownBottomStyle, setDropDownBottomStyle] = useState<number>(isIphoneX() ? 50 : 15);
  const jrDoctorJoined = useRef<boolean>(false); // using ref to get the current updated values on event listeners
  const [displayChatQuestions, setDisplayChatQuestions] = useState<boolean>(false);
  const [displayUploadHealthRecords, setDisplayUploadHealthRecords] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<ConsultQueueInput>();
  const [isSendAnswers, setisSendAnswers] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [sucesspopup, setSucessPopup] = useState<boolean>(false);
  const [showPDF, setShowPDF] = useState<boolean>(false);
  const [textChange, setTextChange] = useState(false);
  const [sendMessageToDoctor, setSendMessageToDoctor] = useState<boolean>(false);
  const [callerAudio, setCallerAudio] = useState<boolean>(true);
  const [callerVideo, setCallerVideo] = useState<boolean>(true);
  const [downgradeToAudio, setDowngradeToAudio] = React.useState<boolean>(false);
  const patientJoinedCall = useRef<boolean>(false); // using ref to get the current values on listener events
  const subscriberConnected = useRef<boolean>(false);

  const videoCallMsg = '^^callme`video^^';
  const audioCallMsg = '^^callme`audio^^';
  const acceptedCallMsg = '^^callme`accept^^';
  const endCallMsg = '^^callme`stop^^';
  const startConsultMsg = '^^#startconsult';
  const stopConsultMsg = '^^#stopconsult';
  const typingMsg = '^^#typing';
  const covertVideoMsg = '^^convert`video^^';
  const covertAudioMsg = '^^convert`audio^^';
  const transferConsultMsg = '^^#transferconsult';
  const rescheduleConsultMsg = '^^#rescheduleconsult';
  const followupconsult = '^^#followupconsult';
  const imageconsult = '^^#DocumentUpload';
  const startConsultjr = '^^#startconsultJr';
  const consultPatientStartedMsg = '^^#PatientConsultStarted';
  const firstMessage = '^^#firstMessage';
  const secondMessage = '^^#secondMessage';
  const languageQue = '^^#languageQue';
  const jdThankyou = '^^#jdThankyou';
  const cancelConsultInitiated = '^^#cancelConsultInitiated';
  const stopConsultJr = '^^#stopconsultJr';
  const callAbandonment = '^^#callAbandonment';
  const appointmentComplete = '^^#appointmentComplete';
  const doctorAutoResponse = '^^#doctorAutoResponse';
  const leaveChatRoom = '^^#leaveChatRoom';
  const patientJoinedMeetingRoom = '^^#patientJoinedMeetingRoom';
  const patientRejectedCall = '^^#PATIENT_REJECTED_CALL';
  const exotelCall = '^^#exotelCall';

  const patientId = appointmentData.patientId;
  const channel = appointmentData.id;
  const doctorId = appointmentData.doctorInfo.id;

  let intervalId: any;
  let stoppedTimer: number;
  let thirtySecondTimer: any;
  let minuteTimer: any;

  const { getPatientApiCall } = useAuth();
  const { currentPatient } = useAllCurrentPatients();

  const [patientImageshow, setPatientImageshow] = useState<boolean>(false);
  const [showweb, setShowWeb] = useState<boolean>(false);
  const [url, setUrl] = useState('');
  const [snackbarState, setSnackbarState] = useState<boolean>(false);
  const [handlerMessage, setHandlerMessage] = useState('');
  const postAppointmentWEGEvent = (
    type:
      | WebEngageEventName.COMPLETED_AUTOMATED_QUESTIONS
      | WebEngageEventName.JD_COMPLETED
      | WebEngageEventName.PRESCRIPTION_RECEIVED
      | WebEngageEventName.SD_CONSULTATION_STARTED
      | WebEngageEventName.SD_VIDEO_CALL_STARTED
      | WebEngageEventName.DOWNLOAD_PRESCRIPTION
      | WebEngageEventName.VIEW_PRESCRIPTION_IN_CONSULT_DETAILS,
    data:
      | getAppointmentData_getAppointmentData_appointmentsHistory
      | getPatinetAppointments_getPatinetAppointments_patinetAppointments = appointmentData
  ) => {
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.COMPLETED_AUTOMATED_QUESTIONS]
      | WebEngageEvents[WebEngageEventName.JD_COMPLETED]
      | WebEngageEvents[WebEngageEventName.PRESCRIPTION_RECEIVED]
      | WebEngageEvents[WebEngageEventName.SD_CONSULTATION_STARTED]
      | WebEngageEvents[WebEngageEventName.SD_VIDEO_CALL_STARTED]
      | WebEngageEvents[WebEngageEventName.DOWNLOAD_PRESCRIPTION]
      | WebEngageEvents[WebEngageEventName.VIEW_PRESCRIPTION_IN_CONSULT_DETAILS] = {
      'Doctor Name': g(data, 'doctorInfo', 'fullName')!,
      'Speciality ID': g(data, 'doctorInfo', 'specialty', 'id')!,
      'Speciality Name': g(data, 'doctorInfo', 'specialty', 'name')!,
      'Doctor Category': g(data, 'doctorInfo', 'doctorType')!,
      'Consult Date Time': moment(g(data, 'appointmentDateTime')).toDate(),
      'Consult Mode': g(data, 'appointmentType') == APPOINTMENT_TYPE.ONLINE ? 'Online' : 'Physical',
      'Hospital Name': g(data, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'name')!,
      'Hospital City': g(data, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'city')!,
      'Consult ID': g(data, 'id')!,
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Customer ID': g(currentPatient, 'id'),
    };
    if (type == WebEngageEventName.DOWNLOAD_PRESCRIPTION) {
      (eventAttributes as WebEngageEvents[WebEngageEventName.DOWNLOAD_PRESCRIPTION])[
        'Download Screen'
      ] = 'Chat';
    }
    postWebEngageEvent(type, eventAttributes);
  };

  useEffect(() => {
    if (!currentPatient) {
      console.log('No current patients available');
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', backDataFunctionality);
    });

    const willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    });
    callPermissions();
    return () => {
      didFocusSubscription && didFocusSubscription.remove();
      willBlurSubscription && willBlurSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isVoipCall || fromIncomingCall) {
      joinCallHandler();
    }
  }, []);

  const backDataFunctionality = () => {
    try {
      console.log(callhandelBack, 'is back called');
      if (callhandelBack) {
        // handleCallTheEdSessionAPI();
        props.navigation.dispatch(
          StackActions.reset({
            index: 0,
            key: null,
            actions: [NavigationActions.navigate({ routeName: AppRoutes.TabBar })],
          })
        );
        return true;
      } else {
        return true;
      }
    } catch (error) {
      CommonBugFender('ChatRoom_backDataFunctionality_try', error);
      console.log(error, 'error');
    }
  };

  useEffect(() => {
    const userName =
      currentPatient && currentPatient.firstName ? currentPatient.firstName.split(' ')[0] : '';
    setuserName(userName);
    setUserAnswers({ appointmentId: channel });
    getAppointmentCount();
    // requestToJrDoctor();
    // updateSessionAPI();
    setTimeout(() => {
      CheckDoctorPresentInChat();
    }, 2000);
    if (isIos()) {
      handleCallkitEventListeners();
      handleVoipEventListeners();
    }
  }, []);

  useEffect(() => {
    console.log('didmout');
    Platform.OS === 'android' && requestReadSmsPermission();
    Platform.OS === 'android' && SoftInputMode.set(SoftInputMode.ADJUST_RESIZE);
    KeepAwake.activate();
    AppState.addEventListener('change', _handleAppStateChange);
  }, []);

  const handleCallkitEventListeners = () => {
    RNCallKeep.addEventListener('answerCall', onAnswerCallAction);
  };

  const handleVoipEventListeners = () => {
    VoipPushNotification.addEventListener('notification', (notification) => {
      // on receive voip push
      const payload = notification && notification.getData();
      if (payload && payload.appointmentId) {
        isAudio.current = notification.getData().isVideo ? false : true;
      }
    });
  };

  const onAnswerCallAction = () => {
    joinCallHandler();
  };

  const playSound = () => {
    try {
      maxVolume();
      if (audioTrack) {
        audioTrack.play();
        audioTrack.setNumberOfLoops(15);
        console.log('call audioTrack');
      }
    } catch (e) {
      CommonBugFender('playing_callertune__failed', e);
    }
  };

  const stopSound = () => {
    try {
      setPrevVolume();
      if (audioTrack) {
        audioTrack.stop();
      }
    } catch (e) {
      CommonBugFender('playing_callertune__failed', e);
    }
  };

  useEffect(() => {
    console.log('callType', callType);
    if (callType) {
      AsyncStorage.setItem('callDisconnected', 'false');

      callPermissions(() => {
        if (callType === 'VIDEO') {
          isVoipCall || fromIncomingCall ? setOnSubscribe(false) : setOnSubscribe(true);
          isAudio.current = false;
        } else if (callType === 'AUDIO') {
          isVoipCall || fromIncomingCall ? setOnSubscribe(false) : setOnSubscribe(true);
          isAudio.current = true;
          callhandelBack = false;
        }
        isVoipCall || fromIncomingCall ? null : playSound();
      });
    }
    if (prescription) {
      // write code for opening prescripiton
    }
  }, []);

  const client = useApolloClient();

  const getAppointmentCount = async () => {
    try {
      const ids = await AsyncStorage.getItem('APPOINTMENTS_CONSULTED_WITH_DOCTOR_BEFORE');
      const appointmentIds: string[] = JSON.parse(ids || '[]');
      if (appointmentIds.find((id) => id == channel)) {
        return;
      }
      getPastAppoinmentCount(client, doctorId, patientId, channel).then((data: any) => {
        const yesCount = g(data, 'data', 'data', 'getPastAppointmentsCount', 'yesCount');
        const noCount = g(data, 'data', 'data', 'getPastAppointmentsCount', 'noCount');
        if (yesCount && yesCount > 0) {
          setShowConnectAlertPopup(false);
        } else {
          if (noCount && noCount > 0) {
            setShowConnectAlertPopup(false);
          } else {
            setShowConnectAlertPopup(true);
          }
        }
      });
    } catch (error) {
      console.log('getAppointmentCount_error', error);
    }
  };

  const getUpdateExternalConnect = (connected: boolean) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULTED_WITH_DOCTOR_BEFORE] = {
      ...currentPatient,
      ConsultedBefore: connected ? 'Yes' : 'No',
    };
    postWebEngageEvent(WebEngageEventName.CONSULTED_WITH_DOCTOR_BEFORE, eventAttributes);
    setLoading(true);

    updateExternalConnect(client, doctorId, patientId, connected, channel)
      .then((data) => {
        setLoading(false);
        console.log('getUpdateExternalConnect', data);
      })
      .catch((error) => {
        setLoading(false);
        console.log('InsertMessageToDoctor_error', error);
      });
  };

  const InsertMessageToDoctor = (message: string) => {
    // if (status !== STATUS.COMPLETED) return;
    // if (!sendMessageToDoctor) return;

    SendAutoMatedMessageToDoctorAPI();

    const ciphertext = CryptoJS.AES.encrypt(
      message,
      AppConfig.Configuration.CRYPTO_SECRET_KEY
    ).toString();

    const messageInput: MessageInput = {
      fromId: patientId,
      toId: doctorId,
      eventName: notificationEventName.APPOINTMENT,
      eventId: channel,
      message: ciphertext,
      status: notificationStatus.UNREAD,
      type: notificationType.CHAT,
    };

    insertMessage(client, messageInput)
      .then((data) => {
        console.log('InsertMessageToDoctor', data);
      })
      .catch((error) => {
        console.log('InsertMessageToDoctor_error', error);
      });
  };

  const SendAutoMatedMessageToDoctorAPI = async () => {
    try {
      const saveAppointment = [
        {
          appointmentId: appointmentData.id,
          date: moment().format('YYYY-MM-DD'),
          sendDate: new Date(),
        },
      ];
      console.log('saveAppointment', saveAppointment);

      const storedAppointmentData = (await AsyncStorage.getItem('saveAppointment')) || '';
      const saveAppointmentData = storedAppointmentData ? JSON.parse(storedAppointmentData) : '';
      console.log('saveAppointmentDataAsyncStorage', saveAppointmentData);

      if (saveAppointmentData) {
        const result = saveAppointmentData.filter((obj: any) => {
          return obj.appointmentId === appointmentData.id;
        });
        console.log('saveAppointmentDataresult', saveAppointmentData);

        if (result.length > 0) {
          if (result[0].appointmentId === appointmentData.id) {
            const index = saveAppointmentData.findIndex(
              (project: any) => project.appointmentId === appointmentData.id
            );

            const diff = moment.duration(
              moment(saveAppointmentData[index].sendDate).diff(new Date())
            );
            const diffInMins = diff.asMinutes();
            console.log('chatdiffInMins', diffInMins);
            if (diffInMins <= -10) {
              sendDcotorChatMessage();
              saveAppointmentData[index].sendDate = new Date();
              saveAppointmentData[index].date = moment().format('YYYY-MM-DD');
            }

            AsyncStorage.setItem('saveAppointment', JSON.stringify(saveAppointmentData));
          }
        } else {
          sendDcotorChatMessage();
          saveAppointmentData.push(saveAppointment[0]);
          AsyncStorage.setItem('saveAppointment', JSON.stringify(saveAppointmentData));
        }
      } else {
        sendDcotorChatMessage();
        AsyncStorage.setItem('saveAppointment', JSON.stringify(saveAppointment));
      }
    } catch (error) {}
  };

  const sendDcotorChatMessage = () => {
    pubnub.publish(
      {
        channel: channel,
        message: {
          message: doctorAutoResponse,
          automatedText: `We have notified the query you have raised to the ${appointmentData.doctorInfo.displayName}. Doctor will get back to you within 24 hours. In case of emergency, please contact the nearby hospital`,
          id: doctorId,
          isTyping: true,
          messageDate: new Date(),
        },
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {}
    );
  };

  const setSendAnswers = (val: number) => {
    const s = isSendAnswers;
    s[val] = true;
    setisSendAnswers(s);
  };

  const sendAnswerMessage = (text: { id: string; message: string }) => {
    pubnub.publish(
      {
        channel: channel,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {}
    );
  };
  const setAnswerData = (value: { k: string; v: string[] }[]) => {
    const data = userAnswers || ({} as ConsultQueueInput);
    value.forEach((item) => {
      switch (item.k) {
        case 'gender':
          data.gender = (nameFormater(item.v[0] || '', 'upper') as Gender) || null;
          try {
            const text = {
              id: patientId,
              message: 'Gender:\n' + nameFormater(data.gender || 'Unspecified', 'title'),
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[9] && sendAnswerMessage(text);
            setSendAnswers(9);
            console.log('isSendAnswers[2]', isSendAnswers[2]);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers11_try', error);
          }
          break;
        case 'age':
          data.age = Number(item.v[0]) || null;
          try {
            const text = {
              id: patientId,
              message: 'Age:\n' + (data.age || 'No Idea'),
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[10] && sendAnswerMessage(text);
            setSendAnswers(10);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers12_try', error);
          }
          break;
        case 'height':
          data.height = item.v[0] !== '' ? item.v.join(' ') : ChatRoom_NotRecorded_Value;
          console.log('data.height:', 'data.height:' + data.height);
          try {
            const text = {
              id: patientId,
              message: 'Height:\n' + data.height,
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[0] && sendAnswerMessage(text);
            setSendAnswers(0);
            setSendAnswers(6); // this is added here since family history is hidded in questions
            if (currentPatient && currentPatient.gender) {
              setSendAnswers(9);
            }
            if (currentPatient && currentPatient.dateOfBirth) {
              setSendAnswers(10);
            }
          } catch (error) {
            CommonBugFender('ChatRoom_Answers0_try', error);
          }
          break;
        case 'weight':
          data.weight = item.v[0] || ChatRoom_NotRecorded_Value;
          try {
            const text = {
              id: patientId,
              message: 'Weight:\n' + data.weight,
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[1] && sendAnswerMessage(text);
            setSendAnswers(1);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers1_try', error);
          }
          break;
        case 'drug':
          if (item.v[0] === 'No') {
            data.drugAllergies = 'No';
            try {
              const text = {
                id: patientId,
                message: 'Medicine Allergy:\n' + 'No',
                messageDate: new Date(),
              };
              setMessageText('');
              !isSendAnswers[2] && sendAnswerMessage(text);
              setSendAnswers(2);
            } catch (error) {
              CommonBugFender('ChatRoom_Answers2_try', error);
            }
          }
          break;
        case 'drugAllergies':
          data.drugAllergies = item.v[0] || '';
          try {
            const text = {
              id: patientId,
              message: 'Medicine Allergy:\n' + (item.v[0] || '-'),
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[2] && sendAnswerMessage(text);
            setSendAnswers(2);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers3_try', error);
          }
          break;
        case 'dite':
          if (item.v[0] === 'No') {
            data.dietAllergies = 'No';
            try {
              const text = {
                id: patientId,
                message: 'Food Allergy:\n' + data.dietAllergies,
                messageDate: new Date(),
              };
              setMessageText('');
              !isSendAnswers[3] && sendAnswerMessage(text);
              setSendAnswers(3);
            } catch (error) {
              CommonBugFender('ChatRoom_Answers4_try', error);
            }
          }
          break;
        case 'dietAllergies':
          data.dietAllergies = item.v[0] || '';
          try {
            const text = {
              id: patientId,
              message: 'Food Allergy:\n' + (item.v[0] || '-'),
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[3] && sendAnswerMessage(text);
            setSendAnswers(3);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers5_try', error);
          }
          break;
        case 'temperature':
          data.temperature = item.v[0] || ChatRoom_NotRecorded_Value;
          try {
            const text = {
              id: patientId,
              message: 'Temperature:\n' + data.temperature,
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[4] && sendAnswerMessage(text);
            setSendAnswers(4);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers6_try', error);
          }
          break;
        case 'bp':
          data.bp = item.v[1] || item.v[0] || ChatRoom_NotRecorded_Value;
          try {
            const text = {
              id: patientId,
              message: 'Blood Pressure:\n' + data.bp,
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[5] && sendAnswerMessage(text);
            setSendAnswers(5);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers7_try', error);
          }
          break;
        case 'familyHistory':
          data.familyHistory = item.v[0] || '';
          try {
            const text = {
              id: patientId,
              message:
                'Family members suffering suffer from — COPD, Cancer, Hypertension or Diabetes:\n' +
                (item.v[0] || '-'),
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[6] && sendAnswerMessage(text);
            setSendAnswers(6);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers8_try', error);
          }
          break;
        case 'lifeStyleSmoke':
          data.lifeStyle = data.lifeStyle
            ? data.lifeStyle.includes('Smoke')
              ? data.lifeStyle
              : 'Smoke: ' + (item.v[0] || '') + '\n' + data.lifeStyle
            : 'Smoke: ' + (item.v[0] || '');
          try {
            const text = {
              id: patientId,
              message: 'Smoke:\n' + (item.v[0] || '-'),
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[7] && sendAnswerMessage(text);
            setSendAnswers(7);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers9_try', error);
          }
          break;
        case 'lifeStyleDrink':
          data.lifeStyle = data.lifeStyle
            ? data.lifeStyle.includes('Drink')
              ? data.lifeStyle
              : data.lifeStyle + '\nDrink: ' + (item.v[0] || '')
            : 'Drink: ' + (item.v[0] || '');
          try {
            const text = {
              id: patientId,
              message: 'Drink: \n' + (item.v[0] || '-'),
              messageDate: new Date(),
            };
            setMessageText('');
            !isSendAnswers[8] && sendAnswerMessage(text);
            setSendAnswers(8);
          } catch (error) {
            CommonBugFender('ChatRoom_Answers10_try', error);
          }
          break;
      }
    });
    setUserAnswers(data);
    if (isSendAnswers.find((item) => item === false) === undefined) {
      requestToJrDoctor();
    }
  };

  const checkNudgeScreenVisibility = async () => {
    const hideNudgeScreenappointmentID = (await AsyncStorage.getItem(appointmentData.id)) || '';
    // console.log('hideNudgeScreenappointmentID', hideNudgeScreenappointmentID);
    if (hideNudgeScreenappointmentID != appointmentData.id) {
      setDisplayUploadHealthRecords(true);
      console.log('if hideNudgeScreenappointmentID', hideNudgeScreenappointmentID);
    } else {
      setDisplayUploadHealthRecords(false);
      console.log('else hideNudgeScreenappointmentID', hideNudgeScreenappointmentID);
    }
  };

  const requestToJrDoctor = async () => {
    //new code
    if (userAnswers) {
      addToConsultQueueWithAutomatedQuestions(client, userAnswers)
        .then(({ data }: any) => {
          getPatientApiCall();

          postAppointmentWEGEvent(WebEngageEventName.COMPLETED_AUTOMATED_QUESTIONS);
          console.log(data, 'data res, adding');
          jdCount = parseInt(
            data.data.addToConsultQueueWithAutomatedQuestions.totalJuniorDoctorsOnline,
            10
          );
          isJdAllowed = data.data.addToConsultQueueWithAutomatedQuestions.isJdAllowed;
        })
        .catch((e) => {
          CommonBugFender('ChatRoom_addToConsultQueueWithAutomatedQuestions', e);
          console.log('Error occured, adding ', e);
        })
        .finally(() => startJoinTimer(0));
    } else {
      addToConsultQueue(client, appointmentData.id)
        .then(({ data }: any) => {
          console.log(data, 'data res');
          jdCount = parseInt(data.data.addToConsultQueue.totalJuniorDoctorsOnline, 10);
          isJdAllowed = data.data.addToConsultQueue.isJdAllowed;
        })
        .catch((e) => {
          CommonBugFender('ChatRoom_addToConsultQueue', e);
          console.log('Error occured ', e);
        })
        .finally(() => startJoinTimer(0));
    }
  };

  const _handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      console.log('nextAppState :' + nextAppState, abondmentStarted);
      if (onSubscribe) {
        props.navigation.setParams({ callType: isAudio.current ? 'AUDIO' : 'VIDEO' });
      }
    } else if (nextAppState === 'active') {
      const permissionSettings: string | null = await AsyncStorage.getItem('permissionHandler');
      if (permissionSettings && permissionSettings === 'true') {
        callPermissions(() => {
          if (callType) {
            if (callType === 'VIDEO') {
              setOnSubscribe(true);
              isAudio.current = false;
            } else if (callType === 'AUDIO') {
              setOnSubscribe(true);
              isAudio.current = true;
              callhandelBack = false;
            }
            playSound();
            !jrDoctorJoined.current && setDoctorJoinedChat && setDoctorJoinedChat(true);
          } else {
            if (onSubscribe) {
              setOnSubscribe(false);
              stopTimer();
              startTimer(0);
              setCallAccepted(true);
              setHideStatusBar(true);
              setChatReceived(false);
              Keyboard.dismiss();
              stopSound();
              changeAudioStyles();
              setConvertVideo(false);
              setDowngradeToAudio(false);
              setCallerAudio(true);
              setCallerVideo(true);
              changeVideoStyles();
              setDropdownVisible(false);
              if (token) {
                PublishAudioVideo();
              } else {
                APICallAgain();
              }
            }
          }
        });
        AsyncStorage.removeItem('permissionHandler');
      }
    }
  };

  // APP-2803: removed No show logic

  // const handleCallTheEdSessionAPI = () => {
  //   console.log('API not Called');

  //   if (abondmentStarted == true) {
  //     if (appointmentData.status === STATUS.COMPLETED) return;
  //     if (appointmentData.status === STATUS.NO_SHOW) return;
  //     if (appointmentData.status === STATUS.CALL_ABANDON) return;
  //     if (appointmentData.status === STATUS.CANCELLED) return;
  //     if (appointmentData.appointmentState === APPOINTMENT_STATE.AWAITING_RESCHEDULE) return;
  //     if (appointmentData.appointmentType === APPOINTMENT_TYPE.PHYSICAL) return;
  //     if (status === STATUS.COMPLETED) return;

  //     console.log('API Called');
  //     endCallAppointmentSessionAPI(STATUS.NO_SHOW);
  //   }
  // };

  // const endCallAppointmentSessionAPI = async (status: STATUS) => {
  //   console.log('endCallAppointmentSessionAPI called');

  //   const APICalled = await AsyncStorage.getItem('endAPICalled');
  //   console.log(APICalled, 'APICalled endCallAppointmentSessionAPI');

  //   if (APICalled === 'true') {
  //     setBugFenderLog('Chat_Room_APICalled', APICalled);
  //     // stopCallAbondmentTimer();
  //     return;
  //   }

  //   console.log(APICalled, 'afterAPICalled endCallAppointmentSessionAPI');

  //   endCallSessionAppointment(client, appointmentData.id, status, REQUEST_ROLES.DOCTOR)
  //     .then(({ data }: any) => {
  //       console.log(data, 'data endCallAppointmentSessionAPI');
  //       setStatus(STATUS.COMPLETED);
  //       AsyncStorage.setItem('endAPICalled', 'true');
  //       // stopCallAbondmentTimer();
  //     })
  //     .catch((e) => {
  //       CommonBugFender('ChatRoom_endCallSessionAppointment', e);
  //       console.log('Error endCallAppointmentSessionAPI ', e);
  //     });
  // };

  const cancelAppointmentApi = () => {
    setLoading(true);
    const appointmentTransferInput = {
      appointmentId: appointmentData.id,
      cancelReason: '',
      cancelledBy: REQUEST_ROLES.DOCTOR, //appointmentDate,
      cancelledById: appointmentData.doctorId,
    };
    console.log(appointmentTransferInput, 'appointmentTransferInput');

    client
      .mutate<cancelAppointment, cancelAppointmentVariables>({
        mutation: CANCEL_APPOINTMENT,
        variables: {
          cancelAppointmentInput: appointmentTransferInput,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        setLoading(false);
        setSucessPopup(true);
        console.log(data, 'datacancel');
      })
      .catch((e: any) => {
        CommonBugFender('ChatRoom_cancelAppointmentApi', e);
        setLoading(false);
        console.log('Error occured while adding Doctor', e);
        const message = e.message ? e.message.split(':')[1].trim() : '';
        if (
          message == 'INVALID_APPOINTMENT_ID' ||
          message == 'JUNIOR_DOCTOR_CONSULTATION_INPROGRESS'
        ) {
          showAphAlert!({
            title: `Hi, ${(currentPatient && currentPatient.firstName) || ''} :)`,
            description: 'Ongoing / Completed appointments cannot be cancelled.',
          });
        }
      });
  };

  const requestReadSmsPermission = async () => {
    try {
      const resuts = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
      if (
        resuts[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log(resuts, 'WRITE_EXTERNAL_STORAGE');
      }
      if (
        resuts[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log(resuts, 'READ_EXTERNAL_STORAGE');
      }
      if (resuts) {
        console.log(resuts, 'READ_EXTERNAL_STORAGE');
      }
    } catch (error) {
      CommonBugFender('ChatRoom_requestReadSmsPermission_try', error);
      console.log('error', error);
    }
  };

  const updateSessionAPI = () => {
    console.log('apiCalled', apiCalled);

    if (!apiCalled) {
      console.log('createsession', appointmentData.id);
      const input = {
        appointmentId: appointmentData.id,
        requestRole: 'PATIENT',
      };

      console.log('input', input);

      CheckDoctorPresentInChat();

      // setDoctorJoined(true);
      setTextChange(true);

      setTimeout(() => {
        setApiCalled(true);
      }, 1000);

      // setTimeout(() => {
      //   setDoctorJoined(false);
      // }, 10000);

      client
        .mutate<updateAppointmentSession, updateAppointmentSessionVariables>({
          mutation: UPDATE_APPOINTMENT_SESSION,
          variables: {
            UpdateAppointmentSessionInput: input,
          },
        })
        .then((sessionInfo: any) => {
          console.log('createsession', sessionInfo);
          setsessionId(sessionInfo.data.updateAppointmentSession.sessionId);
          settoken(sessionInfo.data.updateAppointmentSession.appointmentToken);
        })
        .catch((e) => {
          CommonBugFender('ChatRoom_updateSessionAPI', e);
          console.log('Error occured while adding Doctor', e);
        });
    }
  };

  const CheckDoctorPresentInChat = () => {
    if (status === STATUS.COMPLETED) return; // no need to show join button if consultation has been completed

    pubnub
      .hereNow({
        channels: [channel],
        includeUUIDs: true,
      })
      .then((response: HereNowResponse) => {
        console.log('hereNowresponse', response);
        const data: any =
          response.channels &&
          response.channels[appointmentData.id] &&
          response.channels[appointmentData.id].occupants;
        const occupancyDoctor =
          data &&
          data.length > 0 &&
          data.filter((obj: any) => {
            return obj.uuid === 'DOCTOR' || obj.uuid.indexOf('DOCTOR_') > -1;
          });
        const occupancyJrDoctor =
          data &&
          data.length > 0 &&
          data.filter((obj: any) => {
            return obj.uuid === 'JUNIOR' || obj.uuid.indexOf('JUNIOR_') > -1;
          });
        if (occupancyJrDoctor && occupancyJrDoctor.length >= 1) {
          jrDoctorJoined.current = true;
        }
        if (occupancyDoctor && occupancyDoctor.length >= 1 && response.totalOccupancy >= 2) {
          jrDoctorJoined.current = false;
          setDoctorJoined(true);
          setDoctorJoinedChat && setDoctorJoinedChat(true);
          setTimeout(() => {
            setDoctorJoined(false);
          }, 10000);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const startInterval = (timer: number) => {
    setConsultStarted(true);
    intervalId = BackgroundTimer.setInterval(() => {
      timer = timer - 1;
      stoppedTimer = timer;
      setRemainingTime(timer);
      // console.log('descriptionTextStyle remainingTime', timer);

      if (timer == 0) {
        // console.log('descriptionTextStyles remainingTime', timer);
        setRemainingTime(0);
        BackgroundTimer.clearInterval(intervalId);
      }
    }, 1000);
  };

  const startTimer = (timer: number) => {
    timerId = BackgroundTimer.setInterval(() => {
      timer = timer + 1;
      stoppedTimer = timer;
      setCallTimer(timer);
      // console.log('uptimer', timer);

      if (timer == 0) {
        console.log('uptimer', timer);
        setCallTimer(0);
        BackgroundTimer.clearInterval(timerId);
      }
    }, 1000);
  };

  const stopTimer = () => {
    console.log('stopTimer', timerId);
    setCallTimer(0);
    timerId && BackgroundTimer.clearInterval(timerId);
  };

  const startJoinTimer = (timer: number) => {
    joinTimerId = BackgroundTimer.setInterval(() => {
      timer = timer + 1;
      stoppedTimer = timer;
      setJoinCounter(timer);
      // console.log('uptimer join', timer);
      if (timer === 30) {
        thirtySecondCall();
      } else if (timer === 90) {
        minuteCaller();
      } else if (timer > 100) {
        stopJoinTimer();
      }
      if (timer == 0) {
        // console.log('uptimer join', timer);
        setJoinCounter(0);
        BackgroundTimer.clearInterval(joinTimerId);
      }
    }, 1000);
  };

  const stopJoinTimer = () => {
    console.log('stopTimer join', joinTimerId);
    setJoinCounter(0);
    joinTimerId && BackgroundTimer.clearInterval(joinTimerId);
  };

  const stopInterval = () => {
    if (intervalId) {
      setConsultStarted(false);

      const stopTimer = 900 - stoppedTimer;
      setRemainingTime(stopTimer);
      intervalId && BackgroundTimer.clearInterval(intervalId);
    }
  };
  const setSnackBar = () => {
    setSnackbarState(true);
    setHandlerMessage('      Something went wrong!!  Trying to connect');
  };
  const setSessionReconnectMsg = () => {
    setSnackbarState(true);
    setHandlerMessage('There is a problem with network connection. Reconnecting, Please wait...');
  };
  const publisherEventHandlers = {
    streamCreated: (event: string) => {
      console.log('Publisher stream created!', event);
      stopSound();
    },
    streamDestroyed: (event: string) => {
      console.log('Publisher stream destroyed!', event);
      patientJoinedCall.current = false;
      subscriberConnected.current = false;
      endVoipCall();
    },
    error: (error: string) => {
      AsyncStorage.setItem('callDisconnected', 'true');
      setSnackBar();
      console.log(`There was an error with the publisherEventHandlers: ${JSON.stringify(error)}`);
    },
    otrnError: (error: string) => {
      AsyncStorage.setItem('callDisconnected', 'true');
      setSnackBar();
      console.log(`There was an error with the publisherEventHandlers: ${JSON.stringify(error)}`);
    },
  };

  const subscriberEventHandlers = {
    error: (error: string) => {
      setSnackBar();
      console.log(`There was an error with the subscriberEventHandlers: ${JSON.stringify(error)}`);
    },
    connected: (event: string) => {
      setSnackbarState(false);
      console.log('Subscribe stream connected!', event);
      subscriberConnected.current = true;
      stopSound();
    },
    disconnected: (event: string) => {
      // setSnackbarState(true);
      // setHandlerMessage('Falling back to audio due to bad network!!');
      console.log('Subscribe stream disconnected!', event);
      patientJoinedCall.current = false;
      subscriberConnected.current = false;
      endVoipCall();
    },
    otrnError: (error: string) => {
      setSnackBar();
      console.log(`There was an error with the subscriberEventHandlers: ${JSON.stringify(error)}`);
    },
    videoDisabled: (error: any) => {
      console.log(`videoDisabled subscriberEventHandlers: ${JSON.stringify(error)}`, error.reason);
      console.log('error.reason', error.reason, error.reason === 'quality');
      if (error.reason === 'quality') {
        setSnackbarState(true);
        setHandlerMessage('Falling back to audio due to bad network!!');
        setDowngradeToAudio(true);
      }
    },
    videoEnabled: (error: any) => {
      console.log(`videoEnabled: ${JSON.stringify(error)}`);
      if (error.reason === 'quality') {
        setSnackbarState(false);
        setDowngradeToAudio(false);
      }
    },
    videoDisableWarning: (error: string) => {
      // console.log(`videoDisableWarning subscriberEventHandlers: ${JSON.stringify(error)}`);
    },
    videoDisableWarningLifted: (error: string) => {
      // console.log(`videoDisableWarningLifted subscriberEventHandlers: ${JSON.stringify(error)}`);
    },
  };

  const sessionEventHandlers = {
    error: (error: OpentokError) => {
      AsyncStorage.setItem('callDisconnected', 'true');
      if (
        [
          'ConnectionDropped',
          'ConnectionFailed',
          'ConnectionRefused',
          'SessionStateFailed',
          'SessionConnectionTimeout',
          1022,
          1006,
          1023,
          1020,
          1021,
        ].includes(error.code)
      ) {
        eventsAfterConnectionDestroyed();
        setTimeout(() => {
          setSnackbarState(true);
          setHandlerMessage('Check the network connection.');
        }, 2050);
      } else {
        setSnackBar();
      }
      console.log(`There was an error with the sessionEventHandlers: ${JSON.stringify(error)}`);
    },
    connectionCreated: (event: string) => {
      setSnackbarState(false);
      console.log('session stream connectionCreated!', event);
    },
    connectionDestroyed: (event: string) => {
      setTimeout(() => {
        AsyncStorage.getItem('callDisconnected').then((data) => {
          if (!JSON.parse(data || 'false')) {
            setSnackbarState(true);
            setHandlerMessage('Call disconnected due to Network issues at the Doctor side');
          }
        });
      }, 2000);
      console.log('session stream connectionDestroyed!', event);
      eventsAfterConnectionDestroyed();
    },
    sessionConnected: (event: string) => {
      setSnackbarState(false);
      console.log('session stream sessionConnected!', event);
      KeepAwake.activate();
    },
    sessionDisconnected: (event: string) => {
      console.log('session stream sessionDisconnected!', event);
      eventsAfterConnectionDestroyed();
      // disconnectCallText();
    },
    sessionReconnected: (event: string) => {
      setSnackbarState(false);
      console.log('session stream sessionReconnected!', event);
      KeepAwake.activate();
    },
    sessionReconnecting: (event: string) => {
      console.log('session stream sessionReconnecting!', event);
      setSessionReconnectMsg();
      KeepAwake.activate();
    },
    signal: (event: string) => {
      console.log('session stream signal!', event);
    },
    streamCreated: (event: string) => {
      console.log('session streamCreated created!', event);
    },
    streamDestroyed: (event: string) => {
      console.log('session streamDestroyed destroyed!', event); // is called when the doctor network is disconnected
      eventsAfterConnectionDestroyed();
      // disconnectCallText();
    },
    streamPropertyChanged: (event: OptntokChangeProp) => {
      console.log('session streamPropertyChanged!', event); // is called when the doctor network is disconnected
      if (event.stream.name !== (g(currentPatient, 'firstName') || 'patient')) {
        setCallerAudio(event.stream.hasAudio);
        setCallerVideo(event.stream.hasVideo);
      }
    },
    otrnError: (error: string) => {
      AsyncStorage.getItem('callDisconnected').then((data) => {
        if (!JSON.parse(data || 'false')) {
          setSnackBar();
        }
      });
      AsyncStorage.setItem('callDisconnected', 'true');
      console.log(
        `There was an error with the otrnError sessionEventHandlers: ${JSON.stringify(error)}`
      );
    },
  };

  const eventsAfterConnectionDestroyed = () => {
    setIsCall(false);
    setIsAudioCall(false);
    stopTimer();
    setCallAccepted(false);
    setHideStatusBar(false);
    setConvertVideo(false);
    setDowngradeToAudio(false);
    KeepAwake.activate();
    setIsPublishAudio(true);
    setShowVideo(true);
    setCameraPosition('front');
    setChatReceived(false);
    setCallerAudio(true);
    setCallerVideo(true);
    setTimerStyles({
      position: 'absolute',
      marginHorizontal: 20,
      marginTop: isIphoneX() ? 91 : 81,
      width: width - 40,
      color: 'white',
      ...theme.fonts.IBMPlexSansSemiBold(12),
      textAlign: 'center',
      letterSpacing: 0.46,
      zIndex: 1005,
    });
  };

  const config: Pubnub.PubnubConfig = {
    origin: 'apollo.pubnubapi.com',
    subscribeKey: AppConfig.Configuration.PRO_PUBNUB_SUBSCRIBER,
    publishKey: AppConfig.Configuration.PRO_PUBNUB_PUBLISH,
    ssl: true,
    uuid: `PATIENT_${patientId}`,
    restore: true,
    keepAlive: true,
    heartbeatInterval: 20,
  };
  const pubnub = new Pubnub(config);

  useEffect(() => {
    console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];
    console.disableYellowBox = true;

    // AsyncStorage.removeItem('endAPICalled');  // APP-2803: removed No show logic

    pubnub.subscribe({
      channels: [channel],
      // withPresence: true,  // APP-2803: removed No show logic
    });

    getHistory(0);

    // registerForPushNotification();

    pubnub.addListener({
      status: (statusEvent) => {
        console.log('statusEvent', statusEvent);

        if (statusEvent.category === Pubnub.CATEGORIES.PNConnectedCategory) {
          console.log(statusEvent.category);
        } else if (statusEvent.operation === Pubnub.OPERATIONS.PNAccessManagerAudit) {
          console.log(statusEvent.operation);
        }
      },
      message: (message) => {
        // console.log('messageevent', message);]
        const messageType = g(message, 'message', 'message');
        console.log(`pubnub.addListener - ${messageType}`, { message });

        if (messageType == followupconsult) {
          // setStatus(STATUS.COMPLETED);  //Uncomment it if you are not getting the automated message
          postAppointmentWEGEvent(WebEngageEventName.PRESCRIPTION_RECEIVED);
        }
        if (messageType == stopConsultJr) {
          postAppointmentWEGEvent(WebEngageEventName.JD_COMPLETED);
        }
        if (messageType == startConsultMsg) {
          // Disc
          postAppointmentWEGEvent(WebEngageEventName.SD_CONSULTATION_STARTED);
        }
        if (messageType == videoCallMsg && name == 'DOCTOR') {
          postAppointmentWEGEvent(WebEngageEventName.SD_VIDEO_CALL_STARTED);
        }

        message &&
          message.message &&
          message.message.message &&
          message.message.message === '^^#startconsult' &&
          setname('DOCTOR');
        message &&
          message.message &&
          message.message.message &&
          message.message.message === '^^#startconsultJr' &&
          setname('JUNIOR');
        pubNubMessages(message);
      },
      // presence: (presenceEvent) => {    // APP-2803: removed No show logic

      //   // if (appointmentData.appointmentType === APPOINTMENT_TYPE.PHYSICAL) return;
      //   // console.log('presenceEvent', presenceEvent);

      //   dateIsAfter = moment(new Date()).isAfter(moment(appointmentData.appointmentDateTime));

      //   const diff = moment.duration(moment(appointmentData.appointmentDateTime).diff(new Date()));
      //   const diffInMins = diff.asMinutes();
      //   // console.log('diffInMins', diffInMins);

      //   pubnub
      //     .hereNow({
      //       channels: [channel],
      //       includeUUIDs: true,
      //     })
      //     .then((response: HereNowResponse) => {
      //       // console.log('hereNowresponse', response);

      //       const data: any = response.channels[appointmentData.id].occupants;

      //       const occupancyDoctor = data.filter((obj: any) => {
      //         return obj.uuid === 'DOCTOR' || obj.uuid.indexOf('DOCTOR_') > -1;
      //       });

      //       // const startConsultResult = insertText.filter((obj: any) => {
      //       //   return obj.message === startConsultMsg;
      //       // });
      //       // console.log('callAbondmentMethodoccupancyDoctor -------> ', occupancyDoctor);
      //       if (response.totalOccupancy >= 2) {
      //         setSendMessageToDoctor(false);

      //         // if (callAbandonmentStoppedTimer == 620) return;  // APP-2803: removed No show logic
      //         // if (callAbandonmentStoppedTimer < 620) {
      //         //   // console.log('calljoined');
      //         //   APIForUpdateAppointmentData(true);
      //         // }
      //       } else {
      //         if (response.totalOccupancy == 1 && occupancyDoctor.length == 0) {
      //           // console.log('abondmentStarted -------> ', abondmentStarted);
      //           setSendMessageToDoctor(true);

      //           // if (abondmentStarted == false) {         // APP-2803: removed No show logic
      //           //   if (startConsultResult.length > 0) {
      //           //     console.log('callAbondmentMethod', abondmentStarted);
      //           //   } else {
      //           //     if (diffInMins < 15) {
      //           //       // console.log('doctorNoshow', abondmentStarted);
      //           //       if (appointmentData.appointmentType !== APPOINTMENT_TYPE.PHYSICAL) {
      //           //         callAbondmentMethod(false);
      //           //       }
      //           //     }
      //           //   }
      //           //   eventsAfterConnectionDestroyed();
      //           // }
      //         }
      //       }
      //     })
      //     .catch((error) => {
      //       CommonBugFender('ChatRoom_PUBNUB_PRESENCE', error);
      //       console.log(error);
      //     });
      // },
    });

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', keyboardDidHide);

    return function cleanup() {
      console.log('didmount clean up chatroom');
      pubnub.unsubscribe({ channels: [channel] });
      pubnub.stop();
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      KeepAwake.deactivate();
      Platform.OS === 'android' && SoftInputMode.set(SoftInputMode.ADJUST_PAN);
      minuteTimer && clearTimeout(minuteTimer);
      thirtySecondTimer && clearTimeout(thirtySecondTimer);
      timerId && BackgroundTimer.clearInterval(timerId);
      intervalId && BackgroundTimer.clearInterval(intervalId);
      abondmentStarted = false;
      stopJoinTimer();
      // stopCallAbondmentTimer();
      try {
        AppState.removeEventListener('change', _handleAppStateChange);
        BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
      } catch (error) {
        CommonBugFender('ChatRoom_cleanup_try', error);
      }
    };
  }, []);

  const HereNowPubnub = (message: string) => {
    if (status !== STATUS.COMPLETED) return;

    pubnub
      .hereNow({
        channels: [channel],
        includeUUIDs: true,
      })
      .then((response: HereNowResponse) => {
        console.log('hereNowresponse', response);

        const data: any = response.channels[appointmentData.id].occupants;

        const occupancyDoctor = data.filter((obj: any) => {
          return obj.uuid === 'DOCTOR' || obj.uuid.indexOf('DOCTOR_') > -1;
        });

        console.log('callAbondmentMethodoccupancyDoctor -------> ', occupancyDoctor);
        if (response.totalOccupancy >= 2) {
          setSendMessageToDoctor(false);
        } else {
          if (response.totalOccupancy == 1 && occupancyDoctor.length == 0) {
            setSendMessageToDoctor(true);
            InsertMessageToDoctor(message);
          }
        }
      })
      .catch((error) => {
        CommonBugFender('ChatRoom_PUBNUB_PRESENCE', error);
        console.log(error);
      });
  };

  const [showDoctorNoShowAlert, setShowDoctorNoShowAlert] = useState<boolean>(false);

  // APP-2803: removed No show logic

  // const callAbondmentMethod = async (isSeniorConsultStarted: boolean) => {
  //   if (appointmentData.appointmentType === APPOINTMENT_TYPE.PHYSICAL) return;

  //   const startConsultJRResult = insertText.filter((obj: any) => {
  //     return obj.message === startConsultjr;
  //   });

  //   const stopConsultJRResult = insertText.filter((obj: any) => {
  //     return obj.message === stopConsultJr;
  //   });

  //   if (isSeniorConsultStarted) {
  //     console.log('callAbondmentMethod scenario');
  //     if (appointmentData.status === STATUS.COMPLETED) return;
  //     if (appointmentData.status === STATUS.NO_SHOW) return;
  //     if (appointmentData.status === STATUS.CALL_ABANDON) return;
  //     if (appointmentData.status === STATUS.CANCELLED) return;
  //     if (appointmentData.appointmentState === APPOINTMENT_STATE.AWAITING_RESCHEDULE) return;
  //     if (status === STATUS.COMPLETED) return;
  //   } else {
  //     console.log(
  //       'doctor no show scenario',
  //       startConsultJRResult.length,
  //       stopConsultJRResult.length,
  //       dateIsAfter,
  //       isSeniorConsultStarted
  //     );

  //     if (
  //       startConsultJRResult.length >= 0 &&
  //       stopConsultJRResult.length >= 0 &&
  //       dateIsAfter &&
  //       !isSeniorConsultStarted
  //     ) {
  //       if (appointmentData.status === STATUS.COMPLETED) return;
  //       if (appointmentData.status === STATUS.NO_SHOW) return;
  //       if (appointmentData.status === STATUS.CALL_ABANDON) return;
  //       if (appointmentData.status === STATUS.CANCELLED) return;
  //       if (appointmentData.appointmentState === APPOINTMENT_STATE.AWAITING_RESCHEDULE) return;
  //       if (status === STATUS.COMPLETED) return;
  //       if (callAbandonmentStoppedTimer < 620) return;

  //       const APICalled = await AsyncStorage.getItem('endAPICalled');

  //       if (APICalled === 'true') {
  //         setBugFenderLog('Chat_Room_NO_SHOW_DOCTOR', APICalled);
  //         setStatus(STATUS.COMPLETED);
  //         stopCallAbondmentTimer();
  //         return;
  //       }

  //       abondmentStarted = true;
  //       startCallAbondmentTimer(620, false);
  //     } else {
  //       abondmentStarted = false;
  //     }
  //   }
  // };

  // const startCallAbondmentTimer = (timer: number, isCallAbandment: boolean) => {
  //   try {
  //     startNoShow(timer, () => {
  //       console.log('Trigger no ShowAPi');
  //       setTransferData(appointmentData);

  //       if (isCallAbandment) {
  //       } else {
  //         setShowDoctorNoShowAlert(true);
  //         endCallAppointmentSessionAPI(STATUS.NO_SHOW);
  //       }
  //     });
  //   } catch (error) {
  //     CommonBugFender('ChatRoom_startCallAbondmentTimer_try', error);
  //     console.log('error in call abandoment', error);
  //   }
  // };

  // const startNoShow = (timer: number, callback?: () => void) => {
  //   stopCallAbondmentTimer();
  //   setTransferData(appointmentData);
  //   callAbandonmentTimer = BackgroundTimer.setInterval(() => {
  //     try {
  //       timer = timer - 1;
  //       callAbandonmentStoppedTimer = timer;

  //       console.log('callAbandonmentStoppedTimer', callAbandonmentStoppedTimer);
  //       if (timer < 1) {
  //         stopCallAbondmentTimer();
  //         callback && callback();
  //       }
  //     } catch (error) {
  //       CommonBugFender('ChatRoom_startCallAbondmentTimer_crash', error);
  //       stopCallAbondmentTimer();
  //     }
  //   }, 1000);
  // };

  // const stopCallAbondmentTimer = () => {
  //   console.log('stopCallAbondmentTimer', callAbandonmentTimer);
  //   callAbandonmentTimer && BackgroundTimer.clearInterval(callAbandonmentTimer);
  //   callAbandonmentStoppedTimer = 620;
  //   abondmentStarted = false;
  // };

  const APIForUpdateAppointmentData = (toStopTimer: boolean) => {
    getAppointmentDataDetails(client, appointmentData.id)
      .then(({ data }: any) => {
        try {
          console.log(data, 'data APIForUpdateAppointmentData');
          const appointmentSeniorDoctorStarted =
            data.data.getAppointmentData.appointmentsHistory[0].isSeniorConsultStarted;
          // console.log(
          //   appointmentSeniorDoctorStarted,
          //   data.data.getAppointmentData.appointmentsHistory[0],
          //   'appointmentSeniorDoctorStarted APIForUpdateAppointmentData'
          // );

          appointmentData = data.data.getAppointmentData.appointmentsHistory[0];
          console.log(appointmentData, 'appointmentData APIForUpdateAppointmentData');
          setStatus(data.data.getAppointmentData.appointmentsHistory[0].status);

          // APP-2803: removed No show logic

          // if (toStopTimer) {
          //   if (appointmentSeniorDoctorStarted) {
          //     stopCallAbondmentTimer();
          //     abondmentStarted = false;
          //   }
          // } else {
          //   if (appointmentData.appointmentType !== APPOINTMENT_TYPE.PHYSICAL) {
          //     callAbondmentMethod(appointmentSeniorDoctorStarted);
          //   }
          // }
        } catch (error) {
          CommonBugFender('ChatRoom_APIForUpdateAppointmentData_try', error);
        }
      })
      .catch((e) => {
        CommonBugFender('ChatRoom_APIForUpdateAppointmentData', e);
        abondmentStarted = false;
        console.log('Error APIForUpdateAppointmentData ', e);
      });
  };

  const registerForPushNotification = () => {
    console.log('registerForPushNotification:');
    if (Platform.OS === 'ios') {
      ExportDeviceToken.getPushNotificationToken(handlePushNotification);
    } else {
      handlePushNotification('');
    }
  };

  const handlePushNotification = async (deviceToken: string) => {
    console.log('Device Token Received', deviceToken);
    try {
      const fcmToken = (await AsyncStorage.getItem('deviceToken')) || '';
      const androidToken = fcmToken ? JSON.parse(fcmToken) : '';
      console.log('android:', androidToken.deviceToken);

      if (Platform.OS === 'ios') {
        pubnub.push.addChannels(
          {
            channels: [channel],
            device: deviceToken,
            pushGateway: 'apns',
          },
          (status: any) => {
            if (status.error) {
              console.log('operation failed w/ error:', status);
            } else {
              console.log('operation done!');
            }
          }
        );
        console.log('ios:', token);
        // Send iOS Notification from debug console: {"pn_apns":{"aps":{"alert":"Hello World."}}}
      } else {
        console.log('androidtoken:', token);
        pubnub.push.addChannels({
          channels: [channel],
          device: androidToken,
          pushGateway: 'gcm', // apns, gcm, mpns
        });
        // Send Android Notification from debug console: {"pn_gcm":{"data":{"message":"Hello World."}}}
      }
    } catch (error) {
      CommonBugFender('ChatRoom_handlePushNotification_try', error);
      console.log('ioserror:', error);
    }
  };

  let insertText: object[] = [];
  const newmessage: { message: string }[] = [];

  const getHistory = (timetoken: number) => {
    setLoading(true);
    pubnub.history(
      {
        channel: channel,
        reverse: true,
        count: 100000,
        stringifiedTimeToken: true,
        start: timetoken,
      },
      (status, res) => {
        try {
          const end: any = res.endTimeToken ? res.endTimeToken : 1;

          const msgs = res.messages;
          console.log('msgs', msgs);

          res.messages.forEach((element, index) => {
            let item = element.entry;
            if (item.prismId) {
              getPrismUrls(client, patientId, item.prismId)
                .then((data: any) => {
                  item.url = (data && data.urls[0]) || item.url;
                })
                .catch((e) => {
                  CommonBugFender('ChatRoom_getPrismUrls', e);
                });
            }
            newmessage[newmessage.length] = item;
          });
          // console.log('newmessage', newmessage);
          setLoading(false);

          if (messages.length !== newmessage.length) {
            if (newmessage[newmessage.length - 1].message === startConsultMsg) {
              jrDoctorJoined.current = false;
              updateSessionAPI();
              checkingAppointmentDates();
            }
            if (newmessage[newmessage.length - 1].message === startConsultjr) {
              jrDoctorJoined.current = true;
              updateSessionAPI();
              checkingAppointmentDates();
            }

            // console.log('newmessage', newmessage);
            if (msgs.length == 100) {
              console.log('hihihihihi');
              getHistory(end);
              return;
            }

            // setTimeout(() => {
            console.log('inserting');

            insertText = newmessage;
            setMessages(newmessage as []);
            checkAutomatedPatientText();
            checkForRescheduleMessage(newmessage);
            // }, 100);

            setTimeout(() => {
              flatListRef.current! && flatListRef.current!.scrollToEnd({ animated: true });
            }, 1000);
          } else {
            checkAutomatedPatientText();
          }
        } catch (error) {
          CommonBugFender('ChatRoom_getHistory_try', error);
          setLoading(false);
          console.log('error', error);
        }
      }
    );
  };

  const checkAutomatedPatientText = () => {
    const result = insertText.filter((obj: any) => {
      return obj.message === consultPatientStartedMsg;
    });
    const startConsultResult = insertText.filter((obj: any) => {
      return obj.message === startConsultMsg;
    });
    if (result.length === 0 && startConsultResult.length === 0) {
      automatedTextFromPatient();
    }
  };

  const successSteps = [
    'Let’s get you feeling better by following simple steps :)\n',
    '1. Answer some quick questions\n',
    '2. Connect with your doctor\n',
    '3. Get a prescription and meds, if necessary\n',
    '4. Chat with your doctor for 7 days\n\n',
    `A doctor from ${appointmentData.doctorInfo.displayName}’s team will join you shortly to collect your medical details. These details are essential for ${appointmentData.doctorInfo.displayName} to help you and will take around 3-5 minutes.`,
  ];

  const automatedTextFromPatient = () => {
    pubnub.publish(
      {
        channel: channel,
        message: {
          message: consultPatientStartedMsg,
          automatedText: successSteps,
          id: doctorId,
          isTyping: true,
          messageDate: new Date(),
        },
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {}
    );
  };

  useEffect(() => {
    if (appointmentData.isJdQuestionsComplete) {
      console.log({});
      requestToJrDoctor();
      checkNudgeScreenVisibility();
      // startJoinTimer(0);
      // thirtySecondCall();
      // minuteCaller();
    } else {
      setDisplayChatQuestions(true);
    }
  }, []);

  const thirtySecondCall = () => {
    if (jrDoctorJoined.current == false) {
      // console.log('Alert Shows After 30000 Seconds of Delay.');

      const result = insertText.filter((obj: any) => {
        // console.log('resultinsertText', obj.message);
        return obj.message === firstMessage;
      });

      const startConsultResult = insertText.filter((obj: any) => {
        // console.log('resultinsertText', obj.message);
        return obj.message === startConsultMsg;
      });

      const startConsultjrResult = insertText.filter((obj: any) => {
        // console.log('resultinsertText', obj.message);
        return obj.message === startConsultjr;
      });

      const jdThankyouResult = insertText.filter((obj: any) => {
        // console.log('resultinsertText', obj.message);
        return obj.message === jdThankyou;
      });

      const stopConsultjrResult = insertText.filter((obj: any) => {
        // console.log('resultinsertText', obj.message);
        return obj.message === stopConsultJr;
      });

      const languageQueueResult = insertText.filter((obj: any) => {
        // console.log('resultinsertText', obj.message);
        return obj.message === languageQue;
      });

      if (
        result.length === 0 &&
        startConsultResult.length === 0 &&
        startConsultjrResult.length === 0 &&
        jdThankyouResult.length === 0 &&
        stopConsultjrResult.length === 0 &&
        languageQueueResult.length === 0 &&
        !appointmentData.isJdQuestionsComplete &&
        jdCount > 0 &&
        isJdAllowed === true
      ) {
        // console.log('result.length ', result);
        pubnub.publish(
          {
            channel: channel,
            message: {
              message: firstMessage,
              automatedText: `Hi ${currentPatient &&
                currentPatient.firstName}, sorry to keep you waiting. ${
                appointmentData.doctorInfo.displayName
              }’s team is with another patient right now. Your consultation prep will start soon.`,
              id: doctorId,
              isTyping: true,
              messageDate: new Date(),
            },
            storeInHistory: true,
            sendByPost: true,
          },
          (status, response) => {}
        );
      } else {
        thirtySecondTimer && clearTimeout(thirtySecondTimer);
      }
    } else {
      thirtySecondTimer && clearTimeout(thirtySecondTimer);
    }
  };

  const minuteCaller = () => {
    if (jrDoctorJoined.current == false) {
      // console.log('Alert Shows After 60000 Seconds of Delay.');

      const result = insertText.filter((obj: any) => {
        // console.log('resultinsertText', obj.message);
        return obj.message === secondMessage;
      });

      const startConsultResult = insertText.filter((obj: any) => {
        // console.log('resultinsertText', obj.message);
        return obj.message === startConsultMsg;
      });

      const startConsultjrResult = insertText.filter((obj: any) => {
        // console.log('resultinsertText', obj.message);
        return obj.message === startConsultjr;
      });

      const jdThankyouResult = insertText.filter((obj: any) => {
        // console.log('resultinsertText', obj.message);
        return obj.message === jdThankyou;
      });

      const stopConsultjrResult = insertText.filter((obj: any) => {
        // console.log('resultinsertText', obj.message);
        return obj.message === stopConsultJr;
      });

      const languageQueueResult = insertText.filter((obj: any) => {
        // console.log('resultinsertText', obj.message);
        return obj.message === languageQue;
      });

      if (
        result.length === 0 &&
        startConsultResult.length === 0 &&
        startConsultjrResult.length === 0 &&
        jdThankyouResult.length === 0 &&
        stopConsultjrResult.length === 0 &&
        languageQueueResult.length === 0 &&
        !appointmentData.isJdQuestionsComplete &&
        jdCount > 0 &&
        isJdAllowed === true &&
        !!(textChange && !jrDoctorJoined.current) &&
        status !== STATUS.COMPLETED
      ) {
        // console.log('result.length ', result);
        pubnub.publish(
          {
            channel: channel,
            message: {
              message: secondMessage,
              automatedText: `Sorry, but all the members in ${appointmentData.doctorInfo.displayName}’s team are busy right now. We will send you a notification as soon as they are available for collecting your details`,
              id: doctorId,
              isTyping: true,
              messageDate: new Date(),
            },
            storeInHistory: true,
            sendByPost: true,
          },
          (status, response) => {}
        );
      } else {
        minuteTimer && clearTimeout(minuteTimer);
      }
    } else {
      minuteTimer && clearTimeout(minuteTimer);
    }
  };

  const checkingAppointmentDates = () => {
    try {
      const currentTime = moment(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").format(
        'YYYY-MM-DD HH:mm:ss'
      );

      const appointmentTime = moment
        .utc(appointmentData.appointmentDateTime)
        .format('YYYY-MM-DD HH:mm:ss');

      const diff = moment.duration(moment(appointmentTime).diff(currentTime));
      diffInHours = diff.asMinutes();
      console.log('duration', diffInHours);
      console.log('appointmentTime', appointmentTime);

      if (diffInHours > 0) {
      } else {
        diffInHours = diffInHours * 60;
        console.log('duration', diffInHours);

        const startingTime = 900 + diffInHours;
        console.log('startingTime', startingTime);

        if (startingTime > 0) {
          startInterval(startingTime);
        }
      }
    } catch (error) {
      CommonBugFender('ChatRoom_checkingAppointmentDates_try', error);
    }
  };

  const [showFeedback, setShowFeedback] = useState(false);
  const { showAphAlert, audioTrack, setPrevVolume, maxVolume } = useUIElements();
  const pubNubMessages = (message: Pubnub.MessageEvent) => {
    console.log('pubNubMessages', message.message.sentBy);
    if (message.message.isTyping) {
      if (message.message.message === audioCallMsg && !patientJoinedCall.current) {
        // if patient has not joined meeting room
        isAudio.current = true;
        setOnSubscribe(true);
        callhandelBack = false;
        // stopCallAbondmentTimer();
        playSound();
        !jrDoctorJoined.current && setDoctorJoinedChat && setDoctorJoinedChat(true);
      } else if (message.message.message === videoCallMsg && !patientJoinedCall.current) {
        // if patient has not joined meeting room
        setOnSubscribe(true);
        callhandelBack = false;
        isAudio.current = false;
        // stopCallAbondmentTimer();
        playSound();
        !jrDoctorJoined.current && setDoctorJoinedChat && setDoctorJoinedChat(true);
      } else if (message.message.message === startConsultMsg) {
        jrDoctorJoined.current = false;
        stopInterval();
        startInterval(timer);
        updateSessionAPI();
        checkingAppointmentDates();
        addMessages(message);
      } else if (message.message.message === stopConsultJr) {
        console.log('listener remainingTime', remainingTime);
        stopInterval();
        thirtySecondTimer && clearTimeout(thirtySecondTimer);
        minuteTimer && clearTimeout(minuteTimer);
        setConvertVideo(false);
        setDowngradeToAudio(false);
        addMessages(message);
        //setShowFeedback(true);
        // ************* SHOW FEEDBACK POUP ************* \\
      } else if (message.message.message === stopConsultMsg) {
        console.log('listener remainingTime', remainingTime);
        stopInterval();
        setConvertVideo(false);
        setDowngradeToAudio(false);
        setShowFeedback(true);
        abondmentStarted = false;
        APIForUpdateAppointmentData(true);
        setTextChange(false);
        try {
          Keyboard.dismiss();
        } catch (error) {}

        // ************* SHOW FEEDBACK POUP ************* \\
      } else if (
        message.message.message === 'Audio call ended' ||
        message.message.message === 'Video call ended'
      ) {
        AsyncStorage.setItem('callDisconnected', 'true');
        setOnSubscribe(false);
        callhandelBack = true;
        setIsCall(false);
        setIsAudioCall(false);
        stopSound();
        addMessages(message);
      } else if (message.message.message === covertVideoMsg) {
        console.log('covertVideoMsg', covertVideoMsg);
        setConvertVideo(true);
        // setDowngradeToAudio(false);
      } else if (message.message.message === covertAudioMsg) {
        console.log('covertVideoMsg', covertAudioMsg);
        setConvertVideo(false);
        // setDowngradeToAudio(false);
      } else if (message.message.message === consultPatientStartedMsg) {
        console.log('consultPatientStartedMsg');
        addMessages(message);
      } else if (message.message.message === startConsultjr) {
        console.log('succss1');
        jrDoctorJoined.current = true;
        updateSessionAPI();
        checkingAppointmentDates();
        stopJoinTimer();
        thirtySecondTimer && clearTimeout(thirtySecondTimer);
        minuteTimer && clearTimeout(minuteTimer);
        addMessages(message);
      } else if (message.message.message === doctorAutoResponse) {
        console.log('doctorAutoResponse');
        addMessages(message);
      } else if (message.message.message === imageconsult) {
        console.log('imageconsult');
        addMessages(message);
      } else if (message.message.message === firstMessage) {
        console.log('firstMessage');
        addMessages(message);
      } else if (message.message.message === secondMessage) {
        console.log('secondMessage');
        addMessages(message);
      } else if (message.message.message === languageQue) {
        console.log('languageQue');
        thirtySecondTimer && clearTimeout(thirtySecondTimer);
        minuteTimer && clearTimeout(minuteTimer);
        addMessages(message);
      } else if (message.message.message === jdThankyou) {
        console.log('jdThankyou');
        thirtySecondTimer && clearTimeout(thirtySecondTimer);
        minuteTimer && clearTimeout(minuteTimer);
        addMessages(message);
      } else if (message.message.message === cancelConsultInitiated) {
        console.log('cancelConsultInitiated');
        setShowPopup(true);
        // setTimeout(() => {
        // stopCallAbondmentTimer();
        // }, 1000);
      } else if (message.message.message === rescheduleConsultMsg) {
        console.log('rescheduleConsultMsg', message.message);
        checkForRescheduleMessage(message.message);
        // setTimeout(() => {
        // stopCallAbondmentTimer();
        // }, 1000);
        addMessages(message);
      } else if (message.message.message === callAbandonment) {
        console.log('callAbandonment');
        setShowCallAbandmentPopup(true);
      } else if (message.message.message === appointmentComplete) {
        setTextChange(false);
        setStatus(STATUS.COMPLETED);
        APIForUpdateAppointmentData(true);
        setDoctorJoinedChat && setDoctorJoinedChat(false);
        setDoctorJoined(false);
      } else if (message.message.message === leaveChatRoom) {
        setDoctorJoinedChat && setDoctorJoinedChat(false);
        setDoctorJoined(false);
      } else if (message.message.message === endCallMsg) {
        AsyncStorage.setItem('callDisconnected', 'true');
      } else if (message.message.message === exotelCall) {
        addMessages(message);
      }
    } else {
      console.log('succss');
      addMessages(message);
    }
  };

  const addMessages = (message: Pubnub.MessageEvent) => {
    console.log('addMessages', message);
    // console.log('startConsultjr', message.message.message);

    // if (message.message.id !== patientId) {
    //   stopCallAbondmentTimer();
    // }

    // const timeStamp = parseInt(message.timetoken) / parseInt('10000000');
    // console.log('timeStamp', timeStamp);

    // let dateObj = new Date(timeStamp * 1000);
    // let utcString = dateObj.toLocaleString();
    // console.log('utcString', utcString);

    insertText[insertText.length] = message.message;
    setMessages(() => [...(insertText as [])]);
    if (!isCall || !isAudioCall) {
      setChatReceived(true);
    }

    setTimeout(() => {
      flatListRef.current! &&
        flatListRef.current!.scrollToEnd({
          animated: false,
        });
    }, 300);
  };

  const checkForRescheduleMessage = (newmessage: any) => {
    // console.log('newmessage ', newmessage, newmessage.length);
    try {
      let result;

      if (newmessage.length > 1) {
        result = newmessage.filter((obj: any) => {
          // console.log('resultinsertText', obj.message);
          return obj.message === rescheduleConsultMsg;
        });
      } else {
        result = newmessage;
      }

      if (result) {
        console.log('checkForRescheduleMessage ', result);
        NextAvailableSlot(result[0] ? result[0] : result, 'Transfer', false);
      }
    } catch (error) {
      CommonBugFender('ChatRoom_checkForRescheduleMessage_try', error);
    }
  };

  const keyboardDidShow = (e: KeyboardEvent) => {
    setHeightList(
      isIphoneX()
        ? height - e.endCoordinates.height - 166
        : Platform.OS === 'ios'
        ? height - e.endCoordinates.height - 141
        : height - e.endCoordinates.height - 141
    );
    setDropDownBottomStyle(
      isIphoneX()
        ? height - e.endCoordinates.height - 200
        : Platform.OS === 'ios'
        ? height - e.endCoordinates.height - 190
        : height - e.endCoordinates.height
    );

    setTimeout(() => {
      flatListRef.current! && flatListRef.current!.scrollToEnd({ animated: false });
    }, 500);
  };

  const keyboardDidHide = () => {
    setHeightList(isIphoneX() ? height - 166 : Platform.OS === 'ios' ? height - 141 : height - 141);
    setDropDownBottomStyle(isIphoneX() ? 50 : 15);
  };

  const send = (textMessage: string) => {
    try {
      const text = {
        id: patientId,
        message: textMessage,
        messageDate: new Date(),
      };

      setMessageText('');

      pubnub.publish(
        {
          channel: channel,
          message: text,
          storeInHistory: true,
          sendByPost: true,
        },
        (status, response) => {
          if (status.statusCode == 200) {
            HereNowPubnub(textMessage);
            // InsertMessageToDoctor(textMessage);
          }
        }
      );
    } catch (error) {
      CommonBugFender('ChatRoom_send_try', error);
    }
  };

  let leftComponent = 0;
  let rightComponent = 0;

  const saveimageIos = (url: any) => {
    if (Platform.OS === 'ios') {
      Linking.openURL(url).catch((err) => console.error('An error occurred', err));
    }
  };

  const transferReschedule = (rowData: any, index: number) => {
    // console.log('transferReschedule', rowData);
    return (
      <>
        {rowData.message === transferConsultMsg ? (
          <View
            style={{
              backgroundColor: 'transparent',
              width: 282,
              borderRadius: 10,
              marginVertical: 2,
              alignSelf: 'center',
            }}
          >
            {leftComponent === 1 && (
              <View
                style={{
                  width: 32,
                  height: 32,
                  bottom: 0,
                  position: 'absolute',
                  left: 0,
                }}
              >
                <Mascot
                  style={{
                    width: 32,
                    height: 32,
                    bottom: 0,
                    position: 'absolute',
                    left: 0,
                  }}
                />
              </View>
            )}
            <View
              style={{
                backgroundColor: '#0087ba',
                width: 244,
                height: 354,
                borderRadius: 10,
                marginBottom: 4,
                marginLeft: 38,
                ...theme.viewStyles.shadowStyle,
                alignSelf: 'center',
              }}
            >
              <Text
                style={{
                  color: 'white',
                  ...theme.fonts.IBMPlexSansMedium(15),
                  lineHeight: 22,
                  paddingHorizontal: 16,
                  paddingTop: 12,
                }}
              >
                Your appointment has been transferred to —
              </Text>
              <View style={{ marginVertical: 12, marginHorizontal: 16 }}>
                <View
                  style={{
                    backgroundColor: 'white',
                    marginTop: 24,
                    marginHorizontal: 0,
                    borderRadius: 5,
                  }}
                >
                  <Text
                    style={{
                      color: '#02475b',
                      ...theme.fonts.IBMPlexSansMedium(18),
                      marginLeft: 12,
                      marginTop: 28,
                    }}
                  >
                    Dr. {rowData.transferInfo.doctorName}
                  </Text>
                  <Text
                    style={{
                      color: '#0087ba',
                      ...theme.fonts.IBMPlexSansSemiBold(12),
                      marginLeft: 12,
                      marginTop: 4,
                      letterSpacing: 0.3,
                    }}
                  >
                    {rowData.transferInfo.specilty} | {rowData.transferInfo.experience} YR
                    {Number(rowData.transferInfo.experience) > 1 ? 'S' : ''}
                  </Text>
                  <View
                    style={{
                      marginHorizontal: 12,
                      marginTop: 12,
                      backgroundColor: '#02475b',
                      opacity: 0.3,
                      height: 1,
                    }}
                  />
                  <Text
                    style={{
                      marginHorizontal: 12,
                      marginTop: 11,
                      ...theme.fonts.IBMPlexSansMedium(14),
                      lineHeight: 20,
                      color: '#02475b',
                    }}
                  >
                    {moment
                      .utc(rowData.transferInfo.transferDateTime)
                      .local()
                      .format('Do MMMM, dddd \nhh:mm A')}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      CommonLogEvent(AppRoutes.ChatRoom, 'navigate to choose doctor');
                      props.navigation.navigate(AppRoutes.ChooseDoctor, {
                        data: rowData.transferInfo,
                        patientId: patientId,
                      });
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'left',
                        color: '#fc9916',
                        ...theme.fonts.IBMPlexSansBold(13),
                        lineHeight: 24,
                        marginHorizontal: 12,
                        marginTop: 16,
                        marginBottom: 12,
                      }}
                    >
                      CHOOSE ANOTHER DOCTOR
                    </Text>
                  </TouchableOpacity>
                </View>
                {rowData.transferInfo.photoUrl && rowData.transferInfo.photoUrl.match(urlRegEx) ? (
                  <Image
                    source={{ uri: rowData.transferInfo.photoUrl }}
                    style={{
                      position: 'absolute',
                      width: 48,
                      height: 48,
                      top: 0,
                      right: 12,
                    }}
                  />
                ) : (
                  <DoctorImage
                    style={{
                      position: 'absolute',
                      width: 48,
                      height: 48,
                      top: 0,
                      right: 12,
                    }}
                  />
                )}
              </View>
              <StickyBottomComponent
                style={{
                  paddingHorizontal: 0,
                  backgroundColor: 'transparent',
                  shadowColor: 'transparent',
                }}
              >
                <Button
                  title={'RESCHEDULE'}
                  style={{
                    flex: 0.6,
                    marginLeft: 16,
                    marginRight: 5,
                    backgroundColor: '#0087ba',
                    borderWidth: 2,
                    borderColor: '#fcb715',
                  }}
                  titleTextStyle={{ color: 'white' }}
                  onPress={() => {
                    CommonLogEvent(AppRoutes.ChatRoom, 'Chat reschedule clicked');

                    try {
                      NextAvailableSlot(rowData, 'Transfer', false);
                      setTransferData(rowData.transferInfo);
                      setTimeout(() => {
                        flatListRef.current! &&
                          flatListRef.current!.scrollToEnd({ animated: true });
                      }, 200);
                    } catch (error) {
                      CommonBugFender('ChatRoom_RESCHEDULE_try', error);
                    }
                  }}
                />

                <Button
                  title={'ACCEPT'}
                  style={{ flex: 0.4, marginRight: 16, marginLeft: 5 }}
                  onPress={() => {
                    CommonLogEvent(AppRoutes.ChatRoom, 'Chat accept transfer clicked');

                    try {
                      const datettimeval = rowData.transferInfo.transferDateTime;
                      const transferdataid = rowData.transferInfo.transferId;

                      const appointmentTransferInput: BookTransferAppointmentInput = {
                        patientId: patientId,
                        doctorId: rowData.transferInfo.doctorId,
                        appointmentDateTime: datettimeval, //rowData.transferInfo.transferDateTime, //appointmentDate,
                        existingAppointmentId: channel,
                        transferId: transferdataid, //rowData.transferInfo.transferId,
                      };
                      console.log(appointmentTransferInput, 'AcceptApi Input');

                      transferAppointmentAPI(rowData, appointmentTransferInput);
                    } catch (error) {
                      CommonBugFender('ChatRoom_ACCEPT_try', error);
                    }
                  }}
                />
              </StickyBottomComponent>
            </View>
            {checkReschudule && reschduleLoadView(rowData, index, 'Transfer')}
          </View>
        ) : (
          <>
            {rowData.message === rescheduleConsultMsg ? (
              <View>{checkReschudule && reschduleLoadView(rowData, index, 'Reschedule')}</View>
            ) : (
              <View>{followUpView(rowData, index, 'Followup')}</View>
            )}
          </>
        )}
      </>
    );
  };

  const followUpView = (rowData: any, index: number, type: string) => {
    // console.log('followUpView', rowData);

    return (
      <>
        <View
          style={{
            backgroundColor: 'transparent',
            width: 282,
            borderRadius: 10,
            marginVertical: 2,
            alignSelf: 'flex-start',
          }}
        >
          {leftComponent === 1 && (
            <View
              style={{
                width: 32,
                height: 32,
                bottom: 0,
                position: 'absolute',
                left: 0,
              }}
            >
              <Mascot
                style={{
                  width: 32,
                  height: 32,
                  bottom: 0,
                  position: 'absolute',
                  left: 0,
                }}
              />
            </View>
          )}
          <View
            style={{
              width: 244,
              // height: 176,
              backgroundColor: '#0087ba',
              marginLeft: 38,
              borderRadius: 10,
              // marginTop: 16,
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                marginHorizontal: 16,
                marginTop: 12,
                color: 'white',
                lineHeight: 22,
                ...theme.fonts.IBMPlexSansMedium(15),
              }}
            >
              {`Hello ${userName},\nHope your consultation went well. Here is your prescription. View and order medicines now`}
            </Text>
            <StickyBottomComponent
              style={{
                paddingHorizontal: 0,
                marginBottom: 4,
                backgroundColor: 'transparent',
                shadowColor: 'transparent',
              }}
            >
              {/* <Button
                title={'DOWNLOAD'}
                style={{
                  flex: 0.5,
                  marginLeft: 16,
                  marginRight: 5,
                  backgroundColor: '#0087ba',
                  borderWidth: 2,
                  borderColor: '#fcb715',
                }}
                titleTextStyle={{ color: 'white' }}
                onPress={() => {
                  try {
                    postAppointmentWEGEvent(WebEngageEventName.DOWNLOAD_PRESCRIPTION);
                    CommonLogEvent(AppRoutes.ChatRoom, 'PDF Url');
                    console.log('pdf url', rowData.transferInfo && rowData.transferInfo.pdfUrl);

                    let dirs = RNFetchBlob.fs.dirs;
                    console.log('dirs', dirs);
                    if (Platform.OS == 'ios') {
                    }
                    let fileName: string =
                      rowData.transferInfo &&
                      rowData.transferInfo.pdfUrl &&
                      rowData.transferInfo.pdfUrl.split('/').pop();
                    fileName = fileName.substring(0, fileName.indexOf('.pdf')) + '.pdf';
                    console.log(
                      'pdf downloadDest',
                      rowData.transferInfo &&
                        rowData.transferInfo.pdfUrl &&
                        rowData.transferInfo.pdfUrl.split('/').pop()
                    );
                    const downloadPath =
                      Platform.OS === 'ios'
                        ? (dirs.DocumentDir || dirs.MainBundleDir) +
                          '/' +
                          (fileName || 'Apollo_Prescription.pdf')
                        : dirs.DownloadDir + '/' + (fileName || 'Apollo_Prescription.pdf');
                    setLoading(true);
                    RNFetchBlob.config({
                      fileCache: true,
                      path: downloadPath,
                      addAndroidDownloads: {
                        title: fileName,
                        useDownloadManager: true,
                        notification: true,
                        mime: mimeType(downloadPath),
                        path: downloadPath,
                        description: 'File downloaded by download manager.',
                      },
                    })
                      .fetch('GET', rowData.transferInfo.pdfUrl, {
                        //some headers ..
                      })
                      .then((res: any) => {
                        setLoading(false);
                        // the temp file path
                        console.log('The file saved to res ', res);
                        console.log('The file saved to ', res.path());
                        // saveimageIos(rowData.transferInfo.pdfUrl);
                        // RNFetchBlob.android.actionViewIntent(res.path(), 'application/pdf');
                        // RNFetchBlob.ios.openDocument(res.path());
                        // if (Platform.OS === 'android') {
                        //   Alert.alert('Download Complete');
                        // }
                        Platform.OS === 'ios'
                          ? RNFetchBlob.ios.previewDocument(res.path())
                          : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
                      })
                      .catch((err: Error) => {
                        CommonBugFender('ChatRoom_DOWNLOAD_PRESS', err);
                        console.log('error ', err);
                        setLoading(false);
                        // ...
                      });
                  } catch (error) {
                    CommonBugFender('ChatRoom_DOWNLOAD_PRESS_try', error);
                  }
                }}
              /> */}

              <Button
                title={'VIEW PRESCRIPTION'}
                style={{ flex: 1, marginRight: 16, marginLeft: 16 }}
                onPress={() => {
                  try {
                    postAppointmentWEGEvent(
                      WebEngageEventName.VIEW_PRESCRIPTION_IN_CONSULT_DETAILS
                    );
                    CommonLogEvent(AppRoutes.ChatRoom, 'Navigate to consult details');

                    console.log('Followupdata', rowData.transferInfo.caseSheetId);
                    console.log('rowdata', rowData);
                    props.navigation.navigate(AppRoutes.ConsultDetails, {
                      CaseSheet: rowData.transferInfo.appointmentId,
                      DoctorInfo: rowData.transferInfo.doctorInfo,
                      PatientId: appointmentData.patientId,
                      appointmentType: appointmentData.appointmentType,
                      DisplayId: '',
                      BlobName:
                        rowData.transferInfo &&
                        rowData.transferInfo.pdfUrl &&
                        rowData.transferInfo.pdfUrl.split('/').pop(),
                    });
                  } catch (error) {
                    CommonBugFender('ChatRoom_VIEW_try', error);
                  }
                }}
              />
            </StickyBottomComponent>
            <Text
              style={{
                color: '#ffffff',
                marginLeft: 27,
                textAlign: 'right',
                ...theme.fonts.IBMPlexSansMedium(10),
                lineHeight: 24,
                letterSpacing: 0.04,
                marginTop: 50,
                marginRight: 16,
              }}
            >
              {convertChatTime(rowData)}
            </Text>
          </View>
          {rowData.transferInfo.folloupDateTime.length == 0 ? null : (
            <View
              style={{
                width: 244,
                height: 206,
                backgroundColor: '#0087ba',
                marginLeft: 38,
                borderRadius: 10,
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  lineHeight: 22,
                  ...theme.fonts.IBMPlexSansMedium(15),
                  textAlign: 'left',
                  marginHorizontal: 16,
                  marginTop: 12,
                }}
              >
                I’ve also scheduled a{' '}
                <Text
                  style={{
                    color: 'white',
                    lineHeight: 22,
                    ...theme.fonts.IBMPlexSansBold(15),
                    textAlign: 'left',
                  }}
                >
                  free follow-up{' '}
                </Text>
                <Text
                  style={{
                    color: 'white',
                    lineHeight: 22,
                    ...theme.fonts.IBMPlexSansMedium(15),
                    textAlign: 'left',
                  }}
                >
                  for you —
                </Text>
              </Text>
              <View
                style={{
                  marginHorizontal: 16,
                  marginTop: 9,
                  opacity: 0.5,
                  height: 2,
                  borderStyle: 'dashed',
                  borderWidth: 1,
                  borderRadius: 1,
                  borderColor: '#ffffff',
                  overflow: 'hidden',
                }}
              />
              <Text
                style={{
                  marginHorizontal: 16,
                  marginTop: 9,
                  lineHeight: 22,
                  ...theme.fonts.IBMPlexSansSemiBold(15),
                  color: 'white',
                }}
              >
                {moment(rowData.transferInfo.folloupDateTime).format('Do MMMM, dddd \nhh:mm A')}
              </Text>
              <View
                style={{
                  marginHorizontal: 16,
                  marginTop: 10,
                  opacity: 0.5,
                  height: 2,
                  borderStyle: 'dashed',
                  borderWidth: 1,
                  borderRadius: 1,
                  borderColor: '#ffffff',
                  overflow: 'hidden',
                }}
              />
              <StickyBottomComponent
                style={{
                  paddingHorizontal: 0,
                  backgroundColor: 'transparent',
                  shadowColor: 'transparent',
                  paddingTop: 13,
                }}
              >
                <Button
                  title={'RESCHEDULE'}
                  style={{
                    flex: 0.5,
                    marginLeft: 16,
                    marginRight: 5,
                    backgroundColor: '#0087ba',
                    borderWidth: 2,
                    borderColor: '#fcb715',
                  }}
                  titleTextStyle={{ color: 'white' }}
                  onPress={() => {
                    CommonLogEvent(AppRoutes.ChatRoom, 'Chat reschedule follow up');

                    console.log('Button Clicked');
                    NextAvailableSlot(rowData, 'Followup', false);
                    setTransferData(rowData.transferInfo);
                    setTimeout(() => {
                      flatListRef.current! && flatListRef.current!.scrollToEnd({ animated: true });
                    }, 200);
                  }}
                />
              </StickyBottomComponent>
              <Text
                style={{
                  color: '#ffffff',
                  marginLeft: 27,
                  textAlign: 'right',
                  ...theme.fonts.IBMPlexSansMedium(10),
                  lineHeight: 24,
                  letterSpacing: 0.04,
                  marginTop: 50,
                  marginRight: 16,
                }}
              >
                {convertChatTime(rowData)}
              </Text>
            </View>
          )}
          {/* {checkReschudule && reschduleLoadView(rowData, index, 'Followup')} */}
        </View>
      </>
    );
  };

  const reschduleLoadView = (rowData: any, index: number, type: string) => {
    // console.log('reschduleLoadView', rowData);
    return (
      <>
        <View
          style={{
            backgroundColor: 'transparent',
            width: 282,
            borderRadius: 10,
            marginVertical: 2,
            alignSelf: 'flex-start',
          }}
        >
          {leftComponent === 1 && (
            <View
              style={{
                width: 32,
                height: 32,
                bottom: 0,
                position: 'absolute',
                left: 0,
              }}
            >
              <Mascot
                style={{
                  width: 32,
                  height: 32,
                  bottom: 0,
                  position: 'absolute',
                  left: 0,
                }}
              />
            </View>
          )}
          <View
            style={{
              width: 244,
              // height: 130,
              backgroundColor: '#0087ba',
              marginLeft: 38,
              borderRadius: 10,
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                lineHeight: 22,
                color: 'white',
                ...theme.fonts.IBMPlexSansMedium(15),
                paddingHorizontal: 16,
                paddingTop: 12,
              }}
            >
              {
                // newRescheduleCount && newRescheduleCount!.rescheduleCount < 3
                //   ? `We’re sorry that you have to reschedule. You can reschedule up to ${newRescheduleCount} times for free.`
                //   :
                "We're sorry that doctor is not available and you have to reschedule this appointment, however you can reschedule it for free."
                // : `Since you hace already rescheduled 3 times with ${appointmentData.doctorInfo.displayName}, we will consider this a new paid appointment.`
              }
            </Text>
            <Text
              style={{
                color: '#ffffff',
                marginLeft: 27,
                textAlign: 'right',
                ...theme.fonts.IBMPlexSansMedium(10),
                lineHeight: 24,
                letterSpacing: 0.04,
                marginTop: 0,
                marginRight: 16,
              }}
            >
              {convertChatTime(rowData)}
            </Text>
          </View>
          <View
            style={{
              width: 244,
              height: 235,
              backgroundColor: '#0087ba',
              marginLeft: 38,
              borderRadius: 10,
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                color: 'white',
                lineHeight: 22,
                ...theme.fonts.IBMPlexSansMedium(15),
                textAlign: 'left',
                marginHorizontal: 16,
                marginTop: 12,
              }}
            >
              {appointmentData.doctorInfo.displayName} has suggested the below slot for rescheduling
              this appointment
              {/* Next slot for {appointmentData.doctorInfo.displayName} is available on — */}
            </Text>
            <View
              style={{
                marginHorizontal: 16,
                marginTop: 9,
                opacity: 0.5,
                height: 2,
                borderStyle: 'dashed',
                borderWidth: 1,
                borderRadius: 1,
                borderColor: '#ffffff',
                overflow: 'hidden',
              }}
            />
            <Text
              style={{
                marginHorizontal: 16,
                marginTop: 9,
                lineHeight: 22,
                ...theme.fonts.IBMPlexSansSemiBold(15),
                color: 'white',
              }}
            >
              {moment(
                type === 'Followup'
                  ? rowData.transferInfo.folloupDateTime
                  : rowData.transferInfo.transferDateTime
              ).format('Do MMMM, dddd \nhh:mm A')}

              {/* {moment(nextSlotAvailable).format('Do MMMM, dddd \nhh:mm a')} */}
              {/* {moment(rowData.transferDateTime ? rowData.transferDateTime : nextSlotAvailable).format('Do MMMM, dddd \nhh:mm a')} */}
            </Text>
            <View
              style={{
                marginHorizontal: 16,
                marginTop: 10,
                opacity: 0.5,
                height: 2,
                borderStyle: 'dashed',
                borderWidth: 1,
                borderRadius: 1,
                borderColor: '#ffffff',
                overflow: 'hidden',
              }}
            />
            <StickyBottomComponent
              style={{
                paddingHorizontal: 0,
                backgroundColor: 'transparent',
                shadowColor: 'transparent',
                paddingTop: 3,
              }}
            >
              <Button
                title={'CHANGE SLOT'}
                // disabled={disAllowReschedule}
                disabledStyle={{
                  backgroundColor: '#0087ba',
                  opacity: 0.8,
                }}
                style={{
                  flex: 0.6,
                  marginLeft: 16,
                  marginRight: 5,
                  backgroundColor: '#0087ba',
                  borderWidth: 2,
                  borderColor: '#fcb715',
                }}
                titleTextStyle={{ color: 'white' }}
                onPress={() => {
                  if (type === 'Followup' || type === 'Reschedule') {
                    CommonLogEvent(AppRoutes.ChatRoom, 'Display Overlay');
                    rescheduleInitiatedBy = REQUEST_ROLES.PATIENT;
                    setTransferData(rowData.transferInfo);
                    setdisplayoverlay(true);
                  } else {
                    // props.navigation.navigate(AppRoutes.DoctorDetails, {
                    //   doctorId: rowData.transferInfo.doctorInfo.id,
                    //   PatientId: patientId,
                    //   appointmentType: appointmentData.appointmentType,
                    //   appointmentId: appointmentData.id,
                    //   showBookAppointment: true,
                    // });
                  }
                }}
              />
              <Button
                title={'ACCEPT'}
                // disabled={disAllowReschedule}
                style={{
                  flex: 0.4,
                  marginRight: 16,
                  marginLeft: 5,
                }}
                onPress={() => {
                  try {
                    CommonLogEvent(AppRoutes.ChatRoom, 'Accept button clicked');

                    if (type === 'Followup') {
                      const bookRescheduleInput = {
                        appointmentId: rowData.transferInfo.appointmentId,
                        doctorId: rowData.transferInfo.transferDateTime
                          ? rowData.transferInfo.doctorInfo.id
                          : rowData.transferInfo.doctorId,
                        newDateTimeslot: rowData.transferInfo.folloupDateTime,
                        initiatedBy: TRANSFER_INITIATED_TYPE.PATIENT,
                        initiatedId: patientId,
                        patientId: patientId,
                        rescheduledId: '',
                      };
                      console.log('bookRescheduleInput', bookRescheduleInput);
                      rescheduleAPI(rowData, bookRescheduleInput);
                    } else if (type === 'Reschedule') {
                      const bookRescheduleInput = {
                        appointmentId: rowData.transferInfo.appointmentId,
                        doctorId: rowData.transferInfo.transferDateTime
                          ? rowData.transferInfo.doctorInfo.id
                          : rowData.transferInfo.doctorId,
                        newDateTimeslot: rowData.transferInfo.transferDateTime,
                        initiatedBy: TRANSFER_INITIATED_TYPE.DOCTOR,
                        initiatedId: patientId,
                        patientId: patientId,
                        rescheduledId: rowData.transferInfo.reschduleId,
                      };
                      console.log('bookRescheduleInput', bookRescheduleInput);
                      rescheduleAPI(rowData, bookRescheduleInput);
                    } else {
                      const datettimeval = rowData.transferInfo.transferDateTime;
                      const transferdataid = rowData.transferInfo.transferId;

                      const appointmentTransferInput: BookTransferAppointmentInput = {
                        patientId: patientId,
                        doctorId: rowData.transferInfo.doctorId,
                        appointmentDateTime: datettimeval, //rowData.transferInfo.transferDateTime, //appointmentDate,
                        existingAppointmentId: channel,
                        transferId: transferdataid, //rowData.transferInfo.transferId,
                      };
                      console.log(appointmentTransferInput, 'AcceptApi Input');

                      transferAppointmentAPI(rowData, appointmentTransferInput);
                    }
                  } catch (error) {
                    CommonBugFender('ChatRoom_ACCEPT2_try', error);
                  }
                }}
              />
            </StickyBottomComponent>
            <Text
              style={{
                color: '#ffffff',
                marginLeft: 27,
                textAlign: 'right',
                ...theme.fonts.IBMPlexSansMedium(10),
                lineHeight: 24,
                letterSpacing: 0.04,
                marginTop: 55,
                marginRight: 16,
              }}
            >
              {convertChatTime(rowData)}
            </Text>
          </View>
        </View>
      </>
    );
  };

  const openPopUp = (rowData: any) => {
    setLoading(true);
    if (rowData.url.match(/\.(pdf)$/) || rowData.fileType === 'pdf') {
      if (rowData.prismId) {
        getPrismUrls(client, patientId, rowData.prismId)
          .then((data: any) => {
            setUrl((data && data.urls[0]) || rowData.url);
          })
          .catch((e) => {
            CommonBugFender('ChatRoom_OPEN_PDF', e);
            setUrl(rowData.url);
          })
          .finally(() => {
            setLoading(false);
            setShowPDF(true);
          });
      } else {
        setUrl(rowData.url);
        setLoading(false);
        setShowPDF(true);
      }
    } else if (rowData.url.match(/\.(jpeg|jpg|gif|png|jfif)$/) || rowData.fileType === 'image') {
      if (rowData.prismId) {
        getPrismUrls(client, patientId, rowData.prismId)
          .then((data: any) => {
            setUrl((data && data.urls[0]) || rowData.url);
          })
          .catch((e) => {
            CommonBugFender('ChatRoom_OPEN_IMAGE', e);
            setUrl(rowData.url);
          })
          .finally(() => {
            setLoading(false);
            setPatientImageshow(true);
          });
      } else {
        setUrl(rowData.url);
        setLoading(false);
        setPatientImageshow(true);
      }
    } else {
      if (rowData.prismId) {
        getPrismUrls(client, patientId, rowData.prismId)
          .then((data: any) => {
            console.log(data, 'finaldata');

            setUrl(rowData.url);
            setLoading(false);
            setPatientImageshow(true);
            // Linking.openURL((data && data.urls[0]) || rowData.url).catch((err) =>
            // console.error('An error occurred', err)
            // );
          })
          .catch(() => {
            setUrl(rowData.url);
            setLoading(false);
            setPatientImageshow(true);
            //Linking.openURL(rowData.url).catch((err) => console.error('An error occurred', err));
          })
          .finally(() => {
            setLoading(false);
            setPatientImageshow(true);
          });
      } else {
        setUrl(rowData.url);
        setLoading(false);
        setPatientImageshow(true);
        // Linking.openURL(rowData.url).catch((err) => console.error('An error occurred', err));
      }
    }
  };

  const messageView = (rowData: any, index: number) => {
    return (
      <View
        style={{
          backgroundColor: 'transparent',
          width: rowData.message !== null ? 282 : 0,
          borderRadius: 10,
          marginVertical: 2,
          // alignSelf: 'flex-start',
        }}
      >
        {leftComponent === 1 && (
          <View
            style={{
              width: 32,
              height: 32,
              bottom: 0,
              position: 'absolute',
              left: 0,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            {appointmentData.doctorInfo.thumbnailUrl &&
            appointmentData.doctorInfo.thumbnailUrl.match(urlRegEx) ? (
              <Image
                source={{ uri: appointmentData.doctorInfo.thumbnailUrl }}
                resizeMode={'contain'}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                }}
              />
            ) : (
              <DoctorPlaceholderImage
                style={{
                  width: 32,
                  height: 32,
                  bottom: 0,
                  position: 'absolute',
                  left: 0,
                }}
              />
            )}
          </View>
        )}
        <View>
          {rowData.message === imageconsult ? (
            <View>
              {rowData.url.match(/\.(jpeg|jpg|gif|png|jfif)$/) || rowData.fileType === 'image' ? (
                <TouchableOpacity
                  onPress={() => {
                    console.log('IMAGE', rowData.url);
                    openPopUp(rowData);
                  }}
                  activeOpacity={1}
                >
                  <View
                    style={{
                      backgroundColor: 'transparent',
                      width: 180,
                      height: 180,
                      borderRadius: 10,
                      marginVertical: 2,
                      marginBottom: 4,
                      flex: 1,
                      marginLeft: 38,
                    }}
                  >
                    <Image
                      placeholderStyle={{
                        height: 180,
                        width: '100%',
                        alignItems: 'center',
                        backgroundColor: 'transparent',
                      }}
                      PlaceholderContent={<Spinner style={{ backgroundColor: 'transparent' }} />}
                      source={{ uri: rowData.url }}
                      style={{
                        resizeMode: 'stretch',
                        width: 180,
                        height: 180,
                        borderRadius: 10,
                      }}
                    />
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    console.log('pdf', rowData.url);
                    openPopUp(rowData);
                    // setShowWeb(true);
                    // setPatientImageshow(true);
                  }}
                >
                  <View
                    style={{
                      backgroundColor: 'transparent',
                      width: 180,
                      height: 180,
                      borderRadius: 10,
                      marginVertical: 2,
                      marginBottom: 4,
                      flex: 1,
                      marginLeft: 38,
                    }}
                  >
                    <FileBig
                      style={{
                        resizeMode: 'stretch',
                        width: 200,
                        height: 200,
                        borderRadius: 10,
                      }}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ) : rowData.message === '^^#startconsultJr' ? (
            <View
              style={{
                backgroundColor: '#0087ba',
                marginLeft: 38,
                borderRadius: 10,
              }}
            >
              {rowData.automatedText ? (
                <>
                  <Text
                    style={{
                      color: '#ffffff',
                      paddingTop: 8,
                      paddingBottom: 4,
                      paddingHorizontal: 16,
                      ...theme.fonts.IBMPlexSansMedium(15),
                      textAlign: 'left',
                    }}
                  >
                    {rowData.automatedText}
                  </Text>
                  <Text
                    style={{
                      color: '#ffffff',
                      paddingHorizontal: 16,
                      paddingVertical: 4,
                      textAlign: 'right',
                      ...theme.fonts.IBMPlexSansMedium(10),
                    }}
                  >
                    {convertChatTime(rowData)}
                  </Text>
                  <View style={{ backgroundColor: 'transparent', height: 4, width: 20 }} />
                </>
              ) : null}
            </View>
          ) : rowData.message === '^^#startconsult' ? (
            <View
              style={{
                backgroundColor: '#0087ba',
                marginLeft: 38,
                borderRadius: 10,
              }}
            >
              {rowData.automatedText ? (
                <>
                  <Text
                    style={{
                      color: '#ffffff',
                      paddingTop: 8,
                      paddingBottom: 4,
                      paddingHorizontal: 16,
                      ...theme.fonts.IBMPlexSansMedium(15),
                      textAlign: 'left',
                    }}
                  >
                    {rowData.automatedText}
                  </Text>
                  <Text
                    style={{
                      color: '#ffffff',
                      paddingHorizontal: 16,
                      paddingVertical: 4,
                      textAlign: 'right',
                      ...theme.fonts.IBMPlexSansMedium(10),
                    }}
                  >
                    {convertChatTime(rowData)}
                  </Text>
                  <View style={{ backgroundColor: 'transparent', height: 4, width: 20 }} />
                </>
              ) : null}
            </View>
          ) : rowData.message === stopConsultJr ? (
            <View
              style={{
                backgroundColor: '#0087ba',
                marginLeft: 38,
                borderRadius: 10,
              }}
            >
              {rowData.automatedText ? (
                <>
                  <Text
                    style={{
                      color: '#ffffff',
                      paddingTop: 8,
                      paddingBottom: 4,
                      paddingHorizontal: 16,
                      ...theme.fonts.IBMPlexSansMedium(15),
                      textAlign: 'left',
                    }}
                  >
                    {rowData.automatedText}
                  </Text>
                  <Text
                    style={{
                      color: '#ffffff',
                      paddingHorizontal: 16,
                      paddingVertical: 4,
                      textAlign: 'right',
                      ...theme.fonts.IBMPlexSansMedium(10),
                    }}
                  >
                    {convertChatTime(rowData)}
                  </Text>
                  <View style={{ backgroundColor: 'transparent', height: 4, width: 20 }} />
                </>
              ) : null}
            </View>
          ) : rowData.message === exotelCall ? (
            <View
              style={{
                backgroundColor: '#0087ba',
                marginLeft: 38,
                borderRadius: 10,
              }}
            >
              <>
                <Text
                  style={{
                    color: '#ffffff',
                    paddingTop: 8,
                    paddingBottom: 4,
                    paddingHorizontal: 16,
                    ...theme.fonts.IBMPlexSansMedium(15),
                    textAlign: 'left',
                  }}
                  selectable={true}
                >
                  {doctorName +
                    strings.common.exotelMessage +
                    rowData.exotelNumber +
                    strings.common.requestMessage}
                </Text>
                <Text
                  style={{
                    color: '#ffffff',
                    paddingHorizontal: 16,
                    paddingVertical: 4,
                    textAlign: 'right',
                    ...theme.fonts.IBMPlexSansMedium(10),
                  }}
                >
                  {convertChatTime(rowData)}
                </Text>
                <View style={{ backgroundColor: 'transparent', height: 4, width: 20 }} />
              </>
            </View>
          ) : (
            <>
              <View
                style={{
                  backgroundColor: 'white',
                  marginLeft: 38,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    color: '#0087ba',
                    paddingHorizontal: 16,
                    paddingTop: 8,
                    paddingBottom: 3,
                    ...theme.fonts.IBMPlexSansMedium(16),
                    textAlign: 'left',
                  }}
                >
                  {rowData.message}
                </Text>
                <Text
                  style={{
                    color: 'rgba(2,71,91,0.6)',
                    paddingHorizontal: 16,
                    paddingVertical: 4,
                    textAlign: 'right',
                    ...theme.fonts.IBMPlexSansMedium(10),
                  }}
                >
                  {convertChatTime(rowData)}
                </Text>
              </View>
              <View style={{ backgroundColor: 'transparent', height: 4, width: 20 }} />
            </>
          )}
        </View>
      </View>
    );
  };

  const audioVideo = (rowData: any, index: number) => {
    return (
      <>
        {rowData.duration === '00 : 00' ? (
          <View
            style={{
              backgroundColor: 'transparent',
              width: 282,
              borderRadius: 10,
              marginVertical: 2,
              alignSelf: 'flex-start',
              paddingVertical: 17,
            }}
          >
            {leftComponent === 1 && (
              <View
                style={{
                  width: 32,
                  height: 32,
                  bottom: 0,
                  position: 'absolute',
                  left: 0,
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              >
                {appointmentData.doctorInfo.thumbnailUrl &&
                appointmentData.doctorInfo.thumbnailUrl.match(urlRegEx) ? (
                  <Image
                    source={{ uri: appointmentData.doctorInfo.thumbnailUrl }}
                    resizeMode={'contain'}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                    }}
                  />
                ) : (
                  <DoctorPlaceholderImage
                    style={{
                      width: 32,
                      height: 32,
                      bottom: 0,
                      position: 'absolute',
                      left: 0,
                    }}
                  />
                )}
              </View>
            )}
            <View
              style={{
                marginLeft: 40,
                borderRadius: 10,
                height: 29,
                width: 244,
              }}
            >
              <View
                style={{
                  backgroundColor: '#e50000',
                  opacity: 0.04,
                  width: 244,
                  borderRadius: 10,
                  height: 29,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: 'transparent',
                  alignItems: 'center',
                }}
              >
                <MissedCallIcon style={{ width: 16, height: 16, marginLeft: 16, marginTop: 3 }} />
                {rowData.message === 'Audio call ended' ? (
                  <Text
                    style={{
                      color: '#890000',
                      marginLeft: 27,
                      textAlign: 'left',
                      ...theme.fonts.IBMPlexSansMedium(12),
                      lineHeight: 24,
                      letterSpacing: 0.04,
                      marginTop: 2,
                    }}
                  >
                    You missed a voice call
                  </Text>
                ) : (
                  <Text
                    style={{
                      color: '#890000',
                      marginLeft: 27,
                      textAlign: 'left',
                      ...theme.fonts.IBMPlexSansMedium(12),
                      lineHeight: 24,
                      letterSpacing: 0.04,
                      marginTop: 2,
                    }}
                  >
                    You missed a video call
                  </Text>
                )}
              </View>
              <Text
                style={{
                  color: '#890000',
                  paddingHorizontal: 16,
                  paddingVertical: 4,
                  textAlign: 'right',
                  ...theme.fonts.IBMPlexSansMedium(10),
                }}
              >
                {convertChatTime(rowData)}
              </Text>
              <View style={{ backgroundColor: 'transparent', height: 5, width: 20 }} />
            </View>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: 'transparent',
              width: 282,
              borderRadius: 10,
              marginVertical: 2,
              alignSelf: 'flex-start',
            }}
          >
            {leftComponent === 1 && (
              <View
                style={{
                  width: 32,
                  height: 32,
                  bottom: 0,
                  position: 'absolute',
                  left: 0,
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              >
                {appointmentData.doctorInfo.thumbnailUrl &&
                appointmentData.doctorInfo.thumbnailUrl.match(urlRegEx) ? (
                  <Image
                    source={{ uri: appointmentData.doctorInfo.thumbnailUrl }}
                    resizeMode={'contain'}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                    }}
                  />
                ) : (
                  <DoctorPlaceholderImage
                    style={{
                      width: 32,
                      height: 32,
                      bottom: 0,
                      position: 'absolute',
                      left: 0,
                    }}
                  />
                )}
              </View>
            )}
            <View
              style={{
                borderRadius: 10,
                marginVertical: 2,
                alignSelf: 'flex-start',
                flexDirection: 'row',
                marginLeft: 40,
              }}
            >
              <ChatCallIcon style={{ width: 20, height: 20 }} />
              <View style={{ marginLeft: 12 }}>
                <Text
                  style={{
                    color: '#01475b',
                    marginLeft: 0,
                    textAlign: 'left',
                    ...theme.fonts.IBMPlexSansMedium(14),
                  }}
                >
                  {rowData.message}
                </Text>
                <Text
                  style={{
                    color: '#01475b',
                    marginTop: 2,
                    textAlign: 'left',
                    ...theme.fonts.IBMPlexSansMedium(10),
                  }}
                >
                  Duration - {rowData.duration}
                </Text>
                <Text
                  style={{
                    color: 'rgba(2,71,91,0.6)',
                    paddingLeft: 16,
                    paddingVertical: 4,
                    paddingRight: 4,
                    textAlign: 'right',
                    ...theme.fonts.IBMPlexSansMedium(10),
                  }}
                >
                  {convertChatTime(rowData)}
                </Text>
              </View>
              <View style={{ backgroundColor: 'transparent', height: 4, width: 20 }} />
            </View>
          </View>
        )}
      </>
    );
  };

  const patientAutomatedMessage = (rowData: any, index: number) => {
    return (
      <View
        style={{
          backgroundColor: 'transparent',
          borderRadius: 10,
          marginVertical: 2,
          alignSelf: 'flex-start',
        }}
      >
        {leftComponent === 1 && (
          <View
            style={{
              width: 32,
              height: 32,
              bottom: 0,
              position: 'absolute',
              left: 0,
            }}
          >
            <Mascot
              style={{
                width: 32,
                height: 32,
                bottom: 0,
                position: 'absolute',
                left: 0,
              }}
            />
          </View>
        )}
        <View
          style={{
            backgroundColor: '#0087ba',
            marginLeft: 38,
            borderRadius: 10,
            marginBottom: 4,
          }}
        >
          {rowData.automatedText ? (
            <>
              <Text
                style={{
                  color: '#ffffff',
                  paddingTop: 8,
                  paddingBottom: 4,
                  paddingHorizontal: 16,
                  ...theme.fonts.IBMPlexSansMedium(15),
                  textAlign: 'left',
                }}
              >
                {rowData.automatedText}
              </Text>
              <Text
                style={{
                  color: '#ffffff',
                  paddingHorizontal: 16,
                  paddingVertical: 4,
                  textAlign: 'right',
                  ...theme.fonts.IBMPlexSansMedium(10),
                }}
              >
                {convertChatTime(rowData)}
              </Text>
              <View style={{ backgroundColor: 'transparent', height: 4, width: 20 }} />
            </>
          ) : null}
        </View>
      </View>
    );
  };

  const doctorAutomatedMessage = (rowData: any, index: number) => {
    return (
      <View
        style={{
          backgroundColor: 'transparent',
          borderRadius: 10,
          marginVertical: 2,
          alignSelf: 'flex-start',
        }}
      >
        {leftComponent === 1 && (
          <View
            style={{
              width: 32,
              height: 32,
              bottom: 0,
              position: 'absolute',
              left: 0,
            }}
          >
            <Mascot
              style={{
                width: 32,
                height: 32,
                bottom: 0,
                position: 'absolute',
                left: 0,
              }}
            />
          </View>
        )}
        <View
          style={{
            backgroundColor: '#0087ba',
            marginLeft: 38,
            borderRadius: 10,
            marginBottom: 4,
            width: 244,
          }}
        >
          {rowData.automatedText ? (
            <>
              <Text
                style={{
                  color: '#ffffff',
                  paddingTop: 8,
                  paddingBottom: 4,
                  paddingHorizontal: 16,
                  ...theme.fonts.IBMPlexSansMedium(15),
                  textAlign: 'left',
                }}
              >
                {rowData.automatedText}
              </Text>
              <Text
                style={{
                  color: '#ffffff',
                  paddingHorizontal: 16,
                  paddingVertical: 4,
                  textAlign: 'right',
                  ...theme.fonts.IBMPlexSansMedium(10),
                }}
              >
                {convertChatTime(rowData)}
              </Text>
              <View style={{ backgroundColor: 'transparent', height: 4, width: 20 }} />
            </>
          ) : null}
        </View>
      </View>
    );
  };

  const renderChatRow = (
    rowData: {
      id: string;
      message: string;
      duration: string;
      fileType: string;
      transferInfo: any;
      prismId: any;
      url: any;
    },
    index: number
  ) => {
    if (
      rowData.message === typingMsg ||
      rowData.message === endCallMsg ||
      rowData.message === audioCallMsg ||
      rowData.message === videoCallMsg ||
      rowData.message === acceptedCallMsg ||
      rowData.message === stopConsultMsg ||
      rowData.message === cancelConsultInitiated ||
      rowData.message === callAbandonment ||
      rowData.message === appointmentComplete ||
      rowData.message === patientRejectedCall || 
      rowData === patientRejectedCall
    ) {
      return null;
    }

    if (rowData.id !== patientId) {
      leftComponent++;
      rightComponent = 0;
      return (
        <View style={{ marginHorizontal: 20, paddingTop: 8 }}>
          {leftComponent === 1 && (
            <View
              style={{
                backgroundColor: 'transparent',
                width: width,
                // marginVertical: 8,
              }}
            />
          )}
          {rowData.message === 'Audio call ended' || rowData.message === 'Video call ended' ? (
            <>{audioVideo(rowData, index)}</>
          ) : (
            <>
              {rowData.message === transferConsultMsg ||
              rowData.message === followupconsult ||
              rowData.message === rescheduleConsultMsg ? (
                <>{transferReschedule(rowData, index)}</>
              ) : (
                <>
                  {rowData.message === consultPatientStartedMsg ||
                  rowData.message === doctorAutoResponse ? (
                    <>{patientAutomatedMessage(rowData, index)}</>
                  ) : rowData.message === firstMessage ||
                    rowData.message === secondMessage ||
                    rowData.message === languageQue ||
                    rowData.message === jdThankyou ? (
                    <>{doctorAutomatedMessage(rowData, index)}</>
                  ) : (
                    <>{messageView(rowData, index)}</>
                  )}
                </>
              )}
            </>
          )}
        </View>
      );
    } else {
      leftComponent = 0;
      rightComponent++;
      return (
        <View style={{ marginHorizontal: 20 }}>
          {rightComponent == 1 ? (
            <View
              style={{
                backgroundColor: 'transparent',
                width: width,
                marginVertical: 8,
              }}
            />
          ) : null}
          {rowData.message === 'Audio call ended' || rowData.message === 'Video call ended' ? (
            <View
              style={{
                borderRadius: 10,
                marginVertical: 2,
                alignSelf: 'flex-end',
                flexDirection: 'row',
              }}
            >
              <ChatCallIcon style={{ width: 20, height: 20 }} />
              <View>
                <Text
                  style={{
                    color: '#01475b',
                    marginLeft: 12,
                    textAlign: 'left',
                    ...theme.fonts.IBMPlexSansMedium(14),
                  }}
                >
                  {rowData.message}
                </Text>
                <Text
                  style={{
                    color: '#01475b',
                    marginTop: 2,
                    marginLeft: 14,
                    textAlign: 'left',
                    ...theme.fonts.IBMPlexSansMedium(10),
                  }}
                >
                  Duration - {rowData.duration}
                </Text>
                <Text
                  style={{
                    color: 'rgba(2,71,91,0.6)',
                    paddingLeft: 16,
                    paddingVertical: 4,
                    paddingRight: 4,
                    textAlign: 'right',
                    ...theme.fonts.IBMPlexSansMedium(10),
                  }}
                >
                  {convertChatTime(rowData)}
                </Text>
              </View>
              <View style={{ backgroundColor: 'transparent', height: 4, width: 20 }} />
            </View>
          ) : (
            <View>
              {rowData.message === imageconsult ? (
                <View>
                  {rowData.url.match(/\.(jpeg|jpg|gif|png|jfif)$/) ||
                  rowData.fileType === 'image' ? (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => {
                        console.log('IMAGE', rowData.url);
                        openPopUp(rowData);
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: 'transparent',
                          width: 180,
                          height: 180,
                          borderRadius: 10,
                          marginVertical: 2,
                          alignSelf: 'flex-end',
                          marginBottom: 4,
                          flex: 1,
                        }}
                      >
                        <Image
                          placeholderStyle={{
                            height: 180,
                            width: '100%',
                            alignItems: 'center',
                            backgroundColor: 'transparent',
                          }}
                          PlaceholderContent={
                            <Spinner style={{ backgroundColor: 'transparent' }} />
                          }
                          source={{ uri: rowData.url }}
                          style={{
                            resizeMode: 'stretch',
                            width: 180,
                            height: 180,
                            borderRadius: 10,
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => {
                        console.log('pdf', rowData.url);
                        openPopUp(rowData);
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: 'transparent',
                          width: 180,
                          height: 180,
                          borderRadius: 10,
                          marginVertical: 2,
                          alignSelf: 'flex-end',
                          marginBottom: 4,
                          flex: 1,
                        }}
                      >
                        <FileBig
                          style={{
                            resizeMode: 'stretch',
                            width: 200,
                            height: 200,
                            borderRadius: 10,
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <>
                  <View
                    style={{
                      backgroundColor: 'white',
                      borderRadius: 10,
                      marginVertical: 2,
                      alignSelf: 'flex-end',
                    }}
                  >
                    <Text
                      style={{
                        color: '#01475b',
                        paddingTop: 8,
                        paddingBottom: 3,
                        paddingHorizontal: 16,
                        textAlign: 'left',
                        ...theme.fonts.IBMPlexSansMedium(16),
                      }}
                    >
                      {rowData.message}
                    </Text>
                    <Text
                      style={{
                        color: 'rgba(2,71,91,0.6)',
                        paddingHorizontal: 16,
                        paddingVertical: 4,
                        textAlign: 'right',
                        ...theme.fonts.IBMPlexSansMedium(10),
                      }}
                    >
                      {convertChatTime(rowData)}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: 'transparent', height: 4, width: 20 }} />
                </>
              )}
            </View>
          )}
        </View>
      );
    }
  };

  const convertChatTime = (timeStamp: any) => {
    let utcString;
    if (timeStamp.messageDate) {
      const dateValidate = moment(moment().format('YYYY-MM-DD')).diff(
        moment(timeStamp.messageDate).format('YYYY-MM-DD')
      );
      if (dateValidate == 0) {
        utcString = moment
          .utc(timeStamp.messageDate)
          .local()
          .format('h:mm A');
      } else {
        utcString = moment
          .utc(timeStamp.messageDate)
          .local()
          .format('DD MMM, YYYY h:mm A');
      }
    }
    return utcString ? utcString : '--';
  };

  const transferAppointmentAPI = (
    rowData: any,
    appointmentTransferInput: BookTransferAppointmentInput
  ) => {
    console.log(rowData, 'rowData');
    setLoading(true);

    client
      .mutate<bookTransferAppointment, bookTransferAppointmentVariables>({
        mutation: BOOK_APPOINTMENT_TRANSFER,
        variables: {
          BookTransferAppointmentInput: appointmentTransferInput,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        console.log('Accept Api', data);
        console.log('time', data.data.bookTransferAppointment.appointment.appointmentDateTime);
        setLoading(false);

        setTransferAccept(true),
          setTransferDcotorName(rowData.transferInfo.doctorName),
          setTimeout(() => {
            setTransferAccept(false);
          }, 1000);
        AsyncStorage.setItem('showTransferPopup', 'true');
        props.navigation.dispatch(
          StackActions.reset({
            index: 0,
            key: null,
            actions: [
              NavigationActions.navigate({
                routeName: AppRoutes.TabBar,
                params: {
                  TransferData: rowData.transferInfo,
                  TranferDateTime:
                    data.data.bookTransferAppointment.appointment.appointmentDateTime,
                },
              }),
            ],
          })
        );
      })
      .catch((e) => {
        CommonBugFender('ChatRoom_transferAppointmentAPI', e);
        setLoading(false);
        setBottompopup(true);
      });
  };

  const checkIfReschduleApi = (
    rowData: any,
    Value: string,
    isAutomatic: boolean,
    nextSlotAvailable: string
  ) => {
    try {
      let checkAppointmentId;
      let checkAppointmentDate;
      console.log(rowData, 'rowDatacheckIfReschduleApi');
      console.log(Value, 'Value');

      if (isAutomatic) {
        checkAppointmentId = channel;

        checkAppointmentDate = nextSlotAvailable;
        console.log(
          'checkIfReschedulesuccess',
          checkAppointmentId,
          checkAppointmentDate,
          isAutomatic
        );
      } else {
        checkAppointmentId = rowData.transferInfo.appointmentId;

        checkAppointmentDate =
          Value === 'Followup'
            ? rowData.transferInfo.folloupDateTime
            : rowData.transferInfo.transferDateTime;
        console.log(
          'checkIfReschedulesuccess',
          checkAppointmentId,
          checkAppointmentDate,
          isAutomatic
        );
      }

      setLoading(true);
      checkIfRescheduleAppointment(client, checkAppointmentId, checkAppointmentDate)
        .then((_data: any) => {
          setLoading(false);
          try {
            const result = _data.data.data.checkIfReschedule;
            console.log('checkIfReschedulesuccess', result);
            const data: rescheduleType = {
              rescheduleCount: result.rescheduleCount + 1,
              appointmentState: result.appointmentState,
              isCancel: result.isCancel,
              isFollowUp: result.isFollowUp,
              isPaid: result.isPaid,
            };
            setNewRescheduleCount(data);
            setCheckReschudule(true);
            setTimeout(() => {
              flatListRef.current! && flatListRef.current!.scrollToEnd({ animated: true });
            }, 500);
          } catch (error) {
            CommonBugFender('ChatRoom_checkIfRescheduleAppointment_try', error);
          }
        })
        .catch((e: any) => {
          CommonBugFender('ChatRoom_checkIfRescheduleAppointment', e);
          setLoading(false);
          const error = JSON.parse(JSON.stringify(e));
          console.log('checkIfRescheduleerror', error);
        })
        .finally(() => {
          console.log('checkIfReschedulesuccessfinally transferData', transferData);
          if (isAutomatic) {
            rescheduleInitiatedBy = REQUEST_ROLES.DOCTOR;
            setdisplayoverlay(true);
          } else {
            rescheduleInitiatedBy = REQUEST_ROLES.PATIENT;
          }
        });
    } catch (error) {
      CommonBugFender('ChatRoom_checkIfReschduleApi_try', error);
      console.log('creash in checkIfReschduleApi', error);
    }
  };

  const NextAvailableSlot = (rowData: any, Value: string, isAutomatic: boolean) => {
    console.log('NextAvailableSlot', rowData, rowData.length);
    try {
      if (rowData.length > 0) setLoading(true);
      let todayDate;
      let slotDoctorId;

      if (isAutomatic) {
        todayDate = moment
          .utc(appointmentData.appointmentDateTime)
          .local()
          .format('YYYY-MM-DD');
        slotDoctorId = appointmentData.doctorId;
      } else {
        todayDate = moment
          .utc(
            Value === 'Followup'
              ? rowData.transferInfo.folloupDateTime
              : rowData.transferInfo && rowData.transferInfo.transferDateTime
          )
          .local()
          .format('YYYY-MM-DD');
        slotDoctorId =
          Value === 'Followup' ? rowData.transferInfo.doctorId : rowData.transferInfo.doctorInfo.id;
      }

      console.log('todayDate', todayDate);
      console.log('slotDoctorId', slotDoctorId);

      setDoctorScheduleId(slotDoctorId);

      getNextAvailableSlots(client, slotDoctorId, todayDate)
        .then(({ data }: any) => {
          setLoading(false);
          try {
            console.log(data, 'nextavailable res');
            setNextSlotAvailable(data[0].availableSlot);
            checkIfReschduleApi(rowData, Value, isAutomatic, data[0].availableSlot);
          } catch (error) {
            CommonBugFender('ChatRoom_getNextAvailableSlots_try', error);
            setNextSlotAvailable('');
          }
        })
        .catch((e) => {
          CommonBugFender('ChatRoom_getNextAvailableSlots', e);
          setLoading(false);
          console.log('Error occured ', e);
        })
        .finally(() => {});
    } catch (error) {
      CommonBugFender('ChatRoom_NextAvailableSlot_try', error);
      console.log('crash in NextAvailableSlot', error);
    }
  };

  const rescheduleAPI = (rowData: any, bookRescheduleInput: any) => {
    console.log('rescheduleAPI', rowData);
    setLoading(true);

    console.log(bookRescheduleInput, 'bookRescheduleInput');
    client
      .mutate<bookRescheduleAppointment, bookRescheduleAppointmentVariables>({
        mutation: BOOK_APPOINTMENT_RESCHEDULE,
        variables: {
          bookRescheduleAppointmentInput: bookRescheduleInput,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        console.log(data, 'data');
        setLoading(false);
        AsyncStorage.setItem('showSchduledPopup', 'true');
        props.navigation.dispatch(
          StackActions.reset({
            index: 0,
            key: null,
            actions: [
              NavigationActions.navigate({
                routeName: AppRoutes.TabBar,
                params: {
                  Data:
                    data.data &&
                    data.data.bookRescheduleAppointment &&
                    data.data.bookRescheduleAppointment.appointmentDetails,
                  DoctorName:
                    props.navigation.state.params!.data &&
                    props.navigation.state.params!.data.doctorInfo &&
                    props.navigation.state.params!.data.doctorInfo.fullName,
                },
              }),
            ],
          })
        );
      })
      .catch((e) => {
        CommonBugFender('ChatRoom_rescheduleAPI', e);
        console.log(e, 'error');
        setLoading(false);
        setBottompopup(true);
      });
  };

  const renderChatHeader = () => {
    let time = '';
    const diffMin = Math.ceil(
      moment(appointmentData.appointmentDateTime).diff(moment(), 'minutes', true)
    );
    const diffHours = Math.ceil(
      moment(appointmentData.appointmentDateTime).diff(moment(), 'hours', true)
    );
    const diffDays = Math.ceil(
      moment(appointmentData.appointmentDateTime).diff(moment(), 'days', true)
    );
    const diffMonths = Math.ceil(
      moment(appointmentData.appointmentDateTime).diff(moment(), 'months', true)
    );
    // console.log(diffMin, diffHours, diffDays, diffMonths, 'difference');

    if (textChange && !jrDoctorJoined.current) {
      time = 'Consult is In-progress';
    } else {
      if (status === STATUS.COMPLETED) {
        time = `Consult is completed`;
      } else if (diffMin <= 0) {
        time = `Will be joining soon`;
      } else if (diffMin > 0 && diffMin < 60 && diffHours <= 1) {
        time = `Joining in ${diffMin} minute${diffMin === 1 ? '' : 's'}`;
      } else if (diffHours > 0 && diffHours < 24 && diffDays <= 1) {
        time = `Joining in ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
      } else if (diffDays > 0 && diffDays < 31 && diffMonths <= 1) {
        time = `Joining in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
      } else {
        time = `Joining in ${diffMonths} month${diffMonths === 1 ? '' : 's'}`;
      }
    }
    return (
      <View style={styles.mainView}>
        <View style={{ maxWidth: '40%' }}>
          <Text style={styles.displayId} numberOfLines={1}>
            #{appointmentData.displayId}
          </Text>
          <View style={styles.separatorStyle} />
        </View>
        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorNameStyle}>{appointmentData.doctorInfo.displayName}</Text>
            <Text style={styles.doctorSpecialityStyle}>{`${g(
              appointmentData,
              'doctorInfo',
              'specialty',
              'userFriendlyNomenclature'
            )} | MCI Reg. No. ${g(appointmentData, 'doctorInfo', 'registrationNumber')}`}</Text>
            <Text style={styles.timeStyle}>{time}</Text>
          </View>
          <View style={styles.imageView}>
            <View style={styles.imageContainer}>
              {appointmentData.doctorInfo.thumbnailUrl &&
              appointmentData.doctorInfo.thumbnailUrl.match(urlRegEx) ? (
                <Image
                  source={{ uri: appointmentData.doctorInfo.thumbnailUrl }}
                  resizeMode={'contain'}
                  style={styles.doctorImage}
                />
              ) : (
                <DoctorPlaceholderImage style={styles.doctorImage} />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderJoinCallHeader = () => {
    return (
      <View style={styles.callHeaderView}>
        <View style={styles.callHeaderRow}>
          <Text style={styles.joinRoomDescriptionText}>
            {strings.common.joinConsultRoomDescription} {appointmentData.doctorInfo.displayName}
          </Text>
          <Button
            title="JOIN"
            style={styles.joinBtn}
            onPress={() => {
              patientJoinedCall.current = true;
              joinCallHandler();
            }}
          />
        </View>
      </View>
    );
  };

  const joinCallHandler = () => {
    callPermissions(() => {
      setLoading(true);
      stopTimer();
      startTimer(0);
      setCallAccepted(true);
      setHideStatusBar(true);
      setChatReceived(false);
      Keyboard.dismiss();
      changeVideoStyles();
      setDropdownVisible(false);
      setCallerVideo(true);
      if (token) {
        PublishAudioVideo();
      } else {
        APICallAgain();
      }
    });
  };

  // const renderChatHeader = () => {
  //   let time = '';
  //   const diffMin = Math.ceil(
  //     moment(appointmentData.appointmentDateTime).diff(moment(), 'minutes', true)
  //   );
  //   const diffHours = Math.ceil(
  //     moment(appointmentData.appointmentDateTime).diff(moment(), 'hours', true)
  //   );
  //   const diffDays = Math.ceil(
  //     moment(appointmentData.appointmentDateTime).diff(moment(), 'days', true)
  //   );
  //   const diffMonths = Math.ceil(
  //     moment(appointmentData.appointmentDateTime).diff(moment(), 'months', true)
  //   );
  //   // console.log(diffMin, diffHours, diffDays, diffMonths, 'difference');

  //   if (textChange && !jrDoctorJoined) {
  //     time = 'Consult is In-progress';
  //   } else {
  //     if (status === STATUS.COMPLETED) {
  //       time = `Consult is completed`;
  //     } else if (diffMin <= 0) {
  //       time = `Will be joining soon`;
  //     } else if (diffMin > 0 && diffMin < 60 && diffHours <= 1) {
  //       time = `Joining in ${diffMin} minute${diffMin === 1 ? '' : 's'}`;
  //     } else if (diffHours > 0 && diffHours < 24 && diffDays <= 1) {
  //       time = `Joining in ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
  //     } else if (diffDays > 0 && diffDays < 31 && diffMonths <= 1) {
  //       time = `Joining in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  //     } else {
  //       time = `Joining in ${diffMonths} month${diffMonths === 1 ? '' : 's'}`;
  //     }
  //   }
  //   return (
  //     <View style={styles.mainView}>
  //       <View
  //         style={{
  //           flexDirection: 'row',
  //         }}
  //       >
  //         <View style={{ flex: 1 }}>
  //           <ApolloLogo style={{ width: 57, height: 37 }} resizeMode="contain" />
  //           <Text style={styles.displayId}>#{appointmentData.displayId}</Text>
  //           <View style={styles.separatorStyle} />
  //           <Text style={styles.doctorNameStyle}>{appointmentData.doctorInfo.displayName}</Text>
  //           <Text style={styles.doctorSpecialityStyle}>{`${g(
  //             appointmentData,
  //             'doctorInfo',
  //             'specialty',
  //             'userFriendlyNomenclature'
  //           )}  |  MCI Reg. No. ${g(appointmentData, 'doctorInfo', 'registrationNumber')}`}</Text>
  //           <Text style={styles.timeStyle}>{time}</Text>
  //         </View>
  //         <View style={styles.imageView}>
  //           <View style={styles.imageContainer}>
  //             {appointmentData.doctorInfo.thumbnailUrl &&
  //             appointmentData.doctorInfo.thumbnailUrl.match(
  //               /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG|jfif)/
  //             ) ? (
  //               <Image
  //                 source={{ uri: appointmentData.doctorInfo.thumbnailUrl }}
  //                 resizeMode={'contain'}
  //                 style={styles.doctorImage}
  //               />
  //             ) : (
  //               <DoctorPlaceholderImage style={styles.doctorImage} />
  //             )}
  //           </View>
  //         </View>
  //       </View>
  //     </View>
  //   );
  // };

  const chatDisabled = () => {
    return (
      <View style={styles.chatDisabledContainer}>
        <Text style={styles.chatDisabledHeader}>
          {strings.consultType.chatDisabledHeader.replace(
            '{0}',
            appointmentData.doctorInfo.displayName
          )}
        </Text>
        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate(AppRoutes.DoctorDetails, {
              doctorId: doctorId,
            });
          }}
        >
          <Text style={theme.viewStyles.text('B', 13, theme.colors.APP_YELLOW)}>
            {strings.common.book_apointment}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderChatView = () => {
    return (
      <View style={{ width: width, height: heightList, marginTop: 0, flex: 1 }}>
        <FlatList
          style={{
            flex: 1,
          }}
          // ListHeaderComponent={renderChatHeader()}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          // stickyHeaderIndices={[0]}
          removeClippedSubviews={false}
          ref={(ref) => (flatListRef.current = ref)}
          contentContainerStyle={{
            // marginHorizontal: 20,
            marginTop: 0,
          }}
          bounces={false}
          data={messages}
          onEndReachedThreshold={0.2}
          renderItem={({ item, index }) => renderChatRow(item, index)}
          keyExtractor={(_, index) => index.toString()}
          numColumns={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          initialNumToRender={messages ? messages.length : 0}
          ListFooterComponent={() => {
            if (disableChat) {
              return chatDisabled();
            } else {
              return null;
            }
          }}
        />
      </View>
    );
  };

  const doctorName =
    name == 'JUNIOR'
      ? appointmentData.doctorInfo.displayName + '`s' + ' team doctor '
      : appointmentData.doctorInfo.displayName;
  const VideoCall = () => {
    return (
      <View style={[talkStyles, { zIndex: 1001 }]}>
        {downgradeToAudio && (
          <View>
            {appointmentData.doctorInfo.photoUrl ? (
              <View style={[audioCallImageStyles, { backgroundColor: 'white' }]}>
                <Image
                  source={{ uri: appointmentData.doctorInfo.photoUrl }}
                  style={audioCallImageStyles}
                  resizeMode={'contain'}
                />
              </View>
            ) : (
              <View
                style={[
                  audioCallImageStyles,
                  {
                    backgroundColor: 'black',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.6,
                  },
                ]}
              >
                <DoctorPlaceholderImage />
              </View>
            )}
          </View>
        )}
        {isCall && (
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <OTSession
              // apiKey={'46401302'}
              apiKey={AppConfig.Configuration.PRO_TOKBOX_KEY}
              sessionId={sessionId}
              token={token}
              eventHandlers={sessionEventHandlers}
              ref={otSessionRef}
              options={{
                androidZOrder: 'onTop', // Android only - valid options are 'mediaOverlay' or 'onTop'
                androidOnTop: 'publisher', // Android only - valid options are 'publisher' or 'subscriber'
                useTextureViews: true, // Android only - default is false
                isCamera2Capable: true, // Android only - default is false
              }}
            >
              <OTPublisher
                style={
                  !downgradeToAudio
                    ? publisherStyles
                    : {
                        position: 'absolute',
                        top: 44,
                        right: 20,
                        width: 1,
                        height: 1,
                        zIndex: 1000,
                      }
                }
                properties={{
                  cameraPosition: cameraPosition,
                  publishVideo: !downgradeToAudio ? showVideo : false,
                  publishAudio: isPublishAudio,
                  videoTrack: !downgradeToAudio ? showVideo : false,
                  audioTrack: isPublishAudio,
                  audioVolume: 100,
                  name: g(currentPatient, 'firstName') || 'patient',
                  resolution: '640x480', // setting this resolution to avoid over heating of device
                  audioBitrate: 30000,
                  frameRate: 15,
                }}
                eventHandlers={publisherEventHandlers}
              />
              <OTSubscriber
                style={
                  !downgradeToAudio
                    ? subscriberStyles
                    : {
                        width: 1,
                        height: 1,
                      }
                }
                // subscribeToSelf={true}
                eventHandlers={subscriberEventHandlers}
                properties={{
                  subscribeToAudio: true,
                  subscribeToVideo: !downgradeToAudio ? true : false,
                  audioVolume: 100,
                }}
              />
            </OTSession>

            {!PipView && (
              <>
                <View
                  style={{
                    position: 'absolute',
                    top: isIphoneX() ? 24 : 0,
                    left: 0,
                    width: width,
                    height: 24,
                    backgroundColor: 'transparent',
                    // opacity: 0.6,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                  }}
                >
                  <Text style={{ color: 'transparent', ...theme.fonts.IBMPlexSansSemiBold(10) }}>
                    Time Left {minutes.toString().length < 2 ? '0' + minutes : minutes} :{' '}
                    {seconds.toString().length < 2 ? '0' + seconds : seconds}
                  </Text>
                </View>
                <Text
                  style={{
                    position: 'absolute',
                    marginHorizontal: 20,
                    marginTop: isIphoneX() ? 64 : 44,
                    width: width - 40,
                    color: 'white',
                    ...theme.fonts.IBMPlexSansSemiBold(20),
                    textAlign: 'center',
                    left: 0,
                    zIndex: 1001,
                  }}
                >
                  {doctorName}
                </Text>
              </>
            )}

            <Text style={timerStyles}>{callAccepted ? callTimerStarted : 'INCOMING'}</Text>
            {patientJoinedCall.current && !subscriberConnected.current && (
              <Text style={styles.centerTxt}>
                {strings.common.waitForDoctirToJoinCall.replace('doctor_name', doctorName)}
              </Text>
            )}

            {renderBusyMessages(!PipView, isIphoneX() ? 171 : 161)}

            {PipView && renderOnCallPipButtons('video')}
            {!PipView && renderChatNotificationIcon()}
            {!PipView && renderBottomButtons()}
          </View>
        )}
      </View>
    );
  };

  const callMinutes = Math.floor(callTimer / 60);
  const callSeconds = callTimer - callMinutes * 60;

  const callTimerStarted = `${
    callMinutes.toString().length < 2 ? '0' + callMinutes : callMinutes
  } : ${callSeconds.toString().length < 2 ? '0' + callSeconds : callSeconds}`;

  const isPaused = !callerAudio
    ? !callerVideo && isCall
      ? 'Audio/Video'
      : 'Audio'
    : !callerVideo && isCall
    ? 'Video'
    : '';

  //  {isCall && VideoCall()}
  //   {isAudioCall && AudioCall()}

  const AudioCall = () => {
    return (
      <View style={audioCallStyles}>
        {!convertVideo && (
          <View>
            {appointmentData.doctorInfo.photoUrl ? (
              <View style={[audioCallImageStyles, { backgroundColor: 'white' }]}>
                <Image
                  source={{ uri: appointmentData.doctorInfo.photoUrl }}
                  style={audioCallImageStyles}
                  resizeMode={'contain'}
                />
              </View>
            ) : (
              <DoctorImage style={audioCallImageStyles} />
            )}
          </View>
        )}
        {/* {!convertVideo && <DoctorCall style={audioCallImageStyles} />} */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'black',
            opacity: 0.6,
          }}
        />
        <OTSession
          apiKey={AppConfig.Configuration.PRO_TOKBOX_KEY}
          sessionId={sessionId}
          token={token}
          eventHandlers={sessionEventHandlers}
          ref={otSessionRef}
          options={{
            androidZOrder: 'onTop', // Android only - valid options are 'mediaOverlay' or 'onTop'
            androidOnTop: 'publisher', // Android only - valid options are 'publisher' or 'subscriber'
            useTextureViews: true, // Android only - default is false
            isCamera2Capable: true, // Android only - default is false
          }}
        >
          <OTPublisher
            style={
              convertVideo
                ? publisherStyles
                : {
                    position: 'absolute',
                    top: 44,
                    right: 20,
                    width: 1,
                    height: 1,
                    zIndex: 1000,
                  }
            }
            properties={{
              cameraPosition: cameraPosition,
              publishVideo: convertVideo ? true : false,
              publishAudio: isPublishAudio,
              audioVolume: 100,
              videoTrack: convertVideo ? true : false,
              audioTrack: isPublishAudio,
              name: g(currentPatient, 'firstName') || 'patient',
              // resolution: '352x288',
            }}
            eventHandlers={publisherEventHandlers}
          />
          <OTSubscriber
            style={
              convertVideo
                ? subscriberStyles
                : {
                    width: 1,
                    height: 1,
                  }
            }
            eventHandlers={subscriberEventHandlers}
            // subscribeToSelf={true}
            properties={{
              subscribeToAudio: true,
              subscribeToVideo: convertVideo ? true : false,
              audioVolume: 100,
            }}
          />
        </OTSession>
        {showAudioPipView && (
          <View
            style={{
              position: 'absolute',
              top: isIphoneX() ? 24 : 0,
              left: 0,
              width: width,
              height: 24,
              backgroundColor: 'transparent',
              // opacity: 0.6,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001,
            }}
          >
            <Text style={{ color: 'transparent', ...theme.fonts.IBMPlexSansSemiBold(10) }}>
              Time Left {minutes.toString().length < 2 ? '0' + minutes : minutes} :{' '}
              {seconds.toString().length < 2 ? '0' + seconds : seconds}
            </Text>
          </View>
        )}
        <Text style={timerStyles}>{callAccepted ? callTimerStarted : 'INCOMING'}</Text>
        {renderBusyMessages(showAudioPipView, isIphoneX() ? 121 : 101)}
        {showAudioPipView && renderAudioCallButtons()}
        {!showAudioPipView && renderOnCallPipButtons('audio')}
        {!showAudioPipView && renderAudioFullScreen()}
      </View>
    );
  };
  const showMessage = (isPaused: any) => {
    if (downgradeToAudio) {
      return `Falling back to audio due to bad network!!`;
    }
    return `Doctor’s ${isPaused} ${isPaused.indexOf('/') > -1 ? 'are' : 'is'} Paused`;
  };
  const renderBusyMessages = (showPip: boolean, insetTop: any) => {
    return (
      <>
        {isPaused !== '' ? (
          <View
            style={{
              position: 'absolute',
              marginTop: showPip ? insetTop : 25,
              zIndex: 1005,
              justifyContent: showPip ? 'center' : 'flex-start',
              width: showPip ? width : 155,
              alignItems: showPip ? 'center' : 'flex-start',
            }}
          >
            <View
              style={{
                backgroundColor: 'white',
                paddingTop: 2,
                paddingBottom: Platform.OS === 'ios' ? 3 : 5,
                justifyContent: showPip ? 'center' : 'flex-start',
                alignItems: showPip ? 'center' : 'flex-start',
                paddingHorizontal: 10,
                marginTop: 2,
                marginHorizontal: 16,
                borderRadius: 100,
              }}
            >
              <Text
                style={{
                  color: theme.colors.APP_RED,
                  ...theme.fonts.IBMPlexSansSemiBold(12),
                  textAlign: 'center',
                  padding: 0,
                  flexWrap: 'wrap',
                }}
              >
                {showMessage(isPaused)}
              </Text>
            </View>
          </View>
        ) : null}
      </>
    );
  };

  const renderAudioFullScreen = () => {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: 205,
          width: 155,
          backgroundColor: 'transparent',
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            changeAudioStyles();
            setHideStatusBar(true);
          }}
        >
          <View
            style={{
              height: 205,
              width: 155,
              backgroundColor: 'transparent',
            }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const changeAudioStyles = () => {
    setAudioCallStyles({
      flex: 1,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
      backgroundColor: 'black',
    });
    setAudioCallImageStyles({
      width,
      height,
    });
    setShowAudioPipView(true);
    setTimerStyles({
      position: 'absolute',
      marginHorizontal: 20,
      marginTop: isIphoneX() ? 91 : 81,
      width: width - 40,
      color: 'white',
      ...theme.fonts.IBMPlexSansSemiBold(12),
      textAlign: 'center',
      letterSpacing: 0.46,
      zIndex: 1005,
    });
    setChatReceived(false);
    setSubscriberStyles({
      width,
      height,
    });
    setPublisherStyles({
      position: 'absolute',
      top: isIphoneX() ? 74 : 44,
      right: 20,
      width: 148,
      height: 112,
      zIndex: 1000,
      borderRadius: 30,
    });
    Keyboard.dismiss();
    setDropdownVisible(false);
  };

  const renderAudioCallButtons = () => {
    return (
      <>
        <Text
          style={{
            position: 'absolute',
            marginHorizontal: 20,
            marginTop: isIphoneX() ? 64 : 44,
            width: width - 40,
            color: 'white',
            ...theme.fonts.IBMPlexSansSemiBold(20),
            textAlign: 'center',
            left: 0,
            zIndex: 1001,
          }}
          numberOfLines={2}
        >
          {name == 'JUNIOR'
            ? appointmentData.doctorInfo.displayName + '`s' + ' team doctor '
            : appointmentData.doctorInfo.displayName}
        </Text>
        <View
          style={{
            position: 'absolute',
            top: isIphoneX() ? 64 : 44,
            left: 20,
            zIndex: 1006,
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setHideStatusBar(false);
              setChatReceived(false);
              setSubscriberStyles({
                width: 155,
                height: 205,
              });

              setPublisherStyles({
                position: 'absolute',
                top: 1,
                right: 1,
                width: 1,
                height: 1,
                zIndex: 1000,
              });

              setAudioCallStyles({
                flex: 1,
                position: 'absolute',
                top: 88,
                right: 8,
                height: 205,
                width: 155,
                backgroundColor: 'black',
              });
              setAudioCallImageStyles({
                height: 205,
                width: 155,
              });
              setShowAudioPipView(false);
              setTimerStyles({
                position: 'absolute',
                marginHorizontal: 5,
                marginTop: 5,
                width: 155,
                color: 'white',
                ...theme.fonts.IBMPlexSansSemiBold(12),
                textAlign: 'center',
                letterSpacing: 0.46,
                zIndex: 1005,
              });
            }}
          >
            {chatReceived ? (
              <ChatWithNotification style={{ height: 88, width: 88, left: -20, top: -20 }} />
            ) : (
              <ChatIcon style={{ height: 48, width: 48 }} />
            )}
          </TouchableOpacity>
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: 16,
            left: 58,
            right: 58,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            width: width - 116,
          }}
        >
          {/* <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <SpeakerOn style={{ width: 60, height: 60 }} />
          </TouchableOpacity> */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              isPublishAudio === true ? setIsPublishAudio(false) : setIsPublishAudio(true);
            }}
          >
            {isPublishAudio === true ? (
              <UnMuteIcon style={{ height: 60, width: 60 }} />
            ) : (
              <MuteIcon style={{ height: 60, width: 60 }} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              AsyncStorage.setItem('callDisconnected', 'true');
              setIsAudioCall(false);
              stopTimer();
              setHideStatusBar(false);
              setIsPublishAudio(true);
              setShowVideo(true);
              setCameraPosition('front');

              pubnub.publish(
                {
                  message: {
                    isTyping: true,
                    message: 'Audio call ended',
                    duration: callTimerStarted,
                    id: patientId,
                    messageDate: new Date(),
                  },
                  channel: channel,
                  storeInHistory: true,
                },
                (status, response) => {}
              );

              pubnub.publish(
                {
                  message: {
                    isTyping: true,
                    message: endCallMsg,
                    id: patientId,
                    messageDate: new Date(),
                  },
                  channel: channel,
                  storeInHistory: true,
                },
                (status, response) => {}
              );
            }}
          >
            <EndCallIcon style={{ width: 60, height: 60 }} />
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const endVoipCall = () => {
    if (isIos()) {
      RNCallKeep.endAllCalls();
    }
  };

  const renderOnCallPipButtons = (pipType: 'audio' | 'video') => {
    return (
      <View
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 1002,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            pipType === 'audio' && changeAudioStyles();
            pipType === 'video' && changeVideoStyles();
            setHideStatusBar(true);
          }}
        >
          <FullScreenIcon style={{ width: 40, height: 40 }} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            AsyncStorage.setItem('callDisconnected', 'true');
            pipType === 'audio' && setIsAudioCall(false);
            pipType === 'video' && setIsCall(false);
            setIsPublishAudio(true);
            setShowVideo(true);
            setCameraPosition('front');
            stopTimer();
            setHideStatusBar(false);

            pubnub.publish(
              {
                message: {
                  isTyping: true,
                  message: pipType === 'audio' ? 'Audio call ended' : 'Video call ended',
                  duration: callTimerStarted,
                  id: patientId,
                  messageDate: new Date(),
                },
                channel: channel,
                storeInHistory: true,
              },
              (status, response) => {}
            );

            pubnub.publish(
              {
                message: {
                  isTyping: true,
                  message: endCallMsg,
                  id: patientId,
                  messageDate: new Date(),
                },
                channel: channel,
                storeInHistory: true,
              },
              (status, response) => {}
            );
          }}
        >
          <EndCallIcon style={{ width: 40, height: 40, marginLeft: 43 }} />
        </TouchableOpacity>
      </View>
    );
  };

  const changeVideoStyles = () => {
    setTalkStyles({
      flex: 1,
      backgroundColor: 'black',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    });
    setSubscriberStyles({
      width,
      height,
    });
    setPublisherStyles({
      position: 'absolute',
      top: isIphoneX() ? 74 : 44,
      right: 20,
      width: 148,
      height: 112,
      zIndex: 1000,
      borderRadius: 30,
    });
    setPipView(false);
    setTimerStyles({
      position: 'absolute',
      marginHorizontal: 20,
      marginTop: isIphoneX() ? 91 : 81,
      width: width - 40,
      color: 'white',
      ...theme.fonts.IBMPlexSansSemiBold(12),
      textAlign: 'center',
      letterSpacing: 0.46,
      zIndex: 1005,
    });
    setChatReceived(false);
    Keyboard.dismiss();
    setDropdownVisible(false);
  };

  const renderChatNotificationIcon = () => {
    return (
      <View
        style={{
          position: 'absolute',
          top: isIphoneX() ? 64 : 44,
          left: 20,
          right: 0,
          zIndex: 1006,
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setTalkStyles({
              flex: 1,
              backgroundColor: 'black',
              position: 'absolute',
              top: 88,
              right: 20,
              width: 155,
              height: 205,
            });

            setSubscriberStyles({
              width: 155,
              height: 205,
            });

            setPublisherStyles({
              position: 'absolute',
              top: 1,
              right: 1,
              width: 1,
              height: 1,
              zIndex: 1000,
            });
            setTimerStyles({
              position: 'absolute',
              marginHorizontal: 5,
              marginTop: 5,
              width: 155,
              color: 'white',
              ...theme.fonts.IBMPlexSansSemiBold(12),
              textAlign: 'center',
              letterSpacing: 0.46,
              zIndex: 1005,
            });

            setPipView(true);
            setChatReceived(false);
            setHideStatusBar(false);
          }}
        >
          {chatReceived ? (
            <ChatWithNotification style={{ height: 88, width: 88, left: -20, top: -20 }} />
          ) : (
            <ChatIcon style={{ height: 48, width: 48 }} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderBottomButtons = () => {
    return (
      <View
        style={{
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <View
          style={{
            marginHorizontal: Platform.OS === 'ios' ? 30 : 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              cameraPosition === 'front' ? setCameraPosition('back') : setCameraPosition('front');
            }}
          >
            {cameraPosition === 'front' ? (
              <BackCameraIcon style={{ height: 60, width: 60 }} />
            ) : (
              <FrontCameraIcon style={{ height: 60, width: 60 }} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              showVideo === true ? setShowVideo(false) : setShowVideo(true);
            }}
          >
            {showVideo === true ? (
              <VideoOnIcon style={{ height: 60, width: 60 }} />
            ) : (
              <VideoOffIcon style={{ height: 60, width: 60 }} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              isPublishAudio === true ? setIsPublishAudio(false) : setIsPublishAudio(true);
            }}
          >
            {isPublishAudio === true ? (
              <UnMuteIcon style={{ height: 60, width: 60 }} />
            ) : (
              <MuteIcon style={{ height: 60, width: 60 }} />
            )}
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={1} onPress={() => handleEndCall()}>
            <EndCallIcon style={{ height: 60, width: 60 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleEndCall = () => {
    AsyncStorage.setItem('callDisconnected', 'true');
    setIsCall(false);
    setIsPublishAudio(true);
    setShowVideo(true);
    setCameraPosition('front');
    stopTimer();
    setHideStatusBar(false);
    setChatReceived(false);

    pubnub.publish(
      {
        message: {
          isTyping: true,
          message: 'Video call ended',
          duration: callTimerStarted,
          id: patientId,
          messageDate: new Date(),
        },
        channel: channel,
        storeInHistory: true,
      },
      (status, response) => {}
    );

    pubnub.publish(
      {
        message: {
          isTyping: true,
          message: endCallMsg,
          id: patientId,
          messageDate: new Date(),
        },
        channel: channel,
        storeInHistory: true,
      },
      (status, response) => {}
    );
  };

  const IncomingCallView = () => {
    return (
      <View
        style={{
          position: 'absolute',
          top: 88,
          right: 8,
          width: 155,
          height: 205,
          borderRadius: 30,
          backgroundColor: 'black',
        }}
      >
        {appointmentData.doctorInfo.photoUrl &&
        appointmentData.doctorInfo.photoUrl.match(urlRegEx) ? (
          <Image
            source={{ uri: appointmentData.doctorInfo.photoUrl }}
            resizeMode={'contain'}
            style={{
              width: 155,
              height: 205,
              opacity: 0.8,
              borderRadius: 30,
            }}
          />
        ) : (
          <DoctorPlaceholderImage
            style={{
              width: 155,
              height: 205,
              opacity: 0.8,
              borderRadius: 30,
            }}
          />
        )}
        {/* <DoctorCall
          style={{
            width: 155,
            height: 205,
            opacity: 0.5,
            borderRadius: 30,
          }}
        /> */}
        <Text
          style={{
            position: 'absolute',
            marginLeft: 0,
            marginTop: 16,
            width: 155,
            color: 'white',
            ...theme.fonts.IBMPlexSansMedium(14),
            textAlign: 'center',
            letterSpacing: 0,
          }}
        >
          Incoming Call
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            width: 40,
            height: 40,
            bottom: 16,
            left: 58,
            position: 'absolute',
          }}
          onPress={() => {
            callPermissions(() => {
              AsyncStorage.setItem('callDisconnected', 'false');
              setOnSubscribe(false);
              stopTimer();
              startTimer(0);
              setCallAccepted(true);
              setHideStatusBar(true);
              setChatReceived(false);
              Keyboard.dismiss();
              stopSound();
              changeAudioStyles();
              setConvertVideo(false);
              setDowngradeToAudio(false);
              changeVideoStyles();
              setDropdownVisible(false);
              setCallerAudio(true);
              setCallerVideo(true);
              if (token) {
                PublishAudioVideo();
              } else {
                APICallAgain();
              }
            });
          }}
        >
          <PickCallIcon
            style={{
              width: 40,
              height: 40,
              top: 0,
              left: 0,
              // position: 'absolute',
            }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const APICallAgain = () => {
    const input = {
      appointmentId: appointmentData.id,
      requestRole: 'PATIENT',
    };

    console.log('input', input);

    client
      .mutate<updateAppointmentSession, updateAppointmentSessionVariables>({
        mutation: UPDATE_APPOINTMENT_SESSION,
        variables: {
          UpdateAppointmentSessionInput: input,
        },
      })
      .then((sessionInfo: any) => {
        console.log('createsession', sessionInfo);
        setsessionId(sessionInfo.data.updateAppointmentSession.sessionId);
        settoken(sessionInfo.data.updateAppointmentSession.appointmentToken);

        PublishAudioVideo();
      })
      .catch((e) => {
        CommonBugFender('ChatRoom_APICallAgain', e);
        console.log('Error occured while adding Doctor', e);
      });
  };

  const PublishAudioVideo = () => {
    console.log('PublishAudioVideo');

    pubnub.publish(
      {
        message: {
          isTyping: true,
          message: !patientJoinedCall.current ? acceptedCallMsg : patientJoinedMeetingRoom,
          messageDate: new Date(),
        },
        channel: channel,
        storeInHistory: false,
      },
      (status, response) => {}
    );
    AsyncStorage.setItem('callDisconnected', 'false');
    if (isAudio.current && !patientJoinedCall.current) {
      setIsAudioCall(true);
    } else {
      setIsCall(true);
    }
    setLoading(false);
  };

  const disconnectCallText = () => {
    pubnub.publish(
      {
        message: {
          isTyping: true,
          message: isAudio.current ? 'Audio call ended' : 'Video call ended',
          duration: callTimerStarted,
          id: patientId,
          messageDate: new Date(),
        },
        channel: channel,
        storeInHistory: true,
      },
      (status, response) => {}
    );

    pubnub.publish(
      {
        message: {
          isTyping: true,
          message: endCallMsg,
          id: patientId,
          messageDate: new Date(),
        },
        channel: channel,
        storeInHistory: true,
      },
      (status, response) => {}
    );
  };

  const options = {
    quality: 0.1,
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };

  const uploadDocument = (resource: any, base66: any, type: any) => {
    CommonLogEvent(AppRoutes.ChatRoom, 'Upload document');
    resource.map((item: any) => {
      if (
        item.fileType == 'jpg' ||
        item.fileType == 'jpeg' ||
        item.fileType == 'pdf' ||
        item.fileType == 'png'
      ) {
        const formattedDate = moment(new Date()).format('YYYY-MM-DD');
        const prescriptionFile: MediaPrescriptionFileProperties = {
          fileName: item.title + '.' + item.fileType,
          mimeType: mimeType(item.title + '.' + item.fileType),
          content: item.base64,
        };
        const inputData: MediaPrescriptionUploadRequest = {
          prescribedBy: appointmentData.doctorInfo.displayName,
          dateOfPrescription: formattedDate,
          startDate: null,
          endDate: null,
          prescriptionSource: mediaPrescriptionSource.SELF,
          prescriptionFiles: [prescriptionFile],
        };
        console.log('MediaPrescriptionUploadRequest', inputData);
        setLoading(true);
        client
          .mutate({
            mutation: UPLOAD_MEDIA_DOCUMENT_PRISM,
            fetchPolicy: 'no-cache',
            variables: {
              MediaPrescriptionUploadRequest: inputData,
              uhid: g(currentPatient, 'uhid'),
              appointmentId: appointmentData.id,
            },
          })
          .then((data) => {
            console.log('upload data', data);
            setLoading(false);
            const recordId = g(data.data!, 'uploadMediaDocument', 'recordId');
            if (recordId) {
              getPrismUrls(client, patientId, [recordId])
                .then((data: any) => {
                  console.log('api call data', data);
                  const text = {
                    id: patientId,
                    message: imageconsult,
                    fileType: ((data.urls && data.urls[0]) || '').match(/\.(pdf)$/)
                      ? 'pdf'
                      : 'image',
                    prismId: recordId,
                    url: (data.urls && data.urls[0]) || '',
                    messageDate: new Date(),
                  };
                  pubnub.publish(
                    {
                      channel: channel,
                      message: text,
                      storeInHistory: true,
                      sendByPost: true,
                    },
                    (status, response) => {
                      if (status.statusCode == 200) {
                        HereNowPubnub('ImageUploaded');
                      }
                    }
                  );
                  KeepAwake.activate();
                })
                .catch((e) => {
                  CommonBugFender('ChatRoom_getPrismUrls_uploadDocument', e);
                  console.log('Error occured', e);
                })
                .finally(() => {
                  setLoading(false);
                });
            } else {
              Alert.alert('Upload document failed');
            }
          })
          .catch((e) => {
            CommonBugFender('ChatRoom_uploadDocument', e);
            setLoading(false);
            KeepAwake.activate();
            console.log('upload data error', e);
          });
      } else {
        setwrongFormat(true);
      }
    });

    // const textin = {
    //   fileType: type,
    //   base64FileInput: base66, //resource.data,
    //   appointmentId: channel,
    // };
    // console.log('textin', textin);
    // client
    //   .mutate<uploadChatDocumentToPrism>({
    //     mutation: UPLOAD_CHAT_FILE_PRISM,
    //     fetchPolicy: 'no-cache',
    //     variables: {
    //       fileType: UPLOAD_FILE_TYPES.JPEG, //type.toUpperCase(),
    //       base64FileInput: base66, //resource.data,
    //       appointmentId: channel,
    //       patientId: currentPatient && currentPatient.id,
    //     },
    //   })
    //   .then((data) => {
    //     console.log('upload data', data);
    //     setLoading(false);

    //     // const text = {
    //     //   id: patientId,
    //     //   message: imageconsult,
    //     //   fileType: 'image',
    //     //   url: data.data && data.data.uploadChatDocument.filePath,
    //     // };

    //     // pubnub.publish(
    //     //   {
    //     //     channel: channel,
    //     //     message: text,
    //     //     storeInHistory: true,
    //     //     sendByPost: true,
    //     //   },
    //     //   (status, response) => {}
    //     // );
    //     // KeepAwake.activate();
    //   })
    //   .catch((e) => {
    //     setLoading(false);
    //     KeepAwake.activate();
    //     console.log('upload data error', e);
    //   });
    // try {
    //   const fileType = resource.uri!.substring(resource.uri!.lastIndexOf('.') + 1);
    //   console.log('upload fileType', fileType);
    //   setLoading(true);
    //   console.log('upload fileType', base66);
    //   console.log('upload fileType', type);
    //   console.log('upload fileType', channel);
    //   client
    //     .mutate<uploadChatDocument, uploadChatDocumentVariables>({
    //       mutation: UPLOAD_CHAT_FILE,
    //       fetchPolicy: 'no-cache',
    //       variables: {
    //         fileType: type,
    //         base64FileInput: base66, //resource.data,
    //         appointmentId: channel,
    //       },
    //     })
    //     .then((data) => {
    //       console.log('upload data', data);
    //       setLoading(false);

    //       const text = {
    //         id: patientId,
    //         message: imageconsult,
    //         fileType: 'image',
    //         url: data.data && data.data.uploadChatDocument.filePath,
    //       };

    //       pubnub.publish(
    //         {
    //           channel: channel,
    //           message: text,
    //           storeInHistory: true,
    //           sendByPost: true,
    //         },
    //         (status, response) => {}
    //       );
    //       KeepAwake.activate();
    //     })
    //     .catch((e) => {
    //       setLoading(false);
    //       KeepAwake.activate();
    //       console.log('upload data error', e);
    //     });
    // } catch (error) {
    //   setLoading(false);
    // }
  };

  const uploadPrescriptionPopup = () => {
    return (
      <UploadPrescriprionPopup
        heading="Attach File(s)"
        instructionHeading="Instructions For Uploading Files"
        instructions={[
          'Take clear Picture of your entire file.',
          'Doctor details & date of the test should be clearly visible.',
          'Only JPG / PNG type files up to 2 mb are allowed',
        ]}
        isVisible={isDropdownVisible}
        disabledOption={'NONE'}
        blockCamera={isCall}
        blockCameraMessage={strings.alerts.Open_camera_in_video_call}
        optionTexts={{
          camera: 'TAKE A PHOTO',
          gallery: 'CHOOSE FROM\nGALLERY',
          prescription: 'UPLOAD\nFROM PHR',
        }}
        hideTAndCs={true}
        onClickClose={() => setDropdownVisible(false)}
        onResponse={(selectedType, response) => {
          console.log('res', response);
          setDropdownVisible(false);
          if (selectedType == 'CAMERA_AND_GALLERY') {
            console.log('ca');

            uploadDocument(response, response[0].base64, response[0].fileType);
            //updatePhysicalPrescriptions(response);
          } else {
            setSelectPrescriptionVisible(true);
          }
        }}
      />
    );
  };
  const renderPrescriptionModal = () => {
    return (
      <SelectEPrescriptionModal
        displayPrismRecords={true}
        navigation={props.navigation}
        onSubmit={(selectedEPres) => {
          console.log('selectedEPres', selectedEPres);
          setSelectPrescriptionVisible(false);
          if (selectedEPres.length == 0) {
            return;
          } else {
            selectedEPres.forEach((item) => {
              console.log(item, 'from selected');

              const url = item.uploadedUrl ? item.uploadedUrl : '';
              const prism = item.prismPrescriptionFileId ? item.prismPrescriptionFileId : '';
              // url &&
              //   url.map((item, index) => {
              if (url) {
                setLoading(true);
                client
                  .mutate({
                    mutation: ADD_CHAT_DOCUMENTS,
                    fetchPolicy: 'no-cache',
                    variables: {
                      prismFileId: prism,
                      documentPath: url,
                      appointmentId: appointmentData.id,
                    },
                  })
                  .then((data) => {
                    console.log('ADD_CHAT_DOCUMENTS data', data);
                    const prismFieldId = g(data.data!, 'addChatDocument', 'prismFileId');
                    const documentPath = g(data.data!, 'addChatDocument', 'documentPath');

                    const text = {
                      id: patientId,
                      message: imageconsult,
                      fileType: (documentPath ? documentPath : url).match(/\.(pdf)$/)
                        ? 'pdf'
                        : 'image',
                      prismId: (prismFieldId ? prismFieldId : prism) || '',
                      url: documentPath ? documentPath : url,
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
                    KeepAwake.activate();
                    setLoading(false);
                  })
                  .catch((e) => {
                    CommonBugFender('ChatRoom_getPrismUrls_uploadDocument', e);
                    console.log('Error occured', e);
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }
              // });
              item.message &&
                pubnub.publish(
                  {
                    channel: channel,
                    message: {
                      id: patientId,
                      message: item.message,
                      type: 'PHR',
                      messageDate: new Date(),
                    },
                    storeInHistory: true,
                    sendByPost: true,
                  },
                  (status, response) => {
                    if (status.statusCode == 200) {
                      HereNowPubnub('EprescriptionUploaded');
                      // InsertMessageToDoctor('EprescriptionUploaded');
                    }
                  }
                );
            });
          }
          //setEPrescriptions && setEPrescriptions([...selectedEPres]);
        }}
        //selectedEprescriptionIds={ePrescriptions.map((item) => item.id)}
        isVisible={true}
      />
    );
  };
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime - minutes * 60;
  const closeviews = () => {
    setPatientImageshow(false);
    setShowWeb(false);
  };
  const renderCloseIcon = () => {
    return (
      <View
        style={{
          alignSelf: 'flex-end',
          backgroundColor: 'transparent',
          marginRight: 16,
          marginTop: 30,
        }}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => closeviews()}>
          <CrossPopup style={{ marginRight: 1, width: 28, height: 28 }} />
        </TouchableOpacity>
      </View>
    );
  };
  const imageOpen = () => {
    return (
      <View
        style={{
          flex: 1,
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'black',
            opacity: 0.6,
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        />
        {renderCloseIcon()}
        <ImageReact
          style={{
            flex: 1,
            resizeMode: 'contain',
            marginTop: 20,
            marginHorizontal: 20,
            marginBottom: 20,
            borderRadius: 10,
          }}
          source={{ uri: url }}
        />
      </View>
    );
  };
  const showWeimageOpen = () => {
    return (
      <View
        style={{
          flex: 1,
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'black',
            opacity: 0.6,
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        />
        {renderCloseIcon()}
        <WebView
          style={{
            // flex: 1,
            //resizeMode: 'stretch',
            marginTop: 20,
            marginHorizontal: 20,
            marginBottom: 20,
            borderRadius: 10,
          }}
          source={{ uri: url }}
        />
      </View>
    );
  };

  const postRatingGivenWEGEvent = (
    rating: string,
    reason: string,
    data:
      | getAppointmentData_getAppointmentData_appointmentsHistory
      | getPatinetAppointments_getPatinetAppointments_patinetAppointments = appointmentData
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULT_FEEDBACK_GIVEN] = {
      'Doctor Name': g(data, 'doctorInfo', 'fullName')!,
      'Speciality ID': g(data, 'doctorInfo', 'specialty', 'id')!,
      'Speciality Name': g(data, 'doctorInfo', 'specialty', 'name')!,
      'Doctor Category': g(data, 'doctorInfo', 'doctorType')!,
      'Consult Date Time': moment(g(data, 'appointmentDateTime')).toDate(),
      'Consult Mode': g(data, 'appointmentType') == APPOINTMENT_TYPE.ONLINE ? 'Online' : 'Physical',
      'Hospital Name': g(data, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'name')!,
      'Hospital City': g(data, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'city')!,
      'Consult ID': g(data, 'id')!,
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Customer ID': g(currentPatient, 'id'),
      Rating: rating,
      'Rating Reason': reason,
    };
    postWebEngageEvent(WebEngageEventName.CONSULT_FEEDBACK_GIVEN, eventAttributes);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
      <StatusBar hidden={hideStatusBar} />
      {Platform.OS === 'ios' ? (
        <View
          style={{
            width: width,
            height: 24,
            backgroundColor: '#f0f1ec',
            zIndex: 100,
            elevation: 1000,
          }}
        />
      ) : null}
      {displayUploadHealthRecords ? (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1001,
            backgroundColor: '#000',
            opacity: 0.85,
            justifyContent: 'flex-end',
          }}
          activeOpacity={1}
          onPress={() => {
            setDisplayUploadHealthRecords(false);
            AsyncStorage.setItem(appointmentData.id, appointmentData.id);
          }}
        >
          <View
            style={{
              left: 35,
            }}
          >
            <Text
              style={{
                ...theme.viewStyles.text('M', 15, '#fff', 1, undefined, -0.07),
                paddingRight: 61,
              }}
            >
              {'Upload and share your health records with doctor here.'}
            </Text>
            <FreeArrowIcon style={{ width: 33, height: 33, marginTop: 4, marginBottom: -6 }} />
          </View>
          <View
            style={{
              width: width,
              height: 66,
              backgroundColor: 'transparent',
              bottom: 0,
              top: isIphoneX() ? 2 : 0,
              paddingBottom: isIphoneX() ? 100 : 0,
            }}
          >
            <View style={{ flexDirection: 'row', width: width }}>
              <TouchableOpacity
                activeOpacity={1}
                style={{
                  width: 50,
                  height: 50,
                  marginTop: 10,
                  marginLeft: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                }}
                onPress={async () => {
                  CommonLogEvent(AppRoutes.ChatRoom, 'Upload document clicked.');
                  setDropdownVisible(!isDropdownVisible);
                  setDisplayUploadHealthRecords(false);
                  AsyncStorage.setItem(appointmentData.id, appointmentData.id);
                }}
              >
                <UploadHealthRecords
                  style={{ width: 21, height: 21, backgroundColor: 'transparent' }}
                />
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 7, '#fff', 1, undefined, -0.03),
                    marginTop: 5,
                    textAlign: 'center',
                  }}
                >
                  {'Upload Records'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ) : null}
      <SafeAreaView
        style={{
          ...theme.viewStyles.container,
        }}
      >
        <Header
          title={'CONSULT ROOM'}
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0, zIndex: 100 }}
          onPressLeftIcon={() => {
            if (callhandelBack) {
              // handleCallTheEdSessionAPI();
              setDoctorJoinedChat && setDoctorJoinedChat(false);
              props.navigation.dispatch(
                StackActions.reset({
                  index: 0,
                  key: null,
                  actions: [NavigationActions.navigate({ routeName: AppRoutes.TabBar })],
                })
              );
            }
          }}
          // onPressLeftIcon={() => props.navigation.goBack()}
        />
        {renderChatHeader()}
        {doctorJoinedChat && renderJoinCallHeader()}
        {doctorJoined ? (
          <View
            style={{
              width: width,
              height: 44,
              flexDirection: 'row',
              alignItems: 'center',
              ...theme.viewStyles.cardViewStyle,
              borderRadius: 0,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 2,
              elevation: 17,
              zIndex: 100,
              backgroundColor: '#ff748e',
              position: 'absolute',
              top: isIphoneX() ? 74 : Platform.OS === 'ios' ? 54 : 54,
            }}
          >
            <Text
              style={{
                color: 'white',
                ...theme.fonts.IBMPlexSansMedium(13),
                marginLeft: 20,
              }}
            >
              {jrDoctorJoined.current
                ? `${appointmentData.doctorInfo.displayName}'s team doctor has joined`
                : `${appointmentData.doctorInfo.displayName} has joined!`}
            </Text>
          </View>
        ) : null}
        {renderChatView()}
        {Platform.OS == 'ios' ? (
          <View
            style={{
              width: width,
              height: 66,
              backgroundColor: 'white',
              bottom: isIphoneX() ? 36 : 0,
              top: isIphoneX() ? 2 : 0,
              opacity: disableChat ? 0.5 : 1,
            }}
          >
            <View style={{ flexDirection: 'row', width: width }}>
              <TouchableOpacity
                activeOpacity={1}
                style={{
                  width: 50,
                  height: 50,
                  marginTop: 10,
                  marginLeft: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={async () => {
                  if (!disableChat) {
                    CommonLogEvent(AppRoutes.ChatRoom, 'Upload document clicked.');
                    setDropdownVisible(!isDropdownVisible);
                  }
                }}
              >
                <UploadHealthRecords
                  style={{ width: 21, height: 21, backgroundColor: 'transparent' }}
                />
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 7, '#01475b', 1, undefined, -0.03),
                    marginTop: 5,
                    textAlign: 'center',
                  }}
                >
                  {'Upload Records'}
                </Text>
              </TouchableOpacity>
              <View>
                <TextInput
                  autoCorrect={false}
                  placeholder="Type here…"
                  multiline={true}
                  style={{
                    marginLeft: 6,
                    marginTop: 5,
                    height: 40,
                    width: width - 120,
                    ...theme.fonts.IBMPlexSansMedium(16),
                  }}
                  value={messageText}
                  blurOnSubmit={false}
                  // returnKeyType="send"
                  onChangeText={(value) => {
                    setMessageText(value);
                    setDropdownVisible(false);
                  }}
                  onFocus={() => setDropdownVisible(false)}
                  editable={!disableChat}
                />
                <View
                  style={{
                    marginLeft: 6,
                    marginTop: 0,
                    height: 2,
                    width: width - 120,
                    backgroundColor: '#00b38e',
                  }}
                />
              </View>
              <TouchableOpacity
                activeOpacity={1}
                style={{
                  width: 40,
                  height: 40,
                  marginTop: 10,
                  marginLeft: 2,
                }}
                onPress={async () => {
                  if (!disableChat) {
                    const textMessage = messageText.trim();

                    if (textMessage.length == 0) {
                      Alert.alert('Apollo', 'Please write something to send message.');
                      CommonLogEvent(AppRoutes.ChatRoom, 'Please write something to send message.');
                      return;
                    }
                    CommonLogEvent(AppRoutes.ChatRoom, 'Message sent clicked');

                    send(textMessage);
                  }
                }}
              >
                <ChatSend style={{ width: 24, height: 24, marginTop: 8, marginLeft: 14 }} />
              </TouchableOpacity>
            </View>
            {displayChatQuestions && Platform.OS === 'ios' && (
              <ChatQuestions
                onItemDone={(value: { k: string; v: string[] }) => {
                  console.log('and....', value);
                  setAnswerData([value]);
                }}
                onDonePress={(values: { k: string; v: string[] }[]) => {
                  setAnswerData(values);
                  setDisplayChatQuestions(false);
                  setDisplayUploadHealthRecords(true);
                }}
              />
            )}
          </View>
        ) : (
          //  <KeyboardAvoidingView behavior="padding" enabled>
          <View
            style={{
              width: width,
              height: 66,
              backgroundColor: 'white',
              bottom: isIphoneX() ? 36 : 0,
              opacity: disableChat ? 0.5 : 1,
            }}
          >
            <View style={{ flexDirection: 'row', width: width }}>
              <TouchableOpacity
                activeOpacity={1}
                style={{
                  width: 50,
                  height: 50,
                  marginTop: 10,
                  marginLeft: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={async () => {
                  if (!disableChat) {
                    CommonLogEvent(AppRoutes.ChatRoom, 'Upload document clicked.');
                    setDropdownVisible(!isDropdownVisible);
                  }
                }}
              >
                <UploadHealthRecords
                  style={{ width: 21, height: 21, backgroundColor: 'transparent' }}
                />
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 7, '#01475b', 1, undefined, -0.03),
                    marginTop: 5,
                    textAlign: 'center',
                  }}
                >
                  {'Upload Records'}
                </Text>
              </TouchableOpacity>
              <View>
                <TextInput
                  autoCorrect={false}
                  placeholder="Type here…"
                  multiline={true}
                  style={{
                    marginLeft: 6,
                    marginTop: 5,
                    height: 40,
                    width: width - 120,
                    ...theme.fonts.IBMPlexSansMedium(16),
                  }}
                  value={messageText}
                  blurOnSubmit={false}
                  // returnKeyType="send"
                  onChangeText={(value) => {
                    setMessageText(value);
                    setDropdownVisible(false);
                  }}
                  onFocus={() => setDropdownVisible(false)}
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                  }}
                  editable={!disableChat}
                />
                <View
                  style={{
                    marginLeft: 6,
                    marginTop: 0,
                    height: 2,
                    width: width - 120,
                    backgroundColor: '#00b38e',
                  }}
                />
              </View>
              <TouchableOpacity
                activeOpacity={1}
                style={{
                  width: 40,
                  height: 40,
                  marginTop: 10,
                  marginLeft: 2,
                }}
                onPress={async () => {
                  if (!disableChat) {
                    const textMessage = messageText.trim();

                    if (textMessage.length == 0) {
                      Alert.alert('Apollo', 'Please write something to send message.');
                      CommonLogEvent(AppRoutes.ChatRoom, 'Please write something to send message.');
                      return;
                    }
                    CommonLogEvent(AppRoutes.ChatRoom, 'Message sent clicked');

                    send(textMessage);
                  }
                }}
              >
                <ChatSend style={{ width: 24, height: 24, marginTop: 8, marginLeft: 14 }} />
              </TouchableOpacity>
            </View>
          </View>
        )
        // </KeyboardAvoidingView>
        }

        {displayChatQuestions && Platform.OS === 'android' && (
          <ChatQuestions
            onItemDone={(value: { k: string; v: string[] }) => {
              console.log('and', value);
              setAnswerData([value]);
            }}
            onDonePress={(values: { k: string; v: string[] }[]) => {
              setAnswerData(values);
              setDisplayChatQuestions(false);
              setDisplayUploadHealthRecords(true);
            }}
          />
        )}
      </SafeAreaView>
      {onSubscribe && IncomingCallView()}
      {isCall && VideoCall()}
      {isAudioCall && AudioCall()}
      {transferAccept && (
        <BottomPopUp
          title={'Please wait :)'}
          description={`We’re taking you to Dr. ${transferDcotorName}'s consult room.`}
        >
          <Loader
            style={{
              marginTop: 19,
              marginBottom: 21,
              marginLeft: width - 96,
              width: 76,
              height: 26,
              resizeMode: 'contain',
            }}
          />
        </BottomPopUp>
      )}
      {bottompopup && (
        <BottomPopUp
          title={'Hi:)'}
          description="Opps ! The selected slot is unavailable. Please choose a different one"
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              activeOpacity={1}
              style={{
                height: 60,
                paddingRight: 25,
                backgroundColor: 'transparent',
              }}
              onPress={() => {
                setBottompopup(false);
                props.navigation.dispatch(
                  StackActions.reset({
                    index: 0,
                    key: null,
                    actions: [
                      NavigationActions.navigate({
                        routeName: AppRoutes.TabBar,
                      }),
                    ],
                  })
                );
              }}
            >
              <Text
                style={{
                  paddingTop: 16,
                  ...theme.viewStyles.yellowTextStyle,
                }}
              >
                OK, GOT IT
              </Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
      {wrongFormat && (
        <BottomPopUp
          title={'Hi:)'}
          description="Opps ! The selected jpg format is unsupport. Please choose a different one"
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              activeOpacity={1}
              style={{
                height: 60,
                paddingRight: 25,
                backgroundColor: 'transparent',
              }}
              onPress={() => {
                setwrongFormat(false);
                setDropdownVisible(false);
              }}
            >
              <Text
                style={{
                  paddingTop: 16,
                  ...theme.viewStyles.yellowTextStyle,
                }}
              >
                OK, GOT IT
              </Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
      {showDoctorNoShowAlert && (
        <BottomPopUp
          title={`Hi ${userName},`}
          description={`Due to an emergency, ${appointmentData.doctorInfo.displayName} had to reschedule your appointment to the next available slot. Confirm Slot`}
        >
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: 20,
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginVertical: 18,
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.claimStyles}
              onPress={() => {
                setShowDoctorNoShowAlert(false);
              }}
            >
              <Text style={styles.rescheduleTextStyles}>{'CLAIM REFUND'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.rescheduletyles}
              onPress={() => {
                NextAvailableSlot(appointmentData, 'Transfer', true);
                setShowDoctorNoShowAlert(false);
              }}
            >
              <Text style={[styles.rescheduleTextStyles, { color: 'white' }]}>{'RESCHEDULE'}</Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
      {showPopup && (
        <BottomPopUp
          title={`Hi ${userName}`}
          description={`we’re really sorry. ${appointmentData.doctorInfo.displayName} will not be able to make it for this appointment. Any payment that you have made for this consultation would be refunded in 2-4 working days. We request you to please book appointment with any of our other Apollo certified doctors`}
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              activeOpacity={1}
              style={{
                height: 60,
                paddingRight: 25,
                backgroundColor: 'transparent',
              }}
              onPress={() => {
                setBottompopup(false);
                props.navigation.dispatch(
                  StackActions.reset({
                    index: 0,
                    key: null,
                    actions: [
                      NavigationActions.navigate({
                        routeName: AppRoutes.TabBar,
                      }),
                    ],
                  })
                );
              }}
            >
              <Text
                style={{
                  paddingTop: 16,
                  ...theme.viewStyles.yellowTextStyle,
                }}
              >
                OK, GOT IT
              </Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
      {showCallAbandmentPopup && (
        <BottomPopUp
          title={`Hi ${userName}`}
          description={`we’re really sorry. ${appointmentData.doctorInfo.displayName} has to reschedule your call due to some technical issues. Please reschedule the appointment.`}
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              activeOpacity={1}
              style={{
                height: 60,
                paddingRight: 25,
                backgroundColor: 'transparent',
              }}
              onPress={() => {
                setBottompopup(false);
                props.navigation.dispatch(
                  StackActions.reset({
                    index: 0,
                    key: null,
                    actions: [
                      NavigationActions.navigate({
                        routeName: AppRoutes.TabBar,
                      }),
                    ],
                  })
                );
              }}
            >
              <Text
                style={{
                  paddingTop: 16,
                  ...theme.viewStyles.yellowTextStyle,
                }}
              >
                OK, GOT IT
              </Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
      {sucesspopup && (
        <BottomPopUp title={`Hi, ${userName} :)`} description={'Appointment sucessfully cancelled'}>
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: 20,
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
            }}
          >
            <View style={{ height: 60 }}>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.gotItStyles}
                onPress={() => {
                  setSucessPopup(false);
                  props.navigation.dispatch(
                    StackActions.reset({
                      index: 0,
                      key: null,
                      actions: [NavigationActions.navigate({ routeName: AppRoutes.TabBar })],
                    })
                  );
                }}
              >
                <Text style={styles.gotItTextStyles}>{'OK, GOT IT'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomPopUp>
      )}
      {displayoverlay && transferData && (
        <OverlayRescheduleView
          setdisplayoverlay={() => setdisplayoverlay(false)}
          navigation={props.navigation}
          doctor={transferData ? transferData.doctorInfo : appointmentData.doctorInfo}
          patientId={currentPatient ? currentPatient.id : ''}
          clinics={
            transferData
              ? transferData.doctorInfo.doctorHospital
              : appointmentData.doctorInfo.doctorHospital
          }
          doctorId={doctorScheduleId}
          renderTab={
            appointmentData.appointmentType === 'ONLINE' ? 'Consult Online' : 'Visit Clinic'
          }
          rescheduleCount={newRescheduleCount && newRescheduleCount}
          appointmentId={
            transferData
              ? transferData.appointmentId
                ? transferData.appointmentId
                : transferData.id
              : appointmentData.id
          }
          data={transferData ? transferData : appointmentData}
          bookFollowUp={false}
          KeyFollow={'RESCHEDULE'}
          isfollowupcount={0}
          isInitiatedByDoctor={rescheduleInitiatedBy === REQUEST_ROLES.DOCTOR ? true : false}
        />
      )}
      {uploadPrescriptionPopup()}
      {isSelectPrescriptionVisible && renderPrescriptionModal()}
      {patientImageshow && imageOpen()}
      {showweb && showWeimageOpen()}
      <FeedbackPopup
        onComplete={(ratingStatus, ratingOption) => {
          postRatingGivenWEGEvent(ratingStatus!, ratingOption);
          setShowFeedback(false);
          showAphAlert!({
            title: 'Thanks :)',
            description: 'Your feedback has been submitted. Thanks for your time.',
          });
        }}
        transactionId={channel}
        title="We value your feedback! :)"
        description="How was your overall experience with the following consultation —"
        info={{
          title: `${g(appointmentData, 'doctorInfo', 'displayName') || ''}`,
          description: `Today, ${moment(appointmentData.appointmentDateTime).format('hh:mm A')}`,
          photoUrl: `${g(appointmentData, 'doctorInfo', 'photoUrl') || ''}`,
        }}
        type={FEEDBACKTYPE.CONSULT}
        isVisible={showFeedback}
      />
      {loading && <Spinner />}
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
      {showConnectAlertPopup && (
        <CustomAlert
          description={`Have you consulted with ${appointmentData.doctorInfo.displayName} before?`}
          onNoPress={() => {
            setShowConnectAlertPopup(false);
            getUpdateExternalConnect(false);
          }}
          onYesPress={() => {
            setShowConnectAlertPopup(false);
            getUpdateExternalConnect(true);
          }}
        />
      )}
      <Snackbar
        style={{ marginBottom: 100, zIndex: 1001 }}
        visible={snackbarState}
        onDismiss={() => {
          setSnackbarState(false);
        }}
        duration={5000}
      >
        {handlerMessage}
      </Snackbar>
    </View>
  );
};
