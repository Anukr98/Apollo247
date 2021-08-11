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
  Tick,
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
  postCleverTapEvent,
  getTimeDiff,
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
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
const styles = StyleSheet.create({
  doctorView: {
    flex: 1,
    marginHorizontal: 20,
    ...theme.viewStyles.cardViewStyle,
    marginBottom: 20,
    borderRadius: 10,
  },
  buttonText: {
    ...theme.fonts.IBMPlexSansBold(14),
    color: theme.colors.BUTTON_TEXT,
    textTransform: 'uppercase',
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
    marginTop: 32,
  },
  doctorNameStyles: {
    paddingTop: 0,
    paddingLeft: 0,
    flex: 1,
    textTransform: 'capitalize',
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SEARCH_DOCTOR_NAME,
  },
  doctorSpecializationStyles: {
    paddingTop: 4,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.SKY_BLUE,
    textTransform: 'uppercase',
  },
  doctorLocation: {
    paddingTop: 2,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
  },
  educationTextStyles: {
    paddingTop: 10,
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
    paddingTop: 35,
    justifyContent: 'space-between',
    flex: 1,
  },
  tickIcon: {
    height: 8, 
    width: 8, 
    marginStart: 4
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
  onPressConsultNowOrBookAppointment?: (type: 'consult-now' | 'book-appointment') => void;
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
    cashbackEnabled,
    cashbackAmount,
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
  const ctaTitle = rowData?.doctorCardActiveCTA?.DEFAULT;
  const onlineConsult = selectedConsultMode
    ? isOnlineConsultSelected
    : isBoth || isOnline
    ? true
    : false;

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
      consultModeSelected: onlineConsult ? ConsultMode.ONLINE : ConsultMode.PHYSICAL,
      externalConnect: null,
      callSaveSearch: props.callSaveSearch,
      ...params,
      isCircleDoctor: isCircleDoctorOnSelectedConsultMode,
    });
  };

  const calculatefee = (rowData: any, consultTypeBoth: boolean, consultTypeOnline: boolean) => {
    return (
      <View style={{ flexDirection: 'row', marginTop: 5 }}>
        <Text style={{ ...theme.viewStyles.text('M', 15, theme.colors.SKY_BLUE) }}>
          {string.common.Rs}
        </Text>
        <Text style={{ ...theme.viewStyles.text('M', 13, theme.colors.SKY_BLUE), paddingTop: 1 }}>
          {convertNumberToDecimal(nonCircleDoctorFees)}
        </Text>
      </View>
    );
  };

  const renderCareDoctorsFee = () => {
    if (showCircleSubscribed && !cashbackEnabled) {
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
            onPress={() => !showCircleSubscribed && openCircleWebView()}
            activeOpacity={1}
          > 
            <View style={styles.rowContainer}>
              <Text
                style={{
                  ...theme.viewStyles.text('M', 10, theme.colors.APP_YELLOW),
                  flexWrap: 'wrap',
                }}
              >
                {cashbackEnabled ? 'CIRCLE CASHBACK' : 'CIRCLE DISCOUNT'}
              </Text>
              {showCircleSubscribed && <Tick style={styles.tickIcon} />}
            </View>
            <View style={styles.rowContainer}>
              <Text style={{ ...theme.viewStyles.text('M', 12, theme.colors.APP_YELLOW) }}>
                {cashbackEnabled ? `Upto ${cashbackAmount} HC` : 
                  string.common.Rs + convertNumberToDecimal(circleDoctorDiscountedPrice)}
              </Text>
              {!showCircleSubscribed && 
              <View style={styles.rowContainer}>
                <InfoBlue style={styles.infoIcon} />
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 10, theme.colors.TURQUOISE_LIGHT_BLUE, 1, 12),
                  }}
                >
                  {string.circleDoctors.upgradeNow}
                </Text>
              </View>
              }
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
      circleEventSource: 'VC Doctor Card',
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

  const renderSpecialities = () => {
    return (
      <View>
        <Text style={styles.doctorSpecializationStyles}>{rowData?.specialtydisplayName || ''}</Text>
        <Text style={styles.doctorSpecializationStyles}>
          {rowData?.experience} YR
          {Number(rowData?.experience) != 1 ? 'S Exp.' : ' Exp.'}
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

  function getButtonTitle(slot: string) {
    const title =
      slot && moment(slot).isValid()
        ? nextAvailability(slot, 'Consult')
        : string.common.book_apointment;
    if (title == 'BOOK APPOINTMENT') {
      fetchNextAvailableSlot();
    }
    return title;
  }
  //Only triggered past the next available slot of a doctor
  async function fetchNextAvailableSlot() {
    const todayDate = new Date().toISOString().slice(0, 10);
    const response = await getNextAvailableSlots(client, [rowData?.id] || [], todayDate);
    setfetchedSlot(response?.data?.[0]?.availableSlot);
  }

  if (rowData) {
    const clinicAddress = rowData?.doctorfacility;
    return (
      <TouchableOpacity
        key={rowData.id}
        activeOpacity={1}
        style={[
          styles.doctorView,
          {
            backgroundColor:
              rowData.doctorType !== 'DOCTOR_CONNECT' ? theme.colors.WHITE : 'transparent',
            shadowColor:
              rowData.doctorType !== 'DOCTOR_CONNECT'
                ? theme.colors.SHADOW_GRAY
                : theme.colors.WHITE,
            shadowOffset:
              rowData.doctorType !== 'DOCTOR_CONNECT'
                ? { width: 0, height: 2 }
                : { width: 0, height: 0 },
            shadowOpacity: rowData.doctorType !== 'DOCTOR_CONNECT' ? 0.4 : 0,
            shadowRadius: rowData.doctorType !== 'DOCTOR_CONNECT' ? 8 : 0,
            elevation: rowData.doctorType !== 'DOCTOR_CONNECT' ? 4 : 0,
          },
          props.style,
        ]}
        onPress={() => {
          try {
            if (rowData.doctorType === DoctorType.PAYROLL) {
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
              'Patient UHID': currentPatient.uhid,
              Relation: currentPatient?.relation,
              'Patient Age': Math.round(
                moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)
              ),
              'Patient Gender': currentPatient.gender,
              'Customer ID': currentPatient.id,
              User_Type: getUserType(allCurrentPatients),
            };
            if (props.rowId) {
              eventAttributes['Rank'] = props.rowId;
            }
            postWebEngageEvent(WebEngageEventName.DOCTOR_CARD_CONSULT_CLICK, eventAttributes);
          } catch (error) {}

          props.onPress
            ? props.onPress(rowData.id!, onlineConsult)
            : navigateToDetails(rowData.id!);
        }}
      >
        <View style={{ borderRadius: 10, flex: 1, zIndex: 1 }}>
          <View style={{ flexDirection: 'row' }}>
            {rowData.slot ? (
              <AvailabilityCapsule
                availableTime={rowData.slot}
                styles={styles.availableView}
                availNowText={!!ctaBannerText ? ctaBannerText.AVAILABLE_NOW : ''}
              />
            ) : null}
            <View style={{ position: 'absolute', top: -6, right: -6 }}>
              {rowData.doctorType !== 'DOCTOR_CONNECT' ? (
                <ApolloDoctorIcon style={{ width: 80, height: 32 }} />
              ) : (
                <ApolloPartnerIcon style={{ width: 80, height: 32 }} />
              )}
            </View>
            <View>
              {isCircleDoctorOnSelectedConsultMode ? (
                <ImageBackground
                  source={require('@aph/mobile-patients/src/components/ui/icons/doctor_ring.webp')}
                  style={[
                    styles.drImageBackground,
                    styles.drImageMargins,
                    { marginBottom: isCircleDoctorOnSelectedConsultMode ? 0 : 22 },
                  ]}
                  resizeMode="cover"
                >
                  {renderDoctorProfile()}
                </ImageBackground>
              ) : (
                <View
                  style={[
                    styles.drImageMargins,
                    { marginBottom: isCircleDoctorOnSelectedConsultMode ? 0 : 22 },
                  ]}
                >
                  {renderDoctorProfile()}
                </View>
              )}

              {/* </TouchableOpacity> */}
              {isCircleDoctorOnSelectedConsultMode && renderCareLogo()}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginHorizontal: 20,
                  marginTop: isCircleDoctorOnSelectedConsultMode ? 3 : 0,
                }}
              >
                {isOnline && (
                  <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Online />
                    <Text
                      style={{
                        ...theme.viewStyles.text('M', 7, theme.colors.light_label),
                        marginBottom: 3.5,
                      }}
                    >
                      Online
                    </Text>
                  </View>
                )}
                {isPhysical && (
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: isOnline ? 12 : 0,
                    }}
                  >
                    <InPerson style={{ width: 14, height: 16, marginBottom: 5 }} />
                    <Text
                      style={{
                        ...theme.viewStyles.text('M', 7, theme.colors.light_label),
                        marginBottom: 5,
                      }}
                    >
                      In-Person
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={{ flex: 1, paddingRight: 16, marginBottom: 16 }}>
              <View style={styles.doctorNameViewStyle}>
                <Text style={styles.doctorNameStyles}>{rowData.displayName}</Text>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => props.onPressShare && props.onPressShare(rowData)}
                  style={{ paddingLeft: 5 }}
                >
                  <ShareYellowDocIcon style={{ width: 24, height: 24 }} />
                </TouchableOpacity>
              </View>
              {renderSpecialities()}
              {isCircleDoctorOnSelectedConsultMode
                ? renderCareDoctorsFee()
                : calculatefee(rowData, isBoth, isOnline)}
              {isCircleDoctorOnSelectedConsultMode &&
              circleDoctorDiscountedPrice > -1 &&
              showCircleSubscribed && !cashbackEnabled ? (
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
              <Text
                style={[
                  styles.educationTextStyles,
                  { marginTop: isCircleDoctorOnSelectedConsultMode ? 10 : 0 },
                ]}
                numberOfLines={props.numberOfLines}
              >
                {rowData.qualification}
              </Text>
              {!!clinicAddress && (
                <Text style={styles.doctorLocation} numberOfLines={props.numberOfLines}>
                  {clinicAddress}
                </Text>
              )}
            </View>
          </View>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            {props.displayButton && (
              <View
                style={[
                  {
                    overflow: rowData.doctorType !== 'DOCTOR_CONNECT' ? 'hidden' : 'visible',
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                  },
                  props.buttonViewStyle,
                ]}
              >
                <TouchableOpacity
                  activeOpacity={1}
                  style={[
                    {
                      backgroundColor:
                        rowData.doctorType !== 'DOCTOR_CONNECT'
                          ? theme.colors.BUTTON_BG
                          : theme.colors.WHITE,
                      shadowColor:
                        rowData.doctorType === 'DOCTOR_CONNECT'
                          ? theme.colors.SHADOW_GRAY
                          : theme.colors.WHITE,
                      shadowOffset:
                        rowData.doctorType === 'DOCTOR_CONNECT'
                          ? { width: 0, height: 2 }
                          : { width: 0, height: 0 },
                      shadowOpacity: rowData.doctorType === 'DOCTOR_CONNECT' ? 0.4 : 0,
                      shadowRadius: rowData.doctorType === 'DOCTOR_CONNECT' ? 8 : 0,
                      elevation: rowData.doctorType === 'DOCTOR_CONNECT' ? 4 : 0,
                      height: 44,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: rowData.doctorType === 'DOCTOR_CONNECT' ? 10 : 0,
                    },
                    props.buttonStyle,
                  ]}
                  onPress={() => {
                    try {
                      const eventAttributes: WebEngageEvents[WebEngageEventName.DOCTOR_CARD_CONSULT_CLICK] = {
                        'Patient name': currentPatient.firstName,
                        docId: rowData.id,
                        specialityId: rowData?.specialty?.id,
                        specialityName: rowData?.specialty?.name,
                        'Doctor Experience': Number(rowData?.experience),
                        docHospital: rowData?.doctorHospital?.[0]?.facility?.name,
                        docCity: rowData?.doctorHospital?.[0]?.facility?.city,
                        'Availability Minutes': getTimeDiff(rowData?.slot),
                        Source: 'List',
                        'Patient UHID': currentPatient.uhid,
                        Relation: currentPatient?.relation,
                        'Patient age': Math.round(
                          moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)
                        ),
                        'Patient gender': currentPatient.gender,
                        'Customer ID': currentPatient.id,
                        User_Type: getUserType(allCurrentPatients),
                      };
                      if (props.rowId) {
                        eventAttributes['Rank'] = props.rowId;
                      }
                      postWebEngageEvent(
                        WebEngageEventName.DOCTOR_CARD_CONSULT_CLICK,
                        eventAttributes
                      );
                      const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_BOOK_APPOINTMENT_CONSULT_CLICKED] = {
                        'Patient name': currentPatient.firstName,
                        docId: rowData.id,
                        specialityId: rowData?.specialty?.id,
                        specialityName: rowData?.specialty?.name,
                        exp: Number(rowData?.experience),
                        docHospital: rowData?.doctorHospital?.[0]?.facility?.name,
                        docCity: rowData?.doctorHospital?.[0]?.facility?.city,
                        availableInMins: getTimeDiff(rowData?.slot),
                        Source: 'Doctor card doctor listing screen',
                        'Patient UHID': currentPatient.uhid,
                        Relation: currentPatient?.relation,
                        'Patient age': Math.round(
                          moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)
                        ),
                        'Patient gender': currentPatient.gender,
                        'Customer ID': currentPatient.id,
                        User_Type: getUserType(allCurrentPatients),
                        rank: props.rowId || undefined,
                        onlineConsultFee:
                          Number(rowData?.onlineConsultationFees) ||
                          Number(rowData?.fee) ||
                          undefined,
                        physicalConsultFee:
                          Number(rowData?.physicalConsultationFees) ||
                          Number(rowData?.fee) ||
                          undefined,
                      };
                      postCleverTapEvent(
                        CleverTapEventName.CONSULT_BOOK_APPOINTMENT_CONSULT_CLICKED,
                        cleverTapEventAttributes
                      );
                    } catch (error) {}

                    props.onPressConsultNowOrBookAppointment &&
                      props.onPressConsultNowOrBookAppointment(
                        rowData.slot && moment(rowData.slot).isValid()
                          ? 'consult-now'
                          : 'book-appointment'
                      );
                    CommonLogEvent(AppRoutes.DoctorSearchListing, 'Consult now clicked');
                    navigateToDetails(rowData.id ? rowData.id : '', {
                      showBookAppointment: true,
                    });
                  }}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        color:
                          rowData.doctorType !== 'DOCTOR_CONNECT'
                            ? theme.colors.BUTTON_TEXT
                            : theme.colors.BUTTON_BG,
                      },
                      props.buttonTextStyle,
                    ]}
                  >
                    {!!ctaTitle
                      ? ctaTitle
                      : !!fetchedSlot
                      ? getButtonTitle(fetchedSlot)
                      : getButtonTitle(rowData?.slot)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  return null;
};

DoctorCard.defaultProps = {
  displayButton: true,
};
