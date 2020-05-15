import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';

const { width } = Dimensions.get('window');

export const ReferralSelectPopupStyles = StyleSheet.create({
  headerStyles: {
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
  headerTextStyle: {
    ...theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE, 1, undefined, 0.5),
    marginRight: 20,
    marginLeft: 20,
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
  closeIcon: { width: 28, height: 28 },
  contentView: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderRadius: 10,
    maxHeight: '85%',
  },
  itemContainer: {
    borderRadius: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    paddingLeft: 10,
    marginVertical: 1,
    borderColor: theme.colors.SEPARATOR_LINE,
    backgroundColor: theme.colors.blackColor(0.01),
    justifyContent: 'center',
  },
  emptyContainer: {
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatListContainerStyle: {
    marginTop: 16,
    marginHorizontal: 16,
    paddingBottom: 40,
  },
  searchTextContainerStyle: {
    height: 44,
    marginTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderWidth: 1,
    borderRadius: 5,
    marginHorizontal: 16,
    borderColor: theme.colors.darkBlueColor(0.15),
  },
  textInputContainer: {
    height: 44,
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    paddingRight: 12,
    ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE),
  },
  buttonStyle: {
    width: (width - 110) / 2,
    marginRight: 16,
  },
  deleteContiner: {
    position: 'absolute',
    right: 10,
  },
});
