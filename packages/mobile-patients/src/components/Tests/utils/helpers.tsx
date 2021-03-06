import {
  AddressObj,
  diagnosticLineItem,
  GENDER,
  patientAddressObj,
  TEST_COLLECTION_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { DIAGNOSTIC_GROUP_PLAN } from '@aph/mobile-patients/src/helpers/apiCalls';
import moment from 'moment';
import {
  getDiscountPercentage,
  isDiagnosticSelectedCartEmpty,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  DiagnosticPatientCartItem,
  DiagnosticsCartItem,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  AppConfig,
  BOTH_GENDER_ARRAY,
  GENDER_ARRAY,
} from '@aph/mobile-patients/src/strings/AppConfig';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';

type DiagnosticOrderLineItems = getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems;

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
    couponCode: string | undefined | null;
    mrp: number;
    price: number;
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
      couponCode: item?.couponCode,
      mrp: item?.mrp,
      price: item?.price,
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
  const arrayToChoose = isItemInActive ? pricingObjectForItem : activeGroupPlansForItem;

  const activeAllItem = arrayToChoose?.find(
    (item: any) => item!.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL
  );
  const activeSubItem = arrayToChoose?.find(
    (item: any) => item!.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
  );
  const activeSpecDisItem = arrayToChoose?.find(
    (item: any) => item!.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
  );

  const itemWithAll = !!activeAllItem
    ? activeAllItem
    : pricingObjectForItem?.find((item: any) => item!.groupPlan == DIAGNOSTIC_GROUP_PLAN.ALL);
  const itemWithSub = !!activeSubItem
    ? activeSubItem
    : pricingObjectForItem?.find((item: any) => item!.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE);
  const itemWithSpecialDis = !!activeSpecDisItem
    ? activeSpecDisItem
    : pricingObjectForItem?.find(
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

  //added to calculate the total discount (circle+ any applied)
  const totalDiscount = calculatePackageDiscounts(itemPackageMrp, circlePrice, circleSpecialPrice);
  //if change here then change in the testCart
  const discount = calculatePackageDiscounts(itemPackageMrp, price, specialPrice);
  const circleDiscount = calculatePackageDiscounts(
    0, //itemPackageMrp is removed
    circlePrice,
    circleSpecialPrice
  );
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
    totalDiscount,
  };
};

export const createAddressObject = (addressObject: any) => {
  return {
    addressLine1: addressObject?.addressLine1,
    addressLine2: addressObject?.addressLine2,
    addressType: addressObject?.addressType,
    zipcode: addressObject?.zipcode! || '0',
    landmark: addressObject?.landmark,
    latitude: Number(addressObject?.latitude! || 0),
    longitude: Number(addressObject?.longitude! || 0),
    city: addressObject?.city,
    state: addressObject?.state,
  } as AddressObj;
};

export const createPatientAddressObject = (addressObject: any, serviceabilityObject: any) => {
  return {
    addressLine1: addressObject?.addressLine1,
    addressLine2: addressObject?.addressLine2,
    zipcode: addressObject?.zipcode! || '0',
    landmark: addressObject?.landmark,
    latitude: Number(addressObject?.latitude! || 0),
    longitude: Number(addressObject?.longitude! || 0),
    city: addressObject?.city || serviceabilityObject?.city,
    state: addressObject?.state || serviceabilityObject?.state,
    patientAddressID: addressObject?.id,
  } as patientAddressObj;
};

export enum DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE {
  HOME = 'Home page',
  FULL_SEARCH = 'Full Search',
  DETAILS = 'Details page',
  PARTIAL_SEARCH = 'Partial Search',
  LISTING = 'Listing page',
  POPULAR_SEARCH = 'Popular Search',
  CATEGORY = 'Category page',
  PRESCRIPTION = 'Prescription',
  CART_PAGE = 'Cart page',
  CONSULT_ROOM = 'Consult Room',
  PHR = 'PHR Prescription',
  DEEP_LINK = 'Deeplink',
  SEARCH_BAR = 'Searchbar',
  BOTTOM_BAR = 'Bottom bar',
  FOOTER = 'Footer',
  DIRECT = 'Direct',
  HOME_PAGE_OFFER_WIDGET = 'Offer widget HP',
  HOME_PAGE_HERO_BUTTON = 'Homepage hero button',
}

export const diagnosticsDisplayPrice = (item: DiagnosticsCartItem, isCircleMember: boolean) => {
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

  const promoteCircle =
    item?.groupPlan === DIAGNOSTIC_GROUP_PLAN.CIRCLE &&
    discount < circleDiscount &&
    specialDiscount < circleDiscount;
  const promoteDiscount = promoteCircle
    ? false
    : item?.groupPlan === DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT && discount < specialDiscount;

  const mrpToDisplay = calculateMrpToDisplay(
    promoteCircle,
    promoteDiscount,
    itemPackageMrp,
    price,
    circlePrice,
    discountPrice
  );

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

  const calSlashedPrice = !!itemPackageMrp && itemPackageMrp > price ? itemPackageMrp : price;

  const slashedPrice = calSlashedPrice //replaced calSlashedPrice with itemPackageMrp
    ? calSlashedPrice > priceToShow
      ? calSlashedPrice
      : null
    : price > priceToShow
    ? price
    : null;

  return {
    priceToShow,
    slashedPrice,
    mrpToDisplay,
    promoteCircle,
    promoteDiscount,
    price,
    circleSpecialPrice,
    circleDiscount,
    specialDiscount,
    discount,
  };
};

export enum DIAGNOSTIC_PINCODE_SOURCE_TYPE {
  SEARCH = 'Search',
  AUTO = 'Auto-select',
  ADDRESS = 'Saved Address',
}

export const createLineItemPrices = (
  selectedItem: any,
  isDiagnosticCircleSubscription: boolean,
  reportGenDetails: any,
  couponResponse?: any
) => {
  var pricesForItemArray = selectedItem?.cartItems?.map(
    (item: any, index: number) =>
      ({
        itemId: Number(item?.id),
        price:
          isDiagnosticCircleSubscription && item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
            ? Number(item?.circleSpecialPrice)
            : item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
            ? Number(item?.discountSpecialPrice)
            : Number(item?.specialPrice) || Number(item?.price),
        mrp:
          isDiagnosticCircleSubscription && item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
            ? Number(item?.circlePrice)
            : item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
            ? Number(item?.discountPrice)
            : Number(item?.price),
        groupPlan: isDiagnosticCircleSubscription
          ? item?.groupPlan!
          : item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
          ? item?.groupPlan
          : DIAGNOSTIC_GROUP_PLAN.ALL,
        preTestingRequirement:
          !!reportGenDetails && reportGenDetails?.[index]?.itemPrepration
            ? reportGenDetails?.[index]?.itemPrepration
            : null,
      } as diagnosticLineItem)
  );

  return {
    pricesForItemArray,
  };
};

export const createPatientObjLineItems = (
  patientCartItems: DiagnosticPatientCartItem[],
  isDiagnosticCircleSubscription: boolean,
  reportGenDetails: any,
  couponResponse?: any
) => {
  const filterPatientItems = isDiagnosticSelectedCartEmpty(patientCartItems);
  var array = [] as any; //define type

  filterPatientItems?.map((item) => {
    const getPricesForItem = createLineItemPrices(
      item,
      isDiagnosticCircleSubscription,
      reportGenDetails,
      couponResponse
    )?.pricesForItemArray;
    const totalPrice = getPricesForItem
      ?.map((item: any) => Number(item?.price))
      ?.reduce((prev: number, curr: number) => prev + curr, 0);
    array.push({
      patientID: item?.patientId,
      lineItems: getPricesForItem,
      totalPrice: totalPrice,
    });
  });
  return array;
};

//take care for the modified order & cicle added to cart case
export const createDiagnosticValidateCouponLineItems = (
  selectedItem: any,
  isCircle: boolean,
  discountedItems: any
) => {
  let pricesForItemArray = [] as any;
  selectedItem?.map((item: any, index: number) => {
    const getIsMrpValue = discountedItems?.find(
      (val: any) => Number(val?.testId) == Number(item?.id)
    );
    const getItemValue = !!getIsMrpValue && getIsMrpValue?.onMrp;
    pricesForItemArray.push({
      testId: Number(item?.id),
      categoryId: '',
      mrp: Number(item?.price), //will always be price, irrespective of any plan
      specialPrice:
        isCircle && item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
          ? Number(item?.circleSpecialPrice)
          : item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
          ? !!getItemValue && getItemValue
            ? Number(item?.specialPrice) || Number(item?.price)
            : Number(item?.discountSpecialPrice)
          : Number(item?.specialPrice) || Number(item?.price), // discounted price for any plan
      quantity: item?.mou,
      type: item?.inclusions?.length > 1 ? 'package' : 'test',
    });
  });
  return {
    pricesForItemArray,
  };
};

export function getUpdatedCartItems(arrayToUse: DiagnosticPatientCartItem[]) {
  const getExistingItems = arrayToUse
    ?.map((item) => item?.cartItems?.filter((idd) => idd?.id))
    ?.flat();
  const selectedUniqueItems = getExistingItems?.filter((i: any) => i?.isSelected);
  const selectedUnqiueItemIds = [
    ...new Set(selectedUniqueItems?.map((item: any) => Number(item?.id))),
  ];

  const findPackageSKU = selectedUniqueItems?.find((_item: any) => _item?.inclusions?.length > 1);
  const hasPackageSKU = !!findPackageSKU;
  return {
    selectedUniqueItems,
    selectedUnqiueItemIds,
    hasPackageSKU,
  };
}

export enum DIAGNOSTIC_ITEM_GENDER {
  M = 'M',
  F = 'F',
  B = 'B',
}
export enum DIAGNOSTIC_CTA_ITEMS {
  MAIN_HOME = 'Main Home CTA',
  BOTTOM_BAR = 'Bottom Bar',
  BANNER = 'Banner',
}

export enum DIANGNOSTIC_POPULAR_ITEM_GENDER {
  MALE = 'Male',
  FEMALE = 'Female',
  BOTH = 'Both',
}

export function DiagnosticItemGenderMapping(gender: DIAGNOSTIC_ITEM_GENDER) {
  switch (gender) {
    case DIAGNOSTIC_ITEM_GENDER.M:
      return GENDER.MALE;
      break;
    case DIAGNOSTIC_ITEM_GENDER.F:
      return GENDER.FEMALE;
      break;
    default:
      return GENDER.ALL;
      break;
  }
}

export function DiagnosticPopularSearchGenderMapping(gender: DIANGNOSTIC_POPULAR_ITEM_GENDER) {
  switch (gender) {
    case DIANGNOSTIC_POPULAR_ITEM_GENDER.MALE:
      return DIAGNOSTIC_ITEM_GENDER.M;
      break;
    case DIANGNOSTIC_POPULAR_ITEM_GENDER.FEMALE:
      return DIAGNOSTIC_ITEM_GENDER.F;
      break;
    default:
      return DIAGNOSTIC_ITEM_GENDER.B;
      break;
  }
}

export function createDiagnosticAddToCartObject(
  itemId: number,
  itemName: string,
  gender: any,
  price: number,
  specialPrice: number,
  cPrice: number,
  cSpecialPrice: number,
  dPrice: number,
  dSpecialPrice: number,
  collectionType: TEST_COLLECTION_TYPE,
  groupPlan: DIAGNOSTIC_GROUP_PLAN | any,
  packageMrp: number,
  inclusions: any,
  isSelected?: boolean,
  thumbnail?: any,
  parameterCount?: number
) {
  const addToCartObject = {
    id: `${itemId}`,
    name: itemName,
    gender: DiagnosticItemGenderMapping(gender),
    price: price,
    specialPrice: specialPrice,
    circlePrice: cPrice,
    circleSpecialPrice: cSpecialPrice,
    discountPrice: dPrice,
    discountSpecialPrice: dSpecialPrice,
    mou: 1,
    thumbnail: !!thumbnail ? thumbnail : '',
    collectionMethod: collectionType! || TEST_COLLECTION_TYPE?.HC,
    groupPlan: groupPlan,
    packageMrp: packageMrp,
    inclusions: inclusions,
    isSelected: !!isSelected ? isSelected : AppConfig.Configuration.DEFAULT_ITEM_SELECTION_FLAG,
    parameterCount: !!parameterCount ? parameterCount : inclusions?.length,
  };
  return addToCartObject;
}

export function getParameterCount(item: any, oberservationName: string) {
  const extractInclusionData = item?.inclusionData;
  const filterParamters = extractInclusionData?.filter(
    (item: any) => !!item?.[oberservationName] && item?.[oberservationName] != ''
  );
  const getMandatoryParamter =
    !!filterParamters &&
    filterParamters?.length > 0 &&
    filterParamters?.map((inclusion: any) =>
      !!inclusion?.[oberservationName]
        ? inclusion?.[oberservationName]?.filter((item: any) => item?.mandatoryValue === '1')
        : []
    );
  const getMandatoryParameterCount =
    !!getMandatoryParamter && getMandatoryParamter?.length > 0
      ? getMandatoryParamter?.reduce((prevVal: any, curr: any) => prevVal + curr?.length, 0)
      : undefined;

  return {
    getMandatoryParameterCount,
  };
}

export function getPatientDetailsById(allPatients: any, patientId: string) {
  return allPatients?.find((patient: any) => patient?.id == patientId);
}

//used for switch-uhid (where each sku determines the eligible patients)
export function checkPatientWithSkuGender(
  skuItem: DiagnosticOrderLineItems[] | any,
  patientDetails?: any
) {
  const getAllSkuGender = skuItem?.map((sku: DiagnosticOrderLineItems | any) =>
    DiagnosticItemGenderMapping(sku?.itemObj?.gender!)?.toLowerCase()
  );
  const getPatientGender = !!patientDetails ? patientDetails?.gender : '';
  const hasMaleFemale = getAllSkuGender?.find((item: GENDER) =>
    GENDER_ARRAY?.includes(item?.toLowerCase())
  );
  const removeAllOther = getAllSkuGender?.filter(
    (val: GENDER) => !BOTH_GENDER_ARRAY.includes(val?.toLowerCase() || GENDER.OTHER)
  );

  /*
   * if all sku's are of type both , then ignore
   * if male/female is not present, then ingore
   * after removing others and current patient gender, disable the patient
   */
  const nonValidPatient =
    removeAllOther?.length > 0
      ? !!hasMaleFemale
        ? !removeAllOther?.includes(getPatientGender?.toLowerCase())
        : false
      : false;
  return {
    nonValidPatient,
    getAllSkuGender,
    removeAllOther,
  };
}

//used for modify order (where patient gender specifies eligible sku's)
export function checkSku(
  gender: GENDER,
  skuGender: DIAGNOSTIC_ITEM_GENDER | any,
  convert: boolean
) {
  const covertedSkuGender = convert ? DiagnosticItemGenderMapping(skuGender) : skuGender;
  const isSKUEligible =
    covertedSkuGender?.toLowerCase() == gender?.toLowerCase() ||
    BOTH_GENDER_ARRAY.includes(covertedSkuGender?.toLowerCase()) ||
    BOTH_GENDER_ARRAY.includes(gender?.toLowerCase());

  return isSKUEligible;
}
