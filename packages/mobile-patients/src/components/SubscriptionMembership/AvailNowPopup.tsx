import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { RoundCancelIcon, ExclamationGreen } from '../ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '../NavigatorContainer';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';

const styles = StyleSheet.create({
  blurView: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.31)',
    width: '100%',
    height: '100%',
  },
  popupContainerView: {
    flexDirection: 'row',
    padding: 20,
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
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  crossIconStyle: {
    resizeMode: 'contain',
    width: 22,
    height: 23,
  },
  howToAvail: {
    flexDirection: 'row',
    marginTop: 15,
    width: '80%',
  },
  oneVectorStyle: {
    marginRight: 10,
    marginTop: 5,
  },
  bottomContainer: {
    backgroundColor: '#FC9916',
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
});

export interface AvailNowPopupProps extends NavigationScreenProps {
  planName: string;
  transactionAmount: number;
  onClose: () => void;
}

export const AvailNowPopup: React.FC<AvailNowPopupProps> = (props) => {
  const plan = props!.planName || '';
  const planName = !!plan ? plan.toLowerCase() : '';
  const displayPlanName = !!planName ? planName.charAt(0).toUpperCase() + planName.slice(1) : ''; // capitalize first character
  const renderHowToAvailContent = () => {
    return (
      <View
        style={{
          marginTop: 15,
        }}
      >
        <View>
          <Text style={theme.viewStyles.text('SB', 13, '#007C9D', 1, 20, 0.35)}>
            {`Complete transactions worth ${string.common.Rs}.${convertNumberToDecimal(
              props?.transactionAmount
            )} or more on the Apollo 24|7 app to unlock ${displayPlanName} membership​`}
          </Text>
        </View>
      </View>
    );
  };

  const renderBottomContainer = () => {
    return (
      <TouchableOpacity
        style={styles.bottomContainer}
        onPress={() => {
          props.navigation.navigate(AppRoutes.ConsultRoom, {});
        }}
      >
        <Text style={theme.viewStyles.text('B', 13, '#FFFFFF', 1, 20, 0.35)}>AVAIL NOW</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.blurView}>
      <View style={styles.popupContainerView}>
        <View style={{ width: '5.72%' }} />
        <View style={styles.popupView}>
          <TouchableOpacity
            onPress={() => {
              props.onClose();
            }}
            style={styles.sectionsHeading}
          >
            <View
              style={{
                flexDirection: 'row',
              }}
            >
              <ExclamationGreen
                style={{
                  width: 20,
                  height: 20,
                  resizeMode: 'contain',
                  marginRight: 10,
                }}
              />
              <Text style={theme.viewStyles.text('SB', 15, '#00B38E', 1, 20, 0.35)}>
                How To Avail
              </Text>
            </View>
            <RoundCancelIcon style={styles.crossIconStyle} />
          </TouchableOpacity>
          {renderHowToAvailContent()}
        </View>
      </View>
    </View>
  );
};
