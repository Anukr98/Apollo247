import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { WhiteArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

export interface TatCardProps {
  deliveryAddress: string;
  onPressChangeAddress: () => void;
}

export const TatCard: React.FC<TatCardProps> = (props) => {
  const { deliveryAddress, onPressChangeAddress } = props;
  const { nonCartTatText } = useAppCommonData();

  const getNonCartDeliveryTatText = () => {
    if (nonCartTatText) {
      return <Text style={styles.deliveryText}>{nonCartTatText}</Text>;
    }
  };

  const renderChangeAddressButton = () => (
    <TouchableOpacity
      style={{ flexDirection: 'row', alignItems: 'center' }}
      onPress={() => onPressChangeAddress()}
    >
      <Text style={styles.change}>CHANGE</Text>
      <WhiteArrowRight />
    </TouchableOpacity>
  );

  const renderAddress = () => (
    <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 15 }}>
      <Text style={styles.delivery}>
        Deliver to : <Text style={styles.dateTime}>{deliveryAddress}</Text>
      </Text>
    </View>
  );

  return (
    <View style={{ backgroundColor: '#02475B', paddingHorizontal: 13 }}>
      <View style={styles.subCont1}>
        {getNonCartDeliveryTatText()}
        {renderChangeAddressButton()}
      </View>
      {renderAddress()}
    </View>
  );
};

const styles = StyleSheet.create({
  subCont1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 17,
    flex: 1,
    justifyContent: 'space-between',
  },
  delivery: {
    color: '#F7F8F5',
    ...theme.fonts.IBMPlexSansRegular(14),
    lineHeight: 18,
  },
  dateTime: {
    color: '#F7F8F5',
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
  },
  change: {
    color: '#F7F8F5',
    ...theme.fonts.IBMPlexSansSemiBold(14),
    lineHeight: 18,
    marginRight: 7,
  },
  deliveryText: {
    width: '79%',
    color: '#F7F8F5',
    ...theme.fonts.IBMPlexSansRegular(14),
    lineHeight: 18,
  },
});
