import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CrossPopup, BackArrow, DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Overlay } from 'react-native-elements';
import { DropDown, Option } from '@aph/mobile-patients/src/components/ui/DropDown';
import { CancelConsultation } from '@aph/mobile-patients/src/strings/AppConfig';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { dataSavedUserID, g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { REQUEST_ROLES } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { getPatientAllAppointments_getPatientAllAppointments_activeAppointments } from '@aph/mobile-patients/src/graphql/types/getPatientAllAppointments';
import { useApolloClient } from 'react-apollo-hooks';
import {
  cancelAppointment,
  cancelAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/cancelAppointment';
import { CANCEL_APPOINTMENT } from '@aph/mobile-patients/src/graphql/profiles';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import moment from 'moment';
import { navigateToScreenWithEmptyStack } from '@aph/mobile-patients/src/helpers/helperFunctions';

const OTHER_REASON = string.ReasonFor_Cancel_Consultation.otherReasons;
interface CancelReasonProps {
  isCancelVisible: boolean;
  closePopup: () => void;
  data: getPatientAllAppointments_getPatientAllAppointments_activeAppointments;
  cancelSuccessCallback: () => void;
  navigation: NavigationScreenProp<NavigationRoute<{}>, {}>;
}

export const CancelReasonPopup: React.FC<CancelReasonProps> = (props) => {
  const { isCancelVisible, closePopup, data, cancelSuccessCallback, navigation } = props;
  const [overlayDropdown, setOverlayDropdown] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [comment, setComment] = useState('');
  const { currentPatient } = useAllCurrentPatients();
  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();
  const [appointmentTime, setAppointmentTime] = useState<string>('');

  const cancellationReasons = CancelConsultation.reason;
  const isSubmitDisableForOther = selectedReason == OTHER_REASON && comment == '';
  const client = useApolloClient();

  useEffect(() => {
    const dateValidate = moment(moment().format('YYYY-MM-DD')).diff(
      moment(data.appointmentDateTime).format('YYYY-MM-DD')
    );
    if (dateValidate == 0) {
      const time = `Today, ${moment
        .utc(data.appointmentDateTime)
        .local()
        .format('hh:mm A')}`;
      setAppointmentTime(time);
    } else {
      const time = `${moment
        .utc(data.appointmentDateTime)
        .local()
        .format('DD MMM h:mm A')}`;
      setAppointmentTime(time);
    }
  }, []);

  const resetReasonForCancelFields = () => {
    setSelectedReason('');
    setComment('');
  };

  const onPressConfirmCancelConsultation = () => {
    closePopup();
    cancelAppointmentApi();
  };

  const showAppointmentCancellSuccessAlert = () => {
    const appointmentNum = g(data, 'displayId');
    const doctorName = g(data, 'doctorInfo', 'displayName');
    showAphAlert!({
      title: `Hi ${g(currentPatient, 'firstName') || ''} ${g(currentPatient, 'lastName') || ''}!`,
      description: `As per your request, your appointment #${appointmentNum} with ${doctorName} scheduled for ${appointmentTime} has been cancelled.`,
      unDismissable: true,
      onPressOk: () => {
        hideAphAlert!();
      },
    });
  };

  const cancelAppointmentApi = async () => {
    setLoading!(true);
    const userId = await dataSavedUserID('selectedProfileId');
    const reasonForCancellation = selectedReason != OTHER_REASON ? selectedReason : comment;

    const appointmentTransferInput = {
      appointmentId: data?.id,
      cancelReason: reasonForCancellation,
      cancelledBy: REQUEST_ROLES.PATIENT, //appointmentDate,
      cancelledById: userId ? userId : data?.patientId,
    };

    client
      .mutate<cancelAppointment, cancelAppointmentVariables>({
        mutation: CANCEL_APPOINTMENT,
        variables: {
          cancelAppointmentInput: appointmentTransferInput,
        },
        fetchPolicy: 'no-cache',
      })
      .then(() => {
        setLoading!(false);
        cancelSuccessCallback();
        navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TabBar);
        showAppointmentCancellSuccessAlert();
      })
      .catch((e: any) => {
        CommonBugFender('AppointmentOnlineDetails_cancelAppointmentApi', e);
        setLoading!(false);
        const message = e?.message?.split(':')?.[1]?.trim() || '';
        if (
          message == 'INVALID_APPOINTMENT_ID' ||
          message == 'JUNIOR_DOCTOR_CONSULTATION_INPROGRESS'
        ) {
          showAphAlert!({
            title: `Hi, ${currentPatient?.firstName} ${currentPatient?.lastName} :)`,
            description: 'Ongoing / Completed appointments cannot be cancelled.',
          });
        }
      });
  };

  const renderReasonForCancelPopUp = () => {
    const optionsDropdown = overlayDropdown && (
      <Overlay
        onBackdropPress={() => setOverlayDropdown(false)}
        isVisible={overlayDropdown}
        overlayStyle={styles.dropdownOverlayStyle}
      >
        <DropDown
          cardContainer={{
            margin: 0,
          }}
          options={cancellationReasons.map(
            (cancellationReasons, i) =>
              ({
                onPress: () => {
                  setSelectedReason(cancellationReasons!);
                  setOverlayDropdown(false);
                },
                optionText: cancellationReasons,
              } as Option)
          )}
        />
      </Overlay>
    );

    const heading = (
      <View
        style={[
          styles.cancelReasonHeadingView,
          { flexDirection: selectedReason == OTHER_REASON ? 'row' : 'column' },
        ]}
      >
        {selectedReason == OTHER_REASON ? (
          <TouchableOpacity
            onPress={() => {
              resetReasonForCancelFields();
            }}
          >
            <BackArrow />
          </TouchableOpacity>
        ) : null}
        <Text
          style={[
            styles.cancelReasonHeadingText,
            { marginHorizontal: selectedReason == OTHER_REASON ? '20%' : 0 },
          ]}
        >
          {string.cancelConsultationHeading}
        </Text>
      </View>
    );

    const content = (
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={styles.cancelReasonContentHeading}>
          {string.cancelConsultationReasonHeading}
        </Text>
        {selectedReason != OTHER_REASON ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setOverlayDropdown(true);
            }}
          >
            <View style={styles.cancelReasonContentView}>
              <Text
                style={[styles.cancelReasonContentText, selectedReason ? {} : { opacity: 0.3 }]}
                numberOfLines={1}
              >
                {selectedReason || 'Select reason for cancelling'}
              </Text>
              <View style={{ flex: 0.1 }}>
                <DropdownGreen style={{ alignSelf: 'flex-end' }} />
              </View>
            </View>
            <View style={styles.reasonCancelDropDownExtraView} />
          </TouchableOpacity>
        ) : (
          <TextInputComponent
            value={comment}
            onChangeText={(text) => {
              text.startsWith(' ') ? null : setComment(text);
            }}
            placeholder={'Write your reason'}
          />
        )}
        {selectedReason != OTHER_REASON ? (
          <TextInputComponent
            value={comment}
            onChangeText={(text) => {
              text.startsWith(' ') ? null : setComment(text);
            }}
            label={'Add Comments (Optional)'}
            placeholder={'Enter your comments here…'}
          />
        ) : null}
      </View>
    );

    const bottomButton = (
      <Button
        style={styles.cancelReasonSubmitButton}
        onPress={onPressConfirmCancelConsultation}
        disabled={!!selectedReason ? isSubmitDisableForOther : true}
        title={'SUBMIT REQUEST'}
      />
    );

    return (
      isCancelVisible && (
        <View style={{ marginHorizontal: 20 }}>
          <TouchableOpacity
            style={styles.reasonCancelCrossTouch}
            onPress={() => {
              closePopup();
              setSelectedReason('');
              setComment('');
            }}
          >
            <CrossPopup />
          </TouchableOpacity>
          <View style={{ height: 16 }} />
          <View style={styles.reasonCancelView}>
            {optionsDropdown}
            {heading}
            {content}
            {bottomButton}
          </View>
        </View>
      )
    );
  };

  return <View style={styles.reasonCancelOverlay}>{renderReasonForCancelPopUp()}</View>;
};

const styles = StyleSheet.create({
  reasonCancelCrossTouch: {
    marginTop: 80,
    alignSelf: 'flex-end',
  },
  reasonCancelOverlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    flex: 1,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  reasonCancelView: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  dropdownOverlayStyle: {
    padding: 0,
    margin: 0,
    height: 'auto',
    borderRadius: 10,
  },
  cancelReasonHeadingView: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.WHITE,
    padding: 18,
    marginBottom: 24,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cancelReasonHeadingText: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
    textAlign: 'center',
  },
  cancelReasonContentHeading: {
    marginBottom: 12,
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  cancelReasonContentView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelReasonContentText: {
    flex: 0.9,
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SHERPA_BLUE,
  },
  reasonCancelDropDownExtraView: {
    marginTop: 5,
    backgroundColor: '#00b38e',
    height: 2,
  },
  cancelReasonSubmitButton: {
    margin: 16,
    marginTop: 32,
    width: 'auto',
  },
});
