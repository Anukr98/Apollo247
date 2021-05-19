import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { LocationIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { formatSelectedAddress } from '@aph/mobile-patients/src/helpers/helperFunctions';

export interface SelectedAddressProps {
  onPressChange?: () => void;
  orderType: 'Delivery' | 'StorePickUp';
  showChangeAddress: boolean;
}

export const SelectedAddress: React.FC<SelectedAddressProps> = (props) => {
  const { addresses, deliveryAddressId, storeId, stores: storesFromContext } = useShoppingCart();
  const { onPressChange, orderType, showChangeAddress } = props;
  const selectedAddress = addresses.find((item) => item.id == deliveryAddressId);
  const selectedStore =
    (storeId && storesFromContext.find((item) => item.storeid == storeId)) || undefined;

  const addressHeader = () => {
    return (
      <View style={styles.addressHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <LocationIcon style={styles.icon} />
          <View style={{ marginLeft: 3 }}>
            <Text style={styles.deliveryAddress}>
              {orderType == 'Delivery' ? 'Delivery Address' : 'Pick Up Details'}
            </Text>
            <Text style={styles.deliveryMsg}>
              {orderType == 'Delivery'
                ? 'We will deliver your order to this address'
                : 'Kindly pick up your ordered items from the selected store'}
            </Text>
          </View>
        </View>
        {!!showChangeAddress && (
          <TouchableOpacity onPress={onPressChange}>
            <Text style={styles.change}>CHANGE</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const address = () => {
    return orderType == 'Delivery' ? (
      <View style={{ marginHorizontal: 25 }}>
        <Text style={styles.name}>{selectedAddress?.name || selectedAddress?.addressType}</Text>
        <Text style={styles.address}>{formatSelectedAddress(selectedAddress!)}</Text>
        <Text style={styles.address}>
          {'Mobile - '}
          <Text style={{ ...theme.fonts.IBMPlexSansMedium(12) }}>
            {selectedAddress?.mobileNumber}
          </Text>
        </Text>
      </View>
    ) : (
      <View style={{ marginHorizontal: 25 }}>
        <Text style={styles.name}>{selectedStore?.storename}</Text>
        <Text style={styles.address}>{selectedStore?.address}</Text>
        <Text style={styles.address}>
          Mobile -
          <Text style={{ ...theme.fonts.IBMPlexSansMedium(12) }}>{selectedStore?.phone}</Text>
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
    marginHorizontal: 20,
    justifyContent: 'space-between',
  },
  deliveryAddress: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    color: '#01475B',
  },
  deliveryMsg: {
    ...theme.fonts.IBMPlexSansRegular(10),
    lineHeight: 18,
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
  icon: { height: 32, width: 32 },
});
