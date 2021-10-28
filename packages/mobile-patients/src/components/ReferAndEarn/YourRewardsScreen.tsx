import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import Share from 'react-native-share';
import appsFlyer from 'react-native-appsflyer';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { g, replaceVariableInString } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { ReferCheckIcon, ReferRefreshIcon } from '@aph/mobile-patients/src/components/ui/Icons';

export interface YourRewardsScreenProps extends NavigationScreenProps {}

export const YourRewardsScreen: React.FC<YourRewardsScreenProps> = (props) => {
  const [selectedTab, selectTabBar] = useState(1);
  const [totalReward, setTotalReward] = useState<number>(200.0);
  const [userHC, setUserHC] = useState<number | string>('100');
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();

  const { navigation } = props;

  const shareLinkMethod = () => {
    generateReferrerLink((referralLink) => {
      const shareOptions = {
        title: 'Referral Link',
        url: referralLink,
        message: 'Please install Apollo 247 using below link',
        failOnCancel: false,
        showAppsToView: true,
      };
      Share.open(shareOptions);
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
  const ClaimedCard = () => {
    return (
      <View style={styles.healthCreditcontainer}>
        <View style={styles.healthCreditLeftcontainer}>
          <ReferCheckIcon />
        </View>
        <View>
          <Text style={styles.healthCreditrefreeName}>{string.referAndEarn.claimed}</Text>
          <View style={styles.healthCreditflexRow}>
            <View style={styles.healthCreditclaimedRightContaier}>
              <Text style={styles.healthCreditsmallHeadingOne}>
                {string.referAndEarn.youEarnedRefreePoints}
              </Text>
              <Text style={styles.healthCreditsmallHeadingTwo}>
                {string.referAndEarn.dummyRewardData.selfClaimed.firstTimeLogin}
                {string.referAndEarn.firstTimeLogin}
              </Text>
            </View>
            <View style={styles.healthCredittotalHC}>
              <Text style={styles.healthCreditHC}>
                {string.referAndEarn.dummyRewardData.selfClaimed.rewardPoints}
                {string.referAndEarn.dummyRewardData.currencytype}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const ClaimedCardWithExpirationSet = (item: any) => {
    return (
      <View style={styles.healthCreditcontainer}>
        <View style={styles.healthCreditLeftcontainer}>
          <ReferCheckIcon />
        </View>
        <View>
          <View style={styles.healthCreditRightInnercontainer}>
            <Text style={styles.healthCreditrefreeName}>{item.name}</Text>
            <Text style={styles.healthCreditexporationText}>{item.expiryDate}</Text>
          </View>
          <View style={styles.healthCreditflexRow}>
            <View style={styles.healthCreditclaimedRightContaier}>
              <Text style={styles.healthCreditsmallHeadingOne}>{item.firstTxnDate}</Text>
            </View>
            <View style={styles.healthCredittotalHC}>
              <Text style={styles.healthCreditHC}>
                {item.rewardPoints}
                {string.referAndEarn.dummyRewardData.currencytype}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPendingCards = (item: any) => {
    return (
      <View style={styles.healthCreditcontainer}>
        <View style={styles.healthCreditLeftcontainer}></View>
        <View>
          <View style={styles.healthCreditRightInnercontainer}>
            <Text style={styles.healthCreditrefreeName}>{item.name}</Text>
          </View>
          <View style={styles.healthCreditflexRow}>
            <View style={{}}>
              <Text style={styles.healthCreditsmallHeadingOne}>
                {replaceVariableInString(string.referAndEarn.signedUp, {
                  signedUpDate: item.firstTxnDate,
                })}
                {string.referAndEarn.purchaseIsPending}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const noReferralReward = () => {
    return (
      <View style={styles.noReferralReward_container}>
        <View style={styles.NoReferralinnerContainer}>
          <Text style={styles.NoReferralheading}>{string.referAndEarn.noReferralReward}</Text>
          <Text style={styles.NoReferralsubHeading}>{string.referAndEarn.youHaveNotInvited}t</Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('EarnedPoints');
            }}
            style={styles.NoReferralreferBtn}
          >
            <Text style={styles.NoReferralbtnText}>{string.referAndEarn.referYourFriend}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderClaimedSection = () => {
    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <ClaimedCard />
        <FlatList
          data={string.referAndEarn.dummyRewardData.claimed}
          renderItem={({ item }) => ClaimedCardWithExpirationSet(item)}
        />
      </View>
    );
  };
  const renderPendingSection = () => {
    return (
      <View>
        <FlatList
          data={string.referAndEarn.dummyRewardData.pending}
          renderItem={({ item }) => renderPendingCards(item)}
        />
      </View>
    );
  };

  const CustomTabBarHeader = () => {
    return (
      <View style={styles.customTabBarMainContainer}>
        <TouchableOpacity onPress={() => selectTabBar(1)} style={styles.customTabBarbtn}>
          <Text
            style={[
              styles.customTabBartext,
              selectedTab === 1 ? styles.selectedTabText : styles.unSelectedTabText,
            ]}
          >
            {string.referAndEarn.claimed}
          </Text>
          <View style={selectedTab === 1 ? styles.horizontalBackground : {}} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => selectTabBar(2)} style={styles.customTabBarbtn}>
          <Text
            style={[
              styles.customTabBartext,
              selectedTab === 2 ? styles.selectedTabText : styles.unSelectedTabText,
            ]}
          >
            {string.referAndEarn.pending}
          </Text>
          <View style={selectedTab === 2 ? styles.horizontalBackground : {}} />
        </TouchableOpacity>
      </View>
    );
  };
  const renderTotalHCContainer = () => {
    return (
      <View style={styles.totalHcMainContainer}>
        <View style={styles.totalHCtexContainer}>
          <Text style={styles.totalHCtotalHC}>
            {replaceVariableInString(string.referAndEarn.total, {
              currencyType: string.referAndEarn.dummyRewardData.currencytype,
              earnedPoints: string.referAndEarn.dummyRewardData.totalEarn.toString(),
            })}
          </Text>
          <View style={styles.totalHCrefresh}>
            <TouchableOpacity onPress={() => {}}>
              <ReferRefreshIcon />
            </TouchableOpacity>
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
          title="Your Rewards"
          onPressLeftIcon={() => navigation.goBack()}
          container={{
            borderColor: 'transparent',
          }}
          titleStyle={{
            fontSize: 18,
          }}
        />
        {renderTotalHCContainer()}
        <CustomTabBarHeader />
        {selectedTab === 1 ? renderClaimedSection() : renderPendingSection()}
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
  selectedTabText: {
    opacity: 1,
  },
  unSelectedTabText: {
    opacity: 0.6,
  },
  horizontalBackground: {
    marginTop: 15,
    width: '80%',
    backgroundColor: theme.colors.CONSULT_SUCCESS_TEXT,
    height: 3,
  },
  totalHCrefresh: {
    position: 'absolute',
    right: 20,
  },
  totalHCtotalHC: {
    fontWeight: '700',
  },
  totalHCtexContainer: {
    alignItems: 'center',
  },
  totalHcMainContainer: {
    backgroundColor: theme.colors.HEX_WHITE,
    paddingVertical: 30,
  },
  customTabBartext: {
    fontSize: 17,
  },
  customTabBarbtn: {
    width: Dimensions.get('screen').width / 2,
    alignItems: 'center',
  },
  customTabBarMainContainer: {
    flexDirection: 'row',
    borderBottomColor: theme.colors.DARK_GRAY,
    borderTopColor: theme.colors.DARK_GRAY,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    paddingTop: 18,
    backgroundColor: theme.colors.HEX_WHITE,
  },
  healthCreditflexRow: {
    flexDirection: 'row',
  },
  healthCreditcontainer: {
    backgroundColor: theme.colors.HEX_WHITE,
    paddingHorizontal: 14,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: theme.colors.LIGHT_GRAY_2,
    marginBottom: 5,
    borderRadius: 5,
    flexDirection: 'row',
  },
  healthCreditLeftcontainer: {
    marginRight: 10,
  },
  healthCreditRightInnercontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  healthCreditrefreeName: {
    marginBottom: 10,
    fontWeight: '500',
  },
  NoReferralbtnText: {
    color: theme.colors.HEX_WHITE,
    fontSize: 14,
    fontWeight: '700',
  },
  NoReferralreferBtn: {
    backgroundColor: theme.colors.TANGERINE_YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  NoReferralsubHeading: {
    color: theme.colors.BORDER_BOTTOM_COLOR,
    fontWeight: '400',
    fontSize: 18,
    marginBottom: 25,
    width: 250,
    textAlign: 'center',
  },
  NoReferralheading: {
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 15,
  },
  NoReferralinnerContainer: {
    alignItems: 'center',
  },
  noReferralReward_container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthCreditclaimedRightContaier: {
    width: '75%',
  },
  healthCreditsmallHeadingOne: {
    fontSize: 14,
    marginBottom: 5,
  },
  healthCreditsmallHeadingTwo: {
    fontSize: 14,
  },
  healthCredittotalHC: {
    width: '20%',
    justifyContent: 'flex-end',
  },
  healthCreditHC: {
    fontWeight: '700',
  },
  healthCreditexporationText: {
    color: theme.colors.EXPIRE_TEXT,
    fontSize: 13,
    fontWeight: '400',
  },
});
