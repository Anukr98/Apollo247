import React from 'react';
import { Animated, ImageSourcePropType, StyleSheet } from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  PinchGestureHandler,
  PinchGestureHandlerStateChangeEvent,
  RotationGestureHandler,
  RotationGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';

export interface ImageZoomProps {
  source: ImageSourcePropType;
  zoom?: boolean;
  pan?: boolean;
  rotatation?: boolean;
}

export const ImageZoom: React.FC<ImageZoomProps> = (props) => {
  const { source, zoom, pan, rotatation } = props;

  /* Pinching */
  const pinchRef = React.createRef();

  const baseScale = new Animated.Value(1);
  const pinchScale = new Animated.Value(1);
  const scale = Animated.multiply(baseScale, pinchScale);
  let lastScale = 1;
  const onPinchGestureEvent = Animated.event([{ nativeEvent: { scale: pinchScale } }], {
    useNativeDriver: true,
  });
  const onPinchHandlerStateChange = (event: PinchGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastScale *= event.nativeEvent.scale;
      baseScale.setValue(lastScale);
      pinchScale.setValue(1);
    }
  };

  /* Rotation */
  const rotationRef = React.createRef();

  const rotate = new Animated.Value(0);
  const rotateStr = rotate.interpolate({
    inputRange: [-100, 100],
    outputRange: ['-100rad', '100rad'],
  });
  let lastRotate = 0;
  const onRotateGestureEvent = Animated.event([{ nativeEvent: { rotation: rotate } }], {
    useNativeDriver: true,
  });
  const onRotateHandlerStateChange = (event: RotationGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastRotate += event.nativeEvent.rotation;
      rotate.setOffset(lastRotate);
      rotate.setValue(0);
    }
  };

  /* Dragging */
  const dragRef = React.createRef();

  const translateX = new Animated.Value(0);
  const translateY = new Animated.Value(0);

  const lastOffset = { x: 0, y: 0 };
  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastOffset.x += event.nativeEvent.translationX;
      lastOffset.y += event.nativeEvent.translationY;
      translateX.setOffset(lastOffset.x);
      translateX.setValue(0);
      translateY.setOffset(lastOffset.y);
      translateY.setValue(0);
    }
  };

  const styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'transparent',
      overflow: 'hidden',
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      marginHorizontal: 20,
    },
    pinchableImage: {
      backgroundColor: 'transparent',
      ...StyleSheet.absoluteFillObject,
    },
    wrapper: {
      flex: 1,
    },
  });

  return (
    <React.Fragment>
      <PanGestureHandler
        ref={
          dragRef as
            | string
            | ((instance: PanGestureHandler | null) => void)
            | React.RefObject<PanGestureHandler>
            | null
            | undefined
        }
        simultaneousHandlers={[rotationRef, pinchRef]}
        onGestureEvent={onGestureEvent}
        minPointers={1}
        maxPointers={2}
        avgTouches
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.wrapper,
            {
              transform: [
                { translateX: pan ? translateX : 0 },
                { translateY: pan ? translateY : 0 },
              ],
            },
          ]}
        >
          <RotationGestureHandler
            ref={
              rotationRef as
                | string
                | ((instance: RotationGestureHandler | null) => void)
                | React.RefObject<RotationGestureHandler>
                | null
                | undefined
            }
            simultaneousHandlers={pinchRef}
            onGestureEvent={onRotateGestureEvent}
            onHandlerStateChange={onRotateHandlerStateChange}
          >
            <Animated.View
              style={[
                styles.wrapper,
                {
                  transform: [{ rotate: rotatation ? rotateStr : 0 }],
                },
              ]}
            >
              <PinchGestureHandler
                ref={
                  pinchRef as
                    | string
                    | ((instance: PinchGestureHandler | null) => void)
                    | React.RefObject<PinchGestureHandler>
                    | null
                    | undefined
                }
                simultaneousHandlers={rotationRef}
                onGestureEvent={onPinchGestureEvent}
                onHandlerStateChange={onPinchHandlerStateChange}
              >
                <Animated.View
                  style={[
                    styles.container,
                    {
                      transform: [{ scale: zoom ? scale : 1 }],
                    },
                  ]}
                  collapsable={false}
                >
                  <Animated.Image
                    resizeMode={'contain'}
                    style={[styles.pinchableImage]}
                    source={source}
                  />
                </Animated.View>
              </PinchGestureHandler>
            </Animated.View>
          </RotationGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    </React.Fragment>
  );
};
