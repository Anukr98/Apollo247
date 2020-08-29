import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { ifIphoneX, isIphoneX } from 'react-native-iphone-x-helper';
import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  casesheetView: {
    width: '100%',
    ...theme.viewStyles.container,
  },
  nameText: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(20),
    marginLeft: 20,
  },
  agetext: {
    color: 'rgba(2, 71, 91, 0.8)',
    ...theme.fonts.IBMPlexSansMedium(16),
    marginLeft: 15,
  },
  understatusline: {
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: 'rgba(2, 71, 91, 0.4)',
    ...ifIphoneX(
      {
        height: 1,
      },
      {
        height: 1,
      }
    ),
    marginLeft: 20,
    marginRight: 54,
    marginBottom: 16,
  },
  line: {
    height: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(2, 71, 91, 0.6)',
    marginLeft: 15,
    // marginTop: 10,
  },
  uhidText: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: 'rgba(2, 71, 91, 0.6)',
    marginLeft: 20,
    marginBottom: 11.5,
  },
  appid: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#02475b',
  },
  appdate: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: '#02475b',
  },
  contentContainer: {},
  underlineend: {
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#02475b',
    opacity: 0.4,
    ...ifIphoneX(
      {
        height: 1,
      },
      {
        height: 1,
      }
    ),
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 12,
    marginTop: 5,
  },

  buttonStyle: {
    width: '50%',
    flex: 1,

    marginBottom: 20,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 2,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
  },
  buttonendStyle: {
    width: '45%',
    height: 40,
    backgroundColor: '#890000',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.4,
    elevation: 2,
  },
  buttonsaveStyle: {
    width: '35%',
    height: 40,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 2,
  },
  buttonTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'center',
  },
  footerButtonsContainer: {
    justifyContent: 'center',
    height: '100%',
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  footerButtonsContainersave: {
    zIndex: -1,
    justifyContent: 'center',
    flexDirection: 'row',
    height: '100%',
    width: '80%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  inputView: {
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
  inputSingleView: {
    borderBottomWidth: 2,
    width: width / 2.75,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 2,
    paddingTop: 0,
    borderColor: theme.colors.APP_GREEN,
    ...theme.viewStyles.text('M', 14, theme.colors.INPUT_TEXT),
  },
  inputBorderView: {
    borderRadius: 10,
    backgroundColor: theme.colors.CARD_BG,
    //padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 30,
  },
  notes: {
    ...theme.fonts.IBMPlexSansMedium(17),
    color: '#0087ba',
    marginBottom: 10,
  },
  symptomsInputView: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(2, 71, 91, 0.15)',
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  symptomsText: {
    marginTop: 12,
    marginLeft: 12,
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(14),
    marginBottom: 16,
  },

  familyText: {
    //marginTop: 12,
    marginLeft: 16,
    color: '#02475b',
    opacity: 0.6,
    ...theme.fonts.IBMPlexSansMedium(14),
    letterSpacing: 0.03,
    marginBottom: 12,
  },

  medicineText: {
    color: 'rgba(2, 71, 91, 0.6)',
    ...theme.fonts.IBMPlexSansMedium(14),
    marginBottom: 0,
  },

  medicineunderline: {
    height: 2,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    opacity: 0.2,
    marginBottom: 13,
  },
  addDoctorText: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    letterSpacing: 0,
    color: '#fc9916',
    marginTop: 2,
    marginLeft: 7,
  },

  dataCardsStyle: {
    minHeight: 44,
    // alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    marginVertical: 6,
    borderColor: 'rgba(2, 71, 91, 0.2)',
    padding: 12,
    borderRadius: 5,
    backgroundColor: '#F9F9F9',
    flexDirection: 'row',
  },
  leftTimeLineContainer: {
    // position: 'absolute',
    // left: 0,
    // marginBottom: -40,
    // marginRight: 9,
    // marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalLine: {
    flex: 1,
    width: 1,
    // backgroundColor: theme.colors.LIGHT_BLUE,
  },
  healthvaultMainContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  healthvaultImageContainer: {
    margin: 4,
  },
  healthvaultImage: {
    height: 100,
    width: 100,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  materialContainer: {
    alignItems: 'flex-end',
    marginLeft: 0,
    marginTop: 20,
    width: width - 80,
  },
  selTextStyle: {
    ...theme.viewStyles.text('M', 14, '#00b38e'),
    alignSelf: 'flex-start',
  },
  textItemStyle: { ...theme.viewStyles.text('M', 14, '#01475b'), paddingHorizontal: 0 },
  itemContainerStyle: {
    height: 44,
    marginHorizontal: 12,
    width: width,
    maxWidth: width - 110,
  },
  menuContainer: {
    flexDirection: 'row',
    marginLeft: 0,
    marginTop: 4,
    marginBottom: 6,
  },
  MtextView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(2, 71, 91, 0.2)',
    padding: 12,
    borderRadius: 5,
    backgroundColor: '#F9F9F9',
    width: width - 70,
  },
  dropValueText: {
    ...theme.viewStyles.text('M', 14, theme.colors.INPUT_TEXT),
  },
  dropDownGreenView: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 0,
  },
  materialMenuContainer: { marginTop: 34, marginLeft: 0 },
  materialMenuItemContainer: { height: 44.8, marginHorizontal: 12, width: '50%' },
  materialMenuItemText: {
    ...theme.viewStyles.text('M', 16, theme.colors.SHARP_BLUE, 1, undefined, 0.03),
    paddingHorizontal: 0,
  },
  materialMenuSelectedItemText: {
    ...theme.viewStyles.text('M', 16, theme.colors.APP_GREEN, 1, undefined, 0.03),
    alignSelf: 'flex-start',
  },
  materialMenuViewContainer: { flexDirection: 'row', marginBottom: 8, marginTop: 8 },
  materialMenuTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 0,
    paddingBottom: 3,
    paddingRight: 8,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  materialMenuViewText: theme.viewStyles.text('M', 16, theme.colors.SHARP_BLUE, 1, undefined, 0.03),
  materialMenuDropContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    flexDirection: 'row',
  },
  rowContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  infoTextStyle: {
    ...theme.viewStyles.text('R', 12, theme.colors.APP_GREEN, 1, 16, 1),
    marginLeft: 12,
  },
  headerView: {
    marginHorizontal: 16,
    marginBottom: 8
  }
});
