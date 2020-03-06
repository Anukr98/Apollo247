/* eslint-disable import/no-default-export */
import { Dimensions, StyleSheet, Platform } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';
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
  headerText: {
    ...theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE, 1, undefined, 0.5),
    marginLeft: 20,
    marginRight: 20,
  },
  buttonsView: {
    ...theme.viewStyles.cardContainer,
    width: '100%',
    flexDirection: 'row',
    padding: 16,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchListView: {
    ...theme.viewStyles.whiteRoundedCornerCard,
    elevation: 30,
    shadowRadius: 6,
    shadowOpacity: 1,
    maxHeight: '70%',
  },
  nameView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderColor: theme.colors.SEPARATOR_LINE,
  },
  nameText: {
    flex: 0.98,
    ...theme.viewStyles.text('M', 16, theme.colors.darkBlueColor(1)),
  },
  selectedList: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  inputView: { ...theme.viewStyles.cardContainer, marginTop: 20, marginBottom: 20, padding: 16 },
  textInputstyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: '100%',
    color: '#01475b',
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderColor: theme.colors.APP_GREEN,
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
  touchableStyle: {
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
  removeStyle: { width: 28, height: 28 },
  dataView: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderRadius: 10,
    maxHeight: '85%',
  },
});
