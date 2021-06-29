import { Platform } from 'react-native';
import { AddressObj, ConsultMode, patientAddressObj, PLAN } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { DIAGNOSTIC_GROUP_PLAN, GooglePlacesType } from '@aph/mobile-patients/src/helpers/apiCalls';
import moment from 'moment';
import { getDiscountPercentage } from '@aph/mobile-patients/src/helpers/helperFunctions';
import DeviceInfo from 'react-native-device-info';
import { DiagnosticsCartItem } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';

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
  };
};

//check if test is active for the given Date
const isItemPriceActive = (fromDate: string, toDate: string, currentDate: string) => {
  //start & end date comes null
  if (fromDate == null || toDate == null) {
    return true;
  }
  var startDate, endDate, currDate;
  startDate = Date.parse(fromDate);
  endDate = Date.parse(toDate);
  currDate = Date.parse(currentDate);

  if (currDate <= endDate && currDate >= startDate) {
    return true;
  }
  return false;
};

//calculate diagnostics discounts
export const getActiveTestItems = (
  pricingObjectForItem: any,
  itemWithPackageMrp: string | number
) => {
  //1.
  const currentDate = moment(new Date()).format('YYYY-MM-DD');
  var diffPriceForItem: {
    discountPercent: number;
    groupPlan: string;
    status: string;
    startDate: string;
    endDate: string;
  }[] = [];
  pricingObjectForItem?.forEach((item: any) =>
    diffPriceForItem.push({
      discountPercent: getDiscountPercentage(
        !!itemWithPackageMrp && itemWithPackageMrp > item?.mrp ? itemWithPackageMrp : item?.mrp!,
        item?.price!
      ),
      groupPlan: item?.groupPlan,
      status: item?.status,
      startDate: item?.startDate,
      endDate: item?.endDate,
    })
  );

  //2. filter out elements which lie in range and are active
  const activeGroupPlansForItem = diffPriceForItem?.filter(
    (item) =>
      (item?.status).toLowerCase() == 'active' &&
      isItemPriceActive(item?.startDate!, item?.endDate!, currentDate)
  );

  //3. if no items are there then set it as not active.
  const isItemInActive = activeGroupPlansForItem?.length == 0;

  //descending order
  var sortedDiffPriceForItem = activeGroupPlansForItem?.sort(function(a, b) {
    return b.discountPercent - a.discountPercent;
  });

  //4. now use plan to promote.
  //4.1 get the price of the lowest one
  const groupPlanToConsider = activeGroupPlansForItem?.find(
    (item: any) => item?.groupPlan == sortedDiffPriceForItem?.[0].groupPlan
  );
  const promoteCircle = groupPlanToConsider?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE;

  const itemWithAll = pricingObjectForItem?.find(
    (item: any) => item!.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL
  );
  const itemWithSub = pricingObjectForItem?.find(
    (item: any) => item!.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
  );
  const itemWithSpecialDis = pricingObjectForItem?.find(
    (item: any) => item!.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
  );

  const activeItemsObject = {
    itemWithAll: itemWithAll,
    itemWithSub: itemWithSub,
    itemWithSpecialDis: itemWithSpecialDis,
    isItemActive: !isItemInActive,
    promoteCircle: promoteCircle,
    groupPlanToConsider: groupPlanToConsider,
  };

  return activeItemsObject;
};

export const calculatePackageDiscounts = (
  itemPackageMrp: string | number,
  mrp: number,
  discountedPrice: number
) => {
  const discount = getDiscountPercentage(
    !!itemPackageMrp && itemPackageMrp > mrp ? itemPackageMrp : mrp,
    discountedPrice
  );
  return discount;
};

export const calculatePackageDiscountDiff = (
  itemPackageMrp: number | string,
  mrp: number,
  discountedPrice: number
) => {
  const savings =
    !!itemPackageMrp && itemPackageMrp > mrp
      ? Number(itemPackageMrp) - Number(discountedPrice)
      : Number(mrp) - Number(discountedPrice);
  return savings;
};

export const calculateMrpToDisplay = (
  promoteCircle: boolean,
  promoteDiscount: boolean,
  itemPackageMrp: string | number,
  normalMrp: number,
  circleMrp: number,
  discountMrp: number
) => {
  const mrpToDisplay = promoteCircle
    ? !!itemPackageMrp && itemPackageMrp > circleMrp
      ? itemPackageMrp
      : circleMrp
    : promoteDiscount
    ? !!itemPackageMrp && itemPackageMrp > discountMrp
      ? itemPackageMrp
      : discountMrp
    : !!itemPackageMrp && itemPackageMrp > normalMrp
    ? itemPackageMrp
    : normalMrp;
  return mrpToDisplay;
};

export const getPricesForItem = (
  getDiagnosticPricingForItem: any,
  itemPackageMrp: string | number
) => {
  const getActiveItemsObject = getActiveTestItems(getDiagnosticPricingForItem, itemPackageMrp);
  const itemActive = getActiveItemsObject?.isItemActive;
  const itemWithAll = getActiveItemsObject?.itemWithAll;
  const itemWithSub = getActiveItemsObject?.itemWithSub;
  const itemWithSpecialDis = getActiveItemsObject?.itemWithSpecialDis;

  //check wrt to plan
  const specialPrice = itemWithAll?.price!;
  const price = itemWithAll?.mrp!; //more than price (black)
  const circlePrice = itemWithSub?.mrp!;
  const circleSpecialPrice = itemWithSub?.price!;
  const discountPrice = itemWithSpecialDis?.mrp!;
  const discountSpecialPrice = itemWithSpecialDis?.price!;
  const planToConsider = getActiveItemsObject?.groupPlanToConsider;

  //if change here then change in the testCart
  const discount = calculatePackageDiscounts(itemPackageMrp, price, specialPrice);
  const circleDiscount = calculatePackageDiscounts(itemPackageMrp, circlePrice, circleSpecialPrice);
  const specialDiscount = calculatePackageDiscounts(
    itemPackageMrp,
    discountPrice,
    discountSpecialPrice
  );
  const discountDiffPrice = calculatePackageDiscountDiff(itemPackageMrp, price, specialPrice);
  const circleDiscountDiffPrice = calculatePackageDiscountDiff(
    itemPackageMrp,
    circlePrice,
    circleSpecialPrice
  );
  const specialDiscountDiffPrice = calculatePackageDiscountDiff(
    itemPackageMrp,
    discountPrice,
    discountSpecialPrice
  );

  const promoteCircle = getActiveItemsObject?.promoteCircle; //if circle discount is more
  const promoteDiscount = promoteCircle ? false : discount < specialDiscount; // if special discount is more than others.

  const mrpToDisplay = calculateMrpToDisplay(
    promoteCircle,
    promoteDiscount,
    itemPackageMrp,
    price,
    circlePrice,
    discountPrice
  );

  const discountToDisplay = promoteCircle
    ? circleSpecialPrice
    : promoteDiscount
    ? discountSpecialPrice
    : specialPrice;

  return {
    itemActive,
    specialPrice,
    price,
    circlePrice,
    circleSpecialPrice,
    discountPrice,
    discountSpecialPrice,
    planToConsider,
    discount,
    circleDiscount,
    specialDiscount,
    promoteCircle,
    promoteDiscount,
    mrpToDisplay,
    discountToDisplay,
    discountDiffPrice,
    circleDiscountDiffPrice,
    specialDiscountDiffPrice,
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

export const createAddressObject = (addressObject: any) => {
  return {
    addressLine1: addressObject?.addressLine1,
    addressLine2: addressObject?.addressLine2,
    addressType: addressObject?.addressType,
    zipcode: addressObject?.zipcode! || "0",
    landmark: addressObject?.landmark,
    latitude: Number(addressObject?.latitude! || 0),
    longitude: Number(addressObject?.longitude! || 0),
    city: addressObject?.city,
    state: addressObject?.state,
  } as AddressObj;

}

export const createPatientAddressObject = (addressObject : any) =>{
  return {
      addressLine1: addressObject?.addressLine1,
      addressLine2: addressObject?.addressLine2,
      zipcode: addressObject?.zipcode! || "0",
      landmark: addressObject?.landmark,
      latitude: Number(addressObject?.latitude! || 0),
      longitude: Number(addressObject?.longitude! || 0),
      city: addressObject?.city,
      state: addressObject?.state,
      patientAddressID: addressObject?.id,
    } as patientAddressObj;
}

export enum DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE {
  HOME = 'Home page',
  FULL_SEARCH = 'Full search',
  DETAILS =  'Details page',
  PARTIAL_SEARCH = 'Partial search',
  LISTING =  'Listing page',
  POPULAR_SEARCH = 'Popular search',
  CATEGORY =  'Category page',
  PRESCRIPTION =  'Prescription',
  CART_PAGE =  'Cart page',
  CONSULT_ROOM = 'Consult Room',
  PHR =  'PHR Prescription'
}
export const diagnosticsDisplayPrice = (item: DiagnosticsCartItem , isCircleMember : boolean) =>{
  const itemPackageMrp = item?.packageMrp!;
  const specialPrice = item?.specialPrice!;
  const price = item?.price!; 
  const circlePrice = item?.circlePrice!;
  const circleSpecialPrice = item?.circleSpecialPrice!;
  const discountPrice = item?.discountPrice!;
  const discountSpecialPrice = item?.discountSpecialPrice!;

  const discount = getDiscountPercentage(
    !!itemPackageMrp && itemPackageMrp > price ? itemPackageMrp : price,
    specialPrice
  );
  const circleDiscount = getDiscountPercentage(
    !!itemPackageMrp && itemPackageMrp > circlePrice ? itemPackageMrp : circlePrice,
    circleSpecialPrice
  );
  const specialDiscount = getDiscountPercentage(
    !!itemPackageMrp && itemPackageMrp > discountPrice ? itemPackageMrp : discountPrice,
    discountSpecialPrice
  );

  const promoteCircle = discount < circleDiscount && specialDiscount < circleDiscount;
  const promoteDiscount = promoteCircle ? false : discount < specialDiscount;

  //1. circle sub + promote circle -> circleSpecialPrice
  //2. circle sub + discount -> dicount Price
  //3. circle sub + none -> special price | price
  //4. non-circle + promote circle -> special price | price
  //5. non-circle + promte disocunt -> discount price
  //6. non-circle + none -> special price | price
  let priceToShow;
  if (isCircleMember) {
    if (promoteCircle) {
      priceToShow = circleSpecialPrice;
    } else if (promoteDiscount) {
      priceToShow = discountSpecialPrice;
    } else {
      priceToShow = specialPrice || price;
    }
  } else {
    if (promoteDiscount) {
      priceToShow = discountSpecialPrice;
    } else {
      priceToShow = specialPrice || price;
    }
  }

  const slashedPrice = !!itemPackageMrp
  ? itemPackageMrp > priceToShow
    ? itemPackageMrp
    : null
  : price > priceToShow
  ? price
  : null;


  return {
    priceToShow,
    slashedPrice
  }
}
