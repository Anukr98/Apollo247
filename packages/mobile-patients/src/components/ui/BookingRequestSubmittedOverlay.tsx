import { CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';

import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  mainViewStyle: {
    backgroundColor: '#f7f8f5',
    marginTop: 16,
    width: width - 40,
    height: 'auto',
    maxHeight: height - 98,
    padding: 0,
    borderRadius: 10,
    overflow: 'hidden',
  },
  noteContainer: {
    margin: 12,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextStyle: {
    margin: 18,
  },
  crossPopupContainer: {
    marginTop: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: 'white',
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginRight: -1,
  },
  mainContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, .8)',
    zIndex: 5,
  },
  mainViewSubView: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 5, height: 20 },
  },
});

export interface BookingRequestSubmittedOverlayProps extends NavigationScreenProps {
  setdisplayoverlay: (arg0: boolean) => void;
  doctor: string;
  errorMessage: string;
  error?: boolean;
}
export const BookingRequestSubmittedOverlay: React.FC<BookingRequestSubmittedOverlayProps> = (
  props
) => {
  const tabs = [{ title: 'Request Submitted' }, { title: 'Request Failed' }];

  return (
    <View style={styles.mainContainer}>
      <View style={{ paddingHorizontal: 20 }}>
        <View
          style={{
            alignItems: 'flex-end',
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              props.setdisplayoverlay(false);
            }}
            style={styles.crossPopupContainer}
          >
            <CrossPopup />
          </TouchableOpacity>
        </View>
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <View style={[styles.mainViewStyle]}>
            <View style={styles.mainViewSubView}>
              <Text style={[styles.headerTextStyle, theme.viewStyles.text('M', 16, '#02475B')]}>
                {props?.error ? tabs[1].title : tabs[0].title}
              </Text>
            </View>

            <View style={{ alignItems: 'center', justifyContent: 'center', margin: 25 }}>
              <ImageBackground
                style={{ width: 55, height: 55 }}
                source={require('@aph/mobile-patients/src/images/consultation/BORCall.webp')}
              />
              {props?.error ? (
                <Text
                  style={[
                    styles.headerTextStyle,
                    theme.viewStyles.text('M', 16, theme.colors.APP_RED, 1, 21),
                  ]}
                >
                  {props?.errorMessage}
                </Text>
              ) : (
                <Text
                  style={[styles.headerTextStyle, theme.viewStyles.text('M', 16, '#01475B', 1, 21)]}
                >
                  Your appointment request with
                  <Text style={{ fontFamily: 'IBMPlexSans-Bold' }}> Dr. {props?.doctor + ' '}</Text>
                  has been submitted. Our team will contact you shortly!
                </Text>
              )}
            </View>

            <View style={{ height: 20 }} />
          </View>
        </View>
      </View>
    </View>
  );
};
