import React, { useState, useEffect } from 'react';
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
import {
  g,
  getCleverTapCircleMemberValues,
  getUserType,
  postCleverTapEvent,
  replaceVariableInString,
  updateUserProfileWithReferrInformation,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { ReferCheckIcon, ReferRefreshIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_HC_REFREE_RECORD } from '@aph/mobile-patients/src/graphql/profiles';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { LocalStrings } from '@aph/mobile-patients/src/strings/LocalStrings';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useReferralProgram } from '@aph/mobile-patients/src/components/ReferralProgramProvider';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import moment from 'moment';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

type PendingUserList = {
  name: string;
  registrationDate: string;
};

type ClaimedUserList = {
  expiryDate: string;
  rewardType: string;
  name: string;
  rewardValue: Number;
  txnDate: string;
};

type RefreeInitialData = {
  registrationDate: string | null;
  name: string | null;
  rewardValue: string | null;
  rewardType: string | null;
  expirationDate: string | null;
};

export interface YourRewardsScreenProps extends NavigationScreenProps {}

export const YourRewardsScreen: React.FC<YourRewardsScreenProps> = (props) => {
  const [selectedTab, selectTabBar] = useState(1);
  const [totalReward, setTotalReward] = useState<number>(0);
  const [rewardType, setRewardType] = useState('');
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const [pendingRefreeList, setPendingRefreeList] = useState<PendingUserList[]>([]);
  const [claimedRefreeList, setClaimedRefreeList] = useState<ClaimedUserList[]>([]);
  const [initialRefreeData, setInitialRefreeData] = useState<RefreeInitialData>({
    registrationDate: null,
    name: null,
    rewardValue: null,
    rewardType: null,
    expirationDate: null,
  });
  const client = useApolloClient();
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const { referrerLink } = useReferralProgram();
  const { pharmacyCircleAttributes } = useShoppingCart();

  const { navigation } = props;

  useEffect(() => {
    getAllRefreeRecord();
  }, []);

  const onWhatsAppShare = () => {
    const shareOptions = {
      title: string.referAndEarn.referalLink,
      url: referrerLink,
      message: string.referAndEarn.shareLinkText,
      failOnCancel: false,
      showAppsToView: true,
      social: Share.Social.WHATSAPP,
    };
    Share.shareSingle(shareOptions)
      .then(() => {
        const eventArributes = {
          ...getReferEarnCommonAttributes(),
          'Nav src': 'Whatsapp',
        };
        postCleverTapEvent(CleverTapEventName.REFER_EARN_CTA_CLICKED, {
          ...eventArributes,
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const getReferEarnCommonAttributes = () => {
    return {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      User_Type: getUserType(allCurrentPatients),
      'Circle Member':
        getCleverTapCircleMemberValues(pharmacyCircleAttributes?.['Circle Membership Added']!) ||
        undefined,
      'Page name': 'Your Reward page',
    };
  };

  const getRequiredDateFormat = (date: string | null) => {
    if (date != null) {
      let d = new Date(date);
      return `${d.getDate()} ${LocalStrings.monthsName[d.getMonth()]}, ${d.getFullYear()}`;
    } else {
      return '';
    }
  };
  const getExpirationDate = (regisetrationDate: any) => {
    let date = new Date(`${regisetrationDate}`);
    date.setDate(date.getDate() + 30);
    return getRequiredDateFormat(`${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`);
  };

  const getAllRefreeRecord = async () => {
    try {
      const response = await client.query({
        query: GET_HC_REFREE_RECORD,
        variables: { id: g(currentPatient, 'id') },
        fetchPolicy: 'no-cache',
      });
      const { data } = response;
      if (data?.getReferralRewardDetails) {
        setPendingRefreeList(data?.getReferralRewardDetails?.pending);
        setTotalReward(data?.getReferralRewardDetails?.totalRewardValue);
        setRewardType(data?.getReferralRewardDetails?.rewardType);
        setClaimedRefreeList(data?.getReferralRewardDetails?.claimed);
        try {
          updateUserProfileWithReferrInformation(
            data?.getReferralRewardDetails?.claimed.length +
              data?.getReferralRewardDetails?.pending.length
          );
        } catch (e) {}

        setInitialRefreeData({
          name: data?.getReferralRewardDetails?.referee?.name,
          registrationDate: data?.getReferralRewardDetails?.referee?.registrationDate,
          rewardType: data?.getReferralRewardDetails?.referee?.rewardType,
          rewardValue: data?.getReferralRewardDetails?.referee?.rewardValue,
          expirationDate: getExpirationDate(
            data?.getReferralRewardDetails?.referee?.registrationDate
          ),
        });
        setshowSpinner(false);
      }
    } catch (error) {
      CommonBugFender('ShareReferralLink_generatingCampaignId', error);
    }
  };
  const ClaimedCard = () => {
    return initialRefreeData.name != null ? (
      <View style={styles.healthCreditcontainer}>
        <View style={styles.healthCreditLeftcontainer}>
          <ReferCheckIcon />
        </View>
        <View>
          <View style={styles.healthCreditRightInnercontainer}>
            <Text style={styles.healthCreditrefreeName}>{initialRefreeData.name}</Text>
            <Text style={styles.healthCreditexporationText}>
              {initialRefreeData.expirationDate}
            </Text>
          </View>

          <View style={styles.healthCreditflexRow}>
            <View style={styles.healthCreditclaimedRightContaier}>
              <Text style={styles.healthCreditsmallHeadingOne}>
                {string.referAndEarn.youEarnedRefreePoints}
              </Text>
              <Text style={styles.healthCreditsmallHeadingTwo}>
                {getRequiredDateFormat(initialRefreeData.registrationDate)}
                {string.referAndEarn.firstTimeLogin}
              </Text>
            </View>
            <View style={styles.healthCredittotalHC}>
              <Text style={styles.healthCreditHC}>
                {initialRefreeData.rewardValue}
                {initialRefreeData.rewardType}
              </Text>
            </View>
          </View>
        </View>
      </View>
    ) : (
      <View />
    );
  };

  const renderClaimedCardWithExpirationSet = (item: any) => {
    return item.hasOwnProperty('expirationDate') ? (
      <ClaimedCard />
    ) : (
      <View style={styles.healthCreditcontainer}>
        <View style={styles.healthCreditLeftcontainer}>
          <ReferCheckIcon />
        </View>
        <View>
          <View style={styles.healthCreditRightInnercontainer}>
            <Text style={styles.healthCreditrefreeName}>{item.name}</Text>
            <Text style={styles.healthCreditexporationText}>
              {getRequiredDateFormat(item.expiryDate)}
            </Text>
          </View>
          <View style={styles.healthCreditflexRow}>
            <View style={styles.healthCreditclaimedRightContaier}>
              <Text style={styles.healthCreditsmallHeadingOne}>
                {getRequiredDateFormat(item.txnDate)}
              </Text>
            </View>
            <View style={styles.healthCredittotalHC}>
              <Text style={styles.healthCreditHC}>
                {item.rewardValue}
                {item.rewardType}
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
                  signedUpDate: getRequiredDateFormat(item.registrationDate),
                })}
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
          <Text style={styles.NoReferralsubHeading}>{string.referAndEarn.youHaveNotInvited}</Text>
          <TouchableOpacity
            onPress={() => {
              onWhatsAppShare();
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
        <FlatList
          data={[...claimedRefreeList, { ...initialRefreeData }]}
          renderItem={({ item }) => renderClaimedCardWithExpirationSet(item)}
          style={{
            display:
              claimedRefreeList.length == 0 && initialRefreeData.name == null ? 'none' : 'flex',
          }}
        />
        {claimedRefreeList.length == 0 && initialRefreeData.name == null && noReferralReward()}
      </View>
    );
  };
  const renderPendingSection = () => {
    return (
      <View style={styles.pendingSectionMain}>
        {pendingRefreeList.length > 0 && (
          <FlatList data={pendingRefreeList} renderItem={({ item }) => renderPendingCards(item)} />
        )}
        {pendingRefreeList.length == 0 && noReferralReward()}
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
              currencyType: rewardType,
              earnedPoints: totalReward.toString(),
            })}
          </Text>
          <View style={styles.totalHCrefresh}>
            <TouchableOpacity
              onPress={() => {
                setshowSpinner(true);
                getAllRefreeRecord();
              }}
            >
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
      {showSpinner && <Spinner spinnerProps={{ size: 'large' }} />}
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
    fontWeight: '700',
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
  pendingSectionMain: {
    flex: 1,
  },
});
