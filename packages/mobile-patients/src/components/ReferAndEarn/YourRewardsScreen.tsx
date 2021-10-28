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
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';

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
  const ClaimedCard = (item: any) => {
    return (
      <View style={styles.hc_card_container}>
        <View style={styles.hc_card_Leftcontainer}>
          <Image
            source={require('@aph/mobile-patients/src/images/referAndEarn/check.webp')}
            style={{}}
            resizeMode="cover"
          />
        </View>
        <View>
          <Text style={styles.hc_card_refreeName}>{string.referAndEarn.claimed}</Text>
          <View style={styles.hc_card_flexRow}>
            <View style={styles.hc_card_claimedRightContaier}>
              <Text style={styles.hc_card_smallHeadingOne}>
                {string.referAndEarn.youEarnedRefreePoints}
              </Text>
              <Text style={styles.hc_card_smallHeadingTwo}>
                {string.referAndEarn.firstTimeLogin}
              </Text>
            </View>
            <View style={styles.hc_card_totalHC}>
              <Text style={styles.hc_card_HC}>{userHC}HC</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const ClaimedCardWithExpirationSet = (item: any) => {
    return (
      <View style={styles.hc_card_container}>
        <View style={styles.hc_card_Leftcontainer}>
          <Image
            source={require('@aph/mobile-patients/src/images/referAndEarn/check.webp')}
            style={{}}
            resizeMode="cover"
          />
        </View>
        <View>
          <View style={styles.hc_card_RightInnercontainer}>
            <Text style={styles.hc_card_refreeName}>{string.referAndEarn.refreeName}</Text>
            <Text style={styles.hc_card_exporationText}>{string.referAndEarn.expireOn}</Text>
          </View>

          <View style={styles.hc_card_flexRow}>
            <View style={styles.hc_card_claimedRightContaier}>
              <Text style={styles.hc_card_smallHeadingOne}>{string.referAndEarn.purchasedOn}</Text>
            </View>
            <View style={styles.hc_card_totalHC}>
              <Text style={styles.hc_card_HC}>{userHC}HC</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPendingCards = (item: any) => {
    return (
      <View style={styles.hc_card_container}>
        <View style={styles.hc_card_Leftcontainer}></View>
        <View>
          <View style={styles.hc_card_RightInnercontainer}>
            <Text style={styles.hc_card_refreeName}>{string.referAndEarn.refreeName}</Text>
          </View>

          <View style={styles.hc_card_flexRow}>
            <View style={{}}>
              <Text style={styles.hc_card_smallHeadingOne}>{string.referAndEarn.signedUp}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const noReferralReward = () => {
    return (
      <View style={styles.noReferralReward_container}>
        <View style={styles.no_rf_innerContainer}>
          <Text style={styles.no_rf_heading}>{string.referAndEarn.noReferralReward}</Text>
          <Text style={styles.no_rf_subHeading}>{string.referAndEarn.youHaveNotInvited}t</Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('EarnedPoints');
              // shareLinkMethod();
            }}
            style={styles.no_rf_referBtn}
          >
            <Text style={styles.no_rf_btnText}>{string.referAndEarn.referYourFriend}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ClaimedSection = () => {
    return (
      <View
        style={{
          flex: 1,
        }}
      >
        {/* <FlatList
          data={Array.from({ length: 1 }, (_, index) => index + 1)}
          renderItem={({ item }) => ClaimedCard(item)}
        />
        <FlatList
          data={Array.from({ length: 2 }, (_, index) => index + 1)}
          renderItem={({ item }) => ClaimedCardWithExpirationSet(item)}
        /> */}
        {noReferralReward()}
      </View>
    );
  };
  const PendingSection = () => {
    return (
      <View>
        <FlatList
          data={Array.from({ length: 5 }, (_, index) => index + 1)}
          renderItem={({ item }) => renderPendingCards(item)}
        />
      </View>
    );
  };

  const CustomTabBarHeader = () => {
    return (
      <View style={styles.customTabBarMainContainer}>
        <TouchableOpacity onPress={() => selectTabBar(1)} style={styles.cs_tbr_btn}>
          <Text
            style={[
              styles.cs_tbr_text,
              selectedTab === 1 ? styles.selectedTabText : styles.unSelectedTabText,
            ]}
          >
            {string.referAndEarn.claimed}
          </Text>
          <View style={selectedTab === 1 ? styles.horizontalBackground : {}} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => selectTabBar(2)} style={styles.cs_tbr_btn}>
          <Text
            style={[
              styles.cs_tbr_text,
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
        <View style={styles.to_HC_texContainer}>
          <Text style={styles.to_HC_totalHC}>
            {string.referAndEarn.totalHC}: {totalReward}
          </Text>
          <View style={styles.to_HC_refresh}>
            <TouchableOpacity onPress={() => {}}>
              <Image
                source={require('@aph/mobile-patients/src/images/referAndEarn/refresh.webp')}
                style={{}}
                resizeMode="cover"
              />
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
        {selectedTab === 1 ? ClaimedSection() : PendingSection()}
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
  to_HC_refresh: {
    position: 'absolute',
    right: 20,
  },
  to_HC_totalHC: {
    fontWeight: '700',
  },
  to_HC_texContainer: {
    alignItems: 'center',
  },
  totalHcMainContainer: {
    backgroundColor: theme.colors.HEX_WHITE,
    paddingVertical: 30,
  },
  cs_tbr_text: {
    fontSize: 17,
  },
  cs_tbr_btn: {
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
  hc_card_flexRow: {
    flexDirection: 'row',
  },
  hc_card_container: {
    backgroundColor: theme.colors.HEX_WHITE,
    paddingHorizontal: 14,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: theme.colors.LIGHT_GRAY_2,
    marginBottom: 5,
    borderRadius: 5,
    flexDirection: 'row',
  },
  hc_card_Leftcontainer: {
    marginRight: 10,
  },
  hc_card_RightInnercontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  hc_card_refreeName: {
    marginBottom: 10,
    fontWeight: '500',
  },
  no_rf_btnText: {
    color: theme.colors.HEX_WHITE,
    fontSize: 14,
    fontWeight: '700',
  },
  no_rf_referBtn: {
    backgroundColor: theme.colors.TANGERINE_YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  no_rf_subHeading: {
    color: theme.colors.BORDER_BOTTOM_COLOR,
    fontWeight: '400',
    fontSize: 18,
    marginBottom: 25,
    width: 250,
    textAlign: 'center',
  },
  no_rf_heading: {
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 15,
  },
  no_rf_innerContainer: {
    alignItems: 'center',
  },
  noReferralReward_container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hc_card_claimedRightContaier: {
    width: '75%',
  },
  hc_card_smallHeadingOne: {
    fontSize: 14,
    marginBottom: 5,
  },
  hc_card_smallHeadingTwo: {
    fontSize: 14,
  },
  hc_card_totalHC: {
    width: '20%',
    justifyContent: 'flex-end',
  },
  hc_card_HC: {
    fontWeight: '700',
  },
  hc_card_exporationText: {
    color: theme.colors.EXPIRE_TEXT,
    fontSize: 13,
    fontWeight: '400',
  },
});
