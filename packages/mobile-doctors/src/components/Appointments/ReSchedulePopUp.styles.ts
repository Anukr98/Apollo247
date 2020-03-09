import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet, Platform } from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';

export default StyleSheet.create({
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 0,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  placeholderTextStyle: {
    ...theme.viewStyles.text('M', 14, '#01475b'),
    marginRight: 10,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  optionsView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 16,
    paddingLeft: 8,
    justifyContent: 'center',
  },
  buttonStyle: {
    width: 'auto',
    marginRight: 8,
    marginTop: 12,
    backgroundColor: theme.colors.WHITE,
  },
  buttonTextStyle: {
    paddingHorizontal: 12,
    color: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansMedium(15),
  },
  tab: {
    backgroundColor: theme.colors.CARD_BG,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.3)',
  },
  slot: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#0087ba',
    paddingTop: 16,
  },
  header: {
    ...theme.viewStyles.cardContainer,
    zIndex: 1,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: theme.colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    width: '100%',
  },
  mainview: {
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
  icon: {
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
  card: {
    ...theme.viewStyles.cardContainer,
    marginTop: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  headerMainView: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderRadius: 10,
    maxHeight: '85%',
  },
});
