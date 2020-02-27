import { ReSchedulePopUp } from '@aph/mobile-doctors/src/components/Appointments/ReSchedulePopUp';
import { UploadPrescriprionPopup } from '@aph/mobile-doctors/src/components/Appointments/UploadPrescriprionPopup';
import { AudioCall } from '@aph/mobile-doctors/src/components/ConsultRoom/AudioCall';
import { CaseSheetAPI } from '@aph/mobile-doctors/src/components/ConsultRoom/CaseSheetAPI';
import { CaseSheetView } from '@aph/mobile-doctors/src/components/ConsultRoom/CaseSheetView';
import { ChatRoom } from '@aph/mobile-doctors/src/components/ConsultRoom/ChatRoom';
import { VideoCall } from '@aph/mobile-doctors/src/components/ConsultRoom/VideoCall';
import { DropDown } from '@aph/mobile-doctors/src/components/ui/DropDown';
import {
  BackArrow,
  Call,
  ClosePopup,
  CrossPopup,
  DotIcon,
  RoundCallIcon,
  RoundVideoIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { NotificationHeader } from '@aph/mobile-doctors/src/components/ui/NotificationHeader';
import { RenderPdf } from '@aph/mobile-doctors/src/components/ui/RenderPdf';
import { TabsComponent } from '@aph/mobile-doctors/src/components/ui/TabsComponent';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import {
  CREATEAPPOINTMENTSESSION,
  CREATE_CASESHEET_FOR_SRD,
  END_APPOINTMENT_SESSION,
  END_CALL_NOTIFICATION,
  GET_CASESHEET,
  SEND_CALL_NOTIFICATION,
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
import {
  EndCallNotification,
  EndCallNotificationVariables,
} from '@aph/mobile-doctors/src/graphql/types/EndCallNotification';
import {
  GetCaseSheet,
  GetCaseSheet_getCaseSheet,
} from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import {
  APPT_CALL_TYPE,
  DOCTOR_CALL_TYPE,
  REQUEST_ROLES,
  STATUS,
} from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import {
  SendCallNotification,
  SendCallNotificationVariables,
} from '@aph/mobile-doctors/src/graphql/types/SendCallNotification';
import { uploadChatDocument } from '@aph/mobile-doctors/src/graphql/types/uploadChatDocument';
import { getPrismUrls } from '@aph/mobile-doctors/src/helpers/clientCalls';
import { PatientInfoData } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { g, messageCodes } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import Pubnub, { HereNowResponse } from 'pubnub';
import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardEvent,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { NavigationScreenProps } from 'react-navigation';
import { TabsComponent } from '@aph/mobile-doctors/src/components/ui/TabsComponent';
import ConsultRoomScreenStyles from '@aph/mobile-doctors/src/components/ConsultRoom/ConsultRoomScreen.styles';

const { height, width } = Dimensions.get('window');
let joinTimerNoShow: any;
let missedCallTimer: any;
const styles = ConsultRoomScreenStyles;

let connectionCount = 0;
let timer = 900;
let intervalId: NodeJS.Timeout;
let stoppedTimer: number;
let timerId: NodeJS.Timeout;

// let joinTimerId: any;
// let diffInHours: number;
// let callAbandonmentTimer: any;
// let callAbandonmentStoppedTimer: number = 200;

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
  const tabsData = [
    { title: strings.consult_room.case_sheet, key: '0' },
    { title: strings.consult_room.chat, key: '1' },
  ];
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [overlayDisplay, setOverlayDisplay] = useState<React.ReactNode>(null);
  const [hideView, setHideView] = useState(false);
  const [chatReceived, setChatReceived] = useState(false);
  const client = useApolloClient();
  const { showAphAlert, hideAphAlert, loading, setLoading } = useUIElements();
  const PatientInfoAll = props.navigation.getParam('PatientInfoAll');
  const AppId = props.navigation.getParam('AppId');
  const Appintmentdatetime = props.navigation.getParam('Appintmentdatetime');
  // const [showLoading, setShowLoading] = useState<boolean>(false);
  // const appointmentData = props.navigation.getParam('AppoinementData');
  const [dropdownShow, setDropdownShow] = useState(false);
  const channel = props.navigation.getParam('AppId');
  const doctorId = props.navigation.getParam('DoctorId');
  const patientId = props.navigation.getParam('PatientId');
  const PatientConsultTime = props.navigation.getParam('PatientConsultTime');
  const [activeTabIndex, setActiveTabIndex] = useState(
    // tabsData[0].title
    props.activeTabIndex ? props.activeTabIndex.toString() : tabsData[0].title
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
    // callAbandonmentCall();
    console.log('PatientConsultTime', PatientConsultTime);
    setTimeout(() => {
      flatListRef.current && flatListRef.current.scrollToEnd();
    }, 1000);
    getCaseSheetAPI();
  }, []);

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
        } else {
          addMessages(message);
          setTimeout(() => {
            flatListRef.current && flatListRef.current.scrollToEnd();
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
              if (!abondmentStarted && patientJoined) {
                abondmentStarted = true;
                startNoShow(200, () => {
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
              favList={favList}
              favMed={favMed}
              favTest={favTest}
              caseSheet={caseSheet}
              caseSheetEdit={caseSheetEdit}
              setCaseSheetEdit={setCaseSheetEdit}
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
              />
            </View>
          )}
        </View>
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
      }
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
            onPress: () => props.navigation.pop(),
          },
        ]}
        middleText={strings.consult_room.consult_room}
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
                  opacity: isAfter ? 1 : 0.5,
                }}
              >
                <Call />
              </View>
            ),
            onPress: () => {
              setHideView(!hideView);
              setActiveTabIndex(tabsData[1].title);
              startConsult && isAfter && setShowPopUp(true);
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
                // setLoading && setLoading(true);
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
                    // setLoading && setLoading(false);
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
                    setLoading && setLoading(false);
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
              }}
            />
          </TouchableOpacity>
        </View>
        {children}
      </View>
    );
  };

  const imageOpen = () => {
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
            props.navigation.goBack();
          }}
        />
      )}
      {dropdownShow ? renderDropdown() : null}
      {!loading && renderTabPage()}
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
          firstName={PatientInfoAll.firstName}
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
                    showVideo === true ? messageCodes.covertVideoMsg : messageCodes.covertAudioMsg,
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
          firstName={PatientInfoAll.firstName}
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
      {/* {showLoading && <Spinner />} */}
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
    </SafeAreaView>
  );
};
