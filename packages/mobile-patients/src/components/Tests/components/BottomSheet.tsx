import { isSmallDevice, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-navigation';
import { Button } from '../../ui/Button';
import { ArrowUpGreen } from '../../ui/Icons';

const screenHeight = Dimensions.get('window').height;
export interface BottomSheetProps {
  itemCount: string;
  cartCount: number;
  onPressGoToCart: () => void;
  height: number;
}

export const BottomSheet: React.FC<BottomSheetProps> = (props) => {
  const { itemCount, cartCount, onPressGoToCart, height } = props;
  const [alignment] = useState(new Animated.Value(0));
  const [isOpen, setIsOpen] = useState<boolean>(false);

  console.log({ isOpen });

  const gestureHandler = (e: any) => {
    const yOffsetValue = e?.nativeEvent?.contentOffset?.y;
    if (yOffsetValue > 0) {
      showBottomSummaryView();
      setIsOpen(true);
    } else if (yOffsetValue <= 0) {
      hideBottomSummaryView();
      setIsOpen(false);
    }
  };

  function showBottomSummaryView() {
    Animated.timing(alignment, {
      toValue: 1,
      duration: 500,
    }).start();
  }

  function hideBottomSummaryView() {
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

  const renderStickyBottom = () => {
    return (
      <View style={[styles.cartDetailView, { height: height }]}>
        <View style={{ marginLeft: 20, backgroundColor: 'red' }}>
          <Text style={styles.itemAddedText}>
            {itemCount}{' '}
            {cartCount == 1 ? string.diagnostics.itemAdded : string.diagnostics.itemsAdded}
          </Text>

          <TouchableOpacity onPress={() => showBottomSummaryView()} style={styles.viewDetailsTouch}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <ArrowUpGreen style={styles.viewDetailsUpIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.goToCartView}>
          <Button
            title={nameFormater(string.diagnostics.goToCart, 'upper')}
            onPress={() => onPressGoToCart}
            style={{ width: '90%' }}
          />
        </View>
      </View>
    );
  };

  return (
    <Animated.View style={[isOpen ? styles.container : styles.cartDetailView1, bottomSheetStyle]}>
      <View>
        <ScrollView onScroll={(e) => gestureHandler(e)}>{renderStickyBottom()}</ScrollView>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cartDetailView: {
    position: 'absolute',
    backgroundColor: 'orange',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartDetailView1: {
    backgroundColor: 'pink',
    // position: 'absolute',
    // backgroundColor: colors.WHITE,
    // bottom: 0,
    // width: '100%',
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
  },
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: screenHeight / 3,
    bottom: 0,
    backgroundColor: 'red',
  },
  itemAddedText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 13 : 14, colors.SHERPA_BLUE, 1, 19),
    textAlign: 'left',
    alignSelf: 'center',
  },

  viewDetailsTouch: {
    height: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDetailsText: {
    ...theme.viewStyles.text('M', 12, colors.APP_YELLOW, 1, 16),
  },
  viewDetailsUpIcon: {
    tintColor: colors.APP_YELLOW,
    height: 12,
    width: 12,
    resizeMode: 'contain',
    marginHorizontal: 5,
  },

  goToCartView: { marginRight: 12, alignItems: 'flex-end' },

  grabber: { borderTopColor: 'pink', borderTopWidth: 5 },
});
