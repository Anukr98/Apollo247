import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface LinearGradientComponentProps {
  style?: StyleProp<ViewStyle>;
  colors?: string[];
}

export const LinearGradientComponent: React.FC<LinearGradientComponentProps> = (props) => {
  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      colors={props.colors ? props.colors : ['#2C4C70', '#5EACB0']}
      style={props.style}
    >
      {props.children}
    </LinearGradient>
  );
};

export const LinearGradientVerticalComponent: React.FC<LinearGradientComponentProps> = (props) => {
  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      colors={props.colors ? props.colors : ['#2C4C70', '#5EACB0']}
      style={props.style}
    >
      {props.children}
    </LinearGradient>
  );
};
