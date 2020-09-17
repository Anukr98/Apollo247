import React from 'react';
import { StyleSheet, Text, Dimensions, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { EditAddressIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { formatSelectedAddress } from '@aph/mobile-patients/src/helpers/helperFunctions';

const windowWidth = Dimensions.get('window').width;

export interface ChooseAddressProps {
  addresses: savePatientAddress_savePatientAddress_patientAddress[];
  deliveryAddressId: string;
  onPressAddAddress: () => void;
  onPressEditAddress: (address: savePatientAddress_savePatientAddress_patientAddress) => void;
  onPressSelectAddress: (address: savePatientAddress_savePatientAddress_patientAddress) => void;
}

export const ChooseAddress: React.FC<ChooseAddressProps> = (props) => {
  const {
    addresses,
    deliveryAddressId,
    onPressAddAddress,
    onPressEditAddress,
    onPressSelectAddress,
  } = props;

  const renderAddress = (item: savePatientAddress_savePatientAddress_patientAddress) => {
    console.log(item);
    return (
      <TouchableOpacity
        style={{
          ...styles.addressCard,
          borderWidth: item.id == deliveryAddressId ? 1 : 0,
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

  const renderAddAddress = () => {
    const length = addresses ? addresses.length : 0;
    return (
      <TouchableOpacity
        style={{
          ...styles.addressCard,
          justifyContent: 'center',
          alignItems: 'center',
          height: length % 2 == 0 ? 75 : undefined,
        }}
        onPress={onPressAddAddress}
      >
        <Text style={styles.addAddress}>Add Address...</Text>
      </TouchableOpacity>
    );
  };
  const renderChooseAddress = () => {
    return (
      <View style={styles.container}>
        {addresses.map((item) => {
          return renderAddress(item);
        })}
        {renderAddAddress()}
      </View>
    );
  };

  return <View>{renderChooseAddress()}</View>;
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0.05 * windowWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
    marginBottom: 40,
  },
  addressCard: {
    ...theme.viewStyles.cardViewStyle,
    marginRight: 0.03 * windowWidth,
    width: 0.4 * windowWidth,
    paddingHorizontal: 12,
    marginTop: 10,
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
  addAddress: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 14,
    color: '#01475B',
    opacity: 0.8,
  },
});
