import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

const styles = StyleSheet.create({
  mainViewStyle: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    elevation: 1100,
  },
  subViewStyles: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  alertStyles: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  aphAlertCtaViewStyle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 32,
    marginBottom: 25,
  },
  ctaWhiteButtonViewStyle: {
    flex: 1,
    minHeight: 40,
    height: 'auto',
    ...theme.viewStyles.card(0, 0),
  },
  ctaOrangeTextStyle: {
    textAlign: 'center',
    ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
    marginHorizontal: 5,
  },
  descriptionTextStyle: {
    marginHorizontal: 20,
    marginTop: 25,
    ...theme.viewStyles.text('M', 14, '#01475b', 1, 18),
    textAlign: 'center',
  },
  infoTextStyle: {
    marginHorizontal: 40,
    marginTop: 8,
    ...theme.viewStyles.text('R', 14, '#01475b', 1, 18),
    textAlign: 'center',
  },
});

export interface CustomAlertProps {
  onYesPress: () => void;
  onNoPress: () => void;
  description?: string;
  info?: string;
}

export const CustomAlert: React.FC<CustomAlertProps> = (props) => {
  const { description, info } = props;
  const infoText = '(This is to know more about your past health records)';

  const alertParams = [
    {
      text: 'NO',
      index: 0,
    },
    {
      text: 'YES',
      index: 1,
    },
  ];

  const renderCTAs = () => (
    <View style={styles.aphAlertCtaViewStyle}>
      {alertParams.map((item, index, array) => (
        <Button
          style={[
            styles.ctaWhiteButtonViewStyle,
            { marginRight: index == array.length - 1 ? 0 : 16 },
          ]}
          titleTextStyle={[styles.ctaOrangeTextStyle]}
          title={item.text}
          onPress={() => {
            if (index == 0) {
              props.onNoPress();
            } else {
              props.onYesPress();
            }
          }}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.mainViewStyle}>
      <View style={styles.subViewStyles}>
        <View style={styles.alertStyles}>
          <Text style={styles.descriptionTextStyle}>{description}</Text>
          <Text style={styles.infoTextStyle}>{info || infoText}</Text>
          {renderCTAs()}
        </View>
      </View>
    </View>
  );
};
