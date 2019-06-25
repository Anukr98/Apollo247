import React from 'react';
import { ImageProps, Image } from 'react-native';

const getIconStyle = (size?: IconProps['size']) => {
  if (size === 'sm') return { width: 24, height: 24 };
  if (size === 'lg') return { width: 64, height: 64 };
  return { width: 48, height: 48 };
};

interface IconProps extends Partial<ImageProps> {
  size: 'sm' | 'md' | 'lg';
}

export interface IconBaseProps extends ImageProps {
  size: 'sm' | 'md' | 'lg';
}

export const IconBase: React.FC<IconBaseProps> = ({ size, style, ...props }) => (
  <Image style={[getIconStyle(size), style]} {...props} />
);

export const ArrowDisabled: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_arrow_disabled.png')} />
);

export const ArrowYellow: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_arrow_yellow.png')} />
);

export const OkText: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_ok.png')} />
);

export const OkTextDisabled: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ok_disabled.png')} />
);

export const Mascot: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_mascot.png')} />
);

export const More: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_more.png')} />
);

export const DropdownGreen: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_dropdown_green.png')} />
);

export const ArrowFull: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_arrowFull.png')} />
);

export const ArrowStep1: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_arrowStep1.png')} />
);

export const ArrowStep2: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_arrowStep2.png')} />
);

export const ArrowStep3: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_arrowStep3.png')} />
);

export const Remove: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./search/ic_cross.png')} />
);

export const Reload: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./search/ic_reset.png')} />
);

export const SortDecreasing: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./search/ic_sort_decreasing.png')} />
);

export const Star: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./common/ic_star.png')} />
);

export const ConsultationRoom: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./tab/ic_consultroom.png')} />
);

export const MyHealth: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./tab/ic_myhealth.png')} />
);

export const ShoppingCart: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./tab/ic_orders.png')} />
);

export const Person: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./tab/ic_account.png')} />
);

export const GeneralPhysician: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./search/ic_general_physician.png')} />
);

export const Neurologist: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./search/ic_neurologist.png')} />
);

export const Paedatrician: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./search/ic_paedatrician.png')} />
);

export const Urologist: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./search/ic_urologist.png')} />
);

export const LocationOff: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./search/ic_location_off.png')} />
);

export const Filter: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./search/ic_filter.png')} />
);

export const BackArrow: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./search/backArrow.png')} />
);

export const NextButton: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./common/arrowButton.png')} />
);
