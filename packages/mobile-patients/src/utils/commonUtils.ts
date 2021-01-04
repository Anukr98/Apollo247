import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {
  CommonBugFender,
  setBugFenderLog,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { ProductPageViewedSource } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { ConsultMode, PLAN } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { DIAGNOSTIC_GROUP_PLAN } from '@aph/mobile-patients/src/helpers/apiCalls';
import moment from 'moment';
import { getDiscountPercentage } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { getPatientByMobileNumber } from '../graphql/types/getPatientByMobileNumber';
import DeviceInfo from 'react-native-device-info';

export const handleDeepLink = (navigationProps: any) => {
  try {
    Linking.addEventListener('url', (event) => {
      console.log('linkingEvent==>', event);
      handleOpenURL(navigationProps, event.url);
      setBugFenderLog('UTIL_handleDeepLink', JSON.stringify(event));
    });
    AsyncStorage.removeItem('location');
  } catch (error) {
    CommonBugFender('SplashScreen_Linking_URL_try', error);
  }
};

export const handleOpenURL = (navigationProps: any, event: any) => {
  try {
    console.log('linkinghandleOpenURL', event);
    let route;
    route = event.replace('apollopatients://', '');

    const data = route.split('?');
    route = data[0];
    setBugFenderLog('UTIL_handleOpenURL', data);
    // console.log(data, 'data');

    let linkId = '';

    try {
      if (data.length >= 2) {
        linkId = data[1].split('&');
        if (linkId.length > 0) {
          linkId = linkId[0];
        }
      }
    } catch (error) {}
    console.log(linkId, 'linkId');

    switch (route) {
      case 'Consult':
        console.log('Consult');
        pushTheView(navigationProps, 'Consult', data.length === 2 ? linkId : undefined);
        break;
      case 'Medicine':
        console.log('Medicine');
        pushTheView(navigationProps, 'Medicine', data.length === 2 ? linkId : undefined);
        break;
      case 'Test':
        console.log('Test');
        pushTheView(navigationProps, 'Test');
        break;
      case 'Speciality':
        console.log('Speciality handleopen');
        if (data.length === 2) pushTheView(navigationProps, 'Speciality', linkId);
        break;
      case 'Doctor':
        console.log('Doctor handleopen');
        if (data.length === 2) pushTheView(navigationProps, 'Doctor', linkId);
        break;
      case 'DoctorSearch':
        console.log('DoctorSearch handleopen');
        pushTheView(navigationProps, 'DoctorSearch');
        break;

      case 'MedicineSearch':
        console.log('MedicineSearch handleopen');
        pushTheView(navigationProps, 'MedicineSearch', data.length === 2 ? linkId : undefined);
        break;

      case 'MedicineDetail':
        console.log('MedicineDetail handleopen');
        pushTheView(navigationProps, 'MedicineDetail', data.length === 2 ? linkId : undefined);
        break;

      case 'MedicineCart':
        console.log('MedicineCart handleopen');
        pushTheView(navigationProps, 'MedicineCart', data.length === 2 ? linkId : undefined);
        break;

      default:
        pushTheView(navigationProps, 'ConsultRoom');
        break;
    }
    console.log('route', route);
  } catch (error) {}
};

export const pushTheView = (navigationProps: any, routeName: String, id?: String) => {
  console.log('pushTheView', routeName);
  setBugFenderLog('UTIL_pushTheView', { routeName, id });
  switch (routeName) {
    case 'Consult':
      // if (id) {
      //   props.navigation.navigate(AppRoutes.ConsultDetailsById, { id: id });
      // } else
      navigationProps.navigate('APPOINTMENTS');
      break;

    case 'Medicine':
      navigationProps.navigate('MEDICINES');
      break;

    case 'MedicineDetail':
      navigationProps.navigate(AppRoutes.ProductDetailPage, {
        sku: id,
        movedFrom: ProductPageViewedSource.DEEP_LINK,
      });
      break;

    case 'Test':
      navigationProps.navigate('TESTS');
      break;

    case 'ConsultRoom':
      navigationProps.replace(AppRoutes.ConsultRoom);
      break;

    case 'Speciality':
      navigationProps.navigate(AppRoutes.DoctorSearchListing, {
        specialityId: id ? id : '',
      });
      // navigationProps.replace(AppRoutes.DoctorSearchListing, {
      //   specialityId: id ? id : '',
      // });
      break;

    case 'Doctor':
      navigationProps.navigate(AppRoutes.DoctorDetails, {
        doctorId: id,
      });
      break;

    case 'DoctorSearch':
      navigationProps.navigate(AppRoutes.DoctorSearch);
      break;

    case 'MedicineSearch':
      if (id) {
        const [itemId, name] = id.split(',');

        navigationProps.navigate(AppRoutes.MedicineListing, {
          category_id: itemId,
          title: `${name ? name : 'Products'}`.toUpperCase(),
        });
      }
      break;

    case 'MedicineCart':
      navigationProps.navigate(AppRoutes.MedicineCart, {
        movedFrom: 'splashscreen',
      });
      break;

    default:
      break;
  }
};

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
  };
};

export const sourceHeaders = {
  headers: {
    source: Platform.OS,
    source_version: DeviceInfo.getVersion(),
  },
};
