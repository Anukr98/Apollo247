import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  AppointmentIcon,
  MedicalHistoryIcon,
  SampleTestTubesIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { DIAGNOSTIC_ORDER_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  DIAGNOSITC_PHELBO_TRACKING_STATUS,
  DIAGNOSTIC_FULLY_DONE_STATUS_ARRAY,
  DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY,
} from '@aph/mobile-patients/src/strings/AppConfig';

interface HomePageOrderStatusCardProps {
  status: DIAGNOSTIC_ORDER_STATUS;
  patientName?: string;
  appointmentTime?: string | Date;
  onPressBookNow?: () => void;
}

export const HomePageOrderStatusCard: React.FC<HomePageOrderStatusCardProps> = (props) => {
  function getOrderStatusContent(status: DIAGNOSTIC_ORDER_STATUS) {
    var heading, image, content, options;
    if (DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY.includes(status)) {
      heading = string.diagnostics.sampleSubmitted;
      image = <SampleTestTubesIcon style={styles.iconStyle} />;
      content = string.diagnostics.sampleSubmittedContent;
      options = string.diagnostics.sampleCollectedText;
    } else if (DIAGNOSTIC_FULLY_DONE_STATUS_ARRAY.includes(status)) {
      heading = string.diagnostics.reportGenrated;
      image = <MedicalHistoryIcon style={styles.iconStyle} />;
      content = string.diagnostics.viewReportContent;
      options = string.diagnostics.viewReportText;
    } else {
      heading = `${string.diagnostics.bookingFor} ${props.patientName}`;
      image = <AppointmentIcon style={styles.iconStyle} />;
      content = `${string.diagnostics.collectionAppointmentContent} ${props.appointmentTime}`;
      options = DIAGNOSITC_PHELBO_TRACKING_STATUS.includes(status)
        ? string.diagnostics.trackPhleboText
        : string.diagnostics.collectionText;
    }
    return {
      heading,
      image,
      content,
      options,
    };
  }

  const { heading, image, content, options } = getOrderStatusContent(props.status);
  return (
    <View style={styles.container}>
      <View style={styles.rowStyles}>
        <Text style={styles.heading1}>{nameFormater(heading, 'upper')}</Text>
        {image}
      </View>
      <View>
        <Text style={styles.content}>{content}</Text>
      </View>
      <View style={styles.buttonView}>
        <TouchableOpacity onPress={props.onPressBookNow}>
          <Text style={styles.bookNowText}>{nameFormater(options, 'upper')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.cardViewStyle,
    padding: 16,
    margin: 16,
  },
  rowStyles: { flexDirection: 'row', justifyContent: 'space-between' },
  heading1: { ...theme.viewStyles.text('M', 16, colors.SHERPA_BLUE, 1, 20) },
  content: {
    ...theme.viewStyles.text('R', 12.5, colors.SHERPA_BLUE, 1, 18),
    marginTop: 6,
  },
  buttonView: { alignSelf: 'flex-end', marginTop: 15 },
  bookNowText: {
    ...theme.viewStyles.text('B', 15, theme.colors.APP_YELLOW, 1, 20),
    textAlign: 'right',
  },
  iconStyle: { height: 35, width: 35, resizeMode: 'contain' },
});
