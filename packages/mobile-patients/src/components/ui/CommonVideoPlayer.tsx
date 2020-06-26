import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import VideoPlayer from 'react-native-video-controls';

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
    <VideoPlayer
      style={[styles.headerView, style]}
      source={{
        uri:
          'https://vod-progressive.akamaized.net/exp=1593091982~acl=%2Fvimeo-prod-skyfire-std-us%2F01%2F519%2F17%2F427597466%2F1854721107.mp4~hmac=f4659c7d8b16d6130b2e19a5ee90bc908b860226d516cc123a58c402422c8ef3/vimeo-prod-skyfire-std-us/01/519/17/427597466/1854721107.mp4?filename=Dr+Venkata+Kartikeyan+Chennai+Sample.mp4',
      }}
      // source={Platform.OS === 'ios' ? { uri: '9seconds', type: 'mp4' } : loadingVideo}
      repeat
      showOnStart={false}
      controlTimeout={10}
      resizeMode={'contain'}
      paused={playVideo}
      muted={false}
      playInBackground={false}
      playWhenInactive={true}
      rate={1.0}
      volume={1.0}
      ignoreSilentSwitch={'ignore'}
      progressUpdateInterval={1000}
      // navigator={props.navigation}
    />
  );
};
