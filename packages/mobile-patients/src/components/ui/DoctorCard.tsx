import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { AvailabilityCapsule } from '@aph/mobile-patients/src/components/ui/AvailabilityCapsule';
import {
  DoctorPlaceholderImage,
  InPerson,
  Online,
  ApolloDoctorIcon,
  ApolloPartnerIcon,
  InfoBlue,
  CircleLogo,
  ShareYellowDocIcon,
  LocationGrey,
  HospitalPhrIcon,
  VideoActiveIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { SAVE_SEARCH } from '@aph/mobile-patients/src/graphql/profiles';
import { getDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import {
  getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors,
  getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsNextAvailability,
} from '@aph/mobile-patients/src/graphql/types/getDoctorsBySpecialtyAndFilters';
import {
  ConsultMode,
  DoctorType,
  SEARCH_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { saveSearch } from '@aph/mobile-patients/src/graphql/types/saveSearch';
import {
  g,
  postWebEngageEvent,
  nextAvailability,
  getUserType,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors } from '../../graphql/types/SearchDoctorAndSpecialtyByName';
import { WebEngageEvents, WebEngageEventName } from '../../helpers/webEngageEvents';
import {
  calculateCircleDoctorPricing,
  convertNumberToDecimal,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { getNextAvailableSlots } from '@aph/mobile-patients/src/helpers/clientCalls';
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  doctorView: {
    flex: 1,
    marginHorizontal: 20,
    ...theme.viewStyles.cardViewStyle,
    marginBottom: 30,
    borderRadius: 10,
  },
  buttonText: {
    ...theme.fonts.IBMPlexSansBold(14),
    textTransform: 'uppercase',
    color: theme.colors.BUTTON_BG,
  },
  availableView: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 2,
  },
  imageView: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  drImageBackground: {
    height: 95,
    width: 95,
    justifyContent: 'center',
  },
  drImageMargins: {
    marginHorizontal: 12,
    marginTop: 12,
  },
  doctorNameStyles: {
    paddingTop: 0,
    paddingLeft: 0,
    flex: 1,
    textTransform: 'capitalize',
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.LIGHT_BLUE,
  },
  doctorSpecializationStyles: {
    paddingTop: 4,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.SKY_BLUE,
  },
  doctorLocation: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
    marginLeft: 4,
  },
  educationTextStyles: {
    // paddingTop: 10,
    paddingTop: 4,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
  },
  careLogo: {
    alignSelf: 'center',
    marginBottom: 10,
    width: 30,
    height: 18,
    marginTop: 2,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeMoreText: {
    ...theme.viewStyles.text('SB', 10, theme.colors.APP_YELLOW_COLOR),
  },
  price: {
    ...theme.viewStyles.text('M', 13, theme.colors.SKY_BLUE),
    paddingTop: 1,
  },
  carePrice: {
    ...theme.viewStyles.text('M', 15, theme.colors.BORDER_BOTTOM_COLOR),
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  careDiscountedPrice: {
    ...theme.viewStyles.text('M', 12, theme.colors.APP_YELLOW),
    marginLeft: 6,
  },
  seperatorLine: {
    width: 0.5,
    height: 20,
    backgroundColor: theme.colors.BORDER_BOTTOM_COLOR,
    marginHorizontal: 12,
  },
  infoIcon: {
    marginLeft: 7,
    width: 10,
    height: 10,
    marginRight: 2,
  },
  doctorProfile: {
    height: 80,
    borderRadius: 40,
    width: 80,
    alignSelf: 'center',
  },
  doctorNameViewStyle: {
    flexDirection: 'row',
    paddingTop: 8,
    justifyContent: 'space-between',
    flex: 1,
  },
  brandContainer: {
    ...theme.viewStyles.cardViewStyle,
    height: 24,
    backgroundColor: 'white',
    borderRadius: 6,
    width: 60,
    marginLeft: -8,
    marginTop: -12,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  cardContainer: {
    flex: 1,
    paddingRight: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginBottom: 10,
    width: width - 85,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  availabilityText: {
    ...theme.viewStyles.text('M', 12, theme.colors.BORDER_BOTTOM_COLOR),
  },
  bottomBtnView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomLeftBtn: {
    height: 40,
    backgroundColor: theme.colors.SKY_LIGHT_BLUE,
    width: '49.3%',
    borderRadius: 0,
    borderBottomLeftRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomRightBtn: {
    height: 40,
    backgroundColor: theme.colors.GOLDEN,
    width: '49.3%',
    borderRadius: 0,
    borderBottomRightRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hospitalIcon: {
    width: 13,
    height: 16,
    marginRight: 7,
  },
  onlineConsultIcon: {
    width: 19,
    height: 19,
    marginRight: 7,
  },
  fullWidthBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    flexWrap: 'wrap',
    alignSelf: 'center',
  },
  bottomBtnText: {
    ...theme.viewStyles.text('B', 12, theme.colors.LIGHT_BLUE),
    textAlign: 'center',
  },
  doctorPartnerLabel: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  doctorLabelIcon: {
    width: 80,
    height: 32,
  },
  inPersonIcon: {
    width: 14,
    height: 16,
    marginBottom: 5,
  },
  onlineConsultMode: {
    ...theme.viewStyles.text('M', 7, theme.colors.light_label),
    marginBottom: 3.5,
  },
  physicalConsultView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  physicalConsultMode: {
    ...theme.viewStyles.text('M', 7, theme.colors.light_label),
    marginBottom: 5,
  },
  onlineConsultView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  consultModesView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  shareIcon: {
    width: 24,
    height: 24,
  },
  doctorPartnerBottomBtn: {
    ...theme.viewStyles.cardViewStyle,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export interface DoctorCardProps extends NavigationScreenProps {
  rowId?: number;
  rowData:
    | SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors
    | getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors
    | getDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor
    | any
    | null;
  onPress?: (doctorId: string, onlineConsult: boolean) => void;
  onPressConsultNowOrBookAppointment?: (
    type: 'consult-now' | 'book-appointment',
    consultMode?: ConsultMode
  ) => void;
  displayButton?: boolean;
  style?: StyleProp<ViewStyle>;
  buttonViewStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  buttonTextStyle?: StyleProp<TextStyle>;
  saveSearch?: boolean;
  doctorsNextAvailability?:
    | (getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsNextAvailability | null)[]
    | null;
  numberOfLines?: number;
  availableModes?: ConsultMode | null;
  callSaveSearch?: string;
  onPlanSelected?: (() => void) | null;
  selectedConsultMode?: ConsultMode | null;
  onPressShare?: (
    rowData:
      | SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_possibleMatches_doctors
      | getDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors
      | getDoctorDetailsById_getDoctorDetailsById_starTeam_associatedDoctor
      | any
  ) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = (props) => {
  const rowData = props.rowData;
  const { selectedConsultMode } = props;
  const ctaBannerText = rowData?.availabilityTitle;
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const isOnlineConsultSelected =
    selectedConsultMode === ConsultMode.ONLINE || selectedConsultMode === ConsultMode.BOTH;
  const isPhysicalConsultSelected = selectedConsultMode === ConsultMode.PHYSICAL;
  const circleDoctorDetails = calculateCircleDoctorPricing(
    rowData,
    isOnlineConsultSelected,
    isPhysicalConsultSelected
  );
  const {
    physicalConsultMRPPrice,
    onlineConsultMRPPrice,
    onlineConsultSlashedPrice,
    onlineConsultDiscountedPrice,
    isCircleDoctorOnSelectedConsultMode,
    physicalConsultSlashedPrice,
    physicalConsultDiscountedPrice,
  } = circleDoctorDetails;
  const { availableModes } = props;
  const { showCircleSubscribed } = useShoppingCart();
  const [fetchedSlot, setfetchedSlot] = useState<string>('');
  const isPhysical = availableModes
    ? [ConsultMode.PHYSICAL, ConsultMode.BOTH].includes(availableModes)
    : false;
  const isOnline = availableModes
    ? [ConsultMode.ONLINE, ConsultMode.BOTH].includes(availableModes)
    : false;
  const isBoth = availableModes ? [ConsultMode.BOTH].includes(availableModes) : false;
  let nonCircleDoctorFees = rowData?.onlineConsultationFees || rowData?.fee; // default fee
  if (isPhysicalConsultSelected) {
    nonCircleDoctorFees = rowData?.physicalConsultationFees || rowData?.fee;
  } else {
    nonCircleDoctorFees = rowData?.onlineConsultationFees || rowData?.fee;
  }
  const isCircleAvailForOnline = isOnlineConsultSelected && onlineConsultMRPPrice > 0;
  const circleDoctorFees =
    !selectedConsultMode || isCircleAvailForOnline
      ? onlineConsultMRPPrice
      : physicalConsultMRPPrice;
  const circleDoctorSlashedPrice =
    !selectedConsultMode || isCircleAvailForOnline
      ? onlineConsultSlashedPrice
      : physicalConsultSlashedPrice;
  const circleDoctorDiscountedPrice =
    !selectedConsultMode || isCircleAvailForOnline
      ? onlineConsultDiscountedPrice
      : physicalConsultDiscountedPrice;
  const clinicAddress = rowData?.doctorfacility;
  const isDoctorPartner = rowData?.doctorType === DoctorType?.DOCTOR_CONNECT;
  const physicalCTATitle = rowData?.doctorCardActiveCTA?.PHYSICAL || 'Book Hospital Visit';
  const onlineCTATitle = rowData?.doctorCardActiveCTA?.ONLINE || 'Book Video Consult';
  const onlineConsult = selectedConsultMode
    ? isOnlineConsultSelected
    : isBoth || isOnline
    ? true
    : false;
  const onlineSlot = rowData?.doctorNextAvailSlots?.onlineSlot;
  const physicalSlot = rowData?.doctorNextAvailSlots?.physicalSlot;

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  const client = useApolloClient();

  const navigateToDetails = (id: string, params?: {}) => {
    if (props.saveSearch) {
      const searchInput = {
        type: SEARCH_TYPE.DOCTOR,
        typeId: props.rowData ? props.rowData.id : '',
        patient: currentPatient && currentPatient.id ? currentPatient.id : '',
      };
      client
        .mutate<saveSearch>({
          mutation: SAVE_SEARCH,
          variables: {
            saveSearchInput: searchInput,
          },
        })
        .then(({ data }) => {})
        .catch((error) => {
          CommonBugFender('DoctorCard_navigateToDetails', error);
        });
    }
    props.navigation.navigate(AppRoutes.SlotSelection, {
      doctorId: id,
      callSaveSearch: props.callSaveSearch,
      ...params,
      isCircleDoctor: isCircleDoctorOnSelectedConsultMode,
      consultModeSelected:
        params?.consultModeSelected === ConsultMode.PHYSICAL
          ? string.consultModeTab.HOSPITAL_VISIT
          : string.consultModeTab.VIDEO_CONSULT,
    });
  };

  const calculatefee = () => {
    return (
      <View style={{ flexDirection: 'row', marginTop: 5 }}>
        <Text style={{ ...theme.viewStyles.text('M', 15, theme.colors.SKY_BLUE) }}>
          {!isDoctorPartner && (
            <Text style={{ ...theme.viewStyles.text('M', 12, theme.colors.light_label) }}>
              You pay{'  '}
            </Text>
          )}
          {string.common.Rs}
        </Text>
        <Text style={{ ...theme.viewStyles.text('M', 13, theme.colors.SKY_BLUE), paddingTop: 1 }}>
          {convertNumberToDecimal(nonCircleDoctorFees)}{' '}
        </Text>
      </View>
    );
  };

  const renderCircleDoctorsFee = () => {
    if (showCircleSubscribed) {
      return (
        <View style={{ marginTop: 5 }}>
          <View style={styles.rowContainer}>
            <Text style={styles.carePrice}>
              {string.common.Rs}
              {convertNumberToDecimal(circleDoctorFees)}
            </Text>
            <Text style={styles.careDiscountedPrice}>
              {string.common.Rs}
              {convertNumberToDecimal(circleDoctorSlashedPrice)}
            </Text>
          </View>
        </View>
      );
    }
    return (
      <View style={{ marginTop: 5 }}>
        <View style={styles.rowContainer}>
          <View>
            <Text
              style={{
                ...theme.viewStyles.text('M', 10, theme.colors.SEARCH_EDUCATION_COLOR),
                paddingTop: 3,
              }}
            >
              You pay
            </Text>
            <Text style={{ ...theme.viewStyles.text('M', 15, theme.colors.SKY_BLUE) }}>
              {string.common.Rs}
              {convertNumberToDecimal(circleDoctorFees)}
            </Text>
          </View>
          <View style={styles.seperatorLine} />
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => openCircleWebView()}
            activeOpacity={1}
          >
            <Text
              style={{
                ...theme.viewStyles.text('M', 10, theme.colors.APP_YELLOW),
                flexWrap: 'wrap',
              }}
            >
              {string.circleDoctors.circleMemberPays}
            </Text>
            <View style={styles.rowContainer}>
              <Text style={{ ...theme.viewStyles.text('M', 12, theme.colors.APP_YELLOW) }}>
                {string.common.Rs}
                {convertNumberToDecimal(circleDoctorSlashedPrice)}
              </Text>

              <InfoBlue style={styles.infoIcon} />
              <Text
                style={{
                  ...theme.viewStyles.text('M', 10, theme.colors.TURQUOISE_LIGHT_BLUE, 1, 12),
                }}
              >
                {string.circleDoctors.upgradeNow}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const openCircleWebView = () => {
    props.navigation.navigate(AppRoutes.CommonWebView, {
      url: AppConfig.Configuration.CIRCLE_CONSULT_URL,
      isCallback: true,
      onPlanSelected: onPlanSelected,
    });
    webEngageAttributes(WebEngageEventName.VC_NON_CIRCLE);
  };

  const onPlanSelected = () => {
    props.onPlanSelected && props.onPlanSelected();
    webEngageAttributes(WebEngageEventName.VC_NON_CIRCLE_ADD);
  };

  const renderCareLogo = () => {
    return <CircleLogo style={styles.careLogo} />;
  };

  function getTimeDiff(nextSlot: any) {
    let timeDiff: number = 0;
    const today: Date = new Date();
    const date2: Date = new Date(nextSlot);
    if (date2 && today) {
      timeDiff = Math.round(((date2 as any) - (today as any)) / 60000);
    }
    return timeDiff;
  }

  const renderSpecialities = () => {
    return (
      <View>
        <Text style={[styles.doctorSpecializationStyles, { textTransform: 'uppercase' }]}>
          {rowData?.specialtydisplayName || ''}
        </Text>
        <Text style={[styles.doctorSpecializationStyles, { ...theme.fonts.IBMPlexSansBold(12) }]}>
          {rowData?.experience} Year
          {Number(rowData?.experience) != 1 ? 's Exp.' : ' Exp.'}
        </Text>
      </View>
    );
  };

  const renderDoctorProfile = () => {
    return (
      <View style={{ marginLeft: isCircleDoctorOnSelectedConsultMode ? 3.3 : 0 }}>
        {!!g(rowData, 'thumbnailUrl') ? (
          <Image
            style={styles.doctorProfile}
            source={{
              uri: rowData.thumbnailUrl!,
            }}
            resizeMode={'cover'}
          />
        ) : (
          <DoctorPlaceholderImage />
        )}
      </View>
    );
  };

  const webEngageAttributes = (evenName) => {
    try {
      const eventAttributes = {
        'Patient Name': currentPatient.firstName,
        'Patient UHID': currentPatient.uhid,
        Relation: currentPatient?.relation,
        'Patient Age': Math.round(moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)),
        'Patient Gender': currentPatient.gender,
        'Customer ID': currentPatient.id,
      };
      postWebEngageEvent(evenName, eventAttributes);
    } catch (error) {}
  };

  const getButtonTitle = (slot: string, isPhysical: boolean = false) => {
    const title =
      slot && moment(slot).isValid()
        ? nextAvailability(slot, 'Available', isPhysical)
        : string.common.book_apointment;
    if (title == 'BOOK APPOINTMENT') {
      fetchNextAvailableSlot();
    }
    return title;
  };
  //Only triggered past the next available slot of a doctor
  async function fetchNextAvailableSlot() {
    const todayDate = new Date().toISOString().slice(0, 10);
    const response = await getNextAvailableSlots(client, [rowData?.id] || [], todayDate);
    setfetchedSlot(response?.data?.[0]?.availableSlot);
  }

  const renderBrandName = () => {
    return (
      <View style={styles.brandContainer}>
        <Image
          resizeMode="contain"
          style={{ alignSelf: 'center', width: '100%', height: 18 }}
          source={{ uri: rowData?.doctorBrandImage }}
        />
      </View>
    );
  };

  const renderAvailability = () => {
    return (
      <View style={styles.centerRow}>
        {rowData?.doctorType !== DoctorType.PAYROLL ? (
          isOnline && isPhysical ? (
            <>
              <Text style={styles.availabilityText}>{getButtonTitle(physicalSlot, true)}</Text>
              <Text style={styles.availabilityText}>{getButtonTitle(onlineSlot)}</Text>
            </>
          ) : isPhysical ? (
            <Text style={styles.availabilityText}>{getButtonTitle(physicalSlot, true)}</Text>
          ) : (
            <Text style={styles.availabilityText}>{getButtonTitle(onlineSlot)}</Text>
          )
        ) : (
          <Text style={styles.availabilityText}>{getButtonTitle(onlineSlot)}</Text>
        )}
      </View>
    );
  };

  const renderClinicAddress = () => {
    return (
      <View>
        {!!clinicAddress && (
          <View style={styles.row}>
            <LocationGrey style={{ width: 12, height: 15 }} />
            <Text style={styles.doctorLocation} numberOfLines={props.numberOfLines}>
              {clinicAddress}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderDoctorImage = () => {
    return (
      <View>
        {isCircleDoctorOnSelectedConsultMode ? (
          <ImageBackground
            source={require('@aph/mobile-patients/src/components/ui/icons/doctor_ring.webp')}
            style={[
              styles.drImageBackground,
              styles.drImageMargins,
              {
                marginBottom: isCircleDoctorOnSelectedConsultMode ? 0 : 22,
                marginTop: isDoctorPartner ? 32 : 12,
              },
            ]}
            resizeMode="cover"
          >
            {renderDoctorProfile()}
          </ImageBackground>
        ) : (
          <View
            style={[
              styles.drImageMargins,
              {
                marginBottom: isCircleDoctorOnSelectedConsultMode ? 0 : 22,
                marginTop: isDoctorPartner ? 32 : 12,
              },
            ]}
          >
            {renderDoctorProfile()}
          </View>
        )}
      </View>
    );
  };

  const renderQualifications = () => {
    return (
      <Text style={styles.educationTextStyles} numberOfLines={props.numberOfLines}>
        {rowData.qualification}
      </Text>
    );
  };

  const renderDoctorFees = () => {
    return (
      <View>{isCircleDoctorOnSelectedConsultMode ? renderCircleDoctorsFee() : calculatefee()}</View>
    );
  };

  const renderDoctorSlashedPrice = () => {
    return (
      <View>
        {isCircleDoctorOnSelectedConsultMode &&
        circleDoctorDiscountedPrice > -1 &&
        showCircleSubscribed ? (
          <Text
            style={{
              ...theme.viewStyles.text('M', 10, theme.colors.APP_YELLOW),
              marginTop: 2,
            }}
          >
            {string.circleDoctors.circleSavings.replace(
              '{amount}',
              `${convertNumberToDecimal(circleDoctorDiscountedPrice)}`
            )}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderBottomButtons = () => {
    return (
      <View>
        {rowData?.doctorType !== DoctorType.PAYROLL
          ? isOnline && isPhysical
            ? renderBothBottomCTAs()
            : isPhysical
            ? renderSingleBottomCTA(isPhysical)
            : renderSingleBottomCTA(isOnline)
          : renderSingleBottomCTA(isOnline)}
      </View>
    );
  };

  const renderBothBottomCTAs = () => {
    return (
      <View style={styles.bottomBtnView}>
        <TouchableOpacity
          style={styles.bottomLeftBtn}
          onPress={() => onPressConsultConfigCTA(ConsultMode.PHYSICAL)}
        >
          <View style={styles.fullWidthBtn}>
            <HospitalPhrIcon style={styles.hospitalIcon} />
            <Text style={styles.bottomBtnText} numberOfLines={2}>
              {physicalCTATitle}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomRightBtn}
          onPress={() => onPressConsultConfigCTA(ConsultMode.ONLINE)}
        >
          <View style={styles.fullWidthBtn}>
            <VideoActiveIcon style={styles.onlineConsultIcon} />
            <Text style={styles.bottomBtnText} numberOfLines={2}>
              {onlineCTATitle}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSingleBottomCTA = (online: boolean) => {
    return (
      <View style={styles.bottomBtnView}>
        <TouchableOpacity
          style={[
            styles.bottomLeftBtn,
            {
              width: '100%',
              backgroundColor: online ? theme.colors.GOLDEN : theme.colors.SKY_LIGHT_BLUE,
            },
          ]}
          onPress={() =>
            onPressConsultConfigCTA(online ? ConsultMode.ONLINE : ConsultMode.PHYSICAL)
          }
        >
          <View style={styles.fullWidthBtn}>
            {online ? (
              <VideoActiveIcon style={styles.onlineConsultIcon} />
            ) : (
              <HospitalPhrIcon style={styles.hospitalIcon} />
            )}
            <Text style={styles.bottomBtnText} numberOfLines={2}>
              {online ? onlineCTATitle : physicalCTATitle}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDoctorPartnerTabBottomBtn = () => {
    return (
      <View>
        {props.displayButton && (
          <View>
            <TouchableOpacity
              activeOpacity={1}
              style={[styles.doctorPartnerBottomBtn, props.buttonStyle]}
              onPress={() => {
                onPressConsultConfigCTA();
              }}
            >
              <Text style={[styles.buttonText, props.buttonTextStyle]}>
                {!!ctaBannerText
                  ? ctaBannerText.CONSULT_NOW
                  : !!fetchedSlot
                  ? getButtonTitle(fetchedSlot)
                  : getButtonTitle(rowData?.slot)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  const renderDoctorPartnerBadges = () => {
    return (
      <>
        {rowData.slot ? (
          <AvailabilityCapsule
            availableTime={rowData.slot}
            styles={styles.availableView}
            availNowText={!!ctaBannerText ? ctaBannerText.AVAILABLE_NOW : ''}
          />
        ) : null}
        <View style={styles.doctorPartnerLabel}>
          {rowData.doctorType !== 'DOCTOR_CONNECT' ? (
            <ApolloDoctorIcon style={styles.doctorLabelIcon} />
          ) : (
            <ApolloPartnerIcon style={styles.doctorLabelIcon} />
          )}
        </View>
      </>
    );
  };

  const renderConsultModes = () => {
    return (
      <>
        {isOnline && (
          <View style={styles.onlineConsultView}>
            <Online />
            <Text style={styles.onlineConsultMode}>Online</Text>
          </View>
        )}
        {isPhysical && (
          <View style={[styles.physicalConsultView, { marginLeft: isOnline ? 12 : 0 }]}>
            <InPerson style={styles.inPersonIcon} />
            <Text style={styles.physicalConsultMode}>In-Person</Text>
          </View>
        )}
      </>
    );
  };

  const renderShareProfile = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => props.onPressShare && props.onPressShare(rowData)}
        style={{ paddingLeft: 5 }}
      >
        <ShareYellowDocIcon style={styles.shareIcon} />
      </TouchableOpacity>
    );
  };

  const onPressConsultConfigCTA = (consultMode?: ConsultMode) => {
    try {
      let eventAttributes: WebEngageEvents[WebEngageEventName.DOCTOR_CARD_CONSULT_CLICK] = {
        'Patient Name': currentPatient?.firstName,
        'Doctor ID': rowData?.id,
        'Speciality ID': rowData?.specialty?.id,
        'Doctor Speciality': rowData?.specialty?.name,
        'Doctor Experience': Number(rowData?.experience),
        'Hospital Name': rowData?.doctorHospital?.[0]?.facility?.name,
        'Hospital City': rowData?.doctorHospital?.[0]?.facility?.city,
        'Availability Minutes': getTimeDiff(rowData?.slot),
        Source: 'List',
        'Patient UHID': currentPatient?.uhid,
        Relation: currentPatient?.relation,
        'Patient Age': Math.round(moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)),
        'Patient Gender': currentPatient?.gender,
        'Customer ID': currentPatient?.id,
      };
      if (consultMode) {
        eventAttributes['Mode of consult'] =
          consultMode === ConsultMode.ONLINE ? 'Video Consult' : 'Hospital Visit';
      }
      if (props.rowId) {
        eventAttributes['Rank'] = props.rowId;
      }
      postWebEngageEvent(WebEngageEventName.DOCTOR_CARD_CONSULT_CLICK, eventAttributes);
    } catch (error) {}

    props.onPressConsultNowOrBookAppointment?.(
      rowData.slot && moment(rowData.slot).isValid() ? 'consult-now' : 'book-appointment',
      consultMode
    );
    CommonLogEvent(AppRoutes.DoctorSearchListing, 'Consult now clicked');
    navigateToDetails(rowData?.id || '', {
      showBookAppointment: true,
      consultModeSelected: consultMode,
    });
  };

  const onPressDoctorCard = () => {
    try {
      if (rowData?.doctorType === DoctorType.PAYROLL) {
        const eventAttributes: WebEngageEvents[WebEngageEventName.DOCTOR_CONNECT_CARD_CLICK] = {
          Fee: Number(nonCircleDoctorFees),
          'Doctor Speciality': g(rowData, 'specialty', 'name')!,
          'Doctor Name': g(rowData, 'fullName')!,
          Source: 'List',
          'Language known': rowData.languages,
        };
        postWebEngageEvent(WebEngageEventName.DOCTOR_CONNECT_CARD_CLICK, eventAttributes);
      }
    } catch (error) {}
    try {
      const eventAttributes: WebEngageEvents[WebEngageEventName.DOCTOR_CARD_CONSULT_CLICK] = {
        'Patient Name': currentPatient.firstName,
        'Doctor ID': rowData.id,
        'Speciality ID': rowData?.specialty?.id,
        'Doctor Speciality': rowData?.specialty?.name,
        'Doctor Experience': Number(rowData?.experience),
        'Hospital Name': rowData?.doctorHospital?.[0]?.facility?.name,
        'Hospital City': rowData?.doctorHospital?.[0]?.facility?.city,
        'Availability Minutes': getTimeDiff(rowData?.slot),
        Source: 'List',
        'Patient UHID': currentPatient?.uhid,
        Relation: currentPatient?.relation,
        'Patient Age': Math.round(moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)),
        'Patient Gender': currentPatient?.gender,
        'Customer ID': currentPatient?.id,
      };
      if (props.rowId) {
        eventAttributes['Rank'] = props.rowId;
      }
      postWebEngageEvent(WebEngageEventName.DOCTOR_CARD_CONSULT_CLICK, eventAttributes);
    } catch (error) {}
    props.onPress ? props.onPress(rowData?.id, onlineConsult) : navigateToDetails(rowData?.id);
  };

  if (rowData) {
    return (
      <TouchableOpacity
        key={rowData?.id}
        activeOpacity={1}
        style={[
          styles.doctorView,
          {
            backgroundColor: !isDoctorPartner ? theme.colors.WHITE : 'transparent',
            shadowColor: !isDoctorPartner ? theme.colors.SHADOW_GRAY : theme.colors.WHITE,
            shadowOffset: !isDoctorPartner ? { width: 0, height: 2 } : { width: 0, height: 0 },
            shadowOpacity: !isDoctorPartner ? 0.4 : 0,
            shadowRadius: !isDoctorPartner ? 8 : 0,
            elevation: !isDoctorPartner ? 4 : 0,
          },
          props.style,
        ]}
        onPress={() => onPressDoctorCard()}
      >
        <View style={{ borderRadius: 10, flex: 1, zIndex: 1 }}>
          {!isDoctorPartner && renderBrandName()}
          <View style={{ flexDirection: 'row' }}>
            {isDoctorPartner && renderDoctorPartnerBadges()}
            <View>
              {renderDoctorImage()}
              {isCircleDoctorOnSelectedConsultMode && renderCareLogo()}
              <View
                style={[
                  styles.consultModesView,
                  { marginTop: isCircleDoctorOnSelectedConsultMode ? 3 : 0 },
                ]}
              >
                {isDoctorPartner && renderConsultModes()}
              </View>
            </View>

            <View style={styles.cardContainer}>
              <View
                style={[
                  styles.doctorNameViewStyle,
                  {
                    paddingTop: isDoctorPartner ? 35 : 8,
                  },
                ]}
              >
                <Text style={styles.doctorNameStyles}>{rowData.displayName}</Text>
                {isDoctorPartner && renderShareProfile()}
              </View>
              {renderSpecialities()}
              {renderQualifications()}
              {renderDoctorFees()}
              {renderDoctorSlashedPrice()}
            </View>
          </View>
          {renderClinicAddress()}
          {!isDoctorPartner && renderAvailability()}
          {isDoctorPartner ? renderDoctorPartnerTabBottomBtn() : renderBottomButtons()}
        </View>
      </TouchableOpacity>
    );
  }
  return null;
};

DoctorCard.defaultProps = {
  displayButton: true,
};
