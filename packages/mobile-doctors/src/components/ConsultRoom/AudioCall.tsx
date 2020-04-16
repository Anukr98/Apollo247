import {
  ChatIcon,
  ChatWithNotification,
  EndCallIcon,
  MuteIcon,
  PatientPlaceHolderImage,
  UnMuteIcon,
  VideoOffIcon,
  VideoOnIcon,
  UserPlaceHolder,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { AppConfig } from '@aph/mobile-doctors/src/helpers/AppConfig';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { OTPublisher, OTSession, OTSubscriber } from 'opentok-react-native';
import React, { useState, RefObject, Dispatch, SetStateAction } from 'react';
import { Dimensions, StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Image } from 'react-native-elements';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';

const { height, width } = Dimensions.get('window');

export interface AudioCallProps extends NavigationScreenProps {
  profileImage: string;
  chatReceived: boolean;
  callAccepted: boolean;
  sessionId: string;
  token: string;
  minutes: number;
  seconds: number;
  firstName: string;
  convertVideo: boolean;
  callTimerStarted: string;
  setChatReceived: (arg0: boolean) => void;
  audioCallStyles: StyleProp<ViewStyle>;
  onPressEndCall: () => void;
  onVideoToggle: () => void;
  showVideo: boolean;
  setAudioCallStyles: Dispatch<SetStateAction<object>>;
  setReturnToCall: Dispatch<SetStateAction<boolean>>;
  sessionEventHandlers: {
    error: (error: string) => void;
    connectionCreated: (event: string) => void;
    connectionDestroyed: (event: string) => void;
    sessionConnected: (event: string) => void;
    sessionDisconnected: (event: string) => void;
    sessionReconnected: (event: string) => void;
    sessionReconnecting: (event: string) => void;
    signal: (event: string) => void;
  };
  otSessionRef: RefObject<unknown>;
  subscriberEventHandlers: {
    error: (error: string) => void;
    connected: (event: string) => void;
    disconnected: (event: string) => void;
  };
  publisherEventHandlers: {
    streamCreated: (event: string) => void;
    streamDestroyed: (event: string) => void;
  };
  cameraPosition: string;
  setCameraPosition: Dispatch<SetStateAction<string>>;
}
export const AudioCall: React.FC<AudioCallProps> = (props) => {
  // const [showVideo, setShowVideo] = useState<boolean>(true);
  //   const [cameraPosition, setCameraPosition] = useState<string>('front');
  const [mute, setMute] = useState<boolean>(true);

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

  const { minutes, seconds, firstName, convertVideo, profileImage } = props;

  const renderMuteIcon = () => (
    <TouchableOpacity onPress={() => setMute(mute === true ? false : true)}>
      {mute === true ? <UnMuteIcon /> : <MuteIcon />}
    </TouchableOpacity>
  );

  return (
    <View style={props.audioCallStyles}>
      {!convertVideo && (
        <View
          style={{
            height: height,
            width: width,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
          }}
        >
          {profileImage ? (
            <Image
              source={{
                uri: profileImage,
              }}
              style={{ height: width, width: width }}
              resizeMode={'contain'}
              placeholderStyle={{
                height: width,
                width: width,
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}
              PlaceholderContent={<Spinner style={{ backgroundColor: 'transparent' }} />}
            />
          ) : (
            <UserPlaceHolder
              style={{
                height: 150,
                width: width,
                alignItems: 'center',
                backgroundColor: 'white',
                resizeMode: 'contain',
              }}
            />
          )}
        </View>
      )}
      {/* {!PipView && (
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
            {firstName}
          </Text>
        </>
      )} */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.1)',
          // opacity: 0.6,
        }}
      />

      <OTSession
        apiKey={AppConfig.Configuration.PRO_TOKBOX_KEY}
        sessionId={props.sessionId}
        token={props.token}
        eventHandlers={props.sessionEventHandlers}
        ref={props.otSessionRef}
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
            cameraPosition: props.cameraPosition,
            publishVideo: convertVideo,
            publishAudio: mute,
            audioVolume: 100,
          }}
          resolution={'352x288'}
          eventHandlers={props.publisherEventHandlers}
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
          style={
            convertVideo
              ? subscriberStyles
              : {
                  width: 1,
                  height: 1,
                }
          }
          eventHandlers={props.subscriberEventHandlers}
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
          color: theme.colors.INPUT_TEXT,
          ...theme.fonts.IBMPlexSansSemiBold(20),
          textAlign: 'center',
        }}
      >
        {firstName}
      </Text>
      <Text
        style={{
          position: 'absolute',
          marginHorizontal: 20,
          marginTop: 81,
          width: width - 40,
          color: theme.colors.INPUT_TEXT,
          ...theme.fonts.IBMPlexSansSemiBold(12),
          textAlign: 'center',
          letterSpacing: 0.46,
        }}
      >
        {props.callAccepted ? props.callTimerStarted : strings.consult_room.ringing}
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
            props.setAudioCallStyles({
              flex: 1,
              position: 'absolute',
              top: 0,
              right: 0,
              height: 1,
              width: 1,
            });

            props.setChatReceived(false);
            props.setReturnToCall(true);
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
          {props.chatReceived ? (
            <ChatWithNotification
              style={{
                left: -18,
                top: -16,
                height: 90,
                width: 90,
              }}
            />
          ) : (
            <ChatIcon />
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
        {/* <TouchableOpacity onPress={props.onVideoToggle}>
          {props.showVideo === true ? <VideoOnIcon /> : <VideoOffIcon />}
        </TouchableOpacity> */}
        {renderMuteIcon()}
        <TouchableOpacity onPress={props.onPressEndCall}>
          <EndCallIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
};
