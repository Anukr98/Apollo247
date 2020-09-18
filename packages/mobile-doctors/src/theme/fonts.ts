import { TextStyle } from 'react-native';

type AphOpacity = 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
type AphTextColors = '#01475b' | '#02475b' | '#0087ba' | '#fc9916' | '#890000' | '#fff' | string;
type AphFont =
  | 'S'
  | 'TI'
  | 'T'
  | 'SBI'
  | 'SB'
  | 'R'
  | 'MI'
  | 'M'
  | 'LI'
  | 'L'
  | 'I'
  | 'ELI'
  | 'EL'
  | 'B'
  | 'BI';

const getFont = (key: AphFont, size: number): TextStyle => {
  let fontStyle = Fonts.IBMPlexSansBold(size);
  switch (key) {
    case 'S':
      fontStyle = Fonts.IBMPlexSans(size);
      break;
    case 'B':
      fontStyle = Fonts.IBMPlexSansBold(size);
      break;
    case 'BI':
      fontStyle = Fonts.IBMPlexSansBoldItalic(size);
      break;
    case 'EL':
      fontStyle = Fonts.IBMPlexSansExtraLight(size);
      break;
    case 'ELI':
      fontStyle = Fonts.IBMPlexSansExtraLightItalic(size);
      break;
    case 'I':
      fontStyle = Fonts.IBMPlexSansItalic(size);
      break;
    case 'L':
      fontStyle = Fonts.IBMPlexSansLight(size);
      break;
    case 'LI':
      fontStyle = Fonts.IBMPlexSansLightItalic(size);
      break;
    case 'M':
      fontStyle = Fonts.IBMPlexSansMedium(size);
      break;
    case 'MI':
      fontStyle = Fonts.IBMPlexSansMediumItalic(size);
      break;
    case 'R':
      fontStyle = Fonts.IBMPlexSansRegular(size);
      break;
    case 'SB':
      fontStyle = Fonts.IBMPlexSansSemiBold(size);
      break;
    case 'SBI':
      fontStyle = Fonts.IBMPlexSansSemiBoldItalic(size);
      break;
    case 'T':
      fontStyle = Fonts.IBMPlexSansThin(size);
      break;
    case 'TI':
      fontStyle = Fonts.IBMPlexSansThinItalic(size);
      break;
  }
  return fontStyle;
};

export const getTextStyle = (
  font: AphFont,
  size: number,
  color: AphTextColors,
  opacity?: number,
  lineHeight?: number,
  letterSpacing?: number
): TextStyle => ({
  ...getFont(font, size),
  color,
  opacity: opacity && (opacity < 0 || opacity > 1) ? 1 : opacity,
  lineHeight,
  letterSpacing,
});

const Fonts = {
  IBMPlexSans: (s = 12) => {
    return {
      fontFamily: 'IBMPlexSans',
      fontSize: s,
    };
  },
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
