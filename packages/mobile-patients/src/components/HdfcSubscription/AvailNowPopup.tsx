import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { RoundCancelIcon, OneVectorNumber, TwoVectorNumber } from '../ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '../NavigatorContainer';

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
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
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
    width: 20,
    height: 20,
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

export interface AvailNowPopupProps extends NavigationScreenProps{
  transactionAmount: number;
  onClose: () => void;
}

export const AvailNowPopup: React.FC<AvailNowPopupProps> = (props) => {

  const renderHowToAvailContent = () => {
    return (
      <View style={{
        marginTop: 15,
      }}>
        <Text style={theme.viewStyles.text('SB', 13, '#02475B', 1, 20, 0.35)}>
          Please Follow These Steps
        </Text>
        <View>
          <View style={styles.howToAvail}>
            <OneVectorNumber style={styles.oneVectorStyle} />
            <Text style={{
              ...theme.viewStyles.text('SB', 13, '#007C9D', 1, 20, 0.35),
            }}>
              {`Complete transactions worth Rs ${props.transactionAmount}+ on Apollo 24/7`}
            </Text>
          </View>
          <View style={styles.howToAvail}>
            <TwoVectorNumber style={styles.oneVectorStyle} />
            <Text style={theme.viewStyles.text('SB', 13, '#007C9D', 1, 20, 0.35)}>
              {`Duration of membership is 1 year. It will be auto renewed if you spend more than Rs ${props.transactionAmount} within 1 year on Apollo 24/7`}
            </Text>
          </View>
        </View>
        {/* {renderBottomContainer()} */}
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
        <Text style={theme.viewStyles.text('B', 13, '#FFFFFF', 1, 20, 0.35)}>
          AVAIL NOW
        </Text>
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
            style={styles.sectionsHeading}>
            <Text style={theme.viewStyles.text('SB', 17, '#00B38E', 1, 20, 0.35)}>
              How To Avail
            </Text>
            <RoundCancelIcon style={styles.crossIconStyle}/>
          </TouchableOpacity>
          {renderHowToAvailContent()}
        </View>
      </View>
    </View>
  );
};
