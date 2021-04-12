import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CallConnectIcon, CallRingIcon, GroupCallIcon } from '../ui/Icons';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import { g, sGngageEvent } from '../../helpers/helperFunctions';
import { AppConfig } from '../../strings/AppConfig';
import { useUIElements } from '../UIElementsProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useApolloClient } from 'react-apollo-hooks';
import {
  initiateCallForPartner,
  initiateCallForPartnerVariables,
} from '../../graphql/types/initiateCallForPartner';
import {
  initiateDocOnCall,
  initiateDocOnCallVariables,
} from '@aph/mobile-patients/src/graphql/types/initiateDocOnCall';
import {
  INITIATE_CALL_FOR_PARTNER,
  INITIATE_DOC_ON_CALL,
} from '@aph/mobile-patients/src/graphql/profiles';
import { docOnCallType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
const { width } = Dimensions.get('window');

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
    top: Dimensions.get('window').height * 0.1,
  },
  popupView: {
    width: width - 40,
    height: 'auto',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingBottom: 14,
  },
  containerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepsText: {
    ...theme.viewStyles.text('M', 12, '#00B38E', 1, 20, 0.35),
    marginTop: 10,
  },
  callIcon: {
    resizeMode: 'contain',
    width: 40,
    alignSelf: 'center',
  },
  stepsContainer: {
    flexDirection: 'column',
    width: '50%',
  },
  lastStepContainer: {
    flexDirection: 'column',
    width: '50%',
  },
  noteText: {
    ...theme.viewStyles.text('M', 12, '#01475B', 1, 20, 0.35),
    marginTop: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#FC9916',
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  centerIcons: {
    alignSelf: 'center',
  },
  header: {
    padding: 12,
    ...theme.viewStyles.cardViewStyle,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTitle: {
    ...theme.viewStyles.text('SB', 18, '#01475B'),
    textAlign: 'center',
  },
  subtitle: {
    ...theme.viewStyles.text('R', 12, '#02475B', 1, 20, 0.35),
    textAlign: 'center',
  },
});

export interface HdfcConnectPopupProps {
  onClose: () => void;
  benefitId?: string;
  successCallback?: () => void;
  userSubscriptionId?: string;
  helplineNumber?: string;
  isVaccineDocOnCall?: boolean;
  postWEGEvent?: () => void;
}

export const HdfcConnectPopup: React.FC<HdfcConnectPopupProps> = (props) => {
  const { userSubscriptionId, helplineNumber, isVaccineDocOnCall, postWEGEvent } = props;
  const { currentPatient } = useAllCurrentPatients();
  const mobileNumber = g(currentPatient, 'mobileNumber');
  const { showAphAlert } = useUIElements();
  const [showConnectMessage, setShowConnectMessage] = useState<boolean>(false);
  const [disableButton, setDisableButton] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const client = useApolloClient();

  const fireExotelApi = () => {
    if (isVaccineDocOnCall) {
      initiateVaccinationDoctorOnCall();
      return;
    }
    setDisableButton(true);
    setLoading(true);
    client
      .query<initiateCallForPartner, initiateCallForPartnerVariables>({
        query: INITIATE_CALL_FOR_PARTNER,
        variables: {
          mobileNumber,
          benefitId: `${props.benefitId}`,
          userSubscriptionId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data) => {
        setShowConnectMessage(true);
        setLoading(false);
        setTimeout(() => {
          props.onClose();
        }, 2000);
        props.successCallback();
        console.log('initiateCallForPartner response', data);
      })
      .catch((e) => {
        props.onClose();
        setLoading(false);
        showAphAlert!({
          title: string.common.uhOh,
          description: 'We could not connect to the doctor now. Please try later.',
        });
        console.log('initiateCallForPartner error', e);
      });
  };

  // Call an apollo doctor logic handler
  const initiateVaccinationDoctorOnCall = () => {
    postWEGEvent?.();
    setLoading(true);
    client
      .query<initiateDocOnCall, initiateDocOnCallVariables>({
        query: INITIATE_DOC_ON_CALL,
        variables: {
          mobileNumber,
          callType: docOnCallType.COVID_VACCINATION_QUERY,
        },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        setShowConnectMessage(true);
        setLoading(false);
        setTimeout(() => {
          props.onClose();
        }, 2000);
      })
      .catch((error) => {
        props.onClose();
        setLoading(false);
        showAphAlert!({
          title: string.common.uhOh,
          description: 'We could not connect to the doctor now. Please try later.',
        });
      });
  };

  const renderConnectSteps = () => {
    return (
      <View
        style={{
          marginTop: 10,
        }}
      >
        <View style={styles.containerRow}>
          <View style={styles.stepsContainer}>
            <CallConnectIcon style={styles.centerIcons} />
            <Text style={styles.stepsText}>{`Answer the call from ${helplineNumber ||
              '040-482-17258'}.`}</Text>
          </View>
          <View style={styles.stepsContainer}>
            <CallRingIcon style={styles.callIcon} />
            <Text style={styles.stepsText}>
              {isVaccineDocOnCall
                ? 'Select the required option on the IVR'
                : 'The same call will connect to the Doctor.'}
            </Text>
          </View>
        </View>
        <View style={[styles.containerRow, { marginTop: 8, alignItems: 'flex-end' }]}>
          <View style={styles.stepsContainer}>
            <GroupCallIcon style={styles.callIcon} />
            <Text style={styles.stepsText}>
              {isVaccineDocOnCall
                ? 'Wait for the Apollo experts to connect'
                : 'Wait for the Doctor to connect over the call.'}
            </Text>
          </View>
          <View style={styles.lastStepContainer}>
            <Text style={styles.stepsText}>
              <Text style={theme.viewStyles.text('B', 12, '#00B38E', 1, 20, 0.35)}>*Note:</Text>{' '}
              Your personal phone number will not be shared.
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderButtons = () => {
    return showConnectMessage ? (
      <Text
        style={{
          ...theme.viewStyles.text('SB', 15, '#01475B', 1, 30, 0.35),
          textAlign: 'center',
          marginTop: 20,
        }}
      >
        You will receive the call shortly.
      </Text>
    ) : (
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          disabled={disableButton}
          style={styles.cancelButton}
          onPress={props.onClose}
        >
          <Text style={theme.viewStyles.text('B', 13, '#FC9916', 1, 20, 0.35)}>CANCEL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={disableButton}
          style={styles.connectButton}
          onPress={() => fireExotelApi()}
        >
          <Text style={theme.viewStyles.text('B', 13, '#FFFFFF', 1, 20, 0.35)}>
            PROCEED TO CONNECT
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.blurView}>
      {loading && <Spinner />}
      <View style={styles.popupContainerView}>
        <View />
        <View style={styles.popupView}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isVaccineDocOnCall ? 'Covid-19 Vaccination Helpdesk' : 'Connect to the doctor'}
            </Text>
            <Text style={styles.subtitle}>Please follow the below steps to connect</Text>
          </View>
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            {renderConnectSteps()}
            {renderButtons()}
          </View>
        </View>
      </View>
    </View>
  );
};
