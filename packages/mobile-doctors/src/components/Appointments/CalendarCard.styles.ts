import { colors } from '@aph/mobile-doctors/src/theme/colors';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  containerStyle: {
    marginTop: 6,
    marginRight: 20,
    marginBottom: 20,
    borderRadius: 10,
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
    marginRight: 16,
    opacity: 0.05,
  },
  newtagWrapperStyle: {
    position: 'absolute',
    top: 4,
    left: 0,
    zIndex: 1,
    shadowColor: colors.CARD_SHADOW_COLOR,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  imageStyle: {
    height: 44,
    width: 44,
    borderRadius: 22,
  },
  placeHolderLoading: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  container: {
    height: 'auto',
    width: 'auto',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
});
