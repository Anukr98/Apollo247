import {
  CloseWhite,
  Rotate,
  Up,
  ZoomIn,
  ZoomOut,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { chatFilesType } from '@aph/mobile-doctors/src/helpers/dataTypes';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  PinchGestureHandler,
  PinchGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';
import Carousel from 'react-native-snap-carousel';
import { SafeAreaView } from 'react-navigation';

const { width, height } = Dimensions.get('screen');
const styles = StyleSheet.create({
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
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  mainContainer: { backgroundColor: 'black', marginTop: 16 },
  headerContainer: {
    backgroundColor: 'black',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  headingText: theme.viewStyles.text('M', 14, theme.colors.WHITE, 1, 24),
  subHeadingContainer: { flexDirection: 'row', marginTop: 5 },
  subHeadingText: theme.viewStyles.text('R', 10, theme.colors.WHITE, 1, 24),
  seperator: {
    width: 1,
    height: '100%',
    backgroundColor: 'white',
    marginHorizontal: 16,
  },
  previousContainer: {
    position: 'absolute',
    top: '48%',
    left: 2,
    zIndex: 100,
    elevation: 100,
  },
  previousIconContainer: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  nextContainer: {
    position: 'absolute',
    top: '48%',
    right: 2,
    zIndex: 100,
    elevation: 100,
  },
  nextIconContainer: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '90deg' }],
  },
  arrowIcon: { width: 30, height: 30 },
  footerContainer: {
    backgroundColor: 'black',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerIconContainer: { justifyContent: 'center', alignItems: 'center' },
  footerText: theme.viewStyles.text('R', 14, theme.colors.WHITE, 1, 24),
  itemContainer: {
    width: width,
    height: height * 0.7,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    width: width - 12,
    height: '100%',
    marginHorizontal: 6,
  },
});

let lastRotate = 0;
let lastScale = 1;
const lastOffset = { x: 0, y: 0 };

export interface ImageViewerProps {
  scrollToURL?: string;
  files: chatFilesType[];
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = (props) => {
  const { scrollToURL, files, onClose } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const carouselRef = useRef<Carousel<chatFilesType> | null>(null);
  const [panEnabled, setPanEnabled] = useState<boolean>(false);

  /* Pinching */

  const pinchRef = React.createRef();

  const baseScale = new Animated.Value(1);
  const pinchScale = new Animated.Value(1);
  const scale = Animated.multiply(baseScale, pinchScale);
  const onPinchGestureEvent = Animated.event([{ nativeEvent: { scale: pinchScale } }], {
    useNativeDriver: true,
  });

  const onZoom = (value: number) => {
    lastScale *= value;
    if (lastScale > 10) {
      lastScale = 10;
    }
    if (lastScale < 1) {
      lastScale = 1;
      if (panEnabled) {
        setPanEnabled(false);
      }
    } else {
      if (!panEnabled) {
        setPanEnabled(true);
      }
    }

    baseScale.setValue(lastScale);
    pinchScale.setValue(1);
  };

  const onPinchHandlerStateChange = (event: PinchGestureHandlerStateChangeEvent) => {
    if (!panEnabled) {
      setPanEnabled(true);
    }
    if (event.nativeEvent.oldState === State.ACTIVE) {
      onZoom(event.nativeEvent.scale);
    }
  };

  /* Rotation */

  const rotate = new Animated.Value(0);
  const rotateStr = rotate.interpolate({
    inputRange: [-100, 100],
    outputRange: ['-100rad', '100rad'],
  });

  /* Dragging */
  const dragRef = React.createRef();

  const translateX = new Animated.Value(0);
  const translateY = new Animated.Value(0);

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

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const scrollToIndex = () => {
    setLoading(true);
    const initialScrollIndex = files.findIndex((item) => item.url === scrollToURL);
    setTimeout(() => {
      carouselRef.current && carouselRef.current.triggerRenderingHack(initialScrollIndex);
      carouselRef.current &&
        carouselRef.current.snapToItem(initialScrollIndex > -1 ? initialScrollIndex : 0, false);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    scrollToIndex();
  }, [scrollToURL, carouselRef]);

  let lastTap: number | null = null;

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
      if (lastScale > 1) {
        onZoom(0);
      } else {
        onZoom(2.5);
      }
    } else {
      lastTap = now;
    }
  };

  const renderItem = (item: chatFilesType, index: number) => {
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={() => handleDoubleTap()} activeOpacity={1}>
          <PanGestureHandler
            ref={
              dragRef as
                | string
                | ((instance: PanGestureHandler | null) => void)
                | React.RefObject<PanGestureHandler>
                | null
                | undefined
            }
            simultaneousHandlers={[pinchRef]}
            onGestureEvent={onGestureEvent}
            minPointers={1}
            enabled={panEnabled}
            maxPointers={2}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View
              style={[
                { width: width, height: '100%' },
                {
                  transform: [{ translateX: translateX }, { translateY: translateY }],
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
                simultaneousHandlers={dragRef}
                onGestureEvent={onPinchGestureEvent}
                onHandlerStateChange={onPinchHandlerStateChange}
              >
                <Animated.View
                  style={[
                    styles.container,
                    {
                      transform: [
                        { scale: scale },
                        { rotate: currentIndex === index ? rotateStr : 0 },
                      ],
                    },
                  ]}
                  collapsable={false}
                >
                  {(panEnabled && currentIndex === index) || !panEnabled ? (
                    <FastImage
                      source={{ uri: item.url }}
                      style={styles.imageStyle}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  ) : null}
                </Animated.View>
              </PinchGestureHandler>
            </Animated.View>
          </PanGestureHandler>
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    if (panEnabled) {
      onZoom(1);
    }
    rotate.setOffset(lastRotate);
    rotate.setValue(0);
  }, [panEnabled]);

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headingText}>
            {files[currentIndex].fileName ||
              `Image_${moment(Number(files[currentIndex].timetoken) / 10000).format(
                'DD_MM_YYYY'
              )}.jpeg`}
          </Text>
          <View style={styles.subHeadingContainer}>
            <Text style={styles.subHeadingText}>
              {`Send on: ${moment(Number(files[currentIndex].timetoken) / 10000).format(
                'Do MMM, YYYY'
              )}`}
            </Text>
            <View style={styles.seperator} />
            <Text style={styles.subHeadingText}>
              {`Viewing ${currentIndex + 1} out of ${files.length}`}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            onClose();
          }}
        >
          <CloseWhite size="sm" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderPrevious = () => {
    if (files.length > 0 && currentIndex > 0) {
      return (
        <View style={styles.previousContainer}>
          <TouchableOpacity
            onPress={() => {
              carouselRef.current && carouselRef.current.snapToPrev();
            }}
            activeOpacity={1}
          >
            <View style={styles.previousIconContainer}>
              <Up style={styles.arrowIcon} />
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  };
  const renderNext = () => {
    if (files.length > 0 && currentIndex !== files.length - 1) {
      return (
        <View style={styles.nextContainer}>
          <TouchableOpacity
            onPress={() => {
              carouselRef.current && carouselRef.current.snapToNext();
            }}
            activeOpacity={1}
          >
            <View style={styles.nextIconContainer}>
              <Up style={styles.arrowIcon} />
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const renderFooter = () => {
    return (
      <View style={styles.footerContainer}>
        <TouchableOpacity
          onPress={() => {
            onZoom(1.25);
          }}
        >
          <View style={styles.footerIconContainer}>
            <ZoomIn />
            <Text style={styles.footerText}>Zoom in</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            lastRotate += 1.5708;
            rotate.setOffset(lastRotate);
            rotate.setValue(0);
          }}
        >
          <View style={styles.footerIconContainer}>
            <Rotate />
            <Text style={styles.footerText}>Image Rotate</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            onZoom(0.75);
          }}
        >
          <View style={styles.footerIconContainer}>
            <ZoomOut />
            <Text style={styles.footerText}>Zoom out</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.positionAbsolute}>
      <SafeAreaView>
        <View style={styles.mainContainer}>
          {renderHeader()}
          {loading ? <Spinner /> : null}
          {renderPrevious()}
          {renderNext()}
          <Carousel
            ref={(c) => (carouselRef.current = c)}
            initialNumToRender={files.length}
            data={files}
            renderItem={(item: { item: chatFilesType; index: number }) =>
              renderItem(item.item, item.index)
            }
            sliderWidth={width}
            sliderHeight={height * 0.7}
            itemWidth={width}
            scrollEnabled={!panEnabled}
            onScrollToIndexFailed={(data) => {
              scrollToIndex();
            }}
            onBeforeSnapToItem={(slideIndex) => {
              setCurrentIndex(slideIndex);
              setPanEnabled(false);
              lastRotate = 0;
              lastScale = 1;
              lastOffset.x = 0;
              lastOffset.y = 0;
            }}
          />
          {renderFooter()}
        </View>
      </SafeAreaView>
    </View>
  );
};
