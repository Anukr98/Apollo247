import { StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  mainview: {
    backgroundColor: '#ffffff',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationText: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    color: '#01475b',
    textAlign: 'center',
  },
  dataView: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
  },
  textView: { ...theme.fonts.IBMPlexSansLight(10), color: 'rgba(1, 71, 91, 0.6)' },
  messageText: { ...theme.fonts.IBMPlexSansSemiBold(15), color: '#01475b', marginRight: 20 },
  commonview: { justifyContent: 'center', marginLeft: 5, flex: 1 },
  underline: {
    height: 1,
    width: '100%',
    borderWidth: 1,
    borderColor: '#f0f4f5',
  },
});
