import React from 'react';
import {
  StyleSheet,
  Text,
  Dimensions,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { GpsIcon, Location } from '@aph/mobile-patients/src/components/ui/Icons';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { AddressCard } from '@aph/mobile-patients/src/components/Medicines/Components/AddressCard';

const windowWidth = Dimensions.get('window').width;

export interface AccessLocationProps {
  addresses: savePatientAddress_savePatientAddress_patientAddress[];
  onPressAddAddress: () => void;
  onPressCurrentLocaiton: () => void;
  onPressPincode: () => void;
  onPressEditAddress: (address: savePatientAddress_savePatientAddress_patientAddress) => void;
  onPressSelectAddress: (address: savePatientAddress_savePatientAddress_patientAddress) => void;
}

export const AccessLocation: React.FC<AccessLocationProps> = (props) => {
  const {
    addresses,
    onPressAddAddress,
    onPressEditAddress,
    onPressSelectAddress,
    onPressCurrentLocaiton,
    onPressPincode,
  } = props;
  const renderCurrentLocationAccess = () => {
    return (
      <TouchableOpacity style={styles.buttonContainer} onPress={onPressCurrentLocaiton}>
        <GpsIcon />
        <Text style={styles.currentLocation}>Use my current location</Text>
      </TouchableOpacity>
    );
  };

  const renderDeliveryPincode = () => {
    return (
      <TouchableOpacity
        style={{ ...styles.buttonContainer, marginTop: 7 }}
        onPress={onPressPincode}
      >
        <Location style={{ width: 15, height: 15 }} />
        <Text style={styles.currentLocation}>Enter Delivery Pincode</Text>
      </TouchableOpacity>
    );
  };

  const renderAddresses = () => {
    return (
      <View>
        <Text style={styles.addressHeader}>Choose from saved address</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {addresses.map((item) => {
            return (
              <AddressCard
                item={item}
                onPressSelectAddress={(item) => onPressSelectAddress(item)}
                onPressEditAddress={(item) => onPressEditAddress(item)}
              />
            );
          })}
          {renderAddAddress()}
        </ScrollView>
      </View>
    );
  };
  const renderAddAddress = () => {
    return (
      <TouchableOpacity
        style={{ ...styles.addressCard, height: addresses.length ? undefined : 75 }}
        onPress={onPressAddAddress}
      >
        <Text style={styles.addAddress}>Add Address...</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ paddingHorizontal: 20 }}>
      {renderCurrentLocationAccess()}
      {renderDeliveryPincode()}
      {renderAddresses()}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: 15,
    flexDirection: 'row',
    backgroundColor: '#F7F8F5',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 30,
  },
  currentLocation: {
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 22,
    color: '#01475B',
    opacity: 0.7,
    marginVertical: 12,
    marginLeft: 6,
  },
  addressHeader: {
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
    color: '#01475B',
    marginVertical: 15,
  },
  addressCard: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 6,
    width: 0.35 * windowWidth,
    paddingHorizontal: 12,
    marginTop: 2,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAddress: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 14,
    color: '#01475B',
    opacity: 0.8,
  },
});
