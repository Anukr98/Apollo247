import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { HelpIcon, EllipseBulletPoint, HdfcGoldMedal, LockIcon } from '../ui/Icons';
import { useAppCommonData } from '../AppCommonDataProvider';
import { Hdfc_values } from '@aph/mobile-patients/src/strings/strings.json';

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
    marginBottom: 5,
  },
  membershipCardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  planName: {
    ...theme.viewStyles.text('B', 13, '#00B38E', 1, 20, 0.35), 
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
  const showSubscriptions = !!(hdfcUserSubscriptions && hdfcUserSubscriptions.subscriptionName);
  const isActive = !!(hdfcUserSubscriptions && hdfcUserSubscriptions.is_active);
  const { GoldPoints } = Hdfc_values;

  const getEllipseBulletPoint = (text: string) => {
    return (
      <View style={styles.ellipseBulletContainer}>
        <EllipseBulletPoint style={styles.ellipseBullet} />
        <Text style={theme.viewStyles.text('B', 13, '#007C9D', 1, 20, 0.35)}>{text}</Text>
      </View>
    );
  };

  const renderCardBody = () => {
    return (
      <View style={styles.subTextContainer}>
        <Text style={[theme.viewStyles.text('R', 12, '#000000', 1, 20, 0.35), {marginBottom: 5}]}>
          'Benefits Available'
        </Text>
        {
          GoldPoints.map(value => {
            return getEllipseBulletPoint(value)
          })
        }
        <Text 
          onPress={() => {
            props.navigation.navigate(AppRoutes.MembershipDetails, {
              membershipType: 'gold',
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

  const renderBottomButtons = () => {
    return (
      <View style={styles.membershipButtons}>
        <TouchableOpacity 
        style={{ padding: 10 }}
          onPress={() => {
            props.navigation.navigate(AppRoutes.MembershipDetails, {
              membershipType: 'gold',
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
            props.navigation.navigate(AppRoutes.ConsultRoom, {});
          }}
        >
          <Text style={theme.viewStyles.text('B', 12, '#FFFFFF', 1, 20, 0.35)}>
            EXPLORE NOW
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMembershipCard = (planType: string) => {
    const isGold = true;
    return (
      <View style={styles.cardStyle}>
        <View style={styles.membershipCardContainer}>
          <Text style={styles.planName}>
            {isGold ? 'GOLD+ PLAN' : 'PLATINUM+ PLAN'}
          </Text>
          {
            isGold ?
            <>
              <Text style={theme.viewStyles.text('LI', 12, '#01475B', 1, 20, 0.35)}>
                Includes all benefits of Silver Plan
              </Text>
              <HdfcGoldMedal style={styles.medalIcon} />
            </> : 
            <LockIcon style={styles.lockIcon} />
          }
        </View>
        {renderCardBody()}
        {renderBottomButtons()}
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
          {renderMembershipCard('gold')}
        </ScrollView>
        }
      </SafeAreaView>
    </View>
  );
};
