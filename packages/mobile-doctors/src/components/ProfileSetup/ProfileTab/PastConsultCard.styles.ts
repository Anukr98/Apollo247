/* eslint-disable import/no-default-export */
import { StyleSheet } from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

export default StyleSheet.create({
  leftTimeLineContainer: {
    marginRight: 9,
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalLine: {
    flex: 1,
    width: 2,
  },
  timeSlotTypeView: {
    height: 12,
    width: 12,
    borderRadius: 6,
    margin: 2,
    backgroundColor: theme.colors.SHARP_BLUE,
  },
  mainView: {
    flex: 1,
    paddingBottom: 20,
  },
  leftTimeLintTouch: {
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    height: 50,
    alignItems: 'center',
    paddingRight: 10,
    paddingLeft: 18,
    marginVertical: 4.5,
    marginRight: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  TouchableText: {
    ...theme.viewStyles.text('M', 12, theme.colors.darkBlueColor(0.6), 1, 12),
  },
  dataView: {
    flex: 1,
    flexDirection: 'row',
  },
});
