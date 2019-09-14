import React from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';

export interface SpinnerProps {}

export const Spinner: React.FC<SpinnerProps> = (props) => {
  return (
    <View
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: Platform.OS === 'ios' ? 'rgba(0,0,0, 0.3)' : '',
        alignSelf: 'center',
        justifyContent: 'center',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        elevation: 20,
      }}
    >
      <ActivityIndicator animating={true} size="large" color="green" />
    </View>
  );
};
