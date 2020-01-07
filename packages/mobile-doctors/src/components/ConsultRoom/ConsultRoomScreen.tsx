import { CaseSheetView } from '@aph/mobile-doctors/src/components/ConsultRoom/CaseSheetView';
import {
  AddIcon,
  BackArrow,
  BackCameraIcon,
  Call,
  ChatCallIcon,
  ChatIcon,
  ChatWithNotification,
  ClosePopup,
  DoctorImage,
  DotIcon,
  EndCallIcon,
  FrontCameraIcon,
  FullScreenIcon,
  MissedCallIcon,
  MuteIcon,
  PatientPlaceHolderImage,
  RoundCallIcon,
  RoundChatIcon,
  RoundVideoIcon,
  SpeakerOn,
  UnMuteIcon,
  VideoOffIcon,
  VideoOnIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { NotificationHeader } from '@aph/mobile-doctors/src/components/ui/NotificationHeader';
import { CREATEAPPOINTMENTSESSION } from '@aph/mobile-doctors/src/graphql/profiles';
import {
  CreateAppointmentSession,
  CreateAppointmentSessionVariables,
} from '@aph/mobile-doctors/src/graphql/types/CreateAppointmentSession';
import { REQUEST_ROLES } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import { PatientInfoData } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment, { duration } from 'moment';
import { OTPublisher, OTSession, OTSubscriber } from 'opentok-react-native';
import Pubnub from 'pubnub';
import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardEvent,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialTabs from 'react-native-material-tabs';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { DropDown } from '@aph/mobile-doctors/src/components/ui/DropDown';
import { CalendarView } from '@aph/mobile-doctors/src/components/ui/CalendarView';
import { ReSchedulePopUp } from '@aph/mobile-doctors/src/components/Appointments/ReSchedulePopUp';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
//import ImagePicker from 'react-native-image-picker';

const { height, width } = Dimensions.get('window');

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
});

let connectionCount = 0;
let timer = 900;
let intervalId: any;
let stoppedTimer: number;
let timerId: any;

const videoCallMsg = '^^callme`video^^';
const audioCallMsg = '^^callme`audio^^';
const acceptedCallMsg = '^^callme`accept^^';
const startConsultMsg = '^^#startconsult';
const stopConsultMsg = '^^#stopconsult';
const typingMsg = '^^#typing';
const endCallMsg = '^^callme`stop^^';
const covertVideoMsg = '^^convert`video^^';
const covertAudioMsg = '^^convert`audio^^';
const rescheduleconsult = '^^#rescheduleconsult';
const patientId = 'Sai';
// const channel = 'Channel7';

export interface ConsultRoomScreenProps
  extends NavigationScreenProps<{
    DoctorId: string;
    PatientId: string;
    PatientConsultTime: string;
    PatientInfoAll: PatientInfoData;
    AppId: string;
    Appintmentdatetime: string; //Date;

    // navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
  }> {
  // navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
}

export const ConsultRoomScreen: React.FC<ConsultRoomScreenProps> = (props) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [hideView, setHideView] = useState(false);
  const [chatReceived, setChatReceived] = useState(false);
  const client = useApolloClient();
  const PatientInfoAll = props.navigation.getParam('PatientInfoAll');
  const AppId = props.navigation.getParam('AppId');
  const Appintmentdatetime = props.navigation.getParam('Appintmentdatetime');
  const [showLoading, setShowLoading] = useState<boolean>(false);
  //console.log('hihihi', Appintmentdatetime);
  const [dropdownShow, setDropdownShow] = useState(false);
  const channel = props.navigation.getParam('AppId');

  const doctorId = props.navigation.getParam('DoctorId');

  const PatientConsultTime = props.navigation.getParam('PatientConsultTime');

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const flatListRef = useRef<FlatList<never> | undefined | null>();
  const otSessionRef = React.createRef();

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState<string>('');
  const [heightList, setHeightList] = useState<number>(height - 185);
  const [displayReSchedulePopUp, setDisplayReSchedulePopUp] = useState<boolean>(false);
  const [apiKey, setapiKey] = useState<string>('');
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

  useEffect(() => {
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

  const { doctorDetails } = useAuth();

  const consultTime =
    doctorDetails?.consultHours?.filter(
      (item) =>
        item?.weekDay ===
        moment(Appintmentdatetime)
          .format('dddd')
          .toUpperCase()
    )[0]?.consultDuration || 15;
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
    subscribeKey: 'sub-c-58d0cebc-8f49-11e9-8da6-aad0a85e15ac',
    publishKey: 'pub-c-e3541ce5-f695-4fbd-bca5-a3a9d0f284d3',
    ssl: true,
  };
  const pubnub = new Pubnub(config);
  // console.log('pubnub', pubnub);

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
      message: (message) => {
        console.log('addListener', message.message.message);
        if (message.message.isTyping) {
          if (message.message.message === acceptedCallMsg) {
            startTimer(0);
            setCallAccepted(true);
          } else if (message.message.message === endCallMsg) {
            setIsCall(false);
            setIsAudioCall(false);
            setHideStatusBar(false);
            stopTimer();
            setCallAccepted(false);
            setReturnToCall(false);
          } else if (message.message.message === covertVideoMsg) {
            setConvertVideo(true);
          } else if (message.message.message === covertAudioMsg) {
            console.log('covertVideoMsg', covertAudioMsg);
            setConvertVideo(false);
          } else if (
            message.message.message === 'Audio call ended' ||
            message.message.message === 'Video call ended'
          ) {
            console.log('aftercal');
            // setIsCall(false);
            // setIsAudioCall(false);
            addMessages(message);
            // setCallAccepted(false);
            // setReturnToCall(false);

            setIsCall(false);
            setIsAudioCall(false);
            setHideStatusBar(false);
            stopTimer();
            setCallAccepted(false);
            setReturnToCall(false);
          }
        } else {
          addMessages(message);
          setTimeout(() => {
            flatListRef.current! && flatListRef.current!.scrollToEnd();
          }, 500);
        }
      },
      presence: (presenceEvent) => {
        console.log('presenceEvent', presenceEvent);
      },
    });

    const addMessages = (message: Pubnub.MessageEvent) => {
      console.log('messages', messages);

      console.log('before insertText', insertText);

      insertText[insertText.length] = message.message;
      //setMessages(insertText as []);
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
      pubnub.unsubscribe({ channels: [channel] });
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
    pubnub.history({ channel: channel, reverse: true, count: 1000 }, (status, res) => {
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
    });
  };

  const send = () => {
    const text = {
      id: doctorId,
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
    if (rowData.id !== props.navigation.getParam('DoctorId')) {
      leftComponent++;
      rightComponent = 0;
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
                  {leftComponent === 1 ? (
                    <DoctorImage
                      style={{
                        width: 32,
                        height: 32,
                        bottom: 0,
                        position: 'absolute',
                        left: 0,
                      }}
                    />
                  ) : null}
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
                    alignSelf: 'flex-end',
                  }}
                >
                  {leftComponent === 1 ? (
                    <DoctorImage
                      style={{
                        width: 32,
                        height: 32,
                        bottom: 0,
                        position: 'absolute',
                        left: 0,
                      }}
                    />
                  ) : null}
                  <View
                    style={{
                      borderRadius: 10,
                      marginVertical: 2,
                      alignSelf: 'flex-end',
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
              {leftComponent === 1 ? (
                <DoctorImage
                  style={{
                    width: 32,
                    height: 32,
                    bottom: 0,
                    position: 'absolute',
                    left: 0,
                  }}
                />
              ) : null}
              <View
                style={{
                  backgroundColor: 'white',
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
          <View style={{ flexDirection: 'row', margin: 20 }}>
            <View style={{ marginTop: 3 }}>
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
              {`Your appointment with ${PatientInfoAll.firstName} is scheduled to start at ${moment(
                Appintmentdatetime
              ).format('hh.mm A')}`}
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
        {!convertVideo && <PatientPlaceHolderImage style={{ width: width, height: height }} />}
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
              <Text style={{ color: 'white', ...theme.fonts.IBMPlexSansSemiBold(10) }}>
                Time Left {minutes.toString().length < 2 ? '0' + minutes : minutes} :{' '}
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
          {callAccepted ? callTimerStarted : 'RINGING'}
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
              showVideo === true ? setShowVideo(false) : setShowVideo(true);
              pubnub.publish(
                {
                  message: {
                    isTyping: true,
                    message: showVideo === true ? covertVideoMsg : covertAudioMsg,
                  },
                  channel: channel,
                  storeInHistory: false,
                },
                (status, response) => {}
              );
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
              setIsAudioCall(false);
              setHideStatusBar(false);
              stopTimer();
              setChatReceived(false);
              setConvertVideo(false);
              setShowVideo(true);
              pubnub.publish(
                {
                  message: {
                    isTyping: true,
                    message: 'Audio call ended',
                    duration: callTimerStarted,
                    id: props.navigation.getParam('DoctorId'),
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
                  <Text style={{ color: 'white', ...theme.fonts.IBMPlexSansSemiBold(10) }}>
                    Time Left {minutes.toString().length < 2 ? '0' + minutes : minutes} :{' '}
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
                : 'CALLING'}
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
          <FullScreenIcon style={{ width: 40, height: 40 }} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setIsCall(false);
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
              marginTop: 0,
              height: 2,
              backgroundColor: '#00b38e',
            });
            pubnub.publish(
              {
                message: {
                  isTyping: true,
                  message: 'Video call ended',
                  duration: callTimerStarted,
                  id: props.navigation.getParam('DoctorId'),
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
            <ChatWithNotification style={{ height: 88, width: 80, left: -20, top: -20 }} />
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
              <UnMuteIcon style={{ height: 60, width: 60 }} />
            ) : (
              <MuteIcon style={{ height: 60, width: 60 }} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setIsCall(false);
              stopTimer();
              setHideStatusBar(false);
              setChatReceived(false);
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
                    message: 'Video call ended',
                    duration: callTimerStarted,
                    id: props.navigation.getParam('DoctorId'),
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
          <TouchableOpacity onPress={() => setShowPopUp(false)} style={{ height: 40 }}>
            <ClosePopup
              style={{ width: 24, height: 24, top: 16, position: 'absolute', right: 16 }}
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
            How do you want to talk to the patient?
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (!startConsult) {
                console.log('consult not started');
                Alert.alert('Apollo', 'Please start the consultation');
                return;
              }

              if (isAudioCall) {
                return;
              }
              setIsAudioCall(true);
              setShowPopUp(false);
              setHideStatusBar(true);
              setChatReceived(false);
              Keyboard.dismiss();
              pubnub.publish(
                {
                  message: {
                    isTyping: true,
                    message: audioCallMsg, //'^^#audiocall',
                  },
                  channel: channel,
                  storeInHistory: true,
                },
                (status, response) => {}
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
              <View style={{ flexDirection: 'row' }}>
                <RoundCallIcon style={{ width: 24, height: 24 }} />
                <Text
                  style={{
                    marginLeft: 8,
                    color: 'white',
                    lineHeight: 24,
                    ...theme.fonts.IBMPlexSansBold(13),
                  }}
                >
                  AUDIO CALL
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (!startConsult) {
                console.log('consult not started');
                Alert.alert('Apollo', 'Please start the consultation');
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
                    message: videoCallMsg, //'^^#videocall',
                  },
                  channel: channel,
                  storeInHistory: true,
                },
                (status, response) => {}
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
              <View style={{ flexDirection: 'row' }}>
                <RoundVideoIcon style={{ width: 24, height: 24 }} />
                <Text
                  style={{
                    marginLeft: 8,
                    color: 'white',
                    lineHeight: 24,
                    ...theme.fonts.IBMPlexSansBold(13),
                  }}
                >
                  VIDEO CALL
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
              Tap to return to call
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
                alignItems: 'center',
                width: width,
                // backgroundColor: 'red',
                paddingBottom: 0,
                bottom: 0,
              }}
            >
              <TextInput
                autoCorrect={false}
                placeholder="Type here…"
                blurOnSubmit={false}
                style={{
                  marginLeft: 20,
                  marginTop: 0,
                  height: 44,
                  width: width - 84,
                  ...theme.fonts.IBMPlexSansMedium(16),
                }}
                placeholderTextColor="rgba(2, 71, 91, 0.3)"
                value={messageText}
                returnKeyType="send"
                onChangeText={(value) => {
                  setMessageText(value);
                  pubnub.publish(
                    {
                      message: {
                        senderId: 'user123',
                        isTyping: true,
                        message: '^^#typing',
                      },
                      channel: channel,
                      storeInHistory: false,
                    },
                    (status, response) => {}
                  );
                }}
                onSubmitEditing={() => {
                  console.log('on submit');
                  const textMessage = messageText.trim();

                  if (textMessage.length == 0) {
                    Alert.alert('Apollo', 'Please write something to send message.');
                    return;
                  }
                  send();
                }}
                // onKeyPress={(event) => {
                //   console.log('event', event.nativeEvent.key);
                //   if (event.nativeEvent.key == 'Enter') {
                //   } else {
                //     console.log('Something else Pressed');
                //   }
                // }}
              />

              <TouchableOpacity
                onPress={async () => {
                  if (messageText.length == 0) {
                    //Alert.alert('Apollo', 'Please write something to send');
                    setDropdownVisible(!isDropdownVisible);
                    return;
                  }
                  if (!startConsult) {
                    console.log('consult not started');
                    Alert.alert('Apollo', 'Please start the consultation');
                    return;
                  }
                  send();
                }}
              >
                <AddIcon
                  style={{ width: 22, height: 22, marginTop: 18, marginLeft: 22, zIndex: -1 }}
                />
              </TouchableOpacity>
            </View>
            <View style={linestyles} />
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
        <View style={[styles.shadowview, showPopUp ? { elevation: 1000 } : {}]}>
          <MaterialTabs
            items={['Case Sheet', 'Chat']}
            selectedIndex={activeTabIndex}
            onChange={(index) => setActiveTabIndex(index)}
            barColor="#ffffff"
            indicatorColor="#00b38e"
            activeTextColor="#02475b"
            inactiveTextColor={'#02475b'}
            activeTextStyle={{ ...theme.fonts.IBMPlexSansBold(14), color: '#02475b' }}
            uppercase={false}
          ></MaterialTabs>
        </View>
        <View style={{ flex: 1 }}>
          {activeTabIndex == 0 ? (
            <CaseSheetView
              // disableConsultButton={!!PatientConsultTime}
              onStartConsult={onStartConsult}
              onStopConsult={onStopConsult}
              startConsult={startConsult}
              navigation={props.navigation}
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
          message: '^^#startconsult',
        },
        channel: channel,
        storeInHistory: true,
      },
      (status, response) => {
        setActiveTabIndex(0);
        setStartConsult(true);
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

  // const getTimerText = () => {
  //   const now = new Date();
  //   const diff = moment.duration(moment(Appintmentdatetime).diff(now));
  //   const diffInHours = diff.asHours();
  //   console.log(now, Appintmentdatetime, diffInHours);
  //   console.log('check', diff.days(), diff.hours(), diff.minutes());
  //   if (diffInHours > 0 && diffInHours < 12)
  //     return `Time to consult ${moment(new Date(0, 0, 0, diff.hours(), diff.minutes())).format(
  //       'hh: mm'
  //     )}`;
  //   return '';
  // };
  const getTimerText = () => {
    const now = new Date();
    const diff = moment.duration(moment(Appintmentdatetime).diff(now));

    const diffInHours = diff.asHours();

    if (diff.hours() > 0 && diff.hours() < 12)
      return `Time to consult ${moment(new Date(0, 0, 0, diff.hours(), diff.minutes())).format(
        'hh: mm'
      )}`;
    return '';
  };

  const showHeaderView = () => {
    return (
      <NotificationHeader
        containerStyle={styles.mainview}
        leftIcons={[
          {
            icon: (
              <View style={{ marginTop: 0 }}>
                <BackArrow />
              </View>
            ),
            onPress: () => props.navigation.pop(),
          },
        ]}
        middleText="CONSULT ROOM"
        timerText={
          consultStarted
            ? `Time Left ${minutes.toString().length < 2 ? '0' + minutes : minutes} : ${
                seconds.toString().length < 2 ? '0' + seconds : seconds
              }`
            : getTimerText()
        }
        timerremaintext={!consultStarted ? PatientConsultTime : undefined}
        textStyles={{ marginTop: 10 }}
        rightIcons={[
          {
            icon: (
              <View style={{ marginTop: 0 }}>
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
              <View style={{ marginTop: 0, opacity: isAfter ? 1 : 0.5 }}>
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
          style={{ width: '100%', height: '100%', alignItems: 'flex-end' }}
          onPress={() => {
            setDropdownShow(false);
          }}
        >
          <DropDown
            containerStyle={{ width: '50%', marginRight: 20, marginTop: 40 }}
            options={[
              {
                optionText: 'Share Case Sheet',
                onPress: () => {
                  setDropdownShow(false);
                  props.navigation.push(AppRoutes.ShareConsult);
                },
              },
              {
                optionText: 'Transfer Consult',
                onPress: () => {
                  setDropdownShow(false);
                  props.navigation.push(AppRoutes.TransferConsult, {
                    AppointmentId: props.navigation.getParam('AppId'),
                  });
                },
              },
              {
                optionText: 'Reschedule Consult',
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar hidden={hideStatusBar} />
      {showHeaderView()}
      {displayReSchedulePopUp && (
        <ReSchedulePopUp
          doctorId={doctorId}
          appointmentId={AppId}
          onClose={() => setDisplayReSchedulePopUp(false)}
          date={Appintmentdatetime}
          loading={(val) => setShowLoading(val)}
          onDone={(reschduleObject) => {
            pubnub.publish(
              {
                message: {
                  id: doctorId,
                  message: rescheduleconsult,
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
    </SafeAreaView>
  );
};
