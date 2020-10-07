import React from 'react';
import { StyleSheet, Text, Dimensions, View, TouchableOpacity, FlatList } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { GpsIcon, EditAddressIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { formatSelectedAddress } from '@aph/mobile-patients/src/helpers/helperFunctions';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface AddressCardProps {
  item: savePatientAddress_savePatientAddress_patientAddress;
  onPressEditAddress: (address: savePatientAddress_savePatientAddress_patientAddress) => void;
  onPressSelectAddress: (address: savePatientAddress_savePatientAddress_patientAddress) => void;
}

export const AddressCard: React.FC<AddressCardProps> = (props) => {
  const { item, onPressSelectAddress, onPressEditAddress } = props;

  return (
    <TouchableOpacity
      style={{
        ...styles.addressCard,
        borderWidth: item.defaultAddress ? 1 : 0,
        borderColor: '#FC9916',
      }}
      onPress={() => onPressSelectAddress(item)}
    >
      <View style={styles.header}>
        <Text style={{ ...theme.fonts.IBMPlexSansMedium(12), lineHeight: 18, color: '#01475B' }}>
          {item.addressType}
        </Text>
        <TouchableOpacity onPress={() => onPressEditAddress(item)}>
          <EditAddressIcon />
        </TouchableOpacity>
      </View>
      <Text style={styles.address}>{formatSelectedAddress(item)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addressCard: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 6,
    width: 0.35 * windowWidth,
    paddingHorizontal: 12,
    marginTop: 2,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    marginTop: 7,
    marginBottom: 3,
    justifyContent: 'space-between',
  },
  address: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 14,
    color: '#01475B',
    opacity: 0.8,
    marginTop: 3,
    marginBottom: 20,
  },
});
