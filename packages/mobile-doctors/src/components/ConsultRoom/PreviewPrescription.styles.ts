import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet } from 'react-native';

export const PreviewPrescriptionStyles = StyleSheet.create({
  flexStyle: {
    flex: 1,
  },
  headingContainer: {
    backgroundColor: '#f1f1f1',
    paddingVertical: 6,
    paddingLeft: 16,
    marginBottom: 10,
  },
  headingText: { ...theme.viewStyles.text('M', 16, theme.colors.SHARP_BLUE, 1), padding: 0 },
  subHeadingText: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE, 1, 18, 0),
  },
  descriptionText: {
    ...theme.viewStyles.text('S', 12, theme.colors.SHARP_BLUE, 1, 18, 0),
    marginLeft: 20,
  },
  disclamerText: theme.viewStyles.text('I', 10, theme.colors.SHARP_BLUE, 0.6),
  seperatorText: theme.viewStyles.text('M', 16, theme.colors.SHARP_BLUE, 0.4, 19, 0),
  subItemsContainer: {
    flexDirection: 'row',
  },
  mainContainer: {
    marginVertical: 4,
  },
  subContainer: {
    marginHorizontal: 20,
  },
  itemContainer: {
    marginBottom: 8,
  },
  lastItemContainer: {
    marginBottom: -10,
  },
  singleItemContainer: {
    marginBottom: 4,
  },
  seperatorView: {
    height: 1,
    backgroundColor: '#f1f1f1',
    width: '100%',
    marginVertical: 10,
  },
  stickyBottomStyle: {
    ...theme.viewStyles.cardContainer,
    paddingHorizontal: 0,
    height: 80,
    paddingTop: 0,
  },
  footerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'center',
  },
  buttonsaveStyle: {
    width: '35%',
    height: 40,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 3,
  },
  buttonendStyle: {
    width: '45%',
    height: 40,
    backgroundColor: '#890000',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.4,
    elevation: 3,
  },
  paddingView: {
    height: 90,
  },
  appoitmentMainFlex: { flex: 0.25 },
  appointmentColonFlex: { flex: 0.02 },
  appointmentTextFlex: { flex: 0.7 },
  ApolloLogo: {
    marginLeft: 20,
    marginTop: 10,
  },
});
