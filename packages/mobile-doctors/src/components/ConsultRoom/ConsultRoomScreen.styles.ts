import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet, Platform, Dimensions } from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';

const { height, width } = Dimensions.get('window');

export const ConsultRoomScreenStyles = StyleSheet.create({
  mainview: {
    backgroundColor: '#ffffff',
    height: 50,
  },
  shadowview: {
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 0,
    backgroundColor: 'white',
  },
  imageStyle: {
    width: 32,
    height: 32,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  automatedLeftText: {
    ...theme.viewStyles.text('M', 15, theme.colors.WHITE),
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 16,
    textAlign: 'left',
  },
  automatedRightText: {
    ...theme.viewStyles.text('M', 10, theme.colors.WHITE),
    paddingHorizontal: 16,
    paddingVertical: 4,
    textAlign: 'right',
  },
  automatedTextView: {
    backgroundColor: '#0087ba',
    marginLeft: 38,
    borderRadius: 10,
  },
  inputTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#01475b',
    paddingBottom: 20,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0,0.1)',
    zIndex: 5,
    elevation: 200,
  },
  menucontainer: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: Platform.OS === 'ios' ? (isIphoneX() ? 80 : 58) : 36,
    backgroundColor: theme.colors.WHITE,
    paddingHorizontal: 12,
    paddingVertical: 3,
    minHeight: 20,
    minWidth: width / 3,
    borderRadius: 10,
  },
  menuTextContainer: {
    minHeight: 20,
    minWidth: width / 3,
    justifyContent: 'center',
  },
  menuItemText: {
    ...theme.viewStyles.text('M', 13, theme.colors.SHARP_BLUE),
    marginVertical: 9,
    marginLeft: 2,
  },
  seperatorStyle: {
    height: 1,
    width: '100%',
    backgroundColor: theme.colors.SEPARATOR_LINE,
    opacity: 0.5,
  },
});
