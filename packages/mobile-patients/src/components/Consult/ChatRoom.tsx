import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DropDown } from '@aph/mobile-patients/src/components/ui/DropDown';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  AddAttachmentIcon,
  BackCameraIcon,
  ChatCallIcon,
  ChatIcon,
  ChatSend,
  ChatWithNotification,
  DoctorCall,
  DoctorImage,
  EndCallIcon,
  FrontCameraIcon,
  FullScreenIcon,
  Loader,
  Mascot,
  MissedCallIcon,
  MuteIcon,
  PickCallIcon,
  UnMuteIcon,
  VideoOffIcon,
  VideoOnIcon,
  FileBig,
  Remove,
  CrossPopup,
  DoctorPlaceholderImage,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import {
  DeviceHelper,
  CommonScreenLog,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  BOOK_APPOINTMENT_RESCHEDULE,
  BOOK_APPOINTMENT_TRANSFER,
  UPDATE_APPOINTMENT_SESSION,
  UPLOAD_CHAT_FILE,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  bookTransferAppointment,
  bookTransferAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/bookTransferAppointment';
import {
  BookTransferAppointmentInput,
  TRANSFER_INITIATED_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  updateAppointmentSession,
  updateAppointmentSessionVariables,
} from '@aph/mobile-patients/src/graphql/types/updateAppointmentSession';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import { OTPublisher, OTSession, OTSubscriber } from 'opentok-react-native';
import Pubnub from 'pubnub';
import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  AsyncStorage,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  Linking,
  NativeModules,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  BackHandler,
  WebView,
} from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';
import ImagePicker from 'react-native-image-picker';
import InCallManager from 'react-native-incall-manager';
import KeepAwake from 'react-native-keep-awake';
import SoftInputMode from 'react-native-set-soft-input-mode';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
// import {
//   addToConsultQueue,
//   addToConsultQueueVariables,
// } from '@aph/mobile-patients/src/graphql/types/addToConsultQueue';
import {
  bookRescheduleAppointment,
  bookRescheduleAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/bookRescheduleAppointment';
import {
  uploadChatDocument,
  uploadChatDocumentVariables,
} from '@aph/mobile-patients/src/graphql/types/uploadChatDocument';
import {
  addToConsultQueue,
  checkIfRescheduleAppointment,
  getNextAvailableSlots,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { OverlayRescheduleView } from '@aph/mobile-patients/src/components/Consult/OverlayRescheduleView';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';

const { ExportDeviceToken } = NativeModules;
const { height, width } = Dimensions.get('window');

const timer: number = 900;
let timerId: NodeJS.Timeout;
let diffInHours: number;

type rescheduleType = {
  rescheduleCount: number;
  appointmentState: string;
  isCancel: number;
  isFollowUp: number;
  isPaid: number;
};

export interface ChatRoomProps extends NavigationScreenProps {}
export const ChatRoom: React.FC<ChatRoomProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { isIphoneX } = DeviceHelper();

  // useEffect(() => {
  //   RNFetchBlob.config({
  //     // add this option that makes response data to be stored as a file,
  //     // this is much more performant.
  //     fileCache: true,
  //   })
  //     .fetch('GET', 'http://samples.leanpub.com/thereactnativebook-sample.pdf', {
  //       //some headers ..
  //     })
  //     .then((res) => {
  //       // the temp file path
  //       console.log('The file saved to res ', res);
  //       console.log('The file saved to ', res.path());
  //     });
  // }, []);
  const appointmentData = props.navigation.state.params!.data;
  // console.log('appointmentData', appointmentData);
  const callType = props.navigation.state.params!.callType
    ? props.navigation.state.params!.callType
    : '';

  // console.log('appointmentData', appointmentData);

  const flatListRef = useRef<FlatList<never> | undefined | null>();
  const otSessionRef = React.createRef();
  const textInput = React.createRef();

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState<string>('');
  const [heightList, setHeightList] = useState<number>(
    isIphoneX() ? height - 166 : Platform.OS === 'ios' ? height - 141 : height - 141
  );

  const [sessionId, setsessionId] = useState<string>('');
  const [token, settoken] = useState<string>('');
  const [cameraPosition, setCameraPosition] = useState<string>('front');
  const [mute, setMute] = useState<boolean>(true);
  const [showVideo, setShowVideo] = useState<boolean>(true);
  const [PipView, setPipView] = useState<boolean>(false);
  const [isCall, setIsCall] = useState<boolean>(false);
  const [onSubscribe, setOnSubscribe] = useState<boolean>(false);
  const [isAudio, setIsAudio] = useState<boolean>(false);
  const [isAudioCall, setIsAudioCall] = useState<boolean>(false);
  const [showAudioPipView, setShowAudioPipView] = useState<boolean>(true);
  const [showPopup, setShowPopup] = useState(false);
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
  });

  const [remainingTime, setRemainingTime] = useState<number>(900);
  const [consultStarted, setConsultStarted] = useState<boolean>(true);
  const [callTimer, setCallTimer] = useState<number>(0);
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
  const [checkReschudule, setCheckReschudule] = useState<boolean>(false);
  const [newRescheduleCount, setNewRescheduleCount] = useState<rescheduleType>();
  const [nextSlotAvailable, setNextSlotAvailable] = useState<string>('');
  const [transferData, setTransferData] = useState<any>([]);
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const [doctorScheduleId, setDoctorScheduleId] = useState<string>('');
  const [dropDownBottomStyle, setDropDownBottomStyle] = useState<number>(isIphoneX() ? 50 : 15);
  const [jrDoctorJoined, setjrDoctorJoined] = useState<boolean>(false);

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

  const patientId = appointmentData.patientId;
  const channel = appointmentData.id;
  const doctorId = appointmentData.doctorInfo.id;

  let intervalId: NodeJS.Timeout;
  let stoppedTimer: number;
  let thirtySecondTimer: any;
  let minuteTimer: any;

  const { analytics, getPatientApiCall } = useAuth();
  const { currentPatient } = useAllCurrentPatients();

  const [patientImageshow, setPatientImageshow] = useState<boolean>(false);
  const [showweb, setShowWeb] = useState<boolean>(false);
  const [url, setUrl] = useState('');

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

    return () => {
      didFocusSubscription && didFocusSubscription.remove();
      willBlurSubscription && willBlurSubscription.remove();
    };
  }, []);

  const backDataFunctionality = async () => {
    BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    CommonLogEvent(AppRoutes.TabBar, 'Go back clicked');
    props.navigation.replace(AppRoutes.TabBar);
    return false;
  };
  useEffect(() => {
    const userName =
      currentPatient && currentPatient.firstName ? currentPatient.firstName.split(' ')[0] : '';
    setuserName(userName);
    requestToJrDoctor();
    analytics.setAnalyticsCollectionEnabled(true);
    CommonScreenLog(AppRoutes.ChatRoom, AppRoutes.ChatRoom);

    // updateSessionAPI();
  }, []);

  useEffect(() => {
    console.log('didmout');
    Platform.OS === 'android' && requestReadSmsPermission();
    Platform.OS === 'android' && SoftInputMode.set(SoftInputMode.ADJUST_RESIZE);
    KeepAwake.activate();
  }, []);

  useEffect(() => {
    console.log('callType', callType);
    if (callType === 'VIDEO') {
      setOnSubscribe(true);
      setIsAudio(false);
      InCallManager.startRingtone('_BUNDLE_');
      InCallManager.start({ media: 'audio' }); // audio/video, default: audio
    } else if (callType === 'AUDIO') {
      setIsAudio(true);
      setOnSubscribe(true);
      InCallManager.startRingtone('_BUNDLE_');
      InCallManager.start({ media: 'audio' }); // audio/video, default: audio
    }
  }, []);

  const client = useApolloClient();

  const requestToJrDoctor = async () => {
    // let ConsultQueueData: any = await AsyncStorage.getItem('ConsultQueueData');
    // ConsultQueueData = JSON.parse(ConsultQueueData || 'null') || [];
    // console.log('ConsultQueueData', ConsultQueueData);

    // if (ConsultQueueData.appointmentId != appointmentData.id) {

    addToConsultQueue(client, appointmentData.id)
      .then(({ data }: any) => {
        console.log(data, 'data res');
        const queueData = {
          queueId: data.data.addToConsultQueue && data.data.addToConsultQueue.doctorId,
          appointmentId: appointmentData.id,
        };
        console.log(queueData, 'queueData res');

        AsyncStorage.setItem('ConsultQueueData', JSON.stringify(queueData));
      })
      .catch((e: string) => {
        console.log('Error occured ', e);
      });
    // } else {
    //   console.log('requestToJrDoctor not called');
    // }
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

      setDoctorJoined(true);

      setTimeout(() => {
        setApiCalled(true);
      }, 1000);

      setTimeout(() => {
        setDoctorJoined(false);
      }, 10000);

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
        .catch((e: string) => {
          console.log('Error occured while adding Doctor', e);
        });
    }
  };

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
  };

  const startTimer = (timer: number) => {
    timerId = setInterval(() => {
      timer = timer + 1;
      stoppedTimer = timer;
      setCallTimer(timer);
      // console.log('uptimer', timer);

      if (timer == 0) {
        console.log('uptimer', timer);
        setCallTimer(0);
        clearInterval(timerId);
      }
    }, 1000);
  };

  const stopTimer = () => {
    console.log('stopTimer', timerId);
    setCallTimer(0);
    timerId && clearInterval(timerId);
  };

  const stopInterval = () => {
    if (intervalId) {
      setConsultStarted(false);

      const stopTimer = 900 - stoppedTimer;
      setRemainingTime(stopTimer);
      intervalId && clearInterval(intervalId);
    }
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
    },
    disconnected: (event: string) => {
      console.log('Subscribe stream disconnected!', event);
    },
  };

  const sessionEventHandlers = {
    error: (error: string) => {
      console.log(`There was an error with the session: ${error}`);
    },
    connectionCreated: (event: string) => {},
    connectionDestroyed: (event: string) => {
      setIsCall(false);
      setIsAudioCall(false);
      stopTimer();
      setCallAccepted(false);
      setHideStatusBar(true);
      console.log('session stream connectionDestroyed!', event);
      setConvertVideo(false);
      KeepAwake.activate();
      setTimerStyles({
        position: 'absolute',
        marginHorizontal: 20,
        marginTop: isIphoneX() ? 91 : 81,
        width: width - 40,
        color: 'white',
        ...theme.fonts.IBMPlexSansSemiBold(12),
        textAlign: 'center',
        letterSpacing: 0.46,
      });
    },
    sessionConnected: (event: string) => {
      console.log('session stream sessionConnected!', event);
      KeepAwake.activate();
    },
    sessionDisconnected: (event: string) => {
      console.log('session stream sessionDisconnected!', event);
    },
    sessionReconnected: (event: string) => {
      console.log('session stream sessionReconnected!', event);
      KeepAwake.activate();
    },
    sessionReconnecting: (event: string) => {
      console.log('session stream sessionReconnecting!', event);
      KeepAwake.activate();
    },
    signal: (event: string) => {
      console.log('session stream signal!', event);
    },
  };

  const config: Pubnub.PubnubConfig = {
    subscribeKey: AppConfig.Configuration.PRO_PUBNUB_SUBSCRIBER,
    publishKey: AppConfig.Configuration.PRO_PUBNUB_PUBLISH,
    ssl: true,
  };
  const pubnub = new Pubnub(config);

  useEffect(() => {
    console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];
    console.disableYellowBox = true;

    pubnub.subscribe({
      channels: [channel],
      withPresence: true,
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
        console.log('messageevent', message);
        pubNubMessages(message);
      },
      presence: (presenceEvent) => {
        if (presenceEvent.occupancy >= 2) {
        }
      },
    });

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', keyboardDidHide);

    return function cleanup() {
      console.log('didmount clean up');
      pubnub.unsubscribe({ channels: [channel] });
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      KeepAwake.deactivate();
      Platform.OS === 'android' && SoftInputMode.set(SoftInputMode.ADJUST_PAN);
      minuteTimer && clearTimeout(minuteTimer);
      thirtySecondTimer && clearTimeout(thirtySecondTimer);
    };
  }, []);

  const registerForPushNotification = () => {
    console.log('registerForPushNotification:');
    ExportDeviceToken.getPushNotificationToken(handlePushNotification);
  };

  const handlePushNotification = async (deviceToken: string) => {
    console.log('Device Token Received', deviceToken);

    const fcmToken = (await AsyncStorage.getItem('deviceToken')) || '';
    const androidToken = fcmToken ? JSON.parse(fcmToken) : '';
    console.log('android:', androidToken);

    // if (Platform.OS === 'ios') {
    //   pubnub.push.addChannels(
    //     {
    //       channels: [channel],
    //       device: deviceToken,
    //       pushGateway: 'apns',
    //     },
    //     (status: any) => {
    //       if (status.error) {
    //         console.log('operation failed w/ error:', status);
    //       } else {
    //         console.log('operation done!');
    //       }
    //     }
    //   );
    //   console.log('ios:', token);
    //   // Send iOS Notification from debug console: {"pn_apns":{"aps":{"alert":"Hello World."}}}
    // } else {
    //   pubnub.push.addChannels({
    //     channels: [channel],
    //     device: androidToken,
    //     pushGateway: 'gcm', // apns, gcm, mpns
    //   });
    //   // Send Android Notification from debug console: {"pn_gcm":{"data":{"message":"Hello World."}}}
    // }
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
          const end: number = res.endTimeToken ? res.endTimeToken : 1;

          const msgs = res.messages;
          // console.log('msgs', msgs);

          res.messages.forEach((element, index) => {
            newmessage[newmessage.length] = element.entry;
          });
          // console.log('res', res);
          setLoading(false);

          if (messages.length !== newmessage.length) {
            if (newmessage[newmessage.length - 1].message === startConsultMsg) {
              setjrDoctorJoined(false);
              updateSessionAPI();
              checkingAppointmentDates();
            }

            if (newmessage[newmessage.length - 1].message === startConsultjr) {
              setjrDoctorJoined(true);
              updateSessionAPI();
              checkingAppointmentDates();
            }

            insertText = newmessage;
            setMessages(newmessage as []);
            console.log('newmessage', newmessage);
            if (msgs.length == 100) {
              console.log('hihihihihi');
              getHistory(end);
            }

            checkAutomatedPatientText();

            setTimeout(() => {
              flatListRef.current! && flatListRef.current!.scrollToEnd({ animated: true });
            }, 1000);
          } else {
            checkAutomatedPatientText();
          }
        } catch (error) {
          setLoading(false);
          console.log('error', error);
        }
      }
    );
  };

  const checkAutomatedPatientText = () => {
    const result = insertText.filter((obj: any) => {
      // console.log('resultinsertText', obj.message);
      return obj.message === consultPatientStartedMsg;
    });
    if (result.length === 0) {
      console.log('result.length ', result);
      automatedTextFromPatient();
    }
  };

  const successSteps = [
    'Let’s get you feeling better in 5 simple steps :)\n',
    '1. Answer some quick questions\n',
    '2. Connect with your doctor\n',
    '3. Get a prescription and meds, if necessary\n',
    '4. Avail 1 free follow-up*\n',
    '5. Chat with your doctor**\n',
    '* 7 days after your first consultation.\n\n',
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
        },
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {}
    );
  };

  useEffect(() => {
    thirtySecondTimer = setTimeout(function() {
      if (jrDoctorJoined == false) {
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

        if (
          result.length === 0 &&
          startConsultResult.length === 0 &&
          startConsultjrResult.length === 0
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
    }, 30000);
  }, []);

  useEffect(() => {
    minuteTimer = setTimeout(function() {
      if (jrDoctorJoined == false) {
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

        if (
          result.length === 0 &&
          startConsultResult.length === 0 &&
          startConsultjrResult.length === 0
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
    }, 90000);
  }, []);

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
    } catch (error) {}
  };

  const pubNubMessages = (message: Pubnub.MessageEvent) => {
    console.log('pubNubMessages', message);
    if (message.message.isTyping) {
      if (message.message.message === audioCallMsg) {
        setIsAudio(true);
        setOnSubscribe(true);
        InCallManager.startRingtone('_BUNDLE_');
        InCallManager.start({ media: 'audio' }); // audio/video, default: audio
        // console.log("AUDIO_CALL_STARTED");

        // InCallManager.chooseAudioRoute('EARPIECE')
      } else if (message.message.message === videoCallMsg) {
        setOnSubscribe(true);
        setIsAudio(false);
        InCallManager.startRingtone('_BUNDLE_');
        InCallManager.start({ media: 'audio' }); // audio/video, default: audio
      } else if (message.message.message === startConsultMsg) {
        setjrDoctorJoined(false);
        stopInterval();
        startInterval(timer);
        setjrDoctorJoined(false);
        updateSessionAPI();
        checkingAppointmentDates();
        addMessages(message);
      } else if (message.message.message === stopConsultMsg) {
        console.log('listener remainingTime', remainingTime);
        stopInterval();
        setConvertVideo(false);
        addMessages(message);
      } else if (
        message.message.message === 'Audio call ended' ||
        message.message.message === 'Video call ended'
      ) {
        setOnSubscribe(false);
        setIsCall(false);
        setIsAudioCall(false);
        InCallManager.stopRingtone();
        InCallManager.stop();
        addMessages(message);
      } else if (message.message.message === covertVideoMsg) {
        console.log('covertVideoMsg', covertVideoMsg);
        setConvertVideo(true);
      } else if (message.message.message === covertAudioMsg) {
        console.log('covertVideoMsg', covertAudioMsg);
        setConvertVideo(false);
      } else if (message.message.message === startConsultjr) {
        console.log('succss1');
        setjrDoctorJoined(true);
        updateSessionAPI();
        checkingAppointmentDates();
        addMessages(message);
      } else if (message.message.message === consultPatientStartedMsg) {
        console.log('consultPatientStartedMsg');
        addMessages(message);
      } else if (message.message.message === firstMessage) {
        console.log('firstMessage');
        addMessages(message);
      } else if (message.message.message === secondMessage) {
        console.log('secondMessage');
        addMessages(message);
      } else if (message.message.message === languageQue) {
        console.log('languageQue');
        addMessages(message);
      } else if (message.message.message === jdThankyou) {
        console.log('jdThankyou');
        addMessages(message);
      } else if (message.message.message === cancelConsultInitiated) {
        console.log('cancelConsultInitiated');
        addMessages(message);
      }
    } else {
      console.log('succss');
      addMessages(message);
    }
  };

  const addMessages = (message: Pubnub.MessageEvent) => {
    // console.log('addMessages', addMessages);
    insertText[insertText.length] = message.message;
    setMessages(() => [...(insertText as [])]);
    if (!isCall || !isAudioCall) {
      setChatReceived(true);
    }
    setTimeout(() => {
      flatListRef.current! && flatListRef.current!.scrollToEnd({ animated: false });
    }, 300);
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
      };

      setMessageText('');

      pubnub.publish(
        {
          channel: channel,
          message: text,
          storeInHistory: true,
          sendByPost: true,
        },
        (status, response) => {}
      );
    } catch (error) {}
  };

  let leftComponent = 0;
  let rightComponent = 0;

  const saveimageIos = (url: any) => {
    if (Platform.OS === 'ios') {
      Linking.openURL(url).catch((err) => console.error('An error occurred', err));
    }
  };

  const transferReschedule = (rowData: any, index: number) => {
    console.log('rowData', rowData);
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
                      .format('Do MMMM, dddd \nhh:mm a')}
                  </Text>
                  <TouchableOpacity
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
                {rowData.transferInfo.photoUrl &&
                rowData.transferInfo.photoUrl.match(
                  /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG)/
                ) ? (
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
                      checkIfReschduleApi(rowData, 'Transfer');
                      NextAvailableSlot(rowData, 'Transfer');
                      setCheckReschudule(true);
                      setTransferData(rowData.transferInfo);
                      setTimeout(() => {
                        flatListRef.current! &&
                          flatListRef.current!.scrollToEnd({ animated: true });
                      }, 200);
                    } catch (error) {}
                  }}
                />

                <Button
                  title={'ACCEPT'}
                  style={{ flex: 0.4, marginRight: 16, marginLeft: 5 }}
                  onPress={() => {
                    CommonLogEvent(AppRoutes.ChatRoom, 'Chat accept transfer clicked');

                    try {
                      let datettimeval = rowData.transferInfo.transferDateTime;
                      let transferdataid = rowData.transferInfo.transferId;

                      const appointmentTransferInput: BookTransferAppointmentInput = {
                        patientId: patientId,
                        doctorId: rowData.transferInfo.doctorId,
                        appointmentDateTime: datettimeval, //rowData.transferInfo.transferDateTime, //appointmentDate,
                        existingAppointmentId: channel,
                        transferId: transferdataid, //rowData.transferInfo.transferId,
                      };
                      console.log(appointmentTransferInput, 'AcceptApi Input');

                      transferAppointmentAPI(rowData, appointmentTransferInput);
                    } catch (error) {}
                  }}
                />
              </StickyBottomComponent>
            </View>
            {checkReschudule && reschduleLoadView(rowData, index, 'Transfer')}
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
                height: 176,
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
                {`Hello ${userName},\nHope your consultation went well… Here is your prescription.`}
              </Text>
              <StickyBottomComponent
                style={{
                  paddingHorizontal: 0,
                  backgroundColor: 'transparent',
                  shadowColor: 'transparent',
                }}
              >
                <Button
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
                      CommonLogEvent(AppRoutes.ChatRoom, 'PDF Url');

                      console.log('pdf url', rowData.transferInfo && rowData.transferInfo.pdfUrl);

                      let dirs = RNFetchBlob.fs.dirs;
                      console.log('dirs', dirs);
                      if (Platform.OS == 'ios') {
                      }

                      console.log(
                        'pdf downloadDest',
                        rowData.transferInfo &&
                          rowData.transferInfo.pdfUrl &&
                          rowData.transferInfo.pdfUrl.split('/').pop()
                      );

                      setLoading(true);
                      RNFetchBlob.config({
                        fileCache: true,
                        addAndroidDownloads: {
                          useDownloadManager: true,
                          notification: false,
                          mime: 'application/pdf',
                          path: Platform.OS === 'ios' ? dirs.MainBundleDir : dirs.DownloadDir,
                          description: 'File downloaded by download manager.',
                        },
                      })
                        .fetch('GET', rowData.transferInfo.pdfUrl, {
                          //some headers ..
                        })
                        .then((res) => {
                          setLoading(false);
                          // the temp file path
                          console.log('The file saved to res ', res);
                          console.log('The file saved to ', res.path());
                          saveimageIos(rowData.transferInfo.pdfUrl);
                          // RNFetchBlob.android.actionViewIntent(res.path(), 'application/pdf');
                          // RNFetchBlob.ios.openDocument(res.path());
                          if (Platform.OS === 'android') {
                            Alert.alert('Download Complete');
                          }
                          Platform.OS === 'ios'
                            ? RNFetchBlob.ios.previewDocument(res.path())
                            : RNFetchBlob.android.actionViewIntent(res.path(), 'application/pdf');
                        })
                        .catch((err) => {
                          console.log('error ', err);
                          setLoading(false);
                          // ...
                        });
                    } catch (error) {}
                  }}
                />

                <Button
                  title={'VIEW'}
                  style={{ flex: 0.5, marginRight: 16, marginLeft: 5 }}
                  onPress={() => {
                    try {
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
                    } catch (error) {}
                  }}
                />
              </StickyBottomComponent>
            </View>
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
                {moment(rowData.transferInfo.folloupDateTime).format('Do MMMM, dddd \nhh:mm a')}
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
                    checkIfReschduleApi(rowData, 'Followup');
                    NextAvailableSlot(rowData, 'Followup');
                    setCheckReschudule(true);
                    setTransferData(rowData.transferInfo);
                    setTimeout(() => {
                      flatListRef.current! && flatListRef.current!.scrollToEnd({ animated: true });
                    }, 200);
                  }}
                />
              </StickyBottomComponent>
            </View>
            {checkReschudule && reschduleLoadView(rowData, index, 'Followup')}
          </View>
        )}
      </>
    );
  };

  const reschduleLoadView = (rowData: any, index: number, type: string) => {
    console.log('reschduleLoadView', appointmentData.doctorInfo.displayName);
    return (
      <>
        <View
          style={{
            width: 244,
            height: 116,
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
            {newRescheduleCount && newRescheduleCount!.rescheduleCount < 3
              ? 'We’re sorry that you have to reschedule. You can reschedule up to 3 times for free.'
              : `Since you hace already rescheduled 3 times with ${appointmentData.doctorInfo.displayName}, we will consider this a new paid appointment.`}
          </Text>
        </View>
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
            Next slot for {appointmentData.doctorInfo.displayName} is available on —
            {/* Next slot for Dr. {rowData.transferInfo.doctorInfo.firstName} is available on — */}
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
            {moment(nextSlotAvailable).format('Do MMMM, dddd \nhh:mm a')}
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
              title={'CHANGE SLOT'}
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
                if (type === 'Followup') {
                  CommonLogEvent(AppRoutes.ChatRoom, 'Display Overlay');

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
                      newDateTimeslot: nextSlotAvailable,
                      initiatedBy: TRANSFER_INITIATED_TYPE.PATIENT,
                      initiatedId: patientId,
                      patientId: patientId,
                      rescheduledId: '',
                    };
                    console.log('bookRescheduleInput', bookRescheduleInput);
                    rescheduleAPI(rowData, bookRescheduleInput);
                  } else {
                    let datettimeval = nextSlotAvailable;
                    let transferdataid = rowData.transferInfo.transferId;

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
                } catch (error) {}
              }}
            />
          </StickyBottomComponent>
        </View>
      </>
    );
  };

  const messageView = (rowData: any, index: number) => {
    // console.log('messageView', rowData.message);
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
            }}
          >
            {appointmentData.doctorInfo.thumbnailUrl &&
            appointmentData.doctorInfo.thumbnailUrl.match(
              /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG)/
            ) ? (
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
              {rowData.url.match(/\.(jpeg|jpg|gif|png)$/) ? (
                <TouchableOpacity
                  onPress={() => {
                    console.log('IMAGE', rowData.url);
                    setPatientImageshow(true);
                    setUrl(rowData.url);
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
                    <Image
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
                  onPress={() => {
                    console.log('pdf', rowData.url);

                    if ((Platform.OS = 'android')) {
                      Linking.openURL(rowData.url).catch((err) =>
                        console.error('An error occurred', err)
                      );
                    } else {
                      setShowWeb(true);
                      setUrl(rowData.url);
                    }
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
                <Text
                  style={{
                    color: '#ffffff',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    ...theme.fonts.IBMPlexSansMedium(15),
                    textAlign: 'left',
                  }}
                >
                  {rowData.automatedText}
                </Text>
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
                <Text
                  style={{
                    color: '#ffffff',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    ...theme.fonts.IBMPlexSansMedium(15),
                    textAlign: 'left',
                  }}
                >
                  {rowData.automatedText}
                </Text>
              ) : null}
            </View>
          ) : rowData.message === '^^#stopconsult' ? (
            <View
              style={{
                backgroundColor: '#0087ba',
                marginLeft: 38,
                borderRadius: 10,
              }}
            >
              {rowData.automatedText ? (
                <Text
                  style={{
                    color: '#ffffff',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    ...theme.fonts.IBMPlexSansMedium(15),
                    textAlign: 'left',
                  }}
                >
                  {rowData.automatedText}
                </Text>
              ) : null}
            </View>
          ) : (
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
                  paddingVertical: 12,
                  ...theme.fonts.IBMPlexSansMedium(16),
                  textAlign: 'left',
                }}
              >
                {rowData.message}
              </Text>
            </View>
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
                }}
              >
                {appointmentData.doctorInfo.thumbnailUrl &&
                appointmentData.doctorInfo.thumbnailUrl.match(
                  /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG)/
                ) ? (
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
                }}
              >
                {appointmentData.doctorInfo.thumbnailUrl &&
                appointmentData.doctorInfo.thumbnailUrl.match(
                  /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG)/
                ) ? (
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
                    marginLeft: 0,
                    textAlign: 'left',
                    ...theme.fonts.IBMPlexSansMedium(10),
                  }}
                >
                  Duration - {rowData.duration}
                </Text>
              </View>
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
          backgroundColor: '#0087ba',
          marginLeft: 38,
          borderRadius: 10,
          marginBottom: 4,
        }}
      >
        {rowData.automatedText ? (
          <Text
            style={{
              color: '#ffffff',
              paddingHorizontal: 16,
              paddingVertical: 12,
              ...theme.fonts.IBMPlexSansMedium(15),
              textAlign: 'left',
            }}
          >
            {rowData.automatedText}
          </Text>
        ) : null}
      </View>
    );
  };

  const doctorAutomatedMessage = (rowData: any, index: number) => {
    return (
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
          <Text
            style={{
              color: '#ffffff',
              paddingHorizontal: 16,
              paddingVertical: 12,
              ...theme.fonts.IBMPlexSansMedium(15),
              textAlign: 'left',
            }}
          >
            {rowData.automatedText}
          </Text>
        ) : null}
      </View>
    );
  };

  const doctorCancelConsultAutomatedMessage = (rowData: any, index: number) => {
    return (
      <View
        style={{
          backgroundColor: '#0087ba',
          marginLeft: 38,
          borderRadius: 10,
          marginBottom: 4,
          width: 244,
        }}
      >
        <Text
          style={{
            color: '#ffffff',
            paddingHorizontal: 16,
            paddingVertical: 12,
            ...theme.fonts.IBMPlexSansMedium(15),
            textAlign: 'left',
          }}
        >
          Doctor has ended cancelled your appointment. Please rebook it again
        </Text>
        <Button
          title={'Okay'}
          style={{ flex: 0.4, marginRight: 16, marginLeft: 5 }}
          onPress={() => {
            console.log('Cancel okay clicked');
          }}
        />
      </View>
    );
  };

  const renderChatRow = (
    rowData: { id: string; message: string; duration: string; transferInfo: any; url: any },
    index: number
  ) => {
    if (
      rowData.message === typingMsg ||
      rowData.message === endCallMsg ||
      rowData.message === audioCallMsg ||
      rowData.message === videoCallMsg ||
      rowData.message === acceptedCallMsg
    ) {
      return null;
    }

    if (rowData.id !== patientId) {
      leftComponent++;
      rightComponent = 0;
      return (
        <View>
          {leftComponent === 1 && (
            <View
              style={{
                backgroundColor: 'transparent',
                width: width,
                marginVertical: 8,
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
                  {rowData.message === consultPatientStartedMsg ? (
                    <>{patientAutomatedMessage(rowData, index)}</>
                  ) : rowData.message === firstMessage ||
                    rowData.message === secondMessage ||
                    rowData.message === languageQue ||
                    rowData.message === jdThankyou ? (
                    <>{doctorAutomatedMessage(rowData, index)}</>
                  ) : rowData.message === cancelConsultInitiated ? (
                    <>{doctorCancelConsultAutomatedMessage(rowData, index)}</>
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
        <View>
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
                    textAlign: 'left',
                    ...theme.fonts.IBMPlexSansMedium(10),
                  }}
                >
                  Duration - {rowData.duration}
                </Text>
              </View>
            </View>
          ) : (
            <View>
              {rowData.message === imageconsult ? (
                <View>
                  {rowData.url.match(/\.(jpeg|jpg|gif|png)$/) ? (
                    <TouchableOpacity
                      onPress={() => {
                        console.log('IMAGE', rowData.url);
                        setPatientImageshow(true);
                        setUrl(rowData.url);
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
                      onPress={() => {
                        console.log('pdf', rowData.url);

                        if ((Platform.OS = 'android')) {
                          Linking.openURL(rowData.url).catch((err) =>
                            console.error('An error occurred', err)
                          );
                        } else {
                          setShowWeb(true);
                          setUrl(rowData.url);
                        }
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
                <View
                  style={{
                    backgroundColor: 'white',
                    // width: 244,
                    borderRadius: 10,
                    marginVertical: 2,
                    alignSelf: 'flex-end',
                  }}
                >
                  <Text
                    style={{
                      color: '#01475b',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      textAlign: 'left',
                      ...theme.fonts.IBMPlexSansMedium(16),
                    }}
                  >
                    {rowData.message}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      );
    }
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
      .catch((e: string) => {
        setLoading(false);
        setBottompopup(true);
      });
  };

  const checkIfReschduleApi = (rowData: any, Value: string) => {
    setLoading(true);
    checkIfRescheduleAppointment(
      client,
      rowData.transferInfo.appointmentId,
      Value === 'Followup'
        ? rowData.transferInfo.folloupDateTime
        : rowData.transferInfo.transferDateTime
    )
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
        } catch (error) {}
      })
      .catch((e: any) => {
        setLoading(false);
        const error = JSON.parse(JSON.stringify(e));
      });
  };

  const NextAvailableSlot = (rowData: any, Value: string) => {
    console.log('NextAvailableSlot', rowData);
    setLoading(true);

    const todayDate = moment
      .utc(
        Value === 'Followup'
          ? rowData.transferInfo.folloupDateTime
          : rowData.transferInfo.transferDateTime
      )
      .local()
      .format('YYYY-MM-DD');
    console.log('todayDate', todayDate);

    const slotDoctorId =
      Value === 'Followup' ? rowData.transferInfo.doctorId : rowData.transferInfo.doctorInfo.id;
    console.log('slotDoctorId', slotDoctorId);
    setDoctorScheduleId(slotDoctorId);

    getNextAvailableSlots(client, slotDoctorId, todayDate)
      .then(({ data }: any) => {
        setLoading(false);
        try {
          console.log(data, 'nextavailable res');
          setNextSlotAvailable(data[0].availableSlot);
        } catch (error) {
          setNextSlotAvailable('');
        }
      })
      .catch((e: string) => {
        setLoading(false);
        console.log('Error occured ', e);
      });
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
                },
              }),
            ],
          })
        );
      })
      .catch((e: string) => {
        console.log(e, 'error');
        setLoading(false);
        setBottompopup(true);
      });
  };

  const renderChatView = () => {
    // console.log('renderChatView');

    return (
      <View style={{ width: width, height: heightList, marginTop: 0 }}>
        <FlatList
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          removeClippedSubviews={false}
          ref={(ref) => (flatListRef.current = ref)}
          contentContainerStyle={{
            marginHorizontal: 20,
            marginTop: 0,
          }}
          bounces={false}
          data={messages}
          onEndReachedThreshold={0.1}
          renderItem={({ item, index }) => renderChatRow(item, index)}
          keyExtractor={(_, index) => index.toString()}
          numColumns={1}
        />
      </View>
    );
  };

  const VideoCall = () => {
    return (
      <View style={talkStyles}>
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
                connectionEventsSuppressed: true, // default is false
                androidZOrder: 'onTop', // Android only - valid options are 'mediaOverlay' or 'onTop'
                androidOnTop: 'publisher', // Android only - valid options are 'publisher' or 'subscriber'
                useTextureViews: true, // Android only - default is false
                isCamera2Capable: true, // Android only - default is false
              }}
            >
              <OTPublisher
                style={publisherStyles}
                properties={{
                  cameraPosition: cameraPosition,
                  publishVideo: showVideo,
                  publishAudio: mute,
                  audioVolume: 100,
                }}
                resolution={'352x288'}
                eventHandlers={publisherEventHandlers}
              />
              <OTSubscriber
                style={subscriberStyles}
                subscribeToSelf={true}
                eventHandlers={subscriberEventHandlers}
                properties={{
                  subscribeToAudio: true,
                  subscribeToVideo: true,
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
                  }}
                >
                  {appointmentData.doctorInfo.displayName}
                </Text>
              </>
            )}

            <Text style={timerStyles}>{callAccepted ? callTimerStarted : 'INCOMING'}</Text>
            {PipView && renderOnCallPipButtons()}
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
            connectionEventsSuppressed: true, // default is false
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
              publishAudio: mute,
              audioVolume: 100,
            }}
            resolution={'352x288'}
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
            subscribeToSelf={true}
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
              zIndex: 1000,
            }}
          >
            <Text style={{ color: 'transparent', ...theme.fonts.IBMPlexSansSemiBold(10) }}>
              Time Left {minutes.toString().length < 2 ? '0' + minutes : minutes} :{' '}
              {seconds.toString().length < 2 ? '0' + seconds : seconds}
            </Text>
          </View>
        )}
        <Text style={timerStyles}>{callAccepted ? callTimerStarted : 'INCOMING'}</Text>
        {showAudioPipView && renderAudioCallButtons()}
        {!showAudioPipView && renderAudioFullScreen()}
      </View>
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
          }}
        >
          {appointmentData.doctorInfo.displayName}
        </Text>
        <View
          style={{
            position: 'absolute',
            top: isIphoneX() ? 64 : 44,
            left: 20,
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
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
              mute === true ? setMute(false) : setMute(true);
            }}
          >
            {mute === true ? (
              <UnMuteIcon style={{ height: 60, width: 60 }} />
            ) : (
              <MuteIcon style={{ height: 60, width: 60 }} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setIsAudioCall(false);
              stopTimer();
              setHideStatusBar(false);
              setMute(true);
              setShowVideo(true);
              setCameraPosition('front');

              pubnub.publish(
                {
                  message: {
                    isTyping: true,
                    message: 'Audio call ended',
                    duration: callTimerStarted,
                    id: patientId,
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

  const renderOnCallPipButtons = () => {
    return (
      <View
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 1000,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            changeVideoStyles();
          }}
        >
          <FullScreenIcon style={{ width: 40, height: 40 }} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setIsCall(false);
            setMute(true);
            setShowVideo(true);
            setCameraPosition('front');
            stopTimer();
            setHideStatusBar(false);

            pubnub.publish(
              {
                message: {
                  isTyping: true,
                  message: 'Video call ended',
                  duration: callTimerStarted,
                  id: patientId,
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
          zIndex: 1000,
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
            });

            setPipView(true);
            setChatReceived(false);
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
              mute === true ? setMute(false) : setMute(true);
            }}
          >
            {mute === true ? (
              <UnMuteIcon style={{ height: 60, width: 60 }} />
            ) : (
              <MuteIcon style={{ height: 60, width: 60 }} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setIsCall(false);
              setMute(true);
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
                  },
                  channel: channel,
                  storeInHistory: true,
                },
                (status, response) => {}
              );
            }}
          >
            <EndCallIcon style={{ height: 60, width: 60 }} />
          </TouchableOpacity>
        </View>
      </View>
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
        appointmentData.doctorInfo.photoUrl.match(
          /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG)/
        ) ? (
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
            setOnSubscribe(false);
            stopTimer();
            startTimer(0);
            setCallAccepted(true);
            setHideStatusBar(true);
            setChatReceived(false);
            Keyboard.dismiss();
            InCallManager.stopRingtone();
            InCallManager.stop();
            changeAudioStyles();
            setConvertVideo(false);
            changeVideoStyles();
            setDropdownVisible(false);

            // InCallManager.setSpeakerphoneOn(true)
            // InCallManager.chooseAudioRoute('EARPIECE')
            if (token) {
              PublishAudioVideo();
            } else {
              APICallAgain();
            }
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
      .catch((e: string) => {
        console.log('Error occured while adding Doctor', e);
      });
  };

  const PublishAudioVideo = () => {
    console.log('PublishAudioVideo');

    pubnub.publish(
      {
        message: {
          isTyping: true,
          message: acceptedCallMsg,
        },
        channel: channel,
        storeInHistory: false,
      },
      (status, response) => {}
    );
    if (isAudio) {
      setIsAudioCall(true);
    } else {
      setIsCall(true);
    }
  };

  const options = {
    quality: 0.1,
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };

  const uploadDocument = (resource: any, base66: any, type: any) => {
    console.log('upload base66', base66);
    console.log('upload fileType', type);
    console.log('chanel', channel);
    CommonLogEvent(AppRoutes.ChatRoom, 'Upload document');

    setLoading(true);
    const textin = {
      fileType: type,
      base64FileInput: base66, //resource.data,
      appointmentId: channel,
    };
    console.log('textin', textin);
    client
      .mutate<uploadChatDocument, uploadChatDocumentVariables>({
        mutation: UPLOAD_CHAT_FILE,
        fetchPolicy: 'no-cache',
        variables: {
          fileType: type,
          base64FileInput: base66, //resource.data,
          appointmentId: channel,
        },
      })
      .then((data) => {
        console.log('upload data', data);
        setLoading(false);

        const text = {
          id: patientId,
          message: imageconsult,
          fileType: 'image',
          url: data.data && data.data.uploadChatDocument.filePath,
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
      })
      .catch((e) => {
        setLoading(false);
        KeepAwake.activate();
        console.log('upload data error', e);
      });
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
          'Only PDF / JPG / PNG type files up to 2 mb are allowed',
        ]}
        isVisible={isDropdownVisible}
        disabledOption={'NONE'}
        optionTexts={{
          camera: 'TAKE A PHOTO',
          gallery: 'CHOOSE FROM\nGALLERY',
          prescription: 'UPLOAD\nFROM PHR',
        }}
        hideTAndCs={false}
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
        onSubmit={(selectedEPres) => {
          console.log('selectedEPres', selectedEPres);
          setSelectPrescriptionVisible(false);
          if (selectedEPres.length == 0) {
            return;
          } else {
            console.log('sussess', 'ssss');
            setLoading(true);
            client
              .mutate<uploadChatDocument, uploadChatDocumentVariables>({
                mutation: UPLOAD_CHAT_FILE,
                fetchPolicy: 'no-cache',
                variables: {
                  fileType: 'pdf',
                  base64FileInput: selectedEPres[0].uploadedUrl, //resource.data,
                  appointmentId: channel,
                },
              })
              .then((data) => {
                setLoading(false);
                console.log('upload selectedEPres data', data);

                const text = {
                  id: patientId,
                  message: imageconsult,
                  fileType: 'image',
                  url: data.data && data.data.uploadChatDocument.filePath,
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
              })
              .catch((e) => {
                setLoading(false);
                KeepAwake.activate();
                console.log('upload data error', e);
              });
          }
          //setEPrescriptions && setEPrescriptions([...selectedEPres]);
        }}
        //selectedEprescriptionIds={ePrescriptions.map((item) => item.id)}
        isVisible={isSelectPrescriptionVisible}
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
        <TouchableOpacity onPress={() => closeviews()}>
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
        <Image
          style={{
            flex: 1,
            resizeMode: 'stretch',
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

      <SafeAreaView
        style={{
          ...theme.viewStyles.container,
        }}
      >
        <Header
          title={'CONSULT ROOM'}
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0, zIndex: 100 }}
          onPressLeftIcon={() =>
            props.navigation.dispatch(
              StackActions.reset({
                index: 0,
                key: null,
                actions: [NavigationActions.navigate({ routeName: AppRoutes.TabBar })],
              })
            )
          }
          // onPressLeftIcon={() => props.navigation.goBack()}
        />

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
              elevation: 2,
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
              {jrDoctorJoined
                ? `${appointmentData.doctorInfo.displayName}'s team doctor has joined`
                : `${appointmentData.doctorInfo.displayName} has joined!`}
            </Text>
          </View>
        ) : null}
        {renderChatView()}
        <KeyboardAvoidingView behavior="padding" enabled>
          <View
            style={{
              width: width,
              height: 66,
              backgroundColor: 'white',
              bottom: isIphoneX() ? 36 : 0,
            }}
          >
            <View style={{ flexDirection: 'row', width: width }}>
              <TouchableOpacity
                activeOpacity={1}
                style={{
                  width: 40,
                  height: 40,
                  marginTop: 9,
                  marginLeft: 5,
                }}
                onPress={async () => {
                  CommonLogEvent(AppRoutes.ChatRoom, 'Upload document clicked.');
                  setDropdownVisible(!isDropdownVisible);
                }}
              >
                <AddAttachmentIcon
                  style={{ width: 24, height: 24, marginTop: 10, marginLeft: 14 }}
                />
              </TouchableOpacity>
              <View>
                <TextInput
                  autoCorrect={false}
                  placeholder="Type here…"
                  multiline={true}
                  style={{
                    marginLeft: 16,
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
                />
                <View
                  style={{
                    marginLeft: 16,
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
                  const textMessage = messageText.trim();
                  console.log('ChatSend', textMessage);

                  if (textMessage.length == 0) {
                    Alert.alert('Apollo', 'Please write something to send message.');
                    CommonLogEvent(AppRoutes.ChatRoom, 'Please write something to send message.');
                    return;
                  }
                  CommonLogEvent(AppRoutes.ChatRoom, 'Message sent clicked');

                  send(textMessage);
                }}
              >
                <ChatSend style={{ width: 24, height: 24, marginTop: 8, marginLeft: 14 }} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
      {displayoverlay && transferData && (
        <OverlayRescheduleView
          setdisplayoverlay={() => setdisplayoverlay(false)}
          navigation={props.navigation}
          doctor={transferData ? transferData.doctorInfo : null}
          patientId={currentPatient ? currentPatient.id : ''}
          clinics={transferData ? transferData.doctorInfo.doctorHospital : []}
          doctorId={doctorScheduleId}
          renderTab={
            appointmentData.appointmentType === 'ONLINE' ? 'Consult Online' : 'Visit Clinic'
          }
          rescheduleCount={newRescheduleCount!}
          appointmentId={transferData.appointmentId}
          data={transferData}
          bookFollowUp={false}
          KeyFollow={'RESCHEDULE'}
          isfollowupcount={0}
        />
      )}
      <View>
        {/* {isDropdownVisible == true ? (
          <View
            style={{
              width: 200,
              bottom: dropDownBottomStyle,
              position: 'absolute',
              left: 15,
              shadowColor: '#808080',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.4,
              shadowRadius: 20,
              elevation: 25,
              zIndex: 2,
            }}
          >
            <DropDown
              cardContainer={{
                elevation: 25,
              }}
              options={[
                {
                  optionText: 'Camera',
                  onPress: () => {
                    try {
                      setDropdownVisible(false);
                      Keyboard.dismiss();
                      ImagePicker.launchCamera(options, (response) => {
                        uploadDocument(response);
                      });
                    } catch (error) {}
                  },
                },
                {
                  optionText: 'Gallery',
                  onPress: () => {
                    try {
                      setDropdownVisible(false);
                      Keyboard.dismiss();
                      ImagePicker.launchImageLibrary(options, (response) => {
                        console.log('response', response);
                        uploadDocument(response);
                      });
                    } catch (error) {}
                  },
                },
              ]}
            />
          </View>
        ) : null} */}
      </View>

      {uploadPrescriptionPopup()}
      {renderPrescriptionModal()}
      {patientImageshow && imageOpen()}
      {showweb && showWeimageOpen()}

      {loading && <Spinner />}
    </View>
  );
};
