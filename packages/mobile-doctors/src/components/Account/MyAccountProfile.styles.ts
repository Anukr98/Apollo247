import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet, Dimensions } from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';

const { width } = Dimensions.get('screen');
export const MyAccountProfileStyles = StyleSheet.create({
  buttonendStyle: {
    width: '45%',
    height: 40,
    backgroundColor: '#fc9916',
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
    // zIndex: -1,
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    marginLeft: 10,
    marginRight: 10,
    marginHorizontal: 20,
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  understatusline: {
    width: '95%',
    backgroundColor: '#02475b',
    marginTop: 11,
    opacity: 0.1,
    marginBottom: 16,
    ...ifIphoneX(
      {
        height: 2,
      },
      {
        height: 1,
      }
    ),
  },
  education: {
    color: '#658f9b',
    fontFamily: 'IBMPlexSans',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  educationtext: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#02475b',
    marginBottom: 16,
    letterSpacing: 0.35,
    marginTop: 2,
  },
  cardView: {
    margin: 16,
    ...theme.viewStyles.whiteRoundedCornerCard,
  },
  imageview: {
    minHeight: 141,
    maxHeight: width - 32,
    width: width - 32,
  },
  profileContainerStyle: {
    overflow: 'hidden',
    minHeight: 141,
    maxHeight: width - 32,
    width: width - 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drname: {
    ...theme.fonts.IBMPlexSansSemiBold(20),
    color: '#02475b',
  },
  drnametext: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: '#0087ba',
    lineHeight: 16,
    marginTop: 4,
  },
  starIconStyle: {
    position: 'absolute',
    right: 16,
    bottom: -20,
  },
  columnContainer: {
    flexDirection: 'column',
    marginLeft: 16,
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: '80%',
    color: theme.colors.INPUT_TEXT,
    paddingBottom: 4,
  },
  inputValidView: {
    borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    marginRight: 20,
    marginLeft: 20,
    paddingBottom: 0,
  },
  mobileview: {
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  mobileText: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#01475b',
    marginRight: 12,
    marginLeft: 20,
    marginTop: 16,
    marginBottom: 18,
  },
  photourl: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  login: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    letterSpacing: 0.06,
    color: '#02475b',
    marginLeft: 20,
  },
});
