import * as React from 'react';
import { Image, ImageProps } from 'react-native';

const consultIconStyle = {
  height: 60,
  width: 60,
};

const smResizeMode: Partial<ImageProps> = { height: 24, width: 24, resizeMode: 'contain' };

const getIconStyle = (size?: IconProps['size']) => {
  if (size === 'xs') return { width: 20, height: 20 };
  if (size === 'sm') return { width: 24, height: 24 };
  if (size === 'lg') return { width: 64, height: 64 };
  return { width: 48, height: 48 };
};

interface IconProps extends Partial<ImageProps> {
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export interface IconBaseProps extends ImageProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const IconBase: React.FC<IconBaseProps> = ({ size, style, ...props }) => (
  <Image style={[getIconStyle(size), style]} {...props} />
);

export const ArrowDisabled: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/ic_arrow_disabled.png')} />
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
  <IconBase {...props} size="sm" source={require('../../images/icons/ic_cross.png')} />
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
  <IconBase
    size="sm"
    style={{ marginTop: 8 }}
    {...props}
    source={require('../../images/icons/ic_consultroom.png')}
  />
);

export const ConsultationRoomFocused: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    style={{ marginTop: 8 }}
    {...props}
    source={require('../../images/icons/ic_consultroom_white.png')}
  />
);

export const MyHealth: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    style={{ marginTop: 8 }}
    {...props}
    source={require('../../images/icons/ic_myhealth.png')}
  />
);

export const MyHealthFocused: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    style={{ marginTop: 8 }}
    {...props}
    source={require('../../images/icons/ic_myhealth_best.png')}
  />
);

export const InboxIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    style={{ marginTop: 8 }}
    {...props}
    source={require('../../images/icons/ic_round_inbox.png')}
  />
);

export const Person: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    style={{ marginTop: 8 }}
    {...props}
    source={require('../../images/icons/ic_account.png')}
  />
);

export const PersonFocused: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    style={{ marginTop: 8 }}
    {...props}
    source={require('../../images/icons/ic_account_white.png')}
  />
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
    style={smResizeMode}
    {...props}
    source={require('../../images/icons/round_help_outline_24_px.png')}
  />
);

export const Up: React.FC<IconProps> = (props) => (
  <IconBase style={smResizeMode} {...props} source={require('../../images/icons/up.png')} />
);
export const Down: React.FC<IconProps> = (props) => (
  <IconBase style={smResizeMode} {...props} source={require('../../images/icons/down.png')} />
);

export const Send: React.FC<IconProps> = (props) => (
  <IconBase style={smResizeMode} {...props} source={require('../../images/icons/send.png')} />
);

export const Add: React.FC<IconProps> = (props) => (
  <IconBase style={smResizeMode} {...props} source={require('../../images/icons/add.png')} />
);
export const InviteIcon: React.FC<IconProps> = (props) => (
  <IconBase style={smResizeMode} {...props} source={require('../../images/icons/inviteicon.png')} />
);

export const Notification: React.FC<IconProps> = (props) => (
  <IconBase
    style={smResizeMode}
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
  <IconBase style={smResizeMode} {...props} source={require('../../images/icons/clear.png')} />
);

export const Video: React.FC<IconProps> = (props) => (
  <IconBase style={smResizeMode} {...props} source={require('../../images/icons/video.png')} />
);
export const Audio: React.FC<IconProps> = (props) => (
  <IconBase style={smResizeMode} {...props} source={require('../../images/icons/clinic.png')} />
);

export const DotIcon: React.FC<IconProps> = (props) => (
  <IconBase style={smResizeMode} {...props} source={require('../../images/icons/remove.png')} />
);

export const Block: React.FC<IconProps> = (props) => (
  <IconBase style={smResizeMode} {...props} source={require('../../images/icons/block.png')} />
);

export const PastAppointmentIcon: React.FC<IconProps> = (props) => (
  <IconBase size="xs" {...props} source={require('../../images/icons/ic_status_complete.png')} />
);

export const MissedAppointmentIcon: React.FC<IconProps> = (props) => (
  <IconBase size="xs" {...props} source={require('../../images/icons/ic_status_missed.png')} />
);

export const NextAppointmentIcon: React.FC<IconProps> = (props) => (
  <IconBase size="xs" {...props} source={require('../../images/icons/ic_status_incomplete.png')} />
);
export const UpComingIcon: React.FC<IconProps> = (props) => (
  <IconBase size="xs" {...props} source={require('../../images/icons/ic_status_upcoming.png')} />
);
export const Call: React.FC<IconProps> = (props) => (
  <IconBase style={smResizeMode} {...props} source={require('../../images/icons/call.png')} />
);

export const PatientPlaceHolderImage: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 178, width: '100%' }}
    {...props}
    source={require('../../images/icons/patient_01.png')}
  />
);

export const NoCalenderData: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 131, width: 138 }}
    {...props}
    source={require('../../images/icons/no_data.png')}
  />
);
export const StartConsult: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 39, width: 149 }}
    {...props}
    source={require('../../images/icons/start_consult.png')}
  />
);
export const PlaceHolderDoctor: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 44, width: 44 }}
    {...props}
    source={require('../../images/icons/placeholderdoctor.png')}
  />
);
export const PlaceHolderDoctors: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 44, width: 44 }}
    {...props}
    source={require('../../images/icons/PlaceHolderDoctor2.png')}
  />
);

export const Start: React.FC<IconProps> = (props) => (
  <IconBase size="xs" {...props} source={require('../../images/icons/start.png')} />
);

export const DoctorCall: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/doctorcall.png')} />
);

export const ChatIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/ic_chat_circle.png')} />
);

export const FullScreenIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/ic_expand_circle.png')} />
);

export const AddIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/ic_add.png')} />
);

export const VideoOffIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={consultIconStyle}
    {...props}
    source={require('../../images/icons/ic_video_off.png')}
  />
);

export const AttachmentIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/ic_attachment.png')} />
);

export const MuteIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={consultIconStyle}
    {...props}
    source={require('../../images/icons/ic_mute_circle.png')}
  />
);

export const EndCallIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={consultIconStyle}
    {...props}
    source={require('../../images/icons/ic_endcall_big.png')}
  />
);

export const PickCallIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/ic_callpick.png')} />
);

export const ClosePopup: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('../../images/icons/round_clear_24_px.png')} />
);

export const VideoOnIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={consultIconStyle}
    {...props}
    source={require('../../images/icons/CallVideoOn.png')}
  />
);

export const SpeakerOn: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/speakerOn.png')} />
);

export const SpeakerOff: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/speakerOff.png')} />
);

export const UnMuteIcon: React.FC<IconProps> = (props) => (
  <IconBase style={consultIconStyle} {...props} source={require('../../images/icons/unMute.png')} />
);

export const FrontCameraIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={consultIconStyle}
    {...props}
    source={require('../../images/icons/frontCamera.png')}
  />
);

export const BackCameraIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={consultIconStyle}
    {...props}
    source={require('../../images/icons/backCamera.png')}
  />
);

export const RoundCallIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/roundCallIcon.png')} />
);

export const RoundVideoIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/round_videocam_24_px.png')} />
);

export const ChatWithNotification: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/ChatWithNotification.png')} />
);

export const RoundChatIcon: React.FC<IconProps> = (props) => (
  <IconBase size="xs" {...props} source={require('../../images/icons/round_info_24_px.png')} />
);

export const RightIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_arrow_right.png')} />
);

export const DiagonisisRemove: React.FC<IconProps> = (props) => (
  <IconBase size="xs" {...props} source={require('../../images/icons/ic_cross_orange.png')} />
);

export const Minus: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_minus.png')} />
);
export const Plus: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_plus.png')} />
);

export const PlusOrange: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_plus_onorange.png')} />
);

export const AddPlus: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/round_add_24_px.png')} />
);

export const Profile: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/profile.png')} />
);

export const AvailabilityIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/availibility.png')} />
);

export const FeeIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/fees.png')} />
);

export const SmartPrescription: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/smart_prescription.png')} />
);

export const Settings: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/settings.png')} />
);

export const End: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/end.png')} />
);

export const SampleImage: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 90, width: 90 }}
    {...props}
    source={require('../../images/icons/sampleimage.png')}
  />
);
export const ChatCallIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/ChatCall.png')} />
);

export const MissedCallIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/MissedCall.png')} />
);
export const ToogleOn: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 20, width: 40 }}
    {...props}
    source={require('../../images/icons/toggle_on.png')}
  />
);

export const ToogleOff: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 20, width: 40 }}
    {...props}
    source={require('../../images/icons/toggle_off.png')}
  />
);

export const ArrowLeft: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_arrow_left.png')} />
);

export const ArrowRight: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_arrow_right.png')} />
);

export const DropdownBlueDown: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/down.png')} />
);
export const DropdownBlueUp: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/up.png')} />
);

export const CheckboxSelected: React.FC<IconProps> = (props) => (
  <IconBase size="xs" {...props} source={require('../../images/icons/check_box_checked.png')} />
);

export const CheckboxUnSelected: React.FC<IconProps> = (props) => (
  <IconBase size="xs" {...props} source={require('../../images/icons/check_box_unchecked.png')} />
);

export const Selected: React.FC<IconProps> = (props) => (
  <IconBase size="xs" {...props} source={require('../../images/icons/selected.png')} />
);
export const UnSelected: React.FC<IconProps> = (props) => (
  <IconBase size="xs" {...props} source={require('../../images/icons/unselected.png')} />
);

export const Chat: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 24, width: 78 }}
    {...props}
    source={require('../../images/icons/chat_cta.png')}
  />
);
export const Search: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/search.png')} />
);

export const GreenRemove: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 26, width: 26 }}
    {...props}
    source={require('../../images/icons/ic_cancel_green.png')}
  />
);

export const InpersonIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="xs"
    {...props}
    source={require('../../images/icons/round_clinic_consult_24_px.png')}
  />
);

export const InpersonWhiteIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="xs"
    {...props}
    source={require('../../images/icons/round_clinic_consult_white.png')}
  />
);

export const GreenOnline: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 12, width: 18 }}
    {...props}
    source={require('../../images/icons/round_video_consult.png')}
  />
);

export const PhysicalIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 12, width: 18 }}
    {...props}
    source={require('../../images/icons/round_video_consult_24_px.png')}
  />
);

export const Green: React.FC<IconProps> = (props) => (
  <IconBase size="xs" {...props} source={require('../../images/icons/ic_add_green.png')} />
);

export const Morning: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_morning.png')} />
);

export const Afternoon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_afternoon.png')} />
);

export const Evening: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_evening.png')} />
);

export const Night: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_night.png')} />
);

export const MorningUnselected: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_morning_unselected.png')} />
);

export const AfternoonUnselected: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('../../images/icons/ic_afternoon_unselected.png')}
  />
);

export const EveningUnselected: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_evening_unselected.png')} />
);

export const NightUnselected: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_night_unselected.png')} />
);

export const AddAttachmentIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('../../images/icons/ic_add.png')} />
);
export const ChatSend: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/round_send_24_px.png')} />
);
export const DoctorPlaceholderImage: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 80, width: 80 }}
    {...props}
    source={require('../../images/icons/doctorPlaceholder.jpg')}
  />
);

export const CameraIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_camera.png')} />
);

export const GalleryIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_gallery.png')} />
);

export const PrescriptionIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('../../images/icons/ic_prescription.png')} />
);
export const CrossPopup: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 28, height: 28 }}
    {...props}
    source={require('../../images/icons/ic_cross_popup.png')}
  />
);
export const Path: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    style={{
      height: 10,
      width: 12,
    }}
    source={require('../../images/icons/path.png')}
  />
);

export const Edit: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 24, width: 24, resizeMode: 'contain' }}
    {...props}
    source={require('../../images/icons/edit.png')}
  />
);
