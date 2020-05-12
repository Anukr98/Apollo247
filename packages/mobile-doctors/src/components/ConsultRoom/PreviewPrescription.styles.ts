import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('screen');
export const PreviewPrescriptionStyles = StyleSheet.create({
  flexStyle: {
    flex: 1,
  },
  headingContainer: {
    flexDirection: 'row',
    borderColor: theme.colors.SHARP_BLUE,
    borderBottomWidth: 0.5,
    paddingVertical: 6,
    marginHorizontal: 16,
    paddingHorizontal: 4,
    marginBottom: 10,
    alignItems: 'center',
  },
  headingIconContainer: {
    marginRight: 4,
  },
  headingText: {
    ...theme.viewStyles.text('M', 11, theme.colors.SHARP_BLUE),
    padding: 0,
    textTransform: 'uppercase',
  },
  vitalsTitle: {
    ...theme.viewStyles.text('M', 11, theme.colors.SHARP_BLUE),
    textTransform: 'uppercase',
  },
  subHeadingText: {
    ...theme.viewStyles.text('M', 12, theme.colors.blackColor(0.8)),
  },
  subHeading2Text: {
    ...theme.viewStyles.text('S', 10, theme.colors.blackColor(0.5)),
  },
  descriptionText: {
    ...theme.viewStyles.text('S', 11, theme.colors.blackColor(0.6)),
  },
  description2Text: {
    ...theme.viewStyles.text('S', 11, theme.colors.blackColor(0.8)),
  },
  vitalsDescription: {
    ...theme.viewStyles.text('S', 11, theme.colors.blackColor(0.8)),
  },
  disclamerText: {
    flex: 1,
    ...theme.viewStyles.text('S', 9, theme.colors.blackColor(0.4)),
    marginLeft: 10,
  },
  disclamerHeaderText: theme.viewStyles.text('S', 10, theme.colors.blackColor(0.4)),
  seperatorText: theme.viewStyles.text('M', 16, theme.colors.SHARP_BLUE, 0.4, 19, 0),
  subItemsContainer: {
    flexDirection: 'row',
  },
  mainContainer: {
    marginVertical: 4,
  },
  subContainer: {
    marginRight: 20,
    marginLeft: 28,
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
  seperatorView2: {
    height: 0.5,
    backgroundColor: theme.colors.SHARP_BLUE,
    width: width - 32,
    marginLeft: 16,
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
  padding2View: {
    height: 30,
  },
  appoitmentMainFlex: { flex: 0.25 },
  appointmentColonFlex: { flex: 0.02 },
  appointmentTextFlex: { flex: 0.7 },
  ApolloLogo: {
    marginHorizontal: 20,
    flexDirection: 'row',
  },
  logoContainer: {
    marginTop: 16,
    flex: 0.5,
  },
  doctorDetailsStyle: {
    flex: 1,
    alignItems: 'flex-start',
    marginTop: 10,
  },
  rowFlex: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'center',
  },
  addressText: {
    ...theme.viewStyles.text('S', 8, theme.colors.blackColor(0.6)),
  },
  signatureStyle: {
    width: 106,
    height: 60,
    resizeMode: 'contain',
  },
});
