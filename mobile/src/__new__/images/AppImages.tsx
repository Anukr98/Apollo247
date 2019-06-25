import React from 'react';
import { Dimensions, ImageProps, Image } from 'react-native';
const { width } = Dimensions.get('window');

export const ArrowDisabledImage: React.FC<ImageProps> = (props) => (
  <Image
    style={{ width: 64, height: 64 }}
    {...props}
    source={require('./login/ic_arrow_disabled.png')}
  />
);
export const ArrowYellowImage: React.FC<ImageProps> = (props) => (
  <Image
    style={{ width: 64, height: 64 }}
    {...props}
    source={require('./login/ic_arrow_yellow.png')}
  />
);
export const IcOkImage: React.FC<ImageProps> = (props) => (
  <Image style={{ width: 64, height: 64 }} {...props} source={require('./login/ic_ok.png')} />
);
export const OkDisabledImage: React.FC<ImageProps> = (props) => (
  <Image style={{ width: 64, height: 64 }} {...props} source={require('./login/ok_disabled.png')} />
);
export const IcMascot: React.FC<ImageProps> = (props) => (
  <Image style={{ width: 64, height: 64 }} {...props} source={require('./login/ic_mascot.png')} />
);

export const IcMore: React.FC<ImageProps> = (props) => (
  <Image style={{ width: 24, height: 24 }} {...props} source={require('./login/ic_more.png')} />
);
export const IcDropdownGreen: React.FC<ImageProps> = (props) => (
  <Image
    style={{ width: 24, height: 24 }}
    {...props}
    source={require('./login/ic_dropdown_green.png')}
  />
);
export const IcArrowFull: React.FC<ImageProps> = (props) => (
  <Image
    style={{ width: 56, height: 56 }}
    {...props}
    source={require('./login/ic_arrowFull.png')}
  />
);
export const IcArrowStep1: React.FC<ImageProps> = (props) => (
  <Image
    style={{ width: 56, height: 56 }}
    {...props}
    source={require('./login/ic_arrowStep1.png')}
  />
);
export const IcArrowStep2: React.FC<ImageProps> = (props) => (
  <Image
    style={{ width: 56, height: 56 }}
    {...props}
    source={require('./login/ic_arrowStep2.png')}
  />
);
export const IcArrowStep3: React.FC<ImageProps> = (props) => (
  <Image
    style={{ width: 56, height: 56 }}
    {...props}
    source={require('./login/ic_arrowStep3.png')}
  />
);

export const NextButton: React.FC<ImageProps> = (props) => (
  <Image
    style={{ width: 54, height: 54 }}
    {...props}
    source={require('./common/arrowButton.png')}
  />
);

export const AppLogo: React.FC<ImageProps> = (props) => (
  <Image
    style={{ width: 77, height: 57, left: width - 97, top: 20 }}
    {...props}
    source={require('./common/ic_logo.png')}
  />
);
export const DropDown: React.FC<ImageProps> = (props) => (
  <Image
    style={{ width: 24, height: 24, left: 1, top: 2 }}
    {...props}
    source={require('./common/ic_dropdown_green.png')}
  />
);
export const DoctorImage: React.FC<ImageProps> = (props) => (
  <Image
    style={{ right: 20, top: 177, position: 'absolute' }}
    {...props}
    source={require('./common/doctor.png')}
  />
);
export const PlaceHolderImage: React.FC<ImageProps> = (props) => (
  <Image
    style={{ marginTop: 16 }}
    {...props}
    source={require('./common/img_illustration_placeholder.png')}
  />
);
export const PlaceHolderDoctorImage: React.FC<ImageProps> = (props) => (
  <Image
    style={{ height: 80, width: 80, marginTop: 16 }}
    {...props}
    source={require('./login/ic_mascot.png')}
  />
);
export const Mascot: React.FC<ImageProps> = (props) => (
  <Image
    style={{ height: 90, width: 90, marginTop: 40 }}
    {...props}
    source={require('./login/ic_mascot.png')}
  />
);
export const StarDoctor: React.FC<ImageProps> = (props) => (
  <Image style={{ height: 28, width: 28 }} {...props} source={require('./common/ic_star.png')} />
);

export const ConsultRoomAct: React.FC<ImageProps> = (props) => (
  <Image
    style={{ height: 24, width: 24 }}
    {...props}
    source={require('./tab/ic_consultroom.png')}
  />
);
export const MyHealthAct: React.FC<ImageProps> = (props) => (
  <Image style={{ height: 24, width: 24 }} {...props} source={require('./tab/ic_myhealth.png')} />
);
export const OrdersAct: React.FC<ImageProps> = (props) => (
  <Image style={{ height: 24, width: 24 }} {...props} source={require('./tab/ic_orders.png')} />
);

export const AccountAct: React.FC<ImageProps> = (props) => (
  <Image style={{ height: 24, width: 24 }} {...props} source={require('./tab/ic_account.png')} />
);
export const ConsultRoom: React.FC<ImageProps> = (props) => (
  <Image
    style={{ height: 24, width: 24 }}
    {...props}
    source={require('./tab/ic_consultroom.png')}
  />
);
export const MyHealth: React.FC<ImageProps> = (props) => (
  <Image style={{ height: 24, width: 24 }} {...props} source={require('./tab/ic_myhealth.png')} />
);
export const Orders: React.FC<ImageProps> = (props) => (
  <Image style={{ height: 24, width: 24 }} {...props} source={require('./tab/ic_orders.png')} />
);
export const Account: React.FC<ImageProps> = (props) => (
  <Image style={{ height: 24, width: 24 }} {...props} source={require('./tab/ic_account.png')} />
);
export const GeneralPhysician: React.FC<ImageProps> = (props) => (
  <Image {...props} source={require('./search/ic_general_physician.png')} />
);
export const Neurology: React.FC<ImageProps> = (props) => (
  <Image {...props} source={require('./search/ic_neurologist.png')} />
);
export const Peadatrician: React.FC<ImageProps> = (props) => (
  <Image {...props} source={require('./search/ic_paedatrician.png')} />
);
export const Urologist: React.FC<ImageProps> = (props) => (
  <Image {...props} source={require('./search/ic_urologist.png')} />
);
export const NoLocation: React.FC<ImageProps> = (props) => (
  <Image
    style={{ height: 24, width: 24, marginTop: 16 }}
    {...props}
    source={require('./search/ic_location_off.png')}
  />
);
export const Filter: React.FC<ImageProps> = (props) => (
  <Image
    style={{ height: 24, width: 24, marginTop: 16 }}
    {...props}
    source={require('./search/ic_filter.png')}
  />
);
export const BackArrow: React.FC<ImageProps> = (props) => (
  <Image
    style={{ height: 24, width: 24, marginTop: 16 }}
    {...props}
    source={require('./search/backArrow.png')}
  />
);
export const IcCross: React.FC<ImageProps> = (props) => (
  <Image style={{ height: 24, width: 24 }} {...props} source={require('./search/ic_cross.png')} />
);
export const IcReset: React.FC<ImageProps> = (props) => (
  <Image style={{ height: 24, width: 24 }} {...props} source={require('./search/ic_reset.png')} />
);
export const SortDecreasing: React.FC<ImageProps> = (props) => (
  <Image
    style={{ height: 18, width: 18 }}
    {...props}
    source={require('./search/ic_sort_decreasing.png')}
  />
);

export const Simran: React.FC<ImageProps> = (props) => (
  <Image {...props} source={require('./doctor/simran.png')} />
);
export const NarayanRao: React.FC<ImageProps> = (props) => (
  <Image {...props} source={require('./doctor/narayanRao.png')} />
);
export const RakhiSharma: React.FC<ImageProps> = (props) => (
  <Image {...props} source={require('./doctor/rakhi.png')} />
);
export const Rahul: React.FC<ImageProps> = (props) => (
  <Image {...props} source={require('./doctor/rahul.png')} />
);
export const Rajan: React.FC<ImageProps> = (props) => (
  <Image {...props} source={require('./doctor/rajan.png')} />
);
