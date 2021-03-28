import React from 'react';
import { StyleSheet, Text, Dimensions, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { EditAddressIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { formatSelectedAddress } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface AddressCardProps {
  item: savePatientAddress_savePatientAddress_patientAddress;
  onPressEditAddress: (address: savePatientAddress_savePatientAddress_patientAddress) => void;
  onPressSelectAddress: (address: savePatientAddress_savePatientAddress_patientAddress) => void;
}

export const AddressCard: React.FC<AddressCardProps> = (props) => {
  const { item, onPressSelectAddress, onPressEditAddress } = props;
  const { currentPatient } = useAllCurrentPatients();

  const formatText = (text: string, count: number) => {
    if (text) {
      return text.length > count ? `${text.slice(0, count)}...` : text;
    }
  };

  return (
    <View style={{ ...styles.addressCard, borderWidth: item.defaultAddress ? 1 : 0 }}>
      <TouchableOpacity onPress={() => onPressSelectAddress(item)}>
        <View style={styles.header}>
          <View style={{ flex: 0.85 }}>
            <Text numberOfLines={2} style={styles.addressType}>
              {item?.name ? formatText(item?.name, 20) : formatText(currentPatient?.firstName, 20)}
            </Text>
          </View>
          <View style={{ flex: 0.15 }}>
            <TouchableOpacity onPress={() => onPressEditAddress(item)}>
              <EditAddressIcon />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={{ ...styles.address, marginBottom: 2 }}>{item.mobileNumber}</Text>
        <Text style={styles.address}>{formatSelectedAddress(item)}</Text>
        <Text style={{ ...styles.address, marginTop: 5 }}>
          {item?.defaultAddress ? 'Your default address' : item.addressType}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  addressCard: {
    flex: 1,
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 6,
    width: 0.4 * windowWidth,
    paddingLeft: 10,
    marginTop: 2,
    marginBottom: 20,
    borderColor: '#FC9916',
    paddingBottom: 9,
  },
  header: {
    flexDirection: 'row',
    marginTop: 7,
    marginRight: 5,
  },
  address: {
    ...theme.fonts.IBMPlexSansRegular(11),
    lineHeight: 13,
    color: '#01475B',
    opacity: 0.8,
    marginTop: 3,
    marginRight: 5,
  },
  addressType: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 14,
    color: '#01475B',
  },
});
