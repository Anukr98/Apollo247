import { Platform } from 'react-native';
import {  ConsultMode, PLAN } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {  GooglePlacesType } from '@aph/mobile-patients/src/helpers/apiCalls';
import DeviceInfo from 'react-native-device-info';

export const getValuesArray = (arr: any) => {
  const finalArr = arr.map((item: any) => item.name);
  return finalArr;
};

export const isUpperCase = (str: string) => {
  return str === str.toUpperCase();
};

export const calculateCircleDoctorPricing = (
  data: any,
  isOnlineConsult?: boolean,
  isPhysicalConsult?: boolean
) => {
  const circleDoctors = data?.doctorPricing?.filter(
    (item: any) => item.available_to === PLAN.CARE_PLAN
  );
  const isCircleDoctor = circleDoctors?.length > 0;
  const physicalConsult = circleDoctors?.filter(
    (item: any) => item.appointment_type === ConsultMode.PHYSICAL
  );
  const onlineConsult = circleDoctors?.filter(
    (item: any) => item.appointment_type === ConsultMode.ONLINE
  );
  const physicalConsultMRPPrice = physicalConsult?.[0]?.mrp;
  const physicalConsultSlashedPrice = physicalConsult?.[0]?.slashed_price;
  const physicalConsultDiscountedPrice = physicalConsultMRPPrice - physicalConsultSlashedPrice;

  const onlineConsultMRPPrice = onlineConsult?.[0]?.mrp;
  const onlineConsultSlashedPrice = onlineConsult?.[0]?.slashed_price;
  const onlineConsultDiscountedPrice = onlineConsultMRPPrice - onlineConsultSlashedPrice;

  const minMrp =
    physicalConsultMRPPrice > 0 && onlineConsultMRPPrice > 0
      ? Math.min(Number(physicalConsultMRPPrice), Number(onlineConsultMRPPrice))
      : onlineConsultMRPPrice
      ? onlineConsultMRPPrice
      : physicalConsultMRPPrice;

  const slashedPriceArr = circleDoctors?.filter((item: any) => minMrp === item.mrp);

  // discount % will be same on both consult
  const minSlashedPrice = slashedPriceArr?.[0]?.slashed_price;
  const minDiscountedPrice = minMrp - minSlashedPrice;

  let isCircleDoctorOnSelectedConsultMode = isCircleDoctor;
  if (isOnlineConsult) {
    isCircleDoctorOnSelectedConsultMode = isCircleDoctor && onlineConsultMRPPrice > 0;
  } else if (isPhysicalConsult) {
    isCircleDoctorOnSelectedConsultMode = isCircleDoctor && physicalConsultMRPPrice > 0;
  } else {
    isCircleDoctorOnSelectedConsultMode = isCircleDoctor;
  }
  let cashbackEnabled, cashbackAmount;
  if(onlineConsult?.[0]?.is_cashback_enabled){
    cashbackEnabled = onlineConsult?.[0]?.is_cashback_enabled;
    cashbackAmount = Math.round(onlineConsult?.[0]?.cashback_amount);
  }
  return {
    isCircleDoctor,
    physicalConsultMRPPrice,
    physicalConsultSlashedPrice,
    physicalConsultDiscountedPrice,
    onlineConsultMRPPrice,
    onlineConsultSlashedPrice,
    onlineConsultDiscountedPrice,
    minMrp,
    minSlashedPrice,
    minDiscountedPrice,
    isCircleDoctorOnSelectedConsultMode,
    cashbackEnabled,
    cashbackAmount,
  };
};



export const sourceHeaders = {
  headers: {
    source: Platform.OS,
    source_version: DeviceInfo.getVersion(),
  },
};

export const isFloat = (n: number) => {
  return Number(n) == n && n % 1 !== 0;
};

export const convertNumberToDecimal = (n: number | null | string) => {
  return n === 0 ? n : n ? (isFloat(Number(n)) ? Number(n)?.toFixed(2) : n) : '';
};

export const findAddrComponents = (
  proptoFind: GooglePlacesType,
  addrComponents: {
    long_name: string;
    short_name: string;
    types: GooglePlacesType[];
  }[]
) => {
  return (
    (addrComponents?.find((item) => item?.types?.indexOf(proptoFind) > -1) || {})?.long_name || ''
  );
};

export const isPhysicalConsultation = (consultMode: string) => {
  return (
    consultMode === 'Visit Clinic' ||
    consultMode === 'Meet In Person' ||
    consultMode === 'Hospital Visit'
  );
};

export const getReviewTag = (star: number) => {
  switch (star) {
    case 1:
      return 'TERRIBLE';
    case 2:
      return 'BAD';
    case 3:
      return 'AVERAGE';
    case 4:
      return 'GOOD';
    case 5:
      return 'EXCELLENT';
    default:
      return '';
      break;
  }
};
