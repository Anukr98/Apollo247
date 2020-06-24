import React, { useEffect } from 'react';
import {
  Animated,
  ImageSourcePropType,
  StyleSheet,
  View,
  TouchableOpacity,
  BackHandler,
  Dimensions,
} from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  PinchGestureHandler,
  PinchGestureHandlerStateChangeEvent,
  RotationGestureHandler,
  RotationGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';
import { CrossPopup, Reset } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { isIphoneX } from 'react-native-iphone-x-helper';

const { width, height } = Dimensions.get('screen');
export interface ImageZoomProps {
  source: ImageSourcePropType;
  zoom?: boolean;
  pan?: boolean;
  rotatation?: boolean;
  onClose?: () => void;
}

export const ImageZoom: React.FC<ImageZoomProps> = (props) => {
  const { source, zoom, pan, rotatation, onClose } = props;

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
      if (lastScale < 0.7) {
        lastScale = 0.7;
      }
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
    positionAbsolute: {
      position: 'absolute',
      flex: 1,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: theme.colors.blackColor(0.6),
      zIndex: 20,
    },
    imageContainer: {
      backgroundColor: 'transparent',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 25,
    },
    crossContainer: {
      alignSelf: 'flex-end',
      backgroundColor: 'transparent',
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: width - 32,
      marginHorizontal: 16,
      marginTop: isIphoneX() ? 60 : 30,
      zIndex: 30,
    },
    iconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.WHITE,
      borderRadius: 100,
      padding: 2,
    },
    crossIcon: {
      marginRight: 1,
      height: 28,
      width: 28,
    },
  });

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backDataFunctionality);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    };
  }, []);
  const backDataFunctionality = () => {
    if (onClose) {
      onClose();
      return true;
    } else {
      return false;
    }
  };

  return (
    <View style={styles.positionAbsolute}>
      <View style={styles.crossContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            lastScale = 1;
            baseScale.setValue(lastScale);
            pinchScale.setValue(1);

            lastRotate = 0;
            rotate.setOffset(lastRotate);
            rotate.setValue(0);

            lastOffset.x = 0;
            lastOffset.y = 0;
            translateX.setOffset(lastOffset.x);
            translateX.setValue(0);
            translateY.setOffset(lastOffset.y);
            translateY.setValue(0);
          }}
        >
          <View style={styles.iconContainer}>
            <Reset />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            onClose && onClose();
          }}
        >
          <CrossPopup style={styles.crossIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.imageContainer}>
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
      </View>
    </View>
  );
};
