import React from 'react';
import { ActivityIndicator, View, StyleProp, ViewStyle, Text, TextStyle } from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

export interface SpinnerProps {
  style?: StyleProp<ViewStyle>;
  indicatorColor?: string;
  message?: string;
  messageStyle?: StyleProp<TextStyle>;
  size?: number | 'small' | 'large' | undefined;
}

export const Spinner: React.FC<SpinnerProps> = (props) => {
  const { style, indicatorColor, message, messageStyle, size } = props;
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
        style,
      ]}
    >
      <ActivityIndicator
        animating={true}
        size={size || 'large'}
        color={indicatorColor ? indicatorColor : 'green'}
      />
      {message ? (
        <Text
          style={[
            {
              ...theme.viewStyles.text('B', 16, theme.colors.APP_GREEN),
              textAlign: 'center',
              marginTop: 5,
            },
            messageStyle,
          ]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
};
