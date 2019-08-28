import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  BackCameraIcon,
  ChatIcon,
  DoctorCall,
  DoctorImage,
  EndCallIcon,
  FrontCameraIcon,
  FullScreenIcon,
  MuteIcon,
  PickCallIcon,
  SpeakerOn,
  UnMuteIcon,
  VideoOffIcon,
  VideoOnIcon,
  AddAttachmentIcon,
  ChatWithNotification,
  ChatCallIcon,
  MissedCallIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { UPDATE_APPOINTMENT_SESSION } from '@aph/mobile-patients/src/graphql/profiles';
import {
  updateAppointmentSession,
  updateAppointmentSessionVariables,
} from '@aph/mobile-patients/src/graphql/types/updateAppointmentSession';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { OTPublisher, OTSession, OTSubscriber } from 'opentok-react-native';
import Pubnub from 'pubnub';
import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  FlatList,
  Keyboard,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  KeyboardAvoidingView,
  KeyboardEvent,
  AsyncStorage,
  Image,
  NativeModules,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import DocumentPicker from 'react-native-document-picker';
import { DropDown } from '@aph/mobile-patients/src/components/ui/DropDown';
import InCallManager from 'react-native-incall-manager';
import { DeviceHelper } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import moment from 'moment';
import { useAuth, useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

const { ExportDeviceToken } = NativeModules;
const { height, width } = Dimensions.get('window');

const timer: number = 900;
let timerId: NodeJS.Timeout;
let diffInHours: number;

export interface ChatRoomProps extends NavigationScreenProps {}
export const ChatRoom: React.FC<ChatRoomProps> = (props) => {
  const { isIphoneX } = DeviceHelper();
  const appointmentData = props.navigation.state.params!.data;
  // console.log('appointmentData', appointmentData);

  const flatListRef = useRef<FlatList<never> | undefined | null>();
  const otSessionRef = React.createRef();

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState<string>('');
  const [heightList, setHeightList] = useState<number>(
    isIphoneX() ? height - 210 : Platform.OS === 'ios' ? height - 185 : height - 185
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
    width: 112,
    height: 148,
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

  const [textinputStyles, setTextInputStyles] = useState<Object>({
    width: width,
    height: 66,
    backgroundColor: 'white',
    // top: 0,
    bottom: 0,
  });
  const [linestyles, setLinestyles] = useState<Object>({
    marginLeft: 20,
    marginRight: 64,
    marginTop: 0,
    height: 2,
    backgroundColor: '#00b38e',
    zIndex: -1,
  });

  const [remainingTime, setRemainingTime] = useState<number>(900);
  const [consultStarted, setConsultStarted] = useState<boolean>(true);
  const [callTimer, setCallTimer] = useState<number>(0);
  const [callAccepted, setCallAccepted] = useState<boolean>(false);
  const [hideStatusBar, setHideStatusBar] = useState<boolean>(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [chatReceived, setChatReceived] = useState(false);
  const [doctorJoined, setDoctorJoined] = useState(false);
  const [apiCalled, setApiCalled] = useState(false);
  const [userName, setuserName] = useState<string>('');
  const [convertVideo, setConvertVideo] = useState<boolean>(false);

  const videoCallMsg = '^^callme`video^^';
  const audioCallMsg = '^^callme`audio^^';
  const acceptedCallMsg = '^^callme`accept^^';
  const endCallMsg = '^^callme`stop^^';
  const startConsultMsg = '^^#startconsult';
  const stopConsultMsg = '^^#stopconsult';
  const typingMsg = '^^#typing';
  const covertVideoMsg = '^^convert`video^^';
  const covertAudioMsg = '^^convert`audio^^';

  const patientId = appointmentData.patientId;
  const channel = appointmentData.id;

  let intervalId: NodeJS.Timeout;
  let stoppedTimer: number;

  const { analytics } = useAuth();
  const { currentPatient } = useAllCurrentPatients();

  useEffect(() => {
    const userName =
      currentPatient && currentPatient.firstName ? currentPatient.firstName.split(' ')[0] : '';
    setuserName(userName);
    console.log('consult room', currentPatient);
    analytics.setCurrentScreen(AppRoutes.ChatRoom);
  }, []);

  const client = useApolloClient();

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
      }, 4000);

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
      setHideStatusBar(false);
      console.log('session stream connectionDestroyed!', event);
      setConvertVideo(false);

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
    subscribeKey: 'sub-c-58d0cebc-8f49-11e9-8da6-aad0a85e15ac',
    publishKey: 'pub-c-e3541ce5-f695-4fbd-bca5-a3a9d0f284d3',
    ssl: true,
  };
  const pubnub = new Pubnub(config);

  useEffect(() => {
    console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];
    console.disableYellowBox = true;
    console.log('isIphoneX', isIphoneX());

    pubnub.subscribe({
      channels: [channel],
      withPresence: true,
    });

    getHistory(0);
    registerForPushNotification();

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
      pubnub.unsubscribe({ channels: [channel] });
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
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

  const getHistory = (timetoken: number) => {
    pubnub.history(
      {
        channel: channel,
        reverse: true,
        count: 100000,
        stringifiedTimeToken: true,
        start: timetoken,
      },
      (status, res) => {
        // const start = res.startTimeToken;
        const msgs = res.messages;

        const newmessage: { message: string }[] = [];

        res.messages.forEach((element, index) => {
          newmessage[index] = element.entry;
        });
        console.log('res', res);

        if (messages.length !== newmessage.length) {
          try {
            if (newmessage[newmessage.length - 1].message === startConsultMsg) {
              updateSessionAPI();
              checkingAppointmentDates();
            }
          } catch (error) {
            console.log('error', error);
          }

          insertText = newmessage;
          setMessages(newmessage as []);
          console.log('newmessage', newmessage);

          if (msgs.length == 100) {
            console.log('hihihihihi');
            // getHistory(start);
          }

          setTimeout(() => {
            flatListRef.current! && flatListRef.current!.scrollToEnd({ animated: true });
          }, 1000);
        }
      }
    );
  };

  // function getAllMessages(timetoken) {
  //   pubnub.history(
  //     {
  //       channel: 'ba7897d4-848f-4f02-8058-ebac75382be8',
  //       stringifiedTimeToken: true, // false is the default
  //       start: timetoken // start time token to fetch
  //       //count: 1000
  //     },
  //     function (status, response) {
  //       var msgs = response.messages;
  //       var start = response.startTimeToken;
  //       var end = response.endTimeToken;
  //       // if msgs were retrieved, do something useful with them
  //       if (msgs != "undefined" && msgs.length > 0) {
  //         console.log(msgs.length);
  //         console.log("start : " + start);
  //         console.log("end : " + end);
  //         console.log("Lenght" + msgs.length);
  //       }
  //       // if 100 msgs were retrieved, there might be more; call history again
  //       if (msgs.length == 100) {
  //         console.log("hihihihihi");
  //         getAllMessages(start);

  //       }
  //     }
  //   );
  // }
  // getAllMessages(0);

  const checkingAppointmentDates = () => {
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
  };

  const pubNubMessages = (message: Pubnub.MessageEvent) => {
    if (message.message.isTyping) {
      if (message.message.message === audioCallMsg) {
        setIsAudio(true);
        setOnSubscribe(true);
        InCallManager.startRingtone('_BUNDLE_');
        InCallManager.start({ media: 'audio' }); // audio/video, default: audio
      } else if (message.message.message === videoCallMsg) {
        setOnSubscribe(true);
        setIsAudio(false);
        InCallManager.startRingtone('_BUNDLE_');
        InCallManager.start({ media: 'audio' }); // audio/video, default: audio
      } else if (message.message.message === startConsultMsg) {
        stopInterval();
        startInterval(timer);
        updateSessionAPI();
        checkingAppointmentDates();
      } else if (message.message.message === stopConsultMsg) {
        console.log('listener remainingTime', remainingTime);
        stopInterval();
        setConvertVideo(false);
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
      }
    } else {
      addMessages(message);
    }
  };

  const addMessages = (message: Pubnub.MessageEvent) => {
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
        ? height - e.endCoordinates.height - 210
        : Platform.OS === 'ios'
        ? height - e.endCoordinates.height - 185
        : height - e.endCoordinates.height - 185
    );
    setTimeout(() => {
      flatListRef.current! && flatListRef.current!.scrollToEnd({ animated: false });
    }, 500);
  };

  const keyboardDidHide = () => {
    setHeightList(isIphoneX() ? height - 210 : Platform.OS === 'ios' ? height - 185 : height - 185);
  };

  const send = () => {
    const text = {
      id: patientId,
      message: messageText,
    };

    pubnub.publish(
      {
        channel: channel,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {
        setMessageText('');
      }
    );
  };

  let leftComponent = 0;
  let rightComponent = 0;

  const renderChatRow = (
    rowData: { id: string; message: string; duration: string },
    index: number
  ) => {
    if (
      rowData.message === typingMsg ||
      rowData.message === startConsultMsg ||
      rowData.message === stopConsultMsg ||
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
                      {appointmentData.doctorInfo.photoUrl ? (
                        <Image
                          source={{ uri: appointmentData.doctorInfo.photoUrl }}
                          style={{
                            width: 32,
                            height: 32,
                          }}
                        />
                      ) : (
                        <DoctorImage
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
                      <MissedCallIcon
                        style={{ width: 16, height: 16, marginLeft: 16, marginTop: 3 }}
                      />
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
                      {appointmentData.doctorInfo.photoUrl ? (
                        <Image
                          source={{ uri: appointmentData.doctorInfo.photoUrl }}
                          style={{
                            width: 32,
                            height: 32,
                          }}
                        />
                      ) : (
                        <DoctorImage
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
                  {appointmentData.doctorInfo.photoUrl ? (
                    <Image
                      source={{ uri: appointmentData.doctorInfo.photoUrl }}
                      style={{
                        width: 32,
                        height: 32,
                      }}
                    />
                  ) : (
                    <DoctorImage
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
              <ChatCallIcon style={{ width: 20, height: 20 }} />
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
                  Duration - {rowData.duration}
                </Text>
              </View>
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
                  textAlign: 'right',
                  ...theme.fonts.IBMPlexSansMedium(16),
                }}
              >
                {rowData.message}
              </Text>
            </View>
          )}
        </View>
      );
    }
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
              apiKey={'46401302'}
              sessionId={sessionId}
              token={token}
              // apiKey={'46409832'}
              // sessionId={
              //   '2_MX40NjQwOTgzMn5-MTU2Njk3NTkyMjgxM35yK0YwQjhHUnhGS2k1dTM4eUpBbHFHY3p-UH4'
              // }
              // token={
              //   'T1==cGFydG5lcl9pZD00NjQwOTgzMiZzaWc9NDAzMWJlZDA0NzAxMTIyMWU1NzU2OWI4MmEzYjg3YTI0N2VmZDkyYzpzZXNzaW9uX2lkPTJfTVg0ME5qUXdPVGd6TW41LU1UVTJOamszTlRreU1qZ3hNMzV5SzBZd1FqaEhVbmhHUzJrMWRUTTRlVXBCYkhGSFkzcC1VSDQmY3JlYXRlX3RpbWU9MTU2Njk3NTkzNiZub25jZT0wLjMwNjk1ODQ4MDE0NzM0MTczJnJvbGU9bW9kZXJhdG9yJmV4cGlyZV90aW1lPTE1Njk1Njc5MzUmaW5pdGlhbF9sYXlvdXRfY2xhc3NfbGlzdD0='
              // }
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
                    backgroundColor: 'black',
                    opacity: 0.6,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                  }}
                >
                  <Text style={{ color: 'white', ...theme.fonts.IBMPlexSansSemiBold(10) }}>
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
                  {appointmentData.doctorInfo.firstName}
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
        {!convertVideo && <DoctorCall style={audioCallImageStyles} />}
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
          // apiKey={'46409832'}
          // sessionId={'2_MX40NjQwOTgzMn5-MTU2Njk3NTkyMjgxM35yK0YwQjhHUnhGS2k1dTM4eUpBbHFHY3p-UH4'}
          // token={
          //   'T1==cGFydG5lcl9pZD00NjQwOTgzMiZzaWc9NDAzMWJlZDA0NzAxMTIyMWU1NzU2OWI4MmEzYjg3YTI0N2VmZDkyYzpzZXNzaW9uX2lkPTJfTVg0ME5qUXdPVGd6TW41LU1UVTJOamszTlRreU1qZ3hNMzV5SzBZd1FqaEhVbmhHUzJrMWRUTTRlVXBCYkhGSFkzcC1VSDQmY3JlYXRlX3RpbWU9MTU2Njk3NTkzNiZub25jZT0wLjMwNjk1ODQ4MDE0NzM0MTczJnJvbGU9bW9kZXJhdG9yJmV4cGlyZV90aW1lPTE1Njk1Njc5MzUmaW5pdGlhbF9sYXlvdXRfY2xhc3NfbGlzdD0='
          // }
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
              backgroundColor: 'black',
              opacity: 0.6,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <Text style={{ color: 'white', ...theme.fonts.IBMPlexSansSemiBold(10) }}>
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
      width: 112,
      height: 148,
      zIndex: 1000,
      borderRadius: 30,
    });
    Keyboard.dismiss();
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
          {appointmentData.doctorInfo.firstName}
        </Text>
        <View
          style={{
            position: 'absolute',
            top: isIphoneX() ? 64 : 44,
            left: 20,
          }}
        >
          <TouchableOpacity
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
          {/* <TouchableOpacity onPress={() => {}}>
            <SpeakerOn style={{ width: 60, height: 60 }} />
          </TouchableOpacity> */}
          <TouchableOpacity
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
            onPress={() => {
              setIsAudioCall(false);
              stopTimer();
              setHideStatusBar(false);
              setMute(true);
              setShowVideo(true);
              setCameraPosition('front');

              setTextInputStyles({
                width: width,
                height: 66,
                backgroundColor: 'white',
                // top: 0,
                bottom: 0,
              });

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
          onPress={() => {
            changeVideoStyles();
          }}
        >
          <FullScreenIcon style={{ width: 40, height: 40 }} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setIsCall(false);
            setMute(true);
            setShowVideo(true);
            setCameraPosition('front');
            stopTimer();
            setHideStatusBar(false);

            setTextInputStyles({
              width: width,
              height: 66,
              backgroundColor: 'white',
              // top: 0,
              bottom: 0,
            });

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
      width: 112,
      height: 148,
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
            setTextInputStyles({
              width: width,
              height: 66,
              backgroundColor: 'white',
              bottom: 0,
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
            onPress={() => {
              setIsCall(false);
              setMute(true);
              setShowVideo(true);
              setCameraPosition('front');
              stopTimer();
              setHideStatusBar(false);
              setChatReceived(false);

              setTextInputStyles({
                width: width,
                height: 66,
                backgroundColor: 'white',
                // top: 0,
                bottom: 0,
              });
              setLinestyles({
                marginLeft: 20,
                marginRight: 64,
                marginTop: -10,
                height: 2,
                backgroundColor: '#00b38e',
                // marginLeft: 20,
                // marginRight: 64,
                // marginTop: 0,
                // height: 2,
                // backgroundColor: '#00b38e',
                // zIndex: -1,
              });

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
        <DoctorCall
          style={{
            width: 155,
            height: 205,
            opacity: 0.5,
            borderRadius: 30,
          }}
        />
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

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime - minutes * 60;

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
          onPressLeftIcon={() => props.navigation.goBack()}
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
            }}
          >
            <Text
              style={{
                color: 'white',
                ...theme.fonts.IBMPlexSansMedium(14),
                marginLeft: 20,
              }}
            >
              Dr. {appointmentData.doctorInfo.firstName} has joined!
            </Text>
          </View>
        ) : (
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
              backgroundColor: '#f7f8f5',
            }}
          >
            {consultStarted ? (
              <Text
                style={{
                  color: '#0087ba',
                  ...theme.fonts.IBMPlexSansMedium(14),
                  marginLeft: 20,
                }}
              >
                Time Remaining — {minutes.toString().length < 2 ? '0' + minutes : minutes} :{' '}
                {seconds.toString().length < 2 ? '0' + seconds : seconds}
              </Text>
            ) : (
              <Text
                style={{
                  color: '#0087ba',
                  ...theme.fonts.IBMPlexSansMedium(14),
                  marginLeft: 20,
                }}
              >
                Consultation ended in — {minutes.toString().length < 2 ? '0' + minutes : minutes} :{' '}
                {seconds.toString().length < 2 ? '0' + seconds : seconds} mins
              </Text>
            )}
          </View>
        )}
        {renderChatView()}
        <KeyboardAvoidingView behavior="padding" enabled>
          <View style={textinputStyles}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: width }}>
              <TextInput
                autoCorrect={false}
                placeholder="Type here…"
                style={{
                  marginLeft: 20,
                  marginTop: 0,
                  height: 44,
                  width: width - 84,
                  ...theme.fonts.IBMPlexSansMedium(16),
                }}
                value={messageText}
                blurOnSubmit={false}
                returnKeyType="send"
                onChangeText={(value) => {
                  setMessageText(value);
                }}
                onSubmitEditing={() => {
                  const textMessage = messageText.trim();

                  if (textMessage.length == 0) {
                    Alert.alert('Apollo', 'Please write something to send message.');
                    return;
                  }

                  send();
                }}
              />
              <TouchableOpacity
                onPress={async () => {
                  if (messageText.length == 0) {
                    //Alert.alert('Apollo', 'Please write something to send');
                    setDropdownVisible(!isDropdownVisible);
                    return;
                  }
                }}
              >
                {isDropdownVisible == true ? (
                  <View
                    style={{
                      width: 200,
                      bottom: -15,
                      position: 'absolute',
                      right: -15,
                      shadowColor: '#808080',
                      shadowOffset: { width: 0, height: 5 },
                      shadowOpacity: 0.4,
                      shadowRadius: 20,
                      elevation: 16,
                      zIndex: 2,
                    }}
                  >
                    <DropDown
                      options={[
                        {
                          optionText: 'Camera',
                          onPress: () => {
                            setDropdownVisible(false);
                          },
                        },
                        {
                          optionText: 'Document',

                          onPress: () => {
                            try {
                              const results = DocumentPicker.pickMultiple({
                                type: [DocumentPicker.types.allFiles],
                              });
                              console.log('results', results);
                              setDropdownVisible(false);
                            } catch (err) {
                              if (DocumentPicker.isCancel(err)) {
                                // User cancelled the picker, exit any dialogs or menus and move on
                              } else {
                                throw err;
                              }
                            }
                          },
                        },
                        {
                          optionText: 'Gallery',
                          onPress: () => {
                            setDropdownVisible(false);
                          },
                        },
                      ]}
                    />
                  </View>
                ) : null}
                <AddAttachmentIcon
                  style={{ width: 22, height: 22, marginTop: 18, marginLeft: 22, zIndex: -1 }}
                />
              </TouchableOpacity>
            </View>
            <View style={linestyles} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {onSubscribe && IncomingCallView()}
      {isCall && VideoCall()}
      {isAudioCall && AudioCall()}
    </View>
  );
};
