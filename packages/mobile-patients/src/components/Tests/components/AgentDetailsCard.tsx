import {
  LocationOutline,
  OrangeCall,
  WhiteProfile,
} from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DiagnosticTrackPhleboClicked } from '@aph/mobile-patients/src/components/Tests/utils/Events';
import { DIAGNOSTIC_ORDER_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { isSmallDevice, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import moment from 'moment';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { setBugFenderLog } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

interface AgentDetailsCardProps {
  orderId: string | number;
  phleboDetailsObject: any;
  orderLevelStatus: DIAGNOSTIC_ORDER_STATUS;
  currentPatient: any;
  isDiagnosticCircleSubscription: boolean;
  source: string;
  showCardView?: boolean;
  onPressCallOption: (name: string, number: string) => void;
}

export const AgentDetailsCard: React.FC<AgentDetailsCardProps> = (props) => {
  const {
    phleboDetailsObject,
    orderLevelStatus,
    currentPatient,
    isDiagnosticCircleSubscription,
    source,
    showCardView,
  } = props;

  /**
   * -> if phleboDetails -> true :: phleboRelocated -> then change name -> figma 3.1
   * PICKUP_REQUESTED
   * -> showPhleboDetails :: show phelbo details and otp (normal view) -> figma 1.1
   * -> phleboDetails -> false, masking -> false :: show apollo agent receive msg -> figma 1.2
   * -> phleboDetails -> true , masking -> false :: you can call agent msg -> figma 1.3
   * -> phleboDetails -> true , masking -> true :: call apollo agent using this msg  -> below normal design
   * PHLEBO_CHECKIN
   * -> showPhleboDetails -> true (BE)
   * -> makedCalling -> true (BE)
   * -> phleboDetails -> true , masking -> true :: no msg -> figma 2.1
   */

  const renderPhleboDetailView = (phlObj: any) => {
    const otpToShow = !!phlObj && phlObj?.phleboOTP;
    const phoneNumber = !!phlObj && phlObj?.diagnosticPhlebotomists?.mobile;
    const name = !!phlObj && phlObj?.diagnosticPhlebotomists?.name;
    const checkEta = !!phlObj?.checkinDateTime;
    let phleboEta = '';
    if (checkEta) {
      phleboEta = moment(phlObj?.checkinDateTime)?.format('hh:mm A');
    }
    const isCallingEnabled = !!phlObj ? phlObj?.allowCalling : false;
    const showVaccinationStatus = !!phlObj?.diagnosticPhlebotomists?.vaccinationStatus;
    const allowCallingETAText = !!phlObj && phlObj?.allowCallingETAText;
    const isNewPhleboAssigned = !!phlObj && phlObj?.isPhleboChanged;
    const changeVaccineStatusStyle =
      source == AppRoutes.TestOrderDetails ? otpToShow : !!name && name?.length > 16 && otpToShow;

    return (
      <>
        <View
          style={[
            styles.mainContainer,
            source == AppRoutes.TestOrderDetails
              ? showCardView
                ? styles.shadowView
                : { borderColor: 'transparent' }
              : {},
          ]}
        >
          <View style={styles.detailContainer}>
            {phoneNumber ? (
              <View style={{ opacity: isCallingEnabled ? 1 : 0.5 }}>
                <TouchableOpacity
                  activeOpacity={0.5}
                  style={styles.callContainer}
                  onPress={() => {
                    isCallingEnabled ? props.onPressCallOption(name, phoneNumber) : {};
                  }}
                >
                  <WhiteProfile />
                  <OrangeCall size="sm" style={styles.profileCircle} />
                </TouchableOpacity>
              </View>
            ) : null}
            {name || isNewPhleboAssigned ? (
              <View style={styles.nameContainer}>
                <Text style={styles.nameTextHeadingStyles}>{`${
                  isNewPhleboAssigned
                    ? `New ${string.diagnostics.agent} Assigned`
                    : `${string.diagnostics.agent} Details`
                }`}</Text>
                <View style={[styles.rowCenter, changeVaccineStatusStyle && styles.columnStyle]}>
                  <Text style={styles.nameTextStyles}>{name}</Text>
                  {renderVaccinationStatus(phlObj, showVaccinationStatus, changeVaccineStatusStyle)}
                </View>
              </View>
            ) : null}
          </View>
          {otpToShow ? (
            <View style={styles.otpBoxConatiner}>
              <Text style={styles.otpBoxTextStyle}>{'OTP'}</Text>
              <Text style={styles.otpBoxTextStyle}>{otpToShow}</Text>
            </View>
          ) : null}
        </View>
        {source == AppRoutes.TestOrderDetails
          ? null
          : (orderLevelStatus === DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED ||
              orderLevelStatus === DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED) &&
            renderYellowSection(
              isCallingEnabled ? string.diagnosticsOrders.callPhleboText : allowCallingETAText
            )}
        {source == AppRoutes.TestOrderDetails
          ? null
          : orderLevelStatus === DIAGNOSTIC_ORDER_STATUS.PHLEBO_CHECK_IN &&
            renderAgentETATracking(checkEta, phlObj)}
      </>
    );
  };

  const renderVaccinationStatus = (
    phlObj: any,
    showVaccinationStatus: boolean,
    changeVaccineStatusStyle: boolean
  ) => {
    return (
      !!showVaccinationStatus &&
      showVaccinationStatus && (
        <View
          style={[
            styles.vaccinationContainer,
            { marginHorizontal: changeVaccineStatusStyle ? 0 : 8 },
          ]}
        >
          <Text style={styles.vaccinationText}>
            {phlObj?.diagnosticPhlebotomists?.vaccinationStatus}
          </Text>
        </View>
      )
    );
  };

  const renderYellowSection = (text: string) => {
    return (
      <>
        {text != '' ? (
          <View style={styles.ratingContainer}>
            <Text style={styles.yellowText}>{text}</Text>
          </View>
        ) : null}
      </>
    );
  };

  const renderAgentETATracking = (checkEta: any, phlObj: any) => {
    let phleboEta = '';
    if (checkEta) {
      phleboEta = moment(phlObj?.checkinDateTime).format('hh:mm A');
    }
    const isPhleboETAElapsed = !!phlObj && phlObj?.isPhleboETAElapsed;
    const phleboETAElapsedMessage = phlObj?.phleboETAElapsedMessage;
    const phleboTrackLink = !!phlObj && phlObj?.phleboTrackLink;
    const orderId = props.orderId?.toString();

    return (
      <>
        {checkEta ? (
          <View style={styles.otpContainer}>
            <View style={styles.etaContainer}>
              <LocationOutline style={styles.locationIcon} />
              <Text style={styles.otpTextStyle}>
                {!!isPhleboETAElapsed && isPhleboETAElapsed
                  ? phleboETAElapsedMessage
                  : `Apollo agent will arrive by ${phleboEta}`}
              </Text>
            </View>
            {phleboTrackLink ? (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {
                  try {
                    Linking.canOpenURL(phleboTrackLink).then((supported) => {
                      if (supported) {
                        DiagnosticTrackPhleboClicked(
                          orderId,
                          'My Order',
                          currentPatient,
                          'Yes',
                          isDiagnosticCircleSubscription
                        );
                        Linking.openURL(phleboTrackLink);
                      } else {
                        DiagnosticTrackPhleboClicked(
                          orderId,
                          'My Order',
                          currentPatient,
                          'No',
                          isDiagnosticCircleSubscription
                        );
                        setBugFenderLog('FAILED_OPEN_URL', phleboTrackLink);
                      }
                    });
                  } catch (e) {
                    DiagnosticTrackPhleboClicked(
                      orderId,
                      'My Order',
                      currentPatient,
                      'No',
                      isDiagnosticCircleSubscription
                    );
                    setBugFenderLog('FAILED_OPEN_URL', phleboTrackLink);
                  }
                }}
              >
                <Text style={styles.trackStyle}>
                  {nameFormater('Track Apollo agent ', 'upper')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </>
    );
  };

  return renderPhleboDetailView(phleboDetailsObject);
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: colors.WHITE,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderRadius: 10,
    padding: 10,
    borderColor: colors.BLACK_COLOR,
  },
  detailContainer: {
    flexDirection: 'row',
    width: '80%',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  callContainer: {
    margin: 0,
    height: 55,
    width: 55,
  },
  nameContainer: {
    justifyContent: 'flex-start',
    alignContent: 'center',
    padding: 10,
    width: '80%',
  },
  nameTextHeadingStyles: {
    ...theme.viewStyles.text('SB', 13, colors.SHERPA_BLUE, 1, 18),
  },
  nameTextStyles: {
    ...theme.viewStyles.text('R', 13, colors.SHERPA_BLUE, 1, 18),
  },
  profileCircle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  otpBoxConatiner: {
    width: 45,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.BLACK_COLOR,
  },
  otpBoxTextStyle: {
    ...theme.viewStyles.text('SB', 13, colors.SHERPA_BLUE, 1, 18),
  },
  vaccinationContainer: {
    backgroundColor: colors.TURQUOISE_LIGHT_BLUE,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 4,
    marginHorizontal: 8,
    maxWidth: '60%',
  },
  vaccinationText: { ...theme.viewStyles.text('M', 12, colors.WHITE, 1, 15) },
  ratingContainer: {
    backgroundColor: colors.TEST_CARD_BUTTOM_BG,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderRadius: 10,
    padding: 10,
  },
  otpContainer: {
    backgroundColor: colors.TEST_CARD_BUTTOM_BG,
    justifyContent: 'space-between',
    flexDirection: 'row',
    minHeight: 40,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderRadius: 10,
    padding: 10,
  },
  etaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '57%',
  },
  locationIcon: {
    width: 15,
    height: 15,
    alignSelf: 'center',
  },
  otpTextStyle: {
    alignSelf: 'center',
    paddingHorizontal: 10,
    color: colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansRegular(10),
  },
  trackStyle: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 11 : 12, colors.APP_YELLOW, 1, 18),
  },
  columnStyle: { flexDirection: 'column', alignItems: 'flex-start' },
  yellowText: { ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 1, 16, 0.04) },
  shadowView: {
    borderColor: 'transparent',
    ...theme.viewStyles.cardViewStyle,
  },
});
