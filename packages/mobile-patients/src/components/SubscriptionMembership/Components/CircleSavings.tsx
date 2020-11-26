import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  DownOrange,
  UpOrange,
  CircleLogo,
  HealthLogo,
  DoctorIcon,
  EmergencyCall,
  ExpressDelivery,
  OneApolloLogo,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import moment from 'moment';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

export interface CircleSavingsProps extends NavigationScreenProps {}

export const CircleSavings: React.FC<CircleSavingsProps> = (props) => {
  const { circleSubscription, totalCircleSavings } = useAppCommonData();

  const renderCircleExpiryBanner = () => {
    return (
      <View style={styles.expiryBanner}>
        <CircleLogo style={styles.circleLogo} />
        <Text style={theme.viewStyles.text('SB', 14, '#01475B', 1, 28, 0.35)}>
          Membership expires on {moment(circleSubscription?.endDate).format('DD/MM/YYYY')}
        </Text>
      </View>
    );
  };

  const renderCircleSavings = () => {
    const totalSavingsDone = totalCircleSavings?.totalSavings + totalCircleSavings?.callsUsed;
    return totalSavingsDone ? (
      <View
        style={{
          backgroundColor: 'rgba(0, 179, 142, 0.1)',
          padding: 15,
          alignItems: 'center',
        }}
      >
        <Text style={theme.viewStyles.text('M', 16, '#02475B', 1, 28, 0.35)}>
          Total Savings Using Circle Plan{'  '}
          <Text style={theme.viewStyles.text('SB', 19, '#00B38E', 1, 28, 0.35)}>
            {strings.common.Rs}
            {totalCircleSavings?.totalSavings || 0}
          </Text>
        </Text>
        {renderSavingsCard()}
      </View>
    ) : (
      renderSaveFromCircle()
    );
  };

  const renderSaveFromCircle = () => {
    return (
      <View>
        <View
          style={[styles.expiryBanner, { justifyContent: 'flex-start', paddingHorizontal: 20 }]}
        >
          <View style={styles.saveCircleContainer}>
            <DoctorIcon style={styles.doctorIcon} />
          </View>
          <View style={{ marginLeft: 20 }}>
            <Text style={theme.viewStyles.text('M', 16, '#01475B', 1, 24, 0.35)}>
              UNLIMITED Doctor Consult
            </Text>
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate(AppRoutes.DoctorSearch);
              }}
            >
              <Text style={theme.viewStyles.text('SB', 16, '#FC9916', 1, 24, 0.35)}>
                BOOK APPOINTMENT
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={[styles.expiryBanner, { justifyContent: 'flex-start', paddingHorizontal: 20 }]}
        >
          <View style={styles.saveCircleContainer}>
            <HealthLogo style={styles.doctorIcon} />
          </View>
          <View style={{ marginLeft: 20 }}>
            <Text style={theme.viewStyles.text('M', 16, '#01475B', 1, 24, 0.35)}>
              Get 20% Cashback on Medicines
            </Text>
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate('MEDICINES');
              }}
            >
              <Text style={theme.viewStyles.text('SB', 16, '#FC9916', 1, 24, 0.35)}>
                ORDER MEDICINES
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderSavingsCard = () => {
    return (
      <View style={styles.savingsCard}>
        <View
          style={{
            ...styles.savingsContainer,
            marginTop: 0,
          }}
        >
          <View style={styles.savingsRow}>
            <HealthLogo style={styles.savingsIcon} />
            <Text style={styles.savingsHeading}>Total Savings on Pharmacy</Text>
          </View>
          <Text style={styles.savingsAmount}>
            {strings.common.Rs}
            {totalCircleSavings?.pharmaSavings || 0}
          </Text>
        </View>
        <View style={styles.savingsContainer}>
          <View style={styles.savingsRow}>
            <DoctorIcon style={styles.savingsIcon} />
            <Text style={styles.savingsHeading}>Total Savings on Doctor Consult</Text>
          </View>
          <Text style={styles.savingsAmount}>
            {strings.common.Rs}
            {totalCircleSavings?.consultSavings || 0}
          </Text>
        </View>
        <View style={styles.savingsContainer}>
          <View style={styles.savingsRow}>
            <EmergencyCall style={styles.savingsIcon} />
            <Text style={styles.savingsHeading}>Free Emergency Calls Made</Text>
          </View>
          <Text style={styles.savingsAmount}>
            {totalCircleSavings?.callsUsed || 0}/{totalCircleSavings?.callsTotal || 0}
          </Text>
        </View>
        <View style={styles.savingsContainer}>
          <View style={styles.savingsRow}>
            <ExpressDelivery style={styles.savingsIcon} />
            <Text style={styles.savingsHeading}>Total Delivery Charges Saved</Text>
          </View>
          <Text style={styles.savingsAmount}>
            {strings.common.Rs}
            {totalCircleSavings?.deliverySavings || 0}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View>
      {renderCircleExpiryBanner()}
      {renderCircleSavings()}
    </View>
  );
};

const styles = StyleSheet.create({
  circleLogo: {
    resizeMode: 'contain',
    width: 50,
    height: 30,
  },
  expiryBanner: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
  },
  savingsCard: {
    ...theme.viewStyles.cardViewStyle,
    padding: 20,
    margin: 10,
    width: '100%',
  },
  savingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  savingsHeading: {
    ...theme.viewStyles.text('M', 15, '#02475B', 1, 24, 0.35),
    marginLeft: 10,
  },
  savingsAmount: {
    ...theme.viewStyles.text('SB', 17, '#00B38E', 1, 24, 0.35),
  },
  savingsIcon: {
    resizeMode: 'contain',
    width: 25,
    height: 25,
  },
  saveCircleContainer: {
    ...theme.viewStyles.cardViewStyle,
    padding: 10,
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
  },
  doctorIcon: {
    resizeMode: 'contain',
    width: 30,
    height: 30,
  },
});
