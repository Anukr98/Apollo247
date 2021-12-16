import React, { createContext, useState, useContext } from 'react';

export type InitiateRefreeType = {
  isRefree: null | boolean;
  rewardValue: null | number;
  rewardExpirationDate: string | null;
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
});

export const ReferralProgramProvider: React.FC = (props) => {
  const [rewardId, setRewardId] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [referrerLink, setReferrerLink] = useState('');
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
      }}
    >
      {props.children}
    </ReferralProgramContext.Provider>
  );
};

export const useReferralProgram = () =>
  useContext<ReferralProgramContextProps>(ReferralProgramContext);
