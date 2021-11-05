import React, { useState } from 'react';
import { View, Text, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
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
import { useReferralProgram } from '@aph/mobile-patients/src/components/ReferralProgramProvider';

export interface EarnedPointsProps extends NavigationScreenProps {}

export const EarnedPoints: React.FC<EarnedPointsProps> = (props) => {
  const { refreeReward } = useReferralProgram();
  const { navigation } = props;

  const renderYourGifterReward = () => {
    return (
      <View style={styles.earnPointsMainContainer}>
        <Text style={styles.earnPointmainHeading}>{string.referAndEarn.congratulation}</Text>
        <View style={styles.earnPointtrophyMainContainer}>
          <View style={styles.earnPointtrophy_container}>
            <TrophyIcon />
          </View>
        </View>
        <View style={styles.earnPointotherTextContainer}>
          <Text style={styles.earnPointgiftedHeading}>{string.referAndEarn.yourFriendGiftYou}</Text>
          <Text style={styles.earnPointtotalGifted}>
            {refreeReward} {string.referAndEarn.hc}
          </Text>
          <TouchableOpacity
            style={styles.earnPointreedemBtn}
            onPress={() => {
              navigation.navigate('MEDICINES');
            }}
          >
            <Text style={styles.earnPointreedemBtnText}>{string.referAndEarn.reedeemPoints}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderWhyChooseUsSection = () => {
    return (
      <View style={styles.earnPointwhyChooseApolloContainer}>
        <Text style={styles.earnPointWhyChooseUstitle}>
          {string.referAndEarn.whyChooseApollo247}
        </Text>
        <View style={styles.earnPointWhyChooseUsimageTextContainer}>
          <View style={styles.earnPointWhyChooseUsimageTextSubContainer}>
            <View style={styles.earnPointWhyChooseUsimg_container}>
              <FastDeliveryIcon />
            </View>
            <Text style={styles.earnPointWhyChooseUsimgTitle}>
              {string.referAndEarn.deleiveryInHours}
            </Text>
          </View>
          <View style={styles.earnPointWhyChooseUsimageTextSubContainer}>
            <View style={styles.earnPointWhyChooseUsimg_container}>
              <ConsultDoctorIcon />
            </View>
            <Text style={styles.earnPointWhyChooseUsimgTitle}>
              {string.referAndEarn.consultDoctorIn15Minutes}
            </Text>
          </View>
          <View style={styles.earnPointWhyChooseUsimageTextSubContainer}>
            <View style={styles.earnPointWhyChooseUsimg_container}>
              <LabTestAtHomeIcon />
            </View>
            <Text style={styles.earnPointWhyChooseUsimgTitle}>
              {string.referAndEarn.labTestAtHome}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <SafeAreaView style={styles.container}>
        <Header
          leftIcon="backArrow"
          title="Refer And Earn"
          onPressLeftIcon={() => navigation.replace('ConsultRoom')}
          container={{
            borderColor: 'transparent',
          }}
          titleStyle={{
            fontSize: 18,
          }}
        />
        {renderYourGifterReward()}
        {renderWhyChooseUsSection()}
      </SafeAreaView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  earnPointWhyChooseUsimgTitle: {
    textAlign: 'center',
    marginTop: 15,
    color: theme.colors.LIGHT_BLUE,
    fontSize: 13,
    fontWeight: '600',
    width: 90,
  },
  earnPointWhyChooseUsimg_container: {
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.HEX_WHITE,
    borderRadius: 30,
    padding: 5,
  },
  earnPointWhyChooseUsimageTextSubContainer: {
    width: 100,
    alignItems: 'center',
  },
  earnPointWhyChooseUsimageTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  earnPointWhyChooseUstitle: {
    marginTop: 20,
    fontSize: 18,
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '600',
  },
  earnPointwhyChooseApolloContainer: {
    backgroundColor: theme.colors.LIGHT_GREEN_ONE,
    flex: 1,
    alignItems: 'center',
  },
  earnPointreedemBtnText: {
    color: theme.colors.HEX_WHITE,
    fontWeight: '700',
  },
  earnPointreedemBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.TANGERINE_YELLOW,
    width: 200,
    height: 40,
    marginTop: 20,
    borderRadius: 5,
  },
  earnPointtotalGifted: {
    marginTop: 5,
    fontSize: 20,
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '700',
  },
  earnPointgiftedHeading: {
    marginTop: 20,
    fontSize: 20,
    color: theme.colors.LIGHT_BLUE,
  },
  earnPointotherTextContainer: {
    alignItems: 'center',
  },
  earnPointtrophy_container: {
    backgroundColor: theme.colors.LIGHT_BLUE_TWO,
    borderRadius: 100,
    padding: 9,
  },
  earnPointtrophyMainContainer: {
    marginTop: 30,
  },
  earnPointmainHeading: {
    fontSize: 22,
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '600',
  },
  earnPointsMainContainer: {
    backgroundColor: theme.colors.HEX_WHITE,
    marginVertical: 5,
    alignItems: 'center',
    paddingVertical: 25,
    flex: 1.5,
  },
});
