import loadingVideo from '@aph/mobile-patients/src/Video/9seconds.mp4';
import React, { useEffect, useState } from 'react';
import { Platform, StyleProp, StyleSheet, ViewStyle, View } from 'react-native';
import VideoPlayer from 'react-native-video-controls';
import { WebView } from 'react-native-webview';

const styles = StyleSheet.create({
  headerView: {
    flex: 1,
    margin: 0,
    width: '100%',
    height: 160,
  },
});

export interface CommonVideoPlayerProps {
  onStopPress?: () => void;
  onPlayPress?: () => void;
  url?: string;
  isPlayClicked: boolean;
  style?: StyleProp<ViewStyle>;
}

export const CommonVideoPlayer: React.FC<CommonVideoPlayerProps> = (props) => {
  const { isPlayClicked, style } = props;

  const [playVideo, setPlayVideo] = useState<Boolean>(false);

  useEffect(() => {
    console.log('isPlayClicked', isPlayClicked);
    setPlayVideo(isPlayClicked);
  }, [isPlayClicked]);

  return (
    <View style={[styles.headerView, style]}>
      <View
        style={{
          flex: 1,
          overflow: 'hidden',
          backgroundColor: 'white',
        }}
      >
        <WebView
          style={{
            flex: 1,
            backgroundColor: 'white',
          }}
          javaScriptEnabled={true}
          source={{
            uri: 'https://player.vimeo.com/video/427597466',
          }}
          onLoadStart={() => {
            console.log('onLoadStart');
          }}
          onLoadEnd={() => {
            console.log('onLoadEnd');
          }}
          onLoad={() => {
            console.log('onLoad');
          }}
        />
      </View>
    </View>
  );

  // return (
  //   <VideoPlayer
  //     style={[styles.headerView, style]}
  //     source={{ uri: 'https://vjs.zencdn.net/v/oceans.mp4' }}
  //     // source={Platform.OS === 'ios' ? { uri: '9seconds', type: 'mp4' } : loadingVideo}
  //     repeat
  //     showOnStart={false}
  //     controlTimeout={10}
  //     resizeMode={'cover'}
  //     paused={playVideo}
  //     muted={false}
  //     playInBackground={false}
  //     playWhenInactive={true}
  //     rate={1.0}
  //     volume={1.0}
  //     ignoreSilentSwitch={'ignore'}
  //     progressUpdateInterval={1000}
  //     // navigator={props.navigation}
  //   />
  // );
};
