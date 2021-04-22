import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { PrescriptionPad } from '@aph/mobile-patients/src/components/ui/Icons';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';

interface PrescriptionCardProps {
  heading1?: string;
  docName?: string;
  docQualification?: string;
  buttonTitle: string;
  dateTime?: string;
  patientName?: string;
  onPressBookNow?: () => void;
  onPressViewPrescription?: () => void;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = (props) => {
  return (
    <View style={styles.container}>
      <View style={styles.rowStyles}>
        <View>
          {!!props.heading1 ? <Text style={styles.heading1}>{props.heading1}</Text> : null}
          {!!props.docName ? (
            <Text style={styles.heading2}>{nameFormater(props.docName, 'upper')}</Text>
          ) : null}
          {!!props.docQualification ? (
            <Text style={styles.heading3}>{nameFormater(props.docQualification, 'upper')}</Text>
          ) : null}
          {!!props.dateTime ? <Text style={styles.dateTimeTxt}>{props.dateTime}</Text> : null}
          {!!props.patientName ? <Text style={styles.heading4}>{props.patientName}</Text> : null}
        </View>
        <View>
          <TouchableOpacity
            onPress={props.onPressViewPrescription}
            style={{ height: 40, width: 40 }}
            activeOpacity={1}
          >
            <PrescriptionPad style={styles.imageStyle} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.buttonView}>
        <TouchableOpacity onPress={props.onPressBookNow}>
          <Text style={styles.bookNowText}>{nameFormater(props.buttonTitle, 'upper')}</Text>
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
  heading1: { ...theme.viewStyles.text('M', 12.5, colors.SHERPA_BLUE, 1, 20) },
  heading2: {
    ...theme.viewStyles.text('SB', 15, colors.SHERPA_BLUE, 1, 20),
    marginTop: 8,
  },
  heading3: {
    ...theme.viewStyles.text('R', 12.5, colors.SHERPA_BLUE, 1, 20),
    marginTop: 4,
  },
  dateTimeTxt: {
    ...theme.viewStyles.text('R', 12.5, colors.SHERPA_BLUE, 1, 18),
    marginTop: 4,
  },
  heading4: {
    ...theme.viewStyles.text('M', 14, colors.APP_GREEN, 1, 18),
    marginTop: 8,
  },
  imageStyle: { width: 37, height: 37, resizeMode: 'contain' },
  buttonView: { alignSelf: 'flex-end', marginTop: 6 },
  bookNowText: {
    ...theme.viewStyles.text('B', 15, theme.colors.APP_YELLOW, 1, 20),
    textAlign: 'right',
  },
});
