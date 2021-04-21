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

export const Mascot: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_mascot.png')} />
);

export const DoctorIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_doctor.png')} />
);

export const CovidRiskLevel: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/covid_white.png')} />
);

export const NotifySymbolGreen: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/notify_symbolGreen.png')} />
);

export const CloseCal: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/closeCal.png')} />
);
export const LatestArticle: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_feed_orange.png')} />
);
export const More: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_more.png')} />
);
export const Copy: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/copy.png')} />
);

export const DropdownGreen: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_dropdown_green.png')} />
);

export const Remove: React.FC<IconProps> = (props) => (
  <IconBase size={'sm'} {...props} source={require('./icons/ic_cross.png')} />
);

export const Reload: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_reset.png')} />
);

export const ConsultationRoom: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_appointments.png')} />
);

export const MyHealth: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_myhealth.png')} />
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

export const TestsIconFocused: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/test_focused.png')} />
);

export const PersonFocused: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_account_white.png')} />
);

export const LocationOff: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_location_off.png')} />
);

export const Filter: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_filter.png')} />
);

export const FilterOutline: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_filter_outline.png')} />
);

export const SortOutline: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_sort.png')} />
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

export const ShopByCategoryIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    resizeMode="contain"
    {...props}
    source={require('./icons/ic_shop_by_category.png')}
  />
);

export const MedicineBuyAgain: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_medicine_buy_again.png')} />
);

export const RightArrowOrange: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_right_arrow_orange.png')} />
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

export const SpecialOffers: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_special_offers.png')} />
);

export const AddIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_plus_onorange.png')} />
);

export const RemoveIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_cross_onorange_small.png')} />
);
export const RemoveIconOrange: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/cross_3x.png')} />
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

export const WhiteArrowRightIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_white_arrow_right.png')} />
);

export const WhiteChevronRightIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_chevron_right.png')} />
);

export const SearchAreaIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_search_area_icon.png')} />
);

export const TestTimeIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_test_time.png')} />
);

export const TestInfoIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_test_info.png')} />
);

export const TestInfoWhiteIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_info_white.png')} />
);

export const ArrowRight: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_arrow_right.png')} />
);

export const ArrowRightGreen: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 12, width: 12, margin: 6 }}
    resizeMode="contain"
    {...props}
    source={require('./icons/ic_arrow_right_green.png')}
  />
);

export const ArrowUpGreen: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 12, width: 12, margin: 6 }}
    resizeMode="contain"
    {...props}
    source={require('./icons/ic_arrow_up_green.png')}
  />
);

export const DropdownBlueDown: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_dropdown_blue_down.png')} />
);

export const DropdownBlueUp: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_dropdown_blue_up.png')} />
);

export const PhrDropdownBlueUpIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_phr_blue_dropdown.png')} />
);

export const PhrSearchIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_phr_search.png')} />
);

export const Online: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 19, height: 19 }} {...props} source={require('./icons/ic_video.png')} />
);

export const InPerson: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/fa_solid_hospital.png')} />
);

export const NotificationIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_notification.png')} />
);

export const NotificationIconWhite: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/mask.png')} />
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

export const SearchGreenIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" source={require('./icons/ic_search_green.png')} {...props} />
);

export const FilterDarkBlueIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" source={require('./icons/ic_filter_dark_blue.png')} {...props} />
);

export const FilterGreenIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" source={require('./icons/ic_filter_green.png')} {...props} />
);

export const PreviousPrescriptionIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" source={require('./icons/previous_prescription_icon.png')} {...props} />
);

export const CameraIc: React.FC<IconProps> = (props) => (
  <IconBase size="md" source={require('./icons/camera_ic.png')} {...props} />
);
export const GalleryIc: React.FC<IconProps> = (props) => (
  <IconBase size="md" source={require('./icons/gallery_ic.png')} {...props} />
);
export const RxIc: React.FC<IconProps> = (props) => (
  <IconBase size="md" source={require('./icons/rx_ic.png')} {...props} />
);
export const RxPrescriptionCallIc: React.FC<IconProps> = (props) => (
  <IconBase size="sm" source={require('./icons/rx_prescription_call_ic.png')} {...props} />
);
export const RxPrescriptionIc: React.FC<IconProps> = (props) => (
  <IconBase size="sm" source={require('./icons/rx_prescription_ic.png')} {...props} />
);
export const RxPrescriptionLaterIc: React.FC<IconProps> = (props) => (
  <IconBase size="sm" source={require('./icons/rx_prescription_later_ic.png')} {...props} />
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

export const DiscountIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/discount.png')} />
);

export const FreeShippingIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_priority_high.png')} />
);

export const UploadHealthRecords: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/upload_records.png')} />
);

export const PhrNoDataIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_no_data.png')} />
);

export const PhrSymptomIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_symptoms_phr.png')} />
);

export const PhrGeneralAdviceIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_general_advice_phr.png')} />
);

export const PhrCloseIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_close_phr.png')} />
);

export const PhrCameraIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_camera.png')} />
);

export const PhrEditIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_edit.png')} />
);

export const PhrAddPrescriptionRecordIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_prescription_record.png')} />
);

export const PhrAddTestRecordIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_test_record.png')} />
);

export const PhrAddHospitalizationRecordIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_hospitalization_record.png')} />
);

export const PhrAddBillRecordIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_bill_record.png')} />
);

export const PhrAllergyIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_allergy_icon.png')} />
);

export const PhrMedicationIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_medication_icon.png')} />
);

export const PhrErrorIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_error.png')} />
);

export const PhrFamilyHistoryIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_family.png')} />
);

export const PhrMedicalIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_medical_icon.png')} />
);

export const PhrRestrictionIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_restriction_icon.png')} />
);

export const PhrAllergyBlackIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_allergies_black.png')} />
);

export const PhrMinusCircleIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_minus_circle_icon.png')} />
);

export const PhrCheckboxIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_checkbox_icon.png')} />
);

export const PhrUncheckboxIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_uncheckbox_icon.png')} />
);

export const PhrMedicationBlackIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_medication_black.png')} />
);

export const PhrRestrictionBlackIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_restriction_black.png')} />
);

export const PhrAddInsuranceRecordIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_insurance_record.png')} />
);

export const PhrRemoveBlueIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_remove_icon.png')} />
);

export const PhrAddTestDetailsIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_add_test_details.png')} />
);

export const PhrRemoveTestDetailsIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_remove_test_details.png')} />
);

export const PhrGalleryIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_gallery.png')} />
);

export const PhrFileIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_file.png')} />
);

export const PHRFollowUpDarkIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_follow_up_dark_phr.png')} />
);

export const PhrDiagnosisIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_diagnosis_phr.png')} />
);

export const FreeArrowIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_free_arrow.png')} />
);

export const OrangeCallIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_orange_phone.png')} />
);

export const FamilyDoctorIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="md"
    {...props}
    source={require('@aph/mobile-patients/src/images/home/ic_family_doctor.png')}
  />
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

export const WhiteDownloadIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_white_download.png')} />
);

export const Invoice: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_invoice.png')} />
);

export const CurrencyIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/rupee.png')} />
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

export const SearchSendIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_send.png')} />
);

export const PhysicalConsultDarkBlueIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_hospital_dark_blue.png')} />
);

export const ChatBlueIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_chat_blue.png')} />
);

export const WhiteSearchIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_search.png')} />
);

export const SearchDarkPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_search_dark_phr.png')} />
);

export const ShareYellowDocIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ic_share_yellow.png')} />
);

export const WhiteListViewIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/list_view_white.png')} />
);

export const WhiteGridViewIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/grid_view_white.png')} />
);

export const BlackGridViewIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/grid_view_black.png')} />
);

export const BlackListViewIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/list_view_black.png')} />
);

export const ShieldIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    style={{ height: 42.1, width: 36 }}
    {...props}
    source={require('./icons/shield.png')}
  />
);

export const TestsCartIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 56, width: 56, resizeMode: 'contain' }}
    {...props}
    source={require('./icons/group.png')}
  />
);

export const MedicineCartIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ height: 56, width: 56, resizeMode: 'contain' }}
    {...props}
    source={require('./icons/ic_medicines.png')}
  />
);

export const DriveWayIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/driveway.png')} />
);

export const GrayEditIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_mode_edit.png')} />
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

export const EditIconNew: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_edit_new.png')} />
);

export const EditIconNewOrange: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_edit_orange.png')} />
);

export const HomeIcon: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 32, width: 32 }} {...props} source={require('./icons/ic_home.png')} />
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
  <IconBase size="md" {...props} source={require('./icons/checkbox.png')} />
);

export const LabTestIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/lab_test_icon.png')} />
);

export const RoundGreenTickIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/green_tick.png')} />
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
export const Apollo247Icon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_Apollo.png')} />
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

export const SympTrackerIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic-symptomtracker.png')} />
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
export const CTPhone: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/ct_phone.png')} />
);
export const CTCalender: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/ct_calender.png')} />
);

export const CTVideo: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/ct_video.png')} />
);

export const CTLightGrayVideo: React.FC<IconProps> = (props) => (
  <IconBase size="sm_l" {...props} source={require('./icons/light_gray_video.png')} />
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

export const CTLightGrayChat: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 18, height: 16 }}
    {...props}
    source={require('./icons/light_gray_chat.png')}
  />
);

export const CTGrayChat: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 18, height: 16 }}
    {...props}
    source={require('./icons/gray_chat.png')}
  />
);

export const InPersonBlue: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 18, height: 22 }}
    {...props}
    source={require('./icons/ic_hospital_blue.png')}
  />
);

export const SearchIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 23, height: 23 }}
    {...props}
    source={require('./icons/loupe.png')}
    resizeMode="contain"
  />
);

export const RectangularIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/rectangleIcon.png')} />
);

export const ApolloDoctorIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ApolloDoctor.png')} />
);

export const ApolloPartnerIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/ApolloPatner.png')} />
);

export const KavachIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 24, height: 24 }}
    {...props}
    source={require('./icons/bitmap.png')}
    resizeMode="contain"
  />
);
export const ApolloHealthProIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 24, height: 24 }}
    {...props}
    source={require('./icons/prohealth.png')}
    resizeMode="contain"
  />
);

export const RetryButtonIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/retryButton.png')} resizeMode="contain" />
);

export const EllipseBulletPoint: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/Ellipse.png')} />
);

export const LockIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/lock.png')} />
);

export const MyMembershipIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/membership_icon.png')} />
);

export const UpOrange: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/up_orange.png')} />
);

export const DownOrange: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/down_orange.png')} />
);

export const SelfUploadPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_self_upload_phr.png')} />
);

export const FollowUpPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_follow_up_phr.png')} />
);

export const CartPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_cart_phr.png')} />
);

export const HospitalUploadPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_hospital_upload_phr.png')} />
);

export const PhrArrowRightIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_phr_arrow_right.png')} />
);

export const RoundCancelIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/round-cancel.png')} />
);

export const AccountCircleDarkIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/account_circle_dark.png')} />
);

export const BloodIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/blood_icon.png')} />
);

export const WeightIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/weight_icon.png')} />
);

export const HeightIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/height_icon.png')} />
);

export const PrescriptionPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_prescription_phr.png')} />
);

export const HospitalPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_hospital_phr.png')} />
);

export const HealthConditionPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_health_conditions_phr.png')} />
);

export const BillPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_invoice_phr.png')} />
);

export const InsurancePhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_insurance_phr.png')} />
);

export const ClinicalDocumentPhrIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_clinical_document_phr.png')} />
);

export const PrescriptionPhrSearchIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_phr_search_prescription.png')} />
);

export const PhrSearchNoDataIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_phr_search_nodata.png')} />
);

export const LabTestPhrSearchIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_phr_search_lab_test.png')} />
);

export const HospitalPhrSearchIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_phr_search_hospitalization.png')} />
);

export const HealthConditionPhrSearchIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_phr_search_health_conditions.png')} />
);

export const BillPhrSearchIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_phr_search_bill.png')} />
);

export const InsurancePhrSearchIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_phr_search_insurance.png')} />
);

export const CallConnectIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/call_connect.png')} />
);

export const CallRingIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/call_ring.png')} />
);

export const GroupCallIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/Group_call.png')} />
);

export const DeleteIconWhite: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/remove-icon-white.png')} />
);

export const PlusIconWhite: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/plus-icon-white.png')} />
);

export const MinusIconWhite: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/minus-icon-white.png')} />
);

export const ExclamationGreen: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/info_blue.png')} />
);

export const HdfcBannerSilver: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/Hdfc-Silver-Banner.png')} />
);

export const HdfcBannerGold: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/Hdfc-Gold-Banner.png')} />
);

export const HdfcBannerPlatinum: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/Hdfc-Platinum-Banner.png')} />
);

export const DeleteIcon: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 13, height: 19 }} {...props} source={require('./icons/delete.png')} />
);

export const Cross: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 15, height: 15 }} {...props} source={require('./icons/cross.png')} />
);

export const EditAddressIcon: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 15, height: 15 }} {...props} source={require('./icons/Edit.png')} />
);

export const LocationIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/location.png')} />
);

export const WhiteArrowRight: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 7, height: 12 }}
    {...props}
    source={require('./icons/arrow_right.png')}
  />
);

export const DeliveryIcon: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 38, height: 39 }} {...props} source={require('./icons/delivery.png')} />
);

export const DeleteBoldIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 13, height: 19 }}
    {...props}
    source={require('./icons/DeleteBold.png')}
  />
);

export const AlertIcon: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 25, height: 25 }} {...props} source={require('./icons/ic_error.png')} />
);

export const BlueDotIcon: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 5, height: 5 }} {...props} source={require('./icons/blueDot.png')} />
);

export const BotIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/bot.png')} />
);

export const InfoIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/info.png')} />
);

export const GpsIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 15, height: 15 }}
    {...props}
    source={require('./icons/ic_gps_fixed.png')}
  />
);

export const EmptyCartIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 113, height: 103 }}
    {...props}
    source={require('./icons/emptyCart.png')}
  />
);

export const CovidOrange: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_covid_orange.png')} />
);

export const VaccineTracker: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/vaccineTracker.png')} />
);

export const DashedLine: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/dashedLine.png')} />
);

export const InfoBlue: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/info_light_blue.png')} />
);

export const TickIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_tick.png')} />
);

export const OffToggle: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/off_toggle.png')} />
);

export const OnToggle: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/on_toggle.png')} />
);

export const BlueTick: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_check_blue.png')} />
);

export const HdfcBankLogo: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/HDFC_logo.png')} />
);

export const CircleLogo: React.FC<IconProps> = (props) => (
  <IconBase resizeMode="contain" size="sm" {...props} source={require('./icons/circleLogo.png')} />
);

export const OrderPlacedCheckedIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/checked.png')} />
);

export const OrderProcessingIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/process.png')} />
);

export const ExpressDeliveryLogo: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/express_delivery.png')} />
);

export const EllipseCircle: React.FC<IconProps> = (props) => (
  <IconBase
    resizeMode="contain"
    size="md"
    {...props}
    source={require('./icons/ellipseCircle.png')}
  />
);

export const CircleLogoBig: React.FC<IconProps> = (props) => (
  <IconBase
    resizeMode="contain"
    size="md"
    {...props}
    source={require('./icons/circleLogoBig.png')}
  />
);

export const CircleMembershipBanner: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/CircleMembershipBanner.png')} />
);

export const HealthLogo: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_healthcare.png')} />
);

export const EmergencyCall: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/EmergencyCall.png')} />
);

export const CircleLogoWhite: React.FC<IconProps> = (props) => (
  <IconBase
    resizeMode={'contain'}
    size="md"
    {...props}
    source={require('./icons/circleLogoWhite.png')}
  />
);

export const FemaleIcon: React.FC<IconProps> = (props) => (
  <IconBase
    resizeMode={'contain'}
    size="md"
    {...props}
    source={require('./icons/femaleIcon.png')}
  />
);

export const MaleIcon: React.FC<IconProps> = (props) => (
  <IconBase resizeMode={'contain'} size="md" {...props} source={require('./icons/maleIcon.png')} />
);

export const FemaleCircleIcon: React.FC<IconProps> = (props) => (
  <IconBase
    resizeMode={'contain'}
    size="md"
    {...props}
    source={require('./icons/femaleCircleIcon.png')}
  />
);

export const MaleCircleIcon: React.FC<IconProps> = (props) => (
  <IconBase
    resizeMode={'contain'}
    size="md"
    {...props}
    source={require('./icons/maleCircleIcon.png')}
  />
);

export const CircleDiscountBadge: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/discountBadge.png')} />
);

export const PrescriptionRequiredIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/PrescriptionIcon.png')} />
);

export const VegetarianIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/vegetarian.png')} />
);

export const NonVegetarianIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/non_vegetarian.png')} />
);

export const AlcoholIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/alcoholIcon.png')} />
);

export const PrengancyIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/pregnancyIcon.png')} />
);

export const BreastfeedingIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/breastfeedingIcon.png')} />
);

export const DrivingIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/drivingIcon.png')} />
);

export const LiverIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/liverIcon.png')} />
);

export const KidneyIcon: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/kidneyIcon.png')} />
);

export const Apollo247: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/ic_Apollo.png')} />
);

export const HomeAddressIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/home_icon.png')} />
);
export const OfficeAddressIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/office_icon.png')} />
);
export const Cash: React.FC<IconProps> = (props) => (
  <IconBase style={{ height: 32, width: 32 }} {...props} source={require('./icons/cash.png')} />
);

export const YellowTickIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/yellowTick.png')} />
);

export const FailedTxn: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/Failed.png')} />
);

export const ActiveCalenderIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/activeCalender.png')} />
);

export const InactiveCalenderIcon: React.FC<IconProps> = (props) => (
  <IconBase
    resizeMode="contain"
    size="sm"
    {...props}
    source={require('./icons/inactiveCalender.png')}
  />
);
export const HealthyLife: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 24, height: 24 }}
    {...props}
    source={require('./icons/healthyLifeIcon.png')}
    resizeMode="contain"
  />
);

export const CallCollapseIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ borderRadius: 20, width: 40, height: 40 }}
    {...props}
    source={require('./icons/callCollapse.png')}
    resizeMode="contain"
  />
);
export const OnlineAppointmentMarkerIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 24, height: 16 }}
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/onlinemarker.png')}
    resizeMode="contain"
  />
);
export const PhysicalAppointmentMarkerIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 14, height: 24 }}
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/appointmentMarker.png')}
    resizeMode="contain"
  />
);

export const AppointmentCalendarIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('./icons/calendarAppointment.png')}
    resizeMode="contain"
  />
);

export const CallCameraIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/camera.png')} resizeMode="contain" />
);

export const AudioActiveIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/microphoneActive.png')} resizeMode="contain" />
);

export const AudioInactiveIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/microphoneInactive.png')} resizeMode="contain" />
);

export const VideoActiveIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/videoActive.png')} resizeMode="contain" />
);

export const VideoInactiveIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/videoDisable.png')} resizeMode="contain" />
);

export const WhiteCallIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/whiteCall.png')} resizeMode="contain" />
);

export const UserThumbnailIcon: React.FC<IconProps> = (props) => (
  <IconBase {...props} source={require('./icons/callDoctorThumbnail.png')} resizeMode="contain" />
);

export const AddIconBlue: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/AddIconBlue.png')} />
);
export const WorkflowIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_workflow.png')} />
);

export const ArrowRightYellow: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_arrow_right_yellow.png')} />
);

export const CalenderBlueIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_blue_calender.png')} />
);

export const SpecialDiscountImage: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/specialCoupon_badge.png')} />
);

export const CameraClickButton: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_camera_button.png')} />
);

export const GalleryIconWhite: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/galleryIconWhite.png')} />
);

export const MomAndBaby: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/ic_mom&baby.png')} />
);
export const ClockIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/clock.png')} />
);
export const InfoIconRed: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_info.png')} />
);
export const WhyBookUs: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/whyBookUsDetail_Icon.png')} />
);

export const ExpiredBanner: React.FC<IconProps> = (props) => (
  <IconBase size="md" {...props} source={require('./icons/Expired_banner.png')} />
);

export const CircleBannerExpired: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/Renew_circle_banner.png')} />
);

export const LowNetworkIcon: React.FC<IconProps> = (props) => (
  <IconBase size="lg" {...props} source={require('./icons/lowNetworkIcon.png')} />
);
export const Truecaller: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/truecaller.png')} resizeMode="contain" />
);
export const DisabledTickIcon: React.FC<IconProps> = (props) => (
  <IconBase size="sm" {...props} source={require('./icons/ic_tick_disabled.png')} />
);

export const Msgs: React.FC<IconProps> = (props) => (
  <IconBase style={{ width: 27, height: 28 }} {...props} source={require('./icons/3msgs.png')} />
);

export const Wait: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 30.03, height: 29.12 }}
    {...props}
    source={require('./icons/wait.png')}
  />
);

export const Emergency: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 21, height: 29 }}
    {...props}
    source={require('./icons/emergency.png')}
  />
);

export const ExternalMeetingVideoCall: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/external_meeting_link.png')}
  />
);

export const CopyIcon: React.FC<IconProps> = (props) => (
  <IconBase
    style={{ width: 15, height: 16.7, margin: 16 }}
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/copy_white.png')}
  />
);

export const SplashCapsule: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/ic_splash_capsules.png')}
  />
);

export const SplashStethoscope: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/ic_splash_stethoscope.png')}
  />
);

export const SplashSyringe: React.FC<IconProps> = (props) => (
  <IconBase
    size="sm"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/ic_splash_syringe.png')}
  />
);

export const ProHealthIcon: React.FC<IconProps> = (props) => (
  <IconBase
    size="lg"
    {...props}
    source={require('@aph/mobile-patients/src/components/ui/icons/prohealth_icon.png')}
  />
);
