import React, { useState } from 'react';
import { View, Text, StatusBar, StyleSheet, Image, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  ConsultDoctorIcon,
  FastDeliveryIcon,
  LabTestAtHomeIcon,
  TrophyIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';

export interface EarnedPointsProps extends NavigationScreenProps {}

export const EarnedPoints: React.FC<EarnedPointsProps> = (props) => {
  const [initialEarn, setInitialEarn] = useState<string>('100');

  const { navigation } = props;
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <SafeAreaView style={styles.container}>
        <Header
          leftIcon="backArrow"
          title="Refer And Earn"
          onPressLeftIcon={() => navigation.navigate('ConsultRoom')}
          container={{
            borderColor: 'transparent',
          }}
          titleStyle={{
            fontSize: 18,
          }}
        />
        <View style={styles.earned_main_container}>
          <Text style={styles.earneDmainHeading}>{string.referAndEarn.congratulation}</Text>
          <View style={styles.earneDtrophy_maincontainer}>
            <View style={styles.earneDtrophy_container}>
              <TrophyIcon />
            </View>
          </View>
          <View style={styles.earneDotherTextContainer}>
            <Text style={styles.earneDgiftedHeading}>{string.referAndEarn.yourFriendGiftYou}</Text>
            <Text style={styles.earneDtotalGifted}>
              {initialEarn} {string.referAndEarn.hc}
            </Text>
            <TouchableOpacity
              style={styles.earneDreedemBtn}
              onPress={() => {
                navigation.navigate('TabBar');
              }}
            >
              <Text style={styles.earneDreedemBtnText}>{string.referAndEarn.reedeemPoints}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.earneDwhyChooseApolloContainer}>
          <Text style={styles.earnedWhyChooseUstitle}>
            {string.referAndEarn.whyChooseApollo247}
          </Text>
          <View style={styles.earnedWhyChooseUsimageTextContainer}>
            <View style={styles.earnedWhyChooseUsimageTextSubContainer}>
              <View style={styles.earnedWhyChooseUsimg_container}>
                <FastDeliveryIcon />
              </View>
              <Text style={styles.earnedWhyChooseUsimgTitle}>
                {string.referAndEarn.deleiveryInHours}
              </Text>
            </View>
            <View style={styles.earnedWhyChooseUsimageTextSubContainer}>
              <View style={styles.earnedWhyChooseUsimg_container}>
                <ConsultDoctorIcon />
              </View>
              <Text style={styles.earnedWhyChooseUsimgTitle}>
                {string.referAndEarn.consultDoctorIn15Minutes}
              </Text>
            </View>
            <View style={styles.earnedWhyChooseUsimageTextSubContainer}>
              <View style={styles.earnedWhyChooseUsimg_container}>
                <LabTestAtHomeIcon />
              </View>
              <Text style={styles.earnedWhyChooseUsimgTitle}>
                {string.referAndEarn.labTestAtHome}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  shareImage: {},
  earnedWhyChooseUsimgTitle: {
    textAlign: 'center',
    marginTop: 15,
    color: theme.colors.LIGHT_BLUE,
    fontSize: 13,
    fontWeight: '600',
  },
  earnedWhyChooseUsimg_container: {
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.HEX_WHITE,
    borderRadius: 30,
    padding: 5,
  },
  earnedWhyChooseUsimageTextSubContainer: {
    width: 100,
    alignItems: 'center',
  },
  earnedWhyChooseUsimageTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  earnedWhyChooseUstitle: {
    marginTop: 20,
    fontSize: 18,
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '600',
  },
  earneDwhyChooseApolloContainer: {
    backgroundColor: theme.colors.LIGHT_GREEN_ONE,
    flex: 1,
    alignItems: 'center',
  },
  earneDreedemBtnText: {
    color: theme.colors.HEX_WHITE,
    fontWeight: '700',
  },
  earneDreedemBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.TANGERINE_YELLOW,
    width: 200,
    height: 40,
    marginTop: 20,
    borderRadius: 5,
  },
  earneDtotalGifted: {
    marginTop: 5,
    fontSize: 20,
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '700',
  },
  earneDgiftedHeading: {
    marginTop: 20,
    fontSize: 20,
    color: theme.colors.LIGHT_BLUE,
  },
  earneDotherTextContainer: {
    alignItems: 'center',
  },
  earneDtrophy_container: {
    backgroundColor: theme.colors.LIGHT_BLUE_TWO,
    borderRadius: 100,
    padding: 9,
  },
  earneDtrophy_maincontainer: {
    marginTop: 30,
  },
  earneDmainHeading: {
    fontSize: 22,
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '600',
  },
  earned_main_container: {
    backgroundColor: theme.colors.HEX_WHITE,
    marginVertical: 5,
    alignItems: 'center',
    paddingVertical: 25,
    flex: 1.5,
  },
});
