import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  containerStyle: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
    borderColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 6,
    // marginLeft: 20,
    // marginRight: 20,
    // marginTop: 20,
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
    flex: 1,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#02475b',
    // width: 111,
  },
  consultstyles: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: '#02475b',
    // lineHeight: 12,
    // marginRight: 51,
  },

  iconview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seperatorline: {
    flexDirection: 'row',
    marginTop: 1,
    borderBottomColor: '#02475b',
    borderBottomWidth: 1,
    marginRight: 10,
    opacity: 0.05,
  },
  lastconsult: {
    opacity: 0.6,
    fontFamily: 'IBMPlexSans',
    fontSize: 10,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 14,
    letterSpacing: 0,
    color: '#02475b',
  },
  imageStyle: {
    height: 58,
    width: 58,
    borderRadius: 29,
  },
  placeHolderLoading: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
