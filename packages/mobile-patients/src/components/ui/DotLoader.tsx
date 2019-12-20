import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const styles = StyleSheet.create({
  main: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export interface DotLoaderProps {
  size?: number;
  margin?: number;
  interval?: number;
  scale?: number;
  defaultScale?: number;
  animateDuration?: number;
}

export const DotLoader: React.FC<DotLoaderProps> = (props) => {
  const SIZE = props.size || 12;
  const MARGIN = props.margin || 8;
  const BG = ['#0087BA', '#00B38E', '#FCB716'];
  const ACTIVE_BG = ['#0087BA', '#00B38E', '#FCB716'];
  const dots = [0, 1, 2];
  const INTERVAL = props.interval || 400;
  const ANIMATION_DURATION = props.animateDuration || 350;
  const ANIMATION_SCALE = props.scale || 2;
  const DEFAULT_SCALE = props.defaultScale || 1;
  const scale = dots.map((i) => new Animated.Value(DEFAULT_SCALE));
  const [active, setActive] = useState<number>(0);
  let a = 0;

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('this is spinner', a);
      a = a > dots.length - 2 ? 0 : a + 1;
      setActive(a);
    }, INTERVAL);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    scaleUp(scale[active]);
    let remaning = dots.filter((i) => i !== active);
    remaning.forEach((i) => scaleDown(scale[i]));
  }, [active]);

  const scaleDown = (scale: Animated.Value) => {
    Animated.timing(scale, {
      toValue: DEFAULT_SCALE,
      duration: ANIMATION_DURATION,
    }).start();
  };

  const scaleUp = (scale: Animated.Value) => {
    Animated.timing(scale, {
      toValue: ANIMATION_SCALE,
      duration: ANIMATION_DURATION,
    }).start();
  };

  const style = {
    height: SIZE,
    width: SIZE,
    borderRadius: SIZE / 2,
    marginHorizontal: MARGIN,
  };

  return (
    <View style={styles.main}>
      {dots.map((i) => (
        <Animated.View
          style={[
            style,
            {
              backgroundColor: active === i ? ACTIVE_BG[i] : BG[i],
              transform: [{ scale: scale[i] }],
            },
          ]}
        />
      ))}
    </View>
  );
};
