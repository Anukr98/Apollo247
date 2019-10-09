import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';
import { Mascot } from './Icons';

const styles = StyleSheet.create({
  showPopUp: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    flex: 1,
    left: 0,
    right: 0,
  },
  subViewPopup: {
    backgroundColor: 'white',
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  congratulationsTextStyle: {
    marginHorizontal: 24,
    marginTop: 28,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(18),
  },
  congratulationsDescriptionStyle: {
    marginHorizontal: 24,
    marginTop: 8,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
});

export interface ButtonProps {
  title?: string;
  description?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const BottomPopUp: React.FC<ButtonProps> = (props) => {
  return (
    <View style={[styles.showPopUp, props.style]}>
      <View style={styles.subViewPopup}>
        {!!props.title && <Text style={styles.congratulationsTextStyle}>{props.title}</Text>}
        {!!props.description && (
          <Text style={styles.congratulationsDescriptionStyle}>{props.description}</Text>
        )}
        {props.children}
        <Mascot style={{ position: 'absolute', top: -32, right: 20 }} />
      </View>
    </View>
  );
};
