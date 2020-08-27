import {
  LocationData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OneVectorNumber, TwoVectorNumber, RoundCancelIcon } from '../ui/Icons';

const styles = StyleSheet.create({
  blurView: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.31)',
    width: '100%',
    height: '100%',
  },
  popupContainerView: {
    flexDirection: 'row',
    // paddingHorizontal: 20,
    padding: 20,
    top: Dimensions.get('window').height * 0.15,
  },
  popupView: {
    width: '79%',
    height: 'auto',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
});

export interface AvailSubscriptionPopupProps {
  onAvailNow: (serviceable: boolean, response: LocationData) => void;
  onClose: () => void;
}

export const AvailSubscriptionPopup: React.FC<AvailSubscriptionPopupProps> = (props) => {

  return (
    <View style={styles.blurView}>
      <View style={styles.popupContainerView}>
        <View style={{ width: '9.72%' }} />
        <View style={styles.popupView}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
            <Text style={theme.viewStyles.text('SB', 18, '#07AE8B')}>How To Avail</Text>
            <TouchableOpacity onPress={props.onClose}>
              <RoundCancelIcon />
            </TouchableOpacity>
          </View>
          <View style={{
            marginTop: 15,
          }}>
            <Text style={theme.viewStyles.text('SB', 13, '#02475B', 1, 20, 0.35)}>
              Please Follow These Steps
            </Text>
            <View>
              <View style={{
                flexDirection: 'row',
                marginTop: 15,
                width: '80%'
              }}>
                <OneVectorNumber style={{
                  marginRight: 10,
                  marginTop: 5,
                }} />
                <Text style={{
                  ...theme.viewStyles.text('SB', 13, '#007C9D', 1, 20, 0.35),
                }}>
                  Complete transactions worth Rs 25000+ on Apollo 24/7
                </Text>
              </View>
              <View style={{
                flexDirection: 'row',
                marginTop: 15,
                width: '80%'
              }}>
                <TwoVectorNumber style={{
                  marginRight: 10,
                  marginTop: 5,
                }} />
                <Text style={{
                  ...theme.viewStyles.text('SB', 13, '#007C9D', 1, 20, 0.35),
                }}>
                  Duration of membership is 1 year. It will be auto renewed if you spend more than Rs 25000 within 1 year on Apollo 24/7
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: '#FC9916',
              marginTop: 20,
              padding: 10,
              borderRadius: 10,
              alignItems: 'center'
            }}
            onPress={() => {

            }}
          >
            <Text style={theme.viewStyles.text('B', 13, '#FFFFFF', 1, 20, 0.35)}>
              AVAIL NOW
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
