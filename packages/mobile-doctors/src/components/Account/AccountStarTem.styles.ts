import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  inputTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#02475b',
    opacity: 0.6,
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: '100%',
    color: theme.colors.INPUT_TEXT,
    borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
  },
  addDoctorText: {
    fontFamily: 'IBMPlexSans',
    fontSize: 14,
    fontWeight: 'bold',
    fontStyle: 'normal',
    letterSpacing: 0,
    color: '#fc9916',
    marginLeft: 10,
    marginTop: 2,
  },
  dropDownCardStyle: {
    marginTop: Platform.OS == 'android' ? -35 : -35,
    marginBottom: 26,
    paddingTop: 16,
    paddingBottom: 15,
    //position: Platform.OS == 'android' ? 'relative' : 'absolute',
    top: 0,
    zIndex: 2,
    width: '80%',
    alignSelf: 'center',
    justifyContent: 'flex-end',
    ...theme.viewStyles.whiteRoundedCornerCard,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
});
