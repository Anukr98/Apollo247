import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { ArrowRight, ReferralBannerIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { NavigationScreenProps } from 'react-navigation';
import {
  g,
  getCleverTapCircleMemberValues,
  getUserType,
  postCleverTapEvent,
} from '../../helpers/helperFunctions';
import moment from 'moment';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';

export interface ReferralBannerProps extends NavigationScreenProps {
  redirectOnShareReferrer: () => void;
  screenName: string;
}

export const ReferralBanner: React.FC<ReferralBannerProps> = (props) => {
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const { pharmacyCircleAttributes } = useShoppingCart();

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
      'Page name': props.screenName,
      'Nav src': props.screenName,
    };
  };

  return (
    <TouchableOpacity
      style={styles.referEarnMainContainer}
      onPress={() => {
        const eventArributes = {
          ...getReferEarnCommonAttributes(),
        };
        postCleverTapEvent(CleverTapEventName.REFER_EARN_CTA_CLICKED, {
          ...eventArributes,
        });
        props.redirectOnShareReferrer();
      }}
    >
      <View style={styles.referEarnImageContainer}>
        <ReferralBannerIcon style={styles.referrelBannerImage} resizeMode={'contain'} />
      </View>
      <View style={styles.referEarntextMainContainer}>
        <View style={styles.referEarntextContainer}>
          <Text style={styles.referEarntext}>
            {string.referAndEarn.referAndEarn}{' '}
            {string.referAndEarn.currency + string.referAndEarn.referrHC}
          </Text>
          <Text style={styles.referEarntextLine2}>{string.referAndEarn.referAndEarnLine2}</Text>
        </View>
        <View style={styles.referEarnearnBtn}>
          <ArrowRight
            style={{
              width: 35,
              height: 35,
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  referEarnEarnBtnText: {
    fontSize: 14,
    color: theme.colors.HEX_WHITE,
    fontWeight: '700',
  },

  referEarnearnBtn: {},

  referEarnrupees: {
    fontSize: 19,
    fontWeight: 'bold',
    color: theme.colors.APP_REFERRAL_BLUE,
    fontStyle: 'italic',
  },
  referEarntext: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.CARD_DESCRIPTION,
  },
  referEarntextLine2: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.CARD_HEADER,
  },
  referEarntextMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  referEarntextContainer: {
    marginTop: -10,
  },
  referEarnImageContainer: {
    width: 100,
    justifyContent: 'flex-end',
  },
  referrelBannerImage: {
    width: '100%',
    marginBottom: -10,
  },
  referEarnMainContainer: {
    backgroundColor: theme.colors.REFERRAL_WHITE_GRAY,
    paddingHorizontal: 20,
    paddingTop: 10,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.colors.REFERRAL_BORDER_GRAY,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
