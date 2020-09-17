import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { LocationIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { formatSelectedAddress } from '@aph/mobile-patients/src/helpers/helperFunctions';

export interface SelectedAddressProps {
  onPressChange: () => void;
  orderType: 'Delivery' | 'StorePickUp';
}

export const SelectedAddress: React.FC<SelectedAddressProps> = (props) => {
  const { addresses, deliveryAddressId, storeId, stores: storesFromContext } = useShoppingCart();
  const { onPressChange, orderType } = props;
  const selectedAddress = addresses.find((item) => item.id == deliveryAddressId);
  const selectedStore =
    (storeId && storesFromContext.find((item) => item.storeid == storeId)) || undefined;

  const addressHeader = () => {
    return (
      <View style={styles.addressHeader}>
        <View style={{ flexDirection: 'row' }}>
          <LocationIcon />
          <View style={{ marginLeft: 6 }}>
            <Text style={styles.deliveryAddress}>
              {orderType == 'Delivery' ? 'Delivery Address' : 'Selected Store'}
            </Text>
            <Text style={styles.deliveryMsg}>
              {orderType == 'Delivery'
                ? 'We will deliver your order to this address'
                : 'You will pick up your order from the selected store'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onPressChange}>
          <Text style={styles.change}>CHANGE</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const address = () => {
    return orderType == 'Delivery' ? (
      <View style={{ marginHorizontal: 20 }}>
        <Text style={styles.name}>{selectedAddress!.name || selectedAddress!.addressType}</Text>
        <Text style={styles.address}>{formatSelectedAddress(selectedAddress!)}</Text>
        <Text style={styles.address}>
          Mobile -
          <Text style={{ ...theme.fonts.IBMPlexSansMedium(12) }}>
            {selectedAddress!.mobileNumber}
          </Text>
        </Text>
      </View>
    ) : (
      <View style={{ marginHorizontal: 20 }}>
        <Text style={styles.name}>{selectedStore!.storename}</Text>
        <Text style={styles.address}>{selectedStore!.address}</Text>
        <Text style={styles.address}>
          Mobile -
          <Text style={{ ...theme.fonts.IBMPlexSansMedium(12) }}>{selectedStore!.phone}</Text>
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
    marginBottom: 5,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 20,
    color: '#01475B',
  },
  address: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 16,
    color: '#01475B',
  },
});
