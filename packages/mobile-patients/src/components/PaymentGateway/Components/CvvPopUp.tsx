import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CardCVV } from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

export interface CvvPopUpProps {
  onPressOk: () => void;
}

export const CvvPopUp: React.FC<CvvPopUpProps> = (props) => {
  const { onPressOk } = props;

  const renderOk = () => {
    return (
      <View style={{ alignItems: 'center' }}>
        <Button
          style={styles.button}
          titleTextStyle={styles.title}
          title={'OK, GOT IT'}
          onPress={onPressOk}
        />
      </View>
    );
  };
  const renderInfo = () => {
    return (
      <View>
        <Text style={styles.header}>What is CVV ?</Text>
        <Text style={styles.body}>
          A CVV is the three- or four-digit number on the back of your card printed towards the
          right side of the signature strip.
        </Text>
      </View>
    );
  };
  return (
    <View style={styles.component}>
      <CardCVV />
      {renderInfo()}
      {renderOk()}
    </View>
  );
};

const styles = StyleSheet.create({
  component: {
    marginVertical: 20,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  header: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    lineHeight: 18,
    letterSpacing: 1,
    color: '#000000',
    marginTop: 22,
  },
  body: {
    ...theme.fonts.IBMPlexSansMedium(12),
    letterSpacing: 1,
    color: '#000000',
    marginTop: 8,
  },
  button: {
    width: 309,
    height: 40,
    borderRadius: 10,
    marginTop: 24,
  },
  title: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: '#FFFFFF',
  },
});
