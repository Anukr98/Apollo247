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
  AlertIOS,
} from 'react-native';
import { NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { Header } from '../ui/Header';
import appsFlyer from 'react-native-appsflyer';
import Share from 'react-native-share';
import { g, postAppsFlyerEvent, postCleverTapEvent } from '../../helpers/helperFunctions';
import { CleverTapEventName } from '../../helpers/CleverTapEvents';
import { AppsFlyerEventName } from '../../helpers/AppsFlyerEvents';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import { TextInput } from 'react-native-paper';

export interface ShareReferLinkProps extends NavigationScreenProps {}

export const ShareReferLink: React.FC<ShareReferLinkProps> = (props) => {
  const [referralLink, setReferralLink] = useState('');
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
    // const shareOptions = {
    //   title: 'Referral Link',
    //   url: referralLink,
    //   message: 'Please install Apollo 247 using below link',
    //   failOnCancel: false,
    //   showAppsToView: true,
    // };
    // Share.open(shareOptions);
    generateReferrerLink((res: any) => {
      // const shareOptions = {
      //   title: 'Referral Link',
      //   url: res,
      //   message: 'Please install Apollo 247 using below link',
      //   failOnCancel: false,
      //   showAppsToView: true,
      //   social: Share.Social.WHATSAPP,
      // };
      // Clipboard.setString('Please install Apollo 247 using below link ' + res);
      AlertIOS.alert('JGJGJJGJG');
      // Share.shareSingle(shareOptions).catch((e) => console.log(e));
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
      <View
        style={{
          backgroundColor: '#f89623',
          paddingHorizontal: 20,
          paddingVertical: 20,
        }}
      >
        <View>
          <View
            style={{
              width: '65%',
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: '#02475B',
              }}
            >
              Refer & Earn
            </Text>
            <Text
              style={{
                fontSize: 35,
                fontWeight: '800',
                color: '#ffffff',
              }}
            >
              $100
            </Text>
            <View>
              <Text
                style={{
                  fontSize: 13,
                  color: '#ffffff',
                  fontWeight: '600',
                }}
              >
                Your friend got $100 on signup &{' '}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: '#ffffff',
                  fontWeight: '600',
                }}
              >
                You get $100 on their first{' '}
              </Text>
            </View>
          </View>
          <View
            style={{
              alignItems: 'center',
            }}
          >
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 30,
                width: 200,
              }}
            >
              <View
                style={{
                  width: 50,
                  backgroundColor: '#fff',
                  height: 1,
                  marginRight: 5,
                }}
              />
              <Text style={{ color: '#fff' }}>Refer Via</Text>
              <View
                style={{
                  width: 50,
                  backgroundColor: '#fff',
                  height: 1,
                  marginLeft: 5,
                }}
              />
            </View>
            <View
              style={{
                width: 200,
                flexDirection: 'row',
                justifyContent: 'space-around',
                marginTop: 10,
              }}
            >
              <TouchableOpacity onPress={() => onWhatsAppShare()}>
                <Image
                  source={{
                    uri: 'https://newassets.apollo247.com/images/ReferrerImages/MaskGroup.png',
                  }}
                  style={{
                    width: 60,
                    height: 60,
                  }}
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
                  style={{
                    width: 60,
                    height: 60,
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderHowItWork = () => {
    return (
      <View
        style={{
          paddingVertical: 12,
          paddingHorizontal: 18,
          backgroundColor: '#fff',
        }}
      >
        <Text
          style={{
            fontWeight: '700',
            fontSize: 18,
            color: '#02475B',
            marginBottom: 20,
          }}
        >
          How it works?
        </Text>
        <View>
          <View
            style={{
              flexDirection: 'row',
              marginVertical: 5,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 35,
                height: 35,
                backgroundColor: '#f89623',
                marginRight: 15,
              }}
            />
            <Text
              style={{
                color: '#02475B',
                fontSize: 15,
              }}
            >
              Invite your friend
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginVertical: 5,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 35,
                height: 35,
                backgroundColor: '#f89623',
                marginRight: 15,
              }}
            />
            <Text
              style={{
                color: '#02475B',
                fontSize: 15,
              }}
            >
              Friend receives Rs100
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginVertical: 5,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 35,
                height: 35,
                backgroundColor: '#f89623',
                marginRight: 15,
              }}
            />
            <Text
              style={{
                color: '#02475B',
                fontSize: 15,
              }}
            >
              You receive 100 once order get delivered
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            marginVertical: 25,
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: 200,
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                backgroundColor: '#f89623',
                borderRadius: 5,
                marginRight: 10,
              }}
            />
            <Text
              style={{
                fontSize: 14,
                color: '#f89623',
                fontWeight: '400',
              }}
            >
              Terms and Condition
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: 150,
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                backgroundColor: '#f89623',
                borderRadius: 5,
                marginRight: 10,
              }}
            />
            <Text
              style={{
                fontSize: 14,
                color: '#f89623',
                fontWeight: '400',
              }}
            >
              FAQs
            </Text>
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
        style={{
          backgroundColor: '#fff',
          marginTop: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 18,
          paddingVertical: 15,
        }}
      >
        <Text
          style={{
            color: '#02475B',
            fontSize: 17,
            fontWeight: '700',
          }}
        >
          Check Rewards
        </Text>
        <Image
          source={require('@aph/mobile-patients/src/images/referAndEarn/arrow.webp')}
          style={{
            width: 12,
            height: 17,
          }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const renderInitialHC = () => {
    return (
      <View
        style={{
          backgroundColor: '#fff',
          paddingTop: 20,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: '#02475B',
            fontWeight: '700',
            fontSize: 30,
          }}
        >
          100 HC
        </Text>
        <Text
          style={{
            color: '#02475B',
            fontWeight: '500',
            fontSize: 13,
          }}
        >
          Expires on 20 Aug 2021
        </Text>
        <View
          style={{
            paddingVertical: 15,
            borderTopColor: '#bbb',
            borderTopWidth: 1,
            width: '100%',
            alignItems: 'center',
            marginTop: 10,
          }}
        >
          <TouchableOpacity>
            <Text
              style={{
                color: '#FC9916',
                fontWeight: '800',
                fontSize: 14,
              }}
            >
              REDEEM NOW
            </Text>
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
          {renderInitialHC()}
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
  shareImage: {
    width: 100,
    height: 100,
  },
});
