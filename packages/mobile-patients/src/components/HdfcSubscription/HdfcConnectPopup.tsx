import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CallConnectIcon, CallRingIcon, GroupCallIcon } from '../ui/Icons';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import { g } from '../../helpers/helperFunctions';
import { AppConfig } from '../../strings/AppConfig';
import { callToExotelApi } from '../../helpers/apiCalls';
import { useUIElements } from '../UIElementsProvider';
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
    padding: 20,
    top: Dimensions.get('window').height * 0.15,
  },
  popupView: {
    width: '90%',
    height: 'auto',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
});

export interface HdfcConnectPopupProps {
  onConnect: () => void;
  onClose: () => void;
}

export const HdfcConnectPopup: React.FC<HdfcConnectPopupProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const mobileNumber = g(currentPatient, 'mobileNumber')
  const { showAphAlert, setLoading: globalLoading } = useUIElements();

  const fireExotelApi = () => {
    let caller_id = AppConfig.Configuration.HDFC_EXOTEL_CALLER_ID;
    let to = AppConfig.Configuration.HDFC_CONNECT_EXOTEL_CALL_NUMBER;
    const param = {
      fromPhone: mobileNumber,
      toPhone: to,
      callerId: caller_id,
    };
    globalLoading!(true);
    callToExotelApi(param)
      .then((response) => {
        props.onClose();
        globalLoading!(false);
        console.log('exotelCallAPI response', response, ' ,params', param);
      })
      .catch((error) => {
        props.onClose();
        globalLoading!(false);
        showAphAlert!({
          title: string.common.uhOh,
          description: 'We could not connect to the doctor now. Please try later.',
        });
        console.log('exotelCallAPI error', error, ' ,params', param);
      });
  };

  return (
    <View style={styles.blurView}>
      <View style={styles.popupContainerView}>
        <View style={{ width: '5.72%' }} />
        <View style={styles.popupView}>
          <Text style={theme.viewStyles.text('SB', 18, '#01475B')}>Connect to the Doctor</Text>
          <Text style={theme.viewStyles.text('R', 12, '#02475B', 1, 20, 0.35)}>
            Please follow the steps to connect to Doctor
          </Text>
          <View style={{
            marginTop: 10,
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
              <View style={{
                flexDirection: 'column',
                width: '50%',
                alignItems: 'center',
              }}>
                <CallConnectIcon />
                <Text style={{
                  ...theme.viewStyles.text('M', 12, '#00B38E', 1, 20, 0.35),
                  marginTop: 10,
                }}>
                  Answer the call from ‘040-482-17258’ to connect.
                </Text>
              </View>
              <View style={{
                flexDirection: 'column',
                width: '50%',
                alignItems: 'center',
              }}>
                <CallRingIcon style={{
                  resizeMode: 'contain',
                  width: 40,
                }} />
                <Text style={{
                  ...theme.viewStyles.text('M', 12, '#00B38E', 1, 20, 0.35),
                  marginTop: 10,
                }}>
                  The same call will connect to the Doctor.
                </Text>
              </View>
            </View>
            <View style={{
              flexDirection: 'row',
              marginTop: 8,
              justifyContent: 'space-between',
            }}>
              <View style={{
                flexDirection: 'column',
                width: '50%',
                alignItems: 'center',
              }}>
                <GroupCallIcon style={{
                  resizeMode: 'contain',
                  width: 40,
                }} />
                <Text style={{
                  ...theme.viewStyles.text('M', 12, '#00B38E', 1, 20, 0.35),
                  marginTop: 10,
                }}>
                  Wait for the Doctor  to connect over the call.
                </Text>
              </View>
              <View style={{
                flexDirection: 'column',
                width: '50%',
              }}>
                <Text style={{
                  ...theme.viewStyles.text('M', 12, '#01475B', 1, 20, 0.35),
                  marginTop: 20,
                }}>*Note :</Text>
                <Text style={{
                  ...theme.viewStyles.text('M', 12, '#01475B', 1, 20, 0.35),
                }}>
                  Your personal phone number will not be  shared.
                </Text>
              </View>
            </View>
          </View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}>
            <TouchableOpacity
              style={{
                marginTop: 20,
                padding: 10,
                borderRadius: 10,
                alignItems: 'center'
              }}
              onPress={props.onClose}
            >
              <Text style={theme.viewStyles.text('B', 13, '#FC9916', 1, 20, 0.35)}>
                CANCEL
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: '#FC9916',
                marginTop: 20,
                padding: 10,
                borderRadius: 10,
                alignItems: 'center'
              }}
              onPress={() => fireExotelApi()}
            >
              <Text style={theme.viewStyles.text('B', 13, '#FFFFFF', 1, 20, 0.35)}>
                PROCEED TO CONNECT
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};
