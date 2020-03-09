/* eslint-disable import/no-default-export */
import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  doctorView: {
    flex: 1,
    marginHorizontal: 20,
    ...theme.viewStyles.whiteRoundedCornerCard,
    shadowRadius: 5,
    marginBottom: 16,
    borderRadius: 10,
  },
  imageView: {
    margin: 16,
    alignContent: 'center',
    justifyContent: 'center',
    height: 80,
    width: 80,
  },
  doctorNameStyles: {
    paddingTop: 15,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SEARCH_DOCTOR_NAME,
    flex: 0.9,
  },
  invitetext: {
    ...theme.fonts.IBMPlexSansMedium(15),
    color: '#ff748e',
    marginBottom: 16,
    marginLeft: 8,
    marginTop: 2,
  },
  imageremovestyles: {
    height: 24,
    width: 24,
    marginTop: 16,
    marginRight: 20,
  },
  doctorSpecializationStyles: {
    paddingTop: 4,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.CARD_DESCRIPTION,
  },
  doctorLocation: {
    paddingTop: 2,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#658f9b',
    marginRight: 16,
  },

  educationTextStyles: {
    paddingTop: 12,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#658f9b',
  },
  iconview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  containerStyles: {
    height: 50,
    borderRadius: 10,
    ...theme.viewStyles.whiteRoundedCornerCard,
    width: 160,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  titleTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#890000',
    textAlign: 'left',
    justifyContent: 'flex-start',
    marginLeft: -70,
  },
  removebuttonview: {
    right: 12,
    position: 'absolute',
    justifyContent: 'flex-end',
    marginTop: 40,
    backgroundColor: '#fff',
    marginLeft: 150,
  },
  doctorImgView: { flexDirection: 'row', marginBottom: 16 },
  doctorCardView: { overflow: 'hidden', borderRadius: 10, flex: 1 },
});
