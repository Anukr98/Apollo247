import { CaseSheetView } from '@aph/mobile-doctors/src/components/ConsultRoom/CaseSheetView';
import {
  BackArrow,
  Call,
  DotIcon,
  ClosePopup,
  VideoOnIcon,
  SpeakerOn,
  UnMuteIcon,
  BackCameraIcon,
  RoundCallIcon,
  RoundVideoIcon,
  PatientPlaceHolderImage,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { NotificationHeader } from '@aph/mobile-doctors/src/components/ui/NotificationHeader';
import { doctorProfile } from '@aph/mobile-doctors/src/helpers/APIDummyData';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState, useEffect, useRef } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  TextInput,
  FlatList,
  Keyboard,
  StatusBar,
} from 'react-native';
import MaterialTabs from 'react-native-material-tabs';

const { height, width } = Dimensions.get('window');
import Pubnub from 'pubnub';
import {
  DoctorImage,
  DoctorCall,
  PickCallIcon,
  ChatIcon,
  FullScreenIcon,
  AddIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { OTSession, OTPublisher, OTSubscriber } from 'opentok-react-native';
import {
  FrontCameraIcon,
  VideoOffIcon,
  AttachmentIcon,
  MuteIcon,
  EndCallIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import DocumentPicker from 'react-native-document-picker';
import { NavigationScreenProps, NavigationRoute } from 'react-navigation';
import { NavigationScreenProp } from 'react-navigation';
import { NavigationParams } from 'react-navigation';

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
    elevation: 2,
  },
});

const {
  data: { getDoctorProfile },
  error,
  loading,
} = doctorProfile;
if (!loading && error) {
  Alert.alert('Error', 'Unable to get the data');
} else {
  console.log('getDoctorProfile', getDoctorProfile);
}

let connectionCount = 0;
let timer = 900;
let intervalId: any;
let stoppedTimer: number;
let timerId: any;

const videoCallMsg = '^^callme`video^^';
const audioCallMsg = '^^callme`audio^^';
const doctorId = 'Ravi';
const patientId = 'Sai';
const channel = 'Channel7';

export interface ConsultRoomScreenProps
  extends NavigationScreenProps<{
    DoctorId: string;
    PatientId: string;
    PatientConsultTime: string;
    // PatientInfoAll: object;
    //navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
  }> {
  navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
}

export const ConsultRoomScreen: React.FC<ConsultRoomScreenProps> = (props) => {
  console.log('Doctoid', props.navigation.getParam('DoctorId'));
  console.log('PatientId', props.navigation.getParam('PatientId'));
  console.log('PatientConsultTime', props.navigation.getParam('PatientConsultTime'));

  const PatientConsultTime = props.navigation.getParam('PatientConsultTime');

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const flatListRef = useRef<FlatList<any> | null>();
  const otSessionRef = React.createRef();

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState<string>('');
  const [heightList, setHeightList] = useState<number>(height - 185);

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
  const [talkStyles, setTalkStyles] = useState<object>({
    flex: 1,
    backgroundColor: 'black',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
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
  });
  const [remainingTime, setRemainingTime] = useState<number>(900);
  const [consultStarted, setConsultStarted] = useState<boolean>(false);
  const [hideStatusBar, setHideStatusBar] = useState<boolean>(false);
  const [callTimer, setCallTimer] = useState<number>(0);
  const [callAccepted, setCallAccepted] = useState<boolean>(false);

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
      console.log('uptimer', timer);

      if (timer == 0) {
        console.log('uptimer', timer);
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

  useEffect(() => {
    setapiKey('46346642');
    setsessionId('1_MX40NjM0NjY0Mn5-MTU2NDI5MDk1MjA2Nn5UV2E1Mmw3V0ovWTdhTVR6akltYWtlWVl-UH4');
    settoken(
      'T1==cGFydG5lcl9pZD00NjM0NjY0MiZzaWc9YzRhYTk1YmU1ODJiYzMzMmZlMGExM2IxNjZmOTJmMDVkYzQ5OGYxOTpzZXNzaW9uX2lkPTFfTVg0ME5qTTBOalkwTW41LU1UVTJOREk1TURrMU1qQTJObjVVVjJFMU1tdzNWMG92V1RkaFRWUjZha2x0WVd0bFdWbC1VSDQmY3JlYXRlX3RpbWU9MTU2NDI5MjAzNyZub25jZT0wLjE2NTYxNTI3NzMyOTg4NjQ2JnJvbGU9cHVibGlzaGVyJmV4cGlyZV90aW1lPTE1NjY4ODQwMzcmaW5pdGlhbF9sYXlvdXRfY2xhc3NfbGlzdD0='
    );
    console.log('apiKey', apiKey);
  }, [setapiKey, setsessionId, settoken, apiKey]);

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
      setHideStatusBar(false);
      stopTimer();
      setCallAccepted(false);
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
        console.log('addListener', message.message.message);
        if (message.message.message === '^^#callAccepted') {
          startTimer(0);
          setCallAccepted(true);
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

    setHeightList(height - e.endCoordinates.height - 185);

    setTimeout(() => {
      flatListRef.current!.scrollToEnd();
    }, 200);
  };

  const keyboardDidHide = () => {
    console.log('Keyboard hide');
    setHeightList(height - 185);
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
      }
    });
  };

  const send = () => {
    // console.log('on send clicked', messages);

    if (messageText.length == 0) {
      console.log('on send clicked empty');
      setMessageText('');
      return;
    }

    const text = {
      id: 'Ravi',
      message: messageText,
    };
    // console.log('on send clicked', text);

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
    if (rowData.id !== 'Ravi') {
      leftComponent++;
      // console.log('leftComponent', leftComponent);

      rightComponent = 0;
      return (
        <View>
          {leftComponent === 1 ? (
            <View
              style={{
                backgroundColor: 'green',
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
            {leftComponent == 1 ? (
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
                shadowOffset: {
                  height: 1,
                  width: 0,
                },
                shadowColor: '#000000',
                shadowRadius: 2,
                shadowOpacity: 0.2,
                elevation: 2,
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
      // console.log('rightComponent', rightComponent);

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
              shadowOffset: {
                height: 1,
                width: 0,
              },
              shadowColor: '#000000',
              shadowRadius: 2,
              shadowOpacity: 0.2,
              elevation: 2,
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
      <View
        style={{
          width: width,
          height: returnToCall == false ? heightList : heightList + 20,
          marginTop: 0,
        }}
      >
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

  const callMinutes = Math.floor(callTimer / 60);
  const callSeconds = callTimer - callMinutes * 60;

  const AudioCall = () => {
    return (
      <View style={audioCallStyles}>
        <PatientPlaceHolderImage style={{ width: width, height: height }} />
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
          }}
        >
          <Text style={{ color: 'white', ...theme.fonts.IBMPlexSansSemiBold(10) }}>
            Time Left {minutes} : {seconds}
          </Text>
        </View>
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
          sessionId={'1_MX40NjM5MzU4Mn5-MTU2NTA3MTUwNDk4MX56bVd3ZW96MFNuS2Vua2dDMnZ5VTZNNlJ-UH4'}
          token={
            'T1==cGFydG5lcl9pZD00NjM5MzU4MiZzaWc9Y2UxMDhkODEzNTU3MmE4M2ExZTZkNmVlYjVkZDE0ODA3NGZhM2QyZTpzZXNzaW9uX2lkPTFfTVg0ME5qTTVNelU0TW41LU1UVTJOVEEzTVRVd05EazRNWDU2YlZkM1pXOTZNRk51UzJWdWEyZERNblo1VlRaTk5sSi1VSDQmY3JlYXRlX3RpbWU9MTU2NTA3MTYxMCZub25jZT0wLjExNjA5MzQ3Njk5NjI3MzM3JnJvbGU9cHVibGlzaGVyJmV4cGlyZV90aW1lPTE1Njc2NjM2MDcmaW5pdGlhbF9sYXlvdXRfY2xhc3NfbGlzdD0='
          }
          eventHandlers={sessionEventHandlers}
          ref={otSessionRef}
        >
          <OTSubscriber
            style={subscriberStyles}
            eventHandlers={subscriberEventHandlers}
            properties={{
              subscribeToAudio: true,
              subscribeToVideo: false,
              audioVolume: 10,
            }}
          />
          <OTPublisher
            style={publisherStyles}
            properties={{
              cameraPosition: cameraPosition,
              mirror: false,
              publishVideo: false,
              publishAudio: mute,
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
          Seema Singh
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
          {callAccepted ? `${callMinutes} : ${callSeconds}` : 'RINGING'}
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
              setReturnToCall(true);
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
              setHideStatusBar(false);
              stopTimer();
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
              apiKey={'46393582'}
              sessionId={
                '1_MX40NjM5MzU4Mn5-MTU2NTA3MTUwNDk4MX56bVd3ZW96MFNuS2Vua2dDMnZ5VTZNNlJ-UH4'
              }
              token={
                'T1==cGFydG5lcl9pZD00NjM5MzU4MiZzaWc9Y2UxMDhkODEzNTU3MmE4M2ExZTZkNmVlYjVkZDE0ODA3NGZhM2QyZTpzZXNzaW9uX2lkPTFfTVg0ME5qTTVNelU0TW41LU1UVTJOVEEzTVRVd05EazRNWDU2YlZkM1pXOTZNRk51UzJWdWEyZERNblo1VlRaTk5sSi1VSDQmY3JlYXRlX3RpbWU9MTU2NTA3MTYxMCZub25jZT0wLjExNjA5MzQ3Njk5NjI3MzM3JnJvbGU9cHVibGlzaGVyJmV4cGlyZV90aW1lPTE1Njc2NjM2MDcmaW5pdGlhbF9sYXlvdXRfY2xhc3NfbGlzdD0='
              }
              eventHandlers={sessionEventHandlers}
              ref={otSessionRef}
            >
              <OTSubscriber
                style={subscriberStyles}
                eventHandlers={subscriberEventHandlers}
                properties={{
                  mirror: false,
                  subscribeToAudio: true,
                  subscribeToVideo: true,
                }}
              />
              <OTPublisher
                style={publisherStyles}
                properties={{
                  cameraPosition: cameraPosition,
                  mirror: false,
                  publishVideo: showVideo,
                  publishAudio: true,
                }}
                eventHandlers={publisherEventHandlers}
              />
            </OTSession>

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
                Time Left {minutes} : {seconds}
              </Text>
            </View>
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
              {callAccepted ? `${callMinutes} : ${callSeconds}` : 'CALLING'}
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
          }}
        >
          <FullScreenIcon style={{ width: 40, height: 40 }} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setIsCall(false);
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
          <TouchableOpacity onPress={() => setShowPopUp(false)}>
            <ClosePopup
              style={{ width: 24, height: 24, top: 16, position: 'absolute', right: 16 }}
            />
          </TouchableOpacity>
          <Text
            style={{
              marginHorizontal: 20,
              marginTop: 61,
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
              setIsAudioCall(true);
              setShowPopUp(false);
              setHideStatusBar(true);
              pubnub.publish(
                {
                  message: {
                    isTyping: true,
                    message: audioCallMsg, //'^^#audiocall',
                  },
                  channel: channel,
                  storeInHistory: false,
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
              setIsCall(true);
              setShowPopUp(false);
              setHideStatusBar(true);
              pubnub.publish(
                {
                  message: {
                    isTyping: true,
                    message: videoCallMsg, //'^^#videocall',
                  },
                  channel: channel,
                  storeInHistory: false,
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
            setAudioCallStyles({
              flex: 1,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
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
    setTimeout(() => {
      flatListRef.current && flatListRef.current!.scrollToEnd();
    }, 1000);
    return (
      <View style={{ ...theme.viewStyles.container }}>
        {renderChatView()}
        <View
          style={{
            width: width,
            height: 66,
            backgroundColor: 'white',
            top: 0,
          }}
        >
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
              placeholderTextColor="rgba(2, 71, 91, 0.3)"
              value={messageText}
              onChangeText={(value) => {
                setMessageText(value);
                pubnub.publish(
                  {
                    message: {
                      senderId: 'user123',
                      isTyping: true,
                      message: 'callme',
                    },
                    channel: channel,
                    storeInHistory: false,
                  },
                  (status, response) => {}
                );
              }}
              onSubmitEditing={() => {
                console.log('on submit');
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
                  Alert.alert('Apollo', 'Please write something to send');
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
              <AddIcon style={{ width: 22, height: 22, marginTop: 18, marginLeft: 22 }} />
            </TouchableOpacity>
          </View>
          <View
            style={{
              marginLeft: 20,
              marginRight: 64,
              marginTop: 0,
              height: 2,
              backgroundColor: '#00b38e',
            }}
          />
        </View>

        {returnToCall && ReturnCallView()}
        {}
      </View>
    );
  };

  const renderTabPage = () => {
    return (
      <>
        <View style={styles.shadowview}>
          <MaterialTabs
            items={['Case Sheet', 'Chat']}
            selectedIndex={activeTabIndex}
            onChange={(index) => setActiveTabIndex(index)}
            barColor="#ffffff"
            indicatorColor="#00b38e"
            activeTextColor="#02475b"
            inactiveTextColor={'#02475b'}
            activeTextStyle={{ ...theme.fonts.IBMPlexSansBold(14), color: '#02475b' }}
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
        storeInHistory: false,
      },
      (status, response) => {
        setActiveTabIndex(1);
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
        storeInHistory: false,
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
            ? `Time Left ${minutes} : ${seconds}`
            : PatientConsultTime != null
            ? 'Time to Consult '
            : null
        }
        timerremaintext={!consultStarted ? PatientConsultTime : null}
        textStyles={{ marginTop: 10 }}
        rightIcons={[
          {
            icon: (
              <View style={{ marginTop: 0 }}>
                <Call />
              </View>
            ),
            onPress: () => {
              setActiveTabIndex(1);
              setShowPopUp(true);
            },
          },
          {
            icon: (
              <View style={{ marginTop: 0 }}>
                <DotIcon />
              </View>
            ),
            onPress: () => Alert.alert('Call'),
          },
        ]}
      />
    );
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar hidden={hideStatusBar} />
      {showHeaderView()}
      {renderTabPage()}
      {showPopUp && CallPopUp()}
      {isAudioCall && AudioCall()}
      {isCall && VideoCall()}
    </SafeAreaView>
  );
};
