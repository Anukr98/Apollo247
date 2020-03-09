/* eslint-disable import/no-default-export */
import { StyleSheet, Platform } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

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
  addDoctView: {
    flexDirection: 'row',
    margin: 20,
    marginTop: 7,
  },
  selectDoctorFieldView: {
    ...theme.viewStyles.whiteRoundedCornerCard,
    margin: 20,
    marginTop: 0,
    borderRadius: 10,
  },
  seleDoctText: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#02475b',
    opacity: 0.4,
    marginTop: 10,
    marginBottom: 9,
  },
  selectDoctView: { flexDirection: 'row', justifyContent: 'space-between' },
  dropdownView: { alignItems: 'flex-end', alignSelf: 'flex-end' },
  touchableView: {
    marginTop: 8,
    marginBottom: 7,
    height: 1,
    opacity: 0.1,
  },
});
