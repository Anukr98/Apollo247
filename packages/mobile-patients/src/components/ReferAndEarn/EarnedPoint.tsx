import React, { useState } from 'react';
import { View, Text, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { FlatList, NavigationScreenProps, SafeAreaView, ScrollView } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  ConsultDoctorIcon,
  FastDeliveryIcon,
  LabTestAtHomeIcon,
  TrophyIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  g,
  getCleverTapCircleMemberValues,
  getUserType,
  postCleverTapEvent,
  replaceVariableInString,
  validateStringNotToUndefined,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import moment from 'moment';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { useReferralProgram } from '../ReferralProgramProvider';

export interface EarnedPointsProps extends NavigationScreenProps {}

export const EarnedPoints: React.FC<EarnedPointsProps> = (props) => {
  const { navigation } = props;
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const { pharmacyCircleAttributes } = useShoppingCart();
  const { referralGlobalData, congratulationPageData } = useReferralProgram();

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
      'Page name': 'Congratulations Page',
    };
  };

  const renderYourGifterReward = () => {
    return (
      <View style={styles.earnPointsMainContainer}>
        <Text style={styles.earnPointmainHeading}>
          {validateStringNotToUndefined(congratulationPageData?.congratulations)}
        </Text>
        <View style={styles.earnPointtrophyMainContainer}>
          <View style={styles.earnPointtrophy_container}>
            <TrophyIcon />
          </View>
        </View>
        <View style={styles.earnPointotherTextContainer}>
          <Text style={styles.earnPointgiftedHeading}>
            {validateStringNotToUndefined(congratulationPageData?.yourFriendGiftYou)}
          </Text>
          <Text style={styles.earnPointtotalGifted}>
            {replaceVariableInString(congratulationPageData?.referrerAmountAndCurrencyName, {
              earnedAmount: referralGlobalData?.refereeInitialsEarnAmount || '',
              currencyName: referralGlobalData?.currencyName || '',
            })}
          </Text>
          <Text style={styles.earnPointtotalWillGetInSomeMinute}>
            {validateStringNotToUndefined(congratulationPageData?.willBeCreditSoon)}
          </Text>
          <TouchableOpacity
            onPress={() => {
              const eventArributes = {
                ...getReferEarnCommonAttributes(),
                'Nav src': 'Congratulations Page',
              };
              postCleverTapEvent(CleverTapEventName.REFERRAL_TNC_FAQ_CLICKED, {
                ...eventArributes,
              });
              navigation.navigate('RefererTermsAndCondition');
            }}
          >
            <Text
              style={[
                styles.earnPointtotalWillGetInSomeMinute,
                styles.earnPointtotalSubjectedToTnc,
              ]}
            >
              {validateStringNotToUndefined(congratulationPageData?.subjectedToTnC)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.earnPointreedemBtn}
            onPress={() => {
              navigation.navigate('MEDICINES');
            }}
          >
            <Text style={styles.earnPointreedemBtnText}>
              {validateStringNotToUndefined(congratulationPageData?.redeemPoints)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTnCData = (item: any) => {
    return (
      <View style={styles.earnPointTncContainer}>
        <View style={styles.earnTncDot} />
        <Text style={styles.earnTncText}>{item.data}</Text>
      </View>
    );
  };

  const renderWhyChooseUsSection = () => {
    return (
      <View style={styles.earnPointwhyChooseApolloContainer}>
        <Text style={styles.earnPointWhyChooseUstitle}>
          {validateStringNotToUndefined(congratulationPageData?.tncHeading)}
        </Text>
        <View style={styles.earnPointWhyChooseUsimageTextContainer}>
          <FlatList
            data={congratulationPageData?.termsAndCondition || []}
            renderItem={({ item }) => renderTnCData(item)}
            keyExtractor={(item) => item.id.toString()}
            style={{
              paddingHorizontal: 30,
            }}
          />
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
          title="Refer & Earn"
          onPressLeftIcon={() => navigation.replace('HomeScreen')}
          container={{
            borderColor: 'transparent',
          }}
          titleStyle={{
            fontSize: 18,
          }}
        />
        <ScrollView>
          {renderYourGifterReward()}
          {renderWhyChooseUsSection()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.LIGHT_GREEN_ONE,
  },
  earnPointWhyChooseUsimgTitle: {
    textAlign: 'center',
    marginTop: 15,
    color: theme.colors.LIGHT_BLUE,
    fontSize: 12,
    fontWeight: '600',
    width: 90,
  },
  earnPointWhyChooseUsimg_container: {
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.HEX_WHITE,
    borderRadius: 30,
    padding: 5,
  },
  earnPointWhyChooseUsimageTextSubContainer: {
    width: 100,
    alignItems: 'center',
  },
  earnPointWhyChooseUsimageTextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 30,
  },
  earnPointWhyChooseUstitle: {
    marginTop: 20,
    fontSize: 18,
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '600',
  },
  earnPointwhyChooseApolloContainer: {
    backgroundColor: theme.colors.LIGHT_GREEN_ONE,
    alignItems: 'center',
    paddingVertical: 10,
  },
  earnPointreedemBtnText: {
    color: theme.colors.HEX_WHITE,
    fontWeight: '700',
  },
  earnPointreedemBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.TANGERINE_YELLOW,
    width: 200,
    height: 40,
    marginTop: 20,
    borderRadius: 5,
  },
  earnPointtotalGifted: {
    marginTop: 5,
    fontSize: 20,
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '700',
  },
  earnPointtotalWillGetInSomeMinute: {
    marginTop: 5,
    fontSize: 13,
    textAlign: 'center',
    color: theme.colors.GRAY,
  },
  earnPointtotalSubjectedToTnc: {
    marginTop: 0,
    textDecorationLine: 'underline',
  },
  earnPointgiftedHeading: {
    marginTop: 20,
    fontSize: 20,
    color: theme.colors.LIGHT_BLUE,
  },
  earnPointotherTextContainer: {
    alignItems: 'center',
  },
  earnPointtrophy_container: {
    backgroundColor: theme.colors.LIGHT_BLUE_TWO,
    borderRadius: 100,
    padding: 9,
  },
  earnPointtrophyMainContainer: {
    marginTop: 30,
  },
  earnPointmainHeading: {
    fontSize: 22,
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '600',
  },
  earnPointsMainContainer: {
    backgroundColor: theme.colors.HEX_WHITE,
    marginVertical: 2,
    alignItems: 'center',
    paddingVertical: 25,
    flex: 1.9,
  },
  earnPointTncContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  earnTncDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.LIGHT_BLUE,
    marginRight: 10,
    marginTop: 10,
  },
  earnTncText: {
    color: theme.colors.LIGHT_BLUE,
  },
});
