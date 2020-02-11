import { ReSchedulePopUp } from '@aph/mobile-doctors/src/components/Appointments/ReSchedulePopUp';
import { UploadPrescriprionPopup } from '@aph/mobile-doctors/src/components/Appointments/UploadPrescriprionPopup';
import { CaseSheetView } from '@aph/mobile-doctors/src/components/ConsultRoom/CaseSheetView';
import { DropDown } from '@aph/mobile-doctors/src/components/ui/DropDown';
import {
  AddAttachmentIcon,
  BackArrow,
  BackCameraIcon,
  Call,
  ChatCallIcon,
  ChatIcon,
  ChatSend,
  ChatWithNotification,
  ClosePopup,
  CrossPopup,
  DoctorImage,
  DoctorPlaceholderImage,
  DotIcon,
  EndCallIcon,
  FrontCameraIcon,
  FullScreenIcon,
  Mascot,
  MissedCallIcon,
  MuteIcon,
  PatientPlaceHolderImage,
  RoundCallIcon,
  RoundChatIcon,
  RoundVideoIcon,
  UnMuteIcon,
  VideoOffIcon,
  VideoOnIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { Image as ImageNative } from 'react-native-elements';
import { NotificationHeader } from '@aph/mobile-doctors/src/components/ui/NotificationHeader';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import {
  CREATEAPPOINTMENTSESSION,
  END_APPOINTMENT_SESSION,
  UPLOAD_CHAT_FILE,
} from '@aph/mobile-doctors/src/graphql/profiles';
import {
  CreateAppointmentSession,
  CreateAppointmentSessionVariables,
} from '@aph/mobile-doctors/src/graphql/types/CreateAppointmentSession';
import {
  EndAppointmentSession,
  EndAppointmentSessionVariables,
} from '@aph/mobile-doctors/src/graphql/types/EndAppointmentSession';
import { REQUEST_ROLES, STATUS } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import { uploadChatDocument } from '@aph/mobile-doctors/src/graphql/types/uploadChatDocument';
import { getPrismUrls } from '@aph/mobile-doctors/src/helpers/clientCalls';
import { PatientInfoData } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { g, messageCodes } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import { OTPublisher, OTSession, OTSubscriber } from 'opentok-react-native';
import Pubnub, { HereNowResponse } from 'pubnub';
import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialTabs from 'react-native-material-tabs';
import { WebView } from 'react-native-webview';
import { NavigationScreenProps } from 'react-navigation';

const { height, width } = Dimensions.get('window');
let joinTimerNoShow: any;
let missedCallTimer: any;
const styles = StyleSheet.create({
  mainview: {
    backgroundColor: '#ffffff',
    height: 50,
  },
  shadowview: {
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 10,
    backgroundColor: 'white',
  },
  imageStyle: {
    width: 32,
    height: 32,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  automatedLeftText: {
    ...theme.viewStyles.text('M', 15, theme.colors.WHITE),
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 16,
    textAlign: 'left',
  },
  automatedRightText: {
    ...theme.viewStyles.text('M', 10, theme.colors.WHITE),
    paddingHorizontal: 16,
    paddingVertical: 4,
    textAlign: 'right',
  },
  automatedTextView: {
    backgroundColor: '#0087ba',
    marginLeft: 38,
    borderRadius: 10,
  },
});

let connectionCount = 0;
let timer = 900;
let intervalId: any;
let stoppedTimer: number;
let timerId: any;

let joinTimerId: any;
let diffInHours: number;
let callAbandonmentTimer: any;
let callAbandonmentStoppedTimer: number = 200;

export interface ConsultRoomScreenProps
  extends NavigationScreenProps<{
    DoctorId: string;
    PatientId: string;
    PatientConsultTime: string;
    PatientInfoAll: PatientInfoData;
    AppId: string;
    Appintmentdatetime: string; //Date;
    AppoinementData: any;
    // navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
  }> {
  activeTabIndex?: number;
  // navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
}

export const ConsultRoomScreen: React.FC<ConsultRoomScreenProps> = (props) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [overlayDisplay, setOverlayDisplay] = useState<React.ReactNode>(null);
  const [hideView, setHideView] = useState(false);
  const [chatReceived, setChatReceived] = useState(false);
  const client = useApolloClient();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const PatientInfoAll = props.navigation.getParam('PatientInfoAll');
  const AppId = props.navigation.getParam('AppId');
  const Appintmentdatetime = props.navigation.getParam('Appintmentdatetime');
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const appointmentData = props.navigation.getParam('AppoinementData');
  const [dropdownShow, setDropdownShow] = useState(false);
  const channel = props.navigation.getParam('AppId');
  const doctorId = props.navigation.getParam('DoctorId');
  const PatientConsultTime = props.navigation.getParam('PatientConsultTime');
  const [activeTabIndex, setActiveTabIndex] = useState(props.activeTabIndex || 0);
  const flatListRef = useRef<FlatList<never> | undefined | null>();
  const otSessionRef = React.createRef();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState<string>('');
  const [heightList, setHeightList] = useState<number>(height - 185);
  const [displayReSchedulePopUp, setDisplayReSchedulePopUp] = useState<boolean>(false);
  const [sessionId, setsessionId] = useState<string>('');
  const [token, settoken] = useState<string>('');
  const [cameraPosition, setCameraPosition] = useState<string>('front');
  const [mute, setMute] = useState<boolean>(true);
  const [showVideo, setShowVideo] = useState<boolean>(true);
  const [PipView, setPipView] = useState<boolean>(false);
  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const [isCall, setIsCall] = useState<boolean>(false);
  const [isAudioCall, setIsAudioCall] = useState<boolean>(false);
  const [startConsult, setStartConsult] = useState<boolean>(false);
  const [returnToCall, setReturnToCall] = useState<boolean>(false);
  const [textinputStyles, setTextInputStyles] = useState<Object>({
    width: width,
    height: 66,
    backgroundColor: 'white',
    top: 0,
    // bottom: -20,
  });
  const [linestyles, setLinestyles] = useState<Object>({
    marginLeft: 20,
    marginRight: 64,
    marginTop: 0,
    height: 2,
    backgroundColor: '#00b38e',
    zIndex: -1,
  });
  const [showPDF, setShowPDF] = useState<boolean>(false);
  const [patientImageshow, setPatientImageshow] = useState<boolean>(false);
  const [showweb, setShowWeb] = useState<boolean>(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    // callAbandonmentCall();
    console.log('PatientConsultTime'), PatientConsultTime;
    // setTimeout(() => {
    //   flatListRef.current && flatListRef.current!.scrollToEnd();
    // }, 1000);
  }, []);

  const [talkStyles, setTalkStyles] = useState<object>({
    flex: 1,
    backgroundColor: 'black',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 1000,
    zIndex: 100,
  });
  const [subscriberStyles, setSubscriberStyles] = useState<object>({
    width,
    height,
    zIndex: 100,
  });
  const [publisherStyles, setPublisherStyles] = useState<object>({
    position: 'absolute',
    top: 44,
    right: 20,
    width: 112,
    height: 148,
    zIndex: 100,
    elevation: 1000,
    borderRadius: 30,
  });
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
      console.log('timer missedCall', timer);
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

  const stopAllCalls = () => {
    console.log('isA', isAudioCall, '\nisVe', isCall);
    setIsAudioCall(false);
    setHideStatusBar(false);
    setChatReceived(false);
    setConvertVideo(false);
    setShowVideo(true);
    setIsCall(false);
    setTextInputStyles({
      width: width,
      height: 66,
      backgroundColor: 'white',
      top: 5,
      bottom: -10,
    });
    setLinestyles({
      marginLeft: 20,
      marginRight: 64,
      marginTop: -10,
      height: 2,
      backgroundColor: '#00b38e',
    });

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
        //  setLoading(false);
        setShowPopUp(true);
        console.log('_data', _data);
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
        // props.onStopConsult();
      })
      .catch((e) => {
        //  setLoading(false);
        setShowPopUp(false);
        console.log('Error occured while End casesheet', e);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while End casesheet', errorMessage, error);
        Alert.alert(strings.common.error, errorMessage);
      });
  };
  const { doctorDetails } = useAuth();
  let dateIsAfter = moment(new Date()).isAfter(moment(Appintmentdatetime));

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
    subscribeKey: 'sub-c-9cc337b6-e0f4-11e9-8d21-f2f6e193974b', //'pub-c-75e6dc17-2d81-4969-8410-397064dae70e',
    publishKey: 'pub-c-75e6dc17-2d81-4969-8410-397064dae70e', //'pub-c-e3541ce5-f695-4fbd-bca5-a3a9d0f284d3',
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
          // if (messageText === acceptedCallMsg) {
          //   startTimer(0);
          //   setCallAccepted(true);
          // } else if (messageText === endCallMsg) {
          //   setIsCall(false);
          //   setIsAudioCall(false);
          //   setHideStatusBar(false);
          //   stopTimer();
          //   setCallAccepted(false);
          //   setReturnToCall(false);
          // } else if (messageText === covertVideoMsg) {
          //   setConvertVideo(true);
          // } else if (messageText === covertAudioMsg) {
          //   console.log('covertVideoMsg', covertAudioMsg);
          //   setConvertVideo(false);
          // } else if (messageText === 'Audio call ended' || messageText === 'Video call ended') {
          //   console.log('aftercal');
          //   addMessages(message);
          //   setIsCall(false);
          //   setIsAudioCall(false);
          //   setHideStatusBar(false);
          //   stopTimer();
          //   setCallAccepted(false);
          //   setReturnToCall(false);
          // }
          const audioVideoMethod = () => {
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
        }
        // else if (messageText === consultPatientStartedMsg) {
        //   console.log('consultPatientStartedMsg');
        //   addMessages(message);
        // } else if (messageText === startConsultjr) {
        //   console.log('startConsultjr');
        //   addMessages(message);
        // } else if (messageText === imageconsult) {
        //   console.log('imageconsult');
        //   addMessages(message);
        // } else if (messageText === firstMessage) {
        //   console.log('firstMessage');
        //   addMessages(message);
        // } else if (messageText === secondMessage) {
        //   console.log('secondMessage');
        //   addMessages(message);
        // } else if (messageText === languageQue) {
        //   console.log('languageQue');
        //   addMessages(message);
        // } else if (messageText === jdThankyou) {
        //   console.log('jdThankyou');
        //   addMessages(message);
        // }
        else {
          addMessages(message);
          setTimeout(() => {
            flatListRef.current! && flatListRef.current!.scrollToEnd();
          }, 500);
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
            const data: any = response.channels[channel].occupants;

            const occupancyPatient = data.filter((obj: any) => {
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
              if (!abondmentStarted && patientJoined) {
                abondmentStarted = true;
                startNoShow(200, () => {
                  callAbandonmentCall();
                });
              }
            }
            const PatientConsultStartedMessage = insertText.filter((obj: any) => {
              return obj.message === messageCodes.consultPatientStartedMsg;
            });
            console.log(PatientConsultStartedMessage, 'PatientConsultStartedMessage');
            console.log(startConsult, 'startconsult');
          })
          .catch((error) => {
            console.log(error);
          });
      },
    });

    const addMessages = (message: Pubnub.MessageEvent) => {
      console.log('messages', messages);
      console.log('before insertText', insertText);
      insertText[insertText.length] = message;
      setMessages(() => [...(insertText as [])]);
      console.log('after insertText', insertText);
      console.log('messages', messages);

      if (!isCall || !isAudioCall) {
        setChatReceived(true);
        console.log('true chat icon');
      }
      setTimeout(() => {
        flatListRef.current! && flatListRef.current!.scrollToEnd();
      }, 200);
    };
    const keyboardDidShow = (e: KeyboardEvent) => {
      setHeightList(height - e.endCoordinates.height - 185);
      setTimeout(() => {
        flatListRef.current && flatListRef.current.scrollToEnd();
      }, 200);
    };
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', keyboardDidHide);

    return function cleanup() {
      pubnub.unsubscribe({
        channels: [channel],
      });
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const keyboardDidHide = () => {
    console.log('Keyboard hide');
    setHeightList(height - 185);
  };
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

        try {
          res.messages.forEach((element, index) => {
            newmessage[index] = element.entry;
          });
          console.log('res', res.messages);

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

  const send = (messageText: any) => {
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

        setMessageText('');
      }
    );
  };

  let leftComponent = 0;
  let rightComponent = 0;

  const renderChatRow = (
    rowData: {
      id: string;
      message: string;
      duration: string;
      automatedText?: string;
    },
    index: number
  ) => {
    if (
      [
        messageCodes.typingMsg,
        messageCodes.endCallMsg,
        messageCodes.audioCallMsg,
        messageCodes.videoCallMsg,
        messageCodes.acceptedCallMsg,
        messageCodes.rescheduleconsult,
        messageCodes.followupconsult,
        messageCodes.appointmentComplete,
        messageCodes.firstMessage,
        messageCodes.secondMessage,
        messageCodes.covertVideoMsg,
        messageCodes.covertAudioMsg,
        messageCodes.callAbandonment,
        messageCodes.startConsultMsg,
        messageCodes.stopConsultMsg,
        messageCodes.jdThankyou,
      ].includes(rowData.message)
      // rowData.message === typingMsg ||
      // rowData.message === endCallMsg ||
      // rowData.message === audioCallMsg ||
      // rowData.message === videoCallMsg ||
      // rowData.message === acceptedCallMsg ||
      // rowData.message === rescheduleconsult ||
      // rowData.message === followupconsult ||
      // rowData.message === appointmentComplete ||
      // rowData.message === stopConsultMsg ||
      // rowData.message === firstMessage ||
      // rowData.message === secondMessage ||
      // rowData.message === covertVideoMsg ||
      // rowData.message === covertAudioMsg ||
      // rowData.message === callAbandonment ||
      // rowData.message === startConsultMsg ||
      // rowData.message === jdThankyou
    ) {
      return null;
    }
    if (rowData.id !== doctorId) {
      leftComponent++;
      rightComponent = 0;
      console.log(rowData, 'rowData');
      return (
        <View>
          {leftComponent === 1 ? (
            <View
              style={{
                backgroundColor: 'transparent',
                width: width,
                marginVertical: 8,
              }}
            />
          ) : null}
          {rowData.message === 'Audio call ended' || rowData.message === 'Video call ended' ? (
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
                  {leftComponent === 1 ? <DoctorImage style={styles.imageStyle} /> : null}
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
                      <MissedCallIcon
                        style={{
                          width: 16,
                          height: 16,
                          marginLeft: 16,
                          marginTop: 3,
                        }}
                      />
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
                        {rowData.message === 'Audio call ended'
                          ? strings.consult_room.you_missed_voice_call
                          : strings.consult_room.you_missed_video_call}
                      </Text>
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
                    alignSelf: 'flex-end',
                  }}
                >
                  {leftComponent === 1 ? <DoctorImage style={styles.imageStyle} /> : null}
                  <View
                    style={{
                      borderRadius: 10,
                      marginVertical: 2,
                      alignSelf: 'flex-end',
                      flexDirection: 'row',
                      marginLeft: 40,
                    }}
                  >
                    <ChatCallIcon
                      style={{
                        width: 20,
                        height: 20,
                      }}
                    />
                    <View
                      style={{
                        marginLeft: 12,
                      }}
                    >
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
                        {strings.consult_room.duration} - {rowData.duration}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </>
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
              {leftComponent === 1 ? <DoctorImage style={styles.imageStyle} /> : null}

              <View
                style={{
                  backgroundColor: rowData.message === messageCodes.imageconsult ? '' : 'white',
                  marginLeft: 38,
                  borderRadius: 10,
                  // width: 244,
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
                  {rowData.message === messageCodes.languageQue ||
                  rowData.message === messageCodes.startConsultjr ||
                  rowData.message === messageCodes.stopConsultJr
                    ? rowData.automatedText
                    : rowData.message === messageCodes.imageconsult
                    ? renderImageView(rowData)
                    : rowData.message}
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
                  {rowData.message === messageCodes.imageconsult ? '' : convertChatTime(rowData)}
                </Text>
              </View>
            </View>
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
              <ChatCallIcon
                style={{
                  width: 20,
                  height: 20,
                }}
              />
              <View>
                <Text
                  style={{
                    color: '#01475b',
                    marginLeft: 12,
                    textAlign: 'right',
                    ...theme.fonts.IBMPlexSansMedium(14),
                  }}
                >
                  {rowData.message}
                </Text>
                <Text
                  style={{
                    color: '#01475b',
                    marginTop: 2,
                    textAlign: 'right',
                    ...theme.fonts.IBMPlexSansMedium(10),
                  }}
                >
                  {strings.consult_room.duration} - {rowData.duration}
                </Text>
                <Text
                  style={{
                    color: '#01475b',
                    textAlign: 'right',
                    ...theme.fonts.IBMPlexSansMedium(10),
                  }}
                >
                  {convertChatTime(rowData)}
                </Text>
              </View>
            </View>
          ) : (
            <View
              style={{
                borderRadius: 10,
                marginVertical: 2,
                alignSelf: 'flex-end',
                flexDirection: 'row',
              }}
            >
              {rowData.message === messageCodes.consultPatientStartedMsg
                ? patientAutomatedMessage(rowData, index)
                : rowData.message === messageCodes.firstMessage ||
                  rowData.message === messageCodes.secondMessage
                ? doctorAutomatedMessage(rowData, index)
                : rowData.message === messageCodes.imageconsult
                ? renderImageView(rowData)
                : messageView(rowData, index)}
            </View>
          )}
        </View>
      );
    }
  };

  const renderAutomatedText = (rowData: any, style = {}) => (
    <View style={[styles.automatedTextView, style]}>
      {rowData.automatedText ? (
        <>
          <Text style={styles.automatedLeftText}>{rowData.automatedText}</Text>
          <Text style={styles.automatedRightText}>{convertChatTime(rowData)}</Text>
          <View
            style={{
              backgroundColor: 'transparent',
              height: 4,
              width: 20,
            }}
          />
        </>
      ) : null}
    </View>
  );

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
          <View style={styles.imageStyle}>
            <Mascot style={styles.imageStyle} />
          </View>
        )}
        {renderAutomatedText(rowData, { marginBottom: 4 })}
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
          <View style={styles.imageStyle}>
            <Mascot style={styles.imageStyle} />
          </View>
        )}
        {renderAutomatedText(rowData, { marginBottom: 4, width: 244 })}
      </View>
    );
  };

  const messageView = (rowData: any, index: number) => {
    console.log(rowData, 'messageView');
    const isMatched = rowData.url.match(/\.(jpeg|jpg|gif|png)$/);
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
          <View style={styles.imageStyle}>
            <DoctorPlaceholderImage style={styles.imageStyle} />
          </View>
        )}
        <View>
          {rowData.message === messageCodes.imageconsult ? (
            <View>
              <TouchableOpacity
                onPress={() => {
                  console.log('IMAGE', rowData.url);
                  if (isMatched) {
                    openPopUp(rowData);
                  }
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
                    marginBottom: isMatched ? 4 : 0,
                    flex: 1,
                    marginLeft: 38,
                  }}
                >
                  <ImageNative
                    placeholderStyle={{
                      height: 180,
                      width: '100%',
                      alignItems: 'center',
                      backgroundColor: 'transparent',
                    }}
                    PlaceholderContent={
                      <Spinner
                        style={{
                          backgroundColor: 'transparent',
                        }}
                      />
                    }
                    source={{
                      uri: rowData.url,
                    }}
                    style={{
                      resizeMode: 'stretch',
                      width: 180,
                      height: 180,
                      borderRadius: 10,
                    }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          ) : rowData.message === '^^#startconsultJr' ? (
            renderAutomatedText(rowData)
          ) : rowData.message === '^^#startconsult' ? (
            renderAutomatedText(rowData)
          ) : rowData.message === messageCodes.stopConsultJr ? (
            renderAutomatedText(rowData)
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
              <View
                style={{
                  backgroundColor: 'transparent',
                  height: 4,
                  width: 20,
                }}
              />
            </>
          )}
        </View>
      </View>
    );
  };

  const openPopUp = (rowData: any) => {
    console.log('setShowLoading', rowData);

    setShowLoading(true);
    if (rowData.url.match(/\.(pdf)$/)) {
      if (rowData.prismId) {
        getPrismUrls(client, rowData.id, rowData.prismId)
          .then((data: any) => {
            setUrl((data && data.urls[0]) || rowData.url);
          })
          .catch(() => {
            setUrl(rowData.url);
          })
          .finally(() => {
            setShowLoading(false);
            setShowPDF(true);
          });
      } else {
        setUrl(rowData.url);
        setShowLoading(false);
        setShowPDF(true);
      }
    } else if (rowData.url.match(/\.(jpeg|jpg|gif|png)$/)) {
      if (rowData.prismId) {
        getPrismUrls(client, rowData.id, rowData.prismId)
          .then((data: any) => {
            setUrl((data && data.urls[0]) || rowData.url);
          })
          .catch(() => {
            setUrl(rowData.url);
          })
          .finally(() => {
            setShowLoading(false);
            setPatientImageshow(true);
          });
      } else {
        setUrl(rowData.url);
        setShowLoading(false);
        setPatientImageshow(true);
      }
    } else {
      if (rowData.prismId) {
        getPrismUrls(client, rowData.id, rowData.prismId)
          .then((data: any) => {
            Linking.openURL((data && data.urls[0]) || rowData.url).catch((err) =>
              console.error('An error occurred', err)
            );
          })
          .catch(() => {
            Linking.openURL(rowData.url).catch((err) => console.error('An error occurred', err));
          })
          .finally(() => {
            setShowLoading(false);
            setPatientImageshow(true);
          });
      } else {
        setShowLoading(false);
        Linking.openURL(rowData.url).catch((err) => console.error('An error occurred', err));
      }
    }
  };

  const renderImageView = (rowData: any) => {
    const isMatched = rowData.url.match(/\.(jpeg|jpg|gif|png)$/);
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            console.log('IMAGE11', rowData.url);

            if (isMatched) {
              openPopUp(rowData);
            } else {
              openPopUp(rowData);
              setShowWeb(true);
              setPatientImageshow(true);
            }
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
              flex: 1,
              marginBottom: isMatched ? 4 : 0,
            }}
          >
            <ImageNative
              placeholderStyle={{
                height: 180,
                width: '100%',
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}
              PlaceholderContent={
                <Spinner
                  style={{
                    backgroundColor: 'transparent',
                  }}
                />
              }
              source={{
                uri: rowData.url,
              }}
              style={{
                resizeMode: 'stretch',
                width: 180,
                height: 180,
                borderRadius: 10,
              }}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
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

  const renderChatView = () => {
    return (
      <View
        style={{
          width: width,
          height: returnToCall == false ? heightList : heightList + 20,
          marginTop: 0,
          backgroundColor: '#f0f4f5',
        }}
      >
        {messages.length != 0 ? (
          <FlatList
            ref={(ref) => (flatListRef.current = ref)}
            contentContainerStyle={{
              marginHorizontal: 20,
              marginTop: 0,
            }}
            removeClippedSubviews={false}
            bounces={false}
            data={messages}
            onEndReachedThreshold={0.5}
            renderItem={({ item, index }) => renderChatRow(item, index)}
            keyExtractor={(_, index) => index.toString()}
            numColumns={1}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="on-drag"
          />
        ) : (
          <View
            style={{
              flexDirection: 'row',
              margin: 20,
            }}
          >
            <View
              style={{
                marginTop: 3,
              }}
            >
              <RoundChatIcon />
            </View>
            <Text
              style={{
                marginLeft: 14,
                color: '#0087ba',
                ...theme.fonts.IBMPlexSansMedium(12),
                marginRight: 20,
                lineHeight: 16,
              }}
            >
              {`${strings.consult_room.your_appnt_with} ${PatientInfoAll.firstName} ${
                strings.consult_room.is_scheduled_to_start
              } ${moment(Appintmentdatetime).format('hh.mm A')}`}
            </Text>
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
          <PatientPlaceHolderImage
            style={{
              width: width,
              height: height,
            }}
          />
        )}
        {!PipView && (
          <>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: width,
                height: 24,
                backgroundColor: 'black',
                opacity: 0.6,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                elevation: 2000,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  ...theme.fonts.IBMPlexSansSemiBold(10),
                }}
              >
                {strings.consult_room.time_left}{' '}
                {minutes.toString().length < 2 ? '0' + minutes : minutes} :{' '}
                {seconds.toString().length < 2 ? '0' + seconds : seconds}
              </Text>
            </View>
            <Text
              style={{
                position: 'absolute',
                marginHorizontal: 20,
                marginTop: 44,
                width: width - 40,
                color: 'white',
                ...theme.fonts.IBMPlexSansSemiBold(20),
                textAlign: 'center',
              }}
            >
              {PatientInfoAll.firstName}
            </Text>
          </>
        )}
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
          apiKey={'46401302'}
          sessionId={sessionId}
          token={token}
          // sessionId={'2_MX40NjM5MzU4Mn5-MTU2NTQzNzkyNTgwMX40Qm0rbEtFb3VVQytGZHVQdmR0NHAveG1-fg'}
          // token={
          //   'T1==cGFydG5lcl9pZD00NjM5MzU4MiZzaWc9YmM2MzFhZTEwYWNlODBhZmNhNjMwNDIwOGRkNmZhYzkyMGU3ZjcyMDpzZXNzaW9uX2lkPTJfTVg0ME5qTTVNelU0TW41LU1UVTJOVFF6TnpreU5UZ3dNWDQwUW0wcmJFdEZiM1ZWUXl0R1pIVlFkbVIwTkhBdmVHMS1mZyZjcmVhdGVfdGltZT0xNTY1NDM3OTczJm5vbmNlPTAuNDc1MTYzNTI2Njc3MTIwMzYmcm9sZT1tb2RlcmF0b3ImZXhwaXJlX3RpbWU9MTU2ODAyOTk3MyZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ=='
          // }
          eventHandlers={sessionEventHandlers}
          ref={otSessionRef}
        >
          <OTPublisher
            style={publisherStyles}
            properties={{
              publishVideo: convertVideo ? true : false,
              publishAudio: mute,
              audioVolume: 100,
            }}
            eventHandlers={publisherEventHandlers}
          />
          <OTSubscriber
            style={subscriberStyles}
            subscribeToSelf={true}
            eventHandlers={subscriberEventHandlers}
            properties={{
              subscribeToAudio: true,
              subscribeToVideo: convertVideo ? true : false,
              audioVolume: 100,
            }}
          />
        </OTSession>
        <Text
          style={{
            position: 'absolute',
            marginHorizontal: 20,
            marginTop: 44,
            width: width - 40,
            color: 'white',
            ...theme.fonts.IBMPlexSansSemiBold(20),
            textAlign: 'center',
          }}
        >
          {PatientInfoAll.firstName}
        </Text>
        <Text
          style={{
            position: 'absolute',
            marginHorizontal: 20,
            marginTop: 81,
            width: width - 40,
            color: 'white',
            ...theme.fonts.IBMPlexSansSemiBold(12),
            textAlign: 'center',
            letterSpacing: 0.46,
          }}
        >
          {callAccepted ? callTimerStarted : strings.consult_room.ringing}
        </Text>
        <View
          style={{
            position: 'absolute',
            top: 44,
            left: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setAudioCallStyles({
                flex: 1,
                position: 'absolute',
                top: 0,
                right: 0,
                height: 1,
                width: 1,
              });

              setChatReceived(false);
              setReturnToCall(true);
              setPublisherStyles({
                position: 'absolute',
                top: 0,
                right: 0,
                width: 1,
                height: 1,
                zIndex: 100,
                elevation: 1000,
                borderRadius: 30,
              });
            }}
          >
            {chatReceived ? (
              <ChatWithNotification
                style={{
                  height: 88,
                  width: 88,
                  left: -20,
                  top: -20,
                }}
              />
            ) : (
              <ChatIcon
                style={{
                  height: 48,
                  width: 48,
                }}
              />
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
          {/* <TouchableOpacity onPress={() => {}}>
            <SpeakerOn style={{ width: 60, height: 60 }} />
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => {
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
          >
            {showVideo === true ? (
              <VideoOnIcon
                style={{
                  height: 60,
                  width: 60,
                }}
              />
            ) : (
              <VideoOffIcon
                style={{
                  height: 60,
                  width: 60,
                }}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              mute === true ? setMute(false) : setMute(true);
            }}
          >
            {mute === true ? (
              <UnMuteIcon
                style={{
                  height: 60,
                  width: 60,
                }}
              />
            ) : (
              <MuteIcon
                style={{
                  height: 60,
                  width: 60,
                }}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setIsAudioCall(false);
              setHideStatusBar(false);
              stopTimer();
              stopMissedCallTimer();
              setChatReceived(false);
              setConvertVideo(false);
              setShowVideo(true);
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
          >
            <EndCallIcon
              style={{
                width: 60,
                height: 60,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const VideoCall = () => {
    return (
      <View style={talkStyles}>
        {isCall && (
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
            }}
          >
            <OTSession
              apiKey={'46401302'}
              // sessionId={'2_MX40NjM5MzU4Mn5-MTU2NTQzNzkyNTgwMX40Qm0rbEtFb3VVQytGZHVQdmR0NHAveG1-fg'}
              // token={
              //   'T1==cGFydG5lcl9pZD00NjM5MzU4MiZzaWc9YmM2MzFhZTEwYWNlODBhZmNhNjMwNDIwOGRkNmZhYzkyMGU3ZjcyMDpzZXNzaW9uX2lkPTJfTVg0ME5qTTVNelU0TW41LU1UVTJOVFF6TnpreU5UZ3dNWDQwUW0wcmJFdEZiM1ZWUXl0R1pIVlFkbVIwTkhBdmVHMS1mZyZjcmVhdGVfdGltZT0xNTY1NDM3OTczJm5vbmNlPTAuNDc1MTYzNTI2Njc3MTIwMzYmcm9sZT1tb2RlcmF0b3ImZXhwaXJlX3RpbWU9MTU2ODAyOTk3MyZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ=='
              // }
              sessionId={sessionId}
              token={token}
              eventHandlers={sessionEventHandlers}
              ref={otSessionRef}
              options={{
                connectionEventsSuppressed: true, // default is false
                androidZOrder: 'onTop', // Android only - valid options are 'mediaOverlay' or 'onTop'
                androidOnTop: 'publisher', // Android only - valid options are 'publisher' or 'subscriber'
                useTextureViews: true, // Android only - default is false
                isCamera2Capable: false, // Android only - default is false
              }}
            >
              <OTSubscriber
                style={subscriberStyles}
                subscribeToSelf={true}
                eventHandlers={subscriberEventHandlers}
                properties={{
                  subscribeToAudio: true,
                  subscribeToVideo: true,
                  //audioVolume: 100,
                }}
              />

              <OTPublisher
                style={{
                  position: 'absolute',
                  top: 44,
                  right: 20,
                  width: 112,
                  height: 148,
                  zIndex: 100,
                  elevation: 1000,
                  borderRadius: 30,
                }}
                properties={{
                  cameraPosition: cameraPosition,
                  publishVideo: showVideo,
                  publishAudio: mute,
                  //audioVolume: 100,
                }}
                eventHandlers={publisherEventHandlers}
              />
            </OTSession>
            <Text
              style={{
                position: 'absolute',
                marginHorizontal: 20,
                marginTop: 44,
                width: width - 40,
                color: 'white',
                ...theme.fonts.IBMPlexSansSemiBold(20),
                textAlign: 'center',
              }}
            >
              {PatientInfoAll.firstName}
            </Text>
            {!PipView && (
              <>
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: width,
                    height: 24,
                    backgroundColor: 'black',
                    opacity: 0.6,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    elevation: 2000,
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      ...theme.fonts.IBMPlexSansSemiBold(10),
                    }}
                  >
                    {strings.consult_room.time_left}{' '}
                    {minutes.toString().length < 2 ? '0' + minutes : minutes} :{' '}
                    {seconds.toString().length < 2 ? '0' + seconds : seconds}
                  </Text>
                </View>
                <Text
                  style={{
                    position: 'absolute',
                    marginHorizontal: 20,
                    marginTop: 44,
                    width: width - 40,
                    color: 'white',
                    ...theme.fonts.IBMPlexSansSemiBold(20),
                    textAlign: 'center',
                  }}
                >
                  {PatientInfoAll.firstName}
                </Text>
              </>
            )}
            <Text
              style={{
                position: 'absolute',
                marginHorizontal: 20,
                marginTop: 81,
                width: width - 40,
                color: 'white',
                ...theme.fonts.IBMPlexSansSemiBold(12),
                textAlign: 'center',
                letterSpacing: 0.46,
                zIndex: 1000,
              }}
            >
              {callAccepted
                ? `${callMinutes.toString().length < 2 ? '0' + callMinutes : callMinutes} : ${
                    callSeconds.toString().length < 2 ? '0' + callSeconds : callSeconds
                  }`
                : strings.consult_room.calling}
            </Text>
            {PipView && renderOnCallPipButtons()}
            {!PipView && renderChatNotificationIcon()}
            {!PipView && renderBottomButtons()}
          </View>
        )}
      </View>
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
          onPress={() => {
            setTalkStyles({
              flex: 1,
              backgroundColor: 'transparent',
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              elevation: 2000,
            });
            setSubscriberStyles({
              width,
              height,
            });
            setPublisherStyles({
              position: 'absolute',
              top: 44,
              right: 20,
              width: 112,
              height: 148,
              zIndex: 1000,
              elevation: 2000,
              borderRadius: 30,
            });
            setPipView(false);
            setChatReceived(false);
          }}
        >
          <FullScreenIcon
            style={{
              width: 40,
              height: 40,
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setIsCall(false);
            setChatReceived(false);
            stopMissedCallTimer();
            setTextInputStyles({
              width: width,
              height: 66,
              backgroundColor: 'white',
              top: 20,
              // bottom: -20,
            });
            setLinestyles({
              marginLeft: 20,
              marginRight: 64,
              marginTop: 0,
              height: 2,
              backgroundColor: '#00b38e',
            });
            pubnub.publish(
              {
                message: {
                  isTyping: true,
                  message: strings.consult_room.video_call_ended,
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
        >
          <EndCallIcon
            style={{
              width: 40,
              height: 40,
              marginLeft: 43,
            }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderChatNotificationIcon = () => {
    return (
      <View
        style={{
          position: 'absolute',
          top: 44,
          left: 20,
          right: 0,
          zIndex: 1000,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setTalkStyles({
              flex: 1,
              backgroundColor: 'transparent',
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
              elevation: 2000,
            });

            setPipView(true);
            setChatReceived(false);
            setTextInputStyles({
              width: width,
              height: 66,
              backgroundColor: 'white',
              top: 20,
              // bottom: -20,
            });
            setLinestyles({
              marginLeft: 20,
              marginRight: 64,
              marginTop: -10,
              height: 2,
              backgroundColor: '#00b38e',
            });
          }}
        >
          {chatReceived ? (
            <ChatWithNotification
              style={{
                height: 88,
                width: 80,
                left: -20,
                top: -20,
              }}
            />
          ) : (
            <ChatIcon
              style={{
                height: 48,
                width: 48,
              }}
            />
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
            marginHorizontal: 30,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity
            onPress={() => {
              cameraPosition === 'front' ? setCameraPosition('back') : setCameraPosition('front');
            }}
          >
            {cameraPosition === 'front' ? (
              <BackCameraIcon
                style={{
                  height: 60,
                  width: 60,
                }}
              />
            ) : (
              <FrontCameraIcon
                style={{
                  height: 60,
                  width: 60,
                }}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              showVideo === true ? setShowVideo(false) : setShowVideo(true);
            }}
          >
            {showVideo === true ? (
              <VideoOnIcon
                style={{
                  height: 60,
                  width: 60,
                }}
              />
            ) : (
              <VideoOffIcon
                style={{
                  height: 60,
                  width: 60,
                }}
              />
            )}
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={async () => {
              // Pick multiple files
              try {
                const results = await DocumentPicker.pickMultiple({
                  type: [DocumentPicker.types.images],
                });
                for (const res of results) {
                  console.log(
                    res.uri,
                    res.type, // mime type
                    res.name,
                    res.size
                  );
                }
              } catch (err) {
                if (DocumentPicker.isCancel(err)) {
                  // User cancelled the picker, exit any dialogs or menus and move on
                } else {
                  throw err;
                }
              }
            }}
          >
            <AttachmentIcon style={{ height: 60, width: 60 }} />
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => {
              mute === true ? setMute(false) : setMute(true);
            }}
          >
            {mute === true ? (
              <UnMuteIcon
                style={{
                  height: 60,
                  width: 60,
                }}
              />
            ) : (
              <MuteIcon
                style={{
                  height: 60,
                  width: 60,
                }}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setIsCall(false);
              stopTimer();
              setHideStatusBar(false);
              setChatReceived(false);
              stopMissedCallTimer();
              setTextInputStyles({
                width: width,
                height: 66,
                backgroundColor: 'white',
                top: 5,
                bottom: -10,
              });
              setLinestyles({
                marginLeft: 20,
                marginRight: 64,
                marginTop: -10,
                height: 2,
                backgroundColor: '#00b38e',
              });
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
          >
            <EndCallIcon
              style={{
                height: 60,
                width: 60,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
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
        ></View>
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
                width: 24,
                height: 24,
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
              setIsAudioCall(true);
              setShowPopUp(false);
              setHideStatusBar(true);
              setChatReceived(false);
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
                <RoundCallIcon
                  style={{
                    width: 24,
                    height: 24,
                  }}
                />
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
              setIsCall(true);
              setShowPopUp(false);
              setHideStatusBar(true);
              setChatReceived(false);
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
                    startNoShow(45, () => {
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
                <RoundVideoIcon
                  style={{
                    width: 24,
                    height: 24,
                  }}
                />
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

  const ReturnCallView = () => {
    return (
      <View
        style={{
          width: width,
          height: 44,
          backgroundColor: '#00b38e',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setReturnToCall(false);
            setChatReceived(false);
            Keyboard.dismiss();
            setAudioCallStyles({
              flex: 1,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              elevation: 2000,
            });
          }}
        >
          <View
            style={{
              width: width,
              height: 44,
            }}
          >
            <Text
              style={{
                color: 'white',
                marginLeft: 20,
                ...theme.fonts.IBMPlexSansSemiBold(14),
                textAlign: 'left',
                height: 44,
                marginTop: 13,
              }}
            >
              {strings.consult_room.tap_to_return_call}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const ChatRoom = () => {
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
        console.log('createsession', _data);
        console.log('sessionid', _data.data.createAppointmentSession.sessionId);
        console.log('appointmentToken', _data.data.createAppointmentSession.appointmentToken);
        setsessionId(_data.data.createAppointmentSession.sessionId);
        settoken(_data.data.createAppointmentSession.appointmentToken);
      })
      .catch((e: any) => {
        console.log('Error occured while adding Doctor', e);
      });
    setTimeout(() => {
      flatListRef.current && flatListRef.current!.scrollToEnd();
    }, 1000);
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
        }}
      >
        {renderChatView()}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          enabled
        >
          <View style={textinputStyles}>
            <View
              style={{
                flexDirection: 'row',
                width: width,
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                style={{
                  width: 40,
                  height: 40,
                  marginTop: 9,
                  marginLeft: 5,
                }}
                onPress={async () => {
                  setDropdownVisible(!isDropdownVisible);
                }}
              >
                <AddAttachmentIcon
                  style={{
                    width: 24,
                    height: 24,
                    marginTop: 10,
                    marginLeft: 14,
                  }}
                />
              </TouchableOpacity>
              <View>
                <TextInput
                  autoCorrect={false}
                  placeholder={strings.smartPrescr.type_here}
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
                    Alert.alert(strings.common.apollo, strings.consult_room.Please_write_something);
                    return;
                  }

                  send(textMessage);
                }}
              >
                <ChatSend
                  style={{
                    width: 24,
                    height: 24,
                    marginTop: 8,
                    marginLeft: 14,
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        {returnToCall && ReturnCallView()}
        {}
      </View>
    );
  };

  const renderTabPage = () => {
    return (
      <>
        <View
          style={[
            styles.shadowview,
            showPopUp
              ? {
                  elevation: 1000,
                }
              : {},
          ]}
        >
          <MaterialTabs
            items={[strings.consult_room.case_sheet, strings.consult_room.chat]}
            selectedIndex={activeTabIndex}
            onChange={(index) => setActiveTabIndex(index)}
            barColor="#ffffff"
            indicatorColor="#00b38e"
            activeTextColor="#02475b"
            inactiveTextColor={'#02475b'}
            activeTextStyle={{
              ...theme.fonts.IBMPlexSansBold(14),
              color: '#02475b',
            }}
            uppercase={false}
          ></MaterialTabs>
        </View>
        <View
          style={{
            flex: 1,
          }}
        >
          {activeTabIndex == 0 ? (
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
                    message: message,
                    channel: channel,
                    storeInHistory: true,
                  },
                  (status, response) => {}
                );
              }}
            />
          ) : (
            <View
              style={{
                flex: 1,
                width: '100%',
              }}
            >
              {ChatRoom()}
            </View>
          )}
        </View>
      </>
    );
  };

  const onStartConsult = () => {
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
        setActiveTabIndex(0);
        setStartConsult(true);
        if (timediffInSec > 0) {
          startNoShow(timediffInSec, () => {
            console.log('countdown ', joinTimerNoShow);
            startNoShow(180, () => {
              console.log('Trigger no ShowAPi');
              console.log(joinTimerNoShow, 'joinTimerNoShow');

              endAppointmentApiCall(STATUS.NO_SHOW);
            });
          });
        } else {
          startNoShow(180, () => {
            console.log('Trigger no ShowAPi');
            endAppointmentApiCall(STATUS.NO_SHOW);
          });
        }
        startInterval(timer);
      }
    );
  };

  const onStopConsult = () => {
    console.log('onStopConsult');

    pubnub.publish(
      {
        message: {
          isTyping: true,
          message: '^^#stopconsult',
        },
        channel: channel,
        storeInHistory: true,
      },
      (status, response) => {
        setStartConsult(false);
        stopInterval();
        stopTimer();
      }
    );
  };

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime - minutes * 60;

  const getTimerText = () => {
    const now = new Date();
    const diff = moment.duration(moment(Appintmentdatetime).diff(now));

    const diffInHours = diff.asHours();

    if (diff.hours() > 0 && diff.hours() < 12)
      return `${strings.consult_room.time_to_consult} {' '} ${moment(
        new Date(0, 0, 0, diff.hours(), diff.minutes())
      ).format('hh: mm')}`;
    return '';
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
            onPress: () => props.navigation.pop(),
          },
        ]}
        middleText={strings.consult_room.consult_room}
        timerText={
          consultStarted
            ? `${strings.consult_room.time_left}{' '} ${
                minutes.toString().length < 2 ? '0' + minutes : minutes
              } : ${seconds.toString().length < 2 ? '0' + seconds : seconds}`
            : getTimerText()
        }
        timerremaintext={!consultStarted ? PatientConsultTime : undefined}
        textStyles={{
          marginTop: 10,
        }}
        rightIcons={[
          {
            icon: (
              <View
                style={{
                  marginTop: 0,
                }}
              >
                <Call />
              </View>
            ),
            onPress: () => {
              setHideView(!hideView);
              setActiveTabIndex(1);
              {
                startConsult ? setShowPopUp(true) : null;
              }
            },
          },
          {
            icon: (
              <View
                style={{
                  marginTop: 0,
                  opacity: isAfter ? 1 : 0.5,
                }}
              >
                <DotIcon />
              </View>
            ),
            onPress: () => isAfter && setDropdownShow(!dropdownShow),
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
              height: 80,
            }}
            options={[
              {
                optionText: strings.consult_room.reschedule_consult,
                onPress: () => {
                  setDropdownShow(false);
                  setDisplayReSchedulePopUp(true);
                  // props.navigation.push(AppRoutes.ReschduleConsult, {
                  //   AppointmentId: props.navigation.getParam('AppId'),
                  // });
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
          <CrossPopup
            style={{
              marginRight: 1,
              width: 28,
              height: 28,
            }}
          />
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
          source={{
            uri: url,
          }}
        />
      </View>
    );
  };
  return (
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
          loading={(val) => setShowLoading(val)}
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
            props.navigation.goBack();
          }}
        />
      )}
      {dropdownShow ? renderDropdown() : null}
      {renderTabPage()}
      {showPopUp && CallPopUp()}
      {isAudioCall && AudioCall()}
      {isCall && VideoCall()}
      {showLoading && <Spinner />}
      {uploadPrescriptionPopup()}
      {patientImageshow && imageOpen()}
      {showweb && showWeimageOpen()}
    </SafeAreaView>
  );
};
