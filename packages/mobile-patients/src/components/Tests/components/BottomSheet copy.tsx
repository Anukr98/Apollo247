import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions, Animated } from 'react-native';
import { ScrollView } from 'react-navigation';

const screenHeight = Dimensions.get('window').height;
export interface BottomSheetProps {
  component?: any;
  onHide: () => void;
  isSheetOpen: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = (props) => {
  const [alignment] = useState(new Animated.Value(0));

  useEffect(() => {
    props.isSheetOpen ? openActionSheet() : hideActionSheet();
  }, []);

  function openActionSheet() {
    Animated.timing(alignment, {
      toValue: 1,
      duration: 500,
    }).start();
  }

  function hideActionSheet() {
    Animated.timing(alignment, {
      toValue: 0,
      duration: 500,
    }).start();
  }

  const bottomSheetInterpolate = () => {
    alignment.interpolate({
      inputRange: [0, 1],
      outputRange: [-screenHeight / 3, 0],
    });
  };

  const bottomSheetStyle = {
    bottom: bottomSheetInterpolate,
  };

  const gestureHandler = (e: any) => {
    console.log('ftyyyyy');
    const pp = e?.nativeEvent?.contentOffset?.y;
    console.log({ pp });
    if (pp > 0) {
      openActionSheet();
    } else if (pp <= 0) {
      hideActionSheet();
      props.onHide();
    }
  };

  const { component } = props;
  return (
    <Animated.View style={[styles.container, bottomSheetStyle]}>
      <View>
        <ScrollView onScroll={(e) => gestureHandler(e)} style={styles.grabber}>
          <Text>po</Text>
          <Text>po</Text>
          <Text>po</Text>
        </ScrollView>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: screenHeight / 3,
    bottom: 0,
    backgroundColor: 'red',
  },
  grabber: { borderTopColor: 'pink', borderTopWidth: 5 },
});
