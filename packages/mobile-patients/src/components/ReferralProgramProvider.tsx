import React, { createContext, useState, useContext } from 'react';

export type InitiateRefreeType = {
  isRefree: null | boolean;
  rewardValue: null | number;
  rewardExpirationDate: string | null;
};

type ReferralGlobalDataType = {
  refereeInitialsEarnAmount: string;
  currency: string;
  currencyName: string;
  validUptoPurchase: string;
  shareLinkMessage: string;
};
type ReferralMainBannerDataType = {
  bannerTextLineOne: string;
  bannerTextLineTwo: string;
  referralBannerImageURL: string;
};
type ShareReferrerLinkDataType = {
  banerTextLineOne: string;
  banerTextLineThree: string;
  referViaText: string;
  howItWorks: {
    mainHeading: string;
    pointOne: string;
    pointTwo: string;
    pointThree: string;
    pointThreeNote: string;
  };
  termsAndCondition: string;
  faqs: string;
  checkReward: string;
  redeemNow: string;
};

type YourRewardsScreenDataType = {
  totalEarningHeading: string;
  claimedCard: {
    eligible: {
      youEarnedRefreePoints: string;
      firstTimeLogin: string;
    };
    notEligible: {
      useYourFirstTnc: string;
      firstThreeMedecineTransition: string;
    };
  };
  pendingCard: {
    signedUpPurchasePending: string;
    notEligibleForRewardMaxLimitReadched: string;
  };
  noReferralReward: {
    mainHeading: string;
    subHeading: string;
    buttonText: string;
  };
  tabBarMenuName: {
    menuOne: string;
    menuTwo: string;
  };
};

type CongratulationPageDataType = {
  congratulations: string;
  yourFriendGiftYou: string;
  referrerAmountAndCurrencyName: string;
  willBeCreditSoon: string;
  subjectedToTnC: string;
  redeemPoints: string;
  whyChooseApollo247: string;
  deleiveryInHours: string;
  consultDoctorIn15Minutes: string;
  labTestAtHome: string;
};

type RefererTermsAndConditionDataType = {
  id: number | string;
  condition: string;
};

type RefererFAQsDataType = {
  id: number | string;
  question: string;
  answer: string;
};

export interface ReferralProgramContextProps {
  setRewardId: ((rewardId: string) => void) | null;
  rewardId: string;
  setCampaignId: ((campaginId: string) => void) | null;
  setCampaignName: ((campaginName: string) => void) | null;
  campaignName: string;
  campaignId: string;
  referrerLink: string;
  setReferrerLink: ((referrerLink: string) => void) | null;
  refreeReward: InitiateRefreeType;
  setRefreeReward: ((refreeReward: InitiateRefreeType) => void) | null;
  referralGlobalData: ReferralGlobalDataType | null;
  setReferralGlobalData: ((data: ReferralGlobalDataType) => void) | null;
  referralMainBanner: ReferralMainBannerDataType | null;
  setReferralMainBanner: ((data: ReferralMainBannerDataType) => void) | null;

  shareReferrerLinkData: ShareReferrerLinkDataType | null;
  setShareReferrerLinkData: ((data: ShareReferrerLinkDataType) => void) | null;

  yourRewardsScreenData: YourRewardsScreenDataType | null;
  setYourRewardsScreenData: ((data: YourRewardsScreenDataType) => void) | null;

  congratulationPageData: CongratulationPageDataType | null;
  setCongratulationPageData: ((data: CongratulationPageDataType) => void) | null;

  refererTermsAndConditionData: RefererTermsAndConditionDataType[] | null;
  setRefererTermsAndConditionData: ((data: RefererTermsAndConditionDataType[]) => void) | null;

  refererFAQsData: RefererFAQsDataType[] | null;
  setRefererFAQsData: ((data: RefererFAQsDataType[]) => void) | null;
}
export const ReferralProgramContext = createContext<ReferralProgramContextProps>({
  setRewardId: null,
  rewardId: '',
  campaignId: '',
  campaignName: '',
  setCampaignId: null,
  setCampaignName: null,
  referrerLink: '',
  setReferrerLink: null,
  refreeReward: {
    isRefree: false,
    rewardValue: 0,
    rewardExpirationDate: '',
  },
  setRefreeReward: null,
  referralGlobalData: null,
  setReferralGlobalData: null,
  referralMainBanner: null,
  setReferralMainBanner: null,
  shareReferrerLinkData: null,
  setShareReferrerLinkData: null,
  yourRewardsScreenData: null,
  setYourRewardsScreenData: null,
  congratulationPageData: null,
  setCongratulationPageData: null,
  refererTermsAndConditionData: null,
  setRefererTermsAndConditionData: null,
  refererFAQsData: null,
  setRefererFAQsData: null,
});

export const ReferralProgramProvider: React.FC = (props) => {
  const [rewardId, setRewardId] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [referrerLink, setReferrerLink] = useState('');

  const [referralGlobalData, setReferralGlobalData] = useState<ReferralGlobalDataType | null>(null);
  const [referralMainBanner, setReferralMainBanner] = useState<ReferralMainBannerDataType | null>(
    null
  );
  const [
    shareReferrerLinkData,
    setShareReferrerLinkData,
  ] = useState<ShareReferrerLinkDataType | null>(null);
  const [
    yourRewardsScreenData,
    setYourRewardsScreenData,
  ] = useState<YourRewardsScreenDataType | null>(null);
  const [
    congratulationPageData,
    setCongratulationPageData,
  ] = useState<CongratulationPageDataType | null>(null);
  const [refererTermsAndConditionData, setRefererTermsAndConditionData] = useState<
    RefererTermsAndConditionDataType[] | null
  >(null);
  const [refererFAQsData, setRefererFAQsData] = useState<RefererFAQsDataType[] | null>(null);

  const [refreeReward, setRefreeReward] = useState<InitiateRefreeType>({
    isRefree: false,
    rewardValue: 0,
    rewardExpirationDate: '',
  });

  return (
    <ReferralProgramContext.Provider
      value={{
        setRewardId,
        rewardId,
        campaignId,
        campaignName,
        setCampaignId,
        setCampaignName,
        referrerLink,
        setReferrerLink,
        refreeReward,
        setRefreeReward,
        referralGlobalData,
        setReferralGlobalData,
        referralMainBanner,
        setReferralMainBanner,
        shareReferrerLinkData,
        setShareReferrerLinkData,
        yourRewardsScreenData,
        setYourRewardsScreenData,
        congratulationPageData,
        setCongratulationPageData,
        refererTermsAndConditionData,
        setRefererTermsAndConditionData,
        refererFAQsData,
        setRefererFAQsData,
      }}
    >
      {props.children}
    </ReferralProgramContext.Provider>
  );
};

export const useReferralProgram = () =>
  useContext<ReferralProgramContextProps>(ReferralProgramContext);
