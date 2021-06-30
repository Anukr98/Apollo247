import { AphOverlayProps } from '@aph/mobile-patients/src/components/ui/AphOverlay';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { PremiumIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { Dimensions, StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { Overlay } from 'react-native-elements';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import string from '@aph/mobile-patients/src/strings/strings.json';
import moment from 'moment';

export interface TestPremiumSlotOverlayProps extends AphOverlayProps {
  source?: string;
  isVisible: boolean;
  onGoBack: any;
  slotDetails: any;
}
const { width } = Dimensions.get('window');
export const TestPremiumSlotOverlay: React.FC<TestPremiumSlotOverlayProps> = (props) => {
  const { isVisible, onGoBack, slotDetails, ...attributes } = props;

  const renderButtons = () => {
    return (
      <View style={styles.buttonView}>
        <TouchableOpacity
          onPress={() => {
            onGoBack();
          }}
        >
          <Text style={[styles.yellowText, { fontSize: width > 380 ? 14 : 13 }]}> GO BACK</Text>
        </TouchableOpacity>
        <Button
          style={styles.confirmStyle}
          onPress={() => {
            props.onClose();
          }}
          title={'CONFIRM'}
        />
      </View>
    );
  };
  return (
    <Overlay
      isVisible
      onRequestClose={() => props.onClose()}
      windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
      containerStyle={{ marginBottom: 0 }}
      fullScreen
      transparent
      overlayStyle={styles.phrOverlayStyle}
    >
      <TouchableOpacity style={{ flex: 1 }} onPress={() => {}}>
        <SafeAreaView style={[styles.overlaySafeArea, styles.overlayTouch]}>
          <View style={styles.overlayContainer}>
            <Text style={styles.headingStyle}>{props.heading}</Text>
            {!!slotDetails?.selectedDate && !!slotDetails?.slotStartTime ? (
              <View style={styles.slotContainer}>
                <Text style={styles.appointmentText}>Appointment on</Text>
                <Text style={styles.greenTextStyle}>
                  {moment(slotDetails?.selectedDate)?.format('DD MMM YYYY')} ,{' '}
                  {moment(slotDetails?.slotStartTime, 'HH:mm')?.format('hh:mm a')}
                </Text>
              </View>
            ) : null}
            {slotDetails?.distanceCharges > 0 ? (
              <View style={styles.premiumTag}>
                <PremiumIcon style={styles.premiumIcon} />
                <View style={styles.premiumContainer}>
                  <Text style={styles.premiumText}>
                    {string.diagnosticsCartPage.paidSlotHeading}
                  </Text>
                  <Text style={styles.additionalCharge}>
                    {string.diagnosticsCartPage.additionalChargeText} {string.common.Rs}
                    {slotDetails?.distanceCharges}
                  </Text>
                  <Text style={styles.premiumText}>{string.diagnosticsCartPage.levidText}</Text>
                </View>
              </View>
            ) : null}
            {renderButtons()}
          </View>
        </SafeAreaView>
      </TouchableOpacity>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  slotContainer: { flexDirection: 'row', justifyContent: 'flex-start', marginLeft: 15 },
  phrOverlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    elevation: 0,
    bottom: 0,
    position: 'absolute',
  },
  premiumContainer: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    flexGrow: 1,
    flexShrink: 1,
  },
  yellowText: { ...theme.viewStyles.yellowTextStyle },
  premiumTag: {
    backgroundColor: '#FCFDDA',
    flexDirection: 'row',
    borderRadius: 10,
    margin: 10,
    padding: 10,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  premiumText: {
    ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 1),
    marginHorizontal: 5,
  },
  appointmentText: {
    ...theme.viewStyles.text('M', 14, colors.SHERPA_BLUE, 1),
  },
  premiumIconAbsolute: {
    width: 16,
    height: 16,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  premiumIcon: {
    width: 16,
    height: 16,
    margin: 5,
  },
  dateContainer: {
    marginHorizontal: width > 400 ? 5 : 1, //5
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.APP_GREEN,
  },
  dayPhaseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  dayPhaseStyle: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  dateStyle: {
    ...theme.viewStyles.text('M', 17, 'white'),
  },
  dayStyle: {
    ...theme.viewStyles.text('M', 12, 'white'),
  },
  timeContainer: {
    width: '94%',
    alignSelf: 'center',
    // backgroundColor: '#c8c8c8',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSlotsContainer: {
    width: '94%',
    paddingVertical: 40,
    alignSelf: 'center',
    // backgroundColor: '#c8c8c8',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSlotsText: {
    ...theme.viewStyles.text('SB', 17, theme.colors.SHERPA_BLUE),
  },
  dateContentStyle: {
    width: 68,
    height: 42,
    margin: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  dateTextStyle: {
    ...theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE),
  },
  optionsView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 16,
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 6,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  placeholderTextStyle: {
    ...theme.viewStyles.text('M', 16, '#01475b'),
  },
  sectionStyle: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.CARD_BG,
    marginBottom: 16,
  },
  menuStyle: {
    alignItems: 'flex-end',
    marginTop: -40,
    marginLeft: width / 2 - 90,
  },
  monthHeading: {
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
    padding: 10,
  },
  dateArrayContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  overlaySafeArea: { flex: 1 },
  overlayContainer: {
    backgroundColor: 'white',
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'transparent',
  },
  overlayTouch: {
    width: '100%',
    backgroundColor: colors.CLEAR,
    bottom: 0,
    position: 'absolute',
  },
  buttonView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 15,
    alignItems: 'center',
  },
  confirmStyle: { width: '30%', alignSelf: 'center' },
  headingStyle: {
    ...theme.fonts.IBMPlexSansSemiBold(17),
    color: theme.colors.LIGHT_BLUE,
    padding: 15,
    lineHeight: 24,
  },
  greenTextStyle: {
    ...theme.viewStyles.text('SB', 14, colors.APP_GREEN, 1),
    marginHorizontal: 5,
  },
  additionalCharge: {
    fontWeight: 'bold',
    marginHorizontal: 0,
    ...theme.viewStyles.text('SB', 12, colors.SHERPA_BLUE, 1),
  },
});
