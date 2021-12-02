import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface LinearGradientComponentProps {
  style?: StyleProp<ViewStyle>;
  colors?: string[];
  startOffset?: { x: number; y: number };
  endOffset?: { x: number; y: number };
}

export const LinearGradientComponent: React.FC<LinearGradientComponentProps> = (props) => {
  return (
    <LinearGradient
      start={{
        x: props.startOffset ? props.startOffset.x : 0,
        y: props.startOffset ? props.startOffset.y : 0,
      }}
      end={{
        x: props.endOffset ? props.endOffset.x : 1,
        y: props.endOffset ? props.endOffset.y : 0,
      }}
      colors={props.colors ? props.colors : ['#2C4C70', '#5EACB0']}
      style={props.style}
    >
      {props.children}
    </LinearGradient>
  );
};
