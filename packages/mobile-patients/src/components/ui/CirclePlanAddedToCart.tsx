import React from 'react';
import { View, StyleSheet, Text, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { TickIcon } from '@aph/mobile-patients/src/components/ui/Icons';

interface CirclePlanAddedToCartProps {
  style?: StyleProp<ViewStyle>;
}
export const CirclePlanAddedToCart: React.FC<CirclePlanAddedToCartProps> = (props) => {
  return (
    <View style={[styles.container, props.style]}>
      <TickIcon />
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text
          style={{
            ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE),
            flexWrap: 'wrap',
          }}
        >
          {string.circleDoctors.circlePlanAddedToCart}
        </Text>
        <Text
          style={{
            ...theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE),
            flexWrap: 'wrap',
            marginTop: 2,
          }}
        >
          {string.circleDoctors.discountInfoReflectsOnCheckout}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    marginBottom: 5,
    padding: 8,
    marginHorizontal: 20,
    flexDirection: 'row',
  },
  tickIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
});
