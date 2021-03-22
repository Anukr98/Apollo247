import { Apollo247Icon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { TouchableOpacity, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

export interface Props {
  title: string;
  description: string;
  note: string;
  onPressUpload: () => void;
  style?: StyleProp<ViewStyle>;
}

export const PrescriptionInfoView: React.FC<Props> = ({
  title,
  description,
  note,
  onPressUpload,
  style,
}) => {
  const question = 'Already have a prescription, why wait for later?';
  const button = 'UPLOAD NOW';
  const noteHeading = 'Note: ';

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rowContainer}>
        <Apollo247Icon style={styles.apollo247Icon} />
        <Text style={styles.rowText}>{description}</Text>
      </View>
      <TouchableOpacity onPress={onPressUpload}>
        <Text style={styles.question}>{question}</Text>
        <Text style={styles.button}>{button}</Text>
      </TouchableOpacity>
      <Text>
        <Text style={styles.noteHeading}>{noteHeading}</Text>
        <Text style={styles.note}>{note}</Text>
      </Text>
    </View>
  );
};
const { text } = theme.viewStyles;

const styles = StyleSheet.create({
  container: {
    margin: 12,
    backgroundColor: '#FFF',
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderColor: '#01475B',
    borderWidth: 1,
    borderRadius: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  title: {
    ...text('SB', 16, '#01475B'),
    marginBottom: 13,
  },
  rowText: {
    paddingLeft: 10,
    ...text('R', 13, '#01475B'),
    flex: 1,
  },
  question: {
    ...text('SB', 13, '#01475B'),
    marginBottom: 4,
  },
  button: {
    ...text('B', 12, '#FC9916'),
    marginBottom: 12,
    textAlign: 'right',
  },
  note: {
    ...text('R', 10, '#02475B'),
  },
  noteHeading: {
    ...text('M', 10, '#02475B'),
  },
  apollo247Icon: {
    height: 48,
    width: 48,
    marginTop: -6,
  },
});
