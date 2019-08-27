import React from 'react';
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
  <IconBase size="lg" {...props} source={require('./icons/ic_arrow_disabled.png')} />
);

export const ArrowYellow: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_arrow_yellow.png')} />
);

export const OkText: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_ok.png')} />
);

export const OkTextDisabled: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ok_disabled.png')} />
);

export const Mascot: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_mascot.png')} />
);

export const More: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_more.png')} />
);

export const DropdownGreen: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_dropdown_green.png')} />
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
  <IconBase size={'sm'} {...props} source={require('./icons/ic_cross.png')} />
);

export const Reload: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_reset.png')} />
);

export const SortDecreasing: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_sort_decreasing.png')} />
);

export const SortIncreasing: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 18, width: 18 }}
    {...props}
    source={require('./icons/ic_sort_increasing.png')}
  />
);

export const Star: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_star.png')} />
);

export const ConsultationRoom: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    style={{ marginTop: 8 }}
    {...props}
    source={require('./icons/ic_consultroom.png')}
  />
);

export const MyHealth: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    style={{ marginTop: 8 }}
    {...props}
    source={require('./icons/ic_myhealth.png')}
  />
);

export const ShoppingCart: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    style={{ marginTop: 8 }}
    {...props}
    source={require('./icons/ic_medsntest.png')}
  />
);

export const Person: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    style={{ marginTop: 8 }}
    {...props}
    source={require('./icons/ic_account.png')}
  />
);

export const ConsultationRoomFocused: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    style={{ marginTop: 8 }}
    {...props}
    source={require('./icons/ic_consultroom_white.png')}
  />
);

export const MyHealthFocused: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    style={{ marginTop: 8 }}
    {...props}
    source={require('./icons/ic_myhealth_best.png')}
  />
);

export const ShoppingCartFocused: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    style={{ marginTop: 8 }}
    {...props}
    source={require('./icons/ic_medsntest_white.png')}
  />
);

export const PersonFocused: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    style={{ marginTop: 8 }}
    {...props}
    source={require('./icons/ic_account_white.png')}
  />
);

export const GeneralPhysician: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 47, width: 42 }}
    {...props}
    source={require('./icons/ic_general_physician.png')}
  />
);

export const Neurologist: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 47, width: 42 }}
    {...props}
    source={require('./icons/ic_neurologist.png')}
  />
);

export const Paedatrician: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 47, width: 36 }}
    {...props}
    source={require('./icons/ic_paedatrician.png')}
  />
);

export const Urologist: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 47, width: 48 }}
    {...props}
    source={require('./icons/ic_urologist.png')}
  />
);

export const LocationOff: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_location_off.png')} />
);

export const Filter: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_filter.png')} />
);

export const BackArrow: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 16, width: 25 }}
    {...props}
    source={require('./icons/backArrow.png')}
  />
);

export const NextButton: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/arrowButton.png')} />
);

export const DoctorPlaceholder: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 72, width: 72 }}
    {...props}
    source={require('./icons/img_illustration_placeholder.png')}
  />
);

export const DoctorImage: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/narayanRao.png')} />
);

export const Morning: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_morning.png')} />
);

export const Afternoon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_afternoon.png')} />
);

export const Evening: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_evening.png')} />
);

export const Night: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_night.png')} />
);

export const MorningUnselected: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_morning_unselected.png')} />
);

export const AfternoonUnselected: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_afternoon_unselected.png')} />
);

export const EveningUnselected: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_evening_unselected.png')} />
);

export const NightUnselected: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_night_unselected.png')} />
);

export const Location: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_location.png')} />
);

export const LocationOn: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_location_on.png')} />
);

export const CrossPopup: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 28, height: 28 }}
    {...props}
    source={require('./icons/ic_cross_popup.png')}
  />
);

export const ShareWhite: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_share_white.png')} />
);

export const BackArrowWhite: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 24, width: 25 }}
    {...props}
    source={require('./icons/ic_back_white.png')}
  />
);

export const CalendarClose: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_calendar_close.png')} />
);

export const CalendarShow: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_calendar_show.png')} />
);

export const ShareGreen: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_share_green.png')} />
);

export const MedicineIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_tablets.png')} />
);

export const MedicineRxIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_tablets_rx.png')} />
);

export const AddIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_plus_onorange.png')} />
);

export const RemoveIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_cross_onorange_small.png')} />
);

export const RadioButtonIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_radio.png')} />
);

export const RadioButtonUnselectedIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_radio_unselected.png')} />
);

export const CheckUnselectedIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_check_unselected.png')} />
);

export const CheckedIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_check.png')} />
);

export const ArrowLeft: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_arrow_left.png')} />
);

export const ArrowRight: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_arrow_right.png')} />
);

export const DropdownBlueDown: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_dropdown_blue_down.png')} />
);

export const DropdownBlueUp: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_dropdown_blue_up.png')} />
);

export const FrontCameraIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/frontCamera.png')} />
);

export const BackCameraIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/backCamera.png')} />
);

export const VideoOffIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_video_off.png')} />
);

export const VideoOnIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/CallVideoOn.png')} />
);

export const SpeakerOn: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/speakerOn.png')} />
);

export const SpeakerOff: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/speakerOff.png')} />
);

export const AttachmentIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_attachment.png')} />
);

export const MuteIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_mute_circle.png')} />
);

export const UnMuteIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/unMute.png')} />
);

export const EndCallIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_endcall_big.png')} />
);

export const PickCallIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_callpick.png')} />
);

export const DoctorCall: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/doctorcall.png')} />
);

export const ChatIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_chat_circle.png')} />
);

export const FullScreenIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_expand_circle.png')} />
);

export const AddAttachmentIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_add.png')} />
);

export const ChatWithNotification: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ChatWithNotification.png')} />
);

export const NotificationIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_notification.png')} />
);

export const CartIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_cart.png')} />
);

export const CameraIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_camera.png')} />
);

export const GalleryIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_gallery.png')} />
);

export const PrescriptionIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_prescription.png')} />
);

export const Check: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_check.png')} />
);

export const UnCheck: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_check_unselected.png')} />
);

export const CrossYellow: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_cross_onorange_small.png')} />
);

export const PrescriptionThumbnail: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    style={{
      height: 40,
      width: 30,
    }}
    source={require('./icons/ic_prescription_thumbnail.png')}
  />
);

export const Path: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    style={{
      height: 10,
      width: 12,
    }}
    source={require('./icons/path.png')}
  />
);

export const ChatCallIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ChatCall.png')} />
);

export const MissedCallIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/MissedCall.png')} />
);

export const OrderPlacedIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_tracker_done.png')} />
);

export const OrderOnHoldIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_hold.png')} />
);

export const OrderDelayedIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_tracker_hold.png')} />
);

export const OrderTrackerSmallIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_tracker_small.png')} />
);

export const CouponIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_coupon.png')} />
);

export const TrackerBig: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 20, width: 20 }}
    {...props}
    source={require('./icons/ic_tracker_big.png')}
  />
);

export const OnlineConsult: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 20, width: 20 }}
    {...props}
    source={require('./icons/ic_onlineconsult.png')}
  />
);

export const PrescriptionSkyBlue: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 20, width: 20 }}
    {...props}
    source={require('./icons/ic_prescription_sky_blue.png')}
  />
);

export const Down: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_accordion_down.png')} />
);

export const Up: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_accordion_up.png')} />
);

export const Poor: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 52, width: 52 }} {...props} source={require('./icons/poor.png')} />
);
export const PoorSelected: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 52, width: 52 }}
    {...props}
    source={require('./icons/poor_selected.png')}
  />
);

export const Okay: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 52, width: 52 }} {...props} source={require('./icons/okay.png')} />
);
export const OkaySelected: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 52, width: 52 }}
    {...props}
    source={require('./icons/okay_selected.png')}
  />
);
export const Great: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 52, width: 52 }} {...props} source={require('./icons/great.png')} />
);
export const GreatSelected: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 52, width: 52 }}
    {...props}
    source={require('./icons/great_selected.png')}
  />
);

export const FileBig: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 40, width: 40 }}
    {...props}
    source={require('./icons/ic_file_big.png')}
  />
);

export const Download: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_download.png')} />
);

export const NotificaitonAccounts: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_notificaiton_accounts.png')} />
);

export const Invoice: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_invoice.png')} />
);

export const AddFileIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_addfile.png')} />
);
