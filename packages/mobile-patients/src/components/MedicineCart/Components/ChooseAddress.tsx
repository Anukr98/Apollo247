import React from 'react';
import { StyleSheet, Text, Dimensions, View, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { EditAddressIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { formatSelectedAddress } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

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
  const { currentPatient } = useAllCurrentPatients();

  function sortAddresses(addresses: savePatientAddress_savePatientAddress_patientAddress[]) {
    if (addresses) {
      const array1 = addresses.filter((item) => item.id == deliveryAddressId);
      const array2 = addresses.filter((item) => item.id != deliveryAddressId);
      const sortedAddresses = array1.concat(array2);
      return sortedAddresses;
    } else {
      return [];
    }
  }

  const formatText = (text: string, count: number) => {
    if (text) {
      return text.length > count ? `${text.slice(0, count)}...` : text;
    }
  };

  const renderAddress = (item: savePatientAddress_savePatientAddress_patientAddress) => {
    return (
      <View style={{ ...styles.addressCard, borderWidth: item.id == deliveryAddressId ? 1 : 0 }}>
        <TouchableOpacity onPress={() => onPressSelectAddress(item)}>
          <View style={styles.header}>
            <View style={{ flex: 0.85 }}>
              <Text numberOfLines={2} style={styles.addressType}>
                {item?.name
                  ? formatText(item?.name, 20)
                  : formatText(currentPatient?.firstName, 20)}
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

  const renderAddAddress = () => {
    const length = addresses ? addresses.length : 0;
    return (
      <TouchableOpacity
        style={{ ...styles.addAddressCard, height: length % 2 == 0 ? 80 : undefined }}
        onPress={onPressAddAddress}
      >
        <Text style={styles.addAddress}>Add</Text>
        <Text style={styles.addAddress}>new address...</Text>
      </TouchableOpacity>
    );
  };
  const renderChooseAddress = () => {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {sortAddresses(addresses).map((item) => {
          return renderAddress(item);
        })}
        {renderAddAddress()}
      </ScrollView>
    );
  };

  return <View style={{ maxHeight: 0.5 * windowHeight }}>{renderChooseAddress()}</View>;
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0.055 * windowWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    paddingBottom: 30,
  },
  addressCard: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 0.02 * windowWidth,
    width: 0.4 * windowWidth,
    paddingLeft: 10,
    marginVertical: 5,
    borderColor: '#FC9916',
    paddingBottom: 9,
  },
  header: {
    flexDirection: 'row',
    marginTop: 7,
  },
  address: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 14,
    color: '#01475B',
    opacity: 0.8,
    marginTop: 3,
    marginRight: 5,
  },
  addAddress: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    lineHeight: 18,
    color: '#01475B',
    textAlign: 'center',
  },
  addressType: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 14,
    color: '#01475B',
  },
  addAddressCard: {
    borderRadius: 10,
    marginHorizontal: 0.02 * windowWidth,
    width: 0.4 * windowWidth,
    marginVertical: 5,
    paddingBottom: 9,
    backgroundColor: 'rgba(1, 71, 91, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
