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

export interface CircleSavingsProps {}

export const CircleSavings: React.FC<CircleSavingsProps> = (props) => {
  const { circleSubscription } = useAppCommonData();

  const renderCircleExpiryBanner = () => {
    return (
      <View style={styles.expiryBanner}>
        <CircleLogo style={styles.circleLogo} />
        <Text style={theme.viewStyles.text('R', 14, '#01475B', 1, 28, 0.35)}>
          Membership expires on {circleSubscription?.endDate}
        </Text>
      </View>
    );
  };

  const renderCircleSavings = () => {
    return (
      <View
        style={{
          backgroundColor: 'rgba(0, 179, 142, 0.1)',
          padding: 15,
          alignItems: 'center',
        }}
      >
        <Text style={theme.viewStyles.text('M', 16, '#02475B', 1, 28, 0.35)}>
          Total Savings Using Circle Plan{'  '}
          <Text style={theme.viewStyles.text('SB', 19, '#00B38E', 1, 28, 0.35)}>₹900</Text>
        </Text>
        {renderSavingsCard()}
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
          <Text style={styles.savingsAmount}>₹500</Text>
        </View>
        <View style={styles.savingsContainer}>
          <View style={styles.savingsRow}>
            <DoctorIcon style={styles.savingsIcon} />
            <Text style={styles.savingsHeading}>Total Savings on Doctor Consult</Text>
          </View>
          <Text style={styles.savingsAmount}>₹200</Text>
        </View>
        <View style={styles.savingsContainer}>
          <View style={styles.savingsRow}>
            <EmergencyCall style={styles.savingsIcon} />
            <Text style={styles.savingsHeading}>Free Emergency Calls Made</Text>
          </View>
          <Text style={styles.savingsAmount}>3/5</Text>
        </View>
        <View style={styles.savingsContainer}>
          <View style={styles.savingsRow}>
            <ExpressDelivery style={styles.savingsIcon} />
            <Text style={styles.savingsHeading}>Total Delivery Charges Saved</Text>
          </View>
          <Text style={styles.savingsAmount}>₹200</Text>
        </View>
        <View style={styles.savingsContainer}>
          <View style={styles.savingsRow}>
            <OneApolloLogo style={styles.savingsIcon} />
            <Text style={styles.savingsHeading}>Total Health Credits Earned</Text>
          </View>
          <Text style={styles.savingsAmount}>₹500</Text>
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
});
