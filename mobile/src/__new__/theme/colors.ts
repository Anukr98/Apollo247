const white = 'white';
const black = 'black';
const clear = 'transparent';
const red = 'tomato';
const semiLightClear = 'rgba(21, 121, 251, 0.12)';
const semiDarkClear = 'rgba(0, 0, 0, 0.3)';
const lightColor = 'rgb(216, 216, 216)';
const darkColor = 'rgb(115, 118, 131)';

const app_green = '#00b38e';
const APP_Sherpa_Blue = '#01475b';

const Buttons = {
  BUTTON_BG: '#fcb716',
  BUTTON_TEXT: white,
  BUTTON_DISABLED_BG: '#fed984',
};

const Card = {
  CARD_BG: 'white',
  CARD_HEADER: '#02475b',
  CARD_DESCRIPTION: '#0087ba',
};

const Common = {
  BLACK_COLOR: black,
  DEFAULT_BACKGROUND_COLOR: '#f0f1ec',
  INPUT_CURSOR_COLOR: app_green,
  APP_GREEN: app_green,
  WHITE: white,
  SHERPA_BLUE: APP_Sherpa_Blue,
  APP_YELLOW_COLOR: '#fcb716',
};

const Header = {
  HEADER_BG: lightColor,
  HEADER_BAR_BUTTON_TEXT: darkColor,
  HEADER_CENTER_TEXT: darkColor,
  HEADER_SEP: darkColor,
};

const RefreshControl = {
  REFRESH_CONTROL_TINT: lightColor,
  REFRESH_CONTROL_TEXT: lightColor,
  REFRESH_CONTROL_BG: clear,
};

const Texts = {
  DEFAULT_TEXT_COLOR: darkColor,
  DISABLED_TEXT_COLOR: semiDarkClear,
  DESCRIPTION_TEXT_PRIMARY: lightColor,
  DESCRIPTION_TEXT_SECONDARY: darkColor,
  HEADING_TEXT_PRIMARY: lightColor,
  HEADING_TEXT_SECONDARY: darkColor,
  INFO_TEXT_PRIMARY: lightColor,
  INFO_TEXT_SECONDARY: darkColor,
  PUNCHH_TEXT_ALPHA_COLOR: semiDarkClear,
  SEPARATOR_TEXT_PRIMARY: lightColor,
  SEPARATOR_TEXT_SECONDARY: darkColor,
  SEPARATOR_TEXT_LINE_PRIMARY: lightColor,
  SEPARATOR_TEXT_LINE_SECONDARY: darkColor,
};

const TextInput = {
  INPUT_TEXT: '#02475b',
  INPUT_BORDER_SUCCESS: app_green,
  INPUT_BORDER_FAILURE: '#e50000',
  INPUT_SUCCESS_TEXT: '#02475b',
  INPUT_FAILURE_TEXT: '#890000',
  INPUT_INFO: '#fc9916',
  placeholderTextColor: 'rgba(1,48,91, 0.3)',
};

const Search = {
  SEARCH_UNDERLINE_COLOR: '#00b38e',
  SEARCH_TITLE_COLOR: '#fc9916',
  SEARCH_DOCTOR_NAME: '#02475b',
  SEARCH_EDUCATION_COLOR: '#658f9b',
  SEARCH_CONSULT_COLOR: '#fc9916',
};

export const colors = {
  ...Buttons,
  ...Card,
  ...Common,
  ...Header,
  ...RefreshControl,
  ...Texts,
  ...TextInput,
  ...Search,
};
