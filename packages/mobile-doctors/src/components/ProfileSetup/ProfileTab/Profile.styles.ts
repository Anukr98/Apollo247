/* eslint-disable import/no-default-export */
import { StyleSheet, Platform } from 'react-native';

import { ifIphoneX } from 'react-native-iphone-x-helper';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f0f4f5',
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
    height: 141,
    marginBottom: 16,
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
    top: 141 - 28,
  },
  columnContainer: {
    flexDirection: 'column',
    marginLeft: 16,
  },
  selectDoctorView: {
    ...theme.viewStyles.whiteRoundedCornerCard,
    margin: 20,
    marginTop: 0,
    borderRadius: 10,
  },
  selectDoctText: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#02475b',
    opacity: 0.4,
    marginTop: 10,
    marginBottom: 9,
  },
  doctorNameView: {
    marginTop: 8,
    marginBottom: 7,
    height: 1,
    opacity: 0.1,
  },
  profileDateView: { overflow: 'hidden', borderTopRightRadius: 10, borderTopLeftRadius: 10 },
  highlighstyle: {
    color: theme.colors.darkBlueColor(),
    ...theme.fonts.IBMPlexSansBold(18),
  },
  suggestionTextStyle: {
    color: theme.colors.darkBlueColor(),
    ...theme.fonts.IBMPlexSansMedium(18),
  },
  dropDownView: { alignItems: 'flex-end', alignSelf: 'flex-end' },
  selectDoctor: { flexDirection: 'row', justifyContent: 'space-between' },
});
