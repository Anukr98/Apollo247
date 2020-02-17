import {
  BackCameraIcon,
  ChatIcon,
  ChatWithNotification,
  EndCallIcon,
  FrontCameraIcon,
  FullScreenIcon,
  MuteIcon,
  UnMuteIcon,
  VideoOffIcon,
  VideoOnIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { AppConfig } from '@aph/mobile-doctors/src/helpers/AppConfig';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { OTPublisher, OTSession, OTSubscriber } from 'opentok-react-native';
import React, { useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

const { height, width } = Dimensions.get('window');

export interface VideoCallProps extends NavigationScreenProps {
  chatReceived: boolean;
  callAccepted: boolean;
  callMinutes: number;
  callSeconds: number;
  sessionId: string;
  token: string;
  minutes: number;
  seconds: number;
  firstName: string;
  PipView: boolean;
  setChatReceived: (arg0: boolean) => void;
  onPressEnd: () => {};
  onPressBottomEndCall: () => {};
  sessionEventHandlers: () => {};
  otSessionRef: () => {};
  subscriberEventHandlers: () => {};
  publisherEventHandlers: () => {};
  setPipView: (arg0: boolean) => {};
  cameraPosition: string;
  setCameraPosition: (arg0: string) => {};
}
export const VideoCall: React.FC<VideoCallProps> = (props) => {
  const [showVideo, setShowVideo] = useState<boolean>(true);
  const [mute, setMute] = useState<boolean>(true);
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

  const { PipView } = props;
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
            props.setPipView(false);
            props.setChatReceived(false);
          }}
        >
          <FullScreenIcon
            style={{
              width: 40,
              height: 40,
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={props.onPressEnd}>
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

            props.setPipView(true);
            props.setChatReceived(false);
          }}
        >
          {props.chatReceived ? (
            <ChatWithNotification
              style={{
                left: -20,
                top: -20,
              }}
            />
          ) : (
            <ChatIcon />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderMuteIcon = () => (
    <TouchableOpacity onPress={() => setMute(mute === true ? false : true)}>
      {mute === true ? <UnMuteIcon /> : <MuteIcon />}
    </TouchableOpacity>
  );

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
              props.setCameraPosition(props.cameraPosition === 'front' ? 'back' : 'front');
            }}
          >
            {props.cameraPosition === 'front' ? <BackCameraIcon /> : <FrontCameraIcon />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              showVideo === true ? setShowVideo(false) : setShowVideo(true);
            }}
          >
            {showVideo === true ? <VideoOnIcon /> : <VideoOffIcon />}
          </TouchableOpacity>
          {renderMuteIcon()}
          <TouchableOpacity onPress={props.onPressBottomEndCall}>
            <EndCallIcon />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={talkStyles}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
        }}
      >
        <OTSession
          apiKey={AppConfig.Configuration.PRO_TOKBOX_KEY}
          sessionId={props.sessionId}
          token={props.token}
          eventHandlers={props.sessionEventHandlers}
          ref={props.otSessionRef}
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
            eventHandlers={props.subscriberEventHandlers}
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
              subscribeToVideo: true,
              audioVolume: 100,
            }}
          />
          <OTPublisher
            style={publisherStyles}
            properties={{
              cameraPosition: props.cameraPosition,
              publishVideo: showVideo,
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
            // style={{
            //   position: 'absolute',
            //   top: 44,
            //   right: 20,
            //   width: 112,
            //   height: 148,
            //   zIndex: 100,
            //   elevation: 1000,
            //   borderRadius: 30,
            // }}
            // properties={{
            //   cameraPosition: cameraPosition,
            //   publishVideo: showVideo,
            //   publishAudio: mute,
            //   //audioVolume: 100,
            // }}
            // eventHandlers={publisherEventHandlers}
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
          {props.firstName}
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
                {props.minutes.toString().length < 2 ? '0' + props.minutes : props.minutes} :{' '}
                {props.seconds.toString().length < 2 ? '0' + props.seconds : props.seconds}
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
              {props.firstName}
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
          {props.callAccepted
            ? `${
                props.callMinutes.toString().length < 2
                  ? '0' + props.callMinutes
                  : props.callMinutes
              } : ${
                props.callSeconds.toString().length < 2
                  ? '0' + props.callSeconds
                  : props.callSeconds
              }`
            : strings.consult_room.calling}
        </Text>
        {PipView && renderOnCallPipButtons()}
        {!PipView && renderChatNotificationIcon()}
        {!PipView && renderBottomButtons()}
      </View>
    </View>
  );
};
