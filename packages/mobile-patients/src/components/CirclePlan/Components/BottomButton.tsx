import React from 'react';
import { Dimensions, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  stickyBottomComponent: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    backgroundColor: theme.colors.WHITE,
    position: 'absolute',
    bottom: 0,
  },
  innerContainer: {
    backgroundColor: 'white',
  },
  buttonCta: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 5,
    width: width - 40,
    backgroundColor: '#FCB716',
    paddingVertical: 7,
    paddingHorizontal: 30,
  },
  buttonText: {
    ...theme.viewStyles.text('B', 14, '#FFFFFF', 1, 25, 0.35),
    textAlign: 'center',
  },
});

export interface BottomButtonProps {
  onButtonPress: () => void;
  buttonText: string;
}

export const BottomButton: React.FC<BottomButtonProps> = (props) => {
  return (
    <StickyBottomComponent style={[styles.stickyBottomComponent]}>
      <View style={[styles.innerContainer]}>
        <TouchableOpacity
          onPress={props.onButtonPress}
          activeOpacity={0.7}
          style={styles.buttonCta}
        >
          <Text style={styles.buttonText}>{props.buttonText}</Text>
        </TouchableOpacity>
      </View>
    </StickyBottomComponent>
  );
};
