/* eslint-disable import/no-default-export */
import { StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  cardView: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    shadowColor: '#31004053',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 2,
    paddingHorizontal: 12,
    paddingVertical: 13,
    width: '100%',
    marginBottom: 10,
  },
  leftSmallText: {
    color: '#004053',
    opacity: 0.6,
    letterSpacing: -0.01,
    ...theme.fonts.IBMPlexSans(8),
  },
  leftMidiumText: {
    color: '#004053',

    letterSpacing: 0.02,
    ...theme.fonts.IBMPlexSansMedium(10),
  },
  rupeesStyle: {
    color: '#004053',
    letterSpacing: -0.01,
    ...theme.fonts.IBMPlexSansBold(14),
    alignItems: 'flex-end',
  },
  cunsultTextStyle: {
    color: '#0087ba',
    letterSpacing: -0.01,
    ...theme.fonts.IBMPlexSansBold(8),
    alignItems: 'flex-end',
  },
  underline: {
    borderBottomColor: '#2602475b',
    borderBottomWidth: 1,
    marginTop: 10,
    marginBottom: 10,
    opacity: 0.1,
  },

  nameStyles: {
    color: '#004053',
    letterSpacing: -0.01,
    ...theme.fonts.IBMPlexSansMedium(10),
  },
  popupText: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(15),
  },
  headerview: {
    height: 50,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  rowview: { flexDirection: 'row', justifyContent: 'space-between' },
  commonview: { flexDirection: 'column', marginRight: 5 },
});
