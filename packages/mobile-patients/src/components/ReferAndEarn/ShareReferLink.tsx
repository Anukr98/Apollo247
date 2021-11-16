import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  Alert,
} from 'react-native';
import { NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import appsFlyer from 'react-native-appsflyer';
import Share from 'react-native-share';
import { g, replaceVariableInString } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { LinearGradientComponent } from '@aph/mobile-patients/src/components/ui/LinearGradientComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  ArrowRight,
  CopyLinkIcon,
  FriendReceiveIcon,
  InviteYourFriendIcon,
  ShareLinkBannerIcon,
  WhatsAppIconReferral,
  YouReceiveIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { LinkCopiedToast } from '@aph/mobile-patients/src/components/ReferAndEarn/LinkCopiedToast';
import { useReferralProgram } from '@aph/mobile-patients/src/components//ReferralProgramProvider';
import { useApolloClient } from 'react-apollo-hooks';
import {
  GET_CAMPAIGN_ID_FOR_REFERRER,
  GET_HC_REFREE_RECORD,
  GET_REWARD_ID,
} from '@aph/mobile-patients/src/graphql/profiles';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { LocalStrings } from '@aph/mobile-patients/src/strings/LocalStrings';

export interface ShareReferLinkProps extends NavigationScreenProps {}

const hcExpirationTime = 30;
export const ShareReferLink: React.FC<ShareReferLinkProps> = (props) => {
  const [referShareAmount, setReferShareAmount] = useState<string>('100');
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const client = useApolloClient();
  const [linkCopied, setLinkCopied] = useState(false);
  const [refreeReward, setRefreeReward] = useState({
    isRefree: false,
    rewardValue: 0,
    rewardRegisteration: '',
    expirationData: '',
    showHCSection: false,
  });
  const {
    rewardId,
    setRewardId,
    campaignId,
    setCampaignId,
    referrerLink,
    setReferrerLink,
  } = useReferralProgram();
  const { navigation } = props;

  useEffect(() => {
    generateReferrerLink();
    checkRefreeRewardData();
  }, []);

  const checkRefreeRewardData = async () => {
    try {
      const response = await client.query({
        query: GET_HC_REFREE_RECORD,
        variables: { id: g(currentPatient, 'id') },
        fetchPolicy: 'no-cache',
      });
      const { data } = response;
      if (data?.getReferralRewardDetails?.referee?.name != null) {
        let refreeRegisterationDate: any = new Date(
          `${data?.getReferralRewardDetails?.referee?.registrationDate}`
        );
        refreeRegisterationDate.setDate(refreeRegisterationDate.getDate() + hcExpirationTime);
        setRefreeReward({
          isRefree: true,
          rewardValue: data?.getReferralRewardDetails?.referee?.rewardValue,
          rewardRegisteration: data?.getReferralRewardDetails?.referee?.registrationDate,
          expirationData: getRequiredDateFormat(refreeRegisterationDate),
          showHCSection: checkReferralExpirationDate(
            data?.getReferralRewardDetails?.referee?.registrationDate
          ),
        });
      }
    } catch (error) {
      CommonBugFender('ShareReferralLink_generatingCampaignId', error);
    }
  };

  useEffect(() => {
    if (linkCopied) {
      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    }
  }, [linkCopied]);

  const getRequiredDateFormat = (date: any) => {
    if (date != null) {
      let d = new Date(date);
      return `${d.getDate()} ${LocalStrings.monthsName[d.getMonth()]}, ${d.getFullYear()}`;
    } else {
      return '';
    }
  };

  const onWhatsAppShare = () => {
    const shareOptions = {
      title: string.referAndEarn.referalLink,
      url: referrerLink,
      message: string.referAndEarn.shareLinkText,
      failOnCancel: false,
      showAppsToView: true,
      social: Share.Social.WHATSAPP,
    };
    Share.shareSingle(shareOptions).catch((e) => console.log(e));
  };

  const copyLinkToShare = () => {
    Clipboard.setString(string.referAndEarn.shareLinkText + '\n' + referrerLink);
    setLinkCopied(true);
  };

  const checkReferralExpirationDate = (registerationDate: String) => {
    let refreeRegisterationDate = new Date(`${registerationDate}`);
    let currenDate = new Date();
    refreeRegisterationDate.setDate(refreeRegisterationDate.getDate() + hcExpirationTime);
    return refreeRegisterationDate.getTime() > currenDate.getTime();
  };

  const generateReferrerLink = () => {
    appsFlyer.setAppInviteOneLinkID('775G');
    appsFlyer.generateInviteLink(
      {
        channel: 'gmail',
        campaign: campaignId,
        customerID: g(currentPatient, 'id'),
        sub2: 'AppReferral',
        userParams: {
          rewardId: rewardId,
          linkToUse: 'ForReferrarInstall',
        },
      },
      (link) => {
        setReferrerLink?.(link);
      },
      (err) => {}
    );
  };
  const renderReferShare = () => {
    return (
      <LinearGradientComponent
        colors={[theme.colors.BLUE_GRADIENT_ONE, theme.colors.BLUE_GRADIENT_ONE]}
        style={styles.referShareMainContainer}
      >
        <View>
          <View style={styles.referSharetextMainContainer}>
            <View style={styles.referSharetextContainer}>
              <Text style={styles.referSharetext}>{string.referAndEarn.referAndEarn}</Text>
              <Text style={styles.referShareamount}>₹{referShareAmount && referShareAmount}</Text>
              <View>
                <Text style={styles.referShareotherDetails}>
                  {string.referAndEarn.yourFriendGot} ₹{referShareAmount && referShareAmount}{' '}
                  {string.referAndEarn.onSignUp}{' '}
                </Text>
                <Text style={styles.referShareotherDetails}>
                  {string.referAndEarn.youGet} ₹{referShareAmount && referShareAmount}{' '}
                  {string.referAndEarn.onTheirFirst}{' '}
                </Text>
              </View>
            </View>
            <ShareLinkBannerIcon />
          </View>
          <View style={styles.referSharebtnTextContainer}>
            <View style={styles.referSharereferViaContainer}>
              <View style={styles.referSharereferViaHRLineLeft} />
              <Text style={styles.referSharereferViaText}>{string.referAndEarn.referVia}</Text>
              <View style={styles.referSharereferViaHRLineRight} />
            </View>
            <View style={styles.referSharebtnContainer}>
              <TouchableOpacity onPress={() => onWhatsAppShare()}>
                <WhatsAppIconReferral style={styles.whatsIconImage} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  copyLinkToShare();
                }}
              >
                <CopyLinkIcon />
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
        <Text style={styles.howWorkmainHeading}>{string.referAndEarn.howItWorks}</Text>
        <View style={styles.howWorklistMainContainer}>
          <View style={styles.howWorklistSpecificContainer}>
            <View style={styles.howWorklistContainer}>
              <View style={styles.howWorklistImageCircle} />
              <InviteYourFriendIcon />
            </View>
            <Text style={styles.howWorklistText}>{string.referAndEarn.inviteYourFriend}</Text>
          </View>
          <View style={styles.howWorklistSpecificContainer}>
            <View style={styles.howWorklistContainer}>
              <View style={styles.howWorklistImageCircle} />
              <FriendReceiveIcon />
            </View>
            <Text style={styles.howWorklistText}>
              {replaceVariableInString(string.referAndEarn.friendReceiveRs, {
                referShareAmount: referShareAmount ? referShareAmount : '',
              })}
            </Text>
          </View>
          <View style={styles.howWorklistSpecificContainer}>
            <View style={styles.howWorklistContainer}>
              <View style={styles.howWorklistImageCircle} />
              <YouReceiveIcon />
            </View>
            <View>
              <Text style={styles.howWorklistText}>
                {replaceVariableInString(string.referAndEarn.youReceive, {
                  referShareAmount: referShareAmount ? referShareAmount : '',
                })}
              </Text>
              <Text style={styles.howWorklistTextSpecialNote}>
                {replaceVariableInString(string.referAndEarn.notValidForOrder, {
                  validRuppes: string.referAndEarn.validUpTo,
                })}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.howWorklinkMainContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('RefererTermsAndCondition')}
            style={styles.howWorklinkBtnForTC}
          >
            <View style={styles.howWorklinkContainer} />
            <Text style={styles.howWorklinkText}>{string.referAndEarn.termsAndCondition}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('RefererFAQ')}
            style={styles.howWorklinkBtn}
          >
            <View style={styles.howWorklinkContainer} />
            <Text style={styles.howWorklinkText}>{string.referAndEarn.FAQs}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderLinkCopiedToast = () => {
    return <LinkCopiedToast />;
  };
  const renderCheckRewardsContainer = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('YourRewardsScreen');
        }}
        style={styles.checkRewardbtn}
      >
        <Text style={styles.checkRewardtext}>{string.referAndEarn.checkRewards}</Text>
        <ArrowRight />
      </TouchableOpacity>
    );
  };

  const renderInitialHC = () => {
    return (
      <View style={styles.initialHCMainContainer}>
        <Text style={styles.initialHC}>
          {referShareAmount && referShareAmount} {string.referAndEarn.hc}
        </Text>
        <Text style={styles.initialHCexpiration}>
          {string.referAndEarn.ExpireON} {refreeReward.expirationData}
        </Text>
        <View style={styles.initialHCreedemContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('MEDICINES')}>
            <Text style={styles.initialHCreedemContainerText}>{string.referAndEarn.reedemNow}</Text>
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
          title="Refer & Earn"
          onPressLeftIcon={() => navigation.goBack()}
          container={{
            borderColor: 'transparent',
          }}
          titleStyle={{
            fontSize: 18,
          }}
        />
        <ScrollView>
          {refreeReward.showHCSection && renderInitialHC()}
          {renderReferShare()}
          {renderHowItWork()}
          {renderCheckRewardsContainer()}
        </ScrollView>
        {linkCopied && renderLinkCopiedToast()}
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
  initialHC: {
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '700',
    fontSize: 30,
  },
  initialHCexpiration: {
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '500',
    fontSize: 13,
  },
  initialHCreedemContainer: {
    paddingVertical: 15,
    borderTopColor: theme.colors.DARK_GRAY,
    borderTopWidth: 1,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  initialHCreedemContainerText: {
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
  referSharetextContainer: {
    width: '50%',
  },
  referSharetextMainContainer: {
    flexDirection: 'row',
  },
  referSharetext: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.WHITE,
  },
  referShareamount: {
    fontSize: 35,
    fontWeight: 'bold',
    color: theme.colors.WHITE,
  },
  referShareotherDetails: {
    fontSize: 13,
    color: theme.colors.WHITE,
    fontWeight: '600',
  },
  referSharebtnTextContainer: {
    alignItems: 'center',
  },
  referSharereferViaContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    width: 200,
  },
  referSharereferViaHRLineLeft: {
    width: 50,
    backgroundColor: theme.colors.WHITE,
    height: 1,
    marginRight: 5,
  },
  referSharereferViaHRLineRight: {
    width: 50,
    backgroundColor: theme.colors.WHITE,
    height: 1,
    marginLeft: 5,
  },
  referSharereferViaText: { color: theme.colors.WHITE },
  referSharebtnContainer: {
    width: 200,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  referShareimage: {
    width: 60,
    height: 60,
  },
  whatsIconImage: {},
  checkRewardicon: {
    width: 12,
    height: 17,
  },
  checkRewardtext: {
    color: theme.colors.LIGHT_BLUE,
    fontSize: 17,
    fontWeight: '700',
  },
  checkRewardbtn: {
    backgroundColor: theme.colors.HEX_WHITE,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  howWorklinkText: {
    fontSize: 14,
    color: theme.colors.REFERRAL_CIRCLE_DOT,
    fontWeight: '400',
  },
  howWorklinkContainer: {
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
  howWorkmainHeading: {
    fontWeight: '700',
    fontSize: 18,
    color: theme.colors.LIGHT_BLUE,
    marginBottom: 20,
  },
  howWorklistMainContainer: {
    paddingLeft: 15,
  },
  howWorklistSpecificContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'center',
  },
  howWorklistContainer: {
    width: 35,
    height: 35,
    marginRight: 10,
  },
  howWorklistImageCircle: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.TURQUOISE_LIGHT_BLUE,
    opacity: 0.2,
    position: 'absolute',
    borderRadius: 22,
    left: -12,
    top: -4,
  },
  howWorklistText: {
    color: theme.colors.LIGHT_BLUE,
    fontSize: 15,
    fontWeight: '600',
  },
  howWorklistTextSpecialNote: {
    color: theme.colors.LIGHT_BLUE,
    fontSize: 12,
    marginTop: 5,
  },
  howWorklinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 150,
  },
  howWorklinkBtnForTC: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 200,
  },
  howWorklinkMainContainer: {
    flexDirection: 'row',
    marginVertical: 25,
    alignItems: 'center',
  },
});
