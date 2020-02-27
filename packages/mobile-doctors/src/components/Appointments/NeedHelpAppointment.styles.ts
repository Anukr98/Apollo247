import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  mainview: {
    marginTop: 16,
    marginBottom: 20,
    marginLeft: 16,
  },
  descriptionview: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#0087ba',
    lineHeight: 24,
    marginRight: 16,
  },
  fullview: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    margin: 20,
  },
});
