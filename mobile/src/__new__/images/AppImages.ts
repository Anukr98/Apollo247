import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

// export const ArrowYellow: React.FC<Partial<ImageProps>> = (props) => (
//   <Image
//     style={{ width: '100%', height: '100%"' }}
//     {...props}
//     source={require('app/src/__new__/images/login/ic_arrow_yellow.png')}
//   />
// );

const background = {};
const fabStyle = { style: { width: 64, height: 64 } };
const login = {
  arrow_disabled: {
    source: require('./login/ic_arrow_disabled.png'),
    ...fabStyle,
  },
  arrow_yellow: {
    source: require('./login/ic_arrow_yellow.png'),
    ...fabStyle,
  },
  ic_ok: {
    source: require('./login/ic_ok.png'),
    ...fabStyle,
  },
  ok_disabled: {
    source: require('./login/ok_disabled.png'),
    ...fabStyle,
  },
  ic_mascot: {
    source: require('./login/ic_mascot.png'),
    ...fabStyle,
  },
  ic_more: {
    source: require('./login/ic_more.png'),
    style: { width: 24, height: 24 },
  },
  ic_dropdown_green: {
    source: require('./login/ic_dropdown_green.png'),
    style: { width: 24, height: 24 },
  },
  ic_arrowFull: {
    source: require('./login/ic_arrowFull.png'),
    style: { width: 56, height: 56 },
  },
  ic_arrowStep1: {
    source: require('./login/ic_arrowStep1.png'),
    style: { width: 56, height: 56 },
  },
  ic_arrowStep2: {
    source: require('./login/ic_arrowStep2.png'),
    style: { width: 56, height: 56 },
  },
  ic_arrowStep3: {
    source: require('./login/ic_arrowStep3.png'),
    style: { width: 56, height: 56 },
  },
};

const common = {
  nextButton: {
    source: require('./common/arrowButton.png'),
    style: { width: 54, height: 54 },
  },
  appLogo: {
    source: require('./common/ic_logo.png'),
    style: { width: 77, height: 57, left: width - 97, top: 20 },
  },
  dropDown: {
    source: require('./common/ic_dropdown_green.png'),
    style: { width: 24, height: 24, left: 1, top: 2 },
  },
  doctorImage: {
    source: require('./common/doctor.png'),
    style: { right: 20, top: 177, position: 'absolute' },
  },
  placeHolderImage: {
    source: require('./common/img_illustration_placeholder.png'),
    style: { marginTop: 16 },
  },
  placeHolderDoctorImage: {
    source: require('./login/ic_mascot.png'),
    style: { height: 80, width: 80, marginTop: 16 },
  },
  mascot: {
    source: require('./login/ic_mascot.png'),
    style: { height: 90, width: 90, marginTop: 40 },
  },
  starDoctor: {
    source: require('./common/ic_star.png'),
    style: { height: 28, width: 28 },
  },
};

const TabIconStyle = { style: { height: 24, width: 24 } };
const tab = {
  ConsultRoomAct: {
    source: require('./tab/ic_consultroom.png'),
    ...TabIconStyle,
  },
  MyHealthAct: {
    source: require('./tab/ic_myhealth.png'),
    ...TabIconStyle,
  },
  OrdersAct: {
    source: require('./tab/ic_orders.png'),
    ...TabIconStyle,
  },
  AccountAct: {
    source: require('./tab/ic_account.png'),
    ...TabIconStyle,
  },
  ConsultRoom: {
    source: require('./tab/ic_consultroom.png'),
    ...TabIconStyle,
  },
  MyHealth: {
    source: require('./tab/ic_myhealth.png'),
    ...TabIconStyle,
  },
  Orders: {
    source: require('./tab/ic_orders.png'),
    ...TabIconStyle,
  },
  Account: {
    source: require('./tab/ic_account.png'),
    ...TabIconStyle,
  },
};

const search = {
  GeneralPhysician: {
    source: require('./search/ic_general_physician.png'),
  },
  Neurology: {
    source: require('./search/ic_neurologist.png'),
  },
  Peadatrician: {
    source: require('./search/ic_paedatrician.png'),
  },
  Urologist: {
    source: require('./search/ic_urologist.png'),
  },
  noLocation: {
    source: require('./search/ic_location_off.png'),
    style: { height: 24, width: 24, marginTop: 16 },
  },
  filter: {
    source: require('./search/ic_filter.png'),
    style: { height: 24, width: 24, margin: 16 },
  },
  backArrow: {
    source: require('./search/backArrow.png'),
    style: { height: 16, width: 25 },
  },
  ic_cross: {
    source: require('./search/ic_cross.png'),
    style: { height: 24, width: 24 },
  },
  ic_reset: {
    source: require('./search/ic_reset.png'),
    style: { height: 24, width: 24 },
  },
  sort_decreasing: {
    source: require('./search/ic_sort_decreasing.png'),
    style: { height: 18, width: 18 },
  },
  sort_increasing: {
    source: require('./search/ic_sort_increasing.png'),
    style: { height: 18, width: 18 },
  },
};

const doctor = {
  simran: {
    source: require('./doctor/simran.png'),
  },
  narayanRao: {
    source: require('./doctor/narayanRao.png'),
  },
  rakhiSharma: {
    source: require('./doctor/rakhi.png'),
  },
  rahul: {
    source: require('./doctor/rahul.png'),
  },
  rajan: {
    source: require('./doctor/rajan.png'),
  },
};

export const AppImages = {
  ...background,
  ...login,
  ...common,
  tab,
  ...search,
  ...doctor,
};
