import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import AsyncStorage from '@react-native-community/async-storage';
import { default as Moment, default as moment } from 'moment';
import { useUIElements } from '../UIElementsProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { PatientListOverlay } from '@aph/mobile-patients/src/components/Tests/components/PatientListOverlay';
import {
  Breadcrumb,
  Props as BreadcrumbProps,
} from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import {
  Text,
  Platform,
  SafeAreaView,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  PixelRatio,
} from 'react-native';
import {
  dataSavedUserID,
  g,
  getNetStatus,
  isValidSearch,
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
  getAge,
} from '@aph/mobile-patients/src/helpers/helperFunctions';

import { ProfileList } from '../ui/ProfileList';
import DeviceInfo from 'react-native-device-info';
import {
  CovidVaccine,
  LinkedUhidIcon,
  RequestSubmitted,
  VaccineBookingFailed,
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  CalendarShow,
  DropdownGreen,
  LocationIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';

import { NavigationScreenProps } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { HospitalChooserMaterialMenu } from '../ui/HospitalChooserMaterialMenu';
import { HospitalCalendarChooser } from '../ui/HospitalCalendarChooser';
import { colors } from '../../theme/colors';
import { HospitalCityChooser } from '../ui/HospitalCityChooser';
import { VaccineDoseChooser } from '../ui/VaccineDoseChooser';
import { VaccineTypeChooser } from '../ui/VaccineTypeChooser';
import { buildVaccineApolloClient } from '../Vaccination/VaccinationApolloClient';

import { renderVaccinesHospitalSlotsLoaderShimmer } from '@aph/mobile-patients/src/components/ui/ShimmerFactory';

import {
  DOSE_NUMBER,
  PAYMENT_TYPE,
  VACCINE_BOOKING_SOURCE,
  VACCINE_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  GET_VACCINATION_SITES,
  GET_VACCINATION_AVAILABLE_DATES,
  GET_VACCINATION_SLOTS,
  SUBMIT_VACCINATION_BOOKING_REQUEST,
} from '@aph/mobile-patients/src/graphql/profiles';
import { getResourcesList, getResourcesListVariables } from '../../graphql/types/getResourcesList';
import {
  getResourcesSessionAvailableDate,
  getResourcesSessionAvailableDateVariables,
} from '../../graphql/types/getResourcesSessionAvailableDate';
import {
  getResourcesSessionAvailableByDate,
  getResourcesSessionAvailableByDateVariables,
} from '../../graphql/types/getResourcesSessionAvailableByDate';

import {
  CreateAppointment,
  CreateAppointmentVariables,
} from '../../graphql/types/CreateAppointment';
import { from } from 'form-data';

export interface VaccineBookingScreenProps
  extends NavigationScreenProps<{
    breadCrumb: BreadcrumbProps['links'];
  }> {
  cmsIdentifier: string;
  subscriptionId: string;
  subscriptionInclusionId: string;
  excludeProfileListIds?: string[];
}

//styles
const styles = StyleSheet.create({
  breadcrumb: {
    marginHorizontal: 20,
    ...theme.fonts.IBMPlexSansRegular(20),
  },
  congratulationsDescriptionStyle: {
    marginHorizontal: 24,
    marginTop: 8,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  popDescriptionStyle: {
    marginHorizontal: 24,
    marginTop: 8,
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(15),
    lineHeight: 24,
  },
  aphAlertCtaViewStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
  },
  ctaWhiteButtonViewStyle: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    marginRight: 15,
    marginVertical: 5,
    shadowColor: '#4c808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
  },
  textViewStyle: {
    padding: 8,
    marginRight: 15,
    marginVertical: 5,
  },
  ctaOrangeButtonViewStyle: { flex: 1, minHeight: 40, height: 'auto' },
  ctaOrangeTextStyle: {
    textAlign: 'center',
    ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
    marginHorizontal: 5,
  },
  hiTextStyle: {
    marginLeft: 20,
    marginTop: 27,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(18),
  },
  subViewPopup: {
    backgroundColor: 'white',
    width: '88%',
    alignSelf: 'center',
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  mainView: {
    backgroundColor: 'rgba(100,100,100, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameTextStyle: {
    marginLeft: 5,
    marginTop: 27,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(18),
  },
  nameTextContainerStyle: {
    maxWidth: '60%',
    flexDirection: 'row',
  },
  separator: {
    height: 2,
    marginTop: 7,
    backgroundColor: '#00b38e',
    opacity: 1,
  },
  slotDateConatiner: {
    marginVertical: 3,
    backgroundColor: '#f7f8f5',
    borderRadius: 5,
    padding: 8,
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 10,
  },

  slotDateUnselected: {
    ...theme.viewStyles.text('R', 16, theme.colors.SHERPA_BLUE),
    flex: 1,
    opacity: 0.4,
    alignSelf: 'center',
  },
  slotDateSelected: {
    ...theme.viewStyles.text('M', 16, theme.colors.SHERPA_BLUE),
    flex: 1,
  },

  slotLabel: { ...theme.viewStyles.text('R', 12, '#717171'), marginVertical: 5 },
  slotInfo: { ...theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE) },
  secondDoseContainer: {
    paddingLeft: 15,
  },

  confirmationDetailContainer: { marginTop: 16, marginBottom: 6 },
  confirmationDetailLabel: {
    ...theme.viewStyles.text('R', 12, '#01475B'),
    letterSpacing: 2,
  },
  confirmationDetailInfo: {
    ...theme.viewStyles.text('M', 12, '#01475B'),
    marginTop: 5,
  },
  confirmationDetailSubInfo: {
    ...theme.viewStyles.text('L', 12, '#000', 0.5),
    marginTop: 5,
    marginRight: 20,
  },

  dropdownGreenContainer: { justifyContent: 'flex-end', marginBottom: -2 },

  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
    marginLeft: 30,
  },

  profile_seperatorStyle: {
    height: 2,
    backgroundColor: '#00b38e',
    marginTop: 6,
    marginHorizontal: 5,
    marginBottom: 6,
  },

  centeredView: {
    backgroundColor: 'rgba(100,100,100, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },

  selectCityPlaceHolder: {
    ...theme.viewStyles.text('M', 16, '#02475B'),
    opacity: 0.3,
    flex: 1,
  },
  selectCityStyle: {
    ...theme.viewStyles.text('M', 16, '#02475B'),
    flex: 1,
  },

  selectDosePlaceHolder: {
    ...theme.viewStyles.text('M', 16, '#02475B'),
    opacity: 0.3,
    flex: 1,
  },
  selectDoseStyle: {
    ...theme.viewStyles.text('M', 16, '#02475B'),
    flex: 1,
  },
  userDetailHeaderContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 11,
    flexDirection: 'row',
    marginVertical: 8,
  },
  userDetailHeader: {
    flex: 1,
  },
  userDetailHeaderTitle: {
    marginVertical: 2,
    ...theme.viewStyles.text('M', 14, '#0087BA'),
  },
  userDetailHeaderSubTitle: {
    marginVertical: 2,
    ...theme.viewStyles.text('R', 12, '#01475B'),
  },
  bold: {
    fontWeight: 'bold',
  },
  medium: {
    ...theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE),
  },
  orangeCTA: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    color: theme.colors.APP_YELLOW,
  },

  proceedButton: {
    flex: 1,
    marginHorizontal: 40,
  },
  hospitalContainer: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    paddingHorizontal: 21,
    paddingVertical: 23,
    marginTop: 7,
    marginBottom: 7,
  },
  hospitalTitle: {
    ...theme.viewStyles.text('M', 17, theme.colors.SKY_BLUE),
  },
  hospitalChooser: {
    alignItems: 'center',
    marginTop: 50,
  },
  hospitalDropdownContainer: { flexDirection: 'row', width: '100%', marginTop: 12 },
  hospitalDropdownText: { ...theme.viewStyles.text('M', 16, '#02475B'), opacity: 0.3, flex: 1 },
  cityContainer: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    paddingHorizontal: 21,
    paddingVertical: 23,
    marginTop: 7,
    marginBottom: 7,
  },
  cityTitle: { ...theme.viewStyles.text('M', 17, theme.colors.SKY_BLUE) },
  cityChooser: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 16,
  },
  cityDropDownContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 12,
  },
  doseNumberContainer: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    paddingHorizontal: 21,
    paddingVertical: 23,
    marginTop: 7,
    marginBottom: 7,
  },
  doseTitle: {
    ...theme.viewStyles.text('M', 17, theme.colors.SKY_BLUE),
  },
  vaccineTypeContainer: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    paddingHorizontal: 21,
    paddingVertical: 23,
    marginTop: 7,
    marginBottom: 7,
  },
  vaccineTitle: {
    ...theme.viewStyles.text('M', 17, theme.colors.SKY_BLUE),
  },
  requestSubmissionFailedTitle: {
    ...theme.viewStyles.text('M', 16, '#890000'),
    marginTop: 16,
    textAlign: 'center',
  },
  requestSubmisionFailedMessage: {
    ...theme.viewStyles.text('R', 12, '#67919D'),
    marginTop: 9,
    textAlign: 'center',
  },
  errorMessageSiteDate: {
    ...theme.viewStyles.text('M', 12, '#890000'),
    marginVertical: 8,
  },
});

export const VaccineBookingScreen: React.FC<VaccineBookingScreenProps> = (props) => {
  const cmsIdentifier = props.navigation.getParam('cmsIdentifier');
  const subscriptionId = props.navigation.getParam('subscriptionId');
  const subscriptionInclusionId = props.navigation.getParam('subscriptionInclusionId');
  const excludeProfileListIds = props.navigation.getParam('excludeProfileListIds');
  const { currentPatient, allCurrentPatients, setCurrentPatientId } = useAllCurrentPatients();
  const [requestSubmissionErrorAlert, setRequestSubmissionErrorAlert] = useState<boolean>(false);
  const [vaccineSiteList, setVaccineSiteList] = useState<any>([]);
  const [selectedDose, setSelectedDose] = useState('');
  const [selectedVaccineType, setSelectedVaccineType] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [hospitalSitesLoading, setHospitalSitesLoading] = useState<boolean>(false);
  const [selectedHospitalSite, setSelectedHospitalSite] = useState('');
  const [selectedHospitalSiteResourceID, setSelectedHospitalSiteResourceID] = useState('');
  const [availableDatesLoading, setAvailableDatesLoading] = useState<boolean>(false);
  const [availableDates, setAvailableDates] = useState<any>([]);
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [availableSlotsLoading, setAvailableSlotsLoading] = useState<boolean>(false);
  const [availableSlots, setAvailableSlots] = useState<any>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>();

  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();
  const [showSelectPatient, setShowSelectPatient] = useState<boolean>(false);
  const [showPatientListOverlay, setShowPatientListOverlay] = useState<boolean>(
    showSelectPatient ? false : true
  );
  //  const [showPatientListOverlay, setShowPatientListOverlay] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showConfimationDetail, setConfirmationDetails] = useState(false);
  const [pageState, setPageState] = useState(0); // page state can be 0,1,2,

  const breadCrumbVaccineDeatils = [{ title: string.vaccineBooking.vaccine_details_bread_crumb }];
  const breadCrumbBookingDetails = [
    { title: string.vaccineBooking.vaccine_details_bread_crumb },
    { title: string.vaccineBooking.booking_details },
  ];
  const breadCrumbConfirmdetails = [
    { title: string.vaccineBooking.vaccine_details_bread_crumb },
    { title: string.vaccineBooking.booking_details },
    { title: string.vaccineBooking.confirm_details },
  ];

  const pixelRatio = PixelRatio.get();

  const { authToken } = useAuth();
  const apolloVaccineClient = buildVaccineApolloClient(authToken);

  const cityList = AppConfig.Configuration.Vaccination_Cities_List || [];
  const vaccineTypeList = AppConfig.Configuration.Vaccine_Type || [];
  const restrictToSelfVaccination = AppConfig.Configuration.Vaccine_Restrict_Self;

  useEffect(() => {
    fetchVaccinationHospitalSites();
  }, [selectedCity]);

  useEffect(() => {
    fetchDatesForHospitalSites();
  }, [selectedHospitalSiteResourceID]);

  useEffect(() => {
    fetchSlotsAvailable();
  }, [preferredDate]);

  const fetchVaccinationHospitalSites = () => {
    if (selectedCity == '') {
      return;
    }

    setVaccineSiteList([]);

    setHospitalSitesLoading(true);

    let sitesInputVariables = {
      city: selectedCity,
      ...(selectedVaccineType != '' && { vaccine_type: getVaccineType(selectedVaccineType) }),
    };

    apolloVaccineClient
      .query<getResourcesList>({
        query: GET_VACCINATION_SITES,
        variables: sitesInputVariables,
        fetchPolicy: 'no-cache',
        context: { headers: { 'x-app-OS': Platform.OS, 'x-app-version': DeviceInfo.getVersion() } },
      })
      .then((response) => {
        setVaccineSiteList(response?.data?.getResourcesList?.response);
      })
      .catch((error) => {})
      .finally(() => {
        setHospitalSitesLoading(false);
      });
  };

  const getVaccineType = (vaccineType: string) => {
    if (vaccineType.toLocaleLowerCase() == 'Covaxin'.toLocaleLowerCase()) {
      return VACCINE_TYPE.COVAXIN;
    } else if (vaccineType.toLocaleLowerCase() == 'Covishield'.toLocaleLowerCase()) {
      return VACCINE_TYPE.COVISHIELD;
    } else if (vaccineType.toLocaleLowerCase() == 'Sputnik'.toLocaleLowerCase()) {
      return VACCINE_TYPE.SPUTNIK;
    } else if (vaccineType.toLocaleLowerCase() == 'Morderna'.toLocaleLowerCase()) {
      return VACCINE_TYPE.MORDERNA;
    } else {
      return '';
    }
  };

  const fetchDatesForHospitalSites = () => {
    if (selectedHospitalSiteResourceID == '') {
      return;
    }

    setAvailableDates([]);
    setAvailableDatesLoading(true);

    let datesInputVariables = {
      resource_id: selectedHospitalSiteResourceID,
      ...(selectedVaccineType != '' && { vaccine_type: getVaccineType(selectedVaccineType) }),
    };

    apolloVaccineClient
      .query<getResourcesSessionAvailableDate>({
        query: GET_VACCINATION_AVAILABLE_DATES,
        variables: datesInputVariables,
        fetchPolicy: 'no-cache',
        context: { headers: { 'x-app-OS': Platform.OS, 'x-app-version': DeviceInfo.getVersion() } },
      })
      .then((response) => {
        setAvailableDates(response?.data?.getResourcesSessionAvailableDate?.response || []);
      })
      .catch((error) => {})
      .finally(() => {
        setAvailableDatesLoading(false);
      });
  };

  const fetchSlotsAvailable = () => {
    setAvailableSlots([]);

    let slotsInputVariables = {
      resource_id: selectedHospitalSiteResourceID,
      session_date: preferredDate,
      ...(selectedVaccineType != '' && { vaccine_type: getVaccineType(selectedVaccineType) }),
    };

    setAvailableSlotsLoading(true);
    apolloVaccineClient
      .query<getResourcesSessionAvailableByDate>({
        query: GET_VACCINATION_SLOTS,
        variables: slotsInputVariables,
        fetchPolicy: 'no-cache',
        context: { headers: { 'x-app-OS': Platform.OS, 'x-app-version': DeviceInfo.getVersion() } },
      })
      .then((response) => {
        setAvailableSlots(response?.data?.getResourcesSessionAvailableByDate?.response || []);
      })
      .catch((error) => {})
      .finally(() => {
        setAvailableSlotsLoading(false);
      });
  };

  const submitVaccineBooking = () => {
    setLoading && setLoading(true);
    const appointmentInputDetails = {
      patient_id: selectedPatient?.id || '',
      resource_session_id: selectedSlot?.id || '',
      dose_number:
        selectedDose == string.vaccineBooking.title_dose_1 ? DOSE_NUMBER.FIRST : DOSE_NUMBER.SECOND,
      booking_source: VACCINE_BOOKING_SOURCE.MOBILE,
      subscription_inclusion_id: subscriptionInclusionId,
      user_subscription_id: subscriptionId,
    };

    apolloVaccineClient
      .mutate<CreateAppointment, CreateAppointmentVariables>({
        mutation: SUBMIT_VACCINATION_BOOKING_REQUEST,
        variables: { appointmentInput: appointmentInputDetails },
        fetchPolicy: 'no-cache',
        context: { headers: { 'x-app-OS': Platform.OS, 'x-app-version': DeviceInfo.getVersion() } },
      })
      .then((response) => {
        if (response.data?.CreateAppointment.success) {
          props.navigation.pop();

          try {
            props.navigation.navigate(AppRoutes.VaccineBookingConfirmationScreen, {
              appointmentId: response.data?.CreateAppointment?.response?.id,
              displayId: response.data?.CreateAppointment?.response?.display_id,
              cmsIdentifier: cmsIdentifier,
              subscriptionId: subscriptionId,
            });
          } catch (e) {
            setRequestSubmissionErrorAlert(true);
          }

          postBookingConfirmationEvent(response.data?.CreateAppointment?.response?.display_id || 0);
        } else {
          setRequestSubmissionErrorAlert(true);
        }
      })
      .catch((error) => {
        setRequestSubmissionErrorAlert(true);
      })
      .finally(() => {
        setLoading!(false);
      });
  };

  const postBookingConfirmationEvent = (displayId: number) => {
    try {
      const eventAttributes = {
        'Customer ID': selectedPatient?.id || '',
        'Customer First Name': selectedPatient?.firstName.trim(),
        'Customer Last Name': selectedPatient?.lastName.trim(),
        'Customer UHID': selectedPatient?.uhid,
        'Booking Id': displayId,
        'Mobile Number': selectedPatient?.mobileNumber,
        'Vaccination Hospital': selectedHospitalSite,
        'Vaccination City': selectedCity,
        Source: VACCINE_BOOKING_SOURCE.MOBILE,
        Dose:
          selectedDose == string.vaccineBooking.title_dose_1
            ? DOSE_NUMBER.FIRST
            : DOSE_NUMBER.SECOND,
        'Date Time': moment(preferredDate).toDate(),
        Date: moment(preferredDate).format('DD MMM,YYYY'),
        'Vaccine Url': 'https://bit.ly/2QO9wuw',
        Slot: selectedSlot?.session_name.toString(),
        'Time Slot': selectedSlot?.session_name.toString(),
        ...(selectedVaccineType != '' && {
          'Vaccine type': getVaccineType(selectedVaccineType),
        }),
      };

      postWebEngageEvent(WebEngageEventName.VACCINATION_BOOKING_CONFIRMATION, eventAttributes);
    } catch (error) {}
  };

  const renderHeader = (props) => {
    return (
      <Header
        leftIcon="backArrow"
        title={string.vaccineBooking.covid_vaccine_booking}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={() => props.navigation.goBack()}
        rightComponent={
          <View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                props.navigation.navigate(AppRoutes.MobileHelp);
              }}
            >
              <Text style={styles.orangeCTA}>HELP</Text>
            </TouchableOpacity>
          </View>
        }
      />
    );
  };

  const renderBreadCrumb = () => {
    return (
      <Breadcrumb
        links={
          pageState == 2
            ? breadCrumbConfirmdetails
            : pageState == 1
            ? breadCrumbBookingDetails
            : breadCrumbVaccineDeatils
        }
        containerStyle={styles.breadcrumb}
      />
    );
  };

  const disableProceedButton = () => {
    if (pageState == 0) {
      if (selectedDose == undefined || selectedDose == '') {
        return true;
      }
      //optional
      if (selectedDose == string.vaccineBooking.title_dose_2) {
        if (selectedVaccineType == undefined || selectedVaccineType == '') {
          return true;
        }
      }
    } else if (pageState == 1) {
      if (selectedCity == undefined || selectedCity == '') {
        return true;
      }
      if (selectedHospitalSite == undefined || selectedHospitalSite == '') {
        return true;
      }
      if (preferredDate == undefined || preferredDate == '') {
        return true;
      }
      if (selectedSlot == undefined || selectedSlot == '') {
        return true;
      }
    }
  };

  const onProceedPressed = () => {
    if (pageState == 0) {
      setPageState(1);
    } else if (pageState == 1) {
      setPageState(2);
    } else {
      submitVaccineBooking();
    }
  };

  const renderProceedButton = () => {
    return (
      <StickyBottomComponent defaultBG>
        <Button
          title={string.vaccineBooking.proceed}
          style={styles.proceedButton}
          onPress={() => {
            onProceedPressed();
          }}
          disabled={disableProceedButton()}
        />
      </StickyBottomComponent>
    );
  };

  const renderDoseNumber = () => {
    return (
      <View style={styles.doseNumberContainer}>
        <Text style={styles.doseTitle}>
          {string.vaccineBooking.choose_vaccination_dose_number}{' '}
        </Text>
        <VaccineDoseChooser
          menuContainerStyle={styles.cityChooser}
          onDoseChoosed={(dose) => {
            if (dose == string.vaccineBooking.title_dose_2) {
              showAphAlert!({
                title: 'Alert!',
                showCloseIcon: true,
                onCloseIconPress: () => {
                  hideAphAlert!();
                },
                description: string.vaccineBooking.dose_2_alert,
                onPressOk: () => {
                  hideAphAlert!();
                  setSelectedDose(dose);
                },
              });
            } else {
              setSelectedDose(dose);
            }
          }}
        >
          <View style={styles.cityDropDownContainer}>
            <Text
              style={selectedDose != '' ? styles.selectDoseStyle : styles.selectDosePlaceHolder}
            >
              {selectedDose != '' ? selectedDose : string.vaccineBooking.select_vaccine_dose}
            </Text>
            <DropdownGreen />
          </View>

          <Spearator style={styles.separator} />
        </VaccineDoseChooser>
      </View>
    );
  };

  const renderVaccineType = () => {
    return (
      <View style={styles.vaccineTypeContainer}>
        <Text style={styles.vaccineTitle}>
          {selectedDose == string.vaccineBooking.title_dose_2
            ? string.vaccineBooking.select_vaccine_type_mandatory
            : string.vaccineBooking.select_vaccine_type_opt}
        </Text>
        <VaccineTypeChooser
          menuContainerStyle={styles.cityChooser}
          vaccineTypeList={vaccineTypeList}
          onVaccineTypeChoosed={(vaccineType) => {
            setSelectedVaccineType(vaccineType);

            setSelectedHospitalSite('');
            setSelectedHospitalSiteResourceID('');

            setAvailableDates([]);
          }}
        >
          <View style={styles.cityDropDownContainer}>
            <Text
              style={
                selectedVaccineType != '' ? styles.selectDoseStyle : styles.selectDosePlaceHolder
              }
            >
              {selectedVaccineType != ''
                ? selectedVaccineType
                : string.vaccineBooking.select_vaccine_dose}
            </Text>
            <DropdownGreen />
          </View>

          <Spearator style={styles.separator} />
        </VaccineTypeChooser>
      </View>
    );
  };

  const renderSelectCity = () => {
    return (
      <View style={styles.cityContainer}>
        <Text style={styles.cityTitle}>{string.vaccineBooking.select_city_mandatory}</Text>
        <HospitalCityChooser
          menuContainerStyle={styles.cityChooser}
          onCityChoosed={(item) => {
            setSelectedCity(item);

            setSelectedHospitalSite('');
            setSelectedHospitalSiteResourceID('');

            setAvailableDates([]);
          }}
          dataList={cityList}
        >
          <View style={styles.cityDropDownContainer}>
            <Text
              style={selectedCity != '' ? styles.selectCityStyle : styles.selectCityPlaceHolder}
            >
              {selectedCity != '' ? selectedCity : string.vaccineBooking.search_city}
            </Text>
            <DropdownGreen />
          </View>

          <Spearator style={styles.separator} />

          {selectedCity != '' && vaccineSiteList.length == 0 && hospitalSitesLoading == false ? (
            <Text style={styles.errorMessageSiteDate}>
              {string.vaccineBooking.no_vaccination_sites_available}{' '}
            </Text>
          ) : null}
        </HospitalCityChooser>
      </View>
    );
  };

  const renderHospital = () => {
    if (hospitalSitesLoading) {
      return renderVaccinesHospitalSlotsLoaderShimmer();
    }

    return vaccineSiteList.length > 0 ? (
      <View style={styles.hospitalContainer}>
        <Text style={styles.hospitalTitle}>{string.vaccineBooking.select_a_hospital_clininc}</Text>
        <HospitalChooserMaterialMenu
          menuContainerStyle={styles.hospitalChooser}
          onHospitalChoosed={(item) => {
            setSelectedHospitalSite(item.name);
            setSelectedHospitalSiteResourceID(item.id);

            setPreferredDate('');
            setSelectedSlot(undefined);
          }}
          dataList={vaccineSiteList}
        >
          <View style={styles.hospitalDropdownContainer}>
            <Text
              style={
                selectedHospitalSite != '' ? styles.selectCityStyle : styles.hospitalDropdownText
              }
            >
              {selectedHospitalSite != ''
                ? selectedHospitalSite
                : string.vaccineBooking.search_for_hospital_clinic}
            </Text>
            <DropdownGreen />
          </View>
          <Spearator style={styles.separator} />
          {selectedHospitalSite != '' &&
          availableDates.length == 0 &&
          availableDatesLoading == false ? (
            <Text style={styles.errorMessageSiteDate}>
              {string.vaccineBooking.no_slots_available}{' '}
            </Text>
          ) : null}
        </HospitalChooserMaterialMenu>
      </View>
    ) : null;
  };

  const renderPreferredDateSeleector = () => {
    if (availableDatesLoading) {
      return renderVaccinesHospitalSlotsLoaderShimmer();
    }

    return availableDates.length > 0 ? (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          marginHorizontal: 20,
          paddingHorizontal: 21,
          paddingVertical: 23,
          marginTop: 7,
          marginBottom: 0,
        }}
      >
        <Text style={{ ...theme.viewStyles.text('M', 17, theme.colors.SKY_BLUE) }}>
          {string.vaccineBooking.select_preferred_date_for_getting_vaccinated}
        </Text>

        <HospitalCalendarChooser
          availableDates={availableDates || []}
          availableSlots={availableSlots}
          isSlotLoading={availableSlotsLoading}
          selectedSlot={selectedSlot}
          onDateChoosed={(date: string) => {
            setPreferredDate(date);
          }}
          onSlotChoosed={(slot: any) => {
            setSelectedSlot(slot);
          }}
          onDonePressed={() => {}}
        >
          <View style={styles.slotDateConatiner}>
            <View>
              <Text
                style={preferredDate == '' ? styles.slotDateUnselected : styles.slotDateSelected}
              >
                {preferredDate == ''
                  ? moment().format('DD/MM/YYYY')
                  : moment(preferredDate).format('DD/MM/YYYY')}
              </Text>
              {selectedSlot != undefined ? (
                <Text style={styles.slotInfo}>{selectedSlot.session_name}</Text>
              ) : null}
            </View>
            <CalendarShow style={{ opacity: 0.3, alignSelf: 'center' }} />
          </View>
        </HospitalCalendarChooser>

        {/* {secondSlotdate != undefined ? (
          <>
            <Text style={[styles.slotLabel, { marginTop: 15 }]}>Second Dose</Text>
            <View style={styles.secondDoseContainer}>
              <Text style={[styles.slotDateUnselected, { alignSelf: 'flex-start' }]}>
                {Moment(secondSlotdate).format('DD/MM/YYYY')}
              </Text>
              <Text style={styles.slotInfo}>{getDayOfWeek(secondSlotdate)}</Text>
              <Text style={[styles.slotInfo, { marginTop: 12, fontSize: 10 }]}>
                {string.vaccineBooking.dose_2_info}
              </Text>
            </View>
          </>
        ) : (
          <View></View>
        )} */}
      </View>
    ) : null;
  };

  const renderDetailConfirmation = () => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          marginHorizontal: 20,
          paddingHorizontal: 21,
          paddingVertical: 23,
          marginTop: 7,
          marginBottom: 7,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ ...theme.viewStyles.text('M', 17, theme.colors.SKY_BLUE), flex: 1 }}>
            {string.vaccineBooking.detail_confirmation}
          </Text>

          <TouchableOpacity
            style={{ alignSelf: 'center' }}
            activeOpacity={1}
            onPress={() => {
              setPageState(0);
            }}
          >
            <Text
              style={{
                ...theme.fonts.IBMPlexSansSemiBold(13),
                color: theme.colors.APP_YELLOW,
              }}
            >
              {string.vaccineBooking.edit}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.confirmationDetailContainer}>
          <View style={{ flexDirection: 'row' }}>
            <CovidVaccine style={{ width: 22, height: 22, opacity: 1 }} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.confirmationDetailLabel}>
                {string.vaccineBooking.vaccine_details.toUpperCase()}
              </Text>
              {selectedVaccineType != '' ? (
                <Text style={styles.confirmationDetailInfo}>{selectedVaccineType || ''}</Text>
              ) : null}
              <Text style={styles.confirmationDetailInfo}>{selectedDose}</Text>
            </View>
          </View>
        </View>
        <View style={styles.separatorStyle} />

        <View style={styles.confirmationDetailContainer}>
          <View style={{ flexDirection: 'row' }}>
            <LocationIcon style={{ width: 22, height: 22, opacity: 0.6 }} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.confirmationDetailLabel}>
                {string.vaccineBooking.vaccination_site.toUpperCase()}
              </Text>
              <Text style={styles.confirmationDetailInfo}>{selectedHospitalSite}</Text>
              <Text style={styles.confirmationDetailInfo}>{selectedCity}</Text>
            </View>
          </View>
        </View>
        <View style={styles.separatorStyle} />

        <View style={styles.confirmationDetailContainer}>
          <View style={{ flexDirection: 'row' }}>
            <CalendarShow style={{ width: 22, height: 22, opacity: 0.5 }} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.confirmationDetailLabel}>
                {string.vaccineBooking.date_and_slot}
              </Text>
              <Text style={styles.confirmationDetailInfo}>
                {moment(preferredDate).format('DD MMM, YYYY')}
              </Text>
              <Text style={styles.confirmationDetailInfo}>{selectedSlot.session_name}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const handleBack = async () => {
    props.navigation.goBack();
  };

  const renderRequestSubmissionErrorDialog = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={requestSubmissionErrorAlert}
        onRequestClose={() => {
          setRequestSubmissionErrorAlert(false);
        }}
        onDismiss={() => {
          setRequestSubmissionErrorAlert(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, pixelRatio <= 2 ? { margin: 60 } : { margin: 80 }]}>
            <VaccineBookingFailed />
            <Text style={styles.requestSubmissionFailedTitle}>
              {string.vaccineBooking.request_submission_failed}
            </Text>
            <Text style={styles.requestSubmisionFailedMessage}>
              {string.vaccineBooking.request_submission_failed_message_1}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setRequestSubmissionErrorAlert(false);
              }}
            >
              <Text style={[styles.orangeCTA, { marginTop: 10 }]}>RETRY!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderPatientListOverlay = () => {
    return showPatientListOverlay ? (
      <PatientListOverlay
        title={string.vaccineBooking.select_person_name}
        subTitle={string.vaccineBooking.profile_selection_info}
        onPressClose={() => setShowPatientListOverlay(false)}
        excludeProfileListIds={excludeProfileListIds}
        showCloseIcon={true}
        onCloseIconPress={() => {
          setShowPatientListOverlay(false);
          props.navigation.goBack();
        }}
        onPressDone={(_selectedPatient: any) => {
          setShowPatientListOverlay(false);
          setUpSelectedPatient(_selectedPatient);
        }}
        onPressAddNewProfile={() => {
          setShowPatientListOverlay(false);
          props.navigation.navigate(AppRoutes.EditProfile, {
            isEdit: false,
            isPoptype: true,
            mobileNumber: currentPatient?.mobileNumber,
            onNewProfileAdded: onNewProfileAdded,
            onPressBackButton: _onPressBackButton,
          });
        }}
        patientSelected={selectedPatient}
        onPressAndroidBack={() => {
          setShowPatientListOverlay(false);
          handleBack();
        }}
      />
    ) : null;
  };

  const setUpSelectedPatient = (_selectedPatient: any) => {
    if (restrictToSelfVaccination) {
      if (_selectedPatient.relation != 'ME') {
        showAphAlert &&
          showAphAlert({
            title: 'Oops!',
            description:
              'You can book a vaccination slot only for yourself. We will enable vaccination booking for family members soon.',
            onPressOk: () => {
              hideAphAlert!();
              setShowPatientListOverlay(true);
            },
          });
      } else {
        setSelectedPatient(_selectedPatient);
      }
    } else {
      setSelectedPatient(_selectedPatient);
    }
  };

  const onNewProfileAdded = (newPatient: any) => {
    if (newPatient?.profileData) {
      setUpSelectedPatient(newPatient?.profileData);
      setShowSelectPatient?.(true);
      setShowPatientListOverlay(true);
      changeCurrentProfile(newPatient?.profileData, false);
    }
  };
  const _onPressBackButton = () => {
    if (!selectedPatient) {
      setShowPatientListOverlay(true);
    }
  };

  const changeCurrentProfile = (_selectedPatient: any, _showPatientDetailsOverlay: boolean) => {
    if (currentPatient?.id === _selectedPatient?.id) {
      return;
    } else if (!_selectedPatient?.dateOfBirth || !_selectedPatient?.gender) {
      setSelectedPatient(_selectedPatient);
      setShowSelectPatient?.(true);
      setShowPatientListOverlay(_showPatientDetailsOverlay);
      return;
    }
    setCurrentPatientId?.(_selectedPatient?.id);
    AsyncStorage.setItem('selectUserId', _selectedPatient?.id);
    AsyncStorage.setItem('selectUserUHId', _selectedPatient?.uhid || '');
  };

  const renderUserDetailHeader = () => {
    return selectedPatient ? (
      <View style={styles.userDetailHeaderContainer}>
        <View style={styles.userDetailHeader}>
          <Text style={styles.userDetailHeaderTitle}>
            {selectedPatient.firstName + ' ' + selectedPatient.lastName}, {selectedPatient.gender} ,{' '}
            {getAge(selectedPatient?.dateOfBirth)}{' '}
          </Text>
          <Text style={styles.userDetailHeaderSubTitle}>
            UHID Number:<Text style={styles.medium}> {selectedPatient.uhid} </Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setShowPatientListOverlay(true);
          }}
        >
          <Text style={styles.orangeCTA}>CHANGE</Text>
        </TouchableOpacity>
      </View>
    ) : null;
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderPatientListOverlay()}
        {renderHeader(props)}
        {renderBreadCrumb()}
        {renderUserDetailHeader()}
        <ScrollView>
          {pageState == 0 ? (
            <>
              {renderDoseNumber()}
              {renderVaccineType()}
            </>
          ) : null}

          {pageState == 1 ? (
            <>
              {renderSelectCity()}
              {renderHospital()}
              {renderPreferredDateSeleector()}
            </>
          ) : null}

          {pageState == 2 ? <>{renderDetailConfirmation()}</> : null}

          <View style={{ height: 100 }}></View>
        </ScrollView>
        {renderProceedButton()}
        {requestSubmissionErrorAlert && renderRequestSubmissionErrorDialog()}
      </SafeAreaView>
    </View>
  );
};
