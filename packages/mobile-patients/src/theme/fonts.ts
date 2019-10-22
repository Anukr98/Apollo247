import { Platform } from 'react-native';

const Fonts = {
  IBMPlexSansThinItalic: (s = 12) => {
    return {
      fontFamily: 'IBMPlexSans-ThinItalic',
      fontSize: s,
    };
  },
  IBMPlexSansThin: (s = 12) => {
    return {
      fontFamily: 'IBMPlexSans-Thin',
      fontSize: s,
    };
  },
  IBMPlexSansSemiBoldItalic: (s = 12) => {
    return {
      fontFamily: 'IBMPlexSans-SemiBoldItalic',
      fontSize: s,
    };
  },
  IBMPlexSansSemiBold: (s = 12) => {
    return {
      fontFamily: 'IBMPlexSans-SemiBold',
      fontSize: s,
    };
  },
  IBMPlexSansRegular: (s = 12) => {
    return {
      fontFamily: 'IBMPlexSans',
      fontSize: s,
    };
  },
  IBMPlexSansMediumItalic: (s = 12) => {
    return {
      fontFamily: 'IBMPlexSans-MediumItalic',
      fontSize: s,
    };
  },
  IBMPlexSansMedium: (s = 12) => {
    return {
      fontFamily: 'IBMPlexSans-Medium',
      fontSize: s,
      ...Platform.select({
        android: {
          fontWeight: 'normal' as 'normal',
        },
        ios: {
          fontWeight: '500' as '500',
        },
      }),
    };
  },
  IBMPlexSansLightItalic: (s = 12) => {
    return {
      fontFamily: 'IBMPlexSans-LightItalic',
      fontSize: s,
    };
  },
  IBMPlexSansLight: (s = 12) => {
    return {
      fontFamily: 'IBMPlexSans-Light',
      fontSize: s,
    };
  },
  IBMPlexSansItalic: (s = 12) => {
    return {
      fontFamily: 'IBMPlexSans-Italic',
      fontSize: s,
    };
  },
  IBMPlexSansExtraLightItalic: (s = 12) => {
    return {
      fontFamily: 'IBMPlexSans-ExtraLightItalic',
      fontSize: s,
    };
  },
  IBMPlexSansExtraLight: (s = 12) => {
    return {
      fontFamily: 'IBMPlexSans-ExtraLight',
      fontSize: s,
    };
  },
  IBMPlexSansBold: (s = 12) => {
    return {
      fontFamily: 'IBMPlexSans-Bold',
      fontSize: s,
    };
  },
  IBMPlexSansBoldItalic: (s = 12) => {
    return {
      fontFamily: 'IBMPlexSans-BoldItalic',
      fontSize: s,
    };
  },
};

export const fonts = {
  ...Fonts,
};
