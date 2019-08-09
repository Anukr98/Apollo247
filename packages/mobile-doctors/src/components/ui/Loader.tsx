import React from 'react';
import { ActivityIndicator, ActivityIndicatorProps, StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  spinnerContainerStyle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0, 0.2)',
    alignSelf: 'center',
    justifyContent: 'center',
  },
});

export interface LoaderProps {
  fullScreen?: boolean; // It will take the full height of parent view (absolute positioned) with gray background
  flex1?: boolean;
  size?: ActivityIndicatorProps['size'];
  color?: ActivityIndicatorProps['color'];
}

export const Loader: React.FC<LoaderProps> = (props) => {
  const renderActivityIndicator = (
    <ActivityIndicator
      style={{ flex: props.flex1 ? 1000 : 0 }}
      animating={true}
      size={'large' || props.size}
      color={'green' || props.color}
    />
  );
  if (props.fullScreen) {
    return <View style={styles.spinnerContainerStyle}>{renderActivityIndicator}</View>;
  }
  return renderActivityIndicator;
};
