/* eslint-disable import/no-default-export */
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  headerStyles: {
    ...theme.viewStyles.cardContainer,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: theme.colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,

    flexDirection: 'row',
  },
  medNameStyles: {
    ...theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE, 1, undefined, 0.5),
    textTransform: 'uppercase',
  },
  buttonView: {
    ...theme.viewStyles.cardContainer,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
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
  touchableCloseIcon: {
    marginTop: Platform.OS === 'ios' ? (isIphoneX() ? 58 : 34) : 50,
    backgroundColor: 'white',
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginRight: 0,
    marginBottom: 8,
  },
  closeIcon: { width: 28, height: 28 },
  contenteView: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.WHITE,
    borderRadius: 10,
    maxHeight: '85%',
  },
  mainContainer: { margin: 16, maxHeight: '80%' },
  headingTextStyles: {
    ...theme.viewStyles.text('R', 12, theme.colors.SHARP_BLUE, 0.6, 16),
    marginTop: 10,
    marginBottom: 20,
  },
  addAllText: {
    ...theme.viewStyles.text('SB', 12, theme.colors.APP_YELLOW, 1, 16),
    marginLeft: 16,
  },
  removeText: {
    ...theme.viewStyles.text('SB', 12, theme.colors.APP_YELLOW, 1, 16),
  },
  noDataText: {
    marginTop: 20,
    textAlign: 'center',
    ...theme.viewStyles.text('M', 12, theme.colors.SHARP_BLUE, 0.6),
  },
  scrollViewStyle: {
    borderWidth: 1,
    borderColor: 'rgba(2, 71, 91, 0.2)',
    borderRadius: 5,
    backgroundColor: '#F9F9F9',
  },
  itemContainer: {
    minHeight: 44,
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F9F9F9',
  },
  seperator: {
    height: 2,
    width: '95%',
    alignSelf: 'center',
    backgroundColor: 'rgba(2, 71, 91, 0.2)',
  },
});
