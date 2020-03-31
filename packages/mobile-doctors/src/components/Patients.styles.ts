import { StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

export const styles = StyleSheet.create({
  shadowview: {
    height: 44,
    width: '100%',
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 10,
    backgroundColor: 'white',
  },
  showPopUp: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  subViewPopup: {
    marginTop: 150,
    backgroundColor: 'white',
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  doctornameContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
  },
  doctorname: {
    ...theme.fonts.IBMPlexSansSemiBold(28),
    color: '#02475b',
    marginBottom: 2,
  },
  doctorname1: {
    ...theme.fonts.IBMPlexSansSemiBold(28),
    color: '#02475b',
    marginBottom: 2,
    flex: 1,
  },
});
