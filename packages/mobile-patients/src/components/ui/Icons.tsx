import React from 'react';
import { Image, ImageProps } from 'react-native';

const getIconStyle = (size?: IconProps['size']) => {
  if (size === 'sm') return { width: 24, height: 24 };
  if (size === 'sm_l') return { width: 18, height: 21 };
  if (size === 'md_l') return { width: 54, height: 54 };
  if (size === 'lg') return { width: 64, height: 64 };
  return { width: 48, height: 48 };
};

const getCustomIconSize = (wt: number, ht: number) => {
  return { width: wt, height: ht };
};

interface IconProps extends Partial<ImageProps> {
  size?: 'sm' | 'sm_l' | 'md' | 'md_l' | 'lg';
}

export interface IconBaseProps extends ImageProps {
  size?: 'sm' | 'sm_l' | 'md' | 'md_l' | 'lg';
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

export const DoctorIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_doctor.png')} />
);

export const CovidRiskLevel: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/covid_white.png')} />
);

export const NotifySymbol: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/notify_symbol.png')} />
);

export const CovidHealthScan: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/covid_ic_psychologist.png')} />
);

export const CovidExpert: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/covid_ic_family_doctor.png')} />
);

export const LatestArticle: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_feed.png')} />
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
  <IconBase size="sm" {...props} source={require('./icons/ic_appointments.png')} />
);

export const MyHealth: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_myhealth.png')} />
);

export const ShoppingCart: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_medsntest.png')} />
);

export const TestsIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_test.png')} />
);

export const Person: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_account.png')} />
);

export const ConsultationRoomFocused: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_appointments_white.png')} />
);

export const MyHealthFocused: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_myhealth_best.png')} />
);

export const ShoppingCartFocused: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_medsntest_white.png')} />
);

export const TestsIconFocused: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/test_focused.png')} />
);

export const PersonFocused: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_account_white.png')} />
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

export const DoctorFilter: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_doctor_filter.png')} />
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

export const MedicineIconWhite: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 17, height: 20 }}
    {...props}
    source={require('./icons/ic_medicines_selected.png')}
  />
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

export const WhiteTickIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_check_white.png')} />
);

export const GreenTickIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_correct.png')} />
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

export const Online: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 19, height: 19 }} {...props} source={require('./icons/ic_video.png')} />
);

export const InPerson: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/fa_solid_hospital.png')} />
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

export const Good: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 52, width: 52 }} {...props} source={require('./icons/good.png')} />
);
export const GoodSelected: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 52, width: 52 }}
    {...props}
    source={require('./icons/good_selected.png')}
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

export const CurrencyIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/rupee.png')} />
);

export const AddFileIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_addfile.png')} />
);

export const Minus: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_minus.png')} />
);

export const Plus: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_plus.png')} />
);

export const SuccessIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_payment_success.png')} />
);
export const FailedIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_payment_failed.png')} />
);
export const RefundIcon: React.FC<IconProps> = (props) => (
  <Image style={[getCustomIconSize(21, 24)]} source={require('./icons/ic_refund.png')} />
);
export const PendingIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_exclamation.png')} />
);

export const OneApollo: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 76, height: 59 }}
    {...props}
    source={require('./icons/img_apolloone.png')}
  />
);

export const PhysicalConsult: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 20, width: 20 }}
    {...props}
    source={require('./icons/ic_clinicvisit.png')}
  />
);

export const Loader: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 26, width: 76 }}
    {...props}
    source={require('./icons/ic_loader.png')}
  />
);

export const MedicalIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 23, width: 23 }}
    {...props}
    source={require('@aph/mobile-patients/src/images/medicine/medicalicon.png')}
  />
);

export const OfferIcon: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 36, width: 40 }} {...props} source={require('./icons/offer.png')} />
);

export const DoctorPlaceholderImage: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 80, width: 80 }}
    {...props}
    source={require('./icons/doctorPlaceholder.jpg')}
  />
);

export const HelpDrop: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 5, width: 10 }} {...props} source={require('./icons/HelpDrop.png')} />
);

export const NoData: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 80, width: 80 }} {...props} source={require('./icons/no_data.png')} />
);

export const Delivery: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 26, width: 33 }} {...props} source={require('./icons/delivery.png')} />
);

export const Pharamacy: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 43, width: 43 }}
    {...props}
    source={require('./icons/pharamacy.png')}
  />
);

export const ToggleOff: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 32, width: 32 }}
    {...props}
    source={require('./icons/ic_toggle_off.png')}
  />
);

export const ToggleOn: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 32, width: 32 }}
    {...props}
    source={require('./icons/ic_toggle_on.png')}
  />
);

export const ChatSend: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 24, width: 24 }} {...props} source={require('./icons/ChatSend.png')} />
);

export const PatientDefaultImage: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 100, width: 100 }}
    {...props}
    source={require('./icons/no-photo-icon-round.png')}
  />
);

export const SyrupBottleIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_bottle.png')} />
);

export const InjectionIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_injection.png')} />
);

export const SearchSendIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_send.png')} />
);

export const ShieldIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    style={{ height: 42.1, width: 36 }}
    {...props}
    source={require('./icons/ic_shield.png')}
  />
);

export const TestsCartIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 56, width: 56, resizeMode: 'contain' }}
    {...props}
    source={require('./icons/group.png')}
  />
);

export const TestsCartMedicineIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 56, width: 56, resizeMode: 'contain' }}
    {...props}
    source={require('./icons/ic_medicines.png')}
  />
);

export const DriveWayIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/driveway.png')} />
);

export const EditIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_edit.png')} />
);

export const EditProfilePlaceHolder: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_profile_placeholder.png')} />
);

export const ManageProfileIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_manageprofile.png')} />
);

export const CartIconWhite: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_cart_white.png')} />
);

export const EditIconNew: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_edit_new.png')} />
);

export const HomeIcon: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 32, width: 32 }} {...props} source={require('./icons/ic_home.png')} />
);

export const Ambulance: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ambulance.png')} />
);

export const Scan: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/Scan.png')} />
);

export const Success: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/Success.png')} />
);

export const Failure: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/Failure.png')} />
);

export const Pending: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/Pending.png')} />
);
export const Refund: React.FC<IconProps> = (props) => (
  <Image
    style={[getCustomIconSize(47, 53)]}
    source={require('./icons/Refund.png')}
    resizeMode="cover"
  />
);

export const Diabetes: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_diabetes.png')} />
);

export const Symptomtracker: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_symptomtracker.png')} />
);

export const PrescriptionMenu: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_prescription_menu.png')} />
);

export const Gift: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_gift.png')} />
);

export const PrescriptionPad: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_prescription_pad.png')} />
);

export const NotificationBellIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_notification_a.png')} />
);

export const NotificationCartIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_notification_b.png')} />
);

export const HandBlue: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/link-uhid/hand/hand.png')} />
);

export const PrimaryUHIDIconWhite: React.FC<IconProps> = (props) => (
  <IconBase
    size="md"
    {...props}
    source={require('./icons/link-uhid/linkedUhidWhite/linked-uhid-02.png')}
  />
);

export const PrimaryUHIDIconBlue: React.FC<IconProps> = (props) => (
  <IconBase
    size="md"
    {...props}
    source={require('./icons/link-uhid/linkedUhidBlue/linked-uhid.png')}
  />
);

export const SecondaryUHIDIconBlue: React.FC<IconProps> = (props) => (
  <IconBase
    size="md"
    {...props}
    source={require('./icons/link-uhid/linkedSecondary/secondary.png')}
  />
);

export const LinkUHIDStep1: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/link-uhid/linkuhid-step1-1/step1.png')} />
);

export const Arrow1: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/link-uhid/arrows/arrow-1.png')} />
);

export const LinkUHIDStep2first: React.FC<IconProps> = (props) => (
  <IconBase
    size="md"
    {...props}
    source={require('./icons/link-uhid/linkuhid-step2-1/link-uhid.png')}
  />
);

export const Arrow2: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/link-uhid/arrows/arrow-2.png')} />
);

export const LinkUHIDStep2second: React.FC<IconProps> = (props) => (
  <IconBase
    size="md"
    {...props}
    source={require('./icons/link-uhid/linkuhid-step2-2/link-popup.png')}
  />
);

export const Arrow3: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/link-uhid/arrows/arrow-3.png')} />
);

export const LinkUHIDStep2third: React.FC<IconProps> = (props) => (
  <IconBase
    size="md"
    {...props}
    source={require('./icons/link-uhid/linkuhid-step2-3/link-other-profile.png')}
  />
);

export const LinkUHIDStep3: React.FC<IconProps> = (props) => (
  <IconBase
    size="md"
    {...props}
    source={require('./icons/link-uhid/linkuhid-step3-1/access-link-uhid.png')}
  />
);

export const Arrow4: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/link-uhid/arrows/arrow-4.png')} />
);

export const LinkUHIDStep4first: React.FC<IconProps> = (props) => (
  <IconBase
    size="md"
    {...props}
    source={require('./icons/link-uhid/linkuhid-step4-1/delink-uhid.png')}
  />
);

export const Arrow5: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/link-uhid/arrows/arrow-6.png')} />
);

export const DottedArrow1: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/link-uhid/arrows/dotted-arrow-1.png')} />
);

export const DottedArrow2: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/link-uhid/arrows/dotted-arrow-2.png')} />
);

export const DottedArrow3: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/link-uhid/arrows/dotted-arrow-3.png')} />
);

export const LinkUHIDStep4second: React.FC<IconProps> = (props) => (
  <IconBase
    size="md"
    {...props}
    source={require('./icons/link-uhid/linkuhid-step4-2/manage-delink-post-delink.png')}
  />
);

export const LinkUHIDStep4third: React.FC<IconProps> = (props) => (
  <IconBase
    size="md"
    {...props}
    source={require('./icons/link-uhid/linkuhid-step4-3/post-delink.png')}
  />
);

export const LinkUHIDStep4fourth: React.FC<IconProps> = (props) => (
  <IconBase
    size="md"
    {...props}
    source={require('./icons/link-uhid/linkuhid-step4-4/manage-delink-post-delink.png')}
  />
);

export const CheckBox: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/checkbox.png')} />
);

export const CheckBoxFilled: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/checkboxfilled.png')} />
);

export const WhatsAppIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/whatsapp.png')} />
);

export const NeedHelpIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_round_live_help.png')} />
);

export const PrimaryIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/primary.png')} />
);

export const LinkedUhidIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/linkeduhid.png')} />
);

export const CreditsIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/credits.png')} />
);

export const SilverMembershipBanner: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/silver_membership.png')} />
);

export const MembershipBenefitsOne: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/oneapollo_benefits_1.png')} />
);

export const MembershipBenefitsTwo: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/oneapollo_benefits_2.png')} />
);

export const MembershipBenefitsThree: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/oneapollo_benefits_3.png')} />
);

export const TriangleGreyBulletPoint: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/triangle_grey.png')} />
);

export const OneApolloGold: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/gold.png')} />
);

export const OneApolloSilver: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/silver.png')} />
);

export const OneApolloPlatinum: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/platinum.png')} />
);

export const OneApolloLockIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/padlock.png')} />
);

export const TxnIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/txnicon.png')} />
);

export const InPersonHeader: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 49, height: 56 }}
    {...props}
    source={require('./icons/illustration_search_specialist.png')}
  />
);

export const OnlineHeader: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 49, height: 49 }}
    {...props}
    source={require('./icons/video_calling.png')}
  />
);

export const CTDoctor: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/ct_doctor.png')} />
);

export const CTCalender: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/ct_calender.png')} />
);

export const CTVideo: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/ct_video.png')} />
);

export const CTPayment: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/ct_payment.png')} />
);

export const CTPrescription: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/ct_prescription.png')} />
);

export const CTChat: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 18, height: 16 }} {...props} source={require('./icons/chat.png')} />
);

export const InPersonBlue: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 18, height: 22 }}
    {...props}
    source={require('./icons/ic_hospital_blue.png')}
  />
);
