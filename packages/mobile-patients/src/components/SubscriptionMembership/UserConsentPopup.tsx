import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { RoundCancelIcon } from '../ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NavigationScreenProps } from 'react-navigation';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

const styles = StyleSheet.create({
  blurView: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.31)',
    width: '100%',
    height: '100%',
  },
  popupContainerView: {
    flexDirection: 'row',
    top: Dimensions.get('window').height * 0.15,
  },
  popupView: {
    width: '90%',
    height: 'auto',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 10,
    marginVertical: 4,
    padding: 16,
  },
  sectionsHeading: {
    marginHorizontal: 10,
    height: 30,
  },
  crossIconStyle: {
    resizeMode: 'contain',
    width: 22,
    height: 23,
  },
  headingText: {
    ...theme.viewStyles.text('M', 13, '#00B38E', 1, 20, 0.35),
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subHeaderView: {
    marginHorizontal: 15,
    marginVertical: 20,
    width: '93%',
  },
  subHeadingText: {
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 18, 0.35),
  },
});

export interface UserConstentPopupProps extends NavigationScreenProps {
  heading: string;
  subHeading: string;
  ctaText: string;
  onClose: () => void;
  onPressConfirm: () => void;
}

export const UserConstentPopup: React.FC<UserConstentPopupProps> = (props) => {
  return (
    <View style={styles.blurView}>
      <View style={styles.popupContainerView}>
        <View style={{ width: '5.72%' }} />
        <View style={styles.popupView}>
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <View style={{ width: '90%' }}>
              <Text style={styles.headingText}>{props.heading}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                props.onClose();
              }}
              style={styles.sectionsHeading}
            >
              <RoundCancelIcon style={styles.crossIconStyle} />
            </TouchableOpacity>
          </View>
          <View style={styles.subHeaderView}>
            <Text style={styles.subHeadingText}>{props.subHeading}</Text>
          </View>

          <Button
            title={props.ctaText}
            onPress={() => {
              props.onPressConfirm();
            }}
          />
        </View>
      </View>
    </View>
  );
};
