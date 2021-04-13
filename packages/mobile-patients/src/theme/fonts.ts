import { Platform, TextStyle } from 'react-native';

type AphOpacity = 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
type AphTextColors = '#01475b' | '#02475b' | '#0087ba' | '#fc9916' | '#890000' | '#fff' | string;
type AphFont = 'SB' | 'R' | 'M' | 'B';

const getFont = (key: AphFont, size: number): TextStyle => {
  let fontStyle = Fonts.IBMPlexSansBold(size);
  switch (key) {
    case 'B':
      fontStyle = Fonts.IBMPlexSansBold(size);
      break;
    case 'M':
      fontStyle = Fonts.IBMPlexSansMedium(size);
      break;
    case 'R':
      fontStyle = Fonts.IBMPlexSansRegular(size);
      break;
    case 'SB':
      fontStyle = Fonts.IBMPlexSansSemiBold(size);
      break;
  }
  return fontStyle;
};

export const getTextStyle = (
  font: AphFont,
  size: number,
  color: AphTextColors,
  opacity?: AphOpacity,
  lineHeight?: number,
  letterSpacing?: number
): TextStyle => ({
  ...getFont(font, size),
  color,
  opacity,
  lineHeight,
  letterSpacing,
});

const Fonts = {
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
  IBMPlexSansBold: (s = 12) => {
    return {
      fontFamily: 'IBMPlexSans-Bold',
      fontSize: s,
    };
  },
};

export const fonts = {
  ...Fonts,
};
