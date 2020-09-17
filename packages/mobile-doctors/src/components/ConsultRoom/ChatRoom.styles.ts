import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const ChatRoomStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageStyle: {
    width: 32,
    height: 32,
    position: 'absolute',
    borderRadius: 16,
    bottom: 0,
    left: 0,
    top: 0,
  },
  automatedLeftText: {
    ...theme.viewStyles.text('M', 15, theme.colors.WHITE),
    textAlign: 'left',
  },
  automatedRightText: {
    ...theme.viewStyles.text('M', 10, theme.colors.WHITE),
    textAlign: 'right',
  },
  automatedTextView: {
    backgroundColor: '#0087ba',
    marginLeft: 38,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  flatListContainerStyle: {
    marginHorizontal: 20,
    marginTop: 0,
  },
  noChatContainer: {
    flexDirection: 'row',
    margin: 20,
  },
  noChatIconContainer: { marginTop: 3 },
  noChatTextStyle: {
    marginLeft: 14,
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(12),
    marginRight: 20,
    lineHeight: 16,
  },
  chatInputMainContainer: {
    height: 66,
    backgroundColor: 'white',
  },
  chatInputSubContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatAttachIconContainer: {
    flexDirection: 'row',
    marginLeft: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderBottomWidth: 2,
    borderColor: theme.colors.APP_GREEN,
    marginRight: 20,
    marginLeft: 16,
  },
  messagePadding: {
    backgroundColor: 'transparent',
    width: width,
    marginVertical: 5,
  },
  missedCallMainContainer: {
    backgroundColor: 'transparent',
    maxWidth: '90%',
    borderRadius: 10,
    marginVertical: 2,
  },
  missedCallContiner: {
    borderRadius: 10,
    marginLeft: 38,
    alignItems: 'flex-end',
  },
  missedCallIconContiner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(229,0,0,0.04)',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 5,
    paddingVertical: 3,
    paddingHorizontal: 20,
  },
  missedCallIcon: {
    width: 16,
    height: 16,
  },
  missedCallText: {
    ...theme.viewStyles.text('M', 12, '#890000', 1, 24, 0.04),
    marginLeft: 8,
  },
  callContainer: {
    borderRadius: 10,
    flexDirection: 'row',
    marginLeft: 38,
    marginVertical: 2,
  },
  callTextContainer: { marginLeft: 8 },
  callHeadingText: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE),
    textAlign: 'left',
  },
  callSubHeadingText: {
    ...theme.viewStyles.text('M', 10, theme.colors.SHARP_BLUE),
    textAlign: 'left',
  },
  chatTimeTextContainer: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: 'white',
  },
  chatTimeText: {
    ...theme.viewStyles.text('M', 10, theme.colors.SHARP_BLUE),
    textAlign: 'right',
  },
  chatTimeText2: {
    ...theme.viewStyles.text('M', 10, theme.colors.SHARP_BLUE, 0.65),
    textAlign: 'right',
  },
  automatedMainContianer: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    maxWidth: '90%',
  },
  imageMainContainer: {
    backgroundColor: 'transparent',
    width: 180,
    height: 180,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  imagePlaceHolderStyle: {
    width: 180,
    height: 180,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  documentImageStyle: {
    resizeMode: 'contain',
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: theme.colors.WHITE,
  },
  messageTextContainer: {
    backgroundColor: 'white',
    marginLeft: 38,
    borderRadius: 10,
  },
  messageTextStyle: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 3,
    ...theme.viewStyles.text('M', 16, theme.colors.SKY_BLUE),
    textAlign: 'left',
  },
});
