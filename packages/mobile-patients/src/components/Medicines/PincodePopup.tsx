import {
  LocationData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CrossPopup, SmallOrangeCallIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  getPlaceInfoByPincode,
  pinCodeServiceabilityApi247,
  getNearByStoreDetailsApi,
  callToExotelApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { getFormattedLocation } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';

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
    width: '79%',
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
  const { showAphAlert, setLoading: globalLoading } = useUIElements();
  const { setPharmacyLocation, setLocationDetails, locationDetails } = useAppCommonData();
  const { currentPatient } = useAllCurrentPatients();
  const [showCallToPharmacy, setShowCallToPharmacy] = useState<boolean>(false);
  const [pharmacyPhoneNumber, setPharmacyPhoneNumber] = useState<string>('');
  const handleUpdatePlaceInfoByPincodeError = (e: Error) => {
    CommonBugFender('AddAddress_updateCityStateByPincode', e);
    setError('Sorry, invalid pincode.');
  };

  const checkServiceabilityAndUpdatePlaceInfo = (pincode: string) => {
    globalLoading!(true);
    pinCodeServiceabilityApi247(pincode)
      .then(({ data: { response } }) => {
        const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_ENTER_DELIVERY_PINCODE_SUBMITTED] = {
          'Patient UHID': currentPatient.uhid,
          'Mobile Number': currentPatient.mobileNumber,
          'Customer ID': currentPatient.id,
          Serviceable: response ? 'Yes' : 'No',
          Keyword: pincode,
          Source: 'Pharmacy Home',
        };
        postWebEngageEvent(
          WebEngageEventName.PHARMACY_ENTER_DELIVERY_PINCODE_SUBMITTED,
          eventAttributes
        );
        if (!response) {
          const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_PINCODE_NONSERVICABLE] = {
            'Mobile Number': currentPatient.mobileNumber,
            Pincode: pincode,
          };
          postWebEngageEvent(WebEngageEventName.PHARMACY_PINCODE_NONSERVICABLE, eventAttributes);
          getNearByStoreDetailsApi(pincode)
            .then((response: any) => {
              globalLoading!(false);
              setShowCallToPharmacy(true);
              setPharmacyPhoneNumber(
                response.data && response.data.phoneNumber
                  ? response.data.phoneNumber.toString()
                  : ''
              );
              setError('We are servicing your area through the nearest Pharmacy, ');
            })
            .catch((error) => {
              globalLoading!(false);
              setShowCallToPharmacy(false);
              setError(
                'Sorry, we are not servicing your area currently. Call 1860 500 0101 for Pharmacy stores nearby.'
              );
            });
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

  const CalltheNearestPharmacyEvent = () => {
    let eventAttributes: WebEngageEvents[WebEngageEventName.CALL_THE_NEAREST_PHARMACY] = {
      pincode: pincode,
      'Mobile Number': currentPatient.mobileNumber,
    };
    postWebEngageEvent(WebEngageEventName.CALL_THE_NEAREST_PHARMACY, eventAttributes);
  };

  const onPressCallNearestPharmacy = () => {
    let from = currentPatient.mobileNumber;
    let to = pharmacyPhoneNumber;
    let caller_id = AppConfig.Configuration.EXOTEL_CALLER_ID;
    // const param = `From=${from}&To=${to}&CallerId=${caller_id}`;
    const param = {
      fromPhone: from,
      toPhone: to,
      callerId: caller_id,
    };
    CalltheNearestPharmacyEvent();
    globalLoading!(true);
    callToExotelApi(param)
      .then((response) => {
        props.onClickClose();
        globalLoading!(false);
        console.log('exotelCallAPI response', response, 'params', param);
      })
      .catch((error) => {
        props.onClickClose();
        globalLoading!(false);
        showAphAlert!({
          title: string.common.uhOh,
          description: 'We could not connect to the pharmacy now. Please try later.',
        });
        console.log('exotelCallAPI error', error, 'params', param);
      });
  };

  const updatePlaceInfoByPincode = (pincode: string) => {
    getPlaceInfoByPincode(pincode)
      .then(({ data }) => {
        try {
          const addrComponents = data.results[0].address_components || [];
          const latLang = data.results[0].geometry.location || {};
          const response = getFormattedLocation(addrComponents, latLang, pincode);
          setPharmacyLocation!(response);
          !locationDetails && setLocationDetails!(response);
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
          {!!error && !showCallToPharmacy && <Text style={styles.errorText}>{error}</Text>}
          {!!error && showCallToPharmacy ? (
            <Text style={styles.errorText}>
              {error}
              <Text
                style={{
                  ...theme.viewStyles.text('B', 11, '#890000'),
                  textDecorationLine: 'underline',
                }}
              >
                {'Call to Order!'}
              </Text>
            </Text>
          ) : null}
          {showCallToPharmacy ? (
            <TouchableOpacity
              activeOpacity={1}
              style={{
                backgroundColor: '#fc9916',
                borderRadius: 5,
                height: 38,
                marginBottom: 5,
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexDirection: 'row',
                shadowColor: 'rgba(0,0,0,0.2)',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0,
                shadowRadius: 0,
                elevation: 0,
                width: '100%',
                paddingLeft: 9,
                marginTop: 12,
                alignSelf: 'center',
              }}
              onPress={onPressCallNearestPharmacy}
            >
              <SmallOrangeCallIcon style={{ width: 18, height: 18, marginRight: 5 }} />
              <Text style={{ ...theme.viewStyles.text('B', 12, '#ffffff', 1, 24, 0) }}>
                {'CALL THE NEAREST PHARMACY'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Button
              disabled={pincode.length !== 6}
              style={styles.submitButton}
              title="SUBMIT"
              onPress={() => checkServiceabilityAndUpdatePlaceInfo(pincode)}
            />
          )}
        </View>
        {renderCloseIcon()}
      </View>
    </View>
  );
};
