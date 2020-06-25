import React, { useEffect, useState } from 'react';
import { Platform, StyleProp, StyleSheet, ViewStyle } from 'react-native';
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
      source={{ uri: 'https://vjs.zencdn.net/v/oceans.mp4' }}
      // source={Platform.OS === 'ios' ? { uri: '9seconds', type: 'mp4' } : loadingVideo}
      repeat
      showOnStart={false}
      controlTimeout={10}
      resizeMode={'cover'}
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
