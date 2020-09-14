import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { WhiteArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';

export interface TatCardProps {
  deliveryTime: string;
  deliveryAddress: string;
  onPressChangeAddress: () => void;
}

export const TatCard: React.FC<TatCardProps> = (props) => {
  const { deliveryTime, deliveryAddress, onPressChangeAddress } = props;

  return (
    <View style={{ backgroundColor: '#02475B', paddingHorizontal: 20 }}>
      <View style={styles.subCont1}>
        <Text style={styles.delivery}>
          Deliver by : <Text style={styles.dateTime}>{new Date(deliveryTime).toDateString()}</Text>
        </Text>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => onPressChangeAddress()}
        >
          <Text style={styles.change}>CHANGE</Text>
          <WhiteArrowRight />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 15 }}>
        <Text style={styles.delivery}>
          Deliver to : <Text style={styles.dateTime}>{deliveryAddress}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  subCont1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 17,
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
});
