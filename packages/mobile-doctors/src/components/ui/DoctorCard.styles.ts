import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  containerStyle: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
    borderColor: '#fff',
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
    //marginBottom: 20,
  },
  imageView: {
    margin: 12,
    alignContent: 'center',
    justifyContent: 'center',
    height: 44,
    width: 44,
  },
  doctorNameStyles: {
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#02475b',
  },
  consultstyles: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: '#ffffff',
    textAlign: 'right',
  },

  iconview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  lastconsult: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: '#01475b',
  },
});
