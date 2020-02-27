import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  tabContainerView: {
    flexDirection: 'row',
    overflow: 'hidden',
    alignItems: 'center',
    // marginTop: -5,
  },
  tabView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: -5,
    height: 54,
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.CLEAR,
  },
  textStyle: theme.viewStyles.text('M', 16, 'rgba(2, 71, 91, 0.5)'),
});
