import { Mascot } from './Icons';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme/theme';

const styles = StyleSheet.create({
  showPopUp: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    flex: 1,
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

export interface buttonProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export const BottomPopUp: React.FC<buttonProps> = (props) => {
  return (
    <View style={styles.showPopUp}>
      <View style={styles.subViewPopup}>
        <Text style={styles.congratulationsTextStyle}>{props.title}</Text>
        <Text style={styles.congratulationsDescriptionStyle}>{props.description}</Text>
        {props.children}
        <Mascot style={{ position: 'absolute', top: -32, right: 20 }} />
      </View>
    </View>
  );
};
