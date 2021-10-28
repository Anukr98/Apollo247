import React, { useState } from 'react';
import { View, Text, StatusBar, StyleSheet, Image, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import string from '@aph/mobile-patients/src/strings/strings.json';

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
          <Text style={styles.erd_mainHeading}>{string.referAndEarn.congratulation}</Text>
          <View style={styles.erd_trophy_maincontainer}>
            <View style={styles.erd_trophy_container}>
              <Image
                source={require('@aph/mobile-patients/src/images/referAndEarn/trophy1.webp')}
                style={{}}
                resizeMode="cover"
              />
            </View>
          </View>
          <View style={styles.erd_otherTextContainer}>
            <Text style={styles.erd_giftedHeading}>{string.referAndEarn.yourFriendGiftYou}</Text>
            <Text style={styles.erd_totalGifted}>{initialEarn} HC</Text>
            <TouchableOpacity
              style={styles.erd_reedemBtn}
              onPress={() => {
                navigation.navigate('TabBar');
              }}
            >
              <Text style={styles.erd_reedemBtnText}>{string.referAndEarn.reedeemPoints}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.erd_whyChooseApolloContainer}>
          <Text style={styles.erd_wca_title}>{string.referAndEarn.whyChooseApollo247}</Text>
          <View style={styles.erd_wca_imageTextContainer}>
            <View style={styles.erd_wca_imageTextSubContainer}>
              <View style={styles.erd_wca_img_container}>
                <Image
                  source={require('@aph/mobile-patients/src/images/referAndEarn/fast-delivery1.webp')}
                  style={styles.shareImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.erd_wca_imgTitle}>{string.referAndEarn.deleiveryInHours}</Text>
            </View>
            <View style={styles.erd_wca_imageTextSubContainer}>
              <View style={styles.erd_wca_img_container}>
                <Image
                  source={require('@aph/mobile-patients/src/images/referAndEarn/doctor1.webp')}
                  style={styles.shareImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.erd_wca_imgTitle}>
                {string.referAndEarn.consultDoctorIn15Minutes}
              </Text>
            </View>
            <View style={styles.erd_wca_imageTextSubContainer}>
              <View style={styles.erd_wca_img_container}>
                <Image
                  source={require('@aph/mobile-patients/src/images/referAndEarn/flask1.webp')}
                  style={styles.shareImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.erd_wca_imgTitle}>{string.referAndEarn.labTestAtHome}</Text>
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
  erd_wca_imgTitle: {
    textAlign: 'center',
    marginTop: 15,
    color: theme.colors.LIGHT_BLUE,
    fontSize: 13,
    fontWeight: '600',
  },
  erd_wca_img_container: {
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.HEX_WHITE,
    borderRadius: 30,
    padding: 5,
  },
  erd_wca_imageTextSubContainer: {
    width: 100,
    alignItems: 'center',
  },
  erd_wca_imageTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  erd_wca_title: {
    marginTop: 20,
    fontSize: 18,
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '600',
  },
  erd_whyChooseApolloContainer: {
    backgroundColor: theme.colors.LIGHT_GREEN_ONE,
    flex: 1,
    alignItems: 'center',
  },
  erd_reedemBtnText: {
    color: theme.colors.HEX_WHITE,
    fontWeight: '700',
  },
  erd_reedemBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.TANGERINE_YELLOW,
    width: 200,
    height: 40,
    marginTop: 20,
    borderRadius: 5,
  },
  erd_totalGifted: {
    marginTop: 5,
    fontSize: 20,
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '700',
  },
  erd_giftedHeading: {
    marginTop: 20,
    fontSize: 20,
    color: theme.colors.LIGHT_BLUE,
  },
  erd_otherTextContainer: {
    alignItems: 'center',
  },
  erd_trophy_container: {
    backgroundColor: theme.colors.LIGHT_BLUE_TWO,
    borderRadius: 100,
    padding: 9,
  },
  erd_trophy_maincontainer: {
    marginTop: 30,
  },
  erd_mainHeading: {
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
