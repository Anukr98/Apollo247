import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  cardContainer: {
    // margin: 40,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: theme.colors.CARD_BG,
    padding: 20,
    marginBottom: 0,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  underline: {
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: 'rgba(2, 71, 91, 0.4)',
    height: 1,
    marginLeft: 0,
    marginRight: 20,
    marginBottom: 16,
    width: '98%',
  },
  todayText: { ...theme.fonts.IBMPlexSansMedium(14), color: '#0087ba' },
  commonText: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: '#02475b',
    textAlign: 'center',
  },
  iconView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 68,
    marginRight: 68,
    marginTop: 15,
  },
  doctorName: {
    ...theme.fonts.IBMPlexSansSemiBold(18),
    color: '#02475b',
    marginBottom: 8,
  },
  line: {
    height: 10,
    width: 2,
    backgroundColor: '#0087ba',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
  },
});
