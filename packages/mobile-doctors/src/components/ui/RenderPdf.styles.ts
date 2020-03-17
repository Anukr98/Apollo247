import { StyleSheet, Platform, Dimensions } from 'react-native';

import { isIphoneX } from 'react-native-iphone-x-helper';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

const { height } = Dimensions.get('window');

export default StyleSheet.create({
  popUPContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, .8)',
    zIndex: 5,
    elevation: 3,
  },
  headerContainer: {
    flexDirection: 'row',
    marginTop: Platform.OS === 'ios' ? (isIphoneX ? 58 : 34) : 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
  },
  headerIconStyle: {
    backgroundColor: 'white',
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  pdfContainer: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 0,
    height: 'auto',
    maxHeight: height - 150,
    overflow: 'hidden',
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  stickyBottomStyle: {
    ...theme.viewStyles.cardContainer,
    paddingHorizontal: 0,
    height: 80,
    paddingTop: 0,
  },
});
