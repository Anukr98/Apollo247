import React, { useState } from 'react';
import { Dimensions, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  CheckedIcon,
  CheckUnselectedIcon,
  OneApollo,
} from '@aph/mobile-patients/src/components/ui/Icons';
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  oneApolloHeaderTxt: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    marginHorizontal: 0.05 * width,
    lineHeight: 20,
    marginBottom: 3,
  },
  border: {
    width: 0.9 * width,
    height: 1,
    backgroundColor: 'rgba(2, 71, 91, 0.2)',
    margin: 0.05 * width,
    marginTop: 0.01 * width,
    marginBottom: 0.03 * width,
  },
  paymentModeCard: {
    flex: 1,
    flexDirection: 'row',
    width: 0.9 * width,
    height: 0.08 * height,
    borderRadius: 9,
    backgroundColor: theme.colors.WHITE,
    margin: 0.05 * width,
    marginTop: 0,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  availableHC: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
  },
  availableHCTxt: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: 'rgba(2, 71, 91, 0.6)',
    lineHeight: 20,
  },
  oneApolloContainer: {
    height: 0.09 * height,
    flexDirection: 'row',
    paddingVertical: 0.017 * height,
    marginBottom: 20,
  },
  iconContainer: { flex: 0.16, justifyContent: 'center', alignItems: 'center' },
  oneApolloIconContainer: {
    flex: 0.3,
    borderRightWidth: 1,
    borderRightColor: 'rgba(2, 71, 91, 0.3)',
    justifyContent: 'center',
  },
  oneApolloIcon: { height: 0.053 * height, width: 0.068 * height },
});

export interface OneApolloHCOptionProps {
  healthCredits: number;
  oneApolloSelected: boolean;
  onSelectOneApollo: () => void;
}

export const OneApolloHCOptionComponent: React.FC<OneApolloHCOptionProps> = (props) => {
  const { healthCredits, oneApolloSelected, onSelectOneApollo } = props;
  // const [isOneApolloSelected, setIsOneApolloSelected] = useState<boolean>(false);
  return (
    <View>
      <Text style={styles.oneApolloHeaderTxt} numberOfLines={2}>
        Would you like to use Apollo Health Credits for this payment?
      </Text>
      <View style={styles.border}></View>
      <TouchableOpacity
        onPress={() => {
          onSelectOneApollo();
          // setIsOneApolloSelected(!isOneApolloSelected);
          // if (isOneApolloSelected) {
          //   setisOneApolloSelected(false);
          //   setBurnHC(0);
          //   setHCorder(false);
          // } else {
          //   setisOneApolloSelected(true);
          //   if (
          //     availableHC >= getFormattedAmount(grandTotal - deliveryCharges - packagingCharges)
          //   ) {
          //     setBurnHC(getFormattedAmount(grandTotal - deliveryCharges - packagingCharges));
          //     if (deliveryCharges + packagingCharges == 0) {
          //       setHCorder(true);
          //     }
          //   } else {
          //     setBurnHC(availableHC);
          //   }
          // }
        }}
        style={[styles.paymentModeCard, styles.oneApolloContainer]}
      >
        <View style={styles.iconContainer}>
          {oneApolloSelected ? <CheckedIcon /> : <CheckUnselectedIcon />}
        </View>
        <View style={styles.oneApolloIconContainer}>
          <OneApollo style={styles.oneApolloIcon} />
        </View>
        <View style={{ flex: 0.54, marginLeft: 15 }}>
          <Text style={styles.availableHCTxt}>Available Health Credits</Text>
          <Text style={styles.availableHC}>{(healthCredits || 0).toFixed(2)}</Text>
        </View>
        <View></View>
      </TouchableOpacity>
    </View>
  );
};
