import { getDiagnosticsCites_getDiagnosticsCites_diagnosticsCities } from '@aph/mobile-patients/src/graphql/types/getDiagnosticsCites';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { getDoctorsBySpecialtyAndFilters } from '@aph/mobile-patients/src/graphql/types/getDoctorsBySpecialtyAndFilters';
import { getPatientPersonalizedAppointments_getPatientPersonalizedAppointments_appointmentDetails } from '../graphql/types/getPatientPersonalizedAppointments';
import { MedicinePageAPiResponse } from '@aph/mobile-patients/src/helpers/apiCalls';

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
  isFreeDelivery?: boolean;
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
};

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
}

export interface BenefitCtaAction {
  type: string;
  action: string;
  message: string;
}

export interface PlanCoupons {
  coupon: string;
  message: string;
  applicable: string;
}

export interface AppCommonDataContextProps {
  hdfcUserSubscriptions: SubscriptionData | null;
  setHdfcUserSubscriptions: ((items: SubscriptionData) => void) | null;
  locationDetails: LocationData | null;
  pharmacyLocation: LocationData | null;
  setLocationDetails: ((items: LocationData) => void) | null;
  setPharmacyLocation: ((items: LocationData) => void) | null;
  isPharmacyLocationServiceable?: boolean;
  setPharmacyLocationServiceable: ((value: boolean) => void) | null;
  medicinePageAPiResponse: MedicinePageAPiResponse | null;
  setMedicinePageAPiResponse: ((value: MedicinePageAPiResponse | null) => void) | null;
  diagnosticsCities: getDiagnosticsCites_getDiagnosticsCites_diagnosticsCities[];
  setDiagnosticsCities:
    | ((items: getDiagnosticsCites_getDiagnosticsCites_diagnosticsCities[]) => void)
    | null;
  locationForDiagnostics: { cityId: string; stateId: string; city: string; state: string } | null;
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
  appointmentsPersonalized: getPatientPersonalizedAppointments_getPatientPersonalizedAppointments_appointmentDetails[];
  setAppointmentsPersonalized:
    | ((
        items: getPatientPersonalizedAppointments_getPatientPersonalizedAppointments_appointmentDetails[]
      ) => void)
    | null;
  savePatientDetails: any;
  setSavePatientDetails: ((items: any) => void) | null;
  doctorJoinedChat: boolean;
  setDoctorJoinedChat: ((isJoined: boolean) => void) | null;
}

export const AppCommonDataContext = createContext<AppCommonDataContextProps>({
  hdfcUserSubscriptions: null,
  setHdfcUserSubscriptions: null,
  locationDetails: null,
  pharmacyLocation: null,
  setLocationDetails: null,
  setPharmacyLocation: null,
  isPharmacyLocationServiceable: false,
  setPharmacyLocationServiceable: null,
  medicinePageAPiResponse: null,
  setMedicinePageAPiResponse: null,
  diagnosticsCities: [],
  setDiagnosticsCities: null,
  appointmentsPersonalized: [],
  setAppointmentsPersonalized: null,
  locationForDiagnostics: null,
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
  doctorJoinedChat: false,
  setDoctorJoinedChat: null
});

export const AppCommonDataProvider: React.FC = (props) => {
  const [isCurrentLocationFetched, setCurrentLocationFetched] = useState<
    AppCommonDataContextProps['isCurrentLocationFetched']
  >(false);

  const [locationDetails, _setLocationDetails] = useState<
    AppCommonDataContextProps['locationDetails']
  >(null);

  const [hdfcUserSubscriptions, _setHdfcUserSubscriptions] = useState<
    AppCommonDataContextProps['hdfcUserSubscriptions']
  >(null);

  const [pharmacyLocation, _setPharmacyLocation] = useState<
    AppCommonDataContextProps['pharmacyLocation']
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

  const [appointmentsPersonalized, setAppointmentsPersonalized] = useState<
    AppCommonDataContextProps['appointmentsPersonalized']
  >([]);

  const [savePatientDetails, setSavePatientDetails] = useState<
    AppCommonDataContextProps['savePatientDetails']
  >([]);

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

  const [doctorJoinedChat, setDoctorJoinedChat] = useState<boolean>(false);

  const setLocationDetails: AppCommonDataContextProps['setLocationDetails'] = (locationDetails) => {
    _setLocationDetails(locationDetails);
    AsyncStorage.setItem('locationDetails', JSON.stringify(locationDetails)).catch(() => {
      console.log('Failed to save location in local storage.');
    });
  };

  const setHdfcUserSubscriptions: AppCommonDataContextProps['setHdfcUserSubscriptions'] = (hdfcUserSubscriptions) => {
    _setHdfcUserSubscriptions(hdfcUserSubscriptions);
  };

  const setPharmacyLocation: AppCommonDataContextProps['setPharmacyLocation'] = (
    pharmacyLocation
  ) => {
    _setPharmacyLocation(pharmacyLocation);
    AsyncStorage.setItem('pharmacyLocation', JSON.stringify(pharmacyLocation)).catch(() => {
      console.log('Failed to save pharmacy location in local storage.');
    });
  };

  const locationForDiagnostics: AppCommonDataContextProps['locationForDiagnostics'] = {
    cityId: ((
      diagnosticsCities.find(
        (item) => item!.cityname.toLowerCase() == (g(locationDetails, 'city') || '').toLowerCase()
      ) || {}
    ).cityid || '') as string,
    city: ((
      diagnosticsCities.find(
        (item) => item!.cityname.toLowerCase() == (g(locationDetails, 'city') || '').toLowerCase()
      ) || {}
    ).cityname || '') as string,
    state: ((
      diagnosticsCities.find(
        (item) => item!.cityname.toLowerCase() == (g(locationDetails, 'city') || '').toLowerCase()
      ) || {}
    ).statename || '') as string,
    stateId: ((
      diagnosticsCities.find(
        (item) => item!.cityname.toLowerCase() == (g(locationDetails, 'city') || '').toLowerCase()
      ) || {}
    ).stateid || '') as string,
  };

  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [isSelected, setisSelected] = useState<any[]>([]);
  const [isUHID, setisUHID] = useState<string[]>([]);

  useEffect(() => {
    // update location from async storage the very first time app opened
    const updateLocationFromStorage = async () => {
      try {
        const locationFromStorage = await AsyncStorage.multiGet([
          'locationDetails',
          'pharmacyLocation',
        ]);
        const location = locationFromStorage[0][1];
        const pharmacyLocation = locationFromStorage[1][1];
        _setLocationDetails(JSON.parse(location || 'null'));
        _setPharmacyLocation(JSON.parse(pharmacyLocation || 'null'));
      } catch (error) {
        console.log('Failed to get location from local storage.');
        CommonBugFender('AppCommonDataProvider_updateLocationFromStorage_try', error);
      }
    };
    updateLocationFromStorage();
  }, []);

  return (
    <AppCommonDataContext.Provider
      value={{
        isCurrentLocationFetched,
        setCurrentLocationFetched,
        hdfcUserSubscriptions,
        setHdfcUserSubscriptions,
        locationDetails,
        setLocationDetails,
        pharmacyLocation,
        setPharmacyLocation,
        isPharmacyLocationServiceable,
        setPharmacyLocationServiceable,
        medicinePageAPiResponse,
        setMedicinePageAPiResponse,
        diagnosticsCities,
        setDiagnosticsCities,
        locationForDiagnostics,
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
        notificationCount,
        setNotificationCount,
        allNotifications,
        setAllNotifications,
        isSelected,
        setisSelected,
        isUHID,
        setisUHID,
        appointmentsPersonalized,
        setAppointmentsPersonalized,
        savePatientDetails,
        setSavePatientDetails,
        doctorJoinedChat,
        setDoctorJoinedChat
      }}
    >
      {props.children}
    </AppCommonDataContext.Provider>
  );
};

export const useAppCommonData = () => useContext<AppCommonDataContextProps>(AppCommonDataContext);
