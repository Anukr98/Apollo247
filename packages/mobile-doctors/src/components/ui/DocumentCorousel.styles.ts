import { StyleSheet, Platform, Dimensions } from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
const { height, width } = Dimensions.get('window');

export const DocumentCorouselStyles = StyleSheet.create({
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
    marginTop: Platform.OS === 'ios' && isIphoneX ? 40 : 14,
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
    overflow: 'hidden',
  },
  docContainer: {
    backgroundColor: 'rgba(0, 0, 0, .8)',
    zIndex: 5,
    elevation: 3,
    left: 0,
    right: 0,
    paddingBottom: 10,
  },
  pdfView: {
    width: width - 40,
    height: height - 180,
    backgroundColor: 'transparent',
    paddingBottom: 20,
  },
  pageControlView: {
    position: 'absolute',
    bottom: 70,
    zIndex: 1,
    alignSelf: 'center',
  },
  currentIndicatorStyle: {
    borderColor: 'white',
    width: 15,
    borderWidth: 1,
    borderRadius: 5,
  },
});
