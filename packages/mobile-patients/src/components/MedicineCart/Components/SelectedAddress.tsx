import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { LocationIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
export interface SelectedAddressProps {
  onPressChange: () => void;
}

export const SelectedAddress: React.FC<SelectedAddressProps> = (props) => {
  const { addresses, deliveryAddressId } = useShoppingCart();
  const { onPressChange } = props;
  const selectedAddress = addresses.find((item) => item.id == deliveryAddressId);

  function getformattedAddress(item: savePatientAddress_savePatientAddress_patientAddress) {
    return (
      (item.addressLine1 && item.addressLine1 + ', ') +
      '' +
      (item.addressLine2 && item.addressLine2 + ', ') +
      '' +
      (item.city && item.city + ',') +
      '' +
      (item.state && item.state + ',') +
      '' +
      (item.zipcode && item.zipcode)
    );
  }

  const addressHeader = () => {
    return (
      <View style={styles.addressHeader}>
        <View style={{ flexDirection: 'row' }}>
          <LocationIcon />
          <View style={{ marginLeft: 6 }}>
            <Text style={styles.deliveryAddress}>Delivery Address</Text>
            <Text style={styles.deliveryMsg}>We will deliver your order to this address</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onPressChange}>
          <Text style={styles.change}>CHANGE</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const address = () => {
    return (
      <View style={{ marginHorizontal: 20 }}>
        <Text style={styles.name}>{selectedAddress!.addressType}</Text>
        <Text style={styles.address}>{getformattedAddress(selectedAddress!)}</Text>
        <Text style={styles.address}>
          Mobile - <Text style={{ ...theme.fonts.IBMPlexSansSemiBold(12) }}>9940499788</Text>
        </Text>
      </View>
    );
  };

  const renderAddress = () => {
    return (
      <View>
        {addressHeader()}
        {address()}
      </View>
    );
  };

  return <View>{renderAddress()}</View>;
};

const styles = StyleSheet.create({
  addressHeader: {
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: 15,
    justifyContent: 'space-between',
  },
  deliveryAddress: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    color: '#01475B',
  },
  deliveryMsg: {
    ...theme.fonts.IBMPlexSansRegular(10),
    lineHeight: 20,
    color: '#01475B',
  },
  change: {
    ...theme.fonts.IBMPlexSansMedium(13),
    lineHeight: 17,
    color: '#01475B',
  },
  name: {
    marginTop: 10,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 20,
    color: '#01475B',
  },
  address: {
    marginTop: 8,
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 16,
    color: '#01475B',
  },
});
