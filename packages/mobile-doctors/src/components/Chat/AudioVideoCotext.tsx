import { AudioVideoStyles } from '@aph/mobile-doctors/src/components/Chat/AudioVideoCotext.styles';
import {
  BackCameraIcon,
  ChatIcon,
  EndCallIcon,
  FrontCameraIcon,
  FullScreenIcon,
  MuteIcon,
  UnMuteIcon,
  UserPlaceHolder,
  VideoOffIcon,
  VideoOnIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  AppState,
  AppStateStatus,
  Platform,
} from 'react-native';
import { Image } from 'react-native-elements';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { OTPublisher, OTSession, OTSubscriber } from 'opentok-react-native';
import { AppConfig } from '@aph/mobile-doctors/src/helpers/AppConfig';
import CallDetectorManager from 'react-native-call-detection';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import RNSound from 'react-native-sound';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';

export type OpenTokKeys = {
  sessionId: string;
  token: string;
};

type OpentokStreamObject = {
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
};
type OpenTokAudioStream = {
  audioStats: {
    audioBytesReceived: number;
    audioPacketsLost: number;
    audioPacketsReceived: number;
  };
  stream: OpentokStreamObject;
};
type OpenTokVideoStream = {
  videoStats: {
    videoBytesReceived: number;
    videoPacketsLost: number;
    videoPacketsReceived: number;
  };
  stream: OpentokStreamObject;
};

type OptntokChangeProp = {
  changedProperty: string;
  newValue: string;
  oldValue: boolean;
  stream: OpentokStreamObject;
};

export type CallBackOptions = {
  onCallEnd: (callType: string, callDuration: string) => void;
  onCallMinimize: (callType: string) => void;
};

export type CallOptions = {
  isAudio: boolean;
  setIsAudio: (value: boolean) => void;
  isVideo: boolean;
  setIsVideo: (value: boolean) => void;
  isMinimized: boolean;
  setIsMinimized: (value: boolean) => void;
  callAccepted: boolean;
  setCallAccepted: (value: boolean) => void;
  stopCalls: (withCallBack: boolean) => void;
  startMissedCallTimer: (timer: number, callback?: (counter: number) => void) => void;
  stopMissedCallTimer: () => void;
};

export type CallData = {
  messageReceived: boolean;
  setMessageReceived: (value: boolean) => void;
  callDuration: string;
  missedCallCount: number;
  callerName: string;
  setCallerName: (value: string) => void;
  patientImage: string;
  setPatientImage: (value: string) => void;
  doctorImage: string;
  setDoctorImage: (value: string) => void;
};

export interface AudioVideoContextPorps {
  callOptions: CallOptions;
  callData: CallData;
  openTokConfig: OpenTokKeys;
  setOpenTokKeys: (value: OpenTokKeys) => void;
  callBacks: CallBackOptions;
  setCallBacks: (value: CallBackOptions) => void;
}

export const AudioVideoContext = createContext<AudioVideoContextPorps>({
  callOptions: {
    isAudio: false,
    setIsAudio: () => {},
    isVideo: false,
    setIsVideo: () => {},
    isMinimized: true,
    setIsMinimized: () => {},
    callAccepted: false,
    setCallAccepted: () => {},
    stopCalls: () => {},
    startMissedCallTimer: () => {},
    stopMissedCallTimer: () => {},
  },
  callData: {
    messageReceived: false,
    setMessageReceived: () => {},
    callDuration: '00 : 00',
    missedCallCount: 0,
    callerName: 'Patient',
    setCallerName: () => {},
    patientImage: '',
    setPatientImage: () => {},
    doctorImage: '',
    setDoctorImage: () => {},
  },
  openTokConfig: {
    sessionId: '',
    token: '',
  },
  setOpenTokKeys: () => {},
  callBacks: {
    onCallEnd: () => {},
    onCallMinimize: () => {},
  },
  setCallBacks: () => {},
});
let timerId: NodeJS.Timeout;
let missedCallTimer: NodeJS.Timeout;
const styles = AudioVideoStyles;
let connectionCount = 0;
let callDetector: any = null;
RNSound.setCategory('Playback');
let audioTrack: RNSound | null = null;
export const AudioVideoProvider: React.FC = (props) => {
  const [isAudio, setIsAudio] = useState<boolean>(false);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const [callAccepted, setCallAccepted] = useState<boolean>(false);
  const [callConnected, setCallConnected] = useState<boolean>(false);
  const [messageReceived, setMessageReceived] = useState<boolean>(false);
  const [openTokConfig, setOpenTokKeys] = useState<OpenTokKeys>({ sessionId: '', token: '' });
  const [callerName, setCallerName] = useState<string>('Patient');
  const [callDuration, setCallDuraion] = useState<string>('00 : 00');
  const [patientImage, setPatientImage] = useState<string>('');
  const [doctorImage, setDoctorImage] = useState<string>('');
  const [callBacks, setCallBacks] = useState<CallBackOptions>({
    onCallEnd: () => {},
    onCallMinimize: () => {},
  });
  const [missedCallCount, setmMissedCallCount] = useState<number>(0);

  const { doctorDetails } = useAuth();
  const name = doctorDetails ? doctorDetails.displayName || 'Doctor' : 'Doctor';
  const [callerAudio, setCallerAudio] = useState<boolean>(true);
  const [callerVideo, setCallerVideo] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('front');
  const otSessionRef = React.createRef();
  const callType = isAudio ? 'Audio' : isVideo ? 'Video' : '';

  useEffect(() => {
    if (callConnected && callAccepted) {
      startTimer(0);
      if (audioTrack) {
        audioTrack.stop();
      }
    } else if (callAccepted) {
      if (audioTrack) {
        audioTrack.stop();
      }
    }
  }, [callConnected, callAccepted]);

  useEffect(() => {
    audioTrack = new RNSound('phone_ringing.mp3', RNSound.MAIN_BUNDLE, (error) => {
      CommonBugFender('Loading_callertune__failed', error);
    });
  }, []);

  useEffect(() => {
    if (isAudio || isVideo) {
      AppState.addEventListener('change', _handleAppStateChange);
      try {
        if (audioTrack) {
          audioTrack.play();
          audioTrack.setNumberOfLoops(-1);
        } else {
          audioTrack = new RNSound('phone_ringing.mp3', RNSound.MAIN_BUNDLE, (error) => {
            CommonBugFender('Loading_callertune__failed', error);
          });
          audioTrack.play();
          audioTrack.setNumberOfLoops(-1);
        }
      } catch (e) {
        CommonBugFender('playing_callertune__failed', e);
      }
      callDetector = new CallDetectorManager(
        (
          event: 'Connected' | 'Disconnected' | 'Dialing' | 'Incoming' | 'Offhook' | 'Missed',
          phoneNumber: string
        ) => {
          if (['Connected', 'Incoming', 'Dialing', 'Offhook'].includes(event)) {
            setAudioEnabled(false);
            setVideoEnabled(false);
          } else if (['Disconnected', 'Missed'].includes(event)) {
            setAudioEnabled(true);
            setVideoEnabled(true);
          }
        },
        false,
        () => {},
        {
          title: 'Phone State Permission',
          message:
            'This app needs access to your phone state in order to react and/or to adapt to incoming calls.',
        }
      );
    } else {
      AppState.removeEventListener('change', _handleAppStateChange);
      callDetector && callDetector.dispose();
    }
  }, [isAudio, isVideo]);

  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'inactive' || nextAppState === 'background') {
      setVideoEnabled(false);
    } else if (nextAppState === 'active') {
      setVideoEnabled(true);
    }
  };

  const startTimer = (timer: number) => {
    timerId = setInterval(() => {
      timer = timer + 1;
      const callMinutes = Math.floor(timer / 60);
      const callSeconds = timer - callMinutes * 60;
      setCallDuraion(
        `${callMinutes.toString().length < 2 ? '0' + callMinutes : callMinutes} : ${
          callSeconds.toString().length < 2 ? '0' + callSeconds : callSeconds
        }`
      );
      if (timer == 0) {
        stopTimer();
      }
    }, 1000);
  };

  const stopTimer = () => {
    setCallDuraion('00 : 00');
    timerId && clearInterval(timerId);
  };

  const startMissedCallTimer = (timer: number, callback?: (counter: number) => void) => {
    stopMissedCallTimer();
    missedCallTimer = setInterval(() => {
      timer = timer - 1;
      if (timer === 0) {
        setmMissedCallCount(missedCallCount + 1);
        stopMissedCallTimer();
        callback && callback(missedCallCount);
      }
    }, 1000);
  };

  const stopMissedCallTimer = () => {
    missedCallTimer && clearInterval(missedCallTimer);
  };

  const renderPatientImage = () => {
    return (
      <View
        style={[
          isMinimized ? styles.imageContainerMinimized : styles.imageContainer,
          !callerVideo || isAudio ? { zIndex: 103 } : {},
        ]}
      >
        {patientImage ? (
          <Image
            source={{
              uri: patientImage,
            }}
            style={isMinimized ? styles.patientImageMinimizedStyle : styles.patientImageStyle}
            resizeMode={'contain'}
            placeholderStyle={
              isMinimized ? styles.placeHolderLoaderMinimizedStyle : styles.placeHolderLoaderStyle
            }
            PlaceholderContent={<Spinner style={{ backgroundColor: 'transparent' }} />}
          />
        ) : (
          <UserPlaceHolder
            style={
              isMinimized ? styles.placeHolderImageMimimizedStyle : styles.placeHolderImageStyle
            }
          />
        )}
      </View>
    );
  };
  const renderChatIcon = () => {
    if (!isMinimized) {
      return (
        <View style={styles.chatIconContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setIsMinimized(!isMinimized);
              setMessageReceived(false);
              callBacks.onCallMinimize(callType);
            }}
          >
            <View style={styles.iconShadowEffect}>
              {messageReceived ? (
                <View>
                  <View style={styles.dotStyle} />
                  <ChatIcon />
                </View>
              ) : (
                <ChatIcon />
              )}
            </View>
          </TouchableOpacity>
        </View>
      );
    } else {
      return null;
    }
  };

  const callEnd = (withCallBack: boolean) => {
    stopTimer();
    setIsVideo(false);
    setIsAudio(false);
    setMessageReceived(false);
    setIsMinimized(true);
    setCallAccepted(false);
    setCallConnected(false);
    setCallerAudio(true);
    setCallerVideo(true);
    setAudioEnabled(true);
    setVideoEnabled(true);
    if (audioTrack) {
      audioTrack.stop();
    }
    withCallBack && callBacks.onCallEnd(callType, callDuration);
  };

  const renderButtons = () => {
    return (
      <View style={styles.buttonContainer}>
        {isVideo ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setCameraPosition(cameraPosition === 'front' ? 'back' : 'front');
            }}
          >
            <View style={styles.iconShadowEffect}>
              {cameraPosition === 'front' ? <BackCameraIcon /> : <FrontCameraIcon />}
            </View>
          </TouchableOpacity>
        ) : null}
        {isVideo ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setVideoEnabled(!videoEnabled);
            }}
          >
            <View style={styles.iconShadowEffect}>
              {videoEnabled ? <VideoOnIcon /> : <VideoOffIcon />}
            </View>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity activeOpacity={1} onPress={() => setAudioEnabled(!audioEnabled)}>
          <View style={styles.iconShadowEffect}>
            {audioEnabled ? <UnMuteIcon /> : <MuteIcon />}
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} onPress={() => callEnd(true)}>
          <View style={styles.iconShadowEffect}>
            <EndCallIcon />
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  const renderMinimizedButtons = () => {
    return (
      <View style={styles.buttomMinimize}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setIsMinimized(false);
            setMessageReceived(false);
          }}
        >
          <View style={styles.iconShadowEffect}>
            <FullScreenIcon style={styles.miniIconStyle} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} onPress={() => callEnd(true)}>
          <View style={styles.iconShadowEffect}>
            <EndCallIcon style={styles.miniIconStyle} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  const renderNameTimer = () => {
    const isPaused = !callerAudio
      ? !callerVideo && isVideo
        ? 'Audio & Video'
        : 'Audio'
      : !callerVideo && isVideo
      ? 'Video'
      : '';
    return (
      <View style={isMinimized ? styles.nameContainerMinimized : styles.nameContainer}>
        <Text
          style={[
            styles.nameText,
            patientImage === '' && isMinimized && (isAudio || (isVideo && !callerVideo))
              ? { color: theme.colors.SHARP_BLUE }
              : null,
          ]}
          numberOfLines={2}
          ellipsizeMode={'middle'}
        >
          {callerName}
        </Text>
        <Text
          style={[
            styles.timerText,
            patientImage === '' && isMinimized && (isAudio || (isVideo && !callerVideo))
              ? { color: theme.colors.SHARP_BLUE }
              : null,
          ]}
        >
          {callAccepted
            ? callConnected
              ? callDuration
              : strings.consult_room.connecting
            : strings.consult_room.calling}
        </Text>
        {isPaused !== '' ? (
          <View style={styles.alertContainer}>
            <Text style={styles.alertText}>
              {`${isPaused} ${isPaused.indexOf('&') > -1 ? 'are' : 'is'} Paused`}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };
  const publisherEventHandlers = {
    streamCreated: (event: string) => {
      console.log('Publisher stream created!', event);
      setCallConnected(false);
      if (!callAccepted && !callConnected) {
        if (audioTrack) {
          audioTrack.stop(() => {
            if (audioTrack) {
              audioTrack.play();
            }
          });
        }
      }
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
      setCallConnected(true);
      if (audioTrack) {
        audioTrack.stop(() => {});
      }
    },
    disconnected: (event: string) => {
      console.log('Subscribe stream disconnected!', event);
    },
    audioNetworkStats: (event: OpenTokAudioStream) => {
      // setCallerAudio(event.stream.hasAudio);
    },
    videoNetworkStats: (event: OpenTokVideoStream) => {
      // setCallerVideo(event.stream.hasVideo);
    },
  };

  const sessionEventHandlers = {
    error: (error: string) => {
      // console.log(`There was an error with the session: ${error}`);
    },
    connectionCreated: (event: string) => {
      connectionCount++;
      // console.log('otSessionRef', otSessionRef);
      // console.log('Another client connected. ' + connectionCount + ' total.');
      // console.log('session stream connectionCreated!', event);
    },
    connectionDestroyed: (event: string) => {
      connectionCount--;
      setIsVideo(false);
      setIsAudio(false);
      setIsMinimized(true);
      stopTimer();
      setCallAccepted(false);
      setCallConnected(false);
      setMessageReceived(false);
      // console.log('session stream connectionDestroyed!', event);
    },
    sessionConnected: (event: string) => {
      // console.log('session stream sessionConnected!', event);
    },
    sessionDisconnected: (event: string) => {
      // console.log('session stream sessionDisconnected!', event);
    },
    sessionReconnected: (event: string) => {
      // console.log('session stream sessionReconnected!', event);
    },
    sessionReconnecting: (event: string) => {
      // console.log('session stream sessionReconnecting!', event);
    },
    signal: (event: string) => {
      // console.log('session stream signal!', event);
    },
    streamPropertyChanged: (event: OptntokChangeProp) => {
      if (event.stream.name !== name) {
        setCallerAudio(event.stream.hasAudio);
        setCallerVideo(event.stream.hasVideo);
      }
    },
  };
  const renderCallView = () => {
    return (
      <View style={isMinimized ? styles.minimizedMainViewStyle : styles.mainViewStyle}>
        {renderPatientImage()}
        {renderChatIcon()}
        {renderNameTimer()}
        <View style={{ flex: 1, zIndex: 102 }}>
          <OTSession
            apiKey={AppConfig.Configuration.PRO_TOKBOX_KEY}
            sessionId={openTokConfig.sessionId}
            token={openTokConfig.token}
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
                isMinimized || !isVideo ? styles.publisherMinimizedStyle : styles.publisherStyle
              }
              properties={{
                cameraPosition: cameraPosition,
                publishVideo: isVideo && videoEnabled,
                publishAudio: audioEnabled,
                videoTrack: isVideo && videoEnabled,
                audioTrack: audioEnabled,
                audioVolume: 100,
                name: name,
              }}
              eventHandlers={publisherEventHandlers}
              onPublishStart={(event: any) => {
                console.log('onPublishStart', event);
              }}
              onPublishStop={(event: any) => {
                console.log('onPublishStop', event);
              }}
              onPublishError={(event: any) => {
                console.log('onPublishError', event);
              }}
            />
            <OTSubscriber
              style={isMinimized ? styles.subscriberMinimizedStyle : styles.subscriberStyle}
              eventHandlers={subscriberEventHandlers}
              subscribeToSelf={true}
              onSubscribeStart={(event: any) => {
                console.log('Watching started', event);
              }}
              onSubscribeStop={(event: any) => {
                console.log('onSubscribeStop', event);
              }}
              onSubscribeError={(event: any) => {
                console.log('onSubscribeError', event);
              }}
              properties={{
                subscribeToAudio: true,
                subscribeToVideo: isVideo ? true : false,
                audioVolume: 100,
              }}
            />
          </OTSession>
        </View>
        {isMinimized ? renderMinimizedButtons() : renderButtons()}
      </View>
    );
  };

  return (
    <AudioVideoContext.Provider
      value={{
        callOptions: {
          isAudio,
          setIsAudio,
          isVideo,
          setIsVideo,
          isMinimized,
          setIsMinimized,
          callAccepted,
          setCallAccepted,
          stopCalls: callEnd,
          startMissedCallTimer,
          stopMissedCallTimer,
        },
        callData: {
          messageReceived,
          setMessageReceived,
          callDuration,
          missedCallCount,
          callerName,
          setCallerName,
          patientImage,
          setPatientImage,
          doctorImage,
          setDoctorImage,
        },
        openTokConfig,
        setOpenTokKeys,
        callBacks,
        setCallBacks,
      }}
    >
      <View style={{ flex: 1 }}>
        <StatusBar hidden={!isMinimized} />
        {props.children}
        {isAudio || isVideo ? renderCallView() : null}
      </View>
    </AudioVideoContext.Provider>
  );
};

export const useAudioVideo = () => useContext<AudioVideoContextPorps>(AudioVideoContext);
