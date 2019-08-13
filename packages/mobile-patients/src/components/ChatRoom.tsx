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
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import DocumentPicker from 'react-native-document-picker';
// import ImagePicker from 'react-native-image-picker';
import { DropDown } from '@aph/mobile-patients/src/components/ui/DropDown';

const { height, width } = Dimensions.get('window');

let flatListheight = height - 190;
let connectionCount = 0;
let timer = 900;
let timerId: any;

export interface ChatRoomProps extends NavigationScreenProps {}
export const ChatRoom: React.FC<ChatRoomProps> = (props) => {
  const appointmentData = props.navigation.state.params!.data;
  // console.log('appointmentData', appointmentData);

  const flatListRef = useRef<FlatList<any> | null>();
  const otSessionRef = React.createRef();

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState<string>('');
  const [heightList, setHeightList] = useState<number>(height - 190);

  const [apiKey, setapiKey] = useState<string>('');
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
    top: 44,
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
    marginTop: 81,
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

  const videoCallMsg = '^^callme`video^^';
  const audioCallMsg = '^^callme`audio^^';
  const doctorId = appointmentData.doctorInfo.id;
  const patientId = appointmentData.patientId;
  const channel = appointmentData.id;

  let intervalId: any;
  let stoppedTimer: number;
  const client = useApolloClient();

  useEffect(() => {
    console.log('createsession', appointmentData.id);
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
      })
      .catch((e: any) => {
        console.log('Error occured while adding Doctor', e);
      });
  }, []);

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
        // console.log('uptimer', timer);
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
    setConsultStarted(false);

    const stopTimer = 900 - stoppedTimer;
    setRemainingTime(stopTimer);
    intervalId && clearInterval(intervalId);
  };

  const publisherEventHandlers = {
    streamCreated: (event) => {
      console.log('Publisher stream created!', event);
    },
    streamDestroyed: (event) => {
      console.log('Publisher stream destroyed!', event);
    },
  };

  const subscriberEventHandlers = {
    error: (error) => {
      console.log(`There was an error with the subscriber: ${error}`);
    },
    connected: (event) => {
      console.log('Subscribe stream connected!', event);
    },
    disconnected: (event) => {
      console.log('Subscribe stream disconnected!', event);
    },
  };

  const sessionEventHandlers = {
    error: (error) => {
      console.log(`There was an error with the session: ${error}`);
    },
    connectionCreated: (event) => {
      connectionCount++;
      console.log('otSessionRef', otSessionRef);
      console.log('Another client connected. ' + connectionCount + ' total.');
      console.log('session stream connectionCreated!', event);
    },
    connectionDestroyed: (event) => {
      connectionCount--;
      setIsCall(false);
      setIsAudioCall(false);
      stopTimer();
      setCallAccepted(false);
      setHideStatusBar(false);
      console.log('session stream connectionDestroyed!', event);
    },
    sessionConnected: (event) => {
      console.log('session stream sessionConnected!', event);
    },
    sessionDisconnected: (event) => {
      console.log('session stream sessionDisconnected!', event);
    },
    sessionReconnected: (event) => {
      console.log('session stream sessionReconnected!', event);
    },
    sessionReconnecting: (event) => {
      console.log('session stream sessionReconnecting!', event);
    },
    signal: (event) => {
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
        console.log('addListener message', message.message);

        if (message.message.isTyping) {
          if (message.message.message === audioCallMsg) {
            setIsAudio(true);
            setOnSubscribe(true);
          } else if (message.message.message === videoCallMsg) {
            setOnSubscribe(true);
            setIsAudio(false);
          } else if (message.message.message === '^^#startconsult') {
            startInterval(timer);
          } else if (message.message.message === '^^#stopconsult') {
            console.log('listener remainingTime', remainingTime);
            stopInterval();
          }
        } else {
          getHistory();
        }
      },
      presence: (presenceEvent) => {
        console.log('presenceEvent', presenceEvent);
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

  const keyboardDidShow = (e) => {
    const { keyboardHeight } = e.endCoordinates;
    console.log('Keyboard Shown', keyboardHeight);
    console.log('Keyboard Shown', e.endCoordinates.height);

    flatListheight = height - e.endCoordinates.height;
    console.log('Keyboard Shown', flatListheight);

    setHeightList(height - e.endCoordinates.height - 190);

    setTimeout(() => {
      flatListRef.current!.scrollToEnd();
    }, 200);
  };

  const keyboardDidHide = () => {
    console.log('Keyboard hide');
    flatListheight = height - 190;
    setHeightList(height - 190);
  };

  const getHistory = () => {
    pubnub.history({ channel: channel, reverse: true, count: 1000 }, (status, res) => {
      const newmessage: object[] = [];

      res.messages.forEach((element, index) => {
        newmessage[index] = element.entry;
      });
      console.log('res', res.messages);

      if (messages.length !== newmessage.length) {
        console.log('set saved');
        setMessages(newmessage);

        setTimeout(() => {
          flatListRef.current!.scrollToEnd();
        }, 1000);
      }
    });
  };

  const send = () => {
    console.log('on send clicked', messages);

    const text = {
      id: patientId,
      message: messageText,
    };
    console.log('on send clicked', text);

    pubnub.publish(
      {
        channel: channel,
        message: text,
        storeInHistory: true,
        sendByPost: true,
      },
      (status, response) => {
        /*
         * Do something
         */
        setMessageText('');
        console.log('response', response);
        console.log('status', status);
      }
    );
  };

  let leftComponent = 0;
  let rightComponent = 0;

  const renderChatRow = (rowData: any, index: number) => {
    if (rowData.id !== patientId) {
      leftComponent++;
      rightComponent = 0;
      // console.log('leftComponent', leftComponent);
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
        </View>
      );
    }
  };

  const renderChatView = () => {
    return (
      <View style={{ width: width, height: heightList, marginTop: 0 }}>
        <FlatList
          ref={flatListRef}
          contentContainerStyle={{
            marginHorizontal: 20,
            marginTop: 0,
          }}
          bounces={false}
          data={messages}
          onEndReachedThreshold={0.5}
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
              apiKey={'46393582'}
              sessionId={sessionId}
              token={token}
              // sessionId={'2_MX40NjM5MzU4Mn5-MTU2NTQzNzkyNTgwMX40Qm0rbEtFb3VVQytGZHVQdmR0NHAveG1-fg'}
              // token={
              //   'T1==cGFydG5lcl9pZD00NjM5MzU4MiZzaWc9NzIzZGU3ZDUwYTM5ZmIyYWFlMDM2Yjg0ZjY4NDE3MDFmNWNkZjE1NTpzZXNzaW9uX2lkPTJfTVg0ME5qTTVNelU0TW41LU1UVTJOVFF6TnpreU5UZ3dNWDQwUW0wcmJFdEZiM1ZWUXl0R1pIVlFkbVIwTkhBdmVHMS1mZyZjcmVhdGVfdGltZT0xNTY1NDM4MzM1Jm5vbmNlPTAuMDMxNDQzMDk1MTUzMzA0MDEmcm9sZT1tb2RlcmF0b3ImZXhwaXJlX3RpbWU9MTU2ODAzMDMzMyZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ=='
              // }
              eventHandlers={sessionEventHandlers}
              ref={otSessionRef}
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
                    top: 0,
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
                    marginTop: 44,
                    width: width - 40,
                    color: 'white',
                    ...theme.fonts.IBMPlexSansSemiBold(20),
                    textAlign: 'center',
                  }}
                >
                  {appointmentData.doctorInfo.firstName} {appointmentData.doctorInfo.lastName}
                </Text>
              </>
            )}

            <Text style={timerStyles}>
              {callAccepted
                ? `${callMinutes.toString().length < 2 ? '0' + callMinutes : callMinutes} : ${
                    callSeconds.toString().length < 2 ? '0' + callSeconds : callSeconds
                  }`
                : 'INCOMING'}
            </Text>
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

  const AudioCall = () => {
    return (
      <View style={audioCallStyles}>
        <DoctorCall style={audioCallImageStyles} />
        {!showAudioPipView && (
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
            }}
          >
            <Text style={{ color: 'white', ...theme.fonts.IBMPlexSansSemiBold(10) }}>
              Time Left {minutes.toString().length < 2 ? '0' + minutes : minutes} :{' '}
              {seconds.toString().length < 2 ? '0' + seconds : seconds}
            </Text>
          </View>
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
          apiKey={'46393582'}
          sessionId={sessionId}
          token={token}
          // sessionId={'2_MX40NjM5MzU4Mn5-MTU2NTQzNzkyNTgwMX40Qm0rbEtFb3VVQytGZHVQdmR0NHAveG1-fg'}
          // token={
          //   'T1==cGFydG5lcl9pZD00NjM5MzU4MiZzaWc9NzIzZGU3ZDUwYTM5ZmIyYWFlMDM2Yjg0ZjY4NDE3MDFmNWNkZjE1NTpzZXNzaW9uX2lkPTJfTVg0ME5qTTVNelU0TW41LU1UVTJOVFF6TnpreU5UZ3dNWDQwUW0wcmJFdEZiM1ZWUXl0R1pIVlFkbVIwTkhBdmVHMS1mZyZjcmVhdGVfdGltZT0xNTY1NDM4MzM1Jm5vbmNlPTAuMDMxNDQzMDk1MTUzMzA0MDEmcm9sZT1tb2RlcmF0b3ImZXhwaXJlX3RpbWU9MTU2ODAzMDMzMyZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ=='
          // }
          eventHandlers={sessionEventHandlers}
          ref={otSessionRef}
        >
          <OTPublisher
            style={{
              position: 'absolute',
              top: 44,
              right: 20,
              width: 1,
              height: 1,
              zIndex: 1000,
            }}
            properties={{
              cameraPosition: cameraPosition,
              publishVideo: false,
              publishAudio: mute,
              audioVolume: 100,
            }}
            eventHandlers={publisherEventHandlers}
          />
          <OTSubscriber
            style={{
              width: 1,
              height: 1,
            }}
            eventHandlers={subscriberEventHandlers}
            subscribeToSelf={true}
            properties={{
              subscribeToAudio: true,
              subscribeToVideo: false,
              audioVolume: 100,
            }}
          />
        </OTSession>
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
              marginTop: 81,
              width: width - 40,
              color: 'white',
              ...theme.fonts.IBMPlexSansSemiBold(12),
              textAlign: 'center',
              letterSpacing: 0.46,
            });
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

  const renderAudioCallButtons = () => {
    return (
      <>
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
          {appointmentData.doctorInfo.firstName} {appointmentData.doctorInfo.lastName}
        </Text>
        <Text style={timerStyles}>
          {callAccepted
            ? `${callMinutes.toString().length < 2 ? '0' + callMinutes : callMinutes} : ${
                callSeconds.toString().length < 2 ? '0' + callSeconds : callSeconds
              }`
            : 'INCOMING'}
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
            <ChatIcon style={{ height: 48, width: 48 }} />
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
          <TouchableOpacity onPress={() => {}}>
            <SpeakerOn style={{ width: 60, height: 60 }} />
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
              stopTimer();
              setHideStatusBar(false);
              setMute(true);
              setShowVideo(true);
              setCameraPosition('front');
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
            setTalkStyles({
              flex: 1,
              backgroundColor: 'transparent',
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
              top: 44,
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
              marginTop: 81,
              width: width - 40,
              color: 'white',
              ...theme.fonts.IBMPlexSansSemiBold(12),
              textAlign: 'center',
              letterSpacing: 0.46,
            });
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
          }}
        >
          <ChatIcon style={{ height: 48, width: 48 }} />
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
            startTimer(0);
            setCallAccepted(true);
            setHideStatusBar(true);
            pubnub.publish(
              {
                message: {
                  isTyping: true,
                  message: '^^#callAccepted',
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
          }}
        >
          <PickCallIcon
            style={{
              width: 40,
              height: 40,
              top: 0,
              left: 0,
            }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const handleKeyDown = (e) => {
    if (e.nativeEvent.key == 'Enter') {
      console.log('handleKeyDown');
    }
    console.log('handleKeyDown', e.nativeEvent.key);
  };

  const searchSubmit = (e) => {
    console.log('searchSubmit', e.nativeEvent.key);
  };

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime - minutes * 60;

  const options = {
    title: 'Select Avatar',
    customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar hidden={hideStatusBar} />
      <View
        style={{
          width: width,
          height: 24,
          backgroundColor: '#f0f1ec',
          zIndex: 100,
        }}
      />
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
        <View
          style={{
            width: width,
            height: 44,
            backgroundColor: '#f7f8f5',
            flexDirection: 'row',
            alignItems: 'center',
            ...theme.viewStyles.cardViewStyle,
            borderRadius: 0,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 2,
            elevation: 2,
            zIndex: 100,
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
              Time Remaining — {minutes} : {seconds}
            </Text>
          ) : (
            <Text
              style={{
                color: '#0087ba',
                ...theme.fonts.IBMPlexSansMedium(14),
                marginLeft: 20,
              }}
            >
              Consultation ended in — {minutes} : {seconds} mins
            </Text>
          )}
        </View>
        {renderChatView()}
        <View style={{ width: width, height: 66, backgroundColor: 'white', top: 0 }}>
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
              onChangeText={(value) => {
                setMessageText(value);
              }}
              // multiline={true}
              // returnKeyType="next"
              onSubmitEditing={() => {
                console.log('on submit'); // called only when multiline is false
                send();
              }}
              onKeyPress={(event) => {
                if (event.nativeEvent.key == 'Enter') {
                  send();
                  console.log('event', event.nativeEvent.key); //called when multiline is true
                } else {
                  console.log('Something else Pressed');
                }
              }}
            />
            <TouchableOpacity
              onPress={async () => {
                if (messageText.length == 0) {
                  //Alert.alert('Apollo', 'Please write something to send');
                  setDropdownVisible(!isDropdownVisible);
                  return;
                }
                // if (!startConsult) {
                //   console.log('consult not started');
                //   Alert.alert('Apollo', "Doctor hasn't started the consultation");
                //   return;
                // }
              }}
            >
              {isDropdownVisible == true ? (
                <View
                  style={{
                    width: 200,
                    bottom: -15,
                    // top: 10,
                    position: 'absolute',
                    right: -15,
                    //left: 0,
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
                          // ImagePicker.launchCamera(options, (response) => {
                          //   // Same code as in above section!
                          //   console.log(response, 'response');
                          // });
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
                            // for (const res of results) {
                            // console.log(
                            // res.uri,
                            // res.type, // mime type
                            // res.name,
                            // res.size
                            // );
                            // }
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
                          // Open Image Library:
                          // ImagePicker.launchImageLibrary(options, (response) => {
                          //   // Same code as in above section!
                          //   console.log(response, 'response');
                          // });
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
          <View
            style={{
              marginLeft: 20,
              marginRight: 64,
              marginTop: 0,
              height: 2,
              backgroundColor: '#00b38e',
              zIndex: -1,
            }}
          />
        </View>
      </SafeAreaView>
      {onSubscribe && IncomingCallView()}
      {isCall && VideoCall()}
      {isAudioCall && AudioCall()}
    </View>
  );
};
