import * as React from 'react';
import { Image, ImageProps } from 'react-native';

const getIconStyle = (size?: IconProps['size']) => {
  if (size === 'sm') return { width: 24, height: 24 };
  if (size === 'lg') return { width: 64, height: 64 };
  return { width: 48, height: 48 };
};

interface IconProps extends Partial<ImageProps> {
  size?: 'sm' | 'md' | 'lg';
}

export interface IconBaseProps extends ImageProps {
  size?: 'sm' | 'md' | 'lg';
}

export const IconBase: React.FC<IconBaseProps> = ({ size, style, ...props }) => (
  <Image style={[getIconStyle(size), style]} {...props} />
);

export const ArrowDisabled: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 64, width: 64 }}
    {...props}
    source={require('../../images/icons/ic_arrow_disabled.png')}
  />
);

export const ArrowYellow: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/ic_arrow_yellow.png')} />
);

export const OkText: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/ic_arrow_yellow.png')} />
);

export const OkTextDisabled: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/ic_arrow_disabled.png')} />
);

export const Mascot: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/ic_mascot.png')} />
);

export const More: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('../../images/icons/ic_more.png')} />
);

export const DropdownGreen: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 9, width: 14, left: 5 }}
    size="sm"
    {...props}
    source={require('../../images/icons/expand.png')}
  />
);

export const ArrowFull: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('../../images/icons/ic_arrowFull.png')} />
);

export const ArrowStep1: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('../../images/icons/ic_arrowStep1.png')} />
);

export const ArrowStep2: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('../../images/icons/ic_arrowStep2.png')} />
);

export const ArrowStep3: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('../../images/icons/ic_arrowStep3.png')} />
);

export const Remove: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('../../images/icons/ic_cross.png')} />
);

export const Reload: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_reset.png')} />
);

export const SortDecreasing: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('../../images/icons/ic_sort_decreasing.png')} />
);

export const SortIncreasing: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 18, width: 18 }}
    {...props}
    source={require('../../images/icons/ic_sort_increasing.png')}
  />
);

export const Star: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 28, width: 28 }}
    {...props}
    source={require('../../images/icons/ic_star.png')}
  />
);

export const ConsultationRoom: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_consultroom.png')} />
);

export const MyHealth: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_myhealth.png')} />
);

export const InboxIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_round_inbox.png')} />
);

export const Person: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_account.png')} />
);

export const GeneralPhysician: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 47, width: 42 }}
    {...props}
    source={require('../../images/icons/ic_general_physician.png')}
  />
);

export const Neurologist: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 47, width: 42 }}
    {...props}
    source={require('../../images/icons/ic_neurologist.png')}
  />
);

export const Paedatrician: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 47, width: 36 }}
    {...props}
    source={require('../../images/icons/ic_paedatrician.png')}
  />
);

export const Urologist: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 47, width: 48 }}
    {...props}
    source={require('../../images/icons/ic_urologist.png')}
  />
);

export const LocationOff: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_location_off.png')} />
);

export const Filter: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_filter.png')} />
);

export const BackArrow: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 16, width: 25 }}
    {...props}
    source={require('../../images/icons/backArrow.png')}
  />
);

export const NextButton: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 72, width: 72 }}
    {...props}
    source={require('../../images/icons/arrowButton.png')}
  />
);

export const DoctorPlaceholder: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 72, width: 72 }}
    {...props}
    source={require('../../images/icons/img_illustration_placeholder.png')}
  />
);

export const DoctorImage: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('../../images/icons/narayanRao.png')} />
);

export const BackIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('../../images/icons/round_navigate_before_24_px.png')} />
);

export const ApploLogo: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 40, width: 53, resizeMode: 'contain' }}
    {...props}
    source={require('../../images/icons/apollo_logoo.png')}
  />
);

export const RoundIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 24, width: 24, resizeMode: 'contain' }}
    {...props}
    source={require('../../images/icons/round_help_outline_24_px.png')}
  />
);

export const Up: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 24, width: 24, resizeMode: 'contain' }}
    {...props}
    source={require('../../images/icons/up.png')}
  />
);
export const Down: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 24, width: 24, resizeMode: 'contain' }}
    {...props}
    source={require('../../images/icons/down.png')}
  />
);

export const Send: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 24, width: 24, resizeMode: 'contain', marginTop: 20, right: 20, bottom: 5 }}
    {...props}
    source={require('../../images/icons/send.png')}
  />
);

export const Add: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 24, width: 24, resizeMode: 'contain' }}
    {...props}
    source={require('../../images/icons/add.png')}
  />
);
export const InviteIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 24, width: 24, resizeMode: 'contain' }}
    {...props}
    source={require('../../images/icons/inviteicon.png')}
  />
);

export const Notification: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 24, width: 24, resizeMode: 'contain' }}
    {...props}
    source={require('../../images/icons/notification.png')}
  />
);

export const CalendarTodayIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_calendar_today.png')} />
);

export const CalendarIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_calendar.png')} />
);

export const Cancel: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 24, width: 24, resizeMode: 'contain' }}
    {...props}
    source={require('../../images/icons/clear.png')}
  />
);
