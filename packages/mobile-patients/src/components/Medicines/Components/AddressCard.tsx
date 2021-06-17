import React from 'react';
import { StyleSheet, Text, Dimensions, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  EditAddressIcon,
  HomeLocationIcon,
  WorkLocationIcon,
  MapLocationIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  formatSelectedAddress,
  nameFormater,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { PATIENT_ADDRESS_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { colors } from '@aph/mobile-patients/src/theme/colors';

const windowWidth = Dimensions.get('window').width;

export interface AddressCardProps {
  item: savePatientAddress_savePatientAddress_patientAddress;
  onPressEditAddress?: (address: savePatientAddress_savePatientAddress_patientAddress) => void;
  onPressSelectAddress: (address: savePatientAddress_savePatientAddress_patientAddress) => void;
  source?: 'Diagnostics';
}

export const AddressCard: React.FC<AddressCardProps> = (props) => {
  const { item, onPressSelectAddress, onPressEditAddress, source } = props;
  const { currentPatient } = useAllCurrentPatients();

  const formatText = (text: string, count: number) => {
    if (text) {
      return text.length > count ? `${text.slice(0, count)}...` : text;
    }
  };

  const renderAddressIcon = (addressType: PATIENT_ADDRESS_TYPE | null) => {
    switch (addressType) {
      case PATIENT_ADDRESS_TYPE.HOME:
        return <HomeLocationIcon style={styles.addressTypeIcon} />;
        break;
      case PATIENT_ADDRESS_TYPE.OFFICE:
        return <WorkLocationIcon style={[styles.addressTypeIcon]} />;
        break;
      case PATIENT_ADDRESS_TYPE.OTHER:
      default:
        return <MapLocationIcon style={[styles.addressTypeIcon, { height: 20, width: 20 }]} />;
        break;
    }
  };

  const renderAddressText = () => {
    return (
      <View>
        <Text numberOfLines={2} style={styles.diagnosticAddressText}>
          {formatSelectedAddress(item)}
        </Text>
      </View>
    );
  };

  const renderDiagnosticCard = () => {
    return (
      <View style={{ ...styles.addressCard, borderWidth: item?.defaultAddress ? 1 : 0 }}>
        <TouchableOpacity onPress={() => onPressSelectAddress(item)}>
          <View style={styles.addressTypeHeader}>
            {renderAddressIcon(item?.addressType)}
            <Text numberOfLines={2} style={[styles.addressType, { marginLeft: 6 }]}>
              {item?.addressType
                ? nameFormater(item?.addressType, 'title')
                : nameFormater(PATIENT_ADDRESS_TYPE?.OTHER, 'title')}
            </Text>
          </View>
          {renderAddressText()}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      {!!source && source === 'Diagnostics' ? (
        renderDiagnosticCard()
      ) : (
        <View style={{ ...styles.addressCard, borderWidth: item.defaultAddress ? 1 : 0 }}>
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
                <TouchableOpacity onPress={() => onPressEditAddress?.(item)}>
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
      )}
    </>
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
  addressTypeIcon: {
    height: 18,
    width: 18,
    resizeMode: 'contain',
    tintColor: '#DADADA',
  },
  addressTypeHeader: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  diagnosticAddressText: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 18,
    color: colors.SHERPA_BLUE,
    opacity: 0.8,
    marginTop: 3,
    marginRight: 5,
  },
});
