import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';

const windowWidth = Dimensions.get('window').width;

export interface MedicineNoteProps {}

export const MedicineNote: React.FC<MedicineNoteProps> = (props) => {
  const renderNote = () => {
    return <Text style={styles.note}>{string.consultPayment.medicineNote}</Text>;
  };
  return <View style={styles.container}>{renderNote()}</View>;
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#D4D4D4',
    marginHorizontal: 16,
  },
  note: {
    ...theme.fonts.IBMPlexSansRegular(10),
    lineHeight: 13,
    color: '#68919D',
    paddingHorizontal: 12,
  },
});
