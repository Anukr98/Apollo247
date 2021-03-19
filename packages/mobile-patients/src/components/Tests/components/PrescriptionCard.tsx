import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { PrescriptionPad } from '@aph/mobile-patients/src/components/ui/Icons';
import { colors } from '@aph/mobile-patients/src/theme/colors';

interface PrescriptionCardProps {
  heading1?: string;
  docName?: string;
  docQualification?: string;
  buttonTitle: string;
  dateTime?: string;
  patientName?: string;
  onPressBookNow: () => void;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = (props) => {
  return (
    <View style={styles.container}>
      <View style={styles.rowStyles}>
        <View>
          {!!props.heading1 ? <Text style={styles.heading1}>{props.heading1}</Text> : null}
          {!!props.docName ? <Text style={styles.heading2}>{props.docName}</Text> : null}
          {!!props.docQualification ? (
            <Text style={styles.heading3}>{props.docQualification}</Text>
          ) : null}
          {!!props.dateTime ? <Text style={styles.dateTimeTxt}>{props.dateTime}</Text> : null}
          {!!props.patientName ? <Text style={styles.heading4}>{props.patientName}</Text> : null}
        </View>
        <View>
          <PrescriptionPad style={styles.imageStyle} />
        </View>
      </View>
      <View style={{ alignSelf: 'flex-end' }}>
        <TouchableOpacity onPress={props.onPressBookNow}>
          <Text style={styles.bookNowText}>{props.buttonTitle}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...theme.viewStyles.cardViewStyle, padding: 16, margin: 16 },
  rowStyles: { flexDirection: 'row', justifyContent: 'space-between' },
  heading1: { ...theme.viewStyles.text('R', 12, colors.SHERPA_BLUE, 1, 20) },
  heading2: {
    marginVertical: '2%',
    ...theme.viewStyles.text('M', 14, colors.SHERPA_BLUE, 1, 20),
    textTransform: 'uppercase',
  },
  heading3: {
    ...theme.viewStyles.text('R', 12, colors.SHERPA_BLUE, 1, 20),
    textTransform: 'uppercase',
  },
  dateTimeTxt: {
    marginVertical: '2%',
    ...theme.viewStyles.text('R', 12, colors.SHERPA_BLUE, 1, 18),
  },
  heading4: {
    marginVertical: '3%',
    ...theme.viewStyles.text('M', 14, colors.APP_GREEN, 1, 18),
  },
  imageStyle: { width: 22, height: 28, resizeMode: 'contain' },
  bookNowText: {
    ...theme.viewStyles.text('B', 14, theme.colors.APP_YELLOW, 1, 20),
    textAlign: 'right',
  },
});
