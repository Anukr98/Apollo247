/* eslint-disable import/no-default-export */
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet, Dimensions, Platform } from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  headerContainer: {
    ...theme.viewStyles.cardContainer,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: theme.colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    width: width - 60,
    flexDirection: 'row',
  },
  headeText: {
    ...theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE, 1, undefined, 0.5),
    marginLeft: 20,
    marginRight: 20,
  },
  buttonView: {
    ...theme.viewStyles.cardContainer,
    width: '100%',
    flexDirection: 'row',
    padding: 16,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
  },
  inputStyles: {
    borderWidth: 2,
    borderRadius: 10,
    height: 80,
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 12,
    paddingTop: 12,
    borderColor: theme.colors.APP_GREEN,
    ...theme.viewStyles.text('M', 14, theme.colors.INPUT_TEXT),
  },
  mainView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 5,
    elevation: 500,
  },
  touchableStyles: {
    marginTop: Platform.OS === 'ios' ? (isIphoneX ? 58 : 34) : 50,
    backgroundColor: 'white',
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginRight: 0,
    marginBottom: 8,
  },
  removeIconStyle: { width: 28, height: 28 },
  dataView: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderRadius: 10,
    maxHeight: '85%',
  },
});