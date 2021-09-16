import React from 'react';
import { StyleSheet, Text, Dimensions, View, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AddIconBlue, GpsIcon, Location } from '@aph/mobile-patients/src/components/ui/Icons';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { AddressCard } from '@aph/mobile-patients/src/components/Medicines/Components/AddressCard';
import { AppRoutes } from '../../NavigatorContainer';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { renderPharmaFetchAddressHeadingShimmer } from '@aph/mobile-patients/src/components/ui/ShimmerFactory';

const windowWidth = Dimensions.get('window').width;

export interface AccessLocationProps {
  addresses: savePatientAddress_savePatientAddress_patientAddress[];
  onPressAddAddress: () => void;
  onPressCurrentLocaiton: () => void;
  onPressPincode: () => void;
  onPressEditAddress: (address: savePatientAddress_savePatientAddress_patientAddress) => void;
  onPressSelectAddress: (address: savePatientAddress_savePatientAddress_patientAddress) => void;
  source?: string;
  hidePincodeCurrentLocation?: boolean;
  isAddressLoading: boolean;
}

export const AccessLocation: React.FC<AccessLocationProps> = (props) => {
  const {
    addresses,
    onPressAddAddress,
    onPressEditAddress,
    onPressSelectAddress,
    onPressCurrentLocaiton,
    onPressPincode,
    source,
    hidePincodeCurrentLocation,
  } = props;

  const isFromTest = source == AppRoutes.Tests;

  function sortAddresses(addresses: savePatientAddress_savePatientAddress_patientAddress[]) {
    if (addresses) {
      const array1 = addresses?.filter((item) => item?.defaultAddress);
      const array2 = addresses?.filter((item) => !item?.defaultAddress);
      const sortedAddresses = array1?.concat(array2);
      return sortedAddresses;
    } else {
      return [];
    }
  }

  const renderHeader = () => {
    return <Text style={styles.addressHeader}>{string.accessLocationPopUp.headerMessage}</Text>;
  };
  const renderCurrentLocationAccess = () => {
    return (
      <TouchableOpacity style={styles.buttonContainer} onPress={onPressCurrentLocaiton}>
        <GpsIcon />
        <Text style={styles.currentLocation}>{string.accessLocationPopUp.currentLocationText}</Text>
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
        <Text style={styles.currentLocation}>
          {isFromTest
            ? string.accessLocationPopUp.testPincodeText
            : string.accessLocationPopUp.defaultPincodeText}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderAddresses = () => {
    return props.isAddressLoading ? (
      renderPharmaFetchAddressHeadingShimmer()
    ) : (
      <View>
        <Text style={styles.addressHeader}>{string.accessLocationPopUp.chooseFromAddressText}</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {sortAddresses(addresses).map((item) => {
            return (
              <AddressCard
                item={item}
                onPressSelectAddress={(item) => onPressSelectAddress(item)}
                onPressEditAddress={(item) => onPressEditAddress(item)}
              />
            );
          })}
          {!isFromTest ? renderAddAddress() : null}
        </ScrollView>
      </View>
    );
  };
  const renderAddAddress = () => {
    return (
      <View
        style={{
          ...styles.addAddressCard,
          height: sortAddresses(addresses).length ? undefined : 75,
        }}
      >
        <TouchableOpacity style={{}} onPress={onPressAddAddress}>
          <Text style={styles.addAddress}>Add</Text>
          <Text style={styles.addAddress}>new address...</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAddAddressText = () => {
    return (
      <View style={{ marginVertical: '3%' }}>
        <View style={styles.horizontalLine} />
        <TouchableOpacity style={{ width: '60%' }} onPress={onPressAddAddress}>
          <View style={{ flexDirection: 'row' }}>
            <AddIconBlue style={styles.addAddressIcon} />
            <Text style={styles.addressHeader}>{string.accessLocationPopUp.addNewAddressText}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ paddingHorizontal: 20 }}>
      {isFromTest ? <View style={{ marginTop: '5%' }} /> : renderHeader()}
      {hidePincodeCurrentLocation ? null : renderCurrentLocationAccess()}
      {hidePincodeCurrentLocation ? null : renderDeliveryPincode()}
      {renderAddresses()}
      {isFromTest ? renderAddAddressText() : null}
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
  addAddress: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    lineHeight: 18,
    color: '#01475B',
    textAlign: 'center',
  },
  addAddressCard: {
    borderRadius: 10,
    marginHorizontal: 6,
    width: 0.4 * windowWidth,
    marginBottom: 20,
    backgroundColor: 'rgba(1, 71, 91, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAddressIcon: {
    height: 20,
    width: 20,
    marginVertical: 15,
    tintColor: colors.SHERPA_BLUE,
    marginRight: '3%',
  },
  horizontalLine: {
    height: 2,
    backgroundColor: colors.SHERPA_BLUE,
    opacity: 0.1,
    marginHorizontal: '2%',
    marginBottom: '2%',
  },
});
