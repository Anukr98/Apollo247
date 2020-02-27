import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  spinnerContainerStyle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0, 0.2)',
    alignSelf: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 10,
  },
});
