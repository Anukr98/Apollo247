import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { HelpIcon, EllipseBulletPoint, HdfcGoldMedal, LockIcon } from '../ui/Icons';
import { AvailSubscriptionPopup } from './AvailSubscriptionPopup';

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
});

export interface MyMembershipProps extends NavigationScreenProps {}

export const MyMembership: React.FC<MyMembershipProps> = (props) => {
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const [showAvailPopup, setshowAvailPopup] = useState<boolean>(false);

  const getEllipseBulletPoint = (text: string) => {
    return (
      <View style={{flexDirection: 'row', marginBottom: 5}}>
        <EllipseBulletPoint style={{
          resizeMode: 'contain',
          width: 10,
          height: 10,
          alignSelf: 'center',
          marginRight: 10,
        }} />
        <Text style={theme.viewStyles.text('B', 13, '#007C9D', 1, 20, 0.35)}>{text}</Text>
      </View>
    );
  };

  const renderMembershipCard = (planType: string) => {
    const isGold = planType === 'gold';
    return (
      <View style={styles.cardStyle}>
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingTop: 16,
        }}>
          <Text style={[
            theme.viewStyles.text('B', 13, '#00B38E', 1, 20, 0.35), 
            {marginRight: 10}
          ]}>
            {isGold ? 'GOLD+ PLAN' : 'PLATINUM+ PLAN'}
          </Text>
          {
            isGold ?
            <>
              <Text style={theme.viewStyles.text('LI', 12, '#01475B', 1, 20, 0.35)}>
                Includes all benefits of Silver Plan
              </Text>
              <HdfcGoldMedal style={{
                width: 30,
                height: 35,
                position: 'absolute',
                right: 16,
                top: 20,
              }} />
            </> : 
            <LockIcon style={{
              resizeMode: 'contain',
              width: 25,
              height: 25,
              position: 'absolute',
              right: 16,
              top: 20,
            }} />
          }

        </View>
        <View style={{
          marginTop: 10,
          paddingHorizontal: 16,
          paddingBottom: 10,
        }}>
          <Text style={[theme.viewStyles.text('R', 12, '#000000', 1, 20, 0.35), {marginBottom: 5}]}>
            {isGold ? 'Benefits Available' : 'Key Benefits you get ..'}
          </Text>
          {getEllipseBulletPoint('24*7 Doctor on Call')}
          {getEllipseBulletPoint('Seamless Medicine Delivery')}
          {getEllipseBulletPoint('Patients Health Record')}
          <Text 
            onPress={() => {
              props.navigation.navigate(AppRoutes.MembershipDetails, {
                membershipType: planType,
              });
            }}
            style={{
              ...theme.viewStyles.text('B', 12, '#00B38E', 1, 20, 0.35),
              position: 'absolute',
              bottom: 16,
              right: 20,
            }}
          >
            VIEW MORE
          </Text>
        </View>
        <View style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          backgroundColor: '#FC9916',
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
        }}>
          <TouchableOpacity 
          style={{
            padding: 10,
          }}
            onPress={() => {
              props.navigation.navigate(AppRoutes.MembershipDetails, {
                membershipType: planType,
              });
            }}
          >
            <Text style={theme.viewStyles.text('B', 12, '#FFFFFF', 1, 20, 0.35)}>
              VIEW DETAILS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{
              padding: 10,
            }}
            onPress={() => {
              props.navigation.navigate(AppRoutes.ConsultRoom, {});
            }}
          >
            <Text style={theme.viewStyles.text('B', 12, '#FFFFFF', 1, 20, 0.35)}>
              EXPLORE NOW
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          rightComponent={<HelpIcon style={{
            resizeMode: 'contain',
            width: 20,
            height: 20,
          }} />}
          title={'MY MEMBERSHIP'}
          container={{
            ...theme.viewStyles.cardViewStyle,
            borderRadius: 0,
            marginBottom: 20,
          }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView bounces={false}>
          {renderMembershipCard('gold')}
          {/* <Text style={{
            ...theme.viewStyles.text('B', 14, '#02475B', 1, 20, 0.35),
            paddingTop: 20,
            paddingLeft: 20,
            paddingBottom: 10,
          }}>
            UPGRADE TO PLATINUM PLANS
          </Text>
          {renderMembershipCard('platinum')} */}
        </ScrollView>
      </SafeAreaView>
      {
        showAvailPopup &&
        <AvailSubscriptionPopup 
          onAvailNow={() => {}} 
          onClose={() => setshowAvailPopup(false)} 
        />
      }
      {showSpinner && <Spinner />}
    </View>
  );
};
