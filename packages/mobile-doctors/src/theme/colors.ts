const orange = '#fc9916';
const green = '#00b38e';
const red = '#e50000';
const darkRed = '#890000';
const app_light_blue = '#02475b';
const app_sharp_Blue = '#01475b';
const sky_blue = '#0087ba';
const APP_Sherpa_Blue = '#01475b';
const shadowGray = '#808080';
const text_light_blue = 'rgba(2,71,91,0.6)';

const whiteColor = (opacity: number = 1) => `rgba(255,255,255,${opacity})`; //'#ffffff'
const blackColor = (opacity: number = 1) => `rgba(0,0,0,${opacity})`; //'#000000'
const darkBlueColor = (opacity: number = 1) => `rgba(2,71,91,${opacity})`; //'#02475b'
const skyBlueColor = (opacity: number = 1) => `rgba(0,135,186,${opacity})`; //'#0087ba'

const colorsWithCustomOpacity = {
  whiteColor,
  blackColor,
  darkBlueColor,
  skyBlueColor,
};

const TabBar = {
  TAB_BAR_ACTIVE_BG_COLOR: darkBlueColor(),
  TAB_BAR_ACTIVE_TEXT_COLOR: whiteColor(0.6),
  TAB_BAR_INACTIVE_TEXT_COLOR: darkBlueColor(0.6),
};

const Buttons = {
  BUTTON_BG: orange,
  BUTTON_TEXT: whiteColor(),
  BUTTON_DISABLED_BG: '#fed6a2',
};

const Card = {
  CARD_BG: whiteColor(),
  CARD_SHADOW_COLOR: 'rgba(128,128,128,0.6)', //'#808080'
  CARD_GRAY_BG: 'rgba(247,247,247,1)', //'#f7f7f7'
  CARD_HEADER: darkBlueColor(),
  CARD_DESCRIPTION: skyBlueColor(),
};

const Common = {
  WHITE: whiteColor(),
  BLACK: blackColor(),
  TRANSPARENT: 'transparent',
  DEFAULT_BACKGROUND_COLOR: '#f7f7f7',
  INPUT_CURSOR_COLOR: green,
  APP_GREEN: green,
  APP_YELLOW: orange,
  CLEAR: 'transparent',
  LIGHT_BLUE: app_light_blue,
  SHARP_BLUE: APP_Sherpa_Blue,
  SHADOW_GRAY: shadowGray,
  SKY_BLUE: sky_blue,
  TEXT_LIGHT_BLUE: text_light_blue,
  SEPARATOR_LINE: 'rgba(2, 71, 91, 0.2)',
};

const Header = {
  HEADER_BG: whiteColor(),
};

const TextInput = {
  INPUT_TEXT: darkBlueColor(),
  INPUT_BORDER_SUCCESS: green,
  INPUT_BORDER_FAILURE: red,
  INPUT_SUCCESS_TEXT: darkBlueColor(),
  INPUT_FAILURE_TEXT: darkRed,
  INPUT_INFO: orange,
  placeholderTextColor: 'rgba(1,48,91, 0.3)',
  OTP_NOT_VALID: red,
};

const Search = {
  SEARCH_UNDERLINE_COLOR: green,
  SEARCH_TITLE_COLOR: orange,
  SEARCH_DOCTOR_NAME: darkBlueColor(),
  SEARCH_EDUCATION_COLOR: red,
  SEARCH_CONSULT_COLOR: orange,
};

export const colors = {
  ...colorsWithCustomOpacity,
  ...Buttons,
  ...Card,
  ...Common,
  ...Header,
  ...TextInput,
  ...Search,
  ...TabBar,
};
