import { theme } from 'app/src/theme/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SelectableButton } from './ui/SelectableButton';
import { SquareCardWithTitle } from './ui/SquareCardWithTitle';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  consultTypeSelection: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  consultDescText: {
    ...theme.fonts.IBMPlexSansMedium(14),
    opacity: 0.5,
    color: '#02475b',
    marginTop: 16,
    marginHorizontal: 16,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 21,
  },
  consultationTiming: {
    ...theme.fonts.IBMPlexSansMedium(20),
    color: theme.colors.darkBlueColor(),
    letterSpacing: 0.09,
  },
  fixedSlotText: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: '#ff748e',
  },
  daysText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.darkBlueColor(),
    letterSpacing: 0.05,
    marginBottom: 19,
    marginHorizontal: 16,
  },
  addConsultationText: {
    ...theme.fonts.IBMPlexSansBold(14),
    color: '#fc9916',
    paddingVertical: 23,
    marginHorizontal: 16,
  },
});

export const Availability: React.FC = () => {
  const [consultationType, setConsultationType] = useState({ physical: false, online: false });
  return (
    <View style={styles.container}>
      <SquareCardWithTitle title="Consultation Type" containerStyle={{ marginTop: 16 }}>
        <Text style={styles.consultDescText}>What type of consults will you be available for?</Text>
        <View style={styles.consultTypeSelection}>
          <SelectableButton
            containerStyle={{ marginRight: 20 }}
            onChange={(isChecked) => {
              setConsultationType({ ...consultationType, physical: isChecked });
            }}
            title="Physical"
            isChecked={consultationType.physical}
          />
          <SelectableButton
            onChange={(isChecked) => {
              setConsultationType({ ...consultationType, online: isChecked });
            }}
            title="Online"
            isChecked={consultationType.online}
          />
        </View>
      </SquareCardWithTitle>
      <SquareCardWithTitle title="Consultation Hours" containerStyle={{ marginTop: 16 }}>
        <View style={[theme.viewStyles.whiteRoundedCornerCard, { marginTop: 16 }]}>
          <View style={styles.rowSpaceBetween}>
            <Text style={styles.consultationTiming}>9:00 AM - 12.30 PM</Text>
            <Text style={styles.fixedSlotText}>(FIXED)</Text>
          </View>
          <Text style={styles.daysText}>Mon, Tue, Wed, Thu, Fri | Online, Physical</Text>
        </View>
        <Text style={styles.addConsultationText}>+{'  '}ADD CONSULTATION HOURS</Text>
      </SquareCardWithTitle>
    </View>
  );
};
