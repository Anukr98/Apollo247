import { getDiagnosticsCites_getDiagnosticsCites_diagnosticsCities } from '@aph/mobile-patients/src/graphql/types/getDiagnosticsCites';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { getDoctorsBySpecialtyAndFilters } from '@aph/mobile-patients/src/graphql/types/getDoctorsBySpecialtyAndFilters';
import { getPatientPersonalizedAppointments_getPatientPersonalizedAppointments_appointmentDetails } from '../graphql/types/getPatientPersonalizedAppointments';
import { MedicinePageAPiResponse } from '@aph/mobile-patients/src/helpers/apiCalls';
import { getUserNotifyEvents_getUserNotifyEvents_phr_newRecordsCount } from '@aph/mobile-patients/src/graphql/types/getUserNotifyEvents';

export interface LocationData {
  displayName: string;
  latitude?: number;
  longitude?: number;
  area: string;
  city: string;
  state: string;
  stateCode?: string; // two letter code
  country: string;
  pincode: string;
  lastUpdated?: number; //timestamp
}

export interface SubscriptionData {
  _id: string | '';
  name: string | '';
  planId: string | '';
  benefitsWorth: string | '';
  activationModes: string[];
  price: number | null;
  minTransactionValue: number;
  status: string | '';
  subscriptionStatus: string | '';
  canUpgradeTo?: SubscriptionData | {};
  group: GroupPlan;
  benefits: PlanBenefits[];
  coupons: PlanCoupons[];
  isActive: boolean;
  upgradeTransactionValue?: number | null;
  isCorporate?: boolean;
  corporateIcon?: string;
}

export interface CorporateSubscriptionData extends SubscriptionData {
  corporateName?: string;
  corporateLogo?: string;
  bannerImage?: string;
  packageName?: string;
  bannerText?: string;
  packFAQs?: CorporateFaq[];
  packageBenefitData?: CorporateBenefits[];
}

export interface CorporateFaq {
  faqQuestion: string;
  faqAnswer: string;
}

export interface CorporateBenefits {
  benefitName: string;
  benefitShortDesc: string;
  benefitIdentifier: string;
  benefitImage: string;
  benefitCTALabel: string;
  benefitCTAType: string;
  benefitCTAAction: string;
}

export interface GroupPlan {
  _id: string;
  name: string;
  isActive: boolean;
}

export interface bannerType {
  _id: string | null;
  is_active: boolean;
  banner: string;
  banner_template_info?: null;
  cta_action?: (() => void) | null;
  meta?: {} | null;
}

export interface PlanBenefits {
  _id: string;
  attribute: string;
  headerContent: string;
  description: string;
  ctaLabel: string;
  ctaAction: string;
  benefitCtaAction: BenefitCtaAction;
  attributeType: string;
  availableCount: number;
  refreshFrequency: number;
  icon: string | null;
  cmsIdentifier?: string;
}

export interface BenefitCtaAction {
  type: string;
  action: string;
  message: string;
  webEngageEvent: string;
}

export interface PlanCoupons {
  coupon: string;
  message: string;
  applicable: string;
}

export interface CicleSubscriptionData {
  _id: string | '';
  name: string | '';
  planId: string | '';
  activationModes: string[] | [];
  status: string | '';
  subscriptionStatus: string | '';
  subPlanIds: string[] | [];
  planSummary: CirclePlanSummary[] | [];
  groupDetails: CircleGroup;
  endDate?: Date | null;
  startDate?: Date | null;
  benefits?: PlanBenefits[];
}

export interface CirclePlanSummary {
  price: number;
  renewMode: string[];
  starterPack: boolean;
  benefitsWorth: string;
  availableForTrial: boolean;
  specialPriceEnabled: boolean;
  subPlanId: string;
  durationInMonth: number;
  currentSellingPrice: number;
  icon: string | '';
}

export interface CircleGroup {
  _id: string | '';
  isActive: boolean;
  name: string | '';
}

export interface CircleBenefits {}

export interface DiagnosticData {
  cityId: string;
  stateId: string;
  city: string;
  state: string;
}

export interface TotalCircleSavings {
  consultSavings: number;
  pharmaSavings: number;
  diagnosticsSavings: number;
  deliverySavings: number;
  totalSavings: number;
  callsTotal: number;
  callsUsed: number;
}

export interface UploadPrescriptionOptions {
  id: string;
  titile: string;
  subTitle: string;
}

export type PharmaUserStatus = 'NEW' | 'REPEAT' | '';
export type UploadPrescSource = 'Cart' | 'Upload Flow' | 'Re-Upload' | 'Non-cart' | 'Consult Flow';

export interface PharmacyUserTypeEvent {
  User_Type: PharmaUserStatus;
}

export interface AppCommonDataContextProps {
  hdfcUserSubscriptions: SubscriptionData | null;
  setHdfcUserSubscriptions: ((items: SubscriptionData) => void) | null;
  phrNotificationData: getUserNotifyEvents_getUserNotifyEvents_phr_newRecordsCount | null;
  setPhrNotificationData:
    | ((
        phrNotificationObj: getUserNotifyEvents_getUserNotifyEvents_phr_newRecordsCount | null
      ) => void)
    | null;
  totalCircleSavings: TotalCircleSavings | null;
  setTotalCircleSavings: ((items: TotalCircleSavings) => void) | null;
  hdfcUpgradeUserSubscriptions: SubscriptionData[] | [];
  setHdfcUpgradeUserSubscriptions: ((items: SubscriptionData[]) => void) | null;
  corporateSubscriptions: CorporateSubscriptionData[] | [];
  setCorporateSubscriptions: ((items: CorporateSubscriptionData[]) => void) | null;
  circleSubscription: CicleSubscriptionData | null;
  setCircleSubscription: ((items: CicleSubscriptionData) => void) | null;
  bannerData: bannerType[] | null;
  setBannerData: ((items: bannerType[]) => void) | null;
  bannerDataHome: bannerType[] | null;
  setBannerDataHome: ((items: bannerType[]) => void) | null;
  locationDetails: LocationData | null;
  pharmacyLocation: LocationData | null;
  diagnosticLocation: LocationData | null;
  setLocationDetails: ((items: LocationData) => void) | null;
  setPharmacyLocation: ((items: LocationData) => void) | null;
  setDiagnosticLocation: ((items: LocationData) => void) | null;
  isPharmacyLocationServiceable?: boolean;
  setPharmacyLocationServiceable: ((value: boolean) => void) | null;
  medicinePageAPiResponse: MedicinePageAPiResponse | null;
  setMedicinePageAPiResponse: ((value: MedicinePageAPiResponse | null) => void) | null;
  diagnosticsCities: getDiagnosticsCites_getDiagnosticsCites_diagnosticsCities[];
  setDiagnosticsCities:
    | ((items: getDiagnosticsCites_getDiagnosticsCites_diagnosticsCities[]) => void)
    | null;
  locationForDiagnostics: DiagnosticData | null;
  diagnosticServiceabilityData: DiagnosticData | null;
  setDiagnosticServiceabilityData: ((items: DiagnosticData) => void) | null;
  isDiagnosticLocationServiceable?: boolean;
  setDiagnosticLocationServiceable: ((value: boolean) => void) | null;
  VirtualConsultationFee: string;
  setVirtualConsultationFee: ((arg0: string) => void) | null;
  generalPhysicians: { id: string; data: getDoctorsBySpecialtyAndFilters } | null | undefined;
  setGeneralPhysicians:
    | ((arg0: { id: string; data: getDoctorsBySpecialtyAndFilters }) => void)
    | null;
  ent: { id: string; data: getDoctorsBySpecialtyAndFilters } | null | undefined;
  setEnt: ((arg0: { id: string; data: getDoctorsBySpecialtyAndFilters }) => void) | null;
  Dermatology: { id: string; data: getDoctorsBySpecialtyAndFilters } | null | undefined;
  setDermatology: ((arg0: { id: string; data: getDoctorsBySpecialtyAndFilters }) => void) | null;
  Urology: { id: string; data: getDoctorsBySpecialtyAndFilters } | null | undefined;
  setUrology: ((arg0: { id: string; data: getDoctorsBySpecialtyAndFilters }) => void) | null;
  needHelpToContactInMessage: string;
  setNeedHelpToContactInMessage: ((value: string) => void) | null;
  needHelpTicketReferenceText: string;
  setNeedHelpTicketReferenceText: ((value: string) => void) | null;
  needHelpReturnPharmaOrderSuccessMessage: string;
  setNeedHelpReturnPharmaOrderSuccessMessage: ((value: string) => void) | null;
  covidVaccineCta: any;
  setCovidVaccineCta: ((value: any) => void) | null;
  covidVaccineCtaV2: any;
  setCovidVaccineCtaV2: ((value: any) => void) | null;
  loginSection: any;
  setLoginSection: ((value: any) => void) | null;
  phrSession: string;
  setPhrSession: ((value: string) => void) | null;
  isCurrentLocationFetched: boolean;
  setCurrentLocationFetched: ((value: boolean) => void) | null;
  notificationCount: number;
  setNotificationCount: ((arg0: number) => void) | null;
  allNotifications: any;
  setAllNotifications: ((arg0: any[]) => void) | null;
  isSelected: any;
  setisSelected: ((arg0: any[]) => void) | null;
  isUHID: string[];
  setisUHID: ((arg0: string[]) => void) | null;
  savePatientDetails: any;
  setSavePatientDetails: ((items: any) => void) | null;
  savePatientDetailsWithHistory: any;
  setSavePatientDetailsWithHistory: ((items: any) => void) | null;
  doctorJoinedChat: boolean;
  setDoctorJoinedChat: ((isJoined: boolean) => void) | null;
  axdcCode: string;
  setAxdcCode: ((value: string) => void) | null;
  circlePlanId: string;
  setCirclePlanId: ((value: string) => void) | null;
  healthCredits: number;
  setHealthCredits: ((value: number) => void) | -1;
  isRenew: boolean;
  setIsRenew: ((value: boolean) => void) | false;
  hdfcPlanId: string;
  setHdfcPlanId: ((value: string) => void) | null;
  circleStatus: string;
  setCircleStatus: ((value: string) => void) | null;
  hdfcStatus: string;
  setHdfcStatus: ((value: string) => void) | null;
  pharmacyUserType: PharmaUserStatus;
  setPharmacyUserType: ((type: PharmaUserStatus) => void) | null;
  pharmacyUserTypeAttribute: PharmacyUserTypeEvent | null;
  apisToCall: any;
  homeScreenParamsOnPop: any;
  cartBankOffer: string;
  setCartBankOffer: ((id: string) => void) | null;
  authToken: string;
  setauthToken: ((value: string) => void) | null;
  uploadPrescriptionOptions: UploadPrescriptionOptions[];
  setUploadPrescriptionOptions: ((prescription: UploadPrescriptionOptions[]) => void) | null;
  expectCallText: string;
  setExpectCallText: ((str: string) => void) | null;
  nonCartTatText: string;
  setNonCartTatText: ((str: string) => void) | null;
  nonCartDeliveryText: string;
  setNonCartDeliveryText: ((str: string) => void) | null;
  activeUserSubscriptions: any;
  setActiveUserSubscriptions: ((item: any) => void) | null;
}

export const AppCommonDataContext = createContext<AppCommonDataContextProps>({
  hdfcUserSubscriptions: null,
  setHdfcUserSubscriptions: null,
  phrNotificationData: null,
  setPhrNotificationData: null,
  totalCircleSavings: null,
  setTotalCircleSavings: null,
  hdfcUpgradeUserSubscriptions: [],
  setHdfcUpgradeUserSubscriptions: null,
  corporateSubscriptions: [],
  setCorporateSubscriptions: null,
  circleSubscription: null,
  setCircleSubscription: null,
  bannerData: null,
  setBannerData: null,
  bannerDataHome: null,
  setBannerDataHome: null,
  locationDetails: null,
  pharmacyLocation: null,
  setLocationDetails: null,
  setPharmacyLocation: null,
  diagnosticLocation: null,
  setDiagnosticLocation: null,
  isPharmacyLocationServiceable: false,
  setPharmacyLocationServiceable: null,
  medicinePageAPiResponse: null,
  setMedicinePageAPiResponse: null,
  diagnosticsCities: [],
  setDiagnosticsCities: null,
  locationForDiagnostics: null,
  diagnosticServiceabilityData: null,
  setDiagnosticServiceabilityData: null,
  isDiagnosticLocationServiceable: false,
  setDiagnosticLocationServiceable: null,
  VirtualConsultationFee: '',
  setVirtualConsultationFee: null,
  generalPhysicians: null,
  setGeneralPhysicians: null,
  ent: null,
  setEnt: null,
  Dermatology: null,
  setDermatology: null,
  Urology: null,
  setUrology: null,
  needHelpToContactInMessage: '',
  setNeedHelpToContactInMessage: null,
  needHelpTicketReferenceText: '',
  setNeedHelpTicketReferenceText: null,
  needHelpReturnPharmaOrderSuccessMessage: '',
  setNeedHelpReturnPharmaOrderSuccessMessage: null,
  covidVaccineCta: null,
  setCovidVaccineCta: null,
  covidVaccineCtaV2: null,
  setCovidVaccineCtaV2: null,
  loginSection: null,
  setLoginSection: null,
  phrSession: '',
  setPhrSession: null,
  isCurrentLocationFetched: false, // this variable is defined only to avoid asking location multiple times in Home Screen until the app is killed and re-opened again
  setCurrentLocationFetched: null,
  notificationCount: 0,
  setNotificationCount: null,
  allNotifications: [],
  setAllNotifications: null,
  isSelected: [],
  setisSelected: null,
  isUHID: [],
  setisUHID: null,
  savePatientDetails: [],
  setSavePatientDetails: null,
  savePatientDetailsWithHistory: [],
  setSavePatientDetailsWithHistory: null,
  doctorJoinedChat: false,
  setDoctorJoinedChat: null,
  axdcCode: '',
  setAxdcCode: null,
  circlePlanId: '',
  setCirclePlanId: null,
  healthCredits: -1,
  setHealthCredits: null,
  isRenew: false,
  setIsRenew: null,
  hdfcPlanId: '',
  setHdfcPlanId: null,
  circleStatus: '',
  setCircleStatus: null,
  hdfcStatus: '',
  setHdfcStatus: null,
  pharmacyUserType: '',
  setPharmacyUserType: null,
  pharmacyUserTypeAttribute: null,
  apisToCall: [],
  homeScreenParamsOnPop: null,
  cartBankOffer: '',
  setCartBankOffer: null,
  authToken: '',
  setauthToken: null,
  uploadPrescriptionOptions: [],
  setUploadPrescriptionOptions: null,
  expectCallText: '',
  setExpectCallText: null,
  nonCartTatText: '',
  setNonCartTatText: null,
  nonCartDeliveryText: '',
  setNonCartDeliveryText: null,
  activeUserSubscriptions: null,
  setActiveUserSubscriptions: null,
});

export const AppCommonDataProvider: React.FC = (props) => {
  const [isCurrentLocationFetched, setCurrentLocationFetched] = useState<
    AppCommonDataContextProps['isCurrentLocationFetched']
  >(false);

  const apisToCall = useRef<AppCommonDataContextProps['apisToCall']>([]);
  const homeScreenParamsOnPop = useRef<AppCommonDataContextProps['homeScreenParamsOnPop']>([]);

  const [locationDetails, _setLocationDetails] = useState<
    AppCommonDataContextProps['locationDetails']
  >(null);

  const [hdfcUserSubscriptions, _setHdfcUserSubscriptions] = useState<
    AppCommonDataContextProps['hdfcUserSubscriptions']
  >(null);

  const [phrNotificationData, setPhrNotificationData] = useState<
    AppCommonDataContextProps['phrNotificationData']
  >(null);
  const [totalCircleSavings, _setTotalCircleSavings] = useState<
    AppCommonDataContextProps['totalCircleSavings']
  >(null);

  const [hdfcUpgradeUserSubscriptions, _setHdfcUpgradeUserSubscriptions] = useState<
    AppCommonDataContextProps['hdfcUpgradeUserSubscriptions']
  >([]);

  const [corporateSubscriptions, _setCorporateSubscriptions] = useState<
    AppCommonDataContextProps['corporateSubscriptions']
  >([]);

  const [circleSubscription, _setCircleSubscription] = useState<
    AppCommonDataContextProps['circleSubscription']
  >(null);

  const [bannerData, _setBannerData] = useState<AppCommonDataContextProps['bannerData']>(null);
  const [bannerDataHome, _setBannerDataHome] = useState<
    AppCommonDataContextProps['bannerDataHome']
  >(null);

  const [pharmacyLocation, _setPharmacyLocation] = useState<
    AppCommonDataContextProps['pharmacyLocation']
  >(null);

  const [diagnosticLocation, _setDiagnosticLocation] = useState<
    AppCommonDataContextProps['diagnosticLocation']
  >(null);

  const [isPharmacyLocationServiceable, setPharmacyLocationServiceable] = useState<
    AppCommonDataContextProps['isPharmacyLocationServiceable']
  >();

  const [medicinePageAPiResponse, setMedicinePageAPiResponse] = useState<
    AppCommonDataContextProps['medicinePageAPiResponse']
  >(null);

  const [diagnosticsCities, setDiagnosticsCities] = useState<
    AppCommonDataContextProps['diagnosticsCities']
  >([]);

  const [diagnosticServiceabilityData, setDiagnosticServiceabilityData] = useState<
    AppCommonDataContextProps['diagnosticServiceabilityData']
  >(null);

  const [isDiagnosticLocationServiceable, setDiagnosticLocationServiceable] = useState<
    AppCommonDataContextProps['isDiagnosticLocationServiceable']
  >();

  const [savePatientDetails, setSavePatientDetails] = useState<
    AppCommonDataContextProps['savePatientDetails']
  >([]);
  const [savePatientDetailsWithHistory, setSavePatientDetailsWithHistory] = useState<
    AppCommonDataContextProps['savePatientDetailsWithHistory']
  >([]);
  const [cartBankOffer, setCartBankOffer] = useState<AppCommonDataContextProps['cartBankOffer']>(
    ''
  );

  const [VirtualConsultationFee, setVirtualConsultationFee] = useState<string>('');
  const [generalPhysicians, setGeneralPhysicians] = useState<{
    id: string;
    data: getDoctorsBySpecialtyAndFilters;
  }>();
  const [ent, setEnt] = useState<{
    id: string;
    data: getDoctorsBySpecialtyAndFilters;
  }>();
  const [Dermatology, setDermatology] = useState<{
    id: string;
    data: getDoctorsBySpecialtyAndFilters;
  }>();
  const [Urology, setUrology] = useState<{
    id: string;
    data: getDoctorsBySpecialtyAndFilters;
  }>();

  const [needHelpToContactInMessage, setNeedHelpToContactInMessage] = useState<
    AppCommonDataContextProps['needHelpToContactInMessage']
  >('');

  const [needHelpTicketReferenceText, setNeedHelpTicketReferenceText] = useState<
    AppCommonDataContextProps['needHelpTicketReferenceText']
  >('');

  const [
    needHelpReturnPharmaOrderSuccessMessage,
    setNeedHelpReturnPharmaOrderSuccessMessage,
  ] = useState<AppCommonDataContextProps['needHelpReturnPharmaOrderSuccessMessage']>('');

  const [covidVaccineCta, setCovidVaccineCta] = useState<
    AppCommonDataContextProps['covidVaccineCta']
  >(null);

  const [covidVaccineCtaV2, setCovidVaccineCtaV2] = useState<
    AppCommonDataContextProps['covidVaccineCtaV2']
  >(null);

  const [loginSection, setLoginSection] = useState<AppCommonDataContextProps['loginSection']>(null);

  const [phrSession, setPhrSession] = useState<AppCommonDataContextProps['phrSession']>('');

  const [doctorJoinedChat, setDoctorJoinedChat] = useState<boolean>(false);

  const [authToken, setauthToken] = useState<AppCommonDataContextProps['authToken']>('');

  const setLocationDetails: AppCommonDataContextProps['setLocationDetails'] = (locationDetails) => {
    _setLocationDetails(locationDetails);
    AsyncStorage.setItem('locationDetails', JSON.stringify(locationDetails)).catch(() => {});
  };

  const setHdfcUserSubscriptions: AppCommonDataContextProps['setHdfcUserSubscriptions'] = (
    hdfcUserSubscriptions
  ) => {
    _setHdfcUserSubscriptions(hdfcUserSubscriptions);
  };

  const setTotalCircleSavings: AppCommonDataContextProps['setTotalCircleSavings'] = (
    totalCircleSavings
  ) => {
    _setTotalCircleSavings(totalCircleSavings);
  };

  const setHdfcUpgradeUserSubscriptions: AppCommonDataContextProps['setHdfcUpgradeUserSubscriptions'] = (
    hdfcUpgradeUserSubscriptions
  ) => {
    _setHdfcUpgradeUserSubscriptions(hdfcUpgradeUserSubscriptions);
  };

  const setCorporateSubscriptions: AppCommonDataContextProps['setCorporateSubscriptions'] = (
    corporateSubscriptions
  ) => {
    _setCorporateSubscriptions(corporateSubscriptions);
  };

  const setCircleSubscription: AppCommonDataContextProps['setCircleSubscription'] = (
    circleSubscription
  ) => {
    _setCircleSubscription(circleSubscription);
  };

  const setBannerData: AppCommonDataContextProps['setBannerData'] = (bannerData) => {
    _setBannerData(bannerData);
  };
  const setBannerDataHome: AppCommonDataContextProps['setBannerDataHome'] = (bannerData) => {
    _setBannerDataHome(bannerData);
  };

  const setPharmacyLocation: AppCommonDataContextProps['setPharmacyLocation'] = (
    pharmacyLocation
  ) => {
    _setPharmacyLocation(pharmacyLocation);
    AsyncStorage.setItem('pharmacyLocation', JSON.stringify(pharmacyLocation)).catch(() => {});
  };

  const setDiagnosticLocation: AppCommonDataContextProps['setDiagnosticLocation'] = (
    diagnosticLocation
  ) => {
    _setDiagnosticLocation(diagnosticLocation);
    AsyncStorage.setItem('diagnosticLocation', JSON.stringify(diagnosticLocation)).catch(() => {});
  };

  const [uploadPrescriptionOptions, setUploadPrescriptionOptions] = useState<
    AppCommonDataContextProps['uploadPrescriptionOptions']
  >([]);

  const [expectCallText, setExpectCallText] = useState<AppCommonDataContextProps['expectCallText']>(
    ''
  );

  const [nonCartTatText, setNonCartTatText] = useState<AppCommonDataContextProps['nonCartTatText']>(
    ''
  );

  const [nonCartDeliveryText, setNonCartDeliveryText] = useState<
    AppCommonDataContextProps['nonCartDeliveryText']
  >('');

  const [activeUserSubscriptions, setActiveUserSubscriptions] = useState<
    AppCommonDataContextProps['activeUserSubscriptions']
  >(null);

  const [axdcCode, setAxdcCode] = useState<AppCommonDataContextProps['axdcCode']>('');
  const [circlePlanId, setCirclePlanId] = useState<AppCommonDataContextProps['circlePlanId']>('');
  const [healthCredits, setHealthCredits] = useState<AppCommonDataContextProps['healthCredits']>(
    ''
  );
  const [isRenew, setIsRenew] = useState<AppCommonDataContextProps['isRenew']>('');
  const [hdfcPlanId, setHdfcPlanId] = useState<AppCommonDataContextProps['hdfcPlanId']>('');
  const [circleStatus, setCircleStatus] = useState<AppCommonDataContextProps['hdfcPlanId']>('');
  const [hdfcStatus, setHdfcStatus] = useState<AppCommonDataContextProps['hdfcPlanId']>('');
  const [pharmacyUserType, setPharmacyUserType] = useState<
    AppCommonDataContextProps['pharmacyUserType']
  >('');

  const locationForDiagnostics: AppCommonDataContextProps['locationForDiagnostics'] = {
    cityId: (diagnosticServiceabilityData?.cityId || '') as string,
    city: (diagnosticServiceabilityData?.city || '') as string,
    state: (diagnosticServiceabilityData?.state || '') as string,
    stateId: (diagnosticServiceabilityData?.stateId || '') as string,
  };

  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [isSelected, setisSelected] = useState<any[]>([]);
  const [isUHID, setisUHID] = useState<string[]>([]);

  const pharmacyUserTypeAttribute: PharmacyUserTypeEvent = {
    User_Type: pharmacyUserType,
  };

  useEffect(() => {
    // update location from async storage the very first time app opened
    const updateLocationFromStorage = async () => {
      try {
        const locationFromStorage = await AsyncStorage.multiGet([
          'locationDetails',
          'pharmacyLocation',
          'diagnosticLocation',
          'diagnosticPinCodeServiceability',
        ]);
        const location = locationFromStorage[0][1];
        const pharmacyLocation = locationFromStorage[1][1];
        const diagnosticLocation = locationFromStorage[2][1];
        const diagnosticPinCodeServiceability = locationFromStorage[3][1];

        _setLocationDetails(JSON.parse(location || 'null'));
        _setPharmacyLocation(JSON.parse(pharmacyLocation || 'null'));
        _setDiagnosticLocation(JSON.parse(diagnosticLocation || 'null'));
      } catch (error) {}
    };
    updateLocationFromStorage();
  }, []);

  return (
    <AppCommonDataContext.Provider
      value={{
        isCurrentLocationFetched,
        setCurrentLocationFetched,
        phrNotificationData,
        setPhrNotificationData,
        locationDetails,
        setLocationDetails,
        hdfcUserSubscriptions,
        setHdfcUserSubscriptions,
        totalCircleSavings,
        setTotalCircleSavings,
        hdfcUpgradeUserSubscriptions,
        setHdfcUpgradeUserSubscriptions,
        corporateSubscriptions,
        setCorporateSubscriptions,
        circleSubscription,
        setCircleSubscription,
        bannerData,
        setBannerData,
        bannerDataHome,
        setBannerDataHome,
        pharmacyLocation,
        setPharmacyLocation,
        diagnosticLocation,
        setDiagnosticLocation,
        isPharmacyLocationServiceable,
        setPharmacyLocationServiceable,
        medicinePageAPiResponse,
        setMedicinePageAPiResponse,
        diagnosticsCities,
        setDiagnosticsCities,
        locationForDiagnostics,
        diagnosticServiceabilityData,
        setDiagnosticServiceabilityData,
        isDiagnosticLocationServiceable,
        setDiagnosticLocationServiceable,
        VirtualConsultationFee,
        setVirtualConsultationFee,
        generalPhysicians,
        setGeneralPhysicians,
        Urology,
        setUrology,
        Dermatology,
        setDermatology,
        ent,
        setEnt,
        needHelpToContactInMessage,
        setNeedHelpToContactInMessage,
        needHelpTicketReferenceText,
        setNeedHelpTicketReferenceText,
        needHelpReturnPharmaOrderSuccessMessage,
        setNeedHelpReturnPharmaOrderSuccessMessage,
        covidVaccineCta,
        setCovidVaccineCta,
        covidVaccineCtaV2,
        setCovidVaccineCtaV2,
        loginSection,
        setLoginSection,
        phrSession,
        setPhrSession,
        notificationCount,
        setNotificationCount,
        allNotifications,
        setAllNotifications,
        isSelected,
        setisSelected,
        isUHID,
        setisUHID,
        savePatientDetails,
        setSavePatientDetails,
        doctorJoinedChat,
        setDoctorJoinedChat,
        savePatientDetailsWithHistory,
        setSavePatientDetailsWithHistory,
        axdcCode,
        setAxdcCode,
        circlePlanId,
        setCirclePlanId,
        healthCredits,
        setHealthCredits,
        isRenew,
        setIsRenew,
        hdfcPlanId,
        setHdfcPlanId,
        circleStatus,
        setCircleStatus,
        hdfcStatus,
        setHdfcStatus,
        pharmacyUserType,
        setPharmacyUserType,
        pharmacyUserTypeAttribute,
        apisToCall,
        homeScreenParamsOnPop,
        cartBankOffer,
        setCartBankOffer,
        authToken,
        setauthToken,
        uploadPrescriptionOptions,
        setUploadPrescriptionOptions,
        expectCallText,
        setExpectCallText,
        nonCartTatText,
        setNonCartTatText,
        nonCartDeliveryText,
        setNonCartDeliveryText,
        activeUserSubscriptions,
        setActiveUserSubscriptions,
      }}
    >
      {props.children}
    </AppCommonDataContext.Provider>
  );
};

export const useAppCommonData = () => useContext<AppCommonDataContextProps>(AppCommonDataContext);
