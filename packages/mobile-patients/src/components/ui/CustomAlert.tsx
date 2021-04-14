import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';
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
    marginTop: 18,
    marginBottom: 27,
  },
  ctaWhiteButtonViewStyle: {
    flex: 1,
    minHeight: 40,
    height: 'auto',
    backgroundColor: theme.colors.WHITE,
  },
  ctaOrangeButtonViewStyle: { flex: 1, minHeight: 40, height: 'auto' },
  ctaOrangeTextStyle: {
    textAlign: 'center',
    ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
    marginHorizontal: 5,
  },
  descriptionTextStyle: {
    marginHorizontal: 20,
    marginTop: 25,
    ...theme.viewStyles.text('M', 14, '#01475b'),
  },
});

export interface CustomAlertProps {
  onYesPress: () => void;
  onNoPress: () => void;
  description?: string;
}

export const CustomAlert: React.FC<CustomAlertProps> = (props) => {
  const { description } = props;

  const alertParams = [
    {
      text: 'NO',
      index: 0,
      type: 'white-button',
    },
    {
      text: 'YES',
      index: 1,
      type: 'orange-button',
    },
  ];

  const renderCTAs = () => (
    <View style={styles.aphAlertCtaViewStyle}>
      {alertParams.map((item, index, array) =>
        item.type == 'orange-link' ? (
          <Text
            style={[styles.ctaOrangeTextStyle, { marginRight: index == array.length - 1 ? 0 : 16 }]}
          >
            {item.text}
          </Text>
        ) : (
          <Button
            style={[
              item.type == 'white-button'
                ? styles.ctaWhiteButtonViewStyle
                : styles.ctaOrangeButtonViewStyle,
              { marginRight: index == array.length - 1 ? 0 : 16 },
            ]}
            titleTextStyle={[item.type == 'white-button' && styles.ctaOrangeTextStyle]}
            title={item.text}
            onPress={() => {
              if (index == 0) {
                props.onNoPress();
              } else {
                props.onYesPress();
              }
            }}
          />
        )
      )}
    </View>
  );

  return (
    <View style={styles.mainViewStyle}>
      <View style={styles.subViewStyles}>
        <View style={styles.alertStyles}>
          <Text style={styles.descriptionTextStyle}>{description}</Text>
          {renderCTAs()}
        </View>
      </View>
    </View>
  );
};
