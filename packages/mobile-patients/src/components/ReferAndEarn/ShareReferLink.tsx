import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  Alert,
} from 'react-native';
import { NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import appsFlyer from 'react-native-appsflyer';
import Share from 'react-native-share';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { LinearGradientComponent } from '@aph/mobile-patients/src/components/ui/LinearGradientComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';

export interface ShareReferLinkProps extends NavigationScreenProps {}

export const ShareReferLink: React.FC<ShareReferLinkProps> = (props) => {
  const [referShareAmount, setReferShareAmount] = useState<string>('100');
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const { navigation } = props;

  const onWhatsAppShare = () => {
    generateReferrerLink((res: any) => {
      const shareOptions = {
        title: 'Referral Link',
        url: res,
        message: 'Please install Apollo 247 using below link',
        failOnCancel: false,
        showAppsToView: true,
        social: Share.Social.WHATSAPP,
      };
      Share.shareSingle(shareOptions).catch((e) => console.log(e));
    });
  };

  const copyLinkToShare = () => {
    generateReferrerLink((res: any) => {
      Clipboard.setString('Please install Apollo 247 using below link ' + res);
      Alert.alert('Link Copied');
    });
  };

  const generateReferrerLink = (success: (data: any) => void) => {
    appsFlyer.setAppInviteOneLinkID('775G');
    appsFlyer.generateInviteLink(
      {
        channel: 'gmail',
        campaign: '1',
        customerID: g(currentPatient, 'id'),
        sub2: 'AppReferral',
        userParams: {
          rewardId: '1',
          linkToUse: 'ForReferrarInstall',
        },
      },
      (link) => {
        success(link);
      },
      (err) => {}
    );
  };
  const renderReferShare = () => {
    return (
      <LinearGradientComponent
        colors={[theme.colors.GREEN_GRADIENT_ONE, theme.colors.GREEN_GRADIENT_TWO]}
        style={styles.referShareMainContainer}
      >
        <View>
          <View style={styles.ref_shr_textContainer}>
            <Text style={styles.ref_shr_text}>{string.referAndEarn.referAndEarn}</Text>
            <Text style={styles.ref_shr_amount}>₹{referShareAmount}</Text>
            <View>
              <Text style={styles.ref_shr_otherDetails}>
                {string.referAndEarn.yourFriendGot} ₹{referShareAmount}{' '}
                {string.referAndEarn.onSignUp}{' '}
              </Text>
              <Text style={styles.ref_shr_otherDetails}>
                {string.referAndEarn.youGet} ₹{referShareAmount} {string.referAndEarn.onTheirFirst}{' '}
              </Text>
            </View>
          </View>
          <View style={styles.ref_shr_btnTextContainer}>
            <View style={styles.ref_shr_referViaContainer}>
              <View style={styles.ref_shr_referViaHRLineLeft} />
              <Text style={styles.ref_shr_referViaText}>{string.referAndEarn.referVia}</Text>
              <View style={styles.ref_shr_referViaHRLineRight} />
            </View>
            <View style={styles.ref_shr_btnContainer}>
              <TouchableOpacity onPress={() => onWhatsAppShare()}>
                <Image
                  source={{
                    uri: 'https://newassets.apollo247.com/images/ReferrerImages/MaskGroup.png',
                  }}
                  style={styles.ref_shr_image}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  copyLinkToShare();
                }}
              >
                <Image
                  source={require('@aph/mobile-patients/src/images/referAndEarn/shareLink.webp')}
                  style={styles.ref_shr_image}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradientComponent>
    );
  };

  const renderHowItWork = () => {
    return (
      <View style={styles.howItWorkMainContainer}>
        <Text style={styles.hw_wk_mainHeading}>{string.referAndEarn.howItWorks}</Text>
        <View style={styles.hw_wk_listMainContainer}>
          <View style={styles.hw_wk_listSpecificContainer}>
            <View style={styles.hw_wk_listContainer}>
              <View style={styles.hw_wk_listImageCircle} />
              <Image
                source={require('@aph/mobile-patients/src/images/referAndEarn/invitation1.webp')}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.hw_wk_listText}>{string.referAndEarn.inviteYourFriend}</Text>
          </View>
          <View style={styles.hw_wk_listSpecificContainer}>
            <View style={styles.hw_wk_listContainer}>
              <View style={styles.hw_wk_listImageCircle} />
              <Image
                source={require('@aph/mobile-patients/src/images/referAndEarn/earn-money1.webp')}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.hw_wk_listText}>
              {string.referAndEarn.friendReceiveRs}
              {referShareAmount}
            </Text>
          </View>
          <View style={styles.hw_wk_listSpecificContainer}>
            <View style={styles.hw_wk_listContainer}>
              <View style={styles.hw_wk_listImageCircle} />
              <Image
                source={require('@aph/mobile-patients/src/images/referAndEarn/delivered1.webp')}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.hw_wk_listText}>
              {string.referAndEarn.youReceive} {referShareAmount}{' '}
              {string.referAndEarn.onceOrderGetDelivered}
            </Text>
          </View>
        </View>
        <View style={styles.hw_wk_linkMainContainer}>
          <TouchableOpacity style={styles.hw_wk_linkBtnForTC}>
            <View style={styles.hw_wk_linkContainer} />
            <Text style={styles.hw_wk_linkText}>{string.referAndEarn.termsAndCondition}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.hw_wk_linkBtn}>
            <View style={styles.hw_wk_linkContainer} />
            <Text style={styles.hw_wk_linkText}>{string.referAndEarn.FAQs}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCheckRewardsContainer = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('YourRewardsScreen');
        }}
        style={styles.ch_rw_btn}
      >
        <Text style={styles.ch_rw_text}>{string.referAndEarn.checkRewards}</Text>
        <Image
          source={require('@aph/mobile-patients/src/images/referAndEarn/arrow.webp')}
          style={styles.ch_rw_icon}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const renderInitialHC = () => {
    return (
      <View style={styles.initialHCMainContainer}>
        <Text style={styles.ini_hc}>{referShareAmount} HC</Text>
        <Text style={styles.ini_hc_expiration}>{string.referAndEarn.ExpireON} 20 Aug 2021</Text>
        <View style={styles.ini_hc_reedemContainer}>
          <TouchableOpacity>
            <Text style={styles.ini_hc_reedemContainerText}>{string.referAndEarn.reedemNow}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.SHERPA_BLUE} />
      <SafeAreaView style={styles.container}>
        <Header
          leftIcon="backArrow"
          title="Refer And Earn"
          onPressLeftIcon={() => navigation.goBack()}
          container={{
            borderColor: 'transparent',
          }}
          titleStyle={{
            fontSize: 18,
          }}
        />
        <ScrollView>
          {/* {renderInitialHC()} */}
          {renderReferShare()}
          {renderHowItWork()}
          {renderCheckRewardsContainer()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  initialHCMainContainer: {
    backgroundColor: theme.colors.HEX_WHITE,
    paddingTop: 20,
    alignItems: 'center',
  },
  ini_hc: {
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '700',
    fontSize: 30,
  },
  ini_hc_expiration: {
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '500',
    fontSize: 13,
  },
  ini_hc_reedemContainer: {
    paddingVertical: 15,
    borderTopColor: theme.colors.DARK_GRAY,
    borderTopWidth: 1,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  ini_hc_reedemContainerText: {
    color: theme.colors.TANGERINE_YELLOW,
    fontWeight: '800',
    fontSize: 14,
  },
  referShareMainContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowOffset: { width: 0, height: 5 },
    elevation: 15,
  },
  ref_shr_textContainer: {
    width: '65%',
  },
  ref_shr_text: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.LIGHT_BLUE,
  },
  ref_shr_amount: {
    fontSize: 35,
    fontWeight: 'bold',
    color: theme.colors.LIGHT_BLUE,
  },
  ref_shr_otherDetails: {
    fontSize: 13,
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '600',
  },
  ref_shr_btnTextContainer: {
    alignItems: 'center',
  },
  ref_shr_referViaContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    width: 200,
  },
  ref_shr_referViaHRLineLeft: {
    width: 50,
    backgroundColor: theme.colors.LIGHT_BLUE,
    height: 1,
    marginRight: 5,
  },
  ref_shr_referViaHRLineRight: {
    width: 50,
    backgroundColor: theme.colors.LIGHT_BLUE,
    height: 1,
    marginLeft: 5,
  },
  ref_shr_referViaText: { color: theme.colors.LIGHT_BLUE },
  ref_shr_btnContainer: {
    width: 200,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  ref_shr_image: {
    width: 60,
    height: 60,
  },
  ch_rw_icon: {
    width: 12,
    height: 17,
  },
  ch_rw_text: {
    color: theme.colors.LIGHT_BLUE,
    fontSize: 17,
    fontWeight: '700',
  },
  ch_rw_btn: {
    backgroundColor: theme.colors.HEX_WHITE,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  hw_wk_linkText: {
    fontSize: 14,
    color: theme.colors.REFERRAL_CIRCLE_DOT,
    fontWeight: '400',
  },
  hw_wk_linkContainer: {
    width: 10,
    height: 10,
    backgroundColor: theme.colors.REFERRAL_CIRCLE_DOT,
    borderRadius: 5,
    marginRight: 10,
  },
  howItWorkMainContainer: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: theme.colors.HEX_WHITE,
  },
  hw_wk_mainHeading: {
    fontWeight: '700',
    fontSize: 18,
    color: theme.colors.LIGHT_BLUE,
    marginBottom: 20,
  },
  hw_wk_listMainContainer: {
    paddingLeft: 15,
  },
  hw_wk_listSpecificContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'center',
  },
  hw_wk_listContainer: {
    width: 35,
    height: 35,
    marginRight: 10,
  },
  hw_wk_listImageCircle: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.TURQUOISE_LIGHT_BLUE,
    opacity: 0.2,
    position: 'absolute',
    borderRadius: 22,
    left: -12,
    top: -4,
  },
  hw_wk_listText: {
    color: theme.colors.LIGHT_BLUE,
    fontSize: 15,
  },
  hw_wk_linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 150,
  },
  hw_wk_linkBtnForTC: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 200,
  },
  hw_wk_linkMainContainer: {
    flexDirection: 'row',
    marginVertical: 25,
    alignItems: 'center',
  },
});
