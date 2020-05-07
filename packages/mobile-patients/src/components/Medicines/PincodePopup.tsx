import {
  LocationData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  getPlaceInfoByPincode,
  pinCodeServiceabilityApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { getFormattedLocation } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const styles = StyleSheet.create({
  blurView: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.31)',
    width: '100%',
    height: '100%',
  },
  popupContainerView: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    top: Dimensions.get('window').height * 0.15,
  },
  popupView: {
    width: '75%',
    height: 'auto',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  closeButtonView: { marginLeft: 12, marginTop: -18 },
  hiText: {
    ...theme.viewStyles.text('SB', 18, '#02475b'),
    marginBottom: 14,
  },
  descText: {
    ...theme.viewStyles.text('SB', 12, '#02475b', 1, 20),
    marginBottom: 24,
  },
  errorText: {
    ...theme.viewStyles.text('M', 11, '#890000'),
    marginTop: -3,
    marginBottom: 2,
  },
  submitButton: { marginTop: 12, width: '67.42%', alignSelf: 'center' },
});

export interface PincodePopupProps {
  onClickClose: () => void;
  onComplete: (serviceable: boolean, response: LocationData) => void;
}

export const PincodePopup: React.FC<PincodePopupProps> = (props) => {
  const [pincode, setPincode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { setLoading: globalLoading } = useUIElements();
  const { setPharmacyLocation } = useAppCommonData();

  const handleUpdatePlaceInfoByPincodeError = (e: Error) => {
    CommonBugFender('AddAddress_updateCityStateByPincode', e);
    setError('Sorry, invalid pincode.');
  };

  const checkServiceabilityAndUpdatePlaceInfo = (pincode: string) => {
    globalLoading!(true);
    pinCodeServiceabilityApi(pincode)
      .then(({ data: { Availability } }) => {
        if (!Availability) {
          globalLoading!(false);
          setError('Sorry, not serviceable here.');
        } else {
          updatePlaceInfoByPincode(pincode);
        }
      })
      .catch((e) => {
        globalLoading!(false);
        CommonBugFender('Medicine_pinCodeServiceabilityApi', e);
        setError('Sorry, unable to check serviceability.');
      });
  };

  const updatePlaceInfoByPincode = (pincode: string) => {
    getPlaceInfoByPincode(pincode)
      .then(({ data }) => {
        try {
          const addrComponents = data.results[0].address_components || [];
          const latLang = data.results[0].geometry.location || {};
          const response = getFormattedLocation(addrComponents, latLang);
          setPharmacyLocation!(response);
          props.onComplete(true, response);
        } catch (e) {
          handleUpdatePlaceInfoByPincodeError(e);
        }
      })
      .catch(handleUpdatePlaceInfoByPincodeError)
      .finally(() => globalLoading!(false));
  };

  const validateAndSetPincode = (pincode: string) => {
    if (pincode == '' || /^[1-9]{1}\d{0,9}$/.test(pincode)) {
      if (error) setError('');
      setPincode(pincode);
    }
  };

  const renderCloseIcon = () => (
    <View style={styles.closeButtonView}>
      <TouchableOpacity onPress={() => props.onClickClose()}>
        <CrossPopup style={{ width: 18, height: 18 }} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.blurView}>
      <View style={styles.popupContainerView}>
        <View style={{ width: '9.72%' }} />
        <View style={styles.popupView}>
          <Text style={styles.hiText}>Hi! :)</Text>
          <Text style={styles.descText}>
            Allow us to serve you better by entering your delivery pincode below.
          </Text>
          <TextInputComponent
            // textInputprops={{ autoFocus: true }}
            value={pincode}
            onChangeText={(value) => validateAndSetPincode(value)}
            keyboardType="numeric"
            placeholder="Enter pincode here"
            maxLength={6}
          />
          {!!error && <Text style={styles.errorText}>{error}</Text>}
          <Button
            disabled={pincode.length !== 6}
            style={styles.submitButton}
            title="SUBMIT"
            onPress={() => checkServiceabilityAndUpdatePlaceInfo(pincode)}
          />
        </View>
        {renderCloseIcon()}
      </View>
    </View>
  );
};
