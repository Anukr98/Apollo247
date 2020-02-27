import { StyleSheet, Dimensions } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';
const { height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    backgroundColor: theme.colors.WHITE,
    height: height === 812 || height === 896 ? 80 : 70,
    paddingHorizontal: 20,
    shadowColor: theme.colors.WHITE,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  absoluteStyles: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
