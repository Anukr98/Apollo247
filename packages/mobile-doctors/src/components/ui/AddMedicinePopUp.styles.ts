/* eslint-disable import/no-default-export */
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  chipContainerStyle: {
    maxWidth: (width - 150) / 2,
    marginRight: 10,
    marginTop: 8,
  },
  chiptextStyle: {
    paddingTop: 0,
    paddingBottom: 2,
    paddingLeft: 16,
    paddingRight: 16,
    ...theme.viewStyles.text('S', 12, theme.colors.APP_GREEN),
  },
  chipSelectedTextStyle: {
    paddingTop: 0,
    paddingBottom: 2,
    paddingLeft: 16,
    paddingRight: 16,
    ...theme.viewStyles.text('SB', 12, theme.colors.WHITE),
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: '100%',
    color: '#01475b',
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderColor: theme.colors.APP_GREEN,
  },
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
  touchableStyles: { left: 16, position: 'absolute' },
  backArrowIcon: { width: 24, height: 15 },
  medNameStyles: {
    ...theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE, 1, undefined, 0.5),

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
  medTypeViewText: { ...theme.viewStyles.text('M', 14, theme.colors.INPUT_TEXT), paddingBottom: 8 },
  medTypeView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  textInputStyles: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: (width - 110) / 2,
    color: '#01475b',
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderColor: theme.colors.APP_GREEN,
    paddingTop: 0,
    marginTop: 10,
  },
  textInputDisabledStyles: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: (width - 110) / 2,
    color: '#01475b',
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderColor: theme.colors.SEPARATOR_LINE,
    paddingTop: 0,
    marginTop: 10,
  },
  textInputStyles2: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: (width - 120) / 4,
    color: '#01475b',
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderColor: theme.colors.APP_GREEN,
    paddingTop: 0,
    marginTop: 10,
  },
  materialContainer: {
    alignItems: 'flex-end',
    marginLeft: 0,
    marginTop: 0,
    width: width - 100,
  },
  selTextStyle: {
    ...theme.viewStyles.text('M', 16, '#00b38e'),
    alignSelf: 'flex-start',
  },
  textItemStyle: { ...theme.viewStyles.text('M', 16, '#01475b'), paddingHorizontal: 0 },
  itemContainerStyle: {
    height: 44.8,
    marginHorizontal: 12,
    width: width,
    maxWidth: width - 130,
  },

  MtextView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    borderBottomWidth: 2,
    paddingTop: 0,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  dropValueText: { color: '#01475b', ...theme.fonts.IBMPlexSansMedium(18), paddingBottom: 4 },
  dropDownGreenView: { flex: 1, alignItems: 'flex-end', marginRight: 10 },
  menuContainerStyle: {
    alignItems: 'flex-end',
    marginLeft: 10,
    marginTop: 10,
    width: width - 100,
  },
  seleTextStyle: {
    ...theme.viewStyles.text('M', 16, '#00b38e'),
    alignSelf: 'flex-start',
  },
  itemTextStyle: { ...theme.viewStyles.text('M', 16, '#01475b'), paddingHorizontal: 0 },
  MaterialitemContainerStyle: {
    height: 44.8,
    marginHorizontal: 12,
    width: width,
    maxWidth: width - 130,
  },
  dropDownValueView: {
    flexDirection: 'row',
    marginTop: 10,
  },
  dropdownView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: width - 90,
    borderBottomWidth: 2,
    paddingTop: 0,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  takeDropdownText: { color: '#01475b', ...theme.fonts.IBMPlexSansMedium(18), paddingBottom: 4 },
  dropdownGreenView: { flex: 1, alignItems: 'flex-end', marginRight: 10 },
  forLable: {
    ...theme.viewStyles.text('M', 14, theme.colors.INPUT_TEXT),
    paddingBottom: 0,
    marginTop: 12,
  },
  forInputView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  MMContainer: { alignItems: 'flex-end', marginLeft: (width - 110) / 2 - 130 },
  MMseleStyle: {
    ...theme.viewStyles.text('M', 16, '#00b38e'),
    alignSelf: 'flex-start',
  },
  MMitemText: { ...theme.viewStyles.text('M', 16, '#01475b'), paddingHorizontal: 0 },
  MMitemContainer: { height: 44.8, marginHorizontal: 12, width: (width - 110) / 2 - 60 },
  forDropView: {
    flexDirection: 'row',
    marginTop: 10,
  },
  forDropTextView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: (width - 110) / 2,
    borderBottomWidth: 2,
    paddingTop: 0,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  forDropText: { color: '#01475b', ...theme.fonts.IBMPlexSansMedium(18), paddingBottom: 4 },
  chipCardView: {
    flexDirection: 'row',
    width: width - 90,
    marginTop: 10,
  },
  inTheText: {
    ...theme.viewStyles.text('M', 14, theme.colors.INPUT_TEXT),
    marginTop: 12,
  },
  sessionsView: {
    flexDirection: 'row',
    width: width - 90,
    marginTop: 0,
    flexWrap: 'wrap',
  },
  additionalInstrLabel: {
    ...theme.viewStyles.text('M', 14, theme.colors.INPUT_TEXT),
    paddingBottom: 8,
    marginTop: 10,
  },
  additionalInstrInputstyle: {
    borderWidth: 2,
    borderRadius: 10,
    height: 80,
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 12,
    paddingTop: 12,
    borderColor: theme.colors.APP_GREEN,
  },
  medicineListText: { ...theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE), flex: 0.9 },
  medicineListView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: 13,
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
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderRadius: 10,
    maxHeight: '85%',
  },
  customTextContainer: {
    marginTop: 10,
    flexWrap: 'wrap',
  },
  customTextStyle: {
    ...theme.viewStyles.text('B', 13, theme.colors.APP_YELLOW),
    textTransform: 'uppercase',
  },
  listSpinner: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  routeOfAdminText: {
    ...theme.viewStyles.text('M', 14, theme.colors.INPUT_TEXT),
    padding: 0,
    marginTop: 12,
  },
});
