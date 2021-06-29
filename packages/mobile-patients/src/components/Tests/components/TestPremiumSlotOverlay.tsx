import { AphOverlayProps } from '@aph/mobile-patients/src/components/ui/AphOverlay';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  Morning,
  Afternoon,
  Night,
  MorningSelected,
  AfternoonSelected,
  NightSelected,
  EmptySlot,
  CrossPopup,
  PremiumIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { GET_CUSTOMIZED_DIAGNOSTIC_SLOTS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  formatTestSlot,
  g,
  getTestSlotDetailsByTime,
  getUniqueTestSlots,
  handleGraphQlError,
  TestSlot,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  getDiagnosticSlotsCustomized,
  getDiagnosticSlotsCustomizedVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlotsCustomized';
import { Overlay } from 'react-native-elements';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { createAddressObject } from '@aph/mobile-patients/src/utils/commonUtils';
import { colors } from '@aph/mobile-patients/src/theme/colors';

export interface TestPremiumSlotOverlayProps extends AphOverlayProps {
  source?: string;
  isVisible: boolean;
  onGoBack: any;
}
const { width } = Dimensions.get('window');
export const TestPremiumSlotOverlay: React.FC<TestPremiumSlotOverlayProps> = (props) => {
  //   const [date, setDate] = useState<Date>(props.date);
  const { isVisible, onGoBack, ...attributes } = props;
  const renderButtons = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          margin: 15,
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={()=>{
          onGoBack()
        }}>
          <Text style={[styles.yellowText, { fontSize: width > 380 ? 14 : 13 }]}> GO BACK</Text>
        </TouchableOpacity>
        <Button
          style={{ width: '30%', alignSelf: 'center' }}
          onPress={() => {
            // onSchedule(date!, slotInfo!);
            props.onClose()
          }}
          // disabled={isDoneBtnDisabled}
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
      <>
        <TouchableOpacity
          style={styles.closeContainer}
          onPress={() => {
            props.onClose();
          }}
        >
          <CrossPopup />
        </TouchableOpacity>
        <View style={styles.containerStyle}>
          <Text
            style={[
              {
                ...theme.fonts.IBMPlexSansMedium(17),
                color: theme.colors.LIGHT_BLUE,
                padding: 15,
              },
              props.headingTextStyle,
            ]}
          >
            {props.heading}
          </Text>
          <View style={styles.slotContainer}>
            <Text style={styles.appointmentText}>Appointment on</Text>
            <Text
              style={[styles.appointmentText, { color: colors.APP_GREEN, marginHorizontal: 5 }]}
            >
              15 Feb 2021 , 6:00am
            </Text>
          </View>
          <View style={styles.premiumTag}>
            <PremiumIcon style={styles.premiumIcon} />
            <View style={styles.premiumContainer}>
              <Text style={styles.premiumText}>This is a Premium Slot -</Text>
              <Text style={[styles.premiumText, { fontWeight: 'bold', marginHorizontal: 0 }]}>
                Additional charge of ₹125
              </Text>
              <Text style={styles.premiumText}>will be levied on your total amount. </Text>
            </View>
          </View>
          {renderButtons()}
        </View>
      </>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 550,
  },
  containerContentStyle: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  closeContainer: {
    alignSelf: 'flex-end',
    marginTop: 500,
    marginHorizontal: 20,
    position: 'absolute',
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
    ...theme.viewStyles.text('SB', 12, colors.SHERPA_BLUE, 1),
    marginHorizontal: 5,
  },
  appointmentText: {
    ...theme.viewStyles.text('SB', 14, colors.SHERPA_BLUE, 1),
    // marginHorizontal: 5,
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
});
