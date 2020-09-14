import { AudioVideoStyles } from '@aph/mobile-doctors/src/components/Chat/AudioVideoCotext.styles';
import {
  BackCameraIcon,
  ChatIcon,
  CloseWhite,
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
// import InCallManager from 'react-native-incall-manager';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { AppConfig } from '@aph/mobile-doctors/src/helpers/AppConfig';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import { OTPublisher, OTSession, OTSubscriber } from 'opentok-react-native';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import CallDetectorManager from 'react-native-call-detection';
import { Image } from 'react-native-elements';
import RNSound from 'react-native-sound';
import SystemSetting from 'react-native-system-setting';

export type OpenTokKeys = {
  sessionId: string;
  token: string;
};
type OpentokConnect = {
  connectionId: string;
  creationTime: string;
  data: string;
};

type OpentokError = {
  code: string | number;
  message: string;
};
type OpentokArchive = {
  archiveId: string;
  name: string;
  sessionId: string;
};
type OpentokStreamObject = {
  connection: OpentokConnect;
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

type OpentokChangeProp = {
  changedProperty: string;
  newValue: string;
  oldValue: boolean;
  stream: OpentokStreamObject;
};

type OpenTokSessionConnect = {
  connection: OpentokConnect;
  streamId: string;
};

type OpentokVideoWarn = {
  reason: string;
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
  errorPopup: (message: string, color: string, time?: number) => void;
  giveRating: boolean;
  setGiveRating: (rating: boolean) => void;
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
  errorPopup: (message: string, color: string, time?: number) => {},
  giveRating: false,
  setGiveRating: () => {},
});
let timerId: NodeJS.Timeout;
let missedCallTimer: NodeJS.Timeout;
const styles = AudioVideoStyles;
let connectionCount = 0;
let callDetector: any = null;
RNSound.setCategory('Playback');
let audioTrack: RNSound | null = null;
let joinAudioTrack: RNSound | null = null;
let leftAudioTrack: RNSound | null = null;

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

  const { showPopup, hidePopup } = useUIElements();
  const { doctorDetails } = useAuth();
  const name = doctorDetails ? doctorDetails.displayName || 'Doctor' : 'Doctor';
  const [callerAudio, setCallerAudio] = useState<boolean>(true);
  const [callerVideo, setCallerVideo] = useState<boolean>(true);
  const [downgradeToAudio, setDowngradeToAudio] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [stremConnected, setStremConnected] = useState<boolean>(false);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('front');
  const otSessionRef = React.createRef();
  const callType = isAudio ? 'Audio' : isVideo ? 'Video' : '';
  const [giveRating, setGiveRating] = useState<boolean>(false);

  const setPrevVolume = async () => {
    // InCallManager.setSpeakerphoneOn(false);
    const mediaVolume = Number((await AsyncStorage.getItem('mediaVolume')) || '-1');
    if (mediaVolume !== -1) {
      SystemSetting.setVolume(mediaVolume);
      AsyncStorage.setItem('mediaVolume', '-1');
    }
  };
  const maxVolume = async () => {
    // InCallManager.setSpeakerphoneOn(true);
    const mediaVolume = Number((await AsyncStorage.getItem('mediaVolume')) || '-1');
    if (mediaVolume === -1) {
      SystemSetting.getVolume().then((volume: number) => {
        AsyncStorage.setItem('mediaVolume', volume.toString());
      });
    }
    SystemSetting.setVolume(1);
  };
  useEffect(() => {
    if (callConnected && callAccepted) {
      startTimer(0);
      if (audioTrack) {
        setPrevVolume();
        audioTrack.stop();
      }
    } else if (callAccepted) {
      if (audioTrack) {
        setPrevVolume();
        audioTrack.stop();
      }
    }
    AsyncStorage.setItem('callAccepted', JSON.stringify(callAccepted));
  }, [callConnected, callAccepted]);

  useEffect(() => {
    audioTrack = new RNSound('phone_ringing.mp3', RNSound.MAIN_BUNDLE, (error) => {
      CommonBugFender('Loading_callertune__failed', error);
    });
    joinAudioTrack = new RNSound('join_sound.mp3', RNSound.MAIN_BUNDLE, (error) => {
      CommonBugFender('Loading_callertune__failed', error);
    });
    leftAudioTrack = new RNSound('left_sound.mp3', RNSound.MAIN_BUNDLE, (error) => {
      CommonBugFender('Loading_callertune__failed', error);
    });
  }, []);

  useEffect(() => {
    if (isAudio || isVideo) {
      AppState.addEventListener('change', _handleAppStateChange);
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
    AsyncStorage.setItem('isAudio', JSON.stringify(isAudio));
    AsyncStorage.setItem('isVideo', JSON.stringify(isVideo));
  }, [isAudio, isVideo]);

  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'inactive' || nextAppState === 'background') {
      setVideoEnabled(false);
    } else if (nextAppState === 'active') {
      setVideoEnabled(true);
    }
  };

  const startTimer = (timer: number) => {
    stopTimer();
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
          !callerVideo || isAudio || downgradeToAudio ? { zIndex: 103 } : {},
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
            PlaceholderContent={
              <Spinner
                style={{ backgroundColor: 'transparent' }}
                message={strings.common.imageLoading}
              />
            }
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
    AsyncStorage.setItem('callDisconnected', 'true');
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
    setDowngradeToAudio(false);
    setStremConnected(false);
    if (audioTrack) {
      setPrevVolume();
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
        ? 'Audio/Video'
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
          {stremConnected
            ? callAccepted
              ? callConnected
                ? callDuration
                : strings.consult_room.connecting
              : strings.consult_room.calling
            : strings.consult_room.initialize}
        </Text>
        {isPaused !== '' ? (
          <View style={styles.alertContainer}>
            <Text style={styles.alertText}>
              {`Patient’s ${isPaused} ${isPaused.indexOf('/') > -1 ? 'are' : 'is'} Paused`}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };
  const errorPopup = (message: string, color: string, time?: number) => {
    showPopup({
      description: message,
      style: [styles.exoToastContainer, { backgroundColor: color }],
      mainStyle: { backgroundColor: theme.colors.TRANSPARENT },
      popUpPointerStyle: { width: 0, height: 0 },
      descriptionTextStyle: theme.viewStyles.text('M', 12, theme.colors.WHITE, 1, 20),
      hideOk: true,
      icon: (
        <View style={styles.exoCloseContainer}>
          <CloseWhite style={{ width: 16, height: 16 }} />
        </View>
      ),
      timer: time || 8,
    });
  };

  const publisherEventHandlers = {
    streamCreated: (event: OpentokStreamObject) => {
      console.log('Publisher stream created!', event);
      setCallConnected(false);
      setStremConnected(true);
      if (!callAccepted && !callConnected) {
        try {
          if (audioTrack) {
            maxVolume();
            audioTrack.play();
            audioTrack.setNumberOfLoops(-1);
          } else {
            audioTrack = new RNSound('phone_ringing.mp3', RNSound.MAIN_BUNDLE, (error) => {
              CommonBugFender('Loading_callertune__failed', error);
            });
            maxVolume();
            audioTrack.play();
            audioTrack.setNumberOfLoops(-1);
          }
        } catch (e) {
          CommonBugFender('playing_callertune__failed', e);
        }
      }
    },
    streamDestroyed: (event: OpentokStreamObject) => {
      console.log('Publisher stream destroyed!', event);
      setStremConnected(false);
    },
    error: (error: OpentokError) => {
      errorPopup(error.message, theme.colors.APP_RED);
      AsyncStorage.setItem('callDisconnected', 'true');
      console.log('Publisher stream error!', error);
    },
    otrnError: (event: string) => {
      errorPopup(strings.toastMessages.error, theme.colors.APP_RED);
      AsyncStorage.setItem('callDisconnected', 'true');
      console.log('Publisher stream otrnError!', event);
    },
  };

  const subscriberEventHandlers = {
    error: (error: OpentokError) => {
      errorPopup(error.message, theme.colors.APP_RED);
      console.log('Subscriber stream error!', error);
    },
    otrnError: (event: string) => {
      errorPopup(strings.toastMessages.error, theme.colors.APP_RED);
      console.log('Subscriber stream otrnError!', event);
    },
    connected: () => {
      setCallConnected(true);
      if (audioTrack) {
        setPrevVolume();
        audioTrack.stop(() => {});
      }
      hidePopup();
      console.log('Subscriber stream connected!');
    },
    disconnected: () => {
      // errorPopup(strings.toastMessages.error, theme.colors.APP_RED);
      console.log('Subscriber stream disconnected!');
    },
    videoDisabled: (event: OpentokVideoWarn) => {
      if (event.reason === 'quality') {
        errorPopup(strings.toastMessages.fallback, theme.colors.APP_RED);
        setDowngradeToAudio(true);
        setVideoEnabled(false);
      }
      console.log('Subscriber stream videoDisabled!', event);
    },
    videoEnabled: (event: OpentokVideoWarn) => {
      if (event.reason === 'quality') {
        errorPopup(strings.toastMessages.videoBack, theme.colors.APP_GREEN);
        setDowngradeToAudio(false);
        setVideoEnabled(true);
      }
      console.log('Subscriber stream videoEnabled!', event);
    },
    videoDisableWarning: () => {
      errorPopup(strings.toastMessages.willFallback, theme.colors.APP_YELLOW);
      console.log('Subscriber stream videoDisableWarning!');
    },
    videoDisableWarningLifted: () => {
      errorPopup(strings.toastMessages.videoBack, theme.colors.APP_GREEN);
      setDowngradeToAudio(false);
      setVideoEnabled(true);
      console.log('Subscriber stream videoDisableWarningLifted!');
    },
    audioNetworkStats: (event: OpenTokAudioStream) => {
      // setCallerAudio(event.stream.hasAudio);
    },
    videoNetworkStats: (event: OpenTokVideoStream) => {
      // setCallerVideo(event.stream.hasVideo);
    },
  };

  const sessionEventHandlers = {
    error: (error: OpentokError) => {
      AsyncStorage.setItem('callDisconnected', 'true');
      let message = error.message;
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
        message = 'Check the network connection.';
        callEnd(false);
      } else if (['AuthorizationFailure', 'InvalidSessionId', 1004, 1005].includes(error.code)) {
        message = 'There is an error, please restart application/consult';
      }
      setTimeout(() => {
        errorPopup(message, theme.colors.APP_RED);
      }, 50);
      console.log('session stream error!', error);
    },
    otrnError: (event: string) => {
      AsyncStorage.getItem('callDisconnected').then((data) => {
        if (!JSON.parse(data || 'false')) {
          errorPopup(strings.toastMessages.error, theme.colors.APP_RED);
        }
      });
      AsyncStorage.setItem('callDisconnected', 'true');
      console.log('session stream otrnError!', event);
    },
    connectionCreated: (event: string) => {
      connectionCount++;
      setCallConnected(true);
      setCallAccepted(true);
      if (audioTrack) {
        setPrevVolume();
        audioTrack.stop(() => {
          if (joinAudioTrack) {
            joinAudioTrack.play();
          }
        });
      }
      hidePopup();
      // console.log('otSessionRef', otSessionRef);
      // console.log('Another client connected. ' + connectionCount + ' total.');
      console.log('session stream connectionCreated!', event);
    },
    connectionDestroyed: (event: string) => {
      AsyncStorage.getItem('callDisconnected').then((data) => {
        if (!JSON.parse(data || 'false')) {
          setGiveRating(true);
          errorPopup(strings.toastMessages.callDisconnected, theme.colors.APP_RED);
        }
      });
      if (connectionCount > 0) {
        if (leftAudioTrack) {
          leftAudioTrack.play();
        }
      }
      connectionCount--;
      setIsVideo(false);
      setIsAudio(false);
      setIsMinimized(true);
      stopTimer();
      setCallAccepted(false);
      setCallConnected(false);
      setMessageReceived(false);
      setDowngradeToAudio(false);
      setStremConnected(false);
      if (audioTrack) {
        setPrevVolume();
        audioTrack.stop();
      }
      console.log('session stream connectionDestroyed!', event);
    },
    sessionConnected: (event: OpenTokSessionConnect) => {
      console.log('session stream sessionConnected!', event);
      hidePopup();
    },
    sessionDisconnected: (event: { sessionId: string }) => {
      console.log('session stream sessionDisconnected!', event);
    },
    sessionReconnected: () => {
      console.log('session stream sessionReconnected!');
      errorPopup(strings.toastMessages.reconnected, theme.colors.APP_GREEN);
    },
    sessionReconnecting: () => {
      console.log('session stream sessionReconnecting!');
      errorPopup(strings.toastMessages.reconnecting, theme.colors.APP_YELLOW);
    },
    signal: (event: string) => {
      console.log('session stream signal!', event);
    },
    streamCreated: (event: OpentokStreamObject) => {
      console.log('session streamCreated!', event);
      setCallConnected(true);
      if (audioTrack) {
        setPrevVolume();
        audioTrack.stop(() => {});
      }
    },
    streamDestroyed: (event: string) => {
      console.log('session streamDestroyed!', event);
    },
    streamPropertyChanged: (event: OpentokChangeProp) => {
      console.log('session streamPropertyChanged!', event);
      if (event.stream.name !== name) {
        setCallerAudio(event.stream.hasAudio);
        setCallerVideo(event.stream.hasVideo);
      }
      if (audioTrack) {
        setPrevVolume();
        audioTrack.stop(() => {});
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
                resolution: '640x480',
                audioBitrate: 30000,
                frameRate: 15,
              }}
              eventHandlers={publisherEventHandlers}
            />
            <OTSubscriber
              style={isMinimized ? styles.subscriberMinimizedStyle : styles.subscriberStyle}
              eventHandlers={subscriberEventHandlers}
              properties={{
                subscribeToAudio: true,
                subscribeToVideo: isVideo ? true : false,
                audioVolume: 100,
                resolution: '640x480', // setting this resolution to avoid over heating of device
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
        errorPopup,
        giveRating,
        setGiveRating,
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
