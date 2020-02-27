import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  containerStyle: {
    margin: 16,
    borderRadius: 10,
    backgroundColor: theme.colors.CARD_BG,
    padding: 20,
    marginBottom: 10,
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex: 16,
    elevation: 16,
    opacity: 1,
  },
  descriptiontext: {
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansMedium(15),
    textAlign: 'left',
  },
  underline: {
    borderBottomColor: theme.colors.LIGHT_BLUE,
    borderBottomWidth: 1,
    marginTop: 10,
    marginBottom: 10,
    opacity: 0.2,
  },
  viewStyles: { flexDirection: 'row', justifyContent: 'space-between' },
});
