import React from 'react';
import { ActivityIndicator, ActivityIndicatorProps, View } from 'react-native';
import LoaderStyles from '@aph/mobile-doctors/src/components/ui/Loader.styles';

const styles = LoaderStyles;

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
