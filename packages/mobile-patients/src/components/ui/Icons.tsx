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
  <IconBase size="lg" {...props} source={require('./icons/ic_arrow_disabled.webp')} />
);

export const ArrowYellow: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_arrow_yellow.webp')} />
);

export const Mascot: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_mascot.webp')} />
);

export const DoctorIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_doctor.webp')} />
);

export const CovidRiskLevel: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/covid_white.webp')} />
);

export const NotifySymbolGreen: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/notify_symbolGreen.webp')} />
);

export const CloseCal: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/closeCal.webp')} />
);
export const LatestArticle: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_feed_orange.webp')} />
);
export const More: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_more.webp')} />
);
export const Copy: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/copy.webp')} />
);
export const CopyBlue: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/copy_blue_1.png')} />
);
export const DownloadNew: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/download.webp')} />
);
export const ShareBlue: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/share.webp')} />
);
export const ViewIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/view.webp')} />
);

export const DropdownGreen: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_dropdown_green.webp')} />
);

export const Remove: React.FC<IconProps> = (props) => (
  <IconBase size={'sm'} {...props} source={require('./icons/ic_cross.webp')} />
);

export const Reload: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_reset.webp')} />
);

export const ConsultationRoom: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_appointments.webp')} />
);

export const MyHealth: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_myhealth.webp')} />
);

export const TestsIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_test.webp')} />
);

export const Person: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_account.webp')} />
);

export const ConsultationRoomFocused: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_appointments_white.webp')} />
);

export const MyHealthFocused: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_myhealth_best.webp')} />
);

export const TestsIconFocused: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/test_focused.webp')} />
);

export const PersonFocused: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_account_white.webp')} />
);

export const LocationOff: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_location_off.webp')} />
);

export const Filter: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_filter.webp')} />
);

export const FilterOutline: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_filter_outline.webp')} />
);

export const SortOutline: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_sort.webp')} />
);

export const DoctorFilter: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_doctor_filter.webp')} />
);

export const BackArrow: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 16, width: 25 }}
    {...props}
    source={require('./icons/backArrow.webp')}
  />
);

export const DoctorImage: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/narayanRao.webp')} />
);

export const Morning: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_morning.webp')} />
);

export const Afternoon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_afternoon.webp')} />
);

export const Evening: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_evening.webp')} />
);

export const Night: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_night.webp')} />
);

export const MorningSelected: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_morning_active.webp')} />
);
export const AfternoonSelected: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_sun_active.webp')} />
);
export const NightSelected: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_night_active.webp')} />
);

export const MorningUnselected: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_morning_unselected.webp')} />
);

export const AfternoonUnselected: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_afternoon_unselected.webp')} />
);

export const EveningUnselected: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_evening_unselected.webp')} />
);

export const NightUnselected: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_night_unselected.webp')} />
);

export const Location: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_location.webp')} />
);

export const LocationOutline: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/pin.webp')} />
);
export const StarEmpty: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/star.webp')} />
);
export const StarEmptyGreen: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/emptystar.webp')} />
);
export const StarFillGreen: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/fillstar.webp')} />
);

export const LocationOn: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_location_on.webp')} />
);

export const CrossPopup: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 28, height: 28 }}
    {...props}
    source={require('./icons/ic_cross_popup.webp')}
  />
);

export const BackArrowWhite: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 24, width: 25 }}
    {...props}
    source={require('./icons/ic_back_white.webp')}
  />
);

export const CalendarClose: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_calendar_close.webp')} />
);

export const CalendarShow: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_calendar_show.webp')} />
);

export const ShopByCategoryIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    resizeMode="contain"
    {...props}
    source={require('./icons/ic_shop_by_category.webp')}
  />
);

export const MedicineBuyAgain: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_medicine_buy_again.webp')} />
);

export const RightArrowOrange: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_right_arrow_orange.webp')} />
);

export const MedicineIconWhite: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 17, height: 20 }}
    {...props}
    source={require('./icons/ic_medicines_selected.webp')}
  />
);

export const MedicineIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_tablets.webp')} />
);

export const MedicineRxIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_tablets_rx.webp')} />
);

export const SpecialOffers: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_special_offers.webp')} />
);

export const OffersIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/offerGreen.webp')} />
);

export const AddIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_plus_onorange.webp')} />
);

export const RemoveIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_cross_onorange_small.webp')} />
);
export const RemoveIconOrange: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/cross_3x.webp')} />
);

export const RadioButtonIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_radio.webp')} />
);

export const RadioButtonUnselectedIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_radio_unselected.webp')} />
);

export const CheckUnselectedIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_check_unselected.webp')} />
);

export const CheckedIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_check.webp')} />
);

export const CheckIcon: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 18, width: 18 }} {...props} source={require('./icons/check.webp')} />
);

export const UnCheckIcon: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 18, width: 18 }} {...props} source={require('./icons/uncheck.webp')} />
);

export const WhiteTickIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_check_white.webp')} />
);

export const GreenTickIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_correct.webp')} />
);

export const ArrowLeft: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_arrow_left.webp')} />
);

export const WhiteArrowRightIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_white_arrow_right.webp')} />
);

export const WhiteChevronRightIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_chevron_right.webp')} />
);

export const SearchAreaIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_search_area_icon.webp')} />
);

export const BarChar: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/barChart.webp')} />
);

export const RedArrow: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/Red_Up_Arrow.webp')} />
);

export const RedDownArrow: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/Red_Down_Arrow.webp')} />
);

export const TestTimeIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_test_time.webp')} />
);

export const TestInfoIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_test_info.webp')} />
);

export const TestInfoWhiteIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_info_white.webp')} />
);

export const ArrowRight: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_arrow_right.webp')} />
);

export const EmptySlot: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/emptyslots3x.webp')} />
);

export const ArrowRightGreen: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 12, width: 12, margin: 6 }}
    resizeMode="contain"
    {...props}
    source={require('./icons/ic_arrow_right_green.webp')}
  />
);

export const ArrowUpGreen: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 12, width: 12, margin: 6 }}
    resizeMode="contain"
    {...props}
    source={require('./icons/ic_arrow_up_green.webp')}
  />
);

export const DropdownBlueDown: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_dropdown_blue_down.webp')} />
);

export const DropdownBlueUp: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_dropdown_blue_up.webp')} />
);
export const CrossOcta: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/octagon_3x.webp')} />
);
export const BlackArrowUp: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/blackarrowup_3x.webp')} />
);
export const BlackArrowDown: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/blackarrowdown_3x.webp')} />
);

export const PhrDropdownBlueUpIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_phr_blue_dropdown.webp')} />
);

export const PhrSearchIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_phr_search.webp')} />
);

export const Online: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 19, height: 19 }}
    {...props}
    source={require('./icons/ic_video.webp')}
  />
);

export const InPerson: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/fa_solid_hospital.webp')} />
);

export const NotificationIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_notification.webp')} />
);

export const NotificationIconWhite: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/mask.webp')} />
);

export const CartIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_cart.webp')} />
);

export const CameraIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_camera.webp')} />
);

export const GalleryIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_gallery.webp')} />
);

export const PrescriptionIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_prescription.webp')} />
);

export const PrescriptionColored: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/prescriptionColored_3x.webp')} />
);

export const GreenCheck: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/greenCheck_3x.webp')} />
);

export const Check: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_check.webp')} />
);

export const UnCheck: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_check_unselected.webp')} />
);

export const CrossYellow: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_cross_onorange_small.webp')} />
);

export const Path: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    style={{
      height: 10,
      width: 12,
    }}
    source={require('./icons/path.webp')}
  />
);

export const SearchGreenIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" source={require('./icons/ic_search_green.webp')} {...props} />
);

export const FilterDarkBlueIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" source={require('./icons/ic_filter_dark_blue.webp')} {...props} />
);

export const FilterGreenIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" source={require('./icons/ic_filter_green.webp')} {...props} />
);

export const PreviousPrescriptionIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" source={require('./icons/previous_prescription_icon.webp')} {...props} />
);

export const CameraIc: React.FC<IconProps> = (props) => (
  <IconBase size="md" source={require('./icons/camera_ic.webp')} {...props} />
);
export const GalleryIc: React.FC<IconProps> = (props) => (
  <IconBase size="md" source={require('./icons/gallery_ic.webp')} {...props} />
);
export const RxIc: React.FC<IconProps> = (props) => (
  <IconBase size="md" source={require('./icons/rx_ic.webp')} {...props} />
);
export const RxPrescriptionCallIc: React.FC<IconProps> = (props) => (
  <IconBase size="sm" source={require('./icons/rx_prescription_call_ic.webp')} {...props} />
);
export const RxPrescriptionIc: React.FC<IconProps> = (props) => (
  <IconBase size="sm" source={require('./icons/rx_prescription_ic.webp')} {...props} />
);
export const RxPrescriptionLaterIc: React.FC<IconProps> = (props) => (
  <IconBase size="sm" source={require('./icons/rx_prescription_later_ic.webp')} {...props} />
);

export const ChatCallIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ChatCall.webp')} />
);

export const MissedCallIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/MissedCall.webp')} />
);

export const OrderPlacedIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_tracker_done.webp')} />
);

export const DiscountIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/discount.webp')} />
);

export const FreeShippingIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_priority_high.webp')} />
);

export const UploadHealthRecords: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/upload_records.webp')} />
);

export const PhrNoDataIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_no_data.webp')} />
);

export const PhrSymptomIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_symptoms_phr.webp')} />
);

export const PhrGeneralAdviceIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_general_advice_phr.webp')} />
);

export const PhrCloseIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_close_phr.webp')} />
);

export const PhrCameraIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_camera.webp')} />
);

export const PhrEditIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_edit.webp')} />
);

export const PhrAddPrescriptionRecordIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_prescription_record.webp')} />
);

export const PhrAddTestRecordIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_test_record.webp')} />
);

export const PhrAddHospitalizationRecordIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_hospitalization_record.webp')} />
);

export const PhrAddBillRecordIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_bill_record.webp')} />
);

export const PhrAllergyIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_allergy_icon.webp')} />
);

export const PhrMedicationIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_medication_icon.webp')} />
);

export const PhrErrorIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_error.webp')} />
);

export const PhrFamilyHistoryIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_family.webp')} />
);

export const PhrMedicalIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_medical_icon.webp')} />
);

export const PhrRestrictionIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_restriction_icon.webp')} />
);

export const PhrAllergyBlackIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_allergies_black.webp')} />
);

export const PhrMinusCircleIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_minus_circle_icon.webp')} />
);

export const PhrCheckboxIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_checkbox_icon.webp')} />
);

export const PhrUncheckboxIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_uncheckbox_icon.webp')} />
);

export const PhrMedicationBlackIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_medication_black.webp')} />
);

export const PhrRestrictionBlackIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_restriction_black.webp')} />
);

export const PhrAddInsuranceRecordIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_insurance_record.webp')} />
);

export const PhrRemoveBlueIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_remove_icon.webp')} />
);

export const SchedulTime: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/schedule_time.webp')} />
);

export const PhrAddTestDetailsIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_add_test_details.webp')} />
);

export const CalendarBlackIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/calendar_black.webp')} />
);

export const PhrRemoveTestDetailsIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_remove_test_details.webp')} />
);

export const PhrGalleryIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_gallery.webp')} />
);

export const PhrFileIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_file.webp')} />
);

export const PHRFollowUpDarkIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_follow_up_dark_phr.webp')} />
);

export const PhrDiagnosisIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_diagnosis_phr.webp')} />
);

export const FreeArrowIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_free_arrow.webp')} />
);

export const OrangeCallIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_orange_phone.webp')} />
);

export const FamilyDoctorIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="md"
    {...props}
    source={require('@aph/mobile-patients/src/images/home/ic_family_doctor.webp')}
  />
);

export const OrderTrackerSmallIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_tracker_small.webp')} />
);

export const CouponIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_coupon.webp')} />
);

export const TrackerBig: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 20, width: 20 }}
    {...props}
    source={require('./icons/ic_tracker_big.webp')}
  />
);

export const OnlineConsult: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 20, width: 20 }}
    {...props}
    source={require('./icons/ic_onlineconsult.webp')}
  />
);

export const Down: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_accordion_down.webp')} />
);
export const DownO: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/chevron-bottom3x.webp')} />
);
export const UserOutline: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/user.webp')} />
);

export const Up: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_accordion_up.webp')} />
);

export const Poor: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 52, width: 52 }} {...props} source={require('./icons/poor.webp')} />
);
export const PoorSelected: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 52, width: 52 }}
    {...props}
    source={require('./icons/poor_selected.webp')}
  />
);

export const Okay: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 52, width: 52 }} {...props} source={require('./icons/okay.webp')} />
);
export const OkaySelected: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 52, width: 52 }}
    {...props}
    source={require('./icons/okay_selected.webp')}
  />
);

export const Good: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 52, width: 52 }} {...props} source={require('./icons/good.webp')} />
);
export const GoodSelected: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 52, width: 52 }}
    {...props}
    source={require('./icons/good_selected.webp')}
  />
);

export const Great: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 52, width: 52 }} {...props} source={require('./icons/great.webp')} />
);
export const GreatSelected: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 52, width: 52 }}
    {...props}
    source={require('./icons/great_selected.webp')}
  />
);

export const FileBig: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 40, width: 40 }}
    {...props}
    source={require('./icons/ic_file_big.webp')}
  />
);

export const Download: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_download.webp')} />
);

export const Highlighter: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_highligther.webp')} />
);

export const WhiteDownloadIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_white_download.png')} />
);

export const Invoice: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_invoice.webp')} />
);

export const CurrencyIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/rupee.webp')} />
);

export const SuccessIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_payment_success.webp')} />
);
export const FailedIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_payment_failed.webp')} />
);
export const RefundIcon: React.FC<IconProps> = (props) => (
  <Image style={[getCustomIconSize(21, 24)]} source={require('./icons/ic_refund.webp')} />
);
export const PendingIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_exclamation.webp')} />
);
export const WhiteProfile: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/profile_circle.webp')} />
);
export const OrangeCall: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/call_orange_circle.webp')} />
);
export const Emoticon1: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/emoticons_5.webp')} />
);
export const Emoticon2: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/emoticons_7.webp')} />
);
export const Emoticon3: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/emoticons_9.webp')} />
);
export const Emoticon4: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/emoticons_11.webp')} />
);
export const Emoticon5: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/emoticons_13.webp')} />
);
export const PremiumIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/premium_icon_2x.webp')} />
);
export const DownloadOrange: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/download_o_3x.webp')} />
);

export const OneApollo: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 76, height: 59 }}
    {...props}
    source={require('./icons/img_apolloone.webp')}
  />
);

export const PhysicalConsult: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 20, width: 20 }}
    {...props}
    source={require('./icons/ic_clinicvisit.webp')}
  />
);

export const Loader: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 26, width: 76 }}
    {...props}
    source={require('./icons/ic_loader.webp')}
  />
);

export const MedicalIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 23, width: 23 }}
    {...props}
    source={require('@aph/mobile-patients/src/images/medicine/medicalicon.webp')}
  />
);

export const OfferIcon: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 36, width: 40 }} {...props} source={require('./icons/offer.webp')} />
);

export const DoctorPlaceholderImage: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 80, width: 80 }}
    {...props}
    source={require('./icons/doctorPlaceholder.jpg')}
  />
);

export const ToggleOff: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 32, width: 32 }}
    {...props}
    source={require('./icons/ic_toggle_off.webp')}
  />
);

export const ToggleOn: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 32, width: 32 }}
    {...props}
    source={require('./icons/ic_toggle_on.webp')}
  />
);

export const ChatSend: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 24, width: 24 }}
    {...props}
    source={require('./icons/ChatSend.webp')}
  />
);

export const PatientDefaultImage: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 100, width: 100 }}
    {...props}
    source={require('./icons/no-photo-icon-round.webp')}
  />
);

export const SearchSendIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_send.webp')} />
);

export const PhysicalConsultDarkBlueIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_hospital_dark_blue.webp')} />
);

export const ChatBlueIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_chat_blue.webp')} />
);

export const WhiteSearchIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_search.webp')} />
);

export const SearchDarkPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_search_dark_phr.webp')} />
);

export const ShareBlueIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/share_icon.webp')} />
);

export const ShareYellowDocIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_share_yellow.webp')} />
);

export const ShareIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_share.webp')} />
);

export const Vaccination: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/Vaccination.webp')} />
);

export const WhiteListViewIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/list_view_white.webp')} />
);

export const WhiteGridViewIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/grid_view_white.webp')} />
);

export const BlackGridViewIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/grid_view_black.webp')} />
);

export const BlackListViewIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/list_view_black.webp')} />
);

export const ShieldIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    style={{ height: 42.1, width: 36 }}
    {...props}
    source={require('./icons/shield.webp')}
  />
);

export const TestsCartIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 56, width: 56, resizeMode: 'contain' }}
    {...props}
    source={require('./icons/group.webp')}
  />
);

export const MedicineCartIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 56, width: 56, resizeMode: 'contain' }}
    {...props}
    source={require('./icons/ic_medicines.webp')}
  />
);

export const DriveWayIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/driveway.webp')} />
);

export const GrayEditIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_mode_edit.webp')} />
);

export const EditIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_edit.webp')} />
);

export const EditProfilePlaceHolder: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_profile_placeholder.webp')} />
);

export const ManageProfileIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_manageprofile.webp')} />
);

export const EditIconNew: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_edit_new.webp')} />
);

export const EditIconNewOrange: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_edit_orange.webp')} />
);

export const HomeIcon: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 32, width: 32 }} {...props} source={require('./icons/ic_home.webp')} />
);

export const Success: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/Success.webp')} />
);

export const Failure: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/Failure.webp')} />
);

export const Pending: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/Pending.webp')} />
);
export const Refund: React.FC<IconProps> = (props) => (
  <Image
    style={[getCustomIconSize(47, 53)]}
    source={require('./icons/Refund.webp')}
    resizeMode="cover"
  />
);

export const Diabetes: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_diabetes.webp')} />
);

export const Symptomtracker: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_symptomtracker.webp')} />
);

export const PrescriptionMenu: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_prescription_menu.webp')} />
);

export const Gift: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_gift.webp')} />
);

export const PrescriptionPad: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_prescription_pad.webp')} />
);

export const NotificationBellIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_notification_a.webp')} />
);

export const NoticeIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 14, height: 14 }}
    {...props}
    source={require('./icons/ic_notice.webp')}
  />
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

export const CheckBox: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/checkbox.webp')} />
);

export const LabTestIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/lab_test_icon.webp')} />
);

export const RoundGreenTickIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/green_tick.webp')} />
);

export const CheckBoxFilled: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/checkboxfilled.webp')} />
);

export const WhatsAppIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/whatsapp.webp')} />
);

export const NeedHelpIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_round_live_help.webp')} />
);
export const Apollo247Icon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_Apollo.webp')} />
);

export const PrimaryIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/primary.webp')} />
);

export const LinkedUhidIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/linkeduhid.webp')} />
);

export const CreditsIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/credits.webp')} />
);

export const SilverMembershipBanner: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/silver_membership.webp')} />
);

export const MembershipBenefitsOne: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/oneapollo_benefits_1.webp')} />
);

export const MembershipBenefitsTwo: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/oneapollo_benefits_2.webp')} />
);

export const MembershipBenefitsThree: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/oneapollo_benefits_3.webp')} />
);

export const TriangleGreyBulletPoint: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/triangle_grey.webp')} />
);

export const OneApolloGold: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/gold.webp')} />
);

export const OneApolloSilver: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/silver.webp')} />
);

export const OneApolloPlatinum: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/platinum.webp')} />
);

export const OneApolloLockIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/padlock.webp')} />
);

export const TxnIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/txnicon.webp')} />
);

export const SympTrackerIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic-symptomtracker.webp')} />
);

export const InPersonHeader: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 49, height: 56 }}
    {...props}
    source={require('./icons/illustration_search_specialist.webp')}
  />
);
export const BORHeader: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 40, height: 40 }}
    {...props}
    source={require('./icons/BORAvatar.webp')}
  />
);

export const OnlineHeader: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 49, height: 49 }}
    {...props}
    source={require('./icons/video_calling.webp')}
  />
);

export const CTDoctor: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/ct_doctor.webp')} />
);
export const CTPhone: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/ct_phone.webp')} />
);
export const CTCalender: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/ct_calender.webp')} />
);

export const CTVideo: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/ct_video.webp')} />
);

export const CTLightGrayVideo: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/light_gray_video.webp')} />
);

export const CTPayment: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/ct_payment.webp')} />
);

export const CTPrescription: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/ct_prescription.webp')} />
);
export const BORform: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 15, height: 15 }} {...props} source={require('./icons/formBOR.webp')} />
);

export const CTChat: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 18, height: 16 }} {...props} source={require('./icons/chat.webp')} />
);

export const CTLightGrayChat: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 18, height: 16 }}
    {...props}
    source={require('./icons/light_gray_chat.webp')}
  />
);

export const CTGrayChat: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 18, height: 16 }}
    {...props}
    source={require('./icons/gray_chat.webp')}
  />
);

export const InPersonBlue: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 18, height: 22 }}
    {...props}
    source={require('./icons/ic_hospital_blue.webp')}
  />
);

export const SearchIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 23, height: 23 }}
    {...props}
    source={require('./icons/loupe.webp')}
    resizeMode="contain"
  />
);

export const RectangularIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/rectangleIcon.webp')} />
);

export const ApolloDoctorIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ApolloDoctor.webp')} />
);

export const ApolloPartnerIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ApolloPatner.webp')} />
);

export const KavachIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 24, height: 24 }}
    {...props}
    source={require('./icons/bitmap.webp')}
    resizeMode="contain"
  />
);
export const ApolloHealthProIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 24, height: 24 }}
    {...props}
    source={require('./icons/prohealth.webp')}
    resizeMode="contain"
  />
);

export const RetryButtonIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/retryButton.webp')} resizeMode="contain" />
);

export const EllipseBulletPoint: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/Ellipse.webp')} />
);

export const LockIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/lock.webp')} />
);

export const MyMembershipIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/membership_icon.webp')} />
);

export const UpOrange: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/up_orange.webp')} />
);

export const DownOrange: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/down_orange.webp')} />
);

export const SelfUploadPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_self_upload_phr.webp')} />
);

export const FollowUpPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_follow_up_phr.webp')} />
);

export const CartPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_cart_phr.webp')} />
);

export const HospitalUploadPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_hospital_upload_phr.webp')} />
);

export const PhrArrowRightIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_phr_arrow_right.webp')} />
);

export const RoundCancelIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/round-cancel.webp')} />
);

export const AccountCircleDarkIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/account_circle_dark.webp')} />
);

export const BloodIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/blood_icon.webp')} />
);

export const WeightIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/weight_icon.webp')} />
);

export const HeightIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/height_icon.webp')} />
);

export const PrescriptionPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_prescription_phr.webp')} />
);

export const HospitalPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_hospital_phr.webp')} />
);

export const HealthConditionPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_health_conditions_phr.webp')} />
);

export const BillPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_invoice_phr.webp')} />
);

export const InsurancePhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_insurance_phr.webp')} />
);

export const ClinicalDocumentPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_clinical_document_phr.webp')} />
);

export const PrescriptionPhrSearchIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_phr_search_prescription.webp')} />
);

export const PhrSearchNoDataIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_phr_search_nodata.webp')} />
);

export const LabTestPhrSearchIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_search_lab_test.webp')} />
);

export const HospitalPhrSearchIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_phr_search_hospitalization.webp')} />
);

export const HealthConditionPhrSearchIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_phr_search_health_conditions.webp')} />
);

export const BillPhrSearchIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_phr_search_bill.webp')} />
);

export const InsurancePhrSearchIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_phr_search_insurance.webp')} />
);

export const CallConnectIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/call_connect.webp')} />
);

export const CallRingIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/call_ring.webp')} />
);

export const GroupCallIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/Group_call.webp')} />
);

export const DeleteIconWhite: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/remove-icon-white.webp')} />
);

export const PlusIconWhite: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/plus-icon-white.webp')} />
);

export const MinusIconWhite: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/minus-icon-white.webp')} />
);

export const ExclamationGreen: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/info_blue.webp')} />
);

export const HdfcBannerSilver: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/Hdfc-Silver-Banner.webp')} />
);

export const HdfcBannerGold: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/Hdfc-Gold-Banner.webp')} />
);

export const HdfcBannerPlatinum: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/Hdfc-Platinum-Banner.webp')} />
);

export const DeleteIcon: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 13, height: 19 }} {...props} source={require('./icons/delete.webp')} />
);

export const Cross: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 15, height: 15 }} {...props} source={require('./icons/cross.webp')} />
);

export const EditAddressIcon: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 15, height: 15 }} {...props} source={require('./icons/Edit.webp')} />
);

export const LocationIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/location.webp')} />
);

export const WhiteArrowRight: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 7, height: 12 }}
    {...props}
    source={require('./icons/arrow_right.webp')}
  />
);

export const DeliveryIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 38, height: 39 }}
    {...props}
    source={require('./icons/delivery.webp')}
  />
);

export const DeleteBoldIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 13, height: 19 }}
    {...props}
    source={require('./icons/DeleteBold.webp')}
  />
);

export const AlertIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 25, height: 25 }}
    {...props}
    source={require('./icons/ic_error.webp')}
  />
);

export const BlueDotIcon: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 5, height: 5 }} {...props} source={require('./icons/blueDot.webp')} />
);

export const BotIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/bot.webp')} />
);

export const InfoIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/info.webp')} />
);

export const GpsIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 15, height: 15 }}
    {...props}
    source={require('./icons/ic_gps_fixed.webp')}
  />
);

export const EmptyCartIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 113, height: 103 }}
    {...props}
    source={require('./icons/emptyCart.webp')}
  />
);

export const CovidOrange: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_covid_orange.webp')} />
);

export const VaccineTracker: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/vaccineTracker.webp')} />
);

export const DashedLine: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/dashedLine.webp')} />
);

export const InfoBlue: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/info_light_blue.webp')} />
);

export const TickIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_tick.webp')} />
);

export const OffToggle: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/off_toggle.webp')} />
);

export const OnToggle: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/on_toggle.webp')} />
);

export const BlueTick: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_check_blue.webp')} />
);

export const HdfcBankLogo: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/HDFC_logo.webp')} />
);

export const CircleLogo: React.FC<IconProps> = (props) => (
  <IconBase resizeMode="contain" size="sm" {...props} source={require('./icons/circleLogo.webp')} />
);

export const OrderPlacedCheckedIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/checked.webp')} />
);

export const OrderProcessingIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/process.webp')} />
);

export const ExpressDeliveryLogo: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/express_delivery.webp')} />
);

export const EllipseCircle: React.FC<IconProps> = (props) => (
  <IconBase
    resizeMode="contain"
    size="md"
    {...props}
    source={require('./icons/ellipseCircle.webp')}
  />
);

export const CircleLogoBig: React.FC<IconProps> = (props) => (
  <IconBase
    resizeMode="contain"
    size="md"
    {...props}
    source={require('./icons/circleLogoBig.webp')}
  />
);

export const CircleMembershipBanner: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/CircleMembershipBanner.webp')} />
);

export const HealthLogo: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_healthcare.webp')} />
);

export const EmergencyCall: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/EmergencyCall.webp')} />
);

export const CircleLogoWhite: React.FC<IconProps> = (props) => (
  <IconBase
    resizeMode={'contain'}
    size="md"
    {...props}
    source={require('./icons/circleLogoWhite.webp')}
  />
);

export const FemaleIcon: React.FC<IconProps> = (props) => (
  <IconBase
    resizeMode={'contain'}
    size="md"
    {...props}
    source={require('./icons/femaleIcon.webp')}
  />
);

export const MaleIcon: React.FC<IconProps> = (props) => (
  <IconBase resizeMode={'contain'} size="md" {...props} source={require('./icons/maleIcon.webp')} />
);

export const FemaleCircleIcon: React.FC<IconProps> = (props) => (
  <IconBase
    resizeMode={'contain'}
    size="md"
    {...props}
    source={require('./icons/femaleCircleIcon.webp')}
  />
);

export const MaleCircleIcon: React.FC<IconProps> = (props) => (
  <IconBase
    resizeMode={'contain'}
    size="md"
    {...props}
    source={require('./icons/maleCircleIcon.webp')}
  />
);

export const CircleDiscountBadge: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/discountBadge.webp')} />
);

export const PrescriptionRequiredIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/PrescriptionIcon.webp')} />
);

export const PrescriptionCallIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/phone-call_3x.webp')} />
);

export const VegetarianIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/vegetarian.webp')} />
);

export const NonVegetarianIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/non_vegetarian.webp')} />
);

export const AlcoholIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/alcoholIcon.webp')} />
);

export const PrengancyIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/pregnancyIcon.webp')} />
);

export const BreastfeedingIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/breastfeedingIcon.webp')} />
);

export const DrivingIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/drivingIcon.webp')} />
);

export const LiverIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/liverIcon.webp')} />
);

export const KidneyIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/kidneyIcon.webp')} />
);

export const Apollo247: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_Apollo.webp')} />
);

export const HomeAddressIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/home_icon.webp')} />
);
export const OfficeAddressIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/office_icon.webp')} />
);
export const Cash: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 32, width: 32 }} {...props} source={require('./icons/cash.webp')} />
);

export const YellowTickIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/yellowTick.webp')} />
);

export const FailedTxn: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/Failed.webp')} />
);

export const ActiveCalenderIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/activeCalender.webp')} />
);

export const GreenCircleTick: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/greenCircleTick_3x.webp')} />
);

export const WhiteCross: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/white_cross_3x.webp')} />
);

export const InactiveCalenderIcon: React.FC<IconProps> = (props) => (
  <IconBase
    resizeMode="contain"
    size="sm"
    {...props}
    source={require('./icons/inactiveCalender.webp')}
  />
);
export const HealthyLife: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 24, height: 24 }}
    {...props}
    source={require('./icons/healthyLifeIcon.webp')}
    resizeMode="contain"
  />
);

export const CallCollapseIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ borderRadius: 20, width: 40, height: 40 }}
    {...props}
    source={require('./icons/callCollapse.webp')}
    resizeMode="contain"
  />
);
export const OnlineAppointmentMarkerIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 24, height: 16 }}
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/onlinemarker.webp')}
    resizeMode="contain"
  />
);
export const PhysicalAppointmentMarkerIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 14, height: 24 }}
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/appointmentMarker.webp')}
    resizeMode="contain"
  />
);

export const AppointmentCalendarIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('./icons/calendarAppointment.webp')}
    resizeMode="contain"
  />
);

export const CallCameraIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/camera.webp')} resizeMode="contain" />
);

export const AudioActiveIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/microphoneActive.webp')} resizeMode="contain" />
);

export const AudioInactiveIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/microphoneInactive.webp')} resizeMode="contain" />
);

export const VideoActiveIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/videoActive.webp')} resizeMode="contain" />
);

export const VideoInactiveIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/videoDisable.webp')} resizeMode="contain" />
);

export const WhiteCallIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/whiteCall.webp')} resizeMode="contain" />
);

export const WhiteCall: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/vector3x.webp')} resizeMode="contain" />
);

export const BlueCross: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/blueCross3x.webp')} resizeMode="contain" />
);

export const UserThumbnailIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/callDoctorThumbnail.webp')} resizeMode="contain" />
);

export const AddIconBlue: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/AddIconBlue.webp')} />
);
export const WorkflowIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_workflow.webp')} />
);

export const ArrowRightYellow: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_arrow_right_yellow.webp')} />
);

export const CalenderBlueIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_blue_calender.webp')} />
);

export const SpecialDiscountImage: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/specialCoupon_badge.webp')} />
);

export const CameraClickButton: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_camera_button.webp')} />
);

export const GalleryIconWhite: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/galleryIconWhite.webp')} />
);

export const MomAndBaby: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_mom&baby.webp')} />
);
export const ClockIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/clock.webp')} />
);
export const InfoIconRed: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_info.webp')} />
);
export const InfoIconBlue: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_info_blue_2x.webp')} />
);

export const ExpiredBanner: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/Expired_banner.webp')} />
);

export const CircleBannerExpired: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/Renew_circle_banner.webp')} />
);

export const LowNetworkIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/lowNetworkIcon.webp')} />
);
export const Truecaller: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/truecaller.webp')} resizeMode="contain" />
);
export const DisabledTickIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_tick_disabled.webp')} />
);
export const PromoCashback: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 200, height: 75 }}
    {...props}
    source={require('./icons/promoCashback2x.webp')}
  />
);

export const Msgs: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 27, height: 28 }} {...props} source={require('./icons/3msgs.webp')} />
);

export const Wait: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 30.03, height: 29.12 }}
    {...props}
    source={require('./icons/wait.webp')}
  />
);

export const Emergency: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 21, height: 29 }}
    {...props}
    source={require('./icons/emergency.webp')}
  />
);

export const PayTm: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 63, height: 20 }} {...props} source={require('./icons/pay.png')} />
);

export const PayU: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 42, height: 20 }} {...props} source={require('./icons/payu.png')} />
);

export const ExternalMeetingVideoCall: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/external_meeting_link.webp')}
  />
);

export const CopyIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 15, height: 16.7, margin: 16 }}
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/copy_white.webp')}
  />
);

export const SplashCapsule: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/ic_splash_capsules.webp')}
  />
);

export const SplashStethoscope: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/ic_splash_stethoscope.webp')}
  />
);

export const SplashSyringe: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/ic_splash_syringe.webp')}
  />
);

export const ProHealthIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="lg"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/prohealth_icon.webp')}
  />
);

export const SampleTestTubesIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/sample-tube.webp')}
  />
);

export const AppointmentIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/appointment.webp')}
  />
);

export const MedicalHistoryIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/medical-history.webp')}
  />
);

export const RefreshIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/ic_cached.png')}
  />
);

export const AgentIcon: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/agent_icon.png')}
  />
);

export const NoVaccineBooking: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 155, height: 155 }}
    {...props}
    source={require('./icons/no_vaccine_booking.webp')}
  />
);

export const CovidVaccine: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/covid_vaccine.webp')} />
);

export const VaccineBookingFailed: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/vacc_booking_failed.webp')} />
);

export const Card: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 28, height: 28 }} {...props} source={require('./icons/card.webp')} />
);

export const CircleCheckIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 18, width: 18 }}
    {...props}
    source={require('./icons/circleCheck.webp')}
  />
);

export const CircleUncheckIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 18, width: 18 }}
    {...props}
    source={require('./icons/circleUncheck.webp')}
  />
);

export const CardCVV: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 206, width: 268 }}
    {...props}
    source={require('./icons/CardCVV.webp')}
  />
);

export const DeleteBlack: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 20, height: 20 }}
    {...props}
    source={require('./icons/deleteIcon.webp')}
  />
);

export const Expired: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 14.67, height: 13.33 }}
    {...props}
    source={require('./icons/expired.webp')}
  />
);

export const WidgetLiverIcon: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/ic_liver_icon.webp')}
  />
);

export const GreenClock: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/green_clock.webp')}
  />
);

export const SyringSmall: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/syring_small.webp')} />
);

export const SyringLarge: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/syring_large.webp')} />
);

export const HomeLocationIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/home.webp')}
  />
);

export const WorkLocationIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/location_pin.webp')}
  />
);

export const MapLocationIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/work.webp')}
  />
);

export const PolygonIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/Polygon.webp')}
  />
);

export const SavingsIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/saving_icon.webp')}
  />
);

export const DownArrow: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/down_arrow.webp')}
  />
);

export const TimelinePatientProgress: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/addPatient_unselected.webp')}
  />
);

export const TimelinePatientDone: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/addPatient_done.webp')}
  />
);

export const TimelineCartUnselected: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/cart_unselected.webp')}
  />
);

export const TimelineCartProgress: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/cart_progress.webp')}
  />
);

export const TimelineCartDone: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/cart_done.webp')}
  />
);

export const TimelineScheduleUnselected: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/schedule_unselected.webp')}
  />
);

export const TimelineScheduleProgress: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/schedule_progress.webp')}
  />
);

export const TimelineScheduleDone: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/schedule_done.webp')}
  />
);

export const TimelineReviewUnselected: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/review_unselected.webp')}
  />
);

export const TimelineReviewProgress: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/review_progress.webp')}
  />
);

export const AddPatientCircleIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/circle-plus.webp')}
  />
);

export const MinusPatientCircleIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/circle-minus.webp')}
  />
);
export const Tick: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('@aph/mobile-patients/src/components/ui/icons/tick.webp')} />
);

export const Close: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/green_cross.webp')}
  />
);

export const TimeIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/time.webp')}
  />
);

export const AlertTriangle: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/alert-triangle.webp')}
  />
);

export const TestTubes: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/testTubes.webp')}
  />
);

export const LongRightArrow: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/LongRightArrow.webp')}
  />
);

export const DoctorLocation: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/doctor_location.webp')}
  />
);

export const DoctorLanguage: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/language.webp')}
  />
);

export const PdfGray: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/pdf-gray.webp')}
  />
);

export const EmailGray: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/email-gray.webp')}
  />
);

export const Pdf: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('@aph/mobile-patients/src/components/ui/icons/pdf.webp')} />
);

export const RightArrowBlue: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/blue-arrow-right.webp')}
  />
);

export const ConsultSuccess: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/consult-success.webp')}
  />
);

export const ConsultFailure: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/consult-failure.webp')}
  />
);

export const ConsultPending: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/consult-pending.webp')}
  />
);

export const FasterSubstitutes: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/FasterSubstitute.webp')}
  />
);

export const Alert: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    style={{ height: 20, width: 22 }}
    source={require('@aph/mobile-patients/src/components/ui/icons/alert.webp')}
  />
);

export const AlertRed: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 20, width: 22 }}
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/alertRed.webp')}
  />
);

export const ExpressSlotClock: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/expressSlotIcon.webp')}
  />
);

export const OvalUpcoming: React.FC<IconProps> = (props) => (
  <IconBase
    size="lg"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/ovalUpcoming.webp')}
  />
);

export const NetworkChecking: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/network_checking.webp')}
  />
);

export const NetworkGood: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/network_good.webp')}
  />
);

export const NetworkBad: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/network_bad.webp')}
  />
);

export const NetworkAverage: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/network_average.webp')}
  />
);

export const NetworkWhite: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 13, width: 16 }}
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/network_white.webp')}
  />
);
export const RemoveIconGrey: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/crossIcon.webp')}
  />
);

export const ConsultRefund: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/refund_new.webp')}
  />
);

export const EditProfile: React.FC<IconProps> = (props) => (
  <IconBase
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/patient_edit.webp')}
  />
);

export const PackageIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/packagesIcon.webp')}
  />
);
export const CoinSavingsIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="lg"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/coinSavingsIcon.webp')}
  />
);

export const ReferralBannerIcon: React.FC<IconProps> = (props) => (
  <Image
    style={[props.style]}
    source={require('@aph/mobile-patients/src/images/referAndEarn/referralBanner/referralbanner.webp')}
    {...props}
  />
);

export const WhatsAppIconReferral: React.FC<IconProps> = (props) => (
  <Image
    style={[props.style]}
    source={require('@aph/mobile-patients/src/images/referAndEarn/whatsApp/whatsAppIcon.webp')}
    {...props}
  />
);
export const CopyLinkIcon: React.FC<IconProps> = (props) => (
  <Image
    style={[props.style]}
    source={require('@aph/mobile-patients/src/images/referAndEarn/copyLink/copyLinkIcon.webp')}
    {...props}
  />
);

export const InviteYourFriendIcon: React.FC<IconProps> = (props) => (
  <Image
    style={[props.style]}
    source={require('@aph/mobile-patients/src/images/referAndEarn/invitation/invitation.webp')}
    {...props}
  />
);

export const FriendReceiveIcon: React.FC<IconProps> = (props) => (
  <Image
    style={[props.style]}
    source={require('@aph/mobile-patients/src/images/referAndEarn/earnMoney/earnMoney.webp')}
    {...props}
  />
);

export const YouReceiveIcon: React.FC<IconProps> = (props) => (
  <Image
    style={[props.style]}
    source={require('@aph/mobile-patients/src/images/referAndEarn/delivered/delivered.webp')}
    {...props}
  />
);

export const ReferRefreshIcon: React.FC<IconProps> = (props) => (
  <Image
    style={[props.style]}
    source={require('@aph/mobile-patients/src/images/referAndEarn/refresh/refresh.webp')}
    {...props}
  />
);

export const ReferCheckIcon: React.FC<IconProps> = (props) => (
  <Image
    style={[props.style]}
    source={require('@aph/mobile-patients/src/images/referAndEarn/gotRewardCheck/checkCircleReward.webp')}
    {...props}
  />
);

export const TrophyIcon: React.FC<IconProps> = (props) => (
  <Image
    style={[props.style]}
    source={require('@aph/mobile-patients/src/images/referAndEarn/congratsRewards/congratsRewards.webp')}
    {...props}
  />
);

export const FastDeliveryIcon: React.FC<IconProps> = (props) => (
  <Image
    style={[props.style]}
    source={require('@aph/mobile-patients/src/images/referAndEarn/deliveredInHours/deliiveredInHours.webp')}
    {...props}
  />
);

export const ConsultDoctorIcon: React.FC<IconProps> = (props) => (
  <Image
    style={[props.style]}
    source={require('@aph/mobile-patients/src/images/referAndEarn/consultInMinutes/consultInMinutes.webp')}
    {...props}
  />
);

export const LabTestAtHomeIcon: React.FC<IconProps> = (props) => (
  <Image
    style={[props.style]}
    source={require('@aph/mobile-patients/src/images/referAndEarn/labAtHome/labTestAtHome.webp')}
    {...props}
  />
);

export const FaqDownArrow: React.FC<IconProps> = (props) => (
  <Image
    style={[props.style]}
    source={require('@aph/mobile-patients/src/images/referAndEarn/faqArrow/downArrow.webp')}
    {...props}
  />
);

export const ShareLinkBannerIcon: React.FC<IconProps> = (props) => (
  <Image
    style={[props.style]}
    source={require('@aph/mobile-patients/src/images/shareLinkBanner/shareRefereLink.webp')}
    {...props}
  />
);

export const OfferBlueIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/offerIcon.webp')} />
);

export const InvalidOfferIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/invalidIcon.webp')} />
);

export const DoctorConsultIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/doctorConsultIcon-1.webp')}
  />
);
