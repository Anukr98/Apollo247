import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { 
  HelpIcon, 
  EllipseBulletPoint, 
  HdfcGoldMedal, 
  HdfcPlatinumMedal,
  HdfcSilverMedal,
  LockIcon,
  HdfcBankLogoSmall,
} from '../ui/Icons';
import { useAppCommonData, PlanBenefits } from '../AppCommonDataProvider';
import { g } from '../../helpers/helperFunctions';
import { AvailNowPopup } from './AvailNowPopup';
import { Spinner } from '../ui/Spinner';
import string from '@aph/mobile-patients/src/strings/strings.json';

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    marginVertical: 4,
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 20,
    color: theme.colors.SHERPA_BLUE,
  },
  ellipseBullet: {
    resizeMode: 'contain',
    width: 10,
    height: 10,
    alignSelf: 'center',
    marginRight: 10,
  },
  ellipseBulletContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  membershipCardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  planName: {
    ...theme.viewStyles.text('B', 14, '#00B38E', 1, 20, 0.35), 
    marginRight: 10
  },
  medalIcon: {
    width: 30,
    height: 35,
    position: 'absolute',
    right: 16,
    top: 20,
  },
  lockIcon: {
    resizeMode: 'contain',
    width: 25,
    height: 25,
    position: 'absolute',
    right: 16,
    top: 20,
  },
  subTextContainer: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  viewMoreText: {
    ...theme.viewStyles.text('B', 12, '#00B38E', 1, 20, 0.35),
    position: 'absolute',
    bottom: 16,
    right: 20,
  },
  membershipButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#FC9916',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  helpIconStyle: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
  },
  headerContainer: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    marginBottom: 20,
  }
});

export interface MyMembershipProps extends NavigationScreenProps {}

export const MyMembership: React.FC<MyMembershipProps> = (props) => {
  const { hdfcUserSubscriptions } = useAppCommonData();
  const showSubscriptions = !!(hdfcUserSubscriptions && hdfcUserSubscriptions.name);
  const canUpgrade = !!g(hdfcUserSubscriptions, 'canUpgradeTo', 'name');
  const minTransactionToUpgrade = canUpgrade ? g(hdfcUserSubscriptions, 'canUpgradeTo', 'minTransactionValue') : 0;
  const isActive = !!(hdfcUserSubscriptions && hdfcUserSubscriptions.isActive);
  const [showAvailPopup, setShowAvailPopup] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const hdfc_values = string.Hdfc_values;

  useEffect(() => {
    if (hdfcUserSubscriptions && g(hdfcUserSubscriptions, '_id')) {
      setshowSpinner(false);
    }
  }, [hdfcUserSubscriptions]);

  const getEllipseBulletPoint = (text: string, index: number) => {
    return (
      <View style={[styles.ellipseBulletContainer, index === 2 ? {width: '80%'} : {}]}>
        <EllipseBulletPoint style={styles.ellipseBullet} />
        <Text style={theme.viewStyles.text('B', 13, '#007C9D', 1, 20, 0.35)}>{text}</Text>
      </View>
    );
  };

  const renderCardBody = (benefits: PlanBenefits[], subscriptionName: string) => {
    return (
      <View style={styles.subTextContainer}>
        <Text style={[theme.viewStyles.text('R', 12, '#000000', 1, 20, 0.35), {marginBottom: 5}]}>
          'Benefits Available'
        </Text>
        {
          benefits.slice(0, 3).map((value, index) => {
            return getEllipseBulletPoint(value.headerContent, index)
          })
        }
        <Text 
          onPress={() => {
            props.navigation.navigate(AppRoutes.MembershipDetails, {
              membershipType: subscriptionName,
              isActive: isActive,
            });
          }}
          style={styles.viewMoreText}
        >
          VIEW MORE
        </Text>
      </View>
    );
  };

  const renderBottomButtons = (isActive: boolean, subscriptionName: string, isCanUpgradeToPlan: boolean) => {
    const buttonText = isCanUpgradeToPlan ? 'AVAIL NOW' : (isActive ? 'EXPLORE NOW' : 'ACTIVATE NOW');
    return (
      <View style={styles.membershipButtons}>
        <TouchableOpacity 
        style={{ padding: 10 }}
          onPress={() => {
            props.navigation.navigate(AppRoutes.MembershipDetails, {
              membershipType: subscriptionName,
              isActive: isActive,
            });
          }}
        >
          <Text style={theme.viewStyles.text('B', 12, '#FFFFFF', 1, 20, 0.35)}>
            VIEW DETAILS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ padding: 10 }}
          onPress={() => {
            if (isCanUpgradeToPlan) {
              setShowAvailPopup(true);
            } else {
              props.navigation.navigate(AppRoutes.ConsultRoom, {});
            }
          }}
        >
          <Text style={theme.viewStyles.text('B', 12, '#FFFFFF', 1, 20, 0.35)}>
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMembershipCard = (subscription: any, isCanUpgradeToPlan: boolean) => {
    const isSilver = subscription!.name === hdfc_values.SILVER_PLAN;
    const isGold = subscription!.name === hdfc_values.GOLD_PLAN;
    const isPlatinum = subscription!.name === hdfc_values.PLATINUM_PLAN;
    return (
      <View style={styles.cardStyle}>
        <View style={styles.membershipCardContainer}>
          <HdfcBankLogoSmall 
            style={{
              width: 20,
              height: 20,
              marginRight: 10,
            }} 
          />
          <Text style={styles.planName}>
            {subscription!.name}
          </Text>
          {
            isCanUpgradeToPlan ? (
              <LockIcon style={styles.lockIcon} />
            ) : (
              <>
              {isGold && <HdfcGoldMedal style={styles.medalIcon} />}
              {isPlatinum && <HdfcPlatinumMedal style={styles.medalIcon} />}
              {isSilver && <HdfcSilverMedal style={styles.medalIcon} />}
              </>
            )
          }
        </View>
        {renderCardBody(subscription!.benefits, subscription!.name)}
        {renderBottomButtons(subscription!.isActive, subscription!.name, isCanUpgradeToPlan)}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          rightComponent={<HelpIcon style={styles.helpIconStyle} />}
          title={'MY MEMBERSHIP'}
          container={styles.headerContainer}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        {
          showSubscriptions && 
          <ScrollView bounces={false}>
            {renderMembershipCard(hdfcUserSubscriptions, false)}
            {
              canUpgrade &&
              <View>
                <Text style={{
                  ...theme.viewStyles.text('B', 14, '#02475B', 1, 20, 0.35),
                  paddingTop: 20,
                  paddingLeft: 20,
                  paddingBottom: 10,
                }}>
                  OTHER PLANS
                </Text>
                {renderMembershipCard(hdfcUserSubscriptions!.canUpgradeTo, true)}
              </View>
            }
          </ScrollView>
        }
        {
          showAvailPopup && 
          <AvailNowPopup 
            onClose={() => setShowAvailPopup(false)} 
            transactionAmount={minTransactionToUpgrade} 
            navigation={props.navigation}
          />
        }
        {showSpinner && <Spinner />}
      </SafeAreaView>
    </View>
  );
};
