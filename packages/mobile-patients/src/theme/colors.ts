const white = 'white';
const black = 'black';
const clear = 'transparent';
const semiDarkClear = 'rgba(0, 0, 0, 0.3)';
const lightColor = 'rgb(216, 216, 216)';
const darkColor = 'rgb(115, 118, 131)';

const hexWhite='#ffffff'
const app_green = '#00b38e';
const APP_Sherpa_Blue = '#01475b';
const app_light_blue = '#02475b';
const sky_blue = '#0087ba';
const tangerine_yellow = '#fc9916';
const shadowGray = '#808080';
const text_light_blue = 'rgba(2,71,91,0.6)';
const success_text = '#4aa54a';
const lightShadeRed = '#edc6c2';
const lightShadeGreen = '#edf7ed';
const almond = '#eed9c6';
const darkShadeGrey ='#666666';
const astronautBlue ='#01475b';
const shadeCyanBlue ='#6d7278';

const TabBar = {
  TAB_BAR_ACTIVE_TINT_COLOR: white,
  TAB_BAR_INACTIVE_TINT_COLOR: 'rgba(2,71,91,0.6)',
};

const Buttons = {
  BUTTON_BG: '#fcb716',
  BUTTON_TEXT: white,
  BUTTON_DISABLED_BG: '#fed984',
};

const Card = {
  CARD_BG: '#f7f8f5',
  CARD_HEADER: app_light_blue,
  CARD_DESCRIPTION: sky_blue,
  CARD_INFO: tangerine_yellow,
  FILTER_CARD_LABEL: app_light_blue,
};

const Common = {
  BLACK_COLOR: black,
  DEFAULT_BACKGROUND_COLOR: '#f0f1ec',
  INPUT_CURSOR_COLOR: app_green,
  APP_GREEN: app_green,
  WHITE: white,
  HEX_WHITE:hexWhite,
  SHERPA_BLUE: APP_Sherpa_Blue,
  APP_YELLOW_COLOR: '#fcb716',
  APP_YELLOW: tangerine_yellow,
  SHADOW_GRAY: shadowGray,
  LIGHT_BLUE: app_light_blue,
  SKY_BLUE: sky_blue,
  SEPARATOR_LINE: 'rgba(2, 71, 91, 0.2)',
  CLEAR: clear,
  TEXT_LIGHT_BLUE: text_light_blue,
  SHADE_GREY: darkShadeGrey,
  ASTRONAUT_BLUE: astronautBlue,
  SHADE_CYAN_BLUE: shadeCyanBlue,
  SUCCESS_TEXT: '#4aa54a',
  FAILURE_TEXT: '#e02020',
  PENDING_TEXT: '#e87e38',
  COD_TEXT: '#084c60'
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
  INPUT_TEXT: app_light_blue,
  INPUT_BORDER_SUCCESS: app_green,
  INPUT_BORDER_FAILURE: '#e50000',
  INPUT_SUCCESS_TEXT: app_light_blue,
  INPUT_FAILURE_TEXT: '#890000',
  INPUT_INFO: tangerine_yellow,
  placeholderTextColor: 'rgba(1,48,91, 0.3)',
  light_label: '#658f9b',
};

const Search = {
  SEARCH_UNDERLINE_COLOR: '#00b38e',
  SEARCH_TITLE_COLOR: tangerine_yellow,
  SEARCH_DOCTOR_NAME: app_light_blue,
  SEARCH_EDUCATION_COLOR: '#658f9b',
  SEARCH_CONSULT_COLOR: tangerine_yellow,
};

const Capsule = {
  CAPSULE_ACTIVE_BG: '#ff748e',
  CAPSULE_ACTIVE_TEXT: white,
  CAPSULE_INACTIVE_BG: 'rgba(0, 135, 186, 0.11)',
  CAPSULE_INACTIVE_TEXT: app_light_blue,
};

const StatusColors={
  SUCCESS:lightShadeGreen,
  FAILURE:lightShadeRed,
  PENDING:almond
}

export const colors = {
  ...Buttons,
  ...Card,
  ...Common,
  ...Header,
  ...RefreshControl,
  ...Texts,
  ...TextInput,
  ...Search,
  ...TabBar,
  ...Capsule,
...StatusColors
};
