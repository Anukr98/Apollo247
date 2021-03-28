import React from 'react';
import { ActivityIndicator, View, StyleProp, ViewStyle } from 'react-native';
export interface SpinnerProps {
  style?: StyleProp<ViewStyle>;
  spinnerProps?: any;
}

export const Spinner: React.FC<SpinnerProps> = (props) => {
  return (
    <View
      style={[
        {
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0, 0.3)',
          alignSelf: 'center',
          justifyContent: 'center',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          elevation: 1000,
        },
        props.style,
      ]}
    >
      <ActivityIndicator animating={true} size="large" color="green" {...props.spinnerProps} />
    </View>
  );
};
