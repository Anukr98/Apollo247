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
import { Header } from '../ui/Header';
import { createMaterialTopTabNavigator, createAppContainer } from 'react-navigation';
import Share from 'react-native-share';
import appsFlyer from 'react-native-appsflyer';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import { g } from '../../helpers/helperFunctions';

export interface YourRewardsScreenProps extends NavigationScreenProps {}

export const YourRewardsScreen: React.FC<YourRewardsScreenProps> = (props) => {
  const [selectedTab, selectTabBar] = useState(1);
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();

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
          <Text style={styles.hc_card_refreeName}>Claimed</Text>
          <View style={styles.hc_card_flexRow}>
            <View style={styles.hc_card_claimedRightContaier}>
              <Text style={styles.hc_card_smallHeadingOne}>You earned refree points on 3rd</Text>
              <Text style={styles.hc_card_smallHeadingTwo}>Aug, 2021 first time Login.</Text>
            </View>
            <View style={styles.hc_card_totalHC}>
              <Text style={styles.hc_card_HC}>100HC</Text>
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
            <Text style={styles.hc_card_refreeName}>Shriya Singh</Text>
            <Text style={styles.hc_card_exporationText}>Expires on 12 Sep,21</Text>
          </View>

          <View style={styles.hc_card_flexRow}>
            <View style={styles.hc_card_claimedRightContaier}>
              <Text style={styles.hc_card_smallHeadingOne}>Purchased On 20th July</Text>
            </View>
            <View style={styles.hc_card_totalHC}>
              <Text style={styles.hc_card_HC}>100HC</Text>
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
            <Text style={styles.hc_card_refreeName}>Shriya Singh</Text>
          </View>

          <View style={styles.hc_card_flexRow}>
            <View style={{}}>
              <Text style={styles.hc_card_smallHeadingOne}>
                Signed up 20th July, Purchase is Pending.
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
        <View style={styles.no_rf_innerContainer}>
          <Text style={styles.no_rf_heading}>No referral rewards</Text>
          <Text style={styles.no_rf_subHeading}>You have not invited your friends yet</Text>
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate('EarnedPoints');
              // shareLinkMethod();
            }}
            style={styles.no_rf_referBtn}
          >
            <Text style={styles.no_rf_btnText}>Refer Your Friend</Text>
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
            Claimed
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
            Pending
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
          <Text style={styles.to_HC_totalHC}>Total HC: 200.00</Text>
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
          onPressLeftIcon={() => props.navigation.goBack()}
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
    backgroundColor: '#f0f1ec',
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
    backgroundColor: '#00B38E',
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
    backgroundColor: '#fff',
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
    borderBottomColor: '#bababa',
    borderTopColor: '#bababa',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    paddingTop: 18,
    backgroundColor: '#fff',
  },
  hc_card_flexRow: {
    flexDirection: 'row',
  },
  hc_card_container: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: '#ccc',
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
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  no_rf_referBtn: {
    backgroundColor: '#FC9916',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  no_rf_subHeading: {
    color: '#979797',
    fontWeight: '400',
    fontSize: 18,
    marginBottom: 25,
    width: 250,
    textAlign: 'center',
  },
  no_rf_heading: {
    color: '#02475B',
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
    color: '#FE5959',
    fontSize: 13,
    fontWeight: '400',
  },
});
