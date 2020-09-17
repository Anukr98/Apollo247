import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet } from 'react-native';

export const DiagnosticsCardStyles = StyleSheet.create({
  containerStyle: {
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(2, 71, 91, 0.15)',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textViewStyle: {
    flex: 1,
    marginTop: 12,
    marginBottom: 14,
    marginLeft: 12,
  },
  doctorNameStyles: theme.viewStyles.text('SB', 14, theme.colors.SHARP_BLUE),
  subtextStyle: theme.viewStyles.text('M', 12, theme.colors.SHARP_BLUE, 0.6),
  iconContainer: { margin: 12, flex: 0, justifyContent: 'center' },
});
