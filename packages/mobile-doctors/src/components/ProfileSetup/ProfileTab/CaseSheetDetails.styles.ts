/* eslint-disable import/no-default-export */
import { StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  symptomView: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  symptomText: theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE),
  symptomdetails: theme.viewStyles.text('S', 12, theme.colors.SHARP_BLUE),
  lablestyle: theme.viewStyles.text('M', 14, theme.colors.darkBlueColor(0.6)),
  descrText: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE, 1, 20),
    marginBottom: 20,
  },
  caseSheetNote: theme.viewStyles.text('S', 12, theme.colors.SHARP_BLUE, 1, 20),
  caseSheetDescrView: { marginTop: 10, marginBottom: 20, flexDirection: 'row', flexWrap: 'wrap' },
  capsuleContainer: { marginRight: 12, marginBottom: 12 },
  MPView: { marginHorizontal: 16, marginBottom: 20 },
  medicineName: {
    ...theme.viewStyles.text('B', 14, theme.colors.LIGHT_BLUE),
    marginTop: 8,
    marginBottom: 2,
  },
  medDescription: theme.viewStyles.text('S', 12, theme.colors.SHARP_BLUE, 1, 14, 0.02),
  TPview: { marginHorizontal: 16, marginBottom: 20 },
  referralView: { marginHorizontal: 16, marginBottom: 20 },
  referralText: theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE),
  adviceText: { ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE), marginTop: 8 },
  scrollViewText: {
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE),
    marginTop: 15,
    marginHorizontal: 20,
    marginBottom: 4,
  },
  apptId: {
    ...theme.viewStyles.text('M', 14, theme.colors.darkBlueColor(0.6)),
    marginHorizontal: 20,
    marginBottom: 6,
  },
});
