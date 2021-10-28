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
import { Header } from '../ui/Header';
import appsFlyer from 'react-native-appsflyer';
import Share from 'react-native-share';
import { g } from '../../helpers/helperFunctions';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import { LinearGradientComponent } from '@aph/mobile-patients/src/components/ui/LinearGradientComponent';

export interface ShareReferLinkProps extends NavigationScreenProps {}

export const ShareReferLink: React.FC<ShareReferLinkProps> = (props) => {
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();

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
        colors={['#31CD95', '#D1FFF7']}
        style={styles.referShareMainContainer}
      >
        <View>
          <View style={styles.ref_shr_textContainer}>
            <Text style={styles.ref_shr_text}>Refer & Earn</Text>
            <Text style={styles.ref_shr_amount}>₹100</Text>
            <View>
              <Text style={styles.ref_shr_otherDetails}>Your friend got ₹100 on signup & </Text>
              <Text style={styles.ref_shr_otherDetails}>You get $100 on their first </Text>
            </View>
          </View>
          <View style={styles.ref_shr_btnTextContainer}>
            <View style={styles.ref_shr_referViaContainer}>
              <View style={styles.ref_shr_referViaHRLineLeft} />
              <Text style={styles.ref_shr_referViaText}>Refer Via</Text>
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
        <Text style={styles.hw_wk_mainHeading}>How it works?</Text>
        <View style={styles.hw_wk_listMainContainer}>
          <View style={styles.hw_wk_listSpecificContainer}>
            <View style={styles.hw_wk_listContainer}>
              <View style={styles.hw_wk_listImageCircle} />
              <Image
                source={require('@aph/mobile-patients/src/images/referAndEarn/invitation1.webp')}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.hw_wk_listText}>Invite your friend</Text>
          </View>
          <View style={styles.hw_wk_listSpecificContainer}>
            <View style={styles.hw_wk_listContainer}>
              <View style={styles.hw_wk_listImageCircle} />
              <Image
                source={require('@aph/mobile-patients/src/images/referAndEarn/earn-money1.webp')}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.hw_wk_listText}>Friend receives Rs100</Text>
          </View>
          <View style={styles.hw_wk_listSpecificContainer}>
            <View style={styles.hw_wk_listContainer}>
              <View style={styles.hw_wk_listImageCircle} />
              <Image
                source={require('@aph/mobile-patients/src/images/referAndEarn/delivered1.webp')}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.hw_wk_listText}>You receive 100 once order get delivered</Text>
          </View>
        </View>
        <View style={styles.hw_wk_linkMainContainer}>
          <TouchableOpacity style={styles.hw_wk_linkBtnForTC}>
            <View style={styles.hw_wk_linkContainer} />
            <Text style={styles.hw_wk_linkText}>Terms and Condition</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.hw_wk_linkBtn}>
            <View style={styles.hw_wk_linkContainer} />
            <Text style={styles.hw_wk_linkText}>FAQs</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCheckRewardsContainer = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate('YourRewardsScreen');
        }}
        style={styles.ch_rw_btn}
      >
        <Text style={styles.ch_rw_text}>Check Rewards</Text>
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
        <Text style={styles.ini_hc}>100 HC</Text>
        <Text style={styles.ini_hc_expiration}>Expires on 20 Aug 2021</Text>
        <View style={styles.ini_hc_reedemContainer}>
          <TouchableOpacity>
            <Text style={styles.ini_hc_reedemContainerText}>REDEEM NOW</Text>
          </TouchableOpacity>
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
          onPressLeftIcon={() => props.navigation.goBack()}
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
    backgroundColor: '#f0f1ec',
  },
  initialHCMainContainer: {
    backgroundColor: '#fff',
    paddingTop: 20,
    alignItems: 'center',
  },
  ini_hc: {
    color: '#02475B',
    fontWeight: '700',
    fontSize: 30,
  },
  ini_hc_expiration: {
    color: '#02475B',
    fontWeight: '500',
    fontSize: 13,
  },
  ini_hc_reedemContainer: {
    paddingVertical: 15,
    borderTopColor: '#bbb',
    borderTopWidth: 1,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  ini_hc_reedemContainerText: {
    color: '#FC9916',
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
    color: '#02475B',
  },
  ref_shr_amount: {
    fontSize: 35,
    fontWeight: '800',
    color: '#ffffff',
  },
  ref_shr_otherDetails: {
    fontSize: 13,
    color: '#ffffff',
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
    backgroundColor: '#fff',
    height: 1,
    marginRight: 5,
  },
  ref_shr_referViaHRLineRight: {
    width: 50,
    backgroundColor: '#fff',
    height: 1,
    marginLeft: 5,
  },
  ref_shr_referViaText: { color: '#fff' },
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
    color: '#02475B',
    fontSize: 17,
    fontWeight: '700',
  },
  ch_rw_btn: {
    backgroundColor: '#fff',
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  hw_wk_linkText: {
    fontSize: 14,
    color: '#f89623',
    fontWeight: '400',
  },
  hw_wk_linkContainer: {
    width: 10,
    height: 10,
    backgroundColor: '#f89623',
    borderRadius: 5,
    marginRight: 10,
  },
  howItWorkMainContainer: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
  },
  hw_wk_mainHeading: {
    fontWeight: '700',
    fontSize: 18,
    color: '#02475B',
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
    backgroundColor: '#007C9D',
    opacity: 0.2,
    position: 'absolute',
    borderRadius: 22,
    left: -12,
    top: -4,
  },
  hw_wk_listText: {
    color: '#02475B',
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
