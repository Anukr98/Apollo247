import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { Dimensions, StyleSheet } from 'react-native';

const { height } = Dimensions.get('window');
export default StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
  },
  mainView: {
    flex: 9,
    backgroundColor: 'transparent',
  },
  itemContainer: {
    height: height === 812 || height === 896 ? height - 160 : height - 100,
    margin: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  descptionText: {
    marginTop: 10,
    color: 'rgba(0,0,0,0.4)',
    textAlign: 'center',
    marginHorizontal: 50,
    lineHeight: 20,
    ...theme.fonts.IBMPlexSansMedium(14),
    paddingBottom: 50,
  },
  titleStyle: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(25),
    textAlign: 'center',
  },
  skipView: {
    height: 40,
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
  },
  imageStyle: {
    marginTop: 12,
    width: '80%',
  },
  skipTextStyle: {
    color: '#a4a4a4',
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'center',
  },
});
